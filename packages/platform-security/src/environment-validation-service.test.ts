import { afterEach, describe, expect, it, vi } from "vitest";

import { EnvironmentValidationService } from "./environment-validation-service";

const baseEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://apzhub:apzhub@localhost:54334/apzhub",
  REDIS_URL: "redis://localhost:6380",
  BETTER_AUTH_SECRET: "test-test-test-test-test-test-test-test",
  BETTER_AUTH_URL: "http://localhost:3300",
};

describe("EnvironmentValidationService", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("delegates to platform configuration governance", () => {
    for (const [key, value] of Object.entries(baseEnv)) {
      vi.stubEnv(key, value);
    }

    const service = new EnvironmentValidationService();
    const result = service.validateEnvironment();

    expect(result.tier).toBe("strict");
    expect(result.configuration.healthy).toBe(true);
    expect(result.configuration.secretStatus.length).toBeGreaterThan(0);
    expect(result.configuration.vault.provider).toBe("environment");
  });

  it("reports configuration issues when required variables are missing", () => {
    vi.stubEnv("NODE_ENV", "production");

    const service = new EnvironmentValidationService();
    const result = service.validateEnvironment();

    expect(result.valid).toBe(false);
    expect(result.configuration.missingVariables.length).toBeGreaterThan(0);
    expect(result.checks.some((check) => check.status === "fail")).toBe(true);
  });
});
