# APZREPORT-003 — Coverage Baseline

**Date:** 2026-07-13  
**Verdict:** **PASS** (scoped reporting vertical ≥95% lines)  
**Certification:** APZREPORT-003

---

## Scope

Consolidated coverage for:

- `@apzhub/reporting-contracts`
- `@apzhub/reporting-core` (including output providers)
- Platform gateway reporting impl
- HTTP handler `handlers/reporting.ts`
- Typed client (`apps/web/lib/reporting`)
- Workbench (`apps/web/components/reporting`)

Excluded: mocks, `*.test.*`, type-only barrels/`reporting-types.ts`, `index.ts` re-exports.

## Results (v8)

| Layer | Lines | Branches | Functions |
| ----- | ----- | -------- | --------- |
| **All scoped files** | **98.16%** | **92.6%** | **96.68%** |
| Workbench | 98.82% | 92.94% | 90% |
| HTTP handler | 100% | 92.85% | 100% |
| Typed client | 97.97% | 96.85% | 100% |
| Gateway impl | 100% | 100% | 100% |
| reporting-core | ~96.8% | ~82.7% | ~96.3% |
| Output providers | 97.54% | 95% | 100% |
| Contracts domain + permissions | 100% | 100% | 100% |

Type-only contracts modules (`common/context.ts`, service interface file) contribute 0% executable lines and are excluded from gate interpretation.

## Test inventory

| Suite | Tests |
| ----- | ----- |
| Focused vertical Vitest | **50** passed (14 files, includes certification harness) |
| Certification harness | `testing/reporting-vertical/apzreport-003-certification.test.ts` |
| Playwright (mock) | `apzreport-002-platform-reporting-workbench.spec.ts` |

## Gate

Lines ≥95% and functions ≥95% on scoped implementation modules — **PASS**.
