/**
 * Flagship F4 — Certification Engine HTTP handlers.
 * Human GO/NO-GO only; never auto-certify from providers/QI.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import {
  evaluateChangeCertification,
  getCertificationByChange,
  getCertificationEvaluation,
  recordHumanCertificationDecision,
  reproduceCertificationEvaluation,
  F4_CERTIFIER_AUTHORITY,
  F4_CO_APPROVER_AUTHORITY,
} from "@/lib/qep/certification-runtime";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

type RouteContext = { params: Promise<Record<string, string>> };

function mapCertError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "certification.change_not_found") {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Change event not found",
    });
  }
  if (message === "certification.evaluation_not_found") {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Certification evaluation not found",
    });
  }
  if (message === "certification.decision_already_recorded") {
    throw new PlatformApiHttpError(409, {
      code: "CONFLICT",
      message: "Human certification decision already recorded (immutable)",
    });
  }
  if (message === "certification.authority_already_voted") {
    throw new PlatformApiHttpError(409, {
      code: "CONFLICT",
      message: "This authority has already recorded a vote on this evaluation",
    });
  }
  if (message === "certification.independent_approval_required") {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Co-approver must be a different human actor (independent approval)",
    });
  }
  if (message === "certification.authority_invalid") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: `authorityId must be ${F4_CERTIFIER_AUTHORITY} or ${F4_CO_APPROVER_AUTHORITY}`,
    });
  }
  if (message === "certification.not_decided") {
    throw new PlatformApiHttpError(409, {
      code: "CONFLICT",
      message: "Evaluation has no terminal human decision to reproduce",
    });
  }
  if (message === "certification.rationale_required") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "rationale is required (min 3 characters)",
    });
  }
  if (message === "certification.human_actor_required") {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Only a human session actor may record GO/NO-GO",
    });
  }
  throw new PlatformApiHttpError(400, {
    code: "CERTIFICATION_ERROR",
    message,
  });
}

export async function handleCreateCertificationEvaluation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(
    context,
    "qep.certification.read",
    "qep.certification.decide",
    "qep.quality_flows.operate",
    "qep.scm.operate",
  );
  const body = (await request.json().catch(() => ({}))) as {
    changeEventId?: string;
  };
  const changeEventId = body.changeEventId?.trim();
  if (!changeEventId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "changeEventId is required",
    });
  }
  try {
    const evaluation = await evaluateChangeCertification({
      tenantId: sessionTenantId(context),
      changeEventId,
      actorId: context.serviceContext.userId,
    });
    return jsonDataResponse({ evaluation }, context.tracing, { status: 201 });
  } catch (error) {
    mapCertError(error);
  }
}

export async function handleGetCertificationEvaluation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.certification.read",
    "qep.quality_flows.read",
    "qep.scm.read",
  );
  const evaluationId = (await routeContext?.params)?.evaluationId?.trim();
  if (!evaluationId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "evaluationId is required",
    });
  }
  const evaluation = await getCertificationEvaluation(evaluationId);
  if (!evaluation || evaluation.tenantId !== sessionTenantId(context)) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Certification evaluation not found",
    });
  }
  return jsonDataResponse({ evaluation }, context.tracing);
}

export async function handleGetCertificationByChange(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.certification.read",
    "qep.quality_flows.read",
    "qep.scm.read",
  );
  const changeEventId = (await routeContext?.params)?.changeEventId?.trim();
  if (!changeEventId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "changeEventId is required",
    });
  }
  const result = await getCertificationByChange(
    sessionTenantId(context),
    changeEventId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleRecordCertificationDecision(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.certification.decide",
    "qep.quality_flows.operate",
  );
  const evaluationId = (await routeContext?.params)?.evaluationId?.trim();
  if (!evaluationId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "evaluationId is required",
    });
  }
  const body = (await request.json().catch(() => ({}))) as {
    outcome?: string;
    rationale?: string;
    authorityId?: string;
  };
  const outcome = body.outcome?.trim().toUpperCase();
  if (outcome !== "GO" && outcome !== "NO_GO") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: 'outcome must be "GO" or "NO_GO"',
    });
  }
  try {
    const evaluation = await recordHumanCertificationDecision({
      evaluationId,
      actorId: context.serviceContext.userId,
      outcome,
      rationale: body.rationale ?? "",
      authorityId: body.authorityId,
    });
    if (evaluation.tenantId !== sessionTenantId(context)) {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "Certification evaluation not found",
      });
    }
    return jsonDataResponse({ evaluation }, context.tracing);
  } catch (error) {
    if (error instanceof PlatformApiHttpError) throw error;
    mapCertError(error);
  }
}

export async function handleReproduceCertificationEvaluation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.certification.read",
    "qep.quality_flows.read",
    "qep.scm.read",
  );
  const evaluationId = (await routeContext?.params)?.evaluationId?.trim();
  if (!evaluationId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "evaluationId is required",
    });
  }
  try {
    const snapshot = await reproduceCertificationEvaluation(evaluationId);
    if (snapshot.evaluation.tenantId !== sessionTenantId(context)) {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "Certification evaluation not found",
      });
    }
    return jsonDataResponse(snapshot, context.tracing);
  } catch (error) {
    if (error instanceof PlatformApiHttpError) throw error;
    mapCertError(error);
  }
}
