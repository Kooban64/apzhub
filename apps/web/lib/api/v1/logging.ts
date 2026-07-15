import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "./auth/with-platform-api-auth";
import type { PlatformApiTracingContext } from "./types";

function safeLog(payload: Record<string, unknown>): void {
  // Structured console logging — never include secrets/cookies/tokens/bodies.
  console.info(JSON.stringify({ channel: "platform-api-v1", ...payload }));
}

export function logPlatformApiRequest(
  request: NextRequest,
  context: PlatformApiRequestContext,
  operation?: string,
): void {
  safeLog({
    event: "request.start",
    method: request.method,
    route: request.nextUrl.pathname,
    operation,
    requestId: context.tracing.requestId,
    correlationId: context.tracing.correlationId,
    actorId: context.session.user.id,
    tenantId: context.serviceContext.tenantId,
    organisationId: context.serviceContext.organisationId,
  });
}

export function logPlatformApiResponse(
  context: {
    readonly tracing: PlatformApiTracingContext;
    readonly session?: { user: { id: string } };
    readonly serviceContext?: { tenantId: string; organisationId?: string };
  },
  input: {
    readonly method: string;
    readonly path: string;
    readonly status: number;
    readonly durationMs: number;
    readonly operation?: string;
    readonly errorCode?: string;
  },
): void {
  safeLog({
    event: "request.complete",
    method: input.method,
    route: input.path,
    operation: input.operation,
    status: input.status,
    durationMs: input.durationMs,
    requestId: context.tracing.requestId,
    correlationId: context.tracing.correlationId,
    actorId: context.session?.user.id,
    tenantId: context.serviceContext?.tenantId,
    organisationId: context.serviceContext?.organisationId,
    errorCode: input.errorCode,
    result: input.status >= 500 ? "error" : input.status >= 400 ? "denied" : "success",
  });
}
