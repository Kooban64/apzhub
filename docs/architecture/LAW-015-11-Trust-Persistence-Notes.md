# LAW-015-11 — Trust Persistence Notes

> PostgreSQL persistence for Trust Accounting (LAW-015-11)

---

## Repository mode

| Mode                        | Behaviour                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `memory` (default in tests) | In-memory repositories; unchanged from LAW-015-01–10                                    |
| `postgres`                  | `PostgresTrustStore` + postgres repository adapters via `createTrustRepositoryBundle()` |

Switch via `LAW_REPOSITORY_MODE`. Factory: `apps/law-platform/lib/persistence/trust-repository-factory.ts`.

---

## Schema layout

**Normalised ledger tables**

- `law_trust_account`
- `law_trust_transaction`
- `law_trust_journal_entry`
- `law_trust_balance`

**JSONB payload tables**

- `law_trust_transaction_draft`, `law_trust_transaction_audit`
- `law_trust_allocation`, `law_trust_transfer`
- `law_trust_approval_rule`, `law_trust_approval_request`
- `law_trust_approval_history` (append-only)
- `law_trust_interest_rule`, `law_trust_interest_posting`
- `law_trust_reconciliation_run`, `law_trust_report`

---

## Immutability rules

| Rule                         | Implementation                                                |
| ---------------------------- | ------------------------------------------------------------- |
| Immutable journals           | INSERT-only on `law_trust_journal_entry`                      |
| Append-only audit            | RLS INSERT-only on `law_trust_transaction_audit`              |
| Append-only approval history | RLS INSERT-only on `law_trust_approval_history`               |
| Reversal-only corrections    | Domain services post reversal transactions; no journal UPDATE |

---

## Tenant isolation

All tables include `tenant_id`. Repositories filter by tenant in application code; PostgreSQL RLS enforces `app.tenant_id` session variable (see RLS notes).

---

## Outbox

When `LAW_OUTBOX_ENABLED=true`, `PostgresTrustStore` writes rows to `law_outbox_event` with `aggregate_type = 'trust'` inside the same transaction as the mutating operation.

Helper: `createTrustOutboxDraft()` in `@apzhub/config`.

---

## Shared singletons

`getSharedTrustServiceBundle()` caches per-tenant bundles in postgres mode. Reset via `resetSharedTrustServiceBundle()` or `resetSharedLawRepositories()`.
