# APZHUB Platform Roadmap

> **Status:** Complete — Milestone 7 (`v0.7.0-activity-timeline-framework`, tag pending owner instruction) · **Platform Version 5.0**  
> **Authority:** [003 — Overall System Architecture](./003-overall-system-architecture-design-principles.md) · [021 — Notification & Activity](./021-notification-activity-attention-management-framework.md) · [Platform v5.0](../releases/APZHUB-Platform-v5.0.md)  
> **Note:** Milestone 8 (Platform Identity, Administration & User Experience) is the next planning gate. Business capabilities remain Milestone 9+.

---

## Overview

APZHUB development proceeds in **milestones** — each delivering a cohesive platform layer. Milestone 2 (Platform Runtime) and Milestone 3 (Workbench Framework) are complete. Milestone 4 begins the **Command Framework** era per Document 019.

Business capabilities (Projects, Support, Documents, etc.) are explicitly deferred until **Milestone 9**.

### Platform architecture layers

```text
Platform Runtime
        ↓
Workbench Framework          ← Milestone 3
        ↓
Platform Capabilities        ← Milestones 5–7
        ↓
Business Capabilities        ← Milestone 9+
        ↓
Business Data
```

```text
M1 Foundation (SPR-001)         ✅ Complete — v0.1.0-foundation
M2 Platform Runtime (SPR-002)   ✅ Complete — v0.2.0-platform-runtime
M3 Workbench Framework (SPR-003)  ✅ Complete — v0.3.0-workbench-framework (tag pending)
M4 Action Framework (SPR-004)     ✅ Complete — v0.4.0-action-framework (tag pending)
M5 Knowledge & Discovery (SPR-005)  ✅ Complete — v0.5.0-knowledge-discovery-framework (tag pending)
M6 Event & Notification (SPR-006)     ✅ Complete — v0.6.0-event-notification-framework (tag pending)
M7 Activity & Timeline (SPR-007)      ✅ Complete — v0.7.0-activity-timeline-framework (tag pending)
        ↓
Platform Version 5.0                  ✅ Permanent reference baseline
        ↓
M8 Platform Identity, Administration & UX  ← Next planning gate (SPR-008)
M9 Business Capabilities
M10 Enterprise Operations
```

---

## Milestone 3 — Workbench Framework

> **Status:** ✅ **Complete** — Sprint 003 (Phases 0–8). Recommended release: `v0.3.0-workbench-framework`.

### Objectives

Build the **Workbench Framework (WBF)** — the permanent workbench infrastructure that users interact with. Transform the static SPR-001 Desktop Shell into a registry-aware, permission-filtered, session-capable framework per Documents 005, 016, 017, and 018.

The Workbench Framework is the **first layer that depends on React** and the Desktop Shell. Capabilities publish **Workbench Requests** via the **Workbench API**; the Workbench Manager orchestrates all UI behaviour.

### Delivered (SPR-003)

| Deliverable                                    | Status |
| ---------------------------------------------- | ------ |
| `@apzhub/workbench-framework` package          | ✅     |
| Workbench Manager + 8 engines                  | ✅     |
| Workbench API v1.0 + Workbench Actions         | ✅     |
| Registry-driven Activity Bar and sidebar       | ✅     |
| View activation and route mapping              | ✅     |
| Session persistence (localStorage, ADR-0021)   | ✅     |
| Context and Selection engines                  | ✅     |
| AuthWorkbenchPermissionAdapter + server filter | ✅     |
| ADRs 0019–0023                                 | ✅     |
| 383 unit tests, 15 E2E tests                   | ✅     |

See [Milestone 3 review](../reviews/MILESTONE-003-workbench-framework-review.md) and [v0.3.0 release notes](../releases/v0.3.0-workbench-framework.md).

---

## Milestone 4 — Action Framework

> **Status:** ✅ **Complete** — Sprint 004 (AF-001–AF-021). Recommended release: `v0.4.0-action-framework`.

### Objectives

Implement the Universal Command Palette and unified action execution framework per Document 019.

### Delivered (SPR-004)

| Deliverable                                              | Status |
| -------------------------------------------------------- | ------ |
| `@apzhub/command-framework` package                      | ✅     |
| ActionRegistry, executor, bridge, shortcuts              | ✅     |
| Command Palette, global shortcuts, context menu, toolbar | ✅     |
| Platform Action Catalogue + manifest extraction          | ✅     |
| Server filter DTO + client hydration                     | ✅     |
| Application integration (`apps/web`)                     | ✅     |
| Gateway stubs (AI, voice, automation)                    | ✅     |
| ADRs 0024–0026                                           | ✅     |
| 672 unit tests, 19 E2E tests                             | ✅     |

