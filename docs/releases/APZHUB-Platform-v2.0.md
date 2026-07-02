# APZHUB Platform Version 2.0

> **Platform Version:** 2.0  
> **Status:** Official Platform Release Document  
> **Date:** 2026-06-28  
> **Authority:** [Document 000 — Engineering Constitution](../000-apzhub-engineering-constitution.md) · [Architecture Baseline v1.0](../architecture/APZHUB-Architecture-Baseline-v1.0.md)  
> **Change control:** Platform 2.0 extends Baseline v1.0. Baseline modifications still require ADR.

---

## Executive Summary

APZHUB Platform Version 2.0 is the culmination of **Milestones 1 through 4** — four coordinated engineering programmes that together deliver a runnable, manifest-driven, permission-aware enterprise workbench with unified action execution.

### Platform vision

APZHUB is an **Enterprise Operating Platform**: a single desktop-style application through which users interact with enterprise capabilities without exposure to underlying backend systems. Users interact only with APZHUB. Backend products are implementation details.

Platform 2.0 realises the foundation vision established in Documents 001–029:

- **One workbench** — registry-driven navigation, session persistence, and shell presentation
- **One runtime** — manifest discovery, capability registration, lifecycle, and health
- **One action model** — Command Palette, shortcuts, context menu, toolbar, and Workbench API share a single execution pipeline
- **One extension model** — capabilities declare behaviour in YAML manifests; the platform bootstraps, filters, and hydrates

Milestones 1–4 did not redesign the platform four times. Each milestone **extended** the layer below without breaking consumers above. Platform 2.0 is the stable baseline from which Milestones 5–10 evolve discovery, notifications, activity, identity, business capabilities, and enterprise operations.

### How Milestones 1–4 form the platform

| Milestone                    | Sprint  | Layer delivered                                            | Release                      |
| ---------------------------- | ------- | ---------------------------------------------------------- | ---------------------------- |
| **M1 — Foundation**          | SPR-001 | Monorepo, auth, design system, desktop shell, database, CI | `v0.1.0-foundation`          |
| **M2 — Platform Runtime**    | SPR-002 | Manifest engine, registry, lifecycle, orchestrator, health | `v0.2.0-platform-runtime`    |
| **M3 — Workbench Framework** | SPR-003 | Workbench Manager, engines, API, session, navigation       | `v0.3.0-workbench-framework` |
| **M4 — Action Framework**    | SPR-004 | Action registry, executor, surfaces, app integration       | `v0.4.0-action-framework`    |

```text
M1 Foundation          →  Runnable platform, auth, shell chrome
        ↓
M2 Platform Runtime    →  Manifest-first capability registration (UI-agnostic)
        ↓
M3 Workbench Framework →  User interaction orchestration (React)
        ↓
M4 Action Framework    →  Unified action registration and execution
        ↓
Platform Version 2.0   →  Definitive reference baseline
```

Platform 2.0 is **not** a commercial product launch. It is the **engineering baseline** that makes continued platform evolution safe, reviewable, and testable.

---

## Platform Architecture

### Platform Runtime (M2)

**Package:** `@apzhub/platform-runtime`

The UI-agnostic orchestration layer. Discovers YAML manifests, validates against Zod schemas, resolves dependencies, registers capabilities, manages lifecycle states, and aggregates health.

| Subsystem             | Role                                         |
| --------------------- | -------------------------------------------- |
| Runtime Orchestrator  | Fixed bootstrap pipeline                     |
| Manifest Engine       | Schema validation and envelope normalisation |
| Discovery Engine      | Filesystem scan of capability roots          |
| Capability Registry   | In-memory index by kind                      |
| Lifecycle Manager     | State transitions and history                |
| Health Manager        | Provider-based health aggregation            |
| Configuration Manager | Authoritative env and overrides              |

**Rule:** No React. No Workbench. No business logic.

See [platform-runtime.md](../architecture/platform-runtime.md).

---

### Workbench Framework (M3)

**Package:** `@apzhub/workbench-framework`

The permanent user interaction layer. Capabilities publish **Workbench Requests** through the **Workbench API**; the Workbench Manager orchestrates layout, navigation, views, sessions, context, and selection.

| Subsystem          | Role                                                         |
| ------------------ | ------------------------------------------------------------ |
| Workbench Manager  | Request routing, state coordination, permission gate         |
| Request Bus        | Typed transport (ADR-0020)                                   |
| Eight engines      | Layout, panel, navigation, view, session, context, selection |
| Workbench API v1.0 | Public Layer 2 API for capabilities and shell                |
| Permission adapter | Server filter + restore sanitisation                         |

**Rule:** Capabilities never import engines directly.

See [workbench-framework.md](../architecture/workbench-framework.md).

---

### Action Framework (M4)

**Package:** `@apzhub/command-framework`

The unified action registration, discovery, permission filtering, and execution layer per Document 019.

