/**
 * APE-Audit HTTP handlers — Platform Engine Foundation v1.0.
 * Domain audit APIs remain; this is the unified query facade.
 */

import type { NextRequest } from "next/server";

import { createPlatformAuditService } from "@apzhub/platform-audit";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";

function hasPermission(granted: readonly string[], required: string): boolean {
  if (
    granted.includes(required) ||
    granted.includes("administration.*") ||
    granted.includes("platform.*") ||
    granted.includes("*")
  ) {
    return true;
  }
  const parts = required.split(".");
  for (let i = parts.length - 1; i >= 1; i -= 1) {
    if (granted.includes(`${parts.slice(0, i).join(".")}.*`)) return true;
  }
  return false;
}

function requirePlatformAuditPermission(context: PlatformApiRequestContext): void {
  const granted = context.serviceContext.permissions ?? [];
  const ok = [
    "administration.audit.read",
    "administration.audit.list",
    "platform.audit.read",
  ].some((perm) => hasPermission(granted, perm));
  if (!ok) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Missing permission: administration.audit.read | platform.audit.read",
    });
  }
}

/** Singleton facade — providers attach without migrating domain SoRs. */
const auditService = createPlatformAuditService({ providers: [] });

export async function handleListPlatformAudit(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requirePlatformAuditPermission(context);
  const tenantId = context.serviceContext.tenantId ?? "default";
  const params = request.nextUrl.searchParams;
  const limitRaw = params.get("limit");
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;
  const result = await auditService.list({
    tenantId,
    correlationId: params.get("correlationId") ?? undefined,
    product: params.get("product") ?? undefined,
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
  });
  return jsonDataResponse(
    {
      engineId: "ape-audit",
      disposition:
        "Domain audit tables remain Systems of Record. APE-Audit is a unified query facade; source providers attach without data migration.",
      ...result,
    },
    context.tracing,
  );
}
