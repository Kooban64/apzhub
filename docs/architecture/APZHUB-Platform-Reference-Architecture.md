# APZHUB Platform Reference Architecture

> **Platform Version:** 2.0  
> **Status:** Master architectural reference — consolidation only, no redesign  
> **Authority:** [Architecture Baseline v1.0](./APZHUB-Architecture-Baseline-v1.0.md) · [Document 000](../000-apzhub-engineering-constitution.md)  
> **Change control:** Baseline modifications require ADR. This document consolidates; it does not supersede the frozen baseline.

---

## Purpose

This document is the **master architectural reference** for APZHUB Platform Version 2.0. It consolidates Runtime, Workbench, Action Framework, capability model, Platform Assets, registry pattern, Workbench surfaces, execution pipeline, API layering, diagnostics, package boundaries, and dependency rules into a single navigable reference.

Future milestones extend this architecture. They do not redesign it.

---

## Platform vision

APZHUB is an Enterprise Operating Platform — one unified workbench for enterprise capabilities. Backend systems are implementation details hidden behind Platform Services, connectors, and manifests.

---

## Layer model

Dependencies flow **downward only**. Higher layers consume lower layers. Lower layers never depend on higher layers.

```text
┌─────────────────────────────────────────────────────────────┐
│                 Business Capabilities (M9+)                    │
│    Manifests · Platform Services · Integration adapters        │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              Platform Capabilities (M4–M7, extending)          │
│    Action Framework ✅ · Discovery (M5) · Notification (M6)   │
│    Activity (M7) · Theme · Auth scaffold                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Workbench Framework (M3) ✅                   │
│    @apzhub/workbench-framework                                 │
│    Manager · Engines · API · React providers                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Platform Runtime (M2) ✅                      │
│    @apzhub/platform-runtime · UI-agnostic                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Foundation (M1) ✅                            │
│    @apzhub/ui · @apzhub/workspace · @apzhub/auth · apps/web    │
└─────────────────────────────────────────────────────────────┘
```

---

## Platform Runtime

**Package:** `@apzhub/platform-runtime`  
**Entry:** `Runtime.bootstrap()` from `@apzhub/platform-runtime/server`

### Responsibilities

| Subsystem             | Responsibility                                                               |
| --------------------- | ---------------------------------------------------------------------------- |
| Orchestrator          | Configuration → Discovery → Manifest → Graph → Registry → Lifecycle → Health |
| Manifest Engine       | Zod validation, envelope normalisation                                       |
| Discovery Engine      | Scan configured roots for YAML manifests                                     |
| Dependency Graph      | Topological sort, cycle detection                                            |
| Capability Registry   | In-memory index; kind-specific getters                                       |
| Lifecycle Manager     | State machine: discovered → active                                           |
| Health Manager        | Pluggable health providers                                                   |
| Configuration Manager | Env-source only; no scattered `process.env`                                  |

### Rules

- **UI-agnostic** — no React, `@apzhub/ui`, `@apzhub/workspace`
- **Fail-fast** — invalid manifests block bootstrap (ADR-0013)
- **Internal API** — no Registry REST (ADR-0010)
- **Diagnostics mandatory** — every subsystem exposes `getDiagnostics()`

### Application integration

| File                               | Role                               |
| ---------------------------------- | ---------------------------------- |
| `apps/web/lib/runtime-init.ts`     | Cached `Runtime.bootstrap()`       |
| `apps/web/app/api/health/route.ts` | Runtime summary in health response |

**Deep dive:** [platform-runtime.md](./platform-runtime.md) · [runtime-orchestrator.md](./runtime-orchestrator.md)

---

## Workbench Framework

**Package:** `@apzhub/workbench-framework`  
**Public API:** `WorkbenchAPI`, `useWorkbenchAPI()`, Workbench Requests

### Architecture

```text
Capability / Shell
        │ Workbench Requests
        ▼
Workbench API ──► Request Bus ──► Workbench Manager
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
        Navigation Engine        View Engine              Session Engine
        Layout Engine            Panel Engine             Context Engine
                                                        Selection Engine
              │                         │                         │
              └─────────────────────────┴─────────────────────────┘
                                        ▼
                              Presentation Adapters → @apzhub/ui
```

### Engines

| Engine     | Owns                         |
| ---------- | ---------------------------- |
| Layout     | Region geometry, dock splits |
| Panel      | Visibility, collapse, resize |
| Navigation | Workspaces, sidebar model    |
| View       | Active view, routes          |
| Session    | Persist/restore snapshots    |
| Context    | Context panel state          |
| Selection  | Per-view selection           |

**Rule:** Engines do not call each other. Manager coordinates.

### Permission integration

```text
Runtime.registry()
        ↓
filterWorkbenchRegistryDto(dto, permissionAdapter)   [server]
        ↓
WorkbenchProvider → Navigation/View hydration       [client]
```

### Session

