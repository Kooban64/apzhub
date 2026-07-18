/**
 * Thin platform search services over persistence (APZSEARCH-003).
 * Management plane only — no search execution / hits.
 */

import {
  asSearchCollectionId,
  asSearchProviderId,
  asSearchSourceId,
  asSearchProfileId,
  DEFAULT_SEARCH_CONFIGURATION,
  FOUNDATION_SEARCH_CAPABILITIES,
  createEmptySearchStatistics,
  createUnknownSearchHealth,
  searchConfigurationInvalid,
  searchExecutionUnavailable,
  searchNotFound,
  searchProviderNotFound,
  toSearchHealthStatus,
  validateSearchConfiguration,
  validateSearchProviderConfiguration,
  validateSearchQuery,
  type PlatformSearchAuditService,
  type PlatformSearchCapabilityService,
  type PlatformSearchCollectionService,
  type PlatformSearchConfigurationService,
  type PlatformSearchDiagnosticsService,
  type PlatformSearchHealthService,
  type PlatformSearchMetadataService,
  type PlatformSearchProfileService,
  type PlatformSearchProviderManagementService,
  type PlatformSearchQueryService,
  type PlatformSearchScopeService,
  type PlatformSearchSourceService,
  type PlatformSearchStatisticsService,
  type PlatformSearchValidationService,
  type SearchConfigurationRecordView,
  type SearchPlatformGateway,
  type SearchProviderRegistrationInput,
  type SearchRequestContext,
  type SearchScopeRecord,
} from "@apzhub/search-contracts";
import { randomUUID } from "node:crypto";

import {
  assertAuditPermission,
  assertCapabilitiesPermission,
  assertCollectionPermission,
  assertConfigurationPermission,
  assertDiagnosticsPermission,
  assertHealthPermission,
  assertMetadataPermission,
  assertProfilePermission,
  assertProviderPermission,
  assertQueryPermission,
  assertScopePermission,
  assertSourcePermission,
  assertStatisticsPermission,
  assertValidationPermission,
} from "../authorization";
import type { SearchPersistenceBundle } from "../ports";
import type { SearchProviderRegistryBundle } from "../registry/provider-registry";
import { createStubManagedSearchProvider } from "../provider/stub-managed-provider";
import type { SearchRepositoryContext } from "../types";
import type { SearchConfigurationRecord } from "../records";

function toRepoCtx(context: SearchRequestContext): SearchRepositoryContext {
  return {
    tenantId: context.tenantId,
    organisationId: context.organisationId,
    actorUserId: context.actorUserId,
    permissions: context.permissions,
    correlationId: context.correlationId,
  };
}

function toConfigView(
  record: SearchConfigurationRecord,
): SearchConfigurationRecordView {
  return {
    id: record.id,
    label: record.label,
    status: record.status,
    configuration: record.configuration,
    currentVersion: record.currentVersion,
    active: record.status === "active",
  };
}

async function appendAudit(
  persistence: SearchPersistenceBundle,
  ctx: SearchRepositoryContext,
  action: string,
  detail: Record<string, string>,
  now: () => string,
  id: () => string,
): Promise<void> {
  const ts = now();
  await persistence.audits.append(ctx, {
    id: id(),
    tenantId: ctx.tenantId,
    organisationId: ctx.organisationId,
    action,
    actorUserId: ctx.actorUserId,
    correlationId: ctx.correlationId,
    detail,
    createdAt: ts,
    updatedAt: ts,
    revision: 1,
  });
}

