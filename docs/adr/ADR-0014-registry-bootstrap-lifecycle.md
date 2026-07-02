# ADR-0014 — Platform Startup Lifecycle

> **Status:** Accepted (amended 2026-06-30)  
> **Date:** 2026-06-30  
> **Sprint:** SPR-002  
> **Amended by:** [ADR-0018](./ADR-0018-platform-runtime-package.md) — full platform lifecycle  
> **Decided by:** Project owner

## Problem

Platform initialisation order affects dependency correctness, observability, and readiness signalling. Ad hoc bootstrap invites race conditions and skipped validation steps.

## Decision

The **platform startup lifecycle** is fixed and mandatory. Implemented by `@apzhub/platform-runtime` via `Runtime.bootstrap()`.

```text
Platform Start
        ↓
Load Runtime Configuration
        ↓
Discover Manifests
        ↓
Validate Manifests
        ↓
Validate Versions
        ↓
Resolve Dependencies
        ↓
Detect Cycles
        ↓
Register Capabilities
        ↓
Initialise Platform Services
        ↓
Verify Health
        ↓
Publish PlatformReady Event
        ↓
Desktop Shell Starts
```

### Registry phase (subset)

Steps from **Discover Manifests** through **Register Capabilities** constitute the Registry bootstrap pipeline documented in [platform-registry.md](../architecture/platform-registry.md).

### State machine

| State          | Meaning                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| `initialising` | Lifecycle in progress                                                               |
| `ready`        | All steps succeeded                                                                 |
| `degraded`     | Dev warn-mode skipped entries ([ADR-0013](./ADR-0013-registry-fail-fast-policy.md)) |
| `failed`       | Production/CI failure                                                               |

### PlatformReady event

After **Verify Health**, publish **PlatformReady** (event id: `platform.ready` / internal hook `platform.registry.ready`). Event Bus runtime deferred; hook must be callable and testable in SPR-002.

### Desktop Shell

Desktop Shell starts **after** PlatformReady. Shell remains unchanged in SPR-002.

## Alternatives

| Alternative                        | Why rejected                              |
| ---------------------------------- | ----------------------------------------- |
| Lazy registration on first query   | Misses fail-fast; hides dependency errors |
| Shell starts before registry ready | Violates registry-first architecture      |

## Consequences

- `Runtime.bootstrap()` in `@apzhub/platform-runtime/server` implements the sequence
- Unit tests assert step order via mock pipeline
- Documented in [platform-runtime.md](../architecture/platform-runtime.md)
