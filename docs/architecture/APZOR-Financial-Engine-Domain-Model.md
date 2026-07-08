# APZOR Financial Engine — Domain Model

> **Story:** FIN-001 — Architecture extraction (planning only)  
> **Status:** **Canonical generic domain** — proposed, not implemented  
> **Derived from:** LAW-015-02 through LAW-015-08 trust implementation  
> **Last updated:** 2026-07-07

---

## 1. Purpose

Define the canonical **product-neutral** financial domain for the APZOR Financial Engine. This model generalises concepts currently named `Trust*` in the Law Platform implementation.

**No TypeScript types, database schema, or API DTOs in this document.**

---

## 2. Bounded context

```text
┌──────────────────────────────────────────────────────────────┐
│              APZOR Financial Engine Context                   │
│  FinancialAccount · Journal · Transaction · Allocation …     │
└───────────────────────────┬──────────────────────────────────┘
                            │ references (IDs only)
┌───────────────────────────▼──────────────────────────────────┐
│              Product Domain Context                           │
│  Law: Client · Matter · Invoice                              │
│  Bank: Customer · Account · Payment                          │
│  Exchange: User · TradingPair · Order                        │
└──────────────────────────────────────────────────────────────┘
```

The Financial Engine **references** product entities by opaque IDs. It does not embed product state.

---

## 3. Entity catalogue

| Entity               |  Aggregate root?  | Engine module      |
| -------------------- | :---------------: | ------------------ |
| Financial Account    |        ✅         | Ledger             |
| Journal              | — (logical view)  | Ledger             |
| Journal Entry        |        ✅         | Ledger             |
| Posting              | — (value object)  | Ledger             |
| Transaction          |        ✅         | Ledger / Workflow  |
| Transaction Draft    |        ✅         | Workflow           |
| Allocation           |        ✅         | Allocation         |
| Balance (projection) |  — (read model)   | Ledger             |
| Interest Rule        |        ✅         | Interest           |
| Interest Posting     |        ✅         | Interest           |
| Transfer             |        ✅         | Transfer           |
| Reconciliation Run   |        ✅         | Reconciliation     |
| Financial Report     |        ✅         | Reporting          |
| Audit Record         |  — (append-only)  | Workflow           |
| Currency             | — (value object)  | Ledger             |
| Reference            | — (value object)  | Ledger             |
| Accounting Period    |        ✅         | Reporting / Policy |
| Posting Rule         | — (configuration) | Ledger             |
| Journal Rule         | — (configuration) | Ledger             |

---

## 4. Core entities

### 4.1 Financial Account

| Attribute          | Definition                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **Definition**     | A tenant-scoped monetary account whose movements are recorded in the engine ledger.                  |
| **Identity**       | `financialAccountId`, `accountCode`                                                                  |
| **Key attributes** | `tenantId`, `name`, `currency`, `accountType`, `status`, `openedAt`, `closedAt?`, `policyProfileId?` |
| **Relationships**  | 1 → n Journal Entries; 1 → n Transactions                                                            |
| **Immutability**   | Opening metadata immutable after first post                                                          |

_Law mapping:_ `TrustAccount` — adds institution, masked account number, LPC registration.

### 4.2 Journal (logical)

| Attribute      | Definition                                                               |
| -------------- | ------------------------------------------------------------------------ |
| **Definition** | Ordered append-only sequence of journal entries for a financial account. |
| **Levels**     | Tenant → Financial Account → optional dimension slices                   |

### 4.3 Journal Entry

| Attribute          | Definition                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Definition**     | Immutable double-entry record with balanced debit and credit postings.                                                    |
| **Identity**       | `journalEntryId`, `journalReference`                                                                                      |
| **Key attributes** | `financialAccountId`, `entryDate`, `postedAt`, `postedByUserId`, `transactionId`, `reversesEntryId?`, `status`, `lines[]` |
| **Immutability**   | **Fully immutable after post**                                                                                            |
| **Lifecycle**      | Created at post → marked reversed when reversal entry posted                                                              |

### 4.4 Posting

| Attribute          | Definition                                                                            |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Definition**     | Single debit or credit line within a journal entry.                                   |
| **Key attributes** | `accountCode`, `direction` (`debit` \| `credit`), `amount`, `currency`, `dimensions?` |
| **Dimensions**     | Opaque key-value pairs (e.g. `{ segment: "client", id: "..." }`) — product-defined    |

_Law mapping:_ `TrustPosting` with `clientId`, `matterId` as fixed dimensions.

### 4.5 Transaction

