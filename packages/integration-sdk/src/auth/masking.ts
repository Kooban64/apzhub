const SECRET_PATTERNS = [
  /token/i,
  /secret/i,
  /password/i,
  /api[_-]?key/i,
  /authorization/i,
  /cookie/i,
  /bearer/i,
];

export function maskSecretValue(value: string): string {
  if (value.length === 0) {
    return "(empty)";
  }

  if (value.length <= 4) {
    return "****";
  }

  return `****${value.slice(-4)}`;
}

export function maskCredentialRef(ref: string): string {
  return maskSecretValue(ref.replace(/[^a-zA-Z0-9]/g, "").slice(-8) || ref);
}

/** Remove fields that may contain secrets from diagnostic metadata. */
export function sanitizeDiagnosticRecord(
  record: Readonly<Record<string, unknown>>,
): Readonly<Record<string, string | number | boolean>> {
  const safe: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(record)) {
    if (SECRET_PATTERNS.some((pattern) => pattern.test(key))) {
      continue;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      safe[key] = value;
    }
  }

  return safe;
}

/** Returns true when text appears to contain a raw secret value. */
export function containsLikelySecret(text: string, secret: string): boolean {
  if (!secret || secret.length < 4) {
    return false;
  }

  return text.includes(secret);
}
