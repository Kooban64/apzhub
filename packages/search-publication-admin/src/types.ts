import type {
  OrchestrationDiagnostics,
  PublicationJournalEntry,
  PublicationOperation,
  PublicationProductId,
  PublicationStatus,
} from "@apzhub/search-orchestrator";

export type PublicationAdminActor = {
  readonly userId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
};

export type PublicationListFilter = {
  readonly status?: PublicationStatus | readonly PublicationStatus[];
  readonly productId?: PublicationProductId;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly operation?: PublicationOperation;
  readonly correlationId?: string;
  readonly q?: string;
  /** When true, hide acknowledged / archived DLQ markers from default views. */
  readonly includeAcknowledged?: boolean;
  readonly includeArchived?: boolean;
};

export type PublicationSortField =
  "createdAt" | "updatedAt" | "status" | "productId" | "attemptCount";

export type PublicationListQuery = {
  readonly filter?: PublicationListFilter;
  readonly sortBy?: PublicationSortField;
  readonly sortDir?: "asc" | "desc";
  readonly offset?: number;
  readonly limit?: number;
};

export type PublicationListResult = {
  readonly items: readonly PublicationJournalEntry[];
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
};

export type PublicationQueueSummary = {
  readonly queueDepth: number;
  readonly retryingCount: number;
  readonly failedCount: number;
  readonly deadLetterCount: number;
  readonly publishedCount: number;
  readonly backlog: number;
  readonly throughputPublished: number;
  readonly oldestQueuedAt?: string;
  readonly averageAttempts: number;
};

export type PublicationProductSummary = {
  readonly productId: PublicationProductId;
  readonly queued: number;
  readonly publishing: number;
  readonly published: number;
  readonly failed: number;
  readonly retrying: number;
  readonly deadLetter: number;
  readonly total: number;
};

export type PublicationAdminDiagnostics = {
  readonly adminVersion: string;
  readonly orchestrator: OrchestrationDiagnostics;
  readonly journalReady: boolean;
  readonly retryEngineReady: boolean;
  readonly bootstrapEnabled: boolean;
  readonly compositionRegistered: boolean;
  readonly publicationHealth: "healthy" | "degraded" | "unavailable";
};

export type DeadLetterMarkerKind = "acknowledged" | "archived";

export type DeadLetterMarker = {
  readonly publicationId: string;
  readonly kind: DeadLetterMarkerKind;
  readonly actorUserId: string;
  readonly reason?: string;
  readonly markedAt: string;
};

export type PublicationAdminAuditAction =
  | "publication.list"
  | "publication.get"
  | "publication.retry"
  | "publication.retry_batch"
  | "publication.clear_completed_retries"
  | "publication.deadletter.retry"
  | "publication.deadletter.acknowledge"
  | "publication.deadletter.archive"
  | "publication.drain"
  | "publication.diagnostics";

export type PublicationAdminAuditEntry = {
  readonly id: string;
  readonly action: PublicationAdminAuditAction;
  readonly actorUserId: string;
  readonly tenantId: string;
  readonly publicationId?: string;
  readonly detail?: string;
  readonly correlationId: string;
  readonly createdAt: string;
};

export type RetryResult = {
  readonly publicationId: string;
  readonly ok: boolean;
  readonly mode?: "status" | "reenqueue";
  readonly newPublicationId?: string;
  readonly message?: string;
};