| Attribute          | Definition                                                                                                                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**     | Business record of a financial movement that generates journal entry(ies).                                                                                                                                              |
| **Identity**       | `transactionId`, `transactionReference`                                                                                                                                                                                 |
| **Key attributes** | `financialAccountId`, `transactionType`, `amount`, `currency`, `transactionDate`, `postingDate`, `dimensions`, `narrative`, `status`, `journalEntryIds[]`, `reversesTransactionId?`, `idempotencyKey?`, `externalRefs?` |
| **Types (core)**   | `opening_balance`, `deposit`, `withdrawal`, `adjustment`, `reversal`, `interest`, `transfer_out`, `transfer_in`                                                                                                         |
| **Immutability**   | Draft mutable; **posted immutable**                                                                                                                                                                                     |

### 4.6 Allocation

| Attribute          | Definition                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**     | Append-only sub-ledger record attributing a posted transaction amount to dimensional slices.                                              |
| **Identity**       | `allocationId`                                                                                                                            |
| **Key attributes** | `transactionId`, `allocationType`, `effect` (`increase` \| `decrease`), `amount`, `dimensions`, `allocationDate`, `reversesAllocationId?` |
| **Immutability**   | **Append-only** — corrections via reversal allocations                                                                                    |

_Law mapping:_ `TrustAllocation` with client/matter dimensions and types (`client`, `matter`, `unallocated`).

### 4.7 Balance (projection)

| Attribute      | Definition                                                      |
| -------------- | --------------------------------------------------------------- |
| **Definition** | Derived monetary total from journal entries and/or allocations. |
| **Scopes**     | `account`, `dimension` (product-defined composite key)          |
| **Rule**       | Journal is authoritative; balance cache is disposable           |

### 4.8 Interest Rule

| Attribute          | Definition                                                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Definition**     | Versioned policy for accrual calculation on principal balances.                                                                                                        |
| **Key attributes** | `interestRuleId`, `financialAccountId`, `accrualMethod`, `annualRatePercent`, `postingFrequency`, `minimumBalance`, `effectiveFrom`, `effectiveTo?`, `policyProfileId` |

### 4.9 Interest Posting

| Attribute          | Definition                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **Definition**     | Batch accrual result pending or completed ledger post.                                      |
| **Workflow**       | `draft` → `approved` → `posted`                                                             |
| **Key attributes** | `interestPostingId`, `periodStart`, `periodEnd`, `totalInterestAmount`, `lines[]`, `status` |

### 4.10 Transfer

| Attribute          | Definition                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Definition**     | Controlled movement between accounts and/or dimensional endpoints.                                         |
| **Workflow**       | `draft` → `approved` → `posted` → optional `reversed`                                                      |
| **Key attributes** | `transferId`, `transferType`, source/destination accounts and dimensions, `amount`, paired transaction IDs |

_Law mapping:_ `matter_to_matter`, `client_to_client`, etc. become product-defined transfer types.

### 4.11 Reconciliation Run

| Attribute          | Definition                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Definition**     | Immutable record of an internal control check comparing ledger to sub-ledger.                                                                          |
| **Key attributes** | `reconciliationId`, `status`, `startedAt`, `completedAt`, `balanceSummary`, `variances[]`                                                              |
| **Variance types** | `missing_allocation`, `over_allocation`, `under_allocation`, `orphan_allocation`, `imbalance`, `duplicate_transaction`, `reversal_mismatch`, `unknown` |

### 4.12 Financial Report

| Attribute          | Definition                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Definition**     | Immutable read-only projection generated from accounting services.                                                                                     |
| **Key attributes** | `reportId`, `reportType`, `tenantId`, `financialAccountId`, `generatedAt`, `generatedByUserId`, `reportingPeriod`, `sourceCounts`, `totals`, `payload` |

### 4.13 Audit Record

| Attribute          | Definition                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **Definition**     | Append-only workflow audit entry.                                                           |
| **Key attributes** | `auditRecordId`, `action`, `entityType`, `entityId`, `actorUserId`, `occurredAt`, `details` |

### 4.14 Currency

| Attribute      | Definition                                                                         |
| -------------- | ---------------------------------------------------------------------------------- |
| **Definition** | ISO 4217 code; all amounts within a transaction/posting share one currency.        |
| **Rule**       | Cross-currency transfers require product-level exchange handling outside core post |

### 4.15 Reference

| Attribute      | Definition                                                                |
| -------------- | ------------------------------------------------------------------------- |
| **Definition** | Human-readable sequential identifier (`TRX-2026-00001`, `JE-2026-00001`). |
| **Generator**  | Tenant-scoped, type-prefixed, year-sequence                               |

