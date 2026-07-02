# SPR-002 — Phase 4 Report

> **Phase:** 4 — Capability Registry  
> **Sprint:** SPR-002 — Platform Registry & Discovery Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **awaiting owner review before Phase 6**

---

## Objective

Implement the **Capability Registry** with a single responsibility: **register, index, and look up capabilities** that have already passed Manifest Engine validation and Dependency Graph resolution. Transition accepted capabilities to `registered` lifecycle state and expose deterministic snapshots for diagnostics.

---

## Completed tasks

| #    | Task                        | Status                                                               |
| ---- | --------------------------- | -------------------------------------------------------------------- |
| 4.1  | Registry store              | ✅ `store.ts` — in-memory map, per-kind index, registration order    |
| 4.2  | Registration pipeline       | ✅ `registry.ts` — `register()`, `registerMany()` with rollback      |
| 4.3  | Dependency gate enforcement | ✅ Rejects capabilities not in `dependencies-resolved`               |
| 4.4  | Version compatibility       | ✅ `satisfiesPlatformVersion()` via Version Manager                  |
| 4.5  | Registry snapshot           | ✅ `snapshot()` — serialisable `RegistrySnapshot`                    |
| 4.6  | Persistence (optional)      | ⏭ Deferred per ADR-0009 — manifest-only mode documented              |
| 4.7  | Query API foundation        | ✅ `findById`, `findByKind`, `findAll`, `exists`, `count`            |
| 4.8  | Lifecycle / health metadata | ✅ `updateLifecycleState`, `updateHealth`, `getHealth` (record only) |
| 4.9  | Extension points            | ✅ `beforeRegister`, `afterUnregister` hooks (documented, minimal)   |
| 4.10 | Unit + stress tests         | ✅ 25 new tests (113 total workspace)                                |

---

## Scope boundary (confirmed)

| Responsibility                   | Owner                                                              |
| -------------------------------- | ------------------------------------------------------------------ |
| Manifest validation              | **Manifest Engine** (delegated at registration)                    |
| Dependency resolution            | **Dependency Graph** (caller must complete before register)        |
| Discovery                        | **Discovery Engine** — **not invoked** by registry                 |
| Registration / lookup / snapshot | **Capability Registry** ✅                                         |
| Bootstrap orchestration          | Bootstrap Engine — **not implemented**                             |
| Health determination             | Health Manager — **not implemented** (registry records state only) |
| REST / `Runtime.bootstrap()`     | Phase 5+ — **not implemented**                                     |
| PostgreSQL cache                 | ADR-0009 — **deferred**                                            |

---

## Exit criteria

| Criterion                                         | Result                                            |
| ------------------------------------------------- | ------------------------------------------------- |
| Registry accepts graph-resolved capabilities only | ✅ `REGISTRY_INVALID_LIFECYCLE` otherwise         |
| Duplicate IDs rejected                            | ✅ `REGISTRY_DUPLICATE_ID`                        |
| Platform version compatibility enforced           | ✅ `REGISTRY_VERSION_INCOMPATIBLE`                |
| Manifest re-validated at registration             | ✅ `REGISTRY_MANIFEST_INVALID`                    |
| Per-kind index queries                            | ✅ `findByKind()`                                 |
| Deterministic batch registration order            | ✅ Explicit order or alphabetical default         |
| Batch rollback on partial failure                 | ✅                                                |
| Registry snapshot shape stable                    | ✅ Tested                                         |
| Component index from discovery pipeline           | ⏭ End-to-end wiring deferred to Phase 5 Bootstrap |
| Module/service/integration indices                | ✅ Empty unless caller registers fixtures         |
| Persistence applied or manifest-only documented   | ✅ Manifest-only; ADR-0009 deferred               |
| Quality gates green                               | ✅                                                |
| Phase 4 report filed                              | ✅                                                |

---

## Quality gates

| Gate                 | Result              |
| -------------------- | ------------------- |
| `pnpm lint`          | ✅ Pass             |
| `pnpm typecheck`     | ✅ Pass             |
| `pnpm test`          | ✅ Pass (113 tests) |
| `pnpm test:coverage` | ✅ Pass             |
| `pnpm build`         | ✅ Pass             |

### Coverage — capability registry

| Module                             | Lines  | Statements | Functions | Branches |
| ---------------------------------- | ------ | ---------- | --------- | -------- |
| `capability-registry/` (aggregate) | 97.36% | 97.36%     | 100%      | 92.3%    |
| `errors.ts`                        | 100%   | 100%       | 100%      | 100%     |
| `guard.ts`                         | 100%   | 100%       | 100%      | 100%     |
| `store.ts`                         | 100%   | 100%       | 100%      | 100%     |
| `registry.ts`                      | 96.61% | 96.61%     | 100%      | 89.47%   |

