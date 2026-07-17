/** Platform Administration typed client view models (APZADMIN-003). */

export type AdministrationClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly headers?: HeadersInit;
};

export type AdministrationCollectionResult<T> = {
  readonly items: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

export type AdministrationModuleViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type AdministrationCategoryViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly moduleId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly ordering: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationSectionViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly categoryId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly ordering: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationActionViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly moduleId?: string;
  readonly sectionId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly kind: string;
  readonly permissionKeys?: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationPermissionViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationRegistrationViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly moduleKey: string;
  readonly version: string;
  readonly status: string;
  readonly registeredAt: string;
  readonly registeredBy: string;
  readonly notes?: string;
};

export type AdministrationPolicyViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly moduleId?: string;
  readonly kind: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationCapabilityViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly moduleId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly enabled: boolean;
  readonly available: boolean;
  readonly healthy: boolean;
  readonly certified: boolean;
  readonly productionReady: boolean;
  readonly limitations?: readonly string[];
  readonly owner: string;
  readonly version: string;
  readonly documentation?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationNavigationViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly moduleId: string;
  readonly categoryId?: string;
  readonly sectionId?: string;
  readonly key: string;
  readonly label: string;
  readonly ordering: number;
  readonly visibility: string;
  readonly permissionKeys?: readonly string[];
  readonly iconKey?: string;
  readonly routePath?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationShortcutViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly moduleId?: string;
  readonly actionId?: string;
  readonly key: string;
  readonly label: string;
  readonly ordering: number;
  readonly permissionKeys?: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationDashboardViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly moduleId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly ordering: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationWidgetViewModel = {
  readonly id: string;
  readonly dashboardId: string;
  readonly key: string;
  readonly name: string;
  readonly kind: string;
  readonly ordering: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationMetadataViewModel = {
  readonly id: string;
  readonly moduleId: string;
  readonly labels?: Readonly<Record<string, string>>;
  readonly tags?: readonly string[];
  readonly notes?: string;
};

export type AdministrationReferenceViewModel = {
  readonly id: string;
  readonly moduleId: string;
  readonly kind: string;
  readonly resourceId: string;
  readonly label?: string;
};

export type AdministrationAuditViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly moduleId?: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly detail?: string;
  readonly createdAt: string;
};

export type AdministrationHistoryViewModel = {
  readonly id: string;
  readonly moduleId: string;
  readonly summary: string;
  readonly actorUserId: string;
  readonly createdAt: string;
};

export type AdministrationDiagnosticViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly moduleId?: string;
  readonly capabilityId?: string;
  readonly severity: string;
  readonly code: string;
  readonly message: string;
  readonly detail?: string;
  readonly createdAt: string;
};

export type AdministrationManagementPlaneViewModel = {
  readonly administrationEnabled: boolean;
  readonly managementPlaneReady: boolean;
  readonly httpEnabled: boolean;
  readonly workbenchEnabled: boolean;
  readonly runtimeAdminEnabled: boolean;
  readonly persistenceMode?: string;
  readonly capabilities?: Readonly<Record<string, boolean>>;
  readonly gatewayCapabilities?: unknown;
};

export type ListAdministrationModulesClientQuery = {
  readonly status?: string;
  readonly key?: string;
  readonly limit?: number;
};

export type CreateAdministrationModuleClientInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
};

export type UpdateAdministrationModuleClientInput = {
  readonly name?: string;
  readonly description?: string | null;
  readonly organisationId?: string | null;
};

export type TransitionAdministrationModuleClientInput = {
  readonly to: string;
  readonly reason?: string;
};
