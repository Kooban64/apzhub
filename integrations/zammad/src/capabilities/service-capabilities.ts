export type ZammadServiceOperation =
  | "list"
  | "get"
  | "create"
  | "update"
  | "archive"
  | "close"
  | "reopen"
  | "changeState"
  | "changePriority"
  | "assignOwner"
  | "removeOwner"
  | "assignCustomer"
  | "search"
  | "lookup"
  | "searchByTicketNumber"
  | "searchByTitle"
  | "createNote"
  | "createReply"
  | "searchSupportRequests"
  | "searchOrganizations"
  | "searchGroups"
  | "searchUsers"
  | "searchArticles"
  | "getTimeline"
  | "getSupportTimeline"
  | "getSupportIntelligence"
  | "getSnapshot"
  | "validate"
  | "translate"
  | "full"
  | "incremental"
  | "resume"
  | "status"
  | "delete";

export type ZammadCoreServiceId =
  | "support"
  | "organizations"
  | "groups"
  | "users"
  | "articles"
  | "search"
  | "history"
  | "analytics"
  | "webhooks"
  | "events"
  | "synchronisation";

export interface ZammadServiceCapability {
  readonly serviceId: ZammadCoreServiceId;
  readonly operations: readonly ZammadServiceOperation[];
  readonly supportsPaging: boolean;
  readonly supportsFiltering: boolean;
  readonly supportsSorting: boolean;
  readonly implemented: true;
  /** Optional notes for partial capabilities (e.g. attachment metadata only). */
  readonly notes?: readonly string[];
}

export const ZAMMAD_CORE_SERVICE_CAPABILITIES: readonly ZammadServiceCapability[] = [
  {
    serviceId: "support",
    operations: [
      "list",
      "get",
      "create",
      "update",
      "close",
      "reopen",
      "changeState",
      "changePriority",
      "assignOwner",
      "removeOwner",
      "assignCustomer",
      "searchByTicketNumber",
      "searchByTitle",
    ],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
    implemented: true,
  },
  {
    serviceId: "organizations",
    operations: ["list", "get", "create", "update", "archive"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
    implemented: true,
  },
  {
    serviceId: "groups",
    operations: ["list", "get", "create", "update"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
    implemented: true,
  },
  {
    serviceId: "users",
    operations: ["list", "get", "lookup", "search"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
    implemented: true,
  },
  {
    serviceId: "articles",
    operations: ["list", "get", "create", "createNote", "createReply"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
    implemented: true,
    notes: [
      "Attachment metadata readable on articles",
      "Binary attachment upload/download not implemented",
      "Article update/delete unsupported on Zammad CE public API",
    ],
  },
  {
    serviceId: "search",
    operations: [
      "search",
      "searchSupportRequests",
      "searchOrganizations",
      "searchGroups",
      "searchUsers",
      "searchArticles",
    ],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
    implemented: true,
    notes: [
      "Canonical search results only — Zammad query syntax is not exposed",
      "Group search uses list + client filter when dedicated CE search is unavailable",
      "Article search scans articles for tickets matching the query",
    ],
  },
  {
    serviceId: "history",
    operations: ["list", "getTimeline", "getSupportTimeline"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
    implemented: true,
    notes: [
      "Read-only ticket history / audit timeline",
      "Provider history mapped to canonical SupportHistoryEvent",
    ],
  },
  {
    serviceId: "analytics",
    operations: ["getSupportIntelligence", "getSnapshot"],
    supportsPaging: false,
    supportsFiltering: false,
    supportsSorting: false,
    implemented: true,
    notes: [
      "Read-only Support intelligence derived from ticket inventory",
      "Does not invent unsupported engine metrics (no SLA engine)",
      "averageFirstResponseMinutes omitted unless engine provides a signal",
    ],
  },
  {
    serviceId: "webhooks",
    operations: ["list", "get", "create", "update", "delete", "validate"],
    supportsPaging: false,
    supportsFiltering: false,
    supportsSorting: false,
    implemented: true,
    notes: [
      "Webhook registration APIs only — no HTTP ingress",
      "Secrets never exposed (secretPresent flag only)",
    ],
  },
  {
    serviceId: "events",
    operations: ["translate"],
    supportsPaging: false,
    supportsFiltering: false,
    supportsSorting: false,
    implemented: true,
    notes: [
      "Canonical Support event translation only — no Platform Event Bus",
      "Unknown vendor events are ignored safely with diagnostics",
    ],
  },
  {
    serviceId: "synchronisation",
    operations: ["full", "incremental", "resume", "status"],
    supportsPaging: false,
    supportsFiltering: false,
    supportsSorting: false,
    implemented: true,
    notes: [
      "In-memory sync state only — no scheduler, workers, or persistence",
      "Enumerates support requests, organizations, groups, and users",
    ],
  },
] as const;

export function discoverZammadCoreServiceCapabilities(): readonly ZammadServiceCapability[] {
  return ZAMMAD_CORE_SERVICE_CAPABILITIES;
}

export function getZammadCoreServiceCapability(
  serviceId: ZammadCoreServiceId,
): ZammadServiceCapability | undefined {
  return ZAMMAD_CORE_SERVICE_CAPABILITIES.find(
    (entry) => entry.serviceId === serviceId,
  );
}
