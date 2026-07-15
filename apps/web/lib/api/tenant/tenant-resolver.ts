import type { NextRequest } from "next/server";

import type { ValidatedSession } from "@apzhub/auth/server";

import { getActiveLawApiPersistenceContext } from "../persistence/law-api-persistence-scope";
import {
  DEFAULT_LAW_TENANT_ID,
  LAW_API_TENANT_ID_HEADER,
  sanitizeTenantId,
} from "./law-tenant-ids";

export type LawApiTenantSource =
  | "auth_session"
  | "tenant_claim"
  | "persistence_context"
  | "development_fallback"
  | "none";

export interface LawApiTenantResolution {
  readonly tenantId: string | undefined;
  readonly source: LawApiTenantSource;
}

export interface ResolveLawApiTenantInput {
  readonly session?: ValidatedSession | null;
  readonly request?: NextRequest;
}

function resolveTenantFromSession(
  session: ValidatedSession | null | undefined,
): string | undefined {
  if (!session?.user) {
    return undefined;
  }

  const enriched = session as { tenantId?: string };
  if (enriched.tenantId) {
    return sanitizeTenantId(enriched.tenantId);
  }

  const user = session.user as { tenantId?: string; activeTenantId?: string };
  return sanitizeTenantId(user.activeTenantId ?? user.tenantId);
}

function resolveTenantClaim(request: NextRequest | undefined): string | undefined {
  if (!request) {
    return undefined;
  }

  return sanitizeTenantId(request.headers.get(LAW_API_TENANT_ID_HEADER));
}

function resolveDevelopmentTenantFallback(): string | undefined {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  if (process.env.LAW_API_ALLOW_DEV_TENANT_FALLBACK === "false") {
    return undefined;
  }

  return sanitizeTenantId(process.env.LAW_TENANT_ID) ?? DEFAULT_LAW_TENANT_ID;
}

/**
 * Resolve tenant in order: auth session → tenant claim → persistence context → dev fallback.
 * (LAW-014-02)
 */
export function resolveLawApiTenant(
  input: ResolveLawApiTenantInput = {},
): LawApiTenantResolution {
  const fromSession = resolveTenantFromSession(input.session);
  if (fromSession) {
    return { tenantId: fromSession, source: "auth_session" };
  }

  const fromClaim = resolveTenantClaim(input.request);
  if (fromClaim) {
    return { tenantId: fromClaim, source: "tenant_claim" };
  }

  const fromPersistence = getActiveLawApiPersistenceContext()?.tenantId;
  if (fromPersistence) {
    return { tenantId: fromPersistence, source: "persistence_context" };
  }

  const fromDevFallback = resolveDevelopmentTenantFallback();
  if (fromDevFallback) {
    return { tenantId: fromDevFallback, source: "development_fallback" };
  }

  return { tenantId: undefined, source: "none" };
}
