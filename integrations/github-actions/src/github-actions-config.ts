/** Strongly typed GitHub Actions adapter configuration — adapter-internal. */

export type GitHubActionsAuthMode = "personal_access_token" | "github_app" | "oauth";

export interface GitHubActionsRetryConfiguration {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
}

export interface GitHubActionsSslOptions {
  readonly rejectUnauthorized: boolean;
}

/** Placeholder for future OAuth — not implemented in APZTCMS-016. */
export interface GitHubActionsOAuthConfigurationPlaceholder {
  readonly enabled: boolean;
  readonly clientIdRef?: string;
  readonly clientSecretRef?: string;
  readonly tokenUrl?: string;
  readonly scopes?: readonly string[];
}

/** Placeholder for GitHub App auth — config shape only in APZTCMS-016. */
export interface GitHubActionsAppConfigurationPlaceholder {
  readonly appIdRef?: string;
  readonly installationIdRef?: string;
  readonly privateKeyRef?: string;
}

export interface GitHubActionsConfiguration {
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly authMode: GitHubActionsAuthMode;
  readonly personalAccessTokenRef?: string;
  readonly githubApp: GitHubActionsAppConfigurationPlaceholder;
  readonly oauth: GitHubActionsOAuthConfigurationPlaceholder;
  /** Optional default repository owner for convenience. */
  readonly owner?: string;
  /** Optional default repository name for convenience. */
  readonly repo?: string;
  readonly timeoutMs: number;
  readonly retry: GitHubActionsRetryConfiguration;
  readonly ssl: GitHubActionsSslOptions;
  readonly defaultHeaders: Readonly<Record<string, string>>;
  /** GitHub REST API version header value. */
  readonly apiVersion: string;
}

export interface GitHubActionsConfigurationValidationResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export type GitHubActionsConfigurationInput = Partial<GitHubActionsConfiguration> & {
  readonly authMode?: GitHubActionsAuthMode;
  readonly personalAccessTokenRef?: string;
};

export const GITHUB_ACTIONS_API_VERSION = "2022-11-28";

export const DEFAULT_GITHUB_ACTIONS_API_BASE_URL = "https://api.github.com";
export const DEFAULT_GITHUB_ACTIONS_BASE_URL = "https://github.com";

export const DEFAULT_GITHUB_ACTIONS_RETRY: GitHubActionsRetryConfiguration = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 5_000,
};

export const DEFAULT_GITHUB_ACTIONS_SSL: GitHubActionsSslOptions = {
  rejectUnauthorized: true,
};

export const DEFAULT_GITHUB_ACTIONS_OAUTH_PLACEHOLDER: GitHubActionsOAuthConfigurationPlaceholder =
  {
    enabled: false,
  };

export const DEFAULT_GITHUB_ACTIONS_APP_PLACEHOLDER: GitHubActionsAppConfigurationPlaceholder =
  {};

export function validateGitHubActionsConfiguration(
  config: Partial<GitHubActionsConfiguration>,
): GitHubActionsConfigurationValidationResult {
  const issues: string[] = [];
  const authMode = config.authMode ?? "personal_access_token";

  if (
    config.baseUrl !== undefined &&
    config.baseUrl.trim() &&
    !isValidHttpUrl(config.baseUrl)
  ) {
    issues.push("baseUrl must be a valid HTTP(S) URL");
  }

  if (
    config.apiBaseUrl !== undefined &&
    config.apiBaseUrl.trim() &&
    !isValidHttpUrl(config.apiBaseUrl)
  ) {
    issues.push("apiBaseUrl must be a valid HTTP(S) URL");
  }

  if (config.timeoutMs !== undefined && config.timeoutMs <= 0) {
    issues.push("timeoutMs must be greater than zero");
  }

  if (config.retry) {
    if (config.retry.maxAttempts < 1) {
      issues.push("retry.maxAttempts must be at least 1");
    }
    if (config.retry.baseDelayMs < 0) {
      issues.push("retry.baseDelayMs must be non-negative");
    }
    if (config.retry.maxDelayMs < config.retry.baseDelayMs) {
      issues.push("retry.maxDelayMs must be greater than or equal to baseDelayMs");
    }
  }

  if (config.oauth?.enabled) {
    issues.push("OAuth is not implemented in APZTCMS-016 — set oauth.enabled to false");
  }

  if (authMode === "oauth") {
    issues.push(
      "authMode oauth is not implemented in APZTCMS-016 — use personal_access_token",
    );
  }

  if (authMode === "personal_access_token") {
    if (!config.personalAccessTokenRef?.trim()) {
      issues.push(
        "personalAccessTokenRef is required for personal_access_token authMode",
      );
    }
  }

  if (authMode === "github_app") {
    if (!config.githubApp?.appIdRef?.trim()) {
      issues.push("githubApp.appIdRef is required when authMode is github_app");
    }
    if (!config.githubApp?.installationIdRef?.trim()) {
      issues.push(
        "githubApp.installationIdRef is required when authMode is github_app",
      );
    }
    if (!config.githubApp?.privateKeyRef?.trim()) {
      issues.push("githubApp.privateKeyRef is required when authMode is github_app");
    }
  }

  return { ok: issues.length === 0, issues };
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeGitHubActionsConfiguration(
  input: GitHubActionsConfigurationInput,
): GitHubActionsConfiguration {
  const authMode = input.authMode ?? "personal_access_token";
  return {
    baseUrl: (input.baseUrl ?? DEFAULT_GITHUB_ACTIONS_BASE_URL).replace(/\/+$/, ""),
    apiBaseUrl: (input.apiBaseUrl ?? DEFAULT_GITHUB_ACTIONS_API_BASE_URL).replace(
      /\/+$/,
      "",
    ),
    authMode,
    personalAccessTokenRef: input.personalAccessTokenRef,
    githubApp: input.githubApp ?? DEFAULT_GITHUB_ACTIONS_APP_PLACEHOLDER,
    oauth: input.oauth ?? DEFAULT_GITHUB_ACTIONS_OAUTH_PLACEHOLDER,
    owner: input.owner,
    repo: input.repo,
    timeoutMs: input.timeoutMs ?? 30_000,
    retry: input.retry ?? DEFAULT_GITHUB_ACTIONS_RETRY,
    ssl: input.ssl ?? DEFAULT_GITHUB_ACTIONS_SSL,
    defaultHeaders: input.defaultHeaders ?? {},
    apiVersion: input.apiVersion ?? GITHUB_ACTIONS_API_VERSION,
  };
}
