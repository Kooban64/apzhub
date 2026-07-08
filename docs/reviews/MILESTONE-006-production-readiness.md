# Milestone 6 — Event & Notification Framework Production Readiness Review

> **Milestone:** 6 — Event & Notification Framework  
> **Sprint:** SPR-006  
> **Review date:** 2026-07-04  
> **Release:** `v0.6.0-event-notification-framework` (proposed — EN-018)  
> **Verdict:** **PASS WITH OBSERVATIONS — Milestone 6 Ready for Closeout**

---

## Executive summary

Milestone 6 delivered `@apzhub/event-notification-framework` and integrated it into the authenticated APZHUB shell. Eighteen sequential stories (EN-001–EN-017) implemented the Event Registry, Event Bus, Notification Registry, Notification Mapper, Notification Service, Presentation Layer, Notification Experiences, Action audit integration, application wiring, E2E verification, and complete documentation.

SPR-001 Desktop Shell, SPR-002 Platform Runtime, SPR-003 Workbench Framework, SPR-004 Action Framework, and SPR-005 Knowledge & Discovery remain intact. Successful actions publish `capability.action.executed`; notification routes map to inbox and toast items surfaced in the shell badge and panel.

**1098 unit tests** and **30 E2E tests** pass at EN-017 review. **90.75%** statement coverage. ADRs 0030–0032 are accepted.

**Overall verdict:** **PASS WITH OBSERVATIONS**

Deferred items (external delivery, persistent store, toast/banner UI, Activity subscriber) are documented and scheduled for future milestones — not blocking release of the Event & Notification platform layer.

---

## Assessment dimensions

### Architecture — Strong

| Criterion                       | Rating                                          |
| ------------------------------- | ----------------------------------------------- |
| Layer separation                | Strong — canonical seven-step pipeline enforced |
| Event / notification separation | Strong — ADR-0032 compliant                     |
| Registry reuse                  | Strong — bootstrap + DTO filter pattern         |
| No parallel execution pipeline  | Strong — Action audit reuses executor           |
| Extension points                | Good — routes, subscribers, experiences         |
| Baseline compliance             | Strong — no v1.0 edits                          |

See [SPR-006 architecture review](./SPR-006-architecture-review.md).

---

### Engineering — Strong

| Criterion               | Rating                                           |
| ----------------------- | ------------------------------------------------ |
| Phased story delivery   | Strong — 17 stories, stop-after-review gates     |
| Package structure       | Strong — index, server, react exports            |
| Shared context pattern  | Strong — `EventNotificationContext`              |
| Immutability            | Strong — frozen envelopes and notification items |
| Technical debt tracking | Good — consolidated below                        |

---

### Documentation — Complete (EN-017)

| Artifact                                                           | Status            |
| ------------------------------------------------------------------ | ----------------- |
| Architecture (`event-notification-framework.md`)                   | Complete          |
| Subsystem docs (`event-framework.md`, `notification-framework.md`) | Updated           |
| Governance guides (4 updated)                                      | Complete          |
| Developer onboarding                                               | Complete          |
| Architecture review                                                | Complete          |
| Production readiness (this document)                               | Complete          |
| Spec index + 17 completion reports                                 | Complete          |
| Package README                                                     | Existing (EN-002) |

---

### Testing — Strong

| Area                                           | Coverage    |
| ---------------------------------------------- | ----------- |
| Event Registry, bootstrap, DTO                 | Unit        |
| Event Bus, envelope validation                 | Unit        |
| Notification Registry, mapper, templates       | Unit        |
| Notification Service, session store            | Unit        |
| Presentation layer, grouping, timestamps       | Unit        |
| App hydration, health, audit → notification    | Integration |
| Health, badge, panel, action flow, diagnostics | E2E         |

---

## Known limitations

