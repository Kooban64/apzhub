# SPR-002 — Phase 2 Plan

> **Phase:** 2 — Dependency Graph  
> **Sprint:** SPR-002 — Platform Registry & Discovery Framework  
> **Date:** 2026-06-28  
> **Status:** **Awaiting owner approval** — implemented (2026-06-28)

---

## 1. Objective

Design and implement the **Dependency Graph** subsystem in `@apzhub/platform-runtime`. Introduce **Capability** as the primary runtime abstraction and enforce dependency validation **before** any capability may proceed to registration.

Phase 2 delivers a standalone, testable graph engine. It does **not** implement Discovery Engine, Capability Registry, Bootstrap Engine, or application integration.

---

## 2. Architectural context

### 2.1 Revised phase sequence (SPR-002)

| Phase | Subsystem                         | Status        |
| ----- | --------------------------------- | ------------- |
| 0     | Pre-flight & ADRs                 | ✅ Complete   |
| 1     | Manifest Engine + Version Manager | ✅ Complete   |
| **2** | **Dependency Graph**              | **This plan** |
| 3     | Discovery Engine                  | Planned       |
| 4     | Capability Registry               | Planned       |
| 5     | Bootstrap Engine                  | Planned       |
| 6     | Runtime Health                    | Planned       |
| 7     | Runtime Integration               | Planned       |
| 8     | Testing, Documentation & Closeout | Planned       |

### 2.2 Capability as primary runtime abstraction

Every runtime object is a **Capability** with these required facets:

| Facet               | Source (Phase 2)                                                 |
| ------------------- | ---------------------------------------------------------------- |
| **Capability Kind** | `manifest.kind`                                                  |
| **Manifest**        | Parsed `CapabilityManifest` from Manifest Engine                 |
| **Metadata**        | `manifest.metadata`                                              |
| **Dependencies**    | Normalised from `manifest.dependencies`                          |
| **Lifecycle State** | `CapabilityLifecycleState` enum                                  |
| **Health State**    | `CapabilityHealthState` enum (defined; not evaluated in Phase 2) |
| **Version**         | `manifest.version`                                               |

### 2.3 Capability lifecycle

Formal lifecycle states (ordered):

```text
DISCOVERED
    ↓
VALIDATED
    ↓
DEPENDENCIES_RESOLVED    ← Phase 2 terminal success state
    ↓
REGISTERED               ← Phase 4 (Capability Registry)
    ↓
INITIALISED              ← Phase 5 (Bootstrap Engine)
    ↓
HEALTHY                  ← Phase 6 (Runtime Health)
    ↓
ACTIVE                   ← Phase 7 (Runtime Integration)
```

**Phase 2 responsibility:** Accept capabilities in `VALIDATED` state. On successful graph resolution, transition them to `DEPENDENCIES_RESOLVED`. On failure, remain at `VALIDATED` and return structured errors (fail-fast per ADR-0013 when wired in Phase 5).

**Gate rule:** No capability may enter `REGISTERED` until the Dependency Graph confirms all declared dependencies resolve and no cycles exist. This gate is **implemented** in Phase 2 and **enforced** by Capability Registry in Phase 4.

### 2.4 Relationship to platform startup (ADR-0014)

ADR-0014 steps **Resolve Dependencies** and **Detect Cycles** map to the Dependency Graph subsystem. In the revised phase order, the graph is built and validated **after** manifest validation and **before** registration:

```text
… → Validate Manifests → Validate Versions → [Dependency Graph] → Register Capabilities → …
```

Discovery (Phase 3) produces `DISCOVERED` capabilities; Manifest Engine promotes to `VALIDATED`. The Dependency Graph runs on the `VALIDATED` set before the Capability Registry (Phase 4) may register.

---

## 3. Scope

### 3.1 In scope

