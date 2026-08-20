export const FORBIDDEN_SECRET_KEYS = [
  "password",
  "privatekey",
  "private_key",
  "sshkey",
  "ssh_key",
  "token",
  "secret",
  "pat",
  "passphrase",
  "credential",
  "credentials",
] as const;

export function assertNoRawSecrets(
  config: Readonly<Record<string, unknown>> | undefined,
): void {
  if (!config) return;
  for (const [key, value] of Object.entries(config)) {
    const normalised = key.toLowerCase().replaceAll("-", "_");
    if (
      FORBIDDEN_SECRET_KEYS.includes(
        normalised as (typeof FORBIDDEN_SECRET_KEYS)[number],
      )
    ) {
      if (normalised === "credential" || normalised === "credentials") {
        throw new Error("application.execution_target.use_credential_ref");
      }
      throw new Error("application.execution_target.raw_secret_forbidden");
    }
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      assertNoRawSecrets(value as Record<string, unknown>);
    }
  }
}

export function isApplicationStatus(
  value: string,
): value is import("./types").ApplicationStatus {
  return value === "setup" || value === "active" || value === "archived";
}

export function deriveApplicationKey(name: string): string {
  const key = name
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .toUpperCase()
    .slice(0, 16);
  return key.length >= 2 ? key : "APP";
}

export function normaliseApplicationKey(raw: string): string {
  const key = raw.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9_-]{1,31}$/.test(key)) {
    throw new Error("application.key_invalid");
  }
  return key;
}
