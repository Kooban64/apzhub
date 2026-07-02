# ADR-0018 — Platform Runtime Package

> **Status:** Accepted  
> **Date:** 2026-06-30  
> **Sprint:** SPR-002 (pre-implementation architecture update)  
> **Supersedes:** [ADR-0008](./ADR-0008-platform-core-package.md)  
> **Decided by:** Project owner (architecture update before Sprint 002)

## Problem

The name `platform-core` implied a generic shared library. The approved component is the **runtime engine** of APZHUB — responsible for starting, validating, and coordinating the platform lifecycle. The Registry is a subsystem of the Runtime, not a peer package.

## Decision

Rename and establish:

| Item          | Value                             |
| ------------- | --------------------------------- |
| Package path  | `packages/platform-runtime/`      |
| npm name      | `@apzhub/platform-runtime`        |
| Server export | `@apzhub/platform-runtime/server` |

### Platform Runtime owns

- Platform bootstrap
- Registry (subsystem — not standalone)
- Manifest loading and validation
- Dependency resolution and cycle detection
- Version compatibility
- Runtime discovery
- Platform startup lifecycle ([ADR-0014](./ADR-0014-registry-bootstrap-lifecycle.md))
- Runtime diagnostics
- Capability registration
- Health aggregation
- Platform metadata
- Runtime configuration

### Platform Runtime does **not** own

- Business logic
- UI components
- Authentication
- Integrations
- Search implementation
- Notifications
- Background processing
- Business modules

### Internal package layout (logical)

```text
packages/platform-runtime/
  bootstrap/
  registry/
  discovery/
  manifests/
  dependency-graph/
  lifecycle/
  diagnostics/
  metadata/
  validation/
  versioning/
```

### Public Runtime API (TypeScript only — internal)

```typescript
Runtime.bootstrap();
Runtime.registry(); // → Registry with getModules(), getServices(), …
Runtime.health();
Runtime.discovery();
Runtime.version();
Runtime.shutdown();
```

No REST API in Sprint 002 ([ADR-0010](./ADR-0010-registry-internal-typescript-api.md)).

### Target logical package naming (repository evolution)

| Current (SPR-001)        | Target logical name      |
| ------------------------ | ------------------------ |
| `packages/sdk`           | `platform-sdk`           |
| `packages/ui`            | `platform-ui`            |
| `packages/theme`         | `platform-theme`         |
| `packages/workspace`     | `platform-workspace`     |
| `packages/auth`          | `platform-auth`          |
| `packages/config`        | `platform-config`        |
| `packages/types`         | `platform-types`         |
| `packages/search`        | `platform-search`        |
| `packages/notifications` | `platform-notifications` |
| `packages/events`        | `platform-events`        |
| `packages/shared`        | `shared`                 |

Physical renames deferred to dedicated migration sprints. New documentation uses **platform-runtime** naming immediately.

## Alternatives

| Alternative                 | Why rejected                  |
| --------------------------- | ----------------------------- |
| Keep `platform-core`        | Owner architecture update     |
| Separate `@apzhub/registry` | Registry is Runtime subsystem |

## Consequences

- All documentation references updated from `platform-core` to `platform-runtime`
- ADR-0008 marked **Superseded**
- ADR-0014 lifecycle extended to full platform startup sequence
- Sprint 002 Phase 1 targets `@apzhub/platform-runtime`
- Dependency direction: `apps/web` → `@apzhub/platform-runtime`; `@apzhub/sdk` → `@apzhub/platform-runtime`
