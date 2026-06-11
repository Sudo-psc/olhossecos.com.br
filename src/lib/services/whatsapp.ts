/**
 * WhatsApp Notification Service
 * Sends automated messages via Evolution API or n8n webhook
 */

interface WhatsAppMessage {
  to: string; // Phone number with country code (e.g., 5533998601427)
  message: string;
  type?: "text" | "template";
}

interface WhatsAppResult {
  success: boolean;
  provider: "evolution" | "n8n" | "direct";
  messageId?: string;
  error?: string;
  fallbackUrl?: string;
}

/**
 * Send WhatsApp message via Evolution API
 */
async function sendViaEvolutionApi(payload: WhatsAppMessage): Promise<WhatsAppResult> {
  const apiUrl = import.meta.env.EVOLUTION_API_URL;
  const apiKey = import.meta.env.EVOLUTION_API_KEY;
  const instanceName = import.meta.env.EVOLUTION_INSTANCE_NAME || "saraivavision";

  if (!apiUrl || !apiKey) {
    return {
      success: false,
      provider: "evolution",
      error: "Evolution API credentials not configured",
    };
  }

  try {
    // Format phone number (remove non-digits, ensure country code)
    const phone = payload.to.replace(/\D/g, "");
    const formattedPhone = phone.startsWith("55") ? phone : `55${phone}`;

    const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: payload.message,
        delay: 1000, // Small delay for natural feel
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return {
      success: true,
      provider: "evolution",
      messageId: data.key?.id || data.messageId,
    };
  } catch (error) {
    console.error("[WhatsApp] Evolution API error:", error);
    return {
      success: false,
      provider: "evolution",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send notification via n8n webhook
 * This triggers an n8n workflow that handles the WhatsApp sending
 */
async function sendViaN8nWebhook(payload: WhatsAppMessage & { type: string; metadata?: Record<string, unknown> }): Promise<WhatsAppResult> {
  const webhookUrl = import.meta.env.N8N_WHATSAPP_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      success: false,
      provider: "n8n",
      error: "n8n webhook URL not configured",
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: payload.to.replace(/\D/g, ""),
        message: payload.message,
        notificationType: payload.type,
        metadata: payload.metadata,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json().catch(() => ({}));

    return {
      success: true,
      provider: "n8n",
      messageId: data.executionId || data.id,
    };
  } catch (error) {
    console.error("[WhatsApp] n8n webhook error:", error);
    return {
      success: false,
      provider: "n8n",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate WhatsApp direct link (fallback)
 */
function generateDirectWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = phone.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Send WhatsApp notification with automatic fallback
 * Tries Evolution API → n8n webhook → returns direct link
 */
export async function sendWhatsAppNotification(
  payload: WhatsAppMessage & { metadata?: Record<string, unknown> }
): Promise<WhatsAppResult> {
  // Try Evolution API first
  const evolutionResult = await sendViaEvolutionApi(payload);

  if (evolutionResult.success) {
    console.log(`[WhatsApp] Sent via Evolution API: ${evolutionResult.messageId}`);
    return evolutionResult;
  }

  console.warn(`[WhatsApp] Evolution API failed: ${evolutionResult.error}, trying n8n...`);

  // Try n8n webhook
  const n8nResult = await sendViaN8nWebhook({
    ...payload,
    type: payload.type || "text",
  });

  if (n8nResult.success) {
    console.log(`[WhatsApp] Sent via n8n: ${n8nResult.messageId}`);
    return n8nResult;
  }

  console.warn(`[WhatsApp] n8n failed: ${n8nResult.error}, generating direct link...`);

  // Return direct link as fallback
  const directUrl = generateDirectWhatsAppLink(payload.to, payload.message);

  return {
    success: false,
    provider: "direct",
    error: `All providers failed. Evolution: ${evolutionResult.error}, n8n: ${n8nResult.error}`,
    fallbackUrl: directUrl,
  };
}

/**
 * Send notification to the clinic about new contact
 */
export async function notifyClinic(data: {
  nome: string;
  telefone: string;
  mensagem: string;
  origem: string;
}): Promise<WhatsAppResult> {
  const clinicPhone = import.meta.env.CLINIC_WHATSAPP || "5533998601427";

  const message = `🆕 *NOVO CONTATO DO SITE*

👤 *Nome:* ${data.nome}
📱 *Telefone:* ${data.telefone}
📝 *Mensagem:* ${data.mensagem}

📍 *Origem:* ${data.origem}
🕐 *Data/Hora:* ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}

💬 Responder: https://wa.me/55${data.telefone.replace(/\D/g, "")}`;

  return sendWhatsAppNotification({
    to: clinicPhone,
    message,
    metadata: {
      type: "clinic_notification",
      leadName: data.nome,
      leadPhone: data.telefone,
      origem: data.origem,
    },
  });
}

/**
 * Send confirmation message to patient
 */
export async function notifyPatient(data: {
  nome: string;
  telefone: string;
}): Promise<WhatsAppResult> {
  const firstName = data.nome.split(" ")[0];

  const message = `Olá, ${firstName}! 👋

Recebemos sua mensagem no site *Olhos Secos* e entraremos em contato em breve.

⏰ *Horário de Atendimento:*
Seg-Sex: 08h às 18h
Sábado: 08h às 12h

Se precisar de atendimento imediato, responda esta mensagem ou ligue para (33) 99860-1427.

Atenciosamente,
*Equipe Saraiva Vision*
Dr. Philipe Saraiva Cruz
CRM-MG 69.870 | RQE 307527`;

  return sendWhatsAppNotification({
    to: data.telefone,
    message,
    metadata: {
      type: "patient_confirmation",
      patientName: data.nome,
    },
  });
}

/**
 * Send notification for test result (testerapido)
 */
export async function notifyTestResult(data: {
  nome: string;
  telefone: string;
  tempoSegundos: number;
  resultado: "passou" | "piscou_antes";
}): Promise<{ clinic: WhatsAppResult; patient: WhatsAppResult }> {
  const clinicPhone = import.meta.env.CLINIC_WHATSAPP || "5533998601427";
  const firstName = data.nome.split(" ")[0];

  // Notify clinic
  const clinicMessage =
    data.resultado === "piscou_antes"
      ? `🔔 *LEAD QUALIFICADO - TESTE RÁPIDO*

👤 *Nome:* ${data.nome}
📱 *Telefone:* ${data.telefone}
⏱️ *Tempo:* ${data.tempoSegundos.toFixed(1)}s (piscou antes dos 10s)
🎯 *Indicativo:* Possível Olho Seco Evaporativo

⚡ *AÇÃO RECOMENDADA:* Entrar em contato para agendar avaliação

💬 Responder: https://wa.me/55${data.telefone.replace(/\D/g, "")}`
      : `✅ *TESTE RÁPIDO CONCLUÍDO*

👤 *Nome:* ${data.nome}
📱 *Telefone:* ${data.telefone}
⏱️ *Tempo:* 10+ segundos
🎯 *Indicativo:* Boa estabilidade lacrimal

💬 Responder: https://wa.me/55${data.telefone.replace(/\D/g, "")}`;

  // Notify patient
  const patientMessage =
    data.resultado === "piscou_antes"
      ? `Olá, ${firstName}! 👋

Vi que você fez o *Teste dos 10 Segundos* no nosso site e piscou em ${data.tempoSegundos.toFixed(1)}s.

Isso pode indicar *Olho Seco Evaporativo*, uma condição tratável com tecnologia avançada disponível na clínica.

🔬 Oferecemos exames como Meibografia e tratamentos como o E-Eye IRPL.

Gostaria de agendar uma avaliação? Responda esta mensagem ou acesse: https://saraivavision.com.br/agendamento

Atenciosamente,
*Dr. Philipe Saraiva Cruz*
CRM-MG 69.870 | RQE 307527`
      : `Parabéns, ${firstName}! 🌟

Você completou o *Teste dos 10 Segundos* com sucesso! Isso indica uma boa estabilidade do seu filme lacrimal.

Mesmo assim, recomendamos check-ups regulares para manter sua saúde ocular em dia.

Agende sua avaliação preventiva: https://saraivavision.com.br/agendamento

Atenciosamente,
*Dr. Philipe Saraiva Cruz*
CRM-MG 69.870 | RQE 307527`;

  const [clinicResult, patientResult] = await Promise.all([
    sendWhatsAppNotification({
      to: clinicPhone,
      message: clinicMessage,
      metadata: {
        type: "test_result_clinic",
        leadName: data.nome,
        leadPhone: data.telefone,
        testResult: data.resultado,
        testTime: data.tempoSegundos,
      },
    }),
    sendWhatsAppNotification({
      to: data.telefone,
      message: patientMessage,
      metadata: {
        type: "test_result_patient",
        testResult: data.resultado,
        testTime: data.tempoSegundos,
      },
    }),
  ]);

  return { clinic: clinicResult, patient: patientResult };
}
