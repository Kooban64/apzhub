# Milestone 7 — Activity & Timeline Framework Production Readiness Review

> **Milestone:** 7 — Activity & Timeline Framework  
> **Sprint:** SPR-007  
> **Review date:** 2026-07-05  
> **Release:** `v0.7.0-activity-timeline-framework` (proposed — AT-018)  
> **Verdict:** **PASS WITH OBSERVATIONS — Milestone 7 Ready for Production Readiness Gate**

---

## Executive summary

Milestone 7 delivered `@apzhub/activity-timeline-framework` and integrated it into the authenticated APZHUB shell. Eighteen sequential stories (AT-001–AT-015 implementation; AT-016–AT-018 review/closeout) implemented the Activity Registry, Timeline Registry, Activity Mapper, Activity Service, Presentation Layer, Timeline Experiences, Context Panel tab, application wiring, E2E verification, and complete documentation.

SPR-001 through SPR-006 remain intact. Successful actions publish `capability.action.executed`; activity types map to timeline items surfaced in the Context Panel Activity tab while notifications continue in parallel.

**1308 unit tests** and **36 E2E tests** pass at AT-015 documentation review. ADRs 0033–0035 are accepted.

**Overall verdict:** **PASS WITH OBSERVATIONS**

Deferred items (user state, live subscriptions, persistence, search/filtering, event replay) are documented and scheduled for future milestones — not blocking release of the Activity & Timeline platform layer.

---

## Assessment dimensions

### Architecture — Strong

| Criterion                          | Rating                                          |
| ---------------------------------- | ----------------------------------------------- |
| Layer separation                   | Strong — canonical eight-step pipeline enforced |
| Activity / notification separation | Strong — ADR-0035 compliant                     |
| Registry reuse                     | Strong — bootstrap + DTO filter pattern         |
| No parallel execution pipeline     | Strong — Action audit reuses executor           |
| Context Panel integration          | Good — additive shell; no engine redesign       |
| Extension points                   | Good — documented deferrals                     |
| Baseline compliance                | Strong — no v1.0 edits                          |

See [SPR-007 architecture review](./SPR-007-architecture-review.md).

---

### Engineering — Strong

| Criterion               | Rating                                                      |
| ----------------------- | ----------------------------------------------------------- |
| Phased story delivery   | Strong — 15 implementation stories, stop-after-review gates |
| Package structure       | Strong — index, server, react exports                       |
| Shared context pattern  | Strong — `createAppActivityTimelineContext()`               |
| Immutability            | Strong — frozen ActivityDocument instances                  |
| Technical debt tracking | Good — consolidated below                                   |

---

### Documentation — Complete (AT-015)

| Artifact                                                    | Status   |
| ----------------------------------------------------------- | -------- |
| Architecture (`activity-timeline-framework.md`)             | Complete |
| Developer onboarding                                        | Complete |
| Governance guides (4 updated)                               | Complete |
| Architecture review                                         | Complete |
| Production readiness (this document)                        | Complete |
| Spec index + 15 completion reports                          | Complete |
| Package docs (CLIENT-HYDRATION, TIMELINE-EXPERIENCES, etc.) | Complete |

---

### Testing — Strong

| Area                                                     | Coverage    |
| -------------------------------------------------------- | ----------- |
| Activity / Timeline registries, bootstrap, DTO           | Unit        |
| Activity Mapper, templates                               | Unit        |
| Activity Service, session store                          | Unit        |
| Presentation layer, grouping                             | Unit        |
| Timeline Experiences                                     | Component   |
| App hydration, health, mapper wire                       | Integration |
| Health, Context Panel, pipeline, delegation, diagnostics | E2E         |

---

## Known limitations

