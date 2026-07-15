# Mapping Transformers & Helpers (OSS-100-07)

**Package:** `@apzhub/integration-sdk` v0.7.0  
**Export:** `@apzhub/integration-sdk/mapping`

---

## ValueTransformer

Named, typed value coercions used by `FieldMapper` (via `FieldMapEntry.transformer`) or directly in custom `map` functions.

| Factory | Kind | Behaviour |
|---------|------|-----------|
| `createDateTransformer` | `date` | Date / epoch / ISO → ISO string; invalid → `undefined` |
| `createUuidTransformer` | `uuid` | Trim + lower-case; strict UUID regex by default |
| `createBooleanTransformer` | `boolean` | bool / 0·1 / yes·no strings |
| `createNumberTransformer` | `number` | Coerce number; invalid throws validation |
| `createStringTransformer` | `string` | Stringify |
| `createNullableTransformer` | `nullable` | Wrap another transformer; pass null/undefined |
| `createArrayTransformer` | `array` | Map items with an item transformer |
| `createEnumValueTransformer` | `enum` | Delegate to an `EnumMapper` |
| `createCustomTransformer` | `custom` | Arbitrary `transform` fn |

### Registry

```typescript
const transformers = createDefaultValueTransformerRegistry();
// or
const transformers = new ValueTransformerRegistry();
transformers.register(createDateTransformer());
```

Pass into `createMappingPipeline({ registry, transformers })` or `createFieldMapper({ fieldMaps, transformers })`.

---

## FieldMapper

Declarative path mapping:

```typescript
createFieldMapper({
  fieldMaps: [
    { source: "name", target: "title", required: true },
    { source: "created_at", target: "createdAt", transformer: "date" },
    { source: "meta.id", target: "externalId" }, // dotted paths
  ],
  transformers,
  omitUndefined: true,
});
```

Missing required fields → `integration.mapping.validation_failed`.

---

## EnumMapper

Explicit maps only. Unknown values never invent silent canonical values without policy.

| Policy | Behaviour |
|--------|-----------|
| `fail` | Throw `integration.mapping.enum_unknown` |
| `fallback` | Use `fallback` (required) |
| `passthrough` | Return string form of input as canonical |

```typescript
const priority = createEnumMapper<TaskPriority>({
  map: { urgent: "urgent", high: "high", none: "none" },
  unknownPolicy: "fallback",
  fallback: "none",
});

const bi = createBidirectionalEnumMapper<TaskPriority>({
  toCanonical: { … },
  toProvider: { … },
  unknownPolicy: "fail",
});
```

Plane/Zammad task, role, state, and priority mappers wrap these helpers; public mapper APIs unchanged.

---

## IdentityMapper

Provisional ID wire format (unchanged):

```text
{prefix}_{integrationSlug}_{native}
```

Examples: `task_plane_<uuid>`, `sreq_zammad_<id>`.

```typescript
import {
  PlaneIdentityMapper,
  ZammadIdentityMapper,
  createIdentityMapper,
  toProvisionalId,
  extractNativeId,
  hasProvisionalIdFormat,
} from "@apzhub/integration-sdk/mapping";

PlaneIdentityMapper.toProvisionalId("task", planeIssueId);
ZammadIdentityMapper.extractNativeId(canonicalId, "sreq");
```

**Does not** replace `EntityMappingStore` durable bindings. Provisional IDs are adapter-local wire format until platform mapping binds global IDs.

---

## RelationshipMapper

Maps related entity IDs (single or many) using provisional ID helpers:

```typescript
createRelationshipMapper("plane").mapIds(source, {
  relationName: "assignees",
  sourceField: "assignees",
  targetEntityType: "member",
  idPrefix: "member",
  many: true,
}, context);
```

---

## CollectionMapper & NestedMapper

```typescript
createCollectionMapper().map(items, {
  mapItem: (item, index, ctx) => mapItem(item),
  filter: (item) => item != null,
  skipNullish: true,
}, context);

createNestedMapper(); // path + nested MappingDefinition
executeNestedDefinition(definition, nestedInput, context);
```

---

## Related

- [MAPPING-FRAMEWORK.md](./MAPPING-FRAMEWORK.md)
- [MAPPING-PROFILES.md](./MAPPING-PROFILES.md)
- [MAPPING-MIGRATION.md](./MAPPING-MIGRATION.md)
