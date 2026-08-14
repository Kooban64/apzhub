/**
 * SPR-APZQEP-202 — Allure-style metadata / summary JSON normalizer.
 */

import type { NormalizedIngestReport } from "./create-report-ingest-provider";
import { asRecord } from "./report-utils";

function num(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

export function normalizeAllureSummary(payload: unknown): NormalizedIngestReport {
  const obj = asRecord(payload);
  const statistic =
    obj.statistic && typeof obj.statistic === "object" && !Array.isArray(obj.statistic)
      ? (obj.statistic as Record<string, unknown>)
      : obj;

  const passed = num(statistic.passed) ?? num(obj.passed) ?? num(obj.passedTests) ?? 0;
  const failed =
    num(statistic.failed) ??
    num(obj.failed) ??
    num(obj.broken) ??
    num(statistic.broken) ??
    0;
  const skipped =
    num(statistic.skipped) ?? num(obj.skipped) ?? num(statistic.unknown) ?? 0;
  const total = num(statistic.total) ?? num(obj.total) ?? passed + failed + skipped;
  const ok = failed === 0 && (passed > 0 || total === 0);

  return {
    ok,
    summary: ok
      ? `Allure summary: ${passed} passed (${total} total)`
      : `Allure summary: ${failed} failed / ${passed} passed / ${skipped} skipped`,
    metrics: { passed, failed, skipped, total, ok },
    raw: payload,
  };
}
