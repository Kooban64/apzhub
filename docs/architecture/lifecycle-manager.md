# Lifecycle Manager — Architecture

> **Status:** Active (SPR-002 Phase 5)  
> **Package:** `@apzhub/platform-runtime/lifecycle-manager`  
> **Authority:** [ADR-0018](../adr/ADR-0018-platform-runtime-package.md) · [platform-runtime.md](./platform-runtime.md)

---

## 1. Purpose

The **Lifecycle Manager** owns **capability lifecycle state transitions**. It defines valid transitions, rejects invalid movement, records transition history, and exposes diagnostics and snapshots.

The Lifecycle Manager **does not**:

- Discover manifests
- Validate manifests
- Resolve dependencies
- Register capabilities
- Perform health checks
- Execute business logic

The **Capability Registry** records lifecycle state metadata. The **Lifecycle Manager** decides whether a transition is valid. Callers orchestrate both: transition via Lifecycle Manager, then update the registry on success.

---

## 2. Lifecycle states

### Happy path

```text
DISCOVERED → VALIDATED → DEPENDENCIES_RESOLVED → REGISTERED → INITIALISED → HEALTHY → ACTIVE
```

### Failure / operational states

| State      | Purpose                                             |
| ---------- | --------------------------------------------------- |
| `failed`   | Capability or bootstrap step failed                 |
| `disabled` | Administratively disabled or hot-reload off         |
| `degraded` | Partially operational (e.g. latency, optional deps) |

---

## 3. Transition rules

| From                    | Allowed targets                               |
| ----------------------- | --------------------------------------------- |
| `discovered`            | `validated`, `failed`, `disabled`             |
| `validated`             | `dependencies-resolved`, `failed`, `disabled` |
| `dependencies-resolved` | `registered`, `failed`, `disabled`            |
| `registered`            | `initialised`, `failed`, `disabled`           |
| `initialised`           | `healthy`, `degraded`, `failed`, `disabled`   |
| `healthy`               | `active`, `degraded`, `failed`, `disabled`    |
| `active`                | `degraded`, `failed`, `disabled`              |
| `degraded`              | `healthy`, `failed`, `disabled`               |
| `failed`                | `discovered`, `degraded`, `disabled`          |
| `disabled`              | `discovered`                                  |

Untracked capabilities may enter only via `discovered` (or `reset()`).

---

## 4. API surface

```typescript
class CapabilityLifecycleManager {
  reset(capabilityId: string): boolean;
  transition(capabilityId, to, context?): LifecycleTransitionResult;
  canTransition(capabilityId, to): boolean;
  getState(capabilityId): CapabilityLifecycleState | undefined;
  getHistory(capabilityId): readonly LifecycleTransitionRecord[];
  markFailed(capabilityId, reason?): LifecycleTransitionResult;
  markDisabled(capabilityId, reason?): LifecycleTransitionResult;
  getDiagnostics(capabilityId): LifecycleDiagnostics;
  snapshot(): LifecycleSnapshot;
  clear(): void;
}
```

Transition context supports `reason`, `source`, and `auditRef` for future audit integration.

---

## 5. Integration pattern

```typescript
import { createCapabilityLifecycleManager } from "@apzhub/platform-runtime/lifecycle-manager";
import { createCapabilityRegistry } from "@apzhub/platform-runtime/capability-registry";

const lifecycle = createCapabilityLifecycleManager();
const registry = createCapabilityRegistry("0.2.0");

lifecycle.reset(capability.id);
const result = lifecycle.transition(capability.id, "registered", {
  source: "bootstrap",
});
if (result.success) {
  registry.updateLifecycleState(capability.id, "registered");
}
```

Bootstrap Engine (future) will orchestrate this pattern across subsystems.

---

_Delivered in SPR-002 Phase 5._
