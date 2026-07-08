# SPR-007 — Readiness Review

> **Review date:** 2026-07-04  
> **Scope:** Platform Version 4.0 readiness to commence Milestone 7 — Activity & Timeline Framework  
> **Authority:** [APZHUB Platform v4.0](../releases/APZHUB-Platform-v4.0.md) · [Platform v4.0 Review](./APZHUB-v4.0-Platform-Review.md) · [Document 021](../021-notification-activity-attention-management-framework.md) · [Platform Roadmap v2](../roadmap/APZHUB-Platform-Roadmap-v2.md)  
> **Verdict:** **APPROVED FOR MILESTONE 7 PLANNING — await owner approval before AT-001 implementation**

---

## Executive summary

Platform Version 4.0 provides a stable, tested, and documented foundation for the Activity & Timeline Framework. The M6 Event Bus delivers the canonical event envelope, registry bootstrap, and subscriber model that Milestone 7 requires. Activity Mapping will subscribe to the **same Event Bus** as Notification Mapping — a **parallel consumer**, not an extension of the Notification Service.

Milestone 6 closeout is complete. Milestone 7 planning documentation is the next gate. **Implementation must not begin** until owner approves AT-001 (ADRs and specifications).

**Recommendation:** **APPROVED FOR MILESTONE 7 PLANNING**

---

## Readiness assessment

| Area                            | Status          | Notes                                                               |
| ------------------------------- | --------------- | ------------------------------------------------------------------- |
| Architecture baseline           | ✅ Ready        | v1.0 frozen; Platform 4.0 extends without redesign                  |
| Event Bus (M6)                  | ✅ Ready        | In-process bus operational; envelope + validation proven            |
| Activity subscriber model       | ✅ Ready        | Parallel consumer documented in ADR-0032 and ENF architecture       |
| Event / notification separation | ✅ Ready        | Activity ≠ notification; independent pipelines                      |
| Action Framework audit hook     | ✅ Ready        | `capability.action.executed` — first Activity source event          |
| Workbench Context Manager       | ✅ Ready        | M3 engine available for context panel activity tab                  |
| Workbench shell extension       | ✅ Ready        | Surface Pattern; notification region precedent for activity feed    |
| Knowledge Framework             | ✅ Ready        | No M7 dependency; optional Activity search provider post-M7         |
| Notification Framework          | ✅ Not required | Activity is independent — do not route through Notification Service |
| Hydration pattern               | ✅ Ready        | M4–M6 parallel bootstrap reusable                                   |
| Health endpoint                 | ✅ Ready        | Incremental field pattern; add `activity` in AT stories             |
| Test infrastructure             | ✅ Ready        | Vitest + Playwright; E2E auth fixtures; spr-006 patterns            |
| Documentation patterns          | ✅ Ready        | Reference Patterns authoritative for M7                             |
| M7 sprint guide / backlog       | ⏳ Pending      | Author after owner approves M6 closeout                             |

---

## Event Bus as Activity foundation

Milestone 6 delivered the Event Bus infrastructure that Milestone 7 depends on. Activity Mapping is **not** a notification extension.

```text
Platform Capability
        ↓
Domain Event (standard envelope)
        ↓
Event Bus
       / \
      /   \
     /     \
NotificationMapper     ActivityMappingSubscriber (M7)
     ↓                       ↓
Notification Service    Activity Service (M7)
     ↓                       ↓
Notification Presentation   Activity Presentation (M7)
     ↓                       ↓
Notification Experiences    Activity Experiences (M7)
```

### Why Event Bus — not Notification Service

| Principle                           | Rationale                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| Events describe state changes       | Activity items reference source events; they are not delivery artefacts                            |
| Notifications are attention signals | Activity is historical context — different user intent                                             |
| ADR-0032 separation                 | Activity subscribes to same events independently                                                   |
| Document 021 §17                    | Activity timeline records timestamp, actor, action, target, correlation ID — event envelope fields |
| No coupling                         | Changes to notification routes must not affect activity aggregation                                |

The M6 `DefaultNotificationMapper` demonstrates the subscriber pattern Activity Mapping will mirror. Activity code must **never** call `NotificationService.addNotifications()` or depend on notification routes.

---

## Risks

