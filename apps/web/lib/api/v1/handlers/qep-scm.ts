/**
 * Enterprise Source Control Platform HTTP handlers (APZQEP-162).
 * Provider-neutral — no GitHub-specific request/response shapes.
 */

import type { NextRequest } from "next/server";

import type { RegisterRepositoryRequest, ScmProviderId } from "@apzhub/platform-scm";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse, jsonErrorResponse } from "../response";
import {
  createPlatformApiTracing,
  resolvePlatformApiTracing,
} from "../request-context";
import {
  acceptRegressionProposal,
  buildChangeImpact,
  proposeRegressionPack,
} from "@/lib/qep/scm-impact";
import {
  acceptTestDesignProposal,
  proposeTestDesignPack,
} from "@/lib/qep/test-design-assist";
import {
  defaultScmTenantId,
  getQepScmRuntime,
  resolveGithubPatFromEnv,
} from "@/lib/qep/scm-runtime";
import {
  filterRepositoriesBySourceScope,
  isRepositoryInSourceScope,
  resolveSourceRepoScope,
} from "@/lib/source/repo-scope";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

type RouteContext = { params: Promise<Record<string, string>> };

function serverGithubCredentials(tenantId: string) {
  const runtime = getQepScmRuntime();
  const pat = resolveGithubPatFromEnv();
  if (pat) {
    runtime.setDefaultCredentials(tenantId, "github", { kind: "pat", token: pat });
    return { kind: "pat" as const, token: pat };
  }
  return { kind: "none" as const };
}

function requireParam(
  params: Record<string, string> | undefined,
  name: string,
): string {
  const value = params?.[name];
  if (!value) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: `Missing ${name}`,
    });
  }
  return value;
}

export async function handleListScmProviders(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.scm.read");
  const runtime = getQepScmRuntime();
  return jsonDataResponse({ providers: runtime.listProviders() }, context.tracing);
}

export async function handleConnectScmProvider(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.scm.operate");
  const body = (await request.json()) as {
    providerId?: ScmProviderId;
    correlationId?: string;
    /** Ignored — PATs come from `.secrets/git` / server env only (F1). */
    token?: string;
  };
  if (!body.providerId || !body.correlationId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "providerId and correlationId are required",
    });
  }
  const tenantId = sessionTenantId(context);
  const runtime = getQepScmRuntime();
  const credentials =
    body.providerId === "github"
      ? serverGithubCredentials(tenantId)
      : { kind: "none" as const };
  try {
    const result = await runtime.connectProvider(
      tenantId,
      body.providerId,
      body.correlationId,
      credentials,
    );
    return jsonDataResponse(
      {
        connection: result,
        liveModeEnabled: process.env.APZHUB_SCM_GITHUB_LIVE === "true",
        credentialsSource: credentials.kind === "pat" ? "server_secrets" : "none",
      },
      context.tracing,
    );
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SCM_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleListScmRepositories(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.scm.read");
  const tenantId = sessionTenantId(context);
  const runtime = getQepScmRuntime();
  const repositories = await runtime.listRepositories(tenantId);
  const scope = resolveSourceRepoScope(context.serviceContext.permissions);
  return jsonDataResponse(
    { repositories: filterRepositoriesBySourceScope(repositories, scope) },
    context.tracing,
  );
}

export async function handleRegisterScmRepository(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.scm.operate");
  const body = (await request.json()) as Partial<RegisterRepositoryRequest>;
  const tenantId = sessionTenantId(context);
  const registeredBy = context.serviceContext.userId;
  if (!tenantId || !body.providerId || !body.fullName || !registeredBy) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "providerId, fullName, and tenant context are required",
    });
  }
  const runtime = getQepScmRuntime();
  if (body.providerId === "github") {
    serverGithubCredentials(tenantId);
  }
  try {
    const repository = await runtime.registerRepository({
      tenantId,
      providerId: body.providerId,
      fullName: body.fullName,
      externalId: body.externalId,
      defaultBranch: body.defaultBranch,
      visibility: body.visibility,
      htmlUrl: body.htmlUrl,
      selectedBranches: body.selectedBranches,
      metadata: body.metadata,
      registeredBy,
      // Never accept client-supplied PATs — server secrets only (F1).
      credentials:
        body.providerId === "github" ? serverGithubCredentials(tenantId) : undefined,
    });
    return jsonDataResponse({ repository }, context.tracing, { status: 201 });
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SCM_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleGetScmRepository(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.scm.read");
  const repositoryId = requireParam(await routeContext?.params, "repositoryId");
  const scope = resolveSourceRepoScope(context.serviceContext.permissions);
  if (!isRepositoryInSourceScope(repositoryId, scope)) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Source repository scope does not include this repository",
    });
  }
  const runtime = getQepScmRuntime();
  const repository = await runtime.getRepository(repositoryId);
  if (!repository || repository.tenantId !== sessionTenantId(context)) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Repository not found",
    });
  }
  const links = await runtime.listTraceabilityLinks(repositoryId);
  const changes = await runtime.listChangeEvents({
    tenantId: sessionTenantId(context),
    repositoryId,
    limit: 50,
  });
  return jsonDataResponse({ repository, links, changes }, context.tracing);
}

