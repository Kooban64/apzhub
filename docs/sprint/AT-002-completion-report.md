# AT-002 — Completion Report

> **Story:** AT-002 — Package scaffold  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await owner review before AT-003**

---

## Objective

Create `@apzhub/activity-timeline-framework` package scaffold mirroring Action, Knowledge, and Event & Notification framework patterns. Placeholder domain model and composition root only — no Event Bus, registry implementation, storage, hydration, UI, or application wiring.

Lock owner-approved architectural decisions across Sprint 007 documentation.

---

## Acceptance criteria

| Criterion                                              | Status |
| ------------------------------------------------------ | ------ |
| Package `packages/activity-timeline-framework` created | ✅     |
| Exports `.` / `./server` / `./react`                   | ✅     |
| `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "scaffold"`      | ✅     |
| Domain model placeholders exported                     | ✅     |
| `createActivityTimelineContext()` with placeholders    | ✅     |
| Smoke tests — imports resolve                          | ✅     |
| Package README + domain model documentation            | ✅     |
| Locked decisions documented across SPR-007             | ✅     |
| No Event Bus / storage / UI / app wiring               | ✅     |
| Quality gates pass                                     | ✅     |

---

## Quality gate results

| Gate                 | Result               |
| -------------------- | -------------------- |
| `pnpm lint`          | ✅ Pass              |
| `pnpm typecheck`     | ✅ Pass              |
| `pnpm build`         | ✅ Pass              |
| `pnpm test`          | ✅ 1112 passed       |
| `pnpm test:coverage` | ✅ 90.79% statements |
| `pnpm test:e2e`      | ✅ 30 passed         |

---

## Locked architectural decisions (applied)

| Decision               | Value                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Manifest block         | `activities.types`                                           |
| Default timeline scope | `timeline.personal`                                          |
| Reserved scopes        | `timeline.team`, `timeline.organization`, `timeline.system`  |
| Permissions            | Platform Permission Adapter — no framework RBAC              |
| Deduplication          | Optional — default none                                      |
| UI                     | Independent Workbench Experience — not notification surfaces |
| Bootstrap              | Platform activity types only                                 |

---

## Deliverables

| Artifact                        | Path                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| Package                         | `packages/activity-timeline-framework/`                                            |
| README                          | [README.md](../../packages/activity-timeline-framework/README.md)                  |
| Domain model                    | [DOMAIN-MODEL.md](../../packages/activity-timeline-framework/docs/DOMAIN-MODEL.md) |
| Sprint guide (locked decisions) | [SPR-007-activity-timeline-framework.md](./SPR-007-activity-timeline-framework.md) |
| Spec index (locked decisions)   | [SPR-007-spec-index.md](../specs/SPR-007-spec-index.md)                            |

---

## Package exports

| Subpath                                      | Contents                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `@apzhub/activity-timeline-framework`        | Status, types, placeholders, `createActivityTimelineContext`, constants |
| `@apzhub/activity-timeline-framework/server` | Server status + server re-exports                                       |
| `@apzhub/activity-timeline-framework/react`  | React status + type re-exports (scaffold)                               |

---

## Domain model (placeholder)

| Type                               | Implementation                                                          |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `ActivityDescriptor`               | Interface                                                               |
| `ActivityDocument`                 | Interface                                                               |
| `ActivityRegistry`                 | Interface + `PlaceholderActivityRegistry`                               |
| `ActivityMapper`                   | Interface + `PlaceholderActivityMapper` (`idempotencyStrategy: "none"`) |
| `ActivityService`                  | Interface + `PlaceholderActivityService`                                |
| `ActivityContext`                  | DI root via `createActivityTimelineContext()`                           |
| `ActivityDiagnostics`              | Interface                                                               |
| `TimelineScope`                    | Interface                                                               |
| `TimelineQuery` / `TimelineResult` | Interfaces                                                              |
| `TIMELINE_SCOPE_*`                 | Constants — locked scope ids                                            |

---

## Monorepo registration

| Location              | Change                                   |
| --------------------- | ---------------------------------------- |
| `tsconfig.base.json`  | Path aliases for main / server / react   |
| `vitest.config.ts`    | Package aliases + 80% coverage threshold |
| `pnpm-workspace.yaml` | Auto via `packages/*`                    |

**Not in scope (per constraints):** `apps/web` dependency, `transpilePackages`, layout wiring — deferred to AT-013.

---

## AT-003 recommendations

1. Implement `DefaultActivityRegistry` replacing `PlaceholderActivityRegistry`
2. Add registration validation and duplicate detection per activity-registry spec
3. Update `ACTIVITY_TIMELINE_FRAMEWORK_STATUS` to `"registry"` when AT-003 merges
4. Keep Permission Adapter integration for AT-006 — do not add framework RBAC

---

## Stop condition

**AT-002 complete.** Await owner review before AT-003 Activity Registry core.

---

_AT-002 Completion Report — SPR-007 Milestone 7._
