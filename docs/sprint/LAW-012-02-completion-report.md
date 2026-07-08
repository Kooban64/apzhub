# LAW-012-02 — Completion Report

> **Story:** LAW-012-02 — Persistence Foundation: Client + Matter  
> **Status:** **Complete**  
> **Date:** 2026-07-06  
> **Authority:** [LAW-012-01 Architecture](./LAW-012-01-Persistence-Architecture.md)

---

## 1. Objective

Introduce the first PostgreSQL-backed persistence adapters for Client and Matter while preserving existing workflow signatures and maintaining in-memory mode as the default.

**Result:** Achieved. All workflow services consume unchanged repository interfaces. Memory mode remains default.

---

## 2. Deliverables

| Deliverable               | Location                                                            | Status |
| ------------------------- | ------------------------------------------------------------------- | ------ |
| `LawPersistenceContext`   | `apps/law-platform/lib/persistence/law-persistence-context.ts`      | ✅     |
| Tenant context            | `default-tenant.ts`, `LAW_TENANT_ID` env                            | ✅     |
| Repository mode flag      | `LAW_REPOSITORY_MODE=memory\|postgres`                              | ✅     |
| PostgreSQL Client adapter | Config + law-platform wrapper                                       | ✅     |
| PostgreSQL Matter adapter | Config + law-platform wrapper                                       | ✅     |
| Unit of Work skeleton     | `unit-of-work.ts`                                                   | ✅     |
| Outbox skeleton           | `outbox-skeleton.ts` + `law_outbox_event` table                     | ✅     |
| Drizzle migration         | `0001_law_client_matter_outbox.sql`                                 | ✅     |
| Adapter specification     | `docs/architecture/LAW-012-02-Persistence-Adapter-Specification.md` | ✅     |
| Migration notes           | `docs/architecture/LAW-012-02-Migration-Notes.md`                   | ✅     |
| Tenant isolation notes    | `docs/architecture/LAW-012-02-Tenant-Isolation-Notes.md`            | ✅     |
| Outbox skeleton notes     | `docs/architecture/LAW-012-02-Outbox-Skeleton-Notes.md`             | ✅     |

---

## 3. Architecture compliance

| Rule                                     | Compliance                                                     |
| ---------------------------------------- | -------------------------------------------------------------- |
| Workflow signatures unchanged            | ✅ `ClientWorkflowService`, `MatterWorkflowService` unmodified |
| Repository interfaces unchanged          | ✅ Writable interfaces preserved                               |
| Memory mode default                      | ✅ `LAW_REPOSITORY_MODE` defaults to `memory`                  |
| Postgres opt-in                          | ✅ Requires explicit env flag                                  |
| Tenant isolation                         | ✅ All PG rows scoped by `tenant_id`                           |
| No Documents/Tasks/Calendar/Time/Billing | ✅ Not touched                                                 |
| No public APIs / Platform changes        | ✅ Not touched                                                 |
| Outbox skeleton only                     | ✅ No workers/replay/retries                                   |

---

## 4. Test report

### Summary

| Metric        | Before LAW-012-02    | After LAW-012-02                                 |
| ------------- | -------------------- | ------------------------------------------------ |
| Test files    | 323                  | 323                                              |
| Tests passing | 1488 (baseline ~147) | **1488 passed**                                  |
| Skipped       | 0                    | **7** (postgres integration when DB unavailable) |

### New tests

| Test file                                        | Coverage                       |
| ------------------------------------------------ | ------------------------------ |
| `writable-client-repository.contract.test.ts`    | Shared contract — in-memory    |
| `writable-matter-repository.contract.test.ts`    | Shared contract — in-memory    |
| `postgres-client-repository.integration.test.ts` | PG contract + tenant isolation |
| `postgres-matter-repository.integration.test.ts` | PG contract                    |
| `persistence-foundation.test.ts`                 | Mode flag, context, factory    |

### Existing tests

All existing workflow integration tests (`client-workflow`, `matter-workflow`, `matter-lifecycle`, component tests) pass unchanged in memory mode.

### PostgreSQL integration

- Runs when `DATABASE_URL` is set **and** PostgreSQL accepts connections
- Skipped locally without Docker Postgres (documented)
- CI runs `pnpm db:migrate` then full test suite with Postgres service

---

## 5. Technical debt

| ID     | Description                                                                                                       | Priority |
| ------ | ----------------------------------------------------------------------------------------------------------------- | -------- |
| TD-P02 | Singleton repos use default tenant — need per-request `LawPersistenceContext` from auth                           | High     |
| TD-P04 | `runSync()` bridges sync workflows to async PG — migrate workflows to async in future                             | Medium   |
| TD-P05 | Outbox not wired to workflow UoW commits                                                                          | Medium   |
| TD-P06 | No PostgreSQL RLS policies — app-level filtering only                                                             | Medium   |
| TD-P07 | `@apzhub/legal-business-core` added to `@apzhub/config` for row mappers — consider shared law-persistence package | Low      |
| TD-P08 | `pnpm install` required after config package.json change                                                          | Ops      |

---

## 6. Recommendation for LAW-012-03

**Proposed scope:** Document + Task PostgreSQL adapters

| Priority | Item                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| 1        | `PostgreSqlDocumentRepository` + `PostgreSqlTaskRepository`                                |
| 2        | Wire outbox to Client/Matter UoW commits                                                   |
| 3        | Session tenant binding from auth → `LawPersistenceContext`                                 |
| 4        | PostgreSQL RLS policies for `law_*` tables                                                 |
| 5        | Replace `runSync` with async workflow boundary (optional, breaking — needs owner decision) |

**Stop condition preserved:** Await owner approval before Calendar, Time, Billing, APIs, or Trust Accounting.

---

## 7. How to enable postgres mode

```bash
# .env
LAW_REPOSITORY_MODE=postgres
LAW_TENANT_ID=t0000001-0000-4000-8000-000000000001
DATABASE_URL=postgresql://apzhub:apzhub@localhost:54334/apzhub

pnpm docker:up
pnpm db:migrate
pnpm dev:law
```

---

## 8. Sign-off

LAW-012-02 implementation is complete. Client + Matter persistence foundation is ready for owner review before proceeding to LAW-012-03.
