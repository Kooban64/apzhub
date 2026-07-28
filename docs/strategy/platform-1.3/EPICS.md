# Epics — Platform 1.3

> **Programme:** APZHUB-PLAN-001  
> **Date:** 2026-07-22  
> **Rule:** Epics are planning artefacts — each requires a named Owner engineering programme before code.

---

## P13-E01 — Search Live Composition & Drain

| Field               | Value                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| **Purpose**         | Wire live Meilisearch composition/drain for published adapters (esp. Time/Law) |
| **Scope**           | Search orchestrator · publication admin · Meilisearch adapter · KL-01 closure  |
| **Products**        | Search · Time · Law · Platform                                                 |
| **Dependencies**    | search-time/law **0.1.0** present · SDK frozen                                 |
| **Priority**        | **Must Have**                                                                  |
| **Acceptance**      | Live drain evidenced · KL-01 updated · no standalone module search UIs         |
| **Est. programmes** | Platform-1.3-ENG-001                                                           |

## P13-E02 — Observe Live Alert Evaluation & Delivery

| Field                  | Value                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**            | Automate alert evaluation/delivery beyond catalogue + manual triage                                                      |
| **Scope**              | Observe services · delivery hooks · runbook updates · KL-02                                                              |
| **Products**           | Observe · Operations · Platform                                                                                          |
| **Dependencies**       | APZOBSERVE frozen baseline · OPS manual triage accepted today                                                            |
| **Priority**           | **Must Have**                                                                                                            |
| **Acceptance**         | Documented live evaluation path · KL-02 closed or narrowed · honesty on channels                                         |
| **Est. programmes**    | Platform-1.3-ENG-002                                                                                                     |
| **Engineering status** | Phase A **ACCEPTED** — [ENG-002](../../engineering/platform-1.3-eng-002/README.md) · PL12-KL-02 **PARTIALLY REMEDIATED** |

## P13-E03 — Support Realtime (R12-SUP-03)

| Field                  | Value                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**            | Realtime inbox/detail updates (WS/SSE) after webhook/attachments                                                            |
| **Scope**              | Support workbench · Platform Service events · Zammad CE constraints · attachment delete if in-scope                         |
| **Products**           | Support                                                                                                                     |
| **Dependencies**       | ENG-0003/0004 closed                                                                                                        |
| **Priority**           | **Must Have**                                                                                                               |
| **Acceptance**         | Realtime updates for open tickets · KL-05 narrowed · CE-only                                                                |
| **Est. programmes**    | Platform-1.3-ENG-003                                                                                                        |
| **Architecture gate**  | **ADR-0072 ACCEPTED** — [ADR](../../architecture/adr/ADR-0072-Platform-Realtime-Transport.md)                               |
| **Engineering status** | **ACCEPTED** — [ENG-003](../../engineering/platform-1.3-eng-003/README.md) · SSE only · PL12-KL-05 **PARTIALLY REMEDIATED** |

## P13-E04 — Notification Delivery Providers

| Field                  | Value                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**            | Deliver notifications via approved providers (SMTP/WebSocket/SSE as platform allows)                                                      |
| **Scope**              | Notification services · providers · Attention Engine · **explicitly not Email SoR**                                                       |
| **Products**           | Notifications · Platform · all consumers                                                                                                  |
| **Dependencies**       | APZNOTIFY frozen metadata                                                                                                                 |
| **Priority**           | **Must Have**                                                                                                                             |
| **Acceptance**         | At least one delivery provider certified · marketing does not claim Email SoR                                                             |
| **Est. programmes**    | Platform-1.3-ENG-004                                                                                                                      |
| **Architecture gate**  | **ADR-0071** — [ADR](../../architecture/adr/ADR-0071-Notification-Delivery-Providers-and-Routing.md) · **READY FOR OWNER ADR ACCEPTANCE** |
| **Engineering status** | **STOP** until ADR Accepted + named ENG-004 Approval                                                                                      |

## P13-E05 — Analytics Live Embed & Registry Honesty

| Field               | Value                                                            |
| ------------------- | ---------------------------------------------------------------- |
| **Purpose**         | Live Metabase embed path + registry SoR honesty                  |
| **Scope**           | Analytics workbench · Metabase adapter · contracts if additive   |
| **Products**        | Analytics                                                        |
| **Dependencies**    | Metabase CERTIFIED_FOUNDATION                                    |
| **Priority**        | **Should Have**                                                  |
| **Acceptance**      | Live embed for curated dashboards · KL-10 Analytics slice closed |
| **Est. programmes** | Platform-1.3-ENG-005                                             |

