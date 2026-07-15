/**
 * Tenant isolation & security filter contracts (APZSEARCH-006).
 */

import type { SearchFilter } from "../domain/search";
import type {
  SearchSecurityFilter,
  SearchTenantIsolationPolicy,
} from "../services/search-execution-services";

export const DEFAULT_SEARCH_TENANT_ISOLATION_POLICY: SearchTenantIsolationPolicy =
  {
    strategy: "shared_index_mandatory_tenant_filters",
    failClosed: true,
    enforceOrganisationWhenPresent: true,
  };

export const SEARCH_TENANT_FILTER_FIELD = "tenantId" as const;
export const SEARCH_ORGANISATION_FILTER_FIELD = "organisationId" as const;

export function buildTenantEqFilter(tenantId: string): SearchFilter {
  return {
    field: SEARCH_TENANT_FILTER_FIELD,
    op: "eq",
    value: tenantId,
  };
}

export function buildOrganisationEqFilter(organisationId: string): SearchFilter {
  return {
    field: SEARCH_ORGANISATION_FILTER_FIELD,
    op: "eq",
    value: organisationId,
  };
}

export function asMandatorySecurityFilter(
  kind: SearchSecurityFilter["kind"],
  filter: SearchFilter,
): SearchSecurityFilter {
  return { kind, filter, mandatory: true };
}
