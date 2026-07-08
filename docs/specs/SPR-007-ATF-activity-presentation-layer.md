# SPR-007 — Activity Presentation Layer

> **Story:** AT-011  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented (AT-011)  
> **Authority:** [Activity architecture](./SPR-007-ATF-activity-architecture.md) · [Activity Timeline Service](./SPR-007-ATF-activity-timeline-service.md) · [Platform Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md)

---

## 1. Purpose

Define the **Activity Presentation Layer** — reusable helpers that convert immutable `ActivityDocument` instances from `ActivityTimelineService` into UI-ready view models for Timeline Experiences.

**Does not:** query services (pure layer), store activities, publish events, execute actions, mutate documents, track user state, or render shell UI.

> **Architectural rule:** Presentation is deterministic. Experiences consume `useActivityPresentation()` — not raw service documents with manual mapping.

---

## 2. Pipeline

```text
ActivityDocument (from ActivityTimelineService)
        ↓
mapActivityDocumentToViewModel()
        ↓
sortActivityViewModels()
        ↓
groupActivityViewModels()
        ↓
buildActivityPresentationDiagnostics()
        ↓
Timeline Experiences (AT-012+)
```

Canonical pipeline position:

```text
Activity Timeline Service → Activity Presentation Layer → Timeline Experiences
```

---

## 3. Components (implemented — AT-011)

| Component                              | Path                                                      | Role                          |
| -------------------------------------- | --------------------------------------------------------- | ----------------------------- |
| `ActivityViewModel`                    | `src/presentation/activity-view-model.ts`                 | UI-ready model                |
| `mapActivityDocumentToViewModel`       | `src/presentation/map-activity-document-to-view-model.ts` | Document → view model         |
| `sortActivityViewModels`               | `src/presentation/sort-activity-view-models.ts`           | Newest-first ordering         |
| `groupActivityViewModels`              | `src/presentation/group-activity-view-models.ts`          | Scope/category/date grouping  |
| `formatActivityRelativeTimestamp`      | `src/presentation/format-activity-relative-timestamp.ts`  | Relative time labels          |
| `buildActivityPresentationDiagnostics` | `src/presentation/activity-presentation-diagnostics.ts`   | Presentation metrics          |
| `presentActivities`                    | same                                                      | Map + sort + group + diagnose |
| `useActivityPresentation`              | `src/react/use-activity-presentation.ts`                  | React hook                    |

| Doc                | Path                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| View model         | [ACTIVITY-VIEW-MODEL.md](../../packages/activity-timeline-framework/docs/ACTIVITY-VIEW-MODEL.md)       |
| Presentation layer | [PRESENTATION-LAYER.md](../../packages/activity-timeline-framework/docs/PRESENTATION-LAYER.md)         |
| React API          | [REACT-PRESENTATION-API.md](../../packages/activity-timeline-framework/docs/REACT-PRESENTATION-API.md) |

---

## 4. ActivityViewModel

See [ACTIVITY-VIEW-MODEL.md](../../packages/activity-timeline-framework/docs/ACTIVITY-VIEW-MODEL.md).

No user state fields (`viewed`, `pinned`) — deferred to future session models per ADR-0034.

---

## 5. Grouping

| Strategy         | Behaviour                                       |
| ---------------- | ----------------------------------------------- |
| `date` (default) | UTC calendar buckets: Today, Yesterday, Earlier |
| `category`       | One bucket per activity category                |
| `timelineScope`  | One bucket per timeline scope id                |

Empty buckets omitted unless `includeEmptyGroups: true`.

---

## 6. Sort order

Within groups:

1. `timestamp` descending
2. `activityId` ascending tie-break

---

## 7. useActivityPresentation hook

Consumes `useActivityService()` internally. Returns `viewModels`, `groupedViewModels`, and `diagnostics`.

Does not subscribe to live updates in AT-011 — deferred to AT-013+.

---

## 8. Presentation diagnostics

| Field                        | Meaning                              |
| ---------------------------- | ------------------------------------ |
| `totalCount`                 | View model count                     |
| `groupCount` / `groupCounts` | Group totals                         |
| `categoryCounts`             | Count by category                    |
| `scopeCounts`                | Count by timeline scope              |
| `presentationDurationMs`     | Pipeline timing                      |
| `formattingStatus`           | `ok` · `partial`                     |
| `layerStatus`                | `ACTIVITY_PRESENTATION_LAYER_STATUS` |

---

## 9. Boundary rules

| Allowed                                | Forbidden                              |
| -------------------------------------- | -------------------------------------- |
| Map ActivityDocument → view model      | Query Activity Service in pure helpers |
| Group and format timestamps            | Mutate ActivitySessionStore            |
| Passthrough actionRef                  | Execute actions                        |
| Read registry icons in React hook only | Permission evaluation                  |
| Deterministic transforms               | Render UI                              |

---

## 10. Related

- [Activity Timeline Service](./SPR-007-ATF-activity-timeline-service.md)
- [Timeline Experiences](./SPR-007-ATF-timeline-experiences.md)
- [SPR-006 Notification Presentation Layer](./SPR-006-ENF-notification-presentation-layer.md) — parallel pattern

---

_SPR-007 Activity Presentation Layer — AT-011 specification._
