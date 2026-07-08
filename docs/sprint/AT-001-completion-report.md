# AT-001 — Completion Report

> **Story:** AT-001 — Activity & Timeline Architecture  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Date:** 2026-07-04  
> **Status:** Complete — **await owner approval before AT-002**

---

## Objective

Establish the complete architectural foundation for the Activity & Timeline Framework. Documentation and ADRs only — no production code, no package scaffold, no changes to Runtime, Workbench, Action, Knowledge, or Event & Notification Framework.

---

## Acceptance criteria

| Criterion                                                                  | Status |
| -------------------------------------------------------------------------- | ------ |
| ADR-0033 accepted — package boundary `@apzhub/activity-timeline-framework` | ✅     |
| ADR-0034 accepted — Activity Registry, timeline model, bootstrap rules     | ✅     |
| ADR-0035 accepted — execution routing, no UI Event Bus consumption         | ✅     |
| Architecture document `activity-timeline-framework.md`                     | ✅     |
| AT-001 specification set (14 specs)                                        | ✅     |
| Spec index `SPR-007-spec-index.md` with AT-001–AT-018 quick reference      | ✅     |
| Sprint guide updated — AT-001 gate complete                                | ✅     |
| Explicit boundary — not audit, notification, event store, or logging       | ✅     |
| Quality gates pass (documentation-only change)                             | ✅     |

---

## Quality gate results

| Gate                 | Result               |
| -------------------- | -------------------- |
| `pnpm lint`          | ✅ Pass              |
| `pnpm typecheck`     | ✅ Pass              |
| `pnpm build`         | ✅ Pass              |
| `pnpm test`          | ✅ 1098 passed       |
| `pnpm test:coverage` | ✅ 90.75% statements |
| `pnpm test:e2e`      | ✅ 30 passed         |

---

## Deliverables

| Artifact                               | Path                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Package boundary ADR                   | [ADR-0033](../adr/ADR-0033-activity-timeline-framework-package.md)                                |
| Activity Registry & timeline model ADR | [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md)                               |
| Execution routing ADR                  | [ADR-0035](../adr/ADR-0035-activity-execution-routing.md)                                         |
| Combined architecture                  | [activity-timeline-framework.md](../architecture/activity-timeline-framework.md)                  |
| Spec index                             | [SPR-007-spec-index.md](../specs/SPR-007-spec-index.md)                                           |
| Activity architecture spec             | [SPR-007-ATF-activity-architecture.md](../specs/SPR-007-ATF-activity-architecture.md)             |
| Activity Registry spec                 | [SPR-007-ATF-activity-registry.md](../specs/SPR-007-ATF-activity-registry.md)                     |
| Timeline model spec                    | [SPR-007-ATF-timeline-model.md](../specs/SPR-007-ATF-timeline-model.md)                           |
| Activity document spec                 | [SPR-007-ATF-activity-document.md](../specs/SPR-007-ATF-activity-document.md)                     |
| Bootstrap spec                         | [SPR-007-ATF-activity-bootstrap.md](../specs/SPR-007-ATF-activity-bootstrap.md)                   |
| Manifest schema spec                   | [SPR-007-ATF-activity-manifest.md](../specs/SPR-007-ATF-activity-manifest.md)                     |
| Registry DTO spec                      | [SPR-007-ATF-activity-registry-dto.md](../specs/SPR-007-ATF-activity-registry-dto.md)             |
| Client hydration spec                  | [SPR-007-ATF-activity-client-hydration.md](../specs/SPR-007-ATF-activity-client-hydration.md)     |
| Activity Service spec                  | [SPR-007-ATF-activity-service.md](../specs/SPR-007-ATF-activity-service.md)                       |
| Presentation Layer spec                | [SPR-007-ATF-activity-presentation-layer.md](../specs/SPR-007-ATF-activity-presentation-layer.md) |
| Timeline Experiences spec              | [SPR-007-ATF-timeline-experiences.md](../specs/SPR-007-ATF-timeline-experiences.md)               |
| Health endpoint spec                   | [SPR-007-ATF-health-endpoint-activities.md](../specs/SPR-007-ATF-health-endpoint-activities.md)   |
| Diagnostics spec                       | [SPR-007-ATF-diagnostics.md](../specs/SPR-007-ATF-diagnostics.md)                                 |
| Extension points spec                  | [SPR-007-ATF-extension-points.md](../specs/SPR-007-ATF-extension-points.md)                       |
| Sprint guide                           | [SPR-007-activity-timeline-framework.md](./SPR-007-activity-timeline-framework.md)                |

---

## Architecture summary

