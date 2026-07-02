# APZHUB Architecture Baseline v1.0

> **Version:** 1.0  
> **Status:** Frozen — authoritative architectural reference  
> **Established:** Milestone 3 complete (`v0.3.0-workbench-framework`)  
> **Authority:** [Document 000 — Engineering Constitution](../000-apzhub-engineering-constitution.md)  
> **Change control:** Modifications require an approved ADR only

---

## Executive Summary

### Vision

APZHUB is an **Enterprise Operating Platform** — a single, unified workbench through which users interact with enterprise capabilities without exposure to underlying backend systems. Users interact only with APZHUB. Backend products are implementation details.

Per [001 — Project Vision](../001-project-vision-and-guiding-principles.md) and [002 — Terminology Standard](../002-product-naming-positioning-terminology-standard.md).

### Objectives

1. **Unify** — One desktop-style application over heterogeneous backend engines.
2. **Modularise** — Replaceable capabilities connected through manifests and SDKs.
3. **Separate concerns** — Runtime (UI-agnostic), Workbench (presentation), Capabilities (behaviour).
4. **Scale safely** — Manifest-first registration, permission-driven UI, phased delivery.
5. **Endure** — Self-hosted, documented, tested, review-gated platform evolution.

### Design philosophy

| Principle             | Meaning                                 |
| --------------------- | --------------------------------------- |
| Platform first        | Infrastructure before business features |
| Manifest first        | Every extension begins with a manifest  |
| SDK first             | No custom patterns without ADR          |
| Backend agnostic      | Users never see backend product names   |
| Event driven          | Prefer events over direct coupling      |
| Security by design    | Auth, RBAC, audit, validation mandatory |
| Test everything       | No feature without automated tests      |
| Documentation is code | Undocumented features are incomplete    |

---

## Architectural Layers

APZHUB is organised in five permanent layers. **Dependencies flow downward only** — higher layers may consume lower layers; lower layers must never depend on higher layers.

```text
┌─────────────────────────────────────────────────────────────┐
│                    Business Data                             │
│         Sources of truth (PostgreSQL, external SoR)          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                 Business Capabilities                        │
│    Projects, Support, Documents — Milestone 9+               │
│    Manifests · Platform Services · Integration adapters      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                 Platform Capabilities                        │
│    Command, Search, Notification, Theme — Milestones 4–7     │
│    Extend workbench without business logic in shell          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Workbench Framework                         │
│    Workbench Manager · Engines · Workbench API · React       │
│    Package: @apzhub/workbench-framework                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Platform Runtime                            │
│    Orchestrator · Registry · Lifecycle · Health              │
│    Package: @apzhub/platform-runtime                         │
│    UI-agnostic · No React                                    │
└─────────────────────────────────────────────────────────────┘
```

### Layer responsibilities

| Layer                     | Responsibility                                                                                          | Must not                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Platform Runtime**      | Discover, validate, register, and lifecycle-manage capabilities; authoritative configuration and health | Depend on React, UI, or Workbench                    |
| **Workbench Framework**   | Orchestrate user interaction — layout, navigation, views, session, context, selection                   | Contain business logic or call integrations directly |
| **Platform Capabilities** | Cross-cutting platform features (commands, search, notifications)                                       | Manipulate shell DOM or bypass Workbench API         |
| **Business Capabilities** | Domain features (projects, tickets, documents)                                                          | Call backend engines from UI; hardcode navigation    |
| **Business Data**         | Persist and serve authoritative data                                                                    | Leak backend schema to UI                            |

See [workbench-framework.md](./workbench-framework.md) and [platform-runtime.md](./platform-runtime.md).

---

## Platform Runtime

**Package:** `@apzhub/platform-runtime`  
**Entry:** `Runtime.bootstrap()` via `@apzhub/platform-runtime/server`

The Runtime is the **UI-agnostic engine** that starts, validates, and coordinates the platform.

### Runtime Orchestrator

Single entry point for platform startup. Coordinates subsystems in a fixed sequence (ADR-0014). Owns fail-fast policy, integrated diagnostics, and platform-ready transition. Does not implement subsystem logic — delegates exclusively.

