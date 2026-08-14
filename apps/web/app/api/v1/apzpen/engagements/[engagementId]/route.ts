export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { actorEmail, requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ApzpenDomainError } from "@/lib/apzpen/domain";
import {
  addScopeTarget,
  approveRulesOfEngagement,
  certifyEngagement,
  getEngagementPosture,
  getTenantEngagement,
  listTenantFindings,
  setAssessmentPosition,
  startEngagementTesting,
  syncAssessmentFromFindings,
  updateEngagementSchedule,
  updateRoeDraft,
} from "@/lib/apzpen/service";
import type { AssessmentPosition, AssetKind, Engagement } from "@/lib/apzpen/types";
import { listProjectSourceBindings } from "@/lib/commercial/project-source-bindings";
import {
  attachSourceBindingsToProject,
  parseSourceBindingInputs,
} from "@/lib/commercial/project-source-bindings";
import { ensureRepositoryScopeFromSourceBindings } from "@/lib/apzpen/source-scope";
import { deriveAssessmentPosition } from "@/lib/apzpen/domain";

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
  try {
    const engagement = getTenantEngagement(tenantId, engagementId);
    const findings = listTenantFindings(tenantId, engagementId);
    const posture = getEngagementPosture(tenantId, engagementId);
    const suggestedAssessmentPosition = deriveAssessmentPosition(engagement, findings);
    const sourceBindings = listProjectSourceBindings({
      tenantId,
      productKey: "pentest",
      projectId: engagementId,
    });
    return jsonDataResponse(
      {
        engagement: { ...engagement, sourceBindings },
        findings,
        posture,
        suggestedAssessmentPosition,
      },
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

async function handlePost(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireApzpenAccess(context, "write");
  const tenantId = resolveTenantId(context);
  const engagementId = (await routeContext?.params)?.engagementId;
  if (!engagementId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "engagementId required",
    });
  }
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    kind?: AssetKind;
    label?: string;
    identifier?: string;
    environment?: string;
    notes?: string;
    scheduleMode?: Engagement["scheduleMode"];
    nextRunAt?: string;
    assessmentPosition?: AssessmentPosition;
    source?: unknown;
    sourceBindings?: unknown;
    allowedTechniques?: string[];
    restrictedTechniques?: string[];
    emergencyContact?: string;
    testingWindowStart?: string;
    testingWindowEnd?: string;
    methodology?: string[];
  };

  try {
    if (body.action === "add_scope") {
      requireApzpenAccess(context, "manage");
      const engagement = addScopeTarget(tenantId, engagementId, {
        kind: body.kind ?? "other",
        label: body.label ?? "",
        identifier: body.identifier ?? "",
        environment: body.environment ?? "staging",
        notes: body.notes,
      });
      return jsonDataResponse({ engagement }, context.tracing);
    }
    if (body.action === "approve_roe") {
      requireApzpenAccess(context, "manage");
      const engagement = approveRulesOfEngagement(
        tenantId,
        engagementId,
        actorEmail(context),
      );
      return jsonDataResponse({ engagement }, context.tracing);
    }
    if (body.action === "update_roe") {
      requireApzpenAccess(context, "manage");
      const engagement = updateRoeDraft(tenantId, engagementId, {
        allowedTechniques: body.allowedTechniques,
        restrictedTechniques: body.restrictedTechniques,
        emergencyContact: body.emergencyContact,
        notes: body.notes,
        testingWindowStart: body.testingWindowStart,
        testingWindowEnd: body.testingWindowEnd,
        methodology: body.methodology,
      });
      return jsonDataResponse({ engagement }, context.tracing);
    }
    if (body.action === "start_testing") {
      requireApzpenAccess(context, "manage");
      const engagement = startEngagementTesting(tenantId, engagementId);
      return jsonDataResponse({ engagement }, context.tracing);
    }
    if (body.action === "set_schedule") {
      requireApzpenAccess(context, "manage");
      if (!body.scheduleMode) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "scheduleMode required",
        });
      }
      const engagement = updateEngagementSchedule(
        tenantId,
        engagementId,
        body.scheduleMode,
        body.nextRunAt,
      );
      return jsonDataResponse({ engagement }, context.tracing);
    }
    if (body.action === "set_assessment_position") {
      requireApzpenAccess(context, "manage");
      if (!body.assessmentPosition) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "assessmentPosition required",
        });
      }
      const engagement = setAssessmentPosition(
        tenantId,
        engagementId,
        body.assessmentPosition,
      );
      return jsonDataResponse({ engagement }, context.tracing);
    }
    if (body.action === "sync_assessment") {
      requireApzpenAccess(context, "manage");
      const engagement = syncAssessmentFromFindings(tenantId, engagementId);
      return jsonDataResponse({ engagement }, context.tracing);
    }
    if (body.action === "bind_source") {
      requireApzpenAccess(context, "manage");
      const bindingsInput = parseSourceBindingInputs(
        body.sourceBindings ?? body.source,
      );
      if (bindingsInput.length === 0) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "source or sourceBindings required",
        });
      }
      const bindings = attachSourceBindingsToProject({
        tenantId,
        projectId: engagementId,
        productKey: "pentest",
        bindings: bindingsInput,
      });
      const engagement = ensureRepositoryScopeFromSourceBindings(
        tenantId,
        engagementId,
      );
      return jsonDataResponse(
        { engagement: { ...engagement, sourceBindings: bindings } },
        context.tracing,
      );
    }
    if (body.action === "certify") {
      requireApzpenAccess(context, "certify");
      const engagement = certifyEngagement(tenantId, engagementId, actorEmail(context));
      return jsonDataResponse({ engagement }, context.tracing);
    }
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "Unknown action",
    });
  } catch (error) {
    mapError(error);
  }
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.engagements.read",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.engagements.action",
});
