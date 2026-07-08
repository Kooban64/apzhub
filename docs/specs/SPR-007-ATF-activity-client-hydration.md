# SPR-007 — Activity Client Hydration

> **Story:** AT-009  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented (AT-009)  
> **Authority:** [Activity Registry DTO](./SPR-007-ATF-activity-registry-dto.md) · [KDF client hydration](./SPR-006-ENF-notification-client-hydration.md) (EN-010 pattern) · [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)

---

## 1. Purpose

Define **client-side Activity and Timeline Registry hydration** from permission-filtered server DTOs. Read-only index — no registration, mappers, Activity Service writes, or Event Bus interaction.

Client hydration delivers read-only metadata registries to React providers. Activity Service remains server/runtime owned — no ActivityDocument hydration in AT-009.

---

## 2. Hydration pipeline

```text
Server bootstrap → ActivityTimelineHydrationBundle (metadata only)
        ↓ filterActivityRegistryDto() + filterTimelineRegistryDto()
Permission-filtered bundle
        ↓ createActivityTimelineContextFromDto()
ReadOnlyActivityRegistry + ReadOnlyTimelineRegistry
        ↓ ActivityTimelineProvider
useActivityRegistry() · useTimelineRegistry() · useActivityTimelineContext()
```

Synchronisation mode: `CLIENT_REGISTRY_HYDRATION_SYNC_STATE.mode = "hydration"`.

---

## 3. Client registries

| API                                      | Role                                          |
| ---------------------------------------- | --------------------------------------------- |
| `createActivityTimelineContextFromDto()` | Hydration entry point                         |
| `createActivityRegistryFromDto()`        | Activity type index                           |
| `createTimelineRegistryFromDto()`        | Timeline scope index                          |
| `ReadOnlyActivityRegistry`               | `has`, `get`, `list`, `getDiagnostics`        |
| `ReadOnlyTimelineRegistry`               | `has`, `get`, `listByScope`, `getDiagnostics` |
| `ClientActivityRegistry`                 | Default activity implementation               |
| `ClientTimelineRegistry`                 | Default timeline implementation               |
| `createEmptyClientActivityRegistry()`    | Empty shell                                   |
| `createInvalidClientActivityRegistry()`  | Invalid DTO shell                             |

Client registries **must not** expose `register`, `registerMany`, or `clear`.

---

## 4. ActivityTimelineProvider

Root React provider for Activity & Timeline Framework client state.

```typescript
interface ActivityTimelineProviderProps {
  readonly bundle: ActivityTimelineHydrationBundle;
  readonly children: React.ReactNode;
}

<ActivityTimelineProvider bundle={hydrationBundle}>
  <App />
</ActivityTimelineProvider>
```

Provider responsibilities:

1. Validate bundle at mount boundary
2. Construct read-only client registries from DTOs
3. Expose context to descendant hooks
4. Report hydration diagnostics in dev builds

**Must not:** subscribe to Event Bus, run mappers, hydrate ActivityDocuments, or mutate server registries.

---

## 5. Hooks

### 5.1 useActivityRegistry()

```typescript
function useActivityRegistry(): ReadOnlyActivityRegistry;
```

Returns hydrated activity type index. Throws outside `ActivityTimelineProvider`.

| Method                | Behaviour                       |
| --------------------- | ------------------------------- |
| `has(activityTypeId)` | Type registered in client index |
| `get(activityTypeId)` | Descriptor DTO or undefined     |
| `list()`              | All hydrated types              |
| `getDiagnostics()`    | Client hydration diagnostics    |

### 5.2 useTimelineRegistry()

```typescript
function useTimelineRegistry(): ReadOnlyTimelineRegistry;
```

Returns hydrated timeline scope index.

| Method               | Behaviour                    |
| -------------------- | ---------------------------- |
| `has(timelineId)`    | Timeline registered          |
| `get(timelineId)`    | Timeline descriptor DTO      |
| `list()`             | All hydrated timelines       |
| `listByScope(scope)` | Timelines for scope          |
| `getDiagnostics()`   | Client hydration diagnostics |

