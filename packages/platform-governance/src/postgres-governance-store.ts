import { desc, eq } from "drizzle-orm";

import {
  getDb,
  platformCapability,
  platformCapabilityDependency,
  platformFeatureFlag,
  platformFeatureFlagOverride,
  platformGovernanceEnablement,
  platformProvisioningRecord,
} from "@apzhub/config/db";

import type {
  CapabilityDependency,
  FeatureFlagDefinition,
  FeatureFlagOverride,
  GovernanceDiagnostics,
  GovernanceEnablement,
  PlatformCapability,
  ProvisioningRecord,
  RegisterCapabilityInput,
  RegisterFeatureFlagInput,
  SetFeatureFlagOverrideInput,
  StartProvisioningInput,
  UpsertEnablementInput,
} from "./governance-types";
import {
  createInMemoryGovernanceRepositories,
  InMemoryFeatureFlagRepository,
  InMemoryGovernanceRepository,
  InMemoryProvisioningRepository,
} from "./repositories/in-memory-repositories";
import type { GovernanceRepositoryBundle } from "./repositories/repository-interfaces";
import { PlatformGovernanceService } from "./platform-governance-service";
import { seedDefaultGovernanceCatalog } from "./governance-seed";

function randomId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export class PostgresGovernanceRepository extends InMemoryGovernanceRepository {
  override async listCapabilities(): Promise<readonly PlatformCapability[]> {
    const db = getDb();
    const rows = await db.select().from(platformCapability);
    if (rows.length === 0) {
      return super.listCapabilities();
    }
    return rows.map(mapCapabilityRow);
  }

  override async getCapability(
    capabilityKey: string,
  ): Promise<PlatformCapability | undefined> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(platformCapability)
      .where(eq(platformCapability.capabilityKey, capabilityKey))
      .limit(1);
    return row ? mapCapabilityRow(row) : super.getCapability(capabilityKey);
  }

  override async registerCapability(
    input: RegisterCapabilityInput,
  ): Promise<PlatformCapability> {
    const capability = await super.registerCapability(input);
    const db = getDb();
    const timestamp = new Date();
    await db
      .insert(platformCapability)
      .values({
        capabilityId: capability.capabilityId,
        capabilityKey: capability.capabilityKey,
        capabilityType: capability.capabilityType,
        name: capability.name,
        description: capability.description,
        version: capability.version,
        status: capability.status,
        metadata: capability.metadata,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoUpdate({
        target: platformCapability.capabilityKey,
        set: {
          name: capability.name,
          description: capability.description,
          version: capability.version,
          status: capability.status,
          metadata: capability.metadata,
          updatedAt: timestamp,
        },
      });

    for (const dependency of input.dependencies ?? []) {
      await db
        .insert(platformCapabilityDependency)
        .values({
          dependencyId: randomId("dep"),
          capabilityId: capability.capabilityId,
          dependsOnCapabilityKey: dependency.dependsOnCapabilityKey,
          dependencyType: dependency.dependencyType ?? "required",
          createdAt: timestamp,
        })
        .onConflictDoNothing();
    }

    return capability;
  }

  override async listDependencies(
    capabilityId: string,
  ): Promise<readonly CapabilityDependency[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(platformCapabilityDependency)
      .where(eq(platformCapabilityDependency.capabilityId, capabilityId));
    if (rows.length === 0) {
      return super.listDependencies(capabilityId);
    }
    return rows.map(mapDependencyRow);
  }

  override async listEnablements(filter?: {
    scopeType?: string;
    scopeKey?: string;
    targetType?: string;
  }): Promise<readonly GovernanceEnablement[]> {
    const db = getDb();
    const rows = await db.select().from(platformGovernanceEnablement);
    if (rows.length === 0) {
      return super.listEnablements(filter);
    }
    const mapped = rows.map(mapEnablementRow);
    return mapped.filter((item) => {
      if (filter?.scopeType && item.scopeType !== filter.scopeType) return false;
      if (filter?.scopeKey !== undefined && item.scopeKey !== filter.scopeKey)
        return false;
      if (filter?.targetType && item.targetType !== filter.targetType) return false;
      return true;
    });
  }

  override async upsertEnablement(
    input: UpsertEnablementInput,
  ): Promise<GovernanceEnablement> {
    const enablement = await super.upsertEnablement(input);
    const db = getDb();
    const timestamp = new Date();
    await db
      .insert(platformGovernanceEnablement)
      .values({
        enablementId: enablement.enablementId,
        scopeType: enablement.scopeType,
        scopeKey: enablement.scopeKey,
        targetType: enablement.targetType,
        targetKey: enablement.targetKey,
        enabled: enablement.enabled,
        metadata: enablement.metadata,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoUpdate({
        target: [
          platformGovernanceEnablement.scopeType,
          platformGovernanceEnablement.scopeKey,
          platformGovernanceEnablement.targetType,
          platformGovernanceEnablement.targetKey,
        ],
        set: {
          enabled: enablement.enabled,
          metadata: enablement.metadata,
          updatedAt: timestamp,
        },
      });
    return enablement;
  }

  override async countEnablements(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(platformGovernanceEnablement);
    return rows.length || super.countEnablements();
  }

  override async countCapabilities(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(platformCapability);
    return rows.length || super.countCapabilities();
  }
}

export class PostgresProvisioningRepository extends InMemoryProvisioningRepository {
  override async listRecords(filter?: {
    scopeType?: string;
    scopeKey?: string;
    status?: string;
  }): Promise<readonly ProvisioningRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(platformProvisioningRecord)
      .orderBy(desc(platformProvisioningRecord.startedAt));
    if (rows.length === 0) {
      return super.listRecords(filter);
    }
    const mapped = rows.map(mapProvisioningRow);
    return mapped.filter((item) => {
      if (filter?.scopeType && item.scopeType !== filter.scopeType) return false;
      if (filter?.scopeKey && item.scopeKey !== filter.scopeKey) return false;
      if (filter?.status && item.status !== filter.status) return false;
      return true;
    });
  }

  override async createRecord(
    input: StartProvisioningInput,
  ): Promise<ProvisioningRecord> {
    const record = await super.createRecord(input);
    const db = getDb();
    await db.insert(platformProvisioningRecord).values({
      provisioningId: record.provisioningId,
      scopeType: record.scopeType,
      scopeKey: record.scopeKey,
      targetType: record.targetType,
      targetKey: record.targetKey,
      status: record.status,
      message: record.message,
      metadata: record.metadata,
      startedAt: new Date(record.startedAt),
      completedAt: record.completedAt ? new Date(record.completedAt) : null,
    });
    return record;
  }

  override async updateRecordStatus(
    provisioningId: string,
    status: ProvisioningRecord["status"],
    message?: string,
  ): Promise<ProvisioningRecord | undefined> {
    const updated = await super.updateRecordStatus(provisioningId, status, message);
    if (!updated) return undefined;
    const db = getDb();
    await db
      .update(platformProvisioningRecord)
      .set({
        status: updated.status,
        message: updated.message,
        completedAt: updated.completedAt ? new Date(updated.completedAt) : null,
      })
      .where(eq(platformProvisioningRecord.provisioningId, provisioningId));
    return updated;
  }

  override async countRecords(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(platformProvisioningRecord);
    return rows.length || super.countRecords();
  }
}

export class PostgresFeatureFlagRepository extends InMemoryFeatureFlagRepository {
  override async listFlags(): Promise<readonly FeatureFlagDefinition[]> {
    const db = getDb();
    const rows = await db.select().from(platformFeatureFlag);
    if (rows.length === 0) {
      return super.listFlags();
    }
    return rows.map(mapFlagRow);
  }

  override async registerFlag(
    input: RegisterFeatureFlagInput,
  ): Promise<FeatureFlagDefinition> {
    const flag = await super.registerFlag(input);
    const db = getDb();
    const timestamp = new Date();
    await db
      .insert(platformFeatureFlag)
      .values({
        flagKey: flag.flagKey,
        name: flag.name,
        description: flag.description,
        defaultEnabled: flag.defaultEnabled,
        metadata: flag.metadata,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoUpdate({
        target: platformFeatureFlag.flagKey,
        set: {
          name: flag.name,
          description: flag.description,
          defaultEnabled: flag.defaultEnabled,
          metadata: flag.metadata,
          updatedAt: timestamp,
        },
      });
    return flag;
  }

  override async listOverrides(
    flagKey?: string,
  ): Promise<readonly FeatureFlagOverride[]> {
    const db = getDb();
    const rows = flagKey
      ? await db
          .select()
          .from(platformFeatureFlagOverride)
          .where(eq(platformFeatureFlagOverride.flagKey, flagKey))
      : await db.select().from(platformFeatureFlagOverride);
    if (rows.length === 0) {
      return super.listOverrides(flagKey);
    }
    return rows.map(mapOverrideRow);
  }

  override async setOverride(
    input: SetFeatureFlagOverrideInput,
  ): Promise<FeatureFlagOverride> {
    const override = await super.setOverride(input);
    const db = getDb();
    const timestamp = new Date();
    await db
      .insert(platformFeatureFlagOverride)
      .values({
        overrideId: override.overrideId,
        flagKey: override.flagKey,
        scopeType: override.scopeType,
        scopeKey: override.scopeKey,
        enabled: override.enabled,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoUpdate({
        target: [
          platformFeatureFlagOverride.flagKey,
          platformFeatureFlagOverride.scopeType,
          platformFeatureFlagOverride.scopeKey,
        ],
        set: {
          enabled: override.enabled,
          updatedAt: timestamp,
        },
      });
    return override;
  }

  override async countFlags(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(platformFeatureFlag);
    return rows.length || super.countFlags();
  }

  override async countOverrides(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(platformFeatureFlagOverride);
    return rows.length || super.countOverrides();
  }
}

function mapCapabilityRow(
  row: typeof platformCapability.$inferSelect,
): PlatformCapability {
  return {
    capabilityId: row.capabilityId,
    capabilityKey: row.capabilityKey,
    capabilityType: row.capabilityType as PlatformCapability["capabilityType"],
    name: row.name,
    description: row.description ?? undefined,
    version: row.version ?? undefined,
    status: row.status as PlatformCapability["status"],
    metadata: row.metadata ?? {},
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapDependencyRow(
  row: typeof platformCapabilityDependency.$inferSelect,
): CapabilityDependency {
  return {
    dependencyId: row.dependencyId,
    capabilityId: row.capabilityId,
    dependsOnCapabilityKey: row.dependsOnCapabilityKey,
    dependencyType: row.dependencyType as CapabilityDependency["dependencyType"],
    createdAt: row.createdAt.toISOString(),
  };
}

function mapEnablementRow(
  row: typeof platformGovernanceEnablement.$inferSelect,
): GovernanceEnablement {
  return {
    enablementId: row.enablementId,
    scopeType: row.scopeType as GovernanceEnablement["scopeType"],
    scopeKey: row.scopeKey,
    targetType: row.targetType as GovernanceEnablement["targetType"],
    targetKey: row.targetKey,
    enabled: row.enabled,
    metadata: row.metadata ?? {},
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapProvisioningRow(
  row: typeof platformProvisioningRecord.$inferSelect,
): ProvisioningRecord {
  return {
    provisioningId: row.provisioningId,
    scopeType: row.scopeType as ProvisioningRecord["scopeType"],
    scopeKey: row.scopeKey,
    targetType: row.targetType as ProvisioningRecord["targetType"],
    targetKey: row.targetKey,
    status: row.status as ProvisioningRecord["status"],
    message: row.message ?? undefined,
    metadata: row.metadata ?? {},
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt?.toISOString(),
  };
}

function mapFlagRow(
  row: typeof platformFeatureFlag.$inferSelect,
): FeatureFlagDefinition {
  return {
    flagKey: row.flagKey,
    name: row.name,
    description: row.description ?? undefined,
    defaultEnabled: row.defaultEnabled,
    metadata: row.metadata ?? {},
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapOverrideRow(
  row: typeof platformFeatureFlagOverride.$inferSelect,
): FeatureFlagOverride {
  return {
    overrideId: row.overrideId,
    flagKey: row.flagKey,
    scopeType: row.scopeType as FeatureFlagOverride["scopeType"],
    scopeKey: row.scopeKey,
    enabled: row.enabled,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createPostgresGovernanceRepositories(): Promise<GovernanceRepositoryBundle> {
  return {
    governance: new PostgresGovernanceRepository(),
    provisioning: new PostgresProvisioningRepository(),
    featureFlags: new PostgresFeatureFlagRepository(),
  };
}

export async function seedPostgresGovernanceRows(): Promise<void> {
  const repositories = createInMemoryGovernanceRepositories();
  const service = new PlatformGovernanceService({
    repositories,
    storageBackend: "memory",
  });
  await seedDefaultGovernanceCatalog(service);
  const postgresRepositories = await createPostgresGovernanceRepositories();
  for (const capability of await service.capabilities.listCapabilities()) {
    await postgresRepositories.governance.registerCapability({
      capabilityKey: capability.capabilityKey,
      capabilityType: capability.capabilityType,
      name: capability.name,
      description: capability.description,
      version: capability.version,
      metadata: capability.metadata,
    });
  }
  for (const enablement of await service.governance.listEnablements()) {
    await postgresRepositories.governance.upsertEnablement({
      scopeType: enablement.scopeType,
      scopeKey: enablement.scopeKey,
      targetType: enablement.targetType,
      targetKey: enablement.targetKey,
      enabled: enablement.enabled,
      metadata: enablement.metadata,
    });
  }
  for (const flag of await service.featureFlags.listFlags()) {
    await postgresRepositories.featureFlags.registerFlag(flag);
  }
}

export async function getPostgresGovernanceDiagnostics(): Promise<GovernanceDiagnostics> {
  const repositories = await createPostgresGovernanceRepositories();
  const [
    capabilityCount,
    enablementCount,
    provisioningCount,
    featureFlagCount,
    overrideCount,
  ] = await Promise.all([
    repositories.governance.countCapabilities(),
    repositories.governance.countEnablements(),
    repositories.provisioning.countRecords(),
    repositories.featureFlags.countFlags(),
    repositories.featureFlags.countOverrides(),
  ]);
  return {
    capabilityCount,
    enablementCount,
    provisioningCount,
    featureFlagCount,
    overrideCount,
    storageBackend: "postgres",
  };
}

export {
  InMemoryGovernanceRepository,
  InMemoryProvisioningRepository,
  InMemoryFeatureFlagRepository,
  createInMemoryGovernanceRepositories,
};
