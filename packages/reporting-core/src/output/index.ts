import type {
  CanonicalReportDocument,
  ReportOutputFormat,
  RenderedReportOutput,
} from "@apzhub/reporting-contracts";

import { sha256Hex } from "../checksum";
import { renderCsvDocument } from "./csv";
import { renderDocxDocument } from "./docx";
import { renderHtmlDocument } from "./html";
import { renderJsonDocument } from "./json";
import { renderMarkdownDocument } from "./markdown";
import { renderPdfDocument } from "./pdf";

const CONTENT_TYPES: Readonly<Record<ReportOutputFormat, string>> = {
  html: "text/html",
  markdown: "text/markdown",
  json: "application/json",
  csv: "text/csv",
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function textOutput(
  format: ReportOutputFormat,
  text: string,
): RenderedReportOutput {
  const bytes = Buffer.from(text, "utf8");
  return {
    format,
    contentType: CONTENT_TYPES[format],
    encoding: "utf-8",
    body: text,
    byteLength: bytes.byteLength,
    checksumSha256: sha256Hex(bytes),
  };
}

function binaryOutput(
  format: ReportOutputFormat,
  buffer: Buffer,
): RenderedReportOutput {
  return {
    format,
    contentType: CONTENT_TYPES[format],
    encoding: "binary",
    body: buffer.toString("base64"),
    byteLength: buffer.byteLength,
    checksumSha256: sha256Hex(buffer),
  };
}

/** Render a canonical document to the requested output format. */
export function renderOutput(
  document: CanonicalReportDocument,
  format: ReportOutputFormat,
): RenderedReportOutput {
  switch (format) {
    case "html":
      return textOutput("html", renderHtmlDocument(document));
    case "markdown":
      return textOutput("markdown", renderMarkdownDocument(document));
    case "json":
      return textOutput("json", renderJsonDocument(document));
    case "csv":
      return textOutput("csv", renderCsvDocument(document));
    case "pdf":
      return binaryOutput("pdf", renderPdfDocument(document));
    case "docx":
      return binaryOutput("docx", renderDocxDocument(document));
    default: {
      const _exhaustive: never = format;
      throw new Error(`Unsupported report output format: ${String(_exhaustive)}`);
    }
  }
}

export {
  renderHtmlDocument,
  renderMarkdownDocument,
  renderJsonDocument,
  renderCsvDocument,
  renderPdfDocument,
  renderDocxDocument,
};
