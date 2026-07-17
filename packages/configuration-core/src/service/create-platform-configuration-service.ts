/**
 * Platform Configuration domain service (APZCONFIG-002).
 * Metadata CRUD / validate / lifecycle only — NEVER runtime apply / secrets / evaluation.
 */

import type {
  Configuration,
  ConfigurationAuditEntry,
  ConfigurationGroup,
  ConfigurationNamespace,
  ConfigurationOverride,
  ConfigurationReference,
  ConfigurationRequestContext,
  ConfigurationScope,
  ConfigurationValidationRuleDescriptor,
  ConfigurationValidationResult,
  ConfigurationVersion,
  CreateConfigurationGroupInput,
  CreateConfigurationInput,
  CreateConfigurationNamespaceInput,
  CreateConfigurationOverrideInput,
  CreateConfigurationVersionInput,
  TransitionConfigurationLifecycleInput,
  UpdateConfigurationGroupInput,
  UpdateConfigurationMetadataInput,
  UpdateConfigurationNamespaceInput,
  UpdateConfigurationOverrideInput,
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
  asConfigurationValueId,
  asConfigurationVersionId,
  CONFIGURATION_LIFECYCLE_STATUSES,
  CONFIGURATION_VALIDATION_KINDS,
} from "@apzhub/configuration-contracts";

import { precedenceRankForHierarchyLevel } from "../hierarchy/precedence";
import { assertConfigurationLifecycleTransition } from "../lifecycle/transitions";
import {
  ConfigurationDomainError,
  requireFound,
  type ConfigurationFoundationRepos,
} from "../ports/repository-ports";
import {
  validateConfigurationAggregate,
  validateConfigurationKeyMetadata,
  validateConfigurationValueMetadata,
} from "../validation/validate-configuration";
import {
  assertVersionImmutable,
  nextVersionNumber,
} from "../versioning/versions";

export type PlatformConfigurationServiceDeps = {
  readonly repos: ConfigurationFoundationRepos;
  readonly now: () => string;
  readonly id: () => string;
  readonly persistenceMode?: "postgres" | "memory";
};

