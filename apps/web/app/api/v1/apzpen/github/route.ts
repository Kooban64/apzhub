export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { actorEmail, requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ApzpenDomainError } from "@/lib/apzpen/domain";
import {
  ensureDemoPrSecurity,
  getApzpenGithubAuthStatus,
  ingestGithubWebhookPullRequest,
  ingestPrSecurityEvent,
  listPrSecurityAssessments,
  syncEngagementGithubPullRequests,
} from "@/lib/apzpen/follow-on-service";
import { ensureDemoEngagement } from "@/lib/apzpen/service";
import type { PrSecurityCheck, PrSecurityEvent } from "@/lib/apzpen/github-pr-security";
import { newId } from "@/lib/apzpen/store";

function mapError(error: unknown): never {
  if (error instanceof ApzpenDomainError) {
    throw new PlatformApiHttpError(error.code === "NOT_FOUND" ? 404 : 400, {
      code: error.code,
      message: error.message,
    });
  }
  if (error instanceof Error) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: error.message,
    });
  }
  throw error;
}

async function handleGet(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  const tenantId = resolveTenantId(context);
  if (request.nextUrl.searchParams.get("status") === "1") {
    return jsonDataResponse({ auth: getApzpenGithubAuthStatus() }, context.tracing);
  }
  if (request.nextUrl.searchParams.get("seed") === "1") {
    const eng = ensureDemoEngagement(tenantId, actorEmail(context));
    ensureDemoPrSecurity(tenantId, eng.engagementId);
  }
  const engagementId = request.nextUrl.searchParams.get("engagementId") ?? undefined;
  const assessments = listPrSecurityAssessments(tenantId, engagementId);
  return jsonDataResponse(
    { assessments, auth: getApzpenGithubAuthStatus() },
    context.tracing,
  );
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "write");
  const tenantId = resolveTenantId(context);
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    engagementId?: string;
    repository?: string;
    event?: Partial<PrSecurityEvent>;
    payload?: Record<string, unknown>;
  };

  try {
    if (body.action === "seed" && body.engagementId) {
      const assessments = ensureDemoPrSecurity(tenantId, body.engagementId);
      return jsonDataResponse({ assessments }, context.tracing, { status: 201 });
    }
    if (body.action === "sync_prs" && body.engagementId) {
      const result = await syncEngagementGithubPullRequests({
        tenantId,
        engagementId: body.engagementId,
        repository: body.repository,
      });
      return jsonDataResponse(result, context.tracing, { status: 201 });
    }
    if (body.action === "ingest_webhook" && body.engagementId && body.payload) {
      const assessment = ingestGithubWebhookPullRequest({
        tenantId,
        engagementId: body.engagementId,
        payload: body.payload,
      });
      return jsonDataResponse({ assessment }, context.tracing, { status: 201 });
    }
    if (body.action === "upsert" && body.event && body.engagementId) {
      const checks = (body.event.checks ?? []) as PrSecurityCheck[];
      const event: PrSecurityEvent = {
        eventId: body.event.eventId ?? newId("pr"),
        tenantId,
        engagementId: body.engagementId,
        provider: "github",
        repository: String(body.event.repository ?? "unknown/repo"),
        prNumber: Number(body.event.prNumber ?? 0),
        title: String(body.event.title ?? "PR"),
        author: String(body.event.author ?? "unknown"),
        branch: String(body.event.branch ?? ""),
        baseBranch: String(body.event.baseBranch ?? "main"),
        url: String(body.event.url ?? ""),
        changedPaths: body.event.changedPaths ?? [],
        checks,
        receivedAt: new Date().toISOString(),
      };
      const assessment = ingestPrSecurityEvent(event);
      return jsonDataResponse({ assessment }, context.tracing, { status: 201 });
    }
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "Unknown action — use seed | sync_prs | ingest_webhook | upsert",
    });
  } catch (error) {
    mapError(error);
  }
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.github.read",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.github.write",
});
