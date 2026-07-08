# SPR-007 — Activity Service

> **Story:** AT-008  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented (AT-008)  
> **Authority:** [Activity architecture](./SPR-007-ATF-activity-architecture.md) · [ActivityItem model](./SPR-007-ATF-activity-document.md) · [ADR-0035](../adr/ADR-0035-activity-execution-routing.md)

---

## 1. Purpose

Define the **Activity Service** — the stable public API between Activity Mapping and Timeline Experiences. Stores immutable `ActivityDocument` instances in a session-scoped in-memory store. Exposes read/query APIs.

> **AT-008 scope:** Storage and read APIs only. User state (`markViewed`, `subscribe`) deferred to AT-009+.

**Does not:** publish events, execute mappers, render UI, send notifications, or persist activities.

---

## 2. Lifecycle

```text
Mapped ActivityItem (from DefaultActivityMapper)
        ↓
ActivityService.addActivities()          [server / mapper path only]
        ↓
ActivitySessionStore (in-memory, session-scoped)
        ↓
Read APIs (list, get, subscribe, mark viewed)
        ↓
Activity Presentation Layer → Timeline Experiences
```

Canonical pipeline position:

```text
Platform Capability → Domain Event → Event Bus → Activity Mapping
→ Activity Service → Activity Presentation Layer → Timeline Experiences
```

No Event Bus publish. No persistence. No notification delivery.

---

## 3. Components (implemented — AT-008)

| Component                     | Path                                                                                                   | Role                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------- |
| `ActivityService`             | `src/service/activity-service.ts`                                                                      | Public interface       |
| `DefaultActivityService`      | `src/service/default-activity-service.ts`                                                              | Default implementation |
| `ActivitySessionStore`        | `src/service/activity-session-store.ts`                                                                | Store interface        |
| `DefaultActivitySessionStore` | `src/service/default-activity-session-store.ts`                                                        | In-memory store        |
| Session store doc             | [ACTIVITY-SESSION-STORE.md](../../packages/activity-timeline-framework/docs/ACTIVITY-SESSION-STORE.md) | Store behaviour        |
| Timeline query doc            | [TIMELINE-QUERY.md](../../packages/activity-timeline-framework/docs/TIMELINE-QUERY.md)                 | Query filters          |

React providers and hydration factories — deferred to AT-009.

---

## 4. Public API

| Method                       | Description                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| `addActivities(items)`       | Append mapper output — **server/mapper only**; deduplication optional (default none) |
| `listActivities(options?)`   | Ordered list with optional `scope`, `timelineId`, `category`, `since`, `limit`       |
| `getActivity(activityId)`    | Lookup single item with current viewed state                                         |
| `markViewed(activityId)`     | Mark one activity viewed; returns `false` if missing or already viewed               |
| `markAllViewed(scope?)`      | Bulk viewed for scope; returns count updated                                         |
| `getTimelineScopes()`        | Available timeline ids for current hydration context                                 |
| `subscribe(scope, listener)` | Mutation subscription for React `useSyncExternalStore`                               |
| `getDiagnostics()`           | Service health and counts                                                            |

### 4.1 listActivities options

```typescript
interface ListActivitiesOptions {
  readonly scope?: TimelineScope;
  readonly timelineId?: string;
  readonly category?: ActivityCategory;
  readonly since?: string; // ISO timestamp — items after this time
  readonly limit?: number; // default 50, max 200
  readonly unviewedOnly?: boolean;
}
```

Scope filtering applies presentation resolution rules — items match when scope hints and timeline filters align.

---

## 5. Ordering

`listActivities()` returns items sorted by:

1. `timestamp` descending (newest first) — default timeline sort
2. `activityId` ascending (stable tie-break)

TimelineDescriptor `sortOrder: oldest-first` reverses timestamp order at Presentation Layer only; store order remains newest-first.

---

## 6. Subscribe semantics

```typescript
type ActivityServiceListener = () => void;

interface ActivityService {
  subscribe(
    scope: TimelineScope | "all",
    listener: ActivityServiceListener,
  ): () => void;
}
```

| Event             | Triggers listener            |
| ----------------- | ---------------------------- |
| `addActivities()` | All matching scope listeners |
| `markViewed()`    | All listeners                |
| `markAllViewed()` | All listeners                |
| Hydration refresh | All listeners                |

