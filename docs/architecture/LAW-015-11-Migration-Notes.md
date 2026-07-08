# LAW-015-11 — Trust Migration Notes

---

## Migration tags

| Tag                  | File                                             | Purpose                   |
| -------------------- | ------------------------------------------------ | ------------------------- |
| `0009_law_trust`     | `packages/config/drizzle/0009_law_trust.sql`     | 16 trust tables + indexes |
| `0010_law_trust_rls` | `packages/config/drizzle/0010_law_trust_rls.sql` | RLS policies              |

---

## Apply migrations

```bash
pnpm --filter @apzhub/config exec drizzle-kit migrate
# or via app bootstrap:
# ensureLawMigrations() in integration tests
```

Verification: `verifyLawMigrations()` in `@apzhub/config` now requires tags `0009_law_trust` and `0010_law_trust_rls`.

---

## Truncate order (tests)

Trust child tables must be deleted before ledger parents. See `truncateLawTables()` in `apps/law-platform/lib/persistence/postgres-test-utils.ts`.

---

## Rollback

No automated down migration. Rollback requires manual DROP of `law_trust_*` tables in reverse dependency order if needed in development only.

---

## Coexistence

Trust tables use `law_trust_*` prefix alongside existing `law_client`, `law_invoice`, etc. No port or legacy stack conflicts.
