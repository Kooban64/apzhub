/**
 * Canonical entity categories for APZHUB global IDs and entity mappings.
 * Constrained union — never free-form strings at the mapping boundary.
 */
export type CanonicalEntityType =
  | "workspace"
  | "project"
  | "task"
  | "sprint"
  | "milestone"
  | "label"
  | "status"
  | "module"
  | "member"
  | "team"
  | "user"
  | "support_request"
  | "support_organization"
  | "support_group"
  | "support_user"
  | "support_article";

/** Short opaque prefixes used in APZHUB global IDs (ADR-0048). */
export type GlobalIdPrefix =
  | "ws"
  | "proj"
  | "task"
  | "sprint"
  | "milestone"
  | "label"
  | "status"
  | "module"
  | "member"
  | "team"
  | "user"
  | "sreq"
  | "sorg"
  | "sgrp"
  | "suser"
  | "sart";

export const ENTITY_TYPE_TO_PREFIX: Readonly<Record<CanonicalEntityType, GlobalIdPrefix>> = {
  workspace: "ws",
  project: "proj",
  task: "task",
  sprint: "sprint",
  milestone: "milestone",
  label: "label",
  status: "status",
  module: "module",
  member: "member",
  team: "team",
  user: "user",
  support_request: "sreq",
  support_organization: "sorg",
  support_group: "sgrp",
  support_user: "suser",
  support_article: "sart",
};

export const PREFIX_TO_ENTITY_TYPE: Readonly<Record<GlobalIdPrefix, CanonicalEntityType>> = {
  ws: "workspace",
  proj: "project",
  task: "task",
  sprint: "sprint",
  milestone: "milestone",
  label: "label",
  status: "status",
  module: "module",
  member: "member",
  team: "team",
  user: "user",
  sreq: "support_request",
  sorg: "support_organization",
  sgrp: "support_group",
  suser: "support_user",
  sart: "support_article",
};

/** Mapping lifecycle status. */
export type EntityMappingStatus = "active" | "inactive" | "pending" | "orphaned";

/**
 * Persistent mapping between an APZHUB global entity ID and a provider-native ID.
 * Platform-owned metadata — never duplicates engine business data (011).
 */
export interface EntityMappingRecord {
  readonly platformId: string;
  readonly entityType: CanonicalEntityType;
  readonly providerId: string;
  readonly integrationId: string;
  readonly providerNativeId: string;
  readonly parentPlatformId?: string;
  readonly parentProviderNativeId?: string;
  readonly tenantId: string;
  /** Optional organisation scope when distinct from tenant (OSS-110-05 additive). */
  readonly organisationId?: string;
  readonly status: EntityMappingStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Readonly<Record<string, string>>;
  /** Optimistic concurrency revision — increments on every update. */
  readonly revision: number;
}

export interface CreateEntityMappingInput {
  readonly platformId: string;
  readonly entityType: CanonicalEntityType;
  readonly providerId: string;
  readonly integrationId: string;
  readonly providerNativeId: string;
  readonly parentPlatformId?: string;
  readonly parentProviderNativeId?: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly status?: EntityMappingStatus;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface UpdateEntityMappingInput {
  readonly status?: EntityMappingStatus;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly parentPlatformId?: string | null;
  readonly parentProviderNativeId?: string | null;
  readonly organisationId?: string | null;
  /** When provided, update fails if the stored revision does not match. */
  readonly expectedRevision?: number;
}

export interface ListEntityMappingsFilter {
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly entityType?: CanonicalEntityType;
  readonly providerId?: string;
  readonly integrationId?: string;
  readonly status?: EntityMappingStatus;
  readonly parentPlatformId?: string;
}

/** Optional scope for tenant/organisation isolation on single-record operations. */
export interface EntityMappingScope {
  readonly tenantId?: string;
  readonly organisationId?: string;
}
