import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getIdentitySource } from "@/lib/adapters/env";
import {
  decodeJwtPayloadUnsafe,
  exchangeAuthorizationCode,
  fetchOidcDiscovery,
} from "@/lib/adapters/identity/oidc-client";
import { OIDC_STATE_COOKIE_NAME } from "@/lib/auth/constants";
import { buildMockSessionFromCredentials } from "@/lib/auth/mock-session";
import { appendSessionCookie } from "@/lib/auth/session-issuer.server";
import { sessionSnapshotSchema } from "@/lib/auth/session-types";
import { buildOidcLinkedSessionSnapshot } from "@/lib/identity/session-snapshot-from-user";
import { ensurePortalUserForOidcEmail } from "@/lib/identity/oidc-portal-user";
import { isProvisioningEngineConfigured } from "@/lib/provisioning/service/provisioning-service";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { logStructured } from "@/lib/observability/log";

export async function GET(request: Request) {
  const { correlationId, attach } = apiCorrelationFromRequest(request);

  if (getIdentitySource() !== "oidc") {
    return attach(NextResponse.json({ error: "OIDC is not enabled." }, { status: 404 }));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (err) {
    logStructured("warn", "identity", "OIDC callback error query", { correlationId, err: String(err) });
    return attach(
      NextResponse.redirect(new URL(`/login?reason=oidc&detail=${encodeURIComponent(String(err))}`, url.origin)),
    );
  }
  if (!code || !state) {
    return attach(NextResponse.redirect(new URL("/login?reason=oidc&detail=missing_code", url.origin)));
  }

  const jar = await cookies();
  const expected = jar.get(OIDC_STATE_COOKIE_NAME)?.value;
  if (!expected || expected !== state) {
    logStructured("warn", "identity", "OIDC state mismatch", { correlationId });
    return attach(NextResponse.redirect(new URL("/login?reason=oidc&detail=state", url.origin)));
  }

  const issuer = process.env.APZHUB_OIDC_ISSUER?.trim();
  const clientId = process.env.APZHUB_OIDC_CLIENT_ID?.trim();
  const clientSecret = process.env.APZHUB_OIDC_CLIENT_SECRET?.trim();
  const redirectUri = process.env.APZHUB_OIDC_REDIRECT_URI?.trim();
  if (!issuer || !clientId || !clientSecret || !redirectUri) {
    return attach(NextResponse.redirect(new URL("/login?reason=oidc&detail=config", url.origin)));
  }

  try {
    const disco = await fetchOidcDiscovery(issuer);
    const tokens = await exchangeAuthorizationCode({
      tokenEndpoint: disco.token_endpoint,
      clientId,
      clientSecret,
      redirectUri,
      code,
    });
    const claims = decodeJwtPayloadUnsafe(tokens.id_token);
    const emailRaw = claims.email ?? claims.preferred_username;
    const email = typeof emailRaw === "string" ? emailRaw.trim() : "";
    if (!email || !email.includes("@")) {
      logStructured("warn", "identity", "OIDC id_token missing email", { correlationId });
      return attach(NextResponse.redirect(new URL("/login?reason=oidc&detail=claims", url.origin)));
    }

    const nameRaw = claims.name ?? claims.given_name;
    const displayHint = typeof nameRaw === "string" ? nameRaw.trim() : undefined;
    const now = Math.floor(Date.now() / 1000);
    const expiresAtEpochSec = now + 60 * 60 * 8;

    let snapshot = sessionSnapshotSchema.parse(buildMockSessionFromCredentials(email));
    if (isProvisioningEngineConfigured()) {
      try {
        const row = await ensurePortalUserForOidcEmail({
          email,
          displayNameHint: displayHint,
          correlationId,
        });
        snapshot = sessionSnapshotSchema.parse(buildOidcLinkedSessionSnapshot(row, expiresAtEpochSec));
      } catch (e) {
        logStructured("warn", "identity", "OIDC portal user link failed; falling back to mock-shaped session", {
          correlationId,
          detail: String(e),
        });
      }
    }
    const dest = new URL(snapshot.defaultLandingPath, url.origin).toString();
    const res = NextResponse.redirect(dest);
    appendSessionCookie(res, snapshot, { mode: "oidc", correlationId });
    res.cookies.set(OIDC_STATE_COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
    logStructured("info", "identity", "OIDC callback session issued", { correlationId, email });
    return attach(res);
  } catch (e) {
    logStructured("error", "identity", "OIDC callback failed", { correlationId, detail: String(e) });
    return attach(NextResponse.redirect(new URL("/login?reason=oidc&detail=exchange", url.origin)));
  }
}
