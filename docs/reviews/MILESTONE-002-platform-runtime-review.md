# Milestone 2 — Platform Runtime Architecture Review

> **Milestone:** 2 — Platform Runtime  
> **Sprint:** SPR-002 — Platform Registry & Discovery Framework  
> **Review date:** 2026-06-28  
> **Release:** `v0.2.0-platform-runtime` (recommended)  
> **Status:** **PASS — Milestone 2 Complete**

---

## Executive summary

### What was achieved

Milestone 2 delivered `@apzhub/platform-runtime` — the APZHUB runtime engine. Over nine phased sprints, the team implemented manifest validation, filesystem discovery, dependency resolution, capability registration, lifecycle management, authoritative configuration, provider-based health monitoring, and orchestrated bootstrap via `Runtime.bootstrap()`.

SPR-001 foundation (auth, UI primitives, desktop shell layout, database) remains intact. SPR-002 added **260 unit tests**, integration tests, E2E runtime verification, and minimal `apps/web` server-side bootstrap without changing the Desktop Shell UI.

The **Capability** model is now the primary runtime abstraction. Capabilities progress from `discovered` through `active` at platform ready. Internal read APIs (`PlatformRegistry` facade) expose kind-specific getters for future Desktop Framework consumers.

### Architectural maturity

| Dimension              | Assessment                                                               |
| ---------------------- | ------------------------------------------------------------------------ |
| Separation of concerns | **Strong** — each subsystem owns a single responsibility                 |
| Extension points       | **Good** — health providers, configuration extension points documented   |
| Authority boundaries   | **Strong** — configuration and env access centralised                    |
| API surface            | **Appropriate** — internal TypeScript only; no premature REST            |
| Lifecycle model        | **Complete** for runtime scope — through `active`                        |
| Persistence            | **Deferred** — in-memory registry; ADR-0009 hybrid cache not implemented |

### Engineering maturity

| Dimension        | Assessment                                                  |
| ---------------- | ----------------------------------------------------------- |
| Test coverage    | **Strong** — subsystem thresholds 85–100%                   |
| Phased delivery  | **Strong** — ADR-0017 review gates enforced                 |
| Documentation    | **Strong** — architecture docs per subsystem, phase reports |
| CI quality gates | **Passing** — lint, typecheck, build, test, coverage, E2E   |
| Technical debt   | **Documented** — placeholders and deferred items tracked    |

### Overall assessment

Milestone 2 successfully establishes a **production-grade runtime foundation** suitable for building the Desktop Framework in Milestone 3. The architecture is coherent, testable, and aligned with Documents 024–029 and ADR-0018. No blocking defects were identified at closeout.

**Verdict: PASS — proceed to Milestone 3 planning.**

---

## Runtime architecture

### Subsystem interaction model

```text
Runtime.bootstrap()
        │
        ▼
┌───────────────────┐
│ Runtime           │  Coordinates fixed startup sequence (ADR-0014)
│ Orchestrator      │  Fail-fast policy; integrated diagnostics
└─────────┬─────────┘
          │
    ┌─────┴─────┬─────────────┬──────────────┬─────────────┐
    ▼           ▼             ▼              ▼             ▼
Configuration  Discovery   Manifest      Dependency    Capability
Manager        Engine      Engine        Graph         Registry
    │           │             │              │             │
    │           └──────┬──────┴──────┬───────┘             │
    │                  ▼             ▼                     │
    │            Lifecycle Manager ◄───────────────────────┘
    │                  │
    │                  ▼
    └──────────► Health Manager (providers)
                       │
                       ▼
                 Platform Ready → capabilities `active`
```

### Runtime Orchestrator

**Role:** Single entry point for platform startup. Delegates all behaviour to subsystems; owns step ordering, fail-fast, diagnostics aggregation, and platform-ready transition.

**Interactions:** Invokes Configuration Manager first; passes orchestrator context (configuration, registry, lifecycle, capabilities) to each step; calls Health Manager after lifecycle initialisation; transitions capabilities from `healthy` to `active`.

**Future improvements:**

- Implement real `shutdown()` / `restart()` with graceful lifecycle teardown
- Emit structured PlatformReady event when Event Bus arrives (Milestone 4+)
- Support degraded platform ready policy (continue with warnings vs hard fail)

### Configuration Manager

**Role:** Sole authoritative source of runtime configuration. Precedence: defaults → environment → overrides.

**Interactions:** Loaded by orchestrator configuration step; read by Health Configuration Provider; exposed via `Runtime.configuration()`.

**Future improvements:**

- Remote configuration and secret providers (extension points exist)
- Desktop-specific configuration namespace (layout defaults, session policy) — likely Milestone 3
- Dynamic reload (placeholder today)

### Manifest Engine

**Role:** Validates capability manifest envelopes (Documents 024–029 shapes) via Zod schemas and semver checks.

**Interactions:** Used by Discovery Engine loader and orchestrator manifest step; gates capabilities before dependency resolution.

**Future improvements:**

- Additional manifest kinds as Desktop Framework registers view/panel descriptors
- Schema versioning migration tooling for long-lived deployments

### Discovery Engine

**Role:** Filesystem scan of configured roots; YAML load; produces `discovered` capabilities.

**Interactions:** Feeds Manifest Engine validation in orchestrator; default roots include `packages/ui/src`, `packages/theme`, `services`, `integrations`, `events`.

**Future improvements:**

- Hot reload / watch mode for development
- Explicit desktop-framework manifest roots when framework package exists
- Exclude patterns for build artefacts beyond current ignore list

### Dependency Graph

**Role:** Validates capability dependencies, detects cycles, produces topological order.

