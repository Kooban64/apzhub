# APZHUB Platform Roadmap v2

> **Platform Version:** 4.0 (permanent baseline established)  
> **Status:** Active roadmap — Milestones 7–10  
> **Authority:** [Document 003](../003-overall-system-architecture-design-principles.md) · [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md)  
> **Rule:** Future milestones **extend** Platform 4.0. They do **not** redesign it.

---

## Overview

Platform Version 4.0 (Milestones 1–6) delivers the permanent foundation: Runtime, Workbench, Action Framework, Knowledge & Discovery Framework, Event & Notification Framework, and application integration. Roadmap v2 describes the next platform evolution through **Milestone 10**.

Business capabilities remain **Milestone 9+**. Enterprise operations mature at **Milestone 10**.

```text
Platform 2.0 ✅ (M1–M4)
        ↓
M5  Knowledge & Discovery Framework ✅
        ↓
M6  Event & Notification Framework ✅
        ↓
Platform 4.0 ✅ (M1–M6 collective baseline)
        ↓
M7  Activity & Timeline Framework
        ↓
M8  Identity & Administration
        ↓
M9  Business Capabilities
        ↓
M10 Enterprise Operations
```

---

## Milestone 5 — Knowledge & Discovery Framework ✅ Complete

> **Sprint:** SPR-005 — **Closed**  
> **Release:** `v0.5.0-knowledge-discovery-framework` (tag pending owner instruction)  
> **Verdict:** PASS WITH OBSERVATIONS

See [SPR-005 closeout](../sprint/SPR-005-closeout.md) · [Platform v3.0](../releases/APZHUB-Platform-v3.0.md) (historical M1–M5 baseline).

---

## Milestone 6 — Event & Notification Framework ✅ Complete

> **Sprint:** SPR-006 — **Closed**  
> **Release:** `v0.6.0-event-notification-framework` (tag pending owner instruction)  
> **Verdict:** PASS WITH OBSERVATIONS  
> **Authority:** [Document 021](../021-notification-activity-attention-management-framework.md) · [Document 029](../029-platform-event-sdk-event-bus-event-manifest-specification.md)

### Delivered

- `@apzhub/event-notification-framework` — Event Registry, Event Bus, Notification Registry, Mapper, Service, Presentation Layer
- Notification Badge + Panel Experiences; Action audit → `capability.action.executed`
- Application integration — shared context, health `events` / `notifications`
- ADRs 0030–0032 · **1098 tests** · **30 E2E** · **90.75%** coverage (Platform 4.0 closeout)

**Closeout:** [SPR-006-closeout.md](../sprint/SPR-006-closeout.md) · [Platform v4.0](../releases/APZHUB-Platform-v4.0.md)

---

## Milestone 7 — Activity & Timeline Framework

> **Sprint:** SPR-007 — **Planning complete** — await owner approval before AT-001  
> **Authority:** [Document 021](../021-notification-activity-attention-management-framework.md) · [Document 012](../012-event-driven-architecture-background-processing-workflow-framework.md)

### Objectives (high-level)

1. Establish **Activity Registry** and **Timeline Registry** for activity types and timeline scopes
2. Implement **Activity Mapping** as an independent Event Bus subscriber — not a notification extension
3. Deliver **Activity Service** public API and **Activity Presentation Layer**
4. Deliver **Timeline Experiences** — context panel activity tab and timeline feed scaffold
5. Extend bootstrap, hydration, health, and diagnostics following Platform 4.0 Reference Patterns

### Canonical pipeline

```text
Platform Capability → Domain Event → Event Bus → Activity Mapping
→ Activity Service → Activity Presentation Layer → Timeline Experiences
```

**Not in scope:** audit persistence, notification delivery, event store, module-direct activity writes.

### Platform capabilities (planned)

| Capability           | Scope                                            |
| -------------------- | ------------------------------------------------ |
| Activity Registry    | Activity types, templates, presentation metadata |
| Timeline Registry    | Personal, team, workspace timeline scopes        |
| Activity Mapping     | Event Bus subscriber → ActivityItem              |
| Activity Service API | `useActivityService()` public boundary           |
| Timeline Experiences | Context panel + feed scaffold                    |
| Health extension     | `/api/health` `activities` field (planned)       |

