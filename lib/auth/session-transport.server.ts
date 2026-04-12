import "server-only";

import { getIdentitySource } from "@/lib/adapters/env";
import { encodeSessionCookieValue } from "@/lib/auth/session-issuer.server";
import { decodeSignedSessionCookie } from "@/lib/auth/signed-session-cookie";
import { decodeSessionCookie } from "@/lib/auth/session-cookie";
import { resolveSessionSigningSecret } from "@/lib/auth/session-signing.server";
import type { SessionSnapshot } from "@/lib/auth/session-types";

export function decodeSessionTransportForServer(raw: string | undefined | null): SessionSnapshot | null {
  if (!raw) {
    return null;
  }
  if (raw.startsWith("s2.")) {
    if (getIdentitySource() !== "local") {
      return null;
    }
    return decodeSignedSessionCookie(raw, resolveSessionSigningSecret());
  }
  return decodeSessionCookie(raw);
}

/** Encode session transport using the unified issuer rules for the current `APZHUB_IDENTITY_SOURCE`. */
export function encodeSessionTransportForServer(snapshot: SessionSnapshot): string {
  return encodeSessionCookieValue(snapshot, getIdentitySource());
}