export type PlatformConfigurationDomainService = {
  listConfigurations(
    ctx: ConfigurationRequestContext,
  ): Promise<readonly Configuration[]>;
  getConfiguration(
    ctx: ConfigurationRequestContext,
    configurationId: Configuration["id"],
  ): Promise<Configuration>;
  createConfiguration(
    ctx: ConfigurationRequestContext,
    input: CreateConfigurationInput,
  ): Promise<Configuration>;
  updateConfigurationMetadata(
    ctx: ConfigurationRequestContext,
    input: UpdateConfigurationMetadataInput,
  ): Promise<Configuration>;
  archiveConfiguration(
    ctx: ConfigurationRequestContext,
    configurationId: Configuration["id"],
  ): Promise<Configuration>;
  restoreConfiguration(
    ctx: ConfigurationRequestContext,
    configurationId: Configuration["id"],
  ): Promise<Configuration>;
  transitionLifecycle(
    ctx: ConfigurationRequestContext,
    input: TransitionConfigurationLifecycleInput,
  ): Promise<Configuration>;
  listNamespaces(
    ctx: ConfigurationRequestContext,
  ): Promise<readonly ConfigurationNamespace[]>;
  getNamespace(
    ctx: ConfigurationRequestContext,
    namespaceId: ConfigurationNamespace["id"],
  ): Promise<ConfigurationNamespace>;
  createNamespace(
    ctx: ConfigurationRequestContext,
    input: CreateConfigurationNamespaceInput,
  ): Promise<ConfigurationNamespace>;
  updateNamespace(
    ctx: ConfigurationRequestContext,
    input: UpdateConfigurationNamespaceInput,
  ): Promise<ConfigurationNamespace>;
  listGroups(
    ctx: ConfigurationRequestContext,
  ): Promise<readonly ConfigurationGroup[]>;
  getGroup(
    ctx: ConfigurationRequestContext,
    groupId: ConfigurationGroup["id"],
  ): Promise<ConfigurationGroup>;
  createGroup(
    ctx: ConfigurationRequestContext,
    input: CreateConfigurationGroupInput,
  ): Promise<ConfigurationGroup>;
  updateGroup(
    ctx: ConfigurationRequestContext,
    input: UpdateConfigurationGroupInput,
  ): Promise<ConfigurationGroup>;
  listVersions(
    ctx: ConfigurationRequestContext,
    configurationId: Configuration["id"],
  ): Promise<readonly ConfigurationVersion[]>;
  getVersion(
    ctx: ConfigurationRequestContext,
    versionId: ConfigurationVersion["id"],
  ): Promise<ConfigurationVersion>;
  createVersion(
    ctx: ConfigurationRequestContext,
    input: CreateConfigurationVersionInput,
  ): Promise<ConfigurationVersion>;
  publishVersion(
    ctx: ConfigurationRequestContext,
    versionId: ConfigurationVersion["id"],
  ): Promise<ConfigurationVersion>;
  deprecateVersion(
    ctx: ConfigurationRequestContext,
    versionId: ConfigurationVersion["id"],
  ): Promise<ConfigurationVersion>;
  listOverrides(
    ctx: ConfigurationRequestContext,
    configurationId: Configuration["id"],
  ): Promise<readonly ConfigurationOverride[]>;
  getOverride(
    ctx: ConfigurationRequestContext,
    overrideId: ConfigurationOverride["id"],
  ): Promise<ConfigurationOverride>;
  createOverride(
    ctx: ConfigurationRequestContext,
    input: CreateConfigurationOverrideInput,
  ): Promise<ConfigurationOverride>;
  updateOverride(
    ctx: ConfigurationRequestContext,
    input: UpdateConfigurationOverrideInput,
  ): Promise<ConfigurationOverride>;
  listScopes(
    ctx: ConfigurationRequestContext,
  ): Promise<
    readonly {
      readonly configurationId: Configuration["id"];
      readonly scope: ConfigurationScope;
      readonly scopeKind: ConfigurationScope["kind"];
    }[]
  >;
  getScope(
    ctx: ConfigurationRequestContext,
    configurationId: Configuration["id"],
  ): Promise<{
    readonly configurationId: Configuration["id"];
    readonly scope: ConfigurationScope;
    readonly scopeKind: ConfigurationScope["kind"];
  }>;
  validateConfigurationMetadata(
    configuration: Configuration,
  ): ConfigurationValidationResult;
  listValidationRules(): readonly ConfigurationValidationRuleDescriptor[];
  listReferences(
    ctx: ConfigurationRequestContext,
    configurationId: Configuration["id"],
  ): Promise<readonly ConfigurationReference[]>;
  getReference(
    ctx: ConfigurationRequestContext,
    referenceId: ConfigurationReference["id"],
  ): Promise<ConfigurationReference>;
  listAudit(
    ctx: ConfigurationRequestContext,
    configurationId?: Configuration["id"],
  ): Promise<readonly ConfigurationAuditEntry[]>;
  getAudit(
    ctx: ConfigurationRequestContext,
    auditId: ConfigurationAuditEntry["id"],
  ): Promise<ConfigurationAuditEntry>;
  diagnosticsHealth(ctx: ConfigurationRequestContext): Promise<{
    readonly status: "healthy" | "degraded" | "unavailable";
    readonly persistenceMode: "postgres" | "memory";
    readonly runtimeApplyEnabled: false;
    readonly checkedAt: string;
  }>;
  diagnosticsReadiness(ctx: ConfigurationRequestContext): Promise<{
    readonly ready: boolean;
    readonly configurationEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly runtimeApplyEnabled: false;
    readonly capabilities: readonly string[];
  }>;
  diagnosticsCapabilities(ctx: ConfigurationRequestContext): Promise<{
    readonly runtimeApply: false;
    readonly lifecycle: readonly (typeof CONFIGURATION_LIFECYCLE_STATUSES)[number][];
    readonly facets: readonly string[];
  }>;
};

function assertCtx(ctx: ConfigurationRequestContext): void {
  if (!ctx.tenantId?.trim()) {
    throw new ConfigurationDomainError("validation_error", "tenantId is required");
  }
  if (!ctx.userId?.trim()) {
    throw new ConfigurationDomainError("validation_error", "userId is required");
  }
}

async function appendAudit(
  deps: PlatformConfigurationServiceDeps,
  ctx: ConfigurationRequestContext,
  configurationId: Configuration["id"] | undefined,
  action: ConfigurationAuditEntry["action"],
  detail?: string,
): Promise<void> {
  const entry: ConfigurationAuditEntry = {
    id: asConfigurationAuditId(deps.id()),
    tenantId: ctx.tenantId,
    configurationId,
    action,
    actorUserId: ctx.userId,
    detail,
    createdAt: deps.now(),
  };
  await deps.repos.audits.append(ctx, entry);
}