### Configuration Manager

Sole authoritative source of runtime configuration. Precedence: defaults → environment variables → runtime overrides. Only subsystem permitted to read `process.env` in platform-runtime (env-source). Exposed via `Runtime.configuration()`.

### Manifest Engine

Validates capability manifest envelopes against Zod schemas (Documents 024–029 shapes). Gates capabilities before dependency resolution. Produces normalised internal representation per [platform-manifest-specification.md](./platform-manifest-specification.md).

### Discovery Engine

Filesystem scan of configured manifest roots. Loads YAML manifests. Produces `discovered` capabilities for orchestrator pipeline. Default roots include packages, services, integrations, events.

### Dependency Graph

Resolves capability dependencies. Topological sort. Cycle detection. Only `dependencies-resolved` capabilities proceed to registration.

### Capability Registry

In-memory capability index with kind-specific facades. Registration rules: lifecycle gate, manifest re-validation, platform version compatibility, duplicate rejection. Exposed via `Runtime.registry()` as `PlatformRegistry` facade. Internal TypeScript API only — no Registry REST (ADR-0010).

### Lifecycle Manager

Validates capability lifecycle state transitions. Records history. Exposes diagnostics and snapshots. Does not discover, validate, or register — orchestrator coordinates registry updates after valid transitions.

### Health Manager

Provider-based health aggregation. Built-in providers: Runtime, Configuration, Registry, Lifecycle. Extensible via `Health.registerProvider()`. Exposed via `Runtime.health()`.

---

## Workbench Framework

**Package:** `@apzhub/workbench-framework`  
**Entry:** Workbench API, Request Bus, Workbench Manager

The Workbench is the **first layer that depends on React**. Capabilities publish **Workbench Requests**; the Workbench Manager orchestrates all UI behaviour.

### Workbench Manager

Central coordinator. Routes Workbench Requests, aggregates state, enforces permission gate, exposes diagnostics. Capabilities and shell UI never call engines directly.

### Request Bus

Typed publish/subscribe transport between Workbench API and Workbench Manager (ADR-0020). All UI orchestration requests flow through the bus.

### Layout Engine

Shell region geometry, responsive layout composition, dock split ratios. Wraps `@apzhub/ui` ShellLayout without capability access.

### Panel Engine

Region visibility, collapse, resize for sidebar, context, and other panels. Does not set context content or navigation scope.

### Navigation Engine

Registry-driven Activity Bar and sidebar. Workspace selection. Hydrates from filtered registry DTO (ADR-0022). Permission filtering before model build.

### View Engine

View activation, route mapping, focused view lifecycle. Client route sync with App Router. Session restore with permission re-validation.

### Session Engine

Versioned client session model. localStorage persistence (ADR-0021). Restore on load with permission sanitisation. Schema: layout, navigation, view, panel, context, selection slices.

### Context Engine

Context panel data orchestration. Manifest-driven provider slots. `setContext` / `clearContext` with session persistence.

### Selection Engine

Per-view selection state (clear, single, multi). Scoped by view ID. Persisted and sanitised on restore.

See [workbench-manager.md](./workbench-manager.md).

---

## Capability Model

A **Capability** is the primary runtime abstraction — any registerable platform extension discovered via manifest.

### Capability

Runtime object built from validated manifest. Indexed in Capability Registry. Progresses through lifecycle states. Carries kind, version, dependencies, and typed payload.

### Manifest

Authoritative declaration of a capability. YAML on filesystem (source of truth). Normalised into Platform Manifest Envelope internally. SDK documents 025–029 define kind-specific shapes.

### Views

Declared in manifest `workbench.view` blocks. Mapped to routes. Activated by View Engine. Permission-filtered at hydration. Capability views mount through future view pipeline (Milestone 9+).

### Navigation

Declared in manifest `workbench.navigation` blocks (ADR-0022). Workspaces, sidebar items, routes. Drives Activity Bar and sidebar. No hardcoded navigation in code.

### Actions

