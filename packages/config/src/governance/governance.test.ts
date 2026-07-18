import { afterEach, describe, expect, it, vi } from "vitest";

import { getDeprecatedVariableUsage } from "./deprecation";
import { PLATFORM_CONFIG_REGISTRY } from "./registry";
import { maskSecretValue } from "./secrets";
import { resolveValidationTier } from "./profiles";
import {
  ensureEnvironmentValid,
  getConfigurationDiagnostics,
  validatePlatformEnvironment,
} from "./validation";

const baseEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://apzhub:apzhub@localhost:54334/apzhub",
  REDIS_URL: "redis://localhost:6380",
  BETTER_AUTH_SECRET: "test-test-test-test-test-test-test-test",
  BETTER_AUTH_URL: "http://localhost:3300",
};

describe("platform configuration registry", () => {
  it("defines metadata for every required platform variable", () => {
    const keys = new Set(PLATFORM_CONFIG_REGISTRY.map((definition) => definition.key));
    expect(keys.has("DATABASE_URL")).toBe(true);
    expect(keys.has("BETTER_AUTH_SECRET")).toBe(true);
    expect(keys.has("LAW_REPOSITORY_MODE")).toBe(true);
    expect(keys.has("PLANE_INTEGRATION_ENABLED")).toBe(true);
    expect(keys.has("PLANE_API_TOKEN")).toBe(true);

    for (const definition of PLATFORM_CONFIG_REGISTRY) {
      expect(definition.description.length).toBeGreaterThan(0);
      expect(definition.owner.length).toBeGreaterThan(0);
    }
  });
});

describe("secret masking", () => {
  it("masks secrets and connection strings", () => {
    expect(maskSecretValue("short")).toBe("****");
    expect(maskSecretValue("abcdefghijklmnopqrstuvwxyz", "secret")).toContain("*");
    expect(
      maskSecretValue(
        "postgresql://apzhub:secret@localhost:5432/db",
        "connection-string",
      ),
    ).not.toContain("secret");
  });
});

describe("validatePlatformEnvironment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("passes with a valid test profile", () => {
    const result = validatePlatformEnvironment({ env: baseEnv, tier: "strict" });
    expect(result.valid).toBe(true);
    expect(result.profile).toBe("test");
    expect(result.tier).toBe("strict");
  });

  it("fails in strict mode when required secrets are missing", () => {
    const result = validatePlatformEnvironment({
      env: { NODE_ENV: "production" },
      tier: "strict",
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.severity === "fail")).toBe(true);
  });

  it("warns instead of failing in permissive development mode", () => {
    const result = validatePlatformEnvironment({
      env: { NODE_ENV: "development" },
      tier: "permissive",
    });
    expect(result.tier).toBe("permissive");
    expect(result.issues.some((issue) => issue.severity === "warn")).toBe(true);
    expect(result.issues.some((issue) => issue.severity === "fail")).toBe(false);
  });

  it("detects deprecated variable usage", () => {
    const deprecated = getDeprecatedVariableUsage({
      AUTH_SECRET: "legacy-secret-value-thirty-two-characters",
    });
    expect(deprecated.some((entry) => entry.alias === "AUTH_SECRET")).toBe(true);
  });
});

describe("getConfigurationDiagnostics", () => {
  it("reports configuration health and secret status without exposing raw secrets", () => {
    const diagnostics = getConfigurationDiagnostics({ env: baseEnv });
    expect(diagnostics.healthy).toBe(true);
    expect(
      diagnostics.secrets.every(
        (secret) => !secret.maskedPreview?.includes("test-test"),
      ),
    ).toBe(true);
    expect(diagnostics.vault.provider).toBe("environment");
  });

  it("lists default usage for variables without explicit env values", () => {
    const diagnostics = getConfigurationDiagnostics({ env: baseEnv });
    expect(diagnostics.defaultUsage).toContain("PORT");
  });
});

describe("ensureEnvironmentValid", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not abort the process in development when abortProcess is false", () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    ensureEnvironmentValid({
      env: { NODE_ENV: "development" },
      abortProcess: false,
    });
    expect(exitSpy).not.toHaveBeenCalled();
    exitSpy.mockRestore();
  });

  it("uses strict tier for production profile", () => {
    expect(resolveValidationTier("production")).toBe("strict");
    expect(resolveValidationTier("development")).toBe("permissive");
  });
});
