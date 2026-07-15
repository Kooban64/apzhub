import { describe, expect, it } from "vitest";

import {
  LAW_API_ENDPOINT_SAMPLES,
  PLATFORM_API_ENDPOINT_SAMPLES,
  shouldApplyLawTrafficGovernance,
  shouldApplyTrafficGovernance,
} from "@apzhub/platform-security/traffic";

describe("platform traffic governance compliance", () => {
  it("routes platform APIs through shared middleware coverage", () => {
    for (const endpoint of PLATFORM_API_ENDPOINT_SAMPLES) {
      expect(shouldApplyTrafficGovernance(endpoint)).toBe(true);
    }
  });

  it("routes law APIs through shared law traffic governance", () => {
    for (const endpoint of LAW_API_ENDPOINT_SAMPLES) {
      expect(shouldApplyLawTrafficGovernance(endpoint)).toBe(true);
    }
  });

  it("does not require products to define duplicate traffic policies", () => {
    expect(shouldApplyTrafficGovernance("/workspace/home")).toBe(false);
    expect(shouldApplyLawTrafficGovernance("/login")).toBe(false);
  });
});
