/**
 * H4 — fail-closed QEP API permission gate (session grants only).
 * Product-scoped qep.* operations also require org∩user product access.
 */

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { requireProductAccess } from "@/lib/commercial/require-product-access";

function hasPermission(granted: readonly string[], required: string): boolean {
  if (
    granted.includes(required) ||
    granted.includes("qep.*") ||
    granted.includes("*")
  ) {
    return true;
  }
  // Prefix wildcards e.g. qep.automation.*
  const parts = required.split(".");
  for (let i = parts.length - 1; i >= 1; i -= 1) {
    const wildcard = `${parts.slice(0, i).join(".")}.*`;
    if (granted.includes(wildcard)) return true;
  }
  return false;
}

function isQepOperatePermission(permission: string): boolean {
  return (
    permission.startsWith("qep.") ||
    permission.startsWith("cap.qep.") ||
    permission === "qep.*"
  );
}

export function sessionHasQepPermission(
  context: PlatformApiRequestContext,
  permission: string,
): boolean {
  return hasPermission(context.serviceContext.permissions ?? [], permission);
}

/** Require at least one of the listed permissions from the authenticated session. */
export function requireQepPermission(
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
  if (requiredAnyOf.some(isQepOperatePermission)) {
    requireProductAccess(context, "qep");
  }
}

/** Authoritative tenant from session — ignore client-supplied tenantId. */
export function sessionTenantId(context: PlatformApiRequestContext): string {
  const tenantId = context.serviceContext.tenantId?.trim();
  if (!tenantId) {
    throw new PlatformApiHttpError(403, {
      code: "TENANT_MEMBERSHIP_REQUIRED",
      message: "Tenant membership required",
    });
  }
  return tenantId;
}
