/**
 * Administration repository ports (APZADMIN-001).
 * Interfaces only — no Drizzle / HTTP / memory defaults.
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
} from "@apzhub/admin-contracts";

export class AdministrationDomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "AdministrationDomainError";
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  kind: string,
  id: string,
): T {
  if (value == null) {
    throw new AdministrationDomainError("not_found", `${kind} not found: ${id}`, {
      kind,
      id,
    });
  }
  return value;
}

type CrudPort<TEntity, TId> = {
  create(ctx: AdministrationRequestContext, entity: TEntity): Promise<TEntity>;
  get(ctx: AdministrationRequestContext, id: TId): Promise<TEntity | null>;
  update(ctx: AdministrationRequestContext, entity: TEntity): Promise<TEntity>;
  list(ctx: AdministrationRequestContext): Promise<readonly TEntity[]>;
};

export type AdministrationModuleRepositoryPort = CrudPort<
  AdministrationModule,
  AdministrationModuleId
>;

export type AdministrationCategoryRepositoryPort = CrudPort<
  AdministrationCategory,
  AdministrationCategoryId
>;

export type AdministrationSectionRepositoryPort = CrudPort<
  AdministrationSection,
  AdministrationSectionId
>;

export type AdministrationActionRepositoryPort = CrudPort<
  AdministrationAction,
  AdministrationActionId
>;

export type AdministrationPermissionRepositoryPort = CrudPort<
  AdministrationPermission,
  AdministrationPermissionId
>;

export interface AdministrationAuditRepositoryPort {
  append(
    ctx: AdministrationRequestContext,
    entry: AdministrationAuditEntry,
  ): Promise<AdministrationAuditEntry>;
  get(
    ctx: AdministrationRequestContext,
    auditId: AdministrationAuditId,
  ): Promise<AdministrationAuditEntry | null>;
  list(ctx: AdministrationRequestContext): Promise<readonly AdministrationAuditEntry[]>;
}

export interface AdministrationHistoryRepositoryPort {
  create(
    ctx: AdministrationRequestContext,
    history: AdministrationHistory,
  ): Promise<AdministrationHistory>;
  get(
    ctx: AdministrationRequestContext,
    historyId: AdministrationHistoryId,
  ): Promise<AdministrationHistory | null>;
  listByModule(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModuleId,
  ): Promise<readonly AdministrationHistory[]>;
}

export type AdministrationDiagnosticRepositoryPort = CrudPort<
  AdministrationDiagnostic,
  AdministrationDiagnosticId
>;

export type AdministrationRegistrationRepositoryPort = CrudPort<
  AdministrationRegistration,
  AdministrationRegistrationId
>;

export interface AdministrationMetadataRepositoryPort {
  create(
    ctx: AdministrationRequestContext,
    metadata: AdministrationMetadata,
  ): Promise<AdministrationMetadata>;
  get(
    ctx: AdministrationRequestContext,
    metadataId: AdministrationMetadataId,
  ): Promise<AdministrationMetadata | null>;
  update(
    ctx: AdministrationRequestContext,
    metadata: AdministrationMetadata,
  ): Promise<AdministrationMetadata>;
  listByModule(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModuleId,
  ): Promise<readonly AdministrationMetadata[]>;
}

export type AdministrationPolicyRepositoryPort = CrudPort<
  AdministrationPolicy,
  AdministrationPolicyId
>;

export interface AdministrationReferenceRepositoryPort {
  create(
    ctx: AdministrationRequestContext,
    reference: AdministrationReference,
  ): Promise<AdministrationReference>;
  get(
    ctx: AdministrationRequestContext,
    referenceId: AdministrationReferenceId,
  ): Promise<AdministrationReference | null>;
  listByModule(
    ctx: AdministrationRequestContext,
    moduleId: AdministrationModuleId,
  ): Promise<readonly AdministrationReference[]>;
}

export type AdministrationCapabilityRepositoryPort = CrudPort<
  AdministrationCapability,
  AdministrationCapabilityId
>;

export type AdministrationNavigationRepositoryPort = CrudPort<
  AdministrationNavigation,
  AdministrationNavigationId
>;

export type AdministrationShortcutRepositoryPort = CrudPort<
  AdministrationShortcut,
  AdministrationShortcutId
>;

export type AdministrationDashboardRepositoryPort = CrudPort<
  AdministrationDashboard,
  AdministrationDashboardId
>;

export interface AdministrationWidgetRepositoryPort {
  create(
    ctx: AdministrationRequestContext,
    widget: AdministrationWidget,
  ): Promise<AdministrationWidget>;
  get(
    ctx: AdministrationRequestContext,
    widgetId: AdministrationWidgetId,
  ): Promise<AdministrationWidget | null>;
  update(
    ctx: AdministrationRequestContext,
    widget: AdministrationWidget,
  ): Promise<AdministrationWidget>;
  listByDashboard(
    ctx: AdministrationRequestContext,
    dashboardId: AdministrationDashboardId,
  ): Promise<readonly AdministrationWidget[]>;
}

export type AdministrationFoundationRepos = {
  readonly modules: AdministrationModuleRepositoryPort;
  readonly categories: AdministrationCategoryRepositoryPort;
  readonly sections: AdministrationSectionRepositoryPort;
  readonly actions: AdministrationActionRepositoryPort;
  readonly permissions: AdministrationPermissionRepositoryPort;
  readonly audits: AdministrationAuditRepositoryPort;
  readonly history: AdministrationHistoryRepositoryPort;
  readonly diagnostics: AdministrationDiagnosticRepositoryPort;
  readonly registrations: AdministrationRegistrationRepositoryPort;
  readonly metadata: AdministrationMetadataRepositoryPort;
  readonly policies: AdministrationPolicyRepositoryPort;
  readonly references: AdministrationReferenceRepositoryPort;
  readonly capabilities: AdministrationCapabilityRepositoryPort;
  readonly navigations: AdministrationNavigationRepositoryPort;
  readonly shortcuts: AdministrationShortcutRepositoryPort;
  readonly dashboards: AdministrationDashboardRepositoryPort;
  readonly widgets: AdministrationWidgetRepositoryPort;
};
