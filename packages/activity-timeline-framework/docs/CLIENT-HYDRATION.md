# Client Hydration (AT-009)

> **Package:** `@apzhub/activity-timeline-framework`  
> **Story:** AT-009  
> **Status:** Implemented — metadata registries only

---

## Purpose

Client-side Activity and Timeline Registry hydration from permission-filtered server DTOs. Produces immutable read-only client registries for React consumers. No registration, mapper execution, Activity Service writes, ActivityDocument hydration, or Event Bus interaction.

---

## Pipeline

```text
Server bootstrap → ActivityTimelineHydrationBundle
        ↓ filterActivityRegistryDto() + filterTimelineRegistryDto() [server — AT-006]
Permission-filtered bundle
        ↓ validateActivityTimelineHydrationBundle()
        ↓ createActivityTimelineContextFromDto()
ReadOnlyActivityRegistry + ReadOnlyTimelineRegistry
        ↓ ActivityTimelineProvider
useActivityRegistry() · useTimelineRegistry() · useActivityTimelineContext()
```

Synchronisation mode: `CLIENT_REGISTRY_HYDRATION_SYNC_STATE.mode = "hydration"`.

---

## Bundle shape

```typescript
interface ActivityTimelineHydrationBundle {
  readonly schemaVersion: 1;
  readonly frameworkVersion?: string;
  readonly activityRegistry: ActivityRegistryDto;
  readonly timelineRegistry: TimelineRegistryDto;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}
```

ActivityDocuments are **not** included — Activity Service remains server/runtime owned.

---

## Client factories

| API                                         | Role                           |
| ------------------------------------------- | ------------------------------ |
| `createActivityTimelineContextFromDto()`    | Combined hydration entry point |
| `createActivityRegistryFromDto()`           | Activity type index            |
| `createTimelineRegistryFromDto()`           | Timeline definition index      |
| `validateActivityTimelineHydrationBundle()` | Bundle shape validation        |

---

## Read-only client registries

| Type                       | Methods                                               |
| -------------------------- | ----------------------------------------------------- |
| `ReadOnlyActivityRegistry` | `has`, `get`, `list`, `getDiagnostics`                |
| `ReadOnlyTimelineRegistry` | `has`, `get`, `list`, `listByScope`, `getDiagnostics` |

Client registries **must not** expose `register`, `registerMany`, or `clear`.

---

## Invalid DTO handling

Validation failures produce:

- `ok: false` from `createActivityTimelineContextFromDto()`
- Invalid client registry shells for **both** registries (no partial hydration)
- Structured issue arrays (`bundleErrors`, `activityErrors`, `timelineErrors`)

---

## Combined diagnostics

`ActivityTimelineHydrationDiagnostics`:

| Field                     | Description                      |
| ------------------------- | -------------------------------- |
| `hydrationStatus`         | `empty` · `hydrated` · `invalid` |
| `activityRegistryStatus`  | Activity client registry status  |
| `timelineRegistryStatus`  | Timeline client registry status  |
| `schemaVersion`           | Bundle schema version (`1`)      |
| `frameworkVersion`        | Platform catalogue stamp         |
| `activityTypeCount`       | Hydrated activity type count     |
| `timelineDefinitionCount` | Hydrated timeline count          |
| `hydratedAt`              | ISO hydration timestamp          |
| `synchronisation`         | Hydration sync metadata          |

Per-registry diagnostics: `ClientActivityRegistryDiagnostics`, `ClientTimelineRegistryDiagnostics`.

---

## Client exports

```typescript
import {
  createActivityRegistryFromDto,
  createTimelineRegistryFromDto,
  createActivityTimelineContextFromDto,
  CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
} from "@apzhub/activity-timeline-framework/react";
```

---

## Boundaries (AT-009)

| Does                                     | Does not                    |
| ---------------------------------------- | --------------------------- |
| Hydrate metadata registries from DTOs    | Hydrate ActivityDocuments   |
| Validate DTO payloads at client boundary | Wire Event Bus              |
| Expose React providers and hooks         | Render timeline UI          |
| Report hydration diagnostics             | Mount in apps/web           |
| Deep-freeze hydrated entries             | Evaluate permissions inline |

---

_Client Hydration — AT-009._
