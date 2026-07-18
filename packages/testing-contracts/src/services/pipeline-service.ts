import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  ArtifactReference,
  CanonicalPipelineResult,
  Pipeline,
  PipelineImport,
  PipelineImportHistory,
  PipelineJob,
  PipelineLinks,
  PipelineResultAdapter,
  PipelineRun,
  PipelineStage,
} from "../domain/cicd-pipeline";
import type { PipelineProviderKind } from "../enums";
import type {
  CertificationRecordId,
  EvidenceId,
  PipelineId,
  PipelineImportId,
  PipelineRunId,
  ReleaseId,
} from "../identifiers";

export interface PipelineAdapterRegistry {
  register(adapter: PipelineResultAdapter): void;
  get(kind: PipelineProviderKind): PipelineResultAdapter | undefined;
  list(): readonly PipelineResultAdapter[];
  resolveForInput(input: unknown): PipelineResultAdapter;
}

export interface PipelineNormalizationService {
  normalizeStatus(raw: string | undefined | null): CanonicalPipelineResult["status"];
  normalizeResult(
    partial: Omit<CanonicalPipelineResult, "status" | "summary"> & {
      readonly status?: CanonicalPipelineResult["status"] | string;
      readonly summary?: Partial<CanonicalPipelineResult["summary"]> & {
        readonly overallStatus?: string;
      };
    },
  ): CanonicalPipelineResult;
}

export interface PipelineValidationService {
  validateCanonical(result: CanonicalPipelineResult): void;
  assertImportAllowed(ctx: ServiceRequestContext): void;
  detectDuplicate(
    ctx: ServiceRequestContext,
    input: {
      readonly providerKind: PipelineProviderKind;
      readonly externalRunRef: string;
      readonly payloadFingerprint?: string;
    },
  ): Promise<PipelineImport | undefined>;
}

export interface PipelineRegisterInput {
  readonly key: string;
  readonly name: string;
  readonly providerKind: PipelineProviderKind;
  readonly externalPipelineRef?: string;
  readonly description?: string;
  readonly defaultBranch?: string;
  readonly repositoryRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly organisationId?: string;
}

export interface PipelineUpdateInput {
  readonly name?: string;
  readonly description?: string;
  readonly externalPipelineRef?: string;
  readonly defaultBranch?: string;
  readonly repositoryRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface PipelineImportInput {
  readonly providerKind?: PipelineProviderKind;
  readonly payload: unknown;
  readonly pipelineId?: PipelineId;
  readonly pipelineKey?: string;
  readonly correlationId?: string;
  readonly allowDuplicateReturn?: boolean;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface PipelineImportOutcome {
  readonly importRecord: PipelineImport;
  readonly run?: PipelineRun;
  readonly pipeline?: Pipeline;
  readonly duplicateOf?: PipelineImport;
}

export interface PipelineSynchroniseMetadataInput {
  readonly pipelineId: PipelineId;
  readonly externalPipelineRef?: string;
  readonly name?: string;
  readonly description?: string;
  readonly defaultBranch?: string;
  readonly repositoryRef?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface PipelineExecutionSummaryInput {
  readonly pipelineId: PipelineId;
  readonly externalRunRef: string;
  readonly status: CanonicalPipelineResult["status"];
  readonly summary?: CanonicalPipelineResult["summary"];
  readonly metrics?: CanonicalPipelineResult["metrics"];
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
  readonly correlationId?: string;
}

export interface PipelineImportService {
  registerPipeline(
    ctx: ServiceRequestContext,
    input: PipelineRegisterInput,
  ): Promise<Pipeline>;
  synchroniseMetadata(
    ctx: ServiceRequestContext,
    input: PipelineSynchroniseMetadataInput,
  ): Promise<Pipeline>;
  importRun(
    ctx: ServiceRequestContext,
    input: PipelineImportInput,
  ): Promise<PipelineImportOutcome>;
  importExecutionSummary(
    ctx: ServiceRequestContext,
    input: PipelineExecutionSummaryInput,
  ): Promise<PipelineImportOutcome>;
  linkArtifacts(
    ctx: ServiceRequestContext,
    runId: PipelineRunId,
    artifacts: readonly ArtifactReference[],
  ): Promise<PipelineRun>;
  linkEvidence(
    ctx: ServiceRequestContext,
    runId: PipelineRunId,
    evidenceIds: readonly EvidenceId[],
  ): Promise<PipelineRun>;
  linkCertifications(
    ctx: ServiceRequestContext,
    runId: PipelineRunId,
    certificationRecordId: CertificationRecordId,
  ): Promise<PipelineRun>;
  linkReleases(
    ctx: ServiceRequestContext,
    runId: PipelineRunId,
    releaseId: ReleaseId,
  ): Promise<PipelineRun>;
  updatePipeline(
    ctx: ServiceRequestContext,
    id: PipelineId,
    input: PipelineUpdateInput,
  ): Promise<Pipeline>;
  archivePipeline(ctx: ServiceRequestContext, id: PipelineId): Promise<Pipeline>;
  getRun(ctx: ServiceRequestContext, id: PipelineRunId): Promise<PipelineRun>;
  listRuns(
    ctx: ServiceRequestContext,
    pipelineId?: PipelineId,
  ): Promise<readonly PipelineRun[]>;
  listPipelines(ctx: ServiceRequestContext): Promise<readonly Pipeline[]>;
  getPipeline(ctx: ServiceRequestContext, id: PipelineId): Promise<Pipeline>;
  listHistory(
    ctx: ServiceRequestContext,
    importId: PipelineImportId,
  ): Promise<readonly PipelineImportHistory[]>;
  getImport(ctx: ServiceRequestContext, id: PipelineImportId): Promise<PipelineImport>;
  listImports(ctx: ServiceRequestContext): Promise<readonly PipelineImport[]>;
  /** Retrieve nested stage metadata from stored JSON — not live CI. */
  listStages(
    ctx: ServiceRequestContext,
    runId: PipelineRunId,
  ): Promise<readonly PipelineStage[]>;
  /** Retrieve nested job metadata from stored JSON — not live CI. */
  listJobs(
    ctx: ServiceRequestContext,
    runId: PipelineRunId,
  ): Promise<readonly PipelineJob[]>;
  getLinks(ctx: ServiceRequestContext, runId: PipelineRunId): Promise<PipelineLinks>;
  listProviders(ctx: ServiceRequestContext): Promise<readonly PipelineResultAdapter[]>;
}
