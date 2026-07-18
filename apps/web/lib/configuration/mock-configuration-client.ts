/**
 * In-memory Configuration client for tests (APZCONFIG-003).
 */

import type { ConfigurationClient } from "./configuration-client";
import type {
  ConfigurationAuditViewModel,
  ConfigurationCollectionResult,
  ConfigurationGroupViewModel,
  ConfigurationManagementPlaneViewModel,
  ConfigurationNamespaceViewModel,
  ConfigurationOverrideViewModel,
  ConfigurationReferenceViewModel,
  ConfigurationScopeDescriptorViewModel,
  ConfigurationValidationResultViewModel,
  ConfigurationValidationRuleViewModel,
  ConfigurationVersionViewModel,
  ConfigurationViewModel,
  CreateConfigurationClientInput,
  CreateConfigurationOverrideClientInput,
  CreateConfigurationVersionClientInput,
  ListConfigurationsClientQuery,
  TransitionConfigurationClientInput,
  UpdateConfigurationClientInput,
  UpdateConfigurationOverrideClientInput,
} from "./configuration-types";

export const MOCK_CONFIGURATION: ConfigurationViewModel = {
  id: "cfg_mock_1",
  tenantId: "tenant_mock",
  namespaceId: "ns_mock",
  keyId: "key_mock",
  hierarchyLevel: "tenant",
  scope: { kind: "tenant", tenantId: "tenant_mock" },
  status: "draft",
  createdAt: "2026-07-16T00:00:00.000Z",
  updatedAt: "2026-07-16T00:00:00.000Z",
  createdBy: "user_mock",
  updatedBy: "user_mock",
  revision: 1,
};

const sampleConfiguration = (): ConfigurationViewModel => ({
  ...MOCK_CONFIGURATION,
});

function collection<T>(items: readonly T[]): ConfigurationCollectionResult<T> {
  return { items, page: { limit: items.length, hasMore: false } };
}