Workbench Actions (`WorkbenchAction`) map requests to future Platform Commands (Document 019). `REQUEST_COMMAND_MAP` prepared for Sprint 004. Actions declare id, label, permission key, optional shortcut metadata.

### Permissions

Permission keys declared in manifests. Enforced by `WorkbenchPermissionAdapter` (ADR-0023). Server-side `filterWorkbenchRegistryDto()` strips disallowed entries. Session restore re-validates persisted state. Full RBAC population deferred to Milestone 8.

### Lifecycle

States: `discovered` → `validated` → `dependencies-resolved` → `registered` → `initialised` → `healthy` → `active`. Failure states: `failed`, `disabled`, `degraded`. Managed by Lifecycle Manager.

### Health

Provider-based health checks per capability where declared. Aggregated by Health Manager at platform level.

### Dependencies

Declared in manifest. Resolved by Dependency Graph before registration. Platform version compatibility enforced at registration.

### Version

Semver on capability and manifest schema version. Version Manager validates compatibility with platform version.

---

## API Layering

Three permanent API layers (Document 000 §6.1). **Lower layers must not depend on higher layers.**

```text
Layer 3 — Capability API
    Manifests · SDKs · Platform Service contracts
    Consumers: Business modules, platform capability authors
         │ publishes Workbench Requests
         ▼
Layer 2 — Workbench API
    WorkbenchAPI · execute · executeAction · useWorkbenchAPI()
    Consumers: Shell UI, in-app capability views
    Package: @apzhub/workbench-framework
         │ consumes registry at bootstrap
         ▼
Layer 1 — Runtime API
    Runtime.bootstrap() · registry() · getDiagnostics() · health()
    Consumers: Server bootstrap, registry hydration, ops tooling
    Package: @apzhub/platform-runtime/server
```

### Permitted dependency directions

| From             | May call                                             | Must not call                                         |
| ---------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Capability       | Workbench API, Platform Services, Capability SDK     | Workbench engines, Runtime server APIs from client UI |
| Workbench        | Runtime registry (filtered DTO), React, `@apzhub/ui` | Business capabilities, integrations                   |
| Runtime          | Node.js, YAML, Zod, PostgreSQL (future cache)        | React, Workbench, UI packages                         |
| Server bootstrap | Runtime API, workbench hydration helpers             | Direct engine manipulation                            |

---

## Manifest Standard

### Unified envelope

Every manifest normalises to `PlatformManifestEnvelope`: id, name, version, kind, metadata, compatibility, lifecycle, dependencies, kind-specific payload.

### Extension rules

1. **SDK manifests remain authoritative** — Registry adapts to SDKs.
2. **New kinds** require ADR and schema addition to Manifest Engine.
3. **Workbench extensions** (`workbench.navigation`, `workbench.view`, future `workbench.commands`) follow ADR-defined blocks.
4. **Backward compatibility** — new optional fields only; breaking changes require manifest schema version bump and ADR.

### Compatibility rules

- `platformVersion` semver range checked at registration.
- Unresolved dependencies block registration.
- Invalid manifests rejected at discovery/validation — fail-fast (ADR-0013).
- Legacy blocks (e.g. `module.navigation`) may coexist during migration — target ADR for removal.

See [platform-manifest-specification.md](./platform-manifest-specification.md) and ADR-0011.

---

## Engineering Rules

Permanent rules — exceptions require ADR:

| Rule                                      | Requirement                                    |
| ----------------------------------------- | ---------------------------------------------- |
| Runtime is UI-agnostic                    | No React in `@apzhub/platform-runtime`         |
| Capabilities never manipulate UI directly | Workbench Requests only                        |
| Workbench owns presentation               | Layout, navigation, views, session             |
| Manifest-first architecture               | Manifest before implementation                 |
| No hardcoded navigation                   | Registry-driven Activity Bar and sidebar       |
| Engines perform work                      | Single responsibility per engine               |
| Managers orchestrate                      | Coordinate engines; no domain logic            |
| Adapters isolate external systems         | Permission, presentation, integration adapters |
| Providers supply services                 | Health providers, configuration providers      |
| Diagnostics are mandatory                 | Every subsystem exposes diagnostics            |
| Tests are mandatory                       | Unit, integration, E2E per scope               |
| Documentation is mandatory                | Architecture, guides, reviews, release notes   |
| No direct module-to-module communication  | Platform Services and events                   |
| No direct UI-to-integration communication | API Gateway and Platform Services              |
| No business logic in React components     | Presentation only                              |
| No hardcoded permissions                  | Permission keys from manifest and RBAC         |
| No secrets in source control              | Environment and secret providers               |
| API layering enforced                     | Document 000 §6.1                              |

