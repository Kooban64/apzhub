# Registry Hydration (Server DTO Layer)

> **Package:** `@apzhub/activity-timeline-framework`  
> **Story:** AT-006  
> **Status:** Implemented — server DTO layer only

---

## Purpose

Server-facing Activity and Timeline Registry DTOs project bootstrapped registries into versioned, permission-filtered wire formats for client hydration (AT-009). No Event Bus, mapper, Activity Service, timeline generation, or UI.

---

## Pipeline

```text
ActivityRegistry (bootstrapped)
        ↓ mapActivityRegistryDto()
ActivityRegistryDto (full)
        ↓ filterActivityRegistryDto(permissionAdapter)
Permission-filtered ActivityRegistryDto

TimelineRegistry (bootstrapped)
        ↓ mapTimelineRegistryDto()
TimelineRegistryDto (full)
        ↓ filterTimelineRegistryDto(permissionAdapter)
Permission-filtered TimelineRegistryDto
        ↓ build*HydrationDiagnostics(registry, filteredDto)
Hydration diagnostics snapshot
```

---

## Versioning

| Constant                               | Value |
| -------------------------------------- | ----- |
| `ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION` | `1`   |
| `TIMELINE_REGISTRY_DTO_SCHEMA_VERSION` | `1`   |

Each DTO includes `schemaVersion`, optional `frameworkVersion` (platform catalogue stamp), and descriptor arrays (`types` / `timelines`).

---

## Permission model

Filtering delegates to `WorkbenchPermissionAdapter` via `permissionKeys` on each descriptor. The Activity Framework does not evaluate permissions inline (ADR-0023).

Items without `permissionKeys` remain visible per adapter rules for ungated entries.

---

## Hydration diagnostics

`buildActivityRegistryHydrationDiagnostics()` and `buildTimelineRegistryHydrationDiagnostics()` accept an optional filtered DTO to report:

| Field                   | Description                          |
| ----------------------- | ------------------------------------ |
| `registeredCount`       | Total registered definitions         |
| `filteredCount`         | Count after permission filter        |
| `builtinCount`          | Platform catalogue definitions       |
| `manifestCount`         | Capability manifest definitions      |
| `filteredBuiltinCount`  | Builtin count in filtered DTO        |
| `filteredManifestCount` | Manifest count in filtered DTO       |
| `frameworkVersion`      | Platform catalogue / framework stamp |
| `schemaVersion`         | DTO schema version                   |

---

## Server exports

```typescript
import {
  mapActivityRegistryDto,
  filterActivityRegistryDto,
  validateActivityRegistryDto,
  mapTimelineRegistryDto,
  filterTimelineRegistryDto,
  validateTimelineRegistryDto,
  buildActivityRegistryHydrationDiagnostics,
  buildTimelineRegistryHydrationDiagnostics,
  ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
  TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
} from "@apzhub/activity-timeline-framework/server";
```

---

## Boundaries (AT-006)

| Does                          | Does not                     |
| ----------------------------- | ---------------------------- |
| Map registries to DTOs        | Subscribe to Event Bus       |
| Validate DTO payloads         | Run Activity Mapper          |
| Permission-filter via adapter | Populate Activity Service    |
| Report hydration diagnostics  | Render UI or React providers |

---

_Registry Hydration — AT-006 server DTO layer._
