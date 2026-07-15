/** Strongly typed Plane adapter configuration — adapter-internal, not platform env. */
export interface PlaneRetryConfiguration {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
}

export interface PlaneSslOptions {
  readonly rejectUnauthorized: boolean;
}

export interface PlaneConfiguration {
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly apiTokenRef: string;
  readonly workspaceSlug: string;
  readonly timeoutMs: number;
  readonly retry: PlaneRetryConfiguration;
  readonly ssl: PlaneSslOptions;
}

export interface PlaneConfigurationValidationResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export type PlaneConfigurationInput = Partial<PlaneConfiguration> &
  Pick<PlaneConfiguration, "baseUrl" | "apiBaseUrl" | "apiTokenRef" | "workspaceSlug">;

export const DEFAULT_PLANE_RETRY: PlaneRetryConfiguration = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 5_000,
};

export const DEFAULT_PLANE_SSL: PlaneSslOptions = {
  rejectUnauthorized: true,
};

export function validatePlaneConfiguration(
  config: Partial<PlaneConfiguration>,
): PlaneConfigurationValidationResult {
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

  if (!config.workspaceSlug?.trim()) {
    issues.push("workspaceSlug is required");
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

export function normalizePlaneConfiguration(
  input: PlaneConfigurationInput,
): PlaneConfiguration {
  return {
    baseUrl: input.baseUrl.replace(/\/+$/, ""),
    apiBaseUrl: input.apiBaseUrl.replace(/\/+$/, ""),
    apiTokenRef: input.apiTokenRef,
    workspaceSlug: input.workspaceSlug,
    timeoutMs: input.timeoutMs ?? 30_000,
    retry: input.retry ?? DEFAULT_PLANE_RETRY,
    ssl: input.ssl ?? DEFAULT_PLANE_SSL,
  };
}
