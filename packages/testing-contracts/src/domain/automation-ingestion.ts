import type { AuditFields } from "./audit";
import type {
  AutomationAdapterKind,
  AutomationImportStatus,
  AutomationType,
  ExecutionStatus,
  NormalizedResultStatus,
} from "../enums";
import type {
  AutomatedExecutionId,
  AutomationCoverageSnapshotId,
  AutomationImportHistoryId,
  AutomationImportId,
  AutomationResultItemId,
  AutomationRunId,
  EvidenceId,
  ExecutionSessionId,
} from "../identifiers";

/** Environment metadata captured from an external automation run. */
export interface CanonicalAutomationEnvironment {
  readonly framework?: string;
  readonly version?: string;
  readonly commit?: string;
  readonly branch?: string;
  readonly build?: string;
  readonly pipeline?: string;
  readonly machine?: string;
  readonly platform?: string;
  readonly browser?: string;
  readonly device?: string;
  readonly os?: string;
  readonly nodeVersion?: string;
  readonly extra?: Readonly<Record<string, string>>;
}

/** Canonical step within an imported automation case. */
export interface CanonicalAutomationStep {
  readonly name: string;
  readonly status: NormalizedResultStatus;
  readonly durationMs?: number;
  readonly expected?: string;
  readonly actual?: string;
  readonly message?: string;
  readonly stack?: string;
  readonly evidenceRefs?: readonly string[];
}

/** Canonical case (test) within an imported suite. */
export interface CanonicalAutomationCase {
  readonly key?: string;
  readonly title: string;
  readonly status: NormalizedResultStatus;
  readonly durationMs?: number;
  readonly steps?: readonly CanonicalAutomationStep[];
  readonly tags?: readonly string[];
  readonly requirementRefs?: readonly string[];
  readonly suiteKey?: string;
  readonly message?: string;
  readonly stack?: string;
  readonly storyRefs?: readonly string[];
  readonly planRefs?: readonly string[];
  readonly caseRefs?: readonly string[];
}

/** Canonical suite grouping imported cases. */
export interface CanonicalAutomationSuite {
  readonly key?: string;
  readonly name: string;
  readonly cases: readonly CanonicalAutomationCase[];
  readonly status?: NormalizedResultStatus;
  readonly durationMs?: number;
}

/** Evidence metadata only — no binary payload required. */
export interface CanonicalAutomationEvidenceMeta {
  readonly type: string;
  readonly title: string;
  readonly storageRef?: string;
  readonly mimeType?: string;
  readonly sizeBytes?: number;
  readonly checksum?: string;
  readonly pathHint?: string;
  readonly bytesBase64?: string;
}

/** Coverage summary metadata — not a code-coverage engine. */
export interface CanonicalAutomationCoverageSummary {
  readonly covered?: number;
  readonly total?: number;
  readonly percentage?: number;
  readonly kind?: string;
  readonly raw?: Readonly<Record<string, unknown>>;
}

/** Fully normalized automation result ready for validation/import. */
export interface CanonicalAutomationResult {
  readonly adapterKind: AutomationAdapterKind;
  readonly externalRunRef: string;
  readonly correlationId?: string;
  readonly environment: CanonicalAutomationEnvironment;
  readonly suites: readonly CanonicalAutomationSuite[];
  readonly evidence: readonly CanonicalAutomationEvidenceMeta[];
  readonly coverage?: CanonicalAutomationCoverageSummary;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
  readonly overallStatus: NormalizedResultStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly automationType?: AutomationType;
}

