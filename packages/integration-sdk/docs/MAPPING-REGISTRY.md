# Mapping Registry & Diagnostics (OSS-100-07)

**Package:** `@apzhub/integration-sdk` v0.7.0  
**Export:** `@apzhub/integration-sdk/mapping`

---

## MappingRegistry

In-memory registry of `MappingProvider` instances. Default implementation: `InMemoryMappingRegistry` via `createMappingRegistry()`.

```typescript
interface MappingRegistry {
  register(provider: MappingProvider, options?: { force?: boolean }): void;
  get(id: string): MappingProvider | undefined;
  require(id: string): MappingProvider;
  list(): readonly MappingProvider[];
  has(id: string): boolean;
  findByEntityType(entityType: string): readonly MappingProvider[];
  getDiagnostics(): MappingDiagnostics;
  getMetrics(): MappingMetrics;
  clear(): void;
}
```

### Registration rules

- Validates providers on register by default (`validateOnRegister: true`).
- Duplicate `provider.id` throws `integration.mapping.duplicate_provider` unless `force: true`.
- Capabilities are advertised on the provider and reflected in diagnostics.

### Factory options

```typescript
createMappingRegistry({
  metrics: createMappingMetrics(), // optional shared metrics
  clock: () => new Date().toISOString(),
  validateOnRegister: true,
});
```

---

## MappingProvider

```typescript
interface MappingProvider {
  readonly id: string;
  readonly integrationSlug: string;
  readonly capabilities: MappingCapabilities;
  getDefinition(entityType, profile, direction): MappingDefinition | undefined;
  listDefinitions(): readonly MappingDefinition[];
}
```

Build with `createMappingProvider({ id, integrationSlug, definitions, capabilities? })`.

### Well-known adapter providers

| Function                        | Provider id             | Slug     |
| ------------------------------- | ----------------------- | -------- |
| `createPlaneMappingRegistry()`  | `plane.entity-mapping`  | `plane`  |
| `createZammadMappingRegistry()` | `zammad.entity-mapping` | `zammad` |

Both register a single provider wrapping existing mapper functions. Adapters call these on construction:

```typescript
this.mappingRegistry = createPlaneMappingRegistry();
// or
this.mappingRegistry = createZammadMappingRegistry();
```

---

## MappingPipeline

```typescript
const pipeline = createMappingPipeline({
  registry,
  transformers: createDefaultValueTransformerRegistry(), // optional
  validateBeforeExecute: true,
});

await pipeline.execute({ providerId, entityType, profile?, direction, input, context });
pipeline.executeSync({ … }); // sync maps / fieldMaps only
```

Metrics are recorded on the registry’s metrics instance (success and failure).

---

## MappingCapabilities

```typescript
interface MappingCapabilities {
  readonly entityTypes: readonly string[];
  readonly profiles: readonly MappingProfile[];
  readonly directions: readonly MappingDirection[];
  readonly supportsRelationships: boolean;
  readonly supportsCollections: boolean;
  readonly supportsNested: boolean;
  readonly supportsPartialUpdate: boolean;
}
```

Derived from definitions unless overridden.

---

## MappingDiagnostics

`registry.getDiagnostics()` returns:

| Field                             | Meaning                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| `providerCount`                   | Registered providers                                                                  |
| `providers[]`                     | Per-provider id, slug, entities, profiles, directions, definition count, capabilities |
| `totalDefinitions`                | Sum across providers                                                                  |
| `supportedEntityTypes`            | Sorted unique entity types                                                            |
| `executionCount` / `failureCount` | From metrics                                                                          |
| `averageLatencyMs`                | From metrics                                                                          |
| `capturedAt`                      | ISO timestamp                                                                         |

### MappingMetrics

`recordExecution` / `getSnapshot` / `reset` track totals and breakdowns by profile, direction, entity type, and provider. Standard names: `STANDARD_MAPPING_METRIC_NAMES`.

---

## Testing helpers

| Helper                                                       | Purpose                                |
| ------------------------------------------------------------ | -------------------------------------- |
| `createMockMappingProvider`                                  | Scripted success / failure definitions |
| `MOCK_MAPPING_FIXTURES`                                      | Sample payloads                        |
| `createPlaneMappingPipeline` / `createZammadMappingPipeline` | Adapter-scoped pipelines               |

---

## Related

- [MAPPING-FRAMEWORK.md](./MAPPING-FRAMEWORK.md)
- [MAPPING-PROFILES.md](./MAPPING-PROFILES.md)
- [MAPPING-MIGRATION.md](./MAPPING-MIGRATION.md)
