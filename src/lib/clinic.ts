/**
 * Clínica presencial — ponte ética, não o produto deste domínio.
 *
 * olhossecos.com.br é educação. O atendimento mora em saraivavision.com.br.
 * Endereço, telefone e WhatsApp ficam neste módulo para o rodapé, /contato e
 * o schema LocalBusiness não divergirem.
 */

export const clinic = {
  name: "Saraiva Vision",
  legalName: "Saraiva Vision Clínica Especializada em Olho Seco",
  url: "https://saraivavision.com.br",
  streetAddress: "Rua Catarina Maria Passos, 97",
  addressLocality: "Caratinga",
  addressRegion: "MG",
  addressNeighborhood: "Santa Zita",
  postalCode: "35300-299",
  addressCountry: "BR",
  telephoneDisplay: "(33) 99860-1427",
  telephoneE164: "+5533998601427",
  whatsappUrl: "https://wa.me/5533998601427",
  taxId: "53.864.119/0001-79",
  openingHours: ["Mo-Fr 08:00-18:00", "Sa 08:00-12:00"],
} as const;

export const clinicAddressLine = `${clinic.streetAddress}, ${clinic.addressNeighborhood}, ${clinic.addressLocality}/${clinic.addressRegion}, CEP ${clinic.postalCode}`;
