/**
 * Nested Administration Platform gateway facets (APZADMIN-002).
 * Metadata / lifecycle only — no runtime admin actions, workbench, or live probes.
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
  AdministrationSection,
  AdministrationShortcut,
  AdministrationWidget,
} from "../domain/administration";
import type {
  AdministrationActionKind,
  AdministrationLifecycleStatus,
  AdministrationModuleKey,
  AdministrationNavigationVisibility,
  AdministrationPolicyKind,
  AdministrationReferenceKind,
  AdministrationWidgetKind,
} from "../enums/catalogue";
import type {
  AdministrationActionId,
  AdministrationAuditId,
  AdministrationCapabilityId,
  AdministrationCategoryId,
  AdministrationDashboardId,
  AdministrationDiagnosticId,
  AdministrationHistoryId,
  AdministrationMetadataId,
  AdministrationModuleId,
  AdministrationNavigationId,
  AdministrationPermissionId,
  AdministrationPolicyId,
  AdministrationReferenceId,
  AdministrationRegistrationId,
  AdministrationSectionId,
  AdministrationShortcutId,
  AdministrationWidgetId,
} from "../identifiers";

/** Structurally compatible with ServiceRequestContext — mapped in platform-services. */
export type AdministrationPlatformServiceContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly requestId?: string;
};

export type CreateAdministrationModuleInput = {
  readonly key: AdministrationModuleKey;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
};

export type UpdateAdministrationModuleMetadataInput = {
  readonly moduleId: AdministrationModuleId;
  readonly name?: string;
  readonly description?: string | null;
  readonly organisationId?: string | null;
};

export type TransitionAdministrationLifecycleInput = {
  readonly moduleId: AdministrationModuleId;
  readonly to: AdministrationLifecycleStatus;
  readonly reason?: string;
};

export type CreateAdministrationCategoryInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly ordering?: number;
  readonly moduleId?: AdministrationModuleId;
};

export type UpdateAdministrationCategoryInput = {
  readonly categoryId: AdministrationCategoryId;
  readonly name?: string;
  readonly description?: string | null;
  readonly ordering?: number;
};

export type CreateAdministrationSectionInput = {
  readonly categoryId: AdministrationCategoryId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly ordering?: number;
};

export type UpdateAdministrationSectionInput = {
  readonly sectionId: AdministrationSectionId;
  readonly name?: string;
  readonly description?: string | null;
  readonly ordering?: number;
};

export type CreateAdministrationActionInput = {
  readonly key: string;
  readonly name: string;
  readonly kind: AdministrationActionKind;
  readonly description?: string;
  readonly moduleId?: AdministrationModuleId;
  readonly sectionId?: AdministrationSectionId;
  readonly permissionKeys?: readonly string[];
};

export type UpdateAdministrationActionInput = {
  readonly actionId: AdministrationActionId;
  readonly name?: string;
  readonly description?: string | null;
  readonly kind?: AdministrationActionKind;
  readonly permissionKeys?: readonly string[] | null;
};

export type CreateAdministrationPermissionInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
};

export type UpdateAdministrationPermissionInput = {
  readonly permissionId: AdministrationPermissionId;
  readonly name?: string;
  readonly description?: string | null;
};

export type CreateAdministrationRegistrationInput = {
  readonly moduleKey: AdministrationModuleKey;
  readonly version: string;
  readonly notes?: string;
};

export type UpdateAdministrationRegistrationInput = {
  readonly registrationId: AdministrationRegistrationId;
  readonly version?: string;
  readonly notes?: string | null;
  readonly status?: AdministrationLifecycleStatus;
};

export type CreateAdministrationMetadataInput = {
  readonly moduleId: AdministrationModuleId;
  readonly labels?: Readonly<Record<string, string>>;
  readonly tags?: readonly string[];
  readonly notes?: string;
};

export type UpdateAdministrationMetadataInput = {
  readonly metadataId: AdministrationMetadataId;
  readonly labels?: Readonly<Record<string, string>> | null;
  readonly tags?: readonly string[] | null;
  readonly notes?: string | null;
};

