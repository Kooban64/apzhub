import { isSessionExpired } from "@/lib/auth/session-policy";
import type { ResolvedSessionCookie } from "@/lib/auth/session-resolution";
import { decodeSessionTransportForProxy } from "@/lib/auth/session-transport-proxy";

/**
 * Async session resolution for `proxy.ts` — decodes signed `s2.` cookies via Web Crypto
 * because the proxy middleware graph omits `node:crypto`-based decoders.
 */
export async function resolveSessionCookieForProxy(raw: string | undefined): Promise<ResolvedSessionCookie> {
  if (!raw) {
    return { credential: "none", decoded: null };
  }
  const snap = await decodeSessionTransportForProxy(raw);
  if (!snap) {
    return { credential: "invalid", decoded: null };
  }
  if (snap.sessionStatus === "expired" || isSessionExpired(snap)) {
    return { credential: "expired", decoded: snap };
  }
  if (snap.sessionStatus !== "active") {
    return { credential: "invalid", decoded: snap };
  }
  return { credential: "active", decoded: snap };
}
