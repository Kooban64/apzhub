/**
 * Mandatory search security filters (APZSEARCH-006).
 * Tenant (+ org when present) filters are always applied; clients cannot strip them.
 * Fail closed when filters cannot be applied.
 */

import type {
  SearchFilter,
  SearchQuery,
  SearchRequestContext,
  SearchSecurityFilter,
} from "@apzhub/search-contracts";
import {
  asMandatorySecurityFilter,
  buildOrganisationEqFilter,
  buildTenantEqFilter,
  searchSecurityFilterViolation,
  searchTenantFilterRequired,
} from "@apzhub/search-contracts";

const PROTECTED_FIELDS = new Set(["tenantId", "organisationId"]);

export type ApplySearchSecurityFiltersResult = {
  readonly query: SearchQuery;
  readonly mandatory: readonly SearchSecurityFilter[];
};

function clientAttemptsOverride(
  filters: readonly SearchFilter[] | undefined,
  field: string,
): boolean {
  return (filters ?? []).some((f) => f.field === field);
}

/**
 * Build + merge mandatory tenant/org security filters into a query.
 * Any client filter on protected fields is rejected (fail closed).
 */
export function applyMandatorySearchSecurityFilters(
  context: SearchRequestContext,
  query: SearchQuery,
): ApplySearchSecurityFiltersResult {
  const tenantId = context.tenantId?.trim();
  if (!tenantId) {
    throw searchTenantFilterRequired(
      "Request context lacks tenantId — cannot apply mandatory tenant filter",
    );
  }

  if (clientAttemptsOverride(query.filters, "tenantId")) {
    throw searchSecurityFilterViolation(
      "Client must not supply or override tenantId filters",
    );
  }
  if (
    context.organisationId &&
    clientAttemptsOverride(query.filters, "organisationId")
  ) {
    throw searchSecurityFilterViolation(
      "Client must not supply or override organisationId filters",
    );
  }

  const mandatory: SearchSecurityFilter[] = [
    asMandatorySecurityFilter("tenant", buildTenantEqFilter(tenantId)),
  ];

  if (context.organisationId) {
    mandatory.push(
      asMandatorySecurityFilter(
        "organisation",
        buildOrganisationEqFilter(context.organisationId),
      ),
    );
  }

  const clientFilters = (query.filters ?? []).filter(
    (f) => !PROTECTED_FIELDS.has(f.field),
  );

  return {
    query: {
      ...query,
      filters: [...mandatory.map((m) => m.filter), ...clientFilters],
    },
    mandatory,
  };
}

/** Verify a query still contains mandatory tenant equality — used after merges. */
export function assertMandatoryTenantFilterPresent(
  context: SearchRequestContext,
  query: SearchQuery,
): void {
  const tenantId = context.tenantId?.trim();
  if (!tenantId) {
    throw searchTenantFilterRequired();
  }
  const ok = (query.filters ?? []).some(
    (f) =>
      f.field === "tenantId" &&
      f.op === "eq" &&
      String(f.value) === tenantId,
  );
  if (!ok) {
    throw searchTenantFilterRequired(
      "Mandatory tenantId equality filter missing after security merge",
    );
  }
}
