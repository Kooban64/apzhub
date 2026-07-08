# SPR-007 — Activity Timeline Service

> **Story:** AT-010  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented (AT-010)  
> **Authority:** [Activity Service](./SPR-007-ATF-activity-service.md) · [Client hydration](./SPR-007-ATF-activity-client-hydration.md) · [ADR-0035](../adr/ADR-0035-activity-execution-routing.md)

---

## 1. Purpose

Define the **public Activity Timeline Service** — the stable client-facing API between hydrated registries and Timeline Experiences.

> **Architectural rule:** Experiences must never consume `DefaultActivityService` directly. They consume `ActivityTimelineService` through React.

Internal runtime storage (`DefaultActivityService`) remains server/mapper owned. The public service exposes read/query APIs only.

---

## 2. Lifecycle

```text
Server mapper → DefaultActivityService.addActivities()     [internal only]
        ↓
ActivitySessionStore (in-memory)
        ↓
DefaultActivityTimelineService (delegates read APIs)
        ↓
ActivityTimelineServiceProvider → useActivityService()
        ↓
Timeline Experiences (AT-011+)
```

Metadata hydration (`ActivityTimelineProvider`) runs in parallel — registries only.

---

## 3. Components (implemented — AT-010)

| Component                                      | Path                                                                    | Role                      |
| ---------------------------------------------- | ----------------------------------------------------------------------- | ------------------------- |
| `ActivityTimelineService`                      | `src/client/service/activity-timeline-service.ts`                       | Public interface          |
| `DefaultActivityTimelineService`               | `src/client/service/default-activity-timeline-service.ts`               | Delegating implementation |
| `createActivityTimelineService()`              | `src/client/service/create-activity-timeline-service.ts`                | Factory                   |
| `createActivityTimelineServiceFromHydration()` | `src/client/service/create-activity-timeline-service-from-hydration.ts` | Hydration wiring          |
| `ActivityTimelineServiceProvider`              | `src/react/activity-timeline-service-context.tsx`                       | React DI                  |
| `useActivityService()`                         | `src/react/use-activity-service.ts`                                     | Public React hook         |

Internal (not for experiences):

| Component                                    | Path           |
| -------------------------------------------- | -------------- |
| `ActivityService` / `DefaultActivityService` | `src/service/` |

---

## 4. Public API

| Method                     | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `listActivities(options?)` | Ordered activity list with scope/category/type/limit filters |
| `getActivity(activityId)`  | Single activity lookup                                       |
| `queryTimeline(query)`     | Timeline scope query returning activity ids                  |
| `getDiagnostics()`         | Service + registry + hydration observability                 |

**Not exposed:** `addActivities`, `clearActivities`, `subscribe`, user state mutations.

---

## 5. Diagnostics

`ActivityTimelineServiceDiagnostics`:

| Field                     | Description                         |
| ------------------------- | ----------------------------------- |
| `frameworkStatus`         | Package implementation status       |
| `serviceStatus`           | `ready` · `empty` · `unavailable`   |
| `registryStatus`          | Activity client registry status     |
| `timelineRegistryStatus`  | Timeline client registry status     |
| `registryReady`           | Hydration succeeded                 |
| `hydrationStatus`         | Combined hydration status           |
| `activityCount`           | Stored activity count               |
| `timelineDefinitionCount` | Hydrated timeline definition count  |
| `activityService`         | Internal store diagnostics snapshot |
| `message`                 | Human-readable status               |

---

## 6. React composition

```tsx
<ActivityTimelineProvider bundle={bundle}>
  <ActivityTimelineServiceProvider>
    <Experience />
  </ActivityTimelineServiceProvider>
</ActivityTimelineProvider>
```

- `ActivityTimelineProvider` — metadata registries only (AT-009)
- `ActivityTimelineServiceProvider` — public service boundary (AT-010)
- `useActivityService()` — experiences consume this hook only

When nested under `ActivityTimelineProvider`, `ActivityTimelineServiceProvider` auto-wires via `createActivityTimelineServiceFromHydration()`.

---

## 7. Boundaries (AT-010)

| Does                                              | Does not                                       |
| ------------------------------------------------- | ---------------------------------------------- |
| Delegate read/query to internal store             | Expose `DefaultActivityService` to experiences |
| Report combined diagnostics                       | Render timeline UI                             |
| Provide React service hook                        | Wire apps/web                                  |
| Wire from hydration context                       | Run Event Bus or mappers                       |
| Accept server/runtime activity seeding in factory | Implement presentation layer                   |

---

## 8. Related

- [Activity Service (internal)](./SPR-007-ATF-activity-service.md)
- [Client hydration](./SPR-007-ATF-activity-client-hydration.md)
- [React service API](../../packages/activity-timeline-framework/docs/REACT-SERVICE-API.md)

---

_SPR-007 Activity Timeline Service — AT-010 specification._
