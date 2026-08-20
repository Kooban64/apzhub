import type { NextRequest } from "next/server";

import {
  deriveApplicationKey,
  type ApplicationStatus,
  type EnvironmentCategory,
} from "@apzhub/qep-applications";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { getApplicationService } from "@/lib/qep/application-runtime";
import {
  legacyAssociationReport,
  presentApplications,
  reconcileApplicationLegacyContext,
} from "@/lib/qep/application-context-runtime";
import {
  filterApplicationsByScope,
  isApplicationInScope,
  resolveQepApplicationScope,
} from "@/lib/qep/application-scope";
import {
  listQualityProjects,
  type QualityProject,
} from "@/lib/qep/quality-project-store";
import { getQepScmRuntime } from "@/lib/qep/scm-runtime";
import { listConnectorStates } from "@/lib/qep/integrations-store";
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
  if (message.endsWith(".not_found") || message === "application.not_found") {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (message === "application.key_conflict") {
    throw new PlatformApiHttpError(409, { code: "CONFLICT", message });
  }
  if (message === "application.execution_target.raw_secret_forbidden") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "Raw secrets are not stored on execution targets. Use credentialRef.",
    });
  }
  throw new PlatformApiHttpError(400, { code: "VALIDATION_FAILED", message });
}

async function uniqueKey(tenantId: string, desired: string): Promise<string> {
  const service = getApplicationService();
  let key = desired;
  for (let i = 2; i < 50; i += 1) {
    const existing = await service.list({ tenantId, includeArchived: true });
    if (!existing.some((row) => row.key === key)) return key;
    key = `${desired.slice(0, 28)}_${i}`;
  }
  return `${desired}_${Date.now().toString(36).slice(-4)}`.slice(0, 32);
}

export async function promoteLegacyQualityProjects(
  tenantId: string,
  actor: string,
): Promise<number> {
  const service = getApplicationService();
  const existing = await service.list({ tenantId, includeArchived: true });
  const known = new Set(
    existing.flatMap((row) =>
      [row.id, row.legacyQualityProjectId].filter((value): value is string =>
        Boolean(value),
      ),
    ),
  );
  const projects: readonly QualityProject[] = listQualityProjects({
    tenantId,
    limit: 500,
  });
  let migrated = 0;
  for (const project of projects) {
    if (known.has(project.id)) continue;
    const status: ApplicationStatus =
      project.status === "draft"
        ? "setup"
        : project.status === "active"
          ? "active"
          : "setup";
    const key = await uniqueKey(tenantId, deriveApplicationKey(project.name));
    const created = await service.create({
      tenantId,
      id: project.id,
      name: project.name,
      key,
      actorId: actor,
      description: project.description,
      ownerUserId: project.ownerUserId,
      status,
      legacyQualityProjectId: project.id,
    });
    known.add(created.id);
    migrated += 1;
    for (const repositoryId of project.repositoryIds) {
      await service.attachRepository(tenantId, created.id, repositoryId, actor);
    }
  }
  return migrated;
}

function requireApplicationAccess(
  context: PlatformApiRequestContext,
  applicationId: string,
): void {
  const scope = resolveQepApplicationScope(context.serviceContext.permissions);
  if (!isApplicationInScope(applicationId, scope)) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "application.not_found",
    });
  }
}

export async function handleListApplications(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(
    context,
    "qep.portfolio.read",
    "qep.scm.read",
    "qep.dashboards.read",
  );
  const tenantId = sessionTenantId(context);
  await promoteLegacyQualityProjects(tenantId, actorId(context));
  const associations = await reconcileApplicationLegacyContext(tenantId);
  const url = new URL(request.url);
  const items = await getApplicationService().list({
    tenantId,
    query: url.searchParams.get("q") ?? undefined,
    status: (url.searchParams.get("status") as ApplicationStatus | null) ?? undefined,
    ownerUserId: url.searchParams.get("owner") ?? undefined,
  });
  const scoped = filterApplicationsByScope(
    items,
    resolveQepApplicationScope(context.serviceContext.permissions),
  );
  const applications = await presentApplications(scoped, associations);
  return jsonDataResponse(
    {
      applications,
      legacyAssociations: legacyAssociationReport(associations),
    },
    context.tracing,
  );
}

