import { describe, expect, it } from "vitest";

import {
  DEFAULT_PLANE_RETRY,
  DEFAULT_PLANE_SSL,
  normalizePlaneConfiguration,
  validatePlaneConfiguration,
} from "./plane-config";
import { DEFAULT_TEST_PLANE_CONFIG } from "./testing/mock-plane-api";

describe("Plane configuration validation", () => {
  it("accepts a valid configuration", () => {
    const result = validatePlaneConfiguration(DEFAULT_TEST_PLANE_CONFIG);

    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects missing and invalid fields", () => {
    const result = validatePlaneConfiguration({
      baseUrl: "",
      apiBaseUrl: "not-a-url",
      apiTokenRef: "",
      workspaceSlug: "",
      timeoutMs: 0,
      retry: { maxAttempts: 0, baseDelayMs: 500, maxDelayMs: 100 },
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContain("baseUrl is required");
    expect(result.issues).toContain("apiBaseUrl must be a valid HTTP(S) URL");
    expect(result.issues).toContain("apiTokenRef is required");
    expect(result.issues).toContain("workspaceSlug is required");
    expect(result.issues).toContain("timeoutMs must be greater than zero");
    expect(result.issues).toContain("retry.maxAttempts must be at least 1");
    expect(result.issues).toContain(
      "retry.maxDelayMs must be greater than or equal to baseDelayMs",
    );
  });

  it("normalises trailing slashes and applies defaults", () => {
    const normalized = normalizePlaneConfiguration({
      baseUrl: "https://plane.example.com/",
      apiBaseUrl: "https://plane.example.com/api/",
      apiTokenRef: "plane/token",
      workspaceSlug: "apzhub",
    });

    expect(normalized.baseUrl).toBe("https://plane.example.com");
    expect(normalized.apiBaseUrl).toBe("https://plane.example.com/api");
    expect(normalized.timeoutMs).toBe(30_000);
    expect(normalized.retry).toEqual(DEFAULT_PLANE_RETRY);
    expect(normalized.ssl).toEqual(DEFAULT_PLANE_SSL);
  });
});
