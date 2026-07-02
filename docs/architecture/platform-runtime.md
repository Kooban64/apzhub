# Platform Runtime — Architecture

> **Status:** Active (SPR-002 Phase 9 — Sprint closed)  
> **Authority:** [ADR-0018](../adr/ADR-0018-platform-runtime-package.md) · [Document 024](../024-apzhub-platform-sdk-development-framework.md)  
> **Related:** [platform-registry.md](./platform-registry.md) · [platform-registry-api.md](./platform-registry-api.md)

---

## 1. Purpose

The **Platform Runtime** (`@apzhub/platform-runtime`) is the runtime engine of APZHUB. It starts, validates, and coordinates the platform.

The **Capability Registry** is a subsystem inside the Runtime — not a standalone package. Internal architecture, code, and APIs use **Capability** as the primary concept; external user interfaces may continue to use "Module Registry" where appropriate.

---

## 2. Architectural position

The Platform Runtime is **UI-agnostic**. It has no React, UI, or Desktop Shell dependency. The **Workbench Framework** (Milestone 3) is the first layer above Runtime that depends on React and the Desktop Shell.

### Platform layers

```text
Business Data
        ↓
Business Capabilities        (Milestone 9+)
        ↓
Platform Capabilities        (Milestones 4–7)
        ↓
Workbench Framework          (Milestone 3 — React, Desktop Shell)
        ↓
Platform Runtime             (this package — UI-agnostic)
```

See [workbench-framework.md](./workbench-framework.md) for Workbench Framework architecture.

### Runtime internal position

```text
┌─────────────────────────────────────────────────────────────┐
│              Workbench Framework (Milestone 3+)              │
│         Consumes registry after PlatformReady                │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   @apzhub/platform-runtime                     │
│  Runtime Orchestrator · Manifest · Discovery · Registry · Lifecycle   │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  Manifest files      PostgreSQL cache     Platform packages
  (source of truth)   (optimisation)       (auth, ui, config, …)
```

### Runtime boundary (verified)

| Constraint                           | Status                                  |
| ------------------------------------ | --------------------------------------- |
| No React dependency                  | ✅ `yaml`, `zod` only in `package.json` |
| No `@apzhub/ui` dependency           | ✅ Verified                             |
| No `@apzhub/workspace` dependency    | ✅ Verified                             |
| Reusable without Workbench Framework | ✅ Required                             |

---

## 3. Platform startup lifecycle

Fixed sequence — standard platform lifecycle ([ADR-0014](../adr/ADR-0014-registry-bootstrap-lifecycle.md)):

```text
Platform Start
        ↓
Load Runtime Configuration
        ↓
Discover Manifests
        ↓
Validate Manifests
        ↓
Validate Versions
        ↓
Resolve Dependencies          ← Dependency Graph (before registration)
        ↓
Detect Cycles                 ← Dependency Graph
        ↓
Register Capabilities         ← only DEPENDENCIES_RESOLVED capabilities
        ↓
Initialise Platform Services        ← scaffold only in SPR-002
        ↓
Verify Health
        ↓
Publish PlatformReady Event         ← internal hook; Event Bus deferred
        ↓
Desktop Shell Starts                ← unchanged in SPR-002
```

### SPR-002 scope boundary

| Step                                               | SPR-002                              |
| -------------------------------------------------- | ------------------------------------ |
| Load Runtime Configuration → Register Capabilities | ✅ Implement                         |
| Initialise Platform Services                       | ⚠ Scaffold hook only                 |
| Verify Health                                      | ✅ Registry + existing `/api/health` |
| Publish PlatformReady                              | ✅ Internal callback                 |
| Desktop Shell Starts                               | ❌ No Shell changes                  |

---

## 4. Package internal layout

Runtime subsystems per ARCH-002:

```text
packages/platform-runtime/src/
├── runtime-orchestrator/   Runtime.bootstrap() orchestration
├── bootstrap-engine/       Deprecated alias → runtime-orchestrator
├── manifest-engine/        Envelope schemas, validation, YAML parsing
├── discovery-engine/       Filesystem manifest scan
├── capability-registry/    Capability Registry (store, indices)
├── dependency-graph/       Topological sort, cycle detection
├── lifecycle-manager/      State machine (initialising → ready)
├── health-manager/         Provider-based health aggregation
├── configuration-manager/  Authoritative runtime configuration
├── configuration-engine/   Deprecated wrapper
└── version-manager/        platformVersion compatibility
```

Implementation creates subsystem directories as each phase requires them ([ADR-0017](../adr/ADR-0017-phased-implementation-review-gate.md)).

**Phase 1 delivered:** Manifest Engine, Version Manager.

**Phase 2 delivered:** Capability model, Dependency Graph.

**Phase 3 delivered:** Discovery Engine.

**Phase 5 delivered:** Lifecycle Manager (transition validation, history, failure states).

**Phase 6 delivered:** Runtime Orchestrator + server export.

**Phase 7 delivered:** Runtime Configuration Manager (authoritative configuration).

**Phase 8 delivered:** Runtime Health Manager (provider-based health aggregation).

**Phase 9 delivered:** Runtime integration, `PlatformRegistry` facade, enhanced diagnostics, `apps/web` bootstrap.

