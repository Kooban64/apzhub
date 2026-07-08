/** Knowledge source ids for unified legal entity search (LAW-007-01). */
export const LEGAL_CLIENT_SEARCH_SOURCE_ID = "legal.clients.search";
export const LEGAL_MATTER_SEARCH_SOURCE_ID = "legal.matters.search";
export const LEGAL_DOCUMENT_SEARCH_SOURCE_ID = "legal.documents.search";
export const LEGAL_TASK_SEARCH_SOURCE_ID = "legal.tasks.search";
export const LEGAL_TIME_SEARCH_SOURCE_ID = "legal.time.search";
export const LEGAL_CALENDAR_SEARCH_SOURCE_ID = "legal.calendar.search";
export const LEGAL_INVOICE_SEARCH_SOURCE_ID = "legal.invoices.search";
export const LEGAL_TRUST_SEARCH_SOURCE_ID = "legal.trust.search";

export const LEGAL_ENTITY_SEARCH_SOURCE_IDS = [
  LEGAL_CLIENT_SEARCH_SOURCE_ID,
  LEGAL_MATTER_SEARCH_SOURCE_ID,
  LEGAL_DOCUMENT_SEARCH_SOURCE_ID,
  LEGAL_TASK_SEARCH_SOURCE_ID,
  LEGAL_TIME_SEARCH_SOURCE_ID,
  LEGAL_CALENDAR_SEARCH_SOURCE_ID,
  LEGAL_INVOICE_SEARCH_SOURCE_ID,
  LEGAL_TRUST_SEARCH_SOURCE_ID,
] as const;