| Subsystem              | Role                                            |
| ---------------------- | ----------------------------------------------- |
| ActionRegistry         | Platform catalogue + manifest actions           |
| DefaultActionExecutor  | Permission gate, bridge dispatch, actor routing |
| WorkbenchCommandBridge | Action id → WorkbenchAction                     |
| ShortcutRegistry       | Chord → action id                               |
| Client hydration       | Read-only registry from server DTO              |
| Gateways               | AI, voice, automation stubs (extension points)  |

**Rule:** Shell surfaces execute through the executor — never engines directly.

See [command-framework.md](../architecture/command-framework.md).

---

### Platform Assets

Declarative platform behaviour in capability manifests — distinct from built-in catalogue entries:

| Asset type         | Example                 | Source                       |
| ------------------ | ----------------------- | ---------------------------- |
| Manifest actions   | `platform.theme.toggle` | `theme.yaml`                 |
| Toolbar regions    | `workspace` toolbar     | Manifest `workbench.toolbar` |
| Shortcuts          | `Ctrl+Shift+T`          | Manifest `shortcut` field    |
| Navigation / views | Home workspace          | `platform-home/module.yaml`  |

Platform Assets use `source: manifest`. Built-in workbench actions use `source: builtin` from `PLATFORM_ACTION_CATALOGUE`.

See [SPR-004-AF-platform-assets.md](../specs/SPR-004-AF-platform-assets.md).

---

### Registry Pattern

APZHUB converges on a consistent pattern for platform-owned indexes:

```text
Declaration (manifest | catalogue)
        ↓
Server bootstrap + extraction
        ↓
Registry.register (atomic where required)
        ↓
Permission-filtered DTO
        ↓
Read-only client hydration
        ↓
Surface or executor consumer
```

**Principles:** Registration not execution. Server authority. Normalisation at bootstrap. Conflict diagnostics. No UI-side registration.

Implemented registries: **Capability Registry** (Runtime), **Workbench Registry** (navigation/views), **ActionRegistry**, **ShortcutRegistry**.

See [APZHUB-Registry-Pattern.md](../architecture/APZHUB-Registry-Pattern.md).

---

### Workbench Surface Pattern

Presentation-only shell regions that consume hydrated registries and delegate execution:

| Surface                | Milestone | Package             |
| ---------------------- | --------- | ------------------- |
| Activity Bar / Sidebar | M3        | `@apzhub/ui`        |
| Command Palette        | M4        | `@apzhub/workspace` |
| Global shortcuts       | M4        | `@apzhub/workspace` |
| Context menu           | M4        | `@apzhub/workspace` |
| Toolbar                | M4        | `@apzhub/workspace` |

```text
Server DTO → CommandRegistryProvider → Surface → execute() → Executor → Bridge → Request Bus
```

See [APZHUB-Workbench-Surface-Pattern.md](../architecture/APZHUB-Workbench-Surface-Pattern.md).

---

### Execution Pipeline

The single action execution path (M4):

```text
Action Request (actionId, actor, args)
        ↓
Registry Lookup
        ↓
Permission Check (WorkbenchPermissionAdapter)
        ↓
Actor Routing (user | system | ai-agent | voice)
        ↓
Handler Dispatch
  workbench-bridge → WorkbenchCommandBridge → Workbench Request Bus
  service/event    → NOT_IMPLEMENTED (future Platform Services)
        ↓
ActionResult + audit reference
```

No parallel execution paths. Discovery Framework (M5) will **consume** existing registries — not introduce a new pipeline.

---

## Platform Capabilities Delivered

### M1 — Foundation

- Monorepo (`pnpm` workspaces)
- PostgreSQL + Redis infrastructure
- Better Auth authentication
- `@apzhub/ui` design system and tokens
- `@apzhub/workspace` Desktop Shell layout
- Next.js application (`apps/web`)
- Storybook component catalogue
- Platform health endpoint
- Playwright E2E and Vitest unit tests
- ESLint, TypeScript, CI quality gates

### M2 — Platform Runtime

- `@apzhub/platform-runtime` package
- Manifest Engine with unified envelope (ADR-0011)
- Discovery across `packages/`, `services/`, `integrations/`, `events/`
- Dependency graph with cycle detection
- Capability Registry with kind-specific getters
- Lifecycle Manager (discovered → active)
- Health Manager with provider model
- Configuration Manager (env-source only)
- Runtime bootstrap in `apps/web`
- ADRs 0010–0018 (registry family)

### M3 — Workbench Framework

- `@apzhub/workbench-framework` package
- Workbench Manager + Request Bus
- Eight engines (layout, panel, navigation, view, session, context, selection)
- Workbench API v1.0 with typed helpers
- Registry-driven Activity Bar and sidebar
- View activation and route mapping
- Session persistence (localStorage, ADR-0021)
- Permission adapter + server registry filter
- Context and Selection engine scaffolds
- ADRs 0019–0023

### M4 — Action Framework

- `@apzhub/command-framework` package
- ActionRegistry, executor, bridge, shortcuts
- Manifest `workbench.actions` and `workbench.toolbar`
- Command Palette (Ctrl+Shift+P)
- Global shortcuts, context menu, toolbar surfaces
- Platform Action Catalogue (built-in bridge actions)
- Platform Asset manifests (theme, platform-home)
- Application integration — shared executor in `apps/web`
- Health endpoint `commands` hydration summary
- Gateway stubs for AI, voice, automation
- ADRs 0024–0026

---

## Engineering Statistics

| Metric                                      | Value                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| **Milestones completed**                    | 4 (Foundation, Runtime, Workbench, Action Framework)                        |
| **Platform version**                        | **2.0**                                                                     |
| **Sprints completed**                       | SPR-001, SPR-002, SPR-003, SPR-004                                          |
| **Engineering stories (SPR-004 alone)**     | 22 (AF-001 – AF-022)                                                        |
| **Total engineering stories (all sprints)** | 50+ phased deliverables across M1–M4                                        |
| **Unit / component tests**                  | **672** (closeout M4)                                                       |
| **E2E tests**                               | **19**                                                                      |
| **Statement coverage**                      | **91.46%** (monorepo, M4 closeout)                                          |
| **Architecture Decision Records**           | **26** documents (25 accepted, 1 superseded)                                |
| **Architecture reviews**                    | SPR-001, SPR-002, SPR-003, SPR-004 + Milestone 2–4 reviews                  |
| **Foundation documents**                    | 000 + 001–029                                                               |
| **Sprint completion reports**               | 21 AF reports + SPR phase/closeout reports                                  |
| **Governance guides**                       | Engineering Handbook, Runtime, Workbench, Capability guides                 |
| **Platform reference docs**                 | Architecture baseline, command-framework, registry pattern, surface pattern |

### Major packages

| Package                       | Layer                     | Milestone |
| ----------------------------- | ------------------------- | --------- |
| `@apzhub/platform-runtime`    | Runtime                   | M2        |
| `@apzhub/workbench-framework` | Workbench                 | M3        |
| `@apzhub/command-framework`   | Action Framework          | M4        |
| `@apzhub/workspace`           | Desktop Shell / surfaces  | M1 + M4   |
| `@apzhub/ui`                  | Design system             | M1        |
| `@apzhub/auth`                | Authentication            | M1        |
| `@apzhub/config`              | Configuration / DB        | M1        |
| `@apzhub/theme`               | Theming + Platform Assets | M1 + M4   |
| `@apzhub/types`               | Shared types              | M1        |
| `@apzhub/shared`              | Shared utilities          | M1        |
| `apps/web`                    | Application integration   | M1–M4     |

### Release history

| Release tag (recommended)    | Milestone        | Status                                   |
| ---------------------------- | ---------------- | ---------------------------------------- |
| `v0.1.0-foundation`          | M1               | Prepared — tag pending owner instruction |
| `v0.2.0-platform-runtime`    | M2               | Prepared — tag pending owner instruction |
| `v0.3.0-workbench-framework` | M3               | Prepared — tag pending owner instruction |
| `v0.4.0-action-framework`    | M4               | Prepared — tag pending owner instruction |
| **Platform Version 2.0**     | M1–M4 collective | **This document**                        |

---

## Platform Version

```text
┌─────────────────────────────────────────────┐
│         APZHUB Platform Version 2.0          │
│                                              │
│  M1 Foundation        ✅                     │
│  M2 Platform Runtime  ✅                     │
│  M3 Workbench         ✅                     │
│  M4 Action Framework  ✅                     │
│                                              │
│  Baseline v1.0 frozen · Platform 2.0 active  │
└─────────────────────────────────────────────┘
```

**Platform Version 2.0** designates the collective deliverable of Milestones 1–4.

Future milestones **extend** Platform 2.0. They do **not** redesign it.

Changes to the frozen Architecture Baseline v1.0 still require ADR. Platform 2.0 adds consolidated reference documentation (see [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md)) without modifying baseline rules.

---

## Related documents

| Document                                                                                     | Purpose                                  |
| -------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md) | Master architectural consolidation       |
| [Platform Governance](../governance/APZHUB-Platform-Governance.md)                           | Lifecycle, standards, Definition of Done |
| [Platform Roadmap v2](../roadmap/APZHUB-Platform-Roadmap-v2.md)                              | Milestones 5–10                          |
| [Platform v2.0 Readiness](../reviews/APZHUB-Platform-v2.0-Readiness.md)                      | Formal readiness assessment              |
| [Executive Review](../reviews/PLATFORM-2.0-Executive-Review.md)                              | CTO-level platform review                |

---

## Stop condition

Platform Version 2.0 baseline is established.

**Do not begin Sprint 005** until owner approves.

---

_APZHUB Platform Version 2.0 — official release document._
