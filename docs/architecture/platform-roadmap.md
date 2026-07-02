# APZHUB Platform Roadmap

> **Status:** Complete — Milestone 4 (`v0.4.0-action-framework`, tag pending owner instruction)  
> **Authority:** [003 — Overall System Architecture](./003-overall-system-architecture-design-principles.md) · [019 — Command Palette](./019-universal-command-palette-action-framework.md) · [command-framework.md](./command-framework.md)  
> **Note:** Milestone 5 (Search Framework) is the next planning gate. Business capabilities remain Milestone 9+.

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
M5 Search Framework               ← Next planning gate
M6 Notification Framework
M7 Activity Framework
M8 Identity & Administration
M9 Business Capabilities
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

## Milestone 5 — Search Framework

### Objectives

Implement Unified Search per Document 020 — provider model, grouped results, permission-aware discovery.

### Platform capabilities

- Search provider registration
- Search orchestration engine
- Result grouping and ranking (framework level)
- Search UI integrated into header
- Index abstraction (interface only; no business indexes)

### Dependencies

- Milestone 3 Workbench Framework (header search slot)
- Milestone 4 Command Framework (search-as-command overlap)
- Platform Runtime search-provider capability kind

### Expected deliverables

- Search Framework package
- Provider API and scaffold providers
- Search overlay UI
- Documentation and tests

---

## Milestone 6 — Notification Framework

### Objectives

Implement Notification, Activity & Attention Management per Document 021.

### Platform capabilities

- Notification layer UI
- Activity stream model
- Attention engine (badge, priority)
- Event-to-notification mapping (framework hooks)
- Digest and quiet-hours hooks (interfaces)

### Dependencies

- Milestone 3 Workbench Framework (notification layer region)
- Event Bus (Document 029 — likely parallel or prerequisite sprint)
- Identity for user-scoped notifications

### Expected deliverables

- Notification Framework package
- Notification centre UI
- Activity stream scaffold
- Framework notification providers
- Documentation and tests

---

## Milestone 7 — Activity Framework

### Objectives

Deliver the Activity Stream and attention surfaces that unify user activity across the platform — distinct from Activity Bar navigation.

### Platform capabilities

- Activity feed aggregation
- Activity item model and rendering
- Context panel activity tab integration
- Real-time update hooks (WebSocket/SSE interfaces)
- Activity filtering by permission and workspace

### Dependencies

- Milestone 6 Notification Framework
- Milestone 3 Context Manager
- Event Bus for activity events

### Expected deliverables

- Activity Framework package
- Context panel activity integration
- Activity manifest kind support
- Documentation and tests

---

## Milestone 8 — Identity & Administration

### Objectives

Complete IAM integration with the Workbench Framework and deliver administration scaffolding per Documents 007 and platform administration references.

### Platform capabilities

- PermissionService consumed by Workbench Manager and sub-managers
- Role-aware registry filtering
- Administration workspace scaffold (no business admin)
- User preferences service integration (Document 023)
- Audit trail hooks for framework actions

### Dependencies

- Milestone 3–7 framework layers
- `@apzhub/auth` enhancement
- Platform data architecture (Document 011)

### Expected deliverables

- Permission integration across shell regions
- Administration framework routes (scaffold)
- Preferences persistence
- Security review and documentation

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
M2 Runtime ──► M3 Workbench ──► M4 Command ──► M5 Search
                    │                │
                    ▼                ▼
               M6 Notification ◄─────┘
                    │
                    ▼
               M7 Activity
                    │
                    ▼
               M8 Identity/Admin
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
