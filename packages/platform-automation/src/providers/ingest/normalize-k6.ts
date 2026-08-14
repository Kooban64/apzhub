/**
 * k6 summary JSON → performance evidence.
 * Accepts k6 end-of-test summary (`metrics`) or simplified {ok, p95, http_req_failed}.
 */

import type { NormalizedIngestReport } from "./create-report-ingest-provider";
import { asRecord } from "./report-utils";

export function normalizeK6Summary(payload: unknown): NormalizedIngestReport {
  const obj = asRecord(payload);
  const metrics =
    obj.metrics && typeof obj.metrics === "object" && !Array.isArray(obj.metrics)
      ? (obj.metrics as Record<string, unknown>)
      : obj;

  const httpFailed = rateValue(metrics.http_req_failed);
  const p95 =
    trendP(metrics.http_req_duration, "p(95)") ??
    num(obj.p95) ??
    num(obj.http_req_duration_p95);
  const checks =
    rateValue(metrics.checks) ??
    (typeof obj.checksPassRate === "number" ? obj.checksPassRate : undefined);

  const maxFailRate = typeof obj.maxFailRate === "number" ? obj.maxFailRate : 0.01;
  const maxP95Ms = typeof obj.maxP95Ms === "number" ? obj.maxP95Ms : 2000;

  const failOk = httpFailed === undefined || httpFailed <= maxFailRate;
  const p95Ok = p95 === undefined || p95 <= maxP95Ms;
  const checksOk = checks === undefined || checks >= 0.99;
  const explicitOk = typeof obj.ok === "boolean" ? obj.ok : undefined;
  const ok = explicitOk ?? (failOk && p95Ok && checksOk);

  return {
    ok,
    summary: ok
      ? `Performance: thresholds met` +
        (p95 !== undefined ? ` (p95 ${Math.round(p95)}ms)` : "")
      : `Performance: thresholds missed` +
        (httpFailed !== undefined
          ? ` · fail rate ${(httpFailed * 100).toFixed(2)}%`
          : "") +
        (p95 !== undefined ? ` · p95 ${Math.round(p95)}ms` : ""),
    metrics: {
      ok,
      http_req_failed: httpFailed ?? null,
      p95: p95 ?? null,
      checks: checks ?? null,
    },
    raw: obj,
  };
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function rateValue(metric: unknown): number | undefined {
  if (!metric || typeof metric !== "object") return undefined;
  const m = metric as Record<string, unknown>;
  const values =
    m.values && typeof m.values === "object"
      ? (m.values as Record<string, unknown>)
      : m;
  return num(values.rate) ?? num(values.value) ?? num(m.rate);
}

function trendP(metric: unknown, key: string): number | undefined {
  if (!metric || typeof metric !== "object") return undefined;
  const m = metric as Record<string, unknown>;
  const values =
    m.values && typeof m.values === "object"
      ? (m.values as Record<string, unknown>)
      : m;
  return num(values[key]) ?? num(values["p95"]) ?? num(values.avg);
}
