# APZHUB Release 1.1 — Technical Debt Register

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-19

| ID    | Debt                                                                                  | Classification                       | 1.1 candidate?                   | Evidence         |
| ----- | ------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------- | ---------------- |
| TD-01 | Law placeholder UX scaffolding                                                        | Technical Debt · Deferred 1.0        | **Yes**                          | QA M-05 · Law KL |
| TD-02 | QA intentional stubs (NOT_IMPLEMENTED gateways, PlaceholderVault, OAuth placeholders) | Technical Debt                       | **Selective**                    | PL-KL-13         |
| TD-03 | Analytics in-memory registry MVP                                                      | Technical Debt                       | **Yes**                          | Analytics KL     |
| TD-04 | Workflow dual historic workspace facets                                               | Technical Debt · DX                  | **Maybe**                        | Workflow KL      |
| TD-05 | Historical docs lag disk                                                              | Technical Debt · DX                  | **Yes** (docs)                   | PL-KL-12         |
| TD-06 | Root package version `0.1.0-foundation` vs platform SemVer                            | Technical Debt · DX                  | **Communicate** / careful change | PL-KL-11         |
| TD-07 | Programme ID dual-use (PORTFOLIO-001)                                                 | Technical Debt · Governance          | **Docs clarity**                 | R-08             |
| TD-08 | Time lacks `search-time` publication adapter                                          | Technical Debt · Platform Capability | **Maybe**                        | Time KL          |
| TD-09 | Law lacks `@apzhub/search-law` publication package                                    | Technical Debt · Platform Capability | **Maybe**                        | KL-LAW-11        |
| TD-10 | Support durable idempotency deferred                                                  | Technical Debt                       | **Maybe**                        | Support KL       |
| TD-11 | Documents Playwright historically LIMITED                                             | Technical Debt · Quality             | **Revalidate**                   | Documents KL     |
| TD-12 | Premature FIN-001 extraction pressure                                                 | Technical Debt risk                  | **Defer**                        | FIN-001 · R-05   |

No debt item authorises code without named Approval.
