import type { EnrichedValidatedSession } from "@apzhub/auth/server";
import { resolveSessionPersonalisation } from "@apzhub/platform-personalisation/server";
import type { UserPreferences } from "@apzhub/platform-personalisation";

/** Resolve platform personalisation for apps/web hydration (M8-04). */
export async function createPlatformPersonalisationContext(
  session: EnrichedValidatedSession | null | undefined,
): Promise<UserPreferences | null> {
  if (!session?.user?.id) {
    return null;
  }

  const snapshot = await resolveSessionPersonalisation({ userId: session.user.id });
  return snapshot.preferences;
}
