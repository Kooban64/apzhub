# Quality Summary — APZHUB-QA-RECERT-002

> **Baseline:** Platform **1.2.0**  
> **Input:** APZHUB-QA-CERT-001 (ACCEPTED · CERTIFICATION FAILED)  
> **Mode:** Analysis only

## Totals

| Metric                                     |                                                          Count |
| ------------------------------------------ | -------------------------------------------------------------: |
| Total Remaining Hard Failures (Playwright) |                                                         **19** |
| Total Remaining Flaky Tests (Playwright)   |                                                         **30** |
| Total TypeScript Failures                  |                                                          **1** |
| Total Lint Failures                        |                                                          **1** |
| Total Vitest Failures                      |                                                         **82** |
| Total Unit Failures                        |                                                         **28** |
| Total Integration Failures                 |                                                          **7** |
| Total Regression Failures                  |                                                         **47** |
| Total Root Causes (distinct themes)        |                                                         **10** |
| Total Remediation Groups                   |                                                         **10** |
| Estimated Engineering Programmes           |                                                          **6** |
| Estimated Certification Improvement        | Hard→0 · Flaky→0 · Lint→0 · TS→0 · Vitest→0 (if plan executed) |

## Recommended engineering order

1. RG-LAW-SUITE-SCOPE (+ RG-LAW-HOST-QUALITY as ENG-0016) — **ACCEPTED**
2. RG-CERT-PIN-DRIFT (ENG-0017) — **ACCEPTED**
3. RG-LAW-API-AUTHZ + RG-LAW-SEARCH-INT (ENG-0018) — **ACCEPTED**
4. RG-AUTH-SHELL-RESIDUAL (ENG-0019) — **ACCEPTED**
5. RG-SUPPORT-CERT + RG-VISUAL-INBOX + RG-OBSERVE-WB (ENG-0020) — **ACCEPTED**
6. RG-TESTING-ARCH (ENG-0021) — **ACCEPTED** · Wave 2 **COMPLETE** · final re-cert [QA-CERT-002](../final-certification/README.md)

## Classification coverage

Every residual CERT-001 failure is classified into one of: Product defect, Test defect, Test infrastructure, Authentication, Mocking, Timing/Race, Visual baseline, Build/TypeScript, Lint, Unit, Integration, Regression, Environment, Configuration, Dependency, Duplicate, Known Limitation, Other — and assigned to exactly one remediation group.

## Recommendation

**READY FOR OWNER REVIEW**
