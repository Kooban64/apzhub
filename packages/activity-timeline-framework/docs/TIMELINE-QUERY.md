# Timeline Query (Activity Service)

> **Package:** `@apzhub/activity-timeline-framework`  
> **Story:** AT-008  
> **Status:** Implemented

---

## Purpose

Document timeline read APIs exposed by `DefaultActivityService`. Queries filter stored `ActivityDocument` instances — no timeline generation or UI rendering.

---

## APIs

| Method                     | Description                                 |
| -------------------------- | ------------------------------------------- |
| `listActivities(options?)` | Filtered list of full activity documents    |
| `queryTimeline(query)`     | Scope-oriented query returning activity ids |
| `getActivity(activityId)`  | Single document lookup                      |

---

## Filters

`ListActivitiesOptions` / `TimelineQuery` support:

| Filter         | Field                       |
| -------------- | --------------------------- |
| Timeline scope | `timelineScope` / `scopeId` |
| Category       | `category`                  |
| Activity type  | `activityTypeId`            |
| Limit          | `limit`                     |

---

## Ordering

Results are sorted deterministically:

1. `timestamp` descending (newest first)
2. `activityId` ascending (stable tie-break)

---

## TimelineResult

```typescript
interface TimelineResult {
  readonly scopeId: TimelineScopeId;
  readonly items: readonly string[]; // activity ids
  readonly status: "ok" | "empty";
}
```

---

## Example

```typescript
const service = createDefaultActivityService();
service.addActivities(mapper.map(event).documents);

const timeline = service.queryTimeline({
  scopeId: TIMELINE_SCOPE_PERSONAL,
  category: "capability",
  limit: 20,
});
```

---

_Timeline Query — AT-008._