### Dependencies

| Dependency                | Status                                     |
| ------------------------- | ------------------------------------------ |
| Platform 4.0 (M1–M6)      | ✅ Required                                |
| Event Bus (M6)            | ✅ Required — parallel subscriber model    |
| Workbench Context Engine  | ✅ Required — timeline mount region        |
| Notification Framework    | ✅ Peer consumer — no dependency           |
| Persistent activity store | ⏳ Deferred — session-scoped M7 foundation |

### Constraints

- **Not** an audit framework or event store
- **Not** a notification framework — independent Event Bus subscriber
- **No** Runtime/Workbench/Action/Knowledge/ENF redesign
- **No** module-direct activity record writes

**Planning:** [SPR-007 sprint guide](../sprint/SPR-007-activity-timeline-framework.md) · [SPR-007 backlog](../backlog/SPR-007-activity-timeline-framework-backlog.md) · [Readiness review](../reviews/SPR-007-readiness-review.md)

---

## Milestone 8 — Identity & Administration

> **Authority:** [Document 007 — IAM & RBAC](../007-identity-authentication-authorisation-rbac-architecture.md)

### Objectives (high-level)

Complete identity, authorisation, and administration infrastructure — full RBAC population, server session sync, audit log persistence, SSO hooks.

### Dependencies

Auth scaffold (M1), permission adapter structure (M3–M6), Platform data architecture (Document 011).

---

## Milestone 9 — Business Capabilities

> **Authority:** [Document 008](../008-module-plugin-connector-architecture.md) · [Document 025](../025-module-sdk-module-manifest-module-development-standard.md)

### Objectives (high-level)

First business capabilities on the platform — view mount pipeline, Module SDK production readiness, platform service action handlers.

**Rule:** No business modules before M9 planning approval.

---

## Milestone 10 — Enterprise Operations

> **Authority:** [Document 014](../014-observability-monitoring-telemetry-health-framework.md) · [Document 015](../015-software-quality-testing-qa-cicd-release-management-framework.md)

### Objectives (high-level)

Enterprise-grade operations — observability, deployment automation, compliance, external Event Bus transport, delivery services.

---

## Dependency graph

```text
M1 Foundation ─────────────────────────────────────────────┐
M2 Runtime ────────────────────────────────────────────────┤
M3 Workbench ──────────────────────────────────────────────┤ Platform 2.0 ✅
M4 Action Framework ───────────────────────────────────────┤
M5 Knowledge & Discovery ──────────────────────────────────┤
M6 Event & Notification ───────────────────────────────────┤ Platform 4.0 ✅
        │
        ├──► M7 Activity & Timeline Framework
        │
        └──► M8 Identity & Administration
                      │
                      └──► M9 Business Capabilities
                                │
                                └──► M10 Enterprise Operations
```

---

## Technical debt carried into M7+

| ID         | Item                                | Target        |
| ---------- | ----------------------------------- | ------------- |
| TD-EN15-01 | App notification routes → catalogue | M6+ hardening |
| TD-EN16-02 | Toast UI deferred                   | Product UX    |
| TD-AF-M4   | Service action handlers             | M9            |
| TD-M8-RBAC | Permission population               | M8            |
| TD-DF15-03 | Knowledge Overlay shell mount       | Product UX    |

---

## Sprint 007 gate

**Do not begin SPR-007 implementation** until:

1. Platform Version 4.0 baseline approved
2. Owner approves [SPR-007 sprint guide](../sprint/SPR-007-activity-timeline-framework.md) and [SPR-007 backlog](../backlog/SPR-007-activity-timeline-framework-backlog.md)
3. [SPR-007 readiness review](../reviews/SPR-007-readiness-review.md) acknowledged
4. AT-001 ADRs and specs approved

---

_APZHUB Platform Roadmap v2 — post Platform 4.0 evolution._
