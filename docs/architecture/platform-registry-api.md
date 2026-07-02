# Platform Registry — Public API Specification

> **Status:** Design — Runtime integration **complete** (Phase 9)  
> **Package:** `@apzhub/platform-runtime/server` for Runtime API · `@apzhub/platform-runtime/runtime-orchestrator` internal  
> **Authority:** [Document 024](../024-apzhub-platform-sdk-development-framework.md) · [platform-registry.md](./platform-registry.md) · [runtime-orchestrator.md](./runtime-orchestrator.md)

---

## 1. Purpose

Define the **public, read-oriented Registry API** consumed by:

- Desktop Shell (future — navigation, activity bar)
- Command Palette (019)
- Unified Search (020)
- Theme engine (022)
- Platform administration (future)
- Diagnostic tools and CI

SPR-002 implements this API. Consumers **must not** read manifest files directly.

---

## 2. Access patterns

### 2.1 Platform Runtime (primary)

```typescript
import { Runtime } from "@apzhub/platform-runtime/server";

await Runtime.bootstrap();

const registry = Runtime.registry();
const components = registry.getComponents();
const health = Runtime.health();
const version = Runtime.version();
```

### 2.2 Client-side (restricted)

Client bundles **must not** import Runtime or Registry. Server components fetch filtered subsets in future sprints.

### 2.3 Bootstrap (once per process)

```typescript
import { Runtime } from "@apzhub/platform-runtime/server";

await Runtime.bootstrap({
  persistence: true,
  failFast: process.env.NODE_ENV !== "development",
});

// After bootstrap
Runtime.registry().getModules();
Runtime.health();
Runtime.discovery();
Runtime.version();

// Graceful shutdown (future)
await Runtime.shutdown();
```

### 2.4 Internal registry (Phase 4 — implemented)

Until Phase 7, subsystems may still be used directly for tests. After bootstrap, use `Runtime.registry()` for the registered capability index.

```typescript
import { createCapabilityRegistry } from "@apzhub/platform-runtime/capability-registry";

const registry = createCapabilityRegistry("0.2.0");
registry.register(dependenciesResolvedCapability);
registry.findById("button");
registry.snapshot();
```

The `Registry` interface below (§3) will be exposed via `Runtime.registry()` in Phase 5.

---

## 3. Core interface

```typescript
interface Registry {
  /** Registry meta-state */
  getState(): RegistryState;
  getHealth(): RegistryHealth;

  /** Cross-kind lookup */
  getCapability(id: string, kind?: CapabilityKind): CapabilityEntry | undefined;
  getDependencyGraph(): DependencyGraph;

  /** Kind-specific facades */
  getModules(filter?: CapabilityFilter): ModuleEntry[];
  getServices(filter?: CapabilityFilter): ServiceEntry[];
  getIntegrations(filter?: CapabilityFilter): IntegrationEntry[];
  getComponents(filter?: CapabilityFilter): ComponentEntry[];
  getThemes(filter?: CapabilityFilter): ThemeEntry[];
  getCommands(filter?: CapabilityFilter): CommandEntry[];
  getSearchProviders(filter?: CapabilityFilter): SearchProviderEntry[];
  getEvents(filter?: CapabilityFilter): EventEntry[];
  getWorkers(filter?: CapabilityFilter): WorkerEntry[];
  getDashboards(filter?: CapabilityFilter): DashboardEntry[];
  getWidgets(filter?: CapabilityFilter): WidgetEntry[];
  getReports(filter?: CapabilityFilter): ReportEntry[];
  getAiProviders(filter?: CapabilityFilter): AiProviderEntry[];
  getFeatureFlags(filter?: CapabilityFilter): FeatureFlagEntry[];

  /** Serialisable snapshot for diagnostics */
  toJSON(): RegistrySnapshot;
}
```

---

## 4. Method specifications

### 4.1 `Registry.getState()`

**Responsibility:** Return current registry lifecycle state.

**Returns:**

```typescript
type RegistryState = {
  status: "initialising" | "ready" | "degraded" | "failed";
  bootstrappedAt: string; // ISO-8601
  platformVersion: string;
  manifestSchemaVersion: string;
};
```

**Behaviour:**

- Throws if called before bootstrap completes (except `initialising` state during bootstrap)
- Thread-safe read in Node.js single-process model

---

