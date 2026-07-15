# Mapping Migration Guide (OSS-100-07)

**Package:** `@apzhub/integration-sdk` v0.7.0  
**Audience:** Adapter authors (Plane, Zammad, future engines)

---

## What changed

| Before | After |
|--------|-------|
| Ad-hoc provisional ID string concat in adapter helpers | Shared `IdentityMapper` / `toProvisionalId` |
| Inline enum tables without shared policy | `EnumMapper` / `createBidirectionalEnumMapper` |
| No registry of mapping capabilities | `MappingProvider` + `MappingRegistry` |
| No shared execution / diagnostics | `MappingPipeline` + metrics / diagnostics |
| — | Export `@apzhub/integration-sdk/mapping` |

**Unchanged:**

- Public adapter APIs and mapper function signatures
- Plane / Zammad package versions (**0.6.0**)
- Provisional ID format `{prefix}_{plane|zammad}_{native}`
- Platform `EntityMappingStore` / `MappingOrchestrator` (ADR-0049) — **not** moved or duplicated

---

## Plane migration pattern

1. Import SDK helpers in mappers (`IdentityMapper`, `EnumMapper`).
2. Keep public `mapPlane*` / `map*ToPlane*` functions as call-site source of truth.
3. Wrap selected entities in `createPlaneMappingProvider` definitions.
4. On adapter init:

```typescript
this.mappingRegistry = createPlaneMappingRegistry();
```

Optional pipeline:

```typescript
import { createPlaneMappingPipeline } from "./mappers/plane-mapping-registry";

const pipeline = createPlaneMappingPipeline(this.mappingRegistry);
```

Provider id: `plane.entity-mapping`.

---

## Zammad migration pattern

Same structure:

```typescript
this.mappingRegistry = createZammadMappingRegistry();
```

Provider id: `zammad.entity-mapping`. Status/priority enums use SDK `EnumMapper` wrappers; provisional Support IDs use `ZammadIdentityMapper`.

---

## Parity checklist

When migrating or adding an adapter:

- [ ] Depend on `@apzhub/integration-sdk` ≥ **0.7.0**
- [ ] Use `IdentityMapper` / `toProvisionalId` — do not change wire format
- [ ] Use `EnumMapper` with explicit `unknownPolicy` — no silent invented enums
- [ ] Register a `MappingProvider` via `createMappingRegistry` on adapter init
- [ ] Keep public mapper APIs stable for existing call sites
- [ ] Do **not** import or duplicate `EntityMappingStore` inside the adapter
- [ ] Do not bump adapter major/minor solely for this migration (Plane/Zammad stayed **0.6.0**)
- [ ] Confirm regression suites (Wave 1 / Wave 2 / Support vertical / platform mapping) still pass

---

## Choosing the API

| Need | Use |
|------|-----|
| Call-site mapping (existing) | Keep public mapper functions |
| Discovery / diagnostics / pipeline | `MappingRegistry` + `MappingPipeline` |
| Provisional IDs | `IdentityMapper` / `PlaneIdentityMapper` / `ZammadIdentityMapper` |
| Enum translation | `createEnumMapper` / `createBidirectionalEnumMapper` |
| Declarative field maps | `FieldMapper` + `ValueTransformer` |
| Durable global IDs | Platform `EntityMappingStore` only (not SDK) |
| Unit tests without vendor | `createMockMappingProvider` |

---

## Out of scope (do not migrate here)

- Webhook / polling contracts → **OSS-100-08**
- Moving EntityMappingStore into the SDK
- Mapping admin UI
- PostgreSQL schema changes for platform mapping tables
- Changing canonical DTO contracts

---

## Related

- [MAPPING-FRAMEWORK.md](./MAPPING-FRAMEWORK.md)
- [MAPPING-REGISTRY.md](./MAPPING-REGISTRY.md)
- [OSS-100-07 Completion Report](../../../docs/sprint/OSS-100-07-completion-report.md)
- [HTTP Transport Migration](./TRANSPORT-MIGRATION.md) (OSS-100-06 pattern)
