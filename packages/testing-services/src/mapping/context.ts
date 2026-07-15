import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type { RepositoryContext } from "@apzhub/testing-persistence";

/** Map platform service request context → persistence repository context. */
export function toRepositoryContext(
  ctx: ServiceRequestContext,
): RepositoryContext {
  return {
    tenantId: ctx.tenantId,
    organisationId: ctx.organisationId,
    actorUserId: ctx.userId,
    permissions: ctx.permissions,
    correlationId: ctx.correlationId,
  };
}
