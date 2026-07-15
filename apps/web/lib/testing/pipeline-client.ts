/**
 * Typed Pipeline HTTP client — calls ONLY `/api/v1/testing/pipelines/*`.
 */

import { PipelineClientError } from "./pipeline-errors";
import type {
  PipelineArtifactViewModel,
  PipelineClientRequestOptions,
  PipelineCollectionResult,
  PipelineImportFromProviderInput,
  PipelineImportOutcomeViewModel,
  PipelineJobViewModel,
  PipelineLinksViewModel,
  PipelineProviderViewModel,
  PipelineRepositoryViewModel,
  PipelineRunListParams,
  PipelineRunViewModel,
  PipelineStageViewModel,
  PipelineStepViewModel,
  PipelineSummaryViewModel,
  PipelineWorkflowViewModel,
  SorPipelineRunViewModel,
  SorPipelineViewModel,
} from "./pipeline-types";

const API_BASE = "/api/v1";

type JsonRecord = Record<string, unknown>;
type ApiErrorEnvelope = {
  readonly error?: { readonly message?: string; readonly code?: string };
  readonly meta?: { readonly correlationId?: string; readonly requestId?: string };
};
type ApiSuccessEnvelope<T> = { readonly data: T; readonly meta?: JsonRecord };
type ApiCollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: { readonly limit?: number; readonly total?: number };
  readonly meta?: JsonRecord;
};

