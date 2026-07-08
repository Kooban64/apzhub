# LAW-015-11 — Trust API Notes

> REST API surface under `/api/law/v1/trust` (LAW-015-11)

---

## Framework integration

Trust routes use the standard Law API stack:

- `withLawApiAuth` — session, tenant binding, permission checks
- `createLawApiController` — correlation IDs, error envelopes
- `createWorkflowRunner` / `withTrustServiceBundle` — tenant-scoped persistence
- Standard pagination envelope (`limit`, `hasMore`, `nextCursor`, `totalCount`)

Implementation: `apps/web/lib/api/trust/`.

---

## Permissions

| Permission              | Operations                                                 |
| ----------------------- | ---------------------------------------------------------- |
| `legal.trust.view`      | List/read accounts, transactions, allocations, diagnostics |
| `legal.trust.manage`    | Create accounts, drafts, approve/reject                    |
| `legal.trust.post`      | Post transaction drafts                                    |
| `legal.trust.reverse`   | Request reversals                                          |
| `legal.trust.transfer`  | Create transfer drafts                                     |
| `legal.trust.reconcile` | Run reconciliation                                         |
| `legal.trust.interest`  | Run interest accrual                                       |
| `legal.trust.report`    | Generate report metadata                                   |

Catalogue: [LAW-Trust-Permissions](../specs/LAW-Trust-Permissions.md).

---

## Key endpoints

### Accounts

- `GET /accounts` — paginated list
- `POST /accounts` — open account (`name`, `currency` required)
- `GET /accounts/{trustAccountId}` — detail with balances

### Transactions

- `GET /transactions?trustAccountId=` — list posted transactions
- `POST /transactions` — create draft
- `POST /transactions/{draftId}/post` — validate + post
- `POST /transactions/{trustTransactionId}/reverse` — request reversal draft

### Operational

- `GET /allocations?trustAccountId=&trustTransactionId=`
- `POST /reconciliation?trustAccountId=`
- `GET /interest`, `POST /interest` (accrual)
- `GET /transfers`, `POST /transfers`
- `GET /approvals`, `POST /approvals/{id}/approve|reject`
- `GET /reports`, `POST /reports` (metadata only — no export rendering)
- `GET /diagnostics`

---

## Memory vs postgres

API handlers are repository-mode agnostic. Tests run in memory mode by default. Integration tests exercise postgres when `DATABASE_URL` is available.

---

## Not in scope (LAW-015-11)

- File/PDF/Excel exports
- Bank feeds or payment gateways
- Workbench UI rewiring to API-backed data (still uses in-process workbench singleton)
- OpenAPI path registration (follow-up)
