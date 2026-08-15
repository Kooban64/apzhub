export interface PaperlessConfiguration {
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  readonly apiTokenRef: string;
  readonly timeoutMs: number;
  readonly defaultHeaders: Readonly<Record<string, string>>;
}

export type PaperlessConfigurationInput = Partial<PaperlessConfiguration>;

export interface PaperlessConfigurationValidationResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function normalizePaperlessConfiguration(
  input: PaperlessConfigurationInput,
): PaperlessConfiguration {
  const baseUrl = trimTrailingSlash(input.baseUrl?.trim() || "http://127.0.0.1:19082");
  return {
    baseUrl,
    apiBaseUrl: trimTrailingSlash(input.apiBaseUrl?.trim() || `${baseUrl}/api`),
    apiTokenRef: input.apiTokenRef?.trim() || "paperless/api-token",
    timeoutMs: input.timeoutMs ?? 15_000,
    defaultHeaders: { ...(input.defaultHeaders ?? {}) },
  };
}

export function validatePaperlessConfiguration(
  config: Partial<PaperlessConfiguration>,
): PaperlessConfigurationValidationResult {
  const issues: string[] = [];
  if (config.baseUrl !== undefined && !isHttpUrl(config.baseUrl)) {
    issues.push("baseUrl must be a valid HTTP(S) URL");
  }
  if (config.apiBaseUrl !== undefined && !isHttpUrl(config.apiBaseUrl)) {
    issues.push("apiBaseUrl must be a valid HTTP(S) URL");
  }
  if (!config.apiTokenRef?.trim()) {
    issues.push("apiTokenRef is required");
  }
  if (config.timeoutMs !== undefined && config.timeoutMs <= 0) {
    issues.push("timeoutMs must be greater than zero");
  }
  return { ok: issues.length === 0, issues };
}
