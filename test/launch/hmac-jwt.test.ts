import { afterEach, describe, expect, it, vi } from "vitest";

import { signLaunchJwt, verifyLaunchJwt } from "@/lib/launch/jwt/hmac-jwt";

const baseOpts = (aud: string) => ({
  expectedIssuer: "apzhub",
  expectedAudience: aud,
  clockSkewSec: 60,
});

describe("launch HMAC JWT", () => {
  const secret = "a".repeat(32);
  const aud = "apzhub-internal-services:workspace-service:mail";

  afterEach(() => {
    vi.useRealTimers();
  });

  it("round-trips sub, service, jti, exp with iss/aud checks", () => {
    const token = signLaunchJwt({
      secret,
      sub: "user-1",
      serviceId: "mail",
      ttlSec: 3600,
      issuer: "apzhub",
      audience: aud,
    });
    const v = verifyLaunchJwt(token, secret, baseOpts(aud));
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.sub).toBe("user-1");
      expect(v.serviceId).toBe("mail");
      expect(v.jti).toMatch(/^[0-9a-f-]{36}$/i);
      expect(v.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    }
  });

  it("includes sid when authSessionId provided", () => {
    const token = signLaunchJwt({
      secret,
      sub: "u",
      serviceId: "drive",
      ttlSec: 3600,
      issuer: "apzhub",
      audience: "apzhub-internal-services:workspace-service:drive",
      authSessionId: "550e8400-e29b-41d4-a716-446655440000",
    });
    const v = verifyLaunchJwt(token, secret, {
      expectedIssuer: "apzhub",
      expectedAudience: "apzhub-internal-services:workspace-service:drive",
    });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.sid).toBe("550e8400-e29b-41d4-a716-446655440000");
    }
  });

  it("rejects wrong issuer or audience", () => {
    const token = signLaunchJwt({
      secret,
      sub: "u",
      serviceId: "mail",
      ttlSec: 3600,
      issuer: "apzhub",
      audience: aud,
    });
    expect(verifyLaunchJwt(token, secret, { ...baseOpts(aud), expectedIssuer: "evil" }).ok).toBe(false);
    expect(
      verifyLaunchJwt(token, secret, {
        expectedIssuer: "apzhub",
        expectedAudience: "apzhub-internal-services:workspace-service:drive",
      }).ok,
    ).toBe(false);
  });

  it("rejects tampered signature", () => {
    const token = signLaunchJwt({
      secret,
      sub: "u",
      serviceId: "drive",
      ttlSec: 3600,
      issuer: "apzhub",
      audience: "apzhub-internal-services:workspace-service:drive",
    });
    const parts = token.split(".");
    parts[2] = "xxxx";
    expect(verifyLaunchJwt(parts.join("."), secret, baseOpts("apzhub-internal-services:workspace-service:drive")).ok).toBe(
      false,
    );
  });

  it("rejects wrong secret", () => {
    const token = signLaunchJwt({
      secret,
      sub: "u",
      serviceId: "chat",
      ttlSec: 3600,
      issuer: "apzhub",
      audience: "apzhub-internal-services:workspace-service:chat",
    });
    expect(
      verifyLaunchJwt(token, "b".repeat(32), {
        expectedIssuer: "apzhub",
        expectedAudience: "apzhub-internal-services:workspace-service:chat",
      }).ok,
    ).toBe(false);
  });

  it("allows exp within clock skew after real expiry", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T12:00:00Z"));
    const token = signLaunchJwt({
      secret,
      sub: "u",
      serviceId: "mail",
      ttlSec: 120,
      issuer: "apzhub",
      audience: aud,
    });
    vi.setSystemTime(new Date("2024-06-01T12:02:40Z"));
    expect(verifyLaunchJwt(token, secret, { expectedIssuer: "apzhub", expectedAudience: aud, clockSkewSec: 60 }).ok).toBe(
      true,
    );
    vi.setSystemTime(new Date("2024-06-01T12:05:00Z"));
    expect(verifyLaunchJwt(token, secret, { expectedIssuer: "apzhub", expectedAudience: aud, clockSkewSec: 60 }).ok).toBe(
      false,
    );
  });
});
