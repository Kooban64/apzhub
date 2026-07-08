# React Presentation API (AT-011)

> **Package:** `@apzhub/activity-timeline-framework/react`  
> **Story:** AT-011  
> **Status:** Implemented — presentation only

---

## Architectural rule

Experiences must consume **`useActivityPresentation()`** for view models — not raw `useActivityService()` list results with manual mapping.

---

## useActivityPresentation()

Maps service documents into UI-ready view models. Requires `ActivityTimelineServiceProvider` (and `ActivityTimelineProvider` for registry icon resolution).

```tsx
<ActivityTimelineProvider bundle={bundle}>
  <ActivityTimelineServiceProvider>
    <TimelineExperience />
  </ActivityTimelineServiceProvider>
</ActivityTimelineProvider>
```

### Options

| Option               | Description                           |
| -------------------- | ------------------------------------- |
| `timelineScope`      | Filter passed to `listActivities()`   |
| `category`           | Category filter                       |
| `activityTypeId`     | Activity type filter                  |
| `limit`              | Result limit                          |
| `grouping`           | `date` · `category` · `timelineScope` |
| `now`                | Deterministic timestamp anchor        |
| `locale`             | Relative date locale                  |
| `includeEmptyGroups` | Include empty group buckets           |

### Result

| Field                | Description                    |
| -------------------- | ------------------------------ |
| `viewModels`         | Sorted view models             |
| `groupedViewModels`  | Grouped buckets                |
| `isEmpty`            | No view models                 |
| `diagnostics`        | Presentation diagnostics       |
| `serviceDiagnostics` | Underlying service diagnostics |

---

## Example

```tsx
"use client";

import { useActivityPresentation } from "@apzhub/activity-timeline-framework/react";

function ActivityDiagnosticsPanel() {
  const { viewModels, groupedViewModels, diagnostics } = useActivityPresentation({
    grouping: "date",
    now: "2026-07-04T12:00:00.000Z",
  });

  return (
    <pre>
      {JSON.stringify(
        { count: viewModels.length, groups: groupedViewModels.length, diagnostics },
        null,
        2,
      )}
    </pre>
  );
}
```

---

## Deferred (AT-012+)

| Feature                    | Story                |
| -------------------------- | -------------------- |
| Timeline Experience UI     | AT-012               |
| Live subscriptions         | AT-013+              |
| User state (viewed badges) | Future session model |

---

_React Presentation API — AT-011._
