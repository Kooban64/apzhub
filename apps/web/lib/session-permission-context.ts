import type { EnrichedValidatedSession } from "@apzhub/auth/server";
import { resolveSessionAuthorization } from "@apzhub/platform-authorization/server";
import type { AuthSessionPermissionInput } from "@apzhub/workbench-framework";
import { createAuthPermissionContextFromUser } from "@apzhub/workbench-framework/server";

/** Resolve platform authorization for apps/web hydration (M8-02). */
export async function createPlatformAuthPermissionContext(
  session: EnrichedValidatedSession | null | undefined,
  productKey = "platform",
): Promise<AuthSessionPermissionInput | null> {
  if (!session?.user?.id) {
    return null;
  }

  const authz = await resolveSessionAuthorization({
    userId: session.user.id,
    tenantId: session.tenantId,
    productKey,
  });

  return createAuthPermissionContextFromUser(session.user, {
    roles: authz.roles,
    permissions: authz.permissions,
  });
}
