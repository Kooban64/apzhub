# APZHUB-ENG-0001 — Implementation Summary

> **Programme:** APZHUB-ENG-0001  
> **Title:** Implement R12-PERSIST-01 — Automation Journal → PostgreSQL System of Record  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-20  
> **Status:** Complete — **ACCEPTED / CLOSED**

---

## Scope delivered

| Item                       | Result                                                        |
| -------------------------- | ------------------------------------------------------------- |
| R12-PERSIST-01             | **Implemented** — Automation execution journal PostgreSQL SoR |
| Additional backlog items   | **None**                                                      |
| Event Bus behaviour change | **None**                                                      |
| Notification Foundation    | **None**                                                      |
| Workflow Execute unlock    | **None**                                                      |
| Email SoR / FIN-001        | **None**                                                      |

---

## Verification (pre-implementation)

| Check                    | Result                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| Dependencies             | Automation Foundation (APZHUB-1.1-004) **ACCEPTED** — satisfied     |
| Architecture boundaries  | Journal remains Platform Service port; modules do not write storage |
| Platform ownership       | Platform owns journal SoR metadata in PostgreSQL                    |
| Persistence ownership    | `AutomationExecutionJournal` port; Postgres production impl         |
| Public API compatibility | `listExecutions` / journal methods now **async** (0.x SemVer bump)  |
| SemVer                   | `@apzhub/platform-services` **0.28.0 → 0.29.0**                     |

---

## Technical changes

1. **Port** — `AutomationExecutionJournal` methods are `Promise`-based.
2. **In-memory** — retained for tests / environments without `DATABASE_URL`.
3. **Postgres SoR** — `createPostgresAutomationExecutionJournal` / `createProductionAutomationExecutionJournal`.
4. **Migrations** — `0061_apz_platform_automation_execution_journal.sql` + `0062_*_rls.sql`.
5. **Idempotency** — unique index on `(envelope_id, registration_id)`; `ON CONFLICT DO NOTHING`.
6. **Bootstrap** — `getOrCreateServerAutomationFoundation()` injects Postgres journal when `DATABASE_URL` is set.
7. **Foundation** — awaits journal `hasProcessed` / `record` / `list`.

---

## Packages touched

| Package                     | Change                                 |
| --------------------------- | -------------------------------------- |
| `@apzhub/platform-services` | **0.29.0** — journal SoR + async port  |
| `@apzhub/config`            | Drizzle migrations **0061** / **0062** |
| `apps/web`                  | Server automation bootstrap wiring     |

---

## Explicit non-delivery

- R12-PERSIST-02 (Law session Postgres)
- R12-AUTO-01
- Registration store SoR
- Workflow Execute
- Platform **1.2.0** packaging mutation

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
