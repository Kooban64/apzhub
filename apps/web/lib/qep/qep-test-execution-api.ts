/**
 * QEP Test Execution HTTP client (APZQEP-ENG-100E, OES-ENG-090A PART-04).
 *
 * Presentation-only — binds exclusively to `/api/v1/qep/executions` DTOs and
 * `availableActions`. Never imports Domain/Application/Infrastructure directly.
 */

import type {
  EvidenceReferenceDto,
  ExecutionActionDescriptor,
  ExecutionManifestDto,
  ExecutionStepDto,
  ExecutionHistoryDto,
  PlanExecutionProgressDto,
  TestExecutionDto,
} from "@apzhub/qep-test-execution";

export type QepExecutionStatus =
  | "draft"
  | "ready"
  | "assigned"
  | "in_progress"
  | "paused"
  | "blocked"
  | "completed"
  | "submitted_for_review"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "superseded";

export type QepTestExecutionListParams = {
  readonly status?: QepExecutionStatus;
  readonly assigneeId?: string;
  readonly reviewerId?: string;
  readonly ownerId?: string;
  readonly planId?: string;
  readonly specId?: string;
  readonly projectId?: string;
  readonly workspaceId?: string;
  readonly reviewQueue?: boolean;
  readonly limit?: number;
  readonly offset?: number;
};

export type QepClientRequestOptions = {
  readonly signal?: AbortSignal;
};

export type QepCollectionResult<T> = {
  readonly items: readonly T[];
  readonly total?: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type QepExecutionSourceVersionRef = {
  readonly capability: string;
  readonly id: string;
  readonly versionLabel: string;
};

export type CreateQepTestExecutionInput = {
  readonly id?: string;
  readonly projectId: string;
  readonly workspaceId: string;
  readonly mode?: string;
  readonly sourceRefs: {
    readonly planRef?: QepExecutionSourceVersionRef;
    readonly specRef?: QepExecutionSourceVersionRef;
    readonly planItemId?: string;
  };
  readonly ownerId?: string;
  readonly context?: Record<string, string>;
  readonly executionNumber?: string;
  readonly supersedesId?: string;
};

/**
 * `availableActions` DTO action names → `/actions/{slug}` path segments
 * (OES-ENG-090A PART-04 §1.2).
 */
export const EXECUTION_ACTION_SLUGS: Readonly<Record<string, string>> = {
  prepareExecution: "prepare",
  assignExecutor: "assign",
  startExecution: "start",
  pauseExecution: "pause",
  blockExecution: "block",
  resumeExecution: "resume",
  completeExecution: "complete",
  submitForReview: "submitForReview",
  acceptExecution: "accept",
  rejectExecution: "reject",
  cancelExecution: "cancel",
  supersedeExecution: "supersede",
};

export function resolveExecutionActionSlug(action: string): string {
  return EXECUTION_ACTION_SLUGS[action] ?? action;
}

export type PerformQepExecutionActionInput = {
  readonly expectedRevision: number;
  readonly reason?: string;
  readonly executorId?: string;
  readonly reviewerId?: string;
  readonly agentIdentity?: string;
  readonly allowReassignInProgress?: boolean;
  readonly outcomeOverride?: string;
  readonly successorExecutionId?: string;
};

export type RecordQepExecutionStepResultInput = {
  readonly expectedRevision: number;
  readonly outcome: string;
  readonly actualResult?: string;
  readonly skipReason?: string;
  readonly blockReason?: string;
  readonly notApplicableReason?: string;
  readonly comment?: string;
  readonly evidenceIds?: readonly string[];
  readonly startedAt?: string;
  readonly completedAt?: string;
};

export type AssociateQepExecutionEvidenceInput = {
  readonly expectedRevision: number;
  readonly id?: string;
  readonly uri: string;
  readonly integrityHash?: string;
  readonly stepOrder?: number;
};

export type RecordQepExecutionObservationInput = {
  readonly expectedRevision: number;
  readonly id?: string;
  readonly body: string;
  readonly severityHint?: "info" | "warning" | "critical";
  readonly structured?: Record<string, string>;
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string; code?: string };
    };
    const message = body.error?.message ?? `Request failed (${response.status})`;
    const error = new Error(message) as Error & { code?: string; status?: number };
    error.code = body.error?.code;
    error.status = response.status;
    throw error;
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

async function parseCollection<T>(response: Response): Promise<QepCollectionResult<T>> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  const body = (await response.json()) as {
    data: readonly T[];
    page?: { total?: number; limit?: number; offset?: number };
  };
  return {
    items: body.data,
    total: body.page?.total,
    limit: body.page?.limit,
    offset: body.page?.offset,
  };
}

