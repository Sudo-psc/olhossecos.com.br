import { resolve } from "node:path";
import {
  getNewsletterCampaignRecipients,
  writePrivateExport,
} from "../src/lib/newsletter-operations.ts";

const databasePath = resolve(
  process.env.NEWSLETTER_DATABASE_PATH ??
    "/var/lib/olhossecos/newsletter.sqlite",
);
const outputPath = process.env.NEWSLETTER_EXPORT_PATH
  ? resolve(process.env.NEWSLETTER_EXPORT_PATH)
  : "";
const tokenSecret = process.env.NEWSLETTER_TOKEN_SECRET ?? "";
const siteOrigin =
  process.env.NEWSLETTER_SITE_ORIGIN ?? "https://olhossecos.com.br";

if (!outputPath) {
  throw new Error(
    "Defina NEWSLETTER_EXPORT_PATH para um novo arquivo privado.",
  );
}
const recipients = getNewsletterCampaignRecipients({
  databasePath,
  tokenSecret,
  siteOrigin,
});
const body = recipients
  .map((recipient) => JSON.stringify(recipient))
  .join("\n");
try {
  writePrivateExport(outputPath, body ? `${body}\n` : "");
} catch (error) {
  if (error?.code === "EEXIST" || error?.code === "ELOOP") {
    throw new Error(
      "O arquivo de exportação já existe; escolha outro caminho.",
    );
  }
  throw error;
}
console.log(`Exportados ${recipients.length} destinatários ativos.`);
