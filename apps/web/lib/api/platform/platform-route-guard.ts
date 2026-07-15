import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import {
  guardFailureResponse,
  requirePlatformPermission,
  type PlatformApiGuardFailure,
  type PlatformApiGuardSession,
} from "@apzhub/platform-security";

export type PlatformRouteGuardResult =
  | { readonly ok: true; readonly session: PlatformApiGuardSession }
  | { readonly ok: false; readonly response: Response };

function toGuardSession(
  session: Awaited<ReturnType<typeof getValidatedSession>>,
): PlatformApiGuardSession | null {
  if (!session?.user?.id) {
    return null;
  }

  return {
    user: { id: session.user.id },
    tenantId: session.tenantId,
  };
}

/** Require platform administration permission for privileged diagnostics routes (PRH-007). */
export async function requirePlatformAdminRoute(
  permissionKey = "platform.nav.administration.view",
): Promise<PlatformRouteGuardResult> {
  const session = toGuardSession(await getValidatedSession(await headers()));
  const result = await requirePlatformPermission(session, permissionKey);

  if (!result.ok) {
    return { ok: false, response: guardFailureResponse(result as PlatformApiGuardFailure) };
  }

  return { ok: true, session: result.session };
}
