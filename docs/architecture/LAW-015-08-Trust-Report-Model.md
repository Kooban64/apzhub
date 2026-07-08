# LAW-015-08 — Trust Report Model

> **Story:** LAW-015-08  
> **Status:** Implemented — in-memory only  
> **Last updated:** 2026-07-07

---

## 1. Entity: TrustReport

Immutable generated report read model.

| Field               | Type                | Notes                                |
| ------------------- | ------------------- | ------------------------------------ |
| `reportId`          | string              | Primary key (`rpt-*`)                |
| `reportType`        | enum                | One of 10 report types               |
| `tenantId`          | string              | Tenant scope                         |
| `trustAccountId`    | string              | Account scope                        |
| `generatedAt`       | ISO datetime        | Generation timestamp                 |
| `generatedByUserId` | string              | Actor who requested generation       |
| `reportingPeriod`   | `{ start?, end? }`  | Optional date bounds                 |
| `sourceCounts`      | object              | Counts of source records consumed    |
| `totals`            | object              | Aggregated totals for the report     |
| `diagnostics`       | object              | `generationDurationMs`, `warnings[]` |
| `payload`           | discriminated union | Type-specific report body            |

Object-frozen on creation. Stored append-only in `InMemoryTrustReportRepository`.

---

## 2. Report type payloads

| `reportType`             | `payload.kind`           | Key fields                                                 |
| ------------------------ | ------------------------ | ---------------------------------------------------------- |
| `trial_balance`          | `trial_balance`          | `lines[]` with scope, clientId, matterId, balanceAmount    |
| `ledger`                 | `ledger`                 | `ledger.openedAt`, `entryCount`, `transactionCount`        |
| `journal`                | `journal`                | `lines[]` with journal entry metadata                      |
| `transactions`           | `transactions`           | `lines[]` with transaction detail                          |
| `client_statement`       | `client_statement`       | `clientId`, opening/closing balance, `lines[]`             |
| `matter_statement`       | `matter_statement`       | `clientId`, `matterId`, opening/closing balance, `lines[]` |
| `allocation_summary`     | `allocation_summary`     | `lines[]` with allocation detail                           |
| `interest_summary`       | `interest_summary`       | `lines[]` with interest posting summary                    |
| `transfer_summary`       | `transfer_summary`       | `lines[]` with transfer summary                            |
| `reconciliation_summary` | `reconciliation_summary` | `lines[]` with reconciliation run summary                  |

---

## 3. Source counts

| Field                | Source service                  |
| -------------------- | ------------------------------- |
| `accounts`           | TrustLedgerService              |
| `journalEntries`     | TrustLedgerService              |
| `transactions`       | TrustLedgerService              |
| `allocations`        | TrustAllocationService          |
| `interestPostings`   | TrustInterestService            |
| `transfers`          | TrustTransferService            |
| `reconciliationRuns` | TrustReconciliationService      |
| `auditRecords`       | TrustTransactionWorkflowService |

---

## 4. Totals

| Field                        | Applies to             |
| ---------------------------- | ---------------------- |
| `debitTotal` / `creditTotal` | Journal reports        |
| `transactionAmountTotal`     | Transactions           |
| `allocationAmountTotal`      | Allocation summary     |
| `interestAmountTotal`        | Interest summary       |
| `transferAmountTotal`        | Transfer summary       |
| `varianceCount`              | Reconciliation summary |

Totals are derived from source data already computed by accounting services — not recalculated independently.

---

## 5. Input: GenerateTrustReportInput

| Field               | Required | Notes                                 |
| ------------------- | :------: | ------------------------------------- |
| `tenantId`          |    ✅    | Tenant scope                          |
| `trustAccountId`    |    ✅    | Account scope                         |
| `reportType`        |    ✅    | Report catalogue entry                |
| `generatedByUserId` |    ✅    | Audit actor                           |
| `reportingPeriod`   |    —     | Optional `{ start, end }` date filter |
| `clientId`          |    —     | Required for client/matter statements |
| `matterId`          |    —     | Required for matter statement         |

---

## 6. Repository contract

`TrustReportRepository`:

- `save(report)` — append immutable report
- `get(tenantId, reportId)` — tenant-scoped lookup
- `list(criteria)` — filter by tenant, account, report type

`InMemoryTrustReportRepository` freezes reports on save.

---

## 7. Immutability guarantees

- Reports are read-only projections — generation never writes to ledger, allocations, or workflow stores
- Stored reports are `Object.freeze`d
- Regeneration with identical inputs produces identical payloads (deterministic builders)
- New generation creates a new `reportId` — prior reports are not overwritten

---

## 8. Error codes

| Code                                  | Meaning                           |
| ------------------------------------- | --------------------------------- |
| `TRUST_REPORTING_INVALID_REPORT_TYPE` | Unknown report type               |
| `TRUST_REPORTING_INVALID_PERIOD`      | Period start after end            |
| `TRUST_REPORTING_ACCOUNT_NOT_FOUND`   | Account missing or wrong tenant   |
| `TRUST_REPORTING_TENANT_MISMATCH`     | Tenant scope violation            |
| `TRUST_REPORTING_CLIENT_REQUIRED`     | Client statement missing clientId |
| `TRUST_REPORTING_MATTER_REQUIRED`     | Matter statement missing matterId |
