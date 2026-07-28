/**
 * QEP Requirements HTTP handlers (APZQEP-ENG-020B) — presentation only.
 */

import type { NextRequest } from "next/server";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  qepBaselineAddItemBodySchema,
  qepBaselineCompareBodySchema,
  qepBaselineCreateBodySchema,
  qepBaselineIdParamSchema,
  qepBaselineListQuerySchema,
  qepBaselineUpdateDraftBodySchema,
  qepContentVersionIdParamSchema,
  qepRelationshipClassificationBodySchema,
  qepRelationshipCreateBodySchema,
  qepRelationshipCriticalityBodySchema,
  qepRelationshipIdParamSchema,
  qepRelationshipListQuerySchema,
  qepRelationshipRationaleBodySchema,
  qepRelationshipScopeBodySchema,
  qepRelationshipStrengthBodySchema,
  qepRelationshipSupersedeBodySchema,
  qepRelationshipUpdateProfileBodySchema,
  qepRequirementRelationshipsQuerySchema,
  qepListQuerySchema,
  qepContentVersionCompareBodySchema,
  qepContentVersionNumberParamSchema,
  qepRequirementCreateBodySchema,
  qepRequirementIdParamSchema,
  qepRequirementTransitionBodySchema,
  qepRequirementUpdateBodySchema,
  qepSearchQuerySchema,
} from "../schemas/qep";

type RouteContext = { params: Promise<Record<string, string>> };

async function param(
  routeContext: RouteContext | undefined,
  name: string,
  schema: typeof qepRequirementIdParamSchema,
): Promise<string> {
  const params = routeContext ? await routeContext.params : {};
  return parsePathParam(schema, params[name] ?? "", name);
}

function listPage(total: number, limit: number, offset: number) {
  return {
    cursor: null,
    nextCursor: null,
    limit,
    offset,
    total,
    hasMore: offset + limit < total,
  };
}

export async function assertQepHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.qepEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "QEP_SERVICE_UNAVAILABLE",
      message: "QEP platform services are not enabled",
    });
  }
}

async function requireQepGateway() {
  await assertQepHttpEnabled();
  return getPlatformServiceGateway();
}

function mapHandlerError(error: unknown): never {
  if (error instanceof PlatformApiHttpError) {
    throw error;
  }
  if (error instanceof PlatformServiceError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "FORBIDDEN" || error.code === "PERMISSION_DENIED"
          ? 403
          : error.code === "CONFLICT"
            ? 409
            : error.code === "VALIDATION_FAILED"
              ? 400
              : 503;
    throw new PlatformApiHttpError(status, {
      code: error.code,
      message: error.message,
    });
  }
  throw error;
}

async function invoke<T>(
  context: PlatformApiRequestContext,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    mapHandlerError(error);
  }
}

export async function handleListQepRequirements(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(qepListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireQepGateway();
  const result = await invoke(context, () =>
    gateway.qep.requirements.list(context.serviceContext, {
      projectId: query.projectId,
      status: query.status,
      includeArchived: query.includeArchived === "true",
      limit: query.limit ?? query.perPage,
      offset: query.offset,
    }),
  );
  return jsonCollectionResponse(
    result.items,
    listPage(result.total, result.limit, result.offset),
    context.tracing,
  );
}

export async function handleSearchQepRequirements(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(qepSearchQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireQepGateway();
  const result = await invoke(context, () =>
    gateway.qep.requirements.search(context.serviceContext, {
      q: query.q,
      projectId: query.projectId,
      includeArchived: query.includeArchived === "true",
      limit: query.limit ?? query.perPage,
      offset: query.offset,
    }),
  );
  return jsonCollectionResponse(
    result.items,
    listPage(result.total, result.limit, result.offset),
    context.tracing,
  );
}

export async function handleGetQepRequirement(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "requirementId", qepRequirementIdParamSchema);
  const gateway = await requireQepGateway();
  const item = await invoke(context, () =>
    gateway.qep.requirements.get(context.serviceContext, id),
  );
  if (!item) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: `Requirement not found: ${id}`,
    });
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleCreateQepRequirement(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepRequirementCreateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const created = await invoke(context, () =>
    gateway.qep.requirements.create(context.serviceContext, body),
  );
  return jsonDataResponse(created, context.tracing, { status: 201 });
}

