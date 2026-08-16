/**
 * Shared Source Workspace HTTP handlers (Phase E).
 * Provider-neutral content + write surface over registered SCM repositories.
 */

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { getQepScmRuntime } from "@/lib/qep/scm-runtime";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

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

function requireSourceRead(context: PlatformApiRequestContext): void {
  requireQepPermission(context, "qep.scm.read", "source.read");
}

function requireSourceWrite(context: PlatformApiRequestContext): void {
  requireQepPermission(context, "source.write", "qep.scm.operate");
}

function correlationId(request: NextRequest): string {
  return (
    request.headers.get("x-correlation-id")?.trim() ||
    request.headers.get("x-request-id")?.trim() ||
    randomUUID()
  );
}

function hasGranted(
  context: PlatformApiRequestContext,
  ...requiredAnyOf: readonly string[]
): boolean {
  const granted = context.serviceContext.permissions ?? [];
  return requiredAnyOf.some(
    (perm) =>
      granted.includes(perm) ||
      granted.includes("qep.*") ||
      granted.includes("*") ||
      granted.includes("source.*"),
  );
}

export async function handleSourceCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireSourceRead(context);
  return jsonDataResponse(
    {
      canRead: true,
      canWrite: hasGranted(context, "source.write", "qep.scm.operate", "qep.*", "*"),
    },
    context.tracing,
  );
}

export async function handleSourceListBranches(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireSourceRead(context);
  sessionTenantId(context);
  const params = await routeContext.params;
  const repositoryId = requireParam(params, "repositoryId");
  const runtime = getQepScmRuntime();
  try {
    const branches = await runtime.listRepositoryBranches(
      repositoryId,
      correlationId(request),
    );
    return jsonDataResponse({ branches }, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SOURCE_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleSourceListCommits(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireSourceRead(context);
  sessionTenantId(context);
  const params = await routeContext.params;
  const repositoryId = requireParam(params, "repositoryId");
  const branch = request.nextUrl.searchParams.get("branch") ?? undefined;
  const limitRaw = request.nextUrl.searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : 20;
  const runtime = getQepScmRuntime();
  try {
    const commits = await runtime.listRepositoryCommits(
      repositoryId,
      correlationId(request),
      { branch, limit: Number.isFinite(limit) ? limit : 20 },
    );
    return jsonDataResponse({ commits }, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SOURCE_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleSourceListTree(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireSourceRead(context);
  sessionTenantId(context);
  const params = await routeContext.params;
  const repositoryId = requireParam(params, "repositoryId");
  const branch = request.nextUrl.searchParams.get("branch") ?? undefined;
  const path = request.nextUrl.searchParams.get("path") ?? undefined;
  const runtime = getQepScmRuntime();
  try {
    const entries = await runtime.listRepositoryTree(
      repositoryId,
      correlationId(request),
      { branch, path },
    );
    return jsonDataResponse({ entries }, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SOURCE_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleSourceGetFile(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireSourceRead(context);
  sessionTenantId(context);
  const params = await routeContext.params;
  const repositoryId = requireParam(params, "repositoryId");
  const path = request.nextUrl.searchParams.get("path");
  if (!path) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "path is required",
    });
  }
  const branch = request.nextUrl.searchParams.get("branch") ?? undefined;
  const runtime = getQepScmRuntime();
  try {
    const file = await runtime.getRepositoryFile(repositoryId, correlationId(request), {
      path,
      branch,
    });
    if (!file) {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "File not found",
      });
    }
    return jsonDataResponse({ file }, context.tracing);
  } catch (error) {
    if (error instanceof PlatformApiHttpError) throw error;
    throw new PlatformApiHttpError(400, {
      code: "SOURCE_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleSourceGetDiff(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireSourceRead(context);
  sessionTenantId(context);
  const params = await routeContext.params;
  const repositoryId = requireParam(params, "repositoryId");
  const path = request.nextUrl.searchParams.get("path");
  const baseRef = request.nextUrl.searchParams.get("baseRef");
  const headRef = request.nextUrl.searchParams.get("headRef");
  if (!path || !baseRef || !headRef) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "path, baseRef, and headRef are required",
    });
  }
  const runtime = getQepScmRuntime();
  try {
    const diff = await runtime.getRepositoryFileDiff(
      repositoryId,
      correlationId(request),
      { path, baseRef, headRef },
    );
    return jsonDataResponse({ diff: diff ?? null }, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SOURCE_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleSourceCreateBranch(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireSourceWrite(context);
  sessionTenantId(context);
  const params = await routeContext.params;
  const repositoryId = requireParam(params, "repositoryId");
  const body = (await request.json()) as {
    name?: string;
    fromRef?: string;
  };
  if (!body.name?.trim() || !body.fromRef?.trim()) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "name and fromRef are required",
    });
  }
  const runtime = getQepScmRuntime();
  try {
    const branch = await runtime.createRepositoryBranch(
      repositoryId,
      correlationId(request),
      { name: body.name.trim(), fromRef: body.fromRef.trim() },
    );
    return jsonDataResponse({ branch }, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SOURCE_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleSourceCommitFiles(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireSourceWrite(context);
  sessionTenantId(context);
  const params = await routeContext.params;
  const repositoryId = requireParam(params, "repositoryId");
  const body = (await request.json()) as {
    branch?: string;
    message?: string;
    files?: Array<{
      path?: string;
      content?: string;
      operation?: "upsert" | "delete";
    }>;
  };
  if (!body.branch?.trim() || !body.message?.trim() || !body.files?.length) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "branch, message, and files are required",
    });
  }
  const files = body.files.map((file) => {
    if (!file.path?.trim()) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_FAILED",
        message: "each file requires path",
      });
    }
    return {
      path: file.path.trim(),
      content: file.content ?? "",
      operation: file.operation ?? ("upsert" as const),
    };
  });
  const runtime = getQepScmRuntime();
  try {
    const commit = await runtime.commitRepositoryFiles(
      repositoryId,
      correlationId(request),
      {
        branch: body.branch.trim(),
        message: body.message.trim(),
        files,
      },
    );
    return jsonDataResponse({ commit }, context.tracing);
  } catch (error) {
    if (error instanceof PlatformApiHttpError) throw error;
    throw new PlatformApiHttpError(400, {
      code: "SOURCE_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleSourceCreatePullRequest(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireSourceWrite(context);
  sessionTenantId(context);
  const params = await routeContext.params;
  const repositoryId = requireParam(params, "repositoryId");
  const body = (await request.json()) as {
    title?: string;
    body?: string;
    sourceBranch?: string;
    targetBranch?: string;
  };
  if (!body.title?.trim() || !body.sourceBranch?.trim() || !body.targetBranch?.trim()) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "title, sourceBranch, and targetBranch are required",
    });
  }
  const runtime = getQepScmRuntime();
  try {
    const pullRequest = await runtime.createRepositoryPullRequest(
      repositoryId,
      correlationId(request),
      {
        title: body.title.trim(),
        body: body.body?.trim(),
        sourceBranch: body.sourceBranch.trim(),
        targetBranch: body.targetBranch.trim(),
      },
    );
    return jsonDataResponse({ pullRequest }, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "SOURCE_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
