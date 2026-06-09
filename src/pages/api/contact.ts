/**
 * Contact Form API Endpoint
 * POST /api/contact
 *
 * Handles contact form submissions with:
 * - Input validation
 * - Email notifications (clinic + patient)
 * - WhatsApp notifications (clinic + patient)
 * - Google Ads conversion tracking data
 */

import type { APIRoute } from "astro";
import {
  sendEmail,
  generateClinicNotificationEmail,
  generatePatientConfirmationEmail,
} from "@/lib/services/email";
import { notifyClinic, notifyPatient } from "@/lib/services/whatsapp";

export const prerender = false;

interface ContactFormData {
  nome: string;
  telefone: string;
  email?: string;
  mensagem: string;
  origem?: string;
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
  // Brazilian phone: 10-11 digits (with area code)
  return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * Validate email (basic)
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize input string
 */
function sanitize(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

/**
 * Validate form data
 */
function validateFormData(data: Partial<ContactFormData>): {
  valid: boolean;
  errors: ValidationError[];
  sanitized: ContactFormData | null;
} {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.nome || data.nome.trim().length < 2) {
    errors.push({ field: "nome", message: "Nome é obrigatório (mínimo 2 caracteres)" });
  }

  if (!data.telefone || !validatePhone(data.telefone)) {
    errors.push({ field: "telefone", message: "Telefone inválido (formato: (XX) XXXXX-XXXX)" });
  }

  if (!data.mensagem || data.mensagem.trim().length < 5) {
    errors.push({ field: "mensagem", message: "Mensagem é obrigatória (mínimo 5 caracteres)" });
  }

  // Optional email validation
  if (data.email && !validateEmail(data.email)) {
    errors.push({ field: "email", message: "Email inválido" });
  }

  if (errors.length > 0) {
    return { valid: false, errors, sanitized: null };
  }

  // Sanitize and return
  const sanitized: ContactFormData = {
    nome: sanitize(data.nome!),
    telefone: data.telefone!.replace(/\D/g, ""),
    email: data.email ? sanitize(data.email) : undefined,
    mensagem: sanitize(data.mensagem!),
    origem: data.origem ? sanitize(data.origem) : "Formulário de Contato",
    consentimento: Boolean(data.consentimento),
  };

  return { valid: true, errors: [], sanitized };
}

export const POST: APIRoute = async ({ request }) => {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": import.meta.env.PROD
      ? "https://olhossecos.com.br"
      : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Parse request body
    const body = await request.json().catch(() => null);

    if (!body) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Corpo da requisição inválido",
        }),
        { status: 400, headers }
      );
    }

    // Validate form data
    const { valid, errors, sanitized } = validateFormData(body);

    if (!valid || !sanitized) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Dados inválidos",
          errors,
        }),
        { status: 400, headers }
      );
    }

    const timestamp = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    // Prepare notification data
    const notificationData = {
      nome: sanitized.nome,
      telefone: sanitized.telefone,
      mensagem: sanitized.mensagem,
      origem: sanitized.origem || "Formulário de Contato",
      timestamp,
    };

    // Execute all notifications in parallel
    const [emailClinicResult, emailPatientResult, whatsappClinicResult, whatsappPatientResult] =
      await Promise.allSettled([
        // Email to clinic
        (async () => {
          const clinicEmail = import.meta.env.CLINIC_EMAIL || "contato@saraivavision.com.br";
          const { subject, html, text } = generateClinicNotificationEmail(notificationData);
          return sendEmail({
            to: clinicEmail,
            subject,
            html,
            text,
            replyTo: sanitized.email,
          });
        })(),

        // Email to patient (if email provided)
        (async () => {
          if (!sanitized.email) return { success: false, error: "Email não fornecido" };
          const { subject, html, text } = generatePatientConfirmationEmail({
            nome: sanitized.nome,
          });
          return sendEmail({
            to: sanitized.email,
            subject,
            html,
            text,
          });
        })(),

        // WhatsApp to clinic
        notifyClinic(notificationData),

        // WhatsApp to patient
        notifyPatient({
          nome: sanitized.nome,
          telefone: sanitized.telefone,
        }),
      ]);

    // Analyze results
    const results = {
      emailClinic:
        emailClinicResult.status === "fulfilled" ? emailClinicResult.value : { success: false, error: "Failed" },
      emailPatient:
        emailPatientResult.status === "fulfilled" ? emailPatientResult.value : { success: false, error: "Failed" },
      whatsappClinic:
        whatsappClinicResult.status === "fulfilled"
          ? whatsappClinicResult.value
          : { success: false, error: "Failed" },
      whatsappPatient:
        whatsappPatientResult.status === "fulfilled"
          ? whatsappPatientResult.value
          : { success: false, error: "Failed" },
    };

    // At least one notification should succeed
    const anySuccess =
      results.emailClinic.success ||
      results.whatsappClinic.success ||
      results.emailPatient.success ||
      results.whatsappPatient.success;

    if (!anySuccess) {
      console.error("[Contact API] All notifications failed:", results);

      // Return WhatsApp fallback URL so user can contact directly
      const fallbackUrl = `https://wa.me/5533998601427?text=${encodeURIComponent(
        `Olá! Sou ${sanitized.nome}. ${sanitized.mensagem}`
      )}`;

      return new Response(
        JSON.stringify({
          success: false,
          error: "Não foi possível enviar sua mensagem automaticamente",
          fallbackUrl,
          message: "Por favor, entre em contato diretamente pelo WhatsApp",
        }),
        { status: 500, headers }
      );
    }

    // Log success
    console.log("[Contact API] Form submitted successfully:", {
      nome: sanitized.nome,
      telefone: sanitized.telefone.slice(0, 4) + "****",
      results: {
        emailClinic: results.emailClinic.success,
        emailPatient: results.emailPatient.success,
        whatsappClinic: results.whatsappClinic.success,
        whatsappPatient: results.whatsappPatient.success,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Mensagem enviada com sucesso! Entraremos em contato em breve.",
        notifications: {
          emailClinic: results.emailClinic.success,
          emailPatient: results.emailPatient.success,
          whatsappClinic: results.whatsappClinic.success,
          whatsappPatient: results.whatsappPatient.success,
        },
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("[Contact API] Unexpected error:", error);

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

// Handle OPTIONS request for CORS preflight
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
