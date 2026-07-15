import type { CanonicalReportDocument } from "@apzhub/reporting-contracts";

function escapePdfString(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function collectLines(document: CanonicalReportDocument): string[] {
  const lines: string[] = [];
  lines.push(document.title);
  if (document.subtitle) lines.push(document.subtitle);
  if (document.header) lines.push(document.header);
  for (const m of document.metrics) {
    lines.push(`${m.label}: ${m.value}`);
  }
  for (const section of document.sections) {
    lines.push(section.title);
    for (const block of section.blocks) {
      switch (block.kind) {
        case "heading":
        case "paragraph":
        case "summary":
          lines.push(block.text);
          break;
        case "metric": {
          const unit = block.unit ? ` ${block.unit}` : "";
          lines.push(`${block.label}: ${block.value}${unit}`);
          break;
        }
        case "list":
          for (const item of block.items) lines.push(`- ${item}`);
          break;
        case "table":
          if (block.columns.length > 0) {
            lines.push(block.columns.join(" | "));
            for (const row of block.rows) lines.push(row.join(" | "));
          }
          break;
        default:
          break;
      }
    }
  }
  if (document.footer) lines.push(document.footer);
  return lines.map((l) => l.slice(0, 110));
}

/**
 * Minimal valid PDF-1.1 with Helvetica text lines.
 * No external dependencies.
 */
export function renderPdfDocument(document: CanonicalReportDocument): Buffer {
  const textLines = collectLines(document);
  const contentParts: string[] = ["BT", "/F1 11 Tf", "50 750 Td", "14 TL"];
  let first = true;
  for (const line of textLines.slice(0, 48)) {
    const escaped = escapePdfString(line);
    if (first) {
      contentParts.push(`(${escaped}) Tj`);
      first = false;
    } else {
      contentParts.push("T*", `(${escaped}) Tj`);
    }
  }
  contentParts.push("ET");
  const stream = contentParts.join("\n");
  const streamLength = Buffer.byteLength(stream, "utf8");

  const objects: string[] = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.1\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}
