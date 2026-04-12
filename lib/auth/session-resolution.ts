import type { SessionCredentialState } from "@/lib/auth/session-credential-state";
import { isSessionExpired } from "@/lib/auth/session-policy";
import { decodeSessionTransport } from "@/lib/auth/session-transport";
import type { SessionSnapshot } from "@/lib/auth/session-types";

export { sessionCredentialStateSchema, type SessionCredentialState } from "@/lib/auth/session-credential-state";

export type ResolvedSessionCookie = {
  credential: SessionCredentialState;
  /** Decoded snapshot when parse succeeded (including expired body). */
  decoded: SessionSnapshot | null;
};

export type SessionTransportDecoder = (raw: string | undefined | null) => SessionSnapshot | null;

/**
 * Classifies the session cookie without collapsing states:
 * - none: missing cookie
 * - invalid: present but not a valid SessionSnapshot
 * - expired: valid snapshot but expired by clock or explicit status
 * - active: valid non-expired active session
 */
export function resolveSessionCookieWithDecode(
  raw: string | undefined,
  decodeTransport: SessionTransportDecoder,
): ResolvedSessionCookie {
  if (!raw) {
    return { credential: "none", decoded: null };
  }
  const snap = decodeTransport(raw);
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

/** Proxy-safe decode (`s2.` uses env-only signing secret). */
export function resolveSessionCookie(raw: string | undefined): ResolvedSessionCookie {
  return resolveSessionCookieWithDecode(raw, decodeSessionTransport);
}
