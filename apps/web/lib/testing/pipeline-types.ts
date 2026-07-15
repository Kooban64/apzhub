/**
 * Pipeline workbench view models (APZTCMS-018) — presentation only.
 */

export type PipelineClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly correlationId?: string;
};

export type PipelineCollectionResult<T> = {
  readonly items: readonly T[];
  readonly total: number;
};

export type PipelineRunListParams = {
  readonly page?: number;
  readonly perPage?: number;
  readonly status?: string;
  readonly branch?: string;
};

export type PipelineRepositoryViewModel = {
  readonly id: string;
  readonly name: string;
  readonly fullName: string;
  readonly private: boolean;
  readonly htmlUrl: string;
  readonly description?: string;
  readonly defaultBranch?: string;
  readonly ownerLogin?: string;
};

export type PipelineWorkflowViewModel = {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly state: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly htmlUrl?: string;
};

export type PipelineRunViewModel = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly workflowId: string;
  readonly runNumber?: number;
  readonly event?: string;
  readonly htmlUrl?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
  readonly durationLabel: string;
  readonly branch?: string;
  readonly commit?: string;
  readonly actorRef?: string;
};

export type PipelineJobViewModel = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly stageKey?: string;
  readonly durationMs?: number;
  readonly durationLabel: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly message?: string;
};

export type PipelineStepViewModel = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly durationMs?: number;
  readonly durationLabel: string;
  readonly message?: string;
};

export type PipelineArtifactViewModel = {
  readonly id: string;
  readonly name: string;
  readonly type?: string;
  readonly sizeBytes?: number;
  readonly sizeLabel: string;
  readonly createdAt?: string;
  readonly uriReference?: string;
};

export type PipelineSummaryViewModel = {
  readonly headline: string;
  readonly overallStatus: string;
  readonly passed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly cancelled: number;
  readonly notes?: string;
};

export type SorPipelineViewModel = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly providerKind: string;
  readonly status: string;
  readonly defaultBranch?: string;
  readonly repositoryRef?: string;
  readonly description?: string;
  readonly updatedAt?: string;
};

export type SorPipelineRunViewModel = {
  readonly id: string;
  readonly pipelineId: string;
  readonly externalRunRef: string;
  readonly providerKind: string;
  readonly status: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
  readonly durationLabel: string;
  readonly branch?: string;
  readonly commit?: string;
};

export type PipelineLinksViewModel = {
  readonly evidenceIds: readonly string[];
  readonly coverageMetricIds: readonly string[];
  readonly certificationRecordId?: string;
  readonly releaseId?: string;
  readonly automationImportId?: string;
  readonly executionIds: readonly string[];
};

export type PipelineProviderViewModel = {
  readonly kind: string;
  readonly version: string;
};

export type PipelineStageViewModel = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly durationMs?: number;
  readonly durationLabel: string;
};

export type PipelineImportOutcomeViewModel = {
  readonly importId: string;
  readonly runId?: string;
  readonly pipelineId?: string;
  readonly status: string;
};

export type PipelineImportFromProviderInput = {
  readonly owner: string;
  readonly repo: string;
  readonly runId: string | number;
  readonly pipelineKey?: string;
  readonly pipelineId?: string;
};
