/**
 * Platform Configuration service contract (APZCONFIG-001).
 * Interface only — implementation deferred to APZCONFIG-002 Platform Services.
 * No runtime apply / secret / HTTP methods.
 */

import type { ConfigurationRequestContext } from "../common/context";
import type {
  Configuration,
  ConfigurationAuditEntry,
  ConfigurationGroup,
  ConfigurationKey,
  ConfigurationNamespace,
  ConfigurationOverride,
  ConfigurationValidation,
  ConfigurationVersion,
} from "../domain/configuration";
import type {
  ConfigurationId,
  ConfigurationKeyId,
  ConfigurationNamespaceId,
  ConfigurationGroupId,
} from "../identifiers";

export type ConfigurationPlatformService = {
  listConfigurations(
    ctx: ConfigurationRequestContext,
  ): Promise<readonly Configuration[]>;
  getConfiguration(
    ctx: ConfigurationRequestContext,
    configurationId: ConfigurationId,
  ): Promise<Configuration | null>;
  listNamespaces(
    ctx: ConfigurationRequestContext,
  ): Promise<readonly ConfigurationNamespace[]>;
  getNamespace(
    ctx: ConfigurationRequestContext,
    namespaceId: ConfigurationNamespaceId,
  ): Promise<ConfigurationNamespace | null>;
  listGroups(ctx: ConfigurationRequestContext): Promise<readonly ConfigurationGroup[]>;
  getGroup(
    ctx: ConfigurationRequestContext,
    groupId: ConfigurationGroupId,
  ): Promise<ConfigurationGroup | null>;
  listKeys(ctx: ConfigurationRequestContext): Promise<readonly ConfigurationKey[]>;
  getKey(
    ctx: ConfigurationRequestContext,
    keyId: ConfigurationKeyId,
  ): Promise<ConfigurationKey | null>;
  listVersions(
    ctx: ConfigurationRequestContext,
    configurationId: ConfigurationId,
  ): Promise<readonly ConfigurationVersion[]>;
  listOverrides(
    ctx: ConfigurationRequestContext,
    configurationId: ConfigurationId,
  ): Promise<readonly ConfigurationOverride[]>;
  listValidations(
    ctx: ConfigurationRequestContext,
    keyId: ConfigurationKeyId,
  ): Promise<readonly ConfigurationValidation[]>;
  listAudit(
    ctx: ConfigurationRequestContext,
  ): Promise<readonly ConfigurationAuditEntry[]>;
};
