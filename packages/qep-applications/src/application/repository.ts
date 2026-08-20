import type {
  CreateApplicationInput,
  CreateEnvironmentInput,
  CreateExecutionTargetInput,
  QepApplication,
  QepApplicationEnvironment,
  QepApplicationExecutionTarget,
  QepApplicationLegacyRef,
  QepApplicationRepositoryLink,
  UpdateApplicationInput,
} from "../domain/types";

export type ApplicationListFilter = {
  readonly tenantId: string;
  readonly includeArchived?: boolean;
  readonly status?: QepApplication["status"];
  readonly ownerUserId?: string;
  readonly query?: string;
};

export type ApplicationRepository = {
  get(tenantId: string, applicationId: string): Promise<QepApplication | undefined>;
  getByKey(tenantId: string, key: string): Promise<QepApplication | undefined>;
  list(filter: ApplicationListFilter): Promise<readonly QepApplication[]>;
  save(application: QepApplication): Promise<void>;

  listRepositoryLinks(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly QepApplicationRepositoryLink[]>;
  attachRepository(link: QepApplicationRepositoryLink): Promise<void>;

  listEnvironments(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly QepApplicationEnvironment[]>;
  getEnvironment(
    tenantId: string,
    environmentId: string,
  ): Promise<QepApplicationEnvironment | undefined>;
  saveEnvironment(environment: QepApplicationEnvironment): Promise<void>;

  listExecutionTargets(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly QepApplicationExecutionTarget[]>;
  getExecutionTarget(
    tenantId: string,
    targetId: string,
  ): Promise<QepApplicationExecutionTarget | undefined>;
  saveExecutionTarget(target: QepApplicationExecutionTarget): Promise<void>;

  listLegacyRefs(tenantId: string): Promise<readonly QepApplicationLegacyRef[]>;
  upsertLegacyRef(ref: QepApplicationLegacyRef): Promise<void>;
};

export type {
  CreateApplicationInput,
  CreateEnvironmentInput,
  CreateExecutionTargetInput,
  UpdateApplicationInput,
};
