/** @vitest-environment node */
import { afterEach, describe, expect, it, vi } from "vitest";

import { signFirstPartyEdgeJwt, verifyFirstPartyEdgeJwt } from "@/lib/edge/first-party-edge-jwt";

describe("first-party edge JWT", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips subject email when signing secret is configured", () => {
    vi.stubEnv("APZHUB_LAUNCH_JWT_SIGNING_SECRET", "k".repeat(32));
    const token = signFirstPartyEdgeJwt({ subjectEmail: "user@example.com" });
    expect(token).toBeTruthy();
    const v = verifyFirstPartyEdgeJwt(token!);
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.sub).toBe("user@example.com");
    }
  });

  it("returns null when secret missing", () => {
    vi.stubEnv("APZHUB_LAUNCH_JWT_SIGNING_SECRET", "");
    expect(signFirstPartyEdgeJwt({ subjectEmail: "user@example.com" })).toBeNull();
  });
});
