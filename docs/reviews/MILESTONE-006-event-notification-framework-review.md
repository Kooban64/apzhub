# Milestone 6 — Event & Notification Framework Review

> **Milestone:** 6 — Event & Notification Framework  
> **Sprint:** SPR-006  
> **Review date:** 2026-07-04  
> **Release:** `v0.6.0-event-notification-framework` (recommended — tag pending owner instruction)  
> **Verdict:** **PASS WITH OBSERVATIONS — Milestone 6 Complete**

---

## Executive summary

### What was achieved

Milestone 6 delivered `@apzhub/event-notification-framework` and integrated it into the authenticated APZHUB shell. Over eighteen sequential stories (EN-001–EN-018), the team implemented the Event Registry, in-process Event Bus, Notification Registry, Notification Mapper, Notification Service, Notification Presentation Layer, Notification Badge and Panel Experiences, Action audit integration, application wiring, E2E verification, complete documentation, governance updates, and sprint closeout.

SPR-001 through SPR-005 remain intact. Successful actions publish `capability.action.executed`; notification routes fan out to in-app inbox and toast items surfaced in the shell badge and panel — no parallel execution pipeline.

**1098 unit tests** and **30 E2E tests** pass at closeout. **90.75%** statement coverage. ADRs 0030–0032 are accepted.

### Overall verdict

**PASS WITH OBSERVATIONS**

Milestone 6 meets its approved scope. Deferred items (external delivery, persistent store, dedicated toast/banner UI, Activity subscriber) are documented, accepted, and scheduled for future milestones — not blocking release of the Event & Notification platform layer.

---

## Architecture assessment

| Criterion                             | Rating                                              |
| ------------------------------------- | --------------------------------------------------- |
| Layer separation                      | **Strong** — seven-step canonical pipeline enforced |
| Event / notification separation       | **Strong** — ADR-0032 compliant                     |
| Registry reuse                        | **Strong** — bootstrap + DTO filter pattern         |
| No parallel execution pipeline        | **Strong** — Action audit reuses executor           |
| Presentation vs Experience separation | **Strong** — Presentation Layer in ENF package      |
| Extension points                      | **Good** — routes, subscribers, experiences         |
| Baseline compliance                   | **Strong** — no v1.0 edits                          |

See [SPR-006 architecture review](./SPR-006-architecture-review.md) and [event-notification-framework.md](../architecture/event-notification-framework.md).

### Architecture summary

```text
Platform Capability → Domain Event → Event Bus → Notification Mapping
→ Notification Service → Notification Presentation Layer → Notification Experiences
```

---

## Engineering quality

| Criterion               | Rating                                               |
| ----------------------- | ---------------------------------------------------- |
| Phased story delivery   | **Strong** — 18 stories, stop-after-review gates     |
| Package structure       | **Strong** — index, server, react exports            |
| Shared context pattern  | **Strong** — `EventNotificationContext`              |
| Immutability            | **Strong** — frozen envelopes and notification items |
| Error handling          | **Good** — mapper issues, bus validation diagnostics |
| Technical debt tracking | **Good** — consolidated in sprint closeout           |

---

## Operational readiness

| Area                      | Status                                             |
| ------------------------- | -------------------------------------------------- |
| Health endpoint           | ✅ `events` + `notifications` on `/api/health`     |
| Dev diagnostics           | ✅ Hidden hooks (non-production)                   |
| In-process deployment     | ✅ Acceptable for current Next.js Node runtime     |
| E2E verification          | ✅ spr-006 (6 scenarios)                           |
| Production dashboards     | ⏳ Deferred — health sufficient for platform layer |
| External delivery         | ⏳ Deferred — channel stubs only                   |
| Cross-session persistence | ⏳ Deferred — session store only                   |

See [MILESTONE-006 production readiness](./MILESTONE-006-production-readiness.md).

---

## Quality metrics

| Metric                   | Closeout value       |
| ------------------------ | -------------------- |
| Unit/component tests     | **1098** (204 files) |
| E2E tests                | **30**               |
| Statement coverage       | **90.75%**           |
| Branch coverage          | 87.08%               |
| Function coverage        | 91.54%               |
| Lint / typecheck / build | ✅ All pass          |

---

## Known limitations

1. **In-process Event Bus** — events do not cross process boundaries; no broker transport
2. **Session-scoped notification store** — no persistence across reload or devices
3. **Toast route in panel list** — dedicated toast UI region deferred
4. **Banner / email / SMS / push / webhook** — route metadata stubs only
5. **E2E test hook** — `__APZHUB_E2E__` env-gated; not a product feature
6. **Service action handlers** — inherited M4 limitation; some palette actions fail without args
7. **RBAC population** — permission keys declared; full session enforcement Milestone 8
8. **Dual notifications per action** — inbox + toast routes for `capability.action.executed`

---

## Deferred capabilities

| Capability                               | Target                    |
| ---------------------------------------- | ------------------------- |
| Dedicated toast / banner Experiences     | Product UX story          |
| Activity timeline subscriber             | M7 Activity Framework     |
| Persistent event / notification store    | M8+                       |
| Email / SMS / push / webhook delivery    | M8+ Delivery Service      |
| External Event Bus (Redis/NATS)          | M10                       |
| Attention engine / digests / quiet hours | Document 021 future scope |
| Operational analytics dashboards         | Post-GA observability     |

---

## Documentation assessment

| Artifact                           | Status      |
| ---------------------------------- | ----------- |
| Combined architecture              | ✅ Complete |
| Subsystem docs                     | ✅ Updated  |
| Developer onboarding               | ✅ Complete |
| Architecture review                | ✅ Complete |
| Production readiness               | ✅ Complete |
| Sprint closeout                    | ✅ Complete |
| Release notes                      | ✅ Complete |
| Governance guides (4)              | ✅ Updated  |
| Spec index + 18 completion reports | ✅ Complete |

---

## Recommendation for release

**Recommend:** Accept Milestone 6 as complete. Optional owner action: create tag `v0.6.0-event-notification-framework`.

**Do not tag** without explicit owner instruction.

Milestone 6 delivers the **platform foundation** for events and in-app notifications. Commercial GA remains gated on Milestones 7–8 (Activity, Identity/RBAC, delivery/persistence) and business capabilities (M9+).

---

## Recommendation for Milestone 7

**Planning only.**

| Priority | Recommendation                                                                         |
| -------- | -------------------------------------------------------------------------------------- |
| 1        | Author Sprint 007 backlog — Activity Framework per Document 021                        |
| 2        | Design Activity as **parallel Event Bus subscriber** — not a notification extension    |
| 3        | Integrate Activity feed with Context Manager (M3) — avoid duplicate timeline models    |
| 4        | Preserve canonical event envelope — Activity items reference source events             |
| 5        | Defer real-time transport (WebSocket/SSE) to interface stubs until product requirement |

Do **not** begin Sprint 007 implementation until owner approves Milestone 6 closeout.

---

_Milestone 6 Event & Notification Framework Review — EN-018._