/** Input handed to an AutomationResultAdapter for parse-only ingestion. */
export interface AutomationAdapterInput {
  readonly payload: string | Readonly<Record<string, unknown>> | Uint8Array;
  readonly contentType?: string;
  readonly fileNameHint?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

/** Parse-only adapter — never executes tests. */
export interface AutomationResultAdapter {
  readonly kind: AutomationAdapterKind;
  readonly version: string;
  canParse(input: AutomationAdapterInput): boolean;
  parse(input: AutomationAdapterInput): CanonicalAutomationResult;
}

/** Persisted import batch. */
export interface AutomationImport extends AuditFields {
  readonly id: AutomationImportId;
  readonly adapterKind: AutomationAdapterKind;
  readonly adapterVersion: string;
  readonly externalRunRef: string;
  readonly status: AutomationImportStatus;
  readonly correlationId?: string;
  readonly checksum?: string;
  readonly payloadFingerprint?: string;
  readonly summary?: Readonly<Record<string, unknown>>;
  readonly errorSummary?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly canonicalSnapshot?: Readonly<Record<string, unknown>>;
  readonly automatedExecutionId?: AutomatedExecutionId;
  readonly organisationId?: string;
  readonly revision?: number;
}

/** Automated execution produced by an import. */
export interface AutomatedExecutionIngestion extends AuditFields {
  readonly id: AutomatedExecutionId;
  readonly sessionId?: ExecutionSessionId;
  readonly importId: AutomationImportId;
  readonly automationType: AutomationType;
  readonly status: ExecutionStatus;
  readonly adapterSourceId?: string;
  readonly externalRunRef: string;
  readonly environment: CanonicalAutomationEnvironment;
  readonly overallStatus: NormalizedResultStatus;
  readonly durationMs?: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly adapterKind: AutomationAdapterKind;
  readonly organisationId?: string;
  readonly revision?: number;
}

/** Suite/case run row under an automated execution. */
export interface AutomationRun extends AuditFields {
  readonly id: AutomationRunId;
  readonly executionId: AutomatedExecutionId;
  readonly suiteKey?: string;
  readonly caseKey?: string;
  readonly title: string;
  readonly status: NormalizedResultStatus;
  readonly durationMs?: number;
  readonly message?: string;
  readonly stack?: string;
  readonly result?: Readonly<Record<string, unknown>>;
  readonly tags?: readonly string[];
  readonly requirementRefs?: readonly string[];
  readonly organisationId?: string;
  readonly revision?: number;
}

/** Optional step/result item under a run. */
export interface AutomationResultItem extends AuditFields {
  readonly id: AutomationResultItemId;
  readonly runId: AutomationRunId;
  readonly status: NormalizedResultStatus;
  readonly stepPayload?: Readonly<Record<string, unknown>>;
  readonly name?: string;
  readonly durationMs?: number;
  readonly message?: string;
  readonly organisationId?: string;
  readonly revision?: number;
}

/** Append-only import history entry. */
export interface AutomationImportHistory {
  readonly id: AutomationImportHistoryId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly importId: AutomationImportId;
  readonly eventType: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly summary: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly adapterVersion?: string;
  readonly normalizationNotes?: string;
  readonly correlationId?: string;
}

/** Coverage snapshot tied to an import/execution. */
export interface AutomationCoverageSnapshot extends AuditFields {
  readonly id: AutomationCoverageSnapshotId;
  readonly importId?: AutomationImportId;
  readonly executionId?: AutomatedExecutionId;
  readonly summary: CanonicalAutomationCoverageSummary;
  readonly coveredCount?: number;
  readonly totalCount?: number;
  readonly percentage?: number;
  readonly organisationId?: string;
  readonly revision?: number;
}

/** Certification preparation inputs derived from automation ingestion only. */
export interface AutomationCertificationPreparationInputs {
  readonly importId?: AutomationImportId;
  readonly executionId?: AutomatedExecutionId;
  readonly automationCompletenessPercent: number;
  readonly coverageContributionPercent?: number;
  readonly failedAutomationCount: number;
  readonly missingEvidenceCount: number;
  readonly importHealth: "healthy" | "degraded" | "failed" | "unknown";
  readonly totalCases: number;
  readonly passedCases: number;
  readonly skippedCases: number;
  readonly computedAt: string;
  /** Always false — this service never decides certification. */
  readonly isDecision: false;
}

/** Registered evidence metadata produced during import. */
export interface AutomationEvidenceRegistration {
  readonly evidenceId: EvidenceId;
  readonly storageRef: string;
  readonly title: string;
  readonly type: string;
}
