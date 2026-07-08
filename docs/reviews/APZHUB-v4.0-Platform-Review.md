# APZHUB Platform Version 4.0 — Platform Review

> **Platform Version:** 4.0  
> **Review date:** 2026-07-04  
> **Scope:** Milestones 1–6 collective baseline — Runtime, Workbench, Action Framework, Knowledge & Discovery Framework, Event & Notification Framework  
> **Type:** Observations only — no redesign  
> **Verdict:** **PASS WITH OBSERVATIONS — Platform 4.0 baseline approved**

---

## Executive summary

Platform Version 4.0 consolidates six milestones into a coherent enterprise platform: manifest-driven Runtime, registry-based Workbench, unified Action execution, unified Knowledge discovery, and unified Event-driven in-app notifications. Milestone 6 added the Event & Notification layer without redesigning M1–M5.

**1098 unit tests**, **30 E2E tests**, **90.75%** statement coverage at Milestone 6 closeout. ADRs 0010–0032 accepted.

This review records **observations** across five primary platform capability frameworks plus Runtime and Workbench. It does not propose architectural redesign.

---

## Runtime

| Dimension             | Assessment                                                             |
| --------------------- | ---------------------------------------------------------------------- |
| Layering              | **Strong** — UI-agnostic; subsystem decomposition clear                |
| Dependency direction  | **Strong** — downward imports only                                     |
| Platform consistency  | **Strong** — Registry Pattern template for M3–M6                       |
| Reuse                 | **Strong** — Manifest Engine shared across extractions                 |
| Technical debt        | Event manifest extraction scaffolded — ENF bootstrap complete; RBAC M8 |
| Operational readiness | **Good** — health providers; extended incrementally by M4–M6           |

**M7 observation:** Activity bootstrap should extend manifest extraction via ADR — no orchestrator rewrite required.

---

## Workbench Framework

| Dimension             | Assessment                                                                     |
| --------------------- | ------------------------------------------------------------------------------ |
| Layering              | **Strong** — engines isolated; API-only access                                 |
| Dependency direction  | **Strong** — composes at apps/web with peer frameworks                         |
| Platform consistency  | **Strong** — Request Bus; session restore                                      |
| Reuse                 | **Strong** — navigation DTO consumed by KDF; shell regions for ENF Experiences |
| Technical debt        | Context panel Activity tab not yet wired — M7 scope                            |
| Operational readiness | **Good** — session persistence functional for current deployment               |

**M7 observation:** Timeline Experiences should mount in Context Manager region following Surface Pattern — no engine cross-calls.

---

## Action Framework

| Dimension             | Assessment                                                                   |
| --------------------- | ---------------------------------------------------------------------------- |
| Layering              | **Strong** — executor, registry, bridge separation                           |
| Dependency direction  | **Strong** — audit hook publishes events without changing execution path     |
| Platform consistency  | **Strong** — single executor in apps/web                                     |
| Reuse                 | **Strong** — primary event publisher for M6 (`capability.action.executed`)   |
| Technical debt        | Service handlers `NOT_IMPLEMENTED`; bridge id gaps for some manifest actions |
| Operational readiness | **Good** — health `commands` field; E2E spr-004                              |

**M7 observation:** Activity Mapping should consume audit events — not extend audit hook behaviour.

---

## Knowledge & Discovery Framework

| Dimension             | Assessment                                              |
| --------------------- | ------------------------------------------------------- |
| Layering              | **Strong** — six-layer model; Service public boundary   |
| Dependency direction  | **Strong** — providers project DTOs only                |
| Platform consistency  | **Strong** — ADR-0029 no parallel pipeline              |
| Reuse                 | **Strong** — Action/Workbench DTO projections           |
| Technical debt        | Overlay not shell-mounted; in-process orchestrator only |
| Operational readiness | **Good** — health `knowledge` field                     |

**M7 observation:** Optional future Event Bus subscriber for usage ranking — defer; not required for AT-001.

---

## Event & Notification Framework

| Dimension             | Assessment                                                                  |
| --------------------- | --------------------------------------------------------------------------- |
| Layering              | **Strong** — seven-step pipeline; event/notification separation             |
| Dependency direction  | **Strong** — mapper subscribes only; Experiences use Presentation hooks     |
| Platform consistency  | **Strong** — ADR-0030–0032; Registry Pattern throughout                     |
| Reuse                 | **Strong** — shared EventNotificationContext; production subscriber         |
| Technical debt        | App notification routes vs catalogue; session store only; toast UI deferred |
| Operational readiness | **Good** — health `events`/`notifications`; E2E spr-006                     |

