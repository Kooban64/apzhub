# SPR-002 — Implementation Plan

> **Status:** Approved — Phase 9 complete — Sprint 002 closed (2026-06-28)  
> **Package:** `@apzhub/platform-runtime` per ADR-0018  
> **Process:** Phased review gate per ADR-0017  
> **Phase 2 detail:** [SPR-002-phase-2-plan.md](./SPR-002-phase-2-plan.md) · [Phase 2 report](./SPR-002-phase-2-report.md)

---

## Executive summary

SPR-002 implements the runtime **Capability Registry**: manifest validation, dependency resolution, capability registration, bootstrap orchestration, and a typed internal API. Existing SPR-001 UI components become the first registered capabilities.

**Capability** is the primary runtime abstraction. Every runtime object carries: Capability Kind, Manifest, Metadata, Dependencies, Lifecycle State, Health State, and Version.

Execution is **sequential by phase**; each phase must meet exit criteria before the next begins.

**Revised phase order (post Phase 1 approval):**

| Phase | Subsystem                         |
| ----- | --------------------------------- |
| 2     | Dependency Graph                  |
| 3     | Discovery Engine                  |
| 4     | Capability Registry               |
| 5     | Lifecycle Manager                 |
| 6     | Runtime Orchestrator              |
| 7     | Runtime Configuration Manager     |
| 8     | Runtime Health                    |
| 9     | Runtime Integration               |
| 10    | Testing, Documentation & Closeout |

**Estimated remaining effort:** 8–12 engineering days.

---

## Capability model

### Runtime object

| Facet               | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| **Capability Kind** | Discriminator (`component`, `module`, `service`, …)          |
| **Manifest**        | Parsed envelope per ADR-0011                                 |
| **Metadata**        | `metadata` block from manifest                               |
| **Dependencies**    | Normalised `platform`, `services`, `integrations`, `modules` |
| **Lifecycle State** | See lifecycle below                                          |
| **Health State**    | `unknown` → `healthy` / `unhealthy` / `degraded`             |
| **Version**         | Semver from `manifest.version`                               |

### Capability lifecycle

```text
DISCOVERED
    ↓
VALIDATED
    ↓
DEPENDENCIES_RESOLVED      ← Dependency Graph gate (Phase 2)
    ↓
REGISTERED                 ← Capability Registry (Phase 4)
    ↓
INITIALISED                ← Lifecycle Manager (Phase 5) + Bootstrap (Phase 6)
    ↓
HEALTHY                    ← Runtime Health (Phase 8)
    ↓
ACTIVE                     ← Runtime Integration (Phase 9)
```

**Gate rule:** The Dependency Graph must validate all capability dependencies and detect cycles **before** Discovery output proceeds to registration. No capability enters `REGISTERED` until `DEPENDENCIES_RESOLVED`.

### Subsystem map

| Subsystem             | Phases |
| --------------------- | ------ |
| Manifest Engine       | 1 ✅   |
| Version Manager       | 1 ✅   |
| Dependency Graph      | 2      |
| Discovery Engine      | 3      |
| Capability Registry   | 4      |
| Lifecycle Manager     | 5      |
| Runtime Orchestrator  | 6      |
| Configuration Manager | 7      |
| Health Manager        | 8      |

---

## Phase 0 — Pre-flight & ADRs

### Objective

Lock architectural decisions before code. No Sprint 001 modifications.

### Tasks

| #   | Task                                                | Description                                       |
| --- | --------------------------------------------------- | ------------------------------------------------- |
| 0.1 | Baseline verification                               | Confirm `v0.1.0-foundation` tag; CI green on main |
| 0.2 | ADR: Platform Runtime package                       | `@apzhub/platform-runtime` — ADR-0018             |
| 0.3 | ADR: Registry persistence model                     | Hybrid PostgreSQL cache — ADR-0009                |
| 0.4 | ADR: Registry API surface                           | Internal TypeScript only — ADR-0010               |
| 0.5 | ADR: Fail-fast policy                               | Dev warn / prod fail — ADR-0013                   |
| 0.6 | ADR: Unified manifest envelope                      | ADR-0011                                          |
| 0.7 | ADR: Theme manifests                                | ADR-0012                                          |
| 0.8 | ADR: Bootstrap lifecycle                            | ADR-0014                                          |
| 0.9 | ADR: Boundaries + discovery + testing + review gate | ADR-0015–0017                                     |

