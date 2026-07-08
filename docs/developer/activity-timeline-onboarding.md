# Activity & Timeline Framework — Developer Onboarding

> **Audience:** Engineers adding activity types, timeline definitions, shell Timeline Experiences, or app integration  
> **Prerequisite:** [Getting started](./getting-started.md) · [Engineering Handbook](../governance/APZHUB-Engineering-Handbook.md) · [Event & Notification onboarding](./event-notification-onboarding.md)  
> **Architecture:** [activity-timeline-framework.md](../architecture/activity-timeline-framework.md)

---

## What you need to understand

The Activity & Timeline Framework answers five questions:

1. **What activity types exist?** — `ActivityRegistry` from platform catalogue + manifest `activities.types`
2. **What timelines exist?** — `TimelineRegistry` from platform catalogue + manifest `activities.timelines`
3. **How do events become activity?** — Shared Event Bus → `wireAppActivityTimeline()` → `DefaultEventToActivityMapper` → `DefaultActivityService`
4. **How does the shell show timelines?** — `useActivityTimelineExperienceDiagnostics()` → Context Panel / inline feed
5. **How is metadata hydrated?** — Server `buildActivityTimelineHydrationBundle()` → `ActivityTimelineProvider`

### Canonical pipeline

```text
Platform Capability
        ↓
Domain Event
        ↓
Event Bus
        ↓
Activity Mapping
        ↓
Activity Service
        ↓
Activity Presentation Layer
        ↓
Timeline Experiences
        ↓
Context Panel
```

**Rules:**

- Modules **publish events** (or use platform hooks) — they never call `activityService.addActivities()` directly
- Activity code **never publishes** events
- Experiences **never import** Event Bus, mapper, or `DefaultActivityService`
- Activity ≠ Notification — separate mappers, services, Experiences

---

## Task 1 — Understand the framework

Read in order:

1. [Document 021](../021-notification-activity-attention-management-framework.md) — product vision
2. [activity-timeline-framework.md](../architecture/activity-timeline-framework.md) — combined architecture
3. [packages/activity-timeline-framework/README.md](../../packages/activity-timeline-framework/README.md) — package API
4. [SPR-007 spec index](../specs/SPR-007-spec-index.md) — story specifications

Run locally:

```bash
pnpm dev
# Sign in → /workspace/home
# Context Panel Activity tab (right) when enableActivityTimeline + enableActivityTimelinePanel
curl -s localhost:3300/api/health | jq '{activities, timelines, events}'
```

Dev diagnostics (hidden in DOM):

- `data-testid="activity-timeline-diagnostics"`
- `data-testid="activity-timeline-experience-diagnostics"`

---

## Task 2 — Activity Types

Activity types are declared in:

| Source              | Location                                                                            |
| ------------------- | ----------------------------------------------------------------------------------- |
| Platform catalogue  | `packages/activity-timeline-framework/src/catalogue/platform-activity-catalogue.ts` |
| Capability manifest | `activities.types[]` block                                                          |

Example manifest entry:

```yaml
activities:
  types:
    - id: capability.example.record.created
      version: "1.0.0"
      eventPattern: capability.example.record.created
      category: capability
      timelineScopes:
        - timeline.personal
      templateRef: activity.capability.example.record.created
      label: Record created
      description: A record was created in Example Capability
      status: active
```

Bootstrap: `bootstrapActivityRegistry({ capabilityRecords })` — runs in `createAppActivityTimelineContext()`.

---

## Task 3 — Timeline Definitions

Timelines are declared in:

| Source              | Location                                                                            |
| ------------------- | ----------------------------------------------------------------------------------- |
| Platform catalogue  | `packages/activity-timeline-framework/src/catalogue/platform-timeline-catalogue.ts` |
| Capability manifest | `activities.timelines[]` (primary) or legacy `timelines.scopes[]`                   |

Example:

```yaml
activities:
  timelines:
    - id: timeline.personal
      scope: personal
      label: Personal activity
      grouping: date
      version: "1.0.0"
      status: active
```

Default scope for experiences: `timeline.personal` (`DEFAULT_TIMELINE_SCOPE_ID`).

---

## Task 4 — Manifest structure

| Block                    | Purpose                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `activities.types[]`     | Register activity types (locked block name — not `activity.types`) |
| `activities.timelines[]` | Register timeline definitions                                      |
| `events[]`               | (Optional) Event Registry — required for custom event patterns     |
| `notifications.routes[]` | (Optional) Parallel notification fan-out                           |

Activity bootstrap is **independent** of notification bootstrap. Both read from the same capability manifests via Runtime discovery.

See [SPR-007-ATF-activity-manifest.md](../specs/SPR-007-ATF-activity-manifest.md).

---

## Task 5 — Bootstrap and DTO hydration

Server sequence:

```text
Runtime.bootstrap()
        ↓
bootstrapActivityRegistry() + bootstrapTimelineRegistry()
        ↓
mapActivityRegistryDto() + mapTimelineRegistryDto()
        ↓
filterActivityRegistryDto() + filterTimelineRegistryDto(permissionAdapter)
        ↓
buildActivityTimelineHydrationBundle()
        ↓
ActivityTimelineProvider (client)
```

