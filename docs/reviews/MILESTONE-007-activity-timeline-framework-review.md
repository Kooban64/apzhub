# Milestone 7 — Activity & Timeline Framework Review

> **Milestone:** 7 — Activity & Timeline Framework  
> **Sprint:** SPR-007  
> **Review date:** 2026-07-05  
> **Release:** `v0.7.0-activity-timeline-framework` (recommended — tag pending owner instruction)  
> **Verdict:** **PASS WITH OBSERVATIONS — Milestone 7 Complete**

---

## Executive summary

### What was achieved

Milestone 7 delivered `@apzhub/activity-timeline-framework` and integrated it into the authenticated APZHUB shell. Over sixteen sequential stories (AT-001–AT-016), the team implemented the Activity Registry, Timeline Registry, manifest bootstrap, permission-filtered DTO hydration, Event-to-Activity Mapper, Activity Service, Activity Presentation Layer, Timeline Experiences, Context Panel Activity tab, application wiring, E2E verification, complete documentation, production readiness review, and sprint closeout.

SPR-001 through SPR-006 remain intact. Successful actions publish `capability.action.executed`; activity types map to timeline items in the Context Panel while notification badge and panel update in parallel — no parallel execution pipeline.

**1308 unit tests** and **36 E2E tests** pass at closeout. **90.58%** statement coverage. ADRs 0033–0035 are accepted.

### Overall verdict

**PASS WITH OBSERVATIONS**

Milestone 7 meets its approved scope. Deferred items (user state, live subscriptions, persistence, search/filtering, event replay) are documented, accepted, and scheduled for future milestones — not blocking release of the Activity & Timeline platform layer.

---

## Architecture assessment

| Criterion                             | Rating                                              |
| ------------------------------------- | --------------------------------------------------- |
| Layer separation                      | **Strong** — eight-step canonical pipeline enforced |
| Activity / notification separation    | **Strong** — ADR-0035 compliant                     |
| Registry reuse                        | **Strong** — bootstrap + DTO filter pattern         |
| No parallel execution pipeline        | **Strong** — Action audit reuses executor           |
| Presentation vs Experience separation | **Strong** — Presentation Layer in ATF package      |
| Context Panel integration             | **Good** — additive shell; no engine redesign       |
| Extension points                      | **Good** — documented deferrals                     |
| Baseline compliance                   | **Strong** — no v1.0 edits                          |

See [SPR-007 architecture review](./SPR-007-architecture-review.md) and [activity-timeline-framework.md](../architecture/activity-timeline-framework.md).

### Architecture summary

```text
Platform Capability → Domain Event → Event Bus → Activity Mapping
→ Activity Service → Activity Presentation Layer → Timeline Experiences → Context Panel
```

---

## Engineering quality

| Criterion               | Rating                                            |
| ----------------------- | ------------------------------------------------- |
| Phased story delivery   | **Strong** — 16 stories, stop-after-review gates  |
| Package structure       | **Strong** — index, server, react exports         |
| Shared context pattern  | **Strong** — `createAppActivityTimelineContext()` |
| Immutability            | **Strong** — frozen ActivityDocument instances    |
| Error handling          | **Good** — mapper issues, subscriber isolation    |
| Technical debt tracking | **Good** — consolidated in sprint closeout        |

---

## Operational readiness

| Area                  | Status                                             |
| --------------------- | -------------------------------------------------- |
| Health endpoint       | ✅ `activities` + `timelines` on `/api/health`     |
| Dev diagnostics       | ✅ Hidden hooks (non-production)                   |
| In-process deployment | ✅ Acceptable for current Next.js Node runtime     |
| E2E verification      | ✅ spr-007 (6 scenarios)                           |
| Production dashboards | ⏳ Deferred — health sufficient for platform layer |
| Activity persistence  | ⏳ Deferred — session store only                   |
| Live timeline updates | ⏳ Deferred — no subscriptions yet                 |

See [MILESTONE-007 production readiness](./MILESTONE-007-production-readiness.md).

---

## Quality metrics

| Metric                   | Closeout value       |
| ------------------------ | -------------------- |
| Unit/component tests     | **1308** (238 files) |
| E2E tests                | **36**               |
| Statement coverage       | **90.58%**           |
| Branch coverage          | 86.91%               |
| Function coverage        | 91.58%               |
| Lint / typecheck / build | ✅ All pass          |

---

## Known limitations

1. **Session-scoped activity store** — no persistence across reload or devices
2. **No live subscriptions** — timeline UI does not auto-update after mapper writes
3. **No user state (viewed/unread)** — health reports `viewedCount: 0`
4. **Context Panel not Context Engine coupled** — structural tab only
5. **Mapper `actionRef` not from audit payload** — delegation requires payloadSummary or E2E seed
6. **No search / filter UI** — full list only
7. **No event replay** — cannot rebuild timeline from event store
8. **E2E test hooks** — `__APZHUB_E2E__` env-gated; not a product feature
9. **E2E presentation refresh hook** — test infrastructure remount until subscriptions land

---

## Deferred capabilities

| Capability                                  | Target              |
| ------------------------------------------- | ------------------- |
| User state (viewed/unread)                  | M8+                 |
| Live subscriptions (`useSyncExternalStore`) | Post-M7             |
| Persistent activity store                   | M8+                 |
| Search and filtering UI                     | Product story       |
| Event replay / event store                  | M10+                |
| Team timeline RBAC depth                    | M8+                 |
| External Event Bus transport                | M10+                |
| Full Context Engine integration             | Workbench UX polish |

---

## Documentation assessment

| Artifact                           | Status      |
| ---------------------------------- | ----------- |
| Combined architecture              | ✅ Complete |
| Developer onboarding               | ✅ Complete |
| Architecture review                | ✅ Complete |
| Production readiness               | ✅ Complete |
| Milestone review (this document)   | ✅ Complete |
| Sprint closeout                    | ✅ Complete |
| Release notes                      | ✅ Complete |
| Governance guides (4)              | ✅ Updated  |
| Spec index + 16 completion reports | ✅ Complete |

---

## Recommendation for release

**Recommend:** Accept Milestone 7 as complete. Optional owner action: create tag `v0.7.0-activity-timeline-framework`.

**Do not tag** without explicit owner instruction.

Milestone 7 delivers the **platform foundation** for activity timelines in the Context Panel. Commercial GA remains gated on Milestone 8 (Identity/RBAC, delivery/persistence) and business capabilities (M9+).

---

## Recommendation for Milestone 8

**Planning only. Do not implement.**

Per [Platform Roadmap](../architecture/platform-roadmap.md), Milestone 8 is **Identity & Administration**.

| Priority | Recommendation                                                                  |
| -------- | ------------------------------------------------------------------------------- |
| 1        | Author Sprint 008 backlog — Identity & Administration per Documents 007 and 023 |
| 2        | Integrate PermissionService with Workbench Manager and all registry DTO filters |
| 3        | Deliver administration workspace scaffold (no business admin modules)           |
| 4        | User preferences persistence and audit trail hooks for framework actions        |
| 5        | Defer activity persistence and external delivery to scoped M8+ stories          |

Do **not** begin Sprint 008 implementation until owner approves Milestone 7 closeout.

---

_Milestone 7 Activity & Timeline Framework Review — AT-016._
