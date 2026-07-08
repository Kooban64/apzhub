import { buildCsvContent } from "../ux/export-csv";

import type { TrustReport, TrustReportPayload } from "./trust-reporting-types";

export const TRUST_REPORT_EXPORT_FORMATS = ["csv", "html"] as const;
export type TrustReportExportFormat = (typeof TRUST_REPORT_EXPORT_FORMATS)[number];

export const TRUST_REPORT_EXPORT_PLACEHOLDER_FORMATS = ["pdf"] as const;
export type TrustReportExportPlaceholderFormat =
  (typeof TRUST_REPORT_EXPORT_PLACEHOLDER_FORMATS)[number];

export type TrustReportExportRequestFormat =
  TrustReportExportFormat | TrustReportExportPlaceholderFormat;

export interface TrustReportExportArtifact {
  readonly content: string;
  readonly mimeType: string;
  readonly filename: string;
  readonly disposition: "attachment" | "inline";
}

export function normalizeTrustReportExportFormat(
  raw: string | null | undefined,
): TrustReportExportRequestFormat | undefined {
  const normalized = raw?.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }
  if (normalized === "csv" || normalized === "html" || normalized === "pdf") {
    return normalized;
  }
  return undefined;
}

export function isTrustReportExportPlaceholderFormat(
  format: TrustReportExportRequestFormat,
): format is TrustReportExportPlaceholderFormat {
  return format === "pdf";
}

export function buildTrustReportExportFilename(
  report: TrustReport,
  extension: string,
): string {
  const ext = extension.startsWith(".") ? extension.slice(1) : extension;
  return `trust-${report.reportType}-${report.reportId}.${ext}`;
}

export function exportTrustReportToCsv(report: TrustReport): TrustReportExportArtifact {
  const { headers, rows } = mapReportPayloadToTable(report.payload);
  return {
    content: buildCsvContent(headers, rows),
    mimeType: "text/csv; charset=utf-8",
    filename: buildTrustReportExportFilename(report, "csv"),
    disposition: "attachment",
  };
}

