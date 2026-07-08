# React Service API (AT-010)

> **Package:** `@apzhub/activity-timeline-framework/react`  
> **Story:** AT-010  
> **Status:** Implemented — service boundary only

---

## Architectural rule

Experiences must consume **`useActivityService()`** — never `DefaultActivityService` directly.

---

## Status constant

```typescript
ACTIVITY_TIMELINE_REACT_STATUS === "service";
```

---

## Provider composition

Metadata hydration and service boundary are separate providers:

```tsx
import {
  ActivityTimelineProvider,
  ActivityTimelineServiceProvider,
  sampleActivityTimelineHydrationBundle,
} from "@apzhub/activity-timeline-framework/react";

<ActivityTimelineProvider bundle={hydrationBundle}>
  <ActivityTimelineServiceProvider>{children}</ActivityTimelineServiceProvider>
</ActivityTimelineProvider>;
```

### ActivityTimelineServiceProvider

| Prop      | Type                      | Description                                       |
| --------- | ------------------------- | ------------------------------------------------- |
| `service` | `ActivityTimelineService` | Optional explicit service (tests / server wiring) |

When `service` is omitted and nested under `ActivityTimelineProvider`, the provider calls `createActivityTimelineServiceFromHydration()` automatically.

---

## useActivityService()

Public hook for Timeline Experiences:

```typescript
interface UseActivityServiceResult {
  readonly isReady: boolean;
  readonly listActivities: (
    query?: ListActivitiesOptions,
  ) => readonly ActivityDocument[];
  readonly getActivity: (activityId: string) => ActivityDocument | undefined;
  readonly queryTimeline: (query: TimelineQuery) => TimelineResult;
  readonly diagnostics: ActivityTimelineServiceDiagnostics;
}
```

| Field            | Description                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| `isReady`        | `false` when registry hydration failed (`serviceStatus === "unavailable"`) |
| `listActivities` | Delegates to public service                                                |
| `getActivity`    | Single activity lookup                                                     |
| `queryTimeline`  | Scope query returning activity ids                                         |
| `diagnostics`    | Combined service, registry, and hydration observability                    |

Throws outside `ActivityTimelineServiceProvider`.

---

## Factories (non-React)

```typescript
import {
  createActivityTimelineService,
  createActivityTimelineServiceFromHydration,
} from "@apzhub/activity-timeline-framework/react";

const service = createActivityTimelineService({ registryReady: true });
const hydrated = createActivityTimelineServiceFromHydration({ context });
```

---

## Diagnostics fields

| Field                     | Source                              |
| ------------------------- | ----------------------------------- |
| `serviceStatus`           | Activity store + registry readiness |
| `registryStatus`          | Activity client registry            |
| `timelineRegistryStatus`  | Timeline client registry            |
| `activityCount`           | Session store count                 |
| `timelineDefinitionCount` | Hydrated timeline definitions       |
| `hydrationStatus`         | Combined hydration diagnostics      |

---

## Deferred (AT-011+)

| Hook / feature              | Story                       |
| --------------------------- | --------------------------- |
| `useActivityPresentation()` | AT-011 — presentation layer |
| Timeline UI components      | AT-012+                     |
| apps/web wiring             | AT-013+                     |

---

_React Service API — AT-010._
