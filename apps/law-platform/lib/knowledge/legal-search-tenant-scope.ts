import { getExplicitLawPersistenceContext } from "../persistence/law-persistence-scope";

/**
 * Resolve tenant scope for legal search providers (PRH-007).
 * Search runs only when persistence ALS or session carries an explicit tenant binding.
 */
export function resolveLegalSearchTenantScope(): string | undefined {
  return getExplicitLawPersistenceContext()?.tenantId;
}