### Dependencies

- Sprint 001 closeout complete
- Owner approval of planning documents

### Files to create

| Path                                    |
| --------------------------------------- |
| `docs/adr/ADR-0018` through `ADR-0017`  |
| `packages/platform-runtime/README.md`   |
| `docs/sprint/SPR-002-phase-0-report.md` |

### Files to modify

None (planning/ADR only).

### Tests required

None.

### Documentation updates

- Register ADRs in `docs/adr/README.md`

### Exit criteria

- [x] All Phase 0 ADRs marked **Accepted** by owner
- [x] No open blockers on persistence or package boundary
- [x] Phase 0 report filed: [SPR-002-phase-0-report.md](./SPR-002-phase-0-report.md)

**Phase 0 status:** Complete — awaiting owner approval for Phase 1.

---

## Phase 1 — Manifest schemas & validation

### Objective

Define typed manifest schemas for each capability kind without altering SDK documents 025–029.

### Tasks

| #   | Task                 | Description                                                                   |
| --- | -------------------- | ----------------------------------------------------------------------------- |
| 1.1 | Base manifest schema | Common fields: `id`, `name`, `version`, `kind`, `metadata`, `compatibility`   |
| 1.2 | Component schema     | Align with existing `packages/ui/**/component.yaml` (minimal fields today)    |
| 1.3 | Module schema        | Full 025 shape (for validation only — no modules registered)                  |
| 1.4 | Service schema       | 027 shape                                                                     |
| 1.5 | Integration schema   | 026 shape                                                                     |
| 1.6 | Event schema         | 029 shape                                                                     |
| 1.7 | Extension schemas    | Theme, command, search provider, worker, dashboard, widget, report (proposed) |
| 1.8 | Validation engine    | `validateManifest(path, kind)` → typed result or structured errors            |
| 1.9 | Schema version field | `manifestSchemaVersion: "1.0"` on all parsed manifests                        |

### Dependencies

- Phase 0 ADRs accepted
- [platform-manifest-specification.md](../architecture/platform-manifest-specification.md)

### Files to create

| Path                                                        |
| ----------------------------------------------------------- |
| `packages/platform-runtime/manifests/base.schema.ts`        |
| `packages/platform-runtime/manifests/component.schema.ts`   |
| `packages/platform-runtime/manifests/module.schema.ts`      |
| `packages/platform-runtime/manifests/service.schema.ts`     |
| `packages/platform-runtime/manifests/integration.schema.ts` |
| `packages/platform-runtime/manifests/event.schema.ts`       |
| `packages/platform-runtime/manifests/extensions.schema.ts`  |
| `packages/platform-runtime/manifests/validate.ts`           |
| `packages/platform-runtime/manifests/index.ts`              |
| `packages/platform-runtime/manifests/*.test.ts`             |
| `packages/platform-runtime/package.json`                    |
| `packages/platform-runtime/tsconfig.json`                   |

### Files to modify

| Path                                          | Change                                                              |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `packages/ui/src/components/*/component.yaml` | Migrate to unified envelope (ADR-0011)                              |
| `packages/sdk/src/index.ts`                   | Re-export registry types from `@apzhub/platform-runtime` (optional) |

### Tests required

- Valid/invalid fixture manifests per kind
- SPR-001 component manifests parse successfully
- Corrupt manifest produces structured error list

### Documentation updates

- Inline JSDoc on schema modules referencing doc 025–029

### Exit criteria

- [x] 100% of existing `component.yaml` files validate
- [x] Invalid fixtures rejected with actionable messages
- [x] Unit tests pass; coverage on `manifest-engine/` ≥ 80%

**Phase 1 status:** Complete — see [SPR-002-phase-1-report.md](./SPR-002-phase-1-report.md).

---

## Phase 2 — Dependency Graph

> **Detail:** [SPR-002-phase-2-plan.md](./SPR-002-phase-2-plan.md)  
> **Status:** Complete — see [SPR-002-phase-2-report.md](./SPR-002-phase-2-report.md). Awaiting owner approval for Phase 3.

### Objective

Introduce the **Capability** runtime type and implement the Dependency Graph subsystem: normalise manifest dependencies, detect missing references and cycles, produce deterministic topological order, and transition capabilities to `DEPENDENCIES_RESOLVED`.

