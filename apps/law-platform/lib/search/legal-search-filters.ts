import type { LegalSearchEntityType } from "../knowledge/map-legal-search-document";

export type LegalSearchEntityFilter = LegalSearchEntityType | "all";

export interface LegalSearchFilters {
  readonly entityType?: LegalSearchEntityFilter;
  readonly matterId?: string;
  readonly clientId?: string;
  readonly status?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly scopeMatterId?: string;
  readonly scopeClientId?: string;
}

export const EMPTY_LEGAL_SEARCH_FILTERS: LegalSearchFilters = Object.freeze({});

export function normalizeLegalSearchFilters(
  filters: LegalSearchFilters | undefined,
): LegalSearchFilters {
  if (!filters) {
    return EMPTY_LEGAL_SEARCH_FILTERS;
  }

  return Object.freeze({
    ...(filters.entityType && filters.entityType !== "all"
      ? { entityType: filters.entityType }
      : {}),
    ...(filters.matterId ? { matterId: filters.matterId } : {}),
    ...(filters.clientId ? { clientId: filters.clientId } : {}),
    ...(filters.status && filters.status !== "all" ? { status: filters.status } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    ...(filters.scopeMatterId ? { scopeMatterId: filters.scopeMatterId } : {}),
    ...(filters.scopeClientId ? { scopeClientId: filters.scopeClientId } : {}),
  });
}

export function hasActiveLegalSearchFilters(filters: LegalSearchFilters): boolean {
  const normalized = normalizeLegalSearchFilters(filters);
  return Object.keys(normalized).length > 0;
}

export function mergeLegalSearchScope(
  filters: LegalSearchFilters,
  scope: { readonly matterId?: string; readonly clientId?: string },
): LegalSearchFilters {
  return normalizeLegalSearchFilters({
    ...filters,
    ...(scope.matterId
      ? { scopeMatterId: scope.matterId, matterId: filters.matterId ?? scope.matterId }
      : {}),
    ...(scope.clientId
      ? { scopeClientId: scope.clientId, clientId: filters.clientId ?? scope.clientId }
      : {}),
  });
}

export function toKnowledgeQueryFilters(
  filters: LegalSearchFilters,
): Readonly<Record<string, unknown>> {
  const normalized = normalizeLegalSearchFilters(filters);
  return Object.freeze({ ...normalized });
}

export function parseLegalSearchFiltersFromSearchParams(
  params: URLSearchParams,
): LegalSearchFilters {
  const entityType = params.get("entity");
  const filters: LegalSearchFilters = {
    ...(entityType ? { entityType: entityType as LegalSearchEntityFilter } : {}),
    ...(params.get("matterId") ? { matterId: params.get("matterId")! } : {}),
    ...(params.get("clientId") ? { clientId: params.get("clientId")! } : {}),
    ...(params.get("status") ? { status: params.get("status")! } : {}),
    ...(params.get("dateFrom") ? { dateFrom: params.get("dateFrom")! } : {}),
    ...(params.get("dateTo") ? { dateTo: params.get("dateTo")! } : {}),
    ...(params.get("scopeMatterId")
      ? { scopeMatterId: params.get("scopeMatterId")! }
      : {}),
    ...(params.get("scopeClientId")
      ? { scopeClientId: params.get("scopeClientId")! }
      : {}),
  };

  return normalizeLegalSearchFilters(filters);
}

export function appendLegalSearchFiltersToSearchParams(
  params: URLSearchParams,
  filters: LegalSearchFilters,
): URLSearchParams {
  const normalized = normalizeLegalSearchFilters(filters);

  if (normalized.entityType) {
    params.set("entity", normalized.entityType);
  }
  if (normalized.matterId) {
    params.set("matterId", normalized.matterId);
  }
  if (normalized.clientId) {
    params.set("clientId", normalized.clientId);
  }
  if (normalized.status) {
    params.set("status", normalized.status);
  }
  if (normalized.dateFrom) {
    params.set("dateFrom", normalized.dateFrom);
  }
  if (normalized.dateTo) {
    params.set("dateTo", normalized.dateTo);
  }
  if (normalized.scopeMatterId) {
    params.set("scopeMatterId", normalized.scopeMatterId);
  }
  if (normalized.scopeClientId) {
    params.set("scopeClientId", normalized.scopeClientId);
  }

  return params;
}

export function parseLegalSearchFiltersFromCommandArgs(
  args: Readonly<Record<string, unknown>>,
): LegalSearchFilters {
  return normalizeLegalSearchFilters({
    ...(typeof args.entityType === "string"
      ? { entityType: args.entityType as LegalSearchEntityFilter }
      : {}),
    ...(typeof args.matterId === "string" ? { matterId: args.matterId } : {}),
    ...(typeof args.clientId === "string" ? { clientId: args.clientId } : {}),
    ...(typeof args.status === "string" ? { status: args.status } : {}),
    ...(typeof args.dateFrom === "string" ? { dateFrom: args.dateFrom } : {}),
    ...(typeof args.dateTo === "string" ? { dateTo: args.dateTo } : {}),
    ...(typeof args.scopeMatterId === "string"
      ? { scopeMatterId: args.scopeMatterId }
      : {}),
    ...(typeof args.scopeClientId === "string"
      ? { scopeClientId: args.scopeClientId }
      : {}),
  });
}
