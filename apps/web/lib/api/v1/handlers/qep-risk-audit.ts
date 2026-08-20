import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { getApplicationService } from "@/lib/qep/application-runtime";
import { getAssuranceService } from "@/lib/qep/assurance-runtime";
import { appendQepAuditEvent, listQepAuditEvents } from "@/lib/qep/qep-audit-store";
import { listRisks as listLegacyJsonRisks } from "@/lib/qep/risk-store";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

function mapError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  throw new PlatformApiHttpError(400, { code: "VALIDATION_FAILED", message });
}

async function requireApplication(
  tenantId: string,
  applicationId: string | undefined,
): Promise<string> {
  const id = applicationId?.trim() ?? "";
  if (!id) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "application.required",
    });
  }
  try {
    const app = await getApplicationService().get(tenantId, id);
    return app.id;
  } catch {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "application.required",
    });
  }
}

export async function handleListRisks(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.risk.read");
  const tenantId = sessionTenantId(context);
  const applicationId = await requireApplication(
    tenantId,
    request.nextUrl.searchParams.get("applicationId") ?? undefined,
  );
  try {
    const items = await getAssuranceService().listRisks(tenantId, applicationId);
    return jsonDataResponse({ items }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleRiskMutation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.risk.operate");
  const tenantId = sessionTenantId(context);
  const actorId = context.serviceContext.userId;
  const { correlationId } = context.tracing;
  const body = (await request.json()) as {
    action?: string;
    applicationId?: string;
    title?: string;
    description?: string;
    severity?: string;
    riskId?: string;
    waiverNote?: string;
    owner?: string;
    domain?: string;
    impact?: string;
    likelihood?: string;
    evidenceRef?: string;
  };

  try {
    if (body.action === "migrate_ledger") {
      const applicationId = await requireApplication(tenantId, body.applicationId);
      const result = await getAssuranceService().migrateLegacyRisks({
        tenantId,
        applicationId,
        actorId,
        items: listLegacyJsonRisks(),
      });
      appendQepAuditEvent({
        action: "risk.migrated",
        actor: actorId,
        correlationId,
        detail: `${result.imported} imported`,
      });
      return jsonDataResponse(result, context.tracing);
    }

    if (body.action === "create") {
      const applicationId = await requireApplication(tenantId, body.applicationId);
      const item = await getAssuranceService().createRisk({
        tenantId,
        applicationId,
        actorId,
        title: body.title ?? "",
        description: body.description ?? body.title ?? "",
        severity: (body.severity as "low") ?? "medium",
        owner: body.owner,
        domain: body.domain,
        impact: body.impact as "low" | undefined,
        likelihood: body.likelihood as "low" | undefined,
        evidenceRef: body.evidenceRef,
      });
      appendQepAuditEvent({
        action: "risk.created",
        actor: actorId,
        correlationId,
        detail: item.id,
      });
      return jsonDataResponse(item, context.tracing);
    }

    if (
      body.action === "mitigate" ||
      body.action === "waive" ||
      body.action === "accept"
    ) {
      if (!body.riskId) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION_FAILED",
          message: "riskId is required",
        });
      }
      const status =
        body.action === "waive"
          ? "waived"
          : body.action === "accept"
            ? "accepted"
            : "mitigated";
      const item = await getAssuranceService().updateRiskStatus({
        tenantId,
        riskId: body.riskId,
        actorId,
        status,
        waiverNote: body.waiverNote,
      });
      appendQepAuditEvent({
        action: `risk.${body.action}`,
        actor: actorId,
        correlationId,
        detail: item.id,
      });
      return jsonDataResponse(item, context.tracing);
    }

    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "Unknown action",
    });
  } catch (error) {
    if (error instanceof PlatformApiHttpError) throw error;
    mapError(error);
  }
}

export async function handleListQepAudit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.audit.read", "administration.audit.read");
  return jsonDataResponse({ items: listQepAuditEvents() }, context.tracing);
}
