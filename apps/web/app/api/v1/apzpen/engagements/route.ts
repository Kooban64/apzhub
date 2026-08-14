export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { actorEmail, requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ApzpenDomainError } from "@/lib/apzpen/domain";
import {
  createEngagement,
  ensureDemoEngagement,
  getEngagementPosture,
  listTenantEngagements,
} from "@/lib/apzpen/service";
import {
  attachSourceBindingsToProject,
  listProjectSourceBindings,
  parseSourceBindingInputs,
} from "@/lib/commercial/project-source-bindings";
import { ensureRepositoryScopeFromSourceBindings } from "@/lib/apzpen/source-scope";

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

async function handleGet(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  const tenantId = resolveTenantId(context);
  const seed = request.nextUrl.searchParams.get("seed") === "1";
  if (seed) {
    ensureDemoEngagement(tenantId, actorEmail(context));
  }
  const engagements = listTenantEngagements(tenantId).map((e) => ({
    ...e,
    posture: getEngagementPosture(tenantId, e.engagementId),
    sourceBindings: listProjectSourceBindings({
      tenantId,
      productKey: "pentest",
      projectId: e.engagementId,
    }),
  }));
  return jsonDataResponse({ engagements }, context.tracing);
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "write");
  const tenantId = resolveTenantId(context);
  const body = (await request.json().catch(() => ({}))) as {
    customerName?: string;
    applicationName?: string;
    title?: string;
    environment?: string;
    scheduleMode?: "once" | "frequent" | "on_demand";
    methodology?: string[];
    /** Project-based source (GitHub first) — APZPEN + APZQEP only */
    source?: unknown;
    sourceBindings?: unknown;
  };
  const sourceBindings = parseSourceBindingInputs(body.sourceBindings ?? body.source);
  try {
    const engagement = createEngagement({
      tenantId,
      customerName: body.customerName ?? "",
      applicationName: body.applicationName ?? "",
      title: body.title ?? "",
      environment: body.environment ?? "staging",
      createdBy: actorEmail(context),
      scheduleMode: body.scheduleMode,
      methodology: body.methodology,
    });
    const bindings =
      sourceBindings.length > 0
        ? attachSourceBindingsToProject({
            tenantId,
            projectId: engagement.engagementId,
            productKey: "pentest",
            bindings: sourceBindings,
          })
        : [];
    const withScope =
      bindings.length > 0
        ? ensureRepositoryScopeFromSourceBindings(tenantId, engagement.engagementId)
        : engagement;
    return jsonDataResponse(
      { engagement: { ...withScope, sourceBindings: bindings } },
      context.tracing,
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("source.")) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION",
        message: error.message,
      });
    }
    mapError(error);
  }
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.engagements.list",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.engagements.create",
});
