import type { NextRequest } from "next/server";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";

export type LawApiLogLevel = "debug" | "info" | "warn" | "error";

export interface LawApiRequestLogEntry {
  readonly level: LawApiLogLevel;
  readonly message: string;
  readonly requestId: string;
  readonly correlationId: string;
  readonly method: string;
  readonly path: string;
  readonly tenantId?: string;
  readonly userId?: string;
  readonly durationMs?: number;
  readonly status?: number;
  readonly errorCode?: string;
}

type LawApiLogSink = (entry: LawApiRequestLogEntry) => void;

let logSink: LawApiLogSink = (entry) => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const payload = {
    ...entry,
    service: "law-api",
  };

  if (entry.level === "error" || entry.level === "warn") {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
};

/** Override the default log sink (useful in tests). */
export function setLawApiLogSink(sink: LawApiLogSink): void {
  logSink = sink;
}

/** Reset to the default console log sink. */
export function resetLawApiLogSink(): void {
  logSink = (entry) => {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    console.info(JSON.stringify({ ...entry, service: "law-api" }));
  };
}

function emit(entry: LawApiRequestLogEntry): void {
  logSink(entry);
}

/** Log an incoming Law API request. */
export function logLawApiRequest(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  message = "Law API request received",
): void {
  emit({
    level: "info",
    message,
    requestId: context.requestId,
    correlationId: context.correlationId,
    method: request.method,
    path: request.nextUrl.pathname,
    tenantId: context.tenantId,
    userId: context.user?.userId,
  });
}

/** Log a completed Law API response. */
export function logLawApiResponse(
  context: LawApiAuthenticatedContext,
  options: {
    readonly method: string;
    readonly path: string;
    readonly status: number;
    readonly durationMs: number;
    readonly errorCode?: string;
  },
): void {
  emit({
    level: options.status >= 500 ? "error" : options.status >= 400 ? "warn" : "info",
    message: "Law API request completed",
    requestId: context.requestId,
    correlationId: context.correlationId,
    method: options.method,
    path: options.path,
    tenantId: context.tenantId,
    userId: context.user?.userId,
    durationMs: options.durationMs,
    status: options.status,
    errorCode: options.errorCode,
  });
}