## P13-E06 — Workflow Designer Adjacency

| Field               | Value                                                            |
| ------------------- | ---------------------------------------------------------------- |
| **Purpose**         | Improve designer/workbench adjacency for definitions/runs        |
| **Scope**           | Workflow workbench UX · **Execute remains gated**                |
| **Products**        | Workflow                                                         |
| **Dependencies**    | Workflow 1.0.0 · n8n foundation                                  |
| **Priority**        | **Should Have**                                                  |
| **Acceptance**      | Designer UX acceptance tests · Execute still gated in tests/docs |
| **Est. programmes** | Platform-1.3-ENG-006                                             |

## P13-E07 — Law UX Polish

| Field               | Value                                           |
| ------------------- | ----------------------------------------------- |
| **Purpose**         | Practitioner UX polish without FIN/Email        |
| **Scope**           | Law workbench flows · L1 cache honesty          |
| **Products**        | Law                                             |
| **Dependencies**    | Law 1.0.0                                       |
| **Priority**        | **Should Have**                                 |
| **Acceptance**      | Named UX acceptance criteria · no FIN-001/Email |
| **Est. programmes** | Platform-1.3-ENG-007                            |

## P13-E08 — Time Approvals & Reporting UI

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| **Purpose**         | Approvals/reporting UI depth for Time        |
| **Scope**           | Time workbench · Kimai CE APIs only          |
| **Products**        | Time                                         |
| **Dependencies**    | Time 1.0.0 · prefer after/with Search drain  |
| **Priority**        | **Should Have**                              |
| **Acceptance**      | Approvals path usable · documented KL update |
| **Est. programmes** | Platform-1.3-ENG-008                         |

## P13-E09 — Projects Sprint & My Work Depth

| Field               | Value                                                |
| ------------------- | ---------------------------------------------------- |
| **Purpose**         | Sprint list/CRUD HTTP + My Work depth                |
| **Scope**           | Projects services/workbench · Plane CE               |
| **Products**        | Projects                                             |
| **Dependencies**    | Projects 1.1.0                                       |
| **Priority**        | **Should Have**                                      |
| **Acceptance**      | Sprint operations evidenced · no Plane branding leak |
| **Est. programmes** | Platform-1.3-ENG-009                                 |

## P13-E10 — Performance Baselines

| Field               | Value                                                   |
| ------------------- | ------------------------------------------------------- |
| **Purpose**         | Measure-first performance baselines for Tier A journeys |
| **Scope**           | Perf harness · capacity docs · no opportunistic rewrite |
| **Products**        | Platform · Workbench                                    |
| **Dependencies**    | OPS capacity check                                      |
| **Priority**        | **Could Have** (Wave C)                                 |
| **Acceptance**      | Documented p95 targets + evidence                       |
| **Est. programmes** | Platform-1.3-ENG-010                                    |

## P13-E11 — Root SemVer & Portfolio Hygiene

| Field               | Value                                                                       |
| ------------------- | --------------------------------------------------------------------------- |
| **Purpose**         | Align root/package SemVer honesty (KL-11/12) without product marketing lies |
| **Scope**           | Versioning policy execution · registers                                     |
| **Products**        | Platform                                                                    |
| **Dependencies**    | Versioning policy                                                           |
| **Priority**        | **Could Have**                                                              |
| **Acceptance**      | KL-11/12 updated · registers consistent                                     |
| **Est. programmes** | Platform-1.3-ENG-011                                                        |

## P13-E12 — Platform 1.3 Portfolio Re-certification

| Field               | Value                                                                |
| ------------------- | -------------------------------------------------------------------- |
| **Purpose**         | Certify 1.3.0 after Waves A–C                                        |
| **Scope**           | Lint/tsc/Vitest/OpenAPI/Playwright · architecture/compatibility      |
| **Products**        | All                                                                  |
| **Dependencies**    | ENG-001…011 outcomes as scoped                                       |
| **Priority**        | **Must Have** (end of train)                                         |
| **Acceptance**      | Named certification programme PASS or classified FAIL with residuals |
| **Est. programmes** | Platform-1.3-CERT-001                                                |

---

## Explicitly out of 1.3 epic set

| Topic                            | Reason     |
| -------------------------------- | ---------- |
| Email SoR                        | STOP → 2.0 |
| FIN-001                          | STOP → 2.0 |
| Workflow Execute unlock          | STOP → 2.0 |
| Support 2.0 Major                | 2.0        |
| Documents binary DMS / Paperless | 2.0        |
| Integration SDK unfreeze         | STOP       |
