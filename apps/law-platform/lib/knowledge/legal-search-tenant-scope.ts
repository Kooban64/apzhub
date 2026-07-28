import { getSessionLawPersistenceContext } from "../persistence/law-persistence-session";

/**
 * Resolve tenant scope for legal search providers (PRH-007).
 * Client-safe: session binding only (no persistence barrel / async_hooks / pg).
 * APZHUB-ENG-0007 / RG-LAW-DNS.
 *
 * On the server, callers that bind ALS should also set session or pass tenant via
 * KnowledgeContext; shell always sets session for workbench search.
 */
export function resolveLegalSearchTenantScope(): string | undefined {
  return getSessionLawPersistenceContext()?.tenantId;
}
