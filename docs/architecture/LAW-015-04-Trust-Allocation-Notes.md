# LAW-015-04 — Trust Allocation Notes

> **Story:** LAW-015-04  
> **Status:** Implemented — in-memory only  
> **Authority:** [LAW-015-03 Trust Transaction Workflow Notes](./LAW-015-03-Trust-Transaction-Workflow-Notes.md)  
> **Last updated:** 2026-07-06

---

## 1. Purpose

Allocation layer above `TrustTransactionWorkflowService` that distributes posted trust ledger transactions to client and matter buckets.

**TrustLedgerService remains the accounting authority.** Allocations do not post journal entries — they record how posted funds are assigned for operational and future reconciliation/reporting use.

---

## 2. Package location

```text
apps/law-platform/lib/trust/
  trust-allocation-types.ts
  trust-allocation-errors.ts
  trust-allocation-validator.ts
  trust-allocation-repository.ts
  in-memory-trust-allocation-repository.ts
  trust-allocation-balance.ts
  trust-allocation-events.ts
  trust-allocation-diagnostics.ts
  trust-allocation-service.ts
  trust-allocation.test.ts
```

---

## 3. Layering

```text
TrustAllocationService          ← LAW-015-04 (this story)
  ↓ reads posted transactions
TrustTransactionWorkflowService ← LAW-015-03
  ↓ posts drafts
TrustLedgerService              ← LAW-015-02 (accounting authority)
```

Typical flow:

1. Create and post draft via workflow
2. Call `TrustAllocationService.allocate()` for the posted `trustTransactionId`
3. Query projections for client/matter/unallocated balances

---

## 4. Allocation types

| Type          | Description                                    |
| ------------- | ---------------------------------------------- |
| `client`      | Client-level bucket (no matter)                |
| `matter`      | Matter-specific bucket                         |
| `unallocated` | Client funds not yet assigned to a matter      |
| `adjustment`  | Corrective redistribution (net-zero)           |
| `reversal`    | Opposite effect mirroring original allocations |

---

## 5. Operations

| Method                      | Description                                                   |
| --------------------------- | ------------------------------------------------------------- |
| `allocate`                  | Create allocation lines for a posted transaction              |
| `adjust`                    | Append adjustment lines (requires explicit increase/decrease) |
| `reverse`                   | Mirror original allocations for a posted reversal transaction |
| `getTransactionSummary`     | Totals and remaining unallocated for one transaction          |
| `getAllocationHistory`      | Filtered append-only history                                  |
| `getClientAllocatedBalance` | Net client allocation projection                              |
| `getMatterAllocatedBalance` | Net matter allocation projection                              |
| `getUnallocatedBalance`     | Net unallocated bucket projection                             |

---

## 6. Rules

- **Append-only** — historical allocations are never mutated
- **Reversal** creates new records linked via `reversesAllocationId`
- **Partial allocation** supported with `allowPartial: true`
- **Over-allocation** rejected when totals exceed transaction amount
- **Withdrawals** must allocate the full transaction amount
- **Adjustments** must balance increases and decreases

---

## 7. In-memory events

| Event                             | When                                |
| --------------------------------- | ----------------------------------- |
| `legal.trust.allocation.created`  | First allocation on a transaction   |
| `legal.trust.allocation.updated`  | Additional allocation or adjustment |
| `legal.trust.allocation.reversed` | Reversal allocations posted         |

No outbox — events collected in `InMemoryTrustAllocationEventBus`.

---

## 8. Out of scope (LAW-015-04)

- UI, APIs, persistence, reconciliation, interest, reporting, transfers, bank integration

---

## 9. Next story

See [LAW-015-04 completion report](../sprint/LAW-015-04-completion-report.md) for LAW-015-05 recommendation (Reconciliation).
