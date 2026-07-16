/**
 * Email Service - SendPulse (primary) + Resend (fallback)
 * Handles email notifications for contact form submissions
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface SendPulseTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface EmailResult {
  success: boolean;
  provider: "sendpulse" | "resend";
  messageId?: string;
  error?: string;
}

// Cache for SendPulse token
let sendPulseToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get SendPulse OAuth token
 */
async function getSendPulseToken(): Promise<string | null> {
  const clientId = import.meta.env.SENDPULSE_CLIENT_ID;
  const clientSecret = import.meta.env.SENDPULSE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("[Email] SendPulse credentials not configured");
    return null;
  }

  // Return cached token if still valid
  if (sendPulseToken && Date.now() < tokenExpiry) {
    return sendPulseToken;
  }

  try {
    const response = await fetch(
      "https://api.sendpulse.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`SendPulse auth failed: ${response.status}`);
    }

    const data: SendPulseTokenResponse = await response.json();
    sendPulseToken = data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return sendPulseToken;
  } catch (error) {
    console.error("[Email] SendPulse token error:", error);
    return null;
  }
}

/**
 * Send email via SendPulse SMTP API
 */
async function sendViaSendPulse(payload: EmailPayload): Promise<EmailResult> {
  const token = await getSendPulseToken();

  if (!token) {
    return {
      success: false,
      provider: "sendpulse",
      error: "Failed to get SendPulse token",
    };
  }

  const fromEmail =
    import.meta.env.SENDPULSE_FROM_EMAIL || "noreply@olhossecos.com.br";
  const fromName =
    import.meta.env.SENDPULSE_FROM_NAME ||
    "Olhos Secos — Centro Especializado em Olho Seco";

  try {
    const response = await fetch("https://api.sendpulse.com/smtp/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: {
          subject: payload.subject,
          from: {
            name: fromName,
            email: fromEmail,
          },
          to: [
            {
              email: payload.to,
            },
          ],
          html: payload.html,
          text: payload.text || "",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return {
      success: true,
      provider: "sendpulse",
      messageId: data.id || data.result?.id,
    };
  } catch (error) {
    console.error("[Email] SendPulse send error:", error);
    return {
      success: false,
      provider: "sendpulse",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email via Resend API (fallback)
 */
async function sendViaResend(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = import.meta.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      provider: "resend",
      error: "Resend API key not configured",
    };
  }

  const fromEmail =
    import.meta.env.RESEND_FROM_EMAIL || "noreply@olhossecos.com.br";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return {
      success: true,
      provider: "resend",
      messageId: data.id,
    };
  } catch (error) {
    console.error("[Email] Resend send error:", error);
    return {
      success: false,
      provider: "resend",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email with automatic fallback
 * Tries SendPulse first, falls back to Resend on failure
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  // Try SendPulse first
  const sendPulseResult = await sendViaSendPulse(payload);

  if (sendPulseResult.success) {
    console.log(`[Email] Sent via SendPulse: ${sendPulseResult.messageId}`);
    return sendPulseResult;
  }

  console.warn(
    `[Email] SendPulse failed: ${sendPulseResult.error}, trying Resend...`,
  );

  // Fallback to Resend
  const resendResult = await sendViaResend(payload);

  if (resendResult.success) {
    console.log(
      `[Email] Sent via Resend (fallback): ${resendResult.messageId}`,
    );
    return resendResult;
  }

  console.error(
    `[Email] Both providers failed. SendPulse: ${sendPulseResult.error}, Resend: ${resendResult.error}`,
  );

  return {
    success: false,
    provider: "resend",
    error: `All providers failed. SendPulse: ${sendPulseResult.error}, Resend: ${resendResult.error}`,
  };
}

/**
 * Generate HTML email template for clinic notification
 */
export function generateClinicNotificationEmail(data: {
  nome: string;
  telefone: string;
  mensagem: string;
  origem: string;
  timestamp: string;
}): { subject: string; html: string; text: string } {
  const subject = `🆕 Novo Contato - ${data.nome} | Olhos Secos`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #10314F; padding: 30px; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🆕 Novo Contato do Site</h1>
    <p style="color: #B8C7D4; margin: 10px 0 0 0; font-size: 14px;">Olhos Secos — Centro Especializado em Olho Seco</p>
  </div>

  <div style="background: #F7F6F3; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Nome</strong><br>
          <span style="font-size: 16px; color: #1e293b;">${escapeHtml(data.nome)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Telefone (WhatsApp)</strong><br>
          <a href="https://wa.me/55${data.telefone.replace(/\D/g, "")}" style="font-size: 16px; color: #22c55e; text-decoration: none; font-weight: bold;">
            📱 ${escapeHtml(data.telefone)}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Mensagem</strong><br>
          <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 8px; border-left: 4px solid #0F766E;">
            ${escapeHtml(data.mensagem).replace(/\n/g, "<br>")}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Informações</strong><br>
          <span style="font-size: 14px; color: #64748b;">
            📍 Origem: ${escapeHtml(data.origem)}<br>
            🕐 Data/Hora: ${escapeHtml(data.timestamp)}
          </span>
        </td>
      </tr>
    </table>

    <div style="margin-top: 20px; text-align: center;">
      <a href="https://wa.me/55${data.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${data.nome}! Recebemos sua mensagem pelo site Olhos Secos. Como posso ajudar?`)}"
         style="display: inline-block; background: #22c55e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        💬 Responder no WhatsApp
      </a>
    </div>
  </div>

  <div style="background: #10314F; padding: 20px; border-radius: 0 0 16px 16px; text-align: center;">
    <p style="color: #B8C7D4; margin: 0; font-size: 12px;">
      Olhos Secos — Centro Especializado em Olho Seco
    </p>
  </div>
</body>
</html>
  `;

  const text = `
NOVO CONTATO DO SITE - OLHO SECO CARATINGA

Nome: ${data.nome}
Telefone: ${data.telefone}
Mensagem: ${data.mensagem}

Origem: ${data.origem}
Data/Hora: ${data.timestamp}

---
Responder via WhatsApp: https://wa.me/55${data.telefone.replace(/\D/g, "")}
  `;

  return { subject, html, text };
}

/**
 * Generate HTML email template for patient confirmation
 */
export function generatePatientConfirmationEmail(data: { nome: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `✅ Recebemos sua mensagem | Olhos Secos — Centro Especializado em Olho Seco`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #10314F; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
    <img src="https://olhossecos.com.br/logo_prata.jpeg" alt="Olhos Secos — Centro Especializado em Olho Seco" style="height: 60px; margin-bottom: 15px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Mensagem Recebida! ✅</h1>
  </div>

  <div style="background: #F7F6F3; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 18px; color: #1e293b;">
      Olá, <strong>${escapeHtml(data.nome)}</strong>!
    </p>

    <p style="color: #475569;">
      Recebemos sua mensagem e entraremos em contato em breve pelo WhatsApp ou telefone informado.
    </p>

    <div style="background: #ffffff; border: 1px solid #0F766E; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: #0F766E; font-weight: 500;">
        ⏰ <strong>Horário de Atendimento:</strong><br>
        Segunda a Sexta: 08h às 18h<br>
        Sábado: 08h às 12h
      </p>
    </div>

    <p style="color: #475569;">
      Se precisar de atendimento imediato, entre em contato diretamente pelo WhatsApp:
    </p>

    <div style="text-align: center; margin: 25px 0;">
      <a href="https://wa.me/5533998601427"
         style="display: inline-block; background: #22c55e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        💬 Falar no WhatsApp
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">

    <p style="color: #64748b; font-size: 14px; text-align: center;">
      <strong>Dr. Philipe Saraiva Cruz</strong><br>
      Médico pós-graduado em Oftalmologia<br>
      CRM-MG 69.870 | RQE 307527
    </p>
  </div>

  <div style="background: #10314F; padding: 20px; border-radius: 0 0 16px 16px; text-align: center;">
    <p style="color: #B8C7D4; margin: 0 0 10px 0; font-size: 12px;">
      Olhos Secos — Centro Especializado em Olho Seco
    </p>
    <p style="margin: 0;">
      <a href="https://olhossecos.com.br" style="color: #A7D3CC; text-decoration: none; font-size: 12px;">olhossecos.com.br</a>
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Olá, ${data.nome}!

Recebemos sua mensagem e entraremos em contato em breve pelo WhatsApp ou telefone informado.

HORÁRIO DE ATENDIMENTO:
Segunda a Sexta: 08h às 18h
Sábado: 08h às 12h

Se precisar de atendimento imediato, entre em contato diretamente pelo WhatsApp:
https://wa.me/5533998601427

---
Dr. Philipe Saraiva Cruz
Médico pós-graduado em Oftalmologia
CRM-MG 69.870 | RQE 307527

Olhos Secos — Centro Especializado em Olho Seco
https://olhossecos.com.br
  `;

  return { subject, html, text };
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}
