# Known Limitations — Platform-1.3-CERT-002

> **Date:** 2026-07-23

## CERT-001 quality blockers

| ID                | Classification                                                            |
| ----------------- | ------------------------------------------------------------------------- |
| P13-CERT-QF-01…04 | **Resolved** — RR-001 ACCEPTED · independently re-verified under CERT-002 |

## Platform 1.3 / product limitations

| ID                                          | Item                                              | Classification                                    |
| ------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| P13-KL-ND-01                                | SMTP delivery                                     | **Deferred**                                      |
| P13-KL-ND-02                                | SMS / push / Teams / Slack                        | **Deferred** / not authorised                     |
| P13-KL-ND-03                                | PostgreSQL delivery store production wiring       | **Remaining**                                     |
| P13-KL-ND-04…06                             | Preference / template / external recipient limits | **Remaining**                                     |
| P13-KL-ND-07                                | POPIA formal compliance review                    | **Residual**                                      |
| P13-KL-ND-08                                | Shared-host capacity certification                | **Remaining** (not claimed)                       |
| PL12-KL-02                                  | Observe live evaluation/delivery                  | **Partially remediated** (ENG-002 + ENG-004 path) |
| PL12-KL-05                                  | Support residuals (attachment delete)             | **Remaining** (SSE done)                          |
| PL12-KL-07                                  | Email SoR                                         | **Deferred** / excluded                           |
| PL12-KL-08                                  | FIN-001                                           | **Deferred** / STOP                               |
| PL12-KL-09                                  | Workflow Execute                                  | **Deferred** / gated                              |
| Integration SDK 1.0.0                       | Architecture Frozen · coverage LIMITED            | **Remaining** (accepted PRWL)                     |
| WebSockets                                  | Unauthorised                                      | **Deferred** / fence                              |
| Full monorepo Vitest / Playwright portfolio | Not re-run under CERT-002                         | **Residual** (honesty)                            |

## Marketing constraint

Platform 1.3 is Owner-accepted as **Production Ready With Limitations** and the Platform 1.3 programme lifecycle is **CLOSED**. It must **not** be described as Email SoR complete, SMTP GA, Workflow Execute unlocked, FIN-001 complete, WebSocket realtime, or capacity-certified on shared host without further Owner-authorised programmes.
