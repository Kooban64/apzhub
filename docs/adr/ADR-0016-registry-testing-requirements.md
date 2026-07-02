# ADR-0016 — Registry Testing Requirements

> **Status:** Accepted  
> **Date:** 2026-06-30  
> **Sprint:** SPR-002  
> **Decided by:** Project owner (Sprint 002 implementation approval)

## Problem

Registry bugs surface at platform startup and affect every downstream capability. Insufficient testing risks silent metadata corruption or production boot failures.

## Decision

Registry implementation **requires** the following test categories:

| Category                        | Scope                                                         |
| ------------------------------- | ------------------------------------------------------------- |
| **Unit tests**                  | Schemas, normaliser, store, lifecycle helpers                 |
| **Integration tests**           | Full bootstrap from fixture manifest directories              |
| **Manifest validation tests**   | Every kind schema; valid + invalid fixtures                   |
| **Dependency resolution tests** | Ordering, missing deps, version checks                        |
| **Cycle detection tests**       | Circular dependency graphs                                    |
| **Performance tests**           | Bootstrap time budget with N manifests (baseline in SPR-002)  |
| **Playwright**                  | Where applicable — health registry summary only (no REST API) |

### Coverage target

**100% manifest validation coverage** — every Zod schema branch exercised by at least one test fixture.

Package coverage threshold: **≥ 80%** lines (constitution 015); validation modules target **100%**.

### Fixture location

```text
testing/fixtures/registry/
```

## Alternatives

| Alternative            | Why rejected                                     |
| ---------------------- | ------------------------------------------------ |
| 80% only on validation | Owner requires 100% on manifest validation paths |
| No performance tests   | Startup risk at scale                            |

## Consequences

- CI runs `@apzhub/platform-runtime` test suite with coverage
- Corrupt manifest fixtures required per kind
- Performance test: bootstrap 50 fixture manifests < 2s (initial budget)
