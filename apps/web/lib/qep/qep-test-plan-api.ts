/**
 * QEP Test Plan HTTP client (APZQEP-ENG-070A).
 */

import type {
  AddQepTestPlanItemInput,
  ApproveQepTestPlanInput,
  CloneQepTestPlanInput,
  CreateQepTestPlanInput,
  ListQepTestPlansQuery,
  QepTestPlanDto,
  QepTestPlanHistorySummaryDto,
  RejectQepTestPlanInput,
  ReorderQepTestPlanItemsInput,
  SubmitQepTestPlanReviewInput,
  SupersedeQepTestPlanInput,
  TransferQepTestPlanOwnershipInput,
  UpdateQepTestPlanAssignmentInput,
  UpdateQepTestPlanContentInput,
  UpdateQepTestPlanItemInput,
  UpdateQepTestPlanMetadataInput,
  UpdateQepTestPlanScheduleInput,
} from "@apzhub/qep-contracts";

export type QepTestPlanListParams = ListQepTestPlansQuery;

export type QepClientRequestOptions = {
  readonly signal?: AbortSignal;
};

export type QepCollectionResult<T> = {
  readonly items: readonly T[];
  readonly total?: number;
  readonly limit?: number;
  readonly offset?: number;
};

type ExpectedRevisionBody = { readonly expectedRevision: number };

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

function buildListQuery(params?: QepTestPlanListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.ownerId) search.set("ownerId", params.ownerId);
  if (params.leadId) search.set("leadId", params.leadId);
  if (params.priority) search.set("priority", params.priority);
  if (params.planType) search.set("planType", params.planType);
  if (params.number) search.set("number", params.number);
  if (params.scheduledFrom) search.set("scheduledFrom", params.scheduledFrom);
  if (params.scheduledTo) search.set("scheduledTo", params.scheduledTo);
  if (params.includeArchived !== undefined) {
    search.set("includeArchived", String(params.includeArchived));
  }
  if (params.query) search.set("query", params.query);
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

