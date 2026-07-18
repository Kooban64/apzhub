export type StructuredLogLevel = "debug" | "info" | "warn" | "error";

export type StructuredLogFields = Readonly<Record<string, unknown>>;

export type StructuredLogger = {
  log(level: StructuredLogLevel, message: string, fields?: StructuredLogFields): void;
};

/** Console structured logger — no secrets; redacts common sensitive keys. */
export function createStructuredLogger(scope = "platform-event-bus"): StructuredLogger {
  return {
    log(level, message, fields = {}) {
      const safe = redact(fields);
      const line = JSON.stringify({
        ts: new Date().toISOString(),
        scope,
        level,
        message,
        ...safe,
      });
      if (level === "error") {
        console.error(line);
      } else if (level === "warn") {
        console.warn(line);
      } else {
        console.info(line);
      }
    },
  };
}

const REDACT_KEYS = new Set([
  "secret",
  "password",
  "token",
  "authorization",
  "signature",
  "rawBody",
  "credential",
]);

function redact(fields: StructuredLogFields): StructuredLogFields {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (REDACT_KEYS.has(key.toLowerCase()) || /secret|password|token/i.test(key)) {
      out[key] = "[redacted]";
    } else {
      out[key] = value;
    }
  }
  return out;
}
