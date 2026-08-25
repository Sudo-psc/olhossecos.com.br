/**
 * PDF 1.4 mínimo, gerado no cliente, sem biblioteca e sem eval.
 * Helvetica + WinAnsi cobrem o português do aviso. Uma página A4
 * por chamada de `buildSinglePagePdf`; `buildPdf` aceita várias.
 */

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 48;

const winAnsiCode = (codePoint: number): number | undefined => {
  if (codePoint < 128) return codePoint;
  if (codePoint >= 160 && codePoint <= 255) return codePoint;
  const extras: Record<number, number> = {
    0x20ac: 0x80, // €
    0x201a: 0x82,
    0x0192: 0x83,
    0x201e: 0x84,
    0x2026: 0x85,
    0x2020: 0x86,
    0x2021: 0x87,
    0x02c6: 0x88,
    0x2030: 0x89,
    0x0160: 0x8a,
    0x2039: 0x8b,
    0x0152: 0x8c,
    0x017d: 0x8e,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201c: 0x93,
    0x201d: 0x94,
    0x2022: 0x95,
    0x2013: 0x96,
    0x2014: 0x97,
    0x02dc: 0x98,
    0x2122: 0x99,
    0x0161: 0x9a,
    0x203a: 0x9b,
    0x0153: 0x9d,
    0x017e: 0x9e,
    0x0178: 0x9f,
  };
  return extras[codePoint];
};

const escapePdfLiteral = (text: string): string => {
  let out = "";
  for (const char of text) {
    const code = char.codePointAt(0) ?? 63;
    if (char === "\\" || char === "(" || char === ")") {
      out += `\\${char}`;
      continue;
    }
    const encoded = winAnsiCode(code);
    if (encoded === undefined) {
      out += "?";
      continue;
    }
    if (encoded < 32 || encoded > 126) {
      out += `\\${encoded.toString(8).padStart(3, "0")}`;
      continue;
    }
    out += String.fromCharCode(encoded);
  }
  return out;
};

export interface PdfLine {
  text: string;
  size?: number;
  bold?: boolean;
  gapAfter?: number;
}

const wrapLine = (text: string, size: number, maxWidth: number): string[] => {
  const widthOf = (value: string) => value.length * size * 0.5;
  const words = text.split(/\s+/u).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = words[0];
  for (const word of words.slice(1)) {
    const next = `${current} ${word}`;
    if (widthOf(next) <= maxWidth) {
      current = next;
      continue;
    }
    lines.push(current);
    current = word;
  }
  lines.push(current);
  return lines;
};

const contentStream = (lines: PdfLine[]): string => {
  const maxWidth = PAGE_WIDTH - MARGIN * 2;
  let y = PAGE_HEIGHT - MARGIN;
  const commands: string[] = ["BT"];
  for (const line of lines) {
    const size = line.size ?? 10;
    const leading = line.gapAfter ?? size + 3;
    const font = line.bold ? "F2" : "F1";
    const wrapped = wrapLine(line.text, size, maxWidth);
    for (const piece of wrapped) {
      if (y < MARGIN + 16) break;
      commands.push(`/${font} ${size} Tf`);
      commands.push(
        `1 0 0 1 ${MARGIN} ${y.toFixed(1)} Tm (${escapePdfLiteral(piece)}) Tj`,
      );
      y -= leading;
    }
  }
  commands.push("ET");
  return commands.join("\n");
};

const encodePdf = (body: string): Uint8Array => new TextEncoder().encode(body);

export const buildPdf = (pages: PdfLine[][]): Uint8Array => {
  if (pages.length === 0) {
    throw new Error("PDF sem páginas.");
  }

  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  add("<< /Type /Catalog /Pages 2 0 R >>");
  const pageIds: number[] = [];
  const contentBodies = pages.map((lines) => contentStream(lines));

  const kidsPlaceholder = objects.length;
  objects.push("");

  const fontRegular = add(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  );
  const fontBold = add(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  );

  contentBodies.forEach((stream) => {
    const contentId = add(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
    const pageId = add(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> >>`,
    );
    pageIds.push(pageId);
  });

  objects[kidsPlaceholder] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefAt = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`;
  return encodePdf(pdf);
};

export const buildSinglePagePdf = (lines: PdfLine[]): Uint8Array =>
  buildPdf([lines]);

export const pdfPageCount = (bytes: Uint8Array): number => {
  const text = new TextDecoder().decode(bytes);
  const match = /\/Count (\d+)/u.exec(text);
  return match ? Number(match[1]) : 0;
};

export const pdfContains = (bytes: Uint8Array, snippet: string): boolean =>
  new TextDecoder().decode(bytes).includes(snippet);

export const downloadPdf = (bytes: Uint8Array, filename: string) => {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
