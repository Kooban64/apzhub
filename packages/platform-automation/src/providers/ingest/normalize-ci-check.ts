/**
 * SPR-APZQEP-202 — GitHub Actions / CI check conclusion → CI domain report.
 */

import type { NormalizedIngestReport } from "./create-report-ingest-provider";
import { asRecord } from "./report-utils";

export function normalizeCiCheckReport(payload: unknown): NormalizedIngestReport {
  const obj = asRecord(payload);
  const workflowRun =
    obj.workflow_run && typeof obj.workflow_run === "object"
      ? (obj.workflow_run as Record<string, unknown>)
      : obj.check_suite && typeof obj.check_suite === "object"
        ? (obj.check_suite as Record<string, unknown>)
        : obj;

  const conclusion = String(
    workflowRun.conclusion ?? obj.conclusion ?? obj.status ?? "",
  ).toLowerCase();
  const name = String(workflowRun.name ?? obj.name ?? obj.check_name ?? "CI");
  const htmlUrl = String(workflowRun.html_url ?? obj.html_url ?? obj.url ?? "");
  const ok =
    conclusion === "success" ||
    conclusion === "neutral" ||
    conclusion === "skipped" ||
    conclusion === "";

  const failed =
    conclusion === "failure" || conclusion === "timed_out" || conclusion === "cancelled"
      ? 1
      : 0;

  return {
    ok: ok && failed === 0,
    summary: `CI ${name}: ${conclusion || "unknown"}${htmlUrl ? ` · ${htmlUrl}` : ""}`,
    metrics: {
      conclusion: conclusion || "unknown",
      name,
      ok: ok && failed === 0,
      failed,
      htmlUrl: htmlUrl || null,
    },
    raw: payload,
  };
}
