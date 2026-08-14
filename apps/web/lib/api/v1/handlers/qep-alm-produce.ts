/**
 * Flagship F16 — ALM produce HTTP handlers (Projects / Support from QEP defects).
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import {
  produceAlmWorkItemsFromDefect,
  resolveAlmProduceConfig,
  listProducesForChange,
  type AlmProduceDeps,
} from "@/lib/qep/alm-produce-from-defect";
import { getQaGateConfirmations } from "@/lib/qep/qa-gate-confirm-store";
import { listAlmProduceRecords } from "@/lib/qep/alm-produce-store";
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

async function liveDeps(): Promise<AlmProduceDeps> {
  const config = resolveAlmProduceConfig();
  if (config.mode !== "live") {
    return {};
  }
  try {
    const gateway = await getPlatformServiceGateway();
    return {
      createProjectTask: async ({ ctx, projectId, title, description }) => {
        const task = await gateway.tasks.createTask(ctx, projectId, {
          title,
          description,
        });
        return { id: task.id };
      },
      createSupportRequest: async ({ ctx, title, groupId, requesterId }) => {
        const ticket = await gateway.support.createSupportRequest(ctx, {
          title,
          groupId,
          requesterId,
        });
        return { id: ticket.id, displayId: ticket.displayId };
      },
    };
  } catch {
    return {};
  }
}

function mapAlmError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message === "alm_produce.defect_id_required" ||
    message.startsWith("defect.validation")
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message,
    });
  }
  if (
    message === "alm_produce.defect_not_found" ||
    message.startsWith("defect.not_found")
  ) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Defect not found",
    });
  }
  if (message.startsWith("defect.permission")) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message,
    });
  }
  throw new PlatformApiHttpError(400, {
    code: "ALM_PRODUCE_ERROR",
    message,
  });
}

/** POST — produce Projects task and/or Support ticket from one QEP defect. */
export async function handleProduceAlmFromDefect(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.defects.update",
    "qep.defects.create",
    "qep.quality_flows.operate",
  );
  const defectId = requireParam(await routeContext?.params, "defectId");
  const body = (await request.json().catch(() => ({}))) as {
    channels?: unknown;
    changeEventId?: string;
  };
  const channels = Array.isArray(body.channels)
    ? body.channels.filter(
        (c): c is "projects" | "support" => c === "projects" || c === "support",
      )
    : undefined;

  try {
    const result = await produceAlmWorkItemsFromDefect({
      tenantId: sessionTenantId(context),
      userId: context.serviceContext.userId,
      permissions: context.serviceContext.permissions,
      serviceContext: context.serviceContext,
      defectId,
      changeEventId: body.changeEventId,
      channels,
      deps: await liveDeps(),
    });
    return jsonDataResponse(
      {
        ...result,
        config: resolveAlmProduceConfig(),
        note: "ALM produce is not certification. record_only until APZHUB_ALM_PRODUCE_MODE=live.",
      },
      context.tracing,
    );
  } catch (error) {
    mapAlmError(error);
  }
}

/** POST — produce for all QA-confirmed findings that have defectIds on a change. */
export async function handleProduceAlmFromQaGateChange(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.defects.update",
    "qep.defects.create",
    "qep.quality_flows.operate",
  );
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  const body = (await request.json().catch(() => ({}))) as {
    channels?: unknown;
  };
  const channels = Array.isArray(body.channels)
    ? body.channels.filter(
        (c): c is "projects" | "support" => c === "projects" || c === "support",
      )
    : undefined;

  const tenantId = sessionTenantId(context);
  const confirmations = getQaGateConfirmations(tenantId, changeEventId);
  const defectIds = Array.from(
    new Set(
      (confirmations?.findings ?? [])
        .map((f) => f.defectId)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  if (defectIds.length === 0) {
    return jsonDataResponse(
      {
        changeEventId,
        results: [],
        advisory: true as const,
        autoCertified: false as const,
        note: "No confirmed findings with defectIds. Confirm with createDefects first.",
      },
      context.tracing,
    );
  }

  const deps = await liveDeps();
  const results = [];
  for (const defectId of defectIds) {
    try {
      results.push(
        await produceAlmWorkItemsFromDefect({
          tenantId,
          userId: context.serviceContext.userId,
          permissions: context.serviceContext.permissions,
          serviceContext: context.serviceContext,
          defectId,
          changeEventId,
          channels,
          deps,
        }),
      );
    } catch (error) {
      results.push({
        defectId,
        records: [],
        advisory: true as const,
        autoCertified: false as const,
        error: error instanceof Error ? error.message : "produce_failed",
      });
    }
  }

  return jsonDataResponse(
    {
      changeEventId,
      results,
      config: resolveAlmProduceConfig(),
      advisory: true as const,
      autoCertified: false as const,
      note: "Batch ALM produce from QA Gate confirmations. Soft-fail per defect.",
    },
    context.tracing,
  );
}

export async function handleListAlmProduceByChange(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.defects.read",
    "qep.scm.read",
    "qep.dashboards.read",
  );
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  const records = listProducesForChange(sessionTenantId(context), changeEventId);
  return jsonDataResponse(
    { changeEventId, records, config: resolveAlmProduceConfig() },
    context.tracing,
  );
}

export async function handleListAlmProduceByDefect(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.defects.read", "qep.scm.read");
  const defectId = requireParam(await routeContext?.params, "defectId");
  const records = listAlmProduceRecords({
    tenantId: sessionTenantId(context),
    defectId,
    limit: 50,
  });
  return jsonDataResponse(
    { defectId, records, config: resolveAlmProduceConfig() },
    context.tracing,
  );
}
