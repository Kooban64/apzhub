/** Repository ports (APZSEARCH-002). */

import type {
  SearchAuditRecord,
  SearchCapabilitiesRecord,
  SearchCollectionRecord,
  SearchConfigurationRecord,
  SearchConfigurationVersionRecord,
  SearchDiagnosticsRecord,
  SearchHealthRecord,
  SearchMetadataRecord,
  SearchProfileRecord,
  SearchProviderRecord,
  SearchProviderRegistrationRecord,
  SearchProviderStatusRecord,
  SearchScopeRecord,
  SearchSessionRecord,
  SearchSourceRecord,
  SearchStatisticsRecord,
} from "./records";
import type { SearchRepositoryContext } from "./types";

export interface SearchProviderRepository {
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchProviderRecord,
  ): Promise<SearchProviderRecord>;
  get(
    ctx: SearchRepositoryContext,
    providerId: string,
  ): Promise<SearchProviderRecord | null>;
  list(ctx: SearchRepositoryContext): Promise<readonly SearchProviderRecord[]>;
  softDelete(ctx: SearchRepositoryContext, providerId: string): Promise<void>;
  clearActive(ctx: SearchRepositoryContext): Promise<void>;
  setActive(
    ctx: SearchRepositoryContext,
    providerId: string,
  ): Promise<SearchProviderRecord>;
}

export interface SearchProviderRegistrationRepository {
  create(
    ctx: SearchRepositoryContext,
    record: SearchProviderRegistrationRecord,
  ): Promise<SearchProviderRegistrationRecord>;
  markUnregistered(
    ctx: SearchRepositoryContext,
    providerId: string,
    at: string,
  ): Promise<void>;
  list(
    ctx: SearchRepositoryContext,
  ): Promise<readonly SearchProviderRegistrationRecord[]>;
}

export interface SearchProviderStatusRepository {
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchProviderStatusRecord,
  ): Promise<SearchProviderStatusRecord>;
  getByProvider(
    ctx: SearchRepositoryContext,
    providerId: string,
  ): Promise<SearchProviderStatusRecord | null>;
}

export interface SearchConfigurationRepository {
  get(
    ctx: SearchRepositoryContext,
    configurationId?: string,
  ): Promise<SearchConfigurationRecord | null>;
  getActive(
    ctx: SearchRepositoryContext,
  ): Promise<SearchConfigurationRecord | null>;
  list(
    ctx: SearchRepositoryContext,
  ): Promise<readonly SearchConfigurationRecord[]>;
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchConfigurationRecord,
  ): Promise<SearchConfigurationRecord>;
  softDelete(ctx: SearchRepositoryContext, id: string): Promise<void>;
  restore(ctx: SearchRepositoryContext, id: string): Promise<SearchConfigurationRecord | null>;
}

export interface SearchConfigurationVersionRepository {
  append(
    ctx: SearchRepositoryContext,
    record: SearchConfigurationVersionRecord,
  ): Promise<SearchConfigurationVersionRecord>;
  list(
    ctx: SearchRepositoryContext,
    configurationId: string,
  ): Promise<readonly SearchConfigurationVersionRecord[]>;
}

export interface SearchProfileRepository {
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchProfileRecord,
  ): Promise<SearchProfileRecord>;
  get(
    ctx: SearchRepositoryContext,
    id: string,
  ): Promise<SearchProfileRecord | null>;
  list(ctx: SearchRepositoryContext): Promise<readonly SearchProfileRecord[]>;
  softDelete(ctx: SearchRepositoryContext, id: string): Promise<void>;
  restore(
    ctx: SearchRepositoryContext,
    id: string,
  ): Promise<SearchProfileRecord | null>;
}

export interface SearchCollectionRepository {
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchCollectionRecord,
  ): Promise<SearchCollectionRecord>;
  get(
    ctx: SearchRepositoryContext,
    id: string,
  ): Promise<SearchCollectionRecord | null>;
  list(ctx: SearchRepositoryContext): Promise<readonly SearchCollectionRecord[]>;
  softDelete(ctx: SearchRepositoryContext, id: string): Promise<void>;
  restore(
    ctx: SearchRepositoryContext,
    id: string,
  ): Promise<SearchCollectionRecord | null>;
}