| #    | Deliverable                  | Description                                                                                               |
| ---- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| 2.1  | `Capability` type            | Canonical runtime object combining all seven facets                                                       |
| 2.2  | `CapabilityLifecycleState`   | Enum with all seven states; Phase 2 transitions `VALIDATED` → `DEPENDENCIES_RESOLVED` only                |
| 2.3  | `CapabilityHealthState`      | Enum (`unknown`, `healthy`, `unhealthy`, `degraded`); default `unknown` in Phase 2                        |
| 2.4  | Dependency normalisation     | Extract and normalise `dependencies.platform`, `.services`, `.integrations`, `.modules` from manifests    |
| 2.5  | Graph construction           | Build directed graph: capability `id` → dependency `id` edges per axis                                    |
| 2.6  | Missing dependency detection | Fail when a declared dependency id is not present in the input capability set                             |
| 2.7  | Cycle detection              | Detect and report dependency cycles with participating capability ids                                     |
| 2.8  | Topological resolution       | Produce deterministic load/registration order when graph is valid                                         |
| 2.9  | Structured errors            | `DependencyGraphError` with codes: `MISSING_DEPENDENCY`, `CYCLE_DETECTED`, `INVALID_INPUT`, `EMPTY_GRAPH` |
| 2.10 | Public API                   | `buildCapabilityFromManifest()`, `resolveCapabilityDependencies()`, `getTopologicalOrder()`               |
| 2.11 | Unit tests                   | Fixtures covering valid graphs, missing deps, cycles, multi-axis deps, empty input                        |
| 2.12 | Documentation                | Update architecture docs; inline JSDoc on graph module                                                    |

### 3.2 Out of scope (explicit)

| Item                                                                     | Deferred to                                             |
| ------------------------------------------------------------------------ | ------------------------------------------------------- |
| Filesystem manifest discovery                                            | Phase 3                                                 |
| Capability Registry store / indices                                      | Phase 4                                                 |
| `REGISTERED` and later lifecycle transitions                             | Phases 4–7                                              |
| Health probing / `HEALTHY` evaluation                                    | Phase 6                                                 |
| `Runtime.bootstrap()` orchestration                                      | Phase 5                                                 |
| PostgreSQL persistence (ADR-0009)                                        | Phase 4 or 7 (TBD at Phase 4 planning)                  |
| `apps/web` integration                                                   | Phase 7                                                 |
| REST API                                                                 | Never in SPR-002 (ADR-0010)                             |
| Semantic version range resolution between capabilities                   | Future — Phase 2 matches by capability `id` only        |
| Cross-kind dependency rules (e.g. "modules may only depend on services") | Future ADR if needed; Phase 2 treats all axes uniformly |

---

## 4. Design

### 4.1 Module layout

```text
packages/platform-runtime/src/
├── capability/                    # NEW — shared Capability model
│   ├── types.ts                   # Capability, LifecycleState, HealthState
│   ├── factory.ts                 # buildCapabilityFromManifest()
│   └── index.ts
├── dependency-graph/
│   ├── types.ts                   # GraphNode, GraphEdge, ResolutionResult
│   ├── normalise.ts               # Extract dependency ids from manifest
│   ├── build.ts                   # Construct graph from Capability[]
│   ├── resolve.ts                 # Topological sort + cycle detection
│   ├── errors.ts                  # DependencyGraphError codes
│   ├── resolve.test.ts
│   └── index.ts
```

Export path: `@apzhub/platform-runtime/dependency-graph` (and `capability` if needed by consumers).

### 4.2 Capability type (sketch)

```typescript
type CapabilityLifecycleState =
  | "discovered"
  | "validated"
  | "dependencies-resolved"
  | "registered"
  | "initialised"
  | "healthy"
  | "active";

type CapabilityHealthState = "unknown" | "healthy" | "unhealthy" | "degraded";

interface Capability {
  readonly id: string;
  readonly kind: CapabilityKind;
  readonly manifest: CapabilityManifest;
  readonly metadata: CapabilityMetadata;
  readonly dependencies: NormalisedDependencies;
  readonly lifecycleState: CapabilityLifecycleState;
  readonly healthState: CapabilityHealthState;
  readonly version: string;
}

interface NormalisedDependencies {
  readonly platform: readonly string[];
  readonly services: readonly string[];
  readonly integrations: readonly string[];
  readonly modules: readonly string[];
  readonly all: readonly string[]; // deduplicated union for graph edges
}
```

### 4.3 Dependency Graph API (sketch)

```typescript
interface DependencyResolutionResult {
  success: true;
  capabilities: Capability[]; // lifecycleState → dependencies-resolved
  order: string[]; // topological registration order
  graph: DependencyGraphSnapshot; // diagnostic export
}

interface DependencyResolutionFailure {
  success: false;
  errors: DependencyGraphError[];
  partialGraph?: DependencyGraphSnapshot;
}

function resolveCapabilityDependencies(
  capabilities: Capability[],
): DependencyResolutionResult | DependencyResolutionFailure;
```

**Input contract:**

- All capabilities must be in `validated` lifecycle state.
- Each `id` must be unique within the input set.
- Manifests must already pass Manifest Engine validation.

**Output contract:**

- On success: same capability objects with `lifecycleState: "dependencies-resolved"`, plus deterministic topological `order`.
- On failure: no state mutation; structured errors; optional partial graph for diagnostics.

