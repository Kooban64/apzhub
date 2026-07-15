import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  AutomationAdapterInput,
  AutomationCertificationPreparationInputs,
  AutomationCoverageSnapshot,
  AutomationEvidenceRegistration,
  AutomationImport,
  AutomationImportHistory,
  AutomationResultAdapter,
  AutomationResultItem,
  AutomationRun,
  AutomatedExecutionIngestion,
  CanonicalAutomationCoverageSummary,
  CanonicalAutomationEvidenceMeta,
  CanonicalAutomationResult,
} from "../domain";
import type {
  AutomationAdapterKind,
  NormalizedResultStatus,
  TraceabilityLinkType,
} from "../enums";
import type {
  AutomatedExecutionId,
  AutomationImportId,
  AutomationRunId,
  TraceabilityLinkId,
} from "../identifiers";

export interface AutomationAdapterRegistry {
  register(adapter: AutomationResultAdapter): void;
  get(kind: AutomationAdapterKind): AutomationResultAdapter | undefined;
  list(): readonly AutomationResultAdapter[];
  resolveForInput(input: AutomationAdapterInput): AutomationResultAdapter;
}

export interface AutomationNormalizationService {
  normalizeStatus(raw: string | undefined | null): NormalizedResultStatus;
  normalizeResult(
    partial: Omit<CanonicalAutomationResult, "overallStatus" | "suites"> & {
      readonly suites: CanonicalAutomationResult["suites"];
      readonly overallStatus?: NormalizedResultStatus | string;
    },
  ): CanonicalAutomationResult;
}

export interface AutomationValidationService {
  validateCanonical(result: CanonicalAutomationResult): void;
  assertImportAllowed(ctx: ServiceRequestContext): void;
  detectDuplicate(
    ctx: ServiceRequestContext,
    input: {
      readonly adapterKind: AutomationAdapterKind;
      readonly externalRunRef: string;
      readonly payloadFingerprint?: string;
    },
  ): Promise<AutomationImport | undefined>;
}

export interface AutomationImportInput {
  readonly adapterKind?: AutomationAdapterKind;
  readonly payload: AutomationAdapterInput["payload"];
  readonly contentType?: string;
  readonly fileNameHint?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly sessionId?: string;
  readonly automationType?: string;
  readonly correlationId?: string;
  readonly allowDuplicateReturn?: boolean;
}

export interface AutomationImportOutcome {
  readonly importRecord: AutomationImport;
  readonly execution?: AutomatedExecutionIngestion;
  readonly runs?: readonly AutomationRun[];
  readonly duplicateOf?: AutomationImport;
  readonly evidence?: readonly AutomationEvidenceRegistration[];
  readonly coverage?: AutomationCoverageSnapshot;
}

export interface AutomationImportService {
  importResult(
    ctx: ServiceRequestContext,
    input: AutomationImportInput,
  ): Promise<AutomationImportOutcome>;
  reimport(
    ctx: ServiceRequestContext,
    importId: AutomationImportId,
    input: AutomationImportInput,
  ): Promise<AutomationImportOutcome>;
  correct(
    ctx: ServiceRequestContext,
    importId: AutomationImportId,
    input: AutomationImportInput,
  ): Promise<AutomationImportOutcome>;
}

export interface AutomationResultService {
  listImports(ctx: ServiceRequestContext): Promise<readonly AutomationImport[]>;
  getImport(
    ctx: ServiceRequestContext,
    id: AutomationImportId,
  ): Promise<AutomationImport>;
  listExecutions(
    ctx: ServiceRequestContext,
  ): Promise<readonly AutomatedExecutionIngestion[]>;
  getExecution(
    ctx: ServiceRequestContext,
    id: AutomatedExecutionId,
  ): Promise<AutomatedExecutionIngestion>;
  listRuns(
    ctx: ServiceRequestContext,
    executionId: AutomatedExecutionId,
  ): Promise<readonly AutomationRun[]>;
  getRun(ctx: ServiceRequestContext, id: AutomationRunId): Promise<AutomationRun>;
  listResultItems(
    ctx: ServiceRequestContext,
    runId: AutomationRunId,
  ): Promise<readonly AutomationResultItem[]>;
}

export interface AutomationEvidenceService {
  registerFromCanonical(
    ctx: ServiceRequestContext,
    input: {
      readonly executionId: AutomatedExecutionId;
      readonly importId: AutomationImportId;
      readonly evidence: readonly CanonicalAutomationEvidenceMeta[];
    },
  ): Promise<readonly AutomationEvidenceRegistration[]>;
}

export interface AutomationTraceabilityLinkInput {
  readonly type?: TraceabilityLinkType;
  readonly sourceKind: string;
  readonly sourceId: string;
  readonly targetKind: string;
  readonly targetId: string;
  readonly notes?: string;
}

export interface AutomationTraceabilityService {
  linkImportedResult(
    ctx: ServiceRequestContext,
    input: {
      readonly importId: AutomationImportId;
      readonly executionId: AutomatedExecutionId;
      readonly result: CanonicalAutomationResult;
      readonly extraLinks?: readonly AutomationTraceabilityLinkInput[];
    },
  ): Promise<readonly TraceabilityLinkId[]>;
}

export interface AutomationHistoryService {
  listByImport(
    ctx: ServiceRequestContext,
    importId: AutomationImportId,
  ): Promise<readonly AutomationImportHistory[]>;
  list(ctx: ServiceRequestContext): Promise<readonly AutomationImportHistory[]>;
}

export interface AutomationCoverageService {
  ingestSnapshot(
    ctx: ServiceRequestContext,
    input: {
      readonly importId?: AutomationImportId;
      readonly executionId?: AutomatedExecutionId;
      readonly summary: CanonicalAutomationCoverageSummary;
    },
  ): Promise<AutomationCoverageSnapshot>;
  listByImport(
    ctx: ServiceRequestContext,
    importId: AutomationImportId,
  ): Promise<readonly AutomationCoverageSnapshot[]>;
  aggregate(
    ctx: ServiceRequestContext,
    executionId: AutomatedExecutionId,
  ): Promise<CanonicalAutomationCoverageSummary>;
}

export interface AutomationCertificationPreparationService {
  prepareForImport(
    ctx: ServiceRequestContext,
    importId: AutomationImportId,
  ): Promise<AutomationCertificationPreparationInputs>;
  prepareForExecution(
    ctx: ServiceRequestContext,
    executionId: AutomatedExecutionId,
  ): Promise<AutomationCertificationPreparationInputs>;
}
