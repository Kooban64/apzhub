# ADR-0008 — Platform Core Package

> **Status:** Superseded by [ADR-0018](./ADR-0018-platform-runtime-package.md)  
> **Date:** 2026-06-30  
> **Sprint:** SPR-002  
> **Decided by:** Project owner (Sprint 002 implementation approval)

> **Note:** This ADR is retained for history. The package was renamed to **`packages/platform-runtime`** (`@apzhub/platform-runtime`) per owner architecture update before Sprint 002 implementation.

## Problem

The Platform Registry is a core capability that every other package depends on. Placing it in `@apzhub/sdk` (stub) or a separate `@apzhub/registry` package would either understate its role or fragment platform fundamentals.

## Decision

~~Create **`packages/platform-core`** published as **`@apzhub/platform-core`**.~~

**Superseded:** Create **`packages/platform-runtime`** published as **`@apzhub/platform-runtime`** ([ADR-0018](./ADR-0018-platform-runtime-package.md)).

The Platform Registry and related infrastructure live in the Platform Runtime — not in `@apzhub/sdk` and not in a standalone registry package.

## Alternatives

| Alternative                | Why rejected                                      |
| -------------------------- | ------------------------------------------------- |
| Expand `@apzhub/sdk`       | SDK is a contract layer; registry is core runtime |
| `@apzhub/registry` package | Registry is Runtime subsystem                     |
| Registry inside `apps/web` | Not reusable; violates layered architecture       |

## Consequences

- Superseded by ADR-0018 — see Platform Runtime package for current consequences
