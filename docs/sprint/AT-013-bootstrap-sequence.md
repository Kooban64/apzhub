# AT-013 — Bootstrap Sequence

> **Story:** AT-013 — Application integration  
> **Endpoint:** Platform layout + client shell

---

## Server bootstrap (layout)

```text
ensurePlatformRuntimeReady()
        ↓
loadSharedEventNotificationContext()
        ↓
loadSharedActivityTimelineContext()
  • mapPlatformCapabilitiesToActivityRecords()
  • bootstrapActivityRegistry()
  • bootstrapTimelineRegistry()
  • createDefaultEventToActivityMapper()
  • createDefaultActivityService()
  • wireAppActivityTimeline(eventBus)   ← shared with ENF
        ↓
loadActivityTimelineHydration()
  • mapActivityRegistryDto()
  • mapTimelineRegistryDto()
  • filterActivityRegistryDto(permissionAdapter)
  • filterTimelineRegistryDto(permissionAdapter)
  • buildActivityTimelineHydrationBundle()
        ↓
ActionWorkbenchShellProvider props
```

Parallel with existing loaders in `app/(platform)/layout.tsx`:

- Workbench registry
- Action registry
- Knowledge registry
- Event & Notification hydration
- **Activity & Timeline hydration** (AT-013)

---

## Client hydration

```text
ActivityTimelineHydrationBundle (server props)
        ↓
ActivityTimelineProvider
        ↓
createAppActivityTimelineContext({ eventBus: shared })
        ↓
createActivityTimelineServiceFromHydration({ context, activityService })
        ↓
ActivityTimelineServiceProvider
        ↓
Timeline Experiences (Context Panel / inline)
```

---

## Event → Activity path (production)

```text
Action audit hook → Event Bus publish
        ↓
wireAppActivityTimeline subscriber
        ↓
DefaultEventToActivityMapper.map()
        ↓
DefaultActivityService.addActivities()
        ↓
ActivityTimelineService (public boundary)
        ↓
useActivityPresentation() → Timeline Experiences
```

---

## Provider ordering (locked)

```text
EventNotificationProviders
        ↓
ActivityTimelineProvider
        ↓
ActivityTimelineServiceProvider
        ↓
CommandRegistryProvider
        ↓
DesktopShell
```

---

_AT-013 bootstrap sequence — SPR-007._
