import type { KnowledgeDocument } from "@apzhub/knowledge-discovery-framework";

import { clientDetailRoute } from "../clients/client-routes";
import { documentDetailRoute } from "../documents/document-routes";
import { matterDetailRoute } from "../matters/matter-routes";
import { taskDetailRoute } from "../tasks/task-routes";
import { timeEntryDetailRoute } from "../time/time-entry-routes";
import { calendarEventDetailRoute } from "../calendar/calendar-event-routes";
import { invoiceDetailRoute } from "../billing/invoice-routes";
import { sortSearchResultsByLegalRelevance } from "../search/legal-search-ranking";
import type { LegalSearchFilters } from "../search/legal-search-filters";
import {
  LEGAL_CLIENT_SEARCH_SOURCE_ID,
  LEGAL_DOCUMENT_SEARCH_SOURCE_ID,
  LEGAL_MATTER_SEARCH_SOURCE_ID,
  LEGAL_TASK_SEARCH_SOURCE_ID,
  LEGAL_TIME_SEARCH_SOURCE_ID,
  LEGAL_CALENDAR_SEARCH_SOURCE_ID,
  LEGAL_INVOICE_SEARCH_SOURCE_ID,
} from "./legal-search-source-ids";

export type LegalSearchEntityType =
  | "client"
  | "matter"
  | "document"
  | "task"
  | "time_entry"
  | "calendar_event"
  | "invoice";

export const LEGAL_SEARCH_ENTITY_TYPE_LABELS: Readonly<
  Record<LegalSearchEntityType, string>
> = {
  client: "Client",
  matter: "Matter",
  document: "Document",
  task: "Task",
  time_entry: "Time Entry",
  calendar_event: "Calendar Event",
  invoice: "Invoice",
};

export function formatLegalSearchEntityTypeLabel(
  entityType: LegalSearchEntityType,
): string {
  return LEGAL_SEARCH_ENTITY_TYPE_LABELS[entityType];
}

export interface LegalSearchResultView {
  readonly entityType: LegalSearchEntityType;
  readonly title: string;
  readonly subtitle: string;
  readonly reference: string;
  readonly relatedLabel?: string;
  readonly route: string;
  readonly document: KnowledgeDocument;
  readonly score?: number;
}

export function resolveEntityTypeFromSourceId(
  sourceId: string,
): LegalSearchEntityType | undefined {
  switch (sourceId) {
    case LEGAL_CLIENT_SEARCH_SOURCE_ID:
      return "client";
    case LEGAL_MATTER_SEARCH_SOURCE_ID:
      return "matter";
    case LEGAL_DOCUMENT_SEARCH_SOURCE_ID:
      return "document";
    case LEGAL_TASK_SEARCH_SOURCE_ID:
      return "task";
    case LEGAL_TIME_SEARCH_SOURCE_ID:
      return "time_entry";
    case LEGAL_CALENDAR_SEARCH_SOURCE_ID:
      return "calendar_event";
    case LEGAL_INVOICE_SEARCH_SOURCE_ID:
      return "invoice";
    default:
      return undefined;
  }
}

export function mapKnowledgeDocumentToSearchResult(
  document: KnowledgeDocument,
): LegalSearchResultView | undefined {
  const entityType = resolveEntityTypeFromSourceId(document.sourceId);
  if (!entityType) {
    return undefined;
  }

  const reference = String(document.metadata?.reference ?? document.description ?? "—");
  const relatedLabel =
    typeof document.metadata?.relatedLabel === "string"
      ? document.metadata.relatedLabel
      : undefined;
  const route =
    document.navigation?.target ??
    resolveRouteFromMetadata(entityType, document.metadata ?? {});

  if (!route) {
    return undefined;
  }

  return {
    entityType,
    title: document.title,
    subtitle: document.description ?? reference,
    reference,
    relatedLabel,
    route,
    document,
    score: document.score,
  };
}

function resolveRouteFromMetadata(
  entityType: LegalSearchEntityType,
  metadata: Readonly<Record<string, unknown>>,
): string | undefined {
  switch (entityType) {
    case "client":
      return typeof metadata.clientId === "string"
        ? clientDetailRoute(metadata.clientId)
        : undefined;
    case "matter":
      return typeof metadata.matterId === "string"
        ? matterDetailRoute(metadata.matterId)
        : undefined;
    case "document":
      return typeof metadata.documentId === "string"
        ? documentDetailRoute(metadata.documentId)
        : undefined;
    case "task":
      return typeof metadata.taskId === "string"
        ? taskDetailRoute(metadata.taskId)
        : undefined;
    case "time_entry":
      return typeof metadata.timeEntryId === "string"
        ? timeEntryDetailRoute(metadata.timeEntryId)
        : undefined;
    case "calendar_event":
      return typeof metadata.calendarEventId === "string"
        ? calendarEventDetailRoute(metadata.calendarEventId)
        : undefined;
    case "invoice":
      return typeof metadata.invoiceId === "string"
        ? invoiceDetailRoute(metadata.invoiceId)
        : undefined;
    default:
      return undefined;
  }
}

export function groupSearchResultsByEntityType(
  results: readonly LegalSearchResultView[],
): Readonly<Record<LegalSearchEntityType, readonly LegalSearchResultView[]>> {
  return {
    client: results.filter((result) => result.entityType === "client"),
    matter: results.filter((result) => result.entityType === "matter"),
    document: results.filter((result) => result.entityType === "document"),
    task: results.filter((result) => result.entityType === "task"),
    time_entry: results.filter((result) => result.entityType === "time_entry"),
    calendar_event: results.filter((result) => result.entityType === "calendar_event"),
    invoice: results.filter((result) => result.entityType === "invoice"),
  };
}

export function sortSearchResultsByRelevance(
  results: readonly LegalSearchResultView[],
  queryText = "",
  filters: LegalSearchFilters = {},
): readonly LegalSearchResultView[] {
  return sortSearchResultsByLegalRelevance(results, queryText, filters);
}
