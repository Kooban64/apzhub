# LAW-015-10 — Trust Approvals & Operational Controls — Completion Report

> **Story:** LAW-015-10  
> **Status:** **Complete**  
> **Date:** 2026-07-07  
> **Verdict:** TRUST APPROVAL GOVERNANCE DELIVERED — await owner approval before LAW-015-11

---

## Summary

LAW-015-10 introduces operational governance over Trust Accounting through `TrustApprovalService`. Configurable in-memory approval rules gate posting on trust transactions, transfers, interest postings, and allocation adjustments. The ledger remains the accounting authority — no accounting logic was moved into the approval layer.

---

## Deliverables

| Deliverable                 | Location                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| Approval types              | `apps/law-platform/lib/trust/trust-approval-types.ts`                                                |
| Approval service            | `apps/law-platform/lib/trust/trust-approval-service.ts`                                              |
| Repository + in-memory impl | `trust-approval-repository.ts`, `in-memory-trust-approval-repository.ts`                             |
| Validator                   | `trust-approval-validator.ts`                                                                        |
| Diagnostics                 | `trust-approval-diagnostics.ts`                                                                      |
| Events                      | `trust-approval-events.ts`                                                                           |
| Integration gate            | `trust-approval-gate.ts`                                                                             |
| Workbench wiring            | `shared-trust-workbench.ts`                                                                          |
| Approval notes              | [LAW-015-10-Trust-Approval-Notes.md](../architecture/LAW-015-10-Trust-Approval-Notes.md)             |
| Operational controls notes  | [LAW-015-10-Operational-Controls-Notes.md](../architecture/LAW-015-10-Operational-Controls-Notes.md) |

---

## Approval workflow

```text
Draft → Submitted → Approved → Posted
                 ↘ Rejected
                 ↘ Cancelled
```

When rule mode is `no_approval_required` or threshold resolves to zero approvers, submit auto-approves.

---

## Approval types

| Type                    | Subject reference                            |
| ----------------------- | -------------------------------------------- |
| `trust_transaction`     | Transaction draft ID                         |
| `trust_transfer`        | Trust transfer ID                            |
| `interest_posting`      | Interest posting ID                          |
| `allocation_adjustment` | Allocation adjustment reference (extensible) |

---

## Rule modes

| Mode                   | Behaviour                              |
| ---------------------- | -------------------------------------- |
| `no_approval_required` | Submit auto-approves                   |
| `single_approver`      | One distinct approver                  |
| `dual_approval`        | Two distinct approvers                 |
| `threshold_based`      | Approval count when amount ≥ threshold |
| `role_based`           | Role-eligible approvers                |

---

## Events emitted

| Event                            | When                                    |
| -------------------------------- | --------------------------------------- |
| `legal.trust.approval.submitted` | Request enters submitted state          |
| `legal.trust.approval.approved`  | Fully approved (including auto-approve) |
| `legal.trust.approval.rejected`  | Rejected with reason                    |
| `legal.trust.approval.cancelled` | Cancelled by submitter                  |

---

## Integration

| Service                           | Gate                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `TrustTransactionWorkflowService` | `assertCanPost` before `postDraft`; `markPosted` after post                        |
| `TrustTransferService`            | `assertCanPost` before `postTransfer`; domain approve requires governance approval |
| `TrustInterestService`            | Same pattern for interest postings                                                 |

Optional `approvalService` injection — services behave as before when approval service is absent.

---

## Test report

**Trust approval tests:** 15 new tests — all passed

| Area                      | Coverage |
| ------------------------- | -------- |
| Single approval           | ✅       |
| Dual approval             | ✅       |
| Rejection                 | ✅       |
| Cancellation              | ✅       |
| Threshold rules           | ✅       |
| Self-approval prevention  | ✅       |
| Role validation           | ✅       |
| Audit history             | ✅       |
| Diagnostics               | ✅       |
| Tenant isolation          | ✅       |
| Transfer integration gate | ✅       |

**Trust module total:** 118 tests (103 prior + 15 approval)

**Full suite:** 1803 passed · 0 failed · 42 skipped

---

## Coverage

| Metric     |   Result   | Target (80%) |
| ---------- | :--------: | :----------: |
| Lines      | **90.23%** |      ✅      |
| Statements | **90.23%** |      ✅      |
| Functions  | **90.48%** |      ✅      |
| Branches   | **87.09%** |      ✅      |

---

## Quality gates

| Gate                 |              Result               |
| -------------------- | :-------------------------------: |
| `pnpm lint`          |              ✅ PASS              |
| `pnpm typecheck`     |              ✅ PASS              |
| `pnpm build`         |              ✅ PASS              |
| `pnpm test`          | ✅ PASS — 1803 passed, 0 failures |
| `pnpm test:coverage` |              ✅ PASS              |

---

## Technical debt

| ID     | Item                                                                                  | Severity | Target                          |
| ------ | ------------------------------------------------------------------------------------- | -------- | ------------------------------- |
| TD-T35 | Approval rules in memory only — lost on refresh                                       | High     | LAW-015-11 persistence          |
| TD-T36 | No approval workbench UI — service layer only                                         | Medium   | LAW-015-11+ UI                  |
| TD-T37 | Role resolution uses caller-supplied roles, not PermissionService                     | Medium   | LAW-015-11 IAM integration      |
| TD-T38 | Allocation adjustment approval type defined but not wired to AllocationService.adjust | Medium   | LAW-015-11                      |
| TD-T39 | No email/notification on pending approvals                                            | Low      | Events + Notification Framework |

---

## Recommendation for LAW-015-11

Proceed with **LAW-015-11 — Trust REST APIs & PostgreSQL persistence**. Expose trust and approval operations at `/api/law/v1/trust/*`; persist approval rules, requests, and append-only history; wire workbench UI for pending approvals queue.

---

## Stop condition

LAW-015-10 complete. **Await owner approval before LAW-015-11** (REST APIs, PostgreSQL persistence, exports, or Financial Engine extraction).
