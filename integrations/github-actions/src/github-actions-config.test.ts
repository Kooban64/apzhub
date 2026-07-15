import { describe, expect, it } from "vitest";

import {
  DEFAULT_GITHUB_ACTIONS_OAUTH_PLACEHOLDER,
  DEFAULT_GITHUB_ACTIONS_RETRY,
  DEFAULT_GITHUB_ACTIONS_SSL,
  GITHUB_ACTIONS_API_VERSION,
  normalizeGitHubActionsConfiguration,
  validateGitHubActionsConfiguration,
} from "./github-actions-config";
import { DEFAULT_TEST_GITHUB_ACTIONS_CONFIG } from "./testing/mock-github-actions-api";

describe("GitHub Actions configuration", () => {
  it("accepts a valid PAT configuration", () => {
    const result = validateGitHubActionsConfiguration(
      DEFAULT_TEST_GITHUB_ACTIONS_CONFIG,
    );
    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects invalid fields and enabled oauth", () => {
    const result = validateGitHubActionsConfiguration({
      baseUrl: "not-a-url",
      apiBaseUrl: "also-bad",
      timeoutMs: 0,
      retry: { maxAttempts: 0, baseDelayMs: 10, maxDelayMs: 5 },
      oauth: { enabled: true },
      authMode: "personal_access_token",
      personalAccessTokenRef: "",
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContain("baseUrl must be a valid HTTP(S) URL");
    expect(result.issues).toContain("apiBaseUrl must be a valid HTTP(S) URL");
    expect(result.issues).toContain("timeoutMs must be greater than zero");
    expect(result.issues).toContain("retry.maxAttempts must be at least 1");
    expect(result.issues).toContain(
      "retry.maxDelayMs must be greater than or equal to baseDelayMs",
    );
    expect(result.issues).toContain(
      "OAuth is not implemented in APZTCMS-016 — set oauth.enabled to false",
    );
    expect(result.issues).toContain(
      "personalAccessTokenRef is required for personal_access_token authMode",
    );
  });

  it("validates github_app placeholder shape", () => {
    const missing = validateGitHubActionsConfiguration({
      authMode: "github_app",
      githubApp: {},
    });
    expect(missing.ok).toBe(false);
    expect(missing.issues.some((i) => i.includes("appIdRef"))).toBe(true);

    const ok = validateGitHubActionsConfiguration({
      authMode: "github_app",
      githubApp: {
        appIdRef: "app/id",
        installationIdRef: "app/install",
        privateKeyRef: "app/key",
      },
    });
    expect(ok.ok).toBe(true);
  });

  it("rejects oauth authMode", () => {
    const result = validateGitHubActionsConfiguration({
      authMode: "oauth",
      oauth: { enabled: false },
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.includes("oauth"))).toBe(true);
  });

  it("normalises defaults", () => {
    const normalized = normalizeGitHubActionsConfiguration({
      personalAccessTokenRef: "github/pat",
      apiBaseUrl: "https://api.github.com/",
      baseUrl: "https://github.com/",
    });

    expect(normalized.apiBaseUrl).toBe("https://api.github.com");
    expect(normalized.baseUrl).toBe("https://github.com");
    expect(normalized.authMode).toBe("personal_access_token");
    expect(normalized.timeoutMs).toBe(30_000);
    expect(normalized.retry).toEqual(DEFAULT_GITHUB_ACTIONS_RETRY);
    expect(normalized.ssl).toEqual(DEFAULT_GITHUB_ACTIONS_SSL);
    expect(normalized.oauth).toEqual(DEFAULT_GITHUB_ACTIONS_OAUTH_PLACEHOLDER);
    expect(normalized.apiVersion).toBe(GITHUB_ACTIONS_API_VERSION);
  });
});
