/**
 * Nested Configuration Platform gateway facets (APZCONFIG-002).
 * Metadata / lifecycle only — no runtime apply, secrets, or evaluation.
 */

import type {
  Configuration,
  ConfigurationAuditEntry,
  ConfigurationGroup,
  ConfigurationNamespace,
  ConfigurationOverride,
  ConfigurationReference,
  ConfigurationScope,
  ConfigurationValidation,
  ConfigurationVersion,
} from "../domain/configuration";
import type {
  ConfigurationAuditId,
  ConfigurationGroupId,
  ConfigurationId,
  ConfigurationNamespaceId,
  ConfigurationOverrideId,
  ConfigurationReferenceId,
  ConfigurationVersionId,
} from "../identifiers";
import type {
  ConfigurationHierarchyLevel,
  ConfigurationLifecycleStatus,
  ConfigurationReferenceKind,
  ConfigurationScopeKind,
  ConfigurationValidationKind,
  ConfigurationValueKind,
} from "../enums/catalogue";

/** Structurally compatible with ServiceRequestContext — mapped in platform-services. */
export type ConfigurationPlatformServiceContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly requestId?: string;
};

export type CreateConfigurationInput = {
  readonly namespaceKey: string;
  readonly namespaceName?: string;
  readonly groupKey?: string;
  readonly groupName?: string;
  readonly key: string;
  readonly displayName: string;
  readonly description?: string;
  readonly valueKind: ConfigurationValueKind;
  readonly hierarchyLevel: ConfigurationHierarchyLevel;
  readonly scope: ConfigurationScope;
  readonly organisationId?: string;
  readonly inheritsFromConfigurationId?: ConfigurationId;
  readonly references?: readonly {
    readonly kind: ConfigurationReferenceKind;
    readonly resourceId: string;
    readonly label?: string;
  }[];
};

export type UpdateConfigurationMetadataInput = {
  readonly configurationId: ConfigurationId;
  readonly hierarchyLevel?: ConfigurationHierarchyLevel;
  readonly scope?: ConfigurationScope;
  readonly inheritsFromConfigurationId?: ConfigurationId | null;
  readonly organisationId?: string | null;
};

export type TransitionConfigurationLifecycleInput = {
  readonly configurationId: ConfigurationId;
  readonly to: ConfigurationLifecycleStatus;
  readonly reason?: string;
};

export type CreateConfigurationNamespaceInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
};

export type UpdateConfigurationNamespaceInput = {
  readonly namespaceId: ConfigurationNamespaceId;
  readonly name?: string;
  readonly description?: string | null;
};

export type CreateConfigurationGroupInput = {
  readonly namespaceId: ConfigurationNamespaceId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
};

export type UpdateConfigurationGroupInput = {
  readonly groupId: ConfigurationGroupId;
  readonly name?: string;
  readonly description?: string | null;
};

export type CreateConfigurationVersionInput = {
  readonly configurationId: ConfigurationId;
  readonly label?: string;
  readonly valueKind: ConfigurationValueKind;
  readonly payload: string;
};

export type CreateConfigurationOverrideInput = {
  readonly configurationId: ConfigurationId;
  readonly hierarchyLevel: ConfigurationHierarchyLevel;
  readonly scope: ConfigurationScope;
  readonly valueKind: ConfigurationValueKind;
  readonly payload: string;
};

export type UpdateConfigurationOverrideInput = {
  readonly overrideId: ConfigurationOverrideId;
  readonly hierarchyLevel?: ConfigurationHierarchyLevel;
  readonly scope?: ConfigurationScope;
  readonly valueKind?: ConfigurationValueKind;
  readonly payload?: string;
};

export type ConfigurationValidationResult = {
  readonly valid: boolean;
  readonly errors: readonly string[];
};

export type ConfigurationValidationRuleDescriptor = {
  readonly kind: ConfigurationValidationKind;
  readonly description: string;
};

export type ConfigurationDiagnosticsHealth = {
  readonly status: "healthy" | "degraded" | "unavailable";
  readonly persistenceMode: "postgres" | "memory";
  readonly runtimeApplyEnabled: false;
  readonly checkedAt: string;
};

export type ConfigurationDiagnosticsReadiness = {
  readonly ready: boolean;
  readonly configurationEnabled: true;
  readonly persistenceMode: "postgres" | "memory";
  readonly runtimeApplyEnabled: false;
  readonly capabilities: readonly string[];
};

export type ConfigurationDiagnosticsCapabilities = {
  readonly runtimeApply: false;
  readonly lifecycle: readonly ConfigurationLifecycleStatus[];
  readonly facets: readonly string[];
};

export type ConfigurationConfigurationsService = {
  list(
    ctx: ConfigurationPlatformServiceContext,
  ): Promise<readonly Configuration[]>;
  get(
    ctx: ConfigurationPlatformServiceContext,
    configurationId: ConfigurationId,
  ): Promise<Configuration>;
  create(
    ctx: ConfigurationPlatformServiceContext,
    input: CreateConfigurationInput,
  ): Promise<Configuration>;
  updateMetadata(
    ctx: ConfigurationPlatformServiceContext,
    input: UpdateConfigurationMetadataInput,
  ): Promise<Configuration>;
  archive(
    ctx: ConfigurationPlatformServiceContext,
    configurationId: ConfigurationId,
  ): Promise<Configuration>;
  restore(
    ctx: ConfigurationPlatformServiceContext,
    configurationId: ConfigurationId,
  ): Promise<Configuration>;
  transition(
    ctx: ConfigurationPlatformServiceContext,
    input: TransitionConfigurationLifecycleInput,
  ): Promise<Configuration>;
};

