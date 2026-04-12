import { NextResponse } from "next/server";

import { getIdentitySource } from "@/lib/adapters/env";
import { fetchOidcDiscovery } from "@/lib/adapters/identity/oidc-client";
import { OIDC_STATE_COOKIE_NAME } from "@/lib/auth/constants";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { logStructured } from "@/lib/observability/log";

export async function GET(request: Request) {
  const { correlationId, attach } = apiCorrelationFromRequest(request);

  if (getIdentitySource() !== "oidc") {
    return attach(NextResponse.json({ error: "OIDC is not enabled." }, { status: 404 }));
  }

  const issuer = process.env.APZHUB_OIDC_ISSUER?.trim();
  const clientId = process.env.APZHUB_OIDC_CLIENT_ID?.trim();
  const redirectUri = process.env.APZHUB_OIDC_REDIRECT_URI?.trim();
  if (!issuer || !clientId || !redirectUri) {
    logStructured("error", "identity", "OIDC authorize missing env", { correlationId });
    return attach(
      NextResponse.json({ error: "OIDC is not fully configured (issuer, client id, redirect URI)." }, { status: 500 }),
    );
  }

  try {
    const disco = await fetchOidcDiscovery(issuer);
    const state = crypto.randomUUID();
    const authUrl = new URL(disco.authorization_endpoint);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", process.env.APZHUB_OIDC_SCOPES?.trim() || "openid email profile");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);

    const res = NextResponse.redirect(authUrl.toString());
    res.cookies.set(OIDC_STATE_COOKIE_NAME, state, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
      secure: process.env.NODE_ENV === "production",
    });
    logStructured("info", "identity", "OIDC authorize redirect", { correlationId });
    return attach(res);
  } catch (e) {
    logStructured("error", "identity", "OIDC authorize failed", { correlationId, detail: String(e) });
    return attach(NextResponse.json({ error: "OIDC discovery or redirect failed." }, { status: 500 }));
  }
}
