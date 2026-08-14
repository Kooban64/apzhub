/**
 * Generic test/automation report normalizer (Cypress, Selenium, Appium, REST, visual).
 * Accepts common CI shapes: mocha/junit-ish JSON, {success,tests}, {stats}, {numPassedTests}.
 */

import type { NormalizedIngestReport } from "./create-report-ingest-provider";
import { asRecord } from "./report-utils";

export function normalizeTestSuiteReport(
  payload: unknown,
  label: string,
): NormalizedIngestReport {
  const obj = asRecord(payload);
  const stats =
    obj.stats && typeof obj.stats === "object" && !Array.isArray(obj.stats)
      ? (obj.stats as Record<string, unknown>)
      : obj;

  let passed =
    num(stats.passes) ??
    num(stats.passed) ??
    num(stats.numPassedTests) ??
    num(obj.numPassedTests) ??
    0;
  let failed =
    num(stats.failures) ??
    num(stats.failed) ??
    num(stats.numFailedTests) ??
    num(obj.numFailedTests) ??
    0;
  let skipped =
    num(stats.pending) ??
    num(stats.skipped) ??
    num(stats.numPendingTests) ??
    num(obj.numPendingTests) ??
    0;

  const tests = Array.isArray(obj.tests)
    ? obj.tests
    : Array.isArray(obj.results)
      ? obj.results
      : [];

  if (tests.length > 0 && passed + failed + skipped === 0) {
    for (const item of tests) {
      if (!item || typeof item !== "object") continue;
      const status = String(
        (item as Record<string, unknown>).status ??
          (item as Record<string, unknown>).state ??
          "",
      ).toLowerCase();
      if (status === "passed" || status === "pass" || status === "success") {
        passed += 1;
      } else if (
        status === "failed" ||
        status === "fail" ||
        status === "failure" ||
        status === "error"
      ) {
        failed += 1;
      } else if (status === "skipped" || status === "pending" || status === "todo") {
        skipped += 1;
      }
    }
  }

  const total =
    num(stats.tests) ??
    num(obj.numTotalTests) ??
    Math.max(passed + failed + skipped, tests.length);

  const successFlag =
    typeof obj.success === "boolean"
      ? obj.success
      : typeof stats.success === "boolean"
        ? stats.success
        : failed === 0 && (passed > 0 || total === 0);

  const ok = successFlag && failed === 0;
  return {
    ok,
    summary: ok
      ? `${label}: ${passed}/${total} passed`
      : `${label}: ${failed} failed (${passed} passed, ${skipped} skipped)`,
    metrics: { total, passed, failed, skipped, ok },
    raw: obj,
  };
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