export type ConfigurationNamespacesService = {
  list(
    ctx: ConfigurationPlatformServiceContext,
  ): Promise<readonly ConfigurationNamespace[]>;
  get(
    ctx: ConfigurationPlatformServiceContext,
    namespaceId: ConfigurationNamespaceId,
  ): Promise<ConfigurationNamespace>;
  create(
    ctx: ConfigurationPlatformServiceContext,
    input: CreateConfigurationNamespaceInput,
  ): Promise<ConfigurationNamespace>;
  update(
    ctx: ConfigurationPlatformServiceContext,
    input: UpdateConfigurationNamespaceInput,
  ): Promise<ConfigurationNamespace>;
};

export type ConfigurationGroupsService = {
  list(
    ctx: ConfigurationPlatformServiceContext,
  ): Promise<readonly ConfigurationGroup[]>;
  get(
    ctx: ConfigurationPlatformServiceContext,
    groupId: ConfigurationGroupId,
  ): Promise<ConfigurationGroup>;
  create(
    ctx: ConfigurationPlatformServiceContext,
    input: CreateConfigurationGroupInput,
  ): Promise<ConfigurationGroup>;
  update(
    ctx: ConfigurationPlatformServiceContext,
    input: UpdateConfigurationGroupInput,
  ): Promise<ConfigurationGroup>;
};

export type ConfigurationVersionsService = {
  list(
    ctx: ConfigurationPlatformServiceContext,
    configurationId: ConfigurationId,
  ): Promise<readonly ConfigurationVersion[]>;
  get(
    ctx: ConfigurationPlatformServiceContext,
    versionId: ConfigurationVersionId,
  ): Promise<ConfigurationVersion>;
  create(
    ctx: ConfigurationPlatformServiceContext,
    input: CreateConfigurationVersionInput,
  ): Promise<ConfigurationVersion>;
  publish(
    ctx: ConfigurationPlatformServiceContext,
    versionId: ConfigurationVersionId,
  ): Promise<ConfigurationVersion>;
  deprecate(
    ctx: ConfigurationPlatformServiceContext,
    versionId: ConfigurationVersionId,
  ): Promise<ConfigurationVersion>;
};

export type ConfigurationOverridesService = {
  list(
    ctx: ConfigurationPlatformServiceContext,
    configurationId: ConfigurationId,
  ): Promise<readonly ConfigurationOverride[]>;
  get(
    ctx: ConfigurationPlatformServiceContext,
    overrideId: ConfigurationOverrideId,
  ): Promise<ConfigurationOverride>;
  create(
    ctx: ConfigurationPlatformServiceContext,
    input: CreateConfigurationOverrideInput,
  ): Promise<ConfigurationOverride>;
  update(
    ctx: ConfigurationPlatformServiceContext,
    input: UpdateConfigurationOverrideInput,
  ): Promise<ConfigurationOverride>;
};

export type ConfigurationScopeDescriptor = {
  readonly configurationId: ConfigurationId;
  readonly scope: ConfigurationScope;
  readonly scopeKind: ConfigurationScopeKind;
};

export type ConfigurationScopesService = {
  list(
    ctx: ConfigurationPlatformServiceContext,
  ): Promise<readonly ConfigurationScopeDescriptor[]>;
  get(
    ctx: ConfigurationPlatformServiceContext,
    configurationId: ConfigurationId,
  ): Promise<ConfigurationScopeDescriptor>;
};

export type ConfigurationValidationService = {
  validateMetadata(
    ctx: ConfigurationPlatformServiceContext,
    configuration: Configuration,
  ): Promise<ConfigurationValidationResult>;
  listRules(
    ctx: ConfigurationPlatformServiceContext,
  ): Promise<readonly ConfigurationValidationRuleDescriptor[]>;
};

export type ConfigurationReferencesService = {
  list(
    ctx: ConfigurationPlatformServiceContext,
    configurationId: ConfigurationId,
  ): Promise<readonly ConfigurationReference[]>;
  get(
    ctx: ConfigurationPlatformServiceContext,
    referenceId: ConfigurationReferenceId,
  ): Promise<ConfigurationReference>;
};

export type ConfigurationAuditService = {
  list(
    ctx: ConfigurationPlatformServiceContext,
    configurationId?: ConfigurationId,
  ): Promise<readonly ConfigurationAuditEntry[]>;
  get(
    ctx: ConfigurationPlatformServiceContext,
    auditId: ConfigurationAuditId,
  ): Promise<ConfigurationAuditEntry>;
};

export type ConfigurationDiagnosticsService = {
  health(
    ctx: ConfigurationPlatformServiceContext,
  ): Promise<ConfigurationDiagnosticsHealth>;
  readiness(
    ctx: ConfigurationPlatformServiceContext,
  ): Promise<ConfigurationDiagnosticsReadiness>;
  capabilities(
    ctx: ConfigurationPlatformServiceContext,
  ): Promise<ConfigurationDiagnosticsCapabilities>;
};

/**
 * Nested configuration gateway surface (APZCONFIG-002).
 * Products consume via PlatformServiceGateway.configuration — never persistence repos.
 */
export type ConfigurationPlatformGateway = {
  readonly configurations: ConfigurationConfigurationsService;
  readonly namespaces: ConfigurationNamespacesService;
  readonly groups: ConfigurationGroupsService;
  readonly versions: ConfigurationVersionsService;
  readonly overrides: ConfigurationOverridesService;
  readonly scopes: ConfigurationScopesService;
  readonly validation: ConfigurationValidationService;
  readonly references: ConfigurationReferencesService;
  readonly audit: ConfigurationAuditService;
  readonly diagnostics: ConfigurationDiagnosticsService;
};