export async function handleUpdateQepRequirement(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "requirementId", qepRequirementIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepRequirementUpdateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const updated = await invoke(context, () =>
    gateway.qep.requirements.update(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleArchiveQepRequirement(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "requirementId", qepRequirementIdParamSchema);
  const gateway = await requireQepGateway();
  const archived = await invoke(context, () =>
    gateway.qep.requirements.archive(context.serviceContext, id),
  );
  return jsonDataResponse(archived, context.tracing);
}

export async function handleTransitionQepRequirement(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "requirementId", qepRequirementIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepRequirementTransitionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const updated = await invoke(context, () =>
    gateway.qep.requirements.transition(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleGetQepRequirementAvailableTransitions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "requirementId", qepRequirementIdParamSchema);
  const gateway = await requireQepGateway();
  const transitions = await invoke(context, () =>
    gateway.qep.requirements.availableTransitions(context.serviceContext, id),
  );
  return jsonDataResponse(transitions, context.tracing);
}

export async function handleGetQepRequirementLifecycleHistory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "requirementId", qepRequirementIdParamSchema);
  const gateway = await requireQepGateway();
  const history = await invoke(context, () =>
    gateway.qep.requirements.listHistory(context.serviceContext, id),
  );
  return jsonDataResponse(history, context.tracing);
}

async function versionNumber(routeContext?: RouteContext): Promise<number> {
  const params = routeContext ? await routeContext.params : {};
  return parsePathParam(
    qepContentVersionNumberParamSchema,
    params.versionNumber ?? "",
    "versionNumber",
  );
}

export async function handleListQepRequirementContentVersions(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "requirementId", qepRequirementIdParamSchema);
  const query = parseQuery(qepListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireQepGateway();
  const result = await invoke(context, () =>
    gateway.qep.requirements.listVersions(context.serviceContext, id, {
      limit: query.limit ?? query.perPage,
      offset: query.offset,
    }),
  );
  return jsonCollectionResponse(
    result.items,
    listPage(result.total, result.limit, result.offset),
    context.tracing,
  );
}

export async function handleGetQepRequirementContentVersion(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "requirementId", qepRequirementIdParamSchema);
  const number = await versionNumber(routeContext);
  const gateway = await requireQepGateway();
  const version = await invoke(context, () =>
    gateway.qep.requirements.getVersion(context.serviceContext, id, number),
  );
  return jsonDataResponse(version, context.tracing);
}

export async function handleCompareQepRequirementContentVersions(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "requirementId", qepRequirementIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepContentVersionCompareBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const comparison = await invoke(context, () =>
    gateway.qep.requirements.compareVersions(context.serviceContext, id, body),
  );
  return jsonDataResponse(comparison, context.tracing);
}

export async function handleVerifyQepRequirementContentVersionIntegrity(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "requirementId", qepRequirementIdParamSchema);
  const gateway = await requireQepGateway();
  const number = await versionNumber(routeContext);
  await invoke(context, () =>
    gateway.qep.requirements.verifyVersionIntegrity(context.serviceContext, id, number),
  );
  return jsonDataResponse({ versionNumber: number, valid: true }, context.tracing);
}

/** Requirement Baseline handlers (APZQEP-ENG-020E Part 2) — presentation only. */

