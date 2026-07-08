# LAW-015-13 — API Validation Matrix

> Trust REST API validation under `/api/law/v1/trust` (LAW-015-13)

---

## Legend

| Status | Meaning                                            |
| ------ | -------------------------------------------------- |
| ✅     | Validated in workflow or dedicated test            |
| ⚠️     | Validated with test harness helper (no REST route) |
| —      | Not in scope / not exposed                         |

---

## Route matrix

| Resource              | Method | Route                                    | Status | Test source                                  |
| --------------------- | ------ | ---------------------------------------- | ------ | -------------------------------------------- |
| Accounts              | GET    | `/trust/accounts`                        | ✅     | workflow + `trust-api.test.ts`               |
| Accounts              | POST   | `/trust/accounts`                        | ✅     | workflow                                     |
| Account detail        | GET    | `/trust/accounts/{id}`                   | ✅     | `trust-api.test.ts`                          |
| Transactions          | GET    | `/trust/transactions?trustAccountId=`    | ✅     | workflow                                     |
| Transactions          | POST   | `/trust/transactions` (draft)            | ✅     | workflow                                     |
| Post draft            | POST   | `/trust/transactions/{draftId}/post`     | ✅     | workflow                                     |
| Reverse               | POST   | `/trust/transactions/{id}/reverse`       | —      | Not in workflow (existing unit tests)        |
| Allocations           | GET    | `/trust/allocations`                     | ✅     | workflow                                     |
| Allocations           | POST   | —                                        | ⚠️     | Allocate via service bundle in workflow test |
| Reconciliation        | POST   | `/trust/reconciliation?trustAccountId=`  | ✅     | workflow                                     |
| Interest              | GET    | `/trust/interest?trustAccountId=`        | ✅     | workflow                                     |
| Interest              | POST   | `/trust/interest` (accrual)              | ✅     | workflow                                     |
| Interest rules        | POST   | —                                        | ⚠️     | Rule seeded via service bundle               |
| Transfers             | GET    | `/trust/transfers`                       | ✅     | workflow                                     |
| Transfers             | POST   | `/trust/transfers` (draft)               | ✅     | workflow                                     |
| Transfer approve/post | POST   | —                                        | —      | No dedicated REST routes                     |
| Approvals             | GET    | `/trust/approvals`                       | ✅     | workflow                                     |
| Approve               | POST   | `/trust/approvals/{id}/approve`          | —      | Covered in `trust-api.test.ts` patterns      |
| Reject                | POST   | `/trust/approvals/{id}/reject`           | —      | Unit tests                                   |
| Reports               | GET    | `/trust/reports`                         | ✅     | workflow                                     |
| Reports               | POST   | `/trust/reports`                         | ✅     | workflow                                     |
| Export CSV            | GET    | `/trust/reports/{id}/export?format=csv`  | ✅     | workflow + LAW-015-12 tests                  |
| Export HTML           | GET    | `/trust/reports/{id}/export?format=html` | ✅     | workflow                                     |
| Export PDF            | GET    | `format=pdf`                             | ✅     | 422 placeholder — LAW-015-12                 |
| Diagnostics           | GET    | `/trust/diagnostics`                     | ✅     | workflow                                     |

---

## Security validation (existing tests)

| Control                       | Test                |
| ----------------------------- | ------------------- |
| 401 unauthenticated           | `trust-api.test.ts` |
| 403 missing permission        | `trust-api.test.ts` |
| 404 unknown report            | `trust-api.test.ts` |
| Tenant isolation (export)     | `trust-api.test.ts` |
| 422 unsupported export format | `trust-api.test.ts` |

---

## Workflow test

**File:** `apps/web/lib/api/trust/trust-api-workflow-validation.test.ts`

Single integration test chains: account → draft → post → allocate (harness) → list transactions/allocations → reconciliation → interest rule (harness) → accrual → transfer draft → list transfers → approvals → report → export CSV/HTML → diagnostics.
