# APZ TCMS — State Machines

**Milestone:** APZTCMS-004  
**Module:** `packages/testing-services/src/lifecycle/`

## Test status machine

| From             | Allowed to                   |
| ---------------- | ---------------------------- |
| draft            | review, archived             |
| review           | approved, draft, archived    |
| ready / approved | deprecated, archived, review |
| deprecated       | archived, approved           |
| archived         | _(terminal)_                 |

## Execution status machine

| From                | Allowed to                         |
| ------------------- | ---------------------------------- |
| planned / queued    | in_progress, aborted               |
| in_progress         | paused, completed, aborted, failed |
| paused              | in_progress, aborted               |
| failed              | in_progress                        |
| completed / aborted | _(terminal for cancel)_            |

## Approval decision machine

| From        | Allowed to                                         |
| ----------- | -------------------------------------------------- |
| pending     | approved, rejected, withdrawn, conditional, rework |
| rework      | pending, withdrawn                                 |
| rejected    | rework, pending                                    |
| conditional | approved, withdrawn, rework                        |
| approved    | withdrawn                                          |
| withdrawn   | _(terminal)_                                       |

Pure functions: `canTransitionTestStatus`, `assertExecutionStatusTransition`, `assertApprovalDecisionAllowed`.
