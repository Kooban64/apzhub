/** Strongly typed GitLab CI adapter configuration — adapter-internal. */

export type GitLabCiAuthMode = "personal_access_token" | "oauth";

export interface GitLabCiRetryConfiguration {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
}

export interface GitLabCiSslOptions {
  readonly rejectUnauthorized: boolean;
}

export interface GitLabCiOAuthConfigurationPlaceholder {
  readonly enabled: boolean;
  readonly clientIdRef?: string;
  readonly clientSecretRef?: string;
  readonly tokenUrl?: string;
  readonly scopes?: readonly string[];
}

export interface GitLabCiConfiguration {
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly authMode: GitLabCiAuthMode;
  readonly personalAccessTokenRef?: string;
  readonly oauth: GitLabCiOAuthConfigurationPlaceholder;
  /** Optional default project path (group/project). */
  readonly projectPath?: string;
  /** Optional numeric project id. */
  readonly projectId?: string;
  readonly timeoutMs: number;
  readonly retry: GitLabCiRetryConfiguration;
  readonly ssl: GitLabCiSslOptions;
  readonly defaultHeaders: Readonly<Record<string, string>>;
  readonly apiVersion: string;
}

export interface GitLabCiConfigurationValidationResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export type GitLabCiConfigurationInput = Partial<GitLabCiConfiguration> & {
  readonly authMode?: GitLabCiAuthMode;
  readonly personalAccessTokenRef?: string;
};

export const GITLAB_CI_API_VERSION = "v4";

export const DEFAULT_GITLAB_CI_API_BASE_URL = "https://gitlab.com/api/v4";
export const DEFAULT_GITLAB_CI_BASE_URL = "https://gitlab.com";

export const DEFAULT_GITLAB_CI_RETRY: GitLabCiRetryConfiguration = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 5_000,
};

export const DEFAULT_GITLAB_CI_SSL: GitLabCiSslOptions = {
  rejectUnauthorized: true,
};

export const DEFAULT_GITLAB_CI_OAUTH_PLACEHOLDER: GitLabCiOAuthConfigurationPlaceholder =
  {
    enabled: false,
  };

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateGitLabCiConfiguration(
  config: Partial<GitLabCiConfiguration>,
): GitLabCiConfigurationValidationResult {
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
  if (authMode === "personal_access_token" && !config.personalAccessTokenRef?.trim()) {
    issues.push("personalAccessTokenRef is required for personal_access_token auth");
  }
  if (config.timeoutMs !== undefined && config.timeoutMs < 1) {
    issues.push("timeoutMs must be >= 1");
  }

  return { ok: issues.length === 0, issues };
}

export function normalizeGitLabCiConfiguration(
  input: GitLabCiConfigurationInput = {},
): GitLabCiConfiguration {
  return {
    baseUrl: input.baseUrl?.trim() || DEFAULT_GITLAB_CI_BASE_URL,
    apiBaseUrl: input.apiBaseUrl?.trim() || DEFAULT_GITLAB_CI_API_BASE_URL,
    authMode: input.authMode ?? "personal_access_token",
    personalAccessTokenRef: input.personalAccessTokenRef?.trim() || "gitlab-ci/pat",
    oauth: {
      ...DEFAULT_GITLAB_CI_OAUTH_PLACEHOLDER,
      ...input.oauth,
    },
    projectPath: input.projectPath?.trim() || undefined,
    projectId: input.projectId?.trim() || undefined,
    timeoutMs: input.timeoutMs ?? 30_000,
    retry: {
      ...DEFAULT_GITLAB_CI_RETRY,
      ...input.retry,
    },
    ssl: {
      ...DEFAULT_GITLAB_CI_SSL,
      ...input.ssl,
    },
    defaultHeaders: input.defaultHeaders ?? {},
    apiVersion: input.apiVersion ?? GITLAB_CI_API_VERSION,
  };
}