See [command-framework.md](./command-framework.md), [M4 release notes](../releases/v0.4.0-action-framework.md), and [production readiness review](../reviews/SPR-004-production-readiness-review.md).

---

## Milestone 5 — Knowledge & Discovery Framework

> **Status:** ✅ **Complete** — Sprint 005 (DF-001–DF-018). Recommended release: `v0.5.0-knowledge-discovery-framework`.

### Objectives

Implement the Unified Search, Knowledge & Discovery Framework per Document 020 — Knowledge Sources, registry, orchestrator query, ranking, Knowledge Service, Presentation Layer, and Knowledge Experiences integrated with Action and Workbench registries.

### Delivered (SPR-005)

| Deliverable                                                     | Status |
| --------------------------------------------------------------- | ------ |
| `@apzhub/knowledge-discovery-framework` package                 | ✅     |
| Knowledge Registry + bootstrap + DTO filter                     | ✅     |
| Action + Workbench navigation providers                         | ✅     |
| Orchestrator + RankingEngine                                    | ✅     |
| Knowledge Service + `useKnowledgeService()`                     | ✅     |
| Knowledge Presentation Layer + Overlay + palette knowledge mode | ✅     |
| Application integration (`apps/web`)                            | ✅     |
| E2E verification (spr-005)                                      | ✅     |
| ADRs 0027–0029                                                  | ✅     |
| Documentation, governance, closeout                             | ✅     |
| 872 unit tests, 24 E2E tests                                    | ✅     |

See [knowledge-discovery-framework.md](./knowledge-discovery-framework.md), [M5 review](../reviews/MILESTONE-005-knowledge-discovery-framework-review.md), and [v0.5.0 release notes](../releases/v0.5.0-knowledge-discovery-framework.md).

---

## Milestone 5 (historical planning) — Search Framework

> **Superseded by delivered Milestone 5 above.** The sprint scope evolved from generic "Search Framework" to the full Knowledge & Discovery Framework with explicit layering (Sources → Registry → Query API → Presentation Layer → Experiences).

### Original objectives (Document 020 alignment)

Implement Unified Search — provider model, grouped results, permission-aware discovery.

### Deferred to future milestones

| Item                     | Notes                                              |
| ------------------------ | -------------------------------------------------- |
| Header search UI         | Knowledge Overlay wired; shell activation deferred |
| Semantic / vector search | Ranking scaffolds; index tier M8+                  |
| Index persistence        | Interface-level abstraction only                   |

---

## Milestone 6 — Event & Notification Framework

> **Status:** ✅ **Complete** — Sprint 006 (EN-001–EN-018). Recommended release: `v0.6.0-event-notification-framework`.

### Objectives

Implement the Event & Notification Framework per Documents 021 and 029 — Event Registry, Event Bus, Notification Registry, Mapper, Service, Presentation Layer, and in-app Notification Experiences integrated with Action audit.

### Delivered (SPR-006)

| Deliverable                                         | Status |
| --------------------------------------------------- | ------ |
| `@apzhub/event-notification-framework` package      | ✅     |
| Event Registry + Event Bus + bootstrap + DTO filter | ✅     |
| Notification Registry + Mapper + Service            | ✅     |
| Notification Presentation Layer + hooks             | ✅     |
| Notification Badge + Panel Experiences              | ✅     |
| Action audit → `capability.action.executed`         | ✅     |
| Application integration (`apps/web`)                | ✅     |
| E2E verification (spr-006)                          | ✅     |
| ADRs 0030–0032                                      | ✅     |
| Documentation, governance, closeout                 | ✅     |
| 1098 unit tests, 30 E2E tests                       | ✅     |

See [event-notification-framework.md](./event-notification-framework.md), [M6 review](../reviews/MILESTONE-006-event-notification-framework-review.md), and [v0.6.0 release notes](../releases/v0.6.0-event-notification-framework.md).

### Deferred to future milestones

| Item                          | Notes                                      |
| ----------------------------- | ------------------------------------------ |
| Toast / banner dedicated UI   | Routes registered; panel lists toast items |
| Email / SMS / push / webhook  | Channel stubs; Delivery Service M8+        |
| Persistent notification store | Session-scoped only                        |
| External Event Bus transport  | In-process; broker M10                     |
| Activity subscriber           | M7 Activity Framework                      |
| Attention engine / digests    | Document 021 future scope                  |

---

## Milestone 6 (historical planning) — Notification Framework

> **Superseded by delivered Milestone 6 above.** Sprint scope delivered Event & Notification as a unified framework with explicit separation and the canonical seven-step pipeline.

### Original objectives (Document 021 alignment)

Implement Notification, Activity & Attention Management — notification layer UI, activity stream model, attention engine hooks.

