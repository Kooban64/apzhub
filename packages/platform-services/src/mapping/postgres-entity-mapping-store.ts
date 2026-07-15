import { and, asc, eq, type SQL } from "drizzle-orm";

import type { Database, DatabaseExecutor } from "@apzhub/config/db";
import { getDb, platformEntityMapping } from "@apzhub/config/db";
import { PlatformServiceError, isPlatformServiceError } from "@apzhub/platform-service-contracts";

import type { EntityMappingStore } from "./entity-mapping-store";
import {
  safePersistenceDiagnosticCause,
  translateMappingPersistenceError,
} from "./map-persistence-error";
import type {
  MappingStoreLogger,
  MappingStoreMetrics,
  MappingStoreOperation,
} from "./mapping-store-observability";
import {
  noopMappingStoreLogger,
  noopMappingStoreMetrics,
} from "./mapping-store-observability";
import type {
  CanonicalEntityType,
  CreateEntityMappingInput,
  EntityMappingRecord,
  EntityMappingStatus,
  ListEntityMappingsFilter,
  UpdateEntityMappingInput,
} from "./types";

type MappingRow = typeof platformEntityMapping.$inferSelect;

export interface PostgresEntityMappingStoreOptions {
  readonly db?: Database;
  readonly logger?: MappingStoreLogger;
  readonly metrics?: MappingStoreMetrics;
}