| ID      | Risk                                                            | Likelihood | Impact   | Mitigation                                                                         |
| ------- | --------------------------------------------------------------- | ---------- | -------- | ---------------------------------------------------------------------------------- |
| R-AT-01 | Activity conflated with notifications                           | Medium     | High     | ADR-gated separation in AT-001; code review enforces parallel subscriber only      |
| R-AT-02 | Activity implemented inside ENF package                         | Medium     | High     | AT-001 ADR defines separate package or ENF `activity/` module with clear boundary  |
| R-AT-03 | Duplicate timeline models (Context Manager vs Activity Service) | Medium     | Medium   | Integrate with M3 Context Manager; single Activity Service as SoR for feed         |
| R-AT-04 | Scope creep into Attention Engine / digests                     | Medium     | High     | Document 021 Attention Engine deferred; interface stubs only in M7                 |
| R-AT-05 | Real-time transport premature (WebSocket/SSE)                   | Medium     | Medium   | Interface stubs until product requirement; in-process updates sufficient initially |
| R-AT-06 | In-process bus inadequate for activity volume                   | Known      | Low (M7) | Session-scoped activity store acceptable; persistent store M8+                     |
| R-AT-07 | RBAC not populated — activity filter incomplete                 | Known      | Medium   | Permission keys declared; allow-all dev adapter until M8                           |
| R-AT-08 | E2E flakiness for activity feed timing                          | Medium     | Medium   | Deterministic test seed hook (pattern from spr-006)                                |
| R-AT-09 | KDF activity source registered before Activity Service exists   | Low        | Low      | Defer ActivityKnowledgeProvider until Activity Service stable                      |

---

## Open questions

| ID      | Question                                                                            | Owner        | Target resolution                                         |
| ------- | ----------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------- |
| Q-AT-01 | Single `@apzhub/activity-timeline-framework` vs module within ENF?                  | Architecture | AT-001 ADR                                                |
| Q-AT-02 | Activity feed location: context panel tab vs dedicated sidebar vs workspace region? | Product/UX   | AT-013 spec (default: context panel tab per Document 016) |
| Q-AT-03 | Activity item persistence: session-only vs PostgreSQL in M7?                        | Architecture | AT-001 — default session-scoped; persistence M8           |
| Q-AT-04 | Should Knowledge Framework subscribe to activity events for ranking?                | Architecture | Defer post-M7; optional extension                         |
| Q-AT-05 | Git tag for Platform 4.0 collective baseline?                                       | Owner        | Owner decision — not blocking AT-001                      |
| Q-AT-06 | Hardening sprint between M6 closeout and M7 implementation?                         | Owner        | Roadmap v2 — owner decision                               |
| Q-AT-07 | Correlation with notifications in UI — link or separate surfaces?                   | Product/UX   | AT-013 — correlate via event ID; separate Experiences     |

---

## Dependencies

### Satisfied (Platform 4.0)

| Dependency                               | Status                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| Platform Runtime (M2)                    | ✅ Complete                                                                    |
| Workbench Framework (M3)                 | ✅ Complete                                                                    |
| Action Framework (M4)                    | ✅ Complete                                                                    |
| Knowledge & Discovery (M5)               | ✅ Complete                                                                    |
| Event & Notification Framework (M6)      | ✅ Complete                                                                    |
| Event Bus + standard envelope            | ✅ Complete                                                                    |
| Action audit → Event Bus wire            | ✅ Complete                                                                    |
| Registry Pattern documentation           | ✅ [Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md) |
| Document 021 (Activity surfaces)         | ✅ Foundation doc                                                              |
| Document 012 (EDA framework)             | ✅ Foundation doc                                                              |
| Document 016 (Context panel)             | ✅ Foundation doc                                                              |
| ADR-0032 (event/notification separation) | ✅ Accepted                                                                    |

### Required before AT-002 (implementation)

| Dependency                             | Status                 |
| -------------------------------------- | ---------------------- |
| Owner approval of Milestone 6 closeout | ⏳ Pending             |
| Owner approval of SPR-007 sprint guide | ⏳ Pending             |
| Owner approval of SPR-007 backlog      | ⏳ Pending             |
| AT-001 ADRs accepted                   | ⏳ Blocked on approval |
| SPR-007 spec index                     | ⏳ Created in AT-001   |

### Not required for M7 foundation (deferred)

| Dependency                               | Deferred to                            |
| ---------------------------------------- | -------------------------------------- |
| Notification Framework changes           | Not required — Activity is independent |
| Full RBAC population                     | M8 Identity                            |
| Persistent activity store                | M8+                                    |
| External Event Bus transport             | M10 Enterprise Operations              |
| Attention Engine / digests / quiet hours | Document 021 future scope              |
| Email / push / webhook delivery          | M8+                                    |
| Semantic activity search                 | M8+ via KDF optional provider          |
| Real-time WebSocket/SSE transport        | Product requirement gate               |

---

## Recommendations

