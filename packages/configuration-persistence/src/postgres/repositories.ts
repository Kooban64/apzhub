/**
 * PostgreSQL configuration repositories (APZCONFIG-001 / APZCONFIG-002).
 * Drizzle against platform_configuration* tables — metadata only.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  platformConfiguration,
  platformConfigurationAudit,
  platformConfigurationGroup,
  platformConfigurationHistory,
  platformConfigurationKey,
  platformConfigurationNamespace,
  platformConfigurationOverride,
  platformConfigurationReference,
  platformConfigurationValidation,
  platformConfigurationValue,
  platformConfigurationVersion,
} from "@apzhub/config";
import type {
  Configuration,
  ConfigurationAuditEntry,
  ConfigurationGroup,
  ConfigurationHierarchyLevel,
  ConfigurationHistory,
  ConfigurationKey,
  ConfigurationLifecycleStatus,
  ConfigurationNamespace,
  ConfigurationOverride,
  ConfigurationReference,
  ConfigurationReferenceKind,
  ConfigurationRequestContext,
  ConfigurationScope,
  ConfigurationScopeKind,
  ConfigurationValidation,
  ConfigurationValidationKind,
  ConfigurationValue,
  ConfigurationValueKind,
  ConfigurationVersion,
} from "@apzhub/configuration-contracts";
import {
  asConfigurationAuditId,
  asConfigurationGroupId,
  asConfigurationHistoryId,
  asConfigurationId,
  asConfigurationKeyId,
  asConfigurationNamespaceId,
  asConfigurationOverrideId,
  asConfigurationReferenceId,
  asConfigurationValidationId,
  asConfigurationValueId,
  asConfigurationVersionId,
} from "@apzhub/configuration-contracts";
import type {
  ConfigurationAuditRepositoryPort,
  ConfigurationFoundationRepos,
  ConfigurationGroupRepositoryPort,
  ConfigurationHistoryRepositoryPort,
  ConfigurationKeyRepositoryPort,
  ConfigurationNamespaceRepositoryPort,
  ConfigurationOverrideRepositoryPort,
  ConfigurationReferenceRepositoryPort,
  ConfigurationRepositoryPort,
  ConfigurationValidationRepositoryPort,
  ConfigurationValueRepositoryPort,
  ConfigurationVersionRepositoryPort,
} from "@apzhub/configuration-core";
import { and, asc, eq } from "drizzle-orm";

function mapScope(json: Record<string, unknown>): ConfigurationScope {
  return {
    kind: (json.kind as ConfigurationScopeKind) ?? "tenant",
    tenantId: json.tenantId as string | undefined,
    organisationId: json.organisationId as string | undefined,
    productId: json.productId as string | undefined,
    environmentId: json.environmentId as string | undefined,
    userId: json.userId as string | undefined,
  };
}

function scopeToJson(scope: ConfigurationScope): Record<string, unknown> {
  return {
    kind: scope.kind,
    tenantId: scope.tenantId,
    organisationId: scope.organisationId,
    productId: scope.productId,
    environmentId: scope.environmentId,
    userId: scope.userId,
  };
}

function mapConfiguration(
  row: typeof platformConfiguration.$inferSelect,
): Configuration {
  return {
    id: asConfigurationId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    namespaceId: asConfigurationNamespaceId(row.namespaceId),
    groupId: row.groupId ? asConfigurationGroupId(row.groupId) : undefined,
    keyId: asConfigurationKeyId(row.keyId),
    hierarchyLevel: row.hierarchyLevel as ConfigurationHierarchyLevel,
    scope: mapScope((row.scopeJson ?? {}) as Record<string, unknown>),
    status: row.status as ConfigurationLifecycleStatus,
    currentVersionId: row.currentVersionId
      ? asConfigurationVersionId(row.currentVersionId)
      : undefined,
    inheritsFromConfigurationId: row.inheritsFromConfigurationId
      ? asConfigurationId(row.inheritsFromConfigurationId)
      : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

function mapNamespace(
  row: typeof platformConfigurationNamespace.$inferSelect,
): ConfigurationNamespace {
  return {
    id: asConfigurationNamespaceId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapGroup(
  row: typeof platformConfigurationGroup.$inferSelect,
): ConfigurationGroup {
  return {
    id: asConfigurationGroupId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    namespaceId: asConfigurationNamespaceId(row.namespaceId),
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapKey(row: typeof platformConfigurationKey.$inferSelect): ConfigurationKey {
  return {
    id: asConfigurationKeyId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    namespaceId: asConfigurationNamespaceId(row.namespaceId),
    groupId: row.groupId ? asConfigurationGroupId(row.groupId) : undefined,
    key: row.key,
    displayName: row.displayName,
    description: row.description ?? undefined,
    valueKind: row.valueKind as ConfigurationValueKind,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapVersion(
  row: typeof platformConfigurationVersion.$inferSelect,
): ConfigurationVersion {
  return {
    id: asConfigurationVersionId(row.id),
    configurationId: asConfigurationId(row.configurationId),
    versionNumber: row.versionNumber,
    immutable: row.immutable,
    isCurrent: row.isCurrent,
    label: row.label ?? undefined,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    rollbackFromVersionId: row.rollbackFromVersionId
      ? asConfigurationVersionId(row.rollbackFromVersionId)
      : undefined,
  };
}

function mapOverride(
  row: typeof platformConfigurationOverride.$inferSelect,
): ConfigurationOverride {
  return {
    id: asConfigurationOverrideId(row.id),
    configurationId: asConfigurationId(row.configurationId),
    hierarchyLevel: row.hierarchyLevel as ConfigurationHierarchyLevel,
    scope: mapScope((row.scopeJson ?? {}) as Record<string, unknown>),
    valueId: asConfigurationValueId(row.valueId),
    precedenceRank: row.precedenceRank,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapValidation(
  row: typeof platformConfigurationValidation.$inferSelect,
): ConfigurationValidation {
  return {
    id: asConfigurationValidationId(row.id),
    configurationKeyId: asConfigurationKeyId(row.configurationKeyId),
    kind: row.kind as ConfigurationValidationKind,
    ruleRef: row.ruleRef ?? undefined,
    pattern: row.pattern ?? undefined,
    min: row.min ?? undefined,
    max: row.max ?? undefined,
    enumValues: (row.enumValuesJson ?? undefined) as string[] | undefined,
    required: row.required ?? undefined,
    customValidatorKey: row.customValidatorKey ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapReference(
  row: typeof platformConfigurationReference.$inferSelect,
): ConfigurationReference {
  return {
    id: asConfigurationReferenceId(row.id),
    configurationId: asConfigurationId(row.configurationId),
    kind: row.kind as ConfigurationReferenceKind,
    resourceId: row.resourceId,
    label: row.label ?? undefined,
  };
}

function mapAudit(
  row: typeof platformConfigurationAudit.$inferSelect,
): ConfigurationAuditEntry {
  return {
    id: asConfigurationAuditId(row.id),
    tenantId: row.tenantId,
    configurationId: row.configurationId
      ? asConfigurationId(row.configurationId)
      : undefined,
    action: row.action as ConfigurationAuditEntry["action"],
    actorUserId: row.actorUserId,
    detail: row.detail ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function createPostgresConfigurationRepositories(
  db: DatabaseExecutor,
): ConfigurationFoundationRepos {
  const configurations: ConfigurationRepositoryPort = {
    async create(ctx, configuration) {
      await db.insert(platformConfiguration).values({
        id: configuration.id,
        tenantId: configuration.tenantId,
        organisationId: configuration.organisationId ?? null,
        namespaceId: configuration.namespaceId,
        groupId: configuration.groupId ?? null,
        keyId: configuration.keyId,
        hierarchyLevel: configuration.hierarchyLevel,
        scopeJson: scopeToJson(configuration.scope),
        status: configuration.status,
        currentVersionId: configuration.currentVersionId ?? null,
        inheritsFromConfigurationId:
          configuration.inheritsFromConfigurationId ?? null,
        createdAt: new Date(configuration.createdAt),
        updatedAt: new Date(configuration.updatedAt),
        createdBy: configuration.createdBy,
        updatedBy: configuration.updatedBy,
        revision: configuration.revision,
      });
      return configuration;
    },
    async get(ctx, configurationId) {
      const rows = await db
        .select()
        .from(platformConfiguration)
        .where(
          and(
            eq(platformConfiguration.id, configurationId),
            eq(platformConfiguration.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapConfiguration(rows[0]) : null;
    },
    async update(ctx, configuration) {
      await db
        .update(platformConfiguration)
        .set({
          organisationId: configuration.organisationId ?? null,
          namespaceId: configuration.namespaceId,
          groupId: configuration.groupId ?? null,
          keyId: configuration.keyId,
          hierarchyLevel: configuration.hierarchyLevel,
          scopeJson: scopeToJson(configuration.scope),
          status: configuration.status,
          currentVersionId: configuration.currentVersionId ?? null,
          inheritsFromConfigurationId:
            configuration.inheritsFromConfigurationId ?? null,
          updatedAt: new Date(configuration.updatedAt),
          updatedBy: configuration.updatedBy,
          revision: configuration.revision,
        })
        .where(
          and(
            eq(platformConfiguration.id, configuration.id),
            eq(platformConfiguration.tenantId, ctx.tenantId),
          ),
        );
      return configuration;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformConfiguration)
        .where(eq(platformConfiguration.tenantId, ctx.tenantId))
        .orderBy(asc(platformConfiguration.createdAt));
      return rows.map(mapConfiguration);
    },
  };

  const namespaces: ConfigurationNamespaceRepositoryPort = {
    async create(ctx, namespace) {
      await db.insert(platformConfigurationNamespace).values({
        id: namespace.id,
        tenantId: namespace.tenantId,
        organisationId: namespace.organisationId ?? null,
        key: namespace.key,
        name: namespace.name,
        description: namespace.description ?? null,
        createdAt: new Date(namespace.createdAt),
        updatedAt: new Date(namespace.updatedAt),
      });
      return namespace;
    },
    async get(ctx, namespaceId) {
      const rows = await db
        .select()
        .from(platformConfigurationNamespace)
        .where(
          and(
            eq(platformConfigurationNamespace.id, namespaceId),
            eq(platformConfigurationNamespace.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapNamespace(rows[0]) : null;
    },
    async update(ctx, namespace) {
      await db
        .update(platformConfigurationNamespace)
        .set({
          name: namespace.name,
          description: namespace.description ?? null,
          updatedAt: new Date(namespace.updatedAt),
        })
        .where(
          and(
            eq(platformConfigurationNamespace.id, namespace.id),
            eq(platformConfigurationNamespace.tenantId, ctx.tenantId),
          ),
        );
      return namespace;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformConfigurationNamespace)
        .where(eq(platformConfigurationNamespace.tenantId, ctx.tenantId))
        .orderBy(asc(platformConfigurationNamespace.key));
      return rows.map(mapNamespace);
    },
  };

  const groups: ConfigurationGroupRepositoryPort = {
    async create(ctx, group) {
      await db.insert(platformConfigurationGroup).values({
        id: group.id,
        tenantId: group.tenantId,
        organisationId: group.organisationId ?? null,
        namespaceId: group.namespaceId,
        key: group.key,
        name: group.name,
        description: group.description ?? null,
        createdAt: new Date(group.createdAt),
        updatedAt: new Date(group.updatedAt),
      });
      return group;
    },
    async get(ctx, groupId) {
      const rows = await db
        .select()
        .from(platformConfigurationGroup)
        .where(
          and(
            eq(platformConfigurationGroup.id, groupId),
            eq(platformConfigurationGroup.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapGroup(rows[0]) : null;
    },
    async update(ctx, group) {
      await db
        .update(platformConfigurationGroup)
        .set({
          name: group.name,
          description: group.description ?? null,
          updatedAt: new Date(group.updatedAt),
        })
        .where(
          and(
            eq(platformConfigurationGroup.id, group.id),
            eq(platformConfigurationGroup.tenantId, ctx.tenantId),
          ),
        );
      return group;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformConfigurationGroup)
        .where(eq(platformConfigurationGroup.tenantId, ctx.tenantId))
        .orderBy(asc(platformConfigurationGroup.key));
      return rows.map(mapGroup);
    },
  };

  const keys: ConfigurationKeyRepositoryPort = {
    async create(ctx, key) {
      await db.insert(platformConfigurationKey).values({
        id: key.id,
        tenantId: key.tenantId,
        organisationId: key.organisationId ?? null,
        namespaceId: key.namespaceId,
        groupId: key.groupId ?? null,
        key: key.key,
        displayName: key.displayName,
        description: key.description ?? null,
        valueKind: key.valueKind,
        createdAt: new Date(key.createdAt),
        updatedAt: new Date(key.updatedAt),
      });
      return key;
    },
    async get(ctx, keyId) {
      const rows = await db
        .select()
        .from(platformConfigurationKey)
        .where(
          and(
            eq(platformConfigurationKey.id, keyId),
            eq(platformConfigurationKey.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapKey(rows[0]) : null;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformConfigurationKey)
        .where(eq(platformConfigurationKey.tenantId, ctx.tenantId))
        .orderBy(asc(platformConfigurationKey.key));
      return rows.map(mapKey);
    },
  };

  const values: ConfigurationValueRepositoryPort = {
    async create(ctx, value) {
      await db.insert(platformConfigurationValue).values({
        id: value.id,
        configurationId: value.configurationId,
        versionId: value.versionId ?? null,
        valueKind: value.valueKind,
        payload: value.payload,
        createdAt: new Date(value.createdAt),
        updatedAt: new Date(value.updatedAt),
      });
      return value;
    },
    async listByConfiguration(ctx, configurationId) {
      const parent = await configurations.get(ctx, configurationId);
      if (!parent) return [];
      const rows = await db
        .select()
        .from(platformConfigurationValue)
        .where(eq(platformConfigurationValue.configurationId, configurationId));
      return rows.map((row) => ({
        id: asConfigurationValueId(row.id),
        configurationId: asConfigurationId(row.configurationId),
        versionId: row.versionId
          ? asConfigurationVersionId(row.versionId)
          : undefined,
        valueKind: row.valueKind as ConfigurationValueKind,
        payload: row.payload,
        createdAt: row.createdAt.toISOString(),
        updatedAt: (row.updatedAt ?? row.createdAt).toISOString(),
      }));
    },
  };

  const versions: ConfigurationVersionRepositoryPort = {
    async create(ctx, version) {
      await db.insert(platformConfigurationVersion).values({
        id: version.id,
        configurationId: version.configurationId,
        versionNumber: version.versionNumber,
        immutable: version.immutable,
        isCurrent: version.isCurrent,
        label: version.label ?? null,
        createdAt: new Date(version.createdAt),
        createdBy: version.createdBy,
        rollbackFromVersionId: version.rollbackFromVersionId ?? null,
      });
      return version;
    },
    async get(ctx, versionId) {
      const rows = await db
        .select()
        .from(platformConfigurationVersion)
        .where(eq(platformConfigurationVersion.id, versionId))
        .limit(1);
      if (!rows[0]) return null;
      const version = mapVersion(rows[0]);
      const parent = await configurations.get(ctx, version.configurationId);
      return parent ? version : null;
    },
    async update(ctx, version) {
      await db
        .update(platformConfigurationVersion)
        .set({
          immutable: version.immutable,
          isCurrent: version.isCurrent,
          label: version.label ?? null,
        })
        .where(eq(platformConfigurationVersion.id, version.id));
      return version;
    },
    async listByConfiguration(ctx, configurationId) {
      const parent = await configurations.get(ctx, configurationId);
      if (!parent) return [];
      const rows = await db
        .select()
        .from(platformConfigurationVersion)
        .where(eq(platformConfigurationVersion.configurationId, configurationId))
        .orderBy(asc(platformConfigurationVersion.versionNumber));
      return rows.map(mapVersion);
    },
  };

  const overrides: ConfigurationOverrideRepositoryPort = {
    async create(ctx, override) {
      await db.insert(platformConfigurationOverride).values({
        id: override.id,
        configurationId: override.configurationId,
        hierarchyLevel: override.hierarchyLevel,
        scopeJson: scopeToJson(override.scope),
        valueId: override.valueId,
        precedenceRank: override.precedenceRank,
        createdAt: new Date(override.createdAt),
        updatedAt: new Date(override.updatedAt),
      });
      return override;
    },
    async get(ctx, overrideId) {
      const rows = await db
        .select()
        .from(platformConfigurationOverride)
        .where(eq(platformConfigurationOverride.id, overrideId))
        .limit(1);
      if (!rows[0]) return null;
      const override = mapOverride(rows[0]);
      const parent = await configurations.get(ctx, override.configurationId);
      return parent ? override : null;
    },
    async update(ctx, override) {
      await db
        .update(platformConfigurationOverride)
        .set({
          hierarchyLevel: override.hierarchyLevel,
          scopeJson: scopeToJson(override.scope),
          valueId: override.valueId,
          precedenceRank: override.precedenceRank,
          updatedAt: new Date(override.updatedAt),
        })
        .where(eq(platformConfigurationOverride.id, override.id));
      return override;
    },
    async listByConfiguration(ctx, configurationId) {
      const parent = await configurations.get(ctx, configurationId);
      if (!parent) return [];
      const rows = await db
        .select()
        .from(platformConfigurationOverride)
        .where(eq(platformConfigurationOverride.configurationId, configurationId));
      return rows.map(mapOverride);
    },
  };

  const validations: ConfigurationValidationRepositoryPort = {
    async create(ctx, validation) {
      await db.insert(platformConfigurationValidation).values({
        id: validation.id,
        configurationKeyId: validation.configurationKeyId,
        kind: validation.kind,
        ruleRef: validation.ruleRef ?? null,
        pattern: validation.pattern ?? null,
        min: validation.min ?? null,
        max: validation.max ?? null,
        enumValuesJson: validation.enumValues
          ? [...validation.enumValues]
          : null,
        required: validation.required ?? null,
        customValidatorKey: validation.customValidatorKey ?? null,
        createdAt: new Date(validation.createdAt),
        updatedAt: new Date(validation.updatedAt),
      });
      return validation;
    },
    async listByKey(ctx, keyId) {
      const key = await keys.get(ctx, keyId);
      if (!key) return [];
      const rows = await db
        .select()
        .from(platformConfigurationValidation)
        .where(eq(platformConfigurationValidation.configurationKeyId, keyId));
      return rows.map(mapValidation);
    },
  };

  const references: ConfigurationReferenceRepositoryPort = {
    async create(ctx, reference) {
      await db.insert(platformConfigurationReference).values({
        id: reference.id,
        configurationId: reference.configurationId,
        kind: reference.kind,
        resourceId: reference.resourceId,
        label: reference.label ?? null,
      });
      return reference;
    },
    async get(ctx, referenceId) {
      const rows = await db
        .select()
        .from(platformConfigurationReference)
        .where(eq(platformConfigurationReference.id, referenceId))
        .limit(1);
      if (!rows[0]) return null;
      const reference = mapReference(rows[0]);
      const parent = await configurations.get(ctx, reference.configurationId);
      return parent ? reference : null;
    },
    async listByConfiguration(ctx, configurationId) {
      const parent = await configurations.get(ctx, configurationId);
      if (!parent) return [];
      const rows = await db
        .select()
        .from(platformConfigurationReference)
        .where(eq(platformConfigurationReference.configurationId, configurationId));
      return rows.map(mapReference);
    },
  };

  const history: ConfigurationHistoryRepositoryPort = {
    async create(ctx, entry) {
      await db.insert(platformConfigurationHistory).values({
        id: entry.id,
        configurationId: entry.configurationId,
        versionId: entry.versionId ?? null,
        summary: entry.summary,
        actorUserId: entry.actorUserId,
        createdAt: new Date(entry.createdAt),
      });
      return entry;
    },
    async listByConfiguration(ctx, configurationId) {
      const parent = await configurations.get(ctx, configurationId);
      if (!parent) return [];
      const rows = await db
        .select()
        .from(platformConfigurationHistory)
        .where(eq(platformConfigurationHistory.configurationId, configurationId));
      return rows.map((row) => ({
        id: asConfigurationHistoryId(row.id),
        configurationId: asConfigurationId(row.configurationId),
        versionId: row.versionId
          ? asConfigurationVersionId(row.versionId)
          : undefined,
        summary: row.summary,
        actorUserId: row.actorUserId,
        createdAt: row.createdAt.toISOString(),
      }));
    },
  };

  const audits: ConfigurationAuditRepositoryPort = {
    async append(ctx, entry) {
      await db.insert(platformConfigurationAudit).values({
        id: entry.id,
        tenantId: entry.tenantId,
        configurationId: entry.configurationId ?? null,
        action: entry.action,
        actorUserId: entry.actorUserId,
        detail: entry.detail ?? null,
        createdAt: new Date(entry.createdAt),
      });
      return entry;
    },
    async get(ctx, auditId) {
      const rows = await db
        .select()
        .from(platformConfigurationAudit)
        .where(
          and(
            eq(platformConfigurationAudit.id, auditId),
            eq(platformConfigurationAudit.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapAudit(rows[0]) : null;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformConfigurationAudit)
        .where(eq(platformConfigurationAudit.tenantId, ctx.tenantId))
        .orderBy(asc(platformConfigurationAudit.createdAt));
      return rows.map(mapAudit);
    },
  };

  return {
    configurations,
    namespaces,
    groups,
    keys,
    values,
    versions,
    overrides,
    validations,
    references,
    history,
    audits,
  };
}
