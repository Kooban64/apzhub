export type {
  MappingProfile,
  MappingDirection,
  EnumUnknownPolicy,
  MappingContext,
  MappingCapabilities,
  MappingResult,
  MappingError,
  FieldMapEntry,
  MappingDefinition,
  MappingProvider,
  MappingRegistryRegisterOptions,
  MappingDiagnostics,
  MappingProviderDiagnostics,
  MappingMetricsSnapshot,
  MappingMetrics,
  MappingPipelineExecuteInput,
  ValueTransformerKind,
  ValueTransformer,
  EnumMapperOptions,
  IdentityMapperOptions,
  RelationshipMapping,
  CollectionMappingOptions,
  NestedMappingOptions,
} from "./types";

export type { MappingErrorContext } from "./errors";
export {
  createMappingError,
  mappingValidationError,
  mappingProviderNotFoundError,
  mappingDefinitionNotFoundError,
  mappingDuplicateProviderError,
  mappingEnumUnknownError,
  mappingExecutionError,
  mappingErrorToIntegrationError,
  mapUnknownToMappingError,
  isMappingError,
} from "./errors";

export type { IdentityMapper } from "./identity-mapper";
export {
  toProvisionalId,
  extractNativeId,
  hasProvisionalIdFormat,
  createIdentityMapper,
  PlaneIdentityMapper,
  ZammadIdentityMapper,
} from "./identity-mapper";

export {
  createDateTransformer,
  createUuidTransformer,
  createBooleanTransformer,
  createNumberTransformer,
  createStringTransformer,
  createNullableTransformer,
  createArrayTransformer,
  createCustomTransformer,
  createEnumValueTransformer,
  ValueTransformerRegistry,
  createDefaultValueTransformerRegistry,
} from "./value-transformers";

export type { EnumMapper } from "./enum-mapper";
export { createEnumMapper, createBidirectionalEnumMapper } from "./enum-mapper";

export type { FieldMapper, FieldMapperOptions } from "./field-mapper";
export { createFieldMapper } from "./field-mapper";

export type { RelationshipMapper } from "./relationship-mapper";
export { createRelationshipMapper } from "./relationship-mapper";

export type { CollectionMapper, NestedMapper } from "./collection-mapper";
export {
  createCollectionMapper,
  createNestedMapper,
  executeNestedDefinition,
} from "./collection-mapper";

export type { MappingDefinitionValidationResult } from "./validation";
export {
  validateMappingDefinition,
  assertValidMappingDefinition,
  validateMappingProvider,
  definitionKey,
  validationResultToError,
} from "./validation";

export type { MappingRegistry, MappingRegistryOptions } from "./registry";
export { InMemoryMappingRegistry, createMappingRegistry } from "./registry";

export { DefaultMappingMetrics, createMappingMetrics, STANDARD_MAPPING_METRIC_NAMES } from "./metrics";

export type { MappingPipeline, MappingPipelineOptions } from "./pipeline";
export { DefaultMappingPipeline, createMappingPipeline } from "./pipeline";

export type { CreateMappingProviderInput } from "./provider";
export { createMappingProvider, createDefinition } from "./provider";

export type { MockMappingProviderOptions } from "./mock";
export { createMockMappingProvider, MOCK_MAPPING_FIXTURES } from "./mock";
