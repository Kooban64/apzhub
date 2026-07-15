/**
 * SearchIntegrationContext — publication request context (APZSEARCH-009).
 */

import type { SearchProductId, SearchRequestContext } from "@apzhub/search-contracts";

export type SearchIntegrationContext = {
  readonly correlationId: string;
  readonly requestId?: string;
  readonly actorUserId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly locale?: string;
  readonly permissions: readonly string[];
  /** Product initiating the publication (must match entity.productId). */
  readonly productId: SearchProductId;
};

export function createSearchIntegrationContext(input: {
  readonly searchContext: SearchRequestContext;
  readonly productId: SearchProductId;
}): SearchIntegrationContext {
  return {
    correlationId: input.searchContext.correlationId,
    requestId: input.searchContext.requestId,
    actorUserId: input.searchContext.actorUserId,
    tenantId: input.searchContext.tenantId,
    organisationId: input.searchContext.organisationId,
    workspaceId: input.searchContext.workspaceId,
    locale: input.searchContext.locale,
    permissions: input.searchContext.permissions,
    productId: input.productId,
  };
}

export function toSearchRequestContext(
  context: SearchIntegrationContext,
): SearchRequestContext {
  return {
    correlationId: context.correlationId,
    requestId: context.requestId,
    actorUserId: context.actorUserId,
    tenantId: context.tenantId,
    organisationId: context.organisationId,
    workspaceId: context.workspaceId,
    locale: context.locale,
    permissions: context.permissions,
  };
}