export function createMockConfigurationClient(): ConfigurationClient {
  let configuration = sampleConfiguration();
  return {
    async listConfigurations(_query?: ListConfigurationsClientQuery) {
      return collection([configuration]);
    },
    async getConfiguration() {
      return configuration;
    },
    async createConfiguration(_input: CreateConfigurationClientInput) {
      configuration = {
        ...configuration,
        id: "cfg_new",
        revision: configuration.revision + 1,
      };
      return configuration;
    },
    async updateConfiguration(_id: string, input: UpdateConfigurationClientInput) {
      configuration = {
        ...configuration,
        hierarchyLevel: input.hierarchyLevel ?? configuration.hierarchyLevel,
        revision: (input.revision ?? configuration.revision) + 1,
      };
      return configuration;
    },
    async archiveConfiguration() {
      configuration = { ...configuration, status: "archived" };
      return configuration;
    },
    async restoreConfiguration() {
      configuration = { ...configuration, status: "draft" };
      return configuration;
    },
    async transitionConfiguration(
      _id: string,
      input: TransitionConfigurationClientInput,
    ) {
      configuration = { ...configuration, status: input.to };
      return configuration;
    },
    async validateConfiguration() {
      return {
        valid: true,
        errors: [],
      } satisfies ConfigurationValidationResultViewModel;
    },
    async approveConfiguration() {
      configuration = { ...configuration, status: "approved" };
      return configuration;
    },
    async publishConfiguration() {
      configuration = { ...configuration, status: "published" };
      return configuration;
    },
    async deprecateConfiguration() {
      configuration = { ...configuration, status: "deprecated" };
      return configuration;
    },
    async listNamespaces() {
      return collection([
        {
          id: "ns_mock",
          tenantId: "tenant_mock",
          organisationId: undefined,
          key: "platform",
          name: "Platform",
          description: undefined,
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        } satisfies ConfigurationNamespaceViewModel,
      ]);
    },
    async getNamespace(namespaceId: string) {
      const items = await this.listNamespaces();
      return items.items.find((n) => n.id === namespaceId) ?? items.items[0]!;
    },
    async listGroups() {
      return collection([
        {
          id: "grp_mock",
          tenantId: "tenant_mock",
          namespaceId: "ns_mock",
          key: "ui",
          name: "UI",
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        } satisfies ConfigurationGroupViewModel,
      ]);
    },
    async listVersions(configurationId: string) {
      return collection([
        {
          id: "ver_mock",
          configurationId,
          versionNumber: 1,
          immutable: true,
          isCurrent: false,
          label: undefined,
          createdAt: "2026-07-16T00:00:00.000Z",
          createdBy: "user_mock",
        } satisfies ConfigurationVersionViewModel,
      ]);
    },
    async createVersion(
      configurationId: string,
      input: CreateConfigurationVersionClientInput,
    ) {
      return {
        id: "ver_new",
        configurationId,
        versionNumber: 2,
        immutable: true,
        isCurrent: false,
        label: input.label,
        createdAt: "2026-07-16T00:00:00.000Z",
        createdBy: "user_mock",
      } satisfies ConfigurationVersionViewModel;
    },
    async publishVersion(configurationId: string, versionId: string) {
      return {
        id: versionId,
        configurationId,
        versionNumber: 1,
        immutable: true,
        isCurrent: true,
        label: undefined,
        createdAt: "2026-07-16T00:00:00.000Z",
        createdBy: "user_mock",
      } satisfies ConfigurationVersionViewModel;
    },
    async listOverrides(configurationId: string) {
      return collection([
        {
          id: "ovr_mock",
          configurationId,
          hierarchyLevel: "user",
          scope: { kind: "user", userId: "user_mock" },
          valueId: "val_mock",
          precedenceRank: 0,
          createdAt: "2026-07-16T00:00:00.000Z",
          updatedAt: "2026-07-16T00:00:00.000Z",
        } satisfies ConfigurationOverrideViewModel,
      ]);
    },
    async createOverride(input: CreateConfigurationOverrideClientInput) {
      return {
        id: "ovr_new",
        configurationId: input.configurationId,
        hierarchyLevel: input.hierarchyLevel,
        scope: input.scope,
        valueId: "val_new",
        precedenceRank: 0,
        createdAt: "2026-07-16T00:00:00.000Z",
        updatedAt: "2026-07-16T00:00:00.000Z",
      } satisfies ConfigurationOverrideViewModel;
    },
    async updateOverride(
      overrideId: string,
      _input: UpdateConfigurationOverrideClientInput,
    ) {
      const items = await this.listOverrides("cfg_mock_1");
      return items.items.find((o) => o.id === overrideId) ?? items.items[0]!;
    },
    async listScopes() {
      return collection([
        {
          configurationId: "cfg_mock_1",
          scope: { kind: "tenant", tenantId: "tenant_mock" },
          scopeKind: "tenant",
        } satisfies ConfigurationScopeDescriptorViewModel,
      ]);
    },
    async getScope(scopeId: string) {
      return {
        configurationId: scopeId,
        scope: { kind: "tenant", tenantId: "tenant_mock" },
        scopeKind: "tenant",
      } satisfies ConfigurationScopeDescriptorViewModel;
    },
    async listValidationRules() {
      return collection([
        {
          kind: "string",
          description: "string rule",
        } satisfies ConfigurationValidationRuleViewModel,
      ]);
    },
    async validateMetadata() {
      return {
        valid: true,
        errors: [],
      } satisfies ConfigurationValidationResultViewModel;
    },
    async listReferences(configurationId: string) {
      return collection([
        {
          id: "ref_mock",
          configurationId,
          kind: "projects",
          resourceId: "proj_1",
        } satisfies ConfigurationReferenceViewModel,
      ]);
    },
    async getReference(referenceId: string) {
      return {
        id: referenceId,
        configurationId: "cfg_mock_1",
        kind: "projects",
        resourceId: "proj_1",
      } satisfies ConfigurationReferenceViewModel;
    },
    async listAudit() {
      return collection([
        {
          id: "aud_mock",
          tenantId: "tenant_mock",
          configurationId: "cfg_mock_1",
          action: "created",
          actorUserId: "user_mock",
          createdAt: "2026-07-16T00:00:00.000Z",
        } satisfies ConfigurationAuditViewModel,
      ]);
    },
    async getCapabilities() {
      return {
        configurationEnabled: true,
        managementPlaneReady: true,
        runtimeResolutionReady: false,
        runtimeApplicationReady: false,
        featureFlagsReady: false,
        secretManagementReady: false,
        hotReloadReady: false,
        eventBusReady: false,
      } satisfies ConfigurationManagementPlaneViewModel;
    },
    async getHealth() {
      return { status: "healthy", runtimeApplyEnabled: false };
    },
    async getReadiness() {
      return { ready: true, runtimeApplyEnabled: false };
    },
    async getDiagnostics() {
      return { managementPlaneReady: true, runtimeResolutionReady: false };
    },
  } as ConfigurationClient;
}
