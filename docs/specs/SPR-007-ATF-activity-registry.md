# SPR-007 — Activity Registry

> **Story:** AT-003  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented — `DefaultActivityRegistry` (AT-003)  
> **Authority:** [Activity architecture](./SPR-007-ATF-activity-architecture.md) · [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) · [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)

---

## 1. Purpose

Define the **DefaultActivityRegistry** — authoritative in-memory metadata registry for activity type definitions. Registration and validation only; no mapping, Event Bus subscription, Activity Service writes, or persistence.

The Activity Registry stores **type descriptors**, not activity instances. Instances live in ActivitySessionStore (AT-007 / AT-008).

---

## 2. Components (planned)

| Component                     | Path                                                  | Role                            |
| ----------------------------- | ----------------------------------------------------- | ------------------------------- |
| `DefaultActivityRegistry`     | `src/server/registry/default-activity-registry.ts`    | Register, validate, diagnostics |
| `validateActivityDescriptor`  | `src/server/registry/validate-activity-descriptor.ts` | Descriptor validation           |
| `buildActivityMetadata`       | `src/server/registry/build-activity-metadata.ts`      | Metadata projection             |
| `PlaceholderActivityRegistry` | `src/server/registry/placeholders.ts`                 | Test injection only             |

---

## 3. ActivityRegistry contract

```typescript
interface ActivityRegistry {
  register(descriptor: ActivityDescriptor): void;
  registerMany(descriptors: readonly ActivityDescriptor[]): void;
  registerManyAtomic(
    descriptors: readonly ActivityDescriptor[],
  ): ActivityBatchRegistrationResult;
  replace(descriptor: ActivityDescriptor): void;
  has(activityTypeId: string): boolean;
  get(activityTypeId: string): ActivityDescriptor | undefined;
  getMetadata(activityTypeId: string): ActivityMetadata | undefined;
  list(): readonly ActivityDescriptor[];
  listMetadata(): readonly ActivityMetadata[];
  listByEventPattern(eventPattern: string): readonly ActivityDescriptor[];
  listByCategory(category: ActivityCategory): readonly ActivityDescriptor[];
  getRegistryMetadata(): ActivityRegistryMetadata;
  getDiagnostics(): ActivityRegistryDiagnostics;
  recordManifestCapabilities(capabilityIds: readonly string[]): void;
  recordPlatformCatalogue(version: string): void;
  recordFrameworkVersion(version: string): void;
  clear(): void;
}
```

---

## 4. ActivityDescriptor

| Field                | Required | Description                                                       |
| -------------------- | -------- | ----------------------------------------------------------------- |
| `activityTypeId`     | ✅       | Stable type id (lowercase dot notation)                           |
| `sourceEventPattern` | ✅       | Event id or prefix pattern (metadata only — no subscription)      |
| `category`           | ✅       | Activity taxonomy category (AT-001)                               |
| `timelineScopes`     | ✅       | Non-empty array of scope ids                                      |
| `templateRef`        | ✅       | Presentation template key                                         |
| `version`            | ✅       | Type definition semver                                            |
| `severity`           | Optional | Default severity: `info` · `success` · `warning` · `error`        |
| `iconRef`            | Optional | Lucide icon key                                                   |
| `permissionKeys`     | Optional | RBAC gates for future client filter                               |
| `retentionHint`      | Optional | `session` · `short` · `standard` · `extended` (presentation only) |
| `status`             | Optional | `active` · `planned` · `disabled`                                 |
| `label`              | Optional | Display name                                                      |
| `sourceCapability`   | Optional | Declaring capability id                                           |
| `schemaVersion`      | Optional | Defaults to `version`                                             |
| `visibility`         | Optional | `public` · `internal` · `restricted`                              |
| `stability`          | Optional | `stable` · `experimental` · `deprecated`                          |
| `description`        | Optional | Human-readable summary                                            |
| `tags`               | Optional | Classification tags                                               |
| `source`             | Optional | `builtin` · `manifest`                                            |

---

## 5. Activity categories (AT-001)

`user` · `team` · `workspace` · `system` · `security` · `integration` · `capability`

---

## 6. Timeline scope references

Descriptor `timelineScopes` must reference locked scope ids:

`timeline.personal` · `timeline.team` · `timeline.organization` · `timeline.system`

Validation does **not** require Timeline Registry entries at register time (bootstrap order handles catalogue first). Diagnostics report orphaned scope references.

---

## 7. Validation rules

`validateActivityDescriptor()` enforces:

| Rule                                               | Error code              |
| -------------------------------------------------- | ----------------------- |
| `activityTypeId` non-empty, lowercase dot notation | `INVALID_ID`            |
| `sourceEventPattern` non-empty                     | `INVALID_EVENT_PATTERN` |
| `category` in allowed set                          | `INVALID_CATEGORY`      |
| `timelineScopes` non-empty array                   | `INVALID_SCOPES`        |
| `templateRef` non-empty                            | `INVALID_TEMPLATE`      |
| `version` valid semver                             | `INVALID_VERSION`       |
| `severity` in allowed set when present             | `INVALID_SEVERITY`      |
| `status` in allowed set when present               | `INVALID_STATUS`        |
| Duplicate `activityTypeId` within atomic batch     | `DUPLICATE_ID`          |

Inactive types (`status: disabled` or `planned`) are registered but excluded from mapper matching.

---

## 8. Registration semantics

- Single `register()` throws on duplicate or validation failure
- `registerMany()` validates all then registers — throws on first duplicate
- `registerManyAtomic()` — all-or-nothing; registry unchanged on failure
- `replace()` updates existing type by `activityTypeId`
- Retrieval APIs return frozen defensive copies
- `listByEventPattern()` supports exact match and prefix patterns (`capability.action.`)

---

## 9. ActivityMetadata projection

Lightweight read model for diagnostics and DTO mapping:

| Field                | Source                 |
| -------------------- | ---------------------- |
| `activityTypeId`     | Descriptor             |
| `category`           | Descriptor             |
| `timelineScopes`     | Descriptor             |
| `sourceEventPattern` | Descriptor             |
| `status`             | Descriptor             |
| `source`             | `builtin` · `manifest` |
| `version`            | Descriptor             |

---

## 10. Diagnostics

`getDiagnostics()` returns `ActivityRegistryDiagnostics`:

| Field                      | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `status`                   | `empty` · `ready` · `degraded`                 |
| `totalCount`               | Registered activity types                      |
| `activeCount`              | Types with `status: active`                    |
| `platformCount`            | Built-in catalogue types                       |
| `manifestCount`            | Manifest-derived types                         |
| `categoryCounts`           | Count by category                              |
| `scopeCounts`              | Count by timeline scope reference              |
| `conflicts`                | Duplicate or validation issues from last batch |
| `frameworkVersion`         | Package version stamp                          |
| `platformCatalogueVersion` | Catalogue version                              |
| `manifestCapabilityIds`    | Capability ids from last bootstrap             |

---

## 11. Dependency injection

`createActivityTimelineContext()` defaults to `createDefaultActivityRegistry()` (AT-003).

Activity mapper and service remain placeholders until AT-007 / AT-008.

---

## 12. ActivityDocument immutability (locked)

**ActivityDocument is immutable.** User state (read, pinned, hidden, archived, etc.) belongs to future session/user state models — not the ActivityDocument itself. The registry stores **type descriptors** only; instances are created by Activity Mapping (AT-007).

---

## 13. Boundaries (must not)

| Rule                          | AT-003                          |
| ----------------------------- | ------------------------------- |
| Map events to ActivityItems   | ❌                              |
| Subscribe to Event Bus        | ❌                              |
| Publish events                | ❌                              |
| Write to ActivitySessionStore | ❌                              |
| Persist activity instances    | ❌                              |
| Render UI                     | ❌                              |
| Filter permissions inline     | ❌ (delegated to AT-006 filter) |

---

## 13. Related

- [Activity metadata](./SPR-007-ATF-activity-metadata.md) — metadata projection (AT-003)
- [Activity document model](./SPR-007-ATF-activity-document.md) — ActivityItem instance model
- [Activity bootstrap](./SPR-007-ATF-activity-bootstrap.md) — catalogue + manifest registration
- [Activity manifest](./SPR-007-ATF-activity-manifest.md) — manifest schema

---

_SPR-007 Activity Registry — AT-003 specification._
