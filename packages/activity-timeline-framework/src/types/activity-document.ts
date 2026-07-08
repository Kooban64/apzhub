import type { ActivityCategory } from "./activity-category";
import type { ActivityDescriptorStatus, ActivitySeverity } from "./activity-descriptor";
import type { TimelineScopeId } from "./timeline-scope";

/** Actor reference on a mapped activity document. */
export interface ActivityDocumentActor {
  readonly id?: string;
}

/** Provenance and presentation metadata on a mapped activity document. */
export interface ActivityDocumentMetadata {
  readonly templateRef: string;
  readonly sourceEnvelopeId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly publisher: string;
  readonly timelineScopes: readonly TimelineScopeId[];
  readonly severity: ActivitySeverity;
  readonly payloadSummary?: Readonly<Record<string, unknown>>;
}

/** Mapper snapshot captured at ActivityDocument creation time. */
export interface ActivityDocumentDiagnostics {
  readonly renderedAt: string;
  readonly matchedActivityTypeId: string;
  readonly eventPattern: string;
  readonly typeStatus: ActivityDescriptorStatus;
  readonly templateStatus: "ok" | "error";
  readonly message: string;
}

/**
 * Immutable activity instance — mapped from Platform Events (AT-007).
 *
 * User state (read, pinned, hidden, archived, etc.) belongs to future session/user
 * state models — not the ActivityDocument itself.
 */
export interface ActivityDocument {
  readonly activityId: string;
  readonly activityTypeId: string;
  readonly sourceEventId: string;
  readonly title: string;
  readonly description: string;
  readonly timelineScope: TimelineScopeId;
  readonly category: ActivityCategory;
  readonly timestamp: string;
  readonly actor: ActivityDocumentActor;
  readonly metadata: ActivityDocumentMetadata;
  readonly diagnostics: ActivityDocumentDiagnostics;
}