### Tasks

| #    | Task                         | Description                                                           |
| ---- | ---------------------------- | --------------------------------------------------------------------- |
| 2.1  | Capability type              | `Capability` with all seven facets                                    |
| 2.2  | Lifecycle states             | Enum through `ACTIVE`; Phase 2 transitions to `DEPENDENCIES_RESOLVED` |
| 2.3  | Health state enum            | Define `CapabilityHealthState`; default `unknown`                     |
| 2.4  | Dependency normalisation     | Extract ids from manifest `dependencies` block                        |
| 2.5  | Graph construction           | Directed graph over capability ids                                    |
| 2.6  | Missing dependency detection | Fail when declared id absent from input or platform seeds             |
| 2.7  | Cycle detection              | Report cycle paths                                                    |
| 2.8  | Topological resolution       | Deterministic registration order                                      |
| 2.9  | Platform seed config         | Built-in platform capability ids (e.g. `identity`)                    |
| 2.10 | Public API                   | `resolveCapabilityDependencies()`, `buildCapabilityFromManifest()`    |

### Dependencies

- Phase 1 Manifest Engine + Version Manager

### Files to create

| Path                                                |
| --------------------------------------------------- |
| `packages/platform-runtime/src/capability/**`       |
| `packages/platform-runtime/src/dependency-graph/**` |
| `testing/fixtures/registry/dependency-graph-*.yaml` |

### Files to modify

| Path                                     | Change                                       |
| ---------------------------------------- | -------------------------------------------- |
| `packages/platform-runtime/package.json` | `./dependency-graph`, `./capability` exports |
| `docs/architecture/platform-runtime.md`  | Capability model + lifecycle                 |

### Tests required

- Valid linear, diamond, and independent graphs
- Missing dependency and cycle failures
- Platform seed resolution
- SPR-001 component set (no cross-deps)
- Coverage ≥ 80% on `dependency-graph/` and `capability/`

### Documentation updates

- Capability lifecycle in `platform-runtime.md`
- Proposed ADR-0019 (Capability lifecycle) at implementation start

### Exit criteria

- [x] `Capability` type exported with all seven facets
- [x] Dependency validation gate operational (no `REGISTERED` without `DEPENDENCIES_RESOLVED`)
- [x] Missing deps and cycles produce structured errors
- [x] Deterministic topological order
- [x] **No** Discovery Engine or Capability Registry implementation
- [x] Phase 2 report filed

---

## Phase 3 — Discovery Engine

> **Status:** Complete — see [SPR-002-phase-3-report.md](./SPR-002-phase-3-report.md). Awaiting owner approval for Phase 4.

### Objective

Scan monorepo paths, locate manifest files, load and parse YAML via Manifest Engine, and produce capabilities in `discovered` state. **Discovery only** — no dependency resolution or registration.

### Tasks

| #   | Task                    | Description                                                                                                    |
| --- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| 3.1 | Discovery configuration | Scan roots: `packages/ui/src`, `services/`, `integrations/`, `events/`, `packages/theme`                       |
| 3.2 | Filename conventions    | `component.yaml`, `module.yaml`, `service.yaml`, `integration.yaml`, `event.yaml`, `theme.yaml`, `worker.yaml` |
| 3.3 | Recursive scanner       | Depth-first with ignore rules                                                                                  |
| 3.4 | Discovery result type   | `DiscoveryResult { capabilities, diagnostics, manifests, scannedRoots }`                                       |
| 3.5 | Manifest loader         | Delegate parse/validation to Manifest Engine                                                                   |
| 3.6 | Deterministic ordering  | Sort manifests by absolute path                                                                                |

### Dependencies

- Phases 1–2

### Files to create

| Path                                                |
| --------------------------------------------------- |
| `packages/platform-runtime/src/discovery-engine/**` |
| `testing/fixtures/discovery/**`                     |

### Tests required

- Scanner finds all SPR-001 component manifests
- Scanner ignores `node_modules`
- Discovered capabilities at `discovered` lifecycle state
- Structured diagnostics for invalid manifests

### Documentation updates

- Update [platform-registry.md](../architecture/platform-registry.md) discovery section

### Exit criteria

- [x] Discovery locates 7+ component manifests in CI
- [x] Zero false positives from build artefacts
- [x] Capabilities produced at `discovered` state only
- [x] No Dependency Graph or Capability Registry implementation
- [x] Phase 3 report filed

