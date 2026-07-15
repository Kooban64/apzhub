# APZ TCMS — Migration Guide

**Milestone:** APZTCMS-005 (extends 003/004)

---

## Migrations

| File                                                                   | Purpose                                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `packages/config/drizzle/0016_apz_tcms.sql`                            | CREATE TABLE + indexes + CHECK (base TCMS)                          |
| `packages/config/drizzle/0017_apz_tcms_rls.sql`                        | ENABLE/FORCE RLS + tenant policies (base)                           |
| `packages/config/drizzle/0018_apz_tcms_manual_execution.sql`           | Manual execution, step actuals, case versions (+ column expansions) |
| `packages/config/drizzle/0019_apz_tcms_manual_execution_rls.sql`       | RLS for 0018 tables                                                 |
| `packages/config/drizzle/0020_apz_tcms_persistence_completion.sql`     | Plan/suite version tables + approval history                        |
| `packages/config/drizzle/0021_apz_tcms_persistence_completion_rls.sql` | RLS for 0020 tables                                                 |

Journal entries: idx **16–21** in `packages/config/drizzle/meta/_journal.json`.

Drizzle config schema array includes `./src/db/testing-schema.ts`.

---

## Apply

Use the existing platform migrator (`runMigrations` from `@apzhub/config`):

```bash
# Ensure DATABASE_URL points at the APZHUB platform database
# then run the package migrate entry used by your environment
```

After apply, set session GUC before queries under RLS:

```sql
SELECT set_config('app.tenant_id', '<tenant-id>', true);
```

(`applyPostgresTenantSession` in `@apzhub/config`.)

---

## Rollback notes

Forward-only for production. Dev rollback may DROP the additive 0020 tables if unused. Do not drop 0016–0019 tables without an approved data migration plan.

---

## Related

[Schema Update Guide](./APZHUB-APZ-TCMS-Schema-Update-Guide.md) · [Persistence Completion Guide](./APZHUB-APZ-TCMS-Persistence-Completion-Guide.md)
