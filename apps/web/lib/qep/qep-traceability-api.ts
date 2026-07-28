/**
 * QEP Traceability HTTP client (APZQEP-ENG-030C).
 */

import type {
  CreateQepTraceLinkInput,
  ListQepTraceLinksQuery,
  QepTraceLinkDto,
  QepTraceLinkHistorySummaryDto,
  QepTraceLinkTaxonomyDto,
  SupersedeQepTraceLinkInput,
} from "@apzhub/qep-contracts";

export type QepTraceLinkListParams = ListQepTraceLinksQuery;

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

function buildTraceLinkQuery(params?: QepTraceLinkListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.lifecycleState) search.set("lifecycleState", params.lifecycleState);
  if (params.sourceKind) search.set("sourceKind", params.sourceKind);
  if (params.sourceArtefactId) search.set("sourceArtefactId", params.sourceArtefactId);
  if (params.targetKind) search.set("targetKind", params.targetKind);
  if (params.targetArtefactId) search.set("targetArtefactId", params.targetArtefactId);
  if (params.artefactId) search.set("artefactId", params.artefactId);
  if (params.direction) search.set("direction", params.direction);
  if (params.scopeReferenceId) search.set("scopeReferenceId", params.scopeReferenceId);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function createQepTraceabilityHttpClient(basePath = "/api/v1/qep/traceability") {
  return {
    async listTraceLinks(
      params?: QepTraceLinkListParams,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/trace-links${buildTraceLinkQuery(params)}`,
        {
          signal: options?.signal,
        },
      );
      return parseCollection<QepTraceLinkDto>(response);
    },

    async getTraceLink(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/trace-links/${encodeURIComponent(id)}`,
        {
          signal: options?.signal,
        },
      );
      return parseJson<QepTraceLinkDto>(response);
    },

    async createTraceLink(
      input: CreateQepTraceLinkInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/trace-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepTraceLinkDto>(response);
    },

    async validateTraceLink(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/trace-links/${encodeURIComponent(id)}/validate`,
        { method: "POST", signal: options?.signal },
      );
      return parseJson<QepTraceLinkDto>(response);
    },

    async approveTraceLink(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/trace-links/${encodeURIComponent(id)}/approve`,
        { method: "POST", signal: options?.signal },
      );
      return parseJson<QepTraceLinkDto>(response);
    },

    async retireTraceLink(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/trace-links/${encodeURIComponent(id)}/retire`,
        {
          method: "POST",
          signal: options?.signal,
        },
      );
      return parseJson<QepTraceLinkDto>(response);
    },

    async supersedeTraceLink(
      id: string,
      input: SupersedeQepTraceLinkInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/trace-links/${encodeURIComponent(id)}/supersede`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: options?.signal,
        },
      );
      return parseJson<QepTraceLinkDto>(response);
    },

    async updateTraceLinkConfidence(
      id: string,
      confidence: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/trace-links/${encodeURIComponent(id)}/confidence`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confidence }),
          signal: options?.signal,
        },
      );
      return parseJson<QepTraceLinkDto>(response);
    },

    async updateTraceLinkAuthority(
      id: string,
      authority: { readonly kind: string; readonly actorId: string },
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/trace-links/${encodeURIComponent(id)}/authority`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authority }),
          signal: options?.signal,
        },
      );
      return parseJson<QepTraceLinkDto>(response);
    },

    async updateTraceLinkScope(
      id: string,
      scope: { readonly kind: string; readonly referenceId?: string },
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/trace-links/${encodeURIComponent(id)}/scope`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scope }),
          signal: options?.signal,
        },
      );
      return parseJson<QepTraceLinkDto>(response);
    },

    async updateTraceLinkRationale(
      id: string,
      rationale: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/trace-links/${encodeURIComponent(id)}/rationale`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rationale }),
          signal: options?.signal,
        },
      );
      return parseJson<QepTraceLinkDto>(response);
    },

    async updateTraceLinkMetadata(
      id: string,
      metadata: Readonly<Record<string, string>>,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/trace-links/${encodeURIComponent(id)}/metadata`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata }),
          signal: options?.signal,
        },
      );
      return parseJson<QepTraceLinkDto>(response);
    },

    async getTraceLinkHistory(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/trace-links/${encodeURIComponent(id)}/history`,
        { signal: options?.signal },
      );
      return parseJson<readonly QepTraceLinkHistorySummaryDto[]>(response);
    },

    async listTraceLinkTaxonomy(options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/trace-links/taxonomy`, {
        signal: options?.signal,
      });
      return parseJson<readonly QepTraceLinkTaxonomyDto[]>(response);
    },

    async listTraceLinksByEndpoint(
      kind: string,
      artefactId: string,
      direction?: "inbound" | "outbound" | "both",
      options?: QepClientRequestOptions,
    ) {
      const search = new URLSearchParams();
      if (direction) search.set("direction", direction);
      const qs = search.toString() ? `?${search.toString()}` : "";
      const response = await fetch(
        `${basePath}/endpoints/${encodeURIComponent(kind)}/${encodeURIComponent(artefactId)}/trace-links${qs}`,
        { signal: options?.signal },
      );
      return parseJson<readonly QepTraceLinkDto[]>(response);
    },
  };
}

const defaultClient = createQepTraceabilityHttpClient();

export const listTraceLinks = defaultClient.listTraceLinks.bind(defaultClient);
export const getTraceLink = defaultClient.getTraceLink.bind(defaultClient);
export const createTraceLink = defaultClient.createTraceLink.bind(defaultClient);
export const validateTraceLink = defaultClient.validateTraceLink.bind(defaultClient);
export const approveTraceLink = defaultClient.approveTraceLink.bind(defaultClient);
export const retireTraceLink = defaultClient.retireTraceLink.bind(defaultClient);
export const supersedeTraceLink = defaultClient.supersedeTraceLink.bind(defaultClient);
export const updateTraceLinkConfidence =
  defaultClient.updateTraceLinkConfidence.bind(defaultClient);
export const updateTraceLinkAuthority =
  defaultClient.updateTraceLinkAuthority.bind(defaultClient);
export const updateTraceLinkScope =
  defaultClient.updateTraceLinkScope.bind(defaultClient);
export const updateTraceLinkRationale =
  defaultClient.updateTraceLinkRationale.bind(defaultClient);
export const updateTraceLinkMetadata =
  defaultClient.updateTraceLinkMetadata.bind(defaultClient);
export const getTraceLinkHistory =
  defaultClient.getTraceLinkHistory.bind(defaultClient);
export const listTraceLinkTaxonomy =
  defaultClient.listTraceLinkTaxonomy.bind(defaultClient);
export const listTraceLinksByEndpoint =
  defaultClient.listTraceLinksByEndpoint.bind(defaultClient);
