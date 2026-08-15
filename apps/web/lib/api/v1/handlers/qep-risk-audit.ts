import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { appendQepAuditEvent, listQepAuditEvents } from "@/lib/qep/qep-audit-store";
import {
  createRisk,
  listRisks,
  updateRiskStatus,
  type RiskSeverity,
} from "@/lib/qep/risk-store";

function hasPerm(context: PlatformApiRequestContext, keys: readonly string[]): boolean {
  const perms = context.serviceContext.permissions ?? [];
  if (perms.includes("*") || perms.includes("qep.*")) return true;
  return keys.some((k) => perms.includes(k));
}

export async function handleListRisks(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  if (!hasPerm(context, ["qep.risk.read"])) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Missing permission: qep.risk.read",
    });
  }
  return jsonDataResponse({ items: listRisks() }, context.correlationId);
}

export async function handleRiskMutation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  if (!hasPerm(context, ["qep.risk.operate", "qep.risk.read"])) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Missing permission: qep.risk.operate",
    });
  }
  const body = (await request.json()) as {
    action?: string;
    title?: string;
    severity?: RiskSeverity;
    riskId?: string;
    waiverNote?: string;
  };
  const actorId = context.serviceContext.userId ?? "unknown";
  const correlationId = context.correlationId;

  if (body.action === "create") {
    if (!body.title?.trim()) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "title is required",
      });
    }
    const item = createRisk({
      title: body.title,
      severity: body.severity ?? "medium",
      actorId,
    });
    appendQepAuditEvent({
      action: "risk.created",
      actor: actorId,
      correlationId,
      detail: item.riskId,
    });
    return jsonDataResponse(item, correlationId);
  }

  if (body.action === "mitigate" || body.action === "waive") {
    if (!body.riskId) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "riskId is required",
      });
    }
    const item = updateRiskStatus({
      riskId: body.riskId,
      status: body.action === "waive" ? "waived" : "mitigated",
      waiverNote: body.waiverNote,
    });
    if (!item) {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "Risk not found",
      });
    }
    appendQepAuditEvent({
      action: `risk.${body.action}`,
      actor: actorId,
      correlationId,
      detail: item.riskId,
    });
    return jsonDataResponse(item, correlationId);
  }

  throw new PlatformApiHttpError(400, {
    code: "VALIDATION_ERROR",
    message: "Unknown action",
  });
}

export async function handleListQepAudit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  if (!hasPerm(context, ["qep.audit.read", "administration.audit.read"])) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Missing permission: qep.audit.read",
    });
  }
  return jsonDataResponse({ items: listQepAuditEvents() }, context.correlationId);
}