---

## Phase 4 — Capability Registry

> **Status:** Complete — see [SPR-002-phase-4-report.md](./SPR-002-phase-4-report.md). Awaiting owner approval for Phase 5.

### Objective

Implement in-memory Capability Registry: store capabilities at `REGISTERED` state only after Dependency Graph resolution. Optional PostgreSQL cache per ADR-0009.

### Tasks

| #   | Task                        | Description                                                                  |
| --- | --------------------------- | ---------------------------------------------------------------------------- |
| 4.1 | Registry store              | In-memory maps per capability kind                                           |
| 4.2 | Registration pipeline       | Accept only `DEPENDENCIES_RESOLVED` capabilities; transition to `REGISTERED` |
| 4.3 | Dependency gate enforcement | Reject registration if graph resolution not completed                        |
| 4.4 | Version compatibility       | Evaluate `compatibility.platformVersion` via Version Manager                 |
| 4.5 | Registry snapshot           | Serialisable JSON for diagnostics                                            |
| 4.6 | Persistence (optional)      | Drizzle tables + cache sync per ADR-0009                                     |
| 4.7 | Query API foundation        | `getCapability(id)`, per-kind indices                                        |

### Dependencies

- Phases 1–3

### Files to create

| Path                                                            |
| --------------------------------------------------------------- |
| `packages/platform-runtime/src/capability-registry/types.ts`    |
| `packages/platform-runtime/src/capability-registry/store.ts`    |
| `packages/platform-runtime/src/capability-registry/registry.ts` |
| `packages/platform-runtime/src/capability-registry/index.ts`    |
| `packages/platform-runtime/src/capability-registry/*.test.ts`   |
| `packages/config/src/db/registry-schema.ts` (if persistence)    |

### Tests required

- Registration rejected without `DEPENDENCIES_RESOLVED`
- Registry snapshot shape stable
- Cache round-trip (if persistence)
- Per-kind index queries

### Documentation updates

- [platform-registry-api.md](../architecture/platform-registry-api.md) — mark implemented methods

### Exit criteria

- [x] Registry accepts graph-resolved capabilities only
- [x] Per-kind index queries and deterministic snapshots
- [x] Module/service/integration indices empty unless caller registers fixtures
- [x] Persistence deferred — manifest-only mode documented (ADR-0009)
- [x] End-to-end discovery → register pipeline deferred to Phase 5 Bootstrap
- [x] Phase 4 report filed

---

## Phase 5 — Lifecycle Manager

> **Status:** Complete — see [SPR-002-phase-5-report.md](./SPR-002-phase-5-report.md). Awaiting owner approval for Phase 6.

### Objective

Implement capability lifecycle transition control: valid state graph, transition history, failure states (`failed`, `disabled`, `degraded`), diagnostics, and snapshots. **Does not** discover, validate, register, or health-check.

### Tasks

| #   | Task               | Description                                                                                                |
| --- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| 5.1 | Lifecycle states   | Extend model with failure states                                                                           |
| 5.2 | Transition graph   | Valid transitions matrix                                                                                   |
| 5.3 | Lifecycle manager  | `transition`, `canTransition`, `getState`, `getHistory`, `reset`, `markFailed`, `markDisabled`, `snapshot` |
| 5.4 | Transition history | Audit-ready context (`reason`, `source`, `auditRef`)                                                       |
| 5.5 | Diagnostics        | Allowed transitions and last record                                                                        |

### Dependencies

- Phases 1–4

### Files created

| Path                                                             |
| ---------------------------------------------------------------- |
| `packages/platform-runtime/src/lifecycle-manager/types.ts`       |
| `packages/platform-runtime/src/lifecycle-manager/transitions.ts` |
| `packages/platform-runtime/src/lifecycle-manager/store.ts`       |
| `packages/platform-runtime/src/lifecycle-manager/manager.ts`     |
| `packages/platform-runtime/src/lifecycle-manager/index.ts`       |
| `packages/platform-runtime/src/lifecycle-manager/*.test.ts`      |
| `docs/architecture/lifecycle-manager.md`                         |

### Tests required

- Valid transition path `discovered` → `active`
- Invalid transition rejection
- Failure state flows
- History and snapshot stability

### Exit criteria

