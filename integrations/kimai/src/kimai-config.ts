/** Strongly typed Kimai adapter configuration — adapter-internal. */

/**
 * Primary auth is Bearer API token (Kimai CE modern path).
 * `legacy_headers` supports deprecated X-AUTH-USER / X-AUTH-TOKEN for older CE installs.
 */
export type KimaiAuthMode = "bearer" | "legacy_headers";

export interface KimaiRetryConfiguration {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
}

export interface KimaiSslOptions {
  readonly rejectUnauthorized: boolean;
}

export interface KimaiConfiguration {
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly authMode: KimaiAuthMode;
  /** Secret ref for Bearer API token (preferred). */
  readonly apiTokenRef?: string;
  /** Secret refs for deprecated X-AUTH-USER / X-AUTH-TOKEN. */
  readonly apiUserRef?: string;
  readonly apiPasswordRef?: string;
  readonly timeoutMs: number;
  readonly retry: KimaiRetryConfiguration;
  readonly ssl: KimaiSslOptions;
  readonly defaultHeaders: Readonly<Record<string, string>>;
  /** Declared CE version range for compatibility checks. */
  readonly versionMin: string;
  readonly versionMax: string;
}

export interface KimaiConfigurationValidationResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export type KimaiConfigurationInput = Partial<KimaiConfiguration> & {
  readonly authMode?: KimaiAuthMode;
};

export const DEFAULT_KIMAI_RETRY: KimaiRetryConfiguration = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 5_000,
};

export const DEFAULT_KIMAI_SSL: KimaiSslOptions = {
  rejectUnauthorized: true,
};

/** Bearer token auth available from Kimai 2.13+; foundation targets CE 2.x. */
export const DEFAULT_KIMAI_VERSION_MIN = "2.13.0";
export const DEFAULT_KIMAI_VERSION_MAX = "2.99.99";

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

export function validateKimaiConfiguration(
  config: Partial<KimaiConfiguration>,
): KimaiConfigurationValidationResult {
  const issues: string[] = [];
  const authMode = config.authMode ?? "bearer";

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
  if (authMode === "bearer" && !config.apiTokenRef) {
    issues.push("bearer auth requires apiTokenRef");
  }
  if (authMode === "legacy_headers" && (!config.apiUserRef || !config.apiPasswordRef)) {
    issues.push("legacy_headers auth requires apiUserRef and apiPasswordRef");
  }

  return { ok: issues.length === 0, issues };
}

export function normalizeKimaiConfiguration(
  input: KimaiConfigurationInput,
): KimaiConfiguration {
  const baseUrl = trimTrailingSlash(input.baseUrl?.trim() || "http://localhost:8001");
  const apiBaseUrl = trimTrailingSlash(input.apiBaseUrl?.trim() || `${baseUrl}/api`);
  const authMode = input.authMode ?? "bearer";

  return {
    baseUrl,
    apiBaseUrl,
    authMode,
    apiTokenRef: input.apiTokenRef,
    apiUserRef: input.apiUserRef,
    apiPasswordRef: input.apiPasswordRef,
    timeoutMs: input.timeoutMs ?? 15_000,
    retry: { ...DEFAULT_KIMAI_RETRY, ...input.retry },
    ssl: { ...DEFAULT_KIMAI_SSL, ...input.ssl },
    defaultHeaders: { ...(input.defaultHeaders ?? {}) },
    versionMin: input.versionMin ?? DEFAULT_KIMAI_VERSION_MIN,
    versionMax: input.versionMax ?? DEFAULT_KIMAI_VERSION_MAX,
  };
}
