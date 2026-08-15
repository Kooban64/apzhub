/**
 * Flagship F12 — Professional report pack HTTP handlers.
 * Draft export + human publish. Never auto-certifies.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import {
  getReportPack,
  renderReportPackMarkdown,
  tryCompileReportPackPdf,
} from "@/lib/qep/report-pack";
import {
  applyPublishedOverlay,
  getPublishedReportPack,
  publishReportPackRecord,
} from "@/lib/qep/report-pack-publish";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

type RouteContext = { params: Promise<Record<string, string>> };

function requireParam(
  params: Record<string, string> | undefined,
  name: string,
): string {
  const value = params?.[name]?.trim();
  if (!value) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: `${name} is required`,
    });
  }
  return value;
}

async function loadPackWithPublishOverlay(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
}) {
  const draft = await getReportPack(input);
  const published = await getPublishedReportPack(input.changeEventId);
  return published ? applyPublishedOverlay(draft, published) : draft;
}

/** GET report pack for a durable change — JSON default; markdown/pdf optional. */
export async function handleGetReportPackByChange(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.scm.read",
    "qep.automation.read",
    "qep.certification.read",
    "qep.evidence.read",
  );
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  const format = (
    new URL(request.url).searchParams.get("format") ?? "json"
  ).toLowerCase();

  try {
    const pack = await loadPackWithPublishOverlay({
      tenantId: sessionTenantId(context),
      changeEventId,
    });

    if (format === "markdown" || format === "md") {
      const markdown = renderReportPackMarkdown(pack);
      return jsonDataResponse({ pack, markdown, format: "markdown" }, context.tracing);
    }

    if (format === "pdf") {
      const pdf = await tryCompileReportPackPdf(pack, {
        actorId: context.serviceContext.userId,
        correlationId: context.correlationId,
      });
      if (!pdf.ok) {
        return jsonDataResponse(
          {
            pack,
            format: "pdf",
            pdf: {
              available: false as const,
              reason: pdf.reason,
              todo: pdf.todo,
            },
          },
          context.tracing,
        );
      }
      try {
        const { appendQepAuditEvent } = await import("@/lib/qep/qep-audit-store");
        appendQepAuditEvent({
          action: "report_pack.pdf_rendered",
          actor: context.serviceContext.userId,
          correlationId: context.correlationId,
          detail: `${pack.packId}:${pdf.pdfPath}`,
        });
      } catch {
        // Audit ledger must not block export.
      }
      return jsonDataResponse(
        {
          pack,
          format: "pdf",
          pdf: {
            available: true as const,
            path: pdf.pdfPath,
            bytesBase64: pdf.bytes.toString("base64"),
            typstBinary: pdf.typstBinary,
            durable: true as const,
          },
        },
        context.tracing,
      );
    }

    return jsonDataResponse({ pack, format: "json" }, context.tracing);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "report_pack.change_not_found") {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "Change event not found",
      });
    }
    if (message === "report_pack.change_id_required") {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_FAILED",
        message: "changeEventId is required",
      });
    }
    throw new PlatformApiHttpError(400, {
      code: "REPORT_PACK_ERROR",
      message,
    });
  }
}

/** POST — human publish / sign Security Bill of Health (not GO/NO-GO). */
export async function handlePublishReportPackByChange(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.certification.decide",
    "qep.quality_flows.operate",
  );
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  const body = (await request.json().catch(() => ({}))) as {
    signerName?: string;
    signerRole?: string;
    decision?: string;
    residualRiskStatement?: string;
    notes?: string;
  };

  try {
    const tenantId = sessionTenantId(context);
    const draft = await getReportPack({ tenantId, changeEventId });
    const { pack, published } = await publishReportPackRecord({
      tenantId,
      changeEventId,
      signerName: body.signerName ?? "",
      signerRole: body.signerRole,
      decision: body.decision as
        "accepted_with_residual_risk" | "rejected" | "needs_rework",
      residualRiskStatement: body.residualRiskStatement ?? "",
      notes: body.notes,
      pack: draft,
    });
    return jsonDataResponse(
      {
        pack,
        published,
        advisory: true as const,
        autoCertified: false as const,
        note: "Published report pack is not a certification GO/NO-GO.",
      },
      context.tracing,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "report_pack.change_not_found") {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "Change event not found",
      });
    }
    if (
      message === "report_pack.signer_required" ||
      message === "report_pack.residual_risk_required" ||
      message === "report_pack.decision_invalid"
    ) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_FAILED",
        message,
      });
    }
    throw new PlatformApiHttpError(400, {
      code: "REPORT_PACK_PUBLISH_ERROR",
      message,
    });
  }
}
