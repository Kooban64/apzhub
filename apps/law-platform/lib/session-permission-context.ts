import type { EnrichedValidatedSession } from "@apzhub/auth/server";
import { resolveSessionAuthorization } from "@apzhub/platform-authorization/server";
import type { AuthSessionPermissionInput } from "@apzhub/workbench-framework";
import { createAuthPermissionContextFromUser } from "@apzhub/workbench-framework/server";

const LAW_PLATFORM_PRODUCT_KEY = "law-platform";

/** Resolve platform authorization for Law Platform hydration and API contexts (M8-02). */
export async function createLawPlatformAuthPermissionContext(
  session: EnrichedValidatedSession | null | undefined,
): Promise<AuthSessionPermissionInput | null> {
  if (!session?.user?.id) {
    return null;
  }

  const authz = await resolveSessionAuthorization({
    userId: session.user.id,
    tenantId: session.tenantId,
    productKey: LAW_PLATFORM_PRODUCT_KEY,
  });

  return createAuthPermissionContextFromUser(session.user, {
    roles: authz.roles,
    permissions: authz.permissions,
  });
}
