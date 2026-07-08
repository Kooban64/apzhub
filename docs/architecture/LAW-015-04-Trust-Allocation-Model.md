# LAW-015-04 — Trust Allocation Model

> **Story:** LAW-015-04  
> **Status:** Implemented — in-memory only  
> **Last updated:** 2026-07-06

---

## 1. Entity: TrustAllocation

Append-only record linking a **posted** trust transaction to a client/matter bucket.

| Field                        | Type                     | Notes                                             |
| ---------------------------- | ------------------------ | ------------------------------------------------- |
| `trustAllocationId`          | string                   | Primary key                                       |
| `tenantId`                   | string                   | Tenant scope                                      |
| `trustAccountId`             | string                   | Parent trust account                              |
| `trustTransactionId`         | string                   | Posted ledger transaction                         |
| `clientId`                   | string                   | Must match transaction client                     |
| `matterId`                   | string?                  | Required for matter allocations                   |
| `amount`                     | number                   | Always positive                                   |
| `effect`                     | `increase` \| `decrease` | Derived from transaction type                     |
| `currency`                   | string                   | From transaction                                  |
| `allocationType`             | enum                     | client, matter, unallocated, adjustment, reversal |
| `allocationDate`             | ISO date                 | From transaction date                             |
| `reversesAllocationId`       | string?                  | Original allocation when type=reversal            |
| `reversesTrustTransactionId` | string?                  | Original transaction on reversal                  |
| `createdByUserId`            | string                   | Actor                                             |
| `createdAt`                  | ISO datetime             | Immutable timestamp                               |

---

## 2. Effect resolution

| Transaction type             | Allocation effect                       |
| ---------------------------- | --------------------------------------- |
| `deposit`, `opening_balance` | increase                                |
| `withdrawal`                 | decrease                                |
| `adjustment`                 | per `adjustmentDirection`               |
| `reversal`                   | opposite of original transaction effect |

---

## 3. Allocation patterns

### One transaction → one matter

Auto-allocate when transaction has `matterId`:

```typescript
allocationService.allocate({
  tenantId,
  trustTransactionId,
  actorUserId,
});
```

### One transaction → multiple matters (split)

```typescript
allocationService.allocate({
  tenantId,
  trustTransactionId,
  lines: [
    { clientId, matterId: "matter-a", amount: 600, allocationType: "matter" },
    { clientId, matterId: "matter-b", amount: 400, allocationType: "matter" },
  ],
  actorUserId,
});
```

### Client only

Transaction without `matterId` auto-allocates to client bucket.

### Partial + unallocated remainder

```typescript
// First call — partial
allocationService.allocate({
  tenantId,
  trustTransactionId,
  lines: [{ clientId, matterId, amount: 600, allocationType: "matter" }],
  allowPartial: true,
  actorUserId,
});

// Second call — remainder to unallocated
allocationService.allocate({
  tenantId,
  trustTransactionId,
  lines: [{ clientId, amount: 400, allocationType: "unallocated" }],
  allowPartial: true,
  actorUserId,
});
```

### Adjustment (redistribution)

```typescript
allocationService.adjust({
  tenantId,
  trustTransactionId,
  reason: "Move funds between matters",
  lines: [
    { clientId, matterId: "matter-a", amount: 200, effect: "decrease" },
    { clientId, matterId: "matter-b", amount: 200, effect: "increase" },
  ],
  actorUserId,
});
```

### Reversal

After ledger reversal is posted:

```typescript
allocationService.reverse({
  tenantId,
  reversalTransactionId,
  actorUserId,
});
```

Creates mirrored `reversal` type records with opposite effect.

---

## 4. Balance projections

Projections are **read-only** sums of signed allocation amounts:

| Projection  | Scope key                                          |
| ----------- | -------------------------------------------------- |
| Client      | `tenantId + trustAccountId + clientId` (all lines) |
| Matter      | `tenantId + trustAccountId + clientId + matterId`  |
| Unallocated | `allocationType === unallocated`                   |

Signed amount: `effect === increase ? +amount : -amount`

---

## 5. Validation matrix

| Rule                                     |          Enforced           |
| ---------------------------------------- | :-------------------------: |
| Tenant scope                             |             ✅              |
| Trust account exists                     | ✅ (via transaction lookup) |
| Client ownership (matches transaction)   |             ✅              |
| Matter ownership (same client)           |             ✅              |
| Allocation totals ≤ transaction amount   |             ✅              |
| Full allocation (unless partial)         |             ✅              |
| No negative line amounts                 |             ✅              |
| Currency consistency                     |    ✅ (from transaction)    |
| Posted transaction only                  |             ✅              |
| Reversal targets exist                   |             ✅              |
| Adjustment balance (increase = decrease) |             ✅              |

---

## 6. Immutability

- Repository is append-only
- No update or delete operations
- Corrections use `adjustment` or `reversal` types
- History preserved for audit and future reconciliation (LAW-015-05)
