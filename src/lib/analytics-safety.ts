const campaignPattern = /^[a-z0-9][a-z0-9._~-]{0,79}$/u;
const emailPattern = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/iu;
const labelledPersonalDataPattern =
  /(?:^|[?&\s])(?:e[-_ ]?mail|email|telefone|phone|celular|cpf|cnpj|nome|name|username|user_id)(?:\s*[=:])/iu;
const cpfOrCnpjPattern = /^(?:\d{11}|\d{14})$/u;

const normalize = (value: string) =>
  value.normalize("NFKC").replace(/\s+/gu, " ").trim();

const hasPhoneLikeNumber = (value: string) => {
  const digits = value.replace(/\D/gu, "");
  if (digits.length < 8) return false;
  return /[+().\s-]/u.test(value) || cpfOrCnpjPattern.test(digits);
};

export const containsAnalyticsPersonalData = (value: string) => {
  const normalized = normalize(value);
  return (
    emailPattern.test(normalized) ||
    labelledPersonalDataPattern.test(normalized) ||
    hasPhoneLikeNumber(normalized)
  );
};

const normalizeCampaignValue = (value: string) =>
  normalize(value).normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();

export const sanitizeAnalyticsProperty = (
  key: string,
  value: unknown,
): string | number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") return null;

  const normalized = normalize(value);
  if (!normalized || containsAnalyticsPersonalData(normalized)) return null;

  if (key.startsWith("utm_")) {
    const campaignValue = normalizeCampaignValue(normalized);
    return campaignPattern.test(campaignValue) ? campaignValue : null;
  }

  return normalized.slice(0, 200);
};
