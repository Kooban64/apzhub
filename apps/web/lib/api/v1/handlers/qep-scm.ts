/**
 * Enterprise Source Control Platform HTTP handlers (APZQEP-162).
 * Provider-neutral — no GitHub-specific request/response shapes.
 */

import type { NextRequest } from "next/server";

import type { RegisterRepositoryRequest, ScmProviderId } from "@apzhub/platform-scm";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { getQepScmRuntime } from "@/lib/qep/scm-runtime";

type RouteContext = { params: Promise<Record<string, string>> };

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
  const runtime = getQepScmRuntime();
  return jsonDataResponse({ providers: runtime.listProviders() }, context.tracing);
}

export async function handleConnectScmProvider(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = (await request.json()) as {
    providerId?: ScmProviderId;
    correlationId?: string;
    token?: string;
  };
  if (!body.providerId || !body.correlationId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "providerId and correlationId are required",
    });
  }
  const runtime = getQepScmRuntime();
  try {
    const result = await runtime.connectProvider(
      context.serviceContext.tenantId,
      body.providerId,
      body.correlationId,
      body.token ? { kind: "pat", token: body.token } : { kind: "none" },
    );
    return jsonDataResponse({ connection: result }, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SCM_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleListScmRepositories(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const tenantId =
    request.nextUrl.searchParams.get("tenantId") ?? context.serviceContext.tenantId;
  const runtime = getQepScmRuntime();
  return jsonDataResponse(
    { repositories: runtime.listRepositories(tenantId) },
    context.tracing,
  );
}

export async function handleRegisterScmRepository(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = (await request.json()) as Partial<RegisterRepositoryRequest>;
  const tenantId = body.tenantId ?? context.serviceContext.tenantId;
  const registeredBy = body.registeredBy ?? context.serviceContext.userId;
  if (!tenantId || !body.providerId || !body.fullName || !registeredBy) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "providerId, fullName, and tenant context are required",
    });
  }
  const runtime = getQepScmRuntime();
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
      credentials: body.credentials,
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
  const repositoryId = requireParam(await routeContext?.params, "repositoryId");
  const runtime = getQepScmRuntime();
  const repository = runtime.getRepository(repositoryId);
  if (!repository) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Repository not found",
    });
  }
  const links = runtime.listTraceabilityLinks(repositoryId);
  return jsonDataResponse({ repository, links }, context.tracing);
}

export async function handleSyncScmRepository(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const repositoryId = requireParam(await routeContext?.params, "repositoryId");
  const body = (await request.json().catch(() => ({}))) as { correlationId?: string };
  const runtime = getQepScmRuntime();
  try {
    const result = await runtime.syncRepository(
      repositoryId,
      body.correlationId ?? crypto.randomUUID(),
    );
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SCM_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleListScmWebhooks(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const tenantId =
    request.nextUrl.searchParams.get("tenantId") ?? context.serviceContext.tenantId;
  const runtime = getQepScmRuntime();
  return jsonDataResponse(
    { webhooks: runtime.listWebhookAudits(tenantId) },
    context.tracing,
  );
}

export async function handleIngestScmWebhook(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
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
      tenantId: context.serviceContext.tenantId,
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

export async function handleSetScmRepositoryState(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
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
    const link = runtime.addTraceabilityLink({
      tenantId: context.serviceContext.tenantId,
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
