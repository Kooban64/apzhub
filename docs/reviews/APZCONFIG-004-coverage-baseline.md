# APZCONFIG-004 — Coverage Baseline

**Milestone:** APZCONFIG-004 — Configuration Workbench  
**Date:** 2026-07-16

## Scope

- `apps/web/components/configuration/**`
- Workspace routes / query-key helpers used by Workbench

## Result (as measured at APZCONFIG-004 closeout)

| Surface | Statements / Lines | Functions | Branches |
| --- | --- | --- | --- |
| Workbench modules | ~88% | ~79% | ~81% |
| Workspace router | 100% | 100% | 100% |

## Notes

- Remaining uncovered paths are secondary empty/error UI branches
- APZCONFIG-005 may improve coverage with certification-only tests (no new product functionality)
- Typed-client boundary and capability banners are covered
