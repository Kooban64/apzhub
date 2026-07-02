export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

export function createLogger(scope: string): Logger {
  const prefix = `[apzhub:${scope}]`;
  const log =
    (level: LogLevel) => (message: string, meta?: Record<string, unknown>) => {
      const payload = meta ? ` ${JSON.stringify(meta)}` : "";
      const line = `${prefix} ${message}${payload}`;
      switch (level) {
        case "debug":
          if (process.env.NODE_ENV === "development") console.debug(line);
          break;
        case "info":
          console.info(line);
          break;
        case "warn":
          console.warn(line);
          break;
        case "error":
          console.error(line);
          break;
      }
    };

  return {
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),
  };
}

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code = "APP_ERROR", statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export { checkRedisHealth, getRedis } from "./redis";
