# APZHUB APZ TCMS — Release Approval Model

**Milestone:** APZTCMS-014

## Stages

`technical` · `qa` · `business` · `security` · `executive`

Multiple stages may be required. Approvals are human-only — no automatic approval.

## Operations

- `requestApproval` / `decideApproval`
- `evaluateApprovals`
- `approveRelease` / `conditionallyApproveRelease` / `rejectRelease` (lifecycle transitions)

Decisions recorded with `isAutomatic: false`.
