# LAW-012-02 — Persistence Adapter Specification

> **Story:** LAW-012-02 — Persistence Foundation: Client + Matter  
> **Status:** Implemented  
> **Authority:** [LAW-012-01 Persistence Architecture](./LAW-012-01-Persistence-Architecture.md)

---

## 1. Scope

| In scope                                                | Out of scope                            |
| ------------------------------------------------------- | --------------------------------------- |
| `LawPersistenceContext`                                 | Document, Task, Calendar, Time, Billing |
| `LAW_REPOSITORY_MODE` feature flag                      | Public APIs                             |
| `PostgresClientRepository` / `PostgresMatterRepository` | Platform changes                        |
| Repository factory (`getShared*Repository`)             | Outbox workers / replay                 |
| Client + Matter Unit of Work skeleton                   | Trust accounting                        |
| Outbox table + insert skeleton                          | Search projections                      |

---

## 2. Repository mode

| Variable              | Values                 | Default                                |
| --------------------- | ---------------------- | -------------------------------------- |
| `LAW_REPOSITORY_MODE` | `memory` \| `postgres` | `memory`                               |
| `LAW_TENANT_ID`       | Firm tenant identifier | `t0000001-0000-4000-8000-000000000001` |

Postgres mode is **opt-in**. Memory mode remains the default for local development and all existing workflow/integration tests unless explicitly overridden.

---

## 3. Layer model

```text
ClientWorkflowService / MatterWorkflowService  (unchanged signatures)
        ↓
WritableClientRepository / WritableMatterRepository  (unchanged interfaces)
        ↓
repository-factory.ts  (mode switch)
        ↓
InMemory*Repository  |  Postgres*Repository (law-platform wrapper)
                              ↓
                        @apzhub/config/db/adapters/*  (Drizzle + PostgreSQL)
```

---

## 4. Adapter contract

Both adapters implement the existing writable interfaces without changing workflow method signatures:

| Operation                    | In-memory                | PostgreSQL                                      |
| ---------------------------- | ------------------------ | ----------------------------------------------- |
| `list(criteria?)`            | Filter + sort in process | Tenant-scoped SELECT + in-process filter parity |
| `getById(id)`                | Map lookup               | Tenant-scoped SELECT                            |
| `create(entity)`             | Map insert               | INSERT in Client/Matter UoW transaction         |
| `update(id, entity)`         | Map replace              | UPDATE with version increment                   |
| `softDelete` / `softArchive` | Status + exclusion set   | `deleted_at` / `archived_at` + status           |
| `count` / `isSoft*`          | In-process               | Tenant-scoped SELECT                            |

### Sync interface over async I/O

Workflow services remain synchronous. PostgreSQL adapters use `runSync()` (`Atomics.wait`) to bridge async Drizzle operations while preserving the repository interface contract. **Technical debt TD-P04** — migrate to async workflows in a future story.

---

## 5. Key files

| Component                  | Path                                                            |
| -------------------------- | --------------------------------------------------------------- |
| Persistence context        | `apps/law-platform/lib/persistence/law-persistence-context.ts`  |
| Repository factory         | `apps/law-platform/lib/persistence/repository-factory.ts`       |
| Client PG adapter (app)    | `apps/law-platform/lib/clients/postgres-client-repository.ts`   |
| Matter PG adapter (app)    | `apps/law-platform/lib/matters/postgres-matter-repository.ts`   |
| Client PG adapter (config) | `packages/config/src/db/adapters/postgres-client-repository.ts` |
| Matter PG adapter (config) | `packages/config/src/db/adapters/postgres-matter-repository.ts` |
| Row mappers                | `packages/config/src/db/law-mappers/`                           |
| Drizzle schema             | `packages/config/src/db/legal-schema.ts`                        |
| UoW skeleton               | `apps/law-platform/lib/persistence/unit-of-work.ts`             |
| Outbox skeleton            | `apps/law-platform/lib/persistence/outbox-skeleton.ts`          |

---

## 6. Wiring

All existing call sites continue to use `getSharedClientRepository()` / `getSharedMatterRepository()`. The factory selects the adapter implementation based on `LAW_REPOSITORY_MODE`.

`createAppActionExecutorBundle()` requires no signature changes — it already injects shared repositories into workflow services.

---

## 7. Parity tests

Shared contract harnesses validate both adapters:

- `writable-client-repository.contract.test.ts`
- `writable-matter-repository.contract.test.ts`

PostgreSQL integration tests run when `DATABASE_URL` is configured **and** PostgreSQL accepts connections (`isPostgresIntegrationAvailable()`). Otherwise tests are skipped (7 skipped in CI/local without Postgres).
