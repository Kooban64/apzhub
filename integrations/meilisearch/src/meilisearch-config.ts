/** Strongly typed Meilisearch adapter configuration — secret refs only. */

export interface MeilisearchRetryConfiguration {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
}

export interface MeilisearchSslOptions {
  readonly rejectUnauthorized: boolean;
}

export interface MeilisearchConfiguration {
  /** Meilisearch HTTP base URL (e.g. http://127.0.0.1:7700). */
  readonly baseUrl: string;
  /** Secret reference for the Meilisearch API key — never plain text. */
  readonly apiKeyRef?: string;
  readonly timeoutMs: number;
  readonly retry: MeilisearchRetryConfiguration;
  readonly ssl: MeilisearchSslOptions;
  readonly defaultHeaders: Readonly<Record<string, string>>;
  /** Optional default index UID for convenience operations. */
  readonly defaultIndexUid?: string;
}

export interface MeilisearchConfigurationValidationResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
  readonly warnings?: readonly string[];
}

export type MeilisearchConfigurationInput = Partial<MeilisearchConfiguration> & {
  readonly baseUrl?: string;
  readonly apiKeyRef?: string;
};

export const DEFAULT_MEILISEARCH_BASE_URL = "http://127.0.0.1:7700";

export const DEFAULT_MEILISEARCH_RETRY: MeilisearchRetryConfiguration = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 5_000,
};

export const DEFAULT_MEILISEARCH_SSL: MeilisearchSslOptions = {
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

export function validateMeilisearchConfiguration(
  config: Partial<MeilisearchConfiguration>,
): MeilisearchConfigurationValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (
    config.baseUrl !== undefined &&
    config.baseUrl.trim() &&
    !isValidHttpUrl(config.baseUrl)
  ) {
    issues.push("baseUrl must be a valid HTTP(S) URL");
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

  if (config.apiKeyRef !== undefined) {
    if (!config.apiKeyRef.trim() || config.apiKeyRef.length < 3) {
      issues.push("apiKeyRef must be a non-empty credential reference");
    }
    if (/password|secret|token=/i.test(config.apiKeyRef)) {
      issues.push("apiKeyRef must not contain inline secret material");
    }
  } else {
    warnings.push("apiKeyRef is unset — public Meilisearch instances only");
  }

  return {
    ok: issues.length === 0,
    issues,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export function normalizeMeilisearchConfiguration(
  input: MeilisearchConfigurationInput,
): MeilisearchConfiguration {
  return {
    baseUrl: (input.baseUrl ?? DEFAULT_MEILISEARCH_BASE_URL).replace(/\/+$/, ""),
    apiKeyRef: input.apiKeyRef,
    timeoutMs: input.timeoutMs ?? 30_000,
    retry: input.retry ?? DEFAULT_MEILISEARCH_RETRY,
    ssl: input.ssl ?? DEFAULT_MEILISEARCH_SSL,
    defaultHeaders: input.defaultHeaders ?? {},
    defaultIndexUid: input.defaultIndexUid,
  };
}
