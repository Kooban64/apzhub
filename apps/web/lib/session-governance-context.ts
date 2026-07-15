import type { EnrichedValidatedSession } from "@apzhub/auth/server";
import { resolveSessionGovernance } from "@apzhub/platform-governance/server";
import type { SessionGovernanceSnapshot } from "@apzhub/platform-governance";

/** Resolve platform governance for apps/web hydration (M8-05). */
export async function createPlatformGovernanceContext(
  session: EnrichedValidatedSession | null | undefined,
  productKey = "platform",
): Promise<SessionGovernanceSnapshot | null> {
  if (!session?.user?.id) {
    return null;
  }

  return resolveSessionGovernance({
    userId: session.user.id,
    tenantId: session.tenantId,
    productKey,
  });
}
