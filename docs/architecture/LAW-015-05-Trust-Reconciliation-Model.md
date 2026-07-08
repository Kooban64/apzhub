# LAW-015-05 — Trust Reconciliation Model

> **Story:** LAW-015-05  
> **Status:** Implemented — in-memory only  
> **Last updated:** 2026-07-06

---

## 1. Entity: TrustReconciliationRun

Immutable record capturing one reconciliation execution.

| Field                 | Type                    | Notes                               |
| --------------------- | ----------------------- | ----------------------------------- |
| `reconciliationId`    | string                  | Primary key                         |
| `tenantId`            | string                  | Tenant scope                        |
| `trustAccountId`      | string                  | Reconciled account                  |
| `startedAt`           | ISO datetime            | Run start                           |
| `completedAt`         | ISO datetime            | Run end                             |
| `durationMs`          | number                  | Elapsed time                        |
| `status`              | `completed` \| `failed` | Failed when error variances present |
| `totalTransactions`   | number                  | Ledger transaction count            |
| `totalAllocations`    | number                  | Allocation record count             |
| `balanceSummary`      | object                  | Ledger vs allocation totals         |
| `variances`           | array                   | Detected issues                     |
| `warningCount`        | number                  | Warning variances                   |
| `errorCount`          | number                  | Error variances                     |
| `diagnosticsSnapshot` | object                  | Session diagnostics at completion   |

Runs are append-only and frozen on persist.

---

## 2. Entity: TrustReconciliationVariance

| Field                | Type                               | Notes                      |
| -------------------- | ---------------------------------- | -------------------------- |
| `varianceId`         | string                             | Primary key                |
| `category`           | `balanced` \| `warning` \| `error` | Severity                   |
| `varianceType`       | enum                               | See below                  |
| `message`            | string                             | Human-readable description |
| `trustTransactionId` | string?                            | Related transaction        |
| `trustAllocationId`  | string?                            | Related allocation         |
| `clientId`           | string?                            | Related client             |
| `matterId`           | string?                            | Related matter             |
| `expectedAmount`     | number?                            | Expected value             |
| `actualAmount`       | number?                            | Actual value               |
| `details`            | object?                            | Additional context         |

### Variance types

| Type                    | Typical category         |
| ----------------------- | ------------------------ |
| `missing_allocation`    | warning                  |
| `over_allocation`       | error                    |
| `under_allocation`      | warning                  |
| `orphan_allocation`     | error                    |
| `imbalance`             | error                    |
| `duplicate_transaction` | error                    |
| `reversal_mismatch`     | warning / error          |
| `unknown`               | varies                   |
| `balanced`              | balanced (informational) |

---

## 3. Entity: TrustReconciliationResult

Wrapper returned by `runReconciliation`:

| Field | Type                                     |
| ----- | ---------------------------------------- |
| `ok`  | boolean — `true` when `errorCount === 0` |
| `run` | `TrustReconciliationRun`                 |

Warnings do not fail `ok`; errors do.

---

## 4. Balance summary

`TrustReconciliationBalanceSummary` compares:

| Field                          | Source                            |
| ------------------------------ | --------------------------------- |
| `ledgerAccountBalance`         | Journal — account scope           |
| `ledgerClientBalanceTotal`     | Journal — client liabilities      |
| `ledgerMatterBalanceTotal`     | Journal — matter liabilities      |
| `allocationClientBalanceTotal` | Signed allocation sums per client |
| `allocationMatterBalanceTotal` | Signed allocation sums per matter |
| `unallocatedBalance`           | Allocations typed `unallocated`   |
| `currency`                     | Trust account currency            |

---

## 5. Determinism

Checks sort transactions, allocations, and variances by id before processing and reporting. Repeat runs against unchanged data produce identical variance types and counts.

---

## 6. Immutability guarantees

- Reconciliation never calls ledger or allocation write methods
- Run records are deep-cloned and frozen on append
- Historical runs cannot be updated or deleted (in-memory store has no update API)
