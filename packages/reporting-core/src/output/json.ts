import type { CanonicalReportDocument } from "@apzhub/reporting-contracts";

/** Pretty-print the canonical document as JSON. */
export function renderJsonDocument(document: CanonicalReportDocument): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}
