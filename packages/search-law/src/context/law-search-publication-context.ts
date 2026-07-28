/**
 * LawSearchPublicationContext (R12-SEARCH-02).
 */

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type { SearchClassification } from "@apzhub/search-contracts";
import {
  createSearchIntegrationContext,
  type SearchIntegrationContext,
} from "@apzhub/search-integration";

export type LawSearchPublicationContext = {
  readonly correlationId: string;
  readonly requestId?: string;
  readonly actorUserId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly locale?: string;
  readonly permissions: readonly string[];
  /** Default classification — Law defaults to confidential when omitted. */
  readonly classification?: SearchClassification;
};

export function createLawSearchPublicationContext(input: {
  readonly serviceContext: ServiceRequestContext;
  readonly organisationId?: string;
  readonly classification?: SearchClassification;
}): LawSearchPublicationContext {
  return {
    correlationId: input.serviceContext.correlationId,
    requestId: input.serviceContext.requestId,
    actorUserId: input.serviceContext.userId,
    tenantId: input.serviceContext.tenantId,
    organisationId: input.organisationId ?? input.serviceContext.organisationId,
    workspaceId: input.serviceContext.workspaceId,
    locale: input.serviceContext.locale,
    permissions: input.serviceContext.permissions ?? [],
    classification: input.classification ?? "confidential",
  };
}

export function toSearchIntegrationContext(
  context: LawSearchPublicationContext,
): SearchIntegrationContext {
  return createSearchIntegrationContext({
    productId: "law",
    searchContext: {
      correlationId: context.correlationId,
      requestId: context.requestId,
      actorUserId: context.actorUserId,
      tenantId: context.tenantId,
      organisationId: context.organisationId,
      workspaceId: context.workspaceId,
      locale: context.locale,
      permissions: context.permissions,
    },
  });
}
