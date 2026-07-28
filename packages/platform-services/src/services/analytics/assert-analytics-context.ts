import type { AnalyticsRequestContext } from "@apzhub/analytics-contracts";

import { analyticsValidationError } from "./analytics-errors";

export function assertAnalyticsContext(ctx: AnalyticsRequestContext): void {
  if (!ctx.tenantId?.trim() || !ctx.userId?.trim() || !ctx.correlationId?.trim()) {
    throw analyticsValidationError(
      ctx.correlationId ?? "",
      "Analytics service requires tenantId, userId, and correlationId",
    );
  }
}

export function analyticsPermissions(ctx: AnalyticsRequestContext): readonly string[] {
  return ctx.permissions ?? [];
}
