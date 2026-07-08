# APZHUB Platform Version 4.0

> **Platform Version:** 4.0  
> **Status:** Official Platform Release Document — **permanent architectural baseline**  
> **Date:** 2026-07-04  
> **Authority:** [Document 000 — Engineering Constitution](../000-apzhub-engineering-constitution.md) · [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md) · [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md)  
> **Change control:** Platform 4.0 extends Baseline v1.0 and supersedes Platform 3.0 as the **definitive reference baseline**. Baseline v1.0 remains frozen; modifications still require ADR.

---

## Executive Summary

APZHUB Platform Version 4.0 is the culmination of **Milestones 1 through 6** — six coordinated engineering programmes that deliver a runnable, manifest-driven, permission-aware enterprise workbench with unified action execution, unified knowledge discovery, and unified event-driven in-app notifications.

Platform 4.0 adds the **Event & Notification Framework** on top of Platform 3.0 without redesigning lower layers. Successful actions publish domain events through an in-process Event Bus; notification routes map to shell badge and panel Experiences through a public Notification Service and Presentation Layer.

**1098 unit tests**, **30 E2E tests**, and **90.75%** statement coverage at Milestone 6 closeout. Platform 4.0 is the **permanent engineering baseline** for Milestone 7 (Activity & Timeline Framework) and beyond — not a commercial general availability release.

---

## Platform Vision

APZHUB is an **Enterprise Operating Platform**: a single desktop-style application through which users interact with enterprise capabilities without exposure to underlying backend systems.

Platform 4.0 realises:

- **One workbench** — registry-driven navigation, session persistence, shell presentation
- **One runtime** — manifest discovery, capability registration, lifecycle, health
- **One action model** — palette, shortcuts, context menu, toolbar, Workbench API share one executor
- **One knowledge layer** — unified discovery across Action, Workbench, and manifest sources
- **One event model** — platform-owned Event Bus with standard envelopes and registry bootstrap
- **One notification model** — event-to-notification mapping; modules never notify directly
- **One extension model** — YAML manifests; server bootstrap, permission filter, client hydration

Milestones 1–6 **extended** the layer below without breaking consumers above.

---

## Milestones 1–6 Delivered

| Milestone                      | Sprint  | Layer                                                    | Release                                |
| ------------------------------ | ------- | -------------------------------------------------------- | -------------------------------------- |
| **M1 — Foundation**            | SPR-001 | Monorepo, auth, design system, shell, CI                 | `v0.1.0-foundation`                    |
| **M2 — Platform Runtime**      | SPR-002 | Manifest engine, registry, lifecycle, health             | `v0.2.0-platform-runtime`              |
| **M3 — Workbench Framework**   | SPR-003 | Manager, engines, API, session, navigation               | `v0.3.0-workbench-framework`           |
| **M4 — Action Framework**      | SPR-004 | Action registry, executor, surfaces, app wiring          | `v0.4.0-action-framework`              |
| **M5 — Knowledge & Discovery** | SPR-005 | Knowledge registry, orchestrator, service, experiences   | `v0.5.0-knowledge-discovery-framework` |
| **M6 — Event & Notification**  | SPR-006 | Event Bus, notification service, badge/panel experiences | `v0.6.0-event-notification-framework`  |

```text
M1 Foundation
        ↓
M2 Platform Runtime
        ↓
M3 Workbench Framework
        ↓
M4 Action Framework
        ↓
M5 Knowledge & Discovery Framework
        ↓
M6 Event & Notification Framework
        ↓
Platform Version 4.0  →  Permanent reference baseline
```

---

## Framework Summary

### Platform Runtime (M2)

UI-agnostic orchestration — manifest discovery, capability registry, lifecycle, health.

**Package:** `@apzhub/platform-runtime`

### Workbench Framework (M3)

User interaction orchestration — eight engines, Workbench API, session persistence, permission adapter.

**Package:** `@apzhub/workbench-framework`

### Action Framework (M4)

Unified action registration, discovery, permission filtering, execution, audit hook.

**Package:** `@apzhub/command-framework`

### Knowledge & Discovery Framework (M5)

Unified knowledge layer — sources, registry, orchestrator, ranking, **Knowledge Service**, Presentation Layer, Experiences.

**Package:** `@apzhub/knowledge-discovery-framework`  
**Public API:** `useKnowledgeService()`

### Event & Notification Framework (M6)