- Store: `localStorage` key `apzhub:workbench:session:{userId}`
- Schema: versioned JSON (`1.0`)
- Restore sanitisation against permission adapter

**Deep dive:** [workbench-framework.md](./workbench-framework.md) · [workbench-manager.md](./workbench-manager.md)

---

## Action Framework

**Package:** `@apzhub/command-framework`  
**Exports:** `@apzhub/command-framework`, `/server`, `/react`

### Subsystems

| Subsystem              | Role                                                 |
| ---------------------- | ---------------------------------------------------- |
| ActionRegistry         | Action descriptors; search; context filter           |
| DefaultActionExecutor  | Permission, dispatch, audit, actor routing           |
| WorkbenchCommandBridge | Bridge id → `WorkbenchAction`                        |
| ShortcutRegistry       | Chord normalisation; conflict detection              |
| Server bootstrap       | `bootstrapActionRegistry`, `filterActionRegistryDto` |
| Client hydration       | `createCommandRegistryFromDto`, read-only registry   |
| Gateways               | AI, voice, automation stubs                          |

### Application integration (M4)

```text
(platform)/layout [RSC]
  loadWorkbenchRegistryDto() + loadActionRegistryDto()

ActionWorkbenchShellProvider
  WorkbenchProvider(resolveActionExecutor)
    CommandRegistryProvider(dto, shared ActionExecutor)
      DesktopShell (palette, shortcuts, context menu, toolbar)
```

**Deep dive:** [command-framework.md](./command-framework.md)

---

## Capability Model

A **Capability** is any registerable platform extension declared by manifest and discovered at runtime.

### Manifest envelope

```yaml
manifestSchemaVersion: "1.0"
id: example-capability
name: Example
version: 1.0.0
kind: module | theme | service | integration | event | ...

workbench:
  navigation: ...
  view: ...
  actions: ...
  toolbar: ...
```

### Discovery roots

```text
packages/**/manifest/
services/**/
integrations/**/
events/**/
```

### Lifecycle

```text
discovered → validated → dependencies-resolved → registered
  → initialised → healthy → active
```

### Capability kinds (Runtime)

Modules, themes, services, integrations, events, components — each with kind-specific schema in Manifest Engine.

**Rule:** Declare before implement. Manifest is the contract.

**Deep dive:** [platform-manifest-specification.md](./platform-manifest-specification.md) · [Capability Development Guide](../governance/APZHUB-Capability-Development-Guide.md)

---

## Platform Assets

Platform Assets are manifest-declared actions, toolbar regions, and shortcuts that ship with platform capabilities (themes, platform modules).

| Distinction              | `source`   | Versioned by         |
| ------------------------ | ---------- | -------------------- |
| Built-in catalogue       | `builtin`  | Platform release     |
| Platform Asset           | `manifest` | Capability `version` |
| Future capability action | `manifest` | Capability `version` |

Examples (M4):

- `platform.theme.toggle` — theme manifest + workspace toolbar
- `platform.home.navigate` — platform-home manifest + shortcut

Extraction: `mapPlatformCapabilitiesToActionRecords` → `bootstrapActionRegistry` → toolbar/shortcut population.

---

## Registry Pattern

Consolidated pattern for all platform indexes:

| Principle                     | Meaning                                                   |
| ----------------------------- | --------------------------------------------------------- |
| Registration, not execution   | Registries store metadata; executors and surfaces execute |
| Server authority              | Bootstrap server-side; client gets immutable DTO          |
| Normalisation at registration | Manifest strings normalised once at bootstrap             |
| Conflict observability        | Diagnostics report duplicates and orphans                 |
| Read-only client view         | No runtime UI registration                                |

### Registries in Platform 2.0

| Registry            | Package             | Key              | Consumer                 |
| ------------------- | ------------------- | ---------------- | ------------------------ |
| Capability Registry | platform-runtime    | capability id    | Runtime, extraction      |
| Workbench Registry  | workbench-framework | nav/view ids     | Navigation, View engines |
| ActionRegistry      | command-framework   | action id        | Executor, surfaces       |
| ShortcutRegistry    | command-framework   | normalised chord | Shell listener           |

**Future (M5+):** Discovery providers consume registries — no new execution pipeline.

**Deep dive:** [APZHUB-Registry-Pattern.md](./APZHUB-Registry-Pattern.md)

---

## Workbench Surfaces

Presentation-only regions in `@apzhub/workspace` (and structural chrome in `@apzhub/ui`).

### Action Framework surfaces (M4)

| Surface          | Enable flag             | Consumes                       |
| ---------------- | ----------------------- | ------------------------------ |
| Command Palette  | `enableCommandPalette`  | Registry search + execute      |
| Global shortcuts | `enableGlobalShortcuts` | ShortcutRegistry + execute     |
| Context menu     | `enableContextMenu`     | Context-filtered registry      |
| Toolbar          | `enableToolbar`         | Toolbar DTO + registry resolve |

### Structural shell (M3)

