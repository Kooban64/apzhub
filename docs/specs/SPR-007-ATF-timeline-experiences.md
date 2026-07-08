# SPR-007 — Timeline Experiences

> **Story:** AT-012  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented (AT-012)  
> **Package:** `@apzhub/activity-timeline-framework/react` (Experiences)  
> **Authority:** [Activity Presentation Layer](./SPR-007-ATF-activity-presentation-layer.md) · [ADR-0035](../adr/ADR-0035-activity-execution-routing.md)

---

## 1. Purpose

Define the first **Timeline Experiences** — independent Workbench surfaces that consume the Activity Presentation Layer only.

> **Locked decision:** Activity Timeline is an independent Workbench Experience — not notification history.

No DesktopShell wiring, apps/web integration, Event Bus, persistence, or user state in AT-012.

---

## 2. Experiences (implemented — AT-012)

| Experience         | Component                         | Surface id                    |
| ------------------ | --------------------------------- | ----------------------------- |
| Inline timeline    | `ActivityTimelineExperience`      | `activity-timeline`           |
| Panel timeline     | `ActivityTimelinePanelExperience` | `activity-timeline-panel`     |
| Workbench composer | `WorkbenchActivityTimeline`       | `workbench-activity-timeline` |

Path: `packages/activity-timeline-framework/src/experiences/`

---

## 3. Pipeline

```text
useActivityTimelineExperienceDiagnostics()
        ↓ (uses useActivityPresentation → ActivityTimelineService)
ActivityTimelineExperience / Panel / Workbench
        ↓
Grouped ActivityViewModels (Today · Yesterday · Earlier)
```

Action delegation:

```text
ActivityViewModel.actionRef → delegateActivityActionRef() → useCommandRegistry().execute()
```

---

## 4. Experience consumption rules

Timeline Experiences **must**:

| Requirement               | API                                          |
| ------------------------- | -------------------------------------------- |
| List activity view models | `useActivityTimelineExperienceDiagnostics()` |
| Render groups             | `groupedViewModels` from presentation hook   |
| Navigate / act            | `actionRef` → `delegateActivityActionRef()`  |

Timeline Experiences **must not**:

- Import ActivityService or DefaultActivityService
- Map ActivityDocuments or format timestamps
- Regroup activities in components
- Subscribe to Event Bus

---

## 5. States

| State   | UI component           |
| ------- | ---------------------- |
| Loading | `TimelineLoadingState` |
| Empty   | `TimelineEmptyState`   |
| Ready   | `ActivityTimelineList` |

---

## 6. Diagnostics

`buildActivityTimelineExperienceDiagnostics()` + hidden `data-testid="activity-timeline-experience-diagnostics"`.

Hook: `useActivityTimelineExperienceDiagnostics()`.

---

## 7. DesktopShell integration

**Deferred to AT-013** — enable flags, Context Panel tab, apps/web wiring.

---

## 8. Related docs

| Doc                  | Path                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Timeline Experiences | [TIMELINE-EXPERIENCES.md](../../packages/activity-timeline-framework/docs/TIMELINE-EXPERIENCES.md) |
| Timeline UX          | [TIMELINE-UX.md](../../packages/activity-timeline-framework/docs/TIMELINE-UX.md)                   |

---

_SPR-007 Timeline Experiences — AT-012 specification._