### 5.3 useActivityTimelineContext()

Returns the full hydrated client context including combined diagnostics. Throws outside `ActivityTimelineProvider`.

### 5.4 useActivityService()

Implemented in AT-010 — see [REACT-SERVICE-API.md](../../packages/activity-timeline-framework/docs/REACT-SERVICE-API.md). Consumes `ActivityTimelineService` through `ActivityTimelineServiceProvider`.

### 5.5 useActivityPresentation()

See [SPR-007-ATF-activity-presentation-layer.md](./SPR-007-ATF-activity-presentation-layer.md). Mandatory public API for view models and grouping.

---

## 6. Read-only client rules

| Rule                            | Enforcement                                  |
| ------------------------------- | -------------------------------------------- |
| No client-side registration     | Registry APIs are read-only                  |
| No Event Bus import             | Lint + export boundary                       |
| No mapper execution             | Server-only                                  |
| No activity creation            | Client does not call `addActivities()`       |
| No permission evaluation inline | DTO pre-filtered server-side                 |
| No server path in client bundle | `/server` not imported in `/react` consumers |
| Immutable DTOs                  | `Object.freeze` at hydration boundary        |

Violations are architectural defects per [ADR-0035](../adr/ADR-0035-activity-execution-routing.md).

---

## 7. Client diagnostics

### 7.1 ClientActivityRegistryDiagnostics

| Field                                       | Description                      |
| ------------------------------------------- | -------------------------------- |
| `status`                                    | `empty` · `hydrated` · `invalid` |
| `schemaVersion`                             | DTO schema version               |
| `frameworkVersion`                          | Platform version stamp           |
| `typeCount` / `activeTypeCount`             | Activity type totals             |
| `platformTypeCount` / `capabilityTypeCount` | Source split                     |
| `hydratedAt`                                | ISO hydration timestamp          |
| `source`                                    | Always `"server-dto"`            |
| `synchronisation`                           | Hydration sync metadata          |

### 7.2 ClientTimelineRegistryDiagnostics

| Field                                   | Description                      |
| --------------------------------------- | -------------------------------- |
| `status`                                | `empty` · `hydrated` · `invalid` |
| `timelineCount` / `activeTimelineCount` | Timeline totals                  |
| `scopeCounts`                           | Count by scope                   |
| `hydratedAt`                            | ISO hydration timestamp          |

Server-side `ActivityTimelineHydrationDiagnostics` tracks registered vs filtered counts for health endpoints.

---

## 8. Invalid DTO handling

Validation failures produce:

- `ok: false` from `createActivityTimelineContextFromDto()`
- Empty invalid client registries
- Structured issue arrays
- No partial hydration

Application bootstrap must not mount Timeline Experiences when hydration fails.

---

## 9. Provider ordering (deferred — apps/web AT-013+)

Required ancestor order when wired:

```text
WorkbenchProviders
        ↓
EventNotificationProviders
        ↓
ActivityTimelineProvider
        ↓
CommandRegistryProvider
        ↓
DesktopShell / Timeline Experiences
```

Not implemented in AT-009 — hydration package only.

---

## 10. Code reference (implemented — AT-009)

```typescript
import {
  ActivityTimelineProvider,
  useActivityRegistry,
  useTimelineRegistry,
  useActivityTimelineContext,
  createActivityTimelineContextFromDto,
} from "@apzhub/activity-timeline-framework/react";
```

| Doc              | Path                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Client hydration | [CLIENT-HYDRATION.md](../../packages/activity-timeline-framework/docs/CLIENT-HYDRATION.md) |
| React API        | [REACT-API.md](../../packages/activity-timeline-framework/docs/REACT-API.md)               |

Export status: `ACTIVITY_TIMELINE_REACT_STATUS = "hydration"` (AT-009).

---

## 11. Related

- [Activity Service](./SPR-007-ATF-activity-service.md)
- [Timeline Experiences](./SPR-007-ATF-timeline-experiences.md)
- [Application integration](./SPR-006-ENF-application-integration.md) — M6 reference pattern

---

_SPR-007 Activity Client Hydration — AT-009 specification._
