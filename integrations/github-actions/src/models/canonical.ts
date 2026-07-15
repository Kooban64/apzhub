import type {
  ArtifactReference,
  PipelineApproval,
  PipelineEnvironment,
  PipelineJob,
  PipelineLogReference,
  PipelineRunStatus,
  PipelineSource,
  PipelineStep,
  PipelineSummary,
  PipelineTrigger,
} from "@apzhub/testing-contracts";

/** Repository metadata exposed by core services (canonical, not raw GitHub). */
export interface RepositoryMetadata {
  readonly id: string;
  readonly name: string;
  readonly fullName: string;
  readonly private: boolean;
  readonly htmlUrl: string;
  readonly description?: string;
  readonly defaultBranch?: string;
  readonly ownerLogin?: string;
}

/** Workflow / pipeline definition metadata. */
export interface WorkflowMetadata {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly state: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly htmlUrl?: string;
}

/** Pipeline run metadata mapped from a workflow run. */
export interface PipelineRunMetadata {
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

export type {
  ArtifactReference,
  PipelineApproval,
  PipelineEnvironment,
  PipelineJob,
  PipelineLogReference,
  PipelineRunStatus,
  PipelineStep,
  PipelineSummary,
};
