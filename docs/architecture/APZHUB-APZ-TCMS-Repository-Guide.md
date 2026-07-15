# APZ TCMS — Repository Guide

**Milestone:** APZTCMS-005 (extends 003/004)  
**Package:** `@apzhub/testing-persistence` **0.3.0**

---

## Interface surface

`TestingPersistence` exposes CRUD repositories for each mutable aggregate plus append-only / version repositories.

Standard mutable operations:

| Operation                             | Notes                                              |
| ------------------------------------- | -------------------------------------------------- |
| `create`                              | Assigns revision `1`, stamps actor                 |
| `update(id, expectedRevision, patch)` | Bumps revision; conflict → typed error             |
| `archive` / `restore`                 | Soft delete / undelete with revision check         |
| `get` / `list` / `search`             | Tenant (+ optional org) scoped; paging/sort/filter |

Version / history:

| Repo                | Operations                          |
| ------------------- | ----------------------------------- |
| `testCaseVersions`  | `create` / `get` / `listByCase`     |
| `testPlanVersions`  | `create` / `get` / `listByPlan`     |
| `testSuiteVersions` | `create` / `get` / `listBySuite`    |
| `executionHistory`  | `append` / `listBySession` / `get`  |
| `approvalHistory`   | `append` / `listByApproval` / `get` |
| `auditRecords`      | `append` / `list` / `get`           |

`runInTransaction(fn)` — in-memory simulates commit/rollback via store snapshots; Postgres uses Drizzle transactions when available.

---

## Factories

```ts
createInMemoryTestingPersistence(); // unit tests / no DB
createPostgresTestingPersistence(db); // production — all aggregates SQL
```

**APZTCMS-005:** Postgres implements **first-class SQL for every** `TestingPersistence` key. There is **no** shared in-memory fallback inside the Postgres factory.

Shared helpers:

- `repositories/postgres/generic-crud.ts` — authz, tenant, soft-delete, optimistic concurrency, list/search
- `repositories/postgres/junctions.ts` — relationship sync + manual step-actual replace-on-write
- `repositories/mappers/row-mappers.ts` — row ↔ record for all aggregates

---

## Records vs contracts

Persistence records live in `repositories/records.ts` and align to contract domain shapes with added `revision` / `organisationId` / `archivedAt`. Junction ID arrays on plans/suites/cases/risks are maintained on the record for convenience and synced to SQL junction tables on write.

---

## Errors

| Code                | When                                       |
| ------------------- | ------------------------------------------ |
| `NOT_FOUND`         | Missing / wrong tenant / already archived  |
| `REVISION_CONFLICT` | Expected revision mismatch                 |
| `UNAUTHORIZED`      | Permission assert failed                   |
| `VALIDATION`        | Enum / required field / tenant mismatch    |
| `TENANT_MISMATCH`   | Reserved helper for cross-tenant detection |

---

## Related

[Persistence Completion Guide](./APZHUB-APZ-TCMS-Persistence-Completion-Guide.md) · [Authorization Guide](./APZHUB-APZ-TCMS-Authorization-Guide.md)
