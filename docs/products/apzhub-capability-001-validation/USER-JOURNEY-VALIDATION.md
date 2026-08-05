# User Journey Validation

| Field     | Value                            |
| --------- | -------------------------------- |
| Programme | APZHUB-CAPABILITY-001-VALIDATION |
| Status    | **COMPLETE**                     |
| Timestamp | 20260805T101500Z                 |

## Purpose

Confirm common journeys can use Unified Work Experience without product ownership conflicts.

## Journeys

### Developer / Builder

| Step                       | Work experience                   | Owning product / baseline         | Conflict? |
| -------------------------- | --------------------------------- | --------------------------------- | --------- |
| See what needs me today    | My Work → Assigned / Due today    | Projection over Projects + APZQEP | None      |
| Complete a delivery action | Open Action → act in Projects     | APZ Projects                      | None      |
| Record effort              | Related Record → Time             | APZ Time                          | None      |
| Clear a quality gate       | Quality action / Ready to release | APZQEP                            | None      |

### Project Manager

| Step                      | Work experience                   | Owning product                         | Conflict?                       |
| ------------------------- | --------------------------------- | -------------------------------------- | ------------------------------- |
| Coordinate delivery       | Coordination / Deliverable items  | APZ Projects                           | None                            |
| Unblock team              | Blocked / Waiting for others      | Projection; actions in owning products | None                            |
| Link service issues       | Related Request                   | APZ Support (SoR)                      | None — Projects references only |
| Approve release readiness | Needs approval / Ready to release | APZQEP                                 | None                            |

### Support Agent

| Step                       | Work experience                      | Owning product                      | Conflict? |
| -------------------------- | ------------------------------------ | ----------------------------------- | --------- |
| Work service queue         | Assigned / Waiting for me (Requests) | APZ Support                         | None      |
| Use delivery context       | Related delivery reference           | APZ Projects (SoR for project/task) | None      |
| Escalate / approve service | Approval (service)                   | APZ Support                         | None      |

### QA Engineer

| Step              | Work experience                   | Owning product / baseline | Conflict? |
| ----------------- | --------------------------------- | ------------------------- | --------- |
| Quality actions   | Quality action queue              | APZQEP                    | None      |
| Release gates     | Ready to release / Needs approval | APZQEP                    | None      |
| Trace to delivery | Related delivery                  | APZ Projects              | None      |

### Executive

| Step                                | Work experience                | Owning product                    | Conflict? |
| ----------------------------------- | ------------------------------ | --------------------------------- | --------- |
| See organisational risk             | High priority / Blocked lenses | Projection across products        | None      |
| Escalated approvals                 | Needs approval                 | Owning product or APZQEP per item | None      |
| Avoid product-hopping for awareness | My Work / Needs attention      | Platform coordination             | None      |

### Operations

| Step               | Work experience                    | Owning product / baseline | Conflict? |
| ------------------ | ---------------------------------- | ------------------------- | --------- |
| Continuity signals | Needs my attention / High priority | Attention + product SoRs  | None*     |
| Release readiness  | Ready to release                   | APZQEP                    | None      |

\*Attention → My Work feed is a **coverage gap** (see Gap Register); ownership remains clear.

## Journey conflict summary

| Concern                             | Result                                               |
| ----------------------------------- | ---------------------------------------------------- |
| Product ownership conflicts         | **None identified**                                  |
| Forced second login                 | **None** (N-02 proven on RI products)                |
| Engine destinations required        | **None**                                             |
| Capability stealing product actions | **Not required** — deep work stays in owning product |

## Conclusion

**VALIDATED** for journeys across RI products + APZQEP. Residual gaps are coverage/process, not ownership conflicts.
