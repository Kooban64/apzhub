/**
 * Mapping Provider Framework — vendor-neutral mapping subsystem (OSS-100-07).
 * Adapters supply provider-specific rules; the SDK supplies infrastructure.
 * EntityMappingStore (ADR-0049) remains in platform-services — not duplicated here.
 */

/** Named mapping profile selecting a rule set within a provider. */
export type MappingProfile =
  | "default"
  | "summary"
  | "detail"
  | "create"
  | "update"
  | "search"
  | "analytics"
  | (string & {});

/** Direction / intent of a mapping definition. */
export type MappingDirection =
  | "provider_to_canonical"
  | "canonical_to_provider"
  | "read_only"
  | "write"
  | "partial_update"
  | "relationship"
  | "collection"
  | "nested";

/** Policy when an enum value has no explicit mapping. */
export type EnumUnknownPolicy = "fail" | "fallback" | "passthrough";

/** Tenant-scoped execution context for mapping operations. */
export interface MappingContext {
  readonly tenantId: string;
  readonly correlationId?: string;
  readonly integrationId?: string;
  readonly extras?: Readonly<Record<string, unknown>>;
}

/** Capabilities advertised by a MappingProvider. */
export interface MappingCapabilities {
  readonly entityTypes: readonly string[];
  readonly profiles: readonly MappingProfile[];
  readonly directions: readonly MappingDirection[];
  readonly supportsRelationships: boolean;
  readonly supportsCollections: boolean;
  readonly supportsNested: boolean;
  readonly supportsPartialUpdate: boolean;
}

/** Result of a successful or failed mapping execution. */
export interface MappingResult<T = unknown> {
  readonly ok: boolean;
  readonly value?: T;
  readonly error?: MappingError;
  readonly profile: MappingProfile;
  readonly direction: MappingDirection;
  readonly entityType: string;
  readonly durationMs: number;
  readonly providerId: string;
}

/** Safe mapping error — never includes provider internals in messages. */
export interface MappingError {
  readonly category: "mapping" | "validation";
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly correlationId: string;
  readonly details?: Readonly<Record<string, string>>;
}

/** Field-level map entry used by FieldMapper / definitions. */
export interface FieldMapEntry {
  readonly source: string;
  readonly target: string;
  readonly required?: boolean;
  readonly transformer?: string;
  readonly defaultValue?: unknown;
}

/** Executable mapping definition registered on a provider. */
export interface MappingDefinition<TInput = unknown, TOutput = unknown> {
  readonly id: string;
  readonly entityType: string;
  readonly direction: MappingDirection;
  readonly profile: MappingProfile;
  readonly fieldMaps?: readonly FieldMapEntry[];
  readonly map?: (input: TInput, context: MappingContext) => TOutput | Promise<TOutput>;
  readonly description?: string;
}

/** Adapter-implemented mapping provider. */
export interface MappingProvider {
  readonly id: string;
  readonly integrationSlug: string;
  readonly capabilities: MappingCapabilities;
  getDefinition(
    entityType: string,
    profile: MappingProfile,
    direction: MappingDirection,
  ): MappingDefinition | undefined;
  listDefinitions(): readonly MappingDefinition[];
}

export interface MappingRegistryRegisterOptions {
  /** When true, replace an existing provider with the same id. Default: false (reject). */
  readonly force?: boolean;
}

/** Diagnostics snapshot for registered providers and execution stats. */
export interface MappingDiagnostics {
  readonly providerCount: number;
  readonly providers: readonly MappingProviderDiagnostics[];
  readonly totalDefinitions: number;
  readonly supportedEntityTypes: readonly string[];
  readonly executionCount: number;
  readonly failureCount: number;
  readonly averageLatencyMs: number;
  readonly capturedAt: string;
}

export interface MappingProviderDiagnostics {
  readonly id: string;
  readonly integrationSlug: string;
  readonly entityTypes: readonly string[];
  readonly profiles: readonly MappingProfile[];
  readonly directions: readonly MappingDirection[];
  readonly definitionCount: number;
  readonly capabilities: MappingCapabilities;
}

/** Metrics counters for mapping executions. */
export interface MappingMetricsSnapshot {
  readonly executionsTotal: number;
  readonly failuresTotal: number;
  readonly totalLatencyMs: number;
  readonly averageLatencyMs: number;
  readonly byProfile: Readonly<Record<string, number>>;
  readonly byDirection: Readonly<Record<string, number>>;
  readonly byEntityType: Readonly<Record<string, number>>;
  readonly byProvider: Readonly<Record<string, number>>;
}

export interface MappingMetrics {
  recordExecution(input: {
    readonly providerId: string;
    readonly entityType: string;
    readonly profile: MappingProfile;
    readonly direction: MappingDirection;
    readonly success: boolean;
    readonly durationMs: number;
  }): void;
  getSnapshot(): MappingMetricsSnapshot;
  reset(): void;
}

export interface MappingPipelineExecuteInput {
  readonly providerId: string;
  readonly entityType: string;
  readonly profile?: MappingProfile;
  readonly direction: MappingDirection;
  readonly input: unknown;
  readonly context: MappingContext;
}

/** Value transformer kinds supported by the framework. */
export type ValueTransformerKind =
  | "date"
  | "uuid"
  | "boolean"
  | "number"
  | "enum"
  | "array"
  | "nullable"
  | "string"
  | "custom";

export interface ValueTransformer<TIn = unknown, TOut = unknown> {
  readonly kind: ValueTransformerKind;
  readonly name: string;
  transform(value: TIn, context?: MappingContext): TOut;
}

export interface EnumMapperOptions<TCanonical extends string = string> {
  readonly map: Readonly<Record<string, TCanonical>>;
  readonly unknownPolicy: EnumUnknownPolicy;
  readonly fallback?: TCanonical;
  /** Normalize keys before lookup (default: trim + lower-case). */
  readonly normalizeKey?: (raw: string) => string;
}

export interface IdentityMapperOptions {
  readonly prefix: string;
  readonly integrationSlug: string;
}

export interface RelationshipMapping {
  readonly relationName: string;
  readonly sourceField: string;
  readonly targetEntityType: string;
  readonly idPrefix?: string;
  readonly integrationSlug?: string;
  readonly many?: boolean;
}

export interface CollectionMappingOptions<TItem = unknown, TOut = unknown> {
  readonly mapItem: (item: TItem, index: number, context: MappingContext) => TOut;
  readonly filter?: (item: TItem, index: number) => boolean;
  readonly skipNullish?: boolean;
}

export interface NestedMappingOptions {
  readonly path: string;
  readonly definition: MappingDefinition;
}