See [runtime-orchestrator.md](./runtime-orchestrator.md), [configuration-manager.md](./configuration-manager.md), [health-manager.md](./health-manager.md), [lifecycle-manager.md](./lifecycle-manager.md), [capability-registry.md](./capability-registry.md), [platform-registry-api.md](./platform-registry-api.md).

## 4a. Capability model

**Capability** is the primary runtime abstraction. Every runtime object exposes:

| Facet           | Description                                          |
| --------------- | ---------------------------------------------------- |
| Capability Kind | `component`, `module`, `service`, …                  |
| Manifest        | Parsed envelope (ADR-0011)                           |
| Metadata        | Manifest `metadata` block                            |
| Dependencies    | Normalised platform, services, integrations, modules |
| Lifecycle State | See §4b                                              |
| Health State    | `unknown`, `healthy`, `unhealthy`, `degraded`        |
| Version         | Semver from manifest                                 |

---

## 4b. Capability lifecycle

```text
DISCOVERED
    ↓
VALIDATED
    ↓
DEPENDENCIES_RESOLVED      ← Dependency Graph (Phase 2)
    ↓
REGISTERED                 ← Capability Registry (Phase 4)
    ↓
INITIALISED                ← Lifecycle Manager (Phase 5) + Runtime Orchestrator (Phase 6)
    ↓
HEALTHY                    ← Runtime Health (Phase 7)
    ↓
ACTIVE                     ← Runtime Integration (Phase 8)
```

The **Dependency Graph** validates all declared dependencies and detects cycles **before** any capability may proceed to `REGISTERED`. Discovery (Phase 3) produces `DISCOVERED` capabilities; the Manifest Engine promotes to `VALIDATED`; the graph resolves to `DEPENDENCIES_RESOLVED`.

---

## 5. Public Runtime API (internal TypeScript)

No REST API in Sprint 002.

```typescript
import { Runtime } from "@apzhub/platform-runtime/server";

await Runtime.bootstrap();

const registry = Runtime.registry();
const modules = registry.getModules();
const health = Runtime.health();
const version = Runtime.version();

await Runtime.shutdown();
```

### Capability Registry methods (via `Runtime.registry()`)

| Method              | Purpose                 |
| ------------------- | ----------------------- |
| `getModules()`      | Module capabilities     |
| `getServices()`     | Platform services       |
| `getIntegrations()` | Integration adapters    |
| `getThemes()`       | Theme manifests         |
| `getComponents()`   | UI components           |
| `getCommands()`     | Command palette actions |
| `getEvents()`       | Event definitions       |
| `getWorkers()`      | Background workers      |
| `getWidgets()`      | Dashboard widgets       |
| `getReports()`      | Report definitions      |

Full specification: [platform-registry-api.md](./platform-registry-api.md).

---

## 6. Repository logical organisation

Target naming convention for platform packages:

```text
packages/
├── platform-runtime/       ← Runtime engine (this package)
├── platform-sdk/           ← current: sdk
├── platform-ui/            ← current: ui
├── platform-theme/         ← current: theme
├── platform-workspace/     ← current: workspace
├── platform-auth/          ← current: auth
├── platform-config/        ← current: config
├── platform-types/         ← current: types
├── platform-search/        ← current: search
├── platform-notifications/ ← current: notifications
├── platform-events/        ← current: events
├── platform-activity/      ← future
├── platform-integrations/  ← logical; repo path: integrations/
└── shared/                 ← cross-cutting utilities
```

**Physical renames** of existing SPR-001 packages are deferred. This table is the **logical target** for documentation and future migration ADRs.

| Current path                | npm scope today            | Logical target           |
| --------------------------- | -------------------------- | ------------------------ |
| `packages/platform-runtime` | `@apzhub/platform-runtime` | ✅ Active                |
| `packages/sdk`              | `@apzhub/sdk`              | `platform-sdk`           |
| `packages/ui`               | `@apzhub/ui`               | `platform-ui`            |
| `packages/theme`            | `@apzhub/theme`            | `platform-theme`         |
| `packages/workspace`        | `@apzhub/workspace`        | `platform-workspace`     |
| `packages/auth`             | `@apzhub/auth`             | `platform-auth`          |
| `packages/config`           | `@apzhub/config`           | `platform-config`        |
| `packages/types`            | `@apzhub/types`            | `platform-types`         |
| `packages/search`           | `@apzhub/search`           | `platform-search`        |
| `packages/notifications`    | `@apzhub/notifications`    | `platform-notifications` |
| `packages/events`           | `@apzhub/events`           | `platform-events`        |
| `packages/shared`           | `@apzhub/shared`           | `shared`                 |

---

## 7. Dependency rules

```text
apps/web → platform-runtime → platform-config
platform-sdk → platform-runtime
platform-ui → platform-theme (no direct runtime dependency in UI primitives)
```

Runtime must not import from business modules or `integrations/`.

---

## 8. Capability Registry relationship

See [platform-registry.md](./platform-registry.md). The Capability Registry implementation lives at:

```text
packages/platform-runtime/src/capability-registry/
```

Persistence adapter coordinates with `@apzhub/config` (PostgreSQL) per [ADR-0009](../adr/ADR-0009-registry-hybrid-persistence.md).

---

_Architecture document — updated for platform-runtime naming._
