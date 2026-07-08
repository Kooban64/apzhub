# LAW-012-06 — Completion Report

> **Story:** LAW-012-06 — Billing Persistence  
> **Status:** **Complete**  
> **Date:** 2026-07-06  
> **Prerequisite:** [LAW-012-05](./LAW-012-05-completion-report.md)

---

## 1. Objective

Extend the hardened persistence foundation to **Invoices** (including line items) using the proven Client/Matter/Document/Task/Calendar/Time pattern.

**Result:** Achieved. PostgreSQL adapters, schema, migrations, RLS, outbox, factory wiring, contract/integration tests, and workflow compatibility delivered. Trust Accounting, payment records, APIs, PDF generation, tax engine, and outbox workers remain out of scope.

---

## 2. Deliverables

| Deliverable                                             | Status |
| ------------------------------------------------------- | ------ |
| Drizzle schema (`law_invoice`, `law_invoice_line_item`) | ✅     |
| Migrations 0007/0008                                    | ✅     |
| PostgreSQL adapter + app wrapper                        | ✅     |
| Invoice line item persistence (child table)             | ✅     |
| Relationship validation (client, matter, time entry)    | ✅     |
| Outbox (4 event types)                                  | ✅     |
| Repository factory wiring                               | ✅     |
| Session/persistence context binding                     | ✅     |
| Invoice persistence notes                               | ✅     |
| Invoice line item notes                                 | ✅     |
| Migration + RLS notes                                   | ✅     |

---

## 3. Outbox events

| Event                     | Aggregate | Trigger                         |
| ------------------------- | --------- | ------------------------------- |
| `legal.invoice.created`   | invoice   | `create()`                      |
| `legal.invoice.updated`   | invoice   | `update()` (general)            |
| `legal.invoice.cancelled` | invoice   | `update()` when status → `void` |
| `legal.invoice.paid`      | invoice   | `update()` when status → `paid` |

Workflow cancel sets `invoiceStatus: "void"`; adapter maps that transition to `legal.invoice.cancelled`. Mark paid remains status-only (no payment entity).

---

## 4. Test report

| Metric                | After LAW-012-06                                   |
| --------------------- | -------------------------------------------------- |
| Test files            | **338**                                            |
| Tests passing         | **1536**                                           |
| Skipped               | **42** (postgres integration when DB unavailable)  |
| Pre-existing failures | **2** (env config in postgres factory smoke tests) |

### New tests

- `writable-invoice-repository.contract.test.ts` (memory + postgres registration)
- `postgres-invoice-repository.integration.test.ts` (contract, tenant isolation, relationship validation)
- `invoice-outbox-wiring.integration.test.ts`
- Extended `persistence-foundation.test.ts`

Existing `invoice-workflow.integration.test.ts` and `in-memory-invoice-repository.test.ts` pass unchanged in memory mode.

---

## 5. Technical debt

| ID     | Description                                                                               | Priority |
| ------ | ----------------------------------------------------------------------------------------- | -------- |
| TD-P02 | Auth has no real tenant claim                                                             | High     |
| TD-P04 | `runSync()` sync bridge remains                                                           | Medium   |
| TD-P16 | Expense/disbursement placeholders stored on header only; no expense/disbursement entities | Medium   |
| TD-P17 | Invoice `issued`/`sent` transitions not distinguished in outbox (both emit `updated`)     | Low      |
| TD-P12 | Postgres factory smoke tests require full env when `DATABASE_URL` unset                   | Low      |

---

## 6. Recommendation for LAW-012-07

**Proposed scope: Trust Accounting persistence (trust ledger + matter trust balances)**

Rationale:

1. Invoices are now persisted with client/matter/time-entry relationships and status workflow.
2. Domain already includes `trustAppliedAmount` on invoices — ready for trust ledger linkage.
3. Payment gateway, APIs, PDF, tax engine, and outbox workers remain deferred per stop conditions.

Suggested LAW-012-07 deliverables:

- `law_trust_account` / `law_trust_transaction` schema
- PostgreSQL trust repository with matter/client scoping
- Outbox events for trust mutations
- Defer payment gateway, APIs, accounting integration, outbox workers

**Stop condition:** Await owner approval before LAW-012-07 execution.

---

## 7. Repository mode

Unchanged: `LAW_REPOSITORY_MODE=memory` (default) | `postgres` (opt-in).
