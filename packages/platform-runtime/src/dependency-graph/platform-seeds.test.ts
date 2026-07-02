import { describe, expect, it } from "vitest";

import { isPlatformSeedCapability, PLATFORM_SEED_CAPABILITIES } from "./platform-seeds";

describe("platform seeds", () => {
  it("exports known platform seed ids", () => {
    expect(PLATFORM_SEED_CAPABILITIES).toContain("identity");
    expect(PLATFORM_SEED_CAPABILITIES).toContain("config");
    expect(PLATFORM_SEED_CAPABILITIES).toContain("theme");
  });

  it("identifies platform seed capabilities", () => {
    expect(isPlatformSeedCapability("identity")).toBe(true);
    expect(isPlatformSeedCapability("unknown-capability")).toBe(false);
  });
});
