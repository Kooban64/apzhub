import { getErrorReporter } from "@/lib/observability/error-hook";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogFields = Record<string, string | number | boolean | undefined>;

/** Lightweight structured logging for adapters and route handlers. */
export function logStructured(
  level: LogLevel,
  domain: string,
  message: string,
  fields: LogFields = {},
): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    domain,
    message,
    ...fields,
  });
  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

export function logError(domain: string, message: string, err: unknown, fields: LogFields = {}): void {
  const errMsg = err instanceof Error ? err.message : String(err);
  logStructured("error", domain, message, { ...fields, error: errMsg });
  void getErrorReporter().capture(err, { domain, message, ...fields });
}
