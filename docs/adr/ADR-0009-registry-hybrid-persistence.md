# ADR-0009 — Registry Hybrid Persistence

> **Status:** Accepted  
> **Date:** 2026-06-30  
> **Sprint:** SPR-002  
> **Decided by:** Project owner (Sprint 002 implementation approval)

## Problem

The Platform Registry must start quickly, support lifecycle state, and rebuild reliably. Pure filesystem, pure memory, and database-authoritative models each fail at least one requirement.

## Decision

Adopt the **Hybrid Model**:

| Layer                  | Role                                    | Authority                                     |
| ---------------------- | --------------------------------------- | --------------------------------------------- |
| **Manifest files**     | Capability definitions                  | **Source of truth**                           |
| **PostgreSQL**         | Parsed manifest cache + lifecycle state | Optimisation only                             |
| **In-memory registry** | Active runtime index                    | Rebuilt from manifests (and cache when valid) |

The platform **must always be able to rebuild itself entirely from manifests**. The database is never the authoritative source of capability definitions.

### Invalidation

- Re-parse when manifest content hash or file mtime changes
- Lifecycle state (`enabled`, `disabled`) stored in PostgreSQL; definition changes come from manifests

### Environment

```bash
REGISTRY_PERSISTENCE=true   # default in production
```

When persistence is disabled (e.g. isolated unit tests), registry operates memory-only from manifests.

## Alternatives

| Alternative            | Why rejected                                          |
| ---------------------- | ----------------------------------------------------- |
| Filesystem only        | No durable lifecycle; slow at scale                   |
| Database authoritative | Violates manifest-first constitution; GitOps friction |
| Memory only            | No lifecycle persistence; repeated parse cost         |

## Consequences

- Drizzle schema in `@apzhub/config` for registry tables (see `platform-registry-database.md`)
- Persistence adapter in `@apzhub/platform-runtime`
- CI uses PostgreSQL with persistence enabled
- Conflict resolution: manifest wins for **definition**; database wins for **runtime state**
