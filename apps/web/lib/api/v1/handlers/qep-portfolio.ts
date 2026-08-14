/**
 * Flagship F14 — Portfolio / Quality Project HTTP handlers.
 * PAT never accepted from client — token health is server-secrets only.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import {
  composeQualityProjectInsight,
  getScmTokenHealth,
} from "@/lib/qep/quality-project-insight";
import {
  attachRepositoriesToQualityProject,
  createQualityProject,
  getQualityProject,
  listQualityProjects,
} from "@/lib/qep/quality-project-store";
import {
  attachSourceBindingsToProject,
  listProjectSourceBindings,
  parseSourceBindingInputs,
} from "@/lib/commercial/project-source-bindings";
import { getQepScmRuntime } from "@/lib/qep/scm-runtime";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

type RouteContext = { params: Promise<Record<string, string>> };

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

function mapProjectError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "quality_project.not_found") {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Quality project not found",
    });
  }
  if (
    message === "quality_project.name_required" ||
    message === "quality_project.name_too_long"
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message,
    });
  }
  throw new PlatformApiHttpError(400, {
    code: "PORTFOLIO_ERROR",
    message,
  });
}

export async function handleListQualityProjects(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(
    context,
    "qep.portfolio.read",
    "qep.scm.read",
    "qep.dashboards.read",
  );
  const tenantId = sessionTenantId(context);
  const projects = listQualityProjects({ tenantId }).map((project) => ({
    ...project,
    sourceBindings: listProjectSourceBindings({
      tenantId,
      productKey: "qep",
      projectId: project.id,
    }),
  }));
  const tokenHealth = getScmTokenHealth();
  return jsonDataResponse(
    { projects, tokenHealth, advisory: true as const },
    context.tracing,
  );
}

export async function handleCreateQualityProject(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(
    context,
    "qep.portfolio.operate",
    "qep.scm.operate",
    "qep.quality_flows.operate",
  );
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    description?: string;
    repositoryIds?: unknown;
    /** GitHub (etc.) details at project create — QEP only with APZPEN */
    source?: unknown;
    sourceBindings?: unknown;
  };
  const repositoryIds = Array.isArray(body.repositoryIds)
    ? body.repositoryIds.filter((id): id is string => typeof id === "string")
    : [];
  const sourceBindings = parseSourceBindingInputs(body.sourceBindings ?? body.source);

  try {
    if (repositoryIds.length > 0) {
      const scm = getQepScmRuntime();
      for (const repositoryId of repositoryIds) {
        const repo = await scm.getRepository(repositoryId);
        if (!repo || repo.tenantId !== sessionTenantId(context)) {
          throw new PlatformApiHttpError(400, {
            code: "VALIDATION_FAILED",
            message: `Unknown repositoryId: ${repositoryId}`,
          });
        }
      }
    }
    const tenantId = sessionTenantId(context);
    const project = createQualityProject({
      tenantId,
      name: body.name ?? "",
      description: body.description,
      ownerUserId: context.serviceContext.userId,
      createdBy: context.serviceContext.userId,
      repositoryIds,
    });
    const bindings =
      sourceBindings.length > 0
        ? attachSourceBindingsToProject({
            tenantId,
            projectId: project.id,
            productKey: "qep",
            bindings: sourceBindings,
          })
        : [];
    return jsonDataResponse(
      {
        project: { ...project, sourceBindings: bindings },
        tokenHealth: getScmTokenHealth(),
      },
      context.tracing,
    );
  } catch (error) {
    if (error instanceof PlatformApiHttpError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith("source.")) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_FAILED",
        message,
      });
    }
    mapProjectError(error);
  }
}

export async function handleGetQualityProjectInsight(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.portfolio.read",
    "qep.scm.read",
    "qep.dashboards.read",
    "qep.certification.read",
  );
  const projectId = requireParam(await routeContext?.params, "projectId");
  try {
    const insight = await composeQualityProjectInsight({
      tenantId: sessionTenantId(context),
      projectId,
    });
    return jsonDataResponse(insight, context.tracing);
  } catch (error) {
    mapProjectError(error);
  }
}

export async function handleAttachRepositoriesToQualityProject(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.portfolio.operate",
    "qep.scm.operate",
    "qep.quality_flows.operate",
  );
  const projectId = requireParam(await routeContext?.params, "projectId");
  const body = (await request.json().catch(() => ({}))) as {
    repositoryIds?: unknown;
    source?: unknown;
    sourceBindings?: unknown;
  };
  const repositoryIds = Array.isArray(body.repositoryIds)
    ? body.repositoryIds.filter((id): id is string => typeof id === "string")
    : [];
  const sourceBindings = parseSourceBindingInputs(body.sourceBindings ?? body.source);
  if (repositoryIds.length === 0 && sourceBindings.length === 0) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "repositoryIds or sourceBindings required",
    });
  }

  try {
    const tenantId = sessionTenantId(context);
    if (!getQualityProject(tenantId, projectId)) {
      throw new Error("quality_project.not_found");
    }
    if (repositoryIds.length > 0) {
      const scm = getQepScmRuntime();
      for (const repositoryId of repositoryIds) {
        const repo = await scm.getRepository(repositoryId);
        if (!repo || repo.tenantId !== tenantId) {
          throw new PlatformApiHttpError(400, {
            code: "VALIDATION_FAILED",
            message: `Unknown repositoryId: ${repositoryId}`,
          });
        }
      }
    }
    const project =
      repositoryIds.length > 0
        ? attachRepositoriesToQualityProject({
            tenantId,
            projectId,
            repositoryIds,
          })
        : getQualityProject(tenantId, projectId)!;
    const bindings =
      sourceBindings.length > 0
        ? attachSourceBindingsToProject({
            tenantId,
            projectId,
            productKey: "qep",
            bindings: sourceBindings,
          })
        : listProjectSourceBindings({
            tenantId,
            productKey: "qep",
            projectId,
          });
    return jsonDataResponse(
      { project: { ...project, sourceBindings: bindings } },
      context.tracing,
    );
  } catch (error) {
    if (error instanceof PlatformApiHttpError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith("source.")) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_FAILED",
        message,
      });
    }
    mapProjectError(error);
  }
}