export async function handleListScmChangeEvents(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.scm.read");
  const tenantId = sessionTenantId(context);
  const url = new URL(request.url);
  const repositoryId = url.searchParams.get("repositoryId") ?? undefined;
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : 50;
  const runtime = getQepScmRuntime();
  return jsonDataResponse(
    {
      changes: await runtime.listChangeEvents({
        tenantId,
        repositoryId,
        limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50,
      }),
    },
    context.tracing,
  );
}

export async function handleSyncScmRepository(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.scm.operate");
  const repositoryId = requireParam(await routeContext?.params, "repositoryId");
  const body = (await request.json().catch(() => ({}))) as { correlationId?: string };
  const runtime = getQepScmRuntime();
  const repository = await runtime.getRepository(repositoryId);
  if (!repository || repository.tenantId !== sessionTenantId(context)) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Repository not found",
    });
  }
  if (repository.providerId === "github") {
    serverGithubCredentials(repository.tenantId);
  }
  try {
    const result = await runtime.syncRepository(
      repositoryId,
      body.correlationId ?? crypto.randomUUID(),
    );
    const changes = await runtime.listChangeEvents({
      tenantId: repository.tenantId,
      repositoryId,
      limit: 50,
    });
    return jsonDataResponse({ ...result, changes }, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SCM_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleListScmWebhooks(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.scm.read");
  const tenantId = sessionTenantId(context);
  const runtime = getQepScmRuntime();
  return jsonDataResponse(
    { webhooks: await runtime.listWebhookAudits(tenantId) },
    context.tracing,
  );
}

export async function handleIngestScmWebhook(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  // Authenticated ingest retained for operator replay/tests.
  const providerId = requireParam(
    await routeContext?.params,
    "providerId",
  ) as ScmProviderId;
  const rawBody = await request.text();
  let payload: unknown = {};
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    payload = { raw: rawBody };
  }
  const headers: Record<string, string | undefined> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const runtime = getQepScmRuntime();
  try {
    const result = await runtime.ingestWebhook({
      tenantId: sessionTenantId(context),
      providerId,
      headers,
      rawBody,
      payload,
      correlationId: context.tracing.correlationId,
    });
    return jsonDataResponse(result, context.tracing, {
      status: result.audit.state === "rejected" ? 401 : 202,
    });
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SCM_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Flagship F1 — public GitHub webhook ingress (HMAC only, no session).
 * POST /api/v1/qep/scm/ingress/[providerId]?tenantId=...
 */
export async function handlePublicScmWebhookIngress(
  request: NextRequest,
  routeContext?: RouteContext,
): Promise<Response> {
  const tracingResult = resolvePlatformApiTracing(request);
  const tracing = tracingResult.ok ? tracingResult.context : createPlatformApiTracing();
  const providerId = (await routeContext?.params)?.providerId as
    ScmProviderId | undefined;
  if (!providerId) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_FAILED", message: "Missing providerId" },
      tracing,
    );
  }

  const url = new URL(request.url);
  const tenantId =
    url.searchParams.get("tenantId")?.trim() ||
    request.headers.get("x-apzhub-tenant-id")?.trim() ||
    defaultScmTenantId();

  const rawBody = await request.text();
  let payload: unknown = {};
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    payload = { raw: rawBody };
  }
  const headers: Record<string, string | undefined> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const runtime = getQepScmRuntime();
  try {
    const result = await runtime.ingestWebhook({
      tenantId,
      providerId,
      headers,
      rawBody,
      payload,
      correlationId: tracing.correlationId,
    });
    return jsonDataResponse(result, tracing, {
      status: result.audit.state === "rejected" ? 401 : 202,
    });
  } catch (error) {
    return jsonErrorResponse(
      400,
      {
        code: "SCM_ERROR",
        message: error instanceof Error ? error.message : String(error),
      },
      tracing,
    );
  }
}

