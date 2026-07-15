/** Persisted search metadata records (APZSEARCH-002). */

import type {
  SearchCapabilities,
  SearchConfiguration,
  SearchProviderConfiguration,
  SearchProviderKind,
  SearchProviderStatusState,
  SearchScope,
  SearchProductId,
} from "@apzhub/search-contracts";

import type { SoftDeletable } from "./types";

export type SearchProviderRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly kind: SearchProviderKind;
  readonly label: string;
  readonly version: string;
  readonly enabled: boolean;
  readonly active: boolean;
  readonly ownership: "platform" | "tenant" | "organisation";
  readonly capabilities: SearchCapabilities;
  readonly configuration: SearchProviderConfiguration;
};

export type SearchProviderRegistrationRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly providerId: string;
  readonly kind: SearchProviderKind;
  readonly label: string;
  readonly version: string;
  readonly registeredAt: string;
  readonly unregisteredAt?: string;
  readonly registeredBy: string;
};

export type SearchProviderStatusRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly providerId: string;
  readonly status: SearchProviderStatusState;
  readonly message?: string;
  readonly checkedAt: string;
};

export type SearchConfigurationRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly label?: string;
  readonly status: "draft" | "active" | "archived";
  readonly configuration: SearchConfiguration;
  readonly currentVersion: number;
};

export type SearchConfigurationVersionRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly configurationId: string;
  readonly version: number;
  readonly snapshot: SearchConfiguration;
  readonly changedBy: string;
  readonly changeReason?: string;
};

export type SearchProfileRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly name: string;
  readonly defaultScopes: readonly SearchScope[];
  readonly defaultCollections: readonly string[];
  readonly defaultSorts: readonly { field: string; direction: "asc" | "desc" }[];
};

export type SearchCollectionRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly name: string;
  readonly scope: SearchScope;
  readonly productIds: readonly SearchProductId[];
  readonly enabled: boolean;
};

export type SearchSourceRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly productId: SearchProductId;
  readonly label: string;
  readonly entityTypes: readonly string[];
  readonly enabled: boolean;
  readonly providerId?: string;
  readonly collectionId?: string;
};

export type SearchScopeRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly scope: SearchScope;
  readonly label: string;
  readonly description?: string;
  readonly enabled: boolean;
  readonly metadata: Readonly<Record<string, string>>;
};

export type SearchMetadataRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly title: string;
  readonly description?: string;
  readonly keywords: readonly string[];
  readonly productId: SearchProductId;
  readonly sourceId: string;
  readonly classification?: string;
  readonly permissions: readonly string[];
  readonly ownerUserId?: string;
  readonly status?: string;
  readonly entityVersion?: string;
  readonly navigationTarget?: string;
  readonly custom: Readonly<Record<string, string>>;
};

export type SearchSessionRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly actorUserId: string;
  readonly lastQueryAt?: string;
};

export type SearchAuditRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly correlationId?: string;
  readonly detail: Readonly<Record<string, string>>;
};

export type SearchDiagnosticsRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly providerId?: string;
  readonly snapshot: Readonly<Record<string, unknown>>;
};

export type SearchHealthRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly providerId?: string;
  readonly status: SearchProviderStatusState;
  readonly message?: string;
  readonly checkedAt: string;
};

export type SearchStatisticsRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly declaredIndexCount: number;
  readonly declaredProviderCount: number;
  readonly declaredCollectionCount: number;
  readonly declaredSourceCount: number;
  readonly capturedAt: string;
};

export type SearchCapabilitiesRecord = SoftDeletable & {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly providerId: string;
  readonly capabilities: SearchCapabilities;
};
