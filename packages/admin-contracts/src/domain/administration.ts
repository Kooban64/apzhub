/**
 * APZHUB Platform Administration domain models (APZADMIN-001).
 * System of Record metadata only — no runtime execution, dashboards, or user management.
 */

import type { AdministrationAuditFields } from "../common/context";
import type {
  AdministrationActionKind,
  AdministrationAuditAction,
  AdministrationDiagnosticSeverity,
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

export type AdministrationModule = {
  readonly id: AdministrationModuleId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: AdministrationModuleKey;
  readonly name: string;
  readonly description?: string;
  readonly status: AdministrationLifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
} & Partial<AdministrationAuditFields>;

export type AdministrationCategory = {
  readonly id: AdministrationCategoryId;
  readonly tenantId: string;
  readonly moduleId?: AdministrationModuleId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly ordering: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationSection = {
  readonly id: AdministrationSectionId;
  readonly tenantId: string;
  readonly categoryId: AdministrationCategoryId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly ordering: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationAction = {
  readonly id: AdministrationActionId;
  readonly tenantId: string;
  readonly moduleId?: AdministrationModuleId;
  readonly sectionId?: AdministrationSectionId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly kind: AdministrationActionKind;
  readonly permissionKeys?: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationPermission = {
  readonly id: AdministrationPermissionId;
  readonly tenantId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Audit trail entry — metadata only. */
export type AdministrationAuditEntry = {
  readonly id: AdministrationAuditId;
  readonly tenantId: string;
  readonly moduleId?: AdministrationModuleId;
  readonly action: AdministrationAuditAction;
  readonly actorUserId: string;
  readonly detail?: string;
  readonly createdAt: string;
};

/** @deprecated Prefer AdministrationAuditEntry — alias for domain naming. */
export type AdministrationAudit = AdministrationAuditEntry;

export type AdministrationHistory = {
  readonly id: AdministrationHistoryId;
  readonly moduleId: AdministrationModuleId;
  readonly summary: string;
  readonly actorUserId: string;
  readonly createdAt: string;
};

export type AdministrationDiagnostic = {
  readonly id: AdministrationDiagnosticId;
  readonly tenantId: string;
  readonly moduleId?: AdministrationModuleId;
  readonly capabilityId?: AdministrationCapabilityId;
  readonly severity: AdministrationDiagnosticSeverity;
  readonly code: string;
  readonly message: string;
  readonly detail?: string;
  readonly createdAt: string;
};

export type AdministrationRegistration = {
  readonly id: AdministrationRegistrationId;
  readonly tenantId: string;
  readonly moduleKey: AdministrationModuleKey;
  readonly version: string;
  readonly status: AdministrationLifecycleStatus;
  readonly registeredAt: string;
  readonly registeredBy: string;
  readonly notes?: string;
};

export type AdministrationMetadata = {
  readonly id: AdministrationMetadataId;
  readonly moduleId: AdministrationModuleId;
  readonly labels?: Readonly<Record<string, string>>;
  readonly tags?: readonly string[];
  readonly notes?: string;
};

export type AdministrationPolicy = {
  readonly id: AdministrationPolicyId;
  readonly tenantId: string;
  readonly moduleId?: AdministrationModuleId;
  readonly kind: AdministrationPolicyKind;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationReference = {
  readonly id: AdministrationReferenceId;
  readonly moduleId: AdministrationModuleId;
  readonly kind: AdministrationReferenceKind;
  readonly resourceId: string;
  readonly label?: string;
};

/**
 * Capability metadata — status flags only; no runtime health probes here.
 */
export type AdministrationCapability = {
  readonly id: AdministrationCapabilityId;
  readonly tenantId: string;
  readonly moduleId: AdministrationModuleId;
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

export type AdministrationNavigation = {
  readonly id: AdministrationNavigationId;
  readonly tenantId: string;
  readonly moduleId: AdministrationModuleId;
  readonly categoryId?: AdministrationCategoryId;
  readonly sectionId?: AdministrationSectionId;
  readonly key: string;
  readonly label: string;
  readonly ordering: number;
  readonly visibility: AdministrationNavigationVisibility;
  readonly permissionKeys?: readonly string[];
  readonly iconKey?: string;
  readonly routePath?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdministrationShortcut = {
  readonly id: AdministrationShortcutId;
  readonly tenantId: string;
  readonly moduleId?: AdministrationModuleId;
  readonly actionId?: AdministrationActionId;
  readonly key: string;
  readonly label: string;
  readonly ordering: number;
  readonly permissionKeys?: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Dashboard layout metadata — not rendered in this package. */
export type AdministrationDashboard = {
  readonly id: AdministrationDashboardId;
  readonly tenantId: string;
  readonly moduleId?: AdministrationModuleId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly ordering: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Widget layout metadata — not rendered in this package. */
export type AdministrationWidget = {
  readonly id: AdministrationWidgetId;
  readonly dashboardId: AdministrationDashboardId;
  readonly key: string;
  readonly name: string;
  readonly kind: AdministrationWidgetKind;
  readonly ordering: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};
