# Platform Registry — Architecture

> **Status:** Active (SPR-002 Phase 4)  
> **Authority:** [Document 024](../024-apzhub-platform-sdk-development-framework.md) · [ADR-0004](../adr/ADR-0004-platform-registry-first-architecture.md)  
> **Related:** [Manifest specification](./platform-manifest-specification.md) · [Registry API](./platform-registry-api.md) · [Registry database](./platform-registry-database.md)

---

## 1. Purpose

The **Platform Registry** is the runtime source of truth for discoverable platform capabilities. It indexes manifests, validates contracts, resolves dependencies, and exposes read-oriented APIs to consumers (Desktop Shell, Command Palette, Search, Event Bus, administration tools).

The Registry is a **platform capability**. It is not a business module and contains no business logic.

Per Document 000 Principle 5: _Manifest-first, registry-driven, replaceable extensions._

---

## 2. Architectural position

```text
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  Desktop Shell · Command Palette · Search · Admin UI         │
│  (future consumers — not modified in SPR-002)                │
└───────────────────────────┬─────────────────────────────────┘
                            │ read-only queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Platform Registry API                      │
│  Registry.getModules() · getServices() · getComponents() …   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Platform Registry Core                     │
│  Validation · Dependency Resolution · Lifecycle · Health   │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
                ▼                         ▼
┌───────────────────────────┐   ┌─────────────────────────────┐
│   Manifest Discovery       │   │   Persistence (optional)     │
│   Filesystem scan          │   │   PostgreSQL cache + state   │
└───────────────────────────┘   └─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│              Manifest files (source of truth)                │
│  component.yaml · module.yaml · service.yaml · …             │
└─────────────────────────────────────────────────────────────┘
```

**Layer rules:**

- Registry does not call integrations or engines
- Registry does not enforce RBAC in SPR-002 (metadata only; filtering deferred to IAM sprint)
- Registry does not publish events to Event Bus in SPR-002 (may emit platform diagnostic events later)

---

## 3. Registry architecture

### 3.1 Components

| Component               | Responsibility                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Discovery engine**    | Locate manifest files in configured monorepo roots                                                          |
| **Validation engine**   | Parse YAML; validate against Zod schemas per kind                                                           |
| **Normaliser**          | Extract embedded commands, search providers, widgets from module manifests into secondary indices           |
| **Dependency resolver** | Build directed graph; detect cycles; order bootstrap                                                        |
| **Registry store**      | In-memory indexes keyed by kind and stable ID — **implemented** in `capability-registry/store.ts` (Phase 4) |
| **Persistence adapter** | Optional PostgreSQL read/write for cache and lifecycle                                                      |
| **Public API**          | Typed facades for consumers                                                                                 |
| **Bootstrap**           | Orchestrate startup sequence                                                                                |

### 3.2 Package placement

**Decision:** `@apzhub/platform-runtime` ([ADR-0018](../adr/ADR-0018-platform-runtime-package.md))

Implementation lives in `packages/platform-runtime/{bootstrap,registry,discovery,manifests,...}/`.

See [platform-runtime.md](./platform-runtime.md) for full layout.

---

## 4. Runtime lifecycle

### 4.1 Startup sequence

```text
1. Load environment (PLATFORM_VERSION, NODE_ENV)
2. Initialise persistence adapter (if enabled)
3. Run discovery scan
4. For each manifest file:
   a. Parse YAML
   b. Validate schema
   c. Check platform version compatibility
5. Resolve dependencies across all validated manifests
6. Register capabilities in store (default: enabled for platform; disabled for scaffolds)
7. Persist cache snapshot (if enabled)
8. Mark registry ready
9. Expose via getRegistry()
```

### 4.2 Runtime states

| Registry state | Meaning                                                      |
| -------------- | ------------------------------------------------------------ |
| `initialising` | Bootstrap in progress                                        |
| `ready`        | All manifests validated and indexed                          |
| `degraded`     | Some optional capabilities failed; core platform OK          |
| `failed`       | Critical validation failure; app must not serve (production) |

### 4.3 Capability lifecycle (per entry)

Aligns with Module SDK states (025) — simplified for SPR-002:

| State         | SPR-002 behaviour                         |
| ------------- | ----------------------------------------- |
| `installed`   | Manifest discovered and validated         |
| `enabled`     | Included in default queries               |
| `disabled`    | Indexed but excluded from default queries |
| `deprecated`  | Indexed with warning metadata             |
| `maintenance` | Future — operator flag                    |
| `removed`     | Not indexed (manifest absent)             |

Lifecycle **mutations** (enable/disable) are operator actions stored in PostgreSQL in the hybrid model. Filesystem manifests remain authoritative for **definition**; database holds **runtime state**.

