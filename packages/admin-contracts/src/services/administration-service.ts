/**
 * Platform Administration service contract (APZADMIN-001).
 * Interface only — implementation deferred to APZADMIN-002 Platform Services.
 * List/get methods only — no execute / mutate / diagnose runtime methods.
 */

import type { AdministrationRequestContext } from "../common/context";
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
  AdministrationActionId,
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
  AdministrationAuditId,
} from "../identifiers";

export type AdministrationPlatformService = {
  listModules(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationModule[]>;
  getModule(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModuleId,
  ): Promise<AdministrationModule | null>;
  listCategories(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationCategory[]>;
  getCategory(
    ctx: AdministrationRequestContext,
    categoryId: AdministrationCategoryId,
  ): Promise<AdministrationCategory | null>;
  listSections(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationSection[]>;
  getSection(
    ctx: AdministrationRequestContext,
    sectionId: AdministrationSectionId,
  ): Promise<AdministrationSection | null>;
  listActions(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationAction[]>;
  getAction(
    ctx: AdministrationRequestContext,
    actionId: AdministrationActionId,
  ): Promise<AdministrationAction | null>;
  listPermissions(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationPermission[]>;
  getPermission(
    ctx: AdministrationRequestContext,
    permissionId: AdministrationPermissionId,
  ): Promise<AdministrationPermission | null>;
  listAudits(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationAuditEntry[]>;
  getAudit(
    ctx: AdministrationRequestContext,
    auditId: AdministrationAuditId,
  ): Promise<AdministrationAuditEntry | null>;
  listHistory(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModuleId,
  ): Promise<readonly AdministrationHistory[]>;
  getHistory(
    ctx: AdministrationRequestContext,
    historyId: AdministrationHistoryId,
  ): Promise<AdministrationHistory | null>;
  listDiagnostics(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationDiagnostic[]>;
  getDiagnostic(
    ctx: AdministrationRequestContext,
    diagnosticId: AdministrationDiagnosticId,
  ): Promise<AdministrationDiagnostic | null>;
  listRegistrations(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationRegistration[]>;
  getRegistration(
    ctx: AdministrationRequestContext,
    registrationId: AdministrationRegistrationId,
  ): Promise<AdministrationRegistration | null>;
  listMetadata(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModuleId,
  ): Promise<readonly AdministrationMetadata[]>;
  getMetadata(
    ctx: AdministrationRequestContext,
    metadataId: AdministrationMetadataId,
  ): Promise<AdministrationMetadata | null>;
  listPolicies(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationPolicy[]>;
  getPolicy(
    ctx: AdministrationRequestContext,
    policyId: AdministrationPolicyId,
  ): Promise<AdministrationPolicy | null>;
  listReferences(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModuleId,
  ): Promise<readonly AdministrationReference[]>;
  getReference(
    ctx: AdministrationRequestContext,
    referenceId: AdministrationReferenceId,
  ): Promise<AdministrationReference | null>;
  listCapabilities(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationCapability[]>;
  getCapability(
    ctx: AdministrationRequestContext,
    capabilityId: AdministrationCapabilityId,
  ): Promise<AdministrationCapability | null>;
  listNavigations(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationNavigation[]>;
  getNavigation(
    ctx: AdministrationRequestContext,
    navigationId: AdministrationNavigationId,
  ): Promise<AdministrationNavigation | null>;
  listShortcuts(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationShortcut[]>;
  getShortcut(
    ctx: AdministrationRequestContext,
    shortcutId: AdministrationShortcutId,
  ): Promise<AdministrationShortcut | null>;
  listDashboards(
    ctx: AdministrationRequestContext,
  ): Promise<readonly AdministrationDashboard[]>;
  getDashboard(
    ctx: AdministrationRequestContext,
    dashboardId: AdministrationDashboardId,
  ): Promise<AdministrationDashboard | null>;
  listWidgets(
    ctx: AdministrationRequestContext,
    dashboardId: AdministrationDashboardId,
  ): Promise<readonly AdministrationWidget[]>;
  getWidget(
    ctx: AdministrationRequestContext,
    widgetId: AdministrationWidgetId,
  ): Promise<AdministrationWidget | null>;
};