Vitest thresholds: 95% lines/statements/functions, 88% branches for `capability-registry/**`.

Uncovered paths in `registry.ts` are defensive branches (`registerMany` rollback edge case when last record missing).

---

## Public API

```typescript
import {
  createCapabilityRegistry,
  CapabilityRegistry,
  CapabilityRegistryStore,
  registryError,
  CAPABILITY_REGISTRY_STATUS,
  type RegisteredCapabilityRecord,
  type RegistrationResult,
  type RegistrySnapshot,
  type RuntimeStatus,
} from "@apzhub/platform-runtime/capability-registry";
```

### Example

```typescript
import { resolveCapabilityDependencies } from "@apzhub/platform-runtime/dependency-graph";
import { createCapabilityRegistry } from "@apzhub/platform-runtime/capability-registry";

const resolved = resolveCapabilityDependencies(validatedCapabilities);
if (!resolved.success) throw new Error("dependency resolution failed");

const registry = createCapabilityRegistry("0.2.0");
const result = registry.registerMany(resolved.capabilities);

if (result.success) {
  const button = registry.findById("button");
  const snapshot = registry.snapshot();
}
```

---

## Files created

| Path                                                                 |
| -------------------------------------------------------------------- |
| `packages/platform-runtime/src/capability-registry/types.ts`         |
| `packages/platform-runtime/src/capability-registry/errors.ts`        |
| `packages/platform-runtime/src/capability-registry/guard.ts`         |
| `packages/platform-runtime/src/capability-registry/store.ts`         |
| `packages/platform-runtime/src/capability-registry/registry.ts`      |
| `packages/platform-runtime/src/capability-registry/index.ts`         |
| `packages/platform-runtime/src/capability-registry/registry.test.ts` |
| `packages/platform-runtime/src/capability-registry/store.test.ts`    |
| `packages/platform-runtime/src/capability-registry/errors.test.ts`   |
| `docs/architecture/capability-registry.md`                           |

## Files modified

| Path                                         | Change                                      |
| -------------------------------------------- | ------------------------------------------- |
| `packages/platform-runtime/package.json`     | `./capability-registry` export              |
| `packages/platform-runtime/src/index.ts`     | Export capability-registry                  |
| `tsconfig.base.json`                         | Path alias                                  |
| `vitest.config.ts`                           | Coverage thresholds for capability-registry |
| `docs/architecture/platform-runtime.md`      | Phase 4 delivered                           |
| `docs/architecture/platform-registry.md`     | Registry store implementation note          |
| `docs/architecture/platform-registry-api.md` | Internal registry API status                |
| `packages/platform-runtime/README.md`        | Subsystem status + API                      |
| `docs/developer/getting-started.md`          | Registry usage snippet                      |
| `docs/sprint/SPR-002-implementation-plan.md` | Phase 4 complete                            |
| `docs/README.md`                             | Sprint registry                             |
| `CHANGELOG.md`                               | Phase 4 entry                               |

---

## Performance

Stress test registers **500 capabilities** and performs 500 lookups in **&lt; 500 ms** on CI hardware (Vitest `performance.now()` assertion).

---

## Technical debt

| Item                                                            | Target phase                 |
| --------------------------------------------------------------- | ---------------------------- |
| PostgreSQL persistence cache (ADR-0009)                         | Phase 5+ or dedicated sprint |
| `Runtime.registry()` facade matching `platform-registry-api.md` | Phase 5 Bootstrap            |
| End-to-end Discover → Validate → Resolve → Register pipeline    | Phase 5 Bootstrap            |
| Embedded capability normaliser (commands, widgets, …)           | Phase 7 Integration          |
| Hot-reload / distributed registry (`replicationAdapter`)        | Future                       |

---

## Out of scope (confirmed not implemented)

- Bootstrap Engine
- Health Manager
- `apps/web` integration
- REST APIs
- Discovery invocation inside registry
- Persistence / Drizzle schema

---

## Recommendation

**Proceed to Phase 5 (Bootstrap Engine)** upon owner approval. Bootstrap should orchestrate Config → Discover → Validate → Resolve → Register and expose `Runtime.bootstrap()` / `Runtime.registry()`.

---

_Phase 4 complete — awaiting review gate per ADR-0017._
