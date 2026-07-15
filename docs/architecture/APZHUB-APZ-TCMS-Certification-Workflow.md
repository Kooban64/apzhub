# APZ TCMS — Certification Workflow

**Milestone:** APZTCMS-009  
**Source:** `packages/testing-services/src/certification/state-machine.ts`

---

## Canonical states

| State | Role |
| --- | --- |
| `draft` | Created |
| `preparing` | Assembling inputs |
| `awaiting_evidence` | Evidence incomplete |
| `awaiting_review` | Ready for reviewers |
| `in_review` | Under review |
| `changes_required` | Rework requested |
| `awaiting_approval` | Pending final approvers |
| `approved` | Human-approved |
| `conditionally_approved` | Approved with conditions |
| `rejected` | Rejected |
| `expired` | Past validity |
| `archived` | Soft-closed |

Legacy readiness codes (`development_ready`, `certified`, …) canonicalize into this workflow where applicable.

---

## Transition rules (summary)

All transitions go through `assertCertificationTransition`. No direct status mutation.

```text
draft → preparing | archived
preparing → awaiting_evidence | awaiting_review | archived
awaiting_evidence → preparing | awaiting_review
awaiting_review → in_review | changes_required | archived
in_review → changes_required | awaiting_approval | rejected
changes_required → preparing | awaiting_review
awaiting_approval → approved | conditionally_approved | rejected | changes_required
approved → expired | archived
conditionally_approved → approved | expired | changes_required | archived
rejected → preparing | archived
expired → preparing | archived
archived → (restore with certification.override → draft/preparing)
```

`approve` / `conditionallyApprove` require `certification.approve` and an authorised human actor.  
