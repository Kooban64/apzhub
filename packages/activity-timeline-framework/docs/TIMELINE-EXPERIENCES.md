# Timeline Experiences (AT-012)

> **Package:** `@apzhub/activity-timeline-framework/react`  
> **Story:** AT-012  
> **Status:** Implemented — no DesktopShell wiring

---

## Purpose

First Timeline Workbench Experiences — presentation-only surfaces consuming `useActivityPresentation()` / `useActivityTimelineExperienceDiagnostics()` only.

---

## Components

| Component                                    | Role                                        |
| -------------------------------------------- | ------------------------------------------- |
| `ActivityTimelineExperience`                 | Primary inline timeline experience          |
| `ActivityTimelinePanelExperience`            | Panel chrome variant                        |
| `WorkbenchActivityTimeline`                  | Composer (`inline` · `panel`)               |
| `ActivityTimelineList`                       | Renders grouped view models (no regrouping) |
| `TimelineEmptyState`                         | Empty store UX                              |
| `TimelineLoadingState`                       | Hydration pending UX                        |
| `delegateActivityActionRef()`                | Action Framework delegation helper          |
| `useActivityTimelineExperienceDiagnostics()` | Experience diagnostics hook                 |

---

## Architectural rule

Experiences **must not**:

- Access `ActivityService` / `DefaultActivityService` directly
- Map `ActivityDocument` instances
- Format timestamps or group activities
- Perform business logic

All transformation belongs to the Activity Presentation Layer.

---

## Rendering

Date groups (`Today`, `Yesterday`, `Earlier`) come directly from `groupedViewModels` — components do not regroup.

---

## Provider stack (tests / future wiring)

```tsx
<ActivityTimelineProvider bundle={bundle}>
  <ActivityTimelineServiceProvider service={service}>
    <CommandRegistryProvider dto={actionDto} executor={executor}>
      <ActivityTimelineExperience />
    </CommandRegistryProvider>
  </ActivityTimelineServiceProvider>
</ActivityTimelineProvider>
```

---

## Diagnostics

Hidden marker: `data-testid="activity-timeline-experience-diagnostics"`

| Attribute                   | Meaning               |
| --------------------------- | --------------------- |
| `data-surface`              | Experience surface id |
| `data-total-count`          | View model count      |
| `data-rendered-item-count`  | Rendered items        |
| `data-rendered-group-count` | Non-empty groups      |
| `data-empty`                | Empty state active    |
| `data-loading`              | Loading state active  |

---

## Boundaries (AT-012)

| Does                            | Does not                  |
| ------------------------------- | ------------------------- |
| Render grouped view models      | Wire DesktopShell         |
| Delegate `actionRef` via helper | Track viewed/unread state |
| Report experience diagnostics   | Subscribe to Event Bus    |
| Empty and loading states        | Filter/search UI          |

---

_Timeline Experiences — AT-012._