Key functions:

| Function                                 | Package / path                                         |
| ---------------------------------------- | ------------------------------------------------------ |
| `buildActivityTimelineHydrationBundle()` | `@apzhub/activity-timeline-framework/server`           |
| `loadActivityTimelineHydration()`        | `apps/web/lib/activity-timeline-hydration.ts`          |
| `createAppActivityTimelineContext()`     | `apps/web/lib/create-app-activity-timeline-context.ts` |
| `wireAppActivityTimeline()`              | `apps/web/lib/wire-app-activity-timeline.ts`           |

Bundle contains **metadata registries only** — no `ActivityDocument` hydration in M7.

---

## Task 6 — Activity Service

Public client boundary: `ActivityTimelineService` via `useActivityService()`.

Internal runtime: `DefaultActivityService` — session-scoped in-memory store. Wired in `createAppActivityTimelineContext()` and exposed through `ActivityTimelineServiceProvider`.

Primary M7 activity source:

```text
Action audit hook → capability.action.executed → ActivityMapper → addActivities()
```

Do not import `DefaultActivityService` in Experiences.

See [REACT-SERVICE-API.md](../../packages/activity-timeline-framework/docs/REACT-SERVICE-API.md).

---

## Task 7 — Presentation Layer

| API                                | Role                      |
| ---------------------------------- | ------------------------- |
| `useActivityPresentation()`        | View models + date groups |
| `presentActivities()`              | Pure transform (tests)    |
| `mapActivityDocumentToViewModel()` | Single document mapping   |

Experiences consume **`useActivityTimelineExperienceDiagnostics()`** — built on presentation hook.

Presentation does **not** subscribe to live updates in M7 — UI refresh after store mutation requires remount or future subscription work.

---

## Task 8 — Timeline Experiences

| Component                         | Surface                       |
| --------------------------------- | ----------------------------- |
| `ActivityTimelineExperience`      | Inline region                 |
| `ActivityTimelinePanelExperience` | Panel chrome                  |
| `WorkbenchActivityTimeline`       | Composer (`inline` · `panel`) |

Context Panel wiring (`@apzhub/workspace`):

```text
DesktopShell enableActivityTimeline + enableActivityTimelinePanel
  → WorkbenchContextPanel
    → WorkbenchContextPanelActivityTab
      → WorkbenchActivityTimeline variant="panel"
```

Action delegation: `ActivityViewModel.actionRef` → `delegateActivityActionRef()` → `useCommandRegistry().execute()`.

---

## Task 9 — apps/web integration

Files to know:

| File                                                          | Role                       |
| ------------------------------------------------------------- | -------------------------- |
| `apps/web/app/(platform)/layout.tsx`                          | Parallel hydration load    |
| `apps/web/app/(platform)/action-workbench-shell-provider.tsx` | Provider stack             |
| `apps/web/components/workbench-page.tsx`                      | DesktopShell enable flags  |
| `apps/web/app/api/health/route.ts`                            | `activities` + `timelines` |
| `apps/web/components/activity-timeline-diagnostics.tsx`       | Dev diagnostics            |

See [AT-013 bootstrap sequence](../sprint/AT-013-bootstrap-sequence.md).

---

## Task 10 — E2E verification

Playwright spec: `testing/playwright/e2e/spr-007-activity-timeline-framework.spec.ts`

Requires `NEXT_PUBLIC_E2E_TEST_HOOKS=true` (set in Playwright webServer config).

| Hook                                    | Purpose                                      |
| --------------------------------------- | -------------------------------------------- |
| `executeWorkbenchAction()`              | Trigger audit → activity pipeline            |
| `getActivityCount()`                    | Inspect session store                        |
| `seedActivityActionDelegationFixture()` | Deterministic `actionRef` item               |
| `refreshActivityTimelinePresentation()` | Remount timeline (no live subscriptions yet) |

See [AT-014 E2E verification report](../sprint/AT-014-e2e-verification-report.md).

---

## Checklist — adding a capability activity type

- [ ] Event registered (catalogue or manifest `events`)
- [ ] Activity type in `activities.types` with valid `eventPattern`
- [ ] Timeline scopes include `timeline.personal` (or target scope)
- [ ] Permission keys on type if restricted visibility
- [ ] Unit tests for extraction and registry registration
- [ ] Verify health: `activities.registeredTypeCount` increases
- [ ] Optional: E2E if user-visible in Context Panel

---

## Related

| Document                         | Path                                                                                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Capability guide — events block  | [APZHUB-Capability-Development-Guide.md](../governance/APZHUB-Capability-Development-Guide.md) |
| Workbench — Timeline Experiences | [APZHUB-Workbench-Development-Guide.md](../governance/APZHUB-Workbench-Development-Guide.md)   |
| ADR-0035 execution routing       | [ADR-0035](../adr/ADR-0035-activity-execution-routing.md)                                      |

---

_Activity & Timeline Framework Developer Onboarding — AT-015._
