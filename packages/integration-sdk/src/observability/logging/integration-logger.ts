import type { IntegrationError } from "../../errors/types";

export type IntegrationLogLevel = "debug" | "info" | "warn" | "error";

export interface IntegrationLogFields {
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly integrationId?: string;
  readonly adapterId?: string;
  readonly operation?: string;
  readonly durationMs?: number;
  readonly result?: "success" | "failure";
  readonly errorCode?: string;
  readonly errorCategory?: string;
  readonly [key: string]: string | number | boolean | undefined;
}

export interface IntegrationLogEntry {
  readonly level: IntegrationLogLevel;
  readonly message: string;
  readonly timestamp: string;
  readonly fields: IntegrationLogFields;
}

export interface IntegrationLogger {
  debug(message: string, fields?: IntegrationLogFields): void;
  info(message: string, fields?: IntegrationLogFields): void;
  warn(message: string, fields?: IntegrationLogFields): void;
  error(message: string, fields?: IntegrationLogFields): void;
  getEntries(): readonly IntegrationLogEntry[];
}

export interface DefaultIntegrationLoggerOptions {
  readonly integrationId: string;
  readonly adapterId?: string;
  readonly clock?: { now(): string };
  readonly redactPatterns?: readonly RegExp[];
}

const DEFAULT_REDACT_PATTERNS = [
  /bearer\s+[a-z0-9._-]+/gi,
  /api[_-]?key[=:]\s*\S+/gi,
  /password[=:]\s*\S+/gi,
];

export class DefaultIntegrationLogger implements IntegrationLogger {
  private readonly entries: IntegrationLogEntry[] = [];
  private readonly integrationId: string;
  private readonly adapterId?: string;
  private readonly clock: { now(): string };
  private readonly redactPatterns: readonly RegExp[];

  constructor(options: DefaultIntegrationLoggerOptions) {
    this.integrationId = options.integrationId;
    this.adapterId = options.adapterId;
    this.clock = options.clock ?? { now: () => new Date().toISOString() };
    this.redactPatterns = options.redactPatterns ?? DEFAULT_REDACT_PATTERNS;
  }

  debug(message: string, fields?: IntegrationLogFields): void {
    this.write("debug", message, fields);
  }

  info(message: string, fields?: IntegrationLogFields): void {
    this.write("info", message, fields);
  }

  warn(message: string, fields?: IntegrationLogFields): void {
    this.write("warn", message, fields);
  }

  error(message: string, fields?: IntegrationLogFields): void {
    this.write("error", message, fields);
  }

  getEntries(): readonly IntegrationLogEntry[] {
    return this.entries;
  }

  private write(
    level: IntegrationLogLevel,
    message: string,
    fields?: IntegrationLogFields,
  ): void {
    this.entries.push({
      level,
      message: this.redact(message),
      timestamp: this.clock.now(),
      fields: this.redactFields({
        integrationId: this.integrationId,
        adapterId: this.adapterId,
        ...fields,
      }),
    });
  }

  private redact(value: string): string {
    return this.redactPatterns.reduce(
      (current, pattern) => current.replace(pattern, "[REDACTED]"),
      value,
    );
  }

  private redactFields(fields: IntegrationLogFields): IntegrationLogFields {
    const redacted: Record<string, string | number | boolean | undefined> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === "string") {
        redacted[key] = this.redact(value);
      } else {
        redacted[key] = value;
      }
    }

    return redacted as IntegrationLogFields;
  }
}

export class NoopIntegrationLogger implements IntegrationLogger {
  debug(): void {
    return undefined;
  }

  info(): void {
    return undefined;
  }

  warn(): void {
    return undefined;
  }

  error(): void {
    return undefined;
  }

  getEntries(): readonly IntegrationLogEntry[] {
    return [];
  }
}

export function createDefaultIntegrationLogger(
  options: DefaultIntegrationLoggerOptions,
): IntegrationLogger {
  return new DefaultIntegrationLogger(options);
}

export function createNoopIntegrationLogger(): IntegrationLogger {
  return new NoopIntegrationLogger();
}

export function buildErrorLogFields(
  error: IntegrationError,
  context: {
    readonly correlationId: string;
    readonly requestId?: string;
    readonly operation?: string;
    readonly durationMs?: number;
  },
): IntegrationLogFields {
  return {
    correlationId: context.correlationId,
    requestId: context.requestId,
    operation: context.operation,
    durationMs: context.durationMs,
    result: "failure",
    errorCode: error.code,
    errorCategory: error.category,
  };
}

export type { IntegrationErrorSummary } from "../../diagnostics/runtime-types";