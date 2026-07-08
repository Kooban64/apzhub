# LAW — Trust Events Catalogue

> **Milestone:** LAW-015 — Trust Accounting  
> **Story:** LAW-015-01 (planning authority)  
> **Status:** **Canonical event catalogue** — no code  
> **Authority:** [SPR-006-ENF-event-envelope](./SPR-006-ENF-event-envelope.md) · [LAW-Trust-Accounting-Reference-Architecture](../architecture/LAW-Trust-Accounting-Reference-Architecture.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

Define canonical Trust Accounting domain events for registration in legal capability manifests, outbox propagation, notification routing, and activity timeline projection.

Events use namespace prefix **`legal.trust.`** and follow platform event envelope conventions.

---

## 2. Registration

Trust events are declared in `services/legal-trust/` (or trust section of legal manifest) under `events[]` — **not** in the platform built-in catalogue.

Publisher: `legal-trust` capability.  
Schema version: `1.0.0` at introduction (LAW-015-11).

---

## 3. Envelope fields (trust extension)

All trust events include in `payload`:

| Field                | Type    |  Required   | Description                 |
| -------------------- | ------- | :---------: | --------------------------- |
| `tenantId`           | string  |     ✅      | Firm tenant                 |
| `trustAccountId`     | string  | Conditional | Primary account affected    |
| `clientId`           | string  | Conditional | Client fund owner           |
| `matterId`           | string  |  Optional   | Matter when applicable      |
| `trustTransactionId` | string  | Conditional | Transaction when applicable |
| `actorUserId`        | string  |     ✅      | User who triggered action   |
| `correlationId`      | string  |     ✅      | Request correlation         |
| `occurredAt`         | ISO8601 |     ✅      | Business timestamp          |

---

## 4. Event catalogue

### 4.1 Trust account lifecycle

| eventId                       | Label                 | Trigger                        | Key subscribers                |
| ----------------------------- | --------------------- | ------------------------------ | ------------------------------ |
| `legal.trust.account.created` | Trust Account Created | New trust account opened       | audit, search, activity        |
| `legal.trust.account.updated` | Trust Account Updated | Metadata changed (not journal) | search, activity               |
| `legal.trust.account.closed`  | Trust Account Closed  | Account closed zero balance    | audit, notifications, activity |

**Payload additions:** `trustAccountId`, `trustAccountCode`, `name`, `currency`, `complianceProfileId`

---

### 4.2 Deposits and receipts

| eventId                        | Label                  | Trigger                    | Key subscribers                  |
| ------------------------------ | ---------------------- | -------------------------- | -------------------------------- |
| `legal.trust.deposit.received` | Trust Deposit Received | Deposit transaction posted | notifications, activity, billing |
| `legal.trust.deposit.reversed` | Trust Deposit Reversed | Deposit reversal posted    | audit, activity                  |

**Payload additions:** `trustTransactionId`, `transactionReference`, `amount`, `currency`, `narrative`, `paymentId?`

---

### 4.3 Withdrawals and payments

| eventId                           | Label                     | Trigger             | Key subscribers         |
| --------------------------------- | ------------------------- | ------------------- | ----------------------- |
| `legal.trust.withdrawal.created`  | Trust Withdrawal Created  | Withdrawal posted   | notifications, activity |
| `legal.trust.withdrawal.reversed` | Trust Withdrawal Reversed | Withdrawal reversed | audit, activity         |

**Payload additions:** `amount`, `invoiceId?`, `payeeName?`

---

### 4.4 Transfers

| eventId                          | Label                    | Trigger                   | Key subscribers                |
| -------------------------------- | ------------------------ | ------------------------- | ------------------------------ |
| `legal.trust.transfer.initiated` | Trust Transfer Initiated | Draft transfer created    | activity                       |
| `legal.trust.transfer.completed` | Trust Transfer Completed | Both transfer legs posted | notifications, activity, audit |
| `legal.trust.transfer.failed`    | Trust Transfer Failed    | Atomic transfer rollback  | notifications, audit           |

**Payload additions:** `sourceTrustAccountId?`, `targetTrustAccountId?`, `pairedTransactionId`, `transferType`

---

### 4.5 Allocations

| eventId                           | Label                     | Trigger                     | Key subscribers           |
| --------------------------------- | ------------------------- | --------------------------- | ------------------------- |
| `legal.trust.allocation.created`  | Trust Allocation Created  | Allocation posted           | activity, matter timeline |
| `legal.trust.allocation.adjusted` | Trust Allocation Adjusted | Allocation correction chain | audit, activity           |

**Payload additions:** `trustAllocationId`, `allocatedAmount`, `allocationType`

---

### 4.6 Interest

| eventId                         | Label                   | Trigger                              | Key subscribers             |
| ------------------------------- | ----------------------- | ------------------------------------ | --------------------------- |
| `legal.trust.interest.accrued`  | Trust Interest Accrued  | Accrual run completed (draft)        | notifications               |
| `legal.trust.interest.approved` | Trust Interest Approved | Approver signed off                  | activity                    |
| `legal.trust.interest.posted`   | Trust Interest Posted   | Interest credited to clients/matters | audit, activity, statements |

**Payload additions:** `trustInterestRuleId`, `interestPeriodStart`, `interestPeriodEnd`, `totalInterestAmount`

---

### 4.7 Reconciliation

| eventId                                    | Label                          | Trigger                  | Key subscribers                |
| ------------------------------------------ | ------------------------------ | ------------------------ | ------------------------------ |
| `legal.trust.reconciliation.started`       | Trust Reconciliation Started   | Reconciliation opened    | activity                       |
| `legal.trust.reconciliation.item.resolved` | Reconciliation Item Resolved   | Variance item cleared    | activity                       |
| `legal.trust.reconciliation.completed`     | Trust Reconciliation Completed | Three-way match achieved | notifications, audit, activity |
| `legal.trust.reconciliation.failed`        | Trust Reconciliation Failed    | Failed close attempt     | notifications                  |

**Payload additions:** `trustReconciliationId`, `reconciliationReference`, `varianceAmount`, `reportingPeriodId`

---

### 4.8 Statements and reporting

| eventId                               | Label                         | Trigger                           | Key subscribers         |
| ------------------------------------- | ----------------------------- | --------------------------------- | ----------------------- |
| `legal.trust.statement.generated`     | Trust Statement Generated     | Client/examiner statement created | notifications, activity |
| `legal.trust.reporting.period.closed` | Trust Reporting Period Closed | Period locked                     | audit, notifications    |

**Payload additions:** `trustStatementId`, `statementReference`, `periodStart`, `periodEnd`, `clientId?`

---

### 4.9 Adjustments and reversals

| eventId                            | Label                      | Trigger                       | Key subscribers         |
| ---------------------------------- | -------------------------- | ----------------------------- | ----------------------- |
| `legal.trust.adjustment.posted`    | Trust Adjustment Posted    | Adjustment transaction posted | audit, activity         |
| `legal.trust.transaction.reversed` | Trust Transaction Reversed | Generic reversal posted       | audit, activity, search |

**Payload additions:** `reversesTransactionId`, `adjustmentReason?`

---

### 4.10 Balance and audit

| eventId                       | Label                 | Trigger                         | Key subscribers   |
| ----------------------------- | --------------------- | ------------------------------- | ----------------- |
| `legal.trust.balance.updated` | Trust Balance Updated | Projection refreshed after post | dashboard, search |
| `legal.trust.audit.recorded`  | Trust Audit Recorded  | Trust-specific audit entry      | audit export      |

**Payload additions:** `balanceScope` (`firm` \| `account` \| `client` \| `matter`), `balanceAmount`, `trustAuditRecordId`

---

## 5. Notification routes (planned)

| eventId                                | Notification experience        | Audience                               |
| -------------------------------------- | ------------------------------ | -------------------------------------- |
| `legal.trust.deposit.received`         | `trust.deposit.received`       | Matter responsible attorney            |
| `legal.trust.withdrawal.created`       | `trust.withdrawal.large`       | Trust administrator (amount threshold) |
| `legal.trust.reconciliation.completed` | `trust.reconciliation.done`    | Firm finance role                      |
| `legal.trust.reconciliation.failed`    | `trust.reconciliation.overdue` | Trust administrator                    |
| `legal.trust.interest.posted`          | `trust.interest.posted`        | Firm finance role                      |
| `legal.trust.reporting.period.closed`  | `trust.period.closed`          | Firm partners                          |

Declared in manifest `notifications.routes[]` at LAW-015-11.

---

## 6. Activity types (planned)

| eventId                                | activityType           | Timeline scope |
| -------------------------------------- | ---------------------- | -------------- |
| `legal.trust.deposit.received`         | `trust.deposit`        | matter, client |
| `legal.trust.withdrawal.created`       | `trust.withdrawal`     | matter, client |
| `legal.trust.transfer.completed`       | `trust.transfer`       | matter         |
| `legal.trust.reconciliation.completed` | `trust.reconciliation` | firm           |
| `legal.trust.statement.generated`      | `trust.statement`      | client         |

Declared in manifest `activities.types[]` at LAW-015-11.

---

## 7. Outbox propagation

Trust workflow services write to `law_outbox_event` (existing LAW-012 pattern) with:

- `eventType` = eventId from this catalogue
- `aggregateType` = `trust_transaction` \| `trust_reconciliation` \| etc.
- `aggregateId` = primary entity id
- `payload` = full event payload JSON

Workers (LAW-014-08+) dispatch to Event Bus without trust-specific worker duplication.

---

## 8. Versioning policy

- Breaking payload changes increment event `schemaVersion` in manifest.
- Subscribers must tolerate unknown fields.
- New events require backlog story or patch approval.

---

## 9. Related documents

| Document                 | Path                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Reference architecture   | [LAW-Trust-Accounting-Reference-Architecture.md](../architecture/LAW-Trust-Accounting-Reference-Architecture.md) |
| Platform event catalogue | [SPR-006-ENF-platform-event-catalogue.md](./SPR-006-ENF-platform-event-catalogue.md)                             |
| Event envelope           | [SPR-006-ENF-event-envelope.md](./SPR-006-ENF-event-envelope.md)                                                 |

---

_LAW Trust Events Catalogue — LAW-015-01._