export function createPlatformConfigurationService(
  deps: PlatformConfigurationServiceDeps,
): PlatformConfigurationDomainService {
  if (!deps?.repos) {
    throw new ConfigurationDomainError(
      "missing_repos",
      "createPlatformConfigurationService requires explicit repos",
    );
  }

  const persistenceMode = deps.persistenceMode ?? "memory";

  async function performLifecycleTransition(
    ctx: ConfigurationRequestContext,
    input: TransitionConfigurationLifecycleInput,
  ): Promise<Configuration> {
    assertCtx(ctx);
    const existing = requireFound(
      await deps.repos.configurations.get(ctx, input.configurationId),
      "configuration",
      input.configurationId,
    );
    assertConfigurationLifecycleTransition(existing.status, input.to);
    const now = deps.now();
    const updated: Configuration = {
      ...existing,
      status: input.to,
      updatedAt: now,
      updatedBy: ctx.userId,
      revision: existing.revision + 1,
    };
    validateConfigurationAggregate(updated);
    const saved = await deps.repos.configurations.update(ctx, updated);
    await appendAudit(
      deps,
      ctx,
      saved.id,
      input.to === "archived"
        ? "archived"
        : input.to === "published"
          ? "published"
          : input.to === "deprecated"
            ? "deprecated"
            : "lifecycle_changed",
      input.reason,
    );
    return saved;
  }

  async function resolveNamespace(
    ctx: ConfigurationRequestContext,
    input: CreateConfigurationInput,
  ): Promise<ConfigurationNamespace> {
    const existing = (await deps.repos.namespaces.list(ctx)).find(
      (ns) => ns.key === input.namespaceKey,
    );
    if (existing) return existing;
    const now = deps.now();
    const namespace: ConfigurationNamespace = {
      id: asConfigurationNamespaceId(deps.id()),
      tenantId: ctx.tenantId,
      organisationId: input.organisationId ?? ctx.organisationId,
      key: input.namespaceKey,
      name: input.namespaceName ?? input.namespaceKey,
      createdAt: now,
      updatedAt: now,
    };
    return deps.repos.namespaces.create(ctx, namespace);
  }

  async function resolveGroup(
    ctx: ConfigurationRequestContext,
    namespaceId: ConfigurationNamespace["id"],
    input: CreateConfigurationInput,
  ): Promise<ConfigurationGroup | undefined> {
    if (!input.groupKey) return undefined;
    const existing = (await deps.repos.groups.list(ctx)).find(
      (group) =>
        group.namespaceId === namespaceId && group.key === input.groupKey,
    );
    if (existing) return existing;
    const now = deps.now();
    const group: ConfigurationGroup = {
      id: asConfigurationGroupId(deps.id()),
      tenantId: ctx.tenantId,
      organisationId: input.organisationId ?? ctx.organisationId,
      namespaceId,
      key: input.groupKey,
      name: input.groupName ?? input.groupKey,
      createdAt: now,
      updatedAt: now,
    };
    return deps.repos.groups.create(ctx, group);
  }

  return {
    async listConfigurations(ctx) {
      assertCtx(ctx);
      return deps.repos.configurations.list(ctx);
    },

    async getConfiguration(ctx, configurationId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.configurations.get(ctx, configurationId),
        "configuration",
        configurationId,
      );
    },

    async createConfiguration(ctx, input) {
      assertCtx(ctx);
      const namespace = await resolveNamespace(ctx, input);
      const group = await resolveGroup(ctx, namespace.id, input);
      const now = deps.now();
      const key = {
        id: asConfigurationKeyId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        namespaceId: namespace.id,
        groupId: group?.id,
        key: input.key,
        displayName: input.displayName,
        description: input.description,
        valueKind: input.valueKind,
        createdAt: now,
        updatedAt: now,
      };
      validateConfigurationKeyMetadata(key);
      await deps.repos.keys.create(ctx, key);

      const configuration: Configuration = {
        id: asConfigurationId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        namespaceId: namespace.id,
        groupId: group?.id,
        keyId: key.id,
        hierarchyLevel: input.hierarchyLevel,
        scope: input.scope,
        status: "draft",
        inheritsFromConfigurationId: input.inheritsFromConfigurationId,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      };
      validateConfigurationAggregate(configuration);
      const saved = await deps.repos.configurations.create(ctx, configuration);

      if (input.references?.length) {
        for (const ref of input.references) {
          await deps.repos.references.create(ctx, {
            id: asConfigurationReferenceId(deps.id()),
            configurationId: saved.id,
            kind: ref.kind,
            resourceId: ref.resourceId,
            label: ref.label,
          });
        }
      }

      await appendAudit(deps, ctx, saved.id, "created");
      return saved;
    },

    async updateConfigurationMetadata(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.configurations.get(ctx, input.configurationId),
        "configuration",
        input.configurationId,
      );
      const now = deps.now();
      const updated: Configuration = {
        ...existing,
        hierarchyLevel: input.hierarchyLevel ?? existing.hierarchyLevel,
        scope: input.scope ?? existing.scope,
        inheritsFromConfigurationId:
          input.inheritsFromConfigurationId === null
            ? undefined
            : (input.inheritsFromConfigurationId ??
              existing.inheritsFromConfigurationId),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? existing.organisationId),
        updatedAt: now,
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      validateConfigurationAggregate(updated);
      const saved = await deps.repos.configurations.update(ctx, updated);
      await appendAudit(deps, ctx, saved.id, "updated");
      return saved;
    },

    async archiveConfiguration(ctx, configurationId) {
      return performLifecycleTransition(ctx, {
        configurationId,
        to: "archived",
      });
    },

    async restoreConfiguration(ctx, configurationId) {
      return performLifecycleTransition(ctx, {
        configurationId,
        to: "draft",
      });
    },

    async transitionLifecycle(ctx, input) {
      return performLifecycleTransition(ctx, input);
    },

    async listNamespaces(ctx) {
      assertCtx(ctx);
      return deps.repos.namespaces.list(ctx);
    },

    async getNamespace(ctx, namespaceId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.namespaces.get(ctx, namespaceId),
        "namespace",
        namespaceId,
      );
    },

    async createNamespace(ctx, input) {
      assertCtx(ctx);
      const now = deps.now();
      const namespace: ConfigurationNamespace = {
        id: asConfigurationNamespaceId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        key: input.key,
        name: input.name,
        description: input.description,
        createdAt: now,
        updatedAt: now,
      };
      return deps.repos.namespaces.create(ctx, namespace);
    },

    async updateNamespace(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.namespaces.get(ctx, input.namespaceId),
        "namespace",
        input.namespaceId,
      );
      const updated: ConfigurationNamespace = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null ? undefined : (input.description ?? existing.description),
        updatedAt: deps.now(),
      };
      return deps.repos.namespaces.update(ctx, updated);
    },

    async listGroups(ctx) {
      assertCtx(ctx);
      return deps.repos.groups.list(ctx);
    },

    async getGroup(ctx, groupId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.groups.get(ctx, groupId),
        "group",
        groupId,
      );
    },

    async createGroup(ctx, input) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.namespaces.get(ctx, input.namespaceId),
        "namespace",
        input.namespaceId,
      );
      const now = deps.now();
      const group: ConfigurationGroup = {
        id: asConfigurationGroupId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        namespaceId: input.namespaceId,
        key: input.key,
        name: input.name,
        description: input.description,
        createdAt: now,
        updatedAt: now,
      };
      return deps.repos.groups.create(ctx, group);
    },

    async updateGroup(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.groups.get(ctx, input.groupId),
        "group",
        input.groupId,
      );
      const updated: ConfigurationGroup = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null ? undefined : (input.description ?? existing.description),
        updatedAt: deps.now(),
      };
      return deps.repos.groups.update(ctx, updated);
    },

    async listVersions(ctx, configurationId) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.configurations.get(ctx, configurationId),
        "configuration",
        configurationId,
      );
      return deps.repos.versions.listByConfiguration(ctx, configurationId);
    },

    async getVersion(ctx, versionId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.versions.get(ctx, versionId),
        "version",
        versionId,
      );
    },

    async createVersion(ctx, input) {
      assertCtx(ctx);
      const configuration = requireFound(
        await deps.repos.configurations.get(ctx, input.configurationId),
        "configuration",
        input.configurationId,
      );
      const existingVersions = await deps.repos.versions.listByConfiguration(
        ctx,
        input.configurationId,
      );
      const now = deps.now();
      const valueId = asConfigurationValueId(deps.id());
      const value = {
        id: valueId,
        configurationId: configuration.id,
        valueKind: input.valueKind,
        payload: input.payload,
        createdAt: now,
        updatedAt: now,
      };
      const key = requireFound(
        await deps.repos.keys.get(ctx, configuration.keyId),
        "key",
        configuration.keyId,
      );
      validateConfigurationValueMetadata(value, key);

      const versionId = asConfigurationVersionId(deps.id());
      const version: ConfigurationVersion = {
        id: versionId,
        configurationId: configuration.id,
        versionNumber: nextVersionNumber(existingVersions),
        immutable: true,
        isCurrent: false,
        label: input.label,
        createdAt: now,
        createdBy: ctx.userId,
      };
      assertVersionImmutable(version);
      await deps.repos.values.create(ctx, { ...value, versionId });
      const saved = await deps.repos.versions.create(ctx, version);
      await deps.repos.history.create(ctx, {
        id: asConfigurationHistoryId(deps.id()),
        configurationId: configuration.id,
        versionId: saved.id,
        summary: `Version ${saved.versionNumber} created`,
        actorUserId: ctx.userId,
        createdAt: now,
      });
      await appendAudit(deps, ctx, configuration.id, "version_created");
      return saved;
    },

    async publishVersion(ctx, versionId) {
      assertCtx(ctx);
      const version = requireFound(
        await deps.repos.versions.get(ctx, versionId),
        "version",
        versionId,
      );
      const configuration = requireFound(
        await deps.repos.configurations.get(ctx, version.configurationId),
        "configuration",
        version.configurationId,
      );
      const allVersions = await deps.repos.versions.listByConfiguration(
        ctx,
        configuration.id,
      );
      for (const existing of allVersions) {
        if (existing.isCurrent && existing.id !== version.id) {
          await deps.repos.versions.update(ctx, {
            ...existing,
            isCurrent: false,
          });
        }
      }
      const published = await deps.repos.versions.update(ctx, {
        ...version,
        isCurrent: true,
      });
      const transitioned = await performLifecycleTransition(ctx, {
        configurationId: configuration.id,
        to: "published",
        reason: `Published version ${published.versionNumber}`,
      });
      const now = deps.now();
      await deps.repos.configurations.update(ctx, {
        ...transitioned,
        currentVersionId: published.id,
        updatedAt: now,
        updatedBy: ctx.userId,
        revision: transitioned.revision + 1,
      });
      await appendAudit(deps, ctx, configuration.id, "published");
      return published;
    },

    async deprecateVersion(ctx, versionId) {
      assertCtx(ctx);
      const version = requireFound(
        await deps.repos.versions.get(ctx, versionId),
        "version",
        versionId,
      );
      const configuration = requireFound(
        await deps.repos.configurations.get(ctx, version.configurationId),
        "configuration",
        version.configurationId,
      );
      await performLifecycleTransition(ctx, {
        configurationId: configuration.id,
        to: "deprecated",
        reason: `Deprecated version ${version.versionNumber}`,
      });
      if (version.isCurrent) {
        await deps.repos.versions.update(ctx, { ...version, isCurrent: false });
      }
      await appendAudit(deps, ctx, configuration.id, "deprecated");
      return version;
    },

    async listOverrides(ctx, configurationId) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.configurations.get(ctx, configurationId),
        "configuration",
        configurationId,
      );
      return deps.repos.overrides.listByConfiguration(ctx, configurationId);
    },

    async getOverride(ctx, overrideId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.overrides.get(ctx, overrideId),
        "override",
        overrideId,
      );
    },

    async createOverride(ctx, input) {
      assertCtx(ctx);
      const configuration = requireFound(
        await deps.repos.configurations.get(ctx, input.configurationId),
        "configuration",
        input.configurationId,
      );
      const now = deps.now();
      const valueId = asConfigurationValueId(deps.id());
      const value = {
        id: valueId,
        configurationId: configuration.id,
        valueKind: input.valueKind,
        payload: input.payload,
        createdAt: now,
        updatedAt: now,
      };
      validateConfigurationValueMetadata(value);
      await deps.repos.values.create(ctx, value);
      const override: ConfigurationOverride = {
        id: asConfigurationOverrideId(deps.id()),
        configurationId: configuration.id,
        hierarchyLevel: input.hierarchyLevel,
        scope: input.scope,
        valueId,
        precedenceRank: precedenceRankForHierarchyLevel(input.hierarchyLevel),
        createdAt: now,
        updatedAt: now,
      };
      const saved = await deps.repos.overrides.create(ctx, override);
      await appendAudit(deps, ctx, configuration.id, "override_created");
      return saved;
    },

    async updateOverride(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.overrides.get(ctx, input.overrideId),
        "override",
        input.overrideId,
      );
      const now = deps.now();
      if (input.payload || input.valueKind) {
        const valueRows = await deps.repos.values.listByConfiguration(
          ctx,
          existing.configurationId,
        );
        const value = valueRows.find((row) => row.id === existing.valueId);
        if (value && (input.payload || input.valueKind)) {
          const updatedValue = {
            ...value,
            payload: input.payload ?? value.payload,
            valueKind: input.valueKind ?? value.valueKind,
            updatedAt: now,
          };
          validateConfigurationValueMetadata(updatedValue);
          await deps.repos.values.create(ctx, updatedValue);
        }
      }
      const hierarchyLevel = input.hierarchyLevel ?? existing.hierarchyLevel;
      const updated: ConfigurationOverride = {
        ...existing,
        hierarchyLevel,
        scope: input.scope ?? existing.scope,
        precedenceRank: precedenceRankForHierarchyLevel(hierarchyLevel),
        updatedAt: now,
      };
      const saved = await deps.repos.overrides.update(ctx, updated);
      await appendAudit(deps, ctx, existing.configurationId, "override_updated");
      return saved;
    },

    async listScopes(ctx) {
      assertCtx(ctx);
      const configurations = await deps.repos.configurations.list(ctx);
      return configurations.map((configuration) => ({
        configurationId: configuration.id,
        scope: configuration.scope,
        scopeKind: configuration.scope.kind,
      }));
    },

    async getScope(ctx, configurationId) {
      assertCtx(ctx);
      const configuration = requireFound(
        await deps.repos.configurations.get(ctx, configurationId),
        "configuration",
        configurationId,
      );
      return {
        configurationId: configuration.id,
        scope: configuration.scope,
        scopeKind: configuration.scope.kind,
      };
    },

    validateConfigurationMetadata(configuration) {
      try {
        validateConfigurationAggregate(configuration);
        return { valid: true, errors: [] };
      } catch (error) {
        const message =
          error instanceof ConfigurationDomainError
            ? error.message
            : "Configuration metadata validation failed";
        return { valid: false, errors: [message] };
      }
    },

    listValidationRules() {
      return CONFIGURATION_VALIDATION_KINDS.map((kind) => ({
        kind,
        description: `Validation rule metadata for ${kind}`,
      }));
    },

    async listReferences(ctx, configurationId) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.configurations.get(ctx, configurationId),
        "configuration",
        configurationId,
      );
      return deps.repos.references.listByConfiguration(ctx, configurationId);
    },

    async getReference(ctx, referenceId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.references.get(ctx, referenceId),
        "reference",
        referenceId,
      );
    },

    async listAudit(ctx, configurationId) {
      assertCtx(ctx);
      const entries = await deps.repos.audits.list(ctx);
      if (!configurationId) return entries;
      return entries.filter((entry) => entry.configurationId === configurationId);
    },

    async getAudit(ctx, auditId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.audits.get(ctx, auditId),
        "audit",
        auditId,
      );
    },

    async diagnosticsHealth(ctx) {
      assertCtx(ctx);
      return {
        status: "healthy" as const,
        persistenceMode,
        runtimeApplyEnabled: false as const,
        checkedAt: deps.now(),
      };
    },

    async diagnosticsReadiness(ctx) {
      assertCtx(ctx);
      return {
        ready: true,
        configurationEnabled: true as const,
        persistenceMode,
        runtimeApplyEnabled: false as const,
        capabilities: [
          "configurations",
          "namespaces",
          "groups",
          "versions",
          "overrides",
          "scopes",
          "validation",
          "references",
          "audit",
          "diagnostics",
        ],
      };
    },

    async diagnosticsCapabilities() {
      return {
        runtimeApply: false as const,
        lifecycle: CONFIGURATION_LIFECYCLE_STATUSES,
        facets: [
          "configurations",
          "namespaces",
          "groups",
          "versions",
          "overrides",
          "scopes",
          "validation",
          "references",
          "audit",
          "diagnostics",
        ],
      };
    },
  };
}
