# APZOBSERVE-001 Coverage Baseline

**Date:** 2026-07-17  
**Scope:** `@apzhub/observe-contracts`, `@apzhub/observe-core`, `@apzhub/observe-persistence` (implementation sources; `index.ts` / contracts domain stubs excluded per Vitest config)

## Combined (observe packages)

| Metric | Value |
| --- | ---: |
| Lines | **99.89%** |
| Functions | **100%** |
| Branches | **75.00%** |

## Per file (selected)

| File | Lines | Functions | Branches |
| --- | ---: | ---: | ---: |
| observe-contracts identifiers / enums / permissions | 100 | 100 | 100 |
| observe-core (all modules) | 100 | 100 | ≥90 |
| observe-persistence factories | 95.74 | 100 | 92.85 |
| observe-persistence in-memory | 100 | 100 | 92.3 |
| observe-persistence postgres | 100 | 100 | 61.11 |

## Notes

- Global Vitest thresholds are not used for this scoped measurement (full-repo coverage include would fail when only observe tests run).
- Postgres branch % is lower because optional-column null/defined paths are combinatorial; line/function coverage on mappers is complete via mocked Drizzle executor tests.
- Target met: ≥95% lines and functions; meaningful branch coverage across domain + persistence factories.
