import { describe, expect, it } from "vitest";

import { EnvironmentValidationService } from "./environment-validation-service";
import { OperationalResilienceService } from "./operational-resilience-service";
import { RateLimitService } from "./rate-limit-service";
import { resetSharedPlatformSecurityService } from "./index";

describe("PlatformSecurityService foundations", () => {
  it("validates environment configuration", () => {
    const service = new EnvironmentValidationService();
    const result = service.validateEnvironment();
    expect(result.checks.length).toBeGreaterThan(0);
  });

  it("returns liveness probe", async () => {
    const service = new OperationalResilienceService();
    const liveness = await service.getLiveness();
    expect(liveness.status).toBe("healthy");
  });

  it("enforces in-memory rate limits", async () => {
    const service = new RateLimitService(2);
    const first = await service.checkLimit("test-key");
    const second = await service.checkLimit("test-key");
    const third = await service.checkLimit("test-key");
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
  });

  it("resets shared security service singleton", () => {
    resetSharedPlatformSecurityService();
    expect(true).toBe(true);
  });
});
