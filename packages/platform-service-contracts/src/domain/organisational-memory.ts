/**
 * APZ Knowledge Operational Excellence (APZ-KNOWLEDGE-CAPABILITY-001).
 * Knowledge owns organisational memory. Never owns operational truth.
 */

export type KnowledgeLifecycleStatus = "draft" | "review" | "approved" | "archived";

export type KnowledgeObjectKind =
  | "lesson"
  | "standard"
  | "procedure"
  | "best_practice"
  | "operational_guide"
  | "reference"
  | "decision_knowledge";

export type KnowledgeLibraryCategory =
  | "standards"
  | "procedures"
  | "best_practices"
  | "operational_guides"
  | "reference_material";

export interface KnowledgeVersionEntry {
  readonly version: number;
  readonly status: KnowledgeLifecycleStatus;
  readonly at: string;
  readonly note?: string;
  readonly actor?: string;
}

export interface KnowledgeObject {
  readonly id: string;
  readonly tenantId: string;
  readonly kind: KnowledgeObjectKind;
  readonly title: string;
  readonly summary: string;
  /** Structured body — lesson fields, practice content, or decision link payload. */
  readonly body: Record<string, unknown>;
  readonly owner: string;
  readonly version: number;
  readonly status: KnowledgeLifecycleStatus;
  readonly tags: readonly string[];
  readonly relatedProducts: readonly string[];
  readonly relatedCapabilities: readonly string[];
  readonly libraryCategory?: KnowledgeLibraryCategory;
  readonly decisionRef?: string;
  readonly reviewDate?: string;
  readonly expiresAt?: string;
  readonly versionHistory: readonly KnowledgeVersionEntry[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface KnowledgeQualityIssue {
  readonly objectId: string;
  readonly title: string;
  readonly code:
    | "missing_owner"
    | "missing_review_date"
    | "expired"
    | "stale_review"
    | "duplicate_title"
    | "unapproved_published_shape";
  readonly message: string;
  readonly severity: "warning" | "error";
}

export interface KnowledgeQualityReport {
  readonly totalObjects: number;
  readonly approvedCount: number;
  readonly draftCount: number;
  readonly reviewCount: number;
  readonly archivedCount: number;
  readonly staleCount: number;
  readonly duplicateGroups: number;
  readonly issues: readonly KnowledgeQualityIssue[];
  readonly computedAt: string;
}
