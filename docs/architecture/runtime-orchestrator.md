# Runtime Orchestrator — Architecture

> **Status:** Active (SPR-002 Phase 6)  
> **Package:** `@apzhub/platform-runtime/runtime-orchestrator` · `@apzhub/platform-runtime/server`  
> **Authority:** [ADR-0014](../adr/ADR-0014-registry-bootstrap-lifecycle.md) · [ADR-0018](../adr/ADR-0018-platform-runtime-package.md)

---

## 1. Purpose

The **Runtime Orchestrator** coordinates the platform startup sequence. It delegates all subsystem behaviour to existing runtime modules and records structured diagnostics for each step.

The Runtime Orchestrator **does not**:

- Parse or validate manifests (Manifest Engine)
- Scan filesystems (Discovery Engine)
- Resolve dependencies (Dependency Graph)
- Register capabilities (Capability Registry)
- Validate lifecycle transitions (Lifecycle Manager)
- Evaluate health (Health Manager)

Public consumers use **`Runtime.bootstrap()`** via `@apzhub/platform-runtime/server`. Internal code and documentation use the term **Runtime Orchestrator**.

---

## 2. Startup sequence

```text
Platform Start
        ↓
Load Runtime Configuration          ← Configuration Manager
        ↓
Discovery Engine                    ← discover manifests
        ↓
Manifest Engine                     ← validate + version check
        ↓
Dependency Graph                    ← resolve + order
        ↓
Capability Registry                 ← register capabilities
        ↓
Lifecycle Manager                   ← registered → initialised
        ↓
Health Manager                      ← provider-based evaluation (Phase 8)
        ↓
Platform Ready
```

Execution order follows subsystem dependencies. Discovery runs before Manifest Engine validation because manifests must be located before they can be validated.

---

## 3. Subsystem delegation

| Step                | Delegates to                                                     |
| ------------------- | ---------------------------------------------------------------- |
| Configuration       | `loadRuntimeConfiguration()`                                     |
| Discovery           | `discoverCapabilities()`                                         |
| Manifest Engine     | `validateCapabilityManifest()`, `satisfiesPlatformVersion()`     |
| Dependency Graph    | `resolveCapabilityDependencies()`                                |
| Capability Registry | `CapabilityRegistry.registerMany()`                              |
| Lifecycle Manager   | `CapabilityLifecycleManager.transition()` + registry sync        |
| Health Manager      | Provider-based evaluation; transitions capabilities to `healthy` |
| Platform Ready      | `onPlatformReady` callback + status `ready`                      |

---

## 4. Public Runtime API

```typescript
import { Runtime } from "@apzhub/platform-runtime/server";

await Runtime.bootstrap({ workspaceRoot: "/path/to/repo" });
Runtime.getStatus(); // "ready" | "failed" | ...
Runtime.getDiagnostics(); // integrated subsystem summaries
Runtime.registry().getComponents();
Runtime.health();
Runtime.configuration();

await Runtime.initialise(); // bootstrap if not ready
await Runtime.shutdown(); // placeholder — clears state
await Runtime.restart(); // placeholder — shutdown + bootstrap
```

---

## 5. Error handling

- **Fail-fast** (default): fatal discovery diagnostics or subsystem failure stops startup immediately; status → `failed`
- **Structured diagnostics**: each step records duration, message, and `OrchestratorError` entries with subsystem attribution
- **Deterministic behaviour**: fixed step order via `STARTUP_STEP_ORDER`

---

## 6. Integration pattern

After each lifecycle transition, the orchestrator syncs registry metadata:

```typescript
lifecycle.transition(id, "validated", { source: "manifest-engine" });
registry.updateLifecycleState(id, "validated");
```

Bootstrap Engine naming is **deprecated**; use Runtime Orchestrator in all new internal references.

---

_Delivered in SPR-002 Phases 6–9. Full runtime integration complete._