### 4.4 Graph algorithm

1. **Normalise** — For each capability, collect dependency ids from all four manifest axes.
2. **Index** — Build `Map<id, Capability>` for O(1) lookup.
3. **Validate presence** — For each edge `capability.id → dependencyId`, verify `dependencyId` exists in the index. Platform dependencies referencing built-in platform capabilities (e.g. `identity`) may be satisfied by a **platform capability seed list** supplied as graph config (see §4.5).
4. **Detect cycles** — DFS or Kahn's algorithm with cycle reporting; fail on first cycle (or collect all — recommend collect all for better DX).
5. **Topological sort** — Kahn's algorithm on valid DAG; tie-break alphabetically by `id` for determinism.
6. **Transition** — Immutable update: return new `Capability` objects at `dependencies-resolved`.

### 4.5 Platform capability seeds

Manifests may declare `dependencies.platform: [identity]` where `identity` is a built-in platform capability not yet discovered from filesystem. Phase 2 introduces a **platform seed registry** (static config, not Discovery):

```typescript
const PLATFORM_SEED_CAPABILITIES = ["identity", "config", "theme"] as const;
```

Edges to seed ids are valid without a corresponding `Capability` in the input set. Seeds are documented in Phase 2 and may expand in Phase 7 scaffold work.

### 4.6 Error model

| Code                 | Condition                                                 |
| -------------------- | --------------------------------------------------------- |
| `INVALID_INPUT`      | Duplicate ids, wrong lifecycle state, empty capability id |
| `MISSING_DEPENDENCY` | Declared dependency id not in input set or platform seeds |
| `CYCLE_DETECTED`     | Circular dependency chain; includes `cycle: string[]`     |
| `VERSION_CONFLICT`   | Reserved — not implemented in Phase 2                     |

Errors align with ADR-0013 fail-fast policy for later Bootstrap Engine wiring.

### 4.7 Integration boundaries

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ Manifest Engine │ ──► │ Capability model │ ──► │  Dependency Graph   │
│  (Phase 1 ✅)   │     │    (Phase 2)     │     │     (Phase 2)       │
└─────────────────┘     └──────────────────┘     └──────────┬──────────┘
                                                            │
                         Phase 3 adds DISCOVERED ────────────┤
                         Phase 4 consumes DEPENDENCIES_    │
                         RESOLVED for REGISTERED ───────────▼
                                              ┌─────────────────────┐
                                              │ Capability Registry │
                                              │     (Phase 4)       │
                                              └─────────────────────┘
