/** APZ TCMS External CI/CD Integration Framework domain models (APZTCMS-015) — metadata only. */

import type { AuditFields } from "./audit";
import type {
  PipelineApprovalKind,
  PipelineEventKind,
  PipelineImportStatus,
  PipelineProviderKind,
  PipelineRunStatus,
} from "../enums";
import type {
  ArtifactReferenceId,
  AutomationImportId,
  CertificationRecordId,
  CoverageMetricId,
  EvidenceId,
  ExecutionSessionId,
  PipelineId,
  PipelineImportHistoryId,
  PipelineImportId,
  PipelineRunId,
  ReleaseId,
} from "../identifiers";

/** Nested pipeline step metadata (stored as JSON under jobs). */
export interface PipelineStep {
  readonly key?: string;
  readonly name: string;
  readonly status: PipelineRunStatus;
  readonly durationMs?: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly message?: string;
  readonly logRef?: string;
}

/** Nested pipeline job metadata (stored as JSON under stages / run). */
export interface PipelineJob {
  readonly key?: string;
  readonly name: string;
  readonly status: PipelineRunStatus;
  readonly stageKey?: string;
  readonly durationMs?: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly steps?: readonly PipelineStep[];
  readonly runnerLabel?: string;
  readonly message?: string;
  readonly logRef?: string;
}

/** Nested pipeline stage metadata. */
export interface PipelineStage {
  readonly key?: string;
  readonly name: string;
  readonly status: PipelineRunStatus;
  readonly durationMs?: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly jobs?: readonly PipelineJob[];
  readonly order?: number;
}

/** Artifact reference metadata — never downloads binaries. */
export interface ArtifactReference {
  readonly id?: ArtifactReferenceId;
  readonly name: string;
  readonly sizeBytes?: number;
  readonly type?: string;
  readonly checksum?: string;
  readonly storageProvider?: string;
  readonly uriReference?: string;
  readonly createdAt?: string;
  readonly retentionDays?: number;
  readonly retentionUntil?: string;
}

/** Environment metadata captured from an external CI run. */
export interface PipelineEnvironment {
  readonly name?: string;
  readonly url?: string;
  readonly branch?: string;
  readonly commit?: string;
  readonly tag?: string;
  readonly buildNumber?: string;
  readonly region?: string;
  readonly os?: string;
  readonly arch?: string;
  readonly nodeVersion?: string;
  readonly extra?: Readonly<Record<string, string>>;
}

/** Pipeline approval metadata (technical|qa|security|business|operations) — no execution. */
export interface PipelineApproval {
  readonly kind: PipelineApprovalKind;
  readonly status: "pending" | "approved" | "rejected" | "skipped";
  readonly requestedAt?: string;
  readonly decidedAt?: string;
  readonly actorRef?: string;
  readonly comments?: string;
}

/** Duration breakdown for a run. */
export interface PipelineDuration {
  readonly queuedMs?: number;
  readonly runningMs?: number;
  readonly totalMs?: number;
  readonly stageMs?: Readonly<Record<string, number>>;
}

/** Queue metadata. */
export interface PipelineQueue {
  readonly position?: number;
  readonly waitedMs?: number;
  readonly queuedAt?: string;
  readonly dequeuedAt?: string;
}

/** Failure metadata. */
export interface PipelineFailure {
  readonly code?: string;
  readonly message: string;
  readonly stageKey?: string;
  readonly jobKey?: string;
  readonly stepKey?: string;
  readonly retriable?: boolean;
}

/** Warning metadata. */
export interface PipelineWarning {
  readonly code?: string;
  readonly message: string;
  readonly stageKey?: string;
  readonly jobKey?: string;
}

/** Retry metadata. */
export interface PipelineRetry {
  readonly attempt: number;
  readonly maxAttempts?: number;
  readonly reason?: string;
  readonly retriedAt?: string;
}

/** Aggregate metrics for a run. */
export interface PipelineMetrics {
  readonly jobCount?: number;
  readonly stageCount?: number;
  readonly passedJobs?: number;
  readonly failedJobs?: number;
  readonly skippedJobs?: number;
  readonly artifactCount?: number;
  readonly duration?: PipelineDuration;
  readonly queue?: PipelineQueue;
  readonly extra?: Readonly<Record<string, number | string>>;
}

/** Human-readable / machine summary of a run. */
export interface PipelineSummary {
  readonly headline?: string;
  readonly overallStatus: PipelineRunStatus;
  readonly passed?: number;
  readonly failed?: number;
  readonly skipped?: number;
  readonly cancelled?: number;
  readonly warnings?: readonly PipelineWarning[];
  readonly failures?: readonly PipelineFailure[];
  readonly retries?: readonly PipelineRetry[];
  readonly notes?: string;
}

