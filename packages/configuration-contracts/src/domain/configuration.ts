/**
 * APZHUB Platform Configuration domain models (APZCONFIG-001).
 * System of Record metadata only — no runtime apply, secrets, or env injection.
 */

import type { ConfigurationAuditFields } from "../common/context";
import type {
  ConfigurationAuditAction,
  ConfigurationHierarchyLevel,
  ConfigurationLifecycleStatus,
  ConfigurationReferenceKind,
  ConfigurationScopeKind,
  ConfigurationValidationKind,
  ConfigurationValueKind,
} from "../enums/catalogue";
import type {
  ConfigurationAuditId,
  ConfigurationGroupId,
  ConfigurationHistoryId,
  ConfigurationId,
  ConfigurationKeyId,
  ConfigurationMetadataId,
  ConfigurationNamespaceId,
  ConfigurationOverrideId,
  ConfigurationReferenceId,
  ConfigurationValidationId,
  ConfigurationValueId,
  ConfigurationVersionId,
} from "../identifiers";

export type ConfigurationNamespace = {
  readonly id: ConfigurationNamespaceId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ConfigurationGroup = {
  readonly id: ConfigurationGroupId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly namespaceId: ConfigurationNamespaceId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ConfigurationKey = {
  readonly id: ConfigurationKeyId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly namespaceId: ConfigurationNamespaceId;
  readonly groupId?: ConfigurationGroupId;
  readonly key: string;
  readonly displayName: string;
  readonly description?: string;
  readonly valueKind: ConfigurationValueKind;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Scope binding — read-only metadata. */
export type ConfigurationScope = {
  readonly kind: ConfigurationScopeKind;
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly productId?: string;
  readonly environmentId?: string;
  readonly userId?: string;
};

export type ConfigurationMetadata = {
  readonly id: ConfigurationMetadataId;
  readonly configurationId: ConfigurationId;
  readonly labels?: Readonly<Record<string, string>>;
  readonly tags?: readonly string[];
  readonly notes?: string;
};

export type ConfigurationValidation = {
  readonly id: ConfigurationValidationId;
  readonly configurationKeyId: ConfigurationKeyId;
  readonly kind: ConfigurationValidationKind;
  /** Opaque validator metadata — never executed in this package. */
  readonly ruleRef?: string;
  readonly pattern?: string;
  readonly min?: number;
  readonly max?: number;
  readonly enumValues?: readonly string[];
  readonly required?: boolean;
  readonly customValidatorKey?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/**
 * Stored value metadata — never secrets, credentials, or encrypted blobs.
 * `payload` is plain configuration metadata (stringified JSON allowed).
 */
export type ConfigurationValue = {
  readonly id: ConfigurationValueId;
  readonly configurationId: ConfigurationId;
  readonly versionId?: ConfigurationVersionId;
  readonly valueKind: ConfigurationValueKind;
  readonly payload: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ConfigurationVersion = {
  readonly id: ConfigurationVersionId;
  readonly configurationId: ConfigurationId;
  readonly versionNumber: number;
  readonly immutable: boolean;
  readonly isCurrent: boolean;
  readonly label?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  /** Rollback target metadata only — no execution. */
  readonly rollbackFromVersionId?: ConfigurationVersionId;
};

export type ConfigurationOverride = {
  readonly id: ConfigurationOverrideId;
  readonly configurationId: ConfigurationId;
  readonly hierarchyLevel: ConfigurationHierarchyLevel;
  readonly scope: ConfigurationScope;
  readonly valueId: ConfigurationValueId;
  readonly precedenceRank: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ConfigurationReference = {
  readonly id: ConfigurationReferenceId;
  readonly configurationId: ConfigurationId;
  readonly kind: ConfigurationReferenceKind;
  readonly resourceId: string;
  readonly label?: string;
};

export type ConfigurationHistory = {
  readonly id: ConfigurationHistoryId;
  readonly configurationId: ConfigurationId;
  readonly versionId?: ConfigurationVersionId;
  readonly summary: string;
  readonly actorUserId: string;
  readonly createdAt: string;
};

export type ConfigurationAuditEntry = {
  readonly id: ConfigurationAuditId;
  readonly tenantId: string;
  readonly configurationId?: ConfigurationId;
  readonly action: ConfigurationAuditAction;
  readonly actorUserId: string;
  readonly detail?: string;
  readonly createdAt: string;
};

/**
 * Canonical Configuration aggregate — SoR metadata entry.
 */
export type Configuration = {
  readonly id: ConfigurationId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly namespaceId: ConfigurationNamespaceId;
  readonly groupId?: ConfigurationGroupId;
  readonly keyId: ConfigurationKeyId;
  readonly hierarchyLevel: ConfigurationHierarchyLevel;
  readonly scope: ConfigurationScope;
  readonly status: ConfigurationLifecycleStatus;
  readonly currentVersionId?: ConfigurationVersionId;
  readonly inheritsFromConfigurationId?: ConfigurationId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
} & Partial<ConfigurationAuditFields>;
