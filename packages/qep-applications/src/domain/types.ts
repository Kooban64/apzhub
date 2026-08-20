export const APPLICATION_STATUSES = ["setup", "active", "archived"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const ENVIRONMENT_CATEGORIES = [
  "development",
  "test",
  "staging",
  "production",
  "custom",
] as const;
export type EnvironmentCategory = (typeof ENVIRONMENT_CATEGORIES)[number];

export const ENVIRONMENT_STATUSES = ["active", "inactive", "archived"] as const;
export type EnvironmentStatus = (typeof ENVIRONMENT_STATUSES)[number];

export const EXECUTION_TARGET_TYPES = [
  "ci_pipeline",
  "managed_runner",
  "remote_host",
] as const;
export type ExecutionTargetType = (typeof EXECUTION_TARGET_TYPES)[number] | string;

export const EXECUTION_TARGET_STATUSES = [
  "not_configured",
  "configured",
  "available",
  "archived",
] as const;
export type ExecutionTargetStatus = (typeof EXECUTION_TARGET_STATUSES)[number];

export type QepApplication = {
  readonly id: string;
  readonly tenantId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: ApplicationStatus;
  readonly ownerUserId?: string;
  readonly legacyQualityProjectId?: string;
  readonly revision: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly archivedAt?: string;
};

export type QepApplicationRepositoryLink = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly scmRepositoryId: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type QepApplicationEnvironment = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly name: string;
  readonly category: EnvironmentCategory;
  readonly description?: string;
  readonly baseUrl?: string;
  readonly status: EnvironmentStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type RemoteHostConfig = {
  readonly host?: string;
  readonly port?: number;
  readonly username?: string;
  readonly credentialRef?: string;
  readonly workingRoot?: string;
  readonly repositoryRoot?: string;
  readonly executionPolicy?: string;
};

export type QepApplicationExecutionTarget = {
  readonly id: string;
  readonly tenantId: string;
  readonly applicationId: string;
  readonly environmentId?: string;
  readonly name: string;
  readonly targetType: ExecutionTargetType;
  readonly status: ExecutionTargetStatus;
  readonly config: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type CreateApplicationInput = {
  readonly tenantId: string;
  readonly name: string;
  readonly key: string;
  readonly actorId: string;
  readonly description?: string;
  readonly ownerUserId?: string;
  readonly status?: ApplicationStatus;
  readonly id?: string;
  readonly legacyQualityProjectId?: string;
};

export type UpdateApplicationInput = {
  readonly name?: string;
  readonly description?: string | null;
  readonly ownerUserId?: string | null;
  readonly status?: ApplicationStatus;
};

export type CreateEnvironmentInput = {
  readonly name: string;
  readonly category: EnvironmentCategory;
  readonly actorId: string;
  readonly description?: string;
  readonly baseUrl?: string;
  readonly status?: EnvironmentStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type CreateExecutionTargetInput = {
  readonly name: string;
  readonly targetType: ExecutionTargetType;
  readonly actorId: string;
  readonly environmentId?: string;
  readonly status?: ExecutionTargetStatus;
  readonly config?: Readonly<Record<string, unknown>>;
};

export const LEGACY_REF_ORIGINS = [
  "application_id",
  "application_key",
  "legacy_quality_project_id",
  "observed",
] as const;
export type LegacyRefOrigin = (typeof LEGACY_REF_ORIGINS)[number];

export type QepApplicationLegacyRef = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectRef: string;
  readonly applicationId?: string;
  readonly origin: LegacyRefOrigin;
  readonly createdAt: string;
  readonly updatedAt: string;
};
