export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { actorEmail, requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ApzpenDomainError } from "@/lib/apzpen/domain";
import type { DispatchTool } from "@/lib/apzpen/runner-dispatch";
import { isDispatchTool, listDispatchJobs } from "@/lib/apzpen/runner-dispatch";
import { dispatchSecurityTool, redispatchFailedJob } from "@/lib/apzpen/service";

function mapError(error: unknown): never {
  if (error instanceof ApzpenDomainError) {
    const status =
      error.code === "NOT_FOUND" ? 404 : error.code === "VALIDATION" ? 400 : 409;
    throw new PlatformApiHttpError(status, {
      code: error.code,
      message: error.message,
    });
  }
  throw error;
}

async function handleGet(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireApzpenAccess(context, "read");
  const tenantId = resolveTenantId(context);
  const engagementId = (await routeContext?.params)?.engagementId;
  if (!engagementId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "engagementId required",
    });
  }
  const jobs = listDispatchJobs({
    tenantId,
    engagementId,
    limit: 40,
  });
  return jsonDataResponse({ jobs }, context.tracing);
}

async function handlePost(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireApzpenAccess(context, "test");
  const tenantId = resolveTenantId(context);
  const engagementId = (await routeContext?.params)?.engagementId;
  if (!engagementId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "engagementId required",
    });
  }

  const body = (await request.json().catch(() => ({}))) as {
    tool?: string;
    target?: string;
    dryRun?: boolean;
    jobId?: string;
  };

  try {
    if (body.jobId) {
      const result = await redispatchFailedJob({
        tenantId,
        engagementId,
        jobId: body.jobId,
        createdBy: actorEmail(context),
        dryRun: body.dryRun,
        timeoutMs: 180_000,
      });
      return jsonDataResponse(result, context.tracing, { status: 201 });
    }

    if (!body.tool || !isDispatchTool(body.tool)) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION",
        message:
          "tool required — one of: zap, trivy, semgrep, nuclei, gitleaks, syft, grype, osv, checkov, nmap, testssl, prowler, kubebench, schemathesis, mobsf",
      });
    }

    const tool: DispatchTool = body.tool;

    const result = await dispatchSecurityTool({
      tenantId,
      engagementId,
      createdBy: actorEmail(context),
      tool,
      target: body.target,
      dryRun: body.dryRun ?? false,
      timeoutMs: tool === "zap" || tool === "mobsf" ? 300_000 : 180_000,
    });
    return jsonDataResponse(result, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.engagements.dispatch",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.engagements.dispatch",
});
