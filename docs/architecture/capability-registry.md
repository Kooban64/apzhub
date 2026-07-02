# Capability Registry — Architecture

> **Status:** Active (SPR-002 Phase 4)  
> **Package:** `@apzhub/platform-runtime/capability-registry`  
> **Authority:** [ADR-0018](../adr/ADR-0018-platform-runtime-package.md) · [platform-registry.md](./platform-registry.md)  
> **Related:** [platform-runtime.md](./platform-runtime.md) · [platform-registry-api.md](./platform-registry-api.md)

---

## 1. Purpose

The **Capability Registry** is the in-memory runtime index for platform capabilities. It stores capabilities that have reached `dependencies-resolved` lifecycle state, promotes them to `registered` on successful registration, and exposes lookup and snapshot APIs.

The registry **does not**:

- Discover manifest files (Discovery Engine)
- Validate manifests in isolation (Manifest Engine — delegated at registration)
- Resolve dependencies (Dependency Graph — caller responsibility)
- Determine health (Health Manager — records state only)
- Bootstrap the platform (Bootstrap Engine — Phase 6)

The **Lifecycle Manager** (Phase 5) validates lifecycle transitions; callers sync successful transitions to the registry via `updateLifecycleState()`.

---

## 2. Position in the lifecycle

```text
Discovery Engine          → DISCOVERED
Manifest Engine           → VALIDATED
Dependency Graph          → DEPENDENCIES_RESOLVED
Capability Registry       → REGISTERED        ← Phase 4
Bootstrap Engine          → INITIALISED       ← Phase 5
Health Manager            → HEALTHY           ← Phase 6
Runtime Integration       → ACTIVE            ← Phase 7
```

---

## 3. Internal structure

```text
capability-registry/
├── types.ts      RegisteredCapabilityRecord, RegistrySnapshot, extension points
├── errors.ts     Structured RegistryError codes
├── store.ts      In-memory store + per-kind index + registration order
├── guard.ts      Operation generation counter (future concurrency)
├── registry.ts   CapabilityRegistry — public API
└── index.ts      Exports + CAPABILITY_REGISTRY_STATUS
```

### 3.1 RegisteredCapabilityRecord

Extends the Capability abstraction with registration metadata:

| Field                          | Description                                              |
| ------------------------------ | -------------------------------------------------------- |
| `registrationTimestamp`        | ISO timestamp at insert                                  |
| `platformVersionCompatibility` | Constraint from manifest `compatibility.platformVersion` |
| `runtimeStatus`                | `registered` \| `deregistered` \| `pending-reload`       |

### 3.2 Store

- Primary map: `id → RegisteredCapabilityRecord`
- Secondary index: `kind → Set<id>`
- Registration order array for deterministic iteration
- `clear()` bumps store generation (used by guard)

---

## 4. Registration rules

| Rule                                          | Error code                      |
| --------------------------------------------- | ------------------------------- |
| Capability id required                        | `REGISTRY_INVALID_INPUT`        |
| Lifecycle must be `dependencies-resolved`     | `REGISTRY_INVALID_LIFECYCLE`    |
| Manifest must pass Manifest Engine validation | `REGISTRY_MANIFEST_INVALID`     |
| Platform version must satisfy constraint      | `REGISTRY_VERSION_INCOMPATIBLE` |
| Duplicate id rejected                         | `REGISTRY_DUPLICATE_ID`         |
| Extension `beforeRegister` veto               | `REGISTRY_INVALID_INPUT`        |

On success, lifecycle transitions to `registered` and `runtimeStatus` is set to `registered`.

---

## 5. API surface (Phase 4)

```typescript
class CapabilityRegistry {
  register(capability, options?): RegistrationResult;
  registerMany(capabilities, options?, order?): RegistrationResult;
  unregister(id): boolean;

  findById(id): RegisteredCapabilityRecord | undefined;
  findByKind(kind): RegisteredCapabilityRecord[];
  findAll(): RegisteredCapabilityRecord[];
  exists(id): boolean;
  count(): number;

  getLifecycleState(id): CapabilityLifecycleState | undefined;
  getHealth(id): CapabilityHealthState | undefined;
  updateLifecycleState(id, state): boolean;
  updateHealth(id, state): boolean;
  updateRuntimeStatus(id, status): boolean;

  getRegistrationOrder(): readonly string[];
  getStoreGeneration(): number;
  setPlatformVersion(version): void;
  clear(): void;
  snapshot(): RegistrySnapshot;
}

function createCapabilityRegistry(
  platformVersion: string,
  extensions?: CapabilityRegistryExtensionPoints,
): CapabilityRegistry;
```

The public `Registry` interface in [platform-registry-api.md](./platform-registry-api.md) (`getComponents()`, `getModules()`, …) will be implemented as a facade in Phase 5 Bootstrap.

---

## 6. Batch registration

`registerMany()` supports:

1. **Explicit order** — caller supplies topological order from Dependency Graph
2. **Default order** — alphabetical by capability id

On partial failure, all capabilities registered in the current batch are rolled back via `unregister()`.

---

## 7. Snapshots

`snapshot()` returns serialisable JSON:

```typescript
interface RegistrySnapshot {
  platformVersion: string;
  capabilityCount: number;
  capabilitiesByKind: Record<string, number>;
  lifecycleSummary: Partial<Record<CapabilityLifecycleState, number>>;
  healthSummary: Partial<Record<CapabilityHealthState, number>>;
  registryTimestamp: string;
  capabilities: readonly RegisteredCapabilityRecord[];
}
```

Used for diagnostics, CI assertions, and future admin tooling.

---

## 8. Persistence

**Phase 4:** manifest-only, in-memory. No PostgreSQL tables.

ADR-0009 hybrid cache (manifest files as source of truth, PostgreSQL as optimisation) is deferred. Bootstrap Engine may introduce optional persistence sync in a later phase.

---

## 9. Extension points (documented, minimal)

| Hook                 | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `beforeRegister`     | Veto registration (future plugin governance)   |
| `afterUnregister`    | Cleanup external resources (future hot-reload) |
| `replicationAdapter` | Multi-node replication (future)                |

---

## 10. Testing strategy

- Unit tests for all registration rules and error codes
- Batch order and rollback behaviour
- Snapshot shape stability
- Stress test: 500 registrations + lookups under 500 ms
- Coverage target: ≥ 95% lines for `capability-registry/**`

---

_Delivered in SPR-002 Phase 4. Bootstrap wiring in Phase 5._
