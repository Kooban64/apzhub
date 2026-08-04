# APPROVAL-MODEL — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Default

**Human approval remains the default production model** for governed release decisions.

Any constrained automated approval path for production requires explicit architecture exception **and** later Product Board approval. None is authorised for unmanaged autonomous production GO in Wave 5.

## Roles (logical — map to PermissionService)

| Role / permission intent           | May                                        |
| ---------------------------------- | ------------------------------------------ |
| `orchestration.flow.request`       | Request flow start / release consideration |
| `orchestration.approval.approve`   | Approve within scope                       |
| `orchestration.approval.reject`    | Reject                                     |
| `orchestration.gate.waive`         | Waive blocking gate (audited)              |
| `orchestration.release.decide`     | Record GO / NO-GO / conditional / deferred |
| `orchestration.approval.delegate`  | Delegate approval authority (time-boxed)   |
| `orchestration.emergency.override` | Emergency path (dual-control recommended)  |

Exact permission strings are engineering concerns under APZQEP-165; names above are architectural intents.

## Hierarchy & separation of duties

- Requester ≠ sole approver for production-bound flows (SoD)
- Delegation is time-boxed, scope-limited, audited
- Dual-control available for emergency override and high-risk releases (policy)
- Product Board approval remains a **governance** event outside day-to-day flow approvals; flows may require a recorded Board reference for certain release classes

## Approval states

```text
NOT_REQUIRED → PENDING → APPROVED
                      → REJECTED
                      → ESCALATED
                      → EXPIRED
                      → DELEGATED_PENDING
```

## Channels

Approvals may be acted on via:

- Workspace approval UX (calls Platform Service)
- Command Palette actions (→ Platform Service)
- Notification action links (→ Platform Service)

**Never** via direct connector calls or client-side-only checks. Server is authoritative.

## Exception / emergency

Emergency override requires:

1. Permission
2. Reason code
3. Optional dual control
4. Immutable audit
5. Post-incident operational review flag

## Explicit exclusions

- Superadmin silent bypass
- Dashboard-owned GO without service path
- Unaudited chat/email approvals as system of record
