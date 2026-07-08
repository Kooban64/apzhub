# AT-013 — Application Integration Specification

> **Story:** AT-013 — Application integration (apps/web)  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented

---

## Purpose

Wire the Activity & Timeline Framework into `apps/web` using the same composition-root pattern as Action, Knowledge, and Event & Notification frameworks.

Integration only — no new framework capabilities.

---

## Composition root

| Function                                 | Path                                                    | Role                                                             |
| ---------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| `createAppActivityTimelineContext()`     | `apps/web/lib/create-app-activity-timeline-context.ts`  | Bootstrap registries, mapper, service; optional Event Bus wiring |
| `wireAppActivityTimeline()`              | `apps/web/lib/wire-app-activity-timeline.ts`            | Subscribe Activity Mapper on shared Event Bus                    |
| `loadSharedActivityTimelineContext()`    | `apps/web/lib/load-shared-activity-timeline-context.ts` | Server/runtime shared context                                    |
| `loadActivityTimelineHydration()`        | `apps/web/lib/activity-timeline-hydration.ts`           | Permission-filtered layout hydration                             |
| `buildActivityTimelineHydrationBundle()` | `@apzhub/activity-timeline-framework/server`            | Server bundle assembly                                           |

---

## Provider stack

```text
NotificationRegistryProvider
  NotificationServiceProvider
    WorkbenchProvider
      ActivityTimelineProvider (bundle)
        ActivityTimelineServiceProvider (runtime service + hydration)
          CommandRegistryProvider
            KnowledgeDiscoveryProvider
              DesktopShell / Timeline Experiences
```

One shared `ActivityTimelineContext` per session surface — client runtime service shares Event Bus with `EventNotificationContext`.

---

## DesktopShell flags

| Flag                          | Effect                               |
| ----------------------------- | ------------------------------------ |
| `enableActivityTimeline`      | Enables Activity timeline feature    |
| `enableActivityTimelinePanel` | Registers Context Panel Activity tab |

Both flags required for Context Panel rendering. No permanent page route introduced.

---

## Context Panel

| Surface          | Component                                       | Package                                     |
| ---------------- | ----------------------------------------------- | ------------------------------------------- |
| Activity tab     | `WorkbenchContextPanelActivityTab`              | `@apzhub/workspace`                         |
| Timeline content | `WorkbenchActivityTimeline` (`variant="panel"`) | `@apzhub/activity-timeline-framework/react` |

Presentation logic lives in framework experiences only — workspace wraps, does not duplicate.

---

## Out of scope (AT-013)

- User state / viewed-unread
- Live subscriptions
- Timeline persistence
- Event replay
- Desktop notifications
- Filtering / search UI

---

## Related

- [Bootstrap sequence](./AT-013-bootstrap-sequence.md)
- [Health endpoint](./AT-013-health-endpoint.md)
- [Completion report](./AT-013-completion-report.md)