export type CreateAdministrationPolicyInput = {
  readonly kind: AdministrationPolicyKind;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly moduleId?: AdministrationModuleId;
};

export type UpdateAdministrationPolicyInput = {
  readonly policyId: AdministrationPolicyId;
  readonly name?: string;
  readonly description?: string | null;
  readonly kind?: AdministrationPolicyKind;
};

export type CreateAdministrationReferenceInput = {
  readonly moduleId: AdministrationModuleId;
  readonly kind: AdministrationReferenceKind;
  readonly resourceId: string;
  readonly label?: string;
};

export type CreateAdministrationCapabilityInput = {
  readonly moduleId: AdministrationModuleId;
  readonly key: string;
  readonly name: string;
  readonly owner: string;
  readonly version: string;
  readonly description?: string;
  readonly enabled?: boolean;
  readonly available?: boolean;
  readonly healthy?: boolean;
  readonly certified?: boolean;
  readonly productionReady?: boolean;
  readonly limitations?: readonly string[];
  readonly documentation?: string;
};

export type UpdateAdministrationCapabilityInput = {
  readonly capabilityId: AdministrationCapabilityId;
  readonly name?: string;
  readonly description?: string | null;
  readonly enabled?: boolean;
  readonly available?: boolean;
  readonly healthy?: boolean;
  readonly certified?: boolean;
  readonly productionReady?: boolean;
  readonly limitations?: readonly string[] | null;
  readonly owner?: string;
  readonly version?: string;
  readonly documentation?: string | null;
};

export type CreateAdministrationNavigationInput = {
  readonly moduleId: AdministrationModuleId;
  readonly key: string;
  readonly label: string;
  readonly ordering: number;
  readonly visibility: AdministrationNavigationVisibility;
  readonly categoryId?: AdministrationCategoryId;
  readonly sectionId?: AdministrationSectionId;
  readonly permissionKeys?: readonly string[];
  readonly iconKey?: string;
  readonly routePath?: string;
};

export type UpdateAdministrationNavigationInput = {
  readonly navigationId: AdministrationNavigationId;
  readonly label?: string;
  readonly ordering?: number;
  readonly visibility?: AdministrationNavigationVisibility;
  readonly permissionKeys?: readonly string[] | null;
  readonly iconKey?: string | null;
  readonly routePath?: string | null;
};

export type CreateAdministrationShortcutInput = {
  readonly key: string;
  readonly label: string;
  readonly ordering: number;
  readonly moduleId?: AdministrationModuleId;
  readonly actionId?: AdministrationActionId;
  readonly permissionKeys?: readonly string[];
};

export type UpdateAdministrationShortcutInput = {
  readonly shortcutId: AdministrationShortcutId;
  readonly label?: string;
  readonly ordering?: number;
  readonly permissionKeys?: readonly string[] | null;
};

export type CreateAdministrationDashboardInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly ordering?: number;
  readonly moduleId?: AdministrationModuleId;
};

export type UpdateAdministrationDashboardInput = {
  readonly dashboardId: AdministrationDashboardId;
  readonly name?: string;
  readonly description?: string | null;
  readonly ordering?: number;
};

export type CreateAdministrationWidgetInput = {
  readonly dashboardId: AdministrationDashboardId;
  readonly key: string;
  readonly name: string;
  readonly kind: AdministrationWidgetKind;
  readonly ordering?: number;
};

export type UpdateAdministrationWidgetInput = {
  readonly widgetId: AdministrationWidgetId;
  readonly name?: string;
  readonly kind?: AdministrationWidgetKind;
  readonly ordering?: number;
};

export type AdministrationDiagnosticsHealth = {
  readonly status: "healthy" | "degraded" | "unavailable";
  readonly persistenceMode: "postgres" | "memory";
  readonly administrationEnabled: true;
  readonly workbenchEnabled: false;
  readonly httpEnabled: false;
  readonly runtimeAdminEnabled: false;
  readonly checkedAt: string;
};

