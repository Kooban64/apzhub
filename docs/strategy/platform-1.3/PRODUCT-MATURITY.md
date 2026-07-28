# Product Maturity Matrix — Platform 1.2.0 → 1.3

> **Programme:** APZHUB-PLAN-001  
> **Date:** 2026-07-22

## Maturity scale

| Level          | Meaning                                                 |
| -------------- | ------------------------------------------------------- |
| **Absent**     | Not delivered                                           |
| **Foundation** | Contracts/adapters exist; limited runtime               |
| **PRWL**       | Production Ready With Limitations                       |
| **Production** | Production with documented product KL                   |
| **Frozen**     | Programme closed; ADR + Owner to extend                 |
| **STOP**       | Explicitly gated / forbidden without dedicated Approval |

## Matrix

| Surface                             | Maturity               | 1.3 posture                                |
| ----------------------------------- | ---------------------- | ------------------------------------------ |
| Platform Runtime / Workbench        | Production · Frozen    | Hygiene only                               |
| Identity / Admin / Config / Metrics | Frozen · PRWL          | Hygiene / ADR                              |
| Projects                            | Production             | Depth (Should)                             |
| Support                             | PRWL                   | **Must** — realtime                        |
| Time                                | Production             | Should — UI depth + Search drain           |
| Documents                           | PRWL                   | Could — binary deferred to 2.0             |
| TCMS                                | PRWL                   | Could — CI mutations                       |
| Law                                 | PRWL                   | Should — UX; FIN/Email **STOP**            |
| Analytics                           | PRWL                   | **Must/Should** — live embed               |
| Workflow                            | PRWL · Execute STOP    | Should — designer; Execute **Future/STOP** |
| Search                              | PRWL · Needs expansion | **Must** — live drain                      |
| Observe                             | Frozen · Limited live  | **Must** — live evaluation                 |
| Notifications                       | PRWL · Needs expansion | **Must** — delivery providers              |
| Provisioning                        | MVP                    | Future unless blocker                      |
| Email                               | **STOP / Absent**      | **Future (2.0)**                           |
| Calendar                            | Law-bundled            | Maintain with Law                          |

## Portfolio status summary

APZHUB is a **broad PRWL suite** on a **frozen platform core**. 1.3 should close **operational and connectivity gaps** that block honest GA claims (Search live, Observe live, Support realtime, notification delivery, Analytics embed) while protecting STOP surfaces.