### 4.2 `Registry.getHealth()`

**Responsibility:** Aggregated health for `/api/health` integration.

**Returns:**

```typescript
type RegistryHealth = {
  status: "healthy" | "degraded" | "unhealthy";
  capabilityCounts: Record<CapabilityKind, number>;
  validationErrors: number;
  lastBootstrap: string;
  persistence?: {
    enabled: boolean;
    cacheHit: boolean;
  };
};
```

**Behaviour:**

- `unhealthy` when state is `failed`
- `degraded` when optional capabilities skipped in dev warn mode

---

### 4.3 `Registry.getModules(filter?)`

**Responsibility:** Return registered module capabilities.

**Returns:** `ModuleEntry[]` — sorted by `metadata.order` or `name`.

**Filter:**

```typescript
type CapabilityFilter = {
  status?: "enabled" | "disabled" | "deprecated" | "all";
  category?: string;
  platformVersion?: string; // filter incompatible
  tags?: string[];
  // future: permissions, tenantId
};
```

**SPR-002 behaviour:** Returns **empty array** (no business modules).

**Future behaviour:** Returns modules where `lifecycle.status === enabled` and user has view permission.

---

### 4.4 `Registry.getServices(filter?)`

**Responsibility:** Return Platform Service entries.

**Returns:** `ServiceEntry[]` with `id`, `name`, `version`, `dependencies`, `integrations`, `events`, `health`.

**SPR-002 behaviour:** Returns platform scaffold services only (e.g. `platform-registry`).

**Expected consumers:** Service mesh diagnostics, administration workspace (future).

---

### 4.5 `Registry.getIntegrations(filter?)`

**Responsibility:** Return integration adapter entries.

**Returns:** `IntegrationEntry[]` with `type`, `capabilities`, `health`.

**SPR-002 behaviour:** Empty or scaffold-only; no OSS engines.

**Rule:** Integration names never exposed to UI (002).

---

### 4.6 `Registry.getComponents(filter?)`

**Responsibility:** Return UI component catalogue entries.

**Returns:** `ComponentEntry[]` with Storybook/test metadata.

**SPR-002 behaviour:** Returns all SPR-001 primitives/composites (Button, Input, Card, Header, Sidebar, StatusBar, ShellLayout, ActivityBar).

**Expected consumers:** Component Registry UI (future), Storybook index, lint rules.

---

### 4.7 `Registry.getThemes(filter?)`

**Responsibility:** Return registered themes per Document 022 Theme Registry.

**Returns:** `ThemeEntry[]` with `mode` (light/dark/system), `tokenSet`, `extends`.

**SPR-002 behaviour:** Returns built-in `apzhub-light`, `apzhub-dark`.

**Future:** Brand/white-label themes register here.

---

### 4.8 `Registry.getCommands(filter?)`

**Responsibility:** Return normalised command palette actions (019).

**Returns:** `CommandEntry[]` with `label`, `category`, `shortcut`, `permission`, `sourceModuleId?`.

**SPR-002 behaviour:** Empty array (no module commands) unless platform scaffold commands added.

**Future:** Merged from all enabled modules; filtered by permission.

---

### 4.9 `Registry.getSearchProviders(filter?)`

**Responsibility:** Return search provider registrations (020).

**Returns:** `SearchProviderEntry[]` with `providerId`, `scope`, `priority`, `sourceModuleId?`.

**SPR-002 behaviour:** Empty array.

---

### 4.10 `Registry.getEvents(filter?)`

**Responsibility:** Return event **definitions** indexed for Event Bus (029) — not live subscriptions.

**Returns:** `EventEntry[]` with `publisher`, `subscribers`, `payloadSchema`, `category`.

**SPR-002 behaviour:** Platform scaffold events only (e.g. `platform.registry.ready`).

**Note:** Distinct from Event Bus publish/subscribe API (future package).

---

### 4.11 `Registry.getWorkers(filter?)`

**Responsibility:** Return background worker definitions (012).

**Returns:** `WorkerEntry[]` with `schedule`, `subscribes`, `health`.

**SPR-002 behaviour:** Empty array.

---

### 4.12 `Registry.getDashboards(filter?)`

**Responsibility:** Return dashboard definitions projected from modules.

**Returns:** `DashboardEntry[]` with layout metadata, `sourceModuleId`.

