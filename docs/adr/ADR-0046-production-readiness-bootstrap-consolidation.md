# ADR-0046: Production Readiness Architecture & Application Bootstrap Consolidation

## Status

Accepted — implemented PRH-001 (PCv2-01).

## Context

Platform Core v1.0 is certified (PC-001) with observations including duplicated application bootstrap between `apps/web` and `apps/law-platform` (TD-M16-C01). M8-06 delivered `@apzhub/platform-security` with consolidated operational diagnostics, but bootstrap orchestration and diagnostics loading remained duplicated in each application host.

PCv2-01 requires a permanent architectural baseline for production readiness without redesigning Platform Core capabilities or changing product business logic.

## Decision

1. Introduce `@apzhub/platform-bootstrap` as the **canonical application bootstrap package** for all APZHUB hosts (`web`, `law-platform`, future workers).
2. Split exports for dependency hygiene:
   - `@apzhub/platform-bootstrap/server` — lightweight runtime bootstrap (`ensurePlatformRuntimeReady`)
   - `@apzhub/platform-bootstrap/diagnostics` — consolidated operational diagnostics loader
   - `@apzhub/platform-bootstrap` — full surface
3. Application hosts retain thin `runtime-init.ts` wrappers that resolve `WORKSPACE_ROOT` and delegate to the shared package (backwards compatible).
4. Consolidated operational diagnostics move to the shared loader with **product extension points** (`lawPlatformDiagnostics`, `trustAccountingDiagnostics`).
5. Bootstrap metadata (`package`, `version`, `canonical`, `runtimeReady`) is embedded in runtime diagnostics for operator visibility.
6. **Defer** CSP enforcement, rate-limit expansion, session hardening changes, and Vault integration to subsequent PRH stories (PRH-002+). ADR-0046 establishes architecture only; security posture changes are not in scope for this ADR's implementation.

### Open decisions resolved (PRH-001)

| ID       | Decision                 | Resolution                                 |
| -------- | ------------------------ | ------------------------------------------ |
| Q-PRH-01 | Bootstrap package name   | `@apzhub/platform-bootstrap` (new package) |
| Q-PRH-02 | Per-app CSP policies     | Deferred to PRH-002                        |
| Q-PRH-03 | Rate limit defaults      | Deferred to PRH-005 (unchanged in PRH-001) |
| Q-PRH-04 | RLS test database        | Deferred to PRH-007                        |
| Q-PRH-05 | CSP report endpoint auth | Deferred to PRH-002                        |

## Architecture

```text
Application host (web | law-platform)
  └─ lib/runtime-init.ts          → WORKSPACE_ROOT + failFast
       └─ @apzhub/platform-bootstrap/server
            └─ Runtime.bootstrap()  (@apzhub/platform-runtime)

Application diagnostics
  └─ lib/operational-diagnostics.ts → product extensions
       └─ @apzhub/platform-bootstrap/diagnostics
            ├─ platform-runtime bootstrap
            ├─ platform-identity (in-memory; postgres lazy)
            ├─ platform-authorization
            ├─ platform-personalisation
            ├─ platform-governance
            └─ platform-security consolidated view
```

## Consequences

### Positive

- TD-M16-C01 closed — single canonical bootstrap implementation.
- Web and law-platform verified for bootstrap parity.
- Diagnostics consistency across hosts with shared bootstrap metadata.
- Worker processes (PCv2-02) can reuse `@apzhub/platform-bootstrap/server` without Next.js coupling.
- Lightweight server export avoids pulling diagnostics graph into instrumentation/hydration paths.

### Negative / deferred

- Framework hydration (commands, knowledge, events, activities) remains per-app — not consolidated in PRH-001.
- Postgres tenant diagnostics use dynamic import; full identity server barrel avoided in hot paths.
- CSP remains Report-Only until PRH-002.

## Compliance

- No Platform Core redesign — extends M8 packages only.
- No product business logic changes.
- Backwards compatible — existing `ensurePlatformRuntimeReady()` app API preserved.
- Self-hosted first — no new external dependencies.

## References

- [Platform Bootstrap Architecture](../architecture/APZHUB-Platform-Bootstrap-Architecture.md)
- [PCv2-01 Production Readiness Architecture](../architecture/PCv2-01-Production-Readiness-Architecture.md)
- [PRH-000 Implementation Baseline](../reviews/PRH-000-Implementation-Baseline.md)
- [PRH-001 Completion Report](../sprint/PRH-001-completion-report.md)
- ADR-0045 — Platform Security & Operational Resilience (M8-06)
