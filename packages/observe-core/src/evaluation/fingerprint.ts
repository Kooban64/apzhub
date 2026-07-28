/**
 * Deterministic alert fingerprinting (ADR-0070).
 * Inputs: tenantId + definitionId + stable labels hash.
 * Collision: identical inputs produce identical fingerprints; distinct label sets diverge.
 */

export function stableSerializeLabels(
  labels: Readonly<Record<string, string>> | undefined,
): string {
  if (!labels) return "";
  const keys = Object.keys(labels).sort();
  return keys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(labels[k] ?? "")}`)
    .join("&");
}

export function computeAlertFingerprint(input: {
  readonly tenantId: string;
  readonly definitionId: string;
  readonly labels?: Readonly<Record<string, string>>;
}): string {
  const tenant = input.tenantId.trim();
  const definitionId = input.definitionId.trim();
  const labelPart = stableSerializeLabels(input.labels);
  // Simple FNV-1a inspired hash for stable short suffix (not cryptographic).
  let hash = 2166136261;
  const material = `${tenant}|${definitionId}|${labelPart}`;
  for (let i = 0; i < material.length; i += 1) {
    hash ^= material.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const suffix = (hash >>> 0).toString(16).padStart(8, "0");
  return `afp_${suffix}_${definitionId}`;
}
