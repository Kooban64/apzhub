import { getSessionPolicyPostureSummary } from "@apzhub/auth/session-diagnostics";

import { securePlatformResponse } from "./http-security-response";
import type { SessionSecurityPosture } from "./security-types";

export function getSessionSecurityPosture(): SessionSecurityPosture {
  return getSessionPolicyPostureSummary();
}

export interface PlatformApiGuardSession {
  readonly user: { readonly id: string };
  readonly tenantId?: string;
}

export interface PlatformApiGuardResult {
  readonly ok: true;
  readonly session: PlatformApiGuardSession;
}

export interface PlatformApiGuardFailure {
  readonly ok: false;
  readonly status: 401 | 403;
  readonly body: { readonly error: { readonly code: string; readonly message: string } };
}

export type PlatformApiGuardOutcome = PlatformApiGuardResult | PlatformApiGuardFailure;

export async function requirePlatformSession(
  session: PlatformApiGuardSession | null | undefined,
): Promise<PlatformApiGuardOutcome> {
  if (!session?.user?.id) {
    return {
      ok: false,
      status: 401,
      body: {
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      },
    };
  }

  return { ok: true, session };
}

export async function requirePlatformSessionWithTenant(
  session: PlatformApiGuardSession | null | undefined,
): Promise<PlatformApiGuardOutcome> {
  const sessionResult = await requirePlatformSession(session);
  if (!sessionResult.ok) {
    return sessionResult;
  }

  if (!sessionResult.session.tenantId) {
    return {
      ok: false,
      status: 403,
      body: {
        error: {
          code: "TENANT_REQUIRED",
          message: "Tenant binding is required.",
        },
      },
    };
  }

  return sessionResult;
}

export async function requirePlatformPermission(
  session: PlatformApiGuardSession | null | undefined,
  permissionKey = "platform.nav.administration.view",
  productKey = "platform",
): Promise<PlatformApiGuardOutcome> {
  const sessionResult = await requirePlatformSession(session);
  if (!sessionResult.ok) {
    return sessionResult;
  }

  const { resolveSessionAuthorization } = await import("@apzhub/platform-authorization/server");
  const authz = await resolveSessionAuthorization({
    userId: sessionResult.session.user.id,
    tenantId: sessionResult.session.tenantId,
    productKey,
  });

  const allowed =
    authz.permissions.includes("*") ||
    authz.permissions.includes(permissionKey) ||
    authz.permissions.some(
      (permission) =>
        permission.endsWith(".*") &&
        permissionKey.startsWith(permission.slice(0, -2)),
    );

  if (!allowed) {
    return {
      ok: false,
      status: 403,
      body: {
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions.",
        },
      },
    };
  }

  return sessionResult;
}

export function guardFailureResponse(failure: PlatformApiGuardFailure): Response {
  return securePlatformResponse(Response.json(failure.body, { status: failure.status }), "api");
}