export async function handleListQepBaselines(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(qepBaselineListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireQepGateway();
  const result = await invoke(context, () =>
    gateway.qep.requirements.listBaselines(context.serviceContext, {
      status: query.status,
      limit: query.limit ?? query.perPage,
      offset: query.offset,
    }),
  );
  return jsonCollectionResponse(
    result.items,
    listPage(result.total, result.limit, result.offset),
    context.tracing,
  );
}

export async function handleCreateQepBaseline(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepBaselineCreateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const created = await invoke(context, () =>
    gateway.qep.requirements.createBaseline(context.serviceContext, body),
  );
  return jsonDataResponse(created, context.tracing, { status: 201 });
}

export async function handleGetQepBaseline(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "baselineId", qepBaselineIdParamSchema);
  const gateway = await requireQepGateway();
  const item = await invoke(context, () =>
    gateway.qep.requirements.getBaseline(context.serviceContext, id),
  );
  if (!item) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: `Requirement baseline not found: ${id}`,
    });
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleUpdateQepBaselineDraft(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "baselineId", qepBaselineIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepBaselineUpdateDraftBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const updated = await invoke(context, () =>
    gateway.qep.requirements.updateDraftBaseline(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleListQepBaselineItems(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "baselineId", qepBaselineIdParamSchema);
  const gateway = await requireQepGateway();
  const items = await invoke(context, () =>
    gateway.qep.requirements.listBaselineItems(context.serviceContext, id),
  );
  return jsonDataResponse(items, context.tracing);
}

export async function handleAddQepBaselineItem(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "baselineId", qepBaselineIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepBaselineAddItemBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const updated = await invoke(context, () =>
    gateway.qep.requirements.addBaselineItem(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing, { status: 201 });
}

export async function handleRemoveQepBaselineItem(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "baselineId", qepBaselineIdParamSchema);
  const contentVersionId = await param(
    routeContext,
    "contentVersionId",
    qepContentVersionIdParamSchema,
  );
  const gateway = await requireQepGateway();
  const updated = await invoke(context, () =>
    gateway.qep.requirements.removeBaselineItem(
      context.serviceContext,
      id,
      contentVersionId,
    ),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleLockQepBaseline(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "baselineId", qepBaselineIdParamSchema);
  const gateway = await requireQepGateway();
  const locked = await invoke(context, () =>
    gateway.qep.requirements.lockBaseline(context.serviceContext, id),
  );
  return jsonDataResponse(locked, context.tracing);
}

export async function handleArchiveQepBaseline(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "baselineId", qepBaselineIdParamSchema);
  const gateway = await requireQepGateway();
  const archived = await invoke(context, () =>
    gateway.qep.requirements.archiveBaseline(context.serviceContext, id),
  );
  return jsonDataResponse(archived, context.tracing);
}

export async function handleCompareQepBaselines(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepBaselineCompareBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const comparison = await invoke(context, () =>
    gateway.qep.requirements.compareBaselines(context.serviceContext, body),
  );
  return jsonDataResponse(comparison, context.tracing);
}

export async function handleVerifyQepBaselineIntegrity(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "baselineId", qepBaselineIdParamSchema);
  const gateway = await requireQepGateway();
  const verified = await invoke(context, () =>
    gateway.qep.requirements.verifyBaselineIntegrity(context.serviceContext, id),
  );
  return jsonDataResponse(verified, context.tracing);
}

export async function handleGetQepRequirementBaselineHistory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "requirementId", qepRequirementIdParamSchema);
  const gateway = await requireQepGateway();
  const history = await invoke(context, () =>
    gateway.qep.requirements.requirementBaselineHistory(context.serviceContext, id),
  );
  return jsonDataResponse(history, context.tracing);
}

/** Requirement Relationship handlers (APZQEP-ENG-020F Part 2) — presentation only. */

function parseRelationshipListQuery(searchParams: URLSearchParams) {
  const query = parseQuery(qepRelationshipListQuerySchema, searchParams);
  return {
    ...query,
    conflictsOnly: query.conflictsOnly === "true" ? true : undefined,
    supersessionOnly: query.supersessionOnly === "true" ? true : undefined,
    limit: query.limit ?? query.perPage,
  };
}

