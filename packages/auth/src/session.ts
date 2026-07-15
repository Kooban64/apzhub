import { createAuth } from "./server";
import type { ValidatedSession } from "./session-types";
import { provisionPlatformTenantForUser } from "./tenant-provisioning";
import {
  enrichValidatedSession,
  resolveSessionTenant,
  type EnrichedValidatedSession,
  type SessionTenantResolution,
} from "./tenant-session";

export type { ValidatedSession, EnrichedValidatedSession, SessionTenantResolution };
export { resolveSessionTenant, enrichValidatedSession };

function isSessionActive(session: ValidatedSession["session"]): boolean {
  const expiresAt = new Date(session.expiresAt);
  return expiresAt.getTime() > Date.now();
}

/**
 * Validates the current session against Better Auth (database-backed).
 * Enriches with platform tenant resolution (M8-01).
 */
export async function getValidatedSession(
  headers: Headers,
): Promise<EnrichedValidatedSession | null> {
  const auth = createAuth();
  const result = await auth.api.getSession({ headers });

  if (!result?.session || !result?.user) {
    return null;
  }

  if (!isSessionActive(result.session)) {
    return null;
  }

  let resolution = await resolveSessionTenant(result);
  if (!resolution.tenantId && result.user.id) {
    await provisionPlatformTenantForUser(result.user.id);
    resolution = await resolveSessionTenant(result);
  }

  return enrichValidatedSession(result);
}
