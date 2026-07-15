export type {
  CanonicalEntityType,
  GlobalIdPrefix,
  EntityMappingStatus,
  EntityMappingRecord,
  CreateEntityMappingInput,
  UpdateEntityMappingInput,
  ListEntityMappingsFilter,
  EntityMappingScope,
} from "./types";

export {
  ENTITY_TYPE_TO_PREFIX,
  PREFIX_TO_ENTITY_TYPE,
} from "./types";

export type { EntityMappingStore } from "./entity-mapping-store";
export { InMemoryEntityMappingStore } from "./in-memory-entity-mapping-store";
export { PostgresEntityMappingStore } from "./postgres-entity-mapping-store";
export type { PostgresEntityMappingStoreOptions } from "./postgres-entity-mapping-store";
export {
  createEntityMappingStore,
  resolveEntityMappingStoreMode,
  assertEntityMappingStoreModeAllowed,
} from "./create-entity-mapping-store";
export type {
  EntityMappingStoreMode,
  EntityMappingStoreBootstrapEnv,
  CreateEntityMappingStoreOptions,
  ResolveEntityMappingStoreModeResult,
} from "./create-entity-mapping-store";
export {
  translateMappingPersistenceError,
  safePersistenceDiagnosticCause,
} from "./map-persistence-error";
export {
  noopMappingStoreLogger,
  noopMappingStoreMetrics,
  InMemoryMappingStoreLogger,
  InMemoryMappingStoreMetrics,
} from "./mapping-store-observability";
export type {
  MappingStoreOperation,
  MappingStoreLogEvent,
  MappingStoreLogger,
  MappingStoreMetricEvent,
  MappingStoreMetrics,
} from "./mapping-store-observability";

export {
  generateGlobalId,
  isValidGlobalId,
  parseGlobalId,
  assertGlobalId,
  extractProvisionalProviderNativeId,
  isProvisionalProviderId,
} from "./global-id";

export type { ParsedGlobalId } from "./global-id";
