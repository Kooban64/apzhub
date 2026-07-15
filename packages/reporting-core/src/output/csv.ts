import type { CanonicalReportDocument } from "@apzhub/reporting-contracts";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Flatten document metrics and the first table found into CSV.
 * Metrics are emitted as label/value rows; tables retain their columns.
 */
export function renderCsvDocument(document: CanonicalReportDocument): string {
  const lines: string[] = [];
  lines.push(["section", "label", "value"].map(csvEscape).join(","));
  for (const m of document.metrics) {
    lines.push(["metrics", m.label, m.value].map(csvEscape).join(","));
  }

  for (const section of document.sections) {
    for (const block of section.blocks) {
      if (block.kind !== "table" || block.columns.length === 0) continue;
      lines.push("");
      lines.push(block.columns.map(csvEscape).join(","));
      for (const row of block.rows) {
        lines.push([...row].map(csvEscape).join(","));
      }
      // Only the first table (plus metrics) per spec.
      return `${lines.join("\n")}\n`;
    }
  }

  return `${lines.join("\n")}\n`;
}