- [x] Lifecycle Manager owns transition validation
- [x] Registry not modified — caller sync pattern documented
- [x] No bootstrap / health / REST code
- [x] Phase 5 report filed

---

## Phase 6 — Runtime Orchestrator

> **Status:** Complete — see [SPR-002-phase-6-report.md](./SPR-002-phase-6-report.md). Awaiting architecture review before Phase 7.

### Objective

Implement the **Runtime Orchestrator** (replaces Bootstrap Engine naming) coordinating the startup sequence per ADR-0014. Expose `Runtime.bootstrap()` via `@apzhub/platform-runtime/server`. Delegate subsystem behaviour; orchestrate only.

### Tasks

| #   | Task                           | Description                                                                                                     |
| --- | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| 6.1 | Configuration Engine (minimal) | `loadRuntimeConfiguration()`                                                                                    |
| 6.2 | Runtime Orchestrator pipeline  | Config → Discovery → Manifest → Dependency Graph → Registry → Lifecycle → Health (placeholder) → Platform Ready |
| 6.3 | Lifecycle + registry sync      | Delegate transitions; sync registry metadata                                                                    |
| 6.4 | Fail-fast wiring               | Structured diagnostics; stop on fatal errors                                                                    |
| 6.5 | Health Manager step            | Placeholder only                                                                                                |
| 6.6 | Server export                  | `Runtime.bootstrap()`, `getStatus()`, `getDiagnostics()`, placeholder `shutdown`/`restart`                      |

### Dependencies

- Phases 1–5

### Files created

| Path                                                           |
| -------------------------------------------------------------- |
| `packages/platform-runtime/src/runtime-orchestrator/**`        |
| `packages/platform-runtime/src/configuration-engine/config.ts` |
| `packages/platform-runtime/src/server.ts`                      |
| `docs/architecture/runtime-orchestrator.md`                    |

### Exit criteria

- [x] `Runtime.bootstrap()` completes orchestrated pipeline
- [x] Capabilities reach `initialised` lifecycle state
- [x] Health Manager placeholder step recorded
- [x] No REST API added
- [x] Phase 6 report filed

---

## Phase 7 — Runtime Configuration Manager

> **Status:** Complete — see [SPR-002-phase-7-report.md](./SPR-002-phase-7-report.md). Awaiting architecture review before Phase 8.

### Objective

Implement authoritative Runtime Configuration Manager. All Runtime configuration via `Configuration` API. No subsystem `process.env` access.

### Exit criteria

- [x] Configuration Manager owns env + defaults + overrides
- [x] Structured validation and diagnostics
- [x] Runtime Orchestrator uses Configuration Manager exclusively
- [x] Phase 7 report filed

---

## Phase 8 — Runtime Health Manager

> **Status:** Complete — see [SPR-002-phase-8-report.md](./SPR-002-phase-8-report.md). Awaiting architecture review before Phase 9.

### Objective

Implement provider-based Health Manager. Coordinate built-in providers, aggregate health, integrate with orchestrator after lifecycle initialisation. No REST/UI.

### Exit criteria

- [x] Health Provider model with registration API
- [x] Built-in Runtime, Configuration, Registry, Lifecycle providers
- [x] Orchestrator health step replaces placeholder
- [x] Capabilities transition to `healthy` when checks pass
- [x] Phase 8 report filed

**Deferred to Phase 9:** `/api/health` extension, `Runtime.health()` convenience API

---

## Phase 9 — Runtime Integration & Sprint Closeout

> **Status:** Complete — see [SPR-002-phase-9-report.md](./SPR-002-phase-9-report.md). Sprint 002 closed.

### Objective

Wire runtime subsystems into one coherent flow. Integrate `apps/web` minimally. Close Sprint 002.

### Exit criteria

- [x] Full `Runtime.bootstrap()` integration
- [x] `Runtime.health()` / `Runtime.configuration()` / enhanced diagnostics
- [x] `PlatformRegistry` facade via `Runtime.registry()`
- [x] Capabilities reach `active` at platform ready
- [x] Minimal `apps/web` bootstrap
- [x] Phase 9 report, architecture review, release notes

---

## Phase 10 — Testing, Documentation & Closeout

> **Status:** Superseded by Phase 9 closeout.

### Objective

### Tasks

