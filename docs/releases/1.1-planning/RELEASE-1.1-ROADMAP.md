# APZHUB Release 1.1 Roadmap

> **Programme:** APZHUB-RELEASE-001  
> **Target SemVer (naming):** Platform **1.1.0** (and aligned product Minors/Patches only under separate Approval)  
> **Baseline:** Platform **1.0.0** **ACCEPTED**  
> **Date:** 2026-07-19

---

## Goal

Raise Production maturity from PRWL baseline by delivering the highest-value deferred 1.0 items and integration depth — without redesigning frozen architecture or inventing new products.

---

## In scope themes (Release 1.1)

| Theme ID    | Theme                                                                           | Classification                                                                           | Primary evidence                          |
| ----------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------- |
| R11-LAW-01  | Law placeholder UX / polish debt reduction                                      | Deferred Release 1.0 Item · Customer Feature                                             | PL-KL-04 · Law KL · QA M-05               |
| R11-LAW-02  | OBS-LAW-01 PermissionService wiring                                             | **Delivered** — APZHUB-1.1-001 (**ACCEPTED**)                                            | OBS-LAW-01                                |
| R11-LAW-03  | OBS-LAW-02 persistent activity/notification stores                              | **Delivered** — APZHUB-1.1-002 (**ACCEPTED**)                                            | OBS-LAW-02                                |
| R11-XPR-01  | Cross-product event / automation depth (selected pairs)                         | **Foundation delivered** — APZHUB-1.1-004 (**ACCEPTED**); product AU-* follow-ons remain | PORTFOLIO-INTEGRATION-STRATEGY · PL-KL-02 |
| R11-SUP-01  | Support Event Bus publish / notification gaps                                   | **Delivered** — APZHUB-1.1-003 (**ACCEPTED**)                                            | Support KL                                |
| R11-SUP-02  | Support webhook ingress / attachments (if Owner selects)                        | Customer Feature                                                                         | Support KL                                |
| R11-TIM-01  | Time Phase 1 gap closure (approvals/reporting adjacency — Owner-selected slice) | Deferred Release 1.0 Item · Customer Feature                                             | Time KL                                   |
| R11-WF-01   | Workflow provider maturity toward execute unlock (gated)                        | Deferred Release 1.0 Item · Future Platform Capability                                   | Workflow KL · n8n CERTIFIED_FOUNDATION    |
| R11-AN-01   | Analytics catalogue/SoR hardening (registry persistence)                        | Technical Debt · Operational Improvement                                                 | Analytics KL                              |
| R11-TCMS-01 | TCMS certification UX / cross-product adjacency (not GitLab/AI)                 | Customer Feature · Enhance                                                               | TCMS KL                                   |
| R11-DOC-01  | Documents honesty + consumer wiring (not binary DMS unless unlocked)            | Deferred Release 1.0 Item                                                                | Documents KL                              |
| R11-PRJ-01  | Projects selective Wave-1 honesty gaps (status catalogue / My Work)             | Customer Feature · Enhance                                                               | Projects KL                               |
| R11-QA-01   | Production-facing stub reduction (NOT_IMPLEMENTED / placeholders)               | Technical Debt · Developer Experience                                                    | PL-KL-13 · QA-001                         |
| R11-OPS-01  | Product ops runbooks + post-release verification closure                        | Operational Improvement                                                                  | Ops readiness packs                       |
| R11-SEC-01  | AuthZ residual closure (Law + least-privilege audits)                           | Security Improvement                                                                     | OBS-LAW-01 · R-03                         |
| R11-DX-01   | Doc/disk lag reduction · programme ID clarity                                   | Developer Experience                                                                     | PL-KL-12 · R-08                           |
| R11-VER-01  | Align communication of root `0.1.0-foundation` vs platform SemVer               | Technical Debt · DX                                                                      | PL-KL-11                                  |

---

## Explicitly out of Release 1.1 (unless Owner reopens)

| Item                                             | Target lane                          |
| ------------------------------------------------ | ------------------------------------ |
| Financial Engine extraction (FIN-001)            | 2.0 / Innovation · Risk R-05         |
| Email SoR                                        | 2.0 / Innovation                     |
| Support **2.0** Major                            | 2.0                                  |
| TCMS GitLab CI · AI Assist / auto-certify        | 1.2 / Innovation                     |
| Court e-filing · external DMS/accounting for Law | 2.0 / Innovation                     |
| New commercial vertical products                 | Innovation / new planning programmes |
| Platform redesign · SDK unfreeze without ADR     | Forbidden without Owner + ADR        |
| Kiwi TCMS resurrection                           | Not recommended (superseded)         |

---

## Delivery rule

Each theme requires a **named Owner Approval** programme (PDS). This roadmap does **not** authorise code.

---

## Related

- [PROGRAMME-PLAN.md](./PROGRAMME-PLAN.md)
- [OWNER-PRIORITIES.md](./OWNER-PRIORITIES.md)
- [MILESTONE-ROADMAP.md](./MILESTONE-ROADMAP.md)
