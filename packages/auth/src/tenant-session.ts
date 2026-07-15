import type { PlatformSessionUser, ValidatedSession } from "./session-types";
import {
  getSharedTenantSessionResolver,
  type TenantSessionResolver,
} from "@apzhub/platform-identity";

export interface SessionTenantResolution {
  readonly tenantId: string | undefined;
  readonly source: "user_active_tenant" | "primary_membership" | "none";
}

function readActiveTenantId(user: ValidatedSession["user"]): string | undefined {
  const extended = user as { activeTenantId?: string; tenantId?: string };
  const candidate = extended.activeTenantId ?? extended.tenantId;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : undefined;
}

export function resolveSessionTenantSync(
  session: ValidatedSession | null | undefined,
  resolver: TenantSessionResolver = getSharedTenantSessionResolver(),
): SessionTenantResolution {
  if (!session?.user?.id) {
    return { tenantId: undefined, source: "none" };
  }

  const fromUser = readActiveTenantId(session.user);
  if (fromUser) {
    return { tenantId: fromUser, source: "user_active_tenant" };
  }

  const fromMembership = resolver.resolvePrimaryTenantId(session.user.id);
  if (fromMembership) {
    return { tenantId: fromMembership, source: "primary_membership" };
  }

  return { tenantId: undefined, source: "none" };
}

export async function resolveSessionTenant(
  session: ValidatedSession | null | undefined,
  resolver: TenantSessionResolver = getSharedTenantSessionResolver(),
): Promise<SessionTenantResolution> {
  if (!session?.user?.id) {
    return { tenantId: undefined, source: "none" };
  }

  const fromUser = readActiveTenantId(session.user);
  if (fromUser) {
    return { tenantId: fromUser, source: "user_active_tenant" };
  }

  if (process.env.DATABASE_URL) {
    try {
      const { getPrimaryTenantIdForUser } = await import(
        "@apzhub/platform-identity/postgres"
      );
      const fromDb = await getPrimaryTenantIdForUser(session.user.id);
      if (fromDb) {
        return { tenantId: fromDb, source: "primary_membership" };
      }
    } catch {
      // Fall through to in-memory resolver for degraded environments.
    }
  }

  return resolveSessionTenantSync(session, resolver);
}

export type EnrichedValidatedSession = Omit<ValidatedSession, "user"> & {
  readonly user: PlatformSessionUser;
  readonly tenantId?: string;
  readonly tenantSource?: SessionTenantResolution["source"];
};

export async function enrichValidatedSession(
  session: ValidatedSession,
  resolver: TenantSessionResolver = getSharedTenantSessionResolver(),
): Promise<EnrichedValidatedSession> {
  const resolution = await resolveSessionTenant(session, resolver);
  if (!resolution.tenantId) {
    return session;
  }

  return {
    ...session,
    user: {
      ...session.user,
      activeTenantId: resolution.tenantId,
      tenantId: resolution.tenantId,
    },
    tenantId: resolution.tenantId,
    tenantSource: resolution.source,
  };
}
