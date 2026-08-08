/**
 * ANA-PR-05 — fail-closed Analytics API permission gate (session grants only).
 */

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";

function hasPermission(granted: readonly string[], required: string): boolean {
  if (
    granted.includes(required) ||
    granted.includes("analytics.*") ||
    granted.includes("*")
  ) {
    return true;
  }
  const parts = required.split(".");
  for (let i = parts.length - 1; i >= 1; i -= 1) {
    const wildcard = `${parts.slice(0, i).join(".")}.*`;
    if (granted.includes(wildcard)) return true;
  }
  return false;
}

/** Require at least one of the listed Analytics permissions from the session. */
export function requireAnalyticsPermission(
  context: PlatformApiRequestContext,
  ...requiredAnyOf: readonly string[]
): void {
  const granted = context.serviceContext.permissions ?? [];
  const ok = requiredAnyOf.some((perm) => hasPermission(granted, perm));
  if (!ok) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: `Missing permission: ${requiredAnyOf.join(" | ")}`,
    });
  }
}

/** Authoritative tenant from session — ignore client-supplied tenantId. */
export function analyticsSessionTenantId(context: PlatformApiRequestContext): string {
  const tenantId = context.serviceContext.tenantId?.trim();
  if (!tenantId) {
    throw new PlatformApiHttpError(403, {
      code: "TENANT_MEMBERSHIP_REQUIRED",
      message: "Tenant membership required",
    });
  }
  return tenantId;
}
