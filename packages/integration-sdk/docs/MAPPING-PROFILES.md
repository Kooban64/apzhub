# Mapping Profiles & Directions (OSS-100-07)

**Package:** `@apzhub/integration-sdk` v0.7.0  
**Export:** `@apzhub/integration-sdk/mapping`

---

## MappingProfile

A **profile** selects which rule set to use for an entity within a provider. Definitions are uniquely keyed by `(entityType, profile, direction)`.

| Profile           | Typical use                                                 |
| ----------------- | ----------------------------------------------------------- |
| `default`         | Standard read/write mapping (pipeline default when omitted) |
| `summary`         | Lightweight list/card projection                            |
| `detail`          | Full entity projection                                      |
| `create`          | Canonical → provider create body                            |
| `update`          | Canonical → provider update / partial body                  |
| `search`          | Search hit / query DTO shaping                              |
| `analytics`       | Aggregates / intelligence projections                       |
| _(custom string)_ | Adapter-specific extensions via branded `string & {}`       |

```typescript
createDefinition({
  id: "plane.task.create.write",
  entityType: "task",
  direction: "write",
  profile: "create", // not "default"
  map: (input) => mapTaskToPlaneCreateBody(input),
});
```

---

## MappingDirection

| Direction               | Intent                               |
| ----------------------- | ------------------------------------ |
| `provider_to_canonical` | Engine record → APZHUB canonical DTO |
| `canonical_to_provider` | Canonical → engine payload (generic) |
| `read_only`             | One-way read projection              |
| `write`                 | Create / full write to provider      |
| `partial_update`        | Patch / partial update body          |
| `relationship`          | Related-entity ID translation        |
| `collection`            | List/collection item mapping         |
| `nested`                | Nested object via nested definition  |

Capabilities (`supportsRelationships`, `supportsCollections`, `supportsNested`, `supportsPartialUpdate`) are derived from registered directions unless overridden on `createMappingProvider`.

---

## MappingDefinition

```typescript
interface MappingDefinition<TInput = unknown, TOutput = unknown> {
  readonly id: string;
  readonly entityType: string;
  readonly direction: MappingDirection;
  readonly profile: MappingProfile;
  readonly fieldMaps?: readonly FieldMapEntry[];
  readonly map?: (input: TInput, context: MappingContext) => TOutput | Promise<TOutput>;
  readonly description?: string;
}
```

**Executable contract:** at least one of `map` or non-empty `fieldMaps` must be present. Prefer `createDefinition` for `map`-based rules; use `fieldMaps` for declarative path mapping.

---

## MappingContext

```typescript
interface MappingContext {
  readonly tenantId: string;
  readonly correlationId?: string;
  readonly integrationId?: string;
  readonly extras?: Readonly<Record<string, unknown>>;
}
```

Always pass `tenantId`. Prefer a correlation ID so errors and metrics remain traceable end-to-end (010 / 012).

---

## MappingResult

```typescript
interface MappingResult<T = unknown> {
  readonly ok: boolean;
  readonly value?: T;
  readonly error?: MappingError;
  readonly profile: MappingProfile;
  readonly direction: MappingDirection;
  readonly entityType: string;
  readonly durationMs: number;
  readonly providerId: string;
}
```

Check `ok` before reading `value`. Pipeline failures populate `error` instead of throwing.

---

## Plane / Zammad profile usage (examples)

| Provider                | Entity                  | Profile   | Direction               |
| ----------------------- | ----------------------- | --------- | ----------------------- |
| `plane.entity-mapping`  | `task`                  | `default` | `provider_to_canonical` |
| `plane.entity-mapping`  | `task`                  | `create`  | `write`                 |
| `plane.entity-mapping`  | `task`                  | `update`  | `partial_update`        |
| `zammad.entity-mapping` | `support_ticket`        | `default` | `provider_to_canonical` |
| `zammad.entity-mapping` | `support_ticket_status` | `create`  | `write`                 |

Public mapper functions remain the implementation; definitions wrap them for registry discovery and optional pipeline execution.

---

## Related

- [MAPPING-FRAMEWORK.md](./MAPPING-FRAMEWORK.md)
- [MAPPING-REGISTRY.md](./MAPPING-REGISTRY.md)
- [MAPPING-TRANSFORMERS.md](./MAPPING-TRANSFORMERS.md)
