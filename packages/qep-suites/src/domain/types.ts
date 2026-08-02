/**
 * Enterprise Test Suite Management domain — APZQEP-140-A.
 * Authoritative SoR for suites. Test Cases are out of scope.
 */

export const SUITE_LIFECYCLE_STATES = [
  "draft",
  "review",
  "approved",
  "published",
  "deprecated",
  "archived",
  "retired",
  "deleted",
] as const;
export type SuiteLifecycleState = (typeof SUITE_LIFECYCLE_STATES)[number];

export const SUITE_KINDS = [
  "standard",
  "shared",
  "reusable",
  "template",
  "reference",
] as const;
export type SuiteKind = (typeof SUITE_KINDS)[number];

export const SUITE_PRIORITIES = ["low", "normal", "high", "critical"] as const;
export type SuitePriority = (typeof SUITE_PRIORITIES)[number];

export type SuiteId = string;

export type SuiteNode = {
  readonly suiteId: SuiteId;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly parentSuiteId?: string;
  readonly folderPath: string;
  readonly name: string;
  readonly description: string;
  readonly ownerId: string;
  readonly kind: SuiteKind;
  readonly status: SuiteLifecycleState;
  readonly version: number;
  readonly priority: SuitePriority;
  readonly category?: string;
  readonly tags: readonly string[];
  readonly risk?: string;
  readonly businessArea?: string;
  readonly application?: string;
  readonly component?: string;
  readonly classification?: string;
  readonly favouriteUserIds: readonly string[];
  readonly pinnedUserIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;
  readonly archivedAt?: string;
  readonly retiredAt?: string;
  readonly deletedAt?: string;
  readonly customMetadata: Readonly<Record<string, unknown>>;
  readonly revision: number;
};

export type SuiteHistoryEntry = {
  readonly at: string;
  readonly actorId: string;
  readonly action: string;
  readonly fromStatus?: SuiteLifecycleState;
  readonly toStatus?: SuiteLifecycleState;
  readonly detail?: string;
};

export type SuiteAggregate = {
  readonly suite: SuiteNode;
  readonly history: readonly SuiteHistoryEntry[];
};
