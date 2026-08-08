const campaignKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const getNewsletterCampaignContext = (search: string) => {
  const params = new URLSearchParams(search);
  const context: Record<string, string> = {};

  for (const key of campaignKeys) {
    const value = params.get(key)?.trim();
    if (value) context[key] = value;
  }

  return context;
};