export async function handleSetScmRepositoryState(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.scm.operate");
  const repositoryId = requireParam(await routeContext?.params, "repositoryId");
  const body = (await request.json()) as { state?: "enabled" | "disabled" };
  if (body.state !== "enabled" && body.state !== "disabled") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "state must be enabled or disabled",
    });
  }
  const runtime = getQepScmRuntime();
  try {
    const repository = await runtime.setRepositoryState(
      repositoryId,
      body.state,
      context.serviceContext.userId,
    );
    return jsonDataResponse({ repository }, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SCM_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleCreateScmTraceabilityLink(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.scm.operate");
  const body = (await request.json()) as {
    repositoryId?: string;
    kind?: Parameters<
      ReturnType<typeof getQepScmRuntime>["addTraceabilityLink"]
    >[0]["kind"];
    externalRef?: string;
    platformRef?: string;
    note?: string;
  };
  if (!body.repositoryId || !body.kind || !body.externalRef) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "repositoryId, kind, and externalRef are required",
    });
  }
  const runtime = getQepScmRuntime();
  try {
    const link = await runtime.addTraceabilityLink({
      tenantId: sessionTenantId(context),
      repositoryId: body.repositoryId,
      kind: body.kind,
      externalRef: body.externalRef,
      platformRef: body.platformRef,
      note: body.note,
      createdBy: context.serviceContext.userId,
    });
    return jsonDataResponse({ link }, context.tracing, { status: 201 });
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SCM_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function mapScmImpactError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "scm.impact.change_not_found") {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Change event not found",
    });
  }
  if (message === "scm.impact.suite_not_in_proposal") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "suiteId is not in the advisory regression proposal",
    });
  }
  if (message === "scm.design.empty_proposal") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "No advisory design drafts available to accept",
    });
  }
  if (message === "scm.design.proposal_item_required") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "proposalItemIds or acceptAll is required",
    });
  }
  if (message === "scm.design.item_not_in_proposal") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "proposalItemId is not in the advisory design proposal",
    });
  }
  if (message === "scm.design.change_id_required") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "changeEventId is required",
    });
  }
  throw new PlatformApiHttpError(400, {
    code: "SCM_IMPACT_ERROR",
    message,
  });
}

/** Flagship F2 — Quality Graph impact for a durable change event. */
export async function handleGetScmChangeImpact(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.scm.read");
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  try {
    const impact = await buildChangeImpact(
      sessionTenantId(context),
      changeEventId,
      context.serviceContext.userId,
    );
    return jsonDataResponse({ impact }, context.tracing);
  } catch (error) {
    mapScmImpactError(error);
  }
}

/** Flagship F2 — advisory regression pack (human must accept). */
export async function handleProposeScmRegression(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.scm.read");
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  try {
    const proposal = await proposeRegressionPack(
      sessionTenantId(context),
      changeEventId,
    );
    return jsonDataResponse({ proposal }, context.tracing);
  } catch (error) {
    mapScmImpactError(error);
  }
}

/** Flagship F2 — accept advisory pack → draft execution plan on native SoR. */
export async function handleAcceptScmRegression(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.scm.operate");
  requireQepPermission(context, "qep.execution_plans.create");
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  const body = (await request.json().catch(() => ({}))) as {
    suiteId?: string;
    planName?: string;
  };
  if (!body.suiteId?.trim()) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "suiteId is required",
    });
  }
  try {
    const result = await acceptRegressionProposal({
      tenantId: sessionTenantId(context),
      userId: context.serviceContext.userId,
      permissions: context.serviceContext.permissions,
      changeEventId,
      suiteId: body.suiteId.trim(),
      planName: body.planName,
    });
    return jsonDataResponse({ acceptance: result }, context.tracing, { status: 201 });
  } catch (error) {
    mapScmImpactError(error);
  }
}

/** Flagship F7 — advisory test design pack (human must accept → draft specs). */
export async function handleProposeScmDesign(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.scm.read");
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  try {
    const proposal = await proposeTestDesignPack(
      sessionTenantId(context),
      changeEventId,
    );
    return jsonDataResponse({ proposal }, context.tracing);
  } catch (error) {
    mapScmImpactError(error);
  }
}

/** Flagship F7 — accept design drafts → native Spec SoR + optional traces. */
export async function handleAcceptScmDesign(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.scm.operate");
  requireQepPermission(context, "qep.specification.create");
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  const body = (await request.json().catch(() => ({}))) as {
    proposalItemIds?: string[];
    acceptAll?: boolean;
  };
  try {
    const result = await acceptTestDesignProposal({
      serviceContext: context.serviceContext,
      changeEventId,
      proposalItemIds: body.proposalItemIds,
      acceptAll: body.acceptAll === true,
    });
    return jsonDataResponse({ acceptance: result }, context.tracing, { status: 201 });
  } catch (error) {
    mapScmImpactError(error);
  }
}
