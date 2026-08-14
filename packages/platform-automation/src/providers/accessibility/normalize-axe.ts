/**
 * Flagship F3 — axe-core summary JSON → normalized a11y evidence.
 */

import { asRecord } from "../ingest/report-utils";

export type NormalizedAxeViolation = {
  readonly id: string;
  readonly impact?: string;
  readonly description: string;
  readonly nodes: number;
};

export type NormalizedAxeReport = {
  readonly ok: boolean;
  readonly summary: string;
  readonly violationCount: number;
  readonly passCount: number;
  readonly incompleteCount: number;
  readonly url?: string;
  readonly violations: readonly NormalizedAxeViolation[];
  readonly raw: Readonly<Record<string, unknown>>;
};

function countList(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

export function normalizeAxeSummary(payload: unknown): NormalizedAxeReport {
  const obj = asRecord(payload);
  const violationsRaw = Array.isArray(obj.violations) ? obj.violations : [];
  const violations: NormalizedAxeViolation[] = [];

  for (const item of violationsRaw) {
    if (!item || typeof item !== "object") continue;
    const v = item as Record<string, unknown>;
    const id = typeof v.id === "string" ? v.id : "unknown";
    const description =
      typeof v.description === "string"
        ? v.description
        : typeof v.help === "string"
          ? v.help
          : id;
    violations.push({
      id,
      impact: typeof v.impact === "string" ? v.impact : undefined,
      description,
      nodes: Array.isArray(v.nodes) ? v.nodes.length : 0,
    });
  }

  const violationCount =
    typeof obj.violationCount === "number" ? obj.violationCount : violations.length;
  const passCount =
    typeof obj.passCount === "number" ? obj.passCount : countList(obj.passes);
  const incompleteCount =
    typeof obj.incompleteCount === "number"
      ? obj.incompleteCount
      : countList(obj.incomplete);
  const url = typeof obj.url === "string" ? obj.url : undefined;
  const ok = violationCount === 0;

  return {
    ok,
    summary: ok
      ? `Accessibility: 0 violations (${passCount} passes)`
      : `Accessibility: ${violationCount} violation(s), ${passCount} passes`,
    violationCount,
    passCount,
    incompleteCount,
    url,
    violations: violations.slice(0, 100),
    raw: obj,
  };
}
