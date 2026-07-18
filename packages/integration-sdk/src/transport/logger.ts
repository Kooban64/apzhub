import type { TransportLogEntry, TransportLogFields, TransportLogger } from "./types";

const SENSITIVE_HEADER_KEYS = [
  "authorization",
  "cookie",
  "set-cookie",
  "proxy-authorization",
  "x-api-key",
  "api-key",
  "x-auth-token",
];

const SENSITIVE_FIELD_KEYS = [
  "authorization",
  "token",
  "password",
  "secret",
  "cookie",
  "apikey",
  "api_key",
  "api-key",
  "bearer",
  "credential",
];

const BODY_REDACT_PATTERNS = [
  /bearer\s+[a-z0-9._\-+=/]+/gi,
  /(?:password|token|secret|authorization|cookie)\s*[=:]\s*\S+/gi,
];

export interface DefaultTransportLoggerOptions {
  readonly clock?: { now(): string };
}

/**
 * Structured transport logger that never logs tokens, passwords, cookies,
 * authorization headers, or secret bodies.
 */
export class DefaultTransportLogger implements TransportLogger {
  private readonly entries: TransportLogEntry[] = [];
  private readonly clock: { now(): string };

  constructor(options: DefaultTransportLoggerOptions = {}) {
    this.clock = options.clock ?? { now: () => new Date().toISOString() };
  }

  debug(message: string, fields?: TransportLogFields): void {
    this.write("debug", message, fields);
  }

  info(message: string, fields?: TransportLogFields): void {
    this.write("info", message, fields);
  }

  warn(message: string, fields?: TransportLogFields): void {
    this.write("warn", message, fields);
  }

  error(message: string, fields?: TransportLogFields): void {
    this.write("error", message, fields);
  }

  getEntries(): readonly TransportLogEntry[] {
    return this.entries;
  }

  private write(
    level: TransportLogEntry["level"],
    message: string,
    fields?: TransportLogFields,
  ): void {
    this.entries.push({
      level,
      message: redactText(message),
      timestamp: this.clock.now(),
      fields: redactFields(fields ?? {}),
    });
  }
}

export function createTransportLogger(
  options?: DefaultTransportLoggerOptions,
): DefaultTransportLogger {
  return new DefaultTransportLogger(options);
}

export function isSensitiveHeaderName(name: string): boolean {
  const lower = name.toLowerCase();
  return SENSITIVE_HEADER_KEYS.some((key) => lower === key || lower.includes(key));
}

export function redactHeaders(
  headers: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    result[key] = isSensitiveHeaderName(key) ? "[REDACTED]" : redactText(value);
  }
  return result;
}

function redactText(value: string): string {
  return BODY_REDACT_PATTERNS.reduce(
    (current, pattern) => current.replace(pattern, "[REDACTED]"),
    value,
  );
}

function redactFields(fields: TransportLogFields): TransportLogFields {
  const result: Record<string, string | number | boolean | undefined> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (SENSITIVE_FIELD_KEYS.some((pattern) => key.toLowerCase().includes(pattern))) {
      result[key] = "[REDACTED]";
      continue;
    }

    if (typeof value === "string") {
      result[key] = redactText(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}