### Scope delivered vs deferred

| Planned                                | Delivered in M6 | Deferred |
| -------------------------------------- | --------------- | -------- |
| Notification Framework package         | ✅              | —        |
| Notification centre UI (badge + panel) | ✅              | —        |
| Event-to-notification mapping          | ✅              | —        |
| Activity stream                        | ✅              | M7       |
| External delivery                      | —               | M8+      |
| Digest / quiet hours                   | —               | M8+      |

---

## Milestone 7 — Activity & Timeline Framework

> **Status:** ✅ **Complete** — Sprint 007 (AT-001–AT-016). Recommended release: `v0.7.0-activity-timeline-framework` (tag pending owner instruction).

### Objectives

Deliver unified activity recording and timeline presentation from platform events — distinct from notifications and audit persistence.

### Platform capabilities (delivered)

- Activity Registry and Timeline Registry
- Manifest bootstrap (`activities.types`, `activities.timelines`)
- Event-to-Activity Mapper (parallel Event Bus subscriber)
- Activity Service and Presentation Layer
- Timeline Experiences and Context Panel Activity tab
- Application integration and E2E verification
- Complete documentation and governance

### Dependencies

- Milestone 6 Event & Notification Framework
- Milestone 3 Workbench Framework (Context Panel)
- Milestone 4 Action Framework (audit hook)

### Deferred to future milestones

- User state (viewed/unread) — M8+
- Live subscriptions — post-M7
- Persistent activity store — M8+
- Search / filtering UI — product story
- Event replay — M10+

See [activity-timeline-framework.md](./activity-timeline-framework.md) · [SPR-007 closeout](../sprint/SPR-007-closeout.md).

## Milestone 8 — Platform Identity, Administration & User Experience

> **Status:** Planning complete — await owner approval before IAUX-001

### Objectives

Complete IAM integration with the Workbench Framework and deliver administration scaffolding and persistent user experience state per Documents 007 and 023.

### Platform capabilities

- PermissionService consumed by Workbench Manager and all registry DTO filters
- Role-aware registry filtering (real RBAC — replaces dev allow-all adapter)
- User administration scaffold (platform users — not business HR)
- Role administration scaffold
- RBAC administration UI in admin workspace
- User preferences persistence (Document 023)
- Workspace and theme persistence
- Administration workspace scaffold (no business admin)
- Platform configuration visibility
- Audit visibility for framework actions
- Security review

### Dependencies

- Platform Version 5.0 (Milestones 1–7)
- `@apzhub/auth` enhancement
- Platform data architecture (Document 011)

### Expected deliverables

- PermissionService and session adapter
- Admin workspace with user/role views
- Preference persistence service
- Security review and documentation
- `v0.8.0-platform-identity-administration-ux` release notes (tag pending)

See [SPR-008 sprint guide](../sprint/SPR-008-platform-identity-administration-ux.md) · [SPR-008 readiness review](../reviews/SPR-008-readiness-review.md).

---

## Milestone 9 — Business Capabilities

### Objectives

Introduce first business modules (Projects, Documents, Support, etc.) as capabilities loaded into the completed Workbench Framework via Workbench Requests.

### Platform capabilities

- Module SDK consumption (Document 025)
- Business service integration (Document 027)
- External integrations (Document 026) — Plane, Kimai, etc. as approved
- Registry-driven business workspaces on Activity Bar
- End-to-end business workflows

### Dependencies

- Milestones 3–8 complete
- Platform Service Layer (Document 009)
- Module connector architecture (Document 008)

### Expected deliverables

- First business module(s) per product roadmap
- Integration adapters as scoped
- Business E2E test suites
- Production deployment readiness review

---

## Cross-milestone dependencies

```text
M2 Runtime ──► M3 Workbench ──► M4 Command ──► M5 Knowledge & Discovery ──► M6 Notification
                    │                │
                    ▼                ▼
               M6 Notification ◄─────┘
                    │
                    ▼
               M7 Activity & Timeline ✅
                    │
                    ▼
               M8 Identity/Admin/UX ← Next planning gate
                    │
                    ▼
               M9 Business
```

**Event Bus** (Document 029) spans Milestones 4–7 — recommend dedicated sprint before or during Milestone 4.

**Presentation Engine** (Document 022) — theme registry exists at runtime; full Presentation Engine aligns with Milestone 3–4.

---

## Out of scope (all milestones until M9)

- Business domain logic
- External OSS engine integrations (unless explicitly scoped)
- Registry administration UI
- Public Registry REST API
- Mobile-native clients (interfaces may be designed; implementation deferred)

---

_Platform roadmap — planning document. Updated at architecture refinement (pre-Sprint 003)._
