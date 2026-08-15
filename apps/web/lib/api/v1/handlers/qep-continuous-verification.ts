/**
 * Continuous verification signals API (SPR-APZQEP-230-A).
 * Advisory freshness only — never certifies.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import {
  findContinuousVerificationSignal,
  listContinuousVerificationSignals,
  upsertContinuousVerificationSignal,
  type ContinuousVerificationStatus,
} from "@/lib/qep/continuous-verification-store";
import { appendQepAuditEvent } from "@/lib/qep/qep-audit-store";
import { requireQepPermission } from "./require-qep-permission";

const ACTIONS = ["upsert", "mark_stale", "acknowledge"] as const;
type Action = (typeof ACTIONS)[number];

function isAction(value: unknown): value is Action {
  return typeof value === "string" && (ACTIONS as readonly string[]).includes(value);
}

export async function handleListContinuousVerificationSignals(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.continuous_verification.read");
  return jsonDataResponse(
    { signals: listContinuousVerificationSignals() },
    context.tracing,
  );
}

export async function handleContinuousVerificationMutation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.continuous_verification.operate");
  const body = (await request.json()) as {
    action?: string;
    source?: string;
    subjectRef?: string;
    lastSeenAt?: string;
    staleAfterHours?: number;
    notes?: string;
  };

  const actorId = context.serviceContext.userId ?? "unknown";
  const { correlationId } = context.tracing;
  const action = body.action;
  const source = body.source?.trim();
  const subjectRef = body.subjectRef?.trim();

  if (!isAction(action) || !source || !subjectRef) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message:
        "action, source, and subjectRef are required (actions: upsert|mark_stale|acknowledge)",
    });
  }

  if (action !== "upsert" && !findContinuousVerificationSignal(source, subjectRef)) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Continuous verification signal not found",
    });
  }

  let status: ContinuousVerificationStatus | undefined;
  if (action === "mark_stale") status = "stale";
  if (action === "acknowledge") status = "acknowledged";

  const signal = upsertContinuousVerificationSignal({
    source,
    subjectRef,
    actorId,
    ...(body.lastSeenAt ? { lastSeenAt: body.lastSeenAt } : {}),
    ...(typeof body.staleAfterHours === "number"
      ? { staleAfterHours: body.staleAfterHours }
      : {}),
    ...(body.notes !== undefined ? { notes: body.notes } : {}),
    ...(status ? { status } : {}),
  });

  appendQepAuditEvent({
    action: `continuous_verification.${action}`,
    actor: actorId,
    correlationId,
    detail: `${source}:${subjectRef}`,
  });
  return jsonDataResponse({ signal }, context.tracing);
}
