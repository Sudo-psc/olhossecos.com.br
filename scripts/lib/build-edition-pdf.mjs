/**
 * Composes a real multi-page PDF from JPEG rasters.
 * The edition generator used to write a ~10 KB text stub; the lab fallback
 * must be the even-page object built from the same plates as the flipbook.
 */

export function buildEditionPdf(pages) {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error("buildEditionPdf exige ao menos uma página.");
  }
  if (pages.length % 2 !== 0) {
    throw new Error(
      `PDF da edição precisa de página par (recebeu ${pages.length}).`,
    );
  }

  const objects = new Map();
  const pageObjectNumbers = [];

  for (const [index, page] of pages.entries()) {
    const jpeg = toBuffer(page.jpeg);
    const width = Math.trunc(page.width);
    const height = Math.trunc(page.height);
    if (
      !Number.isInteger(width) ||
      width < 1 ||
      !Number.isInteger(height) ||
      height < 1
    ) {
      throw new Error(`Página ${index + 1} sem dimensões válidas.`);
    }
    if (jpeg.length < 100 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8) {
      throw new Error(`Página ${index + 1} não é um JPEG.`);
    }

    const pageObject = 3 + index * 3;
    const contentObject = pageObject + 1;
    const imageObject = pageObject + 2;
    pageObjectNumbers.push(pageObject);

    const content = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`;
    objects.set(
      pageObject,
      Buffer.from(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>`,
        "ascii",
      ),
    );
    objects.set(
      contentObject,
      Buffer.concat([
        Buffer.from(
          `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}endstream`,
          "ascii",
        ),
      ]),
    );
    objects.set(
      imageObject,
      Buffer.concat([
        Buffer.from(
          `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
          "ascii",
        ),
        jpeg,
        Buffer.from("\nendstream", "ascii"),
      ]),
    );
  }

  objects.set(1, Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "ascii"));
  objects.set(
    2,
    Buffer.from(
      `<< /Type /Pages /Kids [${pageObjectNumbers
        .map((number) => `${number} 0 R`)
        .join(" ")}] /Count ${pages.length} >>`,
      "ascii",
    ),
  );

  const chunks = [Buffer.from("%PDF-1.4\n", "ascii")];
  const offsets = [0];
  let cursor = chunks[0].length;
  const maxObject = Math.max(...objects.keys());
  for (let index = 1; index <= maxObject; index += 1) {
    const body = objects.get(index);
    if (!body) {
      throw new Error(`Objeto PDF ${index} ausente.`);
    }
    offsets[index] = cursor;
    const header = Buffer.from(`${index} 0 obj\n`, "ascii");
    const footer = Buffer.from("\nendobj\n", "ascii");
    chunks.push(header, body, footer);
    cursor += header.length + body.length + footer.length;
  }

  const xrefOffset = cursor;
  let xref = `xref\n0 ${maxObject + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= maxObject; index += 1) {
    xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${maxObject + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(Buffer.from(xref, "ascii"));
  return Buffer.concat(chunks);
}

function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  throw new Error("Cada página precisa de um Buffer JPEG.");
}
