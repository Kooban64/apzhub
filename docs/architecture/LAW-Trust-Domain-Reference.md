# LAW — Trust Domain Reference

> **Milestone:** LAW-015 — Trust Accounting  
> **Status:** **Canonical** — consolidates [LAW-Trust-Domain-Model](./LAW-Trust-Domain-Model.md) with as-built LAW-015 delivery  
> **Last updated:** 2026-07-08

---

## 1. Bounded context

Trust Accounting owns regulated client fund movements. It **references** Client, Matter, Invoice, Payment, and User by ID — never embeds their state.

```text
Trust Accounting ──references──► Core Legal (Client, Matter, Billing)
         │
         └── publishes ──► legal.trust.* events (catalogue; wiring deferred)
```

---

## 2. Aggregate roots

| Aggregate            | Root entity                                 | Consistency boundary                    |
| -------------------- | ------------------------------------------- | --------------------------------------- |
| Trust Account        | `TrustAccount`                              | Account metadata, open/close            |
| Trust Journal        | `TrustJournalEntry`                         | Balanced lines, immutability after post |
| Trust Transaction    | `TrustTransaction` (+ draft)                | Business movement linked to journal     |
| Trust Allocation     | `TrustAllocation`                           | Client/matter bucket assignment         |
| Trust Reconciliation | `TrustReconciliationRun`                    | Control run snapshot                    |
| Trust Interest       | `TrustInterestRule`, `TrustInterestPosting` | Accrual rules and postings              |
| Trust Transfer       | `TrustTransfer`                             | Inter-matter/account movement           |
| Trust Report         | `TrustReport`                               | Immutable read projection               |
| Trust Approval       | `TrustApprovalRequest`                      | Governance decision record              |

---

## 3. Core entities

### TrustAccount

| Field group | Examples                                                     |
| ----------- | ------------------------------------------------------------ |
| Identity    | `trustAccountId`, `tenantId`                                 |
| Display     | `name`, `currency`, `institutionName`, `accountNumberMasked` |
| Control     | `complianceProfileId`, `isActive`, `openedAt`, `closedAt`    |

### TrustTransaction / Draft

| State      | Mutable fields                                    |
| ---------- | ------------------------------------------------- |
| `draft`    | amount, dates, client, matter, narrative, type    |
| `posted`   | **immutable** — reversal only via new transaction |
| `reversed` | Marked when reversal posted                       |

Types: `deposit`, `withdrawal`, `transfer_in`, `transfer_out`, `fee_transfer`, `adjustment`, `interest_posting`, `reversal`.

### TrustJournalEntry

Double-entry lines: `accountCode`, debit, credit, optional `clientId` / `matterId`. Status: `posted` | `reversed`. Linked via `trustTransactionId`, optional `reversesEntryId`.

### TrustAllocation

Links `trustTransactionId` to `clientId` / `matterId` with `amount`, `effect`, `allocationType`. Append-only.

### TrustReconciliationRun

Captures run timestamp, status, variance warnings/errors, compared balances.

### TrustInterestRule / TrustInterestPosting

Rule: rate, method, frequency, effective dates. Posting: accrued amount for period, status workflow.

### TrustTransfer

Draft → approved → posted. Source/destination client and matter references, amount, reason.

### TrustReport

| Field                                      | Purpose                           |
| ------------------------------------------ | --------------------------------- |
| `reportId`, `reportType`, `trustAccountId` | Identity                          |
| `generatedAt`, `generatedByUserId`         | Audit                             |
| `payload`                                  | Frozen read model (type-specific) |
| `sourceCounts`                             | Line counts for UI/export         |

---

## 4. Value objects

| Value object          | Definition                                              |
| --------------------- | ------------------------------------------------------- |
| `Money`               | `amount` + `currency` (ISO code)                        |
| `ReportingPeriod`     | `start` / `end` dates (inclusive rules per report type) |
| `TrustReference`      | Human-readable transaction/journal reference            |
| `ComplianceProfileId` | Jurisdiction profile key (e.g. `ZA-LPC`)                |
| `TenantScope`         | `tenantId` — mandatory on all operations                |

---

## 5. Relationships

```text
TrustAccount 1──* TrustTransaction
TrustTransaction 1──* TrustJournalEntry
TrustTransaction 1──* TrustAllocation
TrustAccount 1──* TrustReconciliationRun
TrustAccount 1──* TrustInterestRule
TrustInterestRule 1──* TrustInterestPosting
TrustAccount 1──* TrustTransfer
TrustAccount 1──* TrustReport
TrustApprovalRequest *──1 TrustTransaction | TrustTransfer (polymorphic target)
```

External references (by ID only): `clientId`, `matterId`, `invoiceId`, `paymentId`, `actorUserId`.

---

## 6. State machines

### Transaction draft

```text
draft ──validate──► validated ──post──► posted
  │                                      │
  └── cancel ──► cancelled              └── reversal posted ──► reversed
```

### Approval request

```text
submitted ──approve──► approved ──execute──► posted
         ──reject──► rejected
         ──cancel──► cancelled
```

### Transfer

```text
draft ──approve──► approved ──post──► posted
                ──reject──► rejected
```

### Interest posting

```text
draft ──approve──► approved ──post──► posted
```

### Reconciliation run

```text
started ──complete──► completed (with warnings/errors optional)
       ──fail──► failed
```

---

## 7. Domain events

Catalogue: [LAW-Trust-Events](../specs/LAW-Trust-Events.md). Representative events:

| Event                                  | Trigger                 |
| -------------------------------------- | ----------------------- |
| `legal.trust.account.opened`           | Account created         |
| `legal.trust.transaction.posted`       | Draft posted            |
| `legal.trust.transaction.reversed`     | Reversal completed      |
| `legal.trust.allocation.created`       | Funds allocated         |
| `legal.trust.reconciliation.completed` | Run finished            |
| `legal.trust.interest.posted`          | Interest posting posted |
| `legal.trust.transfer.posted`          | Transfer posted         |
| `legal.trust.report.generated`         | Report materialised     |

Outbox recording exists; platform Event Bus subscribers deferred.

---

## 8. Invariants

| Invariant                      | Enforcement                                |
| ------------------------------ | ------------------------------------------ |
| Balanced journal               | `TrustLedgerService` validator             |
| Posted immutability            | Repository reject updates                  |
| Tenant isolation               | Service + RLS                              |
| Matter segregation             | Allocation + balance projection (ADR-0038) |
| Approval before high-risk post | `TrustApprovalService` gate                |
| Report immutability            | Object.freeze on store                     |

---

## 9. Implementation location

| Layer           | Path                                           |
| --------------- | ---------------------------------------------- |
| Domain services | `apps/law-platform/lib/trust/`                 |
| Types           | `trust-*-types.ts`, `trust-reporting-types.ts` |
| Repositories    | `in-memory-*`, `postgres-trust-*`              |
| API DTOs        | `apps/web/lib/api/trust/trust-dto-mapper.ts`   |

---

## 10. Related documents

- [LAW-Trust-Reference-Architecture](./LAW-Trust-Reference-Architecture.md)
- [LAW-Trust-Accounting-Specification](../specs/LAW-Trust-Accounting-Specification.md)
- [LAW-Trust-Permissions](../specs/LAW-Trust-Permissions.md)
