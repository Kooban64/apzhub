# APZ TCMS — Persistence Architecture

**Milestone:** APZTCMS-005 (extends 003/004)  
**Status:** Implemented — full Postgres repositories for all Manual Testing aggregates; no UI/API  
**Packages:** `@apzhub/config` (SoR schema), `@apzhub/testing-persistence` **0.3.0**

---

## Layering

```text
@apzhub/testing-services (domain)
        │
        ▼
@apzhub/testing-persistence   ← repositories, authz asserts, validation
        │
        ▼
@apzhub/config testing-schema ← Drizzle tables + SQL migrations 0016–0021
        │
        ▼
Platform PostgreSQL (SoR)
```

Domain contracts remain in `@apzhub/testing-contracts`. Persistence records add `revision`, `organisationId`, and `archivedAt`.

**APZTCMS-005:** `createPostgresTestingPersistence(db)` implements every aggregate in SQL. In-memory factory is for tests only.

See [Persistence Completion Guide](./APZHUB-APZ-TCMS-Persistence-Completion-Guide.md).

---

## Ownership rules (011)

| Datum | Owner |
| --- | --- |
| Plans, suites, cases, steps, requirements, risks, certification metadata | APZHUB PostgreSQL |
| Evidence **blobs** | Object storage (metadata only in SoR) |
| Projects Features/Epics/Stories/Tasks | Soft refs (`project_ref_id` / work item refs) — never authoritative copies |
| Execution **results** / step outcomes | Manual execution + step actual tables (APZTCMS-004/005); engine result ingestion deferred |

---

## Isolation & concurrency

- **Tenant:** every query filters `tenant_id`; RLS policies use `app.tenant_id` (migration `0017`)
- **Organisation:** optional filter when `organisationId` is present on context
- **Optimistic concurrency:** `update` / `archive` / `restore` require expected `revision`; bump on success; conflict → `REVISION_CONFLICT`
- **Soft delete:** `archived_at` (list excludes archived unless `includeArchived`)

---

## Authorization

Repository operations call `assertPermission` with specific keys from the APZ TCMS catalogue. Granted wildcards (`testing.*`, `evidence.*`, …) match via `permissionPatternMatches`. There is **no** repository-layer allow-all bypass.

---

## Related

- [Schema Guide](./APZHUB-APZ-TCMS-Schema-Guide.md)
- [Repository Guide](./APZHUB-APZ-TCMS-Repository-Guide.md)
- [Authorization Guide](./APZHUB-APZ-TCMS-Authorization-Guide.md)
- [Migration Guide](./APZHUB-APZ-TCMS-Migration-Guide.md)
