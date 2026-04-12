import "server-only";

import {
  getLaunchJwtAudience,
  getLaunchJwtIssuer,
  getLaunchJwtSigningSecret,
  getLaunchJwtTtlSeconds,
} from "@/lib/adapters/env";
import { signLaunchJwt, verifyLaunchJwt } from "@/lib/launch/jwt/hmac-jwt";

/** Audience suffix for short-lived tokens gateways verify before injecting trusted headers (e.g. Paperless). */
export function getFirstPartyEdgeJwtAudience(): string {
  return `${getLaunchJwtAudience()}:first-party-edge`;
}

export function signFirstPartyEdgeJwt(input: { subjectEmail: string }): string | null {
  const secret = getLaunchJwtSigningSecret();
  if (!secret) {
    return null;
  }
  return signLaunchJwt({
    secret,
    sub: input.subjectEmail,
    serviceId: "edge",
    ttlSec: Math.min(getLaunchJwtTtlSeconds(), 300),
    issuer: getLaunchJwtIssuer(),
    audience: getFirstPartyEdgeJwtAudience(),
  });
}

export function verifyFirstPartyEdgeJwt(token: string) {
  const secret = getLaunchJwtSigningSecret();
  if (!secret) {
    return { ok: false as const };
  }
  return verifyLaunchJwt(token, secret, {
    expectedIssuer: getLaunchJwtIssuer(),
    expectedAudience: getFirstPartyEdgeJwtAudience(),
  });
}
