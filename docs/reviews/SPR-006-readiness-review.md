# SPR-006 — Readiness Review

> **Review date:** 2026-07-03  
> **Scope:** Platform Version 3.0 readiness to commence Milestone 6 — Event & Notification Framework  
> **Authority:** [APZHUB Platform v3.0](../releases/APZHUB-Platform-v3.0.md) · [Platform v3.0 Review](./APZHUB-v3.0-Platform-Review.md) · [SPR-006 sprint guide](../sprint/SPR-006-event-notification-framework.md)  
> **Verdict:** **APPROVED FOR MILESTONE 6 PLANNING — await owner approval before EN-001 implementation**

---

## Executive summary

Platform Version 3.0 provides a stable, tested, and documented foundation for the Event & Notification Framework. Runtime manifest discovery, parallel hydration, Registry Pattern, Service Pattern, and shell Experience composition are proven across M4 and M5. The Action Framework audit hook offers a ready first event publisher.

Milestone 6 planning documentation is complete. **Implementation must not begin** until owner approves EN-001 (ADRs and specifications).

**Recommendation:** **APPROVED FOR MILESTONE 6 PLANNING**

---

## Readiness assessment

| Area                   | Status   | Notes                                                                  |
| ---------------------- | -------- | ---------------------------------------------------------------------- |
| Architecture baseline  | ✅ Ready | v1.0 frozen; Platform 3.0 extends without redesign                     |
| Runtime bootstrap      | ✅ Ready | Manifest engine supports new blocks via ADR                            |
| Workbench shell        | ✅ Ready | Notification region planned as new Experience                          |
| Action Framework       | ✅ Ready | Audit hook extension point; no executor change                         |
| Knowledge Framework    | ✅ Ready | No M6 dependency; optional future subscriber                           |
| Hydration pattern      | ✅ Ready | M4/M5 parallel bootstrap reusable                                      |
| Health endpoint        | ✅ Ready | Incremental field pattern established                                  |
| Test infrastructure    | ✅ Ready | Vitest + Playwright; E2E auth fixtures                                 |
| Documentation patterns | ✅ Ready | Design Patterns doc authoritative for M6                               |
| Stub packages          | ✅ Ready | `@apzhub/events`, `@apzhub/notifications` await repurpose (EN-001 ADR) |

---

## Risks

| ID      | Risk                                                                    | Likelihood | Impact   | Mitigation                                                        |
| ------- | ----------------------------------------------------------------------- | ---------- | -------- | ----------------------------------------------------------------- |
| R-EN-01 | Package boundary confusion (`events` vs `notifications` vs unified ENF) | Medium     | Medium   | EN-001 ADR-0030 decides single vs split; document in spec index   |
| R-EN-02 | Scope creep into Activity Framework (M7)                                | Medium     | High     | Backlog explicitly defers Activity UI; interface stubs only       |
| R-EN-03 | Client-side Event Bus publish temptation                                | Low        | High     | ADR-0031 — server-only publish; client receives notification DTOs |
| R-EN-04 | Duplicate notification paths (modules notifying directly)               | Low        | High     | Document 021 rule enforced in code review; mapper-only creation   |
| R-EN-05 | Action audit wire changes executor behaviour                            | Low        | High     | EN-014 limited to audit hook; integration tests guard executor    |
| R-EN-06 | In-process bus inadequate for future scale                              | Known      | Low (M6) | Interface stubs for persistent/external bus; M10 scope            |
| R-EN-07 | RBAC not populated — notification filter incomplete                     | Known      | Medium   | Permission keys declared; allow-all dev adapter until M8          |
| R-EN-08 | E2E flakiness for notification timing                                   | Medium     | Medium   | Deterministic test seed hook (pattern from M5 palette mode)       |

---

## Open questions

| ID      | Question                                                                                            | Owner        | Target resolution                             |
| ------- | --------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------- |
| Q-EN-01 | Single `@apzhub/event-notification-framework` vs expand `@apzhub/events` + `@apzhub/notifications`? | Architecture | EN-001 ADR-0030                               |
| Q-EN-02 | Manifest block names: `events` vs `event.yaml` standalone files?                                    | Architecture | EN-001 + Document 029 alignment               |
| Q-EN-03 | Notification region: popover vs dedicated panel vs status bar integration?                          | Product/UX   | EN-013 spec (default: header popover + badge) |
| Q-EN-04 | Should Knowledge Framework subscribe to action events for usage ranking?                            | Architecture | Defer post-M6; optional EN-009 extension      |
| Q-EN-05 | Git tag for Platform 3.0 collective baseline?                                                       | Owner        | Owner decision — not blocking EN-001          |
| Q-EN-06 | Activity Framework (M7) start immediately after M6 or hardening sprint?                             | Owner        | Roadmap v2 — after M6 closeout                |

