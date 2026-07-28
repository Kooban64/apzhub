/**
 * QEP Test Specification HTTP client (APZQEP-ENG-050C).
 */

import type {
  AddQepTestSpecificationRelationshipInput,
  ApproveQepTestSpecificationInput,
  CreateQepTestSpecificationInput,
  ListQepTestSpecificationsQuery,
  QepTestSpecificationDto,
  QepTestSpecificationHistorySummaryDto,
  RejectQepTestSpecificationInput,
  SubmitQepTestSpecificationReviewInput,
  SupersedeQepTestSpecificationInput,
  UpdateQepTestSpecificationDraftInput,
} from "@apzhub/qep-contracts";

export type QepTestSpecificationListParams = ListQepTestSpecificationsQuery;

export type QepClientRequestOptions = {
  readonly signal?: AbortSignal;
};

export type QepCollectionResult<T> = {
  readonly items: readonly T[];
  readonly total?: number;
  readonly limit?: number;
  readonly offset?: number;
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

function buildListQuery(params?: QepTestSpecificationListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.type) search.set("type", params.type);
  if (params.owner) search.set("owner", params.owner);
  if (params.classification) search.set("classification", params.classification);
  if (params.priority) search.set("priority", params.priority);
  if (params.number) search.set("number", params.number);
  if (params.isAuthoritative !== undefined) {
    search.set("isAuthoritative", String(params.isAuthoritative));
  }
  if (params.query) search.set("query", params.query);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function createQepTestSpecificationHttpClient(
  basePath = "/api/v1/qep/specifications",
) {
  return {
    async listSpecifications(
      params?: QepTestSpecificationListParams,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}${buildListQuery(params)}`, {
        signal: options?.signal,
      });
      return parseCollection<QepTestSpecificationDto>(response);
    },

    async getSpecification(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}`, {
        signal: options?.signal,
      });
      return parseJson<QepTestSpecificationDto>(response);
    },

    async createSpecification(
      input: CreateQepTestSpecificationInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(basePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepTestSpecificationDto>(response);
    },

    async updateDraft(
      id: string,
      input: UpdateQepTestSpecificationDraftInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepTestSpecificationDto>(response);
    },

    async submitForReview(
      id: string,
      input: SubmitQepTestSpecificationReviewInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepTestSpecificationDto>(response);
    },

    async approve(
      id: string,
      input: ApproveQepTestSpecificationInput = {},
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepTestSpecificationDto>(response);
    },

    async reject(
      id: string,
      input: RejectQepTestSpecificationInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepTestSpecificationDto>(response);
    },

    async withdraw(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/withdraw`, {
        method: "POST",
        signal: options?.signal,
      });
      return parseJson<QepTestSpecificationDto>(response);
    },

    async cancel(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/cancel`, {
        method: "POST",
        signal: options?.signal,
      });
      return parseJson<QepTestSpecificationDto>(response);
    },

    async retire(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/retire`, {
        method: "POST",
        signal: options?.signal,
      });
      return parseJson<QepTestSpecificationDto>(response);
    },

    async supersede(
      id: string,
      input: SupersedeQepTestSpecificationInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/supersede`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<{
        readonly predecessor: QepTestSpecificationDto;
        readonly successor?: QepTestSpecificationDto;
      }>(response);
    },

    async getHistory(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/history`, {
        signal: options?.signal,
      });
      return parseJson<readonly QepTestSpecificationHistorySummaryDto[]>(response);
    },

    async listVersions(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/versions`, {
        signal: options?.signal,
      });
      return parseJson<readonly QepTestSpecificationDto[]>(response);
    },

    async listRelationships(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/relationships`,
        { signal: options?.signal },
      );
      return parseJson<QepTestSpecificationDto["relationships"]>(response);
    },

    async addRelationship(
      id: string,
      input: AddQepTestSpecificationRelationshipInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/relationships`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: options?.signal,
        },
      );
      return parseJson<QepTestSpecificationDto>(response);
    },

    async removeRelationship(
      id: string,
      relationshipId: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/relationships/${encodeURIComponent(relationshipId)}`,
        { method: "DELETE", signal: options?.signal },
      );
      return parseJson<QepTestSpecificationDto>(response);
    },
  };
}

const defaultClient = createQepTestSpecificationHttpClient();

export const listSpecifications = defaultClient.listSpecifications.bind(defaultClient);
export const getSpecification = defaultClient.getSpecification.bind(defaultClient);
export const createSpecification =
  defaultClient.createSpecification.bind(defaultClient);
export const updateDraft = defaultClient.updateDraft.bind(defaultClient);
export const submitForReview = defaultClient.submitForReview.bind(defaultClient);
export const approveSpecification = defaultClient.approve.bind(defaultClient);
export const rejectSpecification = defaultClient.reject.bind(defaultClient);
export const withdrawSpecification = defaultClient.withdraw.bind(defaultClient);
export const cancelSpecification = defaultClient.cancel.bind(defaultClient);
export const retireSpecification = defaultClient.retire.bind(defaultClient);
export const supersedeSpecification = defaultClient.supersede.bind(defaultClient);
export const getSpecificationHistory = defaultClient.getHistory.bind(defaultClient);
export const listSpecificationVersions = defaultClient.listVersions.bind(defaultClient);
export const listSpecificationRelationships =
  defaultClient.listRelationships.bind(defaultClient);
export const addSpecificationRelationship =
  defaultClient.addRelationship.bind(defaultClient);
export const removeSpecificationRelationship =
  defaultClient.removeRelationship.bind(defaultClient);
