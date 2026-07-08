# LAW-015-10 — Trust Approval Notes

> **Story:** LAW-015-10  
> **Layer:** Operational governance (not accounting)  
> **Status:** Complete — in-memory only

---

## Purpose

`TrustApprovalService` provides configurable operational governance over trust financial actions. It does **not** post to the ledger, allocate funds, or duplicate workflow logic in `TrustTransactionWorkflowService`, `TrustTransferService`, or `TrustInterestService`.

---

## Core entities

### TrustApprovalRule

In-memory configurable rule per tenant and approval type. Defines mode, threshold, required approver count, allowed roles, and self-approval policy.

### TrustApprovalRequest

Governance request linked to a subject entity (`subjectId` + `approvalType`). Tracks status, decisions, applied rule, and timestamps.

### TrustApprovalHistoryRecord

Append-only audit trail. Each action records actor, timestamp, action, reason, previous state, and new state. History records are never mutated.

---

## State machine

| Status      | Meaning                                                 |
| ----------- | ------------------------------------------------------- |
| `draft`     | Created but not yet submitted (reserved for future use) |
| `submitted` | Awaiting approver action                                |
| `approved`  | Required approvals satisfied                            |
| `posted`    | Underlying entity posted to ledger                      |
| `rejected`  | Rejected with mandatory reason                          |
| `cancelled` | Withdrawn by submitter                                  |

Valid transitions enforced by `TrustApprovalValidator.validateStatusTransition`.

---

## Service API

| Method              | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| `createRule`        | Register in-memory approval rule                                          |
| `submitForApproval` | Create/submit request; auto-approve when rule resolves to zero approvers  |
| `approve`           | Record approver decision; dual approval stays `submitted` until count met |
| `reject`            | Reject with reason                                                        |
| `cancel`            | Cancel draft/submitted request                                            |
| `markPosted`        | Transition approved → posted after domain service posts                   |
| `assertCanPost`     | Gate used by domain services before posting                               |
| `getHistory`        | Read append-only audit trail                                              |

---

## Events

In-memory event bus (`InMemoryTrustApprovalEventBus`) — no outbox:

- `legal.trust.approval.submitted`
- `legal.trust.approval.approved`
- `legal.trust.approval.rejected`
- `legal.trust.approval.cancelled`

---

## Integration pattern

`trust-approval-gate.ts` provides thin helpers injected into domain services:

```text
submitForApproval → approve(s) → domain approve (transfer/interest) → post → markPosted
```

Domain services call `assertTrustApprovalForPost` before posting and `assertTrustApprovalForDomainApprove` before domain-level approve when an approval request exists.

---

## File map

| File                                     | Role                                       |
| ---------------------------------------- | ------------------------------------------ |
| `trust-approval-types.ts`                | Domain types and enums                     |
| `trust-approval-service.ts`              | Orchestration service                      |
| `trust-approval-validator.ts`            | Transition, role, self-approval validation |
| `trust-approval-repository.ts`           | Persistence contract                       |
| `in-memory-trust-approval-repository.ts` | In-memory store + history                  |
| `trust-approval-diagnostics.ts`          | Session diagnostics                        |
| `trust-approval-events.ts`               | In-memory event bus                        |
| `trust-approval-gate.ts`                 | Domain service integration helpers         |

---

## Constraints honoured

- No APIs
- No persistence
- No email notifications
- No workflow designer
- No accounting logic in approval layer
