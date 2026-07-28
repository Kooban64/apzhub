# APZHUB Release 1.2 — Executive Summary

> **Programme:** APZHUB-1.2-008  
> **Date:** 2026-07-20  
> **Classification:** DOCUMENTATION ONLY

---

## Verdict

The Owner-authorised Release **1.2** P0 engineering programmes (**APZHUB-1.2-002** through **APZHUB-1.2-007**) are complete, accepted, and compatible with the Platform **1.1.0** Production Baseline. Architecture boundaries were preserved. Approved P0 Themes **A–C** (ops maturity, Search Time/Law publishers, TCMS GitLab CI metadata adapter) are delivered. Deferred STOP items (Email SoR, FIN-001, Workflow Execute unlock, redesign) remain correctly out of scope. Themes **D–E** (persistence honesty, Support CE depth) and other P1 items were not part of the approved P0 engineering set and travel as residual Known Limitations / deferred backlog for Platform **1.2.0** PRWL certification.

Release **1.2** is ready to enter **portfolio packaging and certification** (Platform **1.2.0** under a named certification programme). No additional Release **1.2** P0 engineering is required. Engineering remains paused pending Owner Acceptance of this readiness review and authorisation of certification.

---

## What was delivered (engineering)

| Programme      | Backlog       | Outcome                                                  |
| -------------- | ------------- | -------------------------------------------------------- |
| APZHUB-1.2-001 | Planning      | **ACCEPTED** — plan / backlog / matrices                 |
| APZHUB-1.2-002 | R12-OPS-01    | **ACCEPTED** — backup restore drill + recovery evidence  |
| APZHUB-1.2-003 | R12-OPS-02    | **ACCEPTED** — alert strategy / Observe runbook depth    |
| APZHUB-1.2-004 | R12-OPS-03    | **ACCEPTED** — host coexistence capacity controls        |
| APZHUB-1.2-005 | R12-SEARCH-01 | **ACCEPTED** — `@apzhub/search-time` **0.1.0**           |
| APZHUB-1.2-006 | R12-SEARCH-02 | **ACCEPTED** — `@apzhub/search-law` **0.1.0**            |
| APZHUB-1.2-007 | R12-TCMS-01   | **ACCEPTED** — `@apzhub/integration-gitlab-ci` **0.1.0** |

## What was not delivered (correctly deferred)

| Item                                               | Disposition                                   |
| -------------------------------------------------- | --------------------------------------------- |
| Themes D–E (R12-PERSIST-*, R12-SUP-01/02)          | P1 — not approved P0 engineering; residual KL |
| R12-QA-01 Playwright/Docker re-cert path           | P1 — certification may optionally reaffirm    |
| R12-AUTO-01 / SEC-01 / COMP-01 / product P2 slices | Deferred backlog                              |
| Email SoR · FIN-001 · Workflow Execute · redesign  | **STOP**                                      |

## Certification posture

| Field                    | Value                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------- |
| Expected class           | **PRODUCTION_READY_WITH_LIMITATIONS** (PRWL)                                        |
| Baseline held            | Platform **1.1.0** until Platform **1.2.0** pack accepted                           |
| Planning exit Themes A–C | **Complete**                                                                        |
| Planning exit Themes D–E | **Owner-waived for certification entry** via this readiness Acceptance (KL updated) |
| Next programme type      | Certification / packaging — not new P0 engineering                                  |

## Recommendation

# READY FOR RELEASE 1.2 CERTIFICATION
