import { describe, expect, it } from "vitest";

import {
  DEFAULT_ZAMMAD_OAUTH_PLACEHOLDER,
  DEFAULT_ZAMMAD_RETRY,
  DEFAULT_ZAMMAD_SSL,
  normalizeZammadConfiguration,
  validateZammadConfiguration,
} from "./zammad-config";
import { DEFAULT_TEST_ZAMMAD_CONFIG } from "./testing/mock-zammad-api";

describe("Zammad configuration validation", () => {
  it("accepts a valid configuration", () => {
    const result = validateZammadConfiguration(DEFAULT_TEST_ZAMMAD_CONFIG);

    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects missing and invalid fields", () => {
    const result = validateZammadConfiguration({
      baseUrl: "",
      apiBaseUrl: "not-a-url",
      apiTokenRef: "",
      timeoutMs: 0,
      retry: { maxAttempts: 0, baseDelayMs: 500, maxDelayMs: 100 },
      oauth: { enabled: true },
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContain("baseUrl is required");
    expect(result.issues).toContain("apiBaseUrl must be a valid HTTP(S) URL");
    expect(result.issues).toContain("apiTokenRef is required");
    expect(result.issues).toContain("timeoutMs must be greater than zero");
    expect(result.issues).toContain("retry.maxAttempts must be at least 1");
    expect(result.issues).toContain(
      "retry.maxDelayMs must be greater than or equal to baseDelayMs",
    );
    expect(result.issues).toContain(
      "OAuth is not implemented in OSS-102-02 — set oauth.enabled to false",
    );
  });

  it("normalises trailing slashes and applies defaults", () => {
    const normalized = normalizeZammadConfiguration({
      baseUrl: "https://zammad.example.com/",
      apiBaseUrl: "https://zammad.example.com/",
      apiTokenRef: "zammad/token",
    });

    expect(normalized.baseUrl).toBe("https://zammad.example.com");
    expect(normalized.apiBaseUrl).toBe("https://zammad.example.com");
    expect(normalized.timeoutMs).toBe(30_000);
    expect(normalized.retry).toEqual(DEFAULT_ZAMMAD_RETRY);
    expect(normalized.ssl).toEqual(DEFAULT_ZAMMAD_SSL);
    expect(normalized.oauth).toEqual(DEFAULT_ZAMMAD_OAUTH_PLACEHOLDER);
    expect(normalized.defaultHeaders).toEqual({});
  });
});
