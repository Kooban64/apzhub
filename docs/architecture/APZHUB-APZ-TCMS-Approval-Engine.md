# APZ TCMS — Approval Engine

**Milestone:** APZTCMS-006  
**Service:** `ApprovalService` in `@apzhub/testing-services` **0.2.0**

---

## Capabilities

- `requestApproval` / `submitForReview`
- `assignApprovalRole` (author / reviewer / approver)
- `approveApproval` / `rejectApproval` / `requestRework` / `withdrawApproval`
- `signApproval` / `witnessApproval` (placeholders)
- `listApprovalHistory` — append-only

Executions bind via `subjectKind = "manual_execution"` + `subjectId`.

---

## Multi-stage approvals

Configuration (`execution.approvalStages`):

```ts
{
  stageKey: string;
  requiredRole: ApprovalRole;
  ordinal: number;
}
[];
```

When stages are defined for a manual-execution subject, each stage must be decided before the approval reaches final `approved`. Stage progress is persisted on the approval record (`stagesJson` / current stage fields from migration `0022`).

---

## Execution coupling

`ManualExecutionService.submitForReview` / `approve` / `reject` advance execution status (`under_review` / `approved` / `rejected`) and may create or update linked approval records. Rework returns execution toward `in_progress`.

---

## Related

[Execution State Machine](./APZHUB-APZ-TCMS-Execution-State-Machine.md) · [Execution History](./APZHUB-APZ-TCMS-Execution-History.md)