**M7 observation:** Event Bus is ready for **parallel Activity Mapping subscriber** — mirror `wireAppEventNotifications()` pattern; do not route Activity through Notification Service.

---

## Cross-cutting assessment

### Layering

Platform 4.0 enforces consistent layering across M4–M6:

| Framework          | Public API                                                  | Internal         |
| ------------------ | ----------------------------------------------------------- | ---------------- |
| Action             | `execute()`                                                 | Executor, bridge |
| Knowledge          | `useKnowledgeService()`                                     | Orchestrator     |
| Event/Notification | `useNotificationService()`, `useNotificationPresentation()` | Bus, mapper      |

### Dependency direction

```text
Foundation → Runtime → Workbench → Platform Capabilities → apps/web composition
```

No package imports `apps/web`. ENF does not import Workbench engines.

### Platform consistency

| Pattern                  | M4  | M5  | M6  |
| ------------------------ | --- | --- | --- |
| Registry                 | ✅  | ✅  | ✅  |
| Bootstrap + filter + DTO | ✅  | ✅  | ✅  |
| Service boundary         | ✅  | ✅  | ✅  |
| Presentation Layer       | ✅  | ✅  | ✅  |
| Experience               | ✅  | ✅  | ✅  |
| Health extension         | ✅  | ✅  | ✅  |

### Reuse

- Parallel hydration in layout proven (M4–M6)
- Action audit hook as shared event source
- `@apzhub/workspace` hosts Experiences for Action, Knowledge, Notification surfaces

### Technical debt (consolidated)

| ID         | Item                         | Target                 |
| ---------- | ---------------------------- | ---------------------- |
| TD-EN15-01 | App notification routes      | Platform catalogue     |
| TD-EN15-03 | Duplicate `createRandomUuid` | Shared util            |
| TD-AF-M4   | Service action handlers      | M9 / platform services |
| TD-M8-RBAC | Permission population        | M8                     |
| TD-DF15-03 | Knowledge Overlay mount      | Product UX             |

### Operational readiness

| Area            | Status                        |
| --------------- | ----------------------------- |
| Quality gates   | ✅ All green at M6 closeout   |
| Health endpoint | ✅ Five framework summaries   |
| E2E             | ✅ 30 tests including spr-006 |
| Commercial GA   | ⏳ Requires M7–M10            |

---

## Readiness for Milestone 7

| Observation                 | Assessment                                                       |
| --------------------------- | ---------------------------------------------------------------- |
| Event Bus available         | **Ready** — in-process subscriber model proven                   |
| Parallel subscriber pattern | **Ready** — Notification Mapping template for Activity Mapping   |
| Activity ≠ Notification     | **Must enforce** — separate registries, services, stores         |
| Context panel extension     | **Ready** — Workbench Context Engine exists                      |
| Platform 4.0 documentation  | **Ready** — Reference Architecture, Patterns, Governance updated |
| No ENF redesign required    | **Confirmed**                                                    |

---

## Verdict

**PASS WITH OBSERVATIONS — Platform 4.0 baseline approved**

Platform 4.0 is the permanent architectural baseline for Milestone 7 planning. Observations are documented limitations and technical debt — not blocking approval.

**Recommendation:** Approve [SPR-007 planning](../sprint/SPR-007-activity-timeline-framework.md) and [SPR-007 readiness review](./SPR-007-readiness-review.md). Do **not** begin AT-001 implementation until owner instructs.

---

## Related documents

| Document                                                                             | Purpose              |
| ------------------------------------------------------------------------------------ | -------------------- |
| [Platform v4.0](../releases/APZHUB-Platform-v4.0.md)                                 | Official release     |
| [MILESTONE-006 review](./MILESTONE-006-event-notification-framework-review.md)       | M6 milestone verdict |
| [SPR-006 architecture review](./SPR-006-architecture-review.md)                      | ENF subsystem review |
| [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md) | Canonical patterns   |

---

_APZHUB Platform Version 4.0 — Platform Review._