```

Phase 2 tests use **synthetic `Capability` fixtures** built from existing `testing/fixtures/registry/*.yaml` and inline manifest objects — not filesystem discovery.

---

## 5. Tasks

| #    | Task                                                     | Estimate      |
| ---- | -------------------------------------------------------- | ------------- |
| 2.1  | Define `Capability`, lifecycle, and health types         | 0.5 d         |
| 2.2  | Implement `buildCapabilityFromManifest()` factory        | 0.5 d         |
| 2.3  | Implement dependency normalisation                       | 0.5 d         |
| 2.4  | Implement graph build + missing dependency check         | 1 d           |
| 2.5  | Implement cycle detection                                | 0.5 d         |
| 2.6  | Implement topological sort with deterministic ordering   | 0.5 d         |
| 2.7  | Implement `resolveCapabilityDependencies()` orchestrator | 0.5 d         |
| 2.8  | Platform seed capability config                          | 0.25 d        |
| 2.9  | Unit tests + fixtures                                    | 1 d           |
| 2.10 | Update `package.json` exports, vitest coverage config    | 0.25 d        |
| 2.11 | Documentation updates                                    | 0.5 d         |
| 2.12 | Phase 2 completion report                                | 0.25 d        |
|      | **Total**                                                | **~5–6 days** |

---

## 6. Files to create

| Path                                                                                   |
| -------------------------------------------------------------------------------------- |
| `packages/platform-runtime/src/capability/types.ts`                                    |
| `packages/platform-runtime/src/capability/factory.ts`                                  |
| `packages/platform-runtime/src/capability/index.ts`                                    |
| `packages/platform-runtime/src/dependency-graph/types.ts`                              |
| `packages/platform-runtime/src/dependency-graph/normalise.ts`                          |
| `packages/platform-runtime/src/dependency-graph/build.ts`                              |
| `packages/platform-runtime/src/dependency-graph/resolve.ts`                            |
| `packages/platform-runtime/src/dependency-graph/errors.ts`                             |
| `packages/platform-runtime/src/dependency-graph/resolve.test.ts`                       |
| `packages/platform-runtime/src/dependency-graph/platform-seeds.ts`                     |
| `testing/fixtures/registry/dependency-graph-valid.yaml` (multi-capability fixture set) |
| `testing/fixtures/registry/dependency-graph-cycle.yaml`                                |
| `testing/fixtures/registry/dependency-graph-missing.yaml`                              |
| `docs/sprint/SPR-002-phase-2-report.md` (at completion)                                |

## 7. Files to modify

| Path                                                      | Change                                                   |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `packages/platform-runtime/src/dependency-graph/index.ts` | Replace placeholder with exports                         |
| `packages/platform-runtime/src/index.ts`                  | Export capability + dependency-graph                     |
| `packages/platform-runtime/package.json`                  | Add `./dependency-graph`, `./capability` exports         |
| `tsconfig.base.json`                                      | Path aliases for new exports                             |
| `vitest.config.ts`                                        | Coverage includes `dependency-graph/**`, `capability/**` |
| `docs/architecture/platform-runtime.md`                   | Capability model + lifecycle section                     |
| `docs/sprint/SPR-002-implementation-plan.md`              | Revised phase sequence (this revision)                   |
| `packages/platform-runtime/README.md`                     | Phase 2 status                                           |
| `CHANGELOG.md`                                            | Phase 2 entry (at completion)                            |

---

## 8. Tests required

| Scenario                                                          | Expected outcome                                          |
| ----------------------------------------------------------------- | --------------------------------------------------------- |
| Single capability, no dependencies                                | Resolves; order `[id]`; state → `dependencies-resolved`   |
| Linear chain A → B → C                                            | Topological order C, B, A (dependents after dependencies) |
| Diamond dependency                                                | Valid order respecting all edges                          |
| Missing dependency id                                             | `MISSING_DEPENDENCY` error; no state change               |
| Cycle A → B → A                                                   | `CYCLE_DETECTED` with cycle path                          |
| Platform seed dependency (`identity`)                             | Resolves without identity in input set                    |
| Duplicate capability ids in input                                 | `INVALID_INPUT`                                           |
| Capability not in `validated` state                               | `INVALID_INPUT`                                           |
| SPR-001 component set (7 components, no cross-deps)               | All resolve independently                                 |
| Multi-axis dependencies (module depends on service + integration) | All edges validated                                       |

**Coverage target:** `dependency-graph/` and `capability/` ≥ 80% per ADR-0016.

---

## 9. Documentation updates

| Document                              | Update                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| `platform-runtime.md`                 | Add § Capability model, § Capability lifecycle, update startup diagram       |
| `platform-registry.md`                | Note dependency gate before registration                                     |
| `packages/platform-runtime/README.md` | Phase 2 subsystem status                                                     |
| Proposed ADR-0019                     | Capability lifecycle states — file at implementation start if owner approves |

---

## 10. Exit criteria

| Criterion                                            | Measure                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| `Capability` type exported with all seven facets     | Type present and documented                                       |
| Lifecycle enum includes all seven states             | Defined; Phase 2 transitions through `dependencies-resolved` only |
| Missing dependencies detected with actionable errors | Unit tests pass                                                   |
| Cycles detected with cycle path in error             | Unit tests pass                                                   |
| Deterministic topological order                      | Same input → same order across runs                               |
| No Discovery Engine code added                       | Code review / phase report                                        |
| No Capability Registry code added                    | Code review / phase report                                        |
| Unit tests pass; coverage ≥ 80% on new modules       | CI green                                                          |
| Quality gates pass                                   | `lint`, `typecheck`, `test`, `test:coverage`, `build`             |
| Phase 2 report filed                                 | `SPR-002-phase-2-report.md`                                       |

---

## 11. Risks and mitigations

| Risk                                        | Mitigation                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Platform seed list incomplete               | Document seeds explicitly; expand in Phase 7 scaffold                                 |
| Ambiguity: registration order vs init order | Topological order is for registration; document that init order may differ in Phase 5 |
| Cross-kind dependency semantics undefined   | Phase 2 validates id presence only; kind-aware rules deferred                         |
| ADR-0014 step order vs new phase order      | Update ADR-0014 annotation in Phase 2 docs; formal ADR amendment optional             |

---

## 12. Recommendation

Approve this plan to begin Phase 2 implementation. Upon completion, file `SPR-002-phase-2-report.md` and await review before Phase 3 (Discovery Engine).

---

_Planning document — no code changes until owner approval._
