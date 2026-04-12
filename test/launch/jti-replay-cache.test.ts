import { describe, expect, it } from "vitest";

import { consumeLaunchJtiOnce, resetLaunchJtiReplayCacheForTests } from "@/lib/launch/jwt/jti-replay-cache";

describe("launch jti replay cache", () => {
  it("allows first use and rejects replay", () => {
    resetLaunchJtiReplayCacheForTests();
    const exp = Math.floor(Date.now() / 1000) + 300;
    expect(consumeLaunchJtiOnce("jti-1", exp)).toBe(true);
    expect(consumeLaunchJtiOnce("jti-1", exp)).toBe(false);
  });
});
