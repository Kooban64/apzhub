/**
 * In-memory Administration client for tests (APZADMIN-003 / APZADMIN-004).
 */

import type { AdministrationClient } from "./administration-client";
import type {
  AdministrationActionViewModel,
  AdministrationAuditViewModel,
  AdministrationCapabilityViewModel,
  AdministrationCategoryViewModel,
  AdministrationCollectionResult,
  AdministrationDashboardViewModel,
  AdministrationDiagnosticViewModel,
  AdministrationHistoryViewModel,
  AdministrationMetadataViewModel,
  AdministrationModuleViewModel,
  AdministrationNavigationViewModel,
  AdministrationPermissionViewModel,
  AdministrationPolicyViewModel,
  AdministrationReferenceViewModel,
  AdministrationRegistrationViewModel,
  AdministrationSectionViewModel,
  AdministrationShortcutViewModel,
  AdministrationWidgetViewModel,
} from "./administration-types";

export const MOCK_ADMINISTRATION_MODULE: AdministrationModuleViewModel = {
  id: "mod_mock_1",
  tenantId: "tenant_mock",
  key: "configuration",
  name: "Configuration",
  description: "Platform Configuration product metadata",
  status: "draft",
  createdAt: "2026-07-16T00:00:00.000Z",
  updatedAt: "2026-07-16T00:00:00.000Z",
  createdBy: "user_mock",
  updatedBy: "user_mock",
  revision: 1,
};

const ts = "2026-07-16T00:00:00.000Z";

function collection<T>(items: readonly T[]): AdministrationCollectionResult<T> {
  return { items, page: { limit: items.length, hasMore: false } };
}