export function createQepTestPlanHttpClient(basePath = "/api/v1/qep/plans") {
  return {
    async listPlans(params?: QepTestPlanListParams, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}${buildListQuery(params)}`, {
        signal: options?.signal,
      });
      return parseCollection<QepTestPlanDto>(response);
    },

    async getPlan(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}`, {
        signal: options?.signal,
      });
      return parseJson<QepTestPlanDto>(response);
    },

    async createPlan(input: CreateQepTestPlanInput, options?: QepClientRequestOptions) {
      const response = await fetch(basePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepTestPlanDto>(response);
    },

    async updateContent(
      id: string,
      input: UpdateQepTestPlanContentInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepTestPlanDto>(response);
    },

    async updateMetadata(
      id: string,
      input: UpdateQepTestPlanMetadataInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/metadata`,
        input,
        options,
      );
    },

    async transferOwnership(
      id: string,
      input: TransferQepTestPlanOwnershipInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/ownership`,
        input,
        options,
      );
    },

    async updateAssignment(
      id: string,
      input: UpdateQepTestPlanAssignmentInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/assignment`,
        input,
        options,
      );
    },

    async updateSchedule(
      id: string,
      input: UpdateQepTestPlanScheduleInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/schedule`,
        input,
        options,
      );
    },

    async addItem(
      id: string,
      input: AddQepTestPlanItemInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/items`,
        input,
        options,
      );
    },

    async updateItem(
      id: string,
      itemId: string,
      input: UpdateQepTestPlanItemInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: options?.signal,
        },
      );
      return parseJson<QepTestPlanDto>(response);
    },

    async removeItem(
      id: string,
      itemId: string,
      input: ExpectedRevisionBody,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: options?.signal,
        },
      );
      return parseJson<QepTestPlanDto>(response);
    },

    async reorderItems(
      id: string,
      input: ReorderQepTestPlanItemsInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/items/reorder`,
        input,
        options,
      );
    },

    async submitForReview(
      id: string,
      input: SubmitQepTestPlanReviewInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/submit`,
        input,
        options,
      );
    },

    async approve(
      id: string,
      input: ApproveQepTestPlanInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/approve`,
        input,
        options,
      );
    },

    async reject(
      id: string,
      input: RejectQepTestPlanInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/reject`,
        input,
        options,
      );
    },

    async returnToDraft(
      id: string,
      input: ExpectedRevisionBody,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/return-to-draft`,
        input,
        options,
      );
    },

    async markReady(
      id: string,
      input: ExpectedRevisionBody,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/ready`,
        input,
        options,
      );
    },

    async startExecution(
      id: string,
      input: ExpectedRevisionBody,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/execute`,
        input,
        options,
      );
    },

    async complete(
      id: string,
      input: ExpectedRevisionBody,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/complete`,
        input,
        options,
      );
    },

    async archive(
      id: string,
      input: ExpectedRevisionBody,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/archive`,
        input,
        options,
      );
    },

    async cancel(
      id: string,
      input: ExpectedRevisionBody,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/cancel`,
        input,
        options,
      );
    },

    async supersede(
      id: string,
      input: SupersedeQepTestPlanInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/supersede`,
        input,
        options,
      );
    },

    async clone(
      id: string,
      input: CloneQepTestPlanInput = {},
      options?: QepClientRequestOptions,
    ) {
      return postAction<QepTestPlanDto>(
        `${basePath}/${encodeURIComponent(id)}/clone`,
        input,
        options,
      );
    },

    async getHistory(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/history`, {
        signal: options?.signal,
      });
      return parseJson<readonly QepTestPlanHistorySummaryDto[]>(response);
    },

    async listVersions(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/versions`, {
        signal: options?.signal,
      });
      return parseJson<readonly QepTestPlanDto[]>(response);
    },
  };
}

const defaultClient = createQepTestPlanHttpClient();

export const listPlans = defaultClient.listPlans.bind(defaultClient);
export const getPlan = defaultClient.getPlan.bind(defaultClient);
export const createPlan = defaultClient.createPlan.bind(defaultClient);
export const updatePlanContent = defaultClient.updateContent.bind(defaultClient);
export const updatePlanMetadata = defaultClient.updateMetadata.bind(defaultClient);
export const transferPlanOwnership =
  defaultClient.transferOwnership.bind(defaultClient);
export const updatePlanAssignment = defaultClient.updateAssignment.bind(defaultClient);
export const updatePlanSchedule = defaultClient.updateSchedule.bind(defaultClient);
export const addPlanItem = defaultClient.addItem.bind(defaultClient);
export const updatePlanItem = defaultClient.updateItem.bind(defaultClient);
export const removePlanItem = defaultClient.removeItem.bind(defaultClient);
export const reorderPlanItems = defaultClient.reorderItems.bind(defaultClient);
export const submitPlanForReview = defaultClient.submitForReview.bind(defaultClient);
export const approvePlan = defaultClient.approve.bind(defaultClient);
export const rejectPlan = defaultClient.reject.bind(defaultClient);
export const returnPlanToDraft = defaultClient.returnToDraft.bind(defaultClient);
export const markPlanReady = defaultClient.markReady.bind(defaultClient);
export const startPlanExecution = defaultClient.startExecution.bind(defaultClient);
export const completePlan = defaultClient.complete.bind(defaultClient);
export const archivePlan = defaultClient.archive.bind(defaultClient);
export const cancelPlan = defaultClient.cancel.bind(defaultClient);
export const supersedePlan = defaultClient.supersede.bind(defaultClient);
export const clonePlan = defaultClient.clone.bind(defaultClient);
export const getPlanHistory = defaultClient.getHistory.bind(defaultClient);
export const listPlanVersions = defaultClient.listVersions.bind(defaultClient);
