/**
 * Organisation Admin API route guard — session tenant + surface permission.
 * Never uses platform.nav.administration.view.
 */

import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import {
  guardFailureResponse,
  requirePlatformPermission,
  type PlatformApiGuardFailure,
  type PlatformApiGuardSession,
} from "@apzhub/platform-security";

import { ORGANISATION_ADMIN_PERMISSION } from "@/lib/organisation-admin/nav";

export type OrganisationAdminRouteGuardResult =
  | {
      readonly ok: true;
      readonly session: PlatformApiGuardSession;
      readonly tenantId: string;
      readonly permission: string;
    }
  | { readonly ok: false; readonly response: Response };

function toGuardSession(
  session: Awaited<ReturnType<typeof getValidatedSession>>,
): PlatformApiGuardSession | null {
  if (!session?.user?.id) return null;
  return {
    user: { id: session.user.id },
    tenantId: session.tenantId,
  };
}

/**
 * @param permissionKey single permission or any-of list for the surface
 * Always requires Organisation Admin gate (`identity.manage`) first.
 * Surface keys are additional any-of — never a substitute for the gate.
 * Nav display merge remains display-only; this guard is authoritative.
 */
export async function requireOrganisationAdminRoute(
  permissionKey: string | readonly string[] = ORGANISATION_ADMIN_PERMISSION,
): Promise<OrganisationAdminRouteGuardResult> {
  const raw = await getValidatedSession(await headers());
  const session = toGuardSession(raw);

  const gate = await requirePlatformPermission(session, ORGANISATION_ADMIN_PERMISSION);
  if (!gate.ok) {
    return {
      ok: false,
      response: guardFailureResponse(gate as PlatformApiGuardFailure),
    };
  }

  const surfaceKeys =
    typeof permissionKey === "string"
      ? [permissionKey]
      : permissionKey.length > 0
        ? [...permissionKey]
        : [ORGANISATION_ADMIN_PERMISSION];

  // Help / gate-only surfaces: identity.manage is sufficient.
  const onlyGate =
    surfaceKeys.length === 1 && surfaceKeys[0] === ORGANISATION_ADMIN_PERMISSION;

  let matched: string = ORGANISATION_ADMIN_PERMISSION;
  if (!onlyGate) {
    let lastFailure: PlatformApiGuardFailure | null = null;
    let surfaceMatched: string | null = null;
    for (const key of surfaceKeys) {
      if (key === ORGANISATION_ADMIN_PERMISSION) {
        surfaceMatched = key;
        break;
      }
      const result = await requirePlatformPermission(gate.session, key);
      if (result.ok) {
        surfaceMatched = key;
        break;
      }
      lastFailure = result as PlatformApiGuardFailure;
    }
    if (!surfaceMatched) {
      return {
        ok: false,
        response: guardFailureResponse(
          lastFailure ?? {
            ok: false,
            status: 403,
            body: {
              error: {
                code: "FORBIDDEN",
                message: "Organisation Admin surface permission required",
              },
            },
          },
        ),
      };
    }
    matched = surfaceMatched;
  }

  const tenantId = gate.session.tenantId?.trim();
  if (!tenantId) {
    return {
      ok: false,
      response: Response.json(
        {
          error: {
            code: "TENANT_REQUIRED",
            message: "Organisation Admin requires an active tenant context",
          },
        },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true,
    session: gate.session,
    tenantId,
    permission: matched,
  };
}
