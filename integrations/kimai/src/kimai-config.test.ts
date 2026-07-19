import { describe, expect, it } from "vitest";

import {
  normalizeKimaiConfiguration,
  validateKimaiConfiguration,
  DEFAULT_KIMAI_VERSION_MIN,
} from "./kimai-config";

describe("kimai-config", () => {
  it("normalizes base and api URLs without trailing slashes", () => {
    const config = normalizeKimaiConfiguration({
      baseUrl: "https://kimai.example.test/",
      apiTokenRef: "secret://kimai/token",
    });
    expect(config.baseUrl).toBe("https://kimai.example.test");
    expect(config.apiBaseUrl).toBe("https://kimai.example.test/api");
    expect(config.authMode).toBe("bearer");
    expect(config.versionMin).toBe(DEFAULT_KIMAI_VERSION_MIN);
  });

  it("requires apiTokenRef for bearer auth", () => {
    const result = validateKimaiConfiguration({
      authMode: "bearer",
      baseUrl: "https://kimai.example.test",
    });
    expect(result.ok).toBe(false);
    expect(result.issues.join(" ")).toMatch(/apiTokenRef/);
  });

  it("requires user and password refs for legacy_headers", () => {
    const result = validateKimaiConfiguration({
      authMode: "legacy_headers",
      apiUserRef: "secret://user",
    });
    expect(result.ok).toBe(false);
    expect(result.issues.join(" ")).toMatch(/apiPasswordRef/);
  });

  it("rejects invalid timeout and retry bounds", () => {
    const result = validateKimaiConfiguration({
      authMode: "bearer",
      apiTokenRef: "secret://token",
      timeoutMs: 0,
      retry: { maxAttempts: 0, baseDelayMs: 10, maxDelayMs: 5 },
    });
    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(1);
  });
});
