# LAW — Trust Accounting Reference Architecture

> **Milestone:** LAW-015 — Trust Accounting  
> **Story:** LAW-015-01 (planning authority)  
> **Status:** **Planning complete** — no implementation  
> **Platform baseline:** [Platform Version 5.0](../releases/APZHUB-Platform-v5.0.md) — **frozen**  
> **Depends on:** [APZHUB-Law-Platform-Reference-Architecture](./APZHUB-Law-Platform-Reference-Architecture.md) · [LAW-Persistence-Reference-Architecture](./LAW-Persistence-Reference-Architecture.md) · [LAW-Integration-Reference-Architecture](./LAW-Integration-Reference-Architecture.md)  
> **ADRs:** [ADR-0036](../adr/ADR-0036-trust-accounting-law-capability.md) · [ADR-0037](../adr/ADR-0037-immutable-trust-journal.md) · [ADR-0038](../adr/ADR-0038-matter-trust-balance-segregation.md) · [ADR-0039](../adr/ADR-0039-jurisdiction-adaptive-compliance-profile.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

This document is the **canonical architecture** for Trust Accounting on the Law Platform. It defines subsystem boundaries, ledger semantics, compliance posture, platform composition, and integration contracts for all LAW-015 implementation stories.

Trust Accounting holds client funds in regulated trust bank accounts, maintains matter-level segregation, supports reconciliation and interest, and produces audit-ready records. South African legal practice requirements are the primary design target; the model remains adaptable through jurisdiction compliance profiles (ADR-0039).

**LAW-015-01 delivers planning only.** No production code, persistence, APIs, or UI.

---

## 2. Canonical principles

| Principle                  | Rule                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Law Platform capability    | Trust Accounting is a legal module — not a Platform 5.0 framework extension                                                   |
| Consume, don't modify      | Uses Runtime, Workbench, Action, Knowledge, Event/Notification, Activity/Timeline, Persistence, API — **no platform changes** |
| No duplicate frameworks    | No parallel event bus, ledger SDK, or notification stack                                                                      |
| Workflow authority         | Mutations flow through `Trust*WorkflowService` classes (future) — APIs and actions are thin adapters                          |
| Immutable financial record | Posted journals and transactions are append-only; reversals only (ADR-0037)                                                   |
| Tenant isolation           | Every trust entity is scoped to `tenantId`; RLS consistent with LAW-012                                                       |
| Jurisdiction profiles      | Regulatory rules via `ComplianceProfile` — SA-first, extensible (ADR-0039)                                                    |

---

## 3. Subsystem overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     Law Platform — Trust Accounting                      │
├─────────────────────────────────────────────────────────────────────────┤
│  Workbench (Trust Dashboard, Accounts, Transactions, Reconciliation…)   │
│  Actions (deposit, withdraw, transfer, reconcile, post interest…)        │
│  APIs (/api/law/v1/trust/* — future LAW-015-10)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Trust Workflow Services                                                 │
│    TrustAccountWorkflowService · TrustTransactionWorkflowService         │
│    TrustReconciliationWorkflowService · TrustInterestWorkflowService     │
├─────────────────────────────────────────────────────────────────────────┤
│  Trust Ledger Engine (LAW-015-02)                                        │
│    Journal posting · Balance projection · Reference numbering            │
├─────────────────────────────────────────────────────────────────────────┤
│  Persistence (LAW-012 patterns — future migrations LAW-015-02+)          │
│    Trust Account · Journal Entry · Transaction · Allocation · Balance    │
├─────────────────────────────────────────────────────────────────────────┤
│  Platform 5.0 (frozen)                                                   │
│    Event Bus · Notifications · Activity Timeline · Auth · Outbox         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Core concepts

### 4.1 Business Ledger vs Trust Ledger

| Concept                 | Definition                                                                                                                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Business Ledger**     | Firm operating accounts (office/current account). Trust Accounting **references** business ledger for transfer settlements but does not own general ledger accounting. Future `AccountingIntegrationService` boundary. |
| **Trust Ledger**        | The authoritative double-entry journal for all regulated client trust funds within the tenant. Source of truth for trust compliance.                                                                                   |
| **Matter Trust Ledger** | Sub-ledger view: allocated trust balance per `clientId` + `matterId` within a trust account. Sum of matter ledgers + unallocated client pools equals trust account ledger.                                             |

### 4.2 Trust Journal

The **Trust Journal** is the immutable ordered sequence of **Trust Journal Entries**. Each entry contains balanced debit and credit lines against trust chart-of-accounts codes.

- **Posted** entries cannot be edited or deleted.
- **Reversal** creates a new entry with inverted amounts referencing `reversesEntryId`.
- Journal is the audit reconstruction source.

### 4.3 Trust Transaction

A **Trust Transaction** is the business-facing record of a trust movement (deposit, withdrawal, transfer, adjustment, interest posting). Posting a transaction atomically:

1. Validates permissions and compliance profile rules.
2. Creates journal entry(ies).
3. Updates balance projections.
4. Emits domain events (`legal.trust.*`).
5. Records audit trail.

Lifecycle: `draft` → `posted` → (`reversed` via reversal transaction).

### 4.4 Trust Balance

**Trust Balance** is a **derived, materialised projection** at firm, trust account, client, and matter levels. Recomputed from journal entries on post and on scheduled reconciliation. Not authoritative — journal wins on conflict.

### 4.5 Trust Allocation

**Trust Allocation** assigns portions of a trust account balance to client/matter buckets. Allocations link transactions to matter trust ledgers and support invoice trust application from billing.

### 4.6 Trust Reconciliation

**Trust Reconciliation** is a periodic control process comparing:

1. **Bank statement balance** (external),
2. **Trust account ledger balance** (internal journal),
3. **Sum of matter/client allocations** (internal sub-ledger).

Discrepancies produce reconciliation items requiring resolution before period close. See § 8 South African Compliance — three-way reconciliation.

### 4.7 Trust Interest

**Trust Interest** accrues on trust balances per **Trust Interest Rule** (profile-driven). **Trust Interest Posting** transactions credit client/matter allocations and debit interest expense/clearing accounts per profile strategy (implementation deferred to LAW-015-06).

### 4.8 Trust Transfer

**Trust Transfer** moves funds between trust accounts, between matter allocations within an account, or trust-to-business (fee transfer) with explicit dual posting and compliance checks.

### 4.9 Trust Reporting & Statements

**Trust Reporting Period** bounds regulatory reports. **Trust Statement** is a client-facing or examiner-facing artefact generated from journal and allocation data for a period (PDF/export deferred to LAW-015-08).

---

## 5. Architecture rules

### 5.1 Double-entry bookkeeping

Every posted trust transaction produces journal lines where **sum(debits) = sum(credits)** in the transaction currency. Multi-currency trust accounts require profile-defined exchange handling (conceptual only in planning).

### 5.2 Immutability

| Artifact                | Rule                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| Posted journal entry    | Immutable                                                             |
| Posted transaction      | Amounts/dates/accounts immutable; status may transition to `reversed` |
| Trust audit record      | Append-only                                                           |
| Reconciliation snapshot | Immutable once `completed`                                            |

### 5.3 Reversal-only corrections

Corrections to posted transactions:

1. Post **reversal transaction** referencing original.
2. Optionally post **corrected transaction** as new entry.

Never UPDATE historical amounts.

### 5.4 Audit trail requirements

Every mutation captures:

- `actorUserId`, `occurredAt`, `correlationId`, `tenantId`
- Before/after state for workflow-permitted fields on drafts
- Journal entry linkage for posted items
- Platform `capability.action.executed` for action-initiated flows
- Dedicated `TrustAuditRecord` for trust-specific examiner fields

### 5.5 Balance hierarchy

```text
Firm Trust Balance
  └── Trust Account Balance (per bank account)
        └── Client Trust Balance
              └── Matter Trust Balance (optional)
              └── Unallocated Client Pool
```

### 5.6 Tenant isolation

All queries and commands require resolved `tenantId` from Law persistence context (LAW-014-02). Cross-tenant trust operations are forbidden. Trust bank accounts belong to exactly one tenant.

### 5.7 Currency handling

- Each `TrustAccount` has a single **home currency**.
- Transactions post in account currency unless profile allows foreign currency receipts with conversion metadata on journal lines.
- Balance projections maintain currency code; no silent cross-currency netting.

### 5.8 Reference numbering

Human-readable references for examiner correspondence:

| Entity              | Prefix pattern (example) |
| ------------------- | ------------------------ |
| Trust Transaction   | `TRX-{YYYY}-{SEQ}`       |
| Trust Journal Entry | `JE-{YYYY}-{SEQ}`        |
| Reconciliation      | `REC-{YYYY}-{SEQ}`       |
| Trust Statement     | `STM-{YYYY}-{SEQ}`       |

Sequences are tenant-scoped, monotonic, gap-tolerant (voids leave gaps with audit reason).

### 5.9 Posting rules

| Rule         | Description                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Segregation  | Client funds never post to business operating accounts without explicit transfer transaction type |
| Matter link  | Matter-required transaction types must carry `matterId`                                           |
| Profile gate | `ComplianceProfile` validates transaction type, limits, and required narratives                   |
| Period lock  | Closed reporting periods reject new posts unless override permission                              |
| Idempotency  | API and worker posts accept `idempotencyKey` to prevent duplicate deposits                        |

---

## 6. South African compliance (conceptual)

This section describes **architectural support** for South African requirements. No jurisdiction-specific calculations are encoded in LAW-015-01.

### 6.1 Legal Practice Act & LPC expectations

| Requirement                         | Architectural support                                                      |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Separate trust account              | `TrustAccount` entity linked to institution; distinct from business ledger |
| Client fund identification          | `clientId` mandatory on posted movements; client statements                |
| Matter segregation                  | `Matter Trust Ledger` and `TrustAllocation`                                |
| Records retention                   | Immutable journal + audit records; export in LAW-015-08                    |
| Trust account naming / registration | `TrustAccount` metadata fields for LPC registration reference              |

### 6.2 Trust accounting principles

- Trust funds are not firm assets — journal chart separates trust liability accounts from firm revenue.
- No commingling — transfers between trust and business require `fee_transfer` or authorised types with dual authorisation (permission model).
- Prompt deposit rule — workflow SLA tracked via activities/notifications; not automated in planning.

### 6.3 Audit readiness

- Complete journal reconstruction for any date range.
- User attribution on every post and reversal.
- Reconciliation history with bank statement attachment references (future file storage LAW-014-11).
- Examiner export profile `ZA-LPC` defines required columns.

### 6.4 Interest handling

- `TrustInterestRule` per account or firm default.
- Accrual vs post separation — accrual schedules produce draft interest postings for approval.
- Interest credited to client/matter per LPC guidance via profile strategy.

### 6.5 Three-way reconciliation

```text
Bank Statement Closing Balance
        ↔
Trust Account Ledger Balance (journal-derived)
        ↔
Σ Matter Trust Balances + Unallocated Client Pools
```

`TrustReconciliation` aggregate captures snapshot of all three legs, variance lines, and resolution workflow.

---

## 7. Platform framework composition

| Framework                | Trust Accounting usage                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| **Runtime**              | `legal-trust` service manifest; health extension                                                  |
| **Workbench**            | Trust workspace, views — [LAW-Trust-Workbench-Planning](../specs/LAW-Trust-Workbench-Planning.md) |
| **Action Framework**     | Deposit, withdraw, transfer, reconcile, approve interest actions                                  |
| **Knowledge Framework**  | Trust account/transaction search provider                                                         |
| **Event & Notification** | `legal.trust.*` events; reconciliation due alerts                                                 |
| **Activity & Timeline**  | Trust movements on matter and client timelines                                                    |
| **Persistence**          | PostgreSQL adapters, RLS, outbox — LAW-015-02+                                                    |
| **API Framework**        | `/api/law/v1/trust/*` thin controllers — LAW-015-10                                               |

---

## 8. Integration points

| Module                 | Integration                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| **Client Management**  | `clientId` on all trust entities; client trust summary; client deactivation blocked with non-zero balance |
| **Matter Management**  | Matter trust balance tab; matter close blocked with trust balance unless transferred                      |
| **Time Recording**     | No direct trust movement; informational link on fee transfers                                             |
| **Billing**            | Invoice `trustAppliedAmount`; trust disbursement from matter balance; payment allocation                  |
| **Activities**         | Trust events → matter/client timeline entries                                                             |
| **Notifications**      | Low balance, reconciliation due, large withdrawal, period lock warnings                                   |
| **Knowledge / Search** | Index trust accounts, transactions, reconciliations by reference and narrative                            |
| **Dashboard**          | Firm trust summary widgets; unreconciled periods                                                          |
| **Future APIs**        | REST trust resources; webhook events for partner accounting                                               |

All integrations are **event- and service-boundary** based — no cross-module SQL.

---

## 9. Multi-tenancy

- One firm (tenant) may operate multiple trust bank accounts.
- Trust sequences, profiles, and permissions are tenant-scoped.
- Trust data never appears in platform-global tables without `tenantId`.
- Superadmin/platform operator has **no** default access to trust journal contents (firm admin permissions only).

---

## 10. Compliance & audit subsystem

```text
Trust Operation
      ↓
TrustWorkflowService (validation + profile rules)
      ↓
Ledger Engine (journal post)
      ↓
TrustAuditRecord + platform action audit
      ↓
Outbox → legal.trust.* events
      ↓
Activity / Notification / Search projections
```

**TrustAuditRecord** supplements platform audit with trust-specific fields: transaction type, trust account, client/matter, journal entry ids, reconciliation period.

---

## 11. Security model

| Control               | Mechanism                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------- |
| Authentication        | Better Auth session / API key (LAW-014-02)                                               |
| Authorisation         | `legal.trust.*` permissions — [LAW-Trust-Permissions](../specs/LAW-Trust-Permissions.md) |
| Segregation of duties | Separate permissions for post, reconcile, transfer, period close                         |
| Fail secure           | Missing permission → deny; no trust data in error details to unauthorised callers        |

---

## 12. Implementation phasing

See [LAW-015-Trust-Accounting-Backlog](../backlog/LAW-015-Trust-Accounting-Backlog.md).

| Phase          | Story      | Focus                                            |
| -------------- | ---------- | ------------------------------------------------ |
| Planning       | LAW-015-01 | Architecture, specs, backlog (**this document**) |
| Ledger         | LAW-015-02 | Journal engine, persistence, balance projection  |
| Transactions   | LAW-015-03 | Deposits, withdrawals, adjustments               |
| Allocations    | LAW-015-04 | Matter/client buckets                            |
| Reconciliation | LAW-015-05 | Three-way reconciliation                         |
| Interest       | LAW-015-06 | Rules and posting                                |
| Transfers      | LAW-015-07 | Inter-account and trust-to-business              |
| Reporting      | LAW-015-08 | Statements and regulatory exports                |
| Dashboard      | LAW-015-09 | Workbench modules                                |
| APIs           | LAW-015-10 | REST resources                                   |
| Integration    | LAW-015-11 | Client, Matter, Billing wiring                   |
| E2E            | LAW-015-12 | Cross-framework validation                       |
| Documentation  | LAW-015-13 | Developer and operator guides                    |
| Production     | LAW-015-14 | Readiness review                                 |
| Closeout       | LAW-015-15 | Milestone close                                  |

---

## 13. Related documents

| Document            | Path                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Trust domain model  | [LAW-Trust-Domain-Model.md](./LAW-Trust-Domain-Model.md)                                  |
| Trust specification | [LAW-Trust-Accounting-Specification.md](../specs/LAW-Trust-Accounting-Specification.md)   |
| Trust events        | [LAW-Trust-Events.md](../specs/LAW-Trust-Events.md)                                       |
| Trust permissions   | [LAW-Trust-Permissions.md](../specs/LAW-Trust-Permissions.md)                             |
| Workbench planning  | [LAW-Trust-Workbench-Planning.md](../specs/LAW-Trust-Workbench-Planning.md)               |
| Backlog             | [LAW-015-Trust-Accounting-Backlog.md](../backlog/LAW-015-Trust-Accounting-Backlog.md)     |
| Readiness review    | [LAW-015-Trust-Accounting-Readiness.md](../reviews/LAW-015-Trust-Accounting-Readiness.md) |
| Parent domain model | [APZHUB-Law-Domain-Model.md](./APZHUB-Law-Domain-Model.md)                                |
| Capability map      | [APZHUB-Law-Capability-Map.md](./APZHUB-Law-Capability-Map.md)                            |

---

## 14. Stop condition

**LAW-015-01 is complete when this planning package is approved.**

Do **not** begin LAW-015-02 (Trust Ledger Engine) until explicit owner approval.

---

_LAW Trust Accounting Reference Architecture — planning authority for LAW-015._
