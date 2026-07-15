import type {
  ArtifactReference,
  PipelineJob,
  PipelineRunStatus,
  PipelineSource,
  PipelineStep,
  PipelineSummary,
  PipelineTrigger,
  PipelineEnvironment,
} from "@apzhub/testing-contracts";

/**
 * Vendor-neutral repository metadata for live CI providers (APZTCMS-017).
 * Mirrors adapter canonical RepositoryMetadata without GitHub naming.
 */
export interface PipelineRepository {
  readonly id: string;
  readonly name: string;
  readonly fullName: string;
  readonly private: boolean;
  readonly htmlUrl: string;
  readonly description?: string;
  readonly defaultBranch?: string;
  readonly ownerLogin?: string;
}

/** Vendor-neutral workflow / pipeline definition metadata. */
export interface PipelineWorkflow {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly state: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly htmlUrl?: string;
}

/**
 * Live pipeline run view from a provider (not the SoR PipelineRun entity).
 * Distinct from persisted `PipelineRun` on TestingPipelinesService.
 */
export interface PipelineRunView {
  readonly id: string;
  readonly name?: string;
  readonly status: PipelineRunStatus;
  readonly workflowId: string;
  readonly runNumber?: number;
  readonly event?: string;
  readonly htmlUrl?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
  readonly branch?: string;
  readonly commit?: string;
  readonly actorRef?: string;
  readonly environment?: PipelineEnvironment;
  readonly source?: PipelineSource;
  readonly trigger?: PipelineTrigger;
}

export interface PipelineRunListQuery {
  readonly perPage?: number;
  readonly page?: number;
  readonly status?: string;
  readonly branch?: string;
}

export interface PipelineProviderImportInput {
  readonly owner: string;
  readonly repo: string;
  readonly runId: string | number;
  readonly pipelineKey?: string;
  readonly pipelineId?: string;
}

export type {
  ArtifactReference,
  PipelineJob,
  PipelineStep,
  PipelineSummary,
};
