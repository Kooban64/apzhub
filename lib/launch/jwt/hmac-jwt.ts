import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

function b64urlJson(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), "utf8").toString("base64url");
}

export type SignLaunchJwtInput = {
  secret: string;
  sub: string;
  serviceId: string;
  ttlSec: number;
  issuer: string;
  /** Per-service audience so downstream services reject tokens minted for other apps. */
  audience: string;
  /** When set, landing verification requires the same local auth session id. */
  authSessionId?: string;
};

export function signLaunchJwt(input: SignLaunchJwtInput): string {
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + input.ttlSec;
  const jti = randomUUID();
  const payload: Record<string, unknown> = {
    sub: input.sub,
    svc: input.serviceId,
    jti,
    iat,
    exp,
    iss: input.issuer,
    aud: input.audience,
  };
  if (input.authSessionId) {
    payload.sid = input.authSessionId;
  }
  const encHeader = b64urlJson(header);
  const encPayload = b64urlJson(payload);
  const signingInput = `${encHeader}.${encPayload}`;
  const sig = createHmac("sha256", input.secret).update(signingInput).digest("base64url");
  return `${signingInput}.${sig}`;
}

export type VerifyLaunchJwtOptions = {
  expectedIssuer: string;
  /** Must match token `aud` exactly (use per-service audience from mint). */
  expectedAudience: string;
  clockSkewSec?: number;
};

export type VerifyLaunchJwtSuccess = {
  ok: true;
  sub: string;
  serviceId: string;
  jti: string;
  exp: number;
  sid?: string;
};

export function verifyLaunchJwt(
  token: string,
  secret: string,
  opts: VerifyLaunchJwtOptions,
): VerifyLaunchJwtSuccess | { ok: false } {
  const skew = opts.clockSkewSec ?? 0;
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { ok: false };
  }
  const [h, p, s] = parts;
  if (!h || !p || !s) {
    return { ok: false };
  }
  const signingInput = `${h}.${p}`;
  let expected: Buffer;
  let got: Buffer;
  try {
    expected = createHmac("sha256", secret).update(signingInput).digest();
    got = Buffer.from(s, "base64url");
  } catch {
    return { ok: false };
  }
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) {
    return { ok: false };
  }
  let payload: {
    sub?: unknown;
    svc?: unknown;
    jti?: unknown;
    iat?: unknown;
    exp?: unknown;
    iss?: unknown;
    aud?: unknown;
    sid?: unknown;
  };
  try {
    payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8")) as typeof payload;
  } catch {
    return { ok: false };
  }
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || typeof payload.iat !== "number") {
    return { ok: false };
  }
  if (payload.exp < now - skew) {
    return { ok: false };
  }
  if (payload.iat > now + skew) {
    return { ok: false };
  }
  if (payload.iss !== opts.expectedIssuer) {
    return { ok: false };
  }
  if (payload.aud !== opts.expectedAudience) {
    return { ok: false };
  }
  if (typeof payload.sub !== "string" || typeof payload.svc !== "string" || typeof payload.jti !== "string") {
    return { ok: false };
  }
  const out: VerifyLaunchJwtSuccess = {
    ok: true,
    sub: payload.sub,
    serviceId: payload.svc,
    jti: payload.jti,
    exp: payload.exp,
  };
  if (typeof payload.sid === "string" && payload.sid.length > 0) {
    out.sid = payload.sid;
  }
  return out;
}
