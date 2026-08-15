/**
 * Continuous certification advisory signals API (SPR-APZQEP-230-B).
 * Never calls certification.decide / GO.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import {
  createContinuousCertSignal,
  getContinuousCertSignal,
  isContinuousCertKind,
  listContinuousCertSignals,
  updateContinuousCertSignalStatus,
  type ContinuousCertStatus,
} from "@/lib/qep/continuous-cert-signal-store";
import { appendQepAuditEvent } from "@/lib/qep/qep-audit-store";
import { requireQepPermission } from "./require-qep-permission";

const ACTIONS = ["create", "acknowledge", "escalate"] as const;
type Action = (typeof ACTIONS)[number];

function isAction(value: unknown): value is Action {
  return typeof value === "string" && (ACTIONS as readonly string[]).includes(value);
}

export async function handleListContinuousCertSignals(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.continuous_cert.read");
  return jsonDataResponse({ signals: listContinuousCertSignals() }, context.tracing);
}

export async function handleContinuousCertMutation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.continuous_cert.operate");
  const body = (await request.json()) as {
    action?: string;
    evaluationId?: string;
    kind?: string;
    detail?: string;
    expiresAt?: string;
    signalId?: string;
  };

  const actorId = context.serviceContext.userId ?? "unknown";
  const { correlationId } = context.tracing;
  const action = body.action;

  if (!isAction(action)) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "action is required (create|acknowledge|escalate)",
    });
  }

  if (action === "create") {
    const evaluationId = body.evaluationId?.trim();
    const detail = body.detail?.trim();
    if (!evaluationId || !detail || !isContinuousCertKind(body.kind)) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "evaluationId, kind (expiry|drift|freshness), and detail are required",
      });
    }
    const signal = createContinuousCertSignal({
      evaluationId,
      kind: body.kind,
      detail,
      actorId,
      ...(body.expiresAt ? { expiresAt: body.expiresAt } : {}),
    });
    appendQepAuditEvent({
      action: "continuous_cert.created",
      actor: actorId,
      correlationId,
      detail: signal.signalId,
    });
    return jsonDataResponse({ signal }, context.tracing);
  }

  const signalId = body.signalId?.trim();
  if (!signalId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "signalId is required",
    });
  }
  if (!getContinuousCertSignal(signalId)) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Continuous cert signal not found",
    });
  }

  const status: ContinuousCertStatus =
    action === "acknowledge" ? "acknowledged" : "escalated";
  const signal = updateContinuousCertSignalStatus({
    signalId,
    status,
    actorId,
  });
  appendQepAuditEvent({
    action: `continuous_cert.${action}`,
    actor: actorId,
    correlationId,
    detail: signalId,
  });
  return jsonDataResponse({ signal }, context.tracing);
}
