import "server-only";

import { loadAppSecrets } from "@/lib/config/secrets";

/**
 * Resolved signing secret (env + `*_FILE` via loadAppSecrets). Server-only — do not import from client/proxy graphs.
 */
export function resolveSessionSigningSecret(): string | undefined {
  const fromLoader = loadAppSecrets().sessionSigningSecret?.trim();
  if (fromLoader && fromLoader.length >= 32) {
    return fromLoader;
  }
  const fromEnv = process.env.APZHUB_SESSION_SIGNING_SECRET?.trim();
  return fromEnv && fromEnv.length >= 32 ? fromEnv : undefined;
}

export function requireSessionSigningSecret(): string {
  const s = resolveSessionSigningSecret();
  if (!s || s.length < 32) {
    throw new Error(
      "Session signing secret missing: set APZHUB_SESSION_SIGNING_SECRET (32+ chars) or APZHUB_SESSION_SIGNING_SECRET_FILE.",
    );
  }
  return s;
}