| #   | Task                  | Description                                                    |
| --- | --------------------- | -------------------------------------------------------------- |
| 7.1 | App bootstrap hook    | `apps/web` server init calls `Runtime.bootstrap()`             |
| 7.2 | Internal Registry API | All `Registry.get*()` methods per platform-registry-api.md     |
| 7.3 | Scaffold manifests    | Theme yaml (ADR-0012), platform service, event scaffold        |
| 7.4 | ActivityBar manifest  | Close TD-017                                                   |
| 7.5 | SDK exports           | Registry types from `@apzhub/sdk`                              |
| 7.6 | Active state          | Capabilities transition to `ACTIVE` after integration complete |

### Dependencies

- Phases 1–6

### Files to create

| Path                                        |
| ------------------------------------------- |
| `apps/web/lib/runtime-init.ts`              |
| `packages/theme/themes/*/theme.yaml`        |
| `services/platform-registry/service.yaml`   |
| `events/platform/registry-ready/event.yaml` |

### Files to modify

| Path                        | Change                               |
| --------------------------- | ------------------------------------ |
| `apps/web/next.config.ts`   | Transpile `@apzhub/platform-runtime` |
| `packages/sdk/src/index.ts` | Export Registry API                  |

### Tests required

- App starts with valid manifests
- SPR-001 E2E suite regression
- Theme entries in `Registry.getThemes()`

### Exit criteria

- [ ] App boots with runtime initialised
- [ ] Capabilities at `ACTIVE`
- [ ] **No** `/api/platform/registry` REST route
- [ ] Desktop Shell UI unchanged
- [ ] TD-017 resolved

---

## Phase 10 — Testing, Documentation & Closeout

### Objective

Meet Definition of Done; produce closeout report; prepare `v0.2.0-registry`.

### Tasks

| #   | Task                | Description                                    |
| --- | ------------------- | ---------------------------------------------- |
| 8.1 | Coverage            | platform-runtime ≥ 80%                         |
| 8.2 | CI                  | Registry integration tests in GitHub Actions   |
| 8.3 | Architecture review | Optional REV-002 checklist                     |
| 8.4 | Closeout report     | `docs/reviews/SPR-002-closeout.md`             |
| 8.5 | Version bump        | Propose `v0.2.0-registry`                      |
| 8.6 | Documentation sweep | All architecture docs reflect Capability model |

### Dependencies

- All prior phases

### Files to create

| Path                                              |
| ------------------------------------------------- |
| `docs/reviews/SPR-002-closeout.md`                |
| `testing/playwright/e2e/spr-002-registry.spec.ts` |

### Exit criteria

- [ ] All SPR-002 acceptance criteria met
- [ ] Closeout report approved
- [ ] Tag `v0.2.0-registry` prepared (not created until owner instructs)

---

## Phase dependency graph

```text
Phase 0 (ADRs) ✅
    ↓
Phase 1 (Manifest Engine + Version Manager) ✅
    ↓
Phase 2 (Dependency Graph) ✅
    ↓
Phase 3 (Discovery Engine) ✅
    ↓
Phase 4 (Capability Registry) ✅
    ↓
Phase 5 (Lifecycle Manager) ✅
    ↓
Phase 6 (Runtime Orchestrator) ✅
    ↓
Phase 7 (Runtime Configuration Manager) ✅
    ↓
Phase 8 (Runtime Health Manager) ✅
    ↓
Phase 9 (Runtime Integration) ✅ — Sprint closed
    ↓
Phase 10 (Testing + Closeout)         ← superseded by Phase 9 closeout
```

---

## Files summary (remaining implementation)

| Category                       | Approx. new files |
| ------------------------------ | ----------------- |
| Capability model               | 3–4               |
| Dependency Graph               | 6–8               |
| Discovery Engine               | 4–5               |
| Capability Registry            | 6–10              |
| Bootstrap + Lifecycle + Config | 5–7               |
| Health Manager                 | 2–3               |
| App integration                | 3–5               |
| Tests                          | 15–20             |
| Fixtures                       | 10–15             |
| **Total remaining**            | **~45–60**        |

---

## Explicit non-goals (reminder)

- No Desktop Shell dynamic navigation
- No business modules or OSS integrations
- No Event Bus runtime
- No permission-filtered registry queries
- No modification to documents 025–029

---

_Implementation plan — Sprint 002 closed. Await owner review before Sprint 003._
