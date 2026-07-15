import type {
  CreateEntityMappingInput,
  EntityMappingRecord,
  ListEntityMappingsFilter,
  UpdateEntityMappingInput,
} from "./types";

/**
 * Platform-owned entity mapping store contract.
 *
 * Persistence boundary: implementations may be in-memory (dev/test) or
 * PostgreSQL (OSS-110-05). Consumers depend only on this interface.
 *
 * Scope parameters (`tenantId` / `organisationId`) enforce isolation —
 * mappings from another tenant or organisation must not resolve.
 */
export interface EntityMappingStore {
  create(input: CreateEntityMappingInput): Promise<EntityMappingRecord>;

  getByPlatformId(
    platformId: string,
    tenantId?: string,
    organisationId?: string,
  ): Promise<EntityMappingRecord | null>;

  getByProviderNativeId(input: {
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly entityType: EntityMappingRecord["entityType"];
    readonly providerId: string;
    readonly providerNativeId: string;
  }): Promise<EntityMappingRecord | null>;

  resolveProviderNativeId(input: {
    readonly platformId: string;
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly requireActive?: boolean;
  }): Promise<string>;

  resolvePlatformId(input: {
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly entityType: EntityMappingRecord["entityType"];
    readonly providerId: string;
    readonly providerNativeId: string;
    readonly requireActive?: boolean;
  }): Promise<string>;

  list(filter?: ListEntityMappingsFilter): Promise<readonly EntityMappingRecord[]>;

  update(
    platformId: string,
    input: UpdateEntityMappingInput,
    tenantId?: string,
    organisationId?: string,
  ): Promise<EntityMappingRecord>;

  /** Soft-deactivates a mapping (status → inactive). */
  deactivate(
    platformId: string,
    tenantId?: string,
    organisationId?: string,
  ): Promise<EntityMappingRecord>;

  /** Hard-removes a mapping — prefer deactivate for production paths. */
  remove(
    platformId: string,
    tenantId?: string,
    organisationId?: string,
  ): Promise<boolean>;
}