export async function handleCreateApplication(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(
    context,
    "qep.portfolio.operate",
    "qep.scm.operate",
    "qep.quality_flows.operate",
  );
  const tenantId = sessionTenantId(context);
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    key?: string;
    description?: string;
    ownerUserId?: string;
    status?: ApplicationStatus;
  };
  try {
    const created = await getApplicationService().create({
      tenantId,
      name: body.name ?? "",
      key: body.key ?? "",
      actorId: actorId(context),
      description: body.description,
      ownerUserId: body.ownerUserId ?? actorId(context),
      status: body.status,
    });
    return jsonDataResponse({ application: created }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetApplication(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.portfolio.read",
    "qep.scm.read",
    "qep.dashboards.read",
  );
  const tenantId = sessionTenantId(context);
  const params = await routeContext?.params;
  const applicationId = requireParam(params, "applicationId");
  requireApplicationAccess(context, applicationId);
  try {
    const application = await getApplicationService().get(tenantId, applicationId);
    const associations = await reconcileApplicationLegacyContext(tenantId);
    const [presented] = await presentApplications([application], associations);
    const [repositories, environments, targets] = await Promise.all([
      getApplicationService().listRepositories(tenantId, applicationId),
      getApplicationService().listEnvironments(tenantId, applicationId),
      getApplicationService().listExecutionTargets(tenantId, applicationId),
    ]);
    const connectors = listConnectorStates();
    return jsonDataResponse(
      {
        application: presented ?? {
          ...application,
          ownerDisplayName: "Unavailable",
          projectRefs: [application.id],
        },
        setup: {
          repositories: repositories.length > 0 ? "configured" : "not_configured",
          environments: environments.length > 0 ? "configured" : "not_configured",
          executionTargets: targets.length > 0 ? "configured" : "not_configured",
          integrations:
            connectors.some((row) => row.enabled) || repositories.length > 0
              ? "configured"
              : "not_configured",
        },
        counts: {
          repositories: repositories.length,
          environments: environments.length,
          executionTargets: targets.length,
        },
      },
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleUpdateApplication(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.portfolio.operate", "qep.scm.operate");
  const tenantId = sessionTenantId(context);
  const params = await routeContext?.params;
  const applicationId = requireParam(params, "applicationId");
  requireApplicationAccess(context, applicationId);
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    description?: string | null;
    ownerUserId?: string | null;
    status?: ApplicationStatus;
    archive?: boolean;
  };
  try {
    const application = body.archive
      ? await getApplicationService().archive(tenantId, applicationId, actorId(context))
      : await getApplicationService().update(
          tenantId,
          applicationId,
          actorId(context),
          body,
        );
    return jsonDataResponse({ application }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleListApplicationRepositories(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.portfolio.read", "qep.scm.read");
  const tenantId = sessionTenantId(context);
  const params = await routeContext?.params;
  const applicationId = requireParam(params, "applicationId");
  requireApplicationAccess(context, applicationId);
  const links = await getApplicationService().listRepositories(tenantId, applicationId);
  const scm = getQepScmRuntime();
  const hasSourceRead = (context.serviceContext.permissions ?? []).some(
    (key) => key === "source.read" || key === "source.*" || key === "*",
  );
  const items = await Promise.all(
    links.map(async (link) => {
      const repo = await scm.getRepository(link.scmRepositoryId).catch(() => undefined);
      return {
        ...link,
        fullName: repo?.fullName,
        defaultBranch: repo?.defaultBranch,
        state: repo ? "connected" : "unavailable",
        sourceAccess: hasSourceRead && repo ? "read" : "unavailable",
      };
    }),
  );
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleAttachApplicationRepository(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.portfolio.operate", "qep.scm.operate");
  const tenantId = sessionTenantId(context);
  const params = await routeContext?.params;
  const applicationId = requireParam(params, "applicationId");
  requireApplicationAccess(context, applicationId);
  const body = (await request.json().catch(() => ({}))) as { scmRepositoryId?: string };
  const scmRepositoryId = body.scmRepositoryId?.trim() ?? "";
  const scm = getQepScmRuntime();
  const repo = await scm.getRepository(scmRepositoryId);
  if (!repo || repo.tenantId !== tenantId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "Unknown repository",
    });
  }
  try {
    const link = await getApplicationService().attachRepository(
      tenantId,
      applicationId,
      scmRepositoryId,
      actorId(context),
    );
    return jsonDataResponse({ item: link }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleListEnvironments(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.portfolio.read");
  const tenantId = sessionTenantId(context);
  const params = await routeContext?.params;
  const applicationId = requireParam(params, "applicationId");
  requireApplicationAccess(context, applicationId);
  const items = await getApplicationService().listEnvironments(tenantId, applicationId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateEnvironment(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.portfolio.operate");
  const tenantId = sessionTenantId(context);
  const params = await routeContext?.params;
  const applicationId = requireParam(params, "applicationId");
  requireApplicationAccess(context, applicationId);
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    category?: EnvironmentCategory;
    description?: string;
    baseUrl?: string;
  };
  try {
    const item = await getApplicationService().createEnvironment(
      tenantId,
      applicationId,
      {
        name: body.name ?? "",
        category: body.category ?? "custom",
        actorId: actorId(context),
        description: body.description,
        baseUrl: body.baseUrl,
      },
    );
    return jsonDataResponse({ item }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetEnvironment(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.portfolio.read");
  const tenantId = sessionTenantId(context);
  const params = await routeContext?.params;
  const applicationId = requireParam(params, "applicationId");
  const environmentId = requireParam(params, "environmentId");
  requireApplicationAccess(context, applicationId);
  try {
    const item = await getApplicationService().getEnvironment(
      tenantId,
      applicationId,
      environmentId,
    );
    return jsonDataResponse({ item }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleListExecutionTargets(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.portfolio.read");
  const tenantId = sessionTenantId(context);
  const params = await routeContext?.params;
  const applicationId = requireParam(params, "applicationId");
  requireApplicationAccess(context, applicationId);
  const items = await getApplicationService().listExecutionTargets(
    tenantId,
    applicationId,
  );
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateExecutionTarget(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.portfolio.operate");
  const tenantId = sessionTenantId(context);
  const params = await routeContext?.params;
  const applicationId = requireParam(params, "applicationId");
  requireApplicationAccess(context, applicationId);
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    targetType?: string;
    environmentId?: string;
    status?: "not_configured" | "configured" | "available";
    config?: Record<string, unknown>;
  };
  try {
    const item = await getApplicationService().createExecutionTarget(
      tenantId,
      applicationId,
      {
        name: body.name ?? "",
        targetType: body.targetType ?? "remote_host",
        actorId: actorId(context),
        environmentId: body.environmentId,
        status: body.status,
        config: body.config,
      },
    );
    return jsonDataResponse({ item }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetExecutionTarget(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.portfolio.read");
  const tenantId = sessionTenantId(context);
  const params = await routeContext?.params;
  const applicationId = requireParam(params, "applicationId");
  const targetId = requireParam(params, "targetId");
  requireApplicationAccess(context, applicationId);
  try {
    const item = await getApplicationService().getExecutionTarget(
      tenantId,
      applicationId,
      targetId,
    );
    return jsonDataResponse({ item }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}
