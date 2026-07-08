# LAW-015-02 — Trust Ledger Engine Notes

> **Story:** LAW-015-02  
> **Status:** Implemented — in-memory only  
> **Authority:** [LAW-Trust-Accounting-Reference-Architecture](./LAW-Trust-Accounting-Reference-Architecture.md) · [LAW-Trust-Accounting-Specification](../specs/LAW-Trust-Accounting-Specification.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

Implementation notes for the in-memory Trust Ledger Engine delivered in LAW-015-02. No UI, APIs, persistence, reconciliation, interest, or reporting.

---

## 2. Package location

```text
apps/law-platform/lib/trust/
  trust-ledger-types.ts           Domain types
  trust-ledger-errors.ts          Error codes
  trust-ledger-posting-builder.ts Double-entry line builder
  trust-ledger-validation.ts      Input validation
  trust-ledger-balance.ts         Balance projection from journal
  trust-ledger-events.ts            In-memory event bus
  in-memory-trust-ledger-repository.ts
  trust-ledger-service.ts         TrustLedgerService
  trust-ledger-diagnostics.ts     Operation diagnostics
  trust-ledger.test.ts
  index.ts
```

Import:

```typescript
import {
  TrustLedgerService,
  InMemoryTrustLedgerRepository,
  InMemoryTrustLedgerEventBus,
} from "@/lib/trust";
```

---

## 3. Core components

| Component                       | Responsibility                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `TrustLedgerService`            | Open account, post transaction, reverse, rebuild balances                        |
| `InMemoryTrustLedgerRepository` | Append-only journal/transaction store; status-only transaction update on reverse |
| `InMemoryTrustLedgerEventBus`   | Collect `legal.trust.*` domain events in memory                                  |
| `TrustLedgerDiagnostics`        | Session-scoped operation run records                                             |

---

## 4. Data flow

```text
OpenTrustAccountInput
        ↓
TrustLedgerService.openAccount()
        ↓
InMemoryTrustLedgerRepository.saveAccount()
        ↓
legal.trust.ledger.opened

PostTrustTransactionInput
        ↓
validate → buildPostingsForTransaction → validateBalancedPostings
        ↓
appendJournalEntry + appendTransaction
        ↓
rebuildBalancesFromJournal
        ↓
legal.trust.transaction.posted
```

---

## 5. Immutability model

| Artifact            | Rule                                                        |
| ------------------- | ----------------------------------------------------------- |
| `TrustJournalEntry` | Frozen on append; no repository update API                  |
| `TrustTransaction`  | Append-only; `status` may change `posted` → `reversed` only |
| `TrustBalance`      | Replaced on each post via journal rebuild                   |

`assertJournalEntryImmutable()` guards against field mutation in tests and future adapters.

---

## 6. Reference numbering

| Entity                | Generator                                                              |
| --------------------- | ---------------------------------------------------------------------- |
| Trust account code    | `ReferenceNumberGenerator.nextTrustAccountCode()` → `TRU-{YYYY}-{SEQ}` |
| Transaction reference | `nextTrustTransactionReference()` → `TRX-{YYYY}-{SEQ}`                 |
| Journal reference     | Repository sequence → `JE-{YYYY}-{SEQ}`                                |

---

## 7. Events (in-memory only)

| eventId                            | When                                       |
| ---------------------------------- | ------------------------------------------ |
| `legal.trust.ledger.opened`        | Account saved                              |
| `legal.trust.transaction.posted`   | Journal + transaction appended             |
| `legal.trust.transaction.reversed` | Reversal posted via `reverseTransaction()` |

No outbox. Event bus is process-local.

---

## 8. Deferred to later stories

| Concern                             | Story                                          |
| ----------------------------------- | ---------------------------------------------- |
| PostgreSQL persistence              | LAW-015-02 persistence extension or LAW-015-03 |
| Outbox / Event Bus integration      | LAW-015-11                                     |
| REST APIs                           | LAW-015-10                                     |
| Workbench UI                        | LAW-015-09                                     |
| Transfers, interest, reconciliation | LAW-015-05–007                                 |

---

## 9. Related documents

| Document          | Path                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Accounting rules  | [LAW-015-02-Trust-Accounting-Rules-Notes.md](./LAW-015-02-Trust-Accounting-Rules-Notes.md) |
| Completion report | [LAW-015-02-completion-report.md](../sprint/LAW-015-02-completion-report.md)               |
| Domain model      | [LAW-Trust-Domain-Model.md](./LAW-Trust-Domain-Model.md)                                   |

---

_LAW-015-02 Trust Ledger Engine — in-memory implementation._