---

## Runtime Lifecycle

Fixed startup sequence (ADR-0014):

```text
Platform Start
        ↓
Load Runtime Configuration          ← Configuration Manager
        ↓
Discover Manifests                  ← Discovery Engine
        ↓
Validate Manifests                    ← Manifest Engine
        ↓
Validate Versions                     ← Version Manager
        ↓
Resolve Dependencies                  ← Dependency Graph
        ↓
Detect Cycles                         ← Dependency Graph
        ↓
Register Capabilities                 ← Capability Registry
        ↓
Initialise Platform Services          ← scaffold / future
        ↓
Verify Health                         ← Health Manager
        ↓
Platform Ready → capabilities ACTIVE  ← Lifecycle Manager
        ↓
Workbench Hydration                   ← Workbench Framework (client)
```

Capability lifecycle happy path:

```text
DISCOVERED → VALIDATED → DEPENDENCIES_RESOLVED → REGISTERED
  → INITIALISED → HEALTHY → ACTIVE
```

---

## Workbench Lifecycle

```text
Runtime.bootstrap() complete
        ↓
Server: filterWorkbenchRegistryDto(registry, permissionAdapter)
        ↓
Client: createWorkbenchManager(filteredDto)
        ↓
Engines hydrated (Layout, Panel, Navigation, View, Session, Context, Selection)
        ↓
Session restore (localStorage) + permission sanitisation
        ↓
React shell subscribes to Workbench state
        ↓
User interaction → Workbench API → Request Bus → Manager → Engines
        ↓
Session capture on state change
        ↓
Session end / sign-out → teardown
```

---

## Capability Lifecycle

| State                   | Meaning                         |
| ----------------------- | ------------------------------- |
| `discovered`            | Found on filesystem             |
| `validated`             | Manifest schema valid           |
| `dependencies-resolved` | Dependency graph satisfied      |
| `registered`            | Indexed in Capability Registry  |
| `initialised`           | Runtime initialisation complete |
| `healthy`               | Health check passed             |
| `active`                | Available at platform ready     |
| `failed`                | Bootstrap or runtime failure    |
| `disabled`              | Administratively disabled       |
| `degraded`              | Partially operational           |

Transition rules enforced by Lifecycle Manager. See [lifecycle-manager.md](./lifecycle-manager.md).

---

## Naming Standards

Use these terms consistently across code, documentation, and reviews:

| Term            | Definition                                                    |
| --------------- | ------------------------------------------------------------- |
| **Runtime**     | Platform Runtime package and its subsystems                   |
| **Workbench**   | Workbench Framework — user interaction layer                  |
| **Capability**  | Registerable platform extension (primary runtime abstraction) |
| **Manifest**    | YAML declaration of a capability                              |
| **Surface**     | Presentation region (Activity Bar, Sidebar, Workspace, etc.)  |
| **Engine**      | Subsystem that performs specialised work                      |
| **Manager**     | Subsystem that orchestrates engines or runtime steps          |
| **Provider**    | Pluggable service supplier (health, configuration)            |
| **Adapter**     | Boundary translator (permission, presentation, integration)   |
| **Action**      | Executable command or Workbench Action                        |
| **Registry**    | Capability Registry — in-memory capability index              |
| **Lifecycle**   | Validated state progression of a capability                   |
| **Diagnostics** | Structured operational summary from a subsystem               |

Legacy term **Module** may appear in SDK documents — maps to **Capability** at runtime.

---

## Package Standards

