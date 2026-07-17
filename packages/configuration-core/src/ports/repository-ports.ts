/**
 * Configuration repository ports (APZCONFIG-001).
 * Interfaces only — no Drizzle / HTTP / memory defaults.
 */

import type {
  Configuration,
  ConfigurationAuditEntry,
  ConfigurationGroup,
  ConfigurationHistory,
  ConfigurationId,
  ConfigurationKey,
  ConfigurationKeyId,
  ConfigurationNamespace,
  ConfigurationNamespaceId,
  ConfigurationGroupId,
  ConfigurationOverride,
  ConfigurationReference,
  ConfigurationRequestContext,
  ConfigurationValidation,
  ConfigurationValue,
  ConfigurationVersion,
  ConfigurationVersionId,
} from "@apzhub/configuration-contracts";

export class ConfigurationDomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "ConfigurationDomainError";
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  kind: string,
  id: string,
): T {
  if (value == null) {
    throw new ConfigurationDomainError("not_found", `${kind} not found: ${id}`, {
      kind,
      id,
    });
  }
  return value;
}

export interface ConfigurationRepositoryPort {
  create(
    ctx: ConfigurationRequestContext,
    configuration: Configuration,
  ): Promise<Configuration>;
  get(
    ctx: ConfigurationRequestContext,
    configurationId: ConfigurationId,
  ): Promise<Configuration | null>;
  update(
    ctx: ConfigurationRequestContext,
    configuration: Configuration,
  ): Promise<Configuration>;
  list(
    ctx: ConfigurationRequestContext,
  ): Promise<readonly Configuration[]>;
}

export interface ConfigurationNamespaceRepositoryPort {
  create(
    ctx: ConfigurationRequestContext,
    namespace: ConfigurationNamespace,
  ): Promise<ConfigurationNamespace>;
  get(
    ctx: ConfigurationRequestContext,
    namespaceId: ConfigurationNamespaceId,
  ): Promise<ConfigurationNamespace | null>;
  update(
    ctx: ConfigurationRequestContext,
    namespace: ConfigurationNamespace,
  ): Promise<ConfigurationNamespace>;
  list(
    ctx: ConfigurationRequestContext,
  ): Promise<readonly ConfigurationNamespace[]>;
}

export interface ConfigurationGroupRepositoryPort {
  create(
    ctx: ConfigurationRequestContext,
    group: ConfigurationGroup,
  ): Promise<ConfigurationGroup>;
  get(
    ctx: ConfigurationRequestContext,
    groupId: ConfigurationGroupId,
  ): Promise<ConfigurationGroup | null>;
  update(
    ctx: ConfigurationRequestContext,
    group: ConfigurationGroup,
  ): Promise<ConfigurationGroup>;
  list(
    ctx: ConfigurationRequestContext,
  ): Promise<readonly ConfigurationGroup[]>;
}

export interface ConfigurationKeyRepositoryPort {
  create(
    ctx: ConfigurationRequestContext,
    key: ConfigurationKey,
  ): Promise<ConfigurationKey>;
  get(
    ctx: ConfigurationRequestContext,
    keyId: ConfigurationKeyId,
  ): Promise<ConfigurationKey | null>;
  list(
    ctx: ConfigurationRequestContext,
  ): Promise<readonly ConfigurationKey[]>;
}

export interface ConfigurationValueRepositoryPort {
  create(
    ctx: ConfigurationRequestContext,
    value: ConfigurationValue,
  ): Promise<ConfigurationValue>;
  listByConfiguration(
    ctx: ConfigurationRequestContext,
    configurationId: ConfigurationId,
  ): Promise<readonly ConfigurationValue[]>;
}

export interface ConfigurationVersionRepositoryPort {
  create(
    ctx: ConfigurationRequestContext,
    version: ConfigurationVersion,
  ): Promise<ConfigurationVersion>;
  get(
    ctx: ConfigurationRequestContext,
    versionId: ConfigurationVersionId,
  ): Promise<ConfigurationVersion | null>;
  update(
    ctx: ConfigurationRequestContext,
    version: ConfigurationVersion,
  ): Promise<ConfigurationVersion>;
  listByConfiguration(
    ctx: ConfigurationRequestContext,
    configurationId: ConfigurationId,
  ): Promise<readonly ConfigurationVersion[]>;
}

export interface ConfigurationOverrideRepositoryPort {
  create(
    ctx: ConfigurationRequestContext,
    override: ConfigurationOverride,
  ): Promise<ConfigurationOverride>;
  get(
    ctx: ConfigurationRequestContext,
    overrideId: ConfigurationOverride["id"],
  ): Promise<ConfigurationOverride | null>;
  update(
    ctx: ConfigurationRequestContext,
    override: ConfigurationOverride,
  ): Promise<ConfigurationOverride>;
  listByConfiguration(
    ctx: ConfigurationRequestContext,
    configurationId: ConfigurationId,
  ): Promise<readonly ConfigurationOverride[]>;
}

export interface ConfigurationValidationRepositoryPort {
  create(
    ctx: ConfigurationRequestContext,
    validation: ConfigurationValidation,
  ): Promise<ConfigurationValidation>;
  listByKey(
    ctx: ConfigurationRequestContext,
    keyId: ConfigurationKeyId,
  ): Promise<readonly ConfigurationValidation[]>;
}

export interface ConfigurationReferenceRepositoryPort {
  create(
    ctx: ConfigurationRequestContext,
    reference: ConfigurationReference,
  ): Promise<ConfigurationReference>;
  get(
    ctx: ConfigurationRequestContext,
    referenceId: ConfigurationReference["id"],
  ): Promise<ConfigurationReference | null>;
  listByConfiguration(
    ctx: ConfigurationRequestContext,
    configurationId: ConfigurationId,
  ): Promise<readonly ConfigurationReference[]>;
}

export interface ConfigurationHistoryRepositoryPort {
  create(
    ctx: ConfigurationRequestContext,
    history: ConfigurationHistory,
  ): Promise<ConfigurationHistory>;
  listByConfiguration(
    ctx: ConfigurationRequestContext,
    configurationId: ConfigurationId,
  ): Promise<readonly ConfigurationHistory[]>;
}

export interface ConfigurationAuditRepositoryPort {
  append(
    ctx: ConfigurationRequestContext,
    entry: ConfigurationAuditEntry,
  ): Promise<ConfigurationAuditEntry>;
  get(
    ctx: ConfigurationRequestContext,
    auditId: ConfigurationAuditEntry["id"],
  ): Promise<ConfigurationAuditEntry | null>;
  list(
    ctx: ConfigurationRequestContext,
  ): Promise<readonly ConfigurationAuditEntry[]>;
}

export type ConfigurationFoundationRepos = {
  readonly configurations: ConfigurationRepositoryPort;
  readonly namespaces: ConfigurationNamespaceRepositoryPort;
  readonly groups: ConfigurationGroupRepositoryPort;
  readonly keys: ConfigurationKeyRepositoryPort;
  readonly values: ConfigurationValueRepositoryPort;
  readonly versions: ConfigurationVersionRepositoryPort;
  readonly overrides: ConfigurationOverrideRepositoryPort;
  readonly validations: ConfigurationValidationRepositoryPort;
  readonly references: ConfigurationReferenceRepositoryPort;
  readonly history: ConfigurationHistoryRepositoryPort;
  readonly audits: ConfigurationAuditRepositoryPort;
};