/** Result envelope produced by adapters after parse-only normalization. */
export interface PipelineResult {
  readonly providerKind: PipelineProviderKind;
  readonly externalRunRef: string;
  readonly externalPipelineRef?: string;
  readonly pipelineKey?: string;
  readonly pipelineName?: string;
  readonly status: PipelineRunStatus;
  readonly stages: readonly PipelineStage[];
  readonly jobs: readonly PipelineJob[];
  readonly artifacts: readonly ArtifactReference[];
  readonly environment: PipelineEnvironment;
  readonly approvals: readonly PipelineApproval[];
  readonly events: readonly PipelineEventRecord[];
  readonly summary: PipelineSummary;
  readonly metrics?: PipelineMetrics;
  readonly logs: readonly PipelineLogReference[];
  readonly variables: readonly PipelineVariable[];
  readonly secretRefs: readonly PipelineSecretReference[];
  readonly trigger?: PipelineTrigger;
  readonly source?: PipelineSource;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
  readonly correlationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Alias used by PipelineResultAdapter.parse — fully normalized canonical shape. */
export type CanonicalPipelineResult = PipelineResult;

/** Log reference metadata — never fetches log bodies. */
export interface PipelineLogReference {
  readonly name: string;
  readonly uriReference?: string;
  readonly sizeBytes?: number;
  readonly stageKey?: string;
  readonly jobKey?: string;
  readonly checksum?: string;
}

/** Variable metadata only — never secret values. */
export interface PipelineVariable {
  readonly name: string;
  readonly isSecret?: boolean;
  readonly source?: string;
  readonly description?: string;
}

/** Secret reference metadata — name/ref only, never values. */
export interface PipelineSecretReference {
  readonly name: string;
  readonly reference: string;
  readonly providerHint?: string;
}

/** Trigger metadata. */
export interface PipelineTrigger {
  readonly kind: string;
  readonly actorRef?: string;
  readonly reason?: string;
  readonly scheduledAt?: string;
  readonly eventRef?: string;
}

/** Source control metadata. */
export interface PipelineSource {
  readonly repository?: string;
  readonly branch?: string;
  readonly commit?: string;
  readonly tag?: string;
  readonly pullRequestRef?: string;
  readonly path?: string;
}

/**
 * Internal pipeline event record (queued|running|passed|…).
 * Domain history only — not published on the Platform Event Bus.
 */
export interface PipelineEventRecord {
  readonly kind: PipelineEventKind;
  readonly occurredAt: string;
  readonly message?: string;
  readonly stageKey?: string;
  readonly jobKey?: string;
  readonly actorRef?: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

/** Status snapshot helper (derived / embedded). */
export interface PipelineStatus {
  readonly status: PipelineRunStatus;
  readonly updatedAt?: string;
  readonly reason?: string;
}

/** Cross-domain reference links stored on runs (refs only). */
export interface PipelineLinks {
  readonly automationImportId?: AutomationImportId;
  readonly coverageMetricIds?: readonly CoverageMetricId[];
  readonly executionIds?: readonly ExecutionSessionId[];
  readonly releaseId?: ReleaseId;
  readonly certificationRecordId?: CertificationRecordId;
  readonly evidenceIds?: readonly EvidenceId[];
}

/** Registered pipeline definition metadata. */
export interface Pipeline extends AuditFields {
  readonly id: PipelineId;
  readonly key: string;
  readonly name: string;
  readonly providerKind: PipelineProviderKind;
  readonly externalPipelineRef?: string;
  readonly description?: string;
  readonly status: "active" | "archived";
  readonly defaultBranch?: string;
  readonly repositoryRef?: string;
  readonly variables?: readonly PipelineVariable[];
  readonly secretRefs?: readonly PipelineSecretReference[];
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly organisationId?: string;
  readonly revision?: number;
}

/** Persisted import batch (SoR for one ingestion). */
export interface PipelineImport extends AuditFields {
  readonly id: PipelineImportId;
  readonly providerKind: PipelineProviderKind;
  readonly adapterVersion: string;
  readonly externalRunRef: string;
  readonly pipelineId?: PipelineId;
  readonly status: PipelineImportStatus;
  readonly correlationId?: string;
  readonly checksum?: string;
  readonly payloadFingerprint?: string;
  readonly summary?: Readonly<Record<string, unknown>>;
  readonly errorSummary?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly canonicalSnapshot?: Readonly<Record<string, unknown>>;
  readonly pipelineRunId?: PipelineRunId;
  readonly organisationId?: string;
  readonly revision?: number;
}

/** Normalized pipeline run with nested JSON structures. */
export interface PipelineRun extends AuditFields {
  readonly id: PipelineRunId;
  readonly pipelineId: PipelineId;
  readonly importId: PipelineImportId;
  readonly providerKind: PipelineProviderKind;
  readonly externalRunRef: string;
  readonly status: PipelineRunStatus;
  readonly stages: readonly PipelineStage[];
  readonly jobs: readonly PipelineJob[];
  readonly artifacts: readonly ArtifactReference[];
  readonly approvals: readonly PipelineApproval[];
  readonly events: readonly PipelineEventRecord[];
  readonly environment: PipelineEnvironment;
  readonly links: PipelineLinks;
  readonly summary: PipelineSummary;
  readonly metrics?: PipelineMetrics;
  readonly logs?: readonly PipelineLogReference[];
  readonly variables?: readonly PipelineVariable[];
  readonly secretRefs?: readonly PipelineSecretReference[];
  readonly trigger?: PipelineTrigger;
  readonly source?: PipelineSource;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly revision?: number;
}

/** Append-only import history entry. */
export interface PipelineImportHistory {
  readonly id: PipelineImportHistoryId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly importId: PipelineImportId;
  readonly eventType: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly summary: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly adapterVersion?: string;
  readonly normalizationNotes?: string;
  readonly correlationId?: string;
}

/** Parse-only adapter — never calls live CI provider APIs. */
export interface PipelineResultAdapter {
  readonly kind: PipelineProviderKind;
  readonly version: string;
  canParse(input: unknown): boolean;
  parse(input: unknown): CanonicalPipelineResult;
}
