# APZHUB-ENG-0002 — Implementation Summary

> **Programme:** APZHUB-ENG-0002  
> **Title:** Implement R12-PERSIST-02 — Law session stores → PostgreSQL System of Record  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-20  
> **Status:** Complete — **ACCEPTED / CLOSED**

---

## Selected backlog item

| Field               | Value                                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identifier**      | **R12-PERSIST-02**                                                                                                                                                               |
| **Title**           | Law session stores → PostgreSQL System of Record                                                                                                                                 |
| **Selection basis** | Rank **2** in [ENGINEERING-CANDIDATES](../../product-lifecycle/backlog/ENGINEERING-CANDIDATES.md) immediately after R12-PERSIST-01; Ready=YES; dependencies met; not implemented |
| **Dependencies**    | Law 1.0.0 / APZHUB-1.1-002 session model — **satisfied**                                                                                                                         |

---

## Scope delivered

| Item                                   | Result                                        |
| -------------------------------------- | --------------------------------------------- |
| R12-PERSIST-02                         | **Implemented**                               |
| Additional backlog items               | **None**                                      |
| Workflow Execute / Email SoR / FIN-001 | **None**                                      |
| Law product redesign                   | **None** — ENF/ATF store interfaces preserved |

---

## Technical changes

1. **Migrations** — `0063_apz_platform_law_session_stores` + `0064_*_rls` (`platform_law_activity_session`, `platform_law_notification_session`).
2. **Postgres SoR adapters** — ATF/ENF snapshot load/save + write-through storage + `createProductionPostgres*SessionStore`.
3. **Platform API** — `GET/PUT /api/platform/v1/law/session/{activity\|notification}` (law-platform).
4. **Client dual-write** — localStorage L1 + fire-and-forget API → Postgres SoR when `persistenceScope` is set.
5. **Sync store API preserved** — no breaking change to `ActivitySessionStore` / `NotificationSessionStore`.

---

## Repository impact

| Area                                   | Impact                                     |
| -------------------------------------- | ------------------------------------------ |
| `@apzhub/activity-timeline-framework`  | Postgres activity session snapshot SoR     |
| `@apzhub/event-notification-framework` | Postgres notification session snapshot SoR |
| `@apzhub/config`                       | Drizzle **0063/0064**                      |
| `apps/law-platform`                    | Dual-write wiring + session API routes     |
| Commercial Law product                 | Persistence honesty only — no UX redesign  |
| Platform **1.2.0** packaging           | **Unchanged**                              |

---

## SemVer impact

- ATF / ENF remain **0.0.0** (private workspace packages); additive exports on `/server` surfaces.
- Public sync store contracts **unchanged** (backward compatible).

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