export type CreateSearchPlatformServicesInput = {
  readonly persistence: SearchPersistenceBundle;
  readonly registry: SearchProviderRegistryBundle;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function createSearchPlatformServices(
  input: CreateSearchPlatformServicesInput,
): SearchPlatformGateway {
  const now = input.now ?? (() => new Date().toISOString());
  const id = input.id ?? (() => randomUUID());
  const { persistence, registry } = input;
  const stubs = new Map<string, ReturnType<typeof createStubManagedSearchProvider>>();

  function getStub(providerId: string, kind: string, label: string) {
    const key = `${providerId}`;
    let stub = stubs.get(key);
    if (!stub) {
      stub = createStubManagedSearchProvider({
        descriptor: {
          id: asSearchProviderId(providerId),
          kind: kind as never,
          label,
          enabled: true,
        },
        now,
      });
      stubs.set(key, stub);
    }
    return stub;
  }

  const searchQuery: PlatformSearchQueryService = {
    validateQuery(context, query) {
      assertQueryPermission(toRepoCtx(context));
      return validateSearchQuery(query);
    },
    async query() {
      throw searchExecutionUnavailable(
        "APZSEARCH-003: searchQuery.query is reserved — execution unavailable",
      );
    },
  };

  const searchProviders: PlatformSearchProviderManagementService = {
    async listProviders(context) {
      assertProviderPermission(toRepoCtx(context), "list");
      return registry.listProviders(context);
    },
    async getProvider(context, providerId) {
      assertProviderPermission(toRepoCtx(context), "read");
      return registry.getProvider(context, providerId);
    },
    async registerProvider(
      context,
      registration: SearchProviderRegistrationInput & {
        ownership?: "platform" | "tenant" | "organisation";
      },
    ) {
      assertProviderPermission(toRepoCtx(context), "register");
      await registry.register(context, registration);
      const provider = await registry.getProvider(context, registration.providerId);
      if (!provider) throw searchProviderNotFound(registration.providerId);
      return provider;
    },
    async updateProvider(context, providerId, updateInput) {
      assertProviderPermission(toRepoCtx(context), "update");
      const ctx = toRepoCtx(context);
      const existing = await persistence.providers.get(ctx, providerId);
      if (!existing) throw searchProviderNotFound(providerId);
      if (updateInput.configuration) {
        const validation = validateSearchProviderConfiguration(
          updateInput.configuration,
        );
        if (!validation.valid) {
          throw searchConfigurationInvalid(validation.issues);
        }
      }
      const ts = now();
      const next = await persistence.providers.upsert(ctx, {
        ...existing,
        label: updateInput.label ?? existing.label,
        version: updateInput.version ?? existing.version,
        ownership: updateInput.ownership ?? existing.ownership,
        configuration: updateInput.configuration ?? existing.configuration,
        capabilities: updateInput.capabilities
          ? {
              ...FOUNDATION_SEARCH_CAPABILITIES,
              ...updateInput.capabilities,
              semantic: false as const,
              vector: false as const,
              fuzzy: false as const,
            }
          : existing.capabilities,
        updatedAt: ts,
        revision: existing.revision + 1,
      });
      await appendAudit(
        persistence,
        ctx,
        "search.provider.updated",
        { providerId },
        now,
        id,
      );
      return {
        id: asSearchProviderId(next.id),
        kind: next.kind,
        label: next.label,
        enabled: next.enabled,
        active: next.active,
        ownership: next.ownership,
        version: next.version,
        capabilities: next.capabilities,
      };
    },
    async enableProvider(context, providerId) {
      assertProviderPermission(toRepoCtx(context), "enable");
      const ctx = toRepoCtx(context);
      const existing = await persistence.providers.get(ctx, providerId);
      if (!existing) throw searchProviderNotFound(providerId);
      const next = await persistence.providers.upsert(ctx, {
        ...existing,
        enabled: true,
        updatedAt: now(),
        revision: existing.revision + 1,
      });
      await appendAudit(
        persistence,
        ctx,
        "search.provider.enabled",
        { providerId },
        now,
        id,
      );
      return {
        id: asSearchProviderId(next.id),
        kind: next.kind,
        label: next.label,
        enabled: true,
        active: next.active,
        ownership: next.ownership,
        version: next.version,
        capabilities: next.capabilities,
      };
    },
    async disableProvider(context, providerId) {
      assertProviderPermission(toRepoCtx(context), "disable");
      const ctx = toRepoCtx(context);
      const existing = await persistence.providers.get(ctx, providerId);
      if (!existing) throw searchProviderNotFound(providerId);
      const next = await persistence.providers.upsert(ctx, {
        ...existing,
        enabled: false,
        active: false,
        updatedAt: now(),
        revision: existing.revision + 1,
      });
      await appendAudit(
        persistence,
        ctx,
        "search.provider.disabled",
        { providerId },
        now,
        id,
      );
      return {
        id: asSearchProviderId(next.id),
        kind: next.kind,
        label: next.label,
        enabled: false,
        active: false,
        ownership: next.ownership,
        version: next.version,
        capabilities: next.capabilities,
      };
    },
    async setActiveProvider(context, providerId) {
      assertProviderPermission(toRepoCtx(context), "activate");
      await registry.setActiveProvider(context, providerId);
    },
    async clearActiveProvider(context) {
      assertProviderPermission(toRepoCtx(context), "activate");
      await registry.setActiveProvider(context, null);
    },
    async unregisterProvider(context, providerId) {
      assertProviderPermission(toRepoCtx(context), "unregister");
      await registry.unregister(context, providerId);
      stubs.delete(providerId);
    },
    async getCapabilities(context, providerId) {
      assertProviderPermission(toRepoCtx(context), "read");
      if (!providerId) return FOUNDATION_SEARCH_CAPABILITIES;
      const provider = await registry.getProvider(context, providerId);
      return provider?.capabilities ?? FOUNDATION_SEARCH_CAPABILITIES;
    },
    async getProviderStatus(context, providerId) {
      assertProviderPermission(toRepoCtx(context), "health");
      const status = await persistence.providerStatuses.getByProvider(
        toRepoCtx(context),
        providerId,
      );
      if (!status) return null;
      return {
        status: status.status,
        message: status.message,
        checkedAt: status.checkedAt,
      };
    },
    validateProviderConfiguration(_context, configuration) {
      return validateSearchProviderConfiguration(configuration);
    },
    async getActiveProvider(context) {
      assertProviderPermission(toRepoCtx(context), "read");
      const activeId = await registry.getActiveProviderId(context);
      if (!activeId) return null;
      return registry.getProvider(context, activeId);
    },
    async initialiseProvider(context, providerId, configuration) {
      assertProviderPermission(toRepoCtx(context), "update");
      const provider = await registry.getProvider(context, providerId);
      if (!provider) throw searchProviderNotFound(providerId);
      const stub = getStub(providerId, provider.kind, provider.label);
      await stub.initialise(context, configuration);
      await persistence.providerStatuses.upsert(toRepoCtx(context), {
        id: id(),
        tenantId: context.tenantId,
        organisationId: context.organisationId,
        providerId,
        // Never AVAILABLE for execution
        status: "UNAVAILABLE",
        message: "Stub initialised — execution unavailable",
        checkedAt: now(),
        createdAt: now(),
        updatedAt: now(),
        revision: 1,
      });
    },
    async validateProviderLifecycleConfiguration(context, providerId, configuration) {
      assertProviderPermission(toRepoCtx(context), "read");
      const provider = await registry.getProvider(context, providerId);
      if (!provider) throw searchProviderNotFound(providerId);
      const stub = getStub(providerId, provider.kind, provider.label);
      return stub.validateConfiguration(context, configuration);
    },
    async getProviderHealth(context, providerId) {
      assertProviderPermission(toRepoCtx(context), "health");
      const provider = await registry.getProvider(context, providerId);
      if (!provider) throw searchProviderNotFound(providerId);
      const stub = getStub(providerId, provider.kind, provider.label);
      return stub.getHealth(context);
    },
    async getProviderLifecycleCapabilities(context, providerId) {
      assertProviderPermission(toRepoCtx(context), "read");
      const provider = await registry.getProvider(context, providerId);
      if (!provider) throw searchProviderNotFound(providerId);
      const stub = getStub(providerId, provider.kind, provider.label);
      return stub.getCapabilities(context);
    },
    async getProviderDiagnostics(context, providerId) {
      assertProviderPermission(toRepoCtx(context), "diagnostics");
      return registry.getProviderDiagnostics(context, providerId);
    },
    async disposeProvider(context, providerId) {
      assertProviderPermission(toRepoCtx(context), "unregister");
      const provider = await registry.getProvider(context, providerId);
      if (!provider) throw searchProviderNotFound(providerId);
      const stub = getStub(providerId, provider.kind, provider.label);
      await stub.dispose(context);
      stubs.delete(providerId);
    },
  };

  const searchConfigurations: PlatformSearchConfigurationService = {
    async create(context, createInput) {
      assertConfigurationPermission(toRepoCtx(context), "create");
      const validation = validateSearchConfiguration(createInput.configuration);
      if (!validation.valid) throw searchConfigurationInvalid(validation.issues);
      const ctx = toRepoCtx(context);
      const ts = now();
      const configId = id();
      if (createInput.activate) {
        const existing = await persistence.configurations.list(ctx);
        for (const row of existing) {
          if (row.status === "active") {
            await persistence.configurations.upsert(ctx, {
              ...row,
              status: "draft",
              updatedAt: ts,
              revision: row.revision + 1,
            });
          }
        }
      }
      const record = await persistence.configurations.upsert(ctx, {
        id: configId,
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        label: createInput.label,
        status: createInput.activate ? "active" : "draft",
        configuration: createInput.configuration,
        currentVersion: 1,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
      await persistence.configurationVersions.append(ctx, {
        id: id(),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        configurationId: record.id,
        version: 1,
        snapshot: createInput.configuration,
        changedBy: ctx.actorUserId,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
      await appendAudit(
        persistence,
        ctx,
        "search.configuration.created",
        { id: configId },
        now,
        id,
      );
      return toConfigView(record);
    },
    async get(context, configurationId) {
      assertConfigurationPermission(toRepoCtx(context), "read");
      const record = await persistence.configurations.get(
        toRepoCtx(context),
        configurationId,
      );
      return record ? toConfigView(record) : null;
    },
    async list(context) {
      assertConfigurationPermission(toRepoCtx(context), "list");
      const rows = await persistence.configurations.list(toRepoCtx(context));
      return rows.map(toConfigView);
    },
    async update(context, configurationId, updateInput) {
      assertConfigurationPermission(toRepoCtx(context), "update");
      const validation = validateSearchConfiguration(updateInput.configuration);
      if (!validation.valid) throw searchConfigurationInvalid(validation.issues);
      const ctx = toRepoCtx(context);
      const existing = await persistence.configurations.get(ctx, configurationId);
      if (!existing) throw searchNotFound("configuration", configurationId);
      const ts = now();
      const nextVersion = existing.currentVersion + 1;
      const record = await persistence.configurations.upsert(ctx, {
        ...existing,
        label: updateInput.label ?? existing.label,
        configuration: updateInput.configuration,
        currentVersion: nextVersion,
        updatedAt: ts,
        revision: existing.revision + 1,
      });
      await persistence.configurationVersions.append(ctx, {
        id: id(),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        configurationId,
        version: nextVersion,
        snapshot: updateInput.configuration,
        changedBy: ctx.actorUserId,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
      await appendAudit(
        persistence,
        ctx,
        "search.configuration.updated",
        { id: configurationId },
        now,
        id,
      );
      return toConfigView(record);
    },
    async version(context, configurationId, changeReason) {
      assertConfigurationPermission(toRepoCtx(context), "version");
      const ctx = toRepoCtx(context);
      const existing = await persistence.configurations.get(ctx, configurationId);
      if (!existing) throw searchNotFound("configuration", configurationId);
      const ts = now();
      const nextVersion = existing.currentVersion + 1;
      const record = await persistence.configurations.upsert(ctx, {
        ...existing,
        currentVersion: nextVersion,
        updatedAt: ts,
        revision: existing.revision + 1,
      });
      await persistence.configurationVersions.append(ctx, {
        id: id(),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        configurationId,
        version: nextVersion,
        snapshot: existing.configuration,
        changedBy: ctx.actorUserId,
        changeReason,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
      return toConfigView(record);
    },
    async activate(context, configurationId) {
      assertConfigurationPermission(toRepoCtx(context), "activate");
      const ctx = toRepoCtx(context);
      const existing = await persistence.configurations.get(ctx, configurationId);
      if (!existing) throw searchNotFound("configuration", configurationId);
      const ts = now();
      for (const row of await persistence.configurations.list(ctx)) {
        if (row.id !== configurationId && row.status === "active") {
          await persistence.configurations.upsert(ctx, {
            ...row,
            status: "draft",
            updatedAt: ts,
            revision: row.revision + 1,
          });
        }
      }
      const record = await persistence.configurations.upsert(ctx, {
        ...existing,
        status: "active",
        updatedAt: ts,
        revision: existing.revision + 1,
      });
      await appendAudit(
        persistence,
        ctx,
        "search.configuration.activated",
        { id: configurationId },
        now,
        id,
      );
      return toConfigView(record);
    },
    validate(context, configuration) {
      assertConfigurationPermission(toRepoCtx(context), "validate");
      return validateSearchConfiguration(configuration);
    },
    async archive(context, configurationId) {
      assertConfigurationPermission(toRepoCtx(context), "archive");
      await persistence.configurations.softDelete(toRepoCtx(context), configurationId);
      await appendAudit(
        persistence,
        toRepoCtx(context),
        "search.configuration.archived",
        { id: configurationId },
        now,
        id,
      );
    },
    async getConfiguration(context) {
      const view = await searchConfigurations.get(context);
      return view?.configuration ?? DEFAULT_SEARCH_CONFIGURATION;
    },
    async putConfiguration(context, configuration) {
      const existing = await persistence.configurations.getActive(toRepoCtx(context));
      if (existing) {
        return (
          await searchConfigurations.update(context, existing.id, { configuration })
        ).configuration;
      }
      return (
        await searchConfigurations.create(context, { configuration, activate: true })
      ).configuration;
    },
  };

  const searchCapabilities: PlatformSearchCapabilityService = {
    async getCapabilities(context, providerId) {
      assertCapabilitiesPermission(toRepoCtx(context));
      if (!providerId) return FOUNDATION_SEARCH_CAPABILITIES;
      const provider = await registry.getProvider(context, providerId);
      return provider?.capabilities ?? FOUNDATION_SEARCH_CAPABILITIES;
    },
    async getManagementReadiness(context) {
      assertCapabilitiesPermission(toRepoCtx(context));
      const providers = await persistence.providers.list(toRepoCtx(context));
      const active = providers.find((p) => p.active);
      return {
        managementPlaneReady: true,
        executionEnabled: false as const,
        persistenceReady: true,
        registryReady: true,
        providerCount: providers.length,
        activeProviderId: active?.id,
      };
    },
  };

  const searchHealth: PlatformSearchHealthService = {
    async getHealth(context) {
      assertHealthPermission(toRepoCtx(context));
      const ctx = toRepoCtx(context);
      const activeId = await registry.getActiveProviderId(context);
      if (activeId) {
        const status = await persistence.providerStatuses.getByProvider(ctx, activeId);
        if (status) {
          return {
            status: toSearchHealthStatus(status.status),
            message: status.message,
            checkedAt: status.checkedAt,
          };
        }
      }
      const latest = await persistence.health.latest(ctx);
      if (latest) {
        return {
          status: toSearchHealthStatus(latest.status),
          message: latest.message,
          checkedAt: latest.checkedAt,
        };
      }
      return {
        ...createUnknownSearchHealth(now),
        message: "Search management plane ready — execution unavailable",
        status: "unavailable" as const,
      };
    },
  };

  const searchStatistics: PlatformSearchStatisticsService = {
    async getStatistics(context) {
      assertStatisticsPermission(toRepoCtx(context));
      const ctx = toRepoCtx(context);
      const [providers, collections, sources, profiles, scopes, metadata] =
        await Promise.all([
          persistence.providers.list(ctx),
          persistence.collections.list(ctx),
          persistence.sources.list(ctx),
          persistence.profiles.list(ctx),
          persistence.scopes.list(ctx),
          persistence.metadata.list(ctx),
        ]);
      const stats = {
        declaredIndexCount: 0,
        declaredProviderCount: providers.length,
        declaredCollectionCount: collections.length,
        declaredSourceCount: sources.length,
        declaredProfileCount: profiles.length,
        declaredScopeCount: scopes.length,
        declaredMetadataCount: metadata.length,
      };
      const ts = now();
      await persistence.statistics.upsert(ctx, {
        id: id(),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        declaredIndexCount: 0,
        declaredProviderCount: providers.length,
        declaredCollectionCount: collections.length,
        declaredSourceCount: sources.length,
        capturedAt: ts,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
      return stats;
    },
  };

  const searchDiagnostics: PlatformSearchDiagnosticsService = {
    async getDiagnostics(context) {
      assertDiagnosticsPermission(toRepoCtx(context));
      const ctx = toRepoCtx(context);
      const health = await searchHealth.getHealth(context);
      const statistics = await searchStatistics.getStatistics(context);
      const configuration =
        (await searchConfigurations.get(context))?.configuration ??
        DEFAULT_SEARCH_CONFIGURATION;
      const providers = await persistence.providers.list(ctx);
      const snapshot = {
        health,
        capabilities: FOUNDATION_SEARCH_CAPABILITIES,
        statistics,
        configurationSummary: {
          defaultPageSize: configuration.defaultPageSize,
          maxPageSize: configuration.maxPageSize,
          enforceTenantIsolation: true as const,
          enforcePermissionFilter: true as const,
        },
        notes: [
          "APZSEARCH-003: management plane — no engine execution",
          `providers=${providers.length}`,
          "executionEnabled=false",
        ],
      };
      await persistence.diagnostics.append(ctx, {
        id: id(),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        snapshot,
        createdAt: now(),
        updatedAt: now(),
        revision: 1,
      });
      return snapshot;
    },
  };

  const searchCollections: PlatformSearchCollectionService = {
    async list(context) {
      assertCollectionPermission(toRepoCtx(context), "list");
      const rows = await persistence.collections.list(toRepoCtx(context));
      return rows.map((r) => ({
        id: asSearchCollectionId(r.id),
        name: r.name,
        scope: r.scope,
        productIds: r.productIds,
        enabled: r.enabled,
      }));
    },
    async get(context, collectionId) {
      assertCollectionPermission(toRepoCtx(context), "read");
      const row = await persistence.collections.get(toRepoCtx(context), collectionId);
      if (!row) return null;
      return {
        id: asSearchCollectionId(row.id),
        name: row.name,
        scope: row.scope,
        productIds: row.productIds,
        enabled: row.enabled,
      };
    },
    async create(context, createInput) {
      assertCollectionPermission(toRepoCtx(context), "create");
      const ctx = toRepoCtx(context);
      const ts = now();
      const collectionId = createInput.id ?? id();
      const record = await persistence.collections.upsert(ctx, {
        id: collectionId,
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        name: createInput.name,
        scope: createInput.scope,
        productIds: (createInput.productIds ?? []) as never,
        enabled: createInput.enabled ?? true,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
      await appendAudit(
        persistence,
        ctx,
        "search.collection.created",
        { id: collectionId },
        now,
        id,
      );
      return {
        id: asSearchCollectionId(record.id),
        name: record.name,
        scope: record.scope,
        productIds: record.productIds,
        enabled: record.enabled,
      };
    },
    async update(context, collectionId, updateInput) {
      assertCollectionPermission(toRepoCtx(context), "update");
      const ctx = toRepoCtx(context);
      const existing = await persistence.collections.get(ctx, collectionId);
      if (!existing) throw searchNotFound("collection", collectionId);
      const record = await persistence.collections.upsert(ctx, {
        ...existing,
        name: updateInput.name ?? existing.name,
        scope: updateInput.scope ?? existing.scope,
        productIds: updateInput.productIds
          ? (updateInput.productIds as never)
          : existing.productIds,
        enabled: updateInput.enabled ?? existing.enabled,
        updatedAt: now(),
        revision: existing.revision + 1,
      });
      return {
        id: asSearchCollectionId(record.id),
        name: record.name,
        scope: record.scope,
        productIds: record.productIds,
        enabled: record.enabled,
      };
    },
    async enable(context, collectionId) {
      assertCollectionPermission(toRepoCtx(context), "enable");
      return searchCollections.update(context, collectionId, { enabled: true });
    },
    async disable(context, collectionId) {
      assertCollectionPermission(toRepoCtx(context), "disable");
      return searchCollections.update(context, collectionId, { enabled: false });
    },
    async archive(context, collectionId) {
      assertCollectionPermission(toRepoCtx(context), "archive");
      await persistence.collections.softDelete(toRepoCtx(context), collectionId);
    },
    async restore(context, collectionId) {
      assertCollectionPermission(toRepoCtx(context), "update");
      const restored = await persistence.collections.restore(
        toRepoCtx(context),
        collectionId,
      );
      if (!restored) throw searchNotFound("collection", collectionId);
      return {
        id: asSearchCollectionId(restored.id),
        name: restored.name,
        scope: restored.scope,
        productIds: restored.productIds,
        enabled: restored.enabled,
      };
    },
  };

  const searchSources: PlatformSearchSourceService = {
    async list(context) {
      assertSourcePermission(toRepoCtx(context), "list");
      const rows = await persistence.sources.list(toRepoCtx(context));
      return rows.map((r) => ({
        id: asSearchSourceId(r.id),
        productId: r.productId,
        label: r.label,
        entityTypes: r.entityTypes,
        enabled: r.enabled,
        providerId: r.providerId ? asSearchProviderId(r.providerId) : undefined,
        collectionId: r.collectionId ? asSearchCollectionId(r.collectionId) : undefined,
      }));
    },
    async get(context, sourceId) {
      assertSourcePermission(toRepoCtx(context), "read");
      const row = await persistence.sources.get(toRepoCtx(context), sourceId);
      if (!row) return null;
      return {
        id: asSearchSourceId(row.id),
        productId: row.productId,
        label: row.label,
        entityTypes: row.entityTypes,
        enabled: row.enabled,
        providerId: row.providerId ? asSearchProviderId(row.providerId) : undefined,
        collectionId: row.collectionId
          ? asSearchCollectionId(row.collectionId)
          : undefined,
      };
    },
    async create(context, createInput) {
      assertSourcePermission(toRepoCtx(context), "create");
      const ctx = toRepoCtx(context);
      const ts = now();
      const sourceId = createInput.id ?? id();
      const record = await persistence.sources.upsert(ctx, {
        id: sourceId,
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        productId: createInput.productId as never,
        label: createInput.label,
        entityTypes: createInput.entityTypes,
        enabled: createInput.enabled ?? true,
        providerId: createInput.providerId,
        collectionId: createInput.collectionId,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
      return {
        id: asSearchSourceId(record.id),
        productId: record.productId,
        label: record.label,
        entityTypes: record.entityTypes,
        enabled: record.enabled,
        providerId: record.providerId
          ? asSearchProviderId(record.providerId)
          : undefined,
        collectionId: record.collectionId
          ? asSearchCollectionId(record.collectionId)
          : undefined,
      };
    },
    async update(context, sourceId, updateInput) {
      assertSourcePermission(toRepoCtx(context), "update");
      const ctx = toRepoCtx(context);
      const existing = await persistence.sources.get(ctx, sourceId);
      if (!existing) throw searchNotFound("source", sourceId);
      const record = await persistence.sources.upsert(ctx, {
        ...existing,
        label: updateInput.label ?? existing.label,
        entityTypes: updateInput.entityTypes ?? existing.entityTypes,
        enabled: updateInput.enabled ?? existing.enabled,
        providerId:
          updateInput.providerId === null
            ? undefined
            : (updateInput.providerId ?? existing.providerId),
        collectionId:
          updateInput.collectionId === null
            ? undefined
            : (updateInput.collectionId ?? existing.collectionId),
        updatedAt: now(),
        revision: existing.revision + 1,
      });
      return {
        id: asSearchSourceId(record.id),
        productId: record.productId,
        label: record.label,
        entityTypes: record.entityTypes,
        enabled: record.enabled,
        providerId: record.providerId
          ? asSearchProviderId(record.providerId)
          : undefined,
        collectionId: record.collectionId
          ? asSearchCollectionId(record.collectionId)
          : undefined,
      };
    },
    async enable(context, sourceId) {
      assertSourcePermission(toRepoCtx(context), "enable");
      return searchSources.update(context, sourceId, { enabled: true });
    },
    async disable(context, sourceId) {
      assertSourcePermission(toRepoCtx(context), "disable");
      return searchSources.update(context, sourceId, { enabled: false });
    },
    async archive(context, sourceId) {
      assertSourcePermission(toRepoCtx(context), "archive");
      await persistence.sources.softDelete(toRepoCtx(context), sourceId);
    },
    async restore(context, sourceId) {
      assertSourcePermission(toRepoCtx(context), "update");
      const restored = await persistence.sources.restore(toRepoCtx(context), sourceId);
      if (!restored) throw searchNotFound("source", sourceId);
      return {
        id: asSearchSourceId(restored.id),
        productId: restored.productId,
        label: restored.label,
        entityTypes: restored.entityTypes,
        enabled: restored.enabled,
        providerId: restored.providerId
          ? asSearchProviderId(restored.providerId)
          : undefined,
        collectionId: restored.collectionId
          ? asSearchCollectionId(restored.collectionId)
          : undefined,
      };
    },
  };

  const searchScopes: PlatformSearchScopeService = {
    async list(context) {
      assertScopePermission(toRepoCtx(context), "list");
      const rows = await persistence.scopes.list(toRepoCtx(context));
      return rows.map((r): SearchScopeRecord => ({
        id: r.id,
        scope: r.scope,
        label: r.label,
        description: r.description,
        enabled: r.enabled,
        metadata: r.metadata,
      }));
    },
    async get(context, scopeId) {
      assertScopePermission(toRepoCtx(context), "read");
      const row = await persistence.scopes.get(toRepoCtx(context), scopeId);
      if (!row) return null;
      return {
        id: row.id,
        scope: row.scope,
        label: row.label,
        description: row.description,
        enabled: row.enabled,
        metadata: row.metadata,
      };
    },
    async create(context, createInput) {
      assertScopePermission(toRepoCtx(context), "create");
      const ctx = toRepoCtx(context);
      const ts = now();
      const scopeId = createInput.id ?? id();
      const record = await persistence.scopes.upsert(ctx, {
        id: scopeId,
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        scope: createInput.scope,
        label: createInput.label,
        description: createInput.description,
        enabled: createInput.enabled ?? true,
        metadata: createInput.metadata ?? {},
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
      return {
        id: record.id,
        scope: record.scope,
        label: record.label,
        description: record.description,
        enabled: record.enabled,
        metadata: record.metadata,
      };
    },
    async update(context, scopeId, updateInput) {
      assertScopePermission(toRepoCtx(context), "update");
      const ctx = toRepoCtx(context);
      const existing = await persistence.scopes.get(ctx, scopeId);
      if (!existing) throw searchNotFound("scope", scopeId);
      const record = await persistence.scopes.upsert(ctx, {
        ...existing,
        label: updateInput.label ?? existing.label,
        description:
          updateInput.description === null
            ? undefined
            : (updateInput.description ?? existing.description),
        enabled: updateInput.enabled ?? existing.enabled,
        metadata: updateInput.metadata ?? existing.metadata,
        updatedAt: now(),
        revision: existing.revision + 1,
      });
      return {
        id: record.id,
        scope: record.scope,
        label: record.label,
        description: record.description,
        enabled: record.enabled,
        metadata: record.metadata,
      };
    },
    async archive(context, scopeId) {
      assertScopePermission(toRepoCtx(context), "archive");
      await persistence.scopes.softDelete(toRepoCtx(context), scopeId);
    },
    async restore(context, scopeId) {
      assertScopePermission(toRepoCtx(context), "update");
      const restored = await persistence.scopes.restore(toRepoCtx(context), scopeId);
      if (!restored) throw searchNotFound("scope", scopeId);
      return {
        id: restored.id,
        scope: restored.scope,
        label: restored.label,
        description: restored.description,
        enabled: restored.enabled,
        metadata: restored.metadata,
      };
    },
  };

  const searchProfiles: PlatformSearchProfileService = {
    async list(context) {
      assertProfilePermission(toRepoCtx(context), "list");
      const rows = await persistence.profiles.list(toRepoCtx(context));
      return rows.map((r) => ({
        id: asSearchProfileId(r.id),
        name: r.name,
        defaultScopes: r.defaultScopes,
        defaultCollections: r.defaultCollections.map((c) => asSearchCollectionId(c)),
        defaultSorts: r.defaultSorts,
      }));
    },
    async get(context, profileId) {
      assertProfilePermission(toRepoCtx(context), "read");
      const row = await persistence.profiles.get(toRepoCtx(context), profileId);
      if (!row) return null;
      return {
        id: asSearchProfileId(row.id),
        name: row.name,
        defaultScopes: row.defaultScopes,
        defaultCollections: row.defaultCollections.map((c) => asSearchCollectionId(c)),
        defaultSorts: row.defaultSorts,
      };
    },
    async create(context, createInput) {
      assertProfilePermission(toRepoCtx(context), "create");
      const ctx = toRepoCtx(context);
      const ts = now();
      const profileId = createInput.id ?? id();
      const record = await persistence.profiles.upsert(ctx, {
        id: profileId,
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        name: createInput.name,
        defaultScopes: createInput.defaultScopes ?? [],
        defaultCollections: createInput.defaultCollections ?? [],
        defaultSorts: createInput.defaultSorts ?? [],
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
      return {
        id: asSearchProfileId(record.id),
        name: record.name,
        defaultScopes: record.defaultScopes,
        defaultCollections: record.defaultCollections.map((c) =>
          asSearchCollectionId(c),
        ),
        defaultSorts: record.defaultSorts,
      };
    },
    async update(context, profileId, updateInput) {
      assertProfilePermission(toRepoCtx(context), "update");
      const ctx = toRepoCtx(context);
      const existing = await persistence.profiles.get(ctx, profileId);
      if (!existing) throw searchNotFound("profile", profileId);
      const record = await persistence.profiles.upsert(ctx, {
        ...existing,
        name: updateInput.name ?? existing.name,
        defaultScopes: updateInput.defaultScopes ?? existing.defaultScopes,
        defaultCollections:
          updateInput.defaultCollections ?? existing.defaultCollections,
        defaultSorts: updateInput.defaultSorts ?? existing.defaultSorts,
        updatedAt: now(),
        revision: existing.revision + 1,
      });
      return {
        id: asSearchProfileId(record.id),
        name: record.name,
        defaultScopes: record.defaultScopes,
        defaultCollections: record.defaultCollections.map((c) =>
          asSearchCollectionId(c),
        ),
        defaultSorts: record.defaultSorts,
      };
    },
    async archive(context, profileId) {
      assertProfilePermission(toRepoCtx(context), "archive");
      await persistence.profiles.softDelete(toRepoCtx(context), profileId);
    },
    async restore(context, profileId) {
      assertProfilePermission(toRepoCtx(context), "update");
      const restored = await persistence.profiles.restore(
        toRepoCtx(context),
        profileId,
      );
      if (!restored) throw searchNotFound("profile", profileId);
      return {
        id: asSearchProfileId(restored.id),
        name: restored.name,
        defaultScopes: restored.defaultScopes,
        defaultCollections: restored.defaultCollections.map((c) =>
          asSearchCollectionId(c),
        ),
        defaultSorts: restored.defaultSorts,
      };
    },
    async validate(context, profileId) {
      assertProfilePermission(toRepoCtx(context), "validate");
      const profile = await searchProfiles.get(context, profileId);
      const issues: string[] = [];
      if (!profile) {
        issues.push(`profile not found: ${profileId}`);
      } else if (!profile.name.trim()) {
        issues.push("profile name is required");
      }
      return { valid: issues.length === 0, issues };
    },
  };

  const searchMetadata: PlatformSearchMetadataService = {
    async list(context) {
      assertMetadataPermission(toRepoCtx(context), "list");
      const rows = await persistence.metadata.list(toRepoCtx(context));
      return rows.map((r) => ({
        id: r.id,
        entityType: r.entityType,
        entityId: r.entityId,
        title: r.title,
        description: r.description,
        keywords: r.keywords,
        productId: r.productId,
        sourceId: asSearchSourceId(r.sourceId),
        tenantId: r.tenantId,
        organisationId: r.organisationId,
        classification: r.classification as never,
        permissions: r.permissions,
        ownerUserId: r.ownerUserId,
        status: r.status as never,
        version: r.entityVersion,
        navigationTarget: r.navigationTarget,
        custom: r.custom,
      }));
    },
    async get(context, metadataId) {
      assertMetadataPermission(toRepoCtx(context), "read");
      const r = await persistence.metadata.get(toRepoCtx(context), metadataId);
      if (!r) return null;
      return {
        id: r.id,
        entityType: r.entityType,
        entityId: r.entityId,
        title: r.title,
        description: r.description,
        keywords: r.keywords,
        productId: r.productId,
        sourceId: asSearchSourceId(r.sourceId),
        tenantId: r.tenantId,
        organisationId: r.organisationId,
        classification: r.classification as never,
        permissions: r.permissions,
        ownerUserId: r.ownerUserId,
        status: r.status as never,
        version: r.entityVersion,
        navigationTarget: r.navigationTarget,
        custom: r.custom,
      };
    },
    async create(context, createInput) {
      assertMetadataPermission(toRepoCtx(context), "create");
      const ctx = toRepoCtx(context);
      const ts = now();
      const metadataId = createInput.id ?? id();
      const record = await persistence.metadata.upsert(ctx, {
        id: metadataId,
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        entityType: createInput.entityType,
        entityId: createInput.entityId,
        title: createInput.title,
        description: createInput.description,
        keywords: createInput.keywords ?? [],
        productId: createInput.productId as never,
        sourceId: createInput.sourceId,
        classification: createInput.classification,
        permissions: createInput.permissions ?? [],
        ownerUserId: createInput.ownerUserId,
        status: createInput.status,
        entityVersion: createInput.entityVersion,
        navigationTarget: createInput.navigationTarget,
        custom: createInput.custom ?? {},
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
      return (await searchMetadata.get(context, record.id))!;
    },
    async update(context, metadataId, updateInput) {
      assertMetadataPermission(toRepoCtx(context), "update");
      const ctx = toRepoCtx(context);
      const existing = await persistence.metadata.get(ctx, metadataId);
      if (!existing) throw searchNotFound("metadata", metadataId);
      await persistence.metadata.upsert(ctx, {
        ...existing,
        title: updateInput.title ?? existing.title,
        description:
          updateInput.description === null
            ? undefined
            : (updateInput.description ?? existing.description),
        keywords: updateInput.keywords ?? existing.keywords,
        classification:
          updateInput.classification === null
            ? undefined
            : (updateInput.classification ?? existing.classification),
        permissions: updateInput.permissions ?? existing.permissions,
        ownerUserId:
          updateInput.ownerUserId === null
            ? undefined
            : (updateInput.ownerUserId ?? existing.ownerUserId),
        status:
          updateInput.status === null
            ? undefined
            : (updateInput.status ?? existing.status),
        entityVersion:
          updateInput.entityVersion === null
            ? undefined
            : (updateInput.entityVersion ?? existing.entityVersion),
        navigationTarget:
          updateInput.navigationTarget === null
            ? undefined
            : (updateInput.navigationTarget ?? existing.navigationTarget),
        custom: updateInput.custom ?? existing.custom,
        updatedAt: now(),
        revision: existing.revision + 1,
      });
      return (await searchMetadata.get(context, metadataId))!;
    },
    async archive(context, metadataId) {
      assertMetadataPermission(toRepoCtx(context), "archive");
      await persistence.metadata.softDelete(toRepoCtx(context), metadataId);
    },
    async restore(context, metadataId) {
      assertMetadataPermission(toRepoCtx(context), "update");
      const restored = await persistence.metadata.restore(
        toRepoCtx(context),
        metadataId,
      );
      if (!restored) throw searchNotFound("metadata", metadataId);
      return (await searchMetadata.get(context, metadataId))!;
    },
  };

  const searchAudit: PlatformSearchAuditService = {
    async list(context) {
      assertAuditPermission(toRepoCtx(context));
      const rows = await persistence.audits.list(toRepoCtx(context));
      return rows.map((r) => ({
        id: r.id as never,
        action: r.action,
        actorUserId: r.actorUserId,
        tenantId: r.tenantId,
        organisationId: r.organisationId,
        correlationId: r.correlationId,
        createdAt: r.createdAt,
        detail: r.detail,
      }));
    },
  };

  const searchValidation: PlatformSearchValidationService = {
    validateQuery(context, query) {
      assertValidationPermission(toRepoCtx(context));
      return validateSearchQuery(query);
    },
    validateConfiguration(context, configuration) {
      assertValidationPermission(toRepoCtx(context));
      return validateSearchConfiguration(configuration);
    },
    validateProviderConfiguration(context, configuration) {
      assertValidationPermission(toRepoCtx(context));
      return validateSearchProviderConfiguration(configuration);
    },
  };

  return {
    searchQuery,
    searchProviders,
    searchConfigurations,
    searchCapabilities,
    searchHealth,
    searchDiagnostics,
    searchCollections,
    searchSources,
    searchScopes,
    searchProfiles,
    searchMetadata,
    searchAudit,
    searchStatistics,
    searchValidation,
  };
}

/** Permission-gated audit listing for operators. */
export async function listSearchAudits(
  persistence: SearchPersistenceBundle,
  context: SearchRequestContext,
) {
  assertAuditPermission(toRepoCtx(context));
  return persistence.audits.list(toRepoCtx(context));
}

export function createEmptyStatisticsFallback() {
  return createEmptySearchStatistics();
}
