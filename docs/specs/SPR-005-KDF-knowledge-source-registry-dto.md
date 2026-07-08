# SPR-005 — Knowledge Source Registry DTO Specification

> **Story:** DF-005 — Server filter DTO  
> **Package:** `@apzhub/knowledge-discovery-framework/server`  
> **Status:** Implemented  
> **Authority:** [ADR-0023](../adr/ADR-0023-workbench-permission-adapter.md) · [Registry spec](./SPR-005-KDF-knowledge-registry.md) · [Knowledge Views model](../architecture/knowledge-views-model.md)

---

## Purpose

Define the **server-facing Knowledge Registry DTO** — a read-only, versioned projection of the in-memory Knowledge Registry suitable for serialisation and client hydration.

The DTO is **server authoritative**. Permission filtering occurs server-side before the payload reaches the client. The DTO does not execute providers, query knowledge, or persist state.

---

## Type definition

```typescript
interface KnowledgeSourceRegistryDto {
  readonly schemaVersion: 1;
  readonly frameworkVersion?: string;
  readonly sources: readonly KnowledgeSourceDescriptorDto[];
}

interface KnowledgeSourceDescriptorDto {
  readonly id: string;
  readonly label: string;
  readonly kind: KnowledgeSourceKind;
  readonly tier: KnowledgeSourceTier;
  readonly priority: number;
  readonly permission?: string;
  readonly status: KnowledgeSourceStatus;
  readonly provides: readonly KnowledgeDocumentKind[];
  readonly version?: string;
  readonly capabilityId?: string;
  readonly origin?: KnowledgeSourceOrigin;
}
```

---

## Versioning

| Field              | Role                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `schemaVersion`    | DTO wire format version — currently `1` (`KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION`)    |
| `frameworkVersion` | Knowledge & Discovery Framework release stamped at bootstrap via `recordFrameworkVersion()` |

Both fields are included from the first implementation. Clients must reject unknown `schemaVersion` values.

---

## Server API

| Function                                                            | Role                                     |
| ------------------------------------------------------------------- | ---------------------------------------- |
| `mapKnowledgeSourceRegistryDto(registry)`                           | Registry → unfiltered DTO                |
| `createEmptyKnowledgeSourceRegistryDto()`                           | Empty DTO with current `schemaVersion`   |
| `filterKnowledgeSourceRegistryDto(dto, adapter)`                    | Permission-filter sources                |
| `validateKnowledgeSourceRegistryDto(unknown)`                       | Validate payload before client hydration |
| `buildKnowledgeDiscoveryHydrationDiagnostics(registry, visibleDto)` | Registered vs filtered observability     |

All exported from `@apzhub/knowledge-discovery-framework/server`.

---

## Mapping rules

`mapKnowledgeSourceRegistryDto()`:

1. Reads `frameworkVersion` from `registry.getRegistryMetadata()`.
2. Maps `registry.listSources()` to `KnowledgeSourceDescriptorDto` entries.
3. Sorts by `priority` ascending, then `id` lexicographically.
4. Sets `schemaVersion` to `KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION`.

No provider data is included. No query execution.

---

## Permission filtering

Mirrors Action Framework AF-005 ([ADR-0023](../adr/ADR-0023-workbench-permission-adapter.md)):

```typescript
filterKnowledgeSourceRegistryDto(
  dto: KnowledgeSourceRegistryDto,
  permissionAdapter: WorkbenchPermissionAdapter,
): KnowledgeSourceRegistryDto;
```

- Delegates to `WorkbenchPermissionAdapter.filter()` — no inline permission evaluation.
- Sources without `permission` remain visible per adapter rules.
- `schemaVersion` and `frameworkVersion` are preserved on the filtered DTO.

---

## Validation

`validateKnowledgeSourceRegistryDto(dto: unknown)` returns structured errors:

| Check                                  | Error                              |
| -------------------------------------- | ---------------------------------- |
| Non-object payload                     | `VALIDATION`                       |
| Unsupported `schemaVersion`            | `VALIDATION` on `schemaVersion`    |
| `sources` not an array                 | `VALIDATION` on `sources`          |
| Invalid source descriptor              | `VALIDATION` per source            |
| Duplicate source ids                   | `DUPLICATE_ID`                     |
| Empty `frameworkVersion` when provided | `VALIDATION` on `frameworkVersion` |

Reuses `collectSourceValidationIssues` and `collectDuplicateSourceIssues` from the registry validation layer.

---

## Hydration diagnostics

```typescript
interface KnowledgeDiscoveryHydrationDiagnostics {
  readonly schemaVersion: 1;
  readonly registeredCount: number;
  readonly filteredCount: number;
  readonly frameworkVersion?: string;
  readonly builtinSourceCount: number;
  readonly manifestSourceCount: number;
  readonly builtinSourceIds: readonly string[];
  readonly manifestSourceIds: readonly string[];
  readonly manifestCapabilityCount: number;
  readonly manifestCapabilities: readonly string[];
  readonly activeSourceCount: number;
  readonly registeredProviderCount: number;
}
```

| Field                                        | Source                                                            |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `registeredCount`                            | Full registry (`registry.getDiagnostics().registeredSourceCount`) |
| `filteredCount`                              | Post-permission DTO source count                                  |
| `builtinSourceCount` / `manifestSourceCount` | From visible DTO `origin` field                                   |
| `registeredProviderCount`                    | Registry diagnostics — observability only                         |

---

## Server pipeline (integration boundary)

DF-005 implements the DTO layer only. Application wiring is deferred to DF-015:

```text
bootstrapKnowledgeRegistry()
        ↓
mapKnowledgeSourceRegistryDto(registry)     ← unfiltered
        ↓
filterKnowledgeSourceRegistryDto(dto, adapter)
        ↓
buildKnowledgeDiscoveryHydrationDiagnostics(registry, filteredDto)
        ↓
{ dto: filtered, diagnostics }            → client (DF-010+)
```

---

## Non-goals (DF-005)

| Out of scope                 | Deferred to |
| ---------------------------- | ----------- |
| `apps/web` wiring            | DF-015      |
| Client hydration hooks       | DF-010      |
| Provider `query()` execution | DF-007+     |
| Search / orchestration       | DF-006      |
| Persistence                  | M8/M9       |

---

## Tests

| Suite                 | Location                                            |
| --------------------- | --------------------------------------------------- |
| DTO mapping           | `map-knowledge-source-registry-dto.test.ts`         |
| Permission filter     | `filter-knowledge-source-registry-dto.test.ts`      |
| DTO validation        | `validate-knowledge-source-registry-dto.test.ts`    |
| Hydration diagnostics | `knowledge-discovery-hydration-diagnostics.test.ts` |

---

_SPR-005 Knowledge Source Registry DTO Specification — DF-005._
