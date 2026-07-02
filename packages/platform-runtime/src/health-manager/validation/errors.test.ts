import { describe, expect, it } from "vitest";

import { healthError } from "./errors";

describe("healthError", () => {
  it("creates structured health errors", () => {
    const error = healthError("HEALTH_PROVIDER_NOT_FOUND", "missing provider", {
      providerId: "custom",
      metadata: { reason: "test" },
    });

    expect(error.code).toBe("HEALTH_PROVIDER_NOT_FOUND");
    expect(error.providerId).toBe("custom");
    expect(error.metadata?.reason).toBe("test");
  });
});
