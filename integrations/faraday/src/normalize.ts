export type FaradayFindingSeed = {
  readonly title: string;
  readonly severity: string;
  readonly host?: string;
  readonly message?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function seedFromRecord(f: Record<string, unknown>, index: number): FaradayFindingSeed {
  const severity = String(f.severity ?? f.level ?? f.threat ?? "info").toLowerCase();
  const message =
    typeof f.message === "string"
      ? f.message
      : typeof f.description === "string"
        ? f.description
        : undefined;
  const title = String(
    f.name ?? f.message ?? f.title ?? f.ruleId ?? `Finding ${index}`,
  ).slice(0, 160);
  const host =
    typeof f.target === "string"
      ? f.target
      : typeof f.host === "string"
        ? f.host
        : undefined;
  return {
    title,
    severity,
    ...(host ? { host } : {}),
    ...(message ? { message } : {}),
  };
}

/**
 * Normalize Faraday JSON into finding seeds.
 * Accepts `{ vulns: [{ name, severity, target }] }` or simplified
 * `{ findings: [{ level|severity, message|name, host }] }`.
 */
export function normalizeFaradayPayload(payload: unknown): FaradayFindingSeed[] {
  const root = asRecord(payload);
  if (!root) return [];

  const list = Array.isArray(root.vulns)
    ? root.vulns
    : Array.isArray(root.findings)
      ? root.findings
      : null;
  if (!list) return [];

  const out: FaradayFindingSeed[] = [];
  let i = 0;
  for (const item of list) {
    const f = asRecord(item);
    if (!f) continue;
    i += 1;
    out.push(seedFromRecord(f, i));
  }
  return out;
}