function buildListQuery(params?: QepTestExecutionListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.assigneeId) search.set("assigneeId", params.assigneeId);
  if (params.reviewerId) search.set("reviewerId", params.reviewerId);
  if (params.ownerId) search.set("ownerId", params.ownerId);
  if (params.planId) search.set("planId", params.planId);
  if (params.specId) search.set("specId", params.specId);
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.workspaceId) search.set("workspaceId", params.workspaceId);
  if (params.reviewQueue !== undefined) {
    search.set("reviewQueue", String(params.reviewQueue));
  }
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function postAction<T>(
  url: string,
  body: unknown,
  options?: QepClientRequestOptions,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options?.signal,
  });
  return parseJson<T>(response);
}

export function createQepTestExecutionHttpClient(basePath = "/api/v1/qep/executions") {
  return {
    async list(params?: QepTestExecutionListParams, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}${buildListQuery(params)}`, {
        signal: options?.signal,
      });
      return parseCollection<TestExecutionDto>(response);
    },

    async listAssigned(
      params?: QepTestExecutionListParams,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/assigned${buildListQuery(params)}`, {
        signal: options?.signal,
      });
      return parseCollection<TestExecutionDto>(response);
    },

    async listReviewQueue(
      params?: QepTestExecutionListParams,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/review-queue${buildListQuery(params)}`,
        { signal: options?.signal },
      );
      return parseCollection<TestExecutionDto>(response);
    },

    async get(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}`, {
        signal: options?.signal,
      });
      return parseJson<TestExecutionDto>(response);
    },

    async getHistory(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/history`, {
        signal: options?.signal,
      });
      return parseJson<ExecutionHistoryDto>(response);
    },

    async getAvailableActions(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/available-actions`,
        { signal: options?.signal },
      );
      return parseJson<readonly ExecutionActionDescriptor[]>(response);
    },

    async getSteps(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/steps`, {
        signal: options?.signal,
      });
      return parseJson<readonly ExecutionStepDto[]>(response);
    },

    async getManifest(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/manifest`, {
        signal: options?.signal,
      });
      return parseJson<ExecutionManifestDto | null>(response);
    },

    async create(
      input: CreateQepTestExecutionInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(basePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<TestExecutionDto>(response);
    },

    async performAction(
      id: string,
      actionSlug: string,
      body: PerformQepExecutionActionInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<TestExecutionDto>(
        `${basePath}/${encodeURIComponent(id)}/actions/${encodeURIComponent(actionSlug)}`,
        body,
        options,
      );
    },

    async recordStepResult(
      id: string,
      stepOrder: number,
      body: RecordQepExecutionStepResultInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<TestExecutionDto>(
        `${basePath}/${encodeURIComponent(id)}/steps/${encodeURIComponent(String(stepOrder))}/results`,
        body,
        options,
      );
    },

    async associateEvidence(
      id: string,
      body: AssociateQepExecutionEvidenceInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<TestExecutionDto>(
        `${basePath}/${encodeURIComponent(id)}/evidence-references`,
        body,
        options,
      );
    },

    async recordObservation(
      id: string,
      body: RecordQepExecutionObservationInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<TestExecutionDto>(
        `${basePath}/${encodeURIComponent(id)}/observations`,
        body,
        options,
      );
    },

    async getPlanExecutionProgress(planId: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/progress/by-plan/${encodeURIComponent(planId)}`,
        { signal: options?.signal },
      );
      return parseJson<PlanExecutionProgressDto>(response);
    },

    async listEvidenceReferences(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/evidence-references`,
        { signal: options?.signal },
      );
      return parseJson<readonly EvidenceReferenceDto[]>(response);
    },
  };
}

const defaultClient = createQepTestExecutionHttpClient();

export const listExecutions = defaultClient.list.bind(defaultClient);
export const listAssignedExecutions = defaultClient.listAssigned.bind(defaultClient);
export const listReviewQueueExecutions =
  defaultClient.listReviewQueue.bind(defaultClient);
export const getExecution = defaultClient.get.bind(defaultClient);
export const getExecutionHistory = defaultClient.getHistory.bind(defaultClient);
export const getExecutionAvailableActions =
  defaultClient.getAvailableActions.bind(defaultClient);
export const getExecutionSteps = defaultClient.getSteps.bind(defaultClient);
export const getExecutionManifest = defaultClient.getManifest.bind(defaultClient);
export const createExecution = defaultClient.create.bind(defaultClient);
export const performExecutionAction = defaultClient.performAction.bind(defaultClient);
export const recordExecutionStepResult =
  defaultClient.recordStepResult.bind(defaultClient);
export const associateExecutionEvidence =
  defaultClient.associateEvidence.bind(defaultClient);
export const recordExecutionObservation =
  defaultClient.recordObservation.bind(defaultClient);
export const getPlanExecutionProgress =
  defaultClient.getPlanExecutionProgress.bind(defaultClient);
export const listExecutionEvidenceReferences =
  defaultClient.listEvidenceReferences.bind(defaultClient);
