# LAW — Trust Accounting Specification

> **Milestone:** LAW-015 — Trust Accounting  
> **Story:** LAW-015-01 (planning authority)  
> **Status:** **Specification** — no implementation  
> **Authority:** [LAW-Trust-Accounting-Reference-Architecture](../architecture/LAW-Trust-Accounting-Reference-Architecture.md) · [LAW-Trust-Domain-Model](../architecture/LAW-Trust-Domain-Model.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

Technical specification for Trust Accounting behaviour, posting rules, compliance profiles, workflow contracts, and quality attributes. Implementation stories (LAW-015-02+) must conform to this document.

---

## 2. Scope

| In scope                                | Out of scope (LAW-015-01)      |
| --------------------------------------- | ------------------------------ |
| Ledger semantics and posting rules      | Database schema and migrations |
| Workflow service contracts (conceptual) | Repository implementations     |
| Compliance profile schema               | Interest calculations          |
| Balance projection rules                | REST route handlers            |
| Reconciliation algorithm (conceptual)   | UI components                  |
| Idempotency and concurrency             | Reconciliation execution       |

---

## 3. Subsystem requirements

### 3.1 Trust Ledger Engine (LAW-015-02)

The ledger engine MUST:

1. Accept a **PostTrustTransactionCommand** and produce balanced journal entry lines.
2. Reject unbalanced entries with domain error `TRUST_JOURNAL_UNBALANCED`.
3. Assign monotonic `journalReference` per tenant per year.
4. Update balance projections atomically in the same persistence transaction as journal insert.
5. Emit outbox event after successful commit.
6. Support **rebuild balances from journal** for operator recovery (maintenance command).

The ledger engine MUST NOT:

- UPDATE or DELETE posted journal rows.
- Post to closed reporting periods without `legal.trust.period.override`.

### 3.2 Trust Transactions (LAW-015-03)

Supported transaction types and required fields:

| Type               | clientId |  matterId   | Dual auth | Notes                               |
| ------------------ | :------: | :---------: | :-------: | ----------------------------------- |
| `deposit`          |    ✅    |  Optional   |    No     | Trust Receipt workflow              |
| `withdrawal`       |    ✅    |  Optional   |  Profile  | Trust Payment workflow              |
| `transfer_in`      |    ✅    |  Optional   |    Yes    | Paired with `transfer_out`          |
| `transfer_out`     |    ✅    |  Optional   |    Yes    | Paired with `transfer_in`           |
| `fee_transfer`     |    ✅    |  Optional   |    Yes    | Trust → business; segregation check |
| `adjustment`       |    ✅    |  Optional   |    Yes    | Elevated permission                 |
| `interest_posting` |    ✅    |  Per line   |    Yes    | Batch lines per client/matter       |
| `reversal`         |    ✅    | As original |    Yes    | References `reversesTransactionId`  |

### 3.3 Allocations (LAW-015-04)

On post:

1. Create `TrustAllocation` rows summing to transaction amount (single or split across matters).
2. Update matter trust balance projection.
3. Reject allocation if matter is closed (configurable profile flag).

Unallocated client pool: `matterId` null with `clientId` set.

### 3.4 Reconciliation (LAW-015-05)

Three-way reconciliation algorithm (conceptual):

```text
1. Capture bankStatementBalance (manual entry or import — future)
2. Compute ledgerBalance = Σ journal net for account to date
3. Compute allocationSum = Σ matter + unallocated client balances
4. variance = bankStatementBalance - ledgerBalance
5. allocationVariance = ledgerBalance - allocationSum
6. If variance ≠ 0 OR allocationVariance ≠ 0 → create reconciliation items
7. User resolves items (adjustment, missing transaction, bank fee)
8. On zero unexplained variance → status = completed, snapshot locked
```

### 3.5 Interest (LAW-015-06)

- Accrual job produces **draft** interest postings.
- Approval action transitions to postable state.
- `strategyRef` on `TrustInterestRule` resolves calculation plugin — **not implemented in planning**.
- Profile `ZA-LPC` declares minimum posting frequency and client credit requirement.

### 3.6 Transfers (LAW-015-07)

Inter-account transfer MUST:

- Post `transfer_out` and `transfer_in` in single database transaction.
- Share `pairedTransactionId`.
- Validate both accounts active and same currency (unless profile allows FX transfer metadata).

Trust-to-business (`fee_transfer`) MUST:

- Debit trust liability, credit business revenue/clearing per chart mapping.
- Require `legal.trust.transfer.business` permission.

---

## 4. Chart of accounts (trust)

Conceptual account codes — implementation in LAW-015-02:

| Code                      | Name                     | Type            |
| ------------------------- | ------------------------ | --------------- |
| `TRUST-CASH`              | Trust bank account       | Asset           |
| `TRUST-LIABILITY-CLIENT`  | Client funds held        | Liability       |
| `TRUST-LIABILITY-MATTER`  | Matter allocated funds   | Liability (sub) |
| `TRUST-INTEREST-EXPENSE`  | Interest paid to clients | Expense         |
| `TRUST-INTEREST-CLEARING` | Interest clearing        | Liability       |
| `TRUST-VARIANCE`          | Reconciliation variance  | Temporary       |

Business ledger accounts are **out of scope** for trust engine except as transfer targets.

---

## 5. Compliance profiles

### 5.1 Profile schema

```yaml
complianceProfileId: string # e.g. ZA-LPC
jurisdiction: string # ISO 3166-1 alpha-2
label: string
rules:
  requireMatterForTypes: string[] # transaction types
  dualAuthorisationTypes: string[]
  reconciliationFrequency: monthly | weekly
  threeWayReconciliation: boolean
  interestPostingRequired: boolean
  statementRequired: boolean
  referenceNumberFormats: object
  retentionYears: number
  exportFormats: string[] # csv, pdf
```

### 5.2 Default profile: ZA-LPC

| Rule                     | Value                                           |
| ------------------------ | ----------------------------------------------- |
| Jurisdiction             | South Africa                                    |
| Three-way reconciliation | Required                                        |
| Matter segregation       | Required for conveyancing matters (matter flag) |
| Interest                 | Profile-driven; strategy external               |
| Statements               | Required on request                             |
| Retention                | 7 years (conceptual — firm policy)              |

**No calculations encoded** — profile declares obligations only.

---

## 6. Workflow service contracts (conceptual)

Future services in `apps/law-platform` or `services/legal-trust/`:

| Service                              | Responsibilities                          |
| ------------------------------------ | ----------------------------------------- |
| `TrustAccountWorkflowService`        | CRUD trust accounts; open/close lifecycle |
| `TrustTransactionWorkflowService`    | Draft, post, reverse transactions         |
| `TrustAllocationWorkflowService`     | Split allocations; matter balance queries |
| `TrustReconciliationWorkflowService` | Open, resolve, complete reconciliations   |
| `TrustInterestWorkflowService`       | Accrual schedule, approve, post interest  |
| `TrustReportingWorkflowService`      | Periods, statements, exports              |
| `TrustLedgerService`                 | Journal post, balance project, rebuild    |

All services receive `LawPersistenceContext` with `tenantId` and honour repository mode (memory | postgres).

---

## 7. Concurrency and idempotency

| Concern                | Rule                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Optimistic concurrency | Trust Account and draft Transaction carry `version` / ETag                                    |
| Post idempotency       | `Idempotency-Key` header or body `idempotencyKey` — duplicate returns same posted transaction |
| Balance updates        | Row-level lock on balance projection during post                                              |
| Sequence generation    | Transaction-scoped sequence table per tenant                                                  |

---

## 8. Error catalogue (trust domain)

| Code                              | HTTP (future API) | Meaning                                   |
| --------------------------------- | ----------------- | ----------------------------------------- |
| `TRUST_ACCOUNT_NOT_FOUND`         | 404               | Unknown trust account                     |
| `TRUST_ACCOUNT_CLOSED`            | 409               | Operation on closed account               |
| `TRUST_INSUFFICIENT_BALANCE`      | 422               | Withdrawal exceeds allocation             |
| `TRUST_JOURNAL_UNBALANCED`        | 500               | Engine invariant violation                |
| `TRUST_PERIOD_CLOSED`             | 409               | Reporting period locked                   |
| `TRUST_RECONCILIATION_INCOMPLETE` | 422               | Cannot close period                       |
| `TRUST_SEGREGATION_VIOLATION`     | 422               | Client/matter rule failed                 |
| `TRUST_REVERSAL_INVALID`          | 422               | Already reversed or not posted            |
| `TRUST_DUPLICATE_IDEMPOTENCY`     | 200               | Idempotent replay (success with existing) |

Align with [LAW-API-Error-Catalogue](./LAW-API-Error-Catalogue.md) when APIs implemented.

---

## 9. Non-functional requirements

| Attribute          | Target                                               |
| ------------------ | ---------------------------------------------------- |
| Audit completeness | 100% posted transactions have journal + audit record |
| Tenant isolation   | Zero cross-tenant leakage in tests                   |
| Recovery           | Journal rebuild restores balances exactly            |
| Performance        | Post transaction < 500ms p95 (single firm, postgres) |
| Availability       | Trust post participates in standard API SLA          |

---

## 10. Testing strategy (implementation)

| Layer       | Focus                                                            |
| ----------- | ---------------------------------------------------------------- |
| Unit        | Journal balancing, reversal, allocation sum                      |
| Contract    | Repository parity memory/postgres                                |
| Integration | Workflow post → outbox event → balance                           |
| E2E         | Workbench deposit → matter balance → reconciliation (LAW-015-12) |

---

## 11. Related documents

| Document               | Path                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Reference architecture | [LAW-Trust-Accounting-Reference-Architecture.md](../architecture/LAW-Trust-Accounting-Reference-Architecture.md) |
| Domain model           | [LAW-Trust-Domain-Model.md](../architecture/LAW-Trust-Domain-Model.md)                                           |
| Events                 | [LAW-Trust-Events.md](./LAW-Trust-Events.md)                                                                     |
| Permissions            | [LAW-Trust-Permissions.md](./LAW-Trust-Permissions.md)                                                           |
| Backlog                | [LAW-015-Trust-Accounting-Backlog.md](../backlog/LAW-015-Trust-Accounting-Backlog.md)                            |

---

_LAW Trust Accounting Specification — LAW-015-01 planning authority._
