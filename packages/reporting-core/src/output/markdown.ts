import type { CanonicalReportDocument, ReportBlock } from "@apzhub/reporting-contracts";

function renderBlock(block: ReportBlock): string {
  switch (block.kind) {
    case "heading": {
      const prefix = "#".repeat(block.level);
      return `${prefix} ${block.text}`;
    }
    case "paragraph":
      return block.text;
    case "metric": {
      const unit = block.unit ? ` ${block.unit}` : "";
      return `**${block.label}:** ${block.value}${unit}`;
    }
    case "table": {
      if (block.columns.length === 0) return "";
      const header = `| ${block.columns.join(" | ")} |`;
      const sep = `| ${block.columns.map(() => "---").join(" | ")} |`;
      const rows = block.rows.map((row) => `| ${row.join(" | ")} |`);
      return [header, sep, ...rows].join("\n");
    }
    case "list":
      return block.items
        .map((item, i) => (block.ordered ? `${i + 1}. ${item}` : `- ${item}`))
        .join("\n");
    case "summary":
      return `> ${block.text}`;
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

/** Render a canonical report document as Markdown. */
export function renderMarkdownDocument(document: CanonicalReportDocument): string {
  const lines: string[] = [];
  if (document.header) lines.push(document.header, "");
  lines.push(`# ${document.title}`);
  if (document.subtitle) lines.push("", document.subtitle);
  lines.push("");
  if (document.metrics.length > 0) {
    lines.push("## Metrics");
    for (const m of document.metrics) {
      lines.push(`- **${m.label}:** ${m.value}`);
    }
    lines.push("");
  }
  for (const section of document.sections) {
    lines.push(`## ${section.title}`);
    lines.push("");
    for (const block of section.blocks) {
      const rendered = renderBlock(block);
      if (rendered) lines.push(rendered, "");
    }
  }
  if (document.footer) {
    lines.push("---", document.footer);
  }
  return `${lines.join("\n").trimEnd()}\n`;
}
