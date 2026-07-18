/**
 * In-memory Configuration Platform repositories (APZCONFIG-001).
 * Metadata only — never stores secrets, credentials, or binaries.
 */

import type {
  Configuration,
  ConfigurationAuditEntry,
  ConfigurationGroup,
  ConfigurationHistory,
  ConfigurationKey,
  ConfigurationNamespace,
  ConfigurationOverride,
  ConfigurationReference,
  ConfigurationRequestContext,
  ConfigurationValidation,
  ConfigurationValue,
  ConfigurationVersion,
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

export type ConfigurationInMemoryStores = {
  readonly configurations: Map<string, Configuration>;
  readonly namespaces: Map<string, ConfigurationNamespace>;
  readonly groups: Map<string, ConfigurationGroup>;
  readonly keys: Map<string, ConfigurationKey>;
  readonly values: Map<string, ConfigurationValue>;
  readonly versions: Map<string, ConfigurationVersion>;
  readonly overrides: Map<string, ConfigurationOverride>;
  readonly validations: Map<string, ConfigurationValidation>;
  readonly references: Map<string, ConfigurationReference>;
  readonly history: Map<string, ConfigurationHistory>;
  readonly audits: Map<string, ConfigurationAuditEntry>;
};

export function createEmptyConfigurationInMemoryStores(): ConfigurationInMemoryStores {
  return {
    configurations: new Map(),
    namespaces: new Map(),
    groups: new Map(),
    keys: new Map(),
    values: new Map(),
    versions: new Map(),
    overrides: new Map(),
    validations: new Map(),
    references: new Map(),
    history: new Map(),
    audits: new Map(),
  };
}

function assertTenant(ctx: ConfigurationRequestContext, tenantId: string): void {
  if (tenantId !== ctx.tenantId) {
    throw new Error("tenant_mismatch");
  }
}

export type InMemoryConfigurationRepositories = ConfigurationFoundationRepos;

export function createInMemoryConfigurationRepositories(
  stores: ConfigurationInMemoryStores,
): InMemoryConfigurationRepositories {
  const configurations: ConfigurationRepositoryPort = {
    async create(ctx, configuration) {
      assertTenant(ctx, configuration.tenantId);
      stores.configurations.set(configuration.id, configuration);
      return configuration;
    },
    async get(ctx, configurationId) {
      const row = stores.configurations.get(configurationId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, configuration) {
      assertTenant(ctx, configuration.tenantId);
      stores.configurations.set(configuration.id, configuration);
      return configuration;
    },
    async list(ctx) {
      return [...stores.configurations.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const namespaces: ConfigurationNamespaceRepositoryPort = {
    async create(ctx, namespace) {
      assertTenant(ctx, namespace.tenantId);
      stores.namespaces.set(namespace.id, namespace);
      return namespace;
    },
    async get(ctx, namespaceId) {
      const row = stores.namespaces.get(namespaceId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx) {
      return [...stores.namespaces.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
    async update(ctx, namespace) {
      assertTenant(ctx, namespace.tenantId);
      stores.namespaces.set(namespace.id, namespace);
      return namespace;
    },
  };

  const groups: ConfigurationGroupRepositoryPort = {
    async create(ctx, group) {
      assertTenant(ctx, group.tenantId);
      stores.groups.set(group.id, group);
      return group;
    },
    async get(ctx, groupId) {
      const row = stores.groups.get(groupId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx) {
      return [...stores.groups.values()].filter((row) => row.tenantId === ctx.tenantId);
    },
    async update(ctx, group) {
      assertTenant(ctx, group.tenantId);
      stores.groups.set(group.id, group);
      return group;
    },
  };

  const keys: ConfigurationKeyRepositoryPort = {
    async create(ctx, key) {
      assertTenant(ctx, key.tenantId);
      stores.keys.set(key.id, key);
      return key;
    },
    async get(ctx, keyId) {
      const row = stores.keys.get(keyId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx) {
      return [...stores.keys.values()].filter((row) => row.tenantId === ctx.tenantId);
    },
  };

  const values: ConfigurationValueRepositoryPort = {
    async create(ctx, value) {
      const parent = stores.configurations.get(value.configurationId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.values.set(value.id, value);
      return value;
    },
    async listByConfiguration(ctx, configurationId) {
      const parent = stores.configurations.get(configurationId);
      if (parent && parent.tenantId !== ctx.tenantId) return [];
      return [...stores.values.values()].filter(
        (row) => row.configurationId === configurationId,
      );
    },
  };

  const versions: ConfigurationVersionRepositoryPort = {
    async create(ctx, version) {
      const parent = stores.configurations.get(version.configurationId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.versions.set(version.id, version);
      return version;
    },
    async get(ctx, versionId) {
      const row = stores.versions.get(versionId) ?? null;
      if (!row) return null;
      const parent = stores.configurations.get(row.configurationId);
      if (parent && parent.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async listByConfiguration(ctx, configurationId) {
      const parent = stores.configurations.get(configurationId);
      if (parent && parent.tenantId !== ctx.tenantId) return [];
      return [...stores.versions.values()].filter(
        (row) => row.configurationId === configurationId,
      );
    },
    async update(ctx, version) {
      const parent = stores.configurations.get(version.configurationId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.versions.set(version.id, version);
      return version;
    },
  };

  const overrides: ConfigurationOverrideRepositoryPort = {
    async create(ctx, override) {
      const parent = stores.configurations.get(override.configurationId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.overrides.set(override.id, override);
      return override;
    },
    async get(ctx, overrideId) {
      const row = stores.overrides.get(overrideId) ?? null;
      if (!row) return null;
      const parent = stores.configurations.get(row.configurationId);
      if (parent && parent.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, override) {
      const parent = stores.configurations.get(override.configurationId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.overrides.set(override.id, override);
      return override;
    },
    async listByConfiguration(ctx, configurationId) {
      const parent = stores.configurations.get(configurationId);
      if (parent && parent.tenantId !== ctx.tenantId) return [];
      return [...stores.overrides.values()].filter(
        (row) => row.configurationId === configurationId,
      );
    },
  };

  const validations: ConfigurationValidationRepositoryPort = {
    async create(ctx, validation) {
      const key = stores.keys.get(validation.configurationKeyId);
      if (key) assertTenant(ctx, key.tenantId);
      stores.validations.set(validation.id, validation);
      return validation;
    },
    async listByKey(ctx, keyId) {
      const key = stores.keys.get(keyId);
      if (key && key.tenantId !== ctx.tenantId) return [];
      return [...stores.validations.values()].filter(
        (row) => row.configurationKeyId === keyId,
      );
    },
  };

  const references: ConfigurationReferenceRepositoryPort = {
    async create(ctx, reference) {
      const parent = stores.configurations.get(reference.configurationId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.references.set(reference.id, reference);
      return reference;
    },
    async listByConfiguration(ctx, configurationId) {
      const parent = stores.configurations.get(configurationId);
      if (parent && parent.tenantId !== ctx.tenantId) return [];
      return [...stores.references.values()].filter(
        (row) => row.configurationId === configurationId,
      );
    },
    async get(ctx, referenceId) {
      const row = stores.references.get(referenceId) ?? null;
      if (!row) return null;
      const parent = stores.configurations.get(row.configurationId);
      if (parent && parent.tenantId !== ctx.tenantId) return null;
      return row;
    },
  };

  const history: ConfigurationHistoryRepositoryPort = {
    async create(ctx, entry) {
      const parent = stores.configurations.get(entry.configurationId);
      if (parent) assertTenant(ctx, parent.tenantId);
      stores.history.set(entry.id, entry);
      return entry;
    },
    async listByConfiguration(ctx, configurationId) {
      const parent = stores.configurations.get(configurationId);
      if (parent && parent.tenantId !== ctx.tenantId) return [];
      return [...stores.history.values()].filter(
        (row) => row.configurationId === configurationId,
      );
    },
  };

  const audits: ConfigurationAuditRepositoryPort = {
    async append(ctx, entry) {
      assertTenant(ctx, entry.tenantId);
      stores.audits.set(entry.id, entry);
      return entry;
    },
    async list(ctx) {
      return [...stores.audits.values()].filter((row) => row.tenantId === ctx.tenantId);
    },
    async get(ctx, auditId) {
      const row = stores.audits.get(auditId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
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
