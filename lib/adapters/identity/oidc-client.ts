type OidcDiscoveryDocument = {
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri?: string;
};

export async function fetchOidcDiscovery(issuer: string): Promise<OidcDiscoveryDocument> {
  const base = issuer.replace(/\/$/, "");
  const res = await fetch(`${base}/.well-known/openid-configuration`, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`OIDC discovery failed: ${res.status}`);
  }
  return (await res.json()) as OidcDiscoveryDocument;
}

export function decodeJwtPayloadUnsafe(idToken: string): Record<string, unknown> {
  const parts = idToken.split(".");
  if (parts.length < 2) {
    throw new Error("Invalid JWT");
  }
  const payload = parts[1]!;
  const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const b64 = padded + "=".repeat(padLen);
  const json = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(json) as Record<string, unknown>;
}

export async function exchangeAuthorizationCode(params: {
  tokenEndpoint: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}): Promise<{ id_token: string; access_token?: string }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
    client_secret: params.clientSecret,
  });
  const res = await fetch(params.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const json: unknown = await res.json();
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${JSON.stringify(json)}`);
  }
  const obj = json as { id_token?: string; access_token?: string };
  if (!obj.id_token) {
    throw new Error("Token response missing id_token");
  }
  return { id_token: obj.id_token, access_token: obj.access_token };
}