| Limitation                                  | Impact                                               | Mitigation                                  |
| ------------------------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| Session-scoped activity store               | No persistence across reload or devices              | Acceptable for M7; PostgreSQL store M8+     |
| No live subscriptions                       | Timeline UI does not auto-update after mapper writes | E2E refresh hook; subscription work post-M7 |
| No user state (viewed/unread)               | Health reports `viewedCount: 0`                      | User state model M8+                        |
| Metadata-only hydration bundle              | No ActivityDocument server hydration                 | By design M7; audit alignment M8+           |
| Mapper `actionRef` not from audit payload   | Delegation requires payloadSummary or E2E seed       | Template enhancement                        |
| Context Panel not Context Engine coupled    | Tab does not respond to `setContext`                 | Workbench UX polish                         |
| No search / filter UI                       | Full list only                                       | Product story                               |
| No event replay                             | Cannot rebuild timeline from event store             | M10+ event store                            |
| E2E `__APZHUB_E2E__` hooks                  | Test-only window API                                 | Gated by `NEXT_PUBLIC_E2E_TEST_HOOKS`       |
| E2E `refreshActivityTimelinePresentation()` | Test infrastructure remount                          | Remove when subscriptions land              |

---

## Technical debt

| ID         | Item                                | Notes                                |
| ---------- | ----------------------------------- | ------------------------------------ |
| TD-AT15-01 | Live subscriptions deferred         | Presentation static until remount    |
| TD-AT15-02 | User state model deferred           | viewed/unread affordances            |
| TD-AT15-03 | Persistent activity store deferred  | Session store replaceable            |
| TD-AT15-04 | Context Panel ↔ Context Engine      | Structural tab only                  |
| TD-AT15-05 | E2E presentation refresh hook       | Test-only; remove with subscriptions |
| TD-AT15-06 | Health loader shared context cache  | Independent loader calls             |
| TD-AT15-07 | Mapper actionRef from audit payload | Delegation UX enhancement            |

---

## Deferred work

| Item                                        | Target milestone | Notes                              |
| ------------------------------------------- | ---------------- | ---------------------------------- |
| User state (viewed/unread)                  | M8+              | Service + presentation affordances |
| Live subscriptions (`useSyncExternalStore`) | Post-M7          | Remove E2E refresh hook            |
| Persistent activity store                   | M8+              | PostgreSQL / audit alignment       |
| Event replay / event store                  | M10+             | Envelope model stable              |
| Search and filtering UI                     | Product story    | Experience layer                   |
| Team timeline RBAC depth                    | M8+              | Scope model stub exists            |
| External Event Bus transport                | M10+             | In-process only                    |
| Full Context Engine integration             | Workbench UX     | `setContext` coupling              |

---

## Operator health checklist

After deployment, verify:

```bash
curl -s https://<host>/api/health | jq '{activities, timelines, events}'
```

| Check                             | Expected                              |
| --------------------------------- | ------------------------------------- |
| `activities.status`               | `healthy` or `degraded`               |
| `activities.subscriberRegistered` | `true`                                |
| `activities.mapperStatus`         | `ready`                               |
| `activities.registeredTypeCount`  | > 0                                   |
| `timelines.hydrationStatus`       | `hydrated`                            |
| `events.subscriberCount`          | ≥ 2 (notification + activity mappers) |

---

## Quality gate evidence (AT-016 closeout)

| Gate                 | Result                  |
| -------------------- | ----------------------- |
| `pnpm lint`          | Pass                    |
| `pnpm typecheck`     | Pass                    |
| `pnpm build`         | Pass                    |
| `pnpm test`          | 1308 passed (238 files) |
| `pnpm test:coverage` | 90.58% statements       |
| `pnpm test:e2e`      | 36 passed               |

---

## Recommendation

**PASS WITH OBSERVATIONS**

Milestone 7 Activity & Timeline Framework is **complete** as of AT-016 closeout (2026-07-05).

Optional owner actions:

1. Approve Milestone 7 closeout
2. Create tag `v0.7.0-activity-timeline-framework` when instructed
3. Authorise Milestone 8 (Identity & Administration) planning — no implementation until approved

See [MILESTONE-007 activity timeline framework review](./MILESTONE-007-activity-timeline-framework-review.md) · [SPR-007 closeout](../sprint/SPR-007-closeout.md).

No blocking defects identified for platform layer release.

---

_Milestone 7 Activity & Timeline Framework Production Readiness Review — AT-015._
