/** In-memory search persistence (APZSEARCH-002) — tests only. */

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
} from "../records";
import type {
  SearchAuditRepository,
  SearchCapabilitiesRepository,
  SearchCollectionRepository,
  SearchConfigurationRepository,
  SearchConfigurationVersionRepository,
  SearchDiagnosticsRepository,
  SearchHealthRepository,
  SearchMetadataRepository,
  SearchPersistenceBundle,
  SearchProfileRepository,
  SearchProviderRegistrationRepository,
  SearchProviderRepository,
  SearchProviderStatusRepository,
  SearchScopeRepository,
  SearchSessionRepository,
  SearchSourceRepository,
  SearchStatisticsRepository,
} from "../ports";
import {
  assertSameTenant,
  matchesOrganisation,
} from "../authorization";
import type { SearchRepositoryContext } from "../types";

export type SearchInMemoryStores = {
  providers: Map<string, SearchProviderRecord>;
  registrations: Map<string, SearchProviderRegistrationRecord>;
  statuses: Map<string, SearchProviderStatusRecord>;
  configurations: Map<string, SearchConfigurationRecord>;
  configurationVersions: Map<string, SearchConfigurationVersionRecord>;
  profiles: Map<string, SearchProfileRecord>;
  collections: Map<string, SearchCollectionRecord>;
  sources: Map<string, SearchSourceRecord>;
  scopes: Map<string, SearchScopeRecord>;
  metadata: Map<string, SearchMetadataRecord>;
  sessions: Map<string, SearchSessionRecord>;
  audits: Map<string, SearchAuditRecord>;
  diagnostics: Map<string, SearchDiagnosticsRecord>;
  health: Map<string, SearchHealthRecord>;
  statistics: Map<string, SearchStatisticsRecord>;
  capabilities: Map<string, SearchCapabilitiesRecord>;
};

export function createEmptySearchInMemoryStores(): SearchInMemoryStores {
  return {
    providers: new Map(),
    registrations: new Map(),
    statuses: new Map(),
    configurations: new Map(),
    configurationVersions: new Map(),
    profiles: new Map(),
    collections: new Map(),
    sources: new Map(),
    scopes: new Map(),
    metadata: new Map(),
    sessions: new Map(),
    audits: new Map(),
    diagnostics: new Map(),
    health: new Map(),
    statistics: new Map(),
    capabilities: new Map(),
  };
}

function key(tenantId: string, id: string): string {
  return `${tenantId}::${id}`;
}

function visible<T extends { tenantId: string; organisationId?: string; deletedAt?: string }>(
  ctx: SearchRepositoryContext,
  record: T | undefined,
): T | null {
  if (!record || record.deletedAt) return null;
  if (record.tenantId !== ctx.tenantId) return null;
  if (!matchesOrganisation(ctx, record.organisationId)) return null;
  return record;
}

function listVisible<T extends { tenantId: string; organisationId?: string; deletedAt?: string }>(
  ctx: SearchRepositoryContext,
  values: Iterable<T>,
): T[] {
  return [...values].filter((r) => visible(ctx, r) !== null);
}

