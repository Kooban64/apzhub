# ADR-0013 — Registry Fail-Fast Policy

> **Status:** Accepted  
> **Date:** 2026-06-30  
> **Sprint:** SPR-002  
> **Decided by:** Project owner (Sprint 002 implementation approval)

## Problem

Invalid manifests must not reach production. Strict fail-fast in local development can block iteration when experimenting with draft manifests.

## Decision

| Environment                              | Policy                                                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Development** (`NODE_ENV=development`) | **Warn and continue** — log validation errors; skip invalid entries; registry state may be `degraded` |
| **Production** (`NODE_ENV=production`)   | **Fail fast** — invalid manifest prevents platform start; registry state `failed`                     |
| **Test / CI** (`NODE_ENV=test`)          | **Fail fast** — same as production                                                                    |

### Behaviour

**Development:**

- Invalid manifest → structured warning + skip entry
- Missing dependency (non-platform) → warn
- Cycle detected → warn and exclude affected subgraph (or fail — implementer choice documented in tests)

**Production / CI:**

- Any invalid manifest → throw `RegistryBootstrapError`; process exits
- Dependency cycle → fail
- Missing required dependency → fail
- Incompatible `platformVersion` → fail

The platform **must never start with invalid manifests in production**.

## Alternatives

| Alternative          | Why rejected                   |
| -------------------- | ------------------------------ |
| Fail fast everywhere | Blocks local manifest drafting |
| Warn everywhere      | Unsafe for production          |

## Consequences

- `bootstrapRegistry({ failFast: env !== "development" })` default logic
- CI runs with `NODE_ENV=test` — strict validation
- Development logs include `manifestPath`, `field`, `message`
