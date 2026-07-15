import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

/** Maps platform service context to integration SDK context for adapter delegation. */
export function toIntegrationContext(ctx: ServiceRequestContext): IntegrationRequestContext {
  return {
    correlationId: ctx.correlationId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    locale: ctx.locale,
    timezone: ctx.timezone,
    permissionSnapshot: ctx.permissions,
  };
}
