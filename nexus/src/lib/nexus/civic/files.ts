import type { Attachment, CivicDocument } from "./model";

export const fileMetadata = ({ name, size, type }: File): Attachment => ({ name, size, type });

export function download(name: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// PDF text uses a single-byte font encoding with explicit Polish glyphs.
const polishGlyphs = [
  ["ą", "aogonek"],
  ["ć", "cacute"],
  ["ę", "eogonek"],
  ["ł", "lslash"],
  ["ń", "nacute"],
  ["ó", "oacute"],
  ["ś", "sacute"],
  ["ź", "zacute"],
  ["ż", "zdotaccent"],
  ["Ą", "Aogonek"],
  ["Ć", "Cacute"],
  ["Ę", "Eogonek"],
  ["Ł", "Lslash"],
  ["Ń", "Nacute"],
  ["Ó", "Oacute"],
  ["Ś", "Sacute"],
  ["Ź", "Zacute"],
  ["Ż", "Zdotaccent"],
];
const glyphCodes = new Map(polishGlyphs.map(([letter], index) => [letter, 160 + index]));

function pdfText(text: string) {
  return Array.from(text.normalize("NFC"), (letter) => {
    const code = glyphCodes.get(letter) ?? (letter === "—" ? 151 : undefined);
    if (code !== undefined) return "\\" + code.toString(8);
    if (["\\", "(", ")"].includes(letter)) return "\\" + letter;
    return /^[ -~]$/.test(letter) ? letter : "?";
  }).join("");
}

export function demoPdf(title: string, content: string) {
  const lines = ["DEMO — dokument bez mocy urzędowej", title, ...content.split("\n")];
  const stream = `BT /F1 14 Tf 48 780 Td ${lines.map((line) => `(${pdfText(line)}) Tj 0 -24 Td`).join("\n")} ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding << /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [160 ${polishGlyphs.map(([, name]) => `/${name}`).join(" ")}] >> >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((value, index) => {
    const start = pdf.length;
    pdf += `${index + 1} 0 obj\n${value}\nendobj\n`;
    return start;
  });
  return (
    pdf +
    `xref\n0 6\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${pdf.length}\n%%EOF\n`
  );
}

export function downloadDocument(doc: CivicDocument) {
  if (!doc.format || doc.body === undefined) return;
  if (doc.format === "pdf")
    download(`${doc.id}.pdf`, demoPdf(doc.title, doc.body), "application/pdf");
  else
    download(
      `${doc.id}.txt`,
      `WZÓR — DANE FIKCYJNE\n${doc.title}\n\n${doc.body}\n`,
      "text/plain;charset=utf-8",
    );
}