export async function handleListQepRelationships(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseRelationshipListQuery(request.nextUrl.searchParams);
  const gateway = await requireQepGateway();
  const result = await invoke(context, () =>
    gateway.qep.requirements.listRelationships(context.serviceContext, query),
  );
  return jsonCollectionResponse(
    result.items,
    listPage(result.total, result.limit, result.offset),
    context.tracing,
  );
}

export async function handleCreateQepRelationship(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepRelationshipCreateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const created = await invoke(context, () =>
    gateway.qep.requirements.createRelationship(context.serviceContext, body),
  );
  return jsonDataResponse(created, context.tracing, { status: 201 });
}

export async function handleGetQepRelationship(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "relationshipId", qepRelationshipIdParamSchema);
  const gateway = await requireQepGateway();
  const item = await invoke(context, () =>
    gateway.qep.requirements.getRelationship(context.serviceContext, id),
  );
  if (!item) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: `Requirement relationship not found: ${id}`,
    });
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleUpdateQepRelationshipProfile(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "relationshipId", qepRelationshipIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepRelationshipUpdateProfileBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const updated = await invoke(context, () =>
    gateway.qep.requirements.updateRelationshipProfile(
      context.serviceContext,
      id,
      body,
    ),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleActivateQepRelationship(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "relationshipId", qepRelationshipIdParamSchema);
  const gateway = await requireQepGateway();
  const activated = await invoke(context, () =>
    gateway.qep.requirements.activateRelationship(context.serviceContext, id),
  );
  return jsonDataResponse(activated, context.tracing);
}

export async function handleDeprecateQepRelationship(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "relationshipId", qepRelationshipIdParamSchema);
  const gateway = await requireQepGateway();
  const deprecated = await invoke(context, () =>
    gateway.qep.requirements.deprecateRelationship(context.serviceContext, id),
  );
  return jsonDataResponse(deprecated, context.tracing);
}

export async function handleRetireQepRelationship(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "relationshipId", qepRelationshipIdParamSchema);
  const gateway = await requireQepGateway();
  const retired = await invoke(context, () =>
    gateway.qep.requirements.retireRelationship(context.serviceContext, id),
  );
  return jsonDataResponse(retired, context.tracing);
}

export async function handleSupersedeQepRelationship(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepRelationshipSupersedeBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const created = await invoke(context, () =>
    gateway.qep.requirements.supersedeRelationship(context.serviceContext, body),
  );
  return jsonDataResponse(created, context.tracing, { status: 201 });
}

