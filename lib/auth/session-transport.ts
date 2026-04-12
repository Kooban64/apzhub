import { decodeSignedSessionCookie } from "@/lib/auth/signed-session-cookie";
import { decodeSessionCookie, encodeSessionCookie } from "@/lib/auth/session-cookie";
import { getSessionSigningSecretFromEnv } from "@/lib/auth/session-signing-env";
import type { SessionSnapshot } from "@/lib/auth/session-types";

/**
 * Decode session cookie: signed `s2.` (HMAC via `node:crypto`) or legacy base64 JSON.
 * For `proxy.ts`, use `decodeSessionTransportForProxy` — the proxy bundle omits Node crypto.
 */
export function decodeSessionTransport(raw: string | undefined | null): SessionSnapshot | null {
  if (!raw) {
    return null;
  }
  if (raw.startsWith("s2.")) {
    return decodeSignedSessionCookie(raw, getSessionSigningSecretFromEnv());
  }
  return decodeSessionCookie(raw);
}

/**
 * Encode legacy session cookie only. Signed sessions (`authSessionId`) must use
 * `encodeSessionTransportForServer` from `@/lib/auth/session-transport.server`.
 */
export function encodeSessionTransport(snapshot: SessionSnapshot): string {
  if (snapshot.authSessionId) {
    throw new Error("Signed sessions require encodeSessionTransportForServer() from session-transport.server.");
  }
  return encodeSessionCookie(snapshot);
}
