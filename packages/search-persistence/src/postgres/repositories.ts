/**
 * PostgreSQL search persistence (APZSEARCH-002).
 * Metadata only — no index content, no result cache.
 */

import {
  platformSearchAudit,
  platformSearchCapabilities,
  platformSearchCollection,
  platformSearchConfiguration,
  platformSearchConfigurationVersion,
  platformSearchDiagnostics,
  platformSearchHealth,
  platformSearchMetadata,
  platformSearchProfile,
  platformSearchProvider,
  platformSearchProviderRegistration,
  platformSearchProviderStatus,
  platformSearchScope,
  platformSearchSession,
  platformSearchSource,
  platformSearchStatistics,
  type DatabaseExecutor,
} from "@apzhub/config";
import type {
  SearchCapabilities,
  SearchConfiguration,
  SearchProviderConfiguration,
  SearchProviderKind,
  SearchProviderStatusState,
  SearchScope,
  SearchProductId,
} from "@apzhub/search-contracts";
import { and, desc, eq, isNull } from "drizzle-orm";

import { assertSameTenant, matchesOrganisation } from "../authorization";
import type { SearchPersistenceBundle } from "../ports";
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
import type { SearchRepositoryContext } from "../types";

function nowDate(): Date {
  return new Date();
}

function iso(d: Date | string | null | undefined): string | undefined {
  if (!d) return undefined;
  return d instanceof Date ? d.toISOString() : d;
}

function requireIso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : d;
}

function orgFilter(
  ctx: SearchRepositoryContext,
  organisationId: string | null | undefined,
): boolean {
  return matchesOrganisation(ctx, organisationId ?? undefined);
}

function asCapabilities(value: unknown): SearchCapabilities {
  const v = (value ?? {}) as Record<string, unknown>;
  return {
    keywords: Boolean(v.keywords ?? true),
    phrases: Boolean(v.phrases ?? true),
    filters: Boolean(v.filters ?? true),
    sorting: Boolean(v.sorting ?? true),
    pagination: Boolean(v.pagination ?? true),
    facets: Boolean(v.facets ?? true),
    highlighting: Boolean(v.highlighting ?? true),
    suggestions: Boolean(v.suggestions ?? true),
    semantic: false,
    vector: false,
    fuzzy: false,
  };
}

function asConfiguration(row: {
  defaultPageSize: number;
  maxPageSize: number;
  maxKeywordLength: number;
  allowedProviderKindsJson: string[] | null;
}): SearchConfiguration {
  return {
    defaultPageSize: row.defaultPageSize,
    maxPageSize: row.maxPageSize,
    maxKeywordLength: row.maxKeywordLength,
    allowedProviderKinds: (row.allowedProviderKindsJson ??
      []) as SearchConfiguration["allowedProviderKinds"],
    enforceTenantIsolation: true,
    enforceOrganisationIsolation: true,
    enforcePermissionFilter: true,
  };
}

