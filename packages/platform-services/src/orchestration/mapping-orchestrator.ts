import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import type { EntityMappingStore } from "../mapping/entity-mapping-store";
import {
  extractProvisionalProviderNativeId,
  generateGlobalId,
  isProvisionalProviderId,
  isValidGlobalId,
} from "../mapping/global-id";
import type { CanonicalEntityType, EntityMappingRecord } from "../mapping/types";

export interface MappingOrchestratorOptions {
  readonly store: EntityMappingStore;
}

export interface EnsureMappingInput {
  readonly ctx: ServiceRequestContext;
  readonly entityType: CanonicalEntityType;
  readonly providerId: string;
  readonly integrationId: string;
  /** Provisional or native ID returned by the capability provider. */
  readonly providerEntityId: string;
  readonly parentPlatformId?: string;
  readonly parentProviderNativeId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface ResolvedProviderIdentity {
  readonly mapping: EntityMappingRecord;
  readonly providerNativeId: string;
  readonly providerId: string;
  readonly integrationId: string;
}

/**
 * Orchestrates entity mapping around provider delegation.
 * Keeps provider-native IDs behind the mapping boundary.
 */
export class MappingOrchestrator {
  constructor(private readonly options: MappingOrchestratorOptions) {}

  get store(): EntityMappingStore {
    return this.options.store;
  }

  /**
   * Resolves an APZHUB global ID to provider identity for an existing entity operation.
   * Precedence for provider selection should prefer this mapping over the active provider.
   */
  async resolveExisting(
    ctx: ServiceRequestContext,
    platformId: string,
    expectedType: CanonicalEntityType,
  ): Promise<ResolvedProviderIdentity> {
    if (!isValidGlobalId(platformId)) {
      throw new PlatformServiceError({
        category: "validation",
        code: "INVALID_GLOBAL_ID",
        message: "Invalid APZHUB global entity ID",
        correlationId: ctx.correlationId,
        retryable: false,
        details: { platformId, expectedType },
      });
    }

    const mapping = await this.options.store.getByPlatformId(platformId, ctx.tenantId);
    if (!mapping) {
      throw new PlatformServiceError({
        category: "not_found",
        code: "MAPPING_NOT_FOUND",
        message: "Entity mapping not found",
        correlationId: ctx.correlationId,
        retryable: false,
        details: { platformId, expectedType },
      });
    }

    if (mapping.entityType !== expectedType) {
      throw new PlatformServiceError({
        category: "validation",
        code: "MAPPING_TYPE_MISMATCH",
        message: "Entity mapping type mismatch",
        correlationId: ctx.correlationId,
        retryable: false,
        details: {
          platformId,
          expectedType,
          actualType: mapping.entityType,
        },
      });
    }

    if (mapping.status !== "active") {
      throw new PlatformServiceError({
        category: "conflict",
        code: "MAPPING_INACTIVE",
        message: "Entity mapping is not active",
        correlationId: ctx.correlationId,
        retryable: false,
        details: { platformId, status: mapping.status },
      });
    }

    return {
      mapping,
      providerNativeId: mapping.providerNativeId,
      providerId: mapping.providerId,
      integrationId: mapping.integrationId,
    };
  }

  /**
   * After a successful provider create, allocate a global ID and persist the mapping.
   * If persistence fails, throws RECONCILIATION_REQUIRED — never silent success.
   */
  async ensureMappingAfterCreate(input: EnsureMappingInput): Promise<EntityMappingRecord> {
    const { ctx, entityType } = input;
    const providerNativeId = extractProvisionalProviderNativeId(
      input.providerEntityId,
      entityType,
    );

    const existing = await this.options.store.getByProviderNativeId({
      tenantId: ctx.tenantId,
      entityType,
      providerId: input.providerId,
      providerNativeId,
    });

    if (existing) {
      if (existing.status === "active") {
        return existing;
      }
      return this.options.store.update(
        existing.platformId,
        {
          status: "active",
          expectedRevision: existing.revision,
          parentPlatformId: input.parentPlatformId,
          parentProviderNativeId: input.parentProviderNativeId,
          metadata: input.metadata,
        },
        ctx.tenantId,
      );
    }

    const platformId = generateGlobalId(entityType);

    try {
      return await this.options.store.create({
        platformId,
        entityType,
        providerId: input.providerId,
        integrationId: input.integrationId,
        providerNativeId,
        parentPlatformId: input.parentPlatformId,
        parentProviderNativeId: input.parentProviderNativeId,
        tenantId: ctx.tenantId,
        status: "active",
        metadata: input.metadata,
      });
    } catch (error) {
      if (error instanceof PlatformServiceError && error.code === "MAPPING_CONFLICT") {
        // Concurrent mapping creation: another caller won the race — look up the winner.
        const raceWinner = await this.options.store.getByProviderNativeId({
          tenantId: ctx.tenantId,
          entityType,
          providerId: input.providerId,
          providerNativeId,
        });
        if (raceWinner) return raceWinner;
        throw error;
      }

      throw new PlatformServiceError({
        category: "system",
        code: "RECONCILIATION_REQUIRED",
        message:
          "Provider entity was created but mapping persistence failed — reconciliation required",
        correlationId: ctx.correlationId,
        retryable: false,
        details: {
          entityType,
          providerId: input.providerId,
          integrationId: input.integrationId,
          providerNativeId,
          parentPlatformId: input.parentPlatformId,
          cause:
            error instanceof Error
              ? error.message
              : "unknown mapping persistence failure",
        },
      });
    }
  }

  /**
   * Ensures a mapping exists for a provider-returned entity (list/get paths).
   * Creates a mapping lazily when the provider entity is seen for the first time.
   */
  async ensureMappingForProviderEntity(input: EnsureMappingInput): Promise<EntityMappingRecord> {
    return this.ensureMappingAfterCreate(input);
  }

  /** Replaces a provisional/native entity ID with the APZHUB global ID. */
  async toPlatformId(
    ctx: ServiceRequestContext,
    entityType: CanonicalEntityType,
    providerId: string,
    integrationId: string,
    providerEntityId: string,
    parent?: { platformId?: string; providerNativeId?: string },
  ): Promise<string> {
    if (isValidGlobalId(providerEntityId) && !isProvisionalProviderId(providerEntityId)) {
      return providerEntityId;
    }

    const mapping = await this.ensureMappingForProviderEntity({
      ctx,
      entityType,
      providerId,
      integrationId,
      providerEntityId,
      parentPlatformId: parent?.platformId,
      parentProviderNativeId: parent?.providerNativeId,
    });

    return mapping.platformId;
  }
}