### 4.16 Accounting Period

| Attribute          | Definition                                                                       |
| ------------------ | -------------------------------------------------------------------------------- |
| **Definition**     | Bounded date range for reporting and optional period-close gates.                |
| **Key attributes** | `periodId`, `start`, `end`, `status` (`open` \| `closed`), `financialAccountId?` |

_Law mapping:_ `TrustReportingPeriod` — close gates and LPC export profiles are product policy.

### 4.17 Posting Rule

| Attribute      | Definition                                                               |
| -------------- | ------------------------------------------------------------------------ |
| **Definition** | Configuration mapping transaction type → debit/credit posting template.  |
| **Example**    | `deposit` → debit `CASH`, credit `LIABILITY` with transaction dimensions |

### 4.18 Journal Rule

| Attribute      | Definition                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------- |
| **Definition** | Invariant rules enforced on every journal entry.                                            |
| **Rules**      | Balanced entries; append-only; reversal-only correction; tenant scope; currency consistency |

---

## 5. Aggregate roots and relationships

```text
FinancialAccount (1)
  └── JournalEntry (n) ── contains ── Posting (n)
  └── Transaction (n) ── generates ── JournalEntry
        └── Allocation (n) [sub-ledger]
  └── ReconciliationRun (n)
  └── InterestRule (n) ── produces ── InterestPosting (n)
  └── Transfer (n) ── generates ── Transaction (2: out/in)
  └── FinancialReport (n) [read model]

TransactionDraft (1) ── posts to ── Transaction
AuditRecord (n) ── references ── TransactionDraft | Transaction
AccountingPeriod (1) ── bounds ── FinancialReport
```

---

## 6. Lifecycles

### 6.1 Transaction

```text
draft → validated → posted
                 ↘ rejected / cancelled
posted → reversed (new reversal transaction + inverted journal)
```

### 6.2 Transfer / Interest posting

```text
draft → approved → posted
                 ↘ cancelled (draft only)
posted → reversed
```

### 6.3 Reconciliation

```text
started → completed | failed
(immutable result stored)
```

### 6.4 Report

```text
generated (immutable, append-only store)
```

---

## 7. Immutability rules

| Entity             | Rule                                    |
| ------------------ | --------------------------------------- |
| Journal Entry      | Immutable after post; reversal only     |
| Posting            | Immutable (part of journal entry)       |
| Posted Transaction | Amounts, dates, accounts immutable      |
| Allocation         | Append-only; reverse via new allocation |
| Reconciliation Run | Immutable once completed                |
| Financial Report   | Immutable on generation                 |
| Audit Record       | Append-only                             |
| Balance projection | Recomputable; not authoritative         |

---

## 8. Mapping from Law Platform (current implementation)

| Law Platform (`Trust*`)              | Financial Engine (proposed)                     |
| ------------------------------------ | ----------------------------------------------- |
| `TrustAccount`                       | `FinancialAccount` + Law adapter metadata       |
| `TrustJournal` / `TrustJournalEntry` | `Journal` / `JournalEntry`                      |
| `TrustPosting`                       | `Posting` + `{ clientId, matterId }` dimensions |
| `TrustTransaction`                   | `Transaction`                                   |
| `TrustAllocation`                    | `Allocation`                                    |
| `TrustBalance`                       | `Balance`                                       |
| `TrustInterestRule`                  | `InterestRule`                                  |
| `TrustInterestPosting`               | `InterestPosting`                               |
| `TrustTransfer`                      | `Transfer`                                      |
| `TrustReconciliationRun`             | `ReconciliationRun`                             |
| `TrustReport`                        | `FinancialReport`                               |
| `TrustTransactionAuditRecord`        | `AuditRecord`                                   |
| `TRUST-*` chart codes                | Product chart via `PostingRule`                 |
| `complianceProfileId`                | `policyProfileId` (product policy)              |

---

## 9. Event catalogue (proposed generic)

| Event                                | When                          |
| ------------------------------------ | ----------------------------- |
| `financial.account.opened`           | Account opened                |
| `financial.transaction.posted`       | Transaction posted to journal |
| `financial.transaction.reversed`     | Reversal posted               |
| `financial.allocation.created`       | Allocation recorded           |
| `financial.reconciliation.completed` | Reconciliation run finished   |
| `financial.interest.posted`          | Interest posted to ledger     |
| `financial.transfer.posted`          | Transfer posted               |
| `financial.report.generated`         | Report generated              |

Products map to product-specific events (e.g. `legal.trust.transaction.posted`).