Unified event and notification layer — Event Registry, Event Bus, Notification Registry, Mapper, **Notification Service**, Presentation Layer, Experiences.

**Package:** `@apzhub/event-notification-framework`  
**Public APIs:** `useNotificationService()`, `useNotificationPresentation()`

**Canonical layering:**

```text
Platform Capability → Domain Event → Event Bus → Notification Mapping
→ Notification Service → Notification Presentation Layer → Notification Experiences
```

See [event-notification-framework.md](../architecture/event-notification-framework.md).

---

## Architecture Summary

### Layer stack (Platform 4.0)

```text
Business Capabilities (M9+)
        ↓
Platform Capabilities (M4–M7)
  Action Framework ✅
  Knowledge & Discovery ✅
  Event & Notification ✅
  Activity & Timeline (M7 — planned)
        ↓
Workbench Framework (M3) ✅
        ↓
Platform Runtime (M2) ✅
        ↓
Foundation (M1) ✅
```

### Framework interactions

```text
Runtime.bootstrap()
        ↓
┌──────────────┬──────────────┬──────────────┬─────────────────────┐
│ Workbench    │ Action       │ Knowledge    │ Event/Notification  │
│ Registry     │ Registry     │ Registry     │ Registries + Bus    │
└──────┬───────┴──────┬───────┴──────┬───────┴──────────┬──────────┘
       ▼              ▼              ▼                  ▼
Workbench API   ActionExecutor  Knowledge Service   Notification Service
       │              │              │                  │
       │              │ publish      │                  │ subscribe
       │              └──────────────┴──────────────────┘
       │                              Event Bus
       └──────────────────────────────┴──────────────────┐
                                                          ▼
                                                   Desktop Shell
              (actions · knowledge · notifications)
```

**Rules preserved in M6:**

- Events ≠ notifications — orthogonal concepts ([ADR-0032](../adr/ADR-0032-notification-routing-model.md))
- Activity & Timeline (M7) will subscribe to Event Bus independently — not via Notification Service
- Registry Pattern — server authority, client read-only DTO
- Downward dependency direction only

See [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md) and [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md).

---

## Engineering Statistics

| Metric                        | Value (M6 closeout)                |
| ----------------------------- | ---------------------------------- |
| Milestones completed          | **6**                              |
| Platform version              | **4.0**                            |
| Sprints completed             | SPR-001 through SPR-006            |
| Engineering stories (SPR-006) | 18 (EN-001 – EN-018)               |
| Engineering stories (SPR-005) | 18 (DF-001 – DF-018)               |
| Engineering stories (SPR-004) | 22 (AF-001 – AF-022)               |
| Total phased deliverables     | 108+ stories across M1–M6          |
| Architecture Decision Records | **32** accepted (0030–0032 for M6) |
| Foundation documents          | 000 + 001–029                      |
| Sprint completion reports     | 54+ across M1–M6                   |

### Major packages (M1–M6)

| Package                                 | Layer                           | Milestone         |
| --------------------------------------- | ------------------------------- | ----------------- |
| `@apzhub/platform-runtime`              | Runtime                         | M2                |
| `@apzhub/workbench-framework`           | Workbench                       | M3                |
| `@apzhub/command-framework`             | Action Framework                | M4                |
| `@apzhub/knowledge-discovery-framework` | Knowledge & Discovery           | M5                |
| `@apzhub/event-notification-framework`  | Event & Notification            | M6                |
| `@apzhub/workspace`                     | Shell / surfaces / presentation | M1 + M4 + M5 + M6 |
| `@apzhub/ui`                            | Design system                   | M1                |
| `apps/web`                              | Application integration         | M1–M6             |

---

## Test Statistics

| Metric                 | Value                   |
| ---------------------- | ----------------------- |
| Unit / component tests | **1098**                |
| E2E tests              | **30**                  |
| Test files             | 204                     |
| Playwright suites      | spr-001 through spr-006 |

### E2E coverage highlights

- Authentication and shell hydration
- Workbench navigation and session restore
- Action Framework surfaces and execution
- Knowledge Service health, diagnostics, palette knowledge mode
- Event & Notification health, badge, panel, action-audit flow
- Accessibility (axe) on login and shell

---

## Coverage

| Scope                | Statements | Branches | Functions | Lines  |
| -------------------- | ---------- | -------- | --------- | ------ |
| Monorepo (All files) | **90.75%** | 87.08%   | 91.54%    | 90.75% |

Quality gate threshold: ≥ 80% statements (enforced in `vitest.config.ts`).

