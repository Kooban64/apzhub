# @apzhub/platform-runtime

The APZHUB **Platform Runtime** — runtime engine for starting, validating, and coordinating the platform.

> **Status:** Phase 9 complete — Sprint 002 closed  
> **Authority:** [ADR-0018](../../docs/adr/ADR-0018-platform-runtime-package.md) (supersedes ADR-0008)

## Purpose

The Platform Runtime executes the platform lifecycle. It is **not** a generic shared library.

Every application and platform package may depend on the Runtime. The Runtime must not depend on business modules, integrations, or UI presentation code.

## Runtime subsystems

| Subsystem                 | Phase | Status                                                   |
| ------------------------- | ----- | -------------------------------------------------------- |
| **Manifest Engine**       | 1     | ✅ Schemas, validation, YAML parsing                     |
| **Version Manager**       | 1     | ✅ Semver and platform version checks                    |
| **Capability model**      | 2     | ✅ Primary runtime abstraction                           |
| **Dependency Graph**      | 2     | ✅ Validation, cycles, topological order                 |
| **Discovery Engine**      | 3     | ✅ Filesystem scan, YAML load, `discovered` capabilities |
| **Capability Registry**   | 4     | ✅ Register, lookup, snapshot (`registered` state)       |
| **Lifecycle Manager**     | 5     | ✅ Transition validation, history, failure states        |
| **Runtime Orchestrator**  | 6     | ✅ `Runtime.bootstrap()` startup coordination            |
| **Configuration Manager** | 7     | ✅ Authoritative runtime configuration                   |
| **Health Manager**        | 8     | ✅ Provider-based health aggregation                     |
| **Runtime Integration**   | 9     | ✅ Integrated bootstrap + PlatformRegistry facade        |

> **Terminology:** The runtime subsystem responsible for capability discovery and indexing is the **Capability Registry**. External user interfaces may continue to use "Module Registry" where appropriate.

## Capability lifecycle

```text
DISCOVERED → VALIDATED → DEPENDENCIES_RESOLVED → REGISTERED → INITIALISED → HEALTHY → ACTIVE
```

Phase 2 implements `VALIDATED` → `DEPENDENCIES_RESOLVED`. Phase 3 produces capabilities at `discovered`. Phase 4 registers capabilities at `registered` after dependency resolution. Phase 5 validates lifecycle transitions via the Lifecycle Manager. Phase 8 evaluates health via the Health Manager after initialisation. Phase 9 integrates the full runtime flow and transitions capabilities to `active` at platform ready.

## Internal layout

```text
src/
├── capability/             Runtime Capability abstraction
├── runtime-orchestrator/   Runtime Orchestrator (startup coordination)
├── bootstrap-engine/       Deprecated alias → runtime-orchestrator
├── manifest-engine/        Envelope schemas, validation, YAML parsing
├── discovery-engine/       Filesystem manifest discovery
├── capability-registry/    Capability Registry (runtime index)
├── dependency-graph/       Resolution and cycle detection
├── lifecycle-manager/      Startup state machine
├── health-manager/         Provider-based health aggregation
├── configuration-manager/  Runtime Configuration Manager (authoritative)
├── configuration-engine/   Deprecated wrapper → configuration-manager
└── version-manager/        Platform version compatibility
```

## Public API

```typescript
import {
  validateCapabilityManifest,
  parseCapabilityManifestYaml,
} from "@apzhub/platform-runtime/manifest-engine";

import {
  isValidSemver,
  satisfiesPlatformVersion,
} from "@apzhub/platform-runtime/version-manager";

import {
  buildCapabilityFromManifest,
  type Capability,
} from "@apzhub/platform-runtime/capability";

import {
  resolveCapabilityDependencies,
  getTopologicalOrder,
} from "@apzhub/platform-runtime/dependency-graph";

import {
  discoverCapabilities,
  type DiscoveryResult,
} from "@apzhub/platform-runtime/discovery-engine";

import {
  createCapabilityRegistry,
  type RegistrySnapshot,
} from "@apzhub/platform-runtime/capability-registry";

import {
  createCapabilityLifecycleManager,
  type LifecycleSnapshot,
} from "@apzhub/platform-runtime/lifecycle-manager";

import { Runtime } from "@apzhub/platform-runtime/server";

import {
  Configuration,
  type RuntimeConfiguration,
} from "@apzhub/platform-runtime/configuration-manager";

import { Health } from "@apzhub/platform-runtime/health-manager";
```

`Runtime.bootstrap()` coordinates the full startup pipeline and exposes integrated diagnostics, registry, health, and configuration APIs.

### Configuration Manager (Phase 7)

```typescript
Configuration.load({ overrides: { workspaceRoot: process.cwd() } });
Configuration.validate();
const config = Configuration.get();
const diagnostics = Configuration.getDiagnostics();
```

Precedence: **defaults → environment variables → runtime overrides**. Only `env-source.ts` reads `process.env` within platform-runtime.

See [configuration-manager.md](../../docs/architecture/configuration-manager.md).

### Health Manager (Phase 8)

```typescript
Health.check({
  configuration: context.configuration,
  registry: context.registry,
  lifecycle: context.lifecycle,
  capabilities: context.capabilities,
});
const status = Health.getStatus();
const diagnostics = Health.getDiagnostics();
```

Built-in providers: Runtime, Configuration, Capability Registry, Lifecycle Manager. Register custom providers via `Health.registerProvider()`.

See [health-manager.md](../../docs/architecture/health-manager.md).

### Runtime API (Phase 9)

```typescript
await Runtime.bootstrap();
Runtime.getStatus();
Runtime.getDiagnostics(); // integrated subsystem summaries
Runtime.registry().getComponents();
Runtime.health();
Runtime.configuration();
```

See [platform-runtime.md](../../docs/architecture/platform-runtime.md) and [platform-registry-api.md](../../docs/architecture/platform-registry-api.md).

## Implementation

Phased delivery per [SPR-002 implementation plan](../../docs/sprint/SPR-002-implementation-plan.md).
