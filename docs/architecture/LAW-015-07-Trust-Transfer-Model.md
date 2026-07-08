# LAW-015-07 — Trust Transfer Model

> **Story:** LAW-015-07  
> **Status:** Implemented — in-memory only  
> **Last updated:** 2026-07-07

---

## 1. Entity: TrustTransfer

Controlled fund movement aggregate.

| Field                       | Type                                                           | Notes                               |
| --------------------------- | -------------------------------------------------------------- | ----------------------------------- |
| `trustTransferId`           | string                                                         | Primary key                         |
| `tenantId`                  | string                                                         | Tenant scope                        |
| `transferType`              | enum                                                           | See transfer types                  |
| `status`                    | `draft` \| `approved` \| `posted` \| `reversed` \| `cancelled` | Workflow state                      |
| `sourceTrustAccountId`      | string                                                         | Source account                      |
| `destinationTrustAccountId` | string                                                         | Destination account                 |
| `sourceClientId`            | string                                                         | Source client                       |
| `destinationClientId`       | string                                                         | Destination client                  |
| `sourceMatterId`            | string?                                                        | Source matter                       |
| `destinationMatterId`       | string?                                                        | Destination matter                  |
| `amount`                    | number                                                         | Transfer amount                     |
| `currency`                  | string                                                         | Account currency                    |
| `reason`                    | string                                                         | Required justification              |
| `reversesTransferId`        | string?                                                        | Original transfer for reversal type |
| `transferOutTransactionId`  | string?                                                        | Posted out leg                      |
| `transferInTransactionId`   | string?                                                        | Posted in leg                       |
| `reversalOutTransactionId`  | string?                                                        | Reversal out leg                    |
| `reversalInTransactionId`   | string?                                                        | Reversal in leg                     |
| `sourceBalanceBefore`       | number?                                                        | Diagnostics snapshot                |
| `destinationBalanceBefore`  | number?                                                        | Diagnostics snapshot                |

Immutable once posted — state transitions append new frozen records.

---

## 2. Validation rules

| Rule                      | Enforcement                                           |
| ------------------------- | ----------------------------------------------------- |
| Double-entry              | Paired `transfer_out` / `transfer_in` journal entries |
| Append-only               | No journal or allocation mutation — append only       |
| Sufficient balance        | Source allocation balance ≥ amount                    |
| Currency consistency      | Source and destination accounts same currency         |
| Tenant isolation          | All entities same tenant                              |
| Posted sources only       | Ledger postings via TrustLedgerService                |
| Reversal-only corrections | Posted transfers reversed, not edited                 |

---

## 3. Transfer type constraints

| Type                    | Source matter | Dest matter   | Accounts      |
| ----------------------- | ------------- | ------------- | ------------- |
| `matter_to_matter`      | Required      | Required      | Same          |
| `client_to_client`      | Optional      | Must be empty | Same          |
| `matter_to_client`      | Required      | Empty         | Same          |
| `client_to_matter`      | Empty         | Required      | Same          |
| `account_to_account`    | Optional      | Optional      | Different     |
| `allocation_correction` | Varies        | Varies        | Same          |
| `reversal`              | From original | From original | From original |

---

## 4. Diagnostics snapshot

Session diagnostics track:

- Transfers created, posted, reversed
- Validation failures
- Source and destination balance snapshots on draft creation

---

## 5. Immutability guarantees

- Transfer records frozen on repository save
- Posted transfers cannot be edited — only reversed
- Draft transfers can be cancelled
- Allocation history never mutated — only append