export function createPostgresSearchPersistence(
  db: DatabaseExecutor,
): SearchPersistenceBundle {
  const providers = {
    async upsert(ctx: SearchRepositoryContext, record: SearchProviderRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db
        .insert(platformSearchProvider)
        .values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          kind: record.kind,
          label: record.label,
          version: record.version,
          enabled: record.enabled,
          active: record.active,
          ownership: record.ownership ?? "tenant",
          capabilitiesJson: { ...record.capabilities },
          configurationJson: { ...record.configuration },
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: record.deletedAt ? new Date(record.deletedAt) : null,
          revision: record.revision,
        })
        .onConflictDoUpdate({
          target: platformSearchProvider.id,
          set: {
            label: record.label,
            version: record.version,
            enabled: record.enabled,
            active: record.active,
            ownership: record.ownership ?? "tenant",
            capabilitiesJson: { ...record.capabilities },
            configurationJson: { ...record.configuration },
            updatedAt: new Date(record.updatedAt),
            deletedAt: record.deletedAt ? new Date(record.deletedAt) : null,
            revision: record.revision,
          },
        });
      return record;
    },
    async get(ctx: SearchRepositoryContext, providerId: string) {
      const rows = await db
        .select()
        .from(platformSearchProvider)
        .where(
          and(
            eq(platformSearchProvider.tenantId, ctx.tenantId),
            eq(platformSearchProvider.id, providerId),
            isNull(platformSearchProvider.deletedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        kind: row.kind as SearchProviderKind,
        label: row.label,
        version: row.version,
        enabled: row.enabled,
        active: row.active,
        ownership: (row.ownership as SearchProviderRecord["ownership"]) ?? "tenant",
        capabilities: asCapabilities(row.capabilitiesJson),
        configuration: row.configurationJson as unknown as SearchProviderConfiguration,
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchProviderRecord;
    },
    async list(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchProvider)
        .where(
          and(
            eq(platformSearchProvider.tenantId, ctx.tenantId),
            isNull(platformSearchProvider.deletedAt),
          ),
        );
      return rows
        .filter((row) => orgFilter(ctx, row.organisationId))
        .map(
          (row) =>
            ({
              id: row.id,
              tenantId: row.tenantId,
              organisationId: row.organisationId ?? undefined,
              kind: row.kind as SearchProviderKind,
              label: row.label,
              version: row.version,
              enabled: row.enabled,
              active: row.active,
              ownership:
                (row.ownership as SearchProviderRecord["ownership"]) ?? "tenant",
              capabilities: asCapabilities(row.capabilitiesJson),
              configuration:
                row.configurationJson as unknown as SearchProviderConfiguration,
              createdAt: requireIso(row.createdAt),
              updatedAt: requireIso(row.updatedAt),
              deletedAt: iso(row.deletedAt),
              revision: row.revision,
            }) satisfies SearchProviderRecord,
        );
    },
    async softDelete(ctx: SearchRepositoryContext, providerId: string) {
      const existing = await providers.get(ctx, providerId);
      if (!existing) return;
      await db
        .update(platformSearchProvider)
        .set({
          deletedAt: nowDate(),
          active: false,
          enabled: false,
          revision: existing.revision + 1,
          updatedAt: nowDate(),
        })
        .where(
          and(
            eq(platformSearchProvider.tenantId, ctx.tenantId),
            eq(platformSearchProvider.id, providerId),
          ),
        );
    },
    async clearActive(ctx: SearchRepositoryContext) {
      await db
        .update(platformSearchProvider)
        .set({ active: false, updatedAt: nowDate() })
        .where(
          and(
            eq(platformSearchProvider.tenantId, ctx.tenantId),
            isNull(platformSearchProvider.deletedAt),
          ),
        );
    },
    async setActive(ctx: SearchRepositoryContext, providerId: string) {
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
      return providers.upsert(ctx, next);
    },
  };

  const providerRegistrations = {
    async create(
      ctx: SearchRepositoryContext,
      record: SearchProviderRegistrationRecord,
    ) {
      assertSameTenant(ctx, record.tenantId);
      await db.insert(platformSearchProviderRegistration).values({
        id: record.id,
        tenantId: record.tenantId,
        organisationId: record.organisationId ?? null,
        providerId: record.providerId,
        kind: record.kind,
        label: record.label,
        version: record.version,
        registeredAt: new Date(record.registeredAt),
        unregisteredAt: record.unregisteredAt ? new Date(record.unregisteredAt) : null,
        registeredBy: record.registeredBy,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        deletedAt: null,
        revision: record.revision,
      });
      return record;
    },
    async markUnregistered(
      ctx: SearchRepositoryContext,
      providerId: string,
      at: string,
    ) {
      await db
        .update(platformSearchProviderRegistration)
        .set({
          unregisteredAt: new Date(at),
          updatedAt: new Date(at),
        })
        .where(
          and(
            eq(platformSearchProviderRegistration.tenantId, ctx.tenantId),
            eq(platformSearchProviderRegistration.providerId, providerId),
            isNull(platformSearchProviderRegistration.unregisteredAt),
            isNull(platformSearchProviderRegistration.deletedAt),
          ),
        );
    },
    async list(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchProviderRegistration)
        .where(
          and(
            eq(platformSearchProviderRegistration.tenantId, ctx.tenantId),
            isNull(platformSearchProviderRegistration.deletedAt),
          ),
        );
      return rows
        .filter((row) => orgFilter(ctx, row.organisationId))
        .map(
          (row) =>
            ({
              id: row.id,
              tenantId: row.tenantId,
              organisationId: row.organisationId ?? undefined,
              providerId: row.providerId,
              kind: row.kind as SearchProviderKind,
              label: row.label,
              version: row.version,
              registeredAt: requireIso(row.registeredAt),
              unregisteredAt: iso(row.unregisteredAt),
              registeredBy: row.registeredBy,
              createdAt: requireIso(row.createdAt),
              updatedAt: requireIso(row.updatedAt),
              deletedAt: iso(row.deletedAt),
              revision: row.revision,
            }) satisfies SearchProviderRegistrationRecord,
        );
    },
  };

  const providerStatuses = {
    async upsert(ctx: SearchRepositoryContext, record: SearchProviderStatusRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db
        .insert(platformSearchProviderStatus)
        .values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          providerId: record.providerId,
          status: record.status,
          message: record.message ?? null,
          checkedAt: new Date(record.checkedAt),
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: null,
          revision: record.revision,
        })
        .onConflictDoUpdate({
          target: platformSearchProviderStatus.id,
          set: {
            status: record.status,
            message: record.message ?? null,
            checkedAt: new Date(record.checkedAt),
            updatedAt: new Date(record.updatedAt),
            revision: record.revision,
          },
        });
      return record;
    },
    async getByProvider(ctx: SearchRepositoryContext, providerId: string) {
      const rows = await db
        .select()
        .from(platformSearchProviderStatus)
        .where(
          and(
            eq(platformSearchProviderStatus.tenantId, ctx.tenantId),
            eq(platformSearchProviderStatus.providerId, providerId),
            isNull(platformSearchProviderStatus.deletedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        providerId: row.providerId,
        status: row.status as SearchProviderStatusState,
        message: row.message ?? undefined,
        checkedAt: requireIso(row.checkedAt),
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchProviderStatusRecord;
    },
  };

  const configurations = {
    mapRow(
      row: typeof platformSearchConfiguration.$inferSelect,
    ): SearchConfigurationRecord {
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        label: row.label ?? undefined,
        status: (row.status as SearchConfigurationRecord["status"]) ?? "active",
        configuration: asConfiguration(row),
        currentVersion: row.currentVersion,
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      };
    },
    async get(ctx: SearchRepositoryContext, configurationId?: string) {
      if (!configurationId) {
        return configurations.getActive(ctx);
      }
      const rows = await db
        .select()
        .from(platformSearchConfiguration)
        .where(
          and(
            eq(platformSearchConfiguration.tenantId, ctx.tenantId),
            eq(platformSearchConfiguration.id, configurationId),
            isNull(platformSearchConfiguration.deletedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return configurations.mapRow(row);
    },
    async getActive(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchConfiguration)
        .where(
          and(
            eq(platformSearchConfiguration.tenantId, ctx.tenantId),
            eq(platformSearchConfiguration.status, "active"),
            isNull(platformSearchConfiguration.deletedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) {
        // Fall back to any non-archived configuration
        const any = await db
          .select()
          .from(platformSearchConfiguration)
          .where(
            and(
              eq(platformSearchConfiguration.tenantId, ctx.tenantId),
              isNull(platformSearchConfiguration.deletedAt),
            ),
          )
          .limit(1);
        const fallback = any[0];
        if (!fallback || !orgFilter(ctx, fallback.organisationId)) return null;
        return configurations.mapRow(fallback);
      }
      return configurations.mapRow(row);
    },
    async list(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchConfiguration)
        .where(
          and(
            eq(platformSearchConfiguration.tenantId, ctx.tenantId),
            isNull(platformSearchConfiguration.deletedAt),
          ),
        );
      return rows
        .filter((row) => orgFilter(ctx, row.organisationId))
        .map((row) => configurations.mapRow(row));
    },
    async upsert(ctx: SearchRepositoryContext, record: SearchConfigurationRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db
        .insert(platformSearchConfiguration)
        .values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          label: record.label ?? null,
          status: record.status,
          defaultPageSize: record.configuration.defaultPageSize,
          maxPageSize: record.configuration.maxPageSize,
          maxKeywordLength: record.configuration.maxKeywordLength,
          allowedProviderKindsJson: [...record.configuration.allowedProviderKinds],
          enforceTenantIsolation: true,
          enforceOrganisationIsolation: true,
          enforcePermissionFilter: true,
          currentVersion: record.currentVersion,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: record.deletedAt ? new Date(record.deletedAt) : null,
          revision: record.revision,
        })
        .onConflictDoUpdate({
          target: platformSearchConfiguration.id,
          set: {
            label: record.label ?? null,
            status: record.status,
            defaultPageSize: record.configuration.defaultPageSize,
            maxPageSize: record.configuration.maxPageSize,
            maxKeywordLength: record.configuration.maxKeywordLength,
            allowedProviderKindsJson: [...record.configuration.allowedProviderKinds],
            currentVersion: record.currentVersion,
            updatedAt: new Date(record.updatedAt),
            deletedAt: record.deletedAt ? new Date(record.deletedAt) : null,
            revision: record.revision,
          },
        });
      return record;
    },
    async softDelete(ctx: SearchRepositoryContext, id: string) {
      const existing = await configurations.get(ctx, id);
      if (!existing) return;
      await db
        .update(platformSearchConfiguration)
        .set({
          status: "archived",
          deletedAt: nowDate(),
          updatedAt: nowDate(),
          revision: existing.revision + 1,
        })
        .where(
          and(
            eq(platformSearchConfiguration.tenantId, ctx.tenantId),
            eq(platformSearchConfiguration.id, id),
          ),
        );
    },
    async restore(ctx: SearchRepositoryContext, id: string) {
      const rows = await db
        .select()
        .from(platformSearchConfiguration)
        .where(
          and(
            eq(platformSearchConfiguration.tenantId, ctx.tenantId),
            eq(platformSearchConfiguration.id, id),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      const next: SearchConfigurationRecord = {
        ...configurations.mapRow(row),
        status: "draft",
        deletedAt: undefined,
        revision: row.revision + 1,
        updatedAt: new Date().toISOString(),
      };
      return configurations.upsert(ctx, next);
    },
  };

  const configurationVersions = {
    async append(
      ctx: SearchRepositoryContext,
      record: SearchConfigurationVersionRecord,
    ) {
      assertSameTenant(ctx, record.tenantId);
      await db.insert(platformSearchConfigurationVersion).values({
        id: record.id,
        tenantId: record.tenantId,
        organisationId: record.organisationId ?? null,
        configurationId: record.configurationId,
        version: record.version,
        snapshotJson: { ...record.snapshot },
        changedBy: record.changedBy,
        changeReason: record.changeReason ?? null,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        deletedAt: null,
        revision: record.revision,
      });
      return record;
    },
    async list(ctx: SearchRepositoryContext, configurationId: string) {
      const rows = await db
        .select()
        .from(platformSearchConfigurationVersion)
        .where(
          and(
            eq(platformSearchConfigurationVersion.tenantId, ctx.tenantId),
            eq(platformSearchConfigurationVersion.configurationId, configurationId),
            isNull(platformSearchConfigurationVersion.deletedAt),
          ),
        );
      return rows
        .filter((row) => orgFilter(ctx, row.organisationId))
        .map(
          (row) =>
            ({
              id: row.id,
              tenantId: row.tenantId,
              organisationId: row.organisationId ?? undefined,
              configurationId: row.configurationId,
              version: row.version,
              snapshot: row.snapshotJson as unknown as SearchConfiguration,
              changedBy: row.changedBy,
              changeReason: row.changeReason ?? undefined,
              createdAt: requireIso(row.createdAt),
              updatedAt: requireIso(row.updatedAt),
              deletedAt: iso(row.deletedAt),
              revision: row.revision,
            }) satisfies SearchConfigurationVersionRecord,
        );
    },
  };

  async function softDeleteById(
    table:
      | typeof platformSearchProfile
      | typeof platformSearchCollection
      | typeof platformSearchSource
      | typeof platformSearchScope
      | typeof platformSearchMetadata
      | typeof platformSearchSession,
    ctx: SearchRepositoryContext,
    id: string,
  ) {
    await db
      .update(table)
      .set({ deletedAt: nowDate(), updatedAt: nowDate() })
      .where(and(eq(table.tenantId, ctx.tenantId), eq(table.id, id)));
  }

  async function restoreById<T>(
    table:
      | typeof platformSearchProfile
      | typeof platformSearchCollection
      | typeof platformSearchSource
      | typeof platformSearchScope
      | typeof platformSearchMetadata
      | typeof platformSearchSession,
    ctx: SearchRepositoryContext,
    id: string,
    map: (row: {
      id: string;
      tenantId: string;
      organisationId: string | null;
      revision: number;
      createdAt: Date | string;
      updatedAt: Date | string;
      deletedAt: Date | string | null;
      name?: string;
      scope?: SearchScope;
      label?: string;
      description?: string | null;
      enabled?: boolean;
      productId?: SearchProductId;
      productIdsJson?: SearchProductId[] | null;
      entityTypesJson?: string[] | null;
      providerId?: string | null;
      collectionId?: string | null;
      entityType?: string;
      entityId?: string;
      title?: string;
      keywordsJson?: string[] | null;
      sourceId?: string;
      classification?: string | null;
      permissionsJson?: string[] | null;
      ownerUserId?: string | null;
      status?: string | null;
      entityVersion?: string | null;
      navigationTarget?: string | null;
      customJson?: Record<string, string> | null;
      metadataJson?: Record<string, string> | null;
      defaultScopesJson?: SearchScope[] | null;
      defaultCollectionsJson?: string[] | null;
      defaultSortsJson?: SearchProfileRecord["defaultSorts"] | null;
      actorUserId?: string;
      lastQueryAt?: Date | string | null;
    }) => T,
  ): Promise<T | null> {
    const rows = await db
      .select()
      .from(table)
      .where(and(eq(table.tenantId, ctx.tenantId), eq(table.id, id)))
      .limit(1);
    const row = rows[0];
    if (!row || !orgFilter(ctx, row.organisationId)) return null;
    await db
      .update(table)
      .set({ deletedAt: null, updatedAt: nowDate(), revision: row.revision + 1 })
      .where(and(eq(table.tenantId, ctx.tenantId), eq(table.id, id)));
    return map(row as Parameters<typeof map>[0]);
  }

  const profiles = {
    async upsert(ctx: SearchRepositoryContext, record: SearchProfileRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db
        .insert(platformSearchProfile)
        .values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          name: record.name,
          defaultScopesJson: [...record.defaultScopes],
          defaultCollectionsJson: [...record.defaultCollections],
          defaultSortsJson: record.defaultSorts.map((s) => ({ ...s })),
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: null,
          revision: record.revision,
        })
        .onConflictDoUpdate({
          target: platformSearchProfile.id,
          set: {
            name: record.name,
            defaultScopesJson: [...record.defaultScopes],
            defaultCollectionsJson: [...record.defaultCollections],
            defaultSortsJson: record.defaultSorts.map((s) => ({ ...s })),
            updatedAt: new Date(record.updatedAt),
            revision: record.revision,
          },
        });
      return record;
    },
    async get(ctx: SearchRepositoryContext, id: string) {
      const rows = await db
        .select()
        .from(platformSearchProfile)
        .where(
          and(
            eq(platformSearchProfile.tenantId, ctx.tenantId),
            eq(platformSearchProfile.id, id),
            isNull(platformSearchProfile.deletedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        name: row.name,
        defaultScopes: (row.defaultScopesJson ?? []) as SearchScope[],
        defaultCollections: row.defaultCollectionsJson ?? [],
        defaultSorts: (row.defaultSortsJson ??
          []) as unknown as SearchProfileRecord["defaultSorts"],
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchProfileRecord;
    },
    async list(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchProfile)
        .where(
          and(
            eq(platformSearchProfile.tenantId, ctx.tenantId),
            isNull(platformSearchProfile.deletedAt),
          ),
        );
      return rows
        .filter((row) => orgFilter(ctx, row.organisationId))
        .map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          organisationId: row.organisationId ?? undefined,
          name: row.name,
          defaultScopes: (row.defaultScopesJson ?? []) as SearchScope[],
          defaultCollections: row.defaultCollectionsJson ?? [],
          defaultSorts: (row.defaultSortsJson ??
            []) as unknown as SearchProfileRecord["defaultSorts"],
          createdAt: requireIso(row.createdAt),
          updatedAt: requireIso(row.updatedAt),
          deletedAt: iso(row.deletedAt),
          revision: row.revision,
        }));
    },
    async softDelete(ctx: SearchRepositoryContext, id: string) {
      await softDeleteById(platformSearchProfile, ctx, id);
    },
    async restore(ctx: SearchRepositoryContext, id: string) {
      return restoreById(platformSearchProfile, ctx, id, (row) => ({
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        name: row.name ?? "",
        defaultScopes: (row.defaultScopesJson ?? []) as SearchScope[],
        defaultCollections: row.defaultCollectionsJson ?? [],
        defaultSorts: (row.defaultSortsJson ??
          []) as SearchProfileRecord["defaultSorts"],
        createdAt: requireIso(row.createdAt),
        updatedAt: new Date().toISOString(),
        revision: row.revision + 1,
      }));
    },
  };

  const collections = {
    async upsert(ctx: SearchRepositoryContext, record: SearchCollectionRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db
        .insert(platformSearchCollection)
        .values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          name: record.name,
          scope: record.scope,
          productIdsJson: [...record.productIds],
          enabled: record.enabled ?? true,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: null,
          revision: record.revision,
        })
        .onConflictDoUpdate({
          target: platformSearchCollection.id,
          set: {
            name: record.name,
            scope: record.scope,
            productIdsJson: [...record.productIds],
            enabled: record.enabled ?? true,
            updatedAt: new Date(record.updatedAt),
            revision: record.revision,
            deletedAt: null,
          },
        });
      return { ...record, enabled: record.enabled ?? true };
    },
    async get(ctx: SearchRepositoryContext, id: string) {
      const rows = await db
        .select()
        .from(platformSearchCollection)
        .where(
          and(
            eq(platformSearchCollection.tenantId, ctx.tenantId),
            eq(platformSearchCollection.id, id),
            isNull(platformSearchCollection.deletedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        name: row.name,
        scope: row.scope as SearchScope,
        productIds: (row.productIdsJson ?? []) as SearchProductId[],
        enabled: row.enabled ?? true,
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchCollectionRecord;
    },
    async list(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchCollection)
        .where(
          and(
            eq(platformSearchCollection.tenantId, ctx.tenantId),
            isNull(platformSearchCollection.deletedAt),
          ),
        );
      return rows
        .filter((row) => orgFilter(ctx, row.organisationId))
        .map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          organisationId: row.organisationId ?? undefined,
          name: row.name,
          scope: row.scope as SearchScope,
          productIds: (row.productIdsJson ?? []) as SearchProductId[],
          enabled: row.enabled ?? true,
          createdAt: requireIso(row.createdAt),
          updatedAt: requireIso(row.updatedAt),
          deletedAt: iso(row.deletedAt),
          revision: row.revision,
        }));
    },
    async softDelete(ctx: SearchRepositoryContext, id: string) {
      await softDeleteById(platformSearchCollection, ctx, id);
    },
    async restore(ctx: SearchRepositoryContext, id: string) {
      return restoreById(platformSearchCollection, ctx, id, (row) => ({
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        name: row.name ?? "",
        scope: (row.scope ?? "tenant") as SearchScope,
        productIds: (row.productIdsJson ?? []) as SearchProductId[],
        enabled: row.enabled ?? true,
        createdAt: requireIso(row.createdAt),
        updatedAt: new Date().toISOString(),
        revision: row.revision + 1,
      }));
    },
  };

  const sources = {
    async upsert(ctx: SearchRepositoryContext, record: SearchSourceRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db
        .insert(platformSearchSource)
        .values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          productId: record.productId,
          label: record.label,
          entityTypesJson: [...record.entityTypes],
          enabled: record.enabled ?? true,
          providerId: record.providerId ?? null,
          collectionId: record.collectionId ?? null,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: null,
          revision: record.revision,
        })
        .onConflictDoUpdate({
          target: platformSearchSource.id,
          set: {
            productId: record.productId,
            label: record.label,
            entityTypesJson: [...record.entityTypes],
            enabled: record.enabled ?? true,
            providerId: record.providerId ?? null,
            collectionId: record.collectionId ?? null,
            updatedAt: new Date(record.updatedAt),
            revision: record.revision,
            deletedAt: null,
          },
        });
      return { ...record, enabled: record.enabled ?? true };
    },
    async get(ctx: SearchRepositoryContext, id: string) {
      const rows = await db
        .select()
        .from(platformSearchSource)
        .where(
          and(
            eq(platformSearchSource.tenantId, ctx.tenantId),
            eq(platformSearchSource.id, id),
            isNull(platformSearchSource.deletedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        productId: row.productId as SearchProductId,
        label: row.label,
        entityTypes: row.entityTypesJson ?? [],
        enabled: row.enabled ?? true,
        providerId: row.providerId ?? undefined,
        collectionId: row.collectionId ?? undefined,
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchSourceRecord;
    },
    async list(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchSource)
        .where(
          and(
            eq(platformSearchSource.tenantId, ctx.tenantId),
            isNull(platformSearchSource.deletedAt),
          ),
        );
      return rows
        .filter((row) => orgFilter(ctx, row.organisationId))
        .map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          organisationId: row.organisationId ?? undefined,
          productId: row.productId as SearchProductId,
          label: row.label,
          entityTypes: row.entityTypesJson ?? [],
          enabled: row.enabled ?? true,
          providerId: row.providerId ?? undefined,
          collectionId: row.collectionId ?? undefined,
          createdAt: requireIso(row.createdAt),
          updatedAt: requireIso(row.updatedAt),
          deletedAt: iso(row.deletedAt),
          revision: row.revision,
        }));
    },
    async softDelete(ctx: SearchRepositoryContext, id: string) {
      await softDeleteById(platformSearchSource, ctx, id);
    },
    async restore(ctx: SearchRepositoryContext, id: string) {
      return restoreById(platformSearchSource, ctx, id, (row) => ({
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        productId: (row.productId ?? "documents") as SearchProductId,
        label: row.label ?? "",
        entityTypes: row.entityTypesJson ?? [],
        enabled: row.enabled ?? true,
        providerId: row.providerId ?? undefined,
        collectionId: row.collectionId ?? undefined,
        createdAt: requireIso(row.createdAt),
        updatedAt: new Date().toISOString(),
        revision: row.revision + 1,
      }));
    },
  };

  const scopes = {
    async upsert(ctx: SearchRepositoryContext, record: SearchScopeRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db
        .insert(platformSearchScope)
        .values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          scope: record.scope,
          label: record.label,
          description: record.description ?? null,
          enabled: record.enabled,
          metadataJson: { ...record.metadata },
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: null,
          revision: record.revision,
        })
        .onConflictDoUpdate({
          target: platformSearchScope.id,
          set: {
            scope: record.scope,
            label: record.label,
            description: record.description ?? null,
            enabled: record.enabled,
            metadataJson: { ...record.metadata },
            updatedAt: new Date(record.updatedAt),
            revision: record.revision,
          },
        });
      return record;
    },
    async list(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchScope)
        .where(
          and(
            eq(platformSearchScope.tenantId, ctx.tenantId),
            isNull(platformSearchScope.deletedAt),
          ),
        );
      return rows
        .filter((row) => orgFilter(ctx, row.organisationId))
        .map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          organisationId: row.organisationId ?? undefined,
          scope: row.scope as SearchScope,
          label: row.label,
          description: row.description ?? undefined,
          enabled: row.enabled,
          metadata: (row.metadataJson ?? {}) as Record<string, string>,
          createdAt: requireIso(row.createdAt),
          updatedAt: requireIso(row.updatedAt),
          deletedAt: iso(row.deletedAt),
          revision: row.revision,
        }));
    },
    async softDelete(ctx: SearchRepositoryContext, id: string) {
      await softDeleteById(platformSearchScope, ctx, id);
    },
    async get(ctx: SearchRepositoryContext, id: string) {
      const rows = await db
        .select()
        .from(platformSearchScope)
        .where(
          and(
            eq(platformSearchScope.tenantId, ctx.tenantId),
            eq(platformSearchScope.id, id),
            isNull(platformSearchScope.deletedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        scope: row.scope as SearchScope,
        label: row.label,
        description: row.description ?? undefined,
        enabled: row.enabled,
        metadata: row.metadataJson ?? {},
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchScopeRecord;
    },
    async restore(ctx: SearchRepositoryContext, id: string) {
      return restoreById(platformSearchScope, ctx, id, (row) => ({
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        scope: (row.scope ?? "tenant") as SearchScope,
        label: row.label ?? "",
        description: row.description ?? undefined,
        enabled: row.enabled ?? true,
        metadata: row.metadataJson ?? {},
        createdAt: requireIso(row.createdAt),
        updatedAt: new Date().toISOString(),
        revision: row.revision + 1,
      }));
    },
  };

  const metadata = {
    async upsert(ctx: SearchRepositoryContext, record: SearchMetadataRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db
        .insert(platformSearchMetadata)
        .values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          entityType: record.entityType,
          entityId: record.entityId,
          title: record.title,
          description: record.description ?? null,
          keywordsJson: [...record.keywords],
          productId: record.productId,
          sourceId: record.sourceId,
          classification: record.classification ?? null,
          permissionsJson: [...record.permissions],
          ownerUserId: record.ownerUserId ?? null,
          status: record.status ?? null,
          entityVersion: record.entityVersion ?? null,
          navigationTarget: record.navigationTarget ?? null,
          customJson: { ...record.custom },
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: null,
          revision: record.revision,
        })
        .onConflictDoUpdate({
          target: platformSearchMetadata.id,
          set: {
            title: record.title,
            description: record.description ?? null,
            keywordsJson: [...record.keywords],
            classification: record.classification ?? null,
            permissionsJson: [...record.permissions],
            ownerUserId: record.ownerUserId ?? null,
            status: record.status ?? null,
            entityVersion: record.entityVersion ?? null,
            navigationTarget: record.navigationTarget ?? null,
            customJson: { ...record.custom },
            updatedAt: new Date(record.updatedAt),
            revision: record.revision,
          },
        });
      return record;
    },
    async get(ctx: SearchRepositoryContext, id: string) {
      const rows = await db
        .select()
        .from(platformSearchMetadata)
        .where(
          and(
            eq(platformSearchMetadata.tenantId, ctx.tenantId),
            eq(platformSearchMetadata.id, id),
            isNull(platformSearchMetadata.deletedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        entityType: row.entityType,
        entityId: row.entityId,
        title: row.title,
        description: row.description ?? undefined,
        keywords: row.keywordsJson ?? [],
        productId: row.productId as SearchProductId,
        sourceId: row.sourceId,
        classification: row.classification ?? undefined,
        permissions: row.permissionsJson ?? [],
        ownerUserId: row.ownerUserId ?? undefined,
        status: row.status ?? undefined,
        entityVersion: row.entityVersion ?? undefined,
        navigationTarget: row.navigationTarget ?? undefined,
        custom: (row.customJson ?? {}) as Record<string, string>,
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchMetadataRecord;
    },
    async list(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchMetadata)
        .where(
          and(
            eq(platformSearchMetadata.tenantId, ctx.tenantId),
            isNull(platformSearchMetadata.deletedAt),
          ),
        );
      return rows
        .filter((row) => orgFilter(ctx, row.organisationId))
        .map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          organisationId: row.organisationId ?? undefined,
          entityType: row.entityType,
          entityId: row.entityId,
          title: row.title,
          description: row.description ?? undefined,
          keywords: row.keywordsJson ?? [],
          productId: row.productId as SearchProductId,
          sourceId: row.sourceId,
          classification: row.classification ?? undefined,
          permissions: row.permissionsJson ?? [],
          ownerUserId: row.ownerUserId ?? undefined,
          status: row.status ?? undefined,
          entityVersion: row.entityVersion ?? undefined,
          navigationTarget: row.navigationTarget ?? undefined,
          custom: (row.customJson ?? {}) as Record<string, string>,
          createdAt: requireIso(row.createdAt),
          updatedAt: requireIso(row.updatedAt),
          deletedAt: iso(row.deletedAt),
          revision: row.revision,
        }));
    },
    async softDelete(ctx: SearchRepositoryContext, id: string) {
      await softDeleteById(platformSearchMetadata, ctx, id);
    },
    async restore(ctx: SearchRepositoryContext, id: string) {
      return restoreById(platformSearchMetadata, ctx, id, (row) => ({
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        entityType: row.entityType ?? "",
        entityId: row.entityId ?? "",
        title: row.title ?? "",
        description: row.description ?? undefined,
        keywords: row.keywordsJson ?? [],
        productId: (row.productId ?? "documents") as SearchProductId,
        sourceId: row.sourceId ?? "",
        classification: row.classification ?? undefined,
        permissions: row.permissionsJson ?? [],
        ownerUserId: row.ownerUserId ?? undefined,
        status: row.status ?? undefined,
        entityVersion: row.entityVersion ?? undefined,
        navigationTarget: row.navigationTarget ?? undefined,
        custom: row.customJson ?? {},
        createdAt: requireIso(row.createdAt),
        updatedAt: new Date().toISOString(),
        revision: row.revision + 1,
      }));
    },
  };

  const sessions = {
    async upsert(ctx: SearchRepositoryContext, record: SearchSessionRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db
        .insert(platformSearchSession)
        .values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          actorUserId: record.actorUserId,
          lastQueryAt: record.lastQueryAt ? new Date(record.lastQueryAt) : null,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: null,
          revision: record.revision,
        })
        .onConflictDoUpdate({
          target: platformSearchSession.id,
          set: {
            lastQueryAt: record.lastQueryAt ? new Date(record.lastQueryAt) : null,
            updatedAt: new Date(record.updatedAt),
            revision: record.revision,
          },
        });
      return record;
    },
    async get(ctx: SearchRepositoryContext, id: string) {
      const rows = await db
        .select()
        .from(platformSearchSession)
        .where(
          and(
            eq(platformSearchSession.tenantId, ctx.tenantId),
            eq(platformSearchSession.id, id),
            isNull(platformSearchSession.deletedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        actorUserId: row.actorUserId,
        lastQueryAt: iso(row.lastQueryAt),
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchSessionRecord;
    },
    async softDelete(ctx: SearchRepositoryContext, id: string) {
      await softDeleteById(platformSearchSession, ctx, id);
    },
  };

  const audits = {
    async append(ctx: SearchRepositoryContext, record: SearchAuditRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db.insert(platformSearchAudit).values({
        id: record.id,
        tenantId: record.tenantId,
        organisationId: record.organisationId ?? null,
        action: record.action,
        actorUserId: record.actorUserId,
        correlationId: record.correlationId ?? null,
        detailJson: { ...record.detail },
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        deletedAt: null,
        revision: record.revision,
      });
      return record;
    },
    async list(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchAudit)
        .where(
          and(
            eq(platformSearchAudit.tenantId, ctx.tenantId),
            isNull(platformSearchAudit.deletedAt),
          ),
        );
      return rows
        .filter((row) => orgFilter(ctx, row.organisationId))
        .map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          organisationId: row.organisationId ?? undefined,
          action: row.action,
          actorUserId: row.actorUserId,
          correlationId: row.correlationId ?? undefined,
          detail: (row.detailJson ?? {}) as Record<string, string>,
          createdAt: requireIso(row.createdAt),
          updatedAt: requireIso(row.updatedAt),
          deletedAt: iso(row.deletedAt),
          revision: row.revision,
        }));
    },
  };

  const diagnostics = {
    async append(ctx: SearchRepositoryContext, record: SearchDiagnosticsRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db.insert(platformSearchDiagnostics).values({
        id: record.id,
        tenantId: record.tenantId,
        organisationId: record.organisationId ?? null,
        providerId: record.providerId ?? null,
        snapshotJson: { ...record.snapshot },
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        deletedAt: null,
        revision: record.revision,
      });
      return record;
    },
    async latest(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchDiagnostics)
        .where(
          and(
            eq(platformSearchDiagnostics.tenantId, ctx.tenantId),
            isNull(platformSearchDiagnostics.deletedAt),
          ),
        )
        .orderBy(desc(platformSearchDiagnostics.createdAt))
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        providerId: row.providerId ?? undefined,
        snapshot: row.snapshotJson as Record<string, unknown>,
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchDiagnosticsRecord;
    },
  };

  const health = {
    async upsert(ctx: SearchRepositoryContext, record: SearchHealthRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db.insert(platformSearchHealth).values({
        id: record.id,
        tenantId: record.tenantId,
        organisationId: record.organisationId ?? null,
        providerId: record.providerId ?? null,
        status: record.status,
        message: record.message ?? null,
        checkedAt: new Date(record.checkedAt),
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        deletedAt: null,
        revision: record.revision,
      });
      return record;
    },
    async latest(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchHealth)
        .where(
          and(
            eq(platformSearchHealth.tenantId, ctx.tenantId),
            isNull(platformSearchHealth.deletedAt),
          ),
        )
        .orderBy(desc(platformSearchHealth.checkedAt))
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        providerId: row.providerId ?? undefined,
        status: row.status as SearchProviderStatusState,
        message: row.message ?? undefined,
        checkedAt: requireIso(row.checkedAt),
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchHealthRecord;
    },
  };

  const statistics = {
    async upsert(ctx: SearchRepositoryContext, record: SearchStatisticsRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db
        .insert(platformSearchStatistics)
        .values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          declaredIndexCount: record.declaredIndexCount,
          declaredProviderCount: record.declaredProviderCount,
          declaredCollectionCount: record.declaredCollectionCount,
          declaredSourceCount: record.declaredSourceCount,
          capturedAt: new Date(record.capturedAt),
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: null,
          revision: record.revision,
        })
        .onConflictDoUpdate({
          target: platformSearchStatistics.id,
          set: {
            declaredIndexCount: record.declaredIndexCount,
            declaredProviderCount: record.declaredProviderCount,
            declaredCollectionCount: record.declaredCollectionCount,
            declaredSourceCount: record.declaredSourceCount,
            capturedAt: new Date(record.capturedAt),
            updatedAt: new Date(record.updatedAt),
            revision: record.revision,
          },
        });
      return record;
    },
    async latest(ctx: SearchRepositoryContext) {
      const rows = await db
        .select()
        .from(platformSearchStatistics)
        .where(
          and(
            eq(platformSearchStatistics.tenantId, ctx.tenantId),
            isNull(platformSearchStatistics.deletedAt),
          ),
        )
        .orderBy(desc(platformSearchStatistics.capturedAt))
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        declaredIndexCount: row.declaredIndexCount,
        declaredProviderCount: row.declaredProviderCount,
        declaredCollectionCount: row.declaredCollectionCount,
        declaredSourceCount: row.declaredSourceCount,
        capturedAt: requireIso(row.capturedAt),
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchStatisticsRecord;
    },
  };

  const capabilities = {
    async upsert(ctx: SearchRepositoryContext, record: SearchCapabilitiesRecord) {
      assertSameTenant(ctx, record.tenantId);
      await db
        .insert(platformSearchCapabilities)
        .values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          providerId: record.providerId,
          capabilitiesJson: { ...record.capabilities },
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
          deletedAt: null,
          revision: record.revision,
        })
        .onConflictDoUpdate({
          target: platformSearchCapabilities.id,
          set: {
            capabilitiesJson: { ...record.capabilities },
            updatedAt: new Date(record.updatedAt),
            revision: record.revision,
          },
        });
      return record;
    },
    async getByProvider(ctx: SearchRepositoryContext, providerId: string) {
      const rows = await db
        .select()
        .from(platformSearchCapabilities)
        .where(
          and(
            eq(platformSearchCapabilities.tenantId, ctx.tenantId),
            eq(platformSearchCapabilities.providerId, providerId),
            isNull(platformSearchCapabilities.deletedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !orgFilter(ctx, row.organisationId)) return null;
      return {
        id: row.id,
        tenantId: row.tenantId,
        organisationId: row.organisationId ?? undefined,
        providerId: row.providerId,
        capabilities: asCapabilities(row.capabilitiesJson),
        createdAt: requireIso(row.createdAt),
        updatedAt: requireIso(row.updatedAt),
        deletedAt: iso(row.deletedAt),
        revision: row.revision,
      } satisfies SearchCapabilitiesRecord;
    },
  };

  return {
    mode: "postgres",
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
