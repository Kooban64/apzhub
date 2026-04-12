import { decodeSessionCookie } from "@/lib/auth/session-cookie";
import { decodeSignedSessionCookieWebCrypto } from "@/lib/auth/signed-session-cookie-verify-webcrypto";
import { getSessionSigningSecretFromEnv } from "@/lib/auth/session-signing-env";
import type { SessionSnapshot } from "@/lib/auth/session-types";

/**
 * Session decode for `proxy.ts` only. The Next proxy bundle cannot depend on `node:crypto`
 * (see `signed-session-cookie.ts`); use Web Crypto for `s2.` here.
 */
export async function decodeSessionTransportForProxy(raw: string | undefined | null): Promise<SessionSnapshot | null> {
  if (!raw) {
    return null;
  }
  if (raw.startsWith("s2.")) {
    return decodeSignedSessionCookieWebCrypto(raw, getSessionSigningSecretFromEnv());
  }
  return decodeSessionCookie(raw);
}