export interface PipelineClient {
  getRepository(
    owner: string,
    repo: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineRepositoryViewModel>;
  listWorkflows(
    owner: string,
    repo: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineCollectionResult<PipelineWorkflowViewModel>>;
  getWorkflow(
    owner: string,
    repo: string,
    workflowId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineWorkflowViewModel>;
  listLiveRuns(
    owner: string,
    repo: string,
    params?: PipelineRunListParams,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineCollectionResult<PipelineRunViewModel>>;
  getLiveRun(
    owner: string,
    repo: string,
    runId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineRunViewModel>;
  listLiveJobs(
    owner: string,
    repo: string,
    runId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineCollectionResult<PipelineJobViewModel>>;
  getLiveJob(
    owner: string,
    repo: string,
    runId: string,
    jobId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineJobViewModel>;
  listLiveSteps(
    owner: string,
    repo: string,
    runId: string,
    jobId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineCollectionResult<PipelineStepViewModel>>;
  listLiveArtifacts(
    owner: string,
    repo: string,
    runId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineCollectionResult<PipelineArtifactViewModel>>;
  getLiveSummary(
    owner: string,
    repo: string,
    runId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineSummaryViewModel>;
  listPipelines(
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineCollectionResult<SorPipelineViewModel>>;
  getPipeline(
    pipelineId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<SorPipelineViewModel>;
  listSorRuns(
    pipelineId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineCollectionResult<SorPipelineRunViewModel>>;
  getSorRun(
    runId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<SorPipelineRunViewModel>;
  getLinks(
    runId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineLinksViewModel>;
  listSorJobs(
    runId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineCollectionResult<PipelineJobViewModel>>;
  listSorStages(
    runId: string,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineCollectionResult<PipelineStageViewModel>>;
  listProviders(
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineCollectionResult<PipelineProviderViewModel>>;
  importFromProvider(
    input: PipelineImportFromProviderInput,
    options?: PipelineClientRequestOptions,
  ): Promise<PipelineImportOutcomeViewModel>;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildQuery(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function formatDuration(ms: number | undefined): string {
  if (ms === undefined || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${ms} ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return rem === 0 ? `${minutes}m` : `${minutes}m ${rem}s`;
}

function formatSize(bytes: number | undefined): string {
  if (bytes === undefined) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestJson<T>(
  path: string,
  init: RequestInit & PipelineClientRequestOptions = {},
): Promise<T> {
  if (!path.startsWith("/testing/pipelines")) {
    throw new PipelineClientError(
      `Invalid Pipeline API path: ${path}`,
      "PIPELINE_CLIENT_ROUTE_VIOLATION",
      500,
    );
  }

  const { signal, correlationId, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (correlationId) headers.set("x-correlation-id", correlationId);

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    signal,
    credentials: "include",
    headers,
  });

  const body = await parseJson(response);
  const meta = isRecord(body) && isRecord(body.meta) ? body.meta : undefined;
  const responseCorrelationId =
    (typeof meta?.correlationId === "string" ? meta.correlationId : undefined) ??
    correlationId;
  const responseRequestId =
    typeof meta?.requestId === "string" ? meta.requestId : undefined;

  if (!response.ok) {
    const envelope = body as ApiErrorEnvelope | null;
    throw PipelineClientError.fromHttp({
      status: response.status,
      message: envelope?.error?.message,
      code: envelope?.error?.code,
      correlationId: responseCorrelationId,
      requestId: responseRequestId ?? envelope?.meta?.requestId,
    });
  }

  return body as T;
}

async function getData<T>(
  path: string,
  options?: PipelineClientRequestOptions,
): Promise<T> {
  const envelope = await requestJson<ApiSuccessEnvelope<T>>(path, {
    method: "GET",
    signal: options?.signal,
    correlationId: options?.correlationId,
  });
  return envelope.data;
}

async function getCollection<T>(
  path: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineCollectionResult<T>> {
  const envelope = await requestJson<ApiCollectionEnvelope<T>>(path, {
    method: "GET",
    signal: options?.signal,
    correlationId: options?.correlationId,
  });
  const items = envelope.data ?? [];
  return {
    items,
    total: envelope.page?.total ?? envelope.page?.limit ?? items.length,
  };
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

function toRepository(raw: JsonRecord): PipelineRepositoryViewModel {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    fullName: String(raw.fullName ?? ""),
    private: Boolean(raw.private),
    htmlUrl: String(raw.htmlUrl ?? ""),
    description: typeof raw.description === "string" ? raw.description : undefined,
    defaultBranch: typeof raw.defaultBranch === "string" ? raw.defaultBranch : undefined,
    ownerLogin: typeof raw.ownerLogin === "string" ? raw.ownerLogin : undefined,
  };
}

function toWorkflow(raw: JsonRecord): PipelineWorkflowViewModel {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    path: String(raw.path ?? ""),
    state: String(raw.state ?? ""),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
    htmlUrl: typeof raw.htmlUrl === "string" ? raw.htmlUrl : undefined,
  };
}

function toRunView(raw: JsonRecord): PipelineRunViewModel {
  const durationMs = typeof raw.durationMs === "number" ? raw.durationMs : undefined;
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? raw.id ?? "Run"),
    status: String(raw.status ?? "unknown"),
    workflowId: String(raw.workflowId ?? ""),
    runNumber: typeof raw.runNumber === "number" ? raw.runNumber : undefined,
    event: typeof raw.event === "string" ? raw.event : undefined,
    htmlUrl: typeof raw.htmlUrl === "string" ? raw.htmlUrl : undefined,
    startedAt: typeof raw.startedAt === "string" ? raw.startedAt : undefined,
    completedAt: typeof raw.completedAt === "string" ? raw.completedAt : undefined,
    durationMs,
    durationLabel: formatDuration(durationMs),
    branch: typeof raw.branch === "string" ? raw.branch : undefined,
    commit: typeof raw.commit === "string" ? raw.commit : undefined,
    actorRef: typeof raw.actorRef === "string" ? raw.actorRef : undefined,
  };
}

function toJob(raw: JsonRecord): PipelineJobViewModel {
  const durationMs = typeof raw.durationMs === "number" ? raw.durationMs : undefined;
  return {
    id: String(raw.key ?? raw.id ?? raw.name ?? ""),
    name: String(raw.name ?? ""),
    status: String(raw.status ?? "unknown"),
    stageKey: typeof raw.stageKey === "string" ? raw.stageKey : undefined,
    durationMs,
    durationLabel: formatDuration(durationMs),
    startedAt: typeof raw.startedAt === "string" ? raw.startedAt : undefined,
    completedAt: typeof raw.completedAt === "string" ? raw.completedAt : undefined,
    message: typeof raw.message === "string" ? raw.message : undefined,
  };
}

function toStep(raw: JsonRecord): PipelineStepViewModel {
  const durationMs = typeof raw.durationMs === "number" ? raw.durationMs : undefined;
  return {
    id: String(raw.key ?? raw.name ?? ""),
    name: String(raw.name ?? ""),
    status: String(raw.status ?? "unknown"),
    durationMs,
    durationLabel: formatDuration(durationMs),
    message: typeof raw.message === "string" ? raw.message : undefined,
  };
}

function toArtifact(raw: JsonRecord): PipelineArtifactViewModel {
  const sizeBytes = typeof raw.sizeBytes === "number" ? raw.sizeBytes : undefined;
  return {
    id: String(raw.id ?? raw.name ?? ""),
    name: String(raw.name ?? ""),
    type: typeof raw.type === "string" ? raw.type : undefined,
    sizeBytes,
    sizeLabel: formatSize(sizeBytes),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    uriReference: typeof raw.uriReference === "string" ? raw.uriReference : undefined,
  };
}

function toSummary(raw: JsonRecord): PipelineSummaryViewModel {
  return {
    headline: String(raw.headline ?? "Pipeline summary"),
    overallStatus: String(raw.overallStatus ?? "unknown"),
    passed: typeof raw.passed === "number" ? raw.passed : 0,
    failed: typeof raw.failed === "number" ? raw.failed : 0,
    skipped: typeof raw.skipped === "number" ? raw.skipped : 0,
    cancelled: typeof raw.cancelled === "number" ? raw.cancelled : 0,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
  };
}

function toSorPipeline(raw: JsonRecord): SorPipelineViewModel {
  return {
    id: String(raw.id ?? ""),
    key: String(raw.key ?? ""),
    name: String(raw.name ?? ""),
    providerKind: String(raw.providerKind ?? ""),
    status: String(raw.status ?? ""),
    defaultBranch: typeof raw.defaultBranch === "string" ? raw.defaultBranch : undefined,
    repositoryRef: typeof raw.repositoryRef === "string" ? raw.repositoryRef : undefined,
    description: typeof raw.description === "string" ? raw.description : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
}

function toSorRun(raw: JsonRecord): SorPipelineRunViewModel {
  const durationMs = typeof raw.durationMs === "number" ? raw.durationMs : undefined;
  const environment = isRecord(raw.environment) ? raw.environment : {};
  return {
    id: String(raw.id ?? ""),
    pipelineId: String(raw.pipelineId ?? ""),
    externalRunRef: String(raw.externalRunRef ?? ""),
    providerKind: String(raw.providerKind ?? ""),
    status: String(raw.status ?? "unknown"),
    startedAt: typeof raw.startedAt === "string" ? raw.startedAt : undefined,
    completedAt: typeof raw.completedAt === "string" ? raw.completedAt : undefined,
    durationMs,
    durationLabel: formatDuration(durationMs),
    branch: typeof environment.branch === "string" ? environment.branch : undefined,
    commit: typeof environment.commit === "string" ? environment.commit : undefined,
  };
}

function toLinks(raw: JsonRecord): PipelineLinksViewModel {
  const asStrings = (value: unknown): readonly string[] =>
    Array.isArray(value) ? value.map((item) => String(item)) : [];
  return {
    evidenceIds: asStrings(raw.evidenceIds),
    coverageMetricIds: asStrings(raw.coverageMetricIds),
    certificationRecordId:
      typeof raw.certificationRecordId === "string" ? raw.certificationRecordId : undefined,
    releaseId: typeof raw.releaseId === "string" ? raw.releaseId : undefined,
    automationImportId:
      typeof raw.automationImportId === "string" ? raw.automationImportId : undefined,
    executionIds: asStrings(raw.executionIds),
  };
}

function toStage(raw: JsonRecord): PipelineStageViewModel {
  const durationMs = typeof raw.durationMs === "number" ? raw.durationMs : undefined;
  return {
    id: String(raw.key ?? raw.name ?? ""),
    name: String(raw.name ?? ""),
    status: String(raw.status ?? "unknown"),
    durationMs,
    durationLabel: formatDuration(durationMs),
  };
}

function toProvider(raw: JsonRecord): PipelineProviderViewModel {
  return {
    kind: String(raw.kind ?? ""),
    version: String(raw.version ?? ""),
  };
}

function toImportOutcome(raw: JsonRecord): PipelineImportOutcomeViewModel {
  const importRecord = isRecord(raw.importRecord) ? raw.importRecord : {};
  const run = isRecord(raw.run) ? raw.run : undefined;
  const pipeline = isRecord(raw.pipeline) ? raw.pipeline : undefined;
  return {
    importId: String(importRecord.id ?? ""),
    runId: run && typeof run.id === "string" ? run.id : undefined,
    pipelineId: pipeline && typeof pipeline.id === "string" ? pipeline.id : undefined,
    status: String(importRecord.status ?? "unknown"),
  };
}

function mapCollection<T>(
  result: PipelineCollectionResult<JsonRecord>,
  map: (raw: JsonRecord) => T,
): PipelineCollectionResult<T> {
  return {
    items: result.items.map((item) => map(isRecord(item) ? item : {})),
    total: result.total,
  };
}

export function createHttpPipelineClient(): PipelineClient {
  return {
    async getRepository(owner, repo, options) {
      const data = await getData<JsonRecord>(
        `/testing/pipelines/repositories/${enc(owner)}/${enc(repo)}`,
        options,
      );
      return toRepository(data);
    },
    async listWorkflows(owner, repo, options) {
      const result = await getCollection<JsonRecord>(
        `/testing/pipelines/repositories/${enc(owner)}/${enc(repo)}/workflows`,
        options,
      );
      return mapCollection(result, toWorkflow);
    },
    async getWorkflow(owner, repo, workflowId, options) {
      const data = await getData<JsonRecord>(
        `/testing/pipelines/repositories/${enc(owner)}/${enc(repo)}/workflows/${enc(workflowId)}`,
        options,
      );
      return toWorkflow(data);
    },
    async listLiveRuns(owner, repo, params, options) {
      const qs = buildQuery({
        page: params?.page,
        perPage: params?.perPage,
        status: params?.status,
        branch: params?.branch,
      });
      const result = await getCollection<JsonRecord>(
        `/testing/pipelines/repositories/${enc(owner)}/${enc(repo)}/runs${qs}`,
        options,
      );
      return mapCollection(result, toRunView);
    },
    async getLiveRun(owner, repo, runId, options) {
      const data = await getData<JsonRecord>(
        `/testing/pipelines/repositories/${enc(owner)}/${enc(repo)}/runs/${enc(runId)}`,
        options,
      );
      return toRunView(data);
    },
    async listLiveJobs(owner, repo, runId, options) {
      const result = await getCollection<JsonRecord>(
        `/testing/pipelines/repositories/${enc(owner)}/${enc(repo)}/runs/${enc(runId)}/jobs`,
        options,
      );
      return mapCollection(result, toJob);
    },
    async getLiveJob(owner, repo, runId, jobId, options) {
      const data = await getData<JsonRecord>(
        `/testing/pipelines/repositories/${enc(owner)}/${enc(repo)}/runs/${enc(runId)}/jobs/${enc(jobId)}`,
        options,
      );
      return toJob(data);
    },
    async listLiveSteps(owner, repo, runId, jobId, options) {
      const result = await getCollection<JsonRecord>(
        `/testing/pipelines/repositories/${enc(owner)}/${enc(repo)}/runs/${enc(runId)}/jobs/${enc(jobId)}/steps`,
        options,
      );
      return mapCollection(result, toStep);
    },
    async listLiveArtifacts(owner, repo, runId, options) {
      const result = await getCollection<JsonRecord>(
        `/testing/pipelines/repositories/${enc(owner)}/${enc(repo)}/runs/${enc(runId)}/artifacts`,
        options,
      );
      return mapCollection(result, toArtifact);
    },
    async getLiveSummary(owner, repo, runId, options) {
      const data = await getData<JsonRecord>(
        `/testing/pipelines/repositories/${enc(owner)}/${enc(repo)}/runs/${enc(runId)}/summary`,
        options,
      );
      return toSummary(data);
    },
    async listPipelines(options) {
      const result = await getCollection<JsonRecord>(`/testing/pipelines`, options);
      return mapCollection(result, toSorPipeline);
    },
    async getPipeline(pipelineId, options) {
      const data = await getData<JsonRecord>(
        `/testing/pipelines/${enc(pipelineId)}`,
        options,
      );
      return toSorPipeline(data);
    },
    async listSorRuns(pipelineId, options) {
      const result = await getCollection<JsonRecord>(
        `/testing/pipelines/${enc(pipelineId)}/runs`,
        options,
      );
      return mapCollection(result, toSorRun);
    },
    async getSorRun(runId, options) {
      const data = await getData<JsonRecord>(
        `/testing/pipelines/runs/${enc(runId)}`,
        options,
      );
      return toSorRun(data);
    },
    async getLinks(runId, options) {
      const data = await getData<JsonRecord>(
        `/testing/pipelines/runs/${enc(runId)}/links`,
        options,
      );
      return toLinks(data);
    },
    async listSorJobs(runId, options) {
      const result = await getCollection<JsonRecord>(
        `/testing/pipelines/runs/${enc(runId)}/jobs`,
        options,
      );
      return mapCollection(result, toJob);
    },
    async listSorStages(runId, options) {
      const result = await getCollection<JsonRecord>(
        `/testing/pipelines/runs/${enc(runId)}/stages`,
        options,
      );
      return mapCollection(result, toStage);
    },
    async listProviders(options) {
      const result = await getCollection<JsonRecord>(
        `/testing/pipelines/providers`,
        options,
      );
      return mapCollection(result, toProvider);
    },
    async importFromProvider(input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<JsonRecord>>(
        `/testing/pipelines`,
        {
          method: "POST",
          body: JSON.stringify(input),
          signal: options?.signal,
          correlationId: options?.correlationId,
        },
      );
      return toImportOutcome(envelope.data);
    },
  };
}
