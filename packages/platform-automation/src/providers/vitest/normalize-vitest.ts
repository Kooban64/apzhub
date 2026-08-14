/**
 * Flagship F3 — Vitest / Jest-like JSON report → summary + cases.
 * Enhance-only; does not import testing-services.
 */

import { asRecord } from "../ingest/report-utils";

export type NormalizedVitestCase = {
  readonly title: string;
  readonly status: string;
  readonly durationMs?: number;
  readonly message?: string;
};

export type NormalizedVitestReport = {
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly ok: boolean;
  readonly summary: string;
  readonly cases: readonly NormalizedVitestCase[];
  readonly raw: Readonly<Record<string, unknown>>;
};

function readString(
  obj: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function readNumber(
  obj: Record<string, unknown>,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function parseCase(item: Record<string, unknown>): NormalizedVitestCase {
  return {
    title:
      readString(item, "fullName", "title", "name") ??
      (Array.isArray(item.ancestorTitles)
        ? (item.ancestorTitles as string[]).join(" › ")
        : "unnamed"),
    status: readString(item, "status", "state") ?? "unknown",
    durationMs: readNumber(item, "duration", "durationMs"),
    message: readString(item, "failureMessage", "message"),
  };
}

function isFailure(status: string): boolean {
  const s = status.toLowerCase();
  return s === "failed" || s === "fail" || s === "error";
}

function isPass(status: string): boolean {
  const s = status.toLowerCase();
  return s === "passed" || s === "pass" || s === "success";
}

function isSkipped(status: string): boolean {
  const s = status.toLowerCase();
  return s === "skipped" || s === "pending" || s === "todo";
}

export function normalizeVitestReport(payload: unknown): NormalizedVitestReport {
  const obj = asRecord(payload);
  const cases: NormalizedVitestCase[] = [];

  if (Array.isArray(obj.testResults)) {
    for (const file of obj.testResults) {
      if (!file || typeof file !== "object") continue;
      const fileObj = file as Record<string, unknown>;
      const assertions = Array.isArray(fileObj.assertionResults)
        ? fileObj.assertionResults
        : [];
      for (const assertion of assertions) {
        if (assertion && typeof assertion === "object") {
          cases.push(parseCase(assertion as Record<string, unknown>));
        }
      }
      if (assertions.length === 0 && readString(fileObj, "name")) {
        cases.push({
          title: readString(fileObj, "name") ?? "file",
          status: readString(fileObj, "status") ?? "unknown",
          durationMs: readNumber(fileObj, "duration", "endTime"),
        });
      }
    }
  } else if (Array.isArray(obj.tests) || Array.isArray(obj.items)) {
    const list = (obj.tests ?? obj.items) as unknown[];
    for (const item of list) {
      if (item && typeof item === "object") {
        cases.push(parseCase(item as Record<string, unknown>));
      }
    }
  }

  if (cases.length === 0) {
    const numTotal = readNumber(obj, "numTotalTests", "total");
    const numPassed = readNumber(obj, "numPassedTests", "passed");
    const numFailed = readNumber(obj, "numFailedTests", "failed");
    if (typeof numTotal === "number" && numTotal > 0) {
      cases.push({
        title: "vitest-aggregate",
        status: (numFailed ?? 0) > 0 ? "failed" : "passed",
      });
      const passed = numPassed ?? Math.max(0, numTotal - (numFailed ?? 0));
      const failed = numFailed ?? 0;
      return {
        total: numTotal,
        passed,
        failed,
        skipped: Math.max(0, numTotal - passed - failed),
        ok: failed === 0 && obj.success !== false,
        summary: `Vitest CI: ${passed}/${numTotal} passed, ${failed} failed`,
        cases,
        raw: obj,
      };
    }
    throw new Error("INGEST_VITEST_EMPTY: report contained no tests");
  }

  const passed = cases.filter((c) => isPass(c.status)).length;
  const failed = cases.filter((c) => isFailure(c.status)).length;
  const skipped = cases.filter((c) => isSkipped(c.status)).length;
  const total = cases.length;
  const ok = failed === 0 && obj.success !== false;

  return {
    total,
    passed,
    failed,
    skipped,
    ok,
    summary: `Vitest CI: ${passed}/${total} passed, ${failed} failed, ${skipped} skipped`,
    cases,
    raw: obj,
  };
}
