/**
 * PostgreSQL administration repositories (APZADMIN-001).
 * Drizzle against platform_admin* tables — metadata only.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  platformAdminAction,
  platformAdminAudit,
  platformAdminCapability,
  platformAdminCategory,
  platformAdminDashboard,
  platformAdminDiagnostic,
  platformAdminHistory,
  platformAdminMetadata,
  platformAdminModule,
  platformAdminNavigation,
  platformAdminPermission,
  platformAdminPolicy,
  platformAdminReference,
  platformAdminRegistration,
  platformAdminSection,
  platformAdminShortcut,
  platformAdminWidget,
} from "@apzhub/config";
import type {
  AdministrationAction,
  AdministrationActionKind,
  AdministrationAuditAction,
  AdministrationAuditEntry,
  AdministrationCapability,
  AdministrationCategory,
  AdministrationDashboard,
  AdministrationDiagnostic,
  AdministrationDiagnosticSeverity,
  AdministrationHistory,
  AdministrationLifecycleStatus,
  AdministrationMetadata,
  AdministrationModule,
  AdministrationModuleKey,
  AdministrationNavigation,
  AdministrationNavigationVisibility,
  AdministrationPermission,
  AdministrationPolicy,
  AdministrationPolicyKind,
  AdministrationReference,
  AdministrationReferenceKind,
  AdministrationRegistration,
  AdministrationRequestContext,
  AdministrationSection,
  AdministrationShortcut,
  AdministrationWidget,
  AdministrationWidgetKind,
} from "@apzhub/admin-contracts";
import {
  asAdministrationActionId,
  asAdministrationAuditId,
  asAdministrationCapabilityId,
  asAdministrationCategoryId,
  asAdministrationDashboardId,
  asAdministrationDiagnosticId,
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
import { and, eq } from "drizzle-orm";

function toDate(value: string): Date {
  return new Date(value);
}

export function mapAdministrationModule(
  row: typeof platformAdminModule.$inferSelect,
): AdministrationModule {
  return {
    id: asAdministrationModuleId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as AdministrationModuleKey,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as AdministrationLifecycleStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

export function mapAdministrationCategory(
  row: typeof platformAdminCategory.$inferSelect,
): AdministrationCategory {
  return {
    id: asAdministrationCategoryId(row.id),
    tenantId: row.tenantId,
    moduleId: row.moduleId
      ? asAdministrationModuleId(row.moduleId)
      : undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    ordering: row.ordering,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAdministrationSection(
  row: typeof platformAdminSection.$inferSelect,
): AdministrationSection {
  return {
    id: asAdministrationSectionId(row.id),
    tenantId: row.tenantId,
    categoryId: asAdministrationCategoryId(row.categoryId),
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    ordering: row.ordering,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAdministrationAction(
  row: typeof platformAdminAction.$inferSelect,
): AdministrationAction {
  return {
    id: asAdministrationActionId(row.id),
    tenantId: row.tenantId,
    moduleId: row.moduleId
      ? asAdministrationModuleId(row.moduleId)
      : undefined,
    sectionId: row.sectionId
      ? asAdministrationSectionId(row.sectionId)
      : undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    kind: row.kind as AdministrationActionKind,
    permissionKeys: (row.permissionKeysJson ?? undefined) as
      | string[]
      | undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAdministrationPermission(
  row: typeof platformAdminPermission.$inferSelect,
): AdministrationPermission {
  return {
    id: asAdministrationPermissionId(row.id),
    tenantId: row.tenantId,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAdministrationAudit(
  row: typeof platformAdminAudit.$inferSelect,
): AdministrationAuditEntry {
  return {
    id: asAdministrationAuditId(row.id),
    tenantId: row.tenantId,
    moduleId: row.moduleId
      ? asAdministrationModuleId(row.moduleId)
      : undefined,
    action: row.action as AdministrationAuditAction,
    actorUserId: row.actorUserId,
    detail: row.detail ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapAdministrationHistory(
  row: typeof platformAdminHistory.$inferSelect,
): AdministrationHistory {
  return {
    id: asAdministrationHistoryId(row.id),
    moduleId: asAdministrationModuleId(row.moduleId),
    summary: row.summary,
    actorUserId: row.actorUserId,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapAdministrationDiagnostic(
  row: typeof platformAdminDiagnostic.$inferSelect,
): AdministrationDiagnostic {
  return {
    id: asAdministrationDiagnosticId(row.id),
    tenantId: row.tenantId,
    moduleId: row.moduleId
      ? asAdministrationModuleId(row.moduleId)
      : undefined,
    capabilityId: row.capabilityId
      ? asAdministrationCapabilityId(row.capabilityId)
      : undefined,
    severity: row.severity as AdministrationDiagnosticSeverity,
    code: row.code,
    message: row.message,
    detail: row.detail ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapAdministrationRegistration(
  row: typeof platformAdminRegistration.$inferSelect,
): AdministrationRegistration {
  return {
    id: asAdministrationRegistrationId(row.id),
    tenantId: row.tenantId,
    moduleKey: row.moduleKey as AdministrationModuleKey,
    version: row.version,
    status: row.status as AdministrationLifecycleStatus,
    registeredAt: row.registeredAt.toISOString(),
    registeredBy: row.registeredBy,
    notes: row.notes ?? undefined,
  };
}

export function mapAdministrationMetadata(
  row: typeof platformAdminMetadata.$inferSelect,
): AdministrationMetadata {
  return {
    id: asAdministrationMetadataId(row.id),
    moduleId: asAdministrationModuleId(row.moduleId),
    labels: (row.labelsJson ?? undefined) as
      | Record<string, string>
      | undefined,
    tags: (row.tagsJson ?? undefined) as string[] | undefined,
    notes: row.notes ?? undefined,
  };
}

export function mapAdministrationPolicy(
  row: typeof platformAdminPolicy.$inferSelect,
): AdministrationPolicy {
  return {
    id: asAdministrationPolicyId(row.id),
    tenantId: row.tenantId,
    moduleId: row.moduleId
      ? asAdministrationModuleId(row.moduleId)
      : undefined,
    kind: row.kind as AdministrationPolicyKind,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAdministrationReference(
  row: typeof platformAdminReference.$inferSelect,
): AdministrationReference {
  return {
    id: asAdministrationReferenceId(row.id),
    moduleId: asAdministrationModuleId(row.moduleId),
    kind: row.kind as AdministrationReferenceKind,
    resourceId: row.resourceId,
    label: row.label ?? undefined,
  };
}

export function mapAdministrationCapability(
  row: typeof platformAdminCapability.$inferSelect,
): AdministrationCapability {
  return {
    id: asAdministrationCapabilityId(row.id),
    tenantId: row.tenantId,
    moduleId: asAdministrationModuleId(row.moduleId),
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    enabled: row.enabled,
    available: row.available,
    healthy: row.healthy,
    certified: row.certified,
    productionReady: row.productionReady,
    limitations: (row.limitationsJson ?? undefined) as string[] | undefined,
    owner: row.owner,
    version: row.version,
    documentation: row.documentation ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAdministrationNavigation(
  row: typeof platformAdminNavigation.$inferSelect,
): AdministrationNavigation {
  return {
    id: asAdministrationNavigationId(row.id),
    tenantId: row.tenantId,
    moduleId: asAdministrationModuleId(row.moduleId),
    categoryId: row.categoryId
      ? asAdministrationCategoryId(row.categoryId)
      : undefined,
    sectionId: row.sectionId
      ? asAdministrationSectionId(row.sectionId)
      : undefined,
    key: row.key,
    label: row.label,
    ordering: row.ordering,
    visibility: row.visibility as AdministrationNavigationVisibility,
    permissionKeys: (row.permissionKeysJson ?? undefined) as
      | string[]
      | undefined,
    iconKey: row.iconKey ?? undefined,
    routePath: row.routePath ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAdministrationShortcut(
  row: typeof platformAdminShortcut.$inferSelect,
): AdministrationShortcut {
  return {
    id: asAdministrationShortcutId(row.id),
    tenantId: row.tenantId,
    moduleId: row.moduleId
      ? asAdministrationModuleId(row.moduleId)
      : undefined,
    actionId: row.actionId
      ? asAdministrationActionId(row.actionId)
      : undefined,
    key: row.key,
    label: row.label,
    ordering: row.ordering,
    permissionKeys: (row.permissionKeysJson ?? undefined) as
      | string[]
      | undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAdministrationDashboard(
  row: typeof platformAdminDashboard.$inferSelect,
): AdministrationDashboard {
  return {
    id: asAdministrationDashboardId(row.id),
    tenantId: row.tenantId,
    moduleId: row.moduleId
      ? asAdministrationModuleId(row.moduleId)
      : undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    ordering: row.ordering,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAdministrationWidget(
  row: typeof platformAdminWidget.$inferSelect,
): AdministrationWidget {
  return {
    id: asAdministrationWidgetId(row.id),
    dashboardId: asAdministrationDashboardId(row.dashboardId),
    key: row.key,
    name: row.name,
    kind: row.kind as AdministrationWidgetKind,
    ordering: row.ordering,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

type TenantScopedTable = {
  readonly id: unknown;
  readonly tenantId: unknown;
};

function createTenantScopedCrud<TEntity extends { id: string; tenantId: string }, TRow>(
  db: DatabaseExecutor,
  table: TenantScopedTable,
  toRow: (entity: TEntity) => Record<string, unknown>,
  fromRow: (row: TRow) => TEntity,
): {
  create: (ctx: AdministrationRequestContext, entity: TEntity) => Promise<TEntity>;
  get: (ctx: AdministrationRequestContext, id: string) => Promise<TEntity | null>;
  update: (ctx: AdministrationRequestContext, entity: TEntity) => Promise<TEntity>;
  list: (ctx: AdministrationRequestContext) => Promise<readonly TEntity[]>;
} {
  return {
    async create(_ctx, entity) {
      await db.insert(table as never).values(toRow(entity) as never);
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(table as never)
        .where(
          and(
            eq(table.id as never, id),
            eq(table.tenantId as never, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0] as TRow | undefined;
      return row ? fromRow(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(table as never)
        .set(toRow(entity) as never)
        .where(eq(table.id as never, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = (await db
        .select()
        .from(table as never)
        .where(eq(table.tenantId as never, ctx.tenantId))) as TRow[];
      return rows.map(fromRow);
    },
  };
}

export function createPostgresAdministrationRepositories(
  db: DatabaseExecutor,
): AdministrationFoundationRepos {
  const modules = createTenantScopedCrud(
    db,
    platformAdminModule,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      organisationId: entity.organisationId ?? null,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      status: entity.status,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      revision: entity.revision,
    }),
    mapAdministrationModule,
  ) as AdministrationModuleRepositoryPort;

  const categories = createTenantScopedCrud(
    db,
    platformAdminCategory,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      moduleId: entity.moduleId ?? null,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      ordering: entity.ordering,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapAdministrationCategory,
  ) as AdministrationCategoryRepositoryPort;

  const sections = createTenantScopedCrud(
    db,
    platformAdminSection,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      categoryId: entity.categoryId,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      ordering: entity.ordering,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapAdministrationSection,
  ) as AdministrationSectionRepositoryPort;

  const actions = createTenantScopedCrud(
    db,
    platformAdminAction,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      moduleId: entity.moduleId ?? null,
      sectionId: entity.sectionId ?? null,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      kind: entity.kind,
      permissionKeysJson: entity.permissionKeys ? [...entity.permissionKeys] : null,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapAdministrationAction,
  ) as AdministrationActionRepositoryPort;

  const permissions = createTenantScopedCrud(
    db,
    platformAdminPermission,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapAdministrationPermission,
  ) as AdministrationPermissionRepositoryPort;

  const diagnostics = createTenantScopedCrud(
    db,
    platformAdminDiagnostic,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      moduleId: entity.moduleId ?? null,
      capabilityId: entity.capabilityId ?? null,
      severity: entity.severity,
      code: entity.code,
      message: entity.message,
      detail: entity.detail ?? null,
      createdAt: toDate(entity.createdAt),
    }),
    mapAdministrationDiagnostic,
  ) as AdministrationDiagnosticRepositoryPort;

  const registrations = createTenantScopedCrud(
    db,
    platformAdminRegistration,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      moduleKey: entity.moduleKey,
      version: entity.version,
      status: entity.status,
      registeredAt: toDate(entity.registeredAt),
      registeredBy: entity.registeredBy,
      notes: entity.notes ?? null,
    }),
    mapAdministrationRegistration,
  ) as AdministrationRegistrationRepositoryPort;

  const policies = createTenantScopedCrud(
    db,
    platformAdminPolicy,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      moduleId: entity.moduleId ?? null,
      kind: entity.kind,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapAdministrationPolicy,
  ) as AdministrationPolicyRepositoryPort;

  const capabilities = createTenantScopedCrud(
    db,
    platformAdminCapability,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      moduleId: entity.moduleId,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      enabled: entity.enabled,
      available: entity.available,
      healthy: entity.healthy,
      certified: entity.certified,
      productionReady: entity.productionReady,
      limitationsJson: entity.limitations ? [...entity.limitations] : null,
      owner: entity.owner,
      version: entity.version,
      documentation: entity.documentation ?? null,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapAdministrationCapability,
  ) as AdministrationCapabilityRepositoryPort;

  const navigations = createTenantScopedCrud(
    db,
    platformAdminNavigation,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      moduleId: entity.moduleId,
      categoryId: entity.categoryId ?? null,
      sectionId: entity.sectionId ?? null,
      key: entity.key,
      label: entity.label,
      ordering: entity.ordering,
      visibility: entity.visibility,
      permissionKeysJson: entity.permissionKeys
        ? [...entity.permissionKeys]
        : null,
      iconKey: entity.iconKey ?? null,
      routePath: entity.routePath ?? null,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapAdministrationNavigation,
  ) as AdministrationNavigationRepositoryPort;

  const shortcuts = createTenantScopedCrud(
    db,
    platformAdminShortcut,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      moduleId: entity.moduleId ?? null,
      actionId: entity.actionId ?? null,
      key: entity.key,
      label: entity.label,
      ordering: entity.ordering,
      permissionKeysJson: entity.permissionKeys
        ? [...entity.permissionKeys]
        : null,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapAdministrationShortcut,
  ) as AdministrationShortcutRepositoryPort;

  const dashboards = createTenantScopedCrud(
    db,
    platformAdminDashboard,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      moduleId: entity.moduleId ?? null,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      ordering: entity.ordering,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapAdministrationDashboard,
  ) as AdministrationDashboardRepositoryPort;

  const audits: AdministrationAuditRepositoryPort = {
    async append(_ctx, entry) {
      await db.insert(platformAdminAudit).values({
        id: entry.id,
        tenantId: entry.tenantId,
        moduleId: entry.moduleId ?? null,
        action: entry.action,
        actorUserId: entry.actorUserId,
        detail: entry.detail ?? null,
        createdAt: toDate(entry.createdAt),
      });
      return entry;
    },
    async get(ctx, auditId) {
      const rows = await db
        .select()
        .from(platformAdminAudit)
        .where(
          and(
            eq(platformAdminAudit.id, auditId),
            eq(platformAdminAudit.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapAdministrationAudit(rows[0]) : null;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformAdminAudit)
        .where(eq(platformAdminAudit.tenantId, ctx.tenantId));
      return rows.map(mapAdministrationAudit);
    },
  };

  const history: AdministrationHistoryRepositoryPort = {
    async create(_ctx, entry) {
      await db.insert(platformAdminHistory).values({
        id: entry.id,
        moduleId: entry.moduleId,
        summary: entry.summary,
        actorUserId: entry.actorUserId,
        createdAt: toDate(entry.createdAt),
      });
      return entry;
    },
    async get(_ctx, historyId) {
      const rows = await db
        .select()
        .from(platformAdminHistory)
        .where(eq(platformAdminHistory.id, historyId))
        .limit(1);
      return rows[0] ? mapAdministrationHistory(rows[0]) : null;
    },
    async listByModule(_ctx, moduleId) {
      const rows = await db
        .select()
        .from(platformAdminHistory)
        .where(eq(platformAdminHistory.moduleId, moduleId));
      return rows.map(mapAdministrationHistory);
    },
  };

  const metadata: AdministrationMetadataRepositoryPort = {
    async create(_ctx, entry) {
      await db.insert(platformAdminMetadata).values({
        id: entry.id,
        moduleId: entry.moduleId,
        labelsJson: entry.labels ? { ...entry.labels } : null,
        tagsJson: entry.tags ? [...entry.tags] : null,
        notes: entry.notes ?? null,
      });
      return entry;
    },
    async get(_ctx, metadataId) {
      const rows = await db
        .select()
        .from(platformAdminMetadata)
        .where(eq(platformAdminMetadata.id, metadataId))
        .limit(1);
      return rows[0] ? mapAdministrationMetadata(rows[0]) : null;
    },
    async update(_ctx, entry) {
      await db
        .update(platformAdminMetadata)
        .set({
          moduleId: entry.moduleId,
          labelsJson: entry.labels ? { ...entry.labels } : null,
          tagsJson: entry.tags ? [...entry.tags] : null,
          notes: entry.notes ?? null,
        })
        .where(eq(platformAdminMetadata.id, entry.id));
      return entry;
    },
    async listByModule(_ctx, moduleId) {
      const rows = await db
        .select()
        .from(platformAdminMetadata)
        .where(eq(platformAdminMetadata.moduleId, moduleId));
      return rows.map(mapAdministrationMetadata);
    },
  };

  const references: AdministrationReferenceRepositoryPort = {
    async create(_ctx, entry) {
      await db.insert(platformAdminReference).values({
        id: entry.id,
        moduleId: entry.moduleId,
        kind: entry.kind,
        resourceId: entry.resourceId,
        label: entry.label ?? null,
      });
      return entry;
    },
    async get(_ctx, referenceId) {
      const rows = await db
        .select()
        .from(platformAdminReference)
        .where(eq(platformAdminReference.id, referenceId))
        .limit(1);
      return rows[0] ? mapAdministrationReference(rows[0]) : null;
    },
    async listByModule(_ctx, moduleId) {
      const rows = await db
        .select()
        .from(platformAdminReference)
        .where(eq(platformAdminReference.moduleId, moduleId));
      return rows.map(mapAdministrationReference);
    },
  };

  const widgets: AdministrationWidgetRepositoryPort = {
    async create(_ctx, entry) {
      await db.insert(platformAdminWidget).values({
        id: entry.id,
        dashboardId: entry.dashboardId,
        key: entry.key,
        name: entry.name,
        kind: entry.kind,
        ordering: entry.ordering,
        createdAt: toDate(entry.createdAt),
        updatedAt: toDate(entry.updatedAt),
      });
      return entry;
    },
    async get(_ctx, widgetId) {
      const rows = await db
        .select()
        .from(platformAdminWidget)
        .where(eq(platformAdminWidget.id, widgetId))
        .limit(1);
      return rows[0] ? mapAdministrationWidget(rows[0]) : null;
    },
    async update(_ctx, entry) {
      await db
        .update(platformAdminWidget)
        .set({
          dashboardId: entry.dashboardId,
          key: entry.key,
          name: entry.name,
          kind: entry.kind,
          ordering: entry.ordering,
          updatedAt: toDate(entry.updatedAt),
        })
        .where(eq(platformAdminWidget.id, entry.id));
      return entry;
    },
    async listByDashboard(_ctx, dashboardId) {
      const rows = await db
        .select()
        .from(platformAdminWidget)
        .where(eq(platformAdminWidget.dashboardId, dashboardId));
      return rows.map(mapAdministrationWidget);
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
