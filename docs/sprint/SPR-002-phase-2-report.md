# SPR-002 — Phase 2 Report

> **Phase:** 2 — Dependency Graph  
> **Sprint:** SPR-002 — Platform Registry & Discovery Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **awaiting owner review before Phase 3**

---

## Objective

Implement the **Dependency Graph** subsystem and **Capability** runtime abstraction. Validate capability dependencies, detect missing references and cycles, produce deterministic topological order, and transition capabilities to `DEPENDENCIES_RESOLVED` before registration.

---

## Completed tasks

| #    | Task                              | Status                                                              |
| ---- | --------------------------------- | ------------------------------------------------------------------- |
| 2.1  | `Capability` type (seven facets)  | ✅ `src/capability/types.ts`                                        |
| 2.2  | `CapabilityLifecycleState` enum   | ✅ All seven states defined                                         |
| 2.3  | `CapabilityHealthState` enum      | ✅ Default `unknown`                                                |
| 2.4  | `buildCapabilityFromManifest()`   | ✅ `src/capability/factory.ts`                                      |
| 2.5  | Dependency normalisation          | ✅ `src/capability/dependencies.ts`                                 |
| 2.6  | Graph construction                | ✅ `src/dependency-graph/build.ts`                                  |
| 2.7  | Missing dependency detection      | ✅ `MISSING_DEPENDENCY` errors                                      |
| 2.8  | Cycle detection                   | ✅ `src/dependency-graph/cycle-detection.ts`                        |
| 2.9  | Topological ordering              | ✅ `getTopologicalOrder()` — deterministic, dependency-first        |
| 2.10 | Platform seed capabilities        | ✅ `identity`, `config`, `theme` + `additionalPlatformSeeds` config |
| 2.11 | `resolveCapabilityDependencies()` | ✅ Orchestrator with structured errors                              |
| 2.12 | Unit + fixture tests              | ✅ 28 new tests across capability and dependency-graph              |

---

## Exit criteria

| Criterion                                                  | Result                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------ |
| `Capability` type exported with all seven facets           | ✅                                                     |
| Lifecycle transitions through `dependencies-resolved` only | ✅                                                     |
| Missing dependencies produce actionable errors             | ✅                                                     |
| Cycles reported with cycle path                            | ✅                                                     |
| Deterministic topological order                            | ✅                                                     |
| No Discovery Engine implementation                         | ✅                                                     |
| No Capability Registry implementation                      | ✅                                                     |
| Dependency graph logic coverage                            | ✅ 100% lines / statements / functions; 86.2% branches |
| Capability module coverage                                 | ✅ 100% all metrics                                    |
| Quality gates green                                        | ✅                                                     |
| Phase 2 report filed                                       | ✅ This document                                       |

---

## Quality gates

| Gate                 | Result             |
| -------------------- | ------------------ |
| `pnpm lint`          | ✅ Pass            |
| `pnpm typecheck`     | ✅ Pass            |
| `pnpm test`          | ✅ Pass (70 tests) |
| `pnpm test:coverage` | ✅ Pass            |
| `pnpm build`         | ✅ Pass            |

### Coverage — dependency graph logic

| Module                          | Lines | Statements | Functions | Branches |
| ------------------------------- | ----- | ---------- | --------- | -------- |
| `dependency-graph/` (aggregate) | 100%  | 100%       | 100%      | 86.2%    |
| `capability/` (aggregate)       | 100%  | 100%       | 100%      | 100%     |

Remaining uncovered branches are defensive fallbacks in queue iteration (`?? []`, `if (!node) break`) that are unreachable under normal graph invariants.

---

## Public API

```typescript
import {
  buildCapabilityFromManifest,
  withCapabilityLifecycleState,
  type Capability,
  type CapabilityLifecycleState,
} from "@apzhub/platform-runtime/capability";

import {
  resolveCapabilityDependencies,
  getTopologicalOrder,
  buildDependencyGraph,
  PLATFORM_SEED_CAPABILITIES,
} from "@apzhub/platform-runtime/dependency-graph";
```

### Capability lifecycle (Phase 2 scope)

```text
VALIDATED  →  DEPENDENCIES_RESOLVED   (on success)
VALIDATED  →  VALIDATED               (on failure — no mutation)
```

---

## Files created

| Path                                                                |
| ------------------------------------------------------------------- |
| `packages/platform-runtime/src/capability/types.ts`                 |
| `packages/platform-runtime/src/capability/factory.ts`               |
| `packages/platform-runtime/src/capability/dependencies.ts`          |
| `packages/platform-runtime/src/capability/index.ts`                 |
| `packages/platform-runtime/src/capability/*.test.ts`                |
| `packages/platform-runtime/src/dependency-graph/types.ts`           |
| `packages/platform-runtime/src/dependency-graph/errors.ts`          |
| `packages/platform-runtime/src/dependency-graph/platform-seeds.ts`  |
| `packages/platform-runtime/src/dependency-graph/build.ts`           |
| `packages/platform-runtime/src/dependency-graph/cycle-detection.ts` |
| `packages/platform-runtime/src/dependency-graph/resolve.ts`         |
| `packages/platform-runtime/src/dependency-graph/index.ts`           |
| `packages/platform-runtime/src/dependency-graph/*.test.ts`          |
| `testing/fixtures/registry/dependency-graph-*.yaml` (8 fixtures)    |

## Files modified

| Path                                         | Change                                       |
| -------------------------------------------- | -------------------------------------------- |
| `packages/platform-runtime/package.json`     | `./capability`, `./dependency-graph` exports |
| `packages/platform-runtime/src/index.ts`     | Export capability + dependency-graph         |
| `tsconfig.base.json`                         | Path aliases                                 |
| `vitest.config.ts`                           | Coverage thresholds for Phase 2 modules      |
| `docs/architecture/platform-runtime.md`      | Phase 2 delivered note                       |
| `packages/platform-runtime/README.md`        | Subsystem status                             |
| `docs/sprint/SPR-002-implementation-plan.md` | Phase 2 complete                             |
| `CHANGELOG.md`                               | Phase 2 entry                                |

---

## Out of scope (confirmed not implemented)

- Discovery Engine (Phase 3)
- Capability Registry (Phase 4)
- Bootstrap Engine (Phase 5)
- Runtime Health (Phase 6)
- `apps/web` integration (Phase 7)
- REST APIs
- Business modules / external integrations

---

## Deviations

| #   | Planned                            | Actual                       | Severity                             |
| --- | ---------------------------------- | ---------------------------- | ------------------------------------ |
| D1  | `normalise.ts` in dependency-graph | `capability/dependencies.ts` | Low — avoids circular imports        |
| D2  | `resolve.ts` only                  | Split `cycle-detection.ts`   | Low — improves testability           |
| D3  | 100% branch coverage               | 86.2% branches               | Low — defensive branches unreachable |

No deviations affect Document 000 compliance or the phased review gate.

---

## Recommendation

**Proceed to Phase 3 (Discovery Engine)** upon owner approval. Discovery should produce `VALIDATED` capabilities and hand off to `resolveCapabilityDependencies()` before registration in Phase 4.

---

_Phase 2 complete — awaiting review gate per ADR-0017._
