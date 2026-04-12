/** @vitest-environment node */
import { afterEach, describe, expect, it, vi } from "vitest";

import { signFirstPartyEdgeJwt, verifyFirstPartyEdgeJwt } from "@/lib/edge/first-party-edge-jwt";

describe("first-party edge SSO token (integration-style)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("mints and verifies JWT carrying subject email for gateway header injection", () => {
    vi.stubEnv("APZHUB_LAUNCH_JWT_SIGNING_SECRET", "s".repeat(32));
    const email = "pat@vendor.example.com";
    const token = signFirstPartyEdgeJwt({ subjectEmail: email });
    expect(token).toBeTruthy();
    const v = verifyFirstPartyEdgeJwt(token!);
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.sub).toBe(email);
    }
  });

  it("rejects tampered token", () => {
    vi.stubEnv("APZHUB_LAUNCH_JWT_SIGNING_SECRET", "t".repeat(32));
    const token = signFirstPartyEdgeJwt({ subjectEmail: "a@b.com" })!;
    const broken = `${token.slice(0, -4)}xxxx`;
    expect(verifyFirstPartyEdgeJwt(broken).ok).toBe(false);
  });
});