| Limitation                               | Impact                                   | Mitigation                                                     |
| ---------------------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| In-process Event Bus only                | Events do not cross process boundaries   | Acceptable for current deployment; broker adapter future (M10) |
| Session-scoped notification store        | No persistence across reload or devices  | Acceptable for M6; PostgreSQL store M8+                        |
| Toast route lists in panel only          | No dedicated toast region UI             | Panel shows toast items; toast Experience deferred             |
| Banner / email / SMS / push / webhook    | Route stubs only                         | No external delivery in M6                                     |
| Client/server separate context instances | Server health vs client store divergence | By design; document in onboarding                              |
| Service-type action handlers             | `NOT_IMPLEMENTED` — no audit event       | Unrelated to ENF; bridge actions work for E2E                  |
| E2E `__APZHUB_E2E__` hook                | Test-only window API                     | Gated by `NEXT_PUBLIC_E2E_TEST_HOOKS`                          |

---

## Technical debt

| ID         | Item                                                             | Notes                                      |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------ |
| TD-EN15-01 | App notification routes in `register-app-notification-routes.ts` | Migrate to platform notification catalogue |
| TD-EN15-02 | Server/client context instances separate                         | Client session store by design             |
| TD-EN15-03 | `createRandomUuid` duplicated in command-framework and ENF       | Consolidate to shared util                 |
| TD-EN16-01 | E2E relies on env-gated test hook                                | Documented in onboarding                   |
| TD-EN16-02 | Inbox + toast routes both appear in panel                        | Toast Experience UI deferred               |
| TD-EN17-01 | Architecture doc expansion                                       | Resolved EN-017                            |
| TD-EN17-02 | Spec index and onboarding                                        | Resolved EN-017                            |

---

## Deferred work

| Item                                  | Target milestone      | Notes                                |
| ------------------------------------- | --------------------- | ------------------------------------ |
| Dedicated toast / banner Experiences  | M6+ product story     | Routes registered                    |
| Activity timeline subscriber          | M7 Activity Framework | Parallel consumer pattern documented |
| Persistent event store                | M7/M10                | Envelope model stable                |
| External Event Bus transport          | M10                   | Redis/NATS                           |
| Email / SMS / push / webhook delivery | M8+ Delivery Service  | Channel stubs in registry            |
| PostgreSQL notification persistence   | M8+                   | Session store replaceable            |
| Operational dashboards                | Out of scope          | Health endpoint sufficient for M6    |
| Business capability events            | M9+                   | Manifest `events` pattern documented |

---

## Operational considerations

| Topic             | Guidance                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Health monitoring | Poll `/api/health` — inspect `events.subscriberCount`, `notifications.mapperStatus`, `notifications.unreadCount` |
| Diagnostics       | Hidden DOM hooks in development only; absent in production builds                                                |
| Failure modes     | Invalid envelopes rejected at bus; unmatched routes produce mapper `NO_MATCH` issue (non-fatal)                  |
| Scaling           | Single-process in-process bus — scale horizontally only after transport ADR                                      |
| Security          | Client cannot publish business events; notification store is session-local                                       |
| CI                | Full quality gates including `pnpm test:e2e` with test hooks enabled                                             |

---

## Future milestones

| Milestone                 | ENF relevance                           |
| ------------------------- | --------------------------------------- |
| M7 Activity               | Subscribe to Event Bus; no ENF redesign |
| M8 Delivery + persistence | Notification Service backend swap       |
| M9 Business capabilities  | Manifest events + notification routes   |
| M10 External Event Bus    | Transport adapter behind same envelope  |

---

## Release recommendation

Proceed to **EN-018 Sprint Closeout** when owner approves:

1. `SPR-006-closeout.md`
2. `MILESTONE-006-event-notification-framework-review.md`
3. `v0.6.0-event-notification-framework.md` release notes
4. CHANGELOG entry
5. Tag `v0.6.0-event-notification-framework` (owner instruction only)

---

## Sign-off criteria met

- [x] Architecture review complete
- [x] Production wiring verified (EN-015, EN-016)
- [x] Documentation and governance updated (EN-017)
- [x] Quality gates green
- [x] Technical debt catalogued
- [x] No architectural redesign proposed

---

_Milestone 6 Production Readiness Review — EN-017._
