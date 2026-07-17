/** Strongly typed n8n adapter configuration — adapter-internal. */

export type N8nAuthMode =
  | "api_key"
  | "personal_access_token"
  | "basic"
  | "oauth";

export interface N8nRetryConfiguration {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
}

export interface N8nSslOptions {
  readonly rejectUnauthorized: boolean;
}

/** Placeholder for future OAuth — not implemented in APZWORKFLOW-006. */
export interface N8nOAuthConfigurationPlaceholder {
  readonly enabled: boolean;
  readonly clientIdRef?: string;
  readonly clientSecretRef?: string;
  readonly tokenUrl?: string;
  readonly scopes?: readonly string[];
}

export interface N8nConfiguration {
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly authMode: N8nAuthMode;
  /** Secret ref for API key / personal access token material. */
  readonly apiKeyRef?: string;
  readonly personalAccessTokenRef?: string;
  /** Secret refs for HTTP Basic (username + password). */
  readonly basicUsernameRef?: string;
  readonly basicPasswordRef?: string;
  readonly oauth: N8nOAuthConfigurationPlaceholder;
  readonly timeoutMs: number;
  readonly retry: N8nRetryConfiguration;
  readonly ssl: N8nSslOptions;
  readonly defaultHeaders: Readonly<Record<string, string>>;
}

export interface N8nConfigurationValidationResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export type N8nConfigurationInput = Partial<N8nConfiguration> & {
  readonly authMode?: N8nAuthMode;
};

export const DEFAULT_N8N_RETRY: N8nRetryConfiguration = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 5_000,
};

export const DEFAULT_N8N_SSL: N8nSslOptions = {
  rejectUnauthorized: true,
};

export const DEFAULT_N8N_OAUTH_PLACEHOLDER: N8nOAuthConfigurationPlaceholder = {
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

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function validateN8nConfiguration(
  config: Partial<N8nConfiguration>,
): N8nConfigurationValidationResult {
  const issues: string[] = [];
  const authMode = config.authMode ?? "api_key";

  if (config.baseUrl !== undefined && config.baseUrl.trim() && !isValidHttpUrl(config.baseUrl)) {
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
    if (config.retry.maxAttempts < 1) issues.push("retry.maxAttempts must be at least 1");
    if (config.retry.baseDelayMs < 0) issues.push("retry.baseDelayMs must be non-negative");
    if (config.retry.maxDelayMs < config.retry.baseDelayMs) {
      issues.push("retry.maxDelayMs must be greater than or equal to baseDelayMs");
    }
  }
  if (config.oauth?.enabled) {
    issues.push("OAuth is a placeholder only in APZWORKFLOW-006 — set oauth.enabled=false");
  }
  if (authMode === "oauth") {
    issues.push("authMode oauth is not implemented — use api_key, personal_access_token, or basic");
  }
  if (
    (authMode === "api_key" || authMode === "personal_access_token") &&
    !config.apiKeyRef &&
    !config.personalAccessTokenRef
  ) {
    issues.push(`${authMode} requires apiKeyRef or personalAccessTokenRef`);
  }
  if (authMode === "basic" && (!config.basicUsernameRef || !config.basicPasswordRef)) {
    issues.push("basic auth requires basicUsernameRef and basicPasswordRef");
  }

  return { ok: issues.length === 0, issues };
}

export function normalizeN8nConfiguration(
  input: N8nConfigurationInput,
): N8nConfiguration {
  const baseUrl = trimTrailingSlash(input.baseUrl?.trim() || "http://localhost:5678");
  const apiBaseUrl = trimTrailingSlash(
    input.apiBaseUrl?.trim() || `${baseUrl}/api/v1`,
  );
  const authMode = input.authMode ?? "api_key";

  return {
    baseUrl,
    apiBaseUrl,
    authMode,
    apiKeyRef: input.apiKeyRef,
    personalAccessTokenRef: input.personalAccessTokenRef ?? input.apiKeyRef,
    basicUsernameRef: input.basicUsernameRef,
    basicPasswordRef: input.basicPasswordRef,
    oauth: {
      ...DEFAULT_N8N_OAUTH_PLACEHOLDER,
      ...input.oauth,
      enabled: input.oauth?.enabled ?? false,
    },
    timeoutMs: input.timeoutMs ?? 15_000,
    retry: { ...DEFAULT_N8N_RETRY, ...input.retry },
    ssl: { ...DEFAULT_N8N_SSL, ...input.ssl },
    defaultHeaders: { ...(input.defaultHeaders ?? {}) },
  };
}