export type AdministrationDiagnosticsReadiness = {
  readonly ready: boolean;
  readonly administrationEnabled: true;
  readonly persistenceMode: "postgres" | "memory";
  readonly workbenchEnabled: false;
  readonly httpEnabled: false;
  readonly runtimeAdminEnabled: false;
  readonly capabilities: readonly string[];
};

export type AdministrationDiagnosticsCapabilities = {
  readonly workbench: false;
  readonly http: false;
  readonly runtimeAdmin: false;
  readonly lifecycle: readonly AdministrationLifecycleStatus[];
  readonly facets: readonly string[];
};

export type AdministrationModulesService = {
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationModule[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    moduleId: AdministrationModuleId,
  ): Promise<AdministrationModule>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationModuleInput,
  ): Promise<AdministrationModule>;
  updateMetadata(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationModuleMetadataInput,
  ): Promise<AdministrationModule>;
  archive(
    ctx: AdministrationPlatformServiceContext,
    moduleId: AdministrationModuleId,
  ): Promise<AdministrationModule>;
  restore(
    ctx: AdministrationPlatformServiceContext,
    moduleId: AdministrationModuleId,
  ): Promise<AdministrationModule>;
  transition(
    ctx: AdministrationPlatformServiceContext,
    input: TransitionAdministrationLifecycleInput,
  ): Promise<AdministrationModule>;
};

export type AdministrationCategoriesService = {
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationCategory[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    categoryId: AdministrationCategoryId,
  ): Promise<AdministrationCategory>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationCategoryInput,
  ): Promise<AdministrationCategory>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationCategoryInput,
  ): Promise<AdministrationCategory>;
};

export type AdministrationSectionsService = {
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationSection[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    sectionId: AdministrationSectionId,
  ): Promise<AdministrationSection>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationSectionInput,
  ): Promise<AdministrationSection>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationSectionInput,
  ): Promise<AdministrationSection>;
};

export type AdministrationActionsService = {
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationAction[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    actionId: AdministrationActionId,
  ): Promise<AdministrationAction>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationActionInput,
  ): Promise<AdministrationAction>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationActionInput,
  ): Promise<AdministrationAction>;
};

export type AdministrationPermissionsService = {
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationPermission[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    permissionId: AdministrationPermissionId,
  ): Promise<AdministrationPermission>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationPermissionInput,
  ): Promise<AdministrationPermission>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationPermissionInput,
  ): Promise<AdministrationPermission>;
};

export type AdministrationAuditService = {
  list(
    ctx: AdministrationPlatformServiceContext,
    moduleId?: AdministrationModuleId,
  ): Promise<readonly AdministrationAuditEntry[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    auditId: AdministrationAuditId,
  ): Promise<AdministrationAuditEntry>;
};

export type AdministrationHistoryService = {
  list(
    ctx: AdministrationPlatformServiceContext,
    moduleId: AdministrationModuleId,
  ): Promise<readonly AdministrationHistory[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    historyId: AdministrationHistoryId,
  ): Promise<AdministrationHistory>;
};

export type AdministrationDiagnosticsService = {
  health(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<AdministrationDiagnosticsHealth>;
  readiness(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<AdministrationDiagnosticsReadiness>;
  capabilities(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<AdministrationDiagnosticsCapabilities>;
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationDiagnostic[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    diagnosticId: AdministrationDiagnosticId,
  ): Promise<AdministrationDiagnostic>;
};

export type AdministrationRegistrationsService = {
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationRegistration[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    registrationId: AdministrationRegistrationId,
  ): Promise<AdministrationRegistration>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationRegistrationInput,
  ): Promise<AdministrationRegistration>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationRegistrationInput,
  ): Promise<AdministrationRegistration>;
};

export type AdministrationMetadataService = {
  list(
    ctx: AdministrationPlatformServiceContext,
    moduleId: AdministrationModuleId,
  ): Promise<readonly AdministrationMetadata[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    metadataId: AdministrationMetadataId,
  ): Promise<AdministrationMetadata>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationMetadataInput,
  ): Promise<AdministrationMetadata>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationMetadataInput,
  ): Promise<AdministrationMetadata>;
};

