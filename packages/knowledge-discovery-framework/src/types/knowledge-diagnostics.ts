export type KnowledgeRegistryStatus = "scaffold" | "ready" | "empty" | "degraded";

export type KnowledgeRegistrationIssueCode =
  "VALIDATION" | "DUPLICATE_ID" | "NOT_FOUND";

export interface KnowledgeRegistrationIssue {
  readonly code: KnowledgeRegistrationIssueCode;
  readonly sourceId?: string;
  readonly capabilityId?: string;
  readonly field?: string;
  readonly message: string;
}

/** @deprecated Use KnowledgeRegistrationIssue with code DUPLICATE_ID */
export interface KnowledgeRegistryDuplicateIssue {
  readonly sourceId: string;
  readonly message: string;
}

export interface KnowledgeHealthSummary {
  readonly healthy: number;
  readonly degraded: number;
  readonly planned: number;
  readonly disabled: number;
  readonly unknown: number;
}

/** Registry diagnostics — observability without query execution. */
export interface KnowledgeDiagnostics {
  readonly status: KnowledgeRegistryStatus;
  readonly registeredSourceCount: number;
  readonly registeredProviderCount: number;
  readonly sourceIds: readonly string[];
  readonly validationIssueCount: number;
  readonly healthSummary: KnowledgeHealthSummary;
  readonly duplicateSourceIds: readonly string[];
  readonly issues: readonly KnowledgeRegistrationIssue[];
  readonly frameworkVersion?: string;
  readonly manifestCapabilityCount: number;
  readonly message?: string;
}
