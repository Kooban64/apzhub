# APZHUB Release 1.1 — Classification Register

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-19  
> **Rule:** Every remaining evidenced item classified into Owner-mandated categories

| Item (evidence)                                  | Classification                                                                                              | Suggested lane                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Law placeholder UX                               | Deferred Release 1.0 Item · Customer Feature · Technical Debt                                               | 1.1                             |
| OBS-LAW-01 permission wiring                     | Deferred Release 1.0 Item · Security Improvement · **Delivered** APZHUB-1.1-001                             | 1.1                             |
| OBS-LAW-02 activity/notification persistence     | Deferred Release 1.0 Item · Operational Improvement · **Delivered** APZHUB-1.1-002                          | 1.1                             |
| Auth tenant claim residual                       | Deferred Release 1.0 Item · Compliance · Security                                                           | 1.1                             |
| FIN-001 Financial Engine extraction              | Deferred Release 1.0 Item · Future Platform Capability                                                      | 2.0 / Innovation                |
| No Law Email SoR                                 | Deferred Release 1.0 Item · Future Platform Capability                                                      | 2.0                             |
| Court e-filing / external DMS                    | Future Platform Capability · Customer Feature                                                               | 2.0 / Innovation                |
| Cross-product automation depth gap               | Future Platform Capability · **Foundation delivered** APZHUB-1.1-004 (product AU-* remain)                  | 1.1                             |
| Support no Event Bus publish                     | Deferred Release 1.0 Item · Customer Feature · **Delivered** APZHUB-1.1-003                                 | 1.1                             |
| Support no notifications/realtime                | Deferred Release 1.0 Item · Customer Feature · **In-app ENF delivered** APZHUB-1.1-003 (realtime still out) | 1.1                             |
| Support no attachments                           | Deferred Release 1.0 Item · Customer Feature                                                                | 1.1 / 1.2                       |
| Support no webhook ingress                       | Deferred Release 1.0 Item · Customer Feature                                                                | 1.1 / 1.2                       |
| Support durable idempotency                      | Technical Debt                                                                                              | 1.1 / 1.2                       |
| Support **2.0** planning                         | Future Commercial Product (Major)                                                                           | 2.0                             |
| Time Phase-1 exclusions (approvals/reporting/…)  | Deferred Release 1.0 Item · Customer Feature                                                                | 1.1 (slice)                     |
| Missing search-time adapter                      | Future Platform Capability · Technical Debt                                                                 | 1.1 / 1.2                       |
| Projects status catalogue / My Work gaps         | Customer Feature · Technical Debt                                                                           | 1.1                             |
| Documents metadata-first / no binary DMS         | Deferred Release 1.0 Item                                                                                   | Maintain; unlock = Owner        |
| No Paperless adapter                             | Future Platform Capability                                                                                  | Innovation                      |
| TCMS GHA read-only limits                        | Deferred Release 1.0 Item                                                                                   | Maintain freeze                 |
| TCMS GitLab absent                               | Future Platform Capability                                                                                  | 1.2                             |
| TCMS AI Assist                                   | Future Platform Capability                                                                                  | Innovation (never auto-certify) |
| Workflow execute limited (CERTIFIED_FOUNDATION)  | Deferred Release 1.0 Item · Future Platform Capability                                                      | 1.1 gated                       |
| Workflow no designer-first UX                    | Customer Feature · Future Platform Capability                                                               | 1.2 / 2.0                       |
| Analytics in-memory registry                     | Technical Debt · Operational Improvement                                                                    | 1.1                             |
| Analytics no live embed / AI                     | Deferred Release 1.0 Item · Future Platform Capability                                                      | 1.2 / Innovation                |
| QA stubs / PlaceholderVault / OAuth placeholders | Technical Debt · Security Improvement · Developer Experience                                                | 1.1 selective                   |
| Doc/disk lag                                     | Developer Experience · Technical Debt                                                                       | 1.1 docs                        |
| Root version vs platform SemVer                  | Technical Debt · Developer Experience                                                                       | 1.1 communicate                 |
| Programme ID dual-use confusion                  | Developer Experience · Operational Improvement                                                              | 1.1 docs                        |
| Secret leakage risk                              | Security Improvement                                                                                        | Ongoing 1.1                     |
| Host coexistence disruption risk                 | Operational Improvement                                                                                     | Ongoing                         |
| Performance (search/outbox/analytics)            | Performance Improvement                                                                                     | 1.1 maybe / measured            |
| New commercial verticals                         | Future Commercial Product                                                                                   | Innovation                      |
| Production defects (unspecified open)            | Production Defect                                                                                           | Patch **1.0.x** if evidenced    |

**Note:** No open Production Defect requiring Platform 1.0 reopen was identified in repository evidence for this planning programme. Urgent defects use Patch line under Owner Approval.
