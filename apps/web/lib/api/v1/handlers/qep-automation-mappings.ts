/**
 * Automation mapping / flaky governance API (SPR-APZQEP-220-C).
 * Ledger only — does not mutate Cap automation execution stores.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import {
  findMapping,
  listMappings,
  upsertMapping,
} from "@/lib/qep/automation-mapping-store";
import { appendQepAuditEvent } from "@/lib/qep/qep-audit-store";
import { requireQepPermission } from "./require-qep-permission";

const ACTIONS = [
  "upsert",
  "mark_flaky",
  "clear_flaky",
  "mark_stale",
  "clear_stale",
  "set_owner",
] as const;

type MappingAction = (typeof ACTIONS)[number];

function isAction(value: unknown): value is MappingAction {
  return typeof value === "string" && (ACTIONS as readonly string[]).includes(value);
}

export async function handleListAutomationMappings(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.automation.read");
  return jsonDataResponse({ mappings: listMappings() }, context.tracing);
}

export async function handleAutomationMappingsMutation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.automation.operate");
  const body = (await request.json()) as {
    action?: string;
    providerId?: string;
    externalKey?: string;
    owner?: string;
    notes?: string;
    defectRef?: string;
  };

  const actorId = context.serviceContext.userId ?? "unknown";
  const { correlationId } = context.tracing;
  const action = body.action;
  const providerId = body.providerId?.trim();
  const externalKey = body.externalKey?.trim();

  if (!isAction(action) || !providerId || !externalKey) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message:
        "action, providerId, and externalKey are required (actions: upsert|mark_flaky|clear_flaky|mark_stale|clear_stale|set_owner)",
    });
  }

  if (action === "set_owner" && body.owner === undefined) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "owner is required for set_owner",
    });
  }

  if (action === "mark_flaky") {
    const justification = body.notes?.trim() ?? "";
    if (justification.length < 8) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message:
          "mark_flaky requires notes justification (at least 8 characters) — never silent suppress",
      });
    }
  }

  if (
    action !== "upsert" &&
    action !== "set_owner" &&
    !findMapping(providerId, externalKey)
  ) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Mapping not found",
    });
  }

  const patch: {
    readonly providerId: string;
    readonly externalKey: string;
    readonly actorId: string;
    readonly owner?: string;
    readonly flaky?: boolean;
    readonly stale?: boolean;
    readonly notes?: string;
    readonly defectRef?: string;
  } = {
    providerId,
    externalKey,
    actorId,
    ...(action === "upsert" || action === "set_owner"
      ? body.owner !== undefined
        ? { owner: body.owner }
        : {}
      : {}),
    ...(action === "upsert" && body.notes !== undefined ? { notes: body.notes } : {}),
    ...(action === "upsert" && body.defectRef !== undefined
      ? { defectRef: body.defectRef }
      : {}),
    ...(action === "mark_flaky"
      ? {
          flaky: true,
          notes: body.notes?.trim(),
          ...(body.defectRef !== undefined ? { defectRef: body.defectRef.trim() } : {}),
        }
      : {}),
    ...(action === "clear_flaky" ? { flaky: false } : {}),
    ...(action === "mark_stale" ? { stale: true } : {}),
    ...(action === "clear_stale" ? { stale: false } : {}),
  };

  const item = upsertMapping(patch);
  appendQepAuditEvent({
    action: `automation.mapping.${action}`,
    actor: actorId,
    correlationId,
    detail: `${providerId}:${externalKey}`,
  });
  return jsonDataResponse({ mapping: item }, context.tracing);
}