Unsubscribe via returned cleanup function. Synchronous callback — no async delivery.

Future real-time transport (M8+) will call `addActivities()` and trigger same subscribe path.

---

## 7. Session store

| Aspect        | SPR-007 decision                                                                 |
| ------------- | -------------------------------------------------------------------------------- |
| Location      | `server/store/default-activity-session-store.ts`                                 |
| Scope         | Per-session / per-bootstrap context                                              |
| Persistence   | None — interface stub for M8+                                                    |
| Population    | EventToActivityMapper writes via service; client reads via hydration + subscribe |
| Max items     | 500 per session (configurable); oldest evicted by `recordedAt`                   |
| Deduplication | By `activityId` on append                                                        |

See [ActivitySessionStore interface](#session-store-interface) below.

### 7.1 Session store interface

```typescript
interface ActivitySessionStore {
  append(items: readonly ActivityItem[]): ActivityAppendResult;
  list(): readonly ActivityItem[];
  get(activityId: string): ActivityItem | undefined;
  markViewed(activityId: string): boolean;
  markAllViewed(filter?: ActivityStoreFilter): number;
  clear(): number;
  getDiagnostics(): ActivitySessionStoreDiagnostics;
}
```

Client **does not** create activity records in SPR-007. `addActivities()` is not exposed on client-facing ActivityService interface.

---

## 8. Idempotency

`activityId` is `{envelopeId}:{activityTypeId}`. Duplicate `addActivities()` calls skip existing ids (`skippedCount` in append result).

---

## 9. Factory and hydration

```typescript
import { createActivityServiceFromHydration } from "@apzhub/activity-timeline-framework/server";

const service = createActivityServiceFromHydration(hydrationDto, {
  store: optionalCustomStore,
});
```

Hydration factory:

1. Seeds store from `ActivityHydrationDto.items`
2. Binds read-only registry references for scope resolution metadata
3. Returns client-safe ActivityService (no `addActivities` on client export)

Server app context:

```typescript
import { createActivityTimelineContext } from "@apzhub/activity-timeline-framework/server";

const context = createActivityTimelineContext({ eventBus });
const mapped = context.activityMapper.map(envelope);
context.activityService.addActivities(mapped.items);
```

---

## 10. Diagnostics

| Field                           | Meaning                                            |
| ------------------------------- | -------------------------------------------------- |
| `activeActivityCount`           | Total stored activities                            |
| `viewedCount` / `unviewedCount` | Viewed state counts                                |
| `lastActivityTimestamp`         | Latest item timestamp                              |
| `status`                        | `empty` or `ready`                                 |
| `health`                        | `empty` when no items; `healthy` when store active |
| `layerStatus`                   | `ACTIVITY_LAYER_STATUS` (`"service"`)              |
| `scopeCounts`                   | Count by resolved timeline scope                   |
| `storeCapacity`                 | Max items / current utilisation                    |

---

## 11. React

```typescript
import {
  ActivityServiceProvider,
  useActivityService,
} from "@apzhub/activity-timeline-framework/react";

<ActivityTimelineProvider bundle={bundle}>
  <App />
</ActivityTimelineProvider>
```

`useActivityService()` — mandatory public hook. Throws outside provider.

`ACTIVITY_TIMELINE_REACT_STATUS = "service"` (AT-008).

---

## 12. Boundary rules

| Allowed                        | Forbidden                        |
| ------------------------------ | -------------------------------- |
| Store `ActivityItem`           | Publish to Event Bus             |
| Read/query APIs                | Execute activity mappers         |
| Track viewed state             | Send notifications               |
| Session-scoped in-memory store | Render UI                        |
| Subscribe for UI sync          | Persist to DB or browser storage |
| Client read + markViewed       | Client addActivities             |

---

## 13. Related

- [ActivityItem model](./SPR-007-ATF-activity-document.md)
- [Client hydration](./SPR-007-ATF-activity-client-hydration.md)
- [SPR-006 Notification Service](./SPR-006-ENF-notification-service.md) — parallel pattern

---

_SPR-007 Activity Service — AT-008 specification._
