import type { NextRequest } from "next/server";

import type { QepRequirementDto } from "@apzhub/qep-contracts";
import { coverageLabel } from "@apzhub/qep-definition";
import type {
  OriginType,
  StoryPriority,
  StoryStatus,
  StoryType,
  VerificationAssetKind,
  VerificationResult,
} from "@apzhub/qep-definition";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { assertQepHttpEnabled } from "./qep";
import { getApplicationService } from "@/lib/qep/application-runtime";
import { getDefinitionService } from "@/lib/qep/definition-runtime";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

type RouteContext = { params: Promise<Record<string, string>> };

function actorId(context: PlatformApiRequestContext): string {
  return context.serviceContext.userId;
}

function requireParam(
  params: Record<string, string> | undefined,
  name: string,
): string {
  const value = params?.[name]?.trim();
  if (!value) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: `${name} is required`,
    });
  }
  return value;
}

function mapError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (message.endsWith(".not_found") || message.includes("not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (
    message.includes("mismatch") ||
    message.includes("required") ||
    message.includes("invalid")
  ) {
    throw new PlatformApiHttpError(400, { code: "VALIDATION_FAILED", message });
  }
  if (message.includes("archived") || message.includes("forbidden")) {
    throw new PlatformApiHttpError(409, { code: "CONFLICT", message });
  }
  throw new PlatformApiHttpError(400, { code: "VALIDATION_FAILED", message });
}

async function requireRequirement(
  context: PlatformApiRequestContext,
  requirementId: string,
): Promise<QepRequirementDto> {
  await assertQepHttpEnabled();
  const gateway = await getPlatformServiceGateway();
  const item = await gateway.qep.requirements.get(
    context.serviceContext,
    requirementId,
  );
  if (!item || (item.tenantId && item.tenantId !== sessionTenantId(context))) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: `Requirement not found: ${requirementId}`,
    });
  }
  return item;
}

async function requireApplication(
  tenantId: string,
  applicationId: string,
): Promise<string> {
  try {
    const app = await getApplicationService().get(tenantId, applicationId);
    return app.id;
  } catch {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "application.required",
    });
  }
}

async function assertRequirementInApplication(
  tenantId: string,
  applicationId: string,
  projectId: string,
): Promise<void> {
  if (projectId === applicationId) return;
  const refs = await getApplicationService().listLegacyRefs(tenantId);
  const bound = refs.some(
    (row) => row.applicationId === applicationId && row.projectRef === projectId,
  );
  if (!bound) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "requirement.application_unbound",
    });
  }
}

export async function promoteRequirementCriteria(
  context: PlatformApiRequestContext,
  requirement: QepRequirementDto,
): Promise<void> {
  const items = requirement.acceptanceCriteria?.items ?? [];
  if (items.length === 0) return;
  const tenantId = sessionTenantId(context);
  let applicationId = requirement.projectId;
  try {
    applicationId = await requireApplication(tenantId, requirement.projectId);
  } catch {
    applicationId = requirement.projectId;
  }
  await getDefinitionService().promoteLegacyCriteria({
    tenantId,
    applicationId,
    requirementId: requirement.id,
    items,
    actorId: actorId(context),
    correlationId: context.tracing.correlationId,
  });
}

export async function handleListDefinitionRequirements(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.requirements.view");
  const tenantId = sessionTenantId(context);
  const applicationId = request.nextUrl.searchParams.get("applicationId")?.trim();
  if (!applicationId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "applicationId is required",
    });
  }
  await requireApplication(tenantId, applicationId);
  await assertQepHttpEnabled();
  const gateway = await getPlatformServiceGateway();
  const refs = await getApplicationService().listLegacyRefs(tenantId);
  const projectIds = new Set<string>([applicationId]);
  for (const ref of refs) {
    if (ref.applicationId === applicationId) projectIds.add(ref.projectRef);
  }
  const items: QepRequirementDto[] = [];
  for (const projectId of projectIds) {
    const page = await gateway.qep.requirements.list(context.serviceContext, {
      projectId,
      limit: 200,
      offset: 0,
    });
    items.push(...page.items);
  }
  const unique = new Map<string, QepRequirementDto>();
  for (const item of items) unique.set(item.id, item);
  const definition = getDefinitionService();
  const rows = [];
  for (const requirement of unique.values()) {
    await promoteRequirementCriteria(context, requirement);
    const stories = await definition.listStories({
      tenantId,
      requirementId: requirement.id,
    });
    const coverage = await definition.coverageForRequirement(tenantId, requirement.id);
    rows.push({
      requirement,
      storyCount: stories.length,
      criterionCount: coverage.criterionCount,
      coveredCount: coverage.coveredCount,
      gapCount: coverage.gapCount,
      coverage: coverage.coverage,
      coverageLabel: coverageLabel(coverage.coverage),
    });
  }
  return jsonCollectionResponse(
    rows,
    {
      cursor: null,
      nextCursor: null,
      limit: rows.length,
      hasMore: false,
    },
    context.tracing,
  );
}

