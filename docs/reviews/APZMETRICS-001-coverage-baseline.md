# APZMETRICS-001 Coverage Baseline

**Date:** 2026-07-17  
**Scope:** `@apzhub/metrics-contracts`, `@apzhub/metrics-core`, `@apzhub/metrics-persistence` (implementation sources; contracts domain/common/services stubs and `index.ts`/`version.ts` excluded)

## Combined (metrics packages)

| Metric    |      Value |
| --------- | ---------: |
| Lines     | **95.43%** |
| Functions | **99.04%** |
| Branches  | **60.56%** |

## Notes

- Global Vitest thresholds are not used for this scoped measurement.
- Postgres mappers covered via mocked Drizzle executor tests for all 21 entities.
- Branch % residual from optional FK null/defined paths and enum guard combinations; lines/functions meet ≥95% target.
