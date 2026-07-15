# Mapping Provider Framework (OSS-100-07)

**Package:** `@apzhub/integration-sdk` v0.7.0  
**Export:** `@apzhub/integration-sdk/mapping` (also re-exported from the root barrel)  
**Authority:** [Platform Integration SDK Architecture](../../../docs/architecture/APZHUB-Platform-Integration-SDK-Architecture.md)

---

## Overview

OSS-100-07 delivers a reusable, vendor-neutral **Mapping Provider Framework** for adapter-level provider ↔ canonical translation. Adapters supply provider-specific rules; the SDK supplies infrastructure (registry, pipeline, transformers, diagnostics, mocks).

```text
Capability Service / Adapter operation
        ↓
MappingPipeline.execute({ providerId, entityType, profile, direction, input, context })
        ↓
MappingRegistry → MappingProvider → MappingDefinition
        ↓
map() | FieldMapper (+ ValueTransformers) | helpers (Enum / Identity / Relationship / Collection)
        ↓
MappingResult<T>  (ok + value | error)
```

**Not in this package:** durable ID persistence (`EntityMappingStore`), platform `MappingOrchestrator`, PostgreSQL mapping tables, gateway, UI, Event Bus, or webhooks. Those remain in `@apzhub/platform-services` per **ADR-0049** and are **untouched** by OSS-100-07.

---

## Boundary: SDK mapping vs platform EntityMappingStore

| Concern | Owner | Role |
|---------|-------|------|
| Field / enum / shape translation (provider ↔ canonical DTO) | **Integration SDK** (`/mapping`) | Stateless rules, profiles, pipeline |
| Durable global ID bindings (`task_{32-hex}` ↔ native) | **Platform** `EntityMappingStore` (ADR-0049) | SoR for ID mappings |
| Resolve / bind / orchestrate across store + providers | **Platform** `MappingOrchestrator` | Platform-services only |

Adapters may still emit **provisional** IDs `{prefix}_{plane|zammad}_{native}` until the platform store binds durable IDs. Wire format is unchanged.

---

## Public surface

| Symbol | Purpose |
|--------|---------|
| `MappingProvider` | Adapter-owned set of definitions + capabilities |
| `MappingRegistry` / `InMemoryMappingRegistry` | Register, resolve, diagnose providers |
| `MappingPipeline` / `DefaultMappingPipeline` | Execute definitions with metrics |
| `MappingDefinition` / `createDefinition` | Single executable mapping rule |
| `MappingProfile` / `MappingDirection` | Profile and direction selectors |
| `MappingContext` | Tenant + correlation context |
| `MappingResult` / `MappingError` | Safe execution outcome |
| `MappingCapabilities` / `MappingDiagnostics` | Discovery and ops snapshots |
| `FieldMapper` | Declarative field path maps |
| `ValueTransformer` (+ registry) | Coercion helpers (date, uuid, enum, …) |
| `EnumMapper` / `IdentityMapper` | Explicit enums; provisional ID helpers |
| `RelationshipMapper` / `CollectionMapper` | Related IDs and list mapping |
| `createMockMappingProvider` | Test fixtures |

---

## Quick start

```typescript
import {
  createMappingRegistry,
  createMappingProvider,
  createDefinition,
  createMappingPipeline,
} from "@apzhub/integration-sdk/mapping";

const provider = createMappingProvider({
  id: "example.entity-mapping",
  integrationSlug: "example",
  definitions: [
    createDefinition({
      id: "example.task.default.read",
      entityType: "task",
      direction: "provider_to_canonical",
      profile: "default",
      map: (input) => ({ id: String((input as { id: string }).id), title: "…" }),
    }),
  ],
});

const registry = createMappingRegistry();
registry.register(provider);

const pipeline = createMappingPipeline({ registry });

const result = await pipeline.execute({
  providerId: "example.entity-mapping",
  entityType: "task",
  direction: "provider_to_canonical",
  input: { id: "1" },
  context: { tenantId: "tenant-001", correlationId: "corr-001" },
});
```

### Plane / Zammad pattern

Adapters register on init and keep public mapper functions as the call-site source of truth:

```typescript
// PlaneAdapter constructor
this.mappingRegistry = createPlaneMappingRegistry();

// ZammadAdapter constructor
this.mappingRegistry = createZammadMappingRegistry();
```

See [MAPPING-MIGRATION.md](./MAPPING-MIGRATION.md).

---

## Execution model

1. Resolve `MappingProvider` by `providerId`.
2. Resolve `MappingDefinition` by `(entityType, profile, direction)` — default profile is `"default"`.
3. Optionally validate the definition.
4. Run `definition.map` **or** `fieldMaps` via `FieldMapper`.
5. Record metrics; return `MappingResult` (never throw for pipeline failures — errors are structured).

Sync path: `executeSync` — rejects async `map` functions.

---

## Errors

Mapping errors use categories `mapping` | `validation`, never include provider internals in messages, and convert to `IntegrationError` via `mappingErrorToIntegrationError` when crossing SDK boundaries.

Common codes:

| Code | Meaning |
|------|---------|
| `integration.mapping.validation_failed` | Invalid definition / input / transformer |
| `integration.mapping.provider_not_found` | Unknown provider id |
| `integration.mapping.definition_not_found` | No rule for entity/profile/direction |
| `integration.mapping.duplicate_provider` | Register without `force` |
| `integration.mapping.enum_unknown` | Enum policy `fail` / missing reverse |

---

## Package docs

| Document | Path |
|----------|------|
| Profiles & directions | [MAPPING-PROFILES.md](./MAPPING-PROFILES.md) |
| Registry & diagnostics | [MAPPING-REGISTRY.md](./MAPPING-REGISTRY.md) |
| Transformers & helpers | [MAPPING-TRANSFORMERS.md](./MAPPING-TRANSFORMERS.md) |
| Adapter migration | [MAPPING-MIGRATION.md](./MAPPING-MIGRATION.md) |
| Architecture index | [APZHUB-Integration-SDK-Mapping-Framework.md](../../../docs/architecture/APZHUB-Integration-SDK-Mapping-Framework.md) |

---

## Related

- [OSS-100-07 Completion Report](../../../docs/sprint/OSS-100-07-completion-report.md)
- [ADR-0049](../../../docs/adr/ADR-0049-persistent-entity-mapping-store.md) — EntityMappingStore (platform SoR; not duplicated here)
- [HTTP Transport](./HTTP-TRANSPORT.md) (OSS-100-06)
- [Adapter Framework](./ADAPTER-FRAMEWORK.md) (OSS-100-05)
