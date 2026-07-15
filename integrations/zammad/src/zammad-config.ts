/** Strongly typed Zammad adapter configuration — adapter-internal, not platform env. */

export interface ZammadRetryConfiguration {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
}

export interface ZammadSslOptions {
  readonly rejectUnauthorized: boolean;
}

/** Placeholder for future OAuth — not implemented in OSS-102-02. */
export interface ZammadOAuthConfigurationPlaceholder {
  readonly enabled: boolean;
  readonly clientIdRef?: string;
  readonly clientSecretRef?: string;
  readonly tokenUrl?: string;
  readonly scopes?: readonly string[];
}

export interface ZammadConfiguration {
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly apiTokenRef: string;
  readonly timeoutMs: number;
  readonly retry: ZammadRetryConfiguration;
  readonly ssl: ZammadSslOptions;
  readonly defaultHeaders: Readonly<Record<string, string>>;
  readonly oauth: ZammadOAuthConfigurationPlaceholder;
}

export interface ZammadConfigurationValidationResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export type ZammadConfigurationInput = Partial<ZammadConfiguration> &
  Pick<ZammadConfiguration, "baseUrl" | "apiBaseUrl" | "apiTokenRef">;

export const DEFAULT_ZAMMAD_RETRY: ZammadRetryConfiguration = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 5_000,
};

export const DEFAULT_ZAMMAD_SSL: ZammadSslOptions = {
  rejectUnauthorized: true,
};

export const DEFAULT_ZAMMAD_OAUTH_PLACEHOLDER: ZammadOAuthConfigurationPlaceholder = {
  enabled: false,
};

export function validateZammadConfiguration(
  config: Partial<ZammadConfiguration>,
): ZammadConfigurationValidationResult {
  const issues: string[] = [];

  if (!config.baseUrl?.trim()) {
    issues.push("baseUrl is required");
  } else if (!isValidHttpUrl(config.baseUrl)) {
    issues.push("baseUrl must be a valid HTTP(S) URL");
  }

  if (!config.apiBaseUrl?.trim()) {
    issues.push("apiBaseUrl is required");
  } else if (!isValidHttpUrl(config.apiBaseUrl)) {
    issues.push("apiBaseUrl must be a valid HTTP(S) URL");
  }

  if (!config.apiTokenRef?.trim()) {
    issues.push("apiTokenRef is required");
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
    issues.push("OAuth is not implemented in OSS-102-02 — set oauth.enabled to false");
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

export function normalizeZammadConfiguration(
  input: ZammadConfigurationInput,
): ZammadConfiguration {
  return {
    baseUrl: input.baseUrl.replace(/\/+$/, ""),
    apiBaseUrl: input.apiBaseUrl.replace(/\/+$/, ""),
    apiTokenRef: input.apiTokenRef,
    timeoutMs: input.timeoutMs ?? 30_000,
    retry: input.retry ?? DEFAULT_ZAMMAD_RETRY,
    ssl: input.ssl ?? DEFAULT_ZAMMAD_SSL,
    defaultHeaders: input.defaultHeaders ?? {},
    oauth: input.oauth ?? DEFAULT_ZAMMAD_OAUTH_PLACEHOLDER,
  };
}