export interface SearchSourceRepository {
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchSourceRecord,
  ): Promise<SearchSourceRecord>;
  get(
    ctx: SearchRepositoryContext,
    id: string,
  ): Promise<SearchSourceRecord | null>;
  list(ctx: SearchRepositoryContext): Promise<readonly SearchSourceRecord[]>;
  softDelete(ctx: SearchRepositoryContext, id: string): Promise<void>;
  restore(
    ctx: SearchRepositoryContext,
    id: string,
  ): Promise<SearchSourceRecord | null>;
}

export interface SearchScopeRepository {
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchScopeRecord,
  ): Promise<SearchScopeRecord>;
  get(
    ctx: SearchRepositoryContext,
    id: string,
  ): Promise<SearchScopeRecord | null>;
  list(ctx: SearchRepositoryContext): Promise<readonly SearchScopeRecord[]>;
  softDelete(ctx: SearchRepositoryContext, id: string): Promise<void>;
  restore(
    ctx: SearchRepositoryContext,
    id: string,
  ): Promise<SearchScopeRecord | null>;
}

export interface SearchMetadataRepository {
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchMetadataRecord,
  ): Promise<SearchMetadataRecord>;
  get(
    ctx: SearchRepositoryContext,
    id: string,
  ): Promise<SearchMetadataRecord | null>;
  list(ctx: SearchRepositoryContext): Promise<readonly SearchMetadataRecord[]>;
  softDelete(ctx: SearchRepositoryContext, id: string): Promise<void>;
  restore(
    ctx: SearchRepositoryContext,
    id: string,
  ): Promise<SearchMetadataRecord | null>;
}

export interface SearchSessionRepository {
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchSessionRecord,
  ): Promise<SearchSessionRecord>;
  get(
    ctx: SearchRepositoryContext,
    id: string,
  ): Promise<SearchSessionRecord | null>;
  softDelete(ctx: SearchRepositoryContext, id: string): Promise<void>;
}

export interface SearchAuditRepository {
  append(
    ctx: SearchRepositoryContext,
    record: SearchAuditRecord,
  ): Promise<SearchAuditRecord>;
  list(ctx: SearchRepositoryContext): Promise<readonly SearchAuditRecord[]>;
}

export interface SearchDiagnosticsRepository {
  append(
    ctx: SearchRepositoryContext,
    record: SearchDiagnosticsRecord,
  ): Promise<SearchDiagnosticsRecord>;
  latest(
    ctx: SearchRepositoryContext,
  ): Promise<SearchDiagnosticsRecord | null>;
}

export interface SearchHealthRepository {
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchHealthRecord,
  ): Promise<SearchHealthRecord>;
  latest(ctx: SearchRepositoryContext): Promise<SearchHealthRecord | null>;
}

export interface SearchStatisticsRepository {
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchStatisticsRecord,
  ): Promise<SearchStatisticsRecord>;
  latest(ctx: SearchRepositoryContext): Promise<SearchStatisticsRecord | null>;
}

export interface SearchCapabilitiesRepository {
  upsert(
    ctx: SearchRepositoryContext,
    record: SearchCapabilitiesRecord,
  ): Promise<SearchCapabilitiesRecord>;
  getByProvider(
    ctx: SearchRepositoryContext,
    providerId: string,
  ): Promise<SearchCapabilitiesRecord | null>;
}

export type SearchPersistenceBundle = {
  readonly mode: "postgres" | "memory";
  readonly providers: SearchProviderRepository;
  readonly providerRegistrations: SearchProviderRegistrationRepository;
  readonly providerStatuses: SearchProviderStatusRepository;
  readonly configurations: SearchConfigurationRepository;
  readonly configurationVersions: SearchConfigurationVersionRepository;
  readonly profiles: SearchProfileRepository;
  readonly collections: SearchCollectionRepository;
  readonly sources: SearchSourceRepository;
  readonly scopes: SearchScopeRepository;
  readonly metadata: SearchMetadataRepository;
  readonly sessions: SearchSessionRepository;
  readonly audits: SearchAuditRepository;
  readonly diagnostics: SearchDiagnosticsRepository;
  readonly health: SearchHealthRepository;
  readonly statistics: SearchStatisticsRepository;
  readonly capabilities: SearchCapabilitiesRepository;
};
