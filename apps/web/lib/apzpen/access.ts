import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { tenantHasProductSubscriptions } from "@/lib/commercial/resolve-entitlements";
import { requireProductAccess } from "@/lib/commercial/require-product-access";

export type ApzpenAccessMode =
  "read" | "write" | "manage" | "test" | "retest" | "certify";

function organisationIdFrom(context: PlatformApiRequestContext): string {
  return (
    context.serviceContext.tenantId?.trim() ||
    context.session.tenantId?.trim() ||
    context.session.user.activeTenantId?.trim() ||
    ""
  );
}

function hasPlatformBypass(perms: readonly string[]): boolean {
  return (
    perms.includes("*") ||
    perms.includes("admin.platform") ||
    perms.includes("platform.*")
  );
}

function hasApzpenRead(perms: readonly string[]): boolean {
  return (
    hasPlatformBypass(perms) ||
    perms.includes("apzpen.read") ||
    perms.includes("apzpen.manage") ||
    perms.includes("apzpen.test") ||
    perms.includes("apzpen.retest") ||
    perms.includes("apzpen.certify")
  );
}

/** Any write-capable APZPEN permission (legacy write gate). */
function hasApzpenWrite(perms: readonly string[]): boolean {
  return (
    hasPlatformBypass(perms) ||
    perms.includes("apzpen.manage") ||
    perms.includes("apzpen.test") ||
    perms.includes("apzpen.retest") ||
    perms.includes("apzpen.certify")
  );
}

function hasApzpenManage(perms: readonly string[]): boolean {
  return hasPlatformBypass(perms) || perms.includes("apzpen.manage");
}

function hasApzpenTest(perms: readonly string[]): boolean {
  return (
    hasPlatformBypass(perms) ||
    perms.includes("apzpen.test") ||
    perms.includes("apzpen.manage")
  );
}

function hasApzpenRetest(perms: readonly string[]): boolean {
  return (
    hasPlatformBypass(perms) ||
    perms.includes("apzpen.retest") ||
    perms.includes("apzpen.manage")
  );
}

function hasApzpenCertify(perms: readonly string[]): boolean {
  return (
    hasPlatformBypass(perms) ||
    perms.includes("apzpen.certify") ||
    perms.includes("apzpen.manage")
  );
}

export function checkApzpenPermission(
  perms: readonly string[],
  mode: ApzpenAccessMode,
): boolean {
  switch (mode) {
    case "read":
      return hasApzpenRead(perms);
    case "write":
      return hasApzpenWrite(perms);
    case "manage":
      return hasApzpenManage(perms);
    case "test":
      return hasApzpenTest(perms);
    case "retest":
      return hasApzpenRetest(perms);
    case "certify":
      return hasApzpenCertify(perms);
  }
}

function denyMessage(mode: ApzpenAccessMode): string {
  switch (mode) {
    case "read":
      return "APZPEN read permission required";
    case "write":
      return "APZPEN write permission required";
    case "manage":
      return "APZPEN manage permission required";
    case "test":
      return "APZPEN test permission required";
    case "retest":
      return "APZPEN retest permission required";
    case "certify":
      return "APZPEN certify permission required";
  }
}

/**
 * APZPEN access — product entitlement + permission catalogue.
 * Bootstrap (no subscriptions + empty permissions) stays open for local CE demo.
 */
export function requireApzpenAccess(
  context: PlatformApiRequestContext,
  mode: ApzpenAccessMode = "read",
): void {
  const organisationId = organisationIdFrom(context);
  const perms = context.serviceContext.permissions ?? [];
  const hasSubs =
    Boolean(organisationId) && tenantHasProductSubscriptions(organisationId);

  if (hasSubs) {
    requireProductAccess(context, "pentest");
  } else if (organisationId && process.env.NODE_ENV === "production") {
    requireProductAccess(context, "pentest");
  }

  if (perms.length === 0) {
    // Permission catalogue not hydrated — allow after commercial checks.
    return;
  }

  if (!checkApzpenPermission(perms, mode)) {
    throw new PlatformApiHttpError(403, {
      code: "APZPEN_ACCESS_DENIED",
      message: denyMessage(mode),
    });
  }
}

export function resolveTenantId(context: PlatformApiRequestContext): string {
  const tenantId =
    context.serviceContext.tenantId ??
    context.session.tenantId ??
    context.session.user.activeTenantId ??
    context.session.user.tenantId;
  if (!tenantId) {
    throw new PlatformApiHttpError(400, {
      code: "TENANT_REQUIRED",
      message: "Active tenant is required for APZPEN.",
    });
  }
  return tenantId;
}

export function actorEmail(context: PlatformApiRequestContext): string {
  return context.session.user.email ?? context.session.user.id;
}