| Package                       | Responsibility                           |
| ----------------------------- | ---------------------------------------- |
| `@apzhub/platform-runtime`    | UI-agnostic runtime engine               |
| `@apzhub/workbench-framework` | Workbench Manager, engines, API, session |
| `@apzhub/sdk`                 | Platform SDK types and helpers           |
| `@apzhub/ui`                  | Design system components                 |
| `@apzhub/workspace`           | Desktop Shell layout and regions         |
| `@apzhub/auth`                | Authentication and session               |
| `@apzhub/theme`               | Theme manifests and tokens               |
| `@apzhub/shared`              | Shared utilities                         |
| `@apzhub/config`              | Shared configuration types               |
| `@apzhub/types`               | Shared TypeScript types                  |
| `@apzhub/web`                 | Next.js application (apps/web)           |

**Future packages (planned):** command-framework, search-framework, notification-framework — Milestones 4–6. Business capability packages — Milestone 9+ under `packages/` or domain folders per BUILD-001.

---

## Testing Standards

Minimum expectations per [015 — Quality Framework](../015-software-quality-testing-qa-cicd-release-management-framework.md):

| Category          | Expectation                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| **Coverage**      | Subsystem branch thresholds (≥ 80% workbench-framework; ≥ 85% runtime subsystems) |
| **Unit**          | Every engine, manager, adapter, API helper                                        |
| **Integration**   | Bootstrap pipeline, hydration, permission filter                                  |
| **E2E**           | Shell navigation, session restore, accessibility (axe)                            |
| **Accessibility** | No critical axe violations on login and desktop shell                             |
| **Performance**   | Baseline gates in CI (future formalisation)                                       |
| **Regression**    | Full suite on every PR; SPR-001/002/003 acceptance preserved                      |

Quality gates: `pnpm lint`, `typecheck`, `build`, `test`, `test:coverage`, `test:e2e`.

---

## Documentation Standards

Every feature must include:

| Artifact             | Purpose                                    |
| -------------------- | ------------------------------------------ |
| Architecture         | Subsystem design in `docs/architecture/`   |
| Developer Guide      | How to extend safely in `docs/governance/` |
| Tests                | Unit, integration, E2E as appropriate      |
| Examples             | Scaffold or fictional capability examples  |
| Change Log           | `CHANGELOG.md` entry                       |
| Sprint documentation | Phase reports, implementation plan         |
| Review               | Architecture and milestone reviews         |
| Release notes        | Versioned release document                 |

---

## Release Process

```text
Planning (sprint guide + implementation plan + ADRs)
        ↓
Implementation (phased, ADR-0017 review gates)
        ↓
Architecture Review
        ↓
Engineering Review (milestone review)
        ↓
Closeout (consolidated report, debt register)
        ↓
Release (release notes, CHANGELOG, README updates)
        ↓
Tag (owner instruction only — e.g. v0.3.0-workbench-framework)
```

Recommended tags follow `{semver}-{theme}` pattern.

---

## ADR Process

Architecture Decision Records are **required** when:

- Adding or changing a platform package boundary
- Introducing a new capability kind or manifest block
- Changing API layering or public API contracts
- Deviating from any rule in this baseline or Document 000
- Choosing between architectural alternatives with long-term impact
- Deprecating or superseding an existing ADR

ADRs live in `docs/adr/`. Status: Proposed → Accepted → Superseded. Only **Accepted** ADRs authorise implementation. Index: [adr/README.md](../adr/README.md).

---

## Related documents

| Document                                                                             | Role                |
| ------------------------------------------------------------------------------------ | ------------------- |
| [000 — Engineering Constitution](../000-apzhub-engineering-constitution.md)          | Supreme authority   |
| [003 — System Architecture](../003-overall-system-architecture-design-principles.md) | Design principles   |
| [Platform Roadmap](./platform-roadmap.md)                                            | Milestone sequence  |
| [MILESTONE-003 review](../reviews/MILESTONE-003-workbench-framework-review.md)       | Milestone 3 verdict |
| [Governance guides](../governance/)                                                  | Engineer handbooks  |

---

_APZHUB Architecture Baseline v1.0 — frozen at Milestone 3 completion._