export async function handleUpdateQepRelationshipRationale(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "relationshipId", qepRelationshipIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepRelationshipRationaleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const updated = await invoke(context, () =>
    gateway.qep.requirements.updateRelationshipRationale(
      context.serviceContext,
      id,
      body.rationale,
    ),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepRelationshipStrength(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "relationshipId", qepRelationshipIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepRelationshipStrengthBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const updated = await invoke(context, () =>
    gateway.qep.requirements.updateRelationshipStrength(
      context.serviceContext,
      id,
      body.strength,
    ),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepRelationshipClassification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "relationshipId", qepRelationshipIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepRelationshipClassificationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const updated = await invoke(context, () =>
    gateway.qep.requirements.updateRelationshipClassification(
      context.serviceContext,
      id,
      body.classification,
    ),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepRelationshipCriticality(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "relationshipId", qepRelationshipIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepRelationshipCriticalityBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const updated = await invoke(context, () =>
    gateway.qep.requirements.updateRelationshipCriticality(
      context.serviceContext,
      id,
      body.criticality,
    ),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepRelationshipScope(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "relationshipId", qepRelationshipIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepRelationshipScopeBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireQepGateway();
  const updated = await invoke(context, () =>
    gateway.qep.requirements.updateRelationshipScope(
      context.serviceContext,
      id,
      body.scope,
    ),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleListQepRelationshipTaxonomy(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireQepGateway();
  const taxonomy = await invoke(context, () =>
    gateway.qep.requirements.listRelationshipTaxonomy(context.serviceContext),
  );
  return jsonDataResponse(taxonomy, context.tracing);
}

export async function handleListQepRelationshipConflicts(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireQepGateway();
  const conflicts = await invoke(context, () =>
    gateway.qep.requirements.listRelationshipConflicts(context.serviceContext),
  );
  return jsonDataResponse(conflicts, context.tracing);
}

export async function handleListQepSupersessionChains(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const requirementId = request.nextUrl.searchParams.get("requirementId") ?? undefined;
  const gateway = await requireQepGateway();
  const chains = await invoke(context, () =>
    gateway.qep.requirements.listSupersessionChains(
      context.serviceContext,
      requirementId,
    ),
  );
  return jsonDataResponse(chains, context.tracing);
}

export async function handleListQepRelationshipsByTaxonomy(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const type = await param(routeContext, "type", qepRequirementIdParamSchema);
  const gateway = await requireQepGateway();
  const items = await invoke(context, () =>
    gateway.qep.requirements.listRelationshipsByTaxonomy(context.serviceContext, type),
  );
  return jsonDataResponse(items, context.tracing);
}

export async function handleListQepRelationshipsByLifecycle(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const lifecycleState = await param(
    routeContext,
    "lifecycleState",
    qepRequirementIdParamSchema,
  );
  const gateway = await requireQepGateway();
  const items = await invoke(context, () =>
    gateway.qep.requirements.listRelationshipsByLifecycle(
      context.serviceContext,
      lifecycleState,
    ),
  );
  return jsonDataResponse(items, context.tracing);
}

export async function handleListQepRelationshipsByBaseline(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const baselineId = await param(routeContext, "baselineId", qepBaselineIdParamSchema);
  const gateway = await requireQepGateway();
  const items = await invoke(context, () =>
    gateway.qep.requirements.listRelationshipsByBaseline(
      context.serviceContext,
      baselineId,
    ),
  );
  return jsonDataResponse(items, context.tracing);
}

export async function handleListQepRelationshipsByContentVersion(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const contentVersionId = await param(
    routeContext,
    "contentVersionId",
    qepContentVersionIdParamSchema,
  );
  const gateway = await requireQepGateway();
  const items = await invoke(context, () =>
    gateway.qep.requirements.listRelationshipsByContentVersion(
      context.serviceContext,
      contentVersionId,
    ),
  );
  return jsonDataResponse(items, context.tracing);
}

export async function handleListQepRequirementRelationships(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const requirementId = await param(
    routeContext,
    "requirementId",
    qepRequirementIdParamSchema,
  );
  const query = parseQuery(
    qepRequirementRelationshipsQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireQepGateway();
  const items = await invoke(context, () =>
    gateway.qep.requirements.listRelationshipsByRequirement(
      context.serviceContext,
      requirementId,
      query.direction,
    ),
  );
  return jsonDataResponse(items, context.tracing);
}

export async function handleListQepInboundRelationships(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const requirementId = await param(
    routeContext,
    "requirementId",
    qepRequirementIdParamSchema,
  );
  const gateway = await requireQepGateway();
  const items = await invoke(context, () =>
    gateway.qep.requirements.listInboundRelationships(
      context.serviceContext,
      requirementId,
    ),
  );
  return jsonDataResponse(items, context.tracing);
}

export async function handleListQepOutboundRelationships(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const requirementId = await param(
    routeContext,
    "requirementId",
    qepRequirementIdParamSchema,
  );
  const gateway = await requireQepGateway();
  const items = await invoke(context, () =>
    gateway.qep.requirements.listOutboundRelationships(
      context.serviceContext,
      requirementId,
    ),
  );
  return jsonDataResponse(items, context.tracing);
}
