# LAW-015-02 — Trust Accounting Rules Notes

> **Story:** LAW-015-02  
> **Status:** Enforced in `TrustLedgerService` (in-memory)  
> **Authority:** [ADR-0037](../adr/ADR-0037-immutable-trust-journal.md) · [LAW-Trust-Accounting-Specification](../specs/LAW-Trust-Accounting-Specification.md)  
> **Last updated:** 2026-07-06

---

## 1. Double-entry postings

Every posted transaction produces journal lines where **sum(debits) = sum(credits)**.

| Transaction type        | Debit                                            | Credit                                           |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `opening_balance`       | TRUST-CASH                                       | TRUST-LIABILITY-CLIENT or TRUST-LIABILITY-MATTER |
| `deposit`               | TRUST-CASH                                       | TRUST-LIABILITY-CLIENT or TRUST-LIABILITY-MATTER |
| `withdrawal`            | TRUST-LIABILITY-CLIENT or TRUST-LIABILITY-MATTER | TRUST-CASH                                       |
| `adjustment` (increase) | TRUST-CASH                                       | TRUST-LIABILITY-*                                |
| `adjustment` (decrease) | TRUST-LIABILITY-*                                | TRUST-CASH                                       |
| `reversal`              | Inverted lines of original entry                 | Inverted lines of original entry                 |

When `matterId` is present, liability posts to `TRUST-LIABILITY-MATTER`; otherwise `TRUST-LIABILITY-CLIENT`.

---

## 2. Validation rules (LAW-015-02)

| Rule               | Enforcement                                                    |
| ------------------ | -------------------------------------------------------------- |
| Positive amount    | `amount > 0`                                                   |
| Currency match     | Transaction currency = account currency                        |
| Client reference   | `clientId` required on all types                               |
| Matter reference   | Optional; determines liability account                         |
| ISO dates          | `transactionDate`, `postingDate` as `YYYY-MM-DD`               |
| Balanced journal   | `TRUST_JOURNAL_UNBALANCED` if debits ≠ credits                 |
| Reversal target    | `reversesTransactionId` required for `reversal` type           |
| Sufficient balance | Withdrawal and decrease adjustment check client/matter balance |
| Tenant scope       | All operations scoped to `tenantId`                            |
| Active account     | Posts rejected when `isActive === false`                       |

---

## 3. Immutability

- Posted journal entries are **never updated or deleted**.
- Posted transaction amounts, dates, and accounts are **immutable**.
- Corrections use **reversal transactions** only.
- Original transaction `status` transitions to `reversed` (metadata only).

---

## 4. Balance hierarchy

| Scope       | Source                                                      |
| ----------- | ----------------------------------------------------------- |
| **Account** | Net TRUST-CASH (asset): debits − credits                    |
| **Client**  | Net TRUST-LIABILITY-CLIENT for `clientId`: credits − debits |
| **Matter**  | Net TRUST-LIABILITY-MATTER for `matterId`: credits − debits |

Balances are **projections** rebuilt from the journal after each post. `rebuildBalances()` recomputes from scratch.

---

## 5. Foundation transaction types only

Implemented in LAW-015-02:

- `opening_balance`
- `deposit`
- `withdrawal`
- `adjustment`
- `reversal`

**Not implemented:** `transfer_in`, `transfer_out`, `fee_transfer`, `interest_posting` — deferred to LAW-015-03+.

---

## 6. Error catalogue (engine)

| Code                         | Meaning                                 |
| ---------------------------- | --------------------------------------- |
| `TRUST_JOURNAL_UNBALANCED`   | Debits ≠ credits                        |
| `TRUST_ACCOUNT_NOT_FOUND`    | Unknown account or tenant mismatch      |
| `TRUST_INSUFFICIENT_BALANCE` | Withdrawal/adjustment exceeds available |
| `TRUST_INVALID_AMOUNT`       | Non-positive amount                     |
| `TRUST_CURRENCY_MISMATCH`    | Currency ≠ account currency             |
| `TRUST_ALREADY_REVERSED`     | Duplicate reversal                      |
| `TRUST_IMMUTABLE_VIOLATION`  | Attempt to mutate journal fields        |

Full list: `trust-ledger-errors.ts`.

---

## 7. South African alignment (conceptual)

Rules support LPC expectations without encoding jurisdiction calculations:

- Client fund segregation via mandatory `clientId`
- Matter segregation via `matterId` and matter liability account
- Audit trail via immutable journal + transaction references
- Reversal-only corrections

Three-way reconciliation deferred to LAW-015-05.

---

_LAW-015-02 Trust Accounting Rules — enforced in TrustLedgerService._
