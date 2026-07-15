import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import type { EntityMappingStore } from "./entity-mapping-store";
import type {
  CreateEntityMappingInput,
  EntityMappingRecord,
  ListEntityMappingsFilter,
  UpdateEntityMappingInput,
} from "./types";

function cloneRecord(record: EntityMappingRecord): EntityMappingRecord {
  return {
    ...record,
    metadata: { ...record.metadata },
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

function matchesScope(
  record: EntityMappingRecord,
  tenantId?: string,
  organisationId?: string,
): boolean {
  if (tenantId && record.tenantId !== tenantId) {
    return false;
  }
  if (organisationId !== undefined) {
    if ((record.organisationId ?? undefined) !== organisationId) {
      return false;
    }
  }
  return true;
}

/**
 * Deterministic in-memory EntityMappingStore for development and tests.
 * Replaceable by a PostgreSQL implementation without changing consumers.
 *
 * Uniqueness rules (enforced):
 * 1. platformId is unique
 * 2. (tenantId, entityType, providerId, providerNativeId) is unique among active/pending mappings
 */
export class InMemoryEntityMappingStore implements EntityMappingStore {
  private readonly byPlatformId = new Map<string, EntityMappingRecord>();
  private readonly providerIndex = new Map<string, string>();

  private providerKey(input: {
    readonly tenantId: string;
    readonly entityType: string;
    readonly providerId: string;
    readonly providerNativeId: string;
  }): string {
    return `${input.tenantId}|${input.entityType}|${input.providerId}|${input.providerNativeId}`;
  }

  async create(input: CreateEntityMappingInput): Promise<EntityMappingRecord> {
    if (this.byPlatformId.has(input.platformId)) {
      throw new PlatformServiceError({
        category: "conflict",
        code: "MAPPING_CONFLICT",
        message: "Mapping already exists for platform ID",
        correlationId: "mapping-store",
        retryable: false,
        details: { platformId: input.platformId },
      });
    }

    const status = input.status ?? "active";
    const key = this.providerKey(input);

    if (status === "active" || status === "pending") {
      const existingPlatformId = this.providerIndex.get(key);
      if (existingPlatformId) {
        throw new PlatformServiceError({
          category: "conflict",
          code: "MAPPING_CONFLICT",
          message: "Provider-native ID already mapped",
          correlationId: "mapping-store",
          retryable: false,
          details: {
            providerNativeId: input.providerNativeId,
            existingPlatformId,
          },
        });
      }
    }

    const timestamp = nowIso();
    const record: EntityMappingRecord = {
      platformId: input.platformId,
      entityType: input.entityType,
      providerId: input.providerId,
      integrationId: input.integrationId,
      providerNativeId: input.providerNativeId,
      parentPlatformId: input.parentPlatformId,
      parentProviderNativeId: input.parentProviderNativeId,
      tenantId: input.tenantId,
      organisationId: input.organisationId,
      status,
      createdAt: timestamp,
      updatedAt: timestamp,
      metadata: { ...(input.metadata ?? {}) },
      revision: 1,
    };

    this.byPlatformId.set(record.platformId, record);
    if (status === "active" || status === "pending") {
      this.providerIndex.set(key, record.platformId);
    }

    return cloneRecord(record);
  }

  async getByPlatformId(
    platformId: string,
    tenantId?: string,
    organisationId?: string,
  ): Promise<EntityMappingRecord | null> {
    const record = this.byPlatformId.get(platformId);
    if (!record) {
      return null;
    }
    if (!matchesScope(record, tenantId, organisationId)) {
      return null;
    }
    return cloneRecord(record);
  }

  async getByProviderNativeId(input: {
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly entityType: EntityMappingRecord["entityType"];
    readonly providerId: string;
    readonly providerNativeId: string;
  }): Promise<EntityMappingRecord | null> {
    const platformId = this.providerIndex.get(this.providerKey(input));
    if (platformId) {
      const indexed = await this.getByPlatformId(
        platformId,
        input.tenantId,
        input.organisationId,
      );
      if (indexed) {
        return indexed;
      }
    }

    // Fall back to full scan for inactive/orphaned mappings
    for (const record of this.byPlatformId.values()) {
      if (
        record.tenantId === input.tenantId &&
        record.entityType === input.entityType &&
        record.providerId === input.providerId &&
        record.providerNativeId === input.providerNativeId &&
        matchesScope(record, input.tenantId, input.organisationId)
      ) {
        return cloneRecord(record);
      }
    }
    return null;
  }

  async resolveProviderNativeId(input: {
    readonly platformId: string;
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly requireActive?: boolean;
  }): Promise<string> {
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
  }

  async resolvePlatformId(input: {
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly entityType: EntityMappingRecord["entityType"];
    readonly providerId: string;
    readonly providerNativeId: string;
    readonly requireActive?: boolean;
  }): Promise<string> {
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
  }

  async list(filter: ListEntityMappingsFilter = {}): Promise<readonly EntityMappingRecord[]> {
    const results: EntityMappingRecord[] = [];

    for (const record of this.byPlatformId.values()) {
      if (filter.tenantId && record.tenantId !== filter.tenantId) continue;
      if (
        filter.organisationId !== undefined &&
        (record.organisationId ?? undefined) !== filter.organisationId
      ) {
        continue;
      }
      if (filter.entityType && record.entityType !== filter.entityType) continue;
      if (filter.providerId && record.providerId !== filter.providerId) continue;
      if (filter.integrationId && record.integrationId !== filter.integrationId) continue;
      if (filter.status && record.status !== filter.status) continue;
      if (filter.parentPlatformId && record.parentPlatformId !== filter.parentPlatformId) {
        continue;
      }
      results.push(cloneRecord(record));
    }

    return results.sort((a, b) => a.platformId.localeCompare(b.platformId));
  }

  async update(
    platformId: string,
    input: UpdateEntityMappingInput,
    tenantId?: string,
    organisationId?: string,
  ): Promise<EntityMappingRecord> {
    const existing = await this.getByPlatformId(platformId, tenantId, organisationId);
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
        },
      });
    }

    const previousKey = this.providerKey(existing);
    const nextStatus = input.status ?? existing.status;

    const updated: EntityMappingRecord = {
      ...existing,
      status: nextStatus,
      metadata: input.metadata ? { ...input.metadata } : existing.metadata,
      parentPlatformId:
        input.parentPlatformId === null
          ? undefined
          : (input.parentPlatformId ?? existing.parentPlatformId),
      parentProviderNativeId:
        input.parentProviderNativeId === null
          ? undefined
          : (input.parentProviderNativeId ?? existing.parentProviderNativeId),
      organisationId:
        input.organisationId === null
          ? undefined
          : (input.organisationId ?? existing.organisationId),
      updatedAt: nowIso(),
      revision: existing.revision + 1,
    };

    if (nextStatus === "active" || nextStatus === "pending") {
      const conflict = this.providerIndex.get(this.providerKey(updated));
      if (conflict && conflict !== platformId) {
        throw new PlatformServiceError({
          category: "conflict",
          code: "MAPPING_CONFLICT",
          message: "Provider-native ID already mapped",
          correlationId: "mapping-store",
          retryable: false,
          details: {
            providerNativeId: updated.providerNativeId,
            existingPlatformId: conflict,
          },
        });
      }
    }

    this.byPlatformId.set(platformId, updated);

    if (this.providerIndex.get(previousKey) === platformId) {
      this.providerIndex.delete(previousKey);
    }
    if (nextStatus === "active" || nextStatus === "pending") {
      this.providerIndex.set(this.providerKey(updated), platformId);
    }

    return cloneRecord(updated);
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
    const existing = await this.getByPlatformId(platformId, tenantId, organisationId);
    if (!existing) {
      return false;
    }

    const key = this.providerKey(existing);
    if (this.providerIndex.get(key) === platformId) {
      this.providerIndex.delete(key);
    }
    this.byPlatformId.delete(platformId);
    return true;
  }

  /** Test helper — clears all mappings. */
  clear(): void {
    this.byPlatformId.clear();
    this.providerIndex.clear();
  }

  /** Test helper — current mapping count. */
  size(): number {
    return this.byPlatformId.size;
  }
}
