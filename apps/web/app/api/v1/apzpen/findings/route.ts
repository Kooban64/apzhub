export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { actorEmail, requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ApzpenDomainError } from "@/lib/apzpen/domain";
import {
  acceptFindingRisk,
  addFindingEvidence,
  assignFinding,
  createFinding,
  getTenantFinding,
  importProviderFindings,
  linkFindingRemediationChange,
  listTenantFindings,
  requestRetest,
  updateFindingDetails,
  updateFindingStatus,
} from "@/lib/apzpen/service";
import type {
  FindingSeverity,
  FindingStatus,
  ImportFindingSeed,
} from "@/lib/apzpen/types";

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
  const findingId = request.nextUrl.searchParams.get("findingId");
  if (findingId) {
    const finding = getTenantFinding(tenantId, findingId);
    if (!finding) {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "Finding not found",
      });
    }
    return jsonDataResponse({ finding }, context.tracing);
  }
  const engagementId = request.nextUrl.searchParams.get("engagementId") ?? undefined;
  let findings = listTenantFindings(tenantId, engagementId);
  const assignedToMe = request.nextUrl.searchParams.get("assignedToMe");
  const assignedTo = request.nextUrl.searchParams.get("assignedTo");
  if (assignedToMe === "1" || assignedToMe === "true") {
    const me = actorEmail(context).trim().toLowerCase();
    findings = findings.filter((f) => f.assignedTo?.trim().toLowerCase() === me);
  } else if (assignedTo?.trim()) {
    const needle = assignedTo.trim().toLowerCase();
    findings = findings.filter((f) => f.assignedTo?.trim().toLowerCase() === needle);
  }
  return jsonDataResponse({ findings }, context.tracing);
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "write");
  const tenantId = resolveTenantId(context);
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    engagementId?: string;
    findingId?: string;
    title?: string;
    description?: string;
    severity?: FindingSeverity;
    status?: FindingStatus;
    providerTool?: string;
    location?: string;
    remediation?: string;
    cwe?: string;
    seeds?: ImportFindingSeed[];
    assignedTo?: string;
    evidenceKind?: string;
    evidenceLabel?: string;
    evidenceRef?: string;
    reason?: string;
    remediationChangeRef?: string;
  };

  try {
    if (body.action === "create") {
      requireApzpenAccess(context, "test");
      if (!body.engagementId) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "engagementId required",
        });
      }
      const finding = createFinding({
        tenantId,
        engagementId: body.engagementId,
        title: body.title ?? "",
        description: body.description ?? "",
        severity: body.severity ?? "info",
        createdBy: actorEmail(context),
        providerTool: body.providerTool,
        location: body.location,
        remediation: body.remediation,
        cwe: body.cwe,
      });
      return jsonDataResponse({ finding }, context.tracing, { status: 201 });
    }
    if (body.action === "update_status") {
      requireApzpenAccess(context, "test");
      if (!body.findingId || !body.status) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "findingId and status required",
        });
      }
      if (body.status === "risk_accepted") {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "Use action accept_risk with a justification.",
        });
      }
      const finding = updateFindingStatus(tenantId, body.findingId, body.status);
      return jsonDataResponse({ finding }, context.tracing);
    }
    if (body.action === "accept_risk") {
      requireApzpenAccess(context, "test");
      if (!body.findingId || !body.reason) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "findingId and reason required",
        });
      }
      const finding = acceptFindingRisk(tenantId, body.findingId, {
        reason: body.reason,
        acceptedBy: actorEmail(context),
      });
      return jsonDataResponse({ finding }, context.tracing);
    }
    if (body.action === "link_remediation_change") {
      requireApzpenAccess(context, "test");
      if (!body.findingId || !body.remediationChangeRef) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "findingId and remediationChangeRef required",
        });
      }
      const finding = linkFindingRemediationChange(
        tenantId,
        body.findingId,
        body.remediationChangeRef,
      );
      return jsonDataResponse({ finding }, context.tracing);
    }
    if (body.action === "request_retest") {
      requireApzpenAccess(context, "retest");
      if (!body.findingId) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "findingId required",
        });
      }
      const finding = requestRetest(tenantId, body.findingId);
      return jsonDataResponse({ finding }, context.tracing);
    }
    if (body.action === "assign") {
      requireApzpenAccess(context, "test");
      if (!body.findingId || !body.assignedTo) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "findingId and assignedTo required",
        });
      }
      const finding = assignFinding(tenantId, body.findingId, body.assignedTo);
      return jsonDataResponse({ finding }, context.tracing);
    }
    if (body.action === "update_details") {
      requireApzpenAccess(context, "test");
      if (!body.findingId) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "findingId required",
        });
      }
      const finding = updateFindingDetails(tenantId, body.findingId, {
        title: body.title,
        description: body.description,
        remediation: body.remediation,
        location: body.location,
        cwe: body.cwe,
        severity: body.severity,
      });
      return jsonDataResponse({ finding }, context.tracing);
    }
    if (body.action === "add_evidence") {
      requireApzpenAccess(context, "test");
      if (!body.findingId || !body.evidenceLabel || !body.evidenceRef) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "findingId, evidenceLabel and evidenceRef required",
        });
      }
      const finding = addFindingEvidence(tenantId, body.findingId, {
        kind: body.evidenceKind ?? "note",
        label: body.evidenceLabel,
        ref: body.evidenceRef,
        createdBy: actorEmail(context),
      });
      return jsonDataResponse({ finding }, context.tracing);
    }
    if (body.action === "import") {
      requireApzpenAccess(context, "test");
      if (!body.engagementId || !body.seeds?.length) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION",
          message: "engagementId and seeds required",
        });
      }
      const result = importProviderFindings(
        tenantId,
        body.engagementId,
        actorEmail(context),
        body.seeds,
      );
      return jsonDataResponse(
        {
          findings: result.created,
          createdCount: result.created.length,
          skipped: result.skipped,
          parsedCount: result.parsedCount,
        },
        context.tracing,
        { status: 201 },
      );
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
  operation: "apzpen.findings.list",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.findings.action",
});
