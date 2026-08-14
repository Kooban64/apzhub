/**
 * Flagship F15 — QA Gate HTTP handlers.
 * Includes pen-test pack run for QA. Never auto-certifies.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { composeQaGate } from "@/lib/qep/qa-gate";
import { confirmQaGateFindings } from "@/lib/qep/qa-gate-confirm-store";
import { getReportPack } from "@/lib/qep/report-pack";
import { runQaGatePacksForChange } from "@/lib/qep/run-qa-gate-packs";
import {
  getFixDirectionPack,
  renderFixDirectionPackMarkdown,
} from "@/lib/qep/fix-direction-pack";
import { getDefectRuntime } from "@/lib/qep/defect-runtime";
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

function mapGateError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message === "qa_gate.change_id_required" ||
    message === "qa_gate.finding_ids_required" ||
    message === "qa_gate.packs_required" ||
    message === "report_pack.change_id_required"
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message,
    });
  }
  if (
    message === "report_pack.change_not_found" ||
    message === "run_packs.change_not_found" ||
    message === "early_check.change_not_found"
  ) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Change event not found",
    });
  }
  throw new PlatformApiHttpError(400, {
    code: "QA_GATE_ERROR",
    message,
  });
}

export async function handleGetQaGateByChange(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.scm.read",
    "qep.automation.read",
    "qep.certification.read",
    "qep.evidence.read",
    "qep.specification.read",
  );
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  try {
    const gate = await composeQaGate({
      tenantId: sessionTenantId(context),
      changeEventId,
    });
    return jsonDataResponse(gate, context.tracing);
  } catch (error) {
    mapGateError(error);
  }
}

/** POST — QA runs quality + pen-test (security) packs. */
export async function handleRunQaGatePacksByChange(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.automation.operate",
    "qep.scm.operate",
    "qep.quality_flows.operate",
  );
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  const body = (await request.json().catch(() => ({}))) as {
    includePenTest?: boolean;
    includeQuality?: boolean;
    includePlaywright?: boolean;
    force?: boolean;
  };

  try {
    const result = await runQaGatePacksForChange({
      tenantId: sessionTenantId(context),
      changeEventId,
      includePenTest: body.includePenTest !== false,
      includeQuality: body.includeQuality !== false,
      includePlaywright: body.includePlaywright === true,
      force: body.force !== false,
    });
    return jsonDataResponse(
      {
        ...result,
        note: "QA Gate pack run does not certify. Pen-test = security pack (F11 domains).",
      },
      context.tracing,
    );
  } catch (error) {
    mapGateError(error);
  }
}

/** POST — human confirm findings; optionally create defects. */
export async function handleConfirmQaGateFindings(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.defects.create",
    "qep.defects.update",
    "qep.quality_flows.operate",
    "qep.certification.decide",
  );
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  const body = (await request.json().catch(() => ({}))) as {
    findingIds?: unknown;
    notes?: string;
    createDefects?: boolean;
  };
  const findingIds = Array.isArray(body.findingIds)
    ? body.findingIds.filter((id): id is string => typeof id === "string")
    : [];

  try {
    const tenantId = sessionTenantId(context);
    const pack = await getReportPack({ tenantId, changeEventId });
    const byId = new Map(pack.findings.map((f) => [f.id, f] as const));
    const defectsMeta: Record<
      string,
      { attempted?: boolean; error?: string; defectId?: string }
    > = {};

    if (body.createDefects) {
      const actor = {
        userId: context.serviceContext.userId,
        tenantId,
        permissions: context.serviceContext.permissions,
      };
      for (const findingId of findingIds) {
        const finding = byId.get(findingId);
        if (!finding) continue;
        defectsMeta[findingId] = { attempted: true };
        try {
          const severity =
            finding.severity === "critical"
              ? "critical"
              : finding.severity === "high"
                ? "major"
                : finding.severity === "medium"
                  ? "minor"
                  : "trivial";
          const priority =
            finding.severity === "critical"
              ? "p0"
              : finding.severity === "high"
                ? "p1"
                : finding.severity === "medium"
                  ? "p2"
                  : "p3";
          const created = await getDefectRuntime().service.create(actor, {
            title: `[QA Gate] ${finding.title}`.slice(0, 200),
            description: [
              finding.description,
              finding.location ? `Location: ${finding.location}` : "",
              `Recommendation: ${finding.recommendation}`,
              `Tool: ${finding.toolId}`,
              `changeEventId: ${changeEventId}`,
              `findingId: ${finding.id}`,
            ]
              .filter(Boolean)
              .join("\n\n"),
            severity,
            priority,
            tags: ["qa-gate", "f15", finding.toolId],
            customMetadata: {
              changeEventId,
              findingId: finding.id,
              assistOrigin: "f15_qa_gate",
            },
          });
          defectsMeta[findingId] = {
            attempted: true,
            defectId: created.defectId,
          };
        } catch (error) {
          defectsMeta[findingId] = {
            attempted: true,
            error: error instanceof Error ? error.message : "create_failed",
          };
        }
      }
    }

    const confirmations = confirmQaGateFindings({
      tenantId,
      changeEventId,
      confirmedBy: context.serviceContext.userId,
      findingIds,
      notes: body.notes,
      defectsMeta,
    });
    const gate = await composeQaGate({ tenantId, changeEventId });
    return jsonDataResponse(
      {
        confirmations,
        gate,
        advisory: true as const,
        autoCertified: false as const,
        note: "Confirmation is not GO/NO-GO. Use RC for certification decision.",
      },
      context.tracing,
    );
  } catch (error) {
    mapGateError(error);
  }
}

export async function handleGetFixDirectionPackByChange(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.scm.read",
    "qep.automation.read",
    "qep.evidence.read",
    "qep.defects.read",
  );
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  const preferConfirmed =
    new URL(request.url).searchParams.get("confirmedOnly") !== "false";
  const format = (
    new URL(request.url).searchParams.get("format") ?? "json"
  ).toLowerCase();

  try {
    const pack = await getFixDirectionPack({
      tenantId: sessionTenantId(context),
      changeEventId,
      preferConfirmed,
    });
    if (format === "markdown" || format === "md") {
      return jsonDataResponse(
        {
          pack,
          markdown: renderFixDirectionPackMarkdown(pack),
          format: "markdown",
          advisory: true,
          autoCertified: false,
        },
        context.tracing,
      );
    }
    return jsonDataResponse(
      { pack, format: "json", advisory: true, autoCertified: false },
      context.tracing,
    );
  } catch (error) {
    mapGateError(error);
  }
}
