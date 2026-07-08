# AT-013 — Completion Report

> **Story:** AT-013 — Application integration (apps/web)  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Date:** 2026-07-05  
> **Status:** Complete — **await owner approval before AT-014**

---

## Objective

Integrate the Activity & Timeline Framework into `apps/web` production bootstrap, React provider wiring, Context Panel registration, DesktopShell enable flags, and `/api/health` diagnostics.

Integration only — no new framework capabilities.

---

## Acceptance criteria

| Criterion                                                | Status |
| -------------------------------------------------------- | ------ |
| `buildActivityTimelineHydrationBundle()`                 | ✅     |
| `createAppActivityTimelineContext()`                     | ✅     |
| apps/web bootstrap                                       | ✅     |
| React provider wiring                                    | ✅     |
| Context Panel Timeline registration                      | ✅     |
| `enableActivityTimeline` / `enableActivityTimelinePanel` | ✅     |
| Health diagnostics (`activities`, `timelines`)           | ✅     |
| Bootstrap tests                                          | ✅     |
| Provider wiring                                          | ✅     |
| Health endpoint loaders                                  | ✅     |
| Context panel registration tests                         | ✅     |
| Timeline rendering tests                                 | ✅     |
| Quality gates                                            | ✅     |

---

## Deliverables

| Artifact                     | Path                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| Server bundle builder        | `packages/activity-timeline-framework/src/server/build-activity-timeline-hydration-bundle.ts` |
| App composition root         | `apps/web/lib/create-app-activity-timeline-context.ts`                                        |
| Event Bus wiring             | `apps/web/lib/wire-app-activity-timeline.ts`                                                  |
| Layout hydration             | `apps/web/lib/activity-timeline-hydration.ts`                                                 |
| Health loaders               | `apps/web/lib/activity-timeline-health.ts`                                                    |
| Shell provider wiring        | `apps/web/app/(platform)/action-workbench-shell-provider.tsx`                                 |
| Context Panel surface        | `packages/workspace/src/context-panel/`                                                       |
| DesktopShell flags           | `packages/workspace/src/desktop-shell.tsx`                                                    |
| Dev diagnostics              | `apps/web/components/activity-timeline-diagnostics.tsx`                                       |
| Application integration spec | [AT-013-application-integration.md](./AT-013-application-integration.md)                      |
| Bootstrap sequence           | [AT-013-bootstrap-sequence.md](./AT-013-bootstrap-sequence.md)                                |
| Health documentation         | [AT-013-health-endpoint.md](./AT-013-health-endpoint.md)                                      |

---

## Provider stack (implemented)

```text
ActivityTimelineProvider
  → ActivityTimelineServiceProvider
    → CommandRegistryProvider
      → WorkbenchActivityTimeline (Context Panel)
```

One shared `ActivityTimelineContext` per session — runtime `DefaultActivityService` wired to shared Event Bus via `wireAppActivityTimeline()`.

---

## Test results

| Suite                        | Result         |
| ---------------------------- | -------------- |
| ATF bundle builder           | ✅ 3 tests     |
| App context + wiring         | ✅ 2 tests     |
| Hydration + health loaders   | ✅ 3 tests     |
| Context Panel + DesktopShell | ✅ 3 tests     |
| Diagnostics component        | ✅ 1 test      |
| Full unit suite              | ✅ 1306 passed |
| Lint / typecheck             | ✅             |

---

## Technical debt

| Item                                 | Notes                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------- |
| No user state (viewed/unread)        | Health reports `viewedCount: 0` — deferred                              |
| No live subscriptions                | Presentation layer static until store notifies                          |
| No ActivityDocument server hydration | Bundle is metadata-only by design                                       |
| Context Panel engine integration     | Structural tab only — no Workbench Context Engine `setContext` coupling |
| `events.subscriberCount` aggregate   | Use `activities.subscriberRegistered` for Activity mapper confirmation  |
| E2E harness                          | Deferred — AT-014                                                       |

---

## Recommendation for AT-014

1. Add Playwright E2E spec for Context Panel Activity tab open/close and action-audit activity flow
2. Enable deterministic E2E seed hooks for Activity Service (mirror ENF test hooks)
3. Verify parallel notification + activity fan-out from single action audit event
4. Add `data-testid` coverage for hydration diagnostics in E2E assertions
5. Keep experiences on presentation hooks only — no service bypass

---

## Stop condition

**AT-013 complete.** Await owner approval before AT-014 (E2E tests).

---

_AT-013 Completion Report — SPR-007 Milestone 7._
