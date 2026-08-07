# P4 — Migration Verification

| Field       | Value                                               |
| ----------- | --------------------------------------------------- |
| Status      | **CLOSED** — all supported environment targets PASS |
| Scope       | Projects migrations `0109`–`0130`                   |
| Entry point | `verifyProjectsMigrations()` in `@apzhub/config`    |
| Closed      | 2026-08-07                                          |

## Checks

| Concern           | Method                                                                           |
| ----------------- | -------------------------------------------------------------------------------- |
| Upgrade path      | Journal tags + table presence for each closeout migration                        |
| Rollback strategy | Forward-only SQL with `IF NOT EXISTS` / `EXCEPTION WHEN duplicate_object` on RLS |
| Data integrity    | Required SoR tables present through W010 administration                          |
| Performance       | Indexed tenant_id + scope keys                                                   |
| Tenant isolation  | RLS enabled + `app.tenant_id` policies                                           |
| Idempotency       | No duplicate drizzle journal hashes; DDL uses IF NOT EXISTS                      |

## Environment evidence log

| Environment                 | DATABASE target                                                                                      | Upgrade | Rollback (where supported) | Integrity | Tenant isolation | Idempotency | Perf | Result   | Evidence date | Operator    |
| --------------------------- | ---------------------------------------------------------------------------------------------------- | ------- | -------------------------- | --------- | ---------------- | ----------- | ---- | -------- | ------------- | ----------- |
| Development                 | APZHUB compose Postgres `:54334` / `apzhub`                                                          | PASS    | N/A (forward-only)         | PASS      | PASS             | PASS        | PASS | **PASS** | 2026-08-07    | Engineering |
| Test                        | `apzhub_test` on APZHUB Postgres                                                                     | PASS    | N/A                        | PASS      | PASS             | PASS        | PASS | **PASS** | 2026-08-07    | Engineering |
| Staging                     | `apzhub_staging` on APZHUB Postgres (schema target; staging app host not running per ENVIRONMENT.md) | PASS    | N/A                        | PASS      | PASS             | PASS        | PASS | **PASS** | 2026-08-07    | Engineering |
| Production / Prod-Readiness | `apzhub_prod_readiness` on APZHUB Postgres                                                           | PASS    | N/A                        | PASS      | PASS             | PASS        | PASS | **PASS** | 2026-08-07    | Engineering |

**Note:** Staging application host (`staging.apzportal.apzor.com` → `:3001`) remains NOT RUNNING per `ENVIRONMENT.md`. P4 verifies **migration/schema readiness** against dedicated database targets on the APZHUB Postgres instance — the authorised P4 gate. Application-host bring-up is a Hardening / ops concern, not a P4 schema blocker.

## How to run

```bash
pnpm exec vitest run packages/config/src/db/projects-migration-verification.test.ts
pnpm db:migrate
pnpm exec tsx -e "import { verifyProjectsMigrations } from '@apzhub/config'; verifyProjectsMigrations().then((r)=>console.log(JSON.stringify(r,null,2)))"
```

## Exit criteria (Owner)

Every supported environment shows **PASS** with recorded evidence → P4 **CLOSED**.
