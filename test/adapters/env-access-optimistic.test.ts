/** @vitest-environment node */
import { afterEach, describe, expect, it, vi } from "vitest";

import { getAccessOptimisticRealization } from "@/lib/adapters/env";

describe("getAccessOptimisticRealization", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is false by default", () => {
    expect(getAccessOptimisticRealization()).toBe(false);
  });

  it("is true when APZHUB_ACCESS_OPTIMISTIC_REALIZATION=true", () => {
    vi.stubEnv("APZHUB_ACCESS_OPTIMISTIC_REALIZATION", "true");
    expect(getAccessOptimisticRealization()).toBe(true);
  });
});
