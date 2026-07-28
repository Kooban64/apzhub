/** Strongly typed Metabase adapter configuration — adapter-internal. */

export type MetabaseAuthMode = "api_key" | "session";

export interface MetabaseRetryConfiguration {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
}

export interface MetabaseSslOptions {
  readonly rejectUnauthorized: boolean;
}

export interface MetabaseConfiguration {
  readonly baseUrl: string;
  /** Typically `{baseUrl}/api`. */
  readonly apiBaseUrl: string;
  readonly authMode: MetabaseAuthMode;
  /** Secret ref for Metabase API key (X-Api-Key). */
  readonly apiKeyRef?: string;
  /** Secret refs for session auth (POST /api/session). */
  readonly usernameRef?: string;
  readonly passwordRef?: string;
  readonly timeoutMs: number;
  readonly retry: MetabaseRetryConfiguration;
  readonly ssl: MetabaseSslOptions;
  readonly defaultHeaders: Readonly<Record<string, string>>;
}

export interface MetabaseConfigurationValidationResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export type MetabaseConfigurationInput = Partial<MetabaseConfiguration> & {
  readonly authMode?: MetabaseAuthMode;
};

export const DEFAULT_METABASE_RETRY: MetabaseRetryConfiguration = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 5_000,
};

export const DEFAULT_METABASE_SSL: MetabaseSslOptions = {
  rejectUnauthorized: true,
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

export function validateMetabaseConfiguration(
  config: Partial<MetabaseConfiguration>,
): MetabaseConfigurationValidationResult {
  const issues: string[] = [];
  const authMode = config.authMode ?? "api_key";

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
  if (authMode === "api_key" && !config.apiKeyRef) {
    issues.push("api_key auth requires apiKeyRef");
  }
  if (authMode === "session" && (!config.usernameRef || !config.passwordRef)) {
    issues.push("session auth requires usernameRef and passwordRef");
  }

  return { ok: issues.length === 0, issues };
}

export function normalizeMetabaseConfiguration(
  input: MetabaseConfigurationInput,
): MetabaseConfiguration {
  const baseUrl = trimTrailingSlash(input.baseUrl?.trim() || "http://localhost:3000");
  const apiBaseUrl = trimTrailingSlash(input.apiBaseUrl?.trim() || `${baseUrl}/api`);
  const authMode = input.authMode ?? "api_key";

  return {
    baseUrl,
    apiBaseUrl,
    authMode,
    apiKeyRef: input.apiKeyRef,
    usernameRef: input.usernameRef,
    passwordRef: input.passwordRef,
    timeoutMs: input.timeoutMs ?? 15_000,
    retry: { ...DEFAULT_METABASE_RETRY, ...input.retry },
    ssl: { ...DEFAULT_METABASE_SSL, ...input.ssl },
    defaultHeaders: { ...(input.defaultHeaders ?? {}) },
  };
}
