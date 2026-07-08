# LAW-012-06 — Invoice Persistence Notes

> **Story:** LAW-012-06 — Billing Persistence

---

## Tables

| Table                   | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `law_invoice`           | Invoice header (status, totals, placeholders, notes) |
| `law_invoice_line_item` | Child line items (time entry / expense references)   |

---

## Adapter layers

| Layer          | Path                                                             |
| -------------- | ---------------------------------------------------------------- |
| Config adapter | `packages/config/src/db/adapters/postgres-invoice-repository.ts` |
| App wrapper    | `apps/law-platform/lib/billing/postgres-invoice-repository.ts`   |
| In-memory      | `apps/law-platform/lib/billing/in-memory-invoice-repository.ts`  |
| Filters        | `apps/law-platform/lib/billing/invoice-repository-filters.ts`    |

---

## Behaviour

- **Create:** inserts header + line items in one transaction; emits `legal.invoice.created`.
- **Update:** replaces line items (delete + re-insert); detects status transitions for cancelled/paid outbox events.
- **List/get:** loads line items; filters via shared `matchesInvoiceCriteria`.
- **Relationships:** validates `clientId`, `matterId`, and `timeEntryId` (when present) within tenant.

---

## Status workflow

Persisted statuses match domain: `draft`, `issued`, `sent`, `partially_paid`, `paid`, `overdue`, `void`, `written_off`.

`InvoiceWorkflowService` behaviour unchanged:

- Create → `draft`
- Cancel → `void` (outbox: `legal.invoice.cancelled`)
- Mark paid → `paid` (outbox: `legal.invoice.paid`; no payment record)

---

## Factory

`getSharedInvoiceRepository()` seeds 22 invoices in postgres mode after clients, matters, and time entries are available.
