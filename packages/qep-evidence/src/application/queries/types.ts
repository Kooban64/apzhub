import type { EvidenceListFilter, PageRequest } from "../../domain/ports/repositories";

export type GetEvidenceQuery = {
  readonly kind: "getEvidence";
  readonly evidenceId: string;
};

export type ListEvidenceQuery = {
  readonly kind: "listEvidence";
  readonly filter?: EvidenceListFilter;
  readonly page?: PageRequest;
  /** Allowed: createdAt | updatedAt | title | id | status (default createdAt). */
  readonly sort?: string;
  readonly order?: "asc" | "desc";
};

export type SearchEvidenceQuery = {
  readonly kind: "searchEvidence";
  readonly filter?: EvidenceListFilter;
  readonly page?: PageRequest;
  /** Free-text structural filter against title/description/tags (no search index). */
  readonly text?: string;
  /** Allowed: createdAt | updatedAt | title | id | status (default createdAt). */
  readonly sort?: string;
  readonly order?: "asc" | "desc";
};

export type DownloadEvidenceQuery = {
  readonly kind: "downloadEvidence";
  readonly evidenceId: string;
};

export type GetRelationshipsQuery = {
  readonly kind: "getRelationships";
  readonly evidenceId?: string;
  readonly targetCapability?: string;
  readonly targetId?: string;
};

export type GetCollectionQuery = {
  readonly kind: "getCollection";
  readonly collectionId: string;
};

export type GetEvidenceSetQuery = {
  readonly kind: "getEvidenceSet";
  readonly setId: string;
};

export type GetAuditQuery = {
  readonly kind: "getAudit";
  readonly evidenceId: string;
  readonly page?: PageRequest;
};

export type GetProvenanceQuery = {
  readonly kind: "getProvenance";
  readonly evidenceId: string;
};

export type CheckEvidenceAccessQuery = {
  readonly kind: "checkEvidenceAccess";
  readonly evidenceId: string;
  readonly principalId: string;
  readonly action: string;
};

export type GetAvailableActionsQuery = {
  readonly kind: "getAvailableActions";
  readonly evidenceId: string;
};

export type GetVersionsQuery = {
  readonly kind: "getVersions";
  readonly evidenceId: string;
};

export type EvidenceReadQuery =
  | GetEvidenceQuery
  | ListEvidenceQuery
  | SearchEvidenceQuery
  | DownloadEvidenceQuery
  | GetRelationshipsQuery
  | GetCollectionQuery
  | GetEvidenceSetQuery
  | GetAuditQuery
  | GetProvenanceQuery
  | CheckEvidenceAccessQuery
  | GetAvailableActionsQuery
  | GetVersionsQuery;