### 4.4 Refresh model

| Environment | Behaviour                                                                            |
| ----------- | ------------------------------------------------------------------------------------ |
| Development | Manual restart or `POST /api/platform/registry/refresh` (optional dev-only endpoint) |
| Production  | Restart on deploy; no hot-reload in SPR-002                                          |
| Future      | Watch mode with debounced re-scan (out of scope)                                     |

---

## 5. Discovery process

### 5.1 Scan roots

| Path                        | Manifest files     | SPR-002 expected count         |
| --------------------------- | ------------------ | ------------------------------ |
| `packages/ui/src/**/`       | `component.yaml`   | 7–8                            |
| `packages/theme/themes/**/` | `theme.yaml`       | 2 (light, dark)                |
| `services/**/`              | `service.yaml`     | 1 (platform-registry scaffold) |
| `integrations/**/`          | `integration.yaml` | 0–1 (scaffold only)            |
| `events/**/`                | `event.yaml`       | 1 (platform scaffold)          |
| `modules/**/` (future)      | `module.yaml`      | 0                              |

### 5.2 Discovery algorithm

Implemented in `packages/platform-runtime/src/discovery-engine/` (Phase 3).

1. Walk configured roots **recursively** (depth-first, entries sorted alphabetically)
2. Match manifest filenames exactly (`component.yaml`, `module.yaml`, …)
3. Record `{ absolutePath, relativePath, fileName, kindHint }`
4. Skip ignored directories (`node_modules`, `.next`, `dist`, `storybook-static`, `.git`, `coverage`)
5. Load file content; parse YAML via **Manifest Engine** (`parseCapabilityManifestYaml`)
6. Produce `Capability` definitions at lifecycle state `discovered`
7. Return `DiscoveryResult { capabilities, diagnostics, manifests, scannedRoots }` in deterministic path order

**Discovery Engine does not:** validate dependencies, register capabilities, or perform health checks.

### 5.3 Embedded capability extraction

Module manifests (025) embed navigation, commands, search providers, widgets, dashboards, reports. The normaliser **projects** these into secondary indices without duplicating manifest files:

| Source                            | Registry index                  |
| --------------------------------- | ------------------------------- |
| `module.yaml → commands[]`        | `Registry.getCommands()`        |
| `module.yaml → searchProviders[]` | `Registry.getSearchProviders()` |
| `module.yaml → widgets[]`         | `Registry.getWidgets()`         |
| `module.yaml → dashboards[]`      | `Registry.getDashboards()`      |
| `module.yaml → reports[]`         | `Registry.getReports()`         |

Each projected entry carries `sourceModuleId` for traceability.

---

## 6. Registration process

> **Phase 4 delivered:** Imperative registration via `CapabilityRegistry.register()` in `packages/platform-runtime/src/capability-registry/`. See [capability-registry.md](./capability-registry.md).

### 6.1 Registration pipeline

```text
Manifest file
    → parse (YAML)
    → validate (Zod schema for kind)
    → enrich (defaults, computed fields)
    → resolve dependencies
    → assign lifecycle state
    → insert into RegistryStore
    → persist cache (optional)
```

### 6.2 Registration rules

| Rule                     | Enforcement                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------ |
| Unique ID per kind       | Reject duplicate `id` within same kind                                               |
| Stable IDs               | IDs are kebab-case; never renamed without migration                                  |
| Kind integrity           | `component.yaml` must not register as module                                         |
| Platform-only in SPR-002 | Reject manifests with `category: business` unless explicitly allowlisted for testing |
| Self-registration        | Platform Registry registers itself via `services/platform-registry/service.yaml`     |

### 6.3 Imperative registration (internal)

SDK may expose internal `registry.register(capability)` for programmatic platform entries (built-in themes). Imperative registration must still produce a manifest-equivalent object passing validation.

---

## 7. Validation process

### 7.1 Validation layers

| Layer             | Checks                                                 |
| ----------------- | ------------------------------------------------------ |
| **Syntax**        | Valid YAML                                             |
| **Schema**        | Required fields per kind; type correctness             |
| **Semantic**      | ID format; version semver; permission ID format        |
| **Compatibility** | `platformVersion` range vs runtime                     |
| **Dependency**    | Referenced capabilities exist or are platform builtins |
| **Policy**        | No business modules in SPR-002 (configurable guard)    |

### 7.2 Error handling

| Mode        | Behaviour                                              |
| ----------- | ------------------------------------------------------ |
| Production  | Fail-fast: registry state `failed`; app does not start |
| Development | Configurable: warn and skip invalid entry vs fail-fast |
| CI          | Always fail-fast                                       |

