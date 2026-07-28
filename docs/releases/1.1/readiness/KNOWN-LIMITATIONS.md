# APZHUB Release 1.1 — Known Limitations Register

> **Programme:** APZHUB-1.1-005  
> **Date:** 2026-07-20  
> **Supersedes for 1.1 readiness:** updates selected rows from [Platform 1.0.0 KNOWN-LIMITATIONS-REGISTER](../../platform/1.0.0/KNOWN-LIMITATIONS-REGISTER.md)  
> **Honesty rule:** Do not market limited surfaces as complete. Product KL docs win on product-specific detail.

---

## Closed under Release 1.1 engineering

| ID                                  | Limitation (was)                                          | Closure                                                                                              |
| ----------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| OBS-LAW-01 / KL-LAW-03              | Law AuthZ allow-all / `*` injection / exact-match `can()` | **Closed** — APZHUB-1.1-001                                                                          |
| OBS-LAW-02 / KL-LAW-04              | Session-only activity/notification UX                     | **Closed** — APZHUB-1.1-002 (browser durable stores; Postgres projections remain future enhancement) |
| Support Event Bus publish           | No catalogue publish                                      | **Closed** — APZHUB-1.1-003                                                                          |
| Support in-app notifications        | No vertical Attention wiring                              | **Closed** — APZHUB-1.1-003 (ENF Attention; not APZNOTIFY delivery)                                  |
| Cross-product automation foundation | No platform registration / event→action bridge            | **Closed** — APZHUB-1.1-004 (foundation only; product AU-* remain)                                   |

---

## Residual limitations entering certification (PRWL)

| ID        | Limitation                                                                          | Severity           | Notes                                    |
| --------- | ----------------------------------------------------------------------------------- | ------------------ | ---------------------------------------- |
| R11-KL-01 | Law placeholder UX polish not delivered                                             | Medium             | R11-LAW-01 never authorised              |
| R11-KL-02 | No Email SoR                                                                        | High (product gap) | Explicit STOP · 2.0 lane                 |
| R11-KL-03 | FIN-001 not extracted                                                               | Medium             | Explicit STOP                            |
| R11-KL-04 | Support webhook ingress · binary attachments · realtime WS/SSE                      | Medium             | Explicit STOP / residual Support KL      |
| R11-KL-05 | Workflow / n8n provider execute gated                                               | High (capability)  | Automation records deferred intents only |
| R11-KL-06 | Product AU-* automations (e.g. Support→Projects) not delivered                      | Medium             | Foundation only                          |
| R11-KL-07 | Automation journal / Law session stores not Postgres SoR                            | Medium             | Honest MVP; future enhancement           |
| R11-KL-08 | Time / Analytics / TCMS / Documents / Projects selective 1.1 enhances not delivered | Low–Medium         | Never authorised as named programmes     |
| R11-KL-09 | Root `0.1.0-foundation` ≠ platform SemVer                                           | Low                | PL-KL-11 held                            |
| R11-KL-10 | QA intentional stubs remain                                                         | Low–Medium         | PL-KL-13 held                            |
| R11-KL-11 | Historical docs may lag ACCEPTED status                                             | Low                | PL-KL-12 · refresh in cert pack          |
| R11-KL-12 | Full Playwright / Docker not re-certified under each 1.1 programme                  | Low                | QA-002 held; cert programme may reaffirm |

---

## Platform 1.0.0 register row updates (authoritative for readiness)

| Platform ID | Updated posture                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| PL-KL-02    | Automation Foundation **delivered** (APZHUB-1.1-004 **ACCEPTED**); product AU-* / durable SoR / Workflow execute remain |
| PL-KL-04    | OBS-LAW-01/02 **closed**; Law UX polish + Email SoR remain                                                              |
| PL-KL-09    | Event Bus publish + in-app ENF **closed** (APZHUB-1.1-003 **ACCEPTED**); webhook/attachments/realtime remain            |

---

## Certification marketing constraint

Release **1.1** must be described as:

> Platform enhancement release closing Law AuthZ/ops residuals, Support Event Bus + Attention foundation, and Cross-Product Automation Foundation — **Production Ready With Limitations**.

It must **not** be described as full cross-product orchestration, Workflow execute, Email SoR, or Support 2.0.
