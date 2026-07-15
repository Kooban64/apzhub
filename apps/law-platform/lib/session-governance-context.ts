import type { EnrichedValidatedSession } from "@apzhub/auth/server";
import { resolveSessionGovernance } from "@apzhub/platform-governance/server";
import type { SessionGovernanceSnapshot } from "@apzhub/platform-governance";

const LAW_PLATFORM_PRODUCT_KEY = "law-platform";

/** Resolve platform governance for Law Platform hydration (M8-05). */
export async function createLawPlatformGovernanceContext(
  session: EnrichedValidatedSession | null | undefined,
): Promise<SessionGovernanceSnapshot | null> {
  if (!session?.user?.id) {
    return null;
  }

  return resolveSessionGovernance({
    userId: session.user.id,
    tenantId: session.tenantId,
    productKey: LAW_PLATFORM_PRODUCT_KEY,
  });
}
