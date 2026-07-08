# SPR-007 — Timeline Registry

> **Story:** AT-004  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented — `DefaultTimelineRegistry` (AT-004)  
> **Authority:** [Timeline definition](./SPR-007-ATF-timeline-definition.md) · [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md)

---

## 1. Purpose

Define **DefaultTimelineRegistry** — authoritative in-memory metadata registry for **Timeline Definitions**.

> **Architectural rule:** The Timeline Registry stores timeline definitions. It does **not** store activities, timeline history, or generate timelines. Timeline entries are produced later by Activity Service.

---

## 2. Components (implemented)

| Component                        | Path                                            | Role                            |
| -------------------------------- | ----------------------------------------------- | ------------------------------- |
| `DefaultTimelineRegistry`        | `src/timeline/default-timeline-registry.ts`     | Register, validate, diagnostics |
| `validateTimelineDefinition`     | `src/timeline/validate-timeline-definition.ts`  | Definition validation           |
| `buildTimelineMetadata`          | `src/timeline/build-timeline-metadata.ts`       | Metadata projection             |
| `platform-timeline-catalogue.ts` | `src/timeline/platform-timeline-catalogue.ts`   | Built-in platform definitions   |
| `PlaceholderTimelineRegistry`    | `src/timeline/placeholder-timeline-registry.ts` | Test injection only             |

---

## 3. TimelineRegistry contract

```typescript
interface TimelineRegistry {
  register(definition: TimelineDefinition): void;
  registerMany(definitions: readonly TimelineDefinition[]): void;
  registerManyAtomic(
    definitions: readonly TimelineDefinition[],
  ): TimelineBatchRegistrationResult;
  replace(definition: TimelineDefinition): void;
  has(timelineId: string): boolean;
  get(timelineId: string): TimelineDefinition | undefined;
  list(): readonly TimelineDefinition[];
  clear(): void;
  getMetadata(timelineId: string): TimelineMetadata | undefined;
  listMetadata(): readonly TimelineMetadata[];
  getRegistryMetadata(): TimelineRegistryMetadata;
  getDiagnostics(): TimelineRegistryDiagnostics;
  recordManifestCapabilities(capabilityIds: readonly string[]): void;
  recordPlatformCatalogue(version: string): void;
  recordFrameworkVersion(version: string): void;
}
```

---

## 4. Built-in platform definitions

| timelineId              | scope                   | status    | order |
| ----------------------- | ----------------------- | --------- | ----- |
| `timeline.personal`     | `timeline.personal`     | `active`  | 10    |
| `timeline.team`         | `timeline.team`         | `planned` | 20    |
| `timeline.organization` | `timeline.organization` | `planned` | 30    |
| `timeline.system`       | `timeline.system`       | `planned` | 40    |

Registered via `registerPlatformTimelineCatalogue()` or `createDefaultTimelineRegistryWithPlatformCatalogue()`.

---

## 5. Validation rules

| Rule                                                                  | Field        |
| --------------------------------------------------------------------- | ------------ |
| Lowercase dot notation id                                             | `timelineId` |
| Reserved scope id                                                     | `scope`      |
| Non-empty label                                                       | `label`      |
| Semver                                                                | `version`    |
| Finite number                                                         | `order`      |
| Valid visibility / stability / status / source when present           | enums        |
| Valid activity categories when `supportedActivityCategories` provided | categories   |

---

## 6. Errors

| Error                             | When                      |
| --------------------------------- | ------------------------- |
| `TimelineRegistryDuplicateError`  | Duplicate `timelineId`    |
| `TimelineRegistryValidationError` | Invalid definition        |
| `TimelineRegistryNotFoundError`   | `replace()` on missing id |

---

## 7. Immutability

Definitions are **`Object.freeze`d** on registration. `get()` and `list()` return defensive frozen copies.

---

## 8. Dependency injection

`createActivityTimelineContext()` defaults to:

- `createDefaultActivityRegistry()` — empty activity registry
- `createDefaultTimelineRegistryWithPlatformCatalogue()` — platform timeline definitions

Exposes `timelineRegistry` and `timelineDiagnostics` on `ActivityContext`.

---

## 9. Boundaries (must not)

| Rule                     | AT-004      |
| ------------------------ | ----------- |
| Store activity instances | ❌          |
| Store timeline history   | ❌          |
| Generate timelines       | ❌          |
| Map events               | ❌          |
| Subscribe to Event Bus   | ❌          |
| Hydrate DTOs             | ❌ (AT-006) |
| Render UI                | ❌          |

---

## 10. Related

- [Timeline definition](./SPR-007-ATF-timeline-definition.md)
- [Timeline model](./SPR-007-ATF-timeline-model.md)
- [Activity Registry](./SPR-007-ATF-activity-registry.md)

---

_SPR-007 Timeline Registry — AT-004 implemented._
