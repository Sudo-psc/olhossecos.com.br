/**
 * Test Result API Endpoint
 * POST /api/test-result
 *
 * Handles test result submissions from testerapido page with:
 * - Lead capture after test completion
 * - WhatsApp notifications (clinic + patient)
 * - Email notifications
 * - Google Ads conversion tracking data
 */

import type { APIRoute } from "astro";
import {
  sendEmail,
  generateClinicNotificationEmail,
} from "@/lib/services/email";
import { notifyTestResult } from "@/lib/services/whatsapp";

export const prerender = false;

interface TestResultData {
  nome: string;
  telefone: string;
  email?: string;
  tempoSegundos: number;
  resultado: "passou" | "piscou_antes";
  consentimento?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate phone number (Brazilian format)
 */
function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * Sanitize input string
 */
function sanitize(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 500);
}

/**
 * Validate form data
 */
function validateFormData(data: Partial<TestResultData>): {
  valid: boolean;
  errors: ValidationError[];
  sanitized: TestResultData | null;
} {
  const errors: ValidationError[] = [];

  if (!data.nome || data.nome.trim().length < 2) {
    errors.push({ field: "nome", message: "Nome é obrigatório" });
  }

  if (!data.telefone || !validatePhone(data.telefone)) {
    errors.push({ field: "telefone", message: "Telefone inválido" });
  }

  if (typeof data.tempoSegundos !== "number" || data.tempoSegundos < 0 || data.tempoSegundos > 60) {
    errors.push({ field: "tempoSegundos", message: "Tempo inválido" });
  }

  if (!["passou", "piscou_antes"].includes(data.resultado || "")) {
    errors.push({ field: "resultado", message: "Resultado inválido" });
  }

  if (errors.length > 0) {
    return { valid: false, errors, sanitized: null };
  }

  const sanitized: TestResultData = {
    nome: sanitize(data.nome!),
    telefone: data.telefone!.replace(/\D/g, ""),
    email: data.email ? sanitize(data.email) : undefined,
    tempoSegundos: Math.round(data.tempoSegundos! * 10) / 10,
    resultado: data.resultado as "passou" | "piscou_antes",
    consentimento: Boolean(data.consentimento),
  };

  return { valid: true, errors: [], sanitized };
}

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": import.meta.env.PROD
      ? "https://olhossecos.com.br"
      : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return new Response(
        JSON.stringify({ success: false, error: "Corpo da requisição inválido" }),
        { status: 400, headers }
      );
    }

    const { valid, errors, sanitized } = validateFormData(body);

    if (!valid || !sanitized) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados inválidos", errors }),
        { status: 400, headers }
      );
    }

    const timestamp = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    // Determine lead quality based on test result
    const isQualifiedLead = sanitized.resultado === "piscou_antes";
    const leadScore = isQualifiedLead ? "ALTO" : "MÉDIO";

    // Execute notifications in parallel
    const [whatsappResults, emailResult] = await Promise.allSettled([
      // WhatsApp notifications (clinic + patient)
      notifyTestResult({
        nome: sanitized.nome,
        telefone: sanitized.telefone,
        tempoSegundos: sanitized.tempoSegundos,
        resultado: sanitized.resultado,
      }),

      // Email to clinic
      (async () => {
        const clinicEmail = import.meta.env.CLINIC_EMAIL || "contato@saraivavision.com.br";

        const subject = isQualifiedLead
          ? `🔔 Lead Qualificado - Teste Rápido: ${sanitized.nome}`
          : `✅ Teste Rápido Concluído: ${sanitized.nome}`;

        const resultText = isQualifiedLead
          ? `⚠️ PISCOU ANTES dos 10s (${sanitized.tempoSegundos}s) - Possível Olho Seco Evaporativo`
          : `✅ Completou os 10 segundos - Boa estabilidade lacrimal`;

        const { html, text } = generateClinicNotificationEmail({
          nome: sanitized.nome,
          telefone: sanitized.telefone,
          mensagem: `RESULTADO DO TESTE DOS 10 SEGUNDOS\n\n${resultText}\n\nScore do Lead: ${leadScore}`,
          origem: "Teste Rápido - Olho Seco",
          timestamp,
        });

        return sendEmail({ to: clinicEmail, subject, html, text });
      })(),
    ]);

    // Analyze results
    const whatsappSuccess =
      whatsappResults.status === "fulfilled" &&
      (whatsappResults.value.clinic.success || whatsappResults.value.patient.success);

    const emailSuccess =
      emailResult.status === "fulfilled" && emailResult.value.success;

    const anySuccess = whatsappSuccess || emailSuccess;

    if (!anySuccess) {
      console.error("[Test Result API] All notifications failed");

      return new Response(
        JSON.stringify({
          success: false,
          error: "Não foi possível enviar as notificações",
          fallbackUrl: `https://wa.me/5533998601427?text=${encodeURIComponent(
            `Olá! Fiz o teste dos 10 segundos e ${isQualifiedLead ? `pisquei em ${sanitized.tempoSegundos}s` : "completei"}. Gostaria de agendar uma avaliação.`
          )}`,
        }),
        { status: 500, headers }
      );
    }

    console.log("[Test Result API] Lead captured:", {
      nome: sanitized.nome,
      resultado: sanitized.resultado,
      tempo: sanitized.tempoSegundos,
      leadScore,
      whatsappSuccess,
      emailSuccess,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: isQualifiedLead
          ? "Entraremos em contato em breve para agendar sua avaliação!"
          : "Obrigado por fazer o teste! Mantenha seus check-ups em dia.",
        leadScore,
        isQualifiedLead,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("[Test Result API] Unexpected error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro interno do servidor",
        fallbackUrl: "https://wa.me/5533998601427",
      }),
      { status: 500, headers }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": import.meta.env.PROD
        ? "https://olhossecos.com.br"
        : "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
};