function cloneRecord(record: EntityMappingRecord): EntityMappingRecord {
  return {
    ...record,
    metadata: { ...record.metadata },
  };
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function rowToRecord(row: MappingRow): EntityMappingRecord {
  const metadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? Object.fromEntries(
          Object.entries(row.metadata as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : {};

  return {
    platformId: row.platformId,
    entityType: row.entityType as CanonicalEntityType,
    providerId: row.providerId,
    integrationId: row.integrationId,
    providerNativeId: row.providerNativeId,
    parentPlatformId: row.parentPlatformId ?? undefined,
    parentProviderNativeId: row.parentProviderNativeId ?? undefined,
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    status: row.status as EntityMappingStatus,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    metadata,
    revision: row.revision,
  };
}

function matchesOrganisation(
  record: EntityMappingRecord,
  organisationId?: string,
): boolean {
  if (organisationId === undefined) {
    return true;
  }
  return (record.organisationId ?? undefined) === organisationId;
}

/**
 * PostgreSQL-backed EntityMappingStore (OSS-110-05).
 * Returns canonical mapping records only — never ORM row types.
 */
export class PostgresEntityMappingStore implements EntityMappingStore {
  private readonly db: Database;
  private readonly logger: MappingStoreLogger;
  private readonly metrics: MappingStoreMetrics;

  constructor(options: PostgresEntityMappingStoreOptions = {}) {
    this.db = options.db ?? getDb();
    this.logger = options.logger ?? noopMappingStoreLogger;
    this.metrics = options.metrics ?? noopMappingStoreMetrics;
  }

  async create(input: CreateEntityMappingInput): Promise<EntityMappingRecord> {
    return this.run("create", async () => {
      const status = input.status ?? "active";
      const now = new Date();

      try {
        const [row] = await this.db
          .insert(platformEntityMapping)
          .values({
            platformId: input.platformId,
            entityType: input.entityType,
            providerId: input.providerId,
            integrationId: input.integrationId,
            providerNativeId: input.providerNativeId,
            parentPlatformId: input.parentPlatformId ?? null,
            parentProviderNativeId: input.parentProviderNativeId ?? null,
            tenantId: input.tenantId,
            organisationId: input.organisationId ?? null,
            status,
            metadata: { ...(input.metadata ?? {}) },
            revision: 1,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        if (!row) {
          throw new PlatformServiceError({
            category: "system",
            code: "MAPPING_PERSISTENCE_FAILED",
            message: "Entity mapping create returned no row",
            correlationId: "mapping-store",
            retryable: false,
            details: { classification: "persistence_failure" },
          });
        }

        return cloneRecord(rowToRecord(row));
      } catch (error) {
        throw translateMappingPersistenceError(error, "create");
      }
    }, {
      entityType: input.entityType,
      platformId: input.platformId,
      providerId: input.providerId,
      integrationId: input.integrationId,
      tenantId: input.tenantId,
      organisationId: input.organisationId,
      transactionOutcome: "committed",
    });
  }

  async getByPlatformId(
    platformId: string,
    tenantId?: string,
    organisationId?: string,
  ): Promise<EntityMappingRecord | null> {
    return this.run("getByPlatformId", async () => {
      try {
        const conditions: SQL[] = [eq(platformEntityMapping.platformId, platformId)];
        if (tenantId) {
          conditions.push(eq(platformEntityMapping.tenantId, tenantId));
        }

        const [row] = await this.db
          .select()
          .from(platformEntityMapping)
          .where(and(...conditions))
          .limit(1);

        if (!row) {
          return null;
        }

        const record = rowToRecord(row);
        if (!matchesOrganisation(record, organisationId)) {
          return null;
        }
        return cloneRecord(record);
      } catch (error) {
        throw translateMappingPersistenceError(error, "getByPlatformId");
      }
    }, {
      platformId,
      tenantId,
      organisationId,
      transactionOutcome: "none",
    });
  }

  async getByProviderNativeId(input: {
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly entityType: EntityMappingRecord["entityType"];
    readonly providerId: string;
    readonly providerNativeId: string;
  }): Promise<EntityMappingRecord | null> {
    return this.run("getByProviderNativeId", async () => {
      try {
        const rows = await this.db
          .select()
          .from(platformEntityMapping)
          .where(
            and(
              eq(platformEntityMapping.tenantId, input.tenantId),
              eq(platformEntityMapping.entityType, input.entityType),
              eq(platformEntityMapping.providerId, input.providerId),
              eq(platformEntityMapping.providerNativeId, input.providerNativeId),
            ),
          )
          .orderBy(asc(platformEntityMapping.platformId));

        const scoped = rows
          .map(rowToRecord)
          .filter((record) => matchesOrganisation(record, input.organisationId));

        const preferred =
          scoped.find((record) => record.status === "active" || record.status === "pending") ??
          scoped[0];

        return preferred ? cloneRecord(preferred) : null;
      } catch (error) {
        throw translateMappingPersistenceError(error, "getByProviderNativeId");
      }
    }, {
      entityType: input.entityType,
      providerId: input.providerId,
      tenantId: input.tenantId,
      organisationId: input.organisationId,
      transactionOutcome: "none",
    });
  }

  async resolveProviderNativeId(input: {
    readonly platformId: string;
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly requireActive?: boolean;
  }): Promise<string> {
    return this.run("resolveProviderNativeId", async () => {
      const record = await this.getByPlatformId(
        input.platformId,
        input.tenantId,
        input.organisationId,
      );
      if (!record) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "MAPPING_NOT_FOUND",
          message: "Entity mapping not found",
          correlationId: "mapping-store",
          retryable: false,
          details: { platformId: input.platformId },
        });
      }

      if (input.requireActive !== false && record.status !== "active") {
        throw new PlatformServiceError({
          category: "conflict",
          code: "MAPPING_INACTIVE",
          message: "Entity mapping is not active",
          correlationId: "mapping-store",
          retryable: false,
          details: { platformId: input.platformId, status: record.status },
        });
      }

      return record.providerNativeId;
    }, {
      platformId: input.platformId,
      tenantId: input.tenantId,
      organisationId: input.organisationId,
      transactionOutcome: "none",
    });
  }

  async resolvePlatformId(input: {
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly entityType: EntityMappingRecord["entityType"];
    readonly providerId: string;
    readonly providerNativeId: string;
    readonly requireActive?: boolean;
  }): Promise<string> {
    return this.run("resolvePlatformId", async () => {
      const record = await this.getByProviderNativeId(input);
      if (!record) {
        throw new PlatformServiceError({
          category: "not_found",
          code: "MAPPING_NOT_FOUND",
          message: "Entity mapping not found for provider-native ID",
          correlationId: "mapping-store",
          retryable: false,
          details: {
            providerNativeId: input.providerNativeId,
            entityType: input.entityType,
          },
        });
      }

      if (input.requireActive !== false && record.status !== "active") {
        throw new PlatformServiceError({
          category: "conflict",
          code: "MAPPING_INACTIVE",
          message: "Entity mapping is not active",
          correlationId: "mapping-store",
          retryable: false,
          details: { platformId: record.platformId, status: record.status },
        });
      }

      return record.platformId;
    }, {
      entityType: input.entityType,
      providerId: input.providerId,
      tenantId: input.tenantId,
      organisationId: input.organisationId,
      transactionOutcome: "none",
    });
  }

  async list(filter: ListEntityMappingsFilter = {}): Promise<readonly EntityMappingRecord[]> {
    return this.run("list", async () => {
      try {
        const conditions: SQL[] = [];
        if (filter.tenantId) {
          conditions.push(eq(platformEntityMapping.tenantId, filter.tenantId));
        }
        if (filter.organisationId !== undefined) {
          conditions.push(eq(platformEntityMapping.organisationId, filter.organisationId));
        }
        if (filter.entityType) {
          conditions.push(eq(platformEntityMapping.entityType, filter.entityType));
        }
        if (filter.providerId) {
          conditions.push(eq(platformEntityMapping.providerId, filter.providerId));
        }
        if (filter.integrationId) {
          conditions.push(eq(platformEntityMapping.integrationId, filter.integrationId));
        }
        if (filter.status) {
          conditions.push(eq(platformEntityMapping.status, filter.status));
        }
        if (filter.parentPlatformId) {
          conditions.push(eq(platformEntityMapping.parentPlatformId, filter.parentPlatformId));
        }

        const query = this.db.select().from(platformEntityMapping);
        const rows =
          conditions.length > 0
            ? await query.where(and(...conditions)).orderBy(asc(platformEntityMapping.platformId))
            : await query.orderBy(asc(platformEntityMapping.platformId));

        return rows.map((row) => cloneRecord(rowToRecord(row)));
      } catch (error) {
        throw translateMappingPersistenceError(error, "list");
      }
    }, {
      entityType: filter.entityType,
      providerId: filter.providerId,
      integrationId: filter.integrationId,
      tenantId: filter.tenantId,
      organisationId: filter.organisationId,
      transactionOutcome: "none",
    });
  }

  async update(
    platformId: string,
    input: UpdateEntityMappingInput,
    tenantId?: string,
    organisationId?: string,
  ): Promise<EntityMappingRecord> {
    return this.run("update", async () => {
      try {
        return await this.db.transaction(async (tx) => {
          const existing = await this.getByPlatformIdWithExecutor(
            tx,
            platformId,
            tenantId,
            organisationId,
          );
          if (!existing) {
            throw new PlatformServiceError({
              category: "not_found",
              code: "MAPPING_NOT_FOUND",
              message: "Entity mapping not found",
              correlationId: "mapping-store",
              retryable: false,
              details: { platformId },
            });
          }

          if (
            input.expectedRevision !== undefined &&
            input.expectedRevision !== existing.revision
          ) {
            throw new PlatformServiceError({
              category: "conflict",
              code: "MAPPING_REVISION_CONFLICT",
              message: "Mapping revision conflict",
              correlationId: "mapping-store",
              retryable: true,
              details: {
                platformId,
                expectedRevision: input.expectedRevision,
                actualRevision: existing.revision,
                classification: "optimistic_concurrency_conflict",
              },
            });
          }

          const nextStatus = input.status ?? existing.status;
          const nextParentPlatformId =
            input.parentPlatformId === null
              ? null
              : (input.parentPlatformId ?? existing.parentPlatformId ?? null);
          const nextParentProviderNativeId =
            input.parentProviderNativeId === null
              ? null
              : (input.parentProviderNativeId ?? existing.parentProviderNativeId ?? null);
          const nextOrganisationId =
            input.organisationId === null
              ? null
              : (input.organisationId ?? existing.organisationId ?? null);
          const nextMetadata = input.metadata
            ? { ...input.metadata }
            : { ...existing.metadata };
          const nextRevision = existing.revision + 1;
          const now = new Date();

          const conditions: SQL[] = [
            eq(platformEntityMapping.platformId, platformId),
            eq(platformEntityMapping.revision, existing.revision),
          ];
          if (tenantId) {
            conditions.push(eq(platformEntityMapping.tenantId, tenantId));
          }

          const [row] = await tx
            .update(platformEntityMapping)
            .set({
              status: nextStatus,
              metadata: nextMetadata,
              parentPlatformId: nextParentPlatformId,
              parentProviderNativeId: nextParentProviderNativeId,
              organisationId: nextOrganisationId,
              revision: nextRevision,
              updatedAt: now,
            })
            .where(and(...conditions))
            .returning();

          if (!row) {
            throw new PlatformServiceError({
              category: "conflict",
              code: "MAPPING_REVISION_CONFLICT",
              message: "Mapping revision conflict",
              correlationId: "mapping-store",
              retryable: true,
              details: {
                platformId,
                expectedRevision: existing.revision,
                classification: "optimistic_concurrency_conflict",
              },
            });
          }

          return cloneRecord(rowToRecord(row));
        });
      } catch (error) {
        if (isPlatformServiceError(error)) {
          throw error;
        }
        throw translateMappingPersistenceError(error, "update");
      }
    }, {
      platformId,
      tenantId,
      organisationId,
      transactionOutcome: "committed",
    });
  }

  async deactivate(
    platformId: string,
    tenantId?: string,
    organisationId?: string,
  ): Promise<EntityMappingRecord> {
    return this.update(platformId, { status: "inactive" }, tenantId, organisationId);
  }

  async remove(
    platformId: string,
    tenantId?: string,
    organisationId?: string,
  ): Promise<boolean> {
    return this.run("remove", async () => {
      try {
        return await this.db.transaction(async (tx) => {
          const existing = await this.getByPlatformIdWithExecutor(
            tx,
            platformId,
            tenantId,
            organisationId,
          );
          if (!existing) {
            return false;
          }

          const conditions: SQL[] = [eq(platformEntityMapping.platformId, platformId)];
          if (tenantId) {
            conditions.push(eq(platformEntityMapping.tenantId, tenantId));
          }

          const deleted = await tx
            .delete(platformEntityMapping)
            .where(and(...conditions))
            .returning({ platformId: platformEntityMapping.platformId });

          return deleted.length > 0;
        });
      } catch (error) {
        throw translateMappingPersistenceError(error, "remove");
      }
    }, {
      platformId,
      tenantId,
      organisationId,
      transactionOutcome: "committed",
    });
  }

  private async getByPlatformIdWithExecutor(
    executor: DatabaseExecutor,
    platformId: string,
    tenantId?: string,
    organisationId?: string,
  ): Promise<EntityMappingRecord | null> {
    const conditions: SQL[] = [eq(platformEntityMapping.platformId, platformId)];
    if (tenantId) {
      conditions.push(eq(platformEntityMapping.tenantId, tenantId));
    }

    const [row] = await executor
      .select()
      .from(platformEntityMapping)
      .where(and(...conditions))
      .limit(1);

    if (!row) {
      return null;
    }

    const record = rowToRecord(row);
    if (!matchesOrganisation(record, organisationId)) {
      return null;
    }
    return record;
  }

  private async run<T>(
    operation: MappingStoreOperation,
    action: () => Promise<T>,
    context: {
      readonly entityType?: string;
      readonly platformId?: string;
      readonly providerId?: string;
      readonly integrationId?: string;
      readonly tenantId?: string;
      readonly organisationId?: string;
      readonly transactionOutcome?: "committed" | "rolled_back" | "none";
    },
  ): Promise<T> {
    const started = Date.now();
    try {
      const result = await action();
      const durationMs = Date.now() - started;
      const notFound = result === null || result === false;
      this.logger.log({
        level: "info",
        operation,
        entityType: context.entityType,
        platformId: context.platformId,
        providerId: context.providerId,
        integrationId: context.integrationId,
        tenantId: context.tenantId,
        organisationId: context.organisationId,
        result: notFound ? "not_found" : "success",
        durationMs,
        transactionOutcome: context.transactionOutcome ?? "none",
        message: notFound ? `mapping.${operation}.not_found` : `mapping.${operation}.ok`,
      });
      this.metrics.record({
        operation,
        result: notFound ? "not_found" : "success",
        durationMs,
        entityType: context.entityType,
      });
      return result;
    } catch (error) {
      const durationMs = Date.now() - started;
      const mapped = isPlatformServiceError(error)
        ? error
        : translateMappingPersistenceError(error, operation);
      const isConflict =
        mapped.code === "MAPPING_CONFLICT" ||
        mapped.code === "MAPPING_REVISION_CONFLICT" ||
        mapped.code === "MAPPING_INACTIVE";
      this.logger.log({
        level: isConflict ? "warn" : "error",
        operation,
        entityType: context.entityType,
        platformId: context.platformId,
        providerId: context.providerId,
        integrationId: context.integrationId,
        tenantId: context.tenantId,
        organisationId: context.organisationId,
        result: isConflict ? "conflict" : "error",
        classification:
          typeof mapped.details?.classification === "string"
            ? mapped.details.classification
            : mapped.code,
        durationMs,
        transactionOutcome:
          context.transactionOutcome === "committed"
            ? "rolled_back"
            : (context.transactionOutcome ?? "none"),
        message: `mapping.${operation}.failed:${safePersistenceDiagnosticCause(mapped)}`,
      });
      this.metrics.record({
        operation,
        result: isConflict ? "conflict" : "error",
        durationMs,
        entityType: context.entityType,
      });
      throw mapped;
    }
  }
}
