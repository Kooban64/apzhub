/**
 * QEP Requirements HTTP client (APZQEP-ENG-020B).
 */

import type {
  QepBaselineCompareResult,
  QepBaselineDto,
  QepBaselineItemDto,
  QepRelationshipDto,
  QepRelationshipTaxonomyDto,
  QepRequirementDto,
  QepRequirementContentVersionDetailDto,
  QepRequirementContentVersionMetadataDto,
  QepRequirementLifecycleHistoryDto,
  QepRequirementLifecycleTransitionDto,
  QepRequirementVersionComparisonDto,
  CreateQepRelationshipInput,
  ListQepRelationshipsQuery,
  SupersedeQepRelationshipInput,
  UpdateQepRelationshipProfileInput,
} from "@apzhub/qep-contracts";

export type QepListParams = {
  readonly projectId?: string;
  readonly status?: string;
  readonly includeArchived?: boolean;
  readonly limit?: number;
  readonly offset?: number;
  readonly q?: string;
};

export type QepCollectionResult<T> = {
  readonly items: readonly T[];
  readonly total?: number;
  readonly limit?: number;
  readonly offset?: number;
};

export type QepClientRequestOptions = {
  readonly signal?: AbortSignal;
};

export type CreateQepRequirementInput = {
  readonly projectId: string;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly type: string;
  readonly status?: string;
  readonly priority: string;
  readonly category?: string;
  readonly changeReason?: string;
};

export type UpdateQepRequirementInput = {
  readonly changeReason: string;
  readonly title?: string;
  readonly description?: string | null;
  readonly type?: string;
  readonly priority?: string;
  readonly category?: string | null;
  readonly expectedRevision?: number;
};

export type QepRequirementTransitionInput = {
  readonly action: string;
  readonly reason?: string;
  readonly comments?: string;
  readonly expectedRevision?: number;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type QepBaselineListParams = {
  readonly status?: string;
  readonly limit?: number;
  readonly offset?: number;
};

export type CreateQepBaselineInput = {
  readonly name: string;
  readonly description?: string;
};

export type UpdateQepBaselineDraftInput = {
  readonly name?: string;
  readonly description?: string | null;
};

export type AddQepBaselineItemInput = {
  readonly contentVersionId: string;
  readonly requirementId?: string;
};

export type CompareQepBaselinesInput = {
  readonly baseBaselineId: string;
  readonly targetBaselineId: string;
};

export type QepRelationshipListParams = ListQepRelationshipsQuery;

export type CreateQepRelationshipClientInput = CreateQepRelationshipInput;

export type UpdateQepRelationshipProfileClientInput = UpdateQepRelationshipProfileInput;

export type SupersedeQepRelationshipClientInput = SupersedeQepRelationshipInput;

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
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

function buildQuery(params?: QepListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.status) search.set("status", params.status);
  if (params.includeArchived) search.set("includeArchived", "true");
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return query ? `?${query}` : "";
}

function buildBaselineQuery(params?: QepBaselineListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return query ? `?${query}` : "";
}