Errors include: `manifestPath`, `kind`, `field`, `message`, `severity`.

### 7.3 Schema versioning

Each manifest includes:

```yaml
manifestSchemaVersion: "1.0"
```

Registry validates against the schema version it supports. Unsupported versions produce a clear upgrade message.

---

## 8. Dependency resolution

### 8.1 Dependency types

| Type                  | Example                                      | Resolution                         |
| --------------------- | -------------------------------------------- | ---------------------------------- |
| Platform requires     | `compatibility.requires: [identity, search]` | Match against platform builtin IDs |
| Service → integration | `integrations: [plane]`                      | Match integration index            |
| Module → service      | `dependencies.services: [project-service]`   | Match service index                |
| Event subscribers     | `subscribers: [audit]`                       | Match service/platform IDs         |

### 8.2 Resolution algorithm

1. Build directed graph of all `requires` / `dependencies` edges
2. Detect cycles → fail with cycle path in error
3. Topological sort for bootstrap order
4. Report missing nodes → fail (strict) or warn (dev)

### 8.3 Platform builtins

Reserved IDs always satisfied without manifests:

- `identity`, `permissions`, `workspace`, `theme`, `registry`, `health`, `config`

---

## 9. Health monitoring

### 9.1 Registry health

| Signal            | Source                            |
| ----------------- | --------------------------------- |
| Registry state    | `ready` / `degraded` / `failed`   |
| Capability counts | Per-kind totals                   |
| Validation errors | Count of skipped/failed manifests |
| Last bootstrap    | Timestamp                         |
| Cache status      | Hit/miss if persistence enabled   |

### 9.2 Capability health (metadata)

Manifests declare health intent:

```yaml
health:
  enabled: true
  endpoint: /api/services/project-service/health # future
```

SPR-002 stores metadata only — **no live HTTP probes**. Live probing deferred to observability sprint (014).

### 9.3 Integration with platform health

`/api/health` gains:

```json
{
  "registry": {
    "status": "ready",
    "capabilities": { "components": 8, "modules": 0, "services": 1 },
    "lastBootstrap": "2026-06-29T12:00:00Z"
  }
}
```

---

## 10. Version compatibility

### 10.1 Platform version

Runtime reads `PLATFORM_VERSION` from environment (already in `@apzhub/config`).

### 10.2 Manifest constraint

```yaml
compatibility:
  platformVersion: ">=0.2.0"
```

### 10.3 Evaluation

- Use semver range matching (e.g. `semver` npm package)
- Incompatible manifests: reject in production; warn in dev
- Missing `compatibility` block: assume compatible with current major only (log warning)

### 10.4 Capability version

Each capability carries its own `version` field (semver). Registry tracks version for diagnostics; **multiple versions of same ID are rejected** in SPR-002.

---

## 11. Future extensibility

### 11.1 New capability kinds

Add new kind by:

1. Proposing schema in manifest specification (recommendation doc)
2. Adding Zod schema + discovery filename
3. Adding `Registry.getNewKind()` facade
4. Filing ADR if kind affects platform architecture

Reserved for future: `ai-provider`, `feature-flag`, `tenant-policy`.

### 11.2 Extract to Platform Service

Registry API is designed for later extraction to `services/platform-registry/`:

- Persistence already decoupled
- Public API stable
- Bootstrap moves from in-process to RPC/HTTP

### 11.3 Permission-aware queries

Future: `Registry.getModules({ forUser: session })` filters by Permission Service (007). SPR-002 returns full metadata; consumers filter later.

### 11.4 Event Bus integration

When Event Bus lands (029), registry bootstrap may publish `platform.registry.ready` event. Schema scaffold in Phase 7.

### 11.5 Multi-tenant

Tenant-scoped capability overlays deferred. Registry tables include nullable `tenant_id` column in persistence design for forward compatibility.

---

## 12. Security considerations

| Topic              | SPR-002 stance                                                                 |
| ------------------ | ------------------------------------------------------------------------------ |
| Manifest tampering | Trust filesystem in monorepo; production deploy from signed artefacts (future) |
| Diagnostic API     | Authenticate in production before SPR-002 close — **open question**            |
| YAML bombs         | Limit file size; timeout parse                                                 |
| Path traversal     | Resolve paths within repo root only                                            |

---

## 13. Testing strategy

| Level       | Focus                                 |
| ----------- | ------------------------------------- |
| Unit        | Schemas, dependency graph, lifecycle  |
| Integration | Full bootstrap from fixture directory |
| E2E         | Health + registry endpoint            |
| Regression  | SPR-001 suite unchanged               |

Fixture manifests: `testing/fixtures/registry/`.

---

_Design document — implementation in SPR-002 after approval._
