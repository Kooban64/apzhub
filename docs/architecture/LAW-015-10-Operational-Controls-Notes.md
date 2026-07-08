# LAW-015-10 — Operational Controls Notes

> **Story:** LAW-015-10  
> **Scope:** Trust operational governance controls  
> **Status:** Complete — in-memory only

---

## Control model

Operational controls sit **above** domain workflow services and **below** future API/UI layers. Posting to the ledger always flows through existing domain services; the approval layer only gates whether posting is permitted.

```text
User action
    ↓
TrustApprovalService (governance)
    ↓
Domain workflow service (TrustTransactionWorkflow / Transfer / Interest)
    ↓
TrustLedgerService (accounting authority)
```

---

## Rule configuration

Rules are tenant-scoped and type-scoped (`trust_transaction`, `trust_transfer`, `interest_posting`, `allocation_adjustment`). The active rule for a type is the most recently registered active rule.

| Control              | Implementation                                             |
| -------------------- | ---------------------------------------------------------- |
| No approval required | `no_approval_required` mode or threshold below minimum     |
| Single approver      | `single_approver` — one distinct actor                     |
| Dual approval        | `dual_approval` — two distinct actors                      |
| Threshold-based      | `threshold_based` — approval count when amount ≥ threshold |
| Role-based           | `role_based` — actor must hold allowed role                |

---

## Segregation of duties

| Control                  | Enforcement                                                 |
| ------------------------ | ----------------------------------------------------------- |
| Self-approval prevention | Default `preventSelfApproval: true` on rules                |
| Duplicate approval       | Same actor cannot approve twice                             |
| Role eligibility         | `allowedRoles` checked on approve/reject                    |
| Tenant isolation         | All repository keys and service checks scoped by `tenantId` |

---

## Posting gate

Before domain services post:

1. Resolve active rule for approval type
2. Find active approval request for subject (if any)
3. `isPostingAllowed` returns true when:
   - No rule or `no_approval_required`
   - Threshold resolves to zero approvers
   - Request status is `approved` or `posted`

Failure throws `TRUST_APPROVAL_REQUIRED`.

---

## Audit trail

Append-only history on every state change:

| Field                          | Purpose                                      |
| ------------------------------ | -------------------------------------------- |
| `actorUserId`                  | Who performed the action                     |
| `action`                       | submit, approve, reject, cancel, mark_posted |
| `reason`                       | Optional/required reason text                |
| `previousStatus` / `newStatus` | State transition record                      |
| `occurredAt`                   | ISO timestamp                                |

History records are immutable — no update or delete operations on the repository.

---

## Diagnostics

Session-scoped diagnostics track:

- Pending approvals (submitted count)
- Approved / rejected / cancelled counts
- Average approval time (successful approve operations)
- Rule usage frequency
- Operation failures

Accessible via `TrustApprovalService.buildDiagnosticsSnapshot(tenantId)`.

---

## Workbench integration

`shared-trust-workbench.ts` wires a shared `TrustApprovalService` into workflow, transfer, and interest services. Demo seed data does not configure approval rules by default — posting works without governance until rules are registered.

---

## Future work (LAW-015-11+)

- Persist rules and requests to PostgreSQL
- Approval queue UI in trust workbench
- PermissionService-backed role resolution
- Wire `allocation_adjustment` type to `TrustAllocationService.adjust`
- Notification delivery on pending approvals via Event Bus
