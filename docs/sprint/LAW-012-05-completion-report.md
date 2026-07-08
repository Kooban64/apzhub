# LAW-012-05 — Completion Report

> **Story:** LAW-012-05 — Calendar + Time Persistence  
> **Status:** **Complete**  
> **Date:** 2026-07-06  
> **Prerequisite:** [LAW-012-04](./LAW-012-04-completion-report.md)

---

## 1. Objective

Extend the hardened persistence foundation to **Calendar Events** and **Time Entries** using the proven Client/Matter/Document/Task pattern.

**Result:** Achieved. PostgreSQL adapters, schema, migrations, RLS, outbox, factory wiring, and tests delivered. Billing, invoices, Trust Accounting, APIs, external calendar sync, and file storage remain out of scope.

---

## 2. Deliverables

| Deliverable                                             | Status |
| ------------------------------------------------------- | ------ |
| Drizzle schema (`law_calendar_event`, `law_time_entry`) | ✅     |
| Migrations 0005/0006                                    | ✅     |
| PostgreSQL adapters + app wrappers                      | ✅     |
| Outbox (6 event types)                                  | ✅     |
| Repository factory wiring                               | ✅     |
| Session/persistence context binding                     | ✅     |
| Calendar persistence notes                              | ✅     |
| Time persistence notes                                  | ✅     |
| Migration + RLS notes                                   | ✅     |

---

## 3. Outbox events

| Event                      | Aggregate |
| -------------------------- | --------- |
| `legal.calendar.created`   | calendar  |
| `legal.calendar.updated`   | calendar  |
| `legal.calendar.cancelled` | calendar  |
| `legal.time.created`       | time      |
| `legal.time.updated`       | time      |
| `legal.time.deleted`       | time      |

---

## 4. Test report

| Metric                | After LAW-012-05                                   |
| --------------------- | -------------------------------------------------- |
| Test files            | **335**                                            |
| Tests passing         | **1526**                                           |
| Skipped               | **35** (postgres integration when DB unavailable)  |
| Pre-existing failures | **2** (env config in postgres factory smoke tests) |

### New tests

- `writable-calendar-event-repository.contract.test.ts`
- `writable-time-entry-repository.contract.test.ts`
- `postgres-calendar-event-repository.integration.test.ts`
- `postgres-time-entry-repository.integration.test.ts`
- `calendar-time-outbox-wiring.integration.test.ts`
- Extended `persistence-foundation.test.ts`

Existing calendar/time workflow integration tests pass in memory mode.

---

## 5. Technical debt

| ID     | Description                                                             | Priority |
| ------ | ----------------------------------------------------------------------- | -------- |
| TD-P02 | Auth has no real tenant claim                                           | High     |
| TD-P04 | `runSync()` sync bridge remains                                         | Medium   |
| TD-P14 | Time entry billing fields stored but not linked to invoices             | Medium   |
| TD-P15 | Calendar `timeEntryId` stored but not validated at adapter layer        | Low      |
| TD-P12 | Postgres factory smoke tests require full env when `DATABASE_URL` unset | Low      |

---

## 6. Recommendation for LAW-012-06

**Proposed scope: Billing persistence (Invoices only)**

Rationale:

1. Calendar and Time are now persisted — time entries carry `billingStatus`, `rate`, and `amount` ready for invoice linkage.
2. Invoice workflow and in-memory repository already exist (`InvoiceWorkflowService`, `SEED_INVOICES`).
3. Trust Accounting and external integrations remain deferred per stop conditions.

Suggested LAW-012-06 deliverables:

- `law_invoice` schema (+ line items if needed)
- PostgreSQL invoice adapter with matter/client relationships
- Outbox events for invoice mutations
- Defer Trust Accounting, APIs, external calendar sync, outbox workers

**Stop condition:** Await owner approval before LAW-012-06 execution.

---

## 7. Repository mode

Unchanged: `LAW_REPOSITORY_MODE=memory` (default) | `postgres` (opt-in).