**Interactions:** Gate before registration — no capability enters `registered` without `dependencies-resolved`.

**Future improvements:**

- Optional dependency groups for soft dependencies
- Visualisation API for admin diagnostics (future)

### Capability Registry

**Role:** In-memory index of registered capabilities with lifecycle and health metadata recording.

**Interactions:** Populated after dependency resolution; synced with Lifecycle Manager; queried via `PlatformRegistry` facade (`getComponents()`, `getThemes()`, etc.).

**Future improvements:**

- PostgreSQL cache per ADR-0009
- Permission-filtered registry views for Desktop Framework (Milestone 3 dependency)
- Registry-driven navigation item registration

### Lifecycle Manager

**Role:** Validates and records capability lifecycle transitions with history.

**Interactions:** Orchestrator syncs registry lifecycle state on each step; enforces transition rules through `active`.

**Future improvements:**

- Desktop session lifecycle (user session vs capability lifecycle) — separate concern in Milestone 3
- Deactivation/suspend states for hot-unload scenarios

### Health Manager

**Role:** Coordinates health providers; aggregates runtime health; does not probe directly.

**Interactions:** Built-in providers for Runtime, Configuration, Registry, Lifecycle; invoked after capability initialisation.

**Future improvements:**

- Database, Redis, integration providers when those subsystems are live
- Desktop Framework health provider (UI shell readiness) in Milestone 3

---

## Lessons learned

### What worked well

1. **Phased review gates (ADR-0017)** — prevented scope creep; each subsystem was stable before the next began.
2. **Capability as primary abstraction** — unified manifest, registry, and lifecycle vocabulary.
3. **Provider patterns** — Health Manager and Configuration Manager extensibility without over-engineering.
4. **Co-located tests with high coverage thresholds** — caught regressions early in orchestrator integration.
5. **Minimal web integration** — instrumentation bootstrap validated runtime without destabilising SPR-001 UI.

### Architectural refinements

1. Configuration authority rule eliminated scattered `process.env` access.
2. Dependency Graph gate before registration prevented invalid registry state.
3. `PlatformRegistry` facade decouples consumer API from internal store implementation.
4. Integrated diagnostics in `Runtime.getDiagnostics()` provide operational single-pane view.

### Areas for simplification

1. **Deprecated `configuration-engine/` wrapper** — remove after downstream migration.
2. **Dual terminology** (Capability vs Module Registry in external UI) — consolidate in Desktop Framework docs.
3. **Orchestrator context growth** — consider immutable context snapshots per step for debugging.
4. **Manifest rejection at discovery vs manifest-engine** — clearer diagnostic attribution for operators.

### Technical debt

| Item                                            | Severity | Target                          |
| ----------------------------------------------- | -------- | ------------------------------- |
| `Runtime.shutdown()` / `restart()` placeholders | Medium   | Milestone 3 or 4                |
| In-memory registry only                         | Medium   | ADR-0009 implementation         |
| No Event Bus / PlatformReady event              | Medium   | Milestone 4+                    |
| Client-side Registry access blocked by design   | Low      | Server components fetch subsets |
| SDK registry type exports incomplete            | Low      | Milestone 3                     |
| PostgreSQL registry cache                       | Medium   | Post-desktop-framework          |

### Risks

| Risk                                                   | Mitigation                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| Desktop Framework builds parallel to runtime evolution | Freeze runtime public API; extend via manifests and facade |
| Registry in-memory limits scale                        | ADR-0009 before production multi-tenant                    |
| Permission model not wired to registry views           | Milestone 3 Phase 0 — PermissionService integration design |
| Static Desktop Shell vs registry-driven UI             | Sprint 003 explicit goal — incremental migration           |

---

## Recommendations

### Critical

| #   | Recommendation                                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- |
| C1  | **Tag `v0.2.0-platform-runtime`** after owner approval to lock Milestone 2 baseline                                                 |
| C2  | **Define Desktop Framework package boundary** before Sprint 003 code — `@apzhub/desktop-framework` vs extending `@apzhub/workspace` |
| C3  | **Design permission-filtered registry views** — Document 005 requires dynamic UI; runtime must expose filtered capability subsets   |

### High

| #   | Recommendation                                                                                   |
| --- | ------------------------------------------------------------------------------------------------ |
| H1  | Publish ADR for Desktop Framework package and its relationship to Platform Runtime               |
| H2  | Plan registry-driven Activity Bar migration (replace static Home icon)                           |
| H3  | Define session persistence storage strategy (Document 018) before Session Manager implementation |
| H4  | Extend Health Manager with Desktop Framework provider when shell framework exists                |

### Medium

| #   | Recommendation                                                               |
| --- | ---------------------------------------------------------------------------- |
| M1  | Remove deprecated `configuration-engine/` after Sprint 003 Phase 0           |
| M2  | Export registry types from `@apzhub/sdk` for framework consumers             |
| M3  | Implement registry PostgreSQL cache before Milestone 9 business capabilities |
| M4  | Add runtime integration test fixture for full monorepo manifest set in CI    |

### Low

| #   | Recommendation                                                 |
| --- | -------------------------------------------------------------- |
| L1  | Add `Runtime.version()` convenience API                        |
| L2  | Document degraded-startup policy for development vs production |
| L3  | Storybook coverage for all manifest-registered UI components   |

---

## Conclusion

Milestone 2 delivers a **mature, testable Platform Runtime** that meets its architectural objectives. The subsystem interaction model is sound. Known debt is documented and does not block Milestone 3.

**Overall architecture assessment: APPROVED — ready for Desktop Framework transition.**

---

_Milestone 2 review — awaiting owner sign-off on release tag._
