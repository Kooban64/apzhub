/**
 * Platform Administration domain service (APZADMIN-002).
 * Metadata CRUD / validate / lifecycle only — NEVER runtime admin / workbench / live probes.
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
  CreateAdministrationActionInput,
  CreateAdministrationCapabilityInput,
  CreateAdministrationCategoryInput,
  CreateAdministrationDashboardInput,
  CreateAdministrationMetadataInput,
  CreateAdministrationModuleInput,
  CreateAdministrationNavigationInput,
  CreateAdministrationPermissionInput,
  CreateAdministrationPolicyInput,
  CreateAdministrationReferenceInput,
  CreateAdministrationRegistrationInput,
  CreateAdministrationSectionInput,
  CreateAdministrationShortcutInput,
  CreateAdministrationWidgetInput,
  TransitionAdministrationLifecycleInput,
  UpdateAdministrationActionInput,
  UpdateAdministrationCapabilityInput,
  UpdateAdministrationCategoryInput,
  UpdateAdministrationDashboardInput,
  UpdateAdministrationMetadataInput,
  UpdateAdministrationModuleMetadataInput,
  UpdateAdministrationNavigationInput,
  UpdateAdministrationPermissionInput,
  UpdateAdministrationPolicyInput,
  UpdateAdministrationRegistrationInput,
  UpdateAdministrationSectionInput,
  UpdateAdministrationShortcutInput,
  UpdateAdministrationWidgetInput,
} from "@apzhub/admin-contracts";
import {
  ADMINISTRATION_LIFECYCLE_STATUSES,
  asAdministrationActionId,
  asAdministrationAuditId,
  asAdministrationCapabilityId,
  asAdministrationCategoryId,
  asAdministrationDashboardId,
  asAdministrationHistoryId,
  asAdministrationMetadataId,
  asAdministrationModuleId,
  asAdministrationNavigationId,
  asAdministrationPermissionId,
  asAdministrationPolicyId,
  asAdministrationReferenceId,
  asAdministrationRegistrationId,
  asAdministrationSectionId,
  asAdministrationShortcutId,
  asAdministrationWidgetId,
} from "@apzhub/admin-contracts";

import { assertAdministrationLifecycleTransition } from "../lifecycle/transitions";
import {
  AdministrationDomainError,
  requireFound,
  type AdministrationFoundationRepos,
} from "../ports/repository-ports";
import {
  validateAdministrationAggregate,
  validateAdministrationCapabilityMetadata,
  validateAdministrationMetadataNotes,
  validateAdministrationNavigationMetadata,
} from "../validation/validate-administration";

export type PlatformAdministrationServiceDeps = {
  readonly repos: AdministrationFoundationRepos;
  readonly now: () => string;
  readonly id: () => string;
  readonly persistenceMode?: "postgres" | "memory";
};

const ADMIN_FACETS = [
  "modules",
  "categories",
  "sections",
  "actions",
  "permissions",
  "audit",
  "history",
  "diagnostics",
  "registrations",
  "metadata",
  "policies",
  "references",
  "capabilities",
  "navigations",
  "shortcuts",
  "dashboards",
  "widgets",
] as const;

export type PlatformAdministrationDomainService = {
  listModules(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationModule[]>;
  getModule(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModule["id"],
  ): Promise<AdministrationModule>;
  createModule(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationModuleInput,
  ): Promise<AdministrationModule>;
  updateModuleMetadata(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationModuleMetadataInput,
  ): Promise<AdministrationModule>;
  archiveModule(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModule["id"],
  ): Promise<AdministrationModule>;
  restoreModule(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModule["id"],
  ): Promise<AdministrationModule>;
  transitionLifecycle(
    ctx: AdministrationRequestContext,
    input: TransitionAdministrationLifecycleInput,
  ): Promise<AdministrationModule>;
  listCategories(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationCategory[]>;
  getCategory(
    ctx: AdministrationRequestContext,
    categoryId: AdministrationCategory["id"],
  ): Promise<AdministrationCategory>;
  createCategory(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationCategoryInput,
  ): Promise<AdministrationCategory>;
  updateCategory(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationCategoryInput,
  ): Promise<AdministrationCategory>;
  listSections(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationSection[]>;
  getSection(
    ctx: AdministrationRequestContext,
    sectionId: AdministrationSection["id"],
  ): Promise<AdministrationSection>;
  createSection(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationSectionInput,
  ): Promise<AdministrationSection>;
  updateSection(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationSectionInput,
  ): Promise<AdministrationSection>;
  listActions(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationAction[]>;
  getAction(
    ctx: AdministrationRequestContext,
    actionId: AdministrationAction["id"],
  ): Promise<AdministrationAction>;
  createAction(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationActionInput,
  ): Promise<AdministrationAction>;
  updateAction(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationActionInput,
  ): Promise<AdministrationAction>;
  listPermissions(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationPermission[]>;
  getPermission(
    ctx: AdministrationRequestContext,
    permissionId: AdministrationPermission["id"],
  ): Promise<AdministrationPermission>;
  createPermission(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationPermissionInput,
  ): Promise<AdministrationPermission>;
  updatePermission(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationPermissionInput,
  ): Promise<AdministrationPermission>;
  listAudit(
    ctx: AdministrationRequestContext,
    moduleId?: AdministrationModule["id"],
  ): Promise<readonly AdministrationAuditEntry[]>;
  getAudit(
    ctx: AdministrationRequestContext,
    auditId: AdministrationAuditEntry["id"],
  ): Promise<AdministrationAuditEntry>;
  listHistory(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModule["id"],
  ): Promise<readonly AdministrationHistory[]>;
  getHistory(
    ctx: AdministrationRequestContext,
    historyId: AdministrationHistory["id"],
  ): Promise<AdministrationHistory>;
  listDiagnostics(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationDiagnostic[]>;
  getDiagnostic(
    ctx: AdministrationRequestContext,
    diagnosticId: AdministrationDiagnostic["id"],
  ): Promise<AdministrationDiagnostic>;
  listRegistrations(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationRegistration[]>;
  getRegistration(
    ctx: AdministrationRequestContext,
    registrationId: AdministrationRegistration["id"],
  ): Promise<AdministrationRegistration>;
  createRegistration(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationRegistrationInput,
  ): Promise<AdministrationRegistration>;
  updateRegistration(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationRegistrationInput,
  ): Promise<AdministrationRegistration>;
  listMetadata(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModule["id"],
  ): Promise<readonly AdministrationMetadata[]>;
  getMetadata(
    ctx: AdministrationRequestContext,
    metadataId: AdministrationMetadata["id"],
  ): Promise<AdministrationMetadata>;
  createMetadata(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationMetadataInput,
  ): Promise<AdministrationMetadata>;
  updateMetadata(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationMetadataInput,
  ): Promise<AdministrationMetadata>;
  listPolicies(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationPolicy[]>;
  getPolicy(
    ctx: AdministrationRequestContext,
    policyId: AdministrationPolicy["id"],
  ): Promise<AdministrationPolicy>;
  createPolicy(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationPolicyInput,
  ): Promise<AdministrationPolicy>;
  updatePolicy(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationPolicyInput,
  ): Promise<AdministrationPolicy>;
  listReferences(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModule["id"],
  ): Promise<readonly AdministrationReference[]>;
  getReference(
    ctx: AdministrationRequestContext,
    referenceId: AdministrationReference["id"],
  ): Promise<AdministrationReference>;
  createReference(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationReferenceInput,
  ): Promise<AdministrationReference>;
  listCapabilities(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationCapability[]>;
  getCapability(
    ctx: AdministrationRequestContext,
    capabilityId: AdministrationCapability["id"],
  ): Promise<AdministrationCapability>;
  createCapability(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationCapabilityInput,
  ): Promise<AdministrationCapability>;
  updateCapability(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationCapabilityInput,
  ): Promise<AdministrationCapability>;
  listNavigations(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationNavigation[]>;
  getNavigation(
    ctx: AdministrationRequestContext,
    navigationId: AdministrationNavigation["id"],
  ): Promise<AdministrationNavigation>;
  createNavigation(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationNavigationInput,
  ): Promise<AdministrationNavigation>;
  updateNavigation(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationNavigationInput,
  ): Promise<AdministrationNavigation>;
  listShortcuts(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationShortcut[]>;
  getShortcut(
    ctx: AdministrationRequestContext,
    shortcutId: AdministrationShortcut["id"],
  ): Promise<AdministrationShortcut>;
  createShortcut(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationShortcutInput,
  ): Promise<AdministrationShortcut>;
  updateShortcut(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationShortcutInput,
  ): Promise<AdministrationShortcut>;
  listDashboards(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationDashboard[]>;
  getDashboard(
    ctx: AdministrationRequestContext,
    dashboardId: AdministrationDashboard["id"],
  ): Promise<AdministrationDashboard>;
  createDashboard(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationDashboardInput,
  ): Promise<AdministrationDashboard>;
  updateDashboard(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationDashboardInput,
  ): Promise<AdministrationDashboard>;
  listWidgets(
    ctx: AdministrationRequestContext,
    dashboardId: AdministrationDashboard["id"],
  ): Promise<readonly AdministrationWidget[]>;
  getWidget(
    ctx: AdministrationRequestContext,
    widgetId: AdministrationWidget["id"],
  ): Promise<AdministrationWidget>;
  createWidget(
    ctx: AdministrationRequestContext,
    input: CreateAdministrationWidgetInput,
  ): Promise<AdministrationWidget>;
  updateWidget(
    ctx: AdministrationRequestContext,
    input: UpdateAdministrationWidgetInput,
  ): Promise<AdministrationWidget>;
  diagnosticsHealth(ctx: AdministrationRequestContext): Promise<{
    readonly status: "healthy" | "degraded" | "unavailable";
    readonly persistenceMode: "postgres" | "memory";
    readonly administrationEnabled: true;
    readonly workbenchEnabled: false;
    readonly httpEnabled: false;
    readonly runtimeAdminEnabled: false;
    readonly checkedAt: string;
  }>;
  diagnosticsReadiness(ctx: AdministrationRequestContext): Promise<{
    readonly ready: boolean;
    readonly administrationEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly workbenchEnabled: false;
    readonly httpEnabled: false;
    readonly runtimeAdminEnabled: false;
    readonly capabilities: readonly string[];
  }>;
  diagnosticsCapabilities(ctx: AdministrationRequestContext): Promise<{
    readonly workbench: false;
    readonly http: false;
    readonly runtimeAdmin: false;
    readonly lifecycle: readonly (typeof ADMINISTRATION_LIFECYCLE_STATUSES)[number][];
    readonly facets: readonly string[];
  }>;
};

function assertCtx(ctx: AdministrationRequestContext): void {
  if (!ctx.tenantId?.trim()) {
    throw new AdministrationDomainError("validation_error", "tenantId is required");
  }
  if (!ctx.userId?.trim()) {
    throw new AdministrationDomainError("validation_error", "userId is required");
  }
}

async function appendAudit(
  deps: PlatformAdministrationServiceDeps,
  ctx: AdministrationRequestContext,
  moduleId: AdministrationModule["id"] | undefined,
  action: AdministrationAuditEntry["action"],
  detail?: string,
): Promise<void> {
  const entry: AdministrationAuditEntry = {
    id: asAdministrationAuditId(deps.id()),
    tenantId: ctx.tenantId,
    moduleId,
    action,
    actorUserId: ctx.userId,
    detail,
    createdAt: deps.now(),
  };
  await deps.repos.audits.append(ctx, entry);
}

async function appendHistory(
  deps: PlatformAdministrationServiceDeps,
  ctx: AdministrationRequestContext,
  moduleId: AdministrationModule["id"],
  summary: string,
): Promise<void> {
  await deps.repos.history.create(ctx, {
    id: asAdministrationHistoryId(deps.id()),
    moduleId,
    summary,
    actorUserId: ctx.userId,
    createdAt: deps.now(),
  });
}

export function createPlatformAdministrationService(
  deps: PlatformAdministrationServiceDeps,
): PlatformAdministrationDomainService {
  if (!deps?.repos) {
    throw new AdministrationDomainError(
      "missing_repos",
      "createPlatformAdministrationService requires explicit repos",
    );
  }

  const persistenceMode = deps.persistenceMode ?? "memory";

  async function performLifecycleTransition(
    ctx: AdministrationRequestContext,
    input: TransitionAdministrationLifecycleInput,
  ): Promise<AdministrationModule> {
    assertCtx(ctx);
    const existing = requireFound(
      await deps.repos.modules.get(ctx, input.moduleId),
      "module",
      input.moduleId,
    );
    assertAdministrationLifecycleTransition(existing.status, input.to);
    const now = deps.now();
    const updated: AdministrationModule = {
      ...existing,
      status: input.to,
      updatedAt: now,
      updatedBy: ctx.userId,
      revision: existing.revision + 1,
    };
    validateAdministrationAggregate(updated);
    const saved = await deps.repos.modules.update(ctx, updated);
    await appendAudit(
      deps,
      ctx,
      saved.id,
      input.to === "archived"
        ? "archived"
        : input.to === "registered"
          ? "registered"
          : "lifecycle_changed",
      input.reason,
    );
    await appendHistory(
      deps,
      ctx,
      saved.id,
      `Lifecycle ${existing.status} → ${input.to}`,
    );
    return saved;
  }

  return {
    async listModules(ctx) {
      assertCtx(ctx);
      return deps.repos.modules.list(ctx);
    },

    async getModule(ctx, moduleId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.modules.get(ctx, moduleId),
        "module",
        moduleId,
      );
    },

    async createModule(ctx, input) {
      assertCtx(ctx);
      const now = deps.now();
      const module: AdministrationModule = {
        id: asAdministrationModuleId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        key: input.key,
        name: input.name,
        description: input.description,
        status: "draft",
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      };
      validateAdministrationAggregate(module);
      const saved = await deps.repos.modules.create(ctx, module);
      await appendAudit(deps, ctx, saved.id, "created");
      await appendHistory(deps, ctx, saved.id, `Module ${saved.key} created`);
      return saved;
    },

    async updateModuleMetadata(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.modules.get(ctx, input.moduleId),
        "module",
        input.moduleId,
      );
      const now = deps.now();
      const updated: AdministrationModule = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null
            ? undefined
            : (input.description ?? existing.description),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? existing.organisationId),
        updatedAt: now,
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      validateAdministrationAggregate(updated);
      const saved = await deps.repos.modules.update(ctx, updated);
      await appendAudit(deps, ctx, saved.id, "updated");
      return saved;
    },

    async archiveModule(ctx, moduleId) {
      return performLifecycleTransition(ctx, { moduleId, to: "archived" });
    },

    async restoreModule(ctx, moduleId) {
      return performLifecycleTransition(ctx, { moduleId, to: "draft" });
    },

    async transitionLifecycle(ctx, input) {
      return performLifecycleTransition(ctx, input);
    },

    async listCategories(ctx) {
      assertCtx(ctx);
      return deps.repos.categories.list(ctx);
    },

    async getCategory(ctx, categoryId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.categories.get(ctx, categoryId),
        "category",
        categoryId,
      );
    },

    async createCategory(ctx, input) {
      assertCtx(ctx);
      if (input.moduleId) {
        requireFound(
          await deps.repos.modules.get(ctx, input.moduleId),
          "module",
          input.moduleId,
        );
      }
      const now = deps.now();
      const category: AdministrationCategory = {
        id: asAdministrationCategoryId(deps.id()),
        tenantId: ctx.tenantId,
        moduleId: input.moduleId,
        key: input.key,
        name: input.name,
        description: input.description,
        ordering: input.ordering ?? 0,
        createdAt: now,
        updatedAt: now,
      };
      return deps.repos.categories.create(ctx, category);
    },

    async updateCategory(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.categories.get(ctx, input.categoryId),
        "category",
        input.categoryId,
      );
      const updated: AdministrationCategory = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null
            ? undefined
            : (input.description ?? existing.description),
        ordering: input.ordering ?? existing.ordering,
        updatedAt: deps.now(),
      };
      return deps.repos.categories.update(ctx, updated);
    },

    async listSections(ctx) {
      assertCtx(ctx);
      return deps.repos.sections.list(ctx);
    },

    async getSection(ctx, sectionId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.sections.get(ctx, sectionId),
        "section",
        sectionId,
      );
    },

    async createSection(ctx, input) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.categories.get(ctx, input.categoryId),
        "category",
        input.categoryId,
      );
      const now = deps.now();
      const section: AdministrationSection = {
        id: asAdministrationSectionId(deps.id()),
        tenantId: ctx.tenantId,
        categoryId: input.categoryId,
        key: input.key,
        name: input.name,
        description: input.description,
        ordering: input.ordering ?? 0,
        createdAt: now,
        updatedAt: now,
      };
      return deps.repos.sections.create(ctx, section);
    },

    async updateSection(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.sections.get(ctx, input.sectionId),
        "section",
        input.sectionId,
      );
      const updated: AdministrationSection = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null
            ? undefined
            : (input.description ?? existing.description),
        ordering: input.ordering ?? existing.ordering,
        updatedAt: deps.now(),
      };
      return deps.repos.sections.update(ctx, updated);
    },

    async listActions(ctx) {
      assertCtx(ctx);
      return deps.repos.actions.list(ctx);
    },

    async getAction(ctx, actionId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.actions.get(ctx, actionId),
        "action",
        actionId,
      );
    },

    async createAction(ctx, input) {
      assertCtx(ctx);
      const now = deps.now();
      const action: AdministrationAction = {
        id: asAdministrationActionId(deps.id()),
        tenantId: ctx.tenantId,
        moduleId: input.moduleId,
        sectionId: input.sectionId,
        key: input.key,
        name: input.name,
        description: input.description,
        kind: input.kind,
        permissionKeys: input.permissionKeys,
        createdAt: now,
        updatedAt: now,
      };
      return deps.repos.actions.create(ctx, action);
    },

    async updateAction(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.actions.get(ctx, input.actionId),
        "action",
        input.actionId,
      );
      const updated: AdministrationAction = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null
            ? undefined
            : (input.description ?? existing.description),
        kind: input.kind ?? existing.kind,
        permissionKeys:
          input.permissionKeys === null
            ? undefined
            : (input.permissionKeys ?? existing.permissionKeys),
        updatedAt: deps.now(),
      };
      return deps.repos.actions.update(ctx, updated);
    },

    async listPermissions(ctx) {
      assertCtx(ctx);
      return deps.repos.permissions.list(ctx);
    },

    async getPermission(ctx, permissionId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.permissions.get(ctx, permissionId),
        "permission",
        permissionId,
      );
    },

    async createPermission(ctx, input) {
      assertCtx(ctx);
      const now = deps.now();
      const permission: AdministrationPermission = {
        id: asAdministrationPermissionId(deps.id()),
        tenantId: ctx.tenantId,
        key: input.key,
        name: input.name,
        description: input.description,
        createdAt: now,
        updatedAt: now,
      };
      return deps.repos.permissions.create(ctx, permission);
    },

    async updatePermission(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.permissions.get(ctx, input.permissionId),
        "permission",
        input.permissionId,
      );
      const updated: AdministrationPermission = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null
            ? undefined
            : (input.description ?? existing.description),
        updatedAt: deps.now(),
      };
      return deps.repos.permissions.update(ctx, updated);
    },

    async listAudit(ctx, moduleId) {
      assertCtx(ctx);
      const entries = await deps.repos.audits.list(ctx);
      if (!moduleId) return entries;
      return entries.filter((entry) => entry.moduleId === moduleId);
    },

    async getAudit(ctx, auditId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.audits.get(ctx, auditId),
        "audit",
        auditId,
      );
    },

    async listHistory(ctx, moduleId) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.modules.get(ctx, moduleId),
        "module",
        moduleId,
      );
      return deps.repos.history.listByModule(ctx, moduleId);
    },

    async getHistory(ctx, historyId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.history.get(ctx, historyId),
        "history",
        historyId,
      );
    },

    async listDiagnostics(ctx) {
      assertCtx(ctx);
      return deps.repos.diagnostics.list(ctx);
    },

    async getDiagnostic(ctx, diagnosticId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.diagnostics.get(ctx, diagnosticId),
        "diagnostic",
        diagnosticId,
      );
    },

    async listRegistrations(ctx) {
      assertCtx(ctx);
      return deps.repos.registrations.list(ctx);
    },

    async getRegistration(ctx, registrationId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.registrations.get(ctx, registrationId),
        "registration",
        registrationId,
      );
    },

    async createRegistration(ctx, input) {
      assertCtx(ctx);
      const now = deps.now();
      const registration: AdministrationRegistration = {
        id: asAdministrationRegistrationId(deps.id()),
        tenantId: ctx.tenantId,
        moduleKey: input.moduleKey,
        version: input.version,
        status: "registered",
        registeredAt: now,
        registeredBy: ctx.userId,
        notes: input.notes,
      };
      const saved = await deps.repos.registrations.create(ctx, registration);
      await appendAudit(deps, ctx, undefined, "registered", input.moduleKey);
      return saved;
    },

    async updateRegistration(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.registrations.get(ctx, input.registrationId),
        "registration",
        input.registrationId,
      );
      if (input.status) {
        assertAdministrationLifecycleTransition(existing.status, input.status);
      }
      const updated: AdministrationRegistration = {
        ...existing,
        version: input.version ?? existing.version,
        notes:
          input.notes === null ? undefined : (input.notes ?? existing.notes),
        status: input.status ?? existing.status,
      };
      return deps.repos.registrations.update(ctx, updated);
    },

    async listMetadata(ctx, moduleId) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.modules.get(ctx, moduleId),
        "module",
        moduleId,
      );
      return deps.repos.metadata.listByModule(ctx, moduleId);
    },

    async getMetadata(ctx, metadataId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.metadata.get(ctx, metadataId),
        "metadata",
        metadataId,
      );
    },

    async createMetadata(ctx, input) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.modules.get(ctx, input.moduleId),
        "module",
        input.moduleId,
      );
      const metadata: AdministrationMetadata = {
        id: asAdministrationMetadataId(deps.id()),
        moduleId: input.moduleId,
        labels: input.labels,
        tags: input.tags,
        notes: input.notes,
      };
      validateAdministrationMetadataNotes(metadata);
      return deps.repos.metadata.create(ctx, metadata);
    },

    async updateMetadata(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.metadata.get(ctx, input.metadataId),
        "metadata",
        input.metadataId,
      );
      const updated: AdministrationMetadata = {
        ...existing,
        labels:
          input.labels === null ? undefined : (input.labels ?? existing.labels),
        tags: input.tags === null ? undefined : (input.tags ?? existing.tags),
        notes:
          input.notes === null ? undefined : (input.notes ?? existing.notes),
      };
      validateAdministrationMetadataNotes(updated);
      return deps.repos.metadata.update(ctx, updated);
    },

    async listPolicies(ctx) {
      assertCtx(ctx);
      return deps.repos.policies.list(ctx);
    },

    async getPolicy(ctx, policyId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.policies.get(ctx, policyId),
        "policy",
        policyId,
      );
    },

    async createPolicy(ctx, input) {
      assertCtx(ctx);
      const now = deps.now();
      const policy: AdministrationPolicy = {
        id: asAdministrationPolicyId(deps.id()),
        tenantId: ctx.tenantId,
        moduleId: input.moduleId,
        kind: input.kind,
        key: input.key,
        name: input.name,
        description: input.description,
        createdAt: now,
        updatedAt: now,
      };
      const saved = await deps.repos.policies.create(ctx, policy);
      await appendAudit(deps, ctx, input.moduleId, "policy_attached", input.key);
      return saved;
    },

    async updatePolicy(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.policies.get(ctx, input.policyId),
        "policy",
        input.policyId,
      );
      const updated: AdministrationPolicy = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null
            ? undefined
            : (input.description ?? existing.description),
        kind: input.kind ?? existing.kind,
        updatedAt: deps.now(),
      };
      return deps.repos.policies.update(ctx, updated);
    },

    async listReferences(ctx, moduleId) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.modules.get(ctx, moduleId),
        "module",
        moduleId,
      );
      return deps.repos.references.listByModule(ctx, moduleId);
    },

    async getReference(ctx, referenceId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.references.get(ctx, referenceId),
        "reference",
        referenceId,
      );
    },

    async createReference(ctx, input) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.modules.get(ctx, input.moduleId),
        "module",
        input.moduleId,
      );
      const reference: AdministrationReference = {
        id: asAdministrationReferenceId(deps.id()),
        moduleId: input.moduleId,
        kind: input.kind,
        resourceId: input.resourceId,
        label: input.label,
      };
      return deps.repos.references.create(ctx, reference);
    },

    async listCapabilities(ctx) {
      assertCtx(ctx);
      return deps.repos.capabilities.list(ctx);
    },

    async getCapability(ctx, capabilityId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.capabilities.get(ctx, capabilityId),
        "capability",
        capabilityId,
      );
    },

    async createCapability(ctx, input) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.modules.get(ctx, input.moduleId),
        "module",
        input.moduleId,
      );
      const now = deps.now();
      const capability: AdministrationCapability = {
        id: asAdministrationCapabilityId(deps.id()),
        tenantId: ctx.tenantId,
        moduleId: input.moduleId,
        key: input.key,
        name: input.name,
        description: input.description,
        enabled: input.enabled ?? false,
        available: input.available ?? false,
        healthy: input.healthy ?? false,
        certified: input.certified ?? false,
        productionReady: input.productionReady ?? false,
        limitations: input.limitations,
        owner: input.owner,
        version: input.version,
        documentation: input.documentation,
        createdAt: now,
        updatedAt: now,
      };
      validateAdministrationCapabilityMetadata(capability);
      return deps.repos.capabilities.create(ctx, capability);
    },

    async updateCapability(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.capabilities.get(ctx, input.capabilityId),
        "capability",
        input.capabilityId,
      );
      const updated: AdministrationCapability = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null
            ? undefined
            : (input.description ?? existing.description),
        enabled: input.enabled ?? existing.enabled,
        available: input.available ?? existing.available,
        healthy: input.healthy ?? existing.healthy,
        certified: input.certified ?? existing.certified,
        productionReady: input.productionReady ?? existing.productionReady,
        limitations:
          input.limitations === null
            ? undefined
            : (input.limitations ?? existing.limitations),
        owner: input.owner ?? existing.owner,
        version: input.version ?? existing.version,
        documentation:
          input.documentation === null
            ? undefined
            : (input.documentation ?? existing.documentation),
        updatedAt: deps.now(),
      };
      validateAdministrationCapabilityMetadata(updated);
      return deps.repos.capabilities.update(ctx, updated);
    },

    async listNavigations(ctx) {
      assertCtx(ctx);
      return deps.repos.navigations.list(ctx);
    },

    async getNavigation(ctx, navigationId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.navigations.get(ctx, navigationId),
        "navigation",
        navigationId,
      );
    },

    async createNavigation(ctx, input) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.modules.get(ctx, input.moduleId),
        "module",
        input.moduleId,
      );
      const now = deps.now();
      const navigation: AdministrationNavigation = {
        id: asAdministrationNavigationId(deps.id()),
        tenantId: ctx.tenantId,
        moduleId: input.moduleId,
        categoryId: input.categoryId,
        sectionId: input.sectionId,
        key: input.key,
        label: input.label,
        ordering: input.ordering,
        visibility: input.visibility,
        permissionKeys: input.permissionKeys,
        iconKey: input.iconKey,
        routePath: input.routePath,
        createdAt: now,
        updatedAt: now,
      };
      validateAdministrationNavigationMetadata(navigation);
      return deps.repos.navigations.create(ctx, navigation);
    },

    async updateNavigation(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.navigations.get(ctx, input.navigationId),
        "navigation",
        input.navigationId,
      );
      const updated: AdministrationNavigation = {
        ...existing,
        label: input.label ?? existing.label,
        ordering: input.ordering ?? existing.ordering,
        visibility: input.visibility ?? existing.visibility,
        permissionKeys:
          input.permissionKeys === null
            ? undefined
            : (input.permissionKeys ?? existing.permissionKeys),
        iconKey:
          input.iconKey === null
            ? undefined
            : (input.iconKey ?? existing.iconKey),
        routePath:
          input.routePath === null
            ? undefined
            : (input.routePath ?? existing.routePath),
        updatedAt: deps.now(),
      };
      validateAdministrationNavigationMetadata(updated);
      return deps.repos.navigations.update(ctx, updated);
    },

    async listShortcuts(ctx) {
      assertCtx(ctx);
      return deps.repos.shortcuts.list(ctx);
    },

    async getShortcut(ctx, shortcutId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.shortcuts.get(ctx, shortcutId),
        "shortcut",
        shortcutId,
      );
    },

    async createShortcut(ctx, input) {
      assertCtx(ctx);
      const now = deps.now();
      const shortcut: AdministrationShortcut = {
        id: asAdministrationShortcutId(deps.id()),
        tenantId: ctx.tenantId,
        moduleId: input.moduleId,
        actionId: input.actionId,
        key: input.key,
        label: input.label,
        ordering: input.ordering,
        permissionKeys: input.permissionKeys,
        createdAt: now,
        updatedAt: now,
      };
      return deps.repos.shortcuts.create(ctx, shortcut);
    },

    async updateShortcut(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.shortcuts.get(ctx, input.shortcutId),
        "shortcut",
        input.shortcutId,
      );
      const updated: AdministrationShortcut = {
        ...existing,
        label: input.label ?? existing.label,
        ordering: input.ordering ?? existing.ordering,
        permissionKeys:
          input.permissionKeys === null
            ? undefined
            : (input.permissionKeys ?? existing.permissionKeys),
        updatedAt: deps.now(),
      };
      return deps.repos.shortcuts.update(ctx, updated);
    },

    async listDashboards(ctx) {
      assertCtx(ctx);
      return deps.repos.dashboards.list(ctx);
    },

    async getDashboard(ctx, dashboardId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.dashboards.get(ctx, dashboardId),
        "dashboard",
        dashboardId,
      );
    },

    async createDashboard(ctx, input) {
      assertCtx(ctx);
      const now = deps.now();
      const dashboard: AdministrationDashboard = {
        id: asAdministrationDashboardId(deps.id()),
        tenantId: ctx.tenantId,
        moduleId: input.moduleId,
        key: input.key,
        name: input.name,
        description: input.description,
        ordering: input.ordering ?? 0,
        createdAt: now,
        updatedAt: now,
      };
      return deps.repos.dashboards.create(ctx, dashboard);
    },

    async updateDashboard(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.dashboards.get(ctx, input.dashboardId),
        "dashboard",
        input.dashboardId,
      );
      const updated: AdministrationDashboard = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null
            ? undefined
            : (input.description ?? existing.description),
        ordering: input.ordering ?? existing.ordering,
        updatedAt: deps.now(),
      };
      return deps.repos.dashboards.update(ctx, updated);
    },

    async listWidgets(ctx, dashboardId) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.dashboards.get(ctx, dashboardId),
        "dashboard",
        dashboardId,
      );
      return deps.repos.widgets.listByDashboard(ctx, dashboardId);
    },

    async getWidget(ctx, widgetId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.widgets.get(ctx, widgetId),
        "widget",
        widgetId,
      );
    },

    async createWidget(ctx, input) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.dashboards.get(ctx, input.dashboardId),
        "dashboard",
        input.dashboardId,
      );
      const now = deps.now();
      const widget: AdministrationWidget = {
        id: asAdministrationWidgetId(deps.id()),
        dashboardId: input.dashboardId,
        key: input.key,
        name: input.name,
        kind: input.kind,
        ordering: input.ordering ?? 0,
        createdAt: now,
        updatedAt: now,
      };
      return deps.repos.widgets.create(ctx, widget);
    },

    async updateWidget(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.widgets.get(ctx, input.widgetId),
        "widget",
        input.widgetId,
      );
      const updated: AdministrationWidget = {
        ...existing,
        name: input.name ?? existing.name,
        kind: input.kind ?? existing.kind,
        ordering: input.ordering ?? existing.ordering,
        updatedAt: deps.now(),
      };
      return deps.repos.widgets.update(ctx, updated);
    },

    async diagnosticsHealth(ctx) {
      assertCtx(ctx);
      return {
        status: "healthy" as const,
        persistenceMode,
        administrationEnabled: true as const,
        workbenchEnabled: false as const,
        httpEnabled: false as const,
        runtimeAdminEnabled: false as const,
        checkedAt: deps.now(),
      };
    },

    async diagnosticsReadiness(ctx) {
      assertCtx(ctx);
      return {
        ready: true,
        administrationEnabled: true as const,
        persistenceMode,
        workbenchEnabled: false as const,
        httpEnabled: false as const,
        runtimeAdminEnabled: false as const,
        capabilities: ADMIN_FACETS,
      };
    },

    async diagnosticsCapabilities() {
      return {
        workbench: false as const,
        http: false as const,
        runtimeAdmin: false as const,
        lifecycle: ADMINISTRATION_LIFECYCLE_STATUSES,
        facets: ADMIN_FACETS,
      };
    },
  };
}
