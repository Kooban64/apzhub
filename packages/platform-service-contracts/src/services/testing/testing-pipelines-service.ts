import type { ServiceRequestContext } from "../../common/context";
import type {
  ArtifactReference,
  CertificationRecordId,
  EvidenceId,
  Pipeline,
  PipelineId,
  PipelineImport,
  PipelineImportHistory,
  PipelineImportId,
  PipelineImportInput,
  PipelineImportOutcome,
  PipelineJob,
  PipelineLinks,
  PipelineRegisterInput,
  PipelineResultAdapter,
  PipelineRun,
  PipelineRunId,
  PipelineStage,
  PipelineUpdateInput,
  ReleaseId,
} from "@apzhub/testing-contracts";
import type { PipelineProviderImportInput } from "./pipeline-live-types";

/** Vendor-neutral CI/CD pipeline metadata platform service (SoR + provider import). */
export interface TestingPipelinesService {
  registerPipeline(
    ctx: ServiceRequestContext,
    input: PipelineRegisterInput,
  ): Promise<Pipeline>;
  updatePipeline(
    ctx: ServiceRequestContext,
    id: PipelineId,
    input: PipelineUpdateInput,
  ): Promise<Pipeline>;
  archivePipeline(ctx: ServiceRequestContext, id: PipelineId): Promise<Pipeline>;
  getPipeline(ctx: ServiceRequestContext, id: PipelineId): Promise<Pipeline>;
  listPipelines(ctx: ServiceRequestContext): Promise<readonly Pipeline[]>;
  importRun(
    ctx: ServiceRequestContext,
    input: PipelineImportInput,
  ): Promise<PipelineImportOutcome>;
  /**
   * Fetch a live run via pipeline providers and persist via SoR import
   * (github_actions parse adapter). Does not dispatch or mutate remote workflows.
   */
  importFromProvider(
    ctx: ServiceRequestContext,
    input: PipelineProviderImportInput,
  ): Promise<PipelineImportOutcome>;
  listImports(ctx: ServiceRequestContext): Promise<readonly PipelineImport[]>;
  getImport(
    ctx: ServiceRequestContext,
    id: PipelineImportId,
  ): Promise<PipelineImport>;
  listImportHistory(
    ctx: ServiceRequestContext,
    importId: PipelineImportId,
  ): Promise<readonly PipelineImportHistory[]>;
  getRun(ctx: ServiceRequestContext, id: PipelineRunId): Promise<PipelineRun>;
  listRuns(
    ctx: ServiceRequestContext,
    pipelineId?: PipelineId,
  ): Promise<readonly PipelineRun[]>;
  listStages(
    ctx: ServiceRequestContext,
    runId: PipelineRunId,
  ): Promise<readonly PipelineStage[]>;
  listJobs(
    ctx: ServiceRequestContext,
    runId: PipelineRunId,
  ): Promise<readonly PipelineJob[]>;
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
  getLinks(ctx: ServiceRequestContext, runId: PipelineRunId): Promise<PipelineLinks>;
  listProviders(ctx: ServiceRequestContext): Promise<readonly PipelineResultAdapter[]>;
}
