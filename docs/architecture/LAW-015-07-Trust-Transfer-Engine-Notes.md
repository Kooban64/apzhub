# LAW-015-07 — Trust Transfer Engine Notes

> **Story:** LAW-015-07  
> **Status:** Implemented — in-memory only  
> **Authority:** [LAW-015-06 Interest Engine Notes](./LAW-015-06-Trust-Interest-Engine-Notes.md)  
> **Last updated:** 2026-07-07

---

## 1. Purpose

In-memory Trust Transfer Engine for controlled movement of trust funds via immutable journal postings. Transfers always balance through paired `transfer_out` and `transfer_in` ledger transactions with append-only allocation updates.

**TrustLedgerService remains the accounting authority.** No direct balance mutation. No UI, APIs, persistence, bank integration, or reporting.

---

## 2. Package location

```text
apps/law-platform/lib/trust/
  trust-transfer-types.ts
  trust-transfer-errors.ts
  trust-transfer-validator.ts
  trust-transfer-repository.ts
  in-memory-trust-transfer-repository.ts
  trust-transfer-events.ts
  trust-transfer-diagnostics.ts
  trust-transfer-service.ts
  trust-transfer.test.ts
```

Ledger extensions: `transfer_out`, `transfer_in` transaction types; `TRUST-TRANSFER-CLEARING` chart account.

---

## 3. Layering

```text
TrustTransferService              ← LAW-015-07
  ↓ posts via
TrustLedgerService                ← LAW-015-02 (authority)
  ↓ allocates via
TrustAllocationService            ← LAW-015-04 (append-only)
TrustInterestService              ← LAW-015-06 (historical accruals preserved)
TrustReconciliationService        ← LAW-015-05 (read-only cross-check)
```

---

## 4. Transfer types

| Type                    | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `matter_to_matter`      | Reallocate between matters (same account)           |
| `client_to_client`      | Move funds between clients (optional source matter) |
| `matter_to_client`      | Release matter allocation to client pool            |
| `client_to_matter`      | Allocate client funds to a matter                   |
| `account_to_account`    | Cross-account transfer (same tenant, same currency) |
| `allocation_correction` | Controlled correction with explicit reason          |
| `reversal`              | Reverse a posted transfer (via `reverseTransfer`)   |

---

## 5. Workflow

```text
createTransferDraft → validateTransfer → approveTransfer → postTransfer
                                                      ↘ reverseTransfer
createTransferDraft → cancelDraft
```

| Step    | Status      | Ledger / allocation                          |
| ------- | ----------- | -------------------------------------------- |
| Draft   | `draft`     | Validation only                              |
| Approve | `approved`  | No mutation                                  |
| Post    | `posted`    | `transfer_out` + `transfer_in` + allocations |
| Reverse | `reversed`  | Ledger reversals + allocation reversals      |
| Cancel  | `cancelled` | Draft discarded                              |

---

## 6. Ledger postings

**transfer_out:** Debit source liability → Credit `TRUST-TRANSFER-CLEARING`  
**transfer_in:** Debit `TRUST-TRANSFER-CLEARING` → Credit destination liability

Paired transactions linked via `pairedTransactionId`.

---

## 7. In-memory events

| Event                           | When                     |
| ------------------------------- | ------------------------ |
| `legal.trust.transfer.created`  | Draft created            |
| `legal.trust.transfer.approved` | Draft approved           |
| `legal.trust.transfer.posted`   | Posted to ledger         |
| `legal.trust.transfer.reversed` | Posted transfer reversed |

No outbox.

---

## 8. Interest integration

Historical interest postings are never recalculated. Transfers only change allocation projections; future accrual runs reflect post-transfer balances.

---

## 9. Out of scope (LAW-015-07)

UI, APIs, persistence, bank transfers, payment gateways, reporting, external accounting integration.

---

## 10. Next story

See [LAW-015-07 completion report](../sprint/LAW-015-07-completion-report.md) for LAW-015-08 recommendation (Trust Reporting).