---

## Production Readiness

**Verdict:** **PASS WITH OBSERVATIONS** — platform layer ready; commercial GA deferred.

| Area                    | Assessment                                                      |
| ----------------------- | --------------------------------------------------------------- |
| Platform layer (M1–M6)  | Ready for continued evolution                                   |
| Health endpoints        | Runtime, commands, knowledge, events, notifications operational |
| Application integration | Authenticated shell fully wired                                 |
| Event Bus               | In-process only — acceptable for current deployment             |
| Notification delivery   | In-app only — external channels deferred                        |
| RBAC depth              | Deferred to M8                                                  |
| Service handlers        | Partial — `NOT_IMPLEMENTED` for some actions                    |
| Commercial GA           | Requires M7–M10 programme                                       |

See [MILESTONE-006 review](../reviews/MILESTONE-006-event-notification-framework-review.md) and [Platform v4.0 review](../reviews/APZHUB-v4.0-Platform-Review.md).

---

## Deferred Capabilities

| Capability                            | Target                 |
| ------------------------------------- | ---------------------- |
| Activity & Timeline Framework         | M7 — planning complete |
| Dedicated toast / banner UI           | Product UX story       |
| Email / SMS / push / webhook delivery | M8+ Delivery Service   |
| Persistent event / notification store | M8+                    |
| External Event Bus transport          | M10                    |
| Semantic / vector search              | M8+ index tier         |
| Full RBAC population                  | M8 Identity            |
| Business capability modules           | M9                     |
| Enterprise operations                 | M10                    |

Consolidated technical debt: [SPR-006 closeout](../sprint/SPR-006-closeout.md).

---

## Future Roadmap

| Milestone | Theme                             | Status                                              |
| --------- | --------------------------------- | --------------------------------------------------- |
| **M7**    | **Activity & Timeline Framework** | **Next — planning complete; await AT-001 approval** |
| M8        | Identity & Administration         | Planned                                             |
| M9        | Business Capabilities             | Planned                                             |
| M10       | Enterprise Operations             | Planned                                             |

See [Platform Roadmap v2](../roadmap/APZHUB-Platform-Roadmap-v2.md) and [SPR-007 planning](../sprint/SPR-007-activity-timeline-framework.md).

---

## Release History

| Release (recommended)                  | Milestone        | Status                        |
| -------------------------------------- | ---------------- | ----------------------------- |
| `v0.1.0-foundation`                    | M1               | Tag pending owner instruction |
| `v0.2.0-platform-runtime`              | M2               | Tag pending owner instruction |
| `v0.3.0-workbench-framework`           | M3               | Tag pending owner instruction |
| `v0.4.0-action-framework`              | M4               | Tag pending owner instruction |
| `v0.5.0-knowledge-discovery-framework` | M5               | Tag pending owner instruction |
| `v0.6.0-event-notification-framework`  | M6               | Tag pending owner instruction |
| **Platform Version 4.0**               | M1–M6 collective | **This document**             |

---

## Platform Version

```text
┌─────────────────────────────────────────────┐
│         APZHUB Platform Version 4.0          │
│                                              │
│  M1 Foundation              ✅               │
│  M2 Platform Runtime        ✅               │
│  M3 Workbench Framework     ✅               │
│  M4 Action Framework        ✅               │
│  M5 Knowledge & Discovery   ✅               │
│  M6 Event & Notification    ✅               │
│                                              │
│  Baseline v1.0 frozen · Platform 4.0 active  │
└─────────────────────────────────────────────┘
```

Future milestones **extend** Platform 4.0. They do **not** redesign it.

**Do not begin Sprint 007 implementation** until owner approves AT-001 equivalent.

---

## Related Documents

| Document                                                                                     | Purpose                         |
| -------------------------------------------------------------------------------------------- | ------------------------------- |
| [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md) | Master consolidation (v4.0)     |
| [Platform Reference Patterns](../architecture/APZHUB-Platform-Reference-Patterns.md)         | Authoritative pattern reference |
| [Platform Governance](../governance/APZHUB-Platform-Governance.md)                           | Lifecycle and standards         |
| [Platform v4.0 Review](../reviews/APZHUB-v4.0-Platform-Review.md)                            | Formal platform assessment      |
| [SPR-007 Readiness](../reviews/SPR-007-readiness-review.md)                                  | M7 planning readiness           |

---

_APZHUB Platform Version 4.0 — official release document._
