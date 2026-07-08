# SPR-007 — Activity Metadata

> **Story:** AT-003  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented — `DefaultActivityRegistry` metadata projection  
> **Authority:** [Activity Registry](./SPR-007-ATF-activity-registry.md) · [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md)

---

## 1. Purpose

Define **ActivityMetadata** — the registry read model projected from frozen `ActivityDescriptor` entries. Metadata supports diagnostics, future DTO mapping (AT-006), and bootstrap health reporting.

Metadata projection is **read-only**. It does not map events, store activity instances, or filter permissions inline.

---

## 2. Projection API

| Function                                 | Location                              | Role                         |
| ---------------------------------------- | ------------------------------------- | ---------------------------- |
| `buildActivityMetadata(descriptor)`      | `registry/build-activity-metadata.ts` | Single descriptor → metadata |
| `buildActivityMetadataList(descriptors)` | same                                  | Batch projection             |
| `getMetadata(activityTypeId)`            | `DefaultActivityRegistry`             | Lookup by id                 |
| `listMetadata()`                         | `DefaultActivityRegistry`             | All registered types         |
| `getRegistryMetadata()`                  | `DefaultActivityRegistry`             | Bootstrap snapshot           |

---

## 3. ActivityMetadata fields

| Field                | Source                   | Default    |
| -------------------- | ------------------------ | ---------- |
| `activityTypeId`     | Descriptor               | —          |
| `version`            | Descriptor               | —          |
| `category`           | Descriptor               | —          |
| `sourceEventPattern` | Descriptor               | —          |
| `timelineScopes`     | Descriptor (frozen copy) | —          |
| `templateRef`        | Descriptor               | —          |
| `sourceCapability`   | Descriptor               | optional   |
| `schemaVersion`      | Descriptor               | `version`  |
| `visibility`         | Descriptor               | `public`   |
| `stability`          | Descriptor               | `stable`   |
| `status`             | Descriptor               | `active`   |
| `source`             | Descriptor               | `manifest` |
| `label`              | Descriptor               | optional   |
| `description`        | Descriptor               | optional   |
| `tags`               | Descriptor               | `[]`       |
| `diagnostics`        | Derived                  | see §4     |

All metadata objects are **`Object.freeze`d** at projection time.

---

## 4. ActivityEntryDiagnostics

Per-type derived diagnostics embedded in metadata:

| Field                  | Description                     |
| ---------------------- | ------------------------------- |
| `validationIssueCount` | Always `0` for registered types |
| `timelineScopeCount`   | Length of `timelineScopes`      |
| `message`              | Optional status hint            |

| Descriptor status | Message                       |
| ----------------- | ----------------------------- |
| `planned`         | Mapping deferred until active |
| `disabled`        | Excluded from mapper matching |
| `active`          | undefined                     |

---

## 5. ActivityRegistryMetadata

Aggregate snapshot from `getRegistryMetadata()`:

| Field                      | Description                        |
| -------------------------- | ---------------------------------- |
| `manifestCapabilityCount`  | Last recorded capability id count  |
| `frameworkVersion`         | Package version stamp              |
| `platformCatalogueVersion` | Platform catalogue version         |
| `activityMetadata`         | Frozen array from `listMetadata()` |

---

## 6. ActivityRegistryDiagnostics

Registry-level diagnostics from `getDiagnostics()`:

| Field                         | Description                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| `status`                      | `empty` · `ready` · `degraded` · `scaffold` (placeholder only) |
| `registeredActivityTypeCount` | Total registered types                                         |
| `activeCount`                 | Types with `status: active`                                    |
| `platformCount`               | Types with `source: builtin`                                   |
| `manifestCount`               | Types with `source: manifest`                                  |
| `activityTypeIds`             | Sorted registered ids                                          |
| `categoryCounts`              | Count by category                                              |
| `scopeCounts`                 | Count by timeline scope reference                              |
| `manifestCapabilityIds`       | Last bootstrap capability ids                                  |
| `platformCatalogueVersion`    | Catalogue version                                              |
| `frameworkVersion`            | Framework version                                              |
| `issues`                      | Last batch registration issues (empty when healthy)            |
| `message`                     | Human-readable status                                          |

---

## 7. Permissions

Metadata exposes `visibility` and future `permissionKeys` on descriptors. **The registry does not evaluate RBAC.** Permission filtering is delegated to the platform Permission Adapter at DTO hydration (AT-006).

---

## 8. Related

- [Activity Registry](./SPR-007-ATF-activity-registry.md)
- [Activity document model](./SPR-007-ATF-activity-document.md)
- [Registry DTO spec](./SPR-007-ATF-activity-registry-dto.md) — AT-006

---

_SPR-007 Activity Metadata — AT-003 implemented._
