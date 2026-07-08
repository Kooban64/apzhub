# React API (AT-009)

> **Package:** `@apzhub/activity-timeline-framework/react`  
> **Story:** AT-009  
> **Status:** Implemented — hydration only

---

## Status constant

```typescript
ACTIVITY_TIMELINE_REACT_STATUS === "hydration";
```

---

## Provider

```tsx
import {
  ActivityTimelineProvider,
  sampleActivityTimelineHydrationBundle,
} from "@apzhub/activity-timeline-framework/react";

<ActivityTimelineProvider bundle={hydrationBundle}>
  {children}
</ActivityTimelineProvider>;
```

### Props

| Prop     | Type                              | Description                                |
| -------- | --------------------------------- | ------------------------------------------ |
| `bundle` | `ActivityTimelineHydrationBundle` | Permission-filtered server metadata bundle |

Provider responsibilities:

1. Validate bundle at mount boundary
2. Construct read-only client registries via `createActivityTimelineContextFromDto()`
3. Expose context to descendant hooks
4. Report hydration diagnostics through context

Provider **must not** subscribe to Event Bus, run mappers, or hydrate ActivityDocuments.

---

## Hooks

### useActivityTimelineContext()

Returns the full hydrated client context:

```typescript
interface ActivityTimelineClientContext {
  readonly ok: boolean;
  readonly activityRegistry: ReadOnlyActivityRegistry;
  readonly timelineRegistry: ReadOnlyTimelineRegistry;
  readonly diagnostics: ActivityTimelineHydrationDiagnostics;
  readonly activityRegistryDiagnostics: ClientActivityRegistryDiagnostics;
  readonly timelineRegistryDiagnostics: ClientTimelineRegistryDiagnostics;
  readonly activityErrors: readonly ActivityRegistrationIssue[];
  readonly timelineErrors: readonly TimelineRegistrationIssue[];
  readonly bundleErrors: readonly ActivityTimelineHydrationBundleValidationIssue[];
}
```

Throws outside `ActivityTimelineProvider`.

### useActivityRegistry()

Returns hydrated activity type metadata:

| Field / method | Description                          |
| -------------- | ------------------------------------ |
| `isReady`      | `true` when hydration succeeded      |
| `types`        | All hydrated activity types          |
| `has(id)`      | Type registered in client index      |
| `get(id)`      | Type descriptor or `undefined`       |
| `list()`       | All hydrated types                   |
| `diagnostics`  | Client activity registry diagnostics |
| `importErrors` | Bundle + activity validation errors  |

No querying or service access — metadata only.

### useTimelineRegistry()

Returns hydrated timeline definition metadata:

| Field / method       | Description                          |
| -------------------- | ------------------------------------ |
| `isReady`            | `true` when hydration succeeded      |
| `timelines`          | All hydrated timeline definitions    |
| `has(id)`            | Timeline registered                  |
| `get(id)`            | Timeline descriptor or `undefined`   |
| `list()`             | All hydrated timelines               |
| `listByScope(scope)` | Timelines for a scope                |
| `diagnostics`        | Client timeline registry diagnostics |
| `importErrors`       | Bundle + timeline validation errors  |

---

## Deferred hooks (AT-010+)

| Hook                        | Story                             |
| --------------------------- | --------------------------------- |
| `useActivityService()`      | AT-010+ — service client boundary |
| `useActivityPresentation()` | AT-011+ — presentation layer      |

---

## Example

```tsx
"use client";

import {
  ActivityTimelineProvider,
  useActivityRegistry,
  useTimelineRegistry,
  useActivityTimelineContext,
} from "@apzhub/activity-timeline-framework/react";

function DiagnosticsPanel() {
  const { diagnostics } = useActivityTimelineContext();
  const activity = useActivityRegistry();
  const timeline = useTimelineRegistry();

  return (
    <pre>
      {JSON.stringify(
        {
          hydration: diagnostics,
          activityTypes: activity.types.length,
          timelines: timeline.timelines.length,
        },
        null,
        2,
      )}
    </pre>
  );
}
```

---

## Import boundary

React consumers import from `@apzhub/activity-timeline-framework/react` only. Server bootstrap (`/server`) and runtime service wiring remain server-side until application integration stories.

---

_React API — AT-009 hydration._
