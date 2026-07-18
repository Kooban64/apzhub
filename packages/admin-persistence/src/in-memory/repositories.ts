/**
 * In-memory Administration Platform repositories (APZADMIN-001).
 * Metadata only — never stores secrets, credentials, or binaries.
 */

import type {
  AdministrationAction,
  AdministrationAuditEntry,
  AdministrationCapability,
  AdministrationCategory,
  AdministrationDashboard,
  AdministrationDiagnostic,
  AdministrationHistory,
  AdministrationMetadata,
  AdministrationModule,
  AdministrationNavigation,
  AdministrationPermission,
  AdministrationPolicy,
  AdministrationReference,
  AdministrationRegistration,
  AdministrationRequestContext,
  AdministrationSection,
  AdministrationShortcut,
  AdministrationWidget,
} from "@apzhub/admin-contracts";
import type {
  AdministrationActionRepositoryPort,
  AdministrationAuditRepositoryPort,
  AdministrationCapabilityRepositoryPort,
  AdministrationCategoryRepositoryPort,
  AdministrationDashboardRepositoryPort,
  AdministrationDiagnosticRepositoryPort,
  AdministrationFoundationRepos,
  AdministrationHistoryRepositoryPort,
  AdministrationMetadataRepositoryPort,
  AdministrationModuleRepositoryPort,
  AdministrationNavigationRepositoryPort,
  AdministrationPermissionRepositoryPort,
  AdministrationPolicyRepositoryPort,
  AdministrationReferenceRepositoryPort,
  AdministrationRegistrationRepositoryPort,
  AdministrationSectionRepositoryPort,
  AdministrationShortcutRepositoryPort,
  AdministrationWidgetRepositoryPort,
} from "@apzhub/admin-core";

export type AdministrationInMemoryStores = {
  readonly modules: Map<string, AdministrationModule>;
  readonly categories: Map<string, AdministrationCategory>;
  readonly sections: Map<string, AdministrationSection>;
  readonly actions: Map<string, AdministrationAction>;
  readonly permissions: Map<string, AdministrationPermission>;
  readonly audits: Map<string, AdministrationAuditEntry>;
  readonly history: Map<string, AdministrationHistory>;
  readonly diagnostics: Map<string, AdministrationDiagnostic>;
  readonly registrations: Map<string, AdministrationRegistration>;
  readonly metadata: Map<string, AdministrationMetadata>;
  readonly policies: Map<string, AdministrationPolicy>;
  readonly references: Map<string, AdministrationReference>;
  readonly capabilities: Map<string, AdministrationCapability>;
  readonly navigations: Map<string, AdministrationNavigation>;
  readonly shortcuts: Map<string, AdministrationShortcut>;
  readonly dashboards: Map<string, AdministrationDashboard>;
  readonly widgets: Map<string, AdministrationWidget>;
};

export function createEmptyAdministrationInMemoryStores(): AdministrationInMemoryStores {
  return {
    modules: new Map(),
    categories: new Map(),
    sections: new Map(),
    actions: new Map(),
    permissions: new Map(),
    audits: new Map(),
    history: new Map(),
    diagnostics: new Map(),
    registrations: new Map(),
    metadata: new Map(),
    policies: new Map(),
    references: new Map(),
    capabilities: new Map(),
    navigations: new Map(),
    shortcuts: new Map(),
    dashboards: new Map(),
    widgets: new Map(),
  };
}

function assertTenant(ctx: AdministrationRequestContext, tenantId: string): void {
  if (tenantId !== ctx.tenantId) {
    throw new Error("tenant_mismatch");
  }
}

function createTenantCrud<T extends { id: string; tenantId: string }>(
  store: Map<string, T>,
): {
  create: (ctx: AdministrationRequestContext, entity: T) => Promise<T>;
  get: (ctx: AdministrationRequestContext, id: string) => Promise<T | null>;
  update: (ctx: AdministrationRequestContext, entity: T) => Promise<T>;
  list: (ctx: AdministrationRequestContext) => Promise<readonly T[]>;
} {
  return {
    async create(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      store.set(entity.id, entity);
      return entity;
    },
    async get(ctx, id) {
      const row = store.get(id) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      store.set(entity.id, entity);
      return entity;
    },
    async list(ctx) {
      return [...store.values()].filter((row) => row.tenantId === ctx.tenantId);
    },
  };
}

export type InMemoryAdministrationRepositories = AdministrationFoundationRepos;

