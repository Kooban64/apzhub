# LAW-015-03 — Trust Transaction Workflow Notes

> **Story:** LAW-015-03  
> **Status:** Implemented — in-memory only  
> **Authority:** [LAW-015-02 Trust Ledger Engine Notes](./LAW-015-02-Trust-Ledger-Engine-Notes.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

Workflow layer above `TrustLedgerService` managing draft lifecycle, validation, idempotent posting, reversal requests, and audit records.

**TrustLedgerService remains the accounting authority** — all monetary posts delegate to the ledger engine.

---

## 2. Package location

```text
apps/law-platform/lib/trust/
  trust-transaction-workflow-types.ts
  trust-transaction-workflow-errors.ts
  trust-transaction-validator.ts
  trust-transaction-draft-repository.ts
  in-memory-trust-transaction-draft-repository.ts
  trust-transaction-audit-repository.ts
  in-memory-trust-transaction-audit-repository.ts
  trust-transaction-workflow-events.ts      # event bus + idempotency store
  trust-transaction-workflow-diagnostics.ts
  trust-transaction-workflow-service.ts
  trust-transaction-workflow.test.ts
```

---

## 3. Workflow states

| Status      | Meaning                                              |
| ----------- | ---------------------------------------------------- |
| `draft`     | Editable; not yet validated                          |
| `validated` | Passed validation; ready to post                     |
| `posted`    | Posted to ledger; links `postedTrustTransactionId`   |
| `rejected`  | Validation failed; editable after update             |
| `reversed`  | Original draft whose ledger transaction was reversed |
| `cancelled` | Discarded before post                                |

---

## 4. Operations

| Method             | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `createDraft`      | Creates draft (minimal account check)                 |
| `updateDraft`      | Updates editable/rejected draft → back to `draft`     |
| `validateDraft`    | Full validation → `validated` or `rejected`           |
| `postDraft`        | Posts validated draft via `TrustLedgerService`        |
| `cancelDraft`      | Cancels draft/rejected/validated draft                |
| `requestReversal`  | Creates pre-validated reversal draft                  |
| `postReversal`     | Posts reversal draft; marks original draft `reversed` |
| `lookupAuditTrail` | Query append-only audit records                       |

---

## 5. Idempotency

`InMemoryTrustIdempotencyStore` indexes `(tenantId, idempotencyKey)` → posted transaction.

On replay:

1. Idempotency check runs **before** draft status validation
2. Returns existing draft + ledger transaction
3. Sets `idempotentReplay: true` on result and diagnostics

---

## 6. Layering

```text
TrustTransactionWorkflowService
        ↓ postDraft / postReversal
TrustLedgerService (accounting authority)
        ↓
InMemoryTrustLedgerRepository
```

Workflow never writes journal entries directly.

---

## 7. Related documents

| Document          | Path                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Audit notes       | [LAW-015-03-Trust-Transaction-Audit-Notes.md](./LAW-015-03-Trust-Transaction-Audit-Notes.md) |
| Completion report | [LAW-015-03-completion-report.md](../sprint/LAW-015-03-completion-report.md)                 |

---

_LAW-015-03 Trust Transaction Workflow — in-memory implementation._
