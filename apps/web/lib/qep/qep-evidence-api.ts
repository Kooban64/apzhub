/**
 * QEP Evidence HTTP client (APZQEP-ENG-110F, OES-ENG-091A PART-04).
 *
 * Presentation-only — binds exclusively to `/api/v1/qep/evidence` DTOs and
 * `availableActions`. Never imports Domain/Application/Infrastructure directly.
 */

import type {
  EvidenceAccessCheckResult,
  EvidenceCollectionDto,
  EvidenceDto,
  EvidenceRelationshipDto,
  EvidenceSetDto,
} from "@apzhub/qep-evidence";
import type { EvidenceProvenanceResult } from "@apzhub/qep-evidence/application";
import type { EvidenceVersion } from "@apzhub/qep-evidence/domain";
import type { EvidenceAuditRecord } from "@apzhub/qep-evidence/domain";
import { EVIDENCE_API_ACTION_KEYS } from "@apzhub/qep-evidence/api";

export type QepEvidenceStatus =
  | "captured"
  | "validated"
  | "classified"
  | "associated"
  | "in_review"
  | "approved"
  | "rejected"
  | "quarantined"
  | "sealed"
  | "retained"
  | "archived"
  | "disposed";

export type QepEvidenceListParams = {
  readonly projectId?: string;
  readonly workspaceId?: string;
  readonly status?: QepEvidenceStatus;
  readonly classification?: string;
  readonly ownerId?: string;
  readonly legalHold?: boolean;
  /** Free-text search (same GET list route; ACL-filtered server-side). */
  readonly text?: string;
  readonly limit?: number;
  readonly offset?: number;
  /** Allowed: createdAt | updatedAt | title | id | status */
  readonly sort?: string;
  readonly order?: "asc" | "desc";
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

/**
 * Domain command names and REST `{action}` keys → `/actions/{slug}` segments
 * (OES-ENG-091A PART-04 §1.2).
 */
export const EVIDENCE_ACTION_SLUGS: Readonly<Record<string, string>> = {
  validate: "validate",
  validateEvidence: "validate",
  classify: "classify",
  classifyEvidence: "classify",
  requestReview: "requestReview",
  approve: "approve",
  approveEvidence: "approve",
  reject: "reject",
  rejectEvidence: "reject",
  quarantine: "quarantine",
  quarantineEvidence: "quarantine",
  seal: "seal",
  sealEvidence: "seal",
  replaceContent: "replaceContent",
  versionEvidence: "replaceContent",
  applyLegalHold: "applyLegalHold",
  releaseLegalHold: "releaseLegalHold",
  archive: "archive",
  archiveEvidence: "archive",
  dispose: "dispose",
  disposeEvidence: "dispose",
  updateMetadata: "updateMetadata",
  updateEvidenceMetadata: "updateMetadata",
};

export const EVIDENCE_LIFECYCLE_ACTIONS = new Set<string>([
  ...EVIDENCE_API_ACTION_KEYS,
  ...Object.keys(EVIDENCE_ACTION_SLUGS),
]);

export function resolveEvidenceActionSlug(action: string): string {
  return EVIDENCE_ACTION_SLUGS[action] ?? action;
}

export function isEvidenceLifecycleAction(action: string): boolean {
  const slug = resolveEvidenceActionSlug(action);
  return (EVIDENCE_API_ACTION_KEYS as readonly string[]).includes(slug);
}

export type CaptureQepEvidenceInput = {
  readonly id?: string;
  readonly projectId: string;
  readonly workspaceId?: string;
  readonly classification?: string;
  readonly sourceKind?: string;
  readonly mediaType: string;
  readonly contentBase64: string;
  readonly contentHash: string;
  readonly title?: string;
  readonly description?: string;
  readonly hashAlgorithm?: string;
  readonly byteSize?: number;
  readonly tags?: readonly string[];
};

export type PerformQepEvidenceActionInput = {
  readonly expectedRevision: number;
  readonly reason?: string;
  readonly classification?: string;
  readonly category?: string;
  readonly sensitivityLabel?: string;
  readonly title?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly confirm?: boolean;
};

export type AssociateQepEvidenceInput = {
  readonly expectedRevision: number;
  readonly targetCapability: string;
  readonly targetId: string;
  readonly relationType: string;
};

export type CheckQepEvidenceAccessInput = {
  readonly evidenceId: string;
  readonly action: string;
  readonly principalId?: string;
};

export type CreateQepEvidenceCollectionInput = {
  readonly id?: string;
  readonly projectId: string;
  readonly name: string;
  readonly purpose: string;
};

export type AddQepCollectionMemberInput = {
  readonly expectedRevision: number;
  readonly evidenceId: string;
};

export type SealQepEvidenceCollectionInput = {
  readonly expectedRevision: number;
  readonly sealHash: string;
  readonly setId?: string;
};

export type GrantQepEvidenceAccessInput = {
  readonly principalId: string;
  readonly action: string;
  readonly scope?: string;
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

function buildListQuery(params?: QepEvidenceListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.workspaceId) search.set("workspaceId", params.workspaceId);
  if (params.status) search.set("status", params.status);
  if (params.classification) search.set("classification", params.classification);
  if (params.ownerId) search.set("ownerId", params.ownerId);
  if (params.legalHold !== undefined) search.set("legalHold", String(params.legalHold));
  if (params.text) search.set("text", params.text);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
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

export function createQepEvidenceHttpClient(basePath = "/api/v1/qep/evidence") {
  return {
    async listEvidence(
      params?: QepEvidenceListParams,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}${buildListQuery(params)}`, {
        signal: options?.signal,
      });
      return parseCollection<EvidenceDto>(response);
    },

    async getEvidence(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}`, {
        signal: options?.signal,
      });
      return parseJson<EvidenceDto>(response);
    },

    async captureEvidence(
      input: CaptureQepEvidenceInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(basePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<EvidenceDto>(response);
    },

    async performEvidenceAction(
      id: string,
      actionSlug: string,
      body: PerformQepEvidenceActionInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<EvidenceDto>(
        `${basePath}/${encodeURIComponent(id)}/actions/${encodeURIComponent(actionSlug)}`,
        body,
        options,
      );
    },

    async downloadEvidence(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/content`, {
        signal: options?.signal,
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        const error = new Error(
          body.error?.message ?? `Download failed (${response.status})`,
        ) as Error & { status?: number };
        error.status = response.status;
        throw error;
      }
      const blob = await response.blob();
      const mediaType =
        response.headers.get("content-type") ?? "application/octet-stream";
      return { blob, mediaType };
    },

    async getRelationships(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/relationships`,
        { signal: options?.signal },
      );
      return parseJson<readonly EvidenceRelationshipDto[]>(response);
    },

    async associateEvidence(
      id: string,
      body: AssociateQepEvidenceInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<EvidenceDto>(
        `${basePath}/${encodeURIComponent(id)}/relationships`,
        body,
        options,
      );
    },

    async getProvenance(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/provenance`, {
        signal: options?.signal,
      });
      return parseJson<EvidenceProvenanceResult>(response);
    },

    async getAudit(
      id: string,
      params?: { limit?: number; offset?: number },
      options?: QepClientRequestOptions,
    ) {
      const search = new URLSearchParams();
      if (params?.limit !== undefined) search.set("limit", String(params.limit));
      if (params?.offset !== undefined) search.set("offset", String(params.offset));
      const qs = search.toString();
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/audit${qs ? `?${qs}` : ""}`,
        { signal: options?.signal },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(body.error?.message ?? `Request failed (${response.status})`);
      }
      const body = (await response.json()) as {
        data: readonly EvidenceAuditRecord[];
        page?: { total?: number; limit?: number; offset?: number };
      };
      return {
        items: body.data,
        total: body.page?.total,
        limit: body.page?.limit,
        offset: body.page?.offset,
      };
    },

    async getVersions(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/${encodeURIComponent(id)}/versions`, {
        signal: options?.signal,
      });
      return parseJson<readonly EvidenceVersion[]>(response);
    },

    async getAvailableActions(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(id)}/available-actions`,
        { signal: options?.signal },
      );
      return parseJson<readonly string[]>(response);
    },

    async checkAccess(
      input: CheckQepEvidenceAccessInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<EvidenceAccessCheckResult>(
        `${basePath}/access-checks`,
        input,
        options,
      );
    },

    async createCollection(
      input: CreateQepEvidenceCollectionInput,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(`${basePath}/collections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: options?.signal,
      });
      return parseJson<EvidenceCollectionDto>(response);
    },

    async getCollection(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(
        `${basePath}/collections/${encodeURIComponent(id)}`,
        { signal: options?.signal },
      );
      return parseJson<EvidenceCollectionDto>(response);
    },

    async addCollectionMember(
      collectionId: string,
      body: AddQepCollectionMemberInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<EvidenceCollectionDto>(
        `${basePath}/collections/${encodeURIComponent(collectionId)}/members`,
        body,
        options,
      );
    },

    async sealCollection(
      collectionId: string,
      body: SealQepEvidenceCollectionInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<EvidenceSetDto>(
        `${basePath}/collections/${encodeURIComponent(collectionId)}/seal`,
        body,
        options,
      );
    },

    async getSet(id: string, options?: QepClientRequestOptions) {
      const response = await fetch(`${basePath}/sets/${encodeURIComponent(id)}`, {
        signal: options?.signal,
      });
      return parseJson<EvidenceSetDto>(response);
    },

    async grantAccess(
      evidenceId: string,
      body: GrantQepEvidenceAccessInput,
      options?: QepClientRequestOptions,
    ) {
      return postAction<{ readonly id: string }>(
        `${basePath}/${encodeURIComponent(evidenceId)}/access-grants`,
        body,
        options,
      );
    },

    async revokeAccess(
      evidenceId: string,
      grantId: string,
      options?: QepClientRequestOptions,
    ) {
      const response = await fetch(
        `${basePath}/${encodeURIComponent(evidenceId)}/access-grants/${encodeURIComponent(grantId)}`,
        { method: "DELETE", signal: options?.signal },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(body.error?.message ?? `Request failed (${response.status})`);
      }
    },
  };
}

const defaultClient = createQepEvidenceHttpClient();

export const listEvidence = defaultClient.listEvidence.bind(defaultClient);
export const getEvidence = defaultClient.getEvidence.bind(defaultClient);
export const captureEvidence = defaultClient.captureEvidence.bind(defaultClient);
export const performEvidenceAction =
  defaultClient.performEvidenceAction.bind(defaultClient);
export const downloadEvidence = defaultClient.downloadEvidence.bind(defaultClient);
export const getEvidenceRelationships =
  defaultClient.getRelationships.bind(defaultClient);
export const associateEvidence = defaultClient.associateEvidence.bind(defaultClient);
export const getEvidenceProvenance = defaultClient.getProvenance.bind(defaultClient);
export const getEvidenceAudit = defaultClient.getAudit.bind(defaultClient);
export const getEvidenceVersions = defaultClient.getVersions.bind(defaultClient);
export const getEvidenceAvailableActions =
  defaultClient.getAvailableActions.bind(defaultClient);
export const checkEvidenceAccess = defaultClient.checkAccess.bind(defaultClient);
export const createEvidenceCollection =
  defaultClient.createCollection.bind(defaultClient);
export const getEvidenceCollection = defaultClient.getCollection.bind(defaultClient);
export const addEvidenceCollectionMember =
  defaultClient.addCollectionMember.bind(defaultClient);
export const sealEvidenceCollection = defaultClient.sealCollection.bind(defaultClient);
export const getEvidenceSet = defaultClient.getSet.bind(defaultClient);
export const grantEvidenceAccess = defaultClient.grantAccess.bind(defaultClient);
export const revokeEvidenceAccess = defaultClient.revokeAccess.bind(defaultClient);
