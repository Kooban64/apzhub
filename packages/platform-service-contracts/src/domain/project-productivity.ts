/**
 * W009 / PX-06 — Search, navigation & productivity (Projects composition).
 * Personal productivity only — no consumer personalisation.
 */

export const SAVED_SEARCH_SCOPE_MODES = ["global", "contextual_template"] as const;
export type SavedSearchScopeMode = (typeof SAVED_SEARCH_SCOPE_MODES)[number];

export const BULK_OPERATION_KINDS = [
  "reassign_owner",
  "conclude_advisory_exceptions",
  "ack_announcements",
  "add_watchers",
  "move_programme_membership",
] as const;
export type BulkOperationKind = (typeof BULK_OPERATION_KINDS)[number];

export const BULK_OPERATION_STATUSES = [
  "pending_confirm",
  "executed",
  "cancelled",
] as const;
export type BulkOperationStatus = (typeof BULK_OPERATION_STATUSES)[number];

export type ProjectsSearchHit = {
  readonly objectType: string;
  readonly objectId: string;
  readonly title: string;
  readonly snippet: string;
  readonly owningObject: {
    readonly type: string;
    readonly id: string;
    readonly label: string;
  };
  readonly operationalRelationship: string;
  readonly matchReason: string;
  readonly scopeBreadcrumb: string;
  readonly operationalSignals?: {
    readonly health?: string;
    readonly confidence?: string;
    readonly status?: string;
  };
  readonly product: string;
  readonly deepLink: string;
};

export type SavedSearch = {
  readonly id: string;
  readonly name: string;
  readonly query: string;
  readonly facets: Record<string, string>;
  readonly scopeMode: SavedSearchScopeMode;
  readonly ownerUserId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateSavedSearchInput = {
  readonly name: string;
  readonly query: string;
  readonly facets?: Record<string, string>;
  readonly scopeMode?: SavedSearchScopeMode;
};

export type BulkOperation = {
  readonly id: string;
  readonly kind: BulkOperationKind;
  readonly objectIds: readonly string[];
  readonly payload: Record<string, unknown>;
  readonly status: BulkOperationStatus;
  readonly actorUserId: string;
  readonly confirmationToken: string;
  readonly auditNote?: string;
  readonly createdAt: string;
  readonly executedAt?: string;
};

export type CreateBulkOperationInput = {
  readonly kind: BulkOperationKind;
  readonly objectIds: readonly string[];
  readonly payload?: Record<string, unknown>;
};

export type ConfirmBulkOperationInput = {
  readonly confirmationToken: string;
  readonly auditNote?: string;
};

export type ProductivitySession = {
  readonly id: string;
  readonly type: string;
  readonly name?: string;
  readonly scopeSnapshot: Record<string, unknown>;
  readonly openedObjectIds: readonly string[];
  readonly ownerUserId: string;
  readonly createdAt: string;
  readonly lastResumedAt: string;
};

export type CreateProductivitySessionInput = {
  readonly type: string;
  readonly name?: string;
  readonly scopeSnapshot: Record<string, unknown>;
  readonly openedObjectIds?: readonly string[];
};

export type ProjectsShortcut = {
  readonly keys: string;
  readonly action: string;
  readonly context?: string;
};

export const PROJECTS_SHORTCUT_CATALOGUE: readonly ProjectsShortcut[] = Object.freeze([
  { keys: "Ctrl+Shift+P", action: "Command Palette (actions)" },
  { keys: "Ctrl+K", action: "Search (scoped when in module)" },
  { keys: "/", action: "Search focus" },
  { keys: "Ctrl+.", action: "Universal Quick Action" },
  { keys: "g then h", action: "Operational Workspace" },
  { keys: "g then o", action: "Portfolio Scorecard" },
  { keys: "g then q", action: "Focus Queue" },
  { keys: "c", action: "New commitment (in project)", context: "project" },
  { keys: "w", action: "Log wait", context: "project" },
  { keys: "e", action: "Raise exception", context: "project" },
  { keys: "?", action: "Shortcut help overlay" },
]);

export type CrossProductNavTarget = {
  readonly product: string;
  readonly label: string;
  readonly href: string;
  readonly description: string;
};

export const CROSS_PRODUCT_TARGETS: readonly CrossProductNavTarget[] = Object.freeze([
  {
    product: "workflow",
    label: "APZ Workflow",
    href: "/workspace/workflow",
    description: "Approvals and workflow runs with project context",
  },
  {
    product: "documents",
    label: "APZ Documents",
    href: "/workspace/documents",
    description: "Document library linked via Enterprise Context",
  },
  {
    product: "knowledge",
    label: "APZ Knowledge",
    href: "/workspace/knowledge",
    description: "Operational knowledge in APZHUB",
  },
  {
    product: "support",
    label: "APZ Support",
    href: "/workspace/support",
    description: "Support cases — never Zammad branding",
  },
  {
    product: "analytics",
    label: "APZ Analytics",
    href: "/workspace/analytics",
    description: "Enterprise performance explanation (not Projects reports)",
  },
]);