export function createInMemorySearchPersistence(
  stores: SearchInMemoryStores = createEmptySearchInMemoryStores(),
): SearchPersistenceBundle {
  const providers: SearchProviderRepository = {
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      const next = { ...record, updatedAt: record.updatedAt };
      stores.providers.set(key(ctx.tenantId, record.id), next);
      return next;
    },
    async get(ctx, providerId) {
      return visible(ctx, stores.providers.get(key(ctx.tenantId, providerId)));
    },
    async list(ctx) {
      return listVisible(ctx, stores.providers.values());
    },
    async softDelete(ctx, providerId) {
      const existing = stores.providers.get(key(ctx.tenantId, providerId));
      if (!existing || existing.tenantId !== ctx.tenantId) return;
      stores.providers.set(key(ctx.tenantId, providerId), {
        ...existing,
        deletedAt: new Date().toISOString(),
        active: false,
        enabled: false,
        revision: existing.revision + 1,
        updatedAt: new Date().toISOString(),
      });
    },
    async clearActive(ctx) {
      for (const [k, record] of stores.providers) {
        if (record.tenantId !== ctx.tenantId || record.deletedAt) continue;
        if (!matchesOrganisation(ctx, record.organisationId)) continue;
        if (record.active) {
          stores.providers.set(k, {
            ...record,
            active: false,
            revision: record.revision + 1,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    },
    async setActive(ctx, providerId) {
      await providers.clearActive(ctx);
      const existing = await providers.get(ctx, providerId);
      if (!existing) throw new Error(`provider not found: ${providerId}`);
      const next = {
        ...existing,
        active: true,
        enabled: true,
        revision: existing.revision + 1,
        updatedAt: new Date().toISOString(),
      };
      stores.providers.set(key(ctx.tenantId, providerId), next);
      return next;
    },
  };

  const providerRegistrations: SearchProviderRegistrationRepository = {
    async create(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.registrations.set(key(ctx.tenantId, record.id), record);
      return record;
    },
    async markUnregistered(ctx, providerId, at) {
      for (const [k, record] of stores.registrations) {
        if (
          record.tenantId === ctx.tenantId &&
          record.providerId === providerId &&
          !record.unregisteredAt &&
          !record.deletedAt
        ) {
          stores.registrations.set(k, {
            ...record,
            unregisteredAt: at,
            revision: record.revision + 1,
            updatedAt: at,
          });
        }
      }
    },
    async list(ctx) {
      return listVisible(ctx, stores.registrations.values());
    },
  };

  const providerStatuses: SearchProviderStatusRepository = {
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.statuses.set(key(ctx.tenantId, record.providerId), record);
      return record;
    },
    async getByProvider(ctx, providerId) {
      return visible(
        ctx,
        stores.statuses.get(key(ctx.tenantId, providerId)),
      );
    },
  };

  const configurations: SearchConfigurationRepository = {
    async get(ctx, configurationId) {
      if (configurationId) {
        return visible(
          ctx,
          stores.configurations.get(key(ctx.tenantId, configurationId)),
        );
      }
      return configurations.getActive(ctx);
    },
    async getActive(ctx) {
      const rows = listVisible(ctx, stores.configurations.values()).filter(
        (r) => r.status === "active",
      );
      return rows[0] ?? null;
    },
    async list(ctx) {
      return listVisible(ctx, stores.configurations.values());
    },
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.configurations.set(key(ctx.tenantId, record.id), record);
      return record;
    },
    async softDelete(ctx, id) {
      const existing = stores.configurations.get(key(ctx.tenantId, id));
      if (!existing) return;
      stores.configurations.set(key(ctx.tenantId, id), {
        ...existing,
        status: "archived",
        deletedAt: new Date().toISOString(),
        revision: existing.revision + 1,
        updatedAt: new Date().toISOString(),
      });
    },
    async restore(ctx, id) {
      const existing = stores.configurations.get(key(ctx.tenantId, id));
      if (!existing) return null;
      const next = {
        ...existing,
        status: "draft" as const,
        deletedAt: undefined,
        revision: existing.revision + 1,
        updatedAt: new Date().toISOString(),
      };
      stores.configurations.set(key(ctx.tenantId, id), next);
      return next;
    },
  };

  const configurationVersions: SearchConfigurationVersionRepository = {
    async append(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.configurationVersions.set(key(ctx.tenantId, record.id), record);
      return record;
    },
    async list(ctx, configurationId) {
      return listVisible(ctx, stores.configurationVersions.values()).filter(
        (r) => r.configurationId === configurationId,
      );
    },
  };

  function softDeleteStore<T extends { revision: number; updatedAt: string; deletedAt?: string }>(
    map: Map<string, T>,
    ctx: SearchRepositoryContext,
    id: string,
  ): void {
    const existing = map.get(key(ctx.tenantId, id));
    if (!existing) return;
    map.set(key(ctx.tenantId, id), {
      ...existing,
      deletedAt: new Date().toISOString(),
      revision: existing.revision + 1,
      updatedAt: new Date().toISOString(),
    });
  }

  function restoreStore<T extends { revision: number; updatedAt: string; deletedAt?: string; tenantId: string; organisationId?: string }>(
    map: Map<string, T>,
    ctx: SearchRepositoryContext,
    id: string,
  ): T | null {
    const existing = map.get(key(ctx.tenantId, id));
    if (!existing || existing.tenantId !== ctx.tenantId) return null;
    if (!matchesOrganisation(ctx, existing.organisationId)) return null;
    const next = {
      ...existing,
      deletedAt: undefined,
      revision: existing.revision + 1,
      updatedAt: new Date().toISOString(),
    };
    map.set(key(ctx.tenantId, id), next);
    return next;
  }

  const profiles: SearchProfileRepository = {
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.profiles.set(key(ctx.tenantId, record.id), record);
      return record;
    },
    async get(ctx, id) {
      return visible(ctx, stores.profiles.get(key(ctx.tenantId, id)));
    },
    async list(ctx) {
      return listVisible(ctx, stores.profiles.values());
    },
    async softDelete(ctx, id) {
      softDeleteStore(stores.profiles, ctx, id);
    },
    async restore(ctx, id) {
      return restoreStore(stores.profiles, ctx, id);
    },
  };

  const collections: SearchCollectionRepository = {
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.collections.set(key(ctx.tenantId, record.id), {
        ...record,
        enabled: record.enabled ?? true,
      });
      return { ...record, enabled: record.enabled ?? true };
    },
    async get(ctx, id) {
      return visible(ctx, stores.collections.get(key(ctx.tenantId, id)));
    },
    async list(ctx) {
      return listVisible(ctx, stores.collections.values());
    },
    async softDelete(ctx, id) {
      softDeleteStore(stores.collections, ctx, id);
    },
    async restore(ctx, id) {
      return restoreStore(stores.collections, ctx, id);
    },
  };

  const sources: SearchSourceRepository = {
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      const next = { ...record, enabled: record.enabled ?? true };
      stores.sources.set(key(ctx.tenantId, record.id), next);
      return next;
    },
    async get(ctx, id) {
      return visible(ctx, stores.sources.get(key(ctx.tenantId, id)));
    },
    async list(ctx) {
      return listVisible(ctx, stores.sources.values());
    },
    async softDelete(ctx, id) {
      softDeleteStore(stores.sources, ctx, id);
    },
    async restore(ctx, id) {
      return restoreStore(stores.sources, ctx, id);
    },
  };

  const scopes: SearchScopeRepository = {
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.scopes.set(key(ctx.tenantId, record.id), record);
      return record;
    },
    async get(ctx, id) {
      return visible(ctx, stores.scopes.get(key(ctx.tenantId, id)));
    },
    async list(ctx) {
      return listVisible(ctx, stores.scopes.values());
    },
    async softDelete(ctx, id) {
      softDeleteStore(stores.scopes, ctx, id);
    },
    async restore(ctx, id) {
      return restoreStore(stores.scopes, ctx, id);
    },
  };

  const metadata: SearchMetadataRepository = {
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.metadata.set(key(ctx.tenantId, record.id), record);
      return record;
    },
    async get(ctx, id) {
      return visible(ctx, stores.metadata.get(key(ctx.tenantId, id)));
    },
    async list(ctx) {
      return listVisible(ctx, stores.metadata.values());
    },
    async softDelete(ctx, id) {
      softDeleteStore(stores.metadata, ctx, id);
    },
    async restore(ctx, id) {
      return restoreStore(stores.metadata, ctx, id);
    },
  };

  const sessions: SearchSessionRepository = {
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.sessions.set(key(ctx.tenantId, record.id), record);
      return record;
    },
    async get(ctx, id) {
      return visible(ctx, stores.sessions.get(key(ctx.tenantId, id)));
    },
    async softDelete(ctx, id) {
      softDeleteStore(stores.sessions, ctx, id);
    },
  };

  const audits: SearchAuditRepository = {
    async append(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.audits.set(key(ctx.tenantId, record.id), record);
      return record;
    },
    async list(ctx) {
      return listVisible(ctx, stores.audits.values());
    },
  };

  const diagnostics: SearchDiagnosticsRepository = {
    async append(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.diagnostics.set(key(ctx.tenantId, record.id), record);
      return record;
    },
    async latest(ctx) {
      const items = listVisible(ctx, stores.diagnostics.values()).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
      return items[0] ?? null;
    },
  };

  const health: SearchHealthRepository = {
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.health.set(key(ctx.tenantId, record.id), record);
      return record;
    },
    async latest(ctx) {
      const items = listVisible(ctx, stores.health.values()).sort((a, b) =>
        b.checkedAt.localeCompare(a.checkedAt),
      );
      return items[0] ?? null;
    },
  };

  const statistics: SearchStatisticsRepository = {
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.statistics.set(key(ctx.tenantId, "latest"), record);
      return record;
    },
    async latest(ctx) {
      return visible(ctx, stores.statistics.get(key(ctx.tenantId, "latest")));
    },
  };

  const capabilities: SearchCapabilitiesRepository = {
    async upsert(ctx, record) {
      assertSameTenant(ctx, record.tenantId);
      stores.capabilities.set(key(ctx.tenantId, record.providerId), record);
      return record;
    },
    async getByProvider(ctx, providerId) {
      return visible(
        ctx,
        stores.capabilities.get(key(ctx.tenantId, providerId)),
      );
    },
  };

  return {
    mode: "memory",
    providers,
    providerRegistrations,
    providerStatuses,
    configurations,
    configurationVersions,
    profiles,
    collections,
    sources,
    scopes,
    metadata,
    sessions,
    audits,
    diagnostics,
    health,
    statistics,
    capabilities,
  };
}
