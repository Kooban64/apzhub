import "server-only";

import type { NextResponse } from "next/server";

import type { IdentityIssuanceMode } from "@/lib/auth/session-issuer-types";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { encodeSessionCookie } from "@/lib/auth/session-cookie";
import { encodeSignedSessionCookie } from "@/lib/auth/signed-session-cookie";
import { requireSessionSigningSecret } from "@/lib/auth/session-signing.server";
import type { SessionSnapshot } from "@/lib/auth/session-types";
import { appendAuthAuditEventSafe } from "@/lib/identity/auth-audit.server";

const SESSION_MAX_AGE_SEC = 60 * 60 * 8;

function sessionCookieOptions(): {
  httpOnly: true;
  sameSite: "lax";
  path: string;
  maxAge: number;
  secure: boolean;
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
    secure: process.env.NODE_ENV === "production",
  };
}

/**
 * Encode session cookie bytes for the given identity mode (single decision point).
 * - `local`: requires `authSessionId`, signed `s2.` transport.
 * - `mock` / `oidc`: legacy base64 JSON; must not carry `authSessionId`.
 */
export function encodeSessionCookieValue(snapshot: SessionSnapshot, mode: IdentityIssuanceMode): string {
  if (mode === "local") {
    if (!snapshot.authSessionId) {
      throw new Error("Local identity sessions require authSessionId on the snapshot.");
    }
    return encodeSignedSessionCookie(snapshot, requireSessionSigningSecret());
  }
  if (snapshot.authSessionId) {
    throw new Error("authSessionId is only valid for local identity sessions.");
  }
  return encodeSessionCookie(snapshot);
}

export type AppendSessionCookieOptions = {
  mode: IdentityIssuanceMode;
  correlationId?: string;
  /** When false, skip `session_issued` audit row (e.g. profile cookie refresh). Default true. */
  auditSessionIssued?: boolean;
};

/** Attach the session cookie to a NextResponse (canonical cookie flags). */
export function appendSessionCookie(res: NextResponse, snapshot: SessionSnapshot, opts: AppendSessionCookieOptions): void {
  const token = encodeSessionCookieValue(snapshot, opts.mode);
  res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  if (opts.auditSessionIssued !== false) {
    void appendAuthAuditEventSafe({
      type: "session_issued",
      userId: snapshot.user?.id ?? null,
      sessionId: snapshot.authSessionId ?? null,
      correlationId: opts.correlationId ?? null,
      metadata: { identityMode: opts.mode, transport: snapshot.authSessionId ? "signed_s2" : "legacy_json" },
    });
  }
}

/** Clear session cookie (logout and similar). */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
