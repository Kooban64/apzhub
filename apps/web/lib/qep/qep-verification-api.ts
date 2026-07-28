/**
 * QEP Verification HTTP client (APZQEP-ENG-040C).
 */

import type {
  AssignQepVerificationInput,
  CompleteQepVerificationInput,
  CreateQepVerificationInput,
  ListQepVerificationsQuery,
  QepVerificationDto,
  QepVerificationHistorySummaryDto,
  RejectQepVerificationInput,
  SupersedeQepVerificationInput,
} from "@apzhub/qep-contracts";

export type QepVerificationListParams = ListQepVerificationsQuery;

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

function buildListQuery(params?: QepVerificationListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.outcome) search.set("outcome", params.outcome);
  if (params.subjectKind) search.set("subjectKind", params.subjectKind);
  if (params.subjectArtefactId) search.set("subjectArtefactId", params.subjectArtefactId);
  if (params.authorityActorId) search.set("authorityActorId", params.authorityActorId);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function createQepVerificationHttpClient(basePath = "/api/v1/qep/verifications") {
  return {
    async listVerifications(
      params?: QepVerificationListParams,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}${buildListQuery(params)}`, {
        signal: options?.signal,
      });
      return parseCollection<QepVerificationDto>(response);
    },

    async getVerification(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}`, {
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async createVerification(
      input: CreateQepVerificationInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(basePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async requestVerification(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/request`, {
        method: "POST",
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async assignVerification(
      id: string,
      input: AssignQepVerificationInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async startVerification(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/start`, {
        method: "POST",
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async completeVerification(
      id: string,
      input: CompleteQepVerificationInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async rejectVerification(
      id: string,
      input: RejectQepVerificationInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async expireVerification(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/expire`, {
        method: "POST",
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async withdrawVerification(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/withdraw`, {
        method: "POST",
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async cancelVerification(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/cancel`, {
        method: "POST",
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async retireVerification(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/retire`, {
        method: "POST",
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async supersedeVerification(
      id: string,
      input: SupersedeQepVerificationInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/supersede`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async updateVerificationMetadata(
      id: string,
      metadata: Readonly<Record<string, string>>,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/metadata`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata }),
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async updateVerificationRationale(
      id: string,
      rationale: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/rationale`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rationale }),
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async updateVerificationPriority(
      id: string,
      priority: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
        signal: options?.signal,
      });
      return parseJson<QepVerificationDto>(response);
    },

    async getVerificationHistory(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/history`, {
        signal: options?.signal,
      });
      return parseJson<readonly QepVerificationHistorySummaryDto[]>(response);
    },
  };
}

const defaultClient = createQepVerificationHttpClient();

export const listVerifications = defaultClient.listVerifications.bind(defaultClient);
export const getVerification = defaultClient.getVerification.bind(defaultClient);
export const createVerification = defaultClient.createVerification.bind(defaultClient);
export const requestVerification = defaultClient.requestVerification.bind(defaultClient);
export const assignVerification = defaultClient.assignVerification.bind(defaultClient);
export const startVerification = defaultClient.startVerification.bind(defaultClient);
export const completeVerification = defaultClient.completeVerification.bind(defaultClient);
export const rejectVerification = defaultClient.rejectVerification.bind(defaultClient);
export const expireVerification = defaultClient.expireVerification.bind(defaultClient);
export const withdrawVerification = defaultClient.withdrawVerification.bind(defaultClient);
export const cancelVerification = defaultClient.cancelVerification.bind(defaultClient);
export const retireVerification = defaultClient.retireVerification.bind(defaultClient);
export const supersedeVerification = defaultClient.supersedeVerification.bind(defaultClient);
export const updateVerificationMetadata =
  defaultClient.updateVerificationMetadata.bind(defaultClient);
export const updateVerificationRationale =
  defaultClient.updateVerificationRationale.bind(defaultClient);
export const updateVerificationPriority =
  defaultClient.updateVerificationPriority.bind(defaultClient);
export const getVerificationHistory = defaultClient.getVerificationHistory.bind(defaultClient);