**SPR-002 behaviour:** Empty array.

---

### 4.13 `Registry.getWidgets(filter?)`

**Responsibility:** Return widget definitions for workspace dashboards.

**Returns:** `WidgetEntry[]` with size constraints, `sourceModuleId`.

**SPR-002 behaviour:** Empty array.

---

### 4.14 `Registry.getReports(filter?)`

**Responsibility:** Return report definitions (export templates, scheduled reports).

**Returns:** `ReportEntry[]` with format, schedule, `sourceModuleId`.

**SPR-002 behaviour:** Empty array.

---

### 4.15 `Registry.getAiProviders(filter?)`

**Responsibility:** Return AI provider registrations (future).

**Returns:** `AiProviderEntry[]`.

**SPR-002 behaviour:** Empty array or disabled placeholders.

---

### 4.16 `Registry.getFeatureFlags(filter?)`

**Responsibility:** Return feature flag definitions (future).

**Returns:** `FeatureFlagEntry[]` with `default`, `description`.

**SPR-002 behaviour:** Empty array or internal dev flags only.

---

### 4.17 `Registry.getCapability(id, kind?)`

**Responsibility:** O(1) lookup by stable ID.

**Parameters:**

- `id` — capability ID (e.g. `button`, `project-service`)
- `kind` — optional disambiguator if ID collision across kinds (should not occur)

**Returns:** Single entry or `undefined`.

**Throws:** Never — missing entries return `undefined`.

---

### 4.18 `Registry.getDependencyGraph()`

**Responsibility:** Export dependency graph for diagnostics and admin visualisation.

**Returns:**

```typescript
type DependencyGraph = {
  nodes: { id: string; kind: CapabilityKind; version: string }[];
  edges: { from: string; to: string; type: "requires" | "integrates" | "subscribes" }[];
  ordered: string[]; // topological bootstrap order
};
```

---

### 4.19 `Registry.toJSON()`

**Responsibility:** Full serialisable snapshot for `GET /api/platform/registry`.

**Behaviour:**

- Redacts secrets (none in manifests)
- Includes validation error summary
- Stable key ordering for diff-friendly output

---

## 5. Entry type shapes (summary)

All entries extend:

```typescript
interface CapabilityEntry {
  id: string;
  name: string;
  version: string;
  kind: CapabilityKind;
  status: "enabled" | "disabled" | "deprecated";
  sourcePath: string;
  metadata: Record<string, unknown>;
  compatibility?: { platformVersion?: string; requires?: string[] };
}
```

Kind-specific fields live in `payload` (see [platform-manifest-specification.md](./platform-manifest-specification.md)).

---

## 6. HTTP API (SPR-002)

**No public REST registry API in Sprint 002** ([ADR-0010](../adr/ADR-0010-registry-internal-typescript-api.md)).

Registry data is available only via the internal TypeScript API. A minimal summary may appear on `GET /api/health`:

```json
{
  "registry": {
    "status": "ready",
    "capabilities": { "components": 8, "modules": 0, "services": 1 }
  }
}
```

Full REST/GraphQL registry endpoints deferred to the **administration sprint**.

## 7. Error model

Registry bootstrap errors:

```typescript
type RegistryBootstrapError = {
  code:
    | "MANIFEST_PARSE_ERROR"
    | "MANIFEST_VALIDATION_ERROR"
    | "DEPENDENCY_CYCLE"
    | "DEPENDENCY_MISSING"
    | "VERSION_INCOMPATIBLE"
    | "DUPLICATE_ID"
    | "POLICY_VIOLATION";
  manifestPath?: string;
  field?: string;
  message: string;
};
```

---

## 8. Non-goals (SPR-002 API)

| Method                                   | Status                            |
| ---------------------------------------- | --------------------------------- |
| `registerModule()` imperative public API | Internal only                     |
| `enableModule()` / `disableModule()`     | Deferred to administration sprint |
| `subscribeToChanges()`                   | Deferred                          |
| Permission-filtered queries              | Deferred to IAM sprint            |

---

## 9. Versioning

| Version          | Scope                                      |
| ---------------- | ------------------------------------------ |
| API `1.0`        | SPR-002 initial surface                    |
| Breaking changes | Require ADR + semver bump of `@apzhub/sdk` |

---

_API specification — implementation follows owner approval of SPR-002._
