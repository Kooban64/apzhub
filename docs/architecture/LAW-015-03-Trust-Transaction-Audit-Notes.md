# LAW-015-03 — Trust Transaction Audit Notes

> **Story:** LAW-015-03  
> **Status:** Implemented — append-only, in-memory  
> **Last updated:** 2026-07-06

---

## 1. Purpose

Append-only audit trail for trust transaction workflow actions. Complements ledger immutability with workflow-level attribution.

No database. No persistence beyond process memory.

---

## 2. Audit record shape

| Field                | Description                      |
| -------------------- | -------------------------------- |
| `auditRecordId`      | Unique identifier                |
| `tenantId`           | Firm tenant                      |
| `trustAccountId`     | Trust account                    |
| `draftId`            | Workflow draft (when applicable) |
| `trustTransactionId` | Ledger transaction (after post)  |
| `action`             | Workflow action code             |
| `actorUserId`        | User who performed action        |
| `occurredAt`         | ISO timestamp                    |
| `correlationId`      | Request correlation              |
| `summary`            | Human-readable summary           |
| `details`            | Optional structured payload      |

---

## 3. Recorded actions

| Action               | Trigger                 |
| -------------------- | ----------------------- |
| `draft.created`      | `createDraft`           |
| `draft.updated`      | `updateDraft`           |
| `draft.validated`    | `validateDraft` success |
| `draft.posted`       | `postDraft` success     |
| `draft.cancelled`    | `cancelDraft`           |
| `validation.failed`  | `validateDraft` failure |
| `reversal.requested` | `requestReversal`       |
| `reversal.posted`    | `postReversal` success  |

---

## 4. Immutability

- `InMemoryTrustTransactionAuditRepository.append()` only — no update or delete API
- Records are never modified after creation

---

## 5. Query

```typescript
workflow.lookupAuditTrail({
  tenantId: "tenant-a",
  trustAccountId: "optional",
  draftId: "optional",
  trustTransactionId: "optional",
  action: "optional",
});
```

---

## 6. Deferred

| Item                         | Target            |
| ---------------------------- | ----------------- |
| PostgreSQL audit table       | Persistence story |
| Examiner export              | LAW-015-08        |
| Platform action audit bridge | LAW-015-11        |

---

_LAW-015-03 Trust Transaction Audit — append-only in-memory store._