export async function handleGetRequirementDefinition(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.requirements.view");
  const params = routeContext ? await routeContext.params : {};
  const requirementId = requireParam(params, "requirementId");
  const requirement = await requireRequirement(context, requirementId);
  await promoteRequirementCriteria(context, requirement);
  const tenantId = sessionTenantId(context);
  const definition = getDefinitionService();
  const stories = await definition.listStories({ tenantId, requirementId });
  const criteria = await definition.listCriteria({ tenantId, requirementId });
  const coverage = await definition.coverageForRequirement(tenantId, requirementId);
  const audit = await definition.listAudit(tenantId, requirementId);
  return jsonDataResponse(
    {
      requirement,
      stories,
      criteria,
      coverage: {
        ...coverage,
        coverageLabel: coverageLabel(coverage.coverage),
      },
      audit,
    },
    context.tracing,
  );
}

export async function handlePromoteLegacyCriteria(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.requirements.edit", "qep.requirements.create");
  const body = (await request.json()) as { requirementId?: string };
  const requirementId = body.requirementId?.trim() ?? "";
  if (!requirementId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "requirementId is required",
    });
  }
  const requirement = await requireRequirement(context, requirementId);
  const before = await getDefinitionService().listCriteria({
    tenantId: sessionTenantId(context),
    requirementId,
    includeArchived: true,
  });
  await promoteRequirementCriteria(context, requirement);
  const after = await getDefinitionService().listCriteria({
    tenantId: sessionTenantId(context),
    requirementId,
    includeArchived: true,
  });
  return jsonDataResponse(
    {
      requirementId,
      created: Math.max(0, after.length - before.length),
      total: after.length,
      inventedStoryParents: 0,
    },
    context.tracing,
  );
}

export async function handleListStories(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.requirements.view");
  const tenantId = sessionTenantId(context);
  const url = request.nextUrl;
  const items = await getDefinitionService().listStories({
    tenantId,
    applicationId: url.searchParams.get("applicationId") ?? undefined,
    requirementId: url.searchParams.get("requirementId") ?? undefined,
    includeArchived: url.searchParams.get("includeArchived") === "true",
  });
  return jsonCollectionResponse(
    items,
    {
      cursor: null,
      nextCursor: null,
      limit: items.length,
      hasMore: false,
    },
    context.tracing,
  );
}