export function createInMemoryAdministrationRepositories(
  stores: AdministrationInMemoryStores,
): InMemoryAdministrationRepositories {
  const modules = createTenantCrud(
    stores.modules,
  ) as AdministrationModuleRepositoryPort;
  const categories = createTenantCrud(
    stores.categories,
  ) as AdministrationCategoryRepositoryPort;
  const sections = createTenantCrud(
    stores.sections,
  ) as AdministrationSectionRepositoryPort;
  const actions = createTenantCrud(
    stores.actions,
  ) as AdministrationActionRepositoryPort;
  const permissions = createTenantCrud(
    stores.permissions,
  ) as AdministrationPermissionRepositoryPort;
  const diagnostics = createTenantCrud(
    stores.diagnostics,
  ) as AdministrationDiagnosticRepositoryPort;
  const registrations = createTenantCrud(
    stores.registrations,
  ) as AdministrationRegistrationRepositoryPort;
  const policies = createTenantCrud(
    stores.policies,
  ) as AdministrationPolicyRepositoryPort;
  const capabilities = createTenantCrud(
    stores.capabilities,
  ) as AdministrationCapabilityRepositoryPort;
  const navigations = createTenantCrud(
    stores.navigations,
  ) as AdministrationNavigationRepositoryPort;
  const shortcuts = createTenantCrud(
    stores.shortcuts,
  ) as AdministrationShortcutRepositoryPort;
  const dashboards = createTenantCrud(
    stores.dashboards,
  ) as AdministrationDashboardRepositoryPort;

  const audits: AdministrationAuditRepositoryPort = {
    async append(ctx, entry) {
      assertTenant(ctx, entry.tenantId);
      stores.audits.set(entry.id, entry);
      return entry;
    },
    async get(ctx, auditId) {
      const row = stores.audits.get(auditId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx) {
      return [...stores.audits.values()].filter((row) => row.tenantId === ctx.tenantId);
    },
  };

  const history: AdministrationHistoryRepositoryPort = {
    async create(ctx, entry) {
      const parent = stores.modules.get(entry.moduleId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.history.set(entry.id, entry);
      return entry;
    },
    async get(ctx, historyId) {
      const row = stores.history.get(historyId) ?? null;
      if (!row) return null;
      const parent = stores.modules.get(row.moduleId);
      if (parent && parent.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async listByModule(ctx, moduleId) {
      const parent = stores.modules.get(moduleId);
      if (parent && parent.tenantId !== ctx.tenantId) return [];
      return [...stores.history.values()].filter((row) => row.moduleId === moduleId);
    },
  };

  const metadata: AdministrationMetadataRepositoryPort = {
    async create(ctx, entry) {
      const parent = stores.modules.get(entry.moduleId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.metadata.set(entry.id, entry);
      return entry;
    },
    async get(ctx, metadataId) {
      const row = stores.metadata.get(metadataId) ?? null;
      if (!row) return null;
      const parent = stores.modules.get(row.moduleId);
      if (parent && parent.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, entry) {
      const parent = stores.modules.get(entry.moduleId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.metadata.set(entry.id, entry);
      return entry;
    },
    async listByModule(ctx, moduleId) {
      const parent = stores.modules.get(moduleId);
      if (parent && parent.tenantId !== ctx.tenantId) return [];
      return [...stores.metadata.values()].filter((row) => row.moduleId === moduleId);
    },
  };

  const references: AdministrationReferenceRepositoryPort = {
    async create(ctx, entry) {
      const parent = stores.modules.get(entry.moduleId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.references.set(entry.id, entry);
      return entry;
    },
    async get(ctx, referenceId) {
      const row = stores.references.get(referenceId) ?? null;
      if (!row) return null;
      const parent = stores.modules.get(row.moduleId);
      if (parent && parent.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async listByModule(ctx, moduleId) {
      const parent = stores.modules.get(moduleId);
      if (parent && parent.tenantId !== ctx.tenantId) return [];
      return [...stores.references.values()].filter((row) => row.moduleId === moduleId);
    },
  };

  const widgets: AdministrationWidgetRepositoryPort = {
    async create(ctx, entry) {
      const parent = stores.dashboards.get(entry.dashboardId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.widgets.set(entry.id, entry);
      return entry;
    },
    async get(ctx, widgetId) {
      const row = stores.widgets.get(widgetId) ?? null;
      if (!row) return null;
      const parent = stores.dashboards.get(row.dashboardId);
      if (parent && parent.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, entry) {
      const parent = stores.dashboards.get(entry.dashboardId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.widgets.set(entry.id, entry);
      return entry;
    },
    async listByDashboard(ctx, dashboardId) {
      const parent = stores.dashboards.get(dashboardId);
      if (parent && parent.tenantId !== ctx.tenantId) return [];
      return [...stores.widgets.values()].filter(
        (row) => row.dashboardId === dashboardId,
      );
    },
  };

  return {
    modules,
    categories,
    sections,
    actions,
    permissions,
    audits,
    history,
    diagnostics,
    registrations,
    metadata,
    policies,
    references,
    capabilities,
    navigations,
    shortcuts,
    dashboards,
    widgets,
  };
}