function buildRelationshipQuery(params?: QepRelationshipListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.type) search.set("type", params.type);
  if (params.lifecycleState) search.set("lifecycleState", params.lifecycleState);
  if (params.requirementId) search.set("requirementId", params.requirementId);
  if (params.direction) search.set("direction", params.direction);
  if (params.baselineId) search.set("baselineId", params.baselineId);
  if (params.contentVersionId) search.set("contentVersionId", params.contentVersionId);
  if (params.conflictsOnly) search.set("conflictsOnly", "true");
  if (params.supersessionOnly) search.set("supersessionOnly", "true");
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function createQepHttpClient(basePath = "/api/v1/qep/requirements") {
  return {
    async listRequirements(params?: QepListParams, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}${buildQuery(params)}`, {
        signal: options?.signal,
      });
      return parseCollection<QepRequirementDto>(response);
    },

    async searchRequirements(
      params: QepListParams & { q: string },
      options?: QepClientRequestOptions,
    ) {
      const search = new URLSearchParams(buildQuery(params).replace(/^\?/, ""));
      search.set("q", params.q);
      const response = await fetch(`${basePath}/search?${search.toString()}`, {
        signal: options?.signal,
      });
      return parseCollection<QepRequirementDto>(response);
    },

    async getRequirement(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}`, {
        signal: options?.signal,
      });
      return parseJson<QepRequirementDto>(response);
    },

    async createRequirement(
      input: CreateQepRequirementInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(basePath, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepRequirementDto>(response);
    },

    async updateRequirement(
      id: string,
      input: UpdateQepRequirementInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepRequirementDto>(response);
    },

    async archiveRequirement(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}`, {
        method: "DELETE",
        signal: options?.signal,
      });
      return parseJson<QepRequirementDto>(response);
    },

    async getAvailableTransitions(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/transitions`,
        { signal: options?.signal },
      );
      return parseJson<readonly QepRequirementLifecycleTransitionDto[]>(response);
    },

    async transitionRequirement(
      id: string,
      input: QepRequirementTransitionInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/transitions`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
          signal: options?.signal,
        },
      );
      return parseJson<QepRequirementDto>(response);
    },

    async getLifecycleHistory(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/lifecycle`, {
        signal: options?.signal,
      });
      return parseJson<readonly QepRequirementLifecycleHistoryDto[]>(response);
    },

    async listContentVersions(
      id: string,
      params?: QepListParams,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/versions${buildQuery(params)}`,
        { signal: options?.signal },
      );
      return parseCollection<QepRequirementContentVersionMetadataDto>(response);
    },

    async getContentVersion(
      id: string,
      versionNumber: number,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/versions/${versionNumber}`,
        { signal: options?.signal },
      );
      return parseJson<QepRequirementContentVersionDetailDto>(response);
    },

    async compareContentVersions(
      id: string,
      input: {
        readonly baseVersionNumber: number;
        readonly targetVersionNumber: number;
      },
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/versions/compare`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
          signal: options?.signal,
        },
      );
      return parseJson<QepRequirementVersionComparisonDto>(response);
    },

    async verifyContentVersionIntegrity(
      id: string,
      versionNumber: number,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/versions/${versionNumber}/verify`,
        { method: "POST", signal: options?.signal },
      );
      return parseJson<{ readonly versionNumber: number; readonly valid: boolean }>(
        response,
      );
    },

    /** Requirement Baseline (configuration-management) operations — APZQEP-ENG-020E. */

    async listBaselines(
      params?: QepBaselineListParams,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/baselines${buildBaselineQuery(params)}`,
        {
          signal: options?.signal,
        },
      );
      return parseCollection<QepBaselineDto>(response);
    },

    async getBaseline(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/baselines/${encodeURIComponent(id)}`, {
        signal: options?.signal,
      });
      return parseJson<QepBaselineDto>(response);
    },

    async createBaseline(
      input: CreateQepBaselineInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/baselines`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepBaselineDto>(response);
    },

    async updateDraftBaseline(
      id: string,
      input: UpdateQepBaselineDraftInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/baselines/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepBaselineDto>(response);
    },

    async listBaselineItems(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/baselines/${encodeURIComponent(id)}/items`,
        {
          signal: options?.signal,
        },
      );
      return parseJson<readonly QepBaselineItemDto[]>(response);
    },

    async addBaselineItem(
      id: string,
      input: AddQepBaselineItemInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/baselines/${encodeURIComponent(id)}/items`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
          signal: options?.signal,
        },
      );
      return parseJson<QepBaselineDto>(response);
    },

    async removeBaselineItem(
      id: string,
      contentVersionId: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/baselines/${encodeURIComponent(id)}/items/${encodeURIComponent(contentVersionId)}`,
        { method: "DELETE", signal: options?.signal },
      );
      return parseJson<QepBaselineDto>(response);
    },

    async lockBaseline(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/baselines/${encodeURIComponent(id)}/lock`,
        {
          method: "POST",
          signal: options?.signal,
        },
      );
      return parseJson<QepBaselineDto>(response);
    },

    async archiveBaseline(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/baselines/${encodeURIComponent(id)}/archive`,
        {
          method: "POST",
          signal: options?.signal,
        },
      );
      return parseJson<QepBaselineDto>(response);
    },

    async verifyBaselineIntegrity(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/baselines/${encodeURIComponent(id)}/verify`,
        {
          method: "POST",
          signal: options?.signal,
        },
      );
      return parseJson<QepBaselineDto>(response);
    },

    async compareBaselines(
      input: CompareQepBaselinesInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/baselines/compare`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepBaselineCompareResult>(response);
    },

    async requirementBaselineHistory(
      requirementId: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(requirementId)}/baselines`,
        { signal: options?.signal },
      );
      return parseJson<readonly QepBaselineDto[]>(response);
    },

    /** Requirements Relationship operations — APZQEP-ENG-020F Part 3. */

    async listRelationships(
      params?: QepRelationshipListParams,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/relationships${buildRelationshipQuery(params)}`,
        {
          signal: options?.signal,
        },
      );
      return parseCollection<QepRelationshipDto>(response);
    },

    async getRelationship(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/relationships/${encodeURIComponent(id)}`,
        {
          signal: options?.signal,
        },
      );
      return parseJson<QepRelationshipDto>(response);
    },

    async createRelationship(
      input: CreateQepRelationshipClientInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/relationships`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepRelationshipDto>(response);
    },

    async updateRelationshipProfile(
      id: string,
      input: UpdateQepRelationshipProfileClientInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/relationships/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
          signal: options?.signal,
        },
      );
      return parseJson<QepRelationshipDto>(response);
    },

    async activateRelationship(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/relationships/${encodeURIComponent(id)}/activate`,
        {
          method: "POST",
          signal: options?.signal,
        },
      );
      return parseJson<QepRelationshipDto>(response);
    },

    async deprecateRelationship(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/relationships/${encodeURIComponent(id)}/deprecate`,
        {
          method: "POST",
          signal: options?.signal,
        },
      );
      return parseJson<QepRelationshipDto>(response);
    },

    async retireRelationship(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/relationships/${encodeURIComponent(id)}/retire`,
        {
          method: "POST",
          signal: options?.signal,
        },
      );
      return parseJson<QepRelationshipDto>(response);
    },

    async supersedeRelationship(
      input: SupersedeQepRelationshipClientInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/relationships/supersede`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<QepRelationshipDto>(response);
    },

    async updateRelationshipRationale(
      id: string,
      rationale: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/relationships/${encodeURIComponent(id)}/rationale`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ rationale }),
          signal: options?.signal,
        },
      );
      return parseJson<QepRelationshipDto>(response);
    },

    async updateRelationshipStrength(
      id: string,
      strength: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/relationships/${encodeURIComponent(id)}/strength`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ strength }),
          signal: options?.signal,
        },
      );
      return parseJson<QepRelationshipDto>(response);
    },

    async updateRelationshipClassification(
      id: string,
      classification: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/relationships/${encodeURIComponent(id)}/classification`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ classification }),
          signal: options?.signal,
        },
      );
      return parseJson<QepRelationshipDto>(response);
    },

    async updateRelationshipCriticality(
      id: string,
      criticality: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/relationships/${encodeURIComponent(id)}/criticality`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ criticality }),
          signal: options?.signal,
        },
      );
      return parseJson<QepRelationshipDto>(response);
    },

    async updateRelationshipScope(
      id: string,
      scope: { readonly kind: string; readonly referenceId?: string },
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/relationships/${encodeURIComponent(id)}/scope`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ scope }),
          signal: options?.signal,
        },
      );
      return parseJson<QepRelationshipDto>(response);
    },

    async listRelationshipTaxonomy(options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/relationships/taxonomy`, {
        signal: options?.signal,
      });
      return parseJson<readonly QepRelationshipTaxonomyDto[]>(response);
    },

    async listRelationshipsByRequirement(
      requirementId: string,
      direction?: "inbound" | "outbound" | "both",
      options?: QepClientRequestOptions,
    ) {
      const search = direction ? `?direction=${direction}` : "";
      const response = await fetch(
        `${basePath}/${encodeURIComponent(requirementId)}/relationships${search}`,
        { signal: options?.signal },
      );
      return parseJson<readonly QepRelationshipDto[]>(response);
    },

    async listRelationshipConflicts(options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/relationships/conflicts`, {
        signal: options?.signal,
      });
      return parseJson<readonly QepRelationshipDto[]>(response);
    },
  };
}

const defaultClient = createQepHttpClient();

export function listRequirements(
  params?: QepListParams,
  options?: QepClientRequestOptions,
) {
  return defaultClient.listRequirements(params, options);
}

export function searchRequirements(
  params: QepListParams & { q: string },
  options?: QepClientRequestOptions,
) {
  return defaultClient.searchRequirements(params, options);
}

export function getRequirement(id: string, options?: QepClientRequestOptions) {
  return defaultClient.getRequirement(id, options);
}

export function createRequirement(
  input: CreateQepRequirementInput,
  options?: QepClientRequestOptions,
) {
  return defaultClient.createRequirement(input, options);
}

export function updateRequirement(
  id: string,
  input: UpdateQepRequirementInput,
  options?: QepClientRequestOptions,
) {
  return defaultClient.updateRequirement(id, input, options);
}

export function archiveRequirement(id: string, options?: QepClientRequestOptions) {
  return defaultClient.archiveRequirement(id, options);
}

export function getAvailableTransitions(id: string, options?: QepClientRequestOptions) {
  return defaultClient.getAvailableTransitions(id, options);
}

export function transitionRequirement(
  id: string,
  input: QepRequirementTransitionInput,
  options?: QepClientRequestOptions,
) {
  return defaultClient.transitionRequirement(id, input, options);
}

export function getLifecycleHistory(id: string, options?: QepClientRequestOptions) {
  return defaultClient.getLifecycleHistory(id, options);
}

export function listContentVersions(
  id: string,
  params?: QepListParams,
  options?: QepClientRequestOptions,
) {
  return defaultClient.listContentVersions(id, params, options);
}

export function getContentVersion(
  id: string,
  versionNumber: number,
  options?: QepClientRequestOptions,
) {
  return defaultClient.getContentVersion(id, versionNumber, options);
}

export function compareContentVersions(
  id: string,
  input: { readonly baseVersionNumber: number; readonly targetVersionNumber: number },
  options?: QepClientRequestOptions,
) {
  return defaultClient.compareContentVersions(id, input, options);
}

export function verifyContentVersionIntegrity(
  id: string,
  versionNumber: number,
  options?: QepClientRequestOptions,
) {
  return defaultClient.verifyContentVersionIntegrity(id, versionNumber, options);
}

export function listBaselines(
  params?: QepBaselineListParams,
  options?: QepClientRequestOptions,
) {
  return defaultClient.listBaselines(params, options);
}

export function getBaseline(id: string, options?: QepClientRequestOptions) {
  return defaultClient.getBaseline(id, options);
}

export function createBaseline(
  input: CreateQepBaselineInput,
  options?: QepClientRequestOptions,
) {
  return defaultClient.createBaseline(input, options);
}

export function updateDraftBaseline(
  id: string,
  input: UpdateQepBaselineDraftInput,
  options?: QepClientRequestOptions,
) {
  return defaultClient.updateDraftBaseline(id, input, options);
}

export function listBaselineItems(id: string, options?: QepClientRequestOptions) {
  return defaultClient.listBaselineItems(id, options);
}

export function addBaselineItem(
  id: string,
  input: AddQepBaselineItemInput,
  options?: QepClientRequestOptions,
) {
  return defaultClient.addBaselineItem(id, input, options);
}

export function removeBaselineItem(
  id: string,
  contentVersionId: string,
  options?: QepClientRequestOptions,
) {
  return defaultClient.removeBaselineItem(id, contentVersionId, options);
}

export function lockBaseline(id: string, options?: QepClientRequestOptions) {
  return defaultClient.lockBaseline(id, options);
}

export function archiveBaseline(id: string, options?: QepClientRequestOptions) {
  return defaultClient.archiveBaseline(id, options);
}

export function verifyBaselineIntegrity(id: string, options?: QepClientRequestOptions) {
  return defaultClient.verifyBaselineIntegrity(id, options);
}

export function compareBaselines(
  input: CompareQepBaselinesInput,
  options?: QepClientRequestOptions,
) {
  return defaultClient.compareBaselines(input, options);
}

export function requirementBaselineHistory(
  requirementId: string,
  options?: QepClientRequestOptions,
) {
  return defaultClient.requirementBaselineHistory(requirementId, options);
}

export function listRelationships(
  params?: QepRelationshipListParams,
  options?: QepClientRequestOptions,
) {
  return defaultClient.listRelationships(params, options);
}

export function getRelationship(id: string, options?: QepClientRequestOptions) {
  return defaultClient.getRelationship(id, options);
}

export function createRelationship(
  input: CreateQepRelationshipClientInput,
  options?: QepClientRequestOptions,
) {
  return defaultClient.createRelationship(input, options);
}

export function updateRelationshipProfile(
  id: string,
  input: UpdateQepRelationshipProfileClientInput,
  options?: QepClientRequestOptions,
) {
  return defaultClient.updateRelationshipProfile(id, input, options);
}

export function activateRelationship(id: string, options?: QepClientRequestOptions) {
  return defaultClient.activateRelationship(id, options);
}

export function deprecateRelationship(id: string, options?: QepClientRequestOptions) {
  return defaultClient.deprecateRelationship(id, options);
}

export function retireRelationship(id: string, options?: QepClientRequestOptions) {
  return defaultClient.retireRelationship(id, options);
}

export function supersedeRelationship(
  input: SupersedeQepRelationshipClientInput,
  options?: QepClientRequestOptions,
) {
  return defaultClient.supersedeRelationship(input, options);
}

export function updateRelationshipRationale(
  id: string,
  rationale: string,
  options?: QepClientRequestOptions,
) {
  return defaultClient.updateRelationshipRationale(id, rationale, options);
}

export function updateRelationshipStrength(
  id: string,
  strength: string,
  options?: QepClientRequestOptions,
) {
  return defaultClient.updateRelationshipStrength(id, strength, options);
}

export function updateRelationshipClassification(
  id: string,
  classification: string,
  options?: QepClientRequestOptions,
) {
  return defaultClient.updateRelationshipClassification(id, classification, options);
}

export function updateRelationshipCriticality(
  id: string,
  criticality: string,
  options?: QepClientRequestOptions,
) {
  return defaultClient.updateRelationshipCriticality(id, criticality, options);
}

export function updateRelationshipScope(
  id: string,
  scope: { readonly kind: string; readonly referenceId?: string },
  options?: QepClientRequestOptions,
) {
  return defaultClient.updateRelationshipScope(id, scope, options);
}

export function listRelationshipTaxonomy(options?: QepClientRequestOptions) {
  return defaultClient.listRelationshipTaxonomy(options);
}

export function listRelationshipsByRequirement(
  requirementId: string,
  direction?: "inbound" | "outbound" | "both",
  options?: QepClientRequestOptions,
) {
  return defaultClient.listRelationshipsByRequirement(
    requirementId,
    direction,
    options,
  );
}

export function listRelationshipConflicts(options?: QepClientRequestOptions) {
  return defaultClient.listRelationshipConflicts(options);
}