1. **Approve Platform 4.0 baseline** — v4.0 release doc, platform review, M6 closeout before AT-001.
2. **Resolve Q-AT-01 in AT-001** — prefer dedicated `@apzhub/activity-timeline-framework` package following ENF/KDF precedent; clear `server/subscriber` and `server/service` modules.
3. **Subscribe Activity to Event Bus directly** — mirror `DefaultNotificationMapper` subscriber pattern; **never** route through Notification Service or mapper.
4. **Preserve event envelope** — Activity items must reference source event ID, correlation ID, actor, timestamp from envelope; no duplicate event publishing from Activity code.
5. **Integrate with Context Manager** — activity tab in context panel per Document 016; avoid parallel timeline state in Workbench engines.
6. **Keep M7 scope bounded** — in-process subscriber, session-scoped activity store, context panel feed; defer Attention Engine, persistence, and real-time transport.
7. **Follow Platform Design Patterns** — Registry, DTO, Hydration, Provider, Service, Presentation, Experience, Manifest, Bootstrap, Health, Diagnostics, Extension — all documented for AT stories.
8. **Maintain stop-after-review gates** — one story at a time; owner approval between stories (same as EN/DF/AF).
9. **Extend health incrementally** — add `activity` field; do not redesign health endpoint.
10. **Do not modify lower layers without ADR** — Runtime, Workbench, Action, Knowledge, ENF remain frozen except approved Activity subscriber wiring in apps/web.

---

## Independence from Notification Framework

Milestone 7 must treat Notification and Activity as **orthogonal platform capabilities**:

| Aspect               | Notification (M6)                    | Activity (M7)                    |
| -------------------- | ------------------------------------ | -------------------------------- |
| Purpose              | Attention — interrupt or inform user | History — contextual audit trail |
| Consumer             | NotificationMapper                   | ActivityMappingSubscriber        |
| Public API           | `useNotificationService()`           | `useActivityService()` (planned) |
| Storage              | Session notification store           | Session activity store (planned) |
| Shell surface        | Badge + panel                        | Context panel activity tab       |
| User action          | Mark read, dismiss                   | Filter, scroll, inspect          |
| Document 021 section | §6–§15 Notifications                 | §17 Activity Timeline            |

**Anti-patterns to reject in AT-001:**

- Creating activity items inside `DefaultNotificationMapper`
- Routing activity events through notification routes
- Using `NotificationItem` as Activity item model
- Coupling Activity Experiences to `useNotificationPresentation()`

---

## Quality baseline (Platform 4.0 at M7 gate)

| Metric               | Value                  |
| -------------------- | ---------------------- |
| Unit/component tests | **1098** (204 files)   |
| E2E tests            | **30**                 |
| Statement coverage   | **90.75%**             |
| ADRs accepted        | **32** (0010–0032)     |
| Milestone 6 verdict  | PASS WITH OBSERVATIONS |

M7 stories must maintain ≥80% statement coverage and zero regression in existing tests.

---

## Verdict

**APPROVED FOR MILESTONE 7 PLANNING**

Platform Version 4.0 is ready to support Activity & Timeline Framework implementation **after** owner approval of AT-001. The M6 Event Bus is the foundation for Activity Mapping as a parallel subscriber — independent of the Notification Framework. **Do not begin Sprint 007 implementation** until explicit owner sign-off on AT-001 equivalent to EN-001 / DF-001 / AF-001.

---

## Related documents

| Document                             | Path                                                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Platform v4.0 release                | [APZHUB-Platform-v4.0.md](../releases/APZHUB-Platform-v4.0.md)                                                 |
| Platform v4.0 review                 | [APZHUB-v4.0-Platform-Review.md](./APZHUB-v4.0-Platform-Review.md)                                             |
| Milestone 6 review                   | [MILESTONE-006-event-notification-framework-review.md](./MILESTONE-006-event-notification-framework-review.md) |
| SPR-006 closeout                     | [SPR-006-closeout.md](../sprint/SPR-006-closeout.md)                                                           |
| Event & Notification architecture    | [event-notification-framework.md](../architecture/event-notification-framework.md)                             |
| Notification → Activity relationship | [notification-framework.md](../architecture/notification-framework.md) § Relationship to Activity Framework    |
| Platform roadmap v2                  | [APZHUB-Platform-Roadmap-v2.md](../roadmap/APZHUB-Platform-Roadmap-v2.md)                                      |
| Platform governance                  | [APZHUB-Platform-Governance.md](../governance/APZHUB-Platform-Governance.md)                                   |

---

_SPR-007 Readiness Review — Platform Version 4.0._
