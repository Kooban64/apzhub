import type { KnowledgeQuery } from "@apzhub/knowledge-discovery-framework";

import type { ClientSearchCriteria } from "../clients";
import type { DocumentListCriteria } from "../documents";
import type { MatterListCriteria } from "../matters";
import type { TaskListCriteria } from "../tasks";
import type { TimeEntryListCriteria } from "../time";
import type { CalendarEventListCriteria } from "../calendar";
import { getActiveLegalSearchQueryFilters } from "../search/legal-search-query-context";
import {
  normalizeLegalSearchFilters,
  type LegalSearchFilters,
} from "../search/legal-search-filters";

export function readLegalSearchFiltersFromKnowledgeQuery(
  query: KnowledgeQuery,
): LegalSearchFilters {
  const raw = query.filters ?? {};
  const fromQuery = normalizeLegalSearchFilters({
    ...(typeof raw.entityType === "string"
      ? { entityType: raw.entityType as LegalSearchFilters["entityType"] }
      : {}),
    ...(typeof raw.matterId === "string" ? { matterId: raw.matterId } : {}),
    ...(typeof raw.clientId === "string" ? { clientId: raw.clientId } : {}),
    ...(typeof raw.status === "string" ? { status: raw.status } : {}),
    ...(typeof raw.dateFrom === "string" ? { dateFrom: raw.dateFrom } : {}),
    ...(typeof raw.dateTo === "string" ? { dateTo: raw.dateTo } : {}),
    ...(typeof raw.scopeMatterId === "string"
      ? { scopeMatterId: raw.scopeMatterId }
      : {}),
    ...(typeof raw.scopeClientId === "string"
      ? { scopeClientId: raw.scopeClientId }
      : {}),
  });
  const active = getActiveLegalSearchQueryFilters();

  return normalizeLegalSearchFilters({ ...active, ...fromQuery });
}

function resolveScopedMatterId(filters: LegalSearchFilters): string | undefined {
  return filters.matterId ?? filters.scopeMatterId;
}

function resolveScopedClientId(filters: LegalSearchFilters): string | undefined {
  return filters.clientId ?? filters.scopeClientId;
}

export function buildClientSearchCriteria(
  queryText: string,
  filters: LegalSearchFilters,
): ClientSearchCriteria {
  const scopedFilters = normalizeLegalSearchFilters(filters);
  return {
    query: queryText,
    ...(scopedFilters.status
      ? { status: scopedFilters.status as NonNullable<ClientSearchCriteria["status"]> }
      : {}),
  };
}

export function buildMatterSearchCriteria(
  queryText: string,
  filters: LegalSearchFilters,
): MatterListCriteria {
  const scopedFilters = normalizeLegalSearchFilters(filters);
  const clientId = resolveScopedClientId(scopedFilters);

  return {
    query: queryText,
    ...(clientId ? { clientId } : {}),
    ...(scopedFilters.status
      ? { status: scopedFilters.status as MatterListCriteria["status"] }
      : {}),
  };
}

export function buildDocumentSearchCriteria(
  queryText: string,
  filters: LegalSearchFilters,
): DocumentListCriteria {
  const scopedFilters = normalizeLegalSearchFilters(filters);
  const matterId = resolveScopedMatterId(scopedFilters);
  const clientId = resolveScopedClientId(scopedFilters);

  return {
    query: queryText,
    ...(matterId ? { matterId } : {}),
    ...(clientId ? { clientId } : {}),
    ...(scopedFilters.status
      ? {
          documentStatus:
            scopedFilters.status as DocumentListCriteria["documentStatus"],
        }
      : {}),
  };
}

export function buildTaskSearchCriteria(
  queryText: string,
  filters: LegalSearchFilters,
): TaskListCriteria {
  const scopedFilters = normalizeLegalSearchFilters(filters);
  const matterId = resolveScopedMatterId(scopedFilters);

  return {
    query: queryText,
    ...(matterId ? { matterId } : {}),
    ...(scopedFilters.status
      ? { taskStatus: scopedFilters.status as TaskListCriteria["taskStatus"] }
      : {}),
  };
}

export function buildTimeEntrySearchCriteria(
  queryText: string,
  filters: LegalSearchFilters,
): TimeEntryListCriteria {
  const scopedFilters = normalizeLegalSearchFilters(filters);
  const matterId = resolveScopedMatterId(scopedFilters);

  return {
    query: queryText,
    ...(matterId ? { matterId } : {}),
    ...(scopedFilters.dateFrom || scopedFilters.dateTo
      ? { entryDateFilter: "last_30_days" as const }
      : {}),
  };
}

export function buildInvoiceSearchCriteria(
  queryText: string,
  filters: LegalSearchFilters,
): import("../billing").InvoiceListCriteria {
  const scopedFilters = normalizeLegalSearchFilters(filters);
  const matterId = resolveScopedMatterId(scopedFilters);
  const clientId = resolveScopedClientId(scopedFilters);

  return {
    query: queryText,
    ...(matterId ? { matterId } : {}),
    ...(clientId ? { clientId } : {}),
    ...(scopedFilters.status
      ? {
          invoiceStatus:
            scopedFilters.status as import("../billing").InvoiceListCriteria["invoiceStatus"],
        }
      : {}),
  };
}

export function buildCalendarEventSearchCriteria(
  queryText: string,
  filters: LegalSearchFilters,
): CalendarEventListCriteria {
  const scopedFilters = normalizeLegalSearchFilters(filters);
  const matterId = resolveScopedMatterId(scopedFilters);
  const clientId = resolveScopedClientId(scopedFilters);

  return {
    query: queryText,
    ...(matterId ? { matterId } : {}),
    ...(clientId ? { clientId } : {}),
    ...(scopedFilters.status
      ? {
          calendarEventStatus:
            scopedFilters.status as CalendarEventListCriteria["calendarEventStatus"],
        }
      : {}),
    ...(scopedFilters.dateFrom ? { dateFrom: scopedFilters.dateFrom } : {}),
    ...(scopedFilters.dateTo ? { dateTo: scopedFilters.dateTo } : {}),
  };
}

export function matchesLegalSearchDateRange(
  isoDate: string | undefined,
  filters: LegalSearchFilters,
): boolean {
  if (!isoDate) {
    return !filters.dateFrom && !filters.dateTo;
  }

  const value = isoDate.slice(0, 10);
  if (filters.dateFrom && value < filters.dateFrom) {
    return false;
  }
  if (filters.dateTo && value > filters.dateTo) {
    return false;
  }

  return true;
}

export function shouldIncludeEntityType(
  entityType: LegalSearchFilters["entityType"] | undefined,
  expected: Exclude<LegalSearchFilters["entityType"], "all" | undefined>,
): boolean {
  return !entityType || entityType === "all" || entityType === expected;
}
