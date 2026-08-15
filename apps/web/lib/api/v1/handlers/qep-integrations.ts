/**
 * Integration Centre connector state API (SPR-APZQEP-220-D).
 * Ledger only — does not mutate Cap automation/SCM provider stores.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { appendQepAuditEvent } from "@/lib/qep/qep-audit-store";
import {
  listConnectorStates,
  recordSync,
  upsertConnectorState,
  type ConnectorSource,
} from "@/lib/qep/integrations-store";

function hasPerm(context: PlatformApiRequestContext, keys: readonly string[]): boolean {
  const perms = context.serviceContext.permissions ?? [];
  if (perms.includes("*") || perms.includes("qep.*")) return true;
  return keys.some((k) => perms.includes(k));
}

const MERGE_NOTE =
  "Merge with automation/SCM provider catalogues in the UI; this ledger holds enablement and last-sync only.";

function parseSource(value: unknown): ConnectorSource | null {
  return value === "automation" || value === "scm" ? value : null;
}

export async function handleListIntegrations(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  if (!hasPerm(context, ["qep.integrations.read"])) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Missing permission: qep.integrations.read",
    });
  }
  return jsonDataResponse(
    {
      connectors: listConnectorStates(),
      note: MERGE_NOTE,
    },
    context.tracing,
  );
}

export async function handleIntegrationsMutation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = (await request.json()) as {
    action?: string;
    providerId?: string;
    source?: string;
  };
  const actorId = context.serviceContext.userId ?? "unknown";
  const { correlationId } = context.tracing;
  const action = body.action;
  const providerId = body.providerId?.trim();
  const source = parseSource(body.source);

  if (!action || !providerId || !source) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "action, providerId, and source (automation|scm) are required",
    });
  }

  if (action === "record_sync") {
    if (!hasPerm(context, ["qep.integrations.operate", "qep.integrations.read"])) {
      throw new PlatformApiHttpError(403, {
        code: "FORBIDDEN",
        message: "Missing permission: qep.integrations.read",
      });
    }
    let item = recordSync(providerId, source);
    if (!item) {
      upsertConnectorState({
        providerId,
        source,
        enabled: true,
        actorId,
      });
      item = recordSync(providerId, source);
    }
    if (!item) {
      throw new PlatformApiHttpError(500, {
        code: "INTERNAL_ERROR",
        message: "Failed to record sync",
      });
    }
    appendQepAuditEvent({
      action: "integrations.record_sync",
      actor: actorId,
      correlationId,
      detail: `${source}:${providerId}`,
    });
    return jsonDataResponse(item, context.tracing);
  }

  if (action === "enable" || action === "disable") {
    if (!hasPerm(context, ["qep.integrations.operate"])) {
      throw new PlatformApiHttpError(403, {
        code: "FORBIDDEN",
        message: "Missing permission: qep.integrations.operate",
      });
    }
    const item = upsertConnectorState({
      providerId,
      source,
      enabled: action === "enable",
      actorId,
    });
    appendQepAuditEvent({
      action: `integrations.${action}`,
      actor: actorId,
      correlationId,
      detail: `${source}:${providerId}`,
    });
    return jsonDataResponse(item, context.tracing);
  }

  throw new PlatformApiHttpError(400, {
    code: "VALIDATION_ERROR",
    message: "Unknown action",
  });
}
