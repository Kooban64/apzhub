/**
 * ReportingSearchPublicationContext (APZSEARCH-014).
 * Accepts ReportingRequestContext and/or ServiceRequestContext.
 */

import type { ReportingRequestContext } from "@apzhub/reporting-contracts";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type { SearchClassification } from "@apzhub/search-contracts";
import {
  createSearchIntegrationContext,
  type SearchEntityLifecycleState,
  type SearchIntegrationContext,
} from "@apzhub/search-integration";

export type ReportingSearchPublicationContext = {
  readonly correlationId: string;
  readonly requestId?: string;
  readonly actorUserId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly locale?: string;
  readonly permissions: readonly string[];
  /** Default classification — fail-closed confidential when absent. */
  readonly classification?: SearchClassification;
  readonly publicationReason?: string;
  readonly lifecycleOperation?: SearchEntityLifecycleState;
};

function hasServiceShape(
  value: ReportingRequestContext | ServiceRequestContext,
): value is ServiceRequestContext {
  return (
    typeof (value as ServiceRequestContext).correlationId === "string" &&
    Array.isArray((value as ServiceRequestContext).permissions)
  );
}

export function createReportingSearchPublicationContext(input: {
  readonly reportingContext?: ReportingRequestContext;
  readonly serviceContext?: ServiceRequestContext;
  readonly organisationId?: string;
  readonly classification?: SearchClassification;
  readonly publicationReason?: string;
  readonly lifecycleOperation?: SearchEntityLifecycleState;
  readonly workspaceId?: string;
  readonly locale?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly permissions?: readonly string[];
}): ReportingSearchPublicationContext {
  const ctx = input.serviceContext ?? input.reportingContext;
  if (!ctx) {
    throw new Error(
      "createReportingSearchPublicationContext requires reportingContext or serviceContext",
    );
  }

  const permissions =
    input.permissions ??
    ctx.permissions ??
    (hasServiceShape(ctx) ? ctx.permissions : undefined);

  if (!permissions) {
    throw new Error("permissions are required on Reporting Search publication context");
  }

  const correlationId =
    input.correlationId ??
    (hasServiceShape(ctx)
      ? ctx.correlationId
      : (ctx.correlationId ?? `reporting-${ctx.tenantId}-${ctx.userId}`));

  return {
    correlationId,
    requestId: input.requestId ?? (hasServiceShape(ctx) ? ctx.requestId : undefined),
    actorUserId: ctx.userId,
    tenantId: ctx.tenantId,
    organisationId:
      input.organisationId ??
      ctx.organisationId ??
      (hasServiceShape(ctx) ? ctx.organisationId : undefined),
    workspaceId:
      input.workspaceId ?? (hasServiceShape(ctx) ? ctx.workspaceId : undefined),
    locale: input.locale ?? (hasServiceShape(ctx) ? ctx.locale : undefined),
    permissions,
    // Fail-closed: default confidential when not provided.
    classification: input.classification ?? "confidential",
    publicationReason: input.publicationReason,
    lifecycleOperation: input.lifecycleOperation,
  };
}

export function toSearchIntegrationContext(
  context: ReportingSearchPublicationContext,
): SearchIntegrationContext {
  return createSearchIntegrationContext({
    productId: "reporting",
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
