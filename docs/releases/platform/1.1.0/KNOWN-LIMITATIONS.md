# APZHUB Platform 1.1.0 — Known Limitations Register

> **Programme:** APZHUB-1.1-006  
> **Date:** 2026-07-20  
> **Certification class:** **PRODUCTION_READY_WITH_LIMITATIONS**  
> **Authority:** Aggregates [1.1 readiness KL](../../1.1/readiness/KNOWN-LIMITATIONS.md) · [Platform 1.0.0 KL](../1.0.0/KNOWN-LIMITATIONS-REGISTER.md) · product KL docs  
> **Honesty rule:** Do not market limited surfaces as complete. Product KL docs win on product-specific detail.

---

## Closed in Release 1.1 (relative to 1.0.0)

| ID                                  | Closure                                                           |
| ----------------------------------- | ----------------------------------------------------------------- |
| OBS-LAW-01 / KL-LAW-03              | Law AuthZ hardening — APZHUB-1.1-001                              |
| OBS-LAW-02 / KL-LAW-04              | Durable Law activity/notification session stores — APZHUB-1.1-002 |
| Support Event Bus publish           | APZHUB-1.1-003                                                    |
| Support in-app ENF Attention        | APZHUB-1.1-003                                                    |
| Cross-Product Automation Foundation | APZHUB-1.1-004 (foundation; not product AU-*)                     |

---

## Residual limitations (travel with 1.1.0)

| ID         | Limitation                                                                               | Severity            |
| ---------- | ---------------------------------------------------------------------------------------- | ------------------- |
| PL11-KL-01 | Law placeholder UX polish not delivered                                                  | Medium              |
| PL11-KL-02 | No Email SoR                                                                             | High                |
| PL11-KL-03 | FIN-001 not extracted                                                                    | Medium              |
| PL11-KL-04 | Support webhook ingress · binary attachments · realtime WS/SSE                           | Medium              |
| PL11-KL-05 | Workflow / n8n provider execute gated                                                    | High                |
| PL11-KL-06 | Product AU-* automations not delivered                                                   | Medium              |
| PL11-KL-07 | Automation journal / Law session stores not Postgres SoR                                 | Medium              |
| PL11-KL-08 | Time / Analytics / TCMS / Documents / Projects selective enhances not in 1.1 engineering | Low–Medium          |
| PL11-KL-09 | Root `0.1.0-foundation` ≠ platform SemVer **1.1.0**                                      | Low                 |
| PL11-KL-10 | QA intentional stubs remain                                                              | Low–Medium          |
| PL11-KL-11 | Product residual PRWL limitations (all commercial products)                              | Per product KL      |
| PL11-KL-12 | APZNOTIFY delivery providers unavailable                                                 | High (notify plane) |
| PL11-KL-13 | Full Playwright / Docker not re-run under 1.1 packaging                                  | Low — QA-002 held   |

Inherited product/platform rows from 1.0.0 (PL-KL-01, 05–08, 10, 13 family) remain applicable unless superseded above.

---

## Marketing constraint

Platform **1.1.0** is **PRODUCTION_READY_WITH_LIMITATIONS**. Do not claim full orchestration, Workflow execute, Email SoR, or Support 2.0.
