# APZHUB Platform Version 3.0

> **Platform Version:** 3.0  
> **Status:** Official Platform Release Document — **new architectural baseline**  
> **Date:** 2026-07-03  
> **Authority:** [Document 000 — Engineering Constitution](../000-apzhub-engineering-constitution.md) · [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md) · [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md)  
> **Change control:** Platform 3.0 extends Baseline v1.0 and supersedes Platform 2.0 as the **definitive reference baseline**. Baseline v1.0 remains frozen; modifications still require ADR.

---

## Executive Summary

APZHUB Platform Version 3.0 is the culmination of **Milestones 1 through 5** — five coordinated engineering programmes that deliver a runnable, manifest-driven, permission-aware enterprise workbench with unified action execution and unified knowledge discovery.

Platform 3.0 adds the **Knowledge & Discovery Framework** on top of the Platform 2.0 foundation (Runtime, Workbench, Action Framework) without redesigning lower layers. Knowledge queries flow through a public **Knowledge Service**; selections route through existing Action and Workbench execution paths.

**872 unit tests**, **24 E2E tests**, and **91.55%** statement coverage at Milestone 5 closeout. Platform 3.0 is the **engineering baseline** for Milestone 6 (Event & Notification Framework) and beyond — not a commercial general availability release.

---

## Platform Vision

APZHUB is an **Enterprise Operating Platform**: a single desktop-style application through which users interact with enterprise capabilities without exposure to underlying backend systems.

Platform 3.0 realises:

- **One workbench** — registry-driven navigation, session persistence, shell presentation
- **One runtime** — manifest discovery, capability registration, lifecycle, health
- **One action model** — palette, shortcuts, context menu, toolbar, Workbench API share one executor
- **One knowledge layer** — unified discovery across Action, Workbench, and manifest sources
- **One extension model** — YAML manifests; server bootstrap, permission filter, client hydration

Milestones 1–5 **extended** the layer below without breaking consumers above.

---

## Milestones 1–5 Delivered

| Milestone                      | Sprint  | Layer                                                  | Release                                |
| ------------------------------ | ------- | ------------------------------------------------------ | -------------------------------------- |
| **M1 — Foundation**            | SPR-001 | Monorepo, auth, design system, shell, CI               | `v0.1.0-foundation`                    |
| **M2 — Platform Runtime**      | SPR-002 | Manifest engine, registry, lifecycle, health           | `v0.2.0-platform-runtime`              |
| **M3 — Workbench Framework**   | SPR-003 | Manager, engines, API, session, navigation             | `v0.3.0-workbench-framework`           |
| **M4 — Action Framework**      | SPR-004 | Action registry, executor, surfaces, app wiring        | `v0.4.0-action-framework`              |
| **M5 — Knowledge & Discovery** | SPR-005 | Knowledge registry, orchestrator, service, experiences | `v0.5.0-knowledge-discovery-framework` |

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
Platform Version 3.0  →  Definitive reference baseline
```

---

## Architecture Summary

### Layer stack (Platform 3.0)

```text
Business Capabilities (M9+)
        ↓
Platform Capabilities (M4–M7)
  Action Framework ✅
  Knowledge & Discovery ✅
  Event & Notification (M6 — planned)
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
┌───────────────────┬────────────────────┬─────────────────────────┐
│ Workbench Registry│ Action Registry    │ Knowledge Registry      │
│ (navigation/views)│ (actions/shortcuts)│ (sources/providers)     │
└─────────┬─────────┴─────────┬──────────┴───────────┬─────────────┘
          │                   │                      │
          ▼                   ▼                      ▼
   Workbench API        ActionExecutor         Knowledge Service
          │                   │                      │
          └─────────┬─────────┴──────────┬───────────┘
                    ▼                    ▼
              Desktop Shell        Knowledge Experiences
              (palette, toolbar)   (overlay, palette knowledge mode)
```

**Rules preserved in M5:**

- No new execution pipeline for knowledge selection ([ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md))
- Registry Pattern — server authority, client read-only DTO
- Downward dependency direction only

See [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md) and [Platform Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md).

---

## Framework Summary

### Platform Runtime (M2)

UI-agnostic orchestration — manifest discovery, capability registry, lifecycle, health.

**Package:** `@apzhub/platform-runtime`

### Workbench Framework (M3)

User interaction orchestration — eight engines, Workbench API, session persistence, permission adapter.

**Package:** `@apzhub/workbench-framework`

### Action Framework (M4)

Unified action registration, discovery, permission filtering, execution.

**Package:** `@apzhub/command-framework`

### Knowledge & Discovery Framework (M5)

Unified knowledge layer — sources, registry, orchestrator, ranking, **Knowledge Service**, Presentation Layer, Experiences.

**Package:** `@apzhub/knowledge-discovery-framework`

**Public API:** `useKnowledgeService()`

**Canonical layering:**

```text
Knowledge Sources → Knowledge Registry → Knowledge Query API
→ Knowledge Presentation Layer → Knowledge Experiences
```

See [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md).

---

## Engineering Statistics

| Metric                        | Value (M5 closeout)                |
| ----------------------------- | ---------------------------------- |
| Milestones completed          | **5**                              |
| Platform version              | **3.0**                            |
| Sprints completed             | SPR-001 through SPR-005            |
| Engineering stories (SPR-005) | 18 (DF-001 – DF-018)               |
| Engineering stories (SPR-004) | 22 (AF-001 – AF-022)               |
| Total phased deliverables     | 90+ stories across M1–M5           |
| Architecture Decision Records | **29** accepted (0027–0029 for M5) |
| Foundation documents          | 000 + 001–029                      |
| Sprint completion reports     | 40+ across M1–M5                   |

### Major packages (M1–M5)

| Package                                 | Layer                           | Milestone    |
| --------------------------------------- | ------------------------------- | ------------ |
| `@apzhub/platform-runtime`              | Runtime                         | M2           |
| `@apzhub/workbench-framework`           | Workbench                       | M3           |
| `@apzhub/command-framework`             | Action Framework                | M4           |
| `@apzhub/knowledge-discovery-framework` | Knowledge & Discovery           | M5           |
| `@apzhub/workspace`                     | Shell / surfaces / presentation | M1 + M4 + M5 |
| `@apzhub/ui`                            | Design system                   | M1           |
| `apps/web`                              | Application integration         | M1–M5        |

---

## Test Statistics

| Metric                 | Value                   |
| ---------------------- | ----------------------- |
| Unit / component tests | **872**                 |
| E2E tests              | **24**                  |
| Test files             | 172                     |
| Playwright suites      | spr-001 through spr-005 |

### E2E coverage highlights

- Authentication and shell hydration
- Workbench navigation and session restore
- Action Framework surfaces and execution
- Knowledge Service health, diagnostics, palette knowledge mode
- Accessibility (axe) on login and shell

---

## Coverage

| Scope                | Statements | Branches | Functions | Lines  |
| -------------------- | ---------- | -------- | --------- | ------ |
| Monorepo (All files) | **91.55%** | 87.44%   | 91.71%    | 91.55% |

Quality gate threshold: ≥ 80% statements (enforced in `vitest.config.ts`).

---

## Production Readiness

**Verdict:** **PASS WITH OBSERVATIONS** — platform layer ready; commercial GA deferred.

| Area                    | Assessment                                                |
| ----------------------- | --------------------------------------------------------- |
| Platform layer (M1–M5)  | Ready for continued evolution                             |
| Health endpoints        | Runtime, commands, knowledge fields operational           |
| Application integration | Authenticated shell fully wired                           |
| RBAC depth              | Deferred to M8                                            |
| Service handlers        | Partial — `NOT_IMPLEMENTED` for some actions              |
| Global search UX        | Knowledge infrastructure ready; shell activation deferred |
| Commercial GA           | Requires M8–M10 programme                                 |

See [MILESTONE-005 review](../reviews/MILESTONE-005-knowledge-discovery-framework-review.md) and [Platform v3.0 review](../reviews/APZHUB-v3.0-Platform-Review.md).

---

## Deferred Capabilities

| Capability                   | Target                 |
| ---------------------------- | ---------------------- |
| Semantic / vector search     | M8+ index tier         |
| Global header search UI      | Product UX story       |
| HTTP Knowledge Query adapter | Edge deployment        |
| Service action handlers      | Platform services / M9 |
| Full RBAC population         | M8 Identity            |
| Business capability modules  | M9                     |
| Enterprise operations        | M10                    |

Consolidated technical debt: [SPR-005 closeout](../sprint/SPR-005-closeout.md).

---

## Future Roadmap

| Milestone | Theme                              | Status                                     |
| --------- | ---------------------------------- | ------------------------------------------ |
| **M6**    | **Event & Notification Framework** | **Next — planning complete; await EN-001** |
| M7        | Activity Framework                 | Planned                                    |
| M8        | Identity & Administration          | Planned                                    |
| M9        | Business Capabilities              | Planned                                    |
| M10       | Enterprise Operations              | Planned                                    |

See [Platform Roadmap v2](../roadmap/APZHUB-Platform-Roadmap-v2.md) and [SPR-006 planning](../sprint/SPR-006-event-notification-framework.md).

---

## Release History

| Release (recommended)                  | Milestone        | Status                        |
| -------------------------------------- | ---------------- | ----------------------------- |
| `v0.1.0-foundation`                    | M1               | Tag pending owner instruction |
| `v0.2.0-platform-runtime`              | M2               | Tag pending owner instruction |
| `v0.3.0-workbench-framework`           | M3               | Tag pending owner instruction |
| `v0.4.0-action-framework`              | M4               | Tag pending owner instruction |
| `v0.5.0-knowledge-discovery-framework` | M5               | Tag pending owner instruction |
| **Platform Version 3.0**               | M1–M5 collective | **This document**             |

---

## Platform Version

```text
┌─────────────────────────────────────────────┐
│         APZHUB Platform Version 3.0          │
│                                              │
│  M1 Foundation              ✅               │
│  M2 Platform Runtime        ✅               │
│  M3 Workbench Framework     ✅               │
│  M4 Action Framework        ✅               │
│  M5 Knowledge & Discovery   ✅               │
│                                              │
│  Baseline v1.0 frozen · Platform 3.0 active  │
└─────────────────────────────────────────────┘
```

Future milestones **extend** Platform 3.0. They do **not** redesign it.

**Do not begin Sprint 006 implementation** until owner approves EN-001 equivalent.

---

## Related Documents

| Document                                                                                     | Purpose                     |
| -------------------------------------------------------------------------------------------- | --------------------------- |
| [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md) | Master consolidation (v3.0) |
| [Platform Design Patterns](../architecture/APZHUB-Platform-Design-Patterns.md)               | Canonical patterns          |
| [Platform Governance](../governance/APZHUB-Platform-Governance.md)                           | Lifecycle and standards     |
| [Platform v3.0 Review](../reviews/APZHUB-v3.0-Platform-Review.md)                            | Formal platform assessment  |
| [SPR-006 Readiness](../reviews/SPR-006-readiness-review.md)                                  | M6 planning readiness       |

---

_APZHUB Platform Version 3.0 — official release document._