export async function handleCreateStory(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.requirements.create", "qep.requirements.edit");
  const tenantId = sessionTenantId(context);
  const body = (await request.json()) as {
    applicationId?: string;
    requirementId?: string;
    title?: string;
    description?: string;
    storyType?: StoryType;
    status?: Exclude<StoryStatus, "archived">;
    priority?: StoryPriority;
    estimatePoints?: number;
    ownerUserId?: string;
    originType?: OriginType;
  };
  if (!body.applicationId || !body.requirementId || !body.title?.trim()) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "applicationId, requirementId and title are required",
    });
  }
  const applicationId = await requireApplication(tenantId, body.applicationId);
  const requirement = await requireRequirement(context, body.requirementId);
  await assertRequirementInApplication(tenantId, applicationId, requirement.projectId);
  try {
    const story = await getDefinitionService().createStory({
      tenantId,
      applicationId,
      requirementId: requirement.id,
      title: body.title,
      actorId: actorId(context),
      description: body.description,
      storyType: body.storyType,
      status: body.status,
      priority: body.priority,
      estimatePoints: body.estimatePoints,
      ownerUserId: body.ownerUserId ?? context.serviceContext.userId,
      originType: body.originType ?? "human",
      correlationId: context.tracing.correlationId,
    });
    return jsonDataResponse({ story }, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetStory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.requirements.view");
  const params = routeContext ? await routeContext.params : {};
  const storyId = requireParam(params, "storyId");
  try {
    const story = await getDefinitionService().getStory(
      sessionTenantId(context),
      storyId,
    );
    const presented = await getDefinitionService().listStories({
      tenantId: sessionTenantId(context),
      requirementId: story.requirementId,
      includeArchived: true,
    });
    const row = presented.find((item) => item.id === story.id) ?? story;
    const criteria = await getDefinitionService().listCriteria({
      tenantId: sessionTenantId(context),
      userStoryId: story.id,
      includeArchived: true,
    });
    return jsonDataResponse({ story: row, criteria }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handlePatchStory(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.requirements.edit");
  const params = routeContext ? await routeContext.params : {};
  const storyId = requireParam(params, "storyId");
  const body = (await request.json()) as {
    title?: string;
    description?: string | null;
    storyType?: StoryType;
    status?: Exclude<StoryStatus, "archived">;
    priority?: StoryPriority;
    estimatePoints?: number | null;
    ownerUserId?: string | null;
    archive?: boolean;
  };
  try {
    if (body.archive) {
      const story = await getDefinitionService().archiveStory(
        sessionTenantId(context),
        storyId,
        actorId(context),
        context.tracing.correlationId,
      );
      return jsonDataResponse({ story }, context.tracing);
    }
    const story = await getDefinitionService().updateStory(
      sessionTenantId(context),
      storyId,
      actorId(context),
      body,
      context.tracing.correlationId,
    );
    return jsonDataResponse({ story }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleListCriteria(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.requirements.view");
  const url = request.nextUrl;
  const userStoryParam = url.searchParams.get("userStoryId");
  const items = await getDefinitionService().listCriteria({
    tenantId: sessionTenantId(context),
    applicationId: url.searchParams.get("applicationId") ?? undefined,
    requirementId: url.searchParams.get("requirementId") ?? undefined,
    userStoryId:
      userStoryParam === "null"
        ? null
        : userStoryParam === null
          ? undefined
          : userStoryParam,
    includeArchived: url.searchParams.get("includeArchived") === "true",
  });
  return jsonCollectionResponse(
    items,
    {
      cursor: null,
      nextCursor: null,
      limit: items.length,
      hasMore: false,
    },
    context.tracing,
  );
}

export async function handleCreateCriterion(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.requirements.create", "qep.requirements.edit");
  const tenantId = sessionTenantId(context);
  const body = (await request.json()) as {
    applicationId?: string;
    requirementId?: string;
    userStoryId?: string;
    text?: string;
    required?: boolean;
    originType?: OriginType;
  };
  if (!body.applicationId || !body.requirementId || !body.text?.trim()) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "applicationId, requirementId and text are required",
    });
  }
  const applicationId = await requireApplication(tenantId, body.applicationId);
  const requirement = await requireRequirement(context, body.requirementId);
  await assertRequirementInApplication(tenantId, applicationId, requirement.projectId);
  try {
    const criterion = await getDefinitionService().createCriterion({
      tenantId,
      applicationId,
      requirementId: requirement.id,
      text: body.text,
      actorId: actorId(context),
      userStoryId: body.userStoryId,
      required: body.required,
      originType: body.originType ?? "human",
      correlationId: context.tracing.correlationId,
    });
    return jsonDataResponse({ criterion }, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetCriterion(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.requirements.view");
  const params = routeContext ? await routeContext.params : {};
  const criterionId = requireParam(params, "criterionId");
  try {
    const criterion = await getDefinitionService().getCriterion(
      sessionTenantId(context),
      criterionId,
    );
    const verification = await getDefinitionService().listVerification(
      sessionTenantId(context),
      criterionId,
    );
    return jsonDataResponse({ criterion, verification }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handlePatchCriterion(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.requirements.edit");
  const params = routeContext ? await routeContext.params : {};
  const criterionId = requireParam(params, "criterionId");
  const body = (await request.json()) as {
    text?: string;
    required?: boolean;
    archive?: boolean;
    userStoryId?: string | null;
  };
  try {
    if (body.archive) {
      const criterion = await getDefinitionService().archiveCriterion(
        sessionTenantId(context),
        criterionId,
        actorId(context),
        context.tracing.correlationId,
      );
      return jsonDataResponse({ criterion }, context.tracing);
    }
    if (body.userStoryId !== undefined) {
      const criterion = await getDefinitionService().reparentCriterion(
        sessionTenantId(context),
        criterionId,
        actorId(context),
        body.userStoryId,
        context.tracing.correlationId,
      );
      return jsonDataResponse({ criterion }, context.tracing);
    }
    const criterion = await getDefinitionService().updateCriterion(
      sessionTenantId(context),
      criterionId,
      actorId(context),
      body,
      context.tracing.correlationId,
    );
    return jsonDataResponse({ criterion }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleLinkVerification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.requirements.edit");
  const params = routeContext ? await routeContext.params : {};
  const criterionId = requireParam(params, "criterionId");
  const body = (await request.json()) as {
    assetKind?: VerificationAssetKind;
    assetId?: string;
    latestResult?: VerificationResult;
  };
  if (!body.assetKind || !body.assetId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "assetKind and assetId are required",
    });
  }
  try {
    const link = await getDefinitionService().linkVerification({
      tenantId: sessionTenantId(context),
      criterionId,
      actorId: actorId(context),
      assetKind: body.assetKind,
      assetId: body.assetId,
      latestResult: body.latestResult,
      correlationId: context.tracing.correlationId,
    });
    return jsonDataResponse({ link }, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleUnlinkVerification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.requirements.edit");
  const params = routeContext ? await routeContext.params : {};
  const linkId = requireParam(params, "linkId");
  try {
    await getDefinitionService().unlinkVerification(
      sessionTenantId(context),
      linkId,
      actorId(context),
      context.tracing.correlationId,
    );
    return jsonDataResponse({ ok: true }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}
