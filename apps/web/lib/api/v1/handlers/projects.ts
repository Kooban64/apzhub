import type { NextRequest } from "next/server";

import {
  createProjectsLifecycleService,
  getMemoryProjectsLifecycleStore,
  setProjectsLifecycleStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import {
  jsonCollectionResponse,
  jsonDataResponse,
  jsonErrorResponse,
} from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  createProjectBodySchema,
  projectIdParamSchema,
  projectListQuerySchema,
  updateProjectBodySchema,
} from "../schemas/project";
import { toListQuery, toPlatformApiPage } from "./paging";
import { buildProjectsEngineHealthPayload } from "@/lib/projects/engine-health-payload";
import {
  filterProjectsByScope,
  isProjectInScope,
  resolveProjectsResourceScope,
} from "@/lib/projects/project-scope";
import { PlatformApiHttpError } from "../errors";

export { buildProjectsEngineHealthPayload } from "@/lib/projects/engine-health-payload";

function lifecycleService() {
  try {
    return createProjectsLifecycleService();
  } catch {
    setProjectsLifecycleStoreForTests(getMemoryProjectsLifecycleStore());
    return createProjectsLifecycleService(getMemoryProjectsLifecycleStore());
  }
}

async function withLifecycleStatus<T extends { id: string; status: string }>(
  context: PlatformApiRequestContext,
  project: T,
): Promise<T> {
  const life = await lifecycleService().getLifecycle(
    context.serviceContext,
    project.id,
  );
  if (!life) return project;
  return { ...project, status: life.stage };
}

export async function handleListProjects(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(projectListQuerySchema, request.nextUrl.searchParams);
  const listQuery = toListQuery(query);

  // SPR-ADOPT-002 — when Plane adapter is not enabled/configured, return an honest
  // empty collection instead of a CONFIGURATION_ERROR 500 (Readiness already explains).
  const { getPlaneConfigurationDiagnostics } =
    await import("@apzhub/config/governance");
  const diagnostics = getPlaneConfigurationDiagnostics(process.env);
  if (!diagnostics.integrationEnabled || diagnostics.healthStatus !== "configured") {
    const limit = listQuery.page?.perPage ?? 20;
    return jsonCollectionResponse(
      [],
      {
        cursor: query.cursor ?? null,
        nextCursor: null,
        limit,
        hasMore: false,
      },
      context.tracing,
    );
  }

  const gateway = await getPlatformServiceGateway();
  const result = await gateway.projects.listProjects(context.serviceContext, {
    page: listQuery.page,
    sort: listQuery.sort as
      | readonly {
          field: "name" | "createdAt" | "updatedAt" | "identifier" | "status";
          direction: "asc" | "desc";
        }[]
      | undefined,
    filter: {
      workspaceId: query.workspaceId,
      status: query.status,
    },
  });

  const scope = resolveProjectsResourceScope(context.serviceContext.permissions);
  const scopedItems = filterProjectsByScope(result.items, scope);
  const items = await Promise.all(
    scopedItems.map((item) => withLifecycleStatus(context, item)),
  );

  return jsonCollectionResponse(
    items,
    toPlatformApiPage({ ...result, items: scopedItems }, query),
    context.tracing,
  );
}

export async function handleGetProject(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const scope = resolveProjectsResourceScope(context.serviceContext.permissions);
  if (!isProjectInScope(projectId, scope)) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Project scope does not include this project",
    });
  }
  const gateway = await getPlatformServiceGateway();
  const project = await gateway.projects.getProject(context.serviceContext, projectId);
  return jsonDataResponse(await withLifecycleStatus(context, project), context.tracing);
}

export async function handleCreateProject(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createProjectBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const project = await gateway.projects.createProject(context.serviceContext, body);
  return jsonDataResponse(project, context.tracing, { status: 201 });
}

export async function handleUpdateProject(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const scope = resolveProjectsResourceScope(context.serviceContext.permissions);
  if (!isProjectInScope(projectId, scope)) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Project scope does not include this project",
    });
  }
  const body = await parseJsonBody(
    request,
    updateProjectBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  if ("status" in body && body.status !== undefined) {
    return jsonErrorResponse(
      400,
      {
        code: "VALIDATION_ERROR",
        message:
          "Direct status edits are prohibited. Use POST /api/v1/projects/{id}/lifecycle/transitions.",
      },
      context.tracing,
    );
  }
  const gateway = await getPlatformServiceGateway();
  const project = await gateway.projects.updateProject(
    context.serviceContext,
    projectId,
    body,
  );
  return jsonDataResponse(project, context.tracing);
}

/**
 * DELETE archive is blocked when lifecycle metadata exists.
 * Archive must use POST …/lifecycle/transitions with to=archived (from Closed only).
 * Legacy projects without lifecycle still soft-archive via Plane.
 */
export async function handleArchiveProject(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const scope = resolveProjectsResourceScope(context.serviceContext.permissions);
  if (!isProjectInScope(projectId, scope)) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Project scope does not include this project",
    });
  }
  const life = await lifecycleService().getLifecycle(context.serviceContext, projectId);
  if (life) {
    return jsonErrorResponse(
      400,
      {
        code: "VALIDATION_ERROR",
        message:
          "Archive via lifecycle only: POST /api/v1/projects/{id}/lifecycle/transitions with to=archived (from Closed).",
      },
      context.tracing,
    );
  }
  const gateway = await getPlatformServiceGateway();
  const project = await gateway.projects.archiveProject(
    context.serviceContext,
    projectId,
  );
  return jsonDataResponse(project, context.tracing);
}

/**
 * SPR-APZPRD-001-D / 003-B — BetterAuth session + Projects adapter posture (no Authentik).
 * Config/diagnostics only; optional live list probe when Plane is enabled.
 */
export async function handleGetProjectsEngineHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const { getPlaneConfigurationDiagnostics } =
    await import("@apzhub/config/governance");
  const diagnostics = getPlaneConfigurationDiagnostics(process.env);
  let liveListOk: boolean | null = null;
  let liveListError: string | undefined;
  if (diagnostics.integrationEnabled && diagnostics.healthStatus === "configured") {
    try {
      const gateway = await getPlatformServiceGateway();
      await gateway.projects.listProjects(context.serviceContext, {
        page: { page: 1, perPage: 1 },
      });
      liveListOk = true;
    } catch (error) {
      liveListOk = false;
      liveListError = error instanceof Error ? error.message : String(error);
    }
  }

  return jsonDataResponse(
    buildProjectsEngineHealthPayload({
      userId: context.serviceContext.userId,
      diagnostics,
      liveListOk,
      ...(liveListError ? { liveListError } : {}),
    }),
    context.tracing,
  );
}

/** ADOPT-003 F1 — dedicated readiness path (avoid `[projectId]` collision). */
export const handleGetProjectsReadiness = handleGetProjectsEngineHealth;