---

## Dependencies

### Satisfied (Platform 3.0)

| Dependency                                 | Status                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| Platform Runtime (M2)                      | ✅ Complete                                                              |
| Workbench Framework (M3)                   | ✅ Complete                                                              |
| Action Framework (M4)                      | ✅ Complete                                                              |
| Knowledge & Discovery (M5)                 | ✅ Complete                                                              |
| Registry Pattern documentation             | ✅ [Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md) |
| Document 021 (Notification framework spec) | ✅ Foundation doc                                                        |
| Document 029 (Event SDK spec)              | ✅ Foundation doc                                                        |
| Document 012 (EDA framework)               | ✅ Foundation doc                                                        |

### Required before EN-002 (implementation)

| Dependency                             | Status                 |
| -------------------------------------- | ---------------------- |
| Owner approval of SPR-006 sprint guide | ⏳ Pending             |
| Owner approval of SPR-006 backlog      | ⏳ Pending             |
| EN-001 ADRs accepted (0030–0032)       | ⏳ Blocked on approval |
| SPR-006 spec index                     | ⏳ Created in EN-001   |

### Not required for M6 foundation (deferred)

| Dependency                               | Deferred to               |
| ---------------------------------------- | ------------------------- |
| Full RBAC population                     | M8 Identity               |
| Persistent event store                   | M7/M10                    |
| External message broker                  | M10 Enterprise Operations |
| Activity timeline UI                     | M7 Activity Framework     |
| Push / email delivery                    | M8+                       |
| Identity-scoped multi-user notifications | M8                        |

---

## Recommendations

1. **Approve planning package** — sprint guide, backlog, readiness review, Platform v3.0 release docs before EN-001.
2. **Resolve Q-EN-01 in EN-001** — prefer unified `@apzhub/event-notification-framework` with clear `server/bus` and `server/registry` modules; repurpose existing stubs per ADR-0027 precedent.
3. **Keep M6 scope bounded** — in-process bus, in-app notifications, audit event wire only; defer Activity UI and external delivery.
4. **Follow Platform Design Patterns** — Registry, DTO, Hydration, Provider, Service, Presentation, Experience, Manifest, Bootstrap, Health, Diagnostics, Extension — all documented for EN stories.
5. **Maintain stop-after-review gates** — one story at a time; owner approval between stories (same as AF/DF).
6. **Extend health incrementally** — add `events` and `notifications` fields; do not redesign health endpoint.
7. **Plan E2E early in EN-016** — use diagnostics testid and seed hook; avoid timing-dependent assertions.
8. **Do not modify lower layers without ADR** — Runtime, Workbench, Action, Knowledge remain frozen except EN-014 audit wire (approved scope).

---

## Quality baseline (Platform 3.0 at M6 gate)

| Metric               | Value                  |
| -------------------- | ---------------------- |
| Unit/component tests | **872** (172 files)    |
| E2E tests            | **24**                 |
| Statement coverage   | **91.55%**             |
| ADRs accepted        | **29** (0010–0029)     |
| Milestone 5 verdict  | PASS WITH OBSERVATIONS |

M6 stories must maintain ≥80% statement coverage and zero regression in existing tests.

---

## Verdict

**APPROVED FOR MILESTONE 6 PLANNING**

Platform Version 3.0 is ready to support Event & Notification Framework implementation **after** owner approval of EN-001. Planning documentation is complete. **Do not begin Sprint 006 implementation** until explicit owner sign-off on EN-001 equivalent to AF-001 / DF-001.

---

## Related documents

| Document              | Path                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| SPR-006 sprint guide  | [SPR-006-event-notification-framework.md](../sprint/SPR-006-event-notification-framework.md)                  |
| SPR-006 backlog       | [SPR-006-event-notification-framework-backlog.md](../backlog/SPR-006-event-notification-framework-backlog.md) |
| Platform v3.0 review  | [APZHUB-v3.0-Platform-Review.md](./APZHUB-v3.0-Platform-Review.md)                                            |
| Platform v3.0 release | [APZHUB-Platform-v3.0.md](../releases/APZHUB-Platform-v3.0.md)                                                |
| Platform governance   | [APZHUB-Platform-Governance.md](../governance/APZHUB-Platform-Governance.md)                                  |

---

_SPR-006 Readiness Review — Platform Version 3.0._
