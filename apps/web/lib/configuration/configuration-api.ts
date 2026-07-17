/**
 * Module-level Platform Configuration client accessor + facades
 * (APZCONFIG-003 / APZCONFIG-004).
 */

import {
  createHttpConfigurationClient,
  type ConfigurationClient,
} from "./configuration-client";
import { createMockConfigurationClient } from "./mock-configuration-client";
import type {
  ConfigurationClientRequestOptions,
  CreateConfigurationClientInput,
  CreateConfigurationOverrideClientInput,
  CreateConfigurationVersionClientInput,
  ListConfigurationsClientQuery,
  TransitionConfigurationClientInput,
  UpdateConfigurationClientInput,
  UpdateConfigurationOverrideClientInput,
  ValidateConfigurationMetadataClientInput,
} from "./configuration-types";

let configurationClient: ConfigurationClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockConfigurationClient()
    : createHttpConfigurationClient();

export function setConfigurationClient(client: ConfigurationClient): void {
  configurationClient = client;
}

export function getConfigurationClient(): ConfigurationClient {
  return configurationClient;
}

export function resetConfigurationClient(): void {
  configurationClient = createMockConfigurationClient();
}

export function listConfigurations(
  query?: ListConfigurationsClientQuery,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().listConfigurations(query, options);
}

export function getConfiguration(
  configurationId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().getConfiguration(configurationId, options);
}

export function createConfiguration(
  input: CreateConfigurationClientInput,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().createConfiguration(input, options);
}

export function updateConfiguration(
  configurationId: string,
  input: UpdateConfigurationClientInput,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().updateConfiguration(
    configurationId,
    input,
    options,
  );
}

export function archiveConfiguration(
  configurationId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().archiveConfiguration(configurationId, options);
}

export function restoreConfiguration(
  configurationId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().restoreConfiguration(configurationId, options);
}

export function transitionConfiguration(
  configurationId: string,
  input: TransitionConfigurationClientInput,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().transitionConfiguration(
    configurationId,
    input,
    options,
  );
}

export function validateConfiguration(
  configurationId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().validateConfiguration(configurationId, options);
}

export function approveConfiguration(
  configurationId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().approveConfiguration(configurationId, options);
}

export function publishConfiguration(
  configurationId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().publishConfiguration(configurationId, options);
}

export function deprecateConfiguration(
  configurationId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().deprecateConfiguration(
    configurationId,
    options,
  );
}

export function listConfigurationNamespaces(
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().listNamespaces(options);
}

export function getConfigurationNamespace(
  namespaceId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().getNamespace(namespaceId, options);
}

export function listConfigurationGroups(
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().listGroups(options);
}

export function listConfigurationVersions(
  configurationId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().listVersions(configurationId, options);
}

export function createConfigurationVersion(
  configurationId: string,
  input: CreateConfigurationVersionClientInput,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().createVersion(
    configurationId,
    input,
    options,
  );
}

export function publishConfigurationVersion(
  configurationId: string,
  versionId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().publishVersion(
    configurationId,
    versionId,
    options,
  );
}

export function listConfigurationOverrides(
  configurationId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().listOverrides(configurationId, options);
}

export function createConfigurationOverride(
  input: CreateConfigurationOverrideClientInput,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().createOverride(input, options);
}

export function updateConfigurationOverride(
  overrideId: string,
  input: UpdateConfigurationOverrideClientInput,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().updateOverride(overrideId, input, options);
}

export function listConfigurationScopes(
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().listScopes(options);
}

export function getConfigurationScope(
  scopeId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().getScope(scopeId, options);
}

export function listConfigurationValidationRules(
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().listValidationRules(options);
}

export function validateConfigurationMetadata(
  input: ValidateConfigurationMetadataClientInput,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().validateMetadata(input, options);
}

export function listConfigurationReferences(
  configurationId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().listReferences(configurationId, options);
}

export function getConfigurationReference(
  referenceId: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().getReference(referenceId, options);
}

export function listConfigurationAudit(
  configurationId?: string,
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().listAudit(configurationId, options);
}

export function getConfigurationCapabilities(
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().getCapabilities(options);
}

export function getConfigurationHealth(
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().getHealth(options);
}

export function getConfigurationReadiness(
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().getReadiness(options);
}

export function getConfigurationDiagnostics(
  options?: ConfigurationClientRequestOptions,
) {
  return getConfigurationClient().getDiagnostics(options);
}

export {
  createHttpConfigurationClient,
  createMockConfigurationClient,
  type ConfigurationClient,
} from "./configuration-client";
export * from "./configuration-types";
export * from "./configuration-errors";
export * from "./routes";
export * from "./query-keys";
