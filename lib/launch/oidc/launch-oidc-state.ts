import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const STATE_VERSION = 1;

export type OidcLaunchStatePayload = {
  v: typeof STATE_VERSION;
  svc: string;
  sub: string;
  iat: number;
  exp: number;
  n: string;
};

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

/** Opaque OIDC `state` param: base64url(payload).hmac (HMAC-SHA256 over payload bytes). */
export function mintOidcLaunchState(
  secret: string,
  input: { serviceId: string; userId: string; ttlSec?: number },
): string {
  const now = Math.floor(Date.now() / 1000);
  const ttl = input.ttlSec ?? 600;
  const payload: OidcLaunchStatePayload = {
    v: STATE_VERSION,
    svc: input.serviceId,
    sub: input.userId,
    iat: now,
    exp: now + ttl,
    n: randomBytes(16).toString("hex"),
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const sig = createHmac("sha256", secret).update(body).digest();
  return `${b64url(body)}.${b64url(sig)}`;
}

export function verifyOidcLaunchState(
  secret: string,
  state: string,
  clockSkewSec: number,
): { ok: true; serviceId: string; userId: string } | { ok: false } {
  const lastDot = state.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === state.length - 1) {
    return { ok: false };
  }
  const bodyB64 = state.slice(0, lastDot);
  const sigB64 = state.slice(lastDot + 1);
  let body: Buffer;
  let gotSig: Buffer;
  try {
    body = Buffer.from(bodyB64, "base64url");
    gotSig = Buffer.from(sigB64, "base64url");
  } catch {
    return { ok: false };
  }
  const expected = createHmac("sha256", secret).update(body).digest();
  if (gotSig.length !== expected.length || !timingSafeEqual(gotSig, expected)) {
    return { ok: false };
  }
  let payload: OidcLaunchStatePayload;
  try {
    payload = JSON.parse(body.toString("utf8")) as OidcLaunchStatePayload;
  } catch {
    return { ok: false };
  }
  if (payload.v !== STATE_VERSION || typeof payload.svc !== "string" || typeof payload.sub !== "string") {
    return { ok: false };
  }
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || typeof payload.iat !== "number") {
    return { ok: false };
  }
  if (payload.iat > now + clockSkewSec) {
    return { ok: false };
  }
  if (payload.exp < now - clockSkewSec) {
    return { ok: false };
  }
  return { ok: true, serviceId: payload.svc, userId: payload.sub };
}