const MOCK_CATEGORY: AdministrationCategoryViewModel = {
  id: "cat_mock_1",
  tenantId: "tenant_mock",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  key: "governance",
  name: "Governance",
  description: "Governance category",
  ordering: 10,
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_SECTION: AdministrationSectionViewModel = {
  id: "sec_mock_1",
  tenantId: "tenant_mock",
  categoryId: MOCK_CATEGORY.id,
  key: "overview",
  name: "Overview",
  description: "Overview section",
  ordering: 10,
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_ACTION: AdministrationActionViewModel = {
  id: "act_mock_1",
  tenantId: "tenant_mock",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  sectionId: MOCK_SECTION.id,
  key: "view.module",
  name: "View module",
  description: "Catalogue action — not executable",
  kind: "view",
  permissionKeys: ["admin.read"],
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_PERMISSION: AdministrationPermissionViewModel = {
  id: "perm_mock_1",
  tenantId: "tenant_mock",
  key: "admin.read",
  name: "Administration read",
  description: "Read administration metadata",
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_REGISTRATION: AdministrationRegistrationViewModel = {
  id: "reg_mock_1",
  tenantId: "tenant_mock",
  moduleKey: "configuration",
  version: "0.1.0",
  status: "registered",
  registeredAt: ts,
  registeredBy: "user_mock",
  notes: "Metadata registration only",
};

const MOCK_POLICY: AdministrationPolicyViewModel = {
  id: "pol_mock_1",
  tenantId: "tenant_mock",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  kind: "access",
  key: "metadata.read",
  name: "Metadata read policy",
  description: "Policy catalogue entry",
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_CAPABILITY: AdministrationCapabilityViewModel = {
  id: "cap_mock_1",
  tenantId: "tenant_mock",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  key: "configuration.metadata",
  name: "Configuration metadata",
  description: "Metadata management capability",
  enabled: true,
  available: true,
  healthy: true,
  certified: true,
  productionReady: false,
  limitations: ["Runtime administration unavailable"],
  owner: "platform",
  version: "0.1.0",
  documentation: "/docs/architecture/APZHUB-Configuration-Workbench.md",
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_NAVIGATION: AdministrationNavigationViewModel = {
  id: "nav_mock_1",
  tenantId: "tenant_mock",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  categoryId: MOCK_CATEGORY.id,
  sectionId: MOCK_SECTION.id,
  key: "configuration.overview",
  label: "Configuration Overview",
  ordering: 10,
  visibility: "visible",
  permissionKeys: ["configuration.read"],
  iconKey: "settings-2",
  routePath: "/workspace/configuration",
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_SHORTCUT: AdministrationShortcutViewModel = {
  id: "sc_mock_1",
  tenantId: "tenant_mock",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  actionId: MOCK_ACTION.id,
  key: "go.configuration",
  label: "Go to Configuration",
  ordering: 10,
  permissionKeys: ["configuration.read"],
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_DASHBOARD: AdministrationDashboardViewModel = {
  id: "dash_mock_1",
  tenantId: "tenant_mock",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  key: "admin.overview",
  name: "Administration overview",
  description: "Dashboard metadata only",
  ordering: 10,
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_WIDGET: AdministrationWidgetViewModel = {
  id: "wid_mock_1",
  dashboardId: MOCK_DASHBOARD.id,
  key: "module.count",
  name: "Module count",
  kind: "metric",
  ordering: 10,
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_METADATA: AdministrationMetadataViewModel = {
  id: "meta_mock_1",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  labels: { plane: "management" },
  tags: ["metadata"],
  notes: "Workbench metadata",
};

const MOCK_REFERENCE: AdministrationReferenceViewModel = {
  id: "ref_mock_1",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  kind: "product",
  resourceId: "configuration",
  label: "Configuration product",
};

const MOCK_AUDIT: AdministrationAuditViewModel = {
  id: "aud_mock_1",
  tenantId: "tenant_mock",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  action: "module.registered",
  actorUserId: "user_mock",
  detail: "Module metadata registered",
  createdAt: ts,
};

const MOCK_HISTORY: AdministrationHistoryViewModel = {
  id: "hist_mock_1",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  summary: "Registered configuration module",
  actorUserId: "user_mock",
  createdAt: ts,
};

const MOCK_DIAGNOSTIC: AdministrationDiagnosticViewModel = {
  id: "diag_mock_1",
  tenantId: "tenant_mock",
  moduleId: MOCK_ADMINISTRATION_MODULE.id,
  capabilityId: MOCK_CAPABILITY.id,
  severity: "info",
  code: "ADMIN_METADATA_OK",
  message: "Administration metadata plane healthy",
  detail: "No live probe performed",
  createdAt: ts,
};

export function createMockAdministrationClient(): AdministrationClient {
  let module = { ...MOCK_ADMINISTRATION_MODULE };
  return {
    async listModules(query) {
      const items = [module].filter((item) =>
        query?.status ? item.status === query.status : true,
      );
      return collection(items);
    },
    async getModule() {
      return module;
    },
    async createModule(input) {
      module = {
        ...module,
        id: "mod_new",
        key: String(input.key),
        name: input.name,
        revision: module.revision + 1,
      };
      return module;
    },
    async updateModule(_id, input) {
      module = {
        ...module,
        name: input.name ?? module.name,
        revision: module.revision + 1,
      };
      return module;
    },
    async archiveModule() {
      module = { ...module, status: "archived" };
      return module;
    },
    async restoreModule() {
      module = { ...module, status: "draft" };
      return module;
    },
    async transitionModule(_id, input) {
      module = { ...module, status: input.to };
      return module;
    },
    async listModuleAudit() {
      return collection([MOCK_AUDIT]);
    },
    async listModuleHistory() {
      return collection([MOCK_HISTORY]);
    },
    async listModuleMetadata() {
      return collection([MOCK_METADATA]);
    },
    async listModuleReferences() {
      return collection([MOCK_REFERENCE]);
    },
    async listCategories() {
      return collection([MOCK_CATEGORY]);
    },
    async getCategory(id) {
      return { ...MOCK_CATEGORY, id };
    },
    async createCategory(input) {
      return {
        ...MOCK_CATEGORY,
        id: "cat_new",
        key: String(input.key),
        name: String(input.name),
      };
    },
    async updateCategory(id, input) {
      return {
        ...MOCK_CATEGORY,
        id,
        name: String(input.name ?? MOCK_CATEGORY.name),
      };
    },
    async listSections() {
      return collection([MOCK_SECTION]);
    },
    async getSection(id) {
      return { ...MOCK_SECTION, id };
    },
    async createSection(input) {
      return {
        ...MOCK_SECTION,
        id: "sec_new",
        categoryId: String(input.categoryId),
        key: String(input.key),
        name: String(input.name),
      };
    },
    async updateSection(id, input) {
      return {
        ...MOCK_SECTION,
        id,
        name: String(input.name ?? MOCK_SECTION.name),
      };
    },
    async listActions() {
      return collection([MOCK_ACTION]);
    },
    async getAction(id) {
      return { ...MOCK_ACTION, id };
    },
    async createAction(input) {
      return {
        ...MOCK_ACTION,
        id: "act_new",
        key: String(input.key),
        name: String(input.name),
        kind: String(input.kind),
      };
    },
    async updateAction(id, input) {
      return {
        ...MOCK_ACTION,
        id,
        name: String(input.name ?? MOCK_ACTION.name),
      };
    },
    async listPermissions() {
      return collection([MOCK_PERMISSION]);
    },
    async getPermission(id) {
      return { ...MOCK_PERMISSION, id };
    },
    async createPermission(input) {
      return {
        ...MOCK_PERMISSION,
        id: "perm_new",
        key: String(input.key),
        name: String(input.name),
      };
    },
    async updatePermission(id, input) {
      return {
        ...MOCK_PERMISSION,
        id,
        name: String(input.name ?? MOCK_PERMISSION.name),
      };
    },
    async listRegistrations() {
      return collection([MOCK_REGISTRATION]);
    },
    async getRegistration(id) {
      return { ...MOCK_REGISTRATION, id };
    },
    async createRegistration(input) {
      return {
        ...MOCK_REGISTRATION,
        id: "reg_new",
        moduleKey: String(input.moduleKey),
        version: String(input.version),
      };
    },
    async updateRegistration(id) {
      return { ...MOCK_REGISTRATION, id, version: "1.0.1" };
    },
    async listPolicies() {
      return collection([MOCK_POLICY]);
    },
    async getPolicy(id) {
      return { ...MOCK_POLICY, id };
    },
    async createPolicy(input) {
      return {
        ...MOCK_POLICY,
        id: "pol_new",
        kind: String(input.kind),
        key: String(input.key),
        name: String(input.name),
      };
    },
    async updatePolicy(id, input) {
      return {
        ...MOCK_POLICY,
        id,
        name: String(input.name ?? MOCK_POLICY.name),
      };
    },
    async listCapabilities() {
      return collection([MOCK_CAPABILITY]);
    },
    async getCapability(id) {
      return { ...MOCK_CAPABILITY, id };
    },
    async createCapability(input) {
      return {
        ...MOCK_CAPABILITY,
        id: "cap_new",
        moduleId: String(input.moduleId),
        key: String(input.key),
        name: String(input.name),
        owner: String(input.owner),
        version: String(input.version),
      };
    },
    async updateCapability(id, input) {
      return {
        ...MOCK_CAPABILITY,
        id,
        name: String(input.name ?? MOCK_CAPABILITY.name),
      };
    },
    async listNavigations() {
      return collection([MOCK_NAVIGATION]);
    },
    async getNavigation(id) {
      return { ...MOCK_NAVIGATION, id };
    },
    async createNavigation(input) {
      return {
        ...MOCK_NAVIGATION,
        id: "nav_new",
        moduleId: String(input.moduleId),
        key: String(input.key),
        label: String(input.label),
        ordering: Number(input.ordering ?? 0),
        visibility: String(input.visibility),
      };
    },
    async updateNavigation(id, input) {
      return {
        ...MOCK_NAVIGATION,
        id,
        label: String(input.label ?? MOCK_NAVIGATION.label),
      };
    },
    async listShortcuts() {
      return collection([MOCK_SHORTCUT]);
    },
    async getShortcut(id) {
      return { ...MOCK_SHORTCUT, id };
    },
    async createShortcut(input) {
      return {
        ...MOCK_SHORTCUT,
        id: "sc_new",
        key: String(input.key),
        label: String(input.label),
        ordering: Number(input.ordering ?? 0),
      };
    },
    async updateShortcut(id, input) {
      return {
        ...MOCK_SHORTCUT,
        id,
        label: String(input.label ?? MOCK_SHORTCUT.label),
      };
    },
    async listDashboards() {
      return collection([MOCK_DASHBOARD]);
    },
    async getDashboard(id) {
      return { ...MOCK_DASHBOARD, id };
    },
    async createDashboard(input) {
      return {
        ...MOCK_DASHBOARD,
        id: "dash_new",
        key: String(input.key),
        name: String(input.name),
      };
    },
    async updateDashboard(id, input) {
      return {
        ...MOCK_DASHBOARD,
        id,
        name: String(input.name ?? MOCK_DASHBOARD.name),
      };
    },
    async listWidgets() {
      return collection([MOCK_WIDGET]);
    },
    async getWidget(id) {
      return { ...MOCK_WIDGET, id };
    },
    async createWidget(_dashboardId, input) {
      return {
        ...MOCK_WIDGET,
        id: "wid_new",
        key: String(input.key),
        name: String(input.name),
        kind: String(input.kind),
      };
    },
    async updateWidget(id, input) {
      return {
        ...MOCK_WIDGET,
        id,
        name: String(input.name ?? MOCK_WIDGET.name),
      };
    },
    async listMetadata() {
      return collection([MOCK_METADATA]);
    },
    async getMetadata(id) {
      return { ...MOCK_METADATA, id };
    },
    async createMetadata(input) {
      return { ...MOCK_METADATA, id: "meta_new", moduleId: String(input.moduleId) };
    },
    async updateMetadata(id) {
      return { ...MOCK_METADATA, id };
    },
    async listReferences() {
      return collection([MOCK_REFERENCE]);
    },
    async getReference(id) {
      return { ...MOCK_REFERENCE, id };
    },
    async createReference(input) {
      return {
        ...MOCK_REFERENCE,
        id: "ref_new",
        moduleId: String(input.moduleId),
        kind: String(input.kind),
        resourceId: String(input.resourceId),
      };
    },
    async listAudit() {
      return collection([MOCK_AUDIT]);
    },
    async getAudit(id) {
      return { ...MOCK_AUDIT, id };
    },
    async getHistory(id) {
      return { ...MOCK_HISTORY, id };
    },
    async getDiagnostics() {
      return {
        administrationEnabled: true,
        httpEnabled: true,
        workbenchEnabled: true,
        runtimeAdminEnabled: false,
        managementPlaneReady: true,
      };
    },
    async getDiagnostic(id) {
      return { ...MOCK_DIAGNOSTIC, id };
    },
    async getHealth() {
      return {
        status: "healthy",
        httpEnabled: true,
        workbenchEnabled: true,
        runtimeAdminEnabled: false,
      };
    },
    async getReadiness() {
      return {
        ready: true,
        httpEnabled: true,
        workbenchEnabled: true,
        runtimeAdminEnabled: false,
      };
    },
    async getManagementCapabilities() {
      return {
        administrationEnabled: true,
        managementPlaneReady: true,
        httpEnabled: true,
        workbenchEnabled: true,
        runtimeAdminEnabled: false,
        capabilities: {
          runtimeAdministration: false,
          userManagement: false,
          roleManagement: false,
          tenantManagement: false,
          organisationManagement: false,
          provisioning: false,
          liveInfrastructureDiagnostics: false,
          eventBus: false,
          aiAdministration: false,
        },
      };
    },
  };
}
