# LAW-015-11 — Trust RLS Notes

---

## Policy model

All trust tables have RLS **ENABLED** and **FORCED**.

Default tenant isolation policy on most tables:

```sql
USING (tenant_id = current_setting('app.tenant_id', true))
WITH CHECK (tenant_id = current_setting('app.tenant_id', true))
```

Session variable `app.tenant_id` is set by `applyPostgresTenantSession()` before repository operations.

---

## Append-only policies

| Table                         | SELECT      | INSERT        | UPDATE | DELETE |
| ----------------------------- | ----------- | ------------- | ------ | ------ |
| `law_trust_transaction_audit` | tenant read | tenant insert | denied | denied |
| `law_trust_approval_history`  | tenant read | tenant insert | denied | denied |

Journal entries use full tenant isolation but domain layer treats them as insert-only.

---

## Verification

`verifyLawMigrations()` checks policies exist on:

- `law_trust_account`
- `law_trust_transaction`
- `law_trust_journal_entry`
- `law_trust_approval_history`

Integration test: `PostgresTrustLedgerRepository tenant isolation` in `postgres-trust-ledger-repository.integration.test.ts`.

---

## Testing without RLS bypass

Repositories never disable RLS. Tests use real tenant session binding through `createLawPersistenceContext({ tenantId, db })`.
