/**
 * Identidade do responsável técnico do portal e da SUPERFÍCIE.
 *
 * O CFM exige que toda página que nomeie o médico exiba o registro. Manter os
 * números em um único módulo evita o modo de falha que já aconteceu aqui: a
 * revista exibia CRM e RQE, o portal citava o nome no rodapé de 34 páginas e
 * não exibia nenhum dos dois. Com uma fonte só, adicionar o nome a uma página
 * nova é adicionar o registro junto.
 */

const crm = "CRM-MG 69.870";
const rqe = "RQE 71.903";

export const responsibleDoctor = {
  /** Sem o "Dr." — os templates que precisam do tratamento o acrescentam. */
  name: "Philipe Saraiva Cruz",
  role: "Médico Oftalmologista",
  crm,
  rqe,
  /** Redação canônica exibida ao lado do nome. */
  registration: `${crm} · ${rqe}`,
  /** Identificadores públicos já documentados. */
  orcid: "https://orcid.org/0000-0002-4073-8371",
  lattes: "https://lattes.cnpq.br/7365253786880035",
  /** Perfil público; slug confirmado como saraiva, não sarava. */
  linkedin: "https://www.linkedin.com/in/dr-philipe-saraiva",
} as const;

/** Os artigos assinam "Dr. Philipe…"; o registro canônico omite o tratamento. */
export const isResponsibleDoctorName = (name: string) =>
  name.replace(/^dr\.?\s+/iu, "").trim() === responsibleDoctor.name;