Activity Bar, Sidebar, Status Bar, Header — registry-driven navigation; not Action Registry consumers (except where actions appear in toolbar).

### Surface rules

**Do:** consume read-only registry; call `execute()`; map to UI models  
**Do not:** register actions; evaluate permissions client-side; call engines

**Deep dive:** [APZHUB-Workbench-Surface-Pattern.md](./APZHUB-Workbench-Surface-Pattern.md)

---

## Execution Pipeline

Single path for all user-initiated actions (M4):

```text
Surface / Workbench API
        ↓
DefaultActionExecutor.execute(actionId, { actor, args })
        ↓
Registry lookup → Permission check → Actor routing
        ↓
Handler dispatch
  workbench-bridge → bridge.toAction() → workbenchExecute(actionToRequest())
  service/event    → NOT_IMPLEMENTED
  ai-agent/voice  → Gateway stub → NOT_IMPLEMENTED
        ↓
ActionResult → audit reference
```

Shared executor in `apps/web`: one instance for Workbench API and `CommandRegistryProvider`.

**Constraint for M5+:** Knowledge & Discovery Framework routes selections to **existing** `execute()` — no parallel pipeline.

---

## API Layering

Document 000 §6.1 — three public API layers:

| Layer          | API                                         | Consumers             | Must not                              |
| -------------- | ------------------------------------------- | --------------------- | ------------------------------------- |
| **Runtime**    | `Runtime.bootstrap()`, `Runtime.registry()` | Server bootstrap, ops | Import React                          |
| **Workbench**  | `WorkbenchAPI`, Workbench Requests          | Capabilities, shell   | Import engines                        |
| **Capability** | Manifests, Platform Services, SDKs          | Business features     | Bypass Workbench for UI orchestration |

Action Framework sits in **Platform Capabilities** layer:

- Surfaces → `useCommandRegistry().execute()`
- Workbench API → `executeAction()` via injected executor
- Both converge on `DefaultActionExecutor`

---

## Diagnostics

| Layer            | Mechanism                                      |
| ---------------- | ---------------------------------------------- |
| Runtime          | `Runtime.getDiagnostics()`, health providers   |
| Workbench        | Per-engine diagnostics via API                 |
| Action Framework | Registry diagnostics, hydration diagnostics    |
| Health endpoint  | `/api/health` — DB, Redis, runtime, `commands` |
| Dev UI           | `ActionFrameworkDiagnostics` (dev only)        |

Production operators: health endpoint. Not dev-only hidden spans.

---

## Package boundaries

| Package               | May import                                             | Must not import                                              |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `platform-runtime`    | config, shared, types                                  | ui, workspace, workbench-framework, command-framework, react |
| `workbench-framework` | platform-runtime (server types), types                 | business capabilities                                        |
| `command-framework`   | workbench-framework (bridge types), types              | apps/web                                                     |
| `workspace`           | ui, command-framework/react, workbench-framework/react | platform-runtime/server (client)                             |
| `apps/web`            | all platform packages                                  | — (composition root)                                         |

### Composition root

`apps/web` is the **only** application integration layer:

- `runtime-init.ts` — Runtime bootstrap
- `workbench-hydration.ts` — Workbench DTO
- `command-hydration.ts` — Action Registry DTO
- `action-workbench-shell-provider.tsx` — Provider stack

---

## Dependency rules

1. **Downward only** — no lower layer imports higher layer
2. **Manifest first** — extensions begin with YAML
3. **Server authority** — permission-filter before client hydration
4. **No engine bypass** — capabilities use Workbench API
5. **No duplicate execution paths** — one executor, one Request Bus
6. **ADR for baseline changes** — frozen v1.0 preserved
7. **Tests mandatory** — no feature without automated tests
8. **Documentation is code** — undocumented features incomplete

---

## Monorepo layout

```text
apps/web/                 Application (composition root)
packages/
  platform-runtime/       M2
  workbench-framework/    M3
  command-framework/      M4
  workspace/              Shell + surfaces
  ui/                     Design system
  auth/ config/ theme/    Foundation
services/ integrations/ events/   Future capability roots
docs/                     Foundation + architecture + governance
testing/                  Playwright, fixtures
```

---

## Related documents

| Document                                                                     | Topic                         |
| ---------------------------------------------------------------------------- | ----------------------------- |
| [APZHUB-Platform-v2.0.md](../releases/APZHUB-Platform-v2.0.md)               | Official Platform 2.0 release |
| [APZHUB-Platform-Governance.md](../governance/APZHUB-Platform-Governance.md) | Process and standards         |
| [APZHUB-Platform-Roadmap-v2.md](../roadmap/APZHUB-Platform-Roadmap-v2.md)    | Milestones 5–10               |
| [Architecture Baseline v1.0](./APZHUB-Architecture-Baseline-v1.0.md)         | Frozen baseline               |

---

_APZHUB Platform Reference Architecture — Version 2.0 consolidation._
