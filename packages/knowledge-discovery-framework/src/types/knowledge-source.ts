/** Integration mechanism for a knowledge source (DF-001 §4.2). */
export type KnowledgeSourceKind =
  | "registry-projection"
  | "metadata-index"
  | "session-store"
  | "connector-api"
  | "event-index"
  | "semantic-index"
  | "ai-provider";

/** Lifecycle tier for a knowledge source (DF-001 §4.1). */
export type KnowledgeSourceTier = "T0" | "T1" | "T2" | "T3" | "T4";

export type KnowledgeSourceStatus = "active" | "planned" | "disabled";

export type KnowledgeSourceOrigin = "builtin" | "manifest" | "platform";

/** Document kinds a source may expose (DF-001 §3.3). */
export type KnowledgeDocumentKind =
  | "command"
  | "navigation"
  | "capability"
  | "workspace"
  | "preference"
  | "notification"
  | "activity"
  | "document"
  | "project"
  | "person"
  | "custom";

/**
 * Registered knowledge source descriptor.
 * Sources consume Runtime registries — they never replace them.
 */
export interface KnowledgeSource {
  readonly id: string;
  readonly label: string;
  readonly kind: KnowledgeSourceKind;
  readonly tier: KnowledgeSourceTier;
  readonly priority: number;
  readonly permission?: string;
  readonly status: KnowledgeSourceStatus;
  readonly provides: readonly KnowledgeDocumentKind[];
  readonly version?: string;
  readonly capabilityId?: string;
  readonly origin?: KnowledgeSourceOrigin;
}