export type AdministrationPoliciesService = {
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationPolicy[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    policyId: AdministrationPolicyId,
  ): Promise<AdministrationPolicy>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationPolicyInput,
  ): Promise<AdministrationPolicy>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationPolicyInput,
  ): Promise<AdministrationPolicy>;
};

export type AdministrationReferencesService = {
  list(
    ctx: AdministrationPlatformServiceContext,
    moduleId: AdministrationModuleId,
  ): Promise<readonly AdministrationReference[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    referenceId: AdministrationReferenceId,
  ): Promise<AdministrationReference>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationReferenceInput,
  ): Promise<AdministrationReference>;
};

export type AdministrationCapabilitiesService = {
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationCapability[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    capabilityId: AdministrationCapabilityId,
  ): Promise<AdministrationCapability>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationCapabilityInput,
  ): Promise<AdministrationCapability>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationCapabilityInput,
  ): Promise<AdministrationCapability>;
};

export type AdministrationNavigationsService = {
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationNavigation[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    navigationId: AdministrationNavigationId,
  ): Promise<AdministrationNavigation>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationNavigationInput,
  ): Promise<AdministrationNavigation>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationNavigationInput,
  ): Promise<AdministrationNavigation>;
};

export type AdministrationShortcutsService = {
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationShortcut[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    shortcutId: AdministrationShortcutId,
  ): Promise<AdministrationShortcut>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationShortcutInput,
  ): Promise<AdministrationShortcut>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationShortcutInput,
  ): Promise<AdministrationShortcut>;
};

export type AdministrationDashboardsService = {
  list(
    ctx: AdministrationPlatformServiceContext,
  ): Promise<readonly AdministrationDashboard[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    dashboardId: AdministrationDashboardId,
  ): Promise<AdministrationDashboard>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationDashboardInput,
  ): Promise<AdministrationDashboard>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationDashboardInput,
  ): Promise<AdministrationDashboard>;
};

export type AdministrationWidgetsService = {
  list(
    ctx: AdministrationPlatformServiceContext,
    dashboardId: AdministrationDashboardId,
  ): Promise<readonly AdministrationWidget[]>;
  get(
    ctx: AdministrationPlatformServiceContext,
    widgetId: AdministrationWidgetId,
  ): Promise<AdministrationWidget>;
  create(
    ctx: AdministrationPlatformServiceContext,
    input: CreateAdministrationWidgetInput,
  ): Promise<AdministrationWidget>;
  update(
    ctx: AdministrationPlatformServiceContext,
    input: UpdateAdministrationWidgetInput,
  ): Promise<AdministrationWidget>;
};

/**
 * Nested administration gateway surface (APZADMIN-002).
 * Products consume via PlatformServiceGateway.administration — never persistence repos.
 */
export type AdministrationPlatformGateway = {
  readonly modules: AdministrationModulesService;
  readonly categories: AdministrationCategoriesService;
  readonly sections: AdministrationSectionsService;
  readonly actions: AdministrationActionsService;
  readonly permissions: AdministrationPermissionsService;
  readonly audit: AdministrationAuditService;
  readonly history: AdministrationHistoryService;
  readonly diagnostics: AdministrationDiagnosticsService;
  readonly registrations: AdministrationRegistrationsService;
  readonly metadata: AdministrationMetadataService;
  readonly policies: AdministrationPoliciesService;
  readonly references: AdministrationReferencesService;
  readonly capabilities: AdministrationCapabilitiesService;
  readonly navigations: AdministrationNavigationsService;
  readonly shortcuts: AdministrationShortcutsService;
  readonly dashboards: AdministrationDashboardsService;
  readonly widgets: AdministrationWidgetsService;
};