The Activity & Timeline Framework consumes Platform Events from the existing Event Bus and presents **historical activity timelines** for users and administrators. It is a consumer-only layer — parallel to Notification Mapping, not an extension of it.

```text
Platform Capability
        ↓
Domain Event (Document 029 envelope)
        ↓
Event Bus (@apzhub/event-notification-framework)
        ↓
Activity Mapping (DefaultActivityMapper — parallel subscriber)
        ↓
Activity Service (session store + public API)
        ↓
Activity Presentation Layer (view models, grouping)
        ↓
Timeline Experiences (feed, Context Panel tab)
```

**Key decisions:**

| Decision                                                  | ADR / spec                              |
| --------------------------------------------------------- | --------------------------------------- |
| Dedicated package `@apzhub/activity-timeline-framework`   | ADR-0033                                |
| Server + React subpath exports; layer separation          | ADR-0033                                |
| Activity Registry + Timeline Registry at bootstrap        | ADR-0034                                |
| `ActivityItem` document model with event correlation      | ADR-0034, activity-document spec        |
| UI consumes Activity Service only — no Event Bus import   | ADR-0035                                |
| Manifest blocks `activities.types` and `timelines.scopes` | activity-manifest spec                  |
| In-memory session store; persistence deferred M8+         | activity-service spec, extension points |

Activity Mapping and Notification Mapping are **siblings**. A single domain event may produce zero, one, or both outcomes — determined independently by separate registries and mappers.

---

## Risks

| Risk                                            | Severity    | Mitigation                                                                   |
| ----------------------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| Manifest schema drift vs Runtime envelope       | Medium      | ADR-0011 alignment in activity-manifest spec; AT-005 implements against spec |
| Activity vs notification UX confusion           | Medium      | Explicit taxonomy in architecture spec; separate Experiences and hooks       |
| Session-only store limits timeline depth        | Low (known) | Interface stub for persistent store; retention hints in registry             |
| Context Panel tab coupling to Workbench         | Low         | ADR-0035 routes through Activity Service; Workbench adds tab only in AT-012  |
| Permission filter parity with Workbench adapter | Medium      | Reuse `filter*Dto` pattern from M3–M6; AT-006 dedicated story                |
| Health endpoint field proliferation             | Low         | Scoped `activities` / `timelines` fields per health spec                     |

---

## Open questions

| #   | Question                                                                        | Owner          | Target          |
| --- | ------------------------------------------------------------------------------- | -------------- | --------------- |
| 1   | Confirm manifest block keys: `activities.types` vs `activity.types`             | Platform owner | AT-002 / AT-005 |
| 2   | Default personal timeline scope id (`personal` vs `personal.default`)           | UX / platform  | AT-004          |
| 3   | Team timeline RBAC — registry keys only or live team membership?                | IAM            | AT-006 / M8     |
| 4   | Activity item deduplication window for idempotent mapper                        | Engineering    | AT-007          |
| 5   | Context Panel tab placement relative to existing notification surfaces          | UX             | AT-012          |
| 6   | Whether `capability.action.executed` is sole bootstrap activity type for AT-013 | Engineering    | AT-007 / AT-013 |

---

## AT-002 recommendations

1. **Scaffold package first** — `packages/activity-timeline-framework/` with `index`, `server`, `react` exports, Vitest/ESLint/tsconfig, workspace registration, `transpilePackages` in `apps/web`. Status constant `ACTIVITY_TIMELINE_FRAMEWORK_STATUS = "scaffold"`.

2. **Follow ENF/KDF export rules** — no client imports from `/server`; mirror `@apzhub/event-notification-framework` layout.

3. **Dependency direction** — ATF depends on `@apzhub/event-notification-framework` (Event Bus types only at first); must not depend on Workbench.

4. **Implement registries before mapper** — AT-003 → AT-004 → AT-005 → AT-006 before AT-007 subscriber.

5. **Smoke tests in AT-002** — package resolves from root and `apps/web`; no behaviour yet.

6. **Do not touch ENF** — Activity mapper registers as new subscriber in AT-007 via app wiring (AT-013), not ENF package changes.

7. **Spec authority** — implement against [SPR-007-spec-index.md](../specs/SPR-007-spec-index.md); raise ADR if baseline exception required.

---

## Quality gates

Documentation-only change. All Platform 4.0 gates remain green.

```bash
pnpm lint && pnpm typecheck && pnpm build   # ✅
pnpm test && pnpm test:coverage             # ✅ 1098 tests, 90.75% coverage
pnpm test:e2e                               # ✅ 30 passed
```

---

## Stop condition

**AT-001 complete.** No package scaffold. Await owner approval before AT-002.

---

_AT-001 Completion Report — SPR-007 Milestone 7._
