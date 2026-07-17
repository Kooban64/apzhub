/** Platform Configuration typed client view models (APZCONFIG-003). */

export type ConfigurationClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly headers?: HeadersInit;
};

export type ConfigurationCollectionResult<T> = {
  readonly items: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

export type ConfigurationScopeViewModel = {
  readonly kind: string;
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly productId?: string;
  readonly environmentId?: string;
  readonly userId?: string;
};

export type ConfigurationViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly namespaceId: string;
  readonly groupId?: string;
  readonly keyId: string;
  readonly hierarchyLevel: string;
  readonly scope: ConfigurationScopeViewModel;
  readonly status: string;
  readonly currentVersionId?: string;
  readonly inheritsFromConfigurationId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type ConfigurationNamespaceViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ConfigurationGroupViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly namespaceId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ConfigurationVersionViewModel = {
  readonly id: string;
  readonly configurationId: string;
  readonly versionNumber: number;
  readonly immutable: boolean;
  readonly isCurrent: boolean;
  readonly label?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly rollbackFromVersionId?: string;
};

export type ConfigurationOverrideViewModel = {
  readonly id: string;
  readonly configurationId: string;
  readonly hierarchyLevel: string;
  readonly scope: ConfigurationScopeViewModel;
  readonly valueId: string;
  readonly precedenceRank: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ConfigurationScopeDescriptorViewModel = {
  readonly configurationId: string;
  readonly scope: ConfigurationScopeViewModel;
  readonly scopeKind: string;
};

export type ConfigurationValidationResultViewModel = {
  readonly valid: boolean;
  readonly errors: readonly string[];
};

export type ConfigurationValidationRuleViewModel = {
  readonly kind: string;
  readonly description: string;
};

export type ConfigurationReferenceViewModel = {
  readonly id: string;
  readonly configurationId: string;
  readonly kind: string;
  readonly resourceId: string;
  readonly label?: string;
};

export type ConfigurationAuditViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly configurationId?: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly detail?: string;
  readonly createdAt: string;
};

export type ConfigurationManagementPlaneViewModel = {
  readonly configurationEnabled: boolean;
  readonly managementPlaneReady: boolean;
  readonly runtimeResolutionReady: false;
  readonly runtimeApplicationReady: false;
  readonly featureFlagsReady: false;
  readonly secretManagementReady: false;
  readonly hotReloadReady: false;
  readonly eventBusReady: false;
};

export type ListConfigurationsClientQuery = {
  readonly status?: string;
  readonly namespaceId?: string;
  readonly groupId?: string;
  readonly hierarchyLevel?: string;
  readonly scopeKind?: string;
  readonly limit?: number;
};

export type CreateConfigurationClientInput = {
  readonly namespaceKey: string;
  readonly namespaceName?: string;
  readonly groupKey?: string;
  readonly groupName?: string;
  readonly key: string;
  readonly displayName: string;
  readonly description?: string;
  readonly valueKind: string;
  readonly hierarchyLevel: string;
  readonly scope: ConfigurationScopeViewModel;
  readonly organisationId?: string;
  readonly inheritsFromConfigurationId?: string;
  readonly references?: readonly {
    readonly kind: string;
    readonly resourceId: string;
    readonly label?: string;
  }[];
};

export type UpdateConfigurationClientInput = {
  readonly hierarchyLevel?: string;
  readonly scope?: ConfigurationScopeViewModel;
  readonly inheritsFromConfigurationId?: string | null;
  readonly organisationId?: string | null;
  readonly revision?: number;
};

export type TransitionConfigurationClientInput = {
  readonly to: string;
  readonly reason?: string;
};

export type ValidateConfigurationMetadataClientInput = {
  readonly hierarchyLevel: string;
  readonly scope: ConfigurationScopeViewModel;
  readonly status?: string;
  readonly namespaceId?: string;
  readonly groupId?: string;
  readonly organisationId?: string;
};

export type CreateConfigurationVersionClientInput = {
  readonly label?: string;
  readonly valueKind: string;
  readonly payload: string;
};

export type CreateConfigurationOverrideClientInput = {
  readonly configurationId: string;
  readonly hierarchyLevel: string;
  readonly scope: ConfigurationScopeViewModel;
  readonly valueKind: string;
  readonly payload: string;
};

export type UpdateConfigurationOverrideClientInput = {
  readonly hierarchyLevel?: string;
  readonly scope?: ConfigurationScopeViewModel;
  readonly valueKind?: string;
  readonly payload?: string;
};