export function exportTrustReportToHtml(
  report: TrustReport,
): TrustReportExportArtifact {
  const { headers, rows } = mapReportPayloadToTable(report.payload);
  const title = formatReportTitle(report.reportType);
  const period = formatReportingPeriod(report);

  const tableHead = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const tableBody = rows
    .map(
      (row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
    )
    .join("");

  const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} — ${escapeHtml(report.reportId)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #111; }
    h1 { font-size: 1.25rem; margin-bottom: 0.25rem; }
    .meta { color: #555; font-size: 0.875rem; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th, td { border: 1px solid #ccc; padding: 0.4rem 0.5rem; text-align: left; vertical-align: top; }
    th { background: #f5f5f5; }
    @media print {
      body { margin: 0.75in; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">
    <div>Report ID: ${escapeHtml(report.reportId)}</div>
    <div>Trust account: ${escapeHtml(report.trustAccountId)}</div>
    <div>Generated: ${escapeHtml(report.generatedAt)}</div>
    ${period ? `<div>Period: ${escapeHtml(period)}</div>` : ""}
  </div>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody}</tbody>
  </table>
</body>
</html>`;

  return {
    content,
    mimeType: "text/html; charset=utf-8",
    filename: buildTrustReportExportFilename(report, "html"),
    disposition: "inline",
  };
}

export function exportTrustReport(
  report: TrustReport,
  format: TrustReportExportFormat,
): TrustReportExportArtifact {
  if (format === "csv") {
    return exportTrustReportToCsv(report);
  }
  return exportTrustReportToHtml(report);
}

export function downloadTrustReportCsv(report: TrustReport): void {
  const artifact = exportTrustReportToCsv(report);
  const blob = new Blob([artifact.content], { type: artifact.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = artifact.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function openTrustReportPrintView(report: TrustReport): void {
  const artifact = exportTrustReportToHtml(report);
  const blob = new Blob([artifact.content], { type: artifact.mimeType });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function mapReportPayloadToTable(payload: TrustReportPayload): {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
} {
  switch (payload.kind) {
    case "trial_balance":
      return {
        headers: ["Scope", "Client ID", "Matter ID", "Balance", "Currency"],
        rows: payload.lines.map((line) => [
          line.scope,
          line.clientId ?? "",
          line.matterId ?? "",
          String(line.balanceAmount),
          line.currency,
        ]),
      };
    case "ledger":
      return {
        headers: ["Opened At", "Journal Entries", "Transactions"],
        rows: [
          [
            payload.ledger.openedAt,
            String(payload.ledger.entryCount),
            String(payload.ledger.transactionCount),
          ],
        ],
      };
    case "journal":
      return {
        headers: [
          "Journal Entry ID",
          "Reference",
          "Entry Date",
          "Transaction ID",
          "Debit Total",
          "Credit Total",
          "Line Count",
        ],
        rows: payload.lines.map((line) => [
          line.journalEntryId,
          line.journalReference,
          line.entryDate,
          line.trustTransactionId,
          String(line.debitTotal),
          String(line.creditTotal),
          String(line.lineCount),
        ]),
      };
    case "transactions":
      return {
        headers: [
          "Transaction ID",
          "Reference",
          "Type",
          "Amount",
          "Currency",
          "Transaction Date",
          "Posting Date",
          "Client ID",
          "Matter ID",
          "Status",
          "Narrative",
        ],
        rows: payload.lines.map((line) => [
          line.trustTransactionId,
          line.transactionReference,
          line.trustTransactionType,
          String(line.amount),
          line.currency,
          line.transactionDate,
          line.postingDate,
          line.clientId,
          line.matterId ?? "",
          line.status,
          line.narrative,
        ]),
      };
    case "client_statement":
      return {
        headers: [
          "Client ID",
          "Opening Balance",
          "Closing Balance",
          "Line Date",
          "Line Type",
          "Reference",
          "Description",
          "Amount",
          "Effect",
        ],
        rows: payload.lines.map((line) => [
          payload.clientId,
          String(payload.openingBalance),
          String(payload.closingBalance),
          line.lineDate,
          line.lineType,
          line.reference,
          line.description,
          String(line.amount),
          line.effect ?? "",
        ]),
      };
    case "matter_statement":
      return {
        headers: [
          "Client ID",
          "Matter ID",
          "Opening Balance",
          "Closing Balance",
          "Line Date",
          "Line Type",
          "Reference",
          "Description",
          "Amount",
          "Effect",
        ],
        rows: payload.lines.map((line) => [
          payload.clientId,
          payload.matterId,
          String(payload.openingBalance),
          String(payload.closingBalance),
          line.lineDate,
          line.lineType,
          line.reference,
          line.description,
          String(line.amount),
          line.effect ?? "",
        ]),
      };
    case "allocation_summary":
      return {
        headers: [
          "Allocation ID",
          "Transaction ID",
          "Client ID",
          "Matter ID",
          "Amount",
          "Effect",
          "Type",
          "Date",
        ],
        rows: payload.lines.map((line) => [
          line.trustAllocationId,
          line.trustTransactionId,
          line.clientId,
          line.matterId ?? "",
          String(line.amount),
          line.effect,
          line.allocationType,
          line.allocationDate,
        ]),
      };
    case "interest_summary":
      return {
        headers: [
          "Posting ID",
          "Status",
          "Period Start",
          "Period End",
          "Total Interest",
          "Line Count",
        ],
        rows: payload.lines.map((line) => [
          line.trustInterestPostingId,
          line.status,
          line.periodStart,
          line.periodEnd,
          String(line.totalInterestAmount),
          String(line.lineCount),
        ]),
      };
    case "transfer_summary":
      return {
        headers: [
          "Transfer ID",
          "Type",
          "Status",
          "Amount",
          "Source Client",
          "Destination Client",
          "Created At",
        ],
        rows: payload.lines.map((line) => [
          line.trustTransferId,
          line.transferType,
          line.status,
          String(line.amount),
          line.sourceClientId,
          line.destinationClientId,
          line.createdAt,
        ]),
      };
    case "reconciliation_summary":
      return {
        headers: [
          "Reconciliation ID",
          "Status",
          "Started At",
          "Completed At",
          "Warnings",
          "Errors",
          "Transactions",
        ],
        rows: payload.lines.map((line) => [
          line.reconciliationId,
          line.status,
          line.startedAt,
          line.completedAt,
          String(line.warningCount),
          String(line.errorCount),
          String(line.totalTransactions),
        ]),
      };
    default: {
      const exhaustive: never = payload;
      return exhaustive;
    }
  }
}

function formatReportTitle(reportType: TrustReport["reportType"]): string {
  return reportType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatReportingPeriod(report: TrustReport): string {
  const { start, end } = report.reportingPeriod;
  if (start && end) {
    return `${start} to ${end}`;
  }
  if (start) {
    return `from ${start}`;
  }
  if (end) {
    return `to ${end}`;
  }
  return "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
