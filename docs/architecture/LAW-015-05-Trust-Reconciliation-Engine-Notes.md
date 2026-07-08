# LAW-015-05 — Trust Reconciliation Engine Notes

> **Story:** LAW-015-05  
> **Status:** Implemented — in-memory only  
> **Authority:** [LAW-015-04 Trust Allocation Notes](./LAW-015-04-Trust-Allocation-Notes.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

Read-only reconciliation engine validating integrity between `TrustLedgerService` (accounting authority) and `TrustAllocationService` (operational buckets).

**The reconciliation engine never mutates ledger or allocation data.** It detects, records, and reports variances only.

---

## 2. Package location

```text
apps/law-platform/lib/trust/
  trust-reconciliation-types.ts
  trust-reconciliation-errors.ts
  trust-reconciliation-repository.ts
  in-memory-trust-reconciliation-repository.ts
  trust-reconciliation-engine.ts       # pure read-only checks
  trust-reconciliation-events.ts
  trust-reconciliation-diagnostics.ts
  trust-reconciliation-service.ts
  trust-reconciliation.test.ts
```

---

## 3. Layering

```text
TrustReconciliationService        ← LAW-015-05 (read-only)
  ↓ reads (never writes)
TrustAllocationService            ← LAW-015-04
TrustLedgerService                ← LAW-015-02 (authority)
```

---

## 4. Reconciliation flow

```text
Trust Ledger → Trust Allocations → Computed Balances → Expected Balances → Variances
```

Each run produces an immutable `TrustReconciliationRun` with balance summary, variance list, and diagnostics snapshot.

---

## 5. Checks implemented

| Check                             | Variance type                                               |
| --------------------------------- | ----------------------------------------------------------- |
| Journal integrity                 | `imbalance`                                                 |
| Debit/credit balancing            | `imbalance`                                                 |
| Allocation totals per transaction | `missing_allocation`, `over_allocation`, `under_allocation` |
| Client balance totals             | `under_allocation` (warning)                                |
| Matter balance totals             | `under_allocation` (warning)                                |
| Unallocated balance               | included in summary                                         |
| Duplicate transactions            | `duplicate_transaction`                                     |
| Orphan allocations                | `orphan_allocation`                                         |
| Missing transactions              | `orphan_allocation`                                         |
| Reversal integrity                | `reversal_mismatch`                                         |
| Tenant isolation                  | `unknown` (error)                                           |
| Fully balanced                    | `balanced`                                                  |

---

## 6. Variance categories

| Category   | Meaning                                                     |
| ---------- | ----------------------------------------------------------- |
| `balanced` | No issues detected                                          |
| `warning`  | Non-blocking variance (e.g. missing/partial allocation)     |
| `error`    | Blocking variance (e.g. over-allocation, orphan, imbalance) |

---

## 7. Operations

| Method                  | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `runReconciliation`     | Execute read-only checks and append immutable run |
| `getRun`                | Fetch run by id                                   |
| `listRuns`              | Query run history                                 |
| `getAccountSummaries`   | Per-account run statistics                        |
| `getDiagnosticsSummary` | Session diagnostics                               |

---

## 8. In-memory events

| Event                                  | When                                           |
| -------------------------------------- | ---------------------------------------------- |
| `legal.trust.reconciliation.started`   | Run begins                                     |
| `legal.trust.reconciliation.completed` | Run finished with no errors                    |
| `legal.trust.reconciliation.failed`    | Run finished with errors or validation failure |

No outbox.

---

## 9. Out of scope (LAW-015-05)

UI, APIs, persistence, interest, reporting, bank import, automated corrections.

---

## 10. Next story

See [LAW-015-05 completion report](../sprint/LAW-015-05-completion-report.md) for LAW-015-06 recommendation (Trust Interest).
