import type { CanonicalReportDocument, ReportBlock } from "@apzhub/reporting-contracts";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderBlock(block: ReportBlock): string {
  switch (block.kind) {
    case "heading":
      return `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`;
    case "paragraph":
      return `<p>${escapeHtml(block.text)}</p>`;
    case "metric": {
      const unit = block.unit ? ` ${escapeHtml(block.unit)}` : "";
      return `<div class="metric"><span class="label">${escapeHtml(block.label)}</span>: <span class="value">${escapeHtml(block.value)}${unit}</span></div>`;
    }
    case "table": {
      const head = block.columns
        .map((c) => `<th>${escapeHtml(c)}</th>`)
        .join("");
      const body = block.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
        )
        .join("");
      return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    }
    case "list": {
      const tag = block.ordered ? "ol" : "ul";
      const items = block.items
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
      return `<${tag}>${items}</${tag}>`;
    }
    case "summary":
      return `<div class="summary">${escapeHtml(block.text)}</div>`;
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

/** Render a canonical report document as UTF-8 HTML. */
export function renderHtmlDocument(document: CanonicalReportDocument): string {
  const brand = document.branding?.productName
    ? escapeHtml(document.branding.productName)
    : "APZHUB";
  const header = document.header
    ? `<header>${escapeHtml(document.header)}</header>`
    : "";
  const footer = document.footer
    ? `<footer>${escapeHtml(document.footer)}</footer>`
    : "";
  const subtitle = document.subtitle
    ? `<p class="subtitle">${escapeHtml(document.subtitle)}</p>`
    : "";
  const metrics = document.metrics
    .map(
      (m) =>
        `<li><strong>${escapeHtml(m.label)}</strong>: ${escapeHtml(m.value)}</li>`,
    )
    .join("");
  const sections = document.sections
    .map((section) => {
      const blocks = section.blocks.map(renderBlock).join("\n");
      return `<section id="${escapeHtml(section.id)}"><h2>${escapeHtml(section.title)}</h2>\n${blocks}</section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(document.title)}</title>
<meta name="generator" content="${brand}"/>
</head>
<body>
${header}
<main>
<h1>${escapeHtml(document.title)}</h1>
${subtitle}
<ul class="metrics">${metrics}</ul>
${sections}
</main>
${footer}
</body>
</html>
`;
}
