import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";

export function assertTimeContext(ctx: ServiceRequestContext): void {
  if (!ctx.tenantId?.trim() || !ctx.userId?.trim() || !ctx.correlationId?.trim()) {
    throw new PlatformServiceError({
      category: "validation",
      code: "INVALID_REQUEST_CONTEXT",
      message: "Time service requires tenantId, userId, and correlationId",
      correlationId: ctx.correlationId || "missing-correlation",
      retryable: false,
    });
  }
}
