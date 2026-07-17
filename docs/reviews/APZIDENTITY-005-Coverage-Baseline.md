# APZIDENTITY-005 — Coverage Baseline

**Date:** 2026-07-17  
**Scope:** Identity vertical (contracts, core, persistence, platform-services/identity, HTTP handlers/schemas, typed client, Workbench, certification harness)

## Result (measured via `pnpm certify:identity-vertical`)

| Metric | Target | Result |
| --- | --- | --- |
| Lines | ≥95% | **99.00%** |
| Functions | ≥95% | **99.19%** |
| Branches | Meaningful | **81.35%** |

## Assessment

| Target (APZIDENTITY-005 brief) | Result |
| --- | --- |
| 95%+ lines | **Met** |
| 95%+ functions | **Met** |
| Meaningful branch coverage | **Met** — authz denial, lifecycle, disabled service, persistence bootstrap, tenant isolation, and Workbench CRUD paths covered; residual optional UI ternaries accepted (L-08) |

## Prior Workbench-only baseline (APZIDENTITY-004)

| Metric | Value |
| --- | --- |
| Lines | 98.5% |
| Functions | 98.5% |
| Branches | 76.8% |

## Notes

- Measured include set matches the certify command scoped coverage arguments
- Global Vitest branch threshold may still warn on optional UI ternaries when run outside certify
- No coverage inflation via trivial tests
