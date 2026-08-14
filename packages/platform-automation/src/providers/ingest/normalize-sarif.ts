/**
 * SARIF / simplified security & code-quality report → evidence.
 * Accepts SARIF 2.1.0, Trivy JSON, ESLint stylish JSON, or {ok, findings[]}.
 */

import type { NormalizedIngestReport } from "./create-report-ingest-provider";
import { asRecord } from "./report-utils";

export function normalizeSarifOrFindings(
  payload: unknown,
  label: string,
): NormalizedIngestReport {
  const obj = asRecord(payload);

  if (typeof obj.ok === "boolean" && Array.isArray(obj.findings)) {
    const findings = obj.findings;
    const errorCount = findings.filter((f) => {
      if (!f || typeof f !== "object") return false;
      const level = String((f as Record<string, unknown>).level ?? "").toLowerCase();
      return level === "error" || level === "critical" || level === "high";
    }).length;
    const ok = obj.ok && errorCount === 0;
    return {
      ok,
      summary: ok
        ? `${label}: 0 high/critical findings (${findings.length} total)`
        : `${label}: ${errorCount} high/critical finding(s)`,
      metrics: { findings: findings.length, highOrCritical: errorCount, ok },
      raw: obj,
    };
  }

  // ESLint array form
  if (Array.isArray(payload)) {
    let errorCount = 0;
    let warningCount = 0;
    for (const file of payload) {
      if (!file || typeof file !== "object") continue;
      const messages = (file as Record<string, unknown>).messages;
      if (!Array.isArray(messages)) continue;
      for (const msg of messages) {
        if (!msg || typeof msg !== "object") continue;
        const severity = (msg as Record<string, unknown>).severity;
        if (severity === 2) errorCount += 1;
        else warningCount += 1;
      }
    }
    const ok = errorCount === 0;
    return {
      ok,
      summary: ok
        ? `${label}: 0 errors (${warningCount} warnings)`
        : `${label}: ${errorCount} error(s), ${warningCount} warning(s)`,
      metrics: { errors: errorCount, warnings: warningCount, ok },
      raw: payload,
    };
  }

  // SARIF
  if (Array.isArray(obj.runs)) {
    let errorCount = 0;
    let warningCount = 0;
    let noteCount = 0;
    for (const run of obj.runs) {
      if (!run || typeof run !== "object") continue;
      const results = (run as Record<string, unknown>).results;
      if (!Array.isArray(results)) continue;
      for (const result of results) {
        if (!result || typeof result !== "object") continue;
        const level = String(
          (result as Record<string, unknown>).level ?? "warning",
        ).toLowerCase();
        if (level === "error") errorCount += 1;
        else if (level === "note" || level === "none") noteCount += 1;
        else warningCount += 1;
      }
    }
    const ok = errorCount === 0;
    return {
      ok,
      summary: ok
        ? `${label}: 0 errors (${warningCount} warnings, ${noteCount} notes)`
        : `${label}: ${errorCount} error(s), ${warningCount} warning(s)`,
      metrics: { errors: errorCount, warnings: warningCount, notes: noteCount, ok },
      raw: obj,
    };
  }

  // Trivy simplified Results[]
  if (Array.isArray(obj.Results)) {
    let critical = 0;
    let high = 0;
    for (const result of obj.Results) {
      if (!result || typeof result !== "object") continue;
      const vulns = (result as Record<string, unknown>).Vulnerabilities;
      if (!Array.isArray(vulns)) continue;
      for (const v of vulns) {
        if (!v || typeof v !== "object") continue;
        const sev = String((v as Record<string, unknown>).Severity ?? "").toUpperCase();
        if (sev === "CRITICAL") critical += 1;
        else if (sev === "HIGH") high += 1;
      }
    }
    const ok = critical + high === 0;
    return {
      ok,
      summary: ok
        ? `${label}: 0 high/critical vulnerabilities`
        : `${label}: ${critical} critical, ${high} high`,
      metrics: { critical, high, ok },
      raw: obj,
    };
  }

  throw new Error(
    `${label}: unsupported report shape — provide SARIF, ESLint JSON, Trivy Results, or {ok, findings}`,
  );
}
