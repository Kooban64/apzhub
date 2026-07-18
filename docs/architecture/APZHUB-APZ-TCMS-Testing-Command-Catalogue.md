# APZ TCMS — Testing Command Catalogue

**Product:** APZ TCMS  
**Module:** Testing (`testing`)  
**Milestone:** APZTCMS-010  
**Authority:** [019](../019-universal-command-palette-action-framework.md) · [Testing Workbench Architecture](./APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md)

---

## Overview

Workbench commands are defined in `apps/web/lib/testing/commands.ts` as `TESTING_COMMANDS`. Execution flows:

```text
UI control (button / form)
        ↓
executeTestingCommand(commandId, args, permissions)
        ↓
Permission check (hasTestingPermission)
        ↓
testing-api.ts wrapper
        ↓
TestingClient method (mock transport in APZTCMS-010)
```

Commands never call domain services, repositories, or HTTP directly.

---

## Command registry

| Command ID         | Label                        | Permission                         | Args type                   | Client delegation                         |
| ------------------ | ---------------------------- | ---------------------------------- | --------------------------- | ----------------------------------------- |
| `create_plan`      | Create test plan             | `testing.plans.create`             | `CreatePlanInput`           | `createPlan`                              |
| `create_suite`     | Create test suite            | `testing.suites.create`            | `CreateSuiteInput`          | `createSuite`                             |
| `create_case`      | Create test case             | `testing.cases.create`             | `CreateCaseInput`           | `createCase`                              |
| `start_execution`  | Start execution              | `testing.executions.execute`       | `StartExecutionInput`       | `startExecution`                          |
| `pause_execution`  | Pause execution              | `testing.executions.execute`       | `{ executionId }`           | `pauseExecution`                          |
| `resume_execution` | Resume execution             | `testing.executions.execute`       | `{ executionId }`           | `resumeExecution`                         |
| `submit_evidence`  | Submit evidence              | `evidence.register`                | `EvidenceSubmitInput`       | `submitEvidence`                          |
| `approve`          | Approve certification        | `certification.approve`            | `CertificationDecisionArgs` | `decideCertification` (decision: approve) |
| `reject`           | Reject certification         | `certification.reject`             | `CertificationDecisionArgs` | `decideCertification` (decision: reject)  |
| `review`           | Send certification to review | `certification.review`             | `CertificationDecisionArgs` | `decideCertification` (decision: review)  |
| `archive`          | Archive certification        | `certification.records.transition` | `{ certificationId }`       | `archiveCertification`                    |

---

## UI surfacing

| Surface                  | Commands shown                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Plans view**           | `create_plan` (header action when permitted)                                                           |
| **Suites view**          | `create_suite` (header form when permitted)                                                            |
| **Cases view**           | `create_case` (header form when permitted)                                                             |
| **Execution detail**     | `start_execution`, `pause_execution`, `resume_execution`, `submit_evidence` via `TestingCommandsPanel` |
| **Certification detail** | `review`, `approve`, `reject`, `archive` via `TestingCommandsPanel`                                    |

Commands without permission are hidden (not merely disabled) in `TestingCommandsPanel`. Catalog create forms use `canCreatePlan` / `canCreateSuite` / `canCreateCase` helpers.

---

## Error handling

| Code              | Meaning                                                      |
| ----------------- | ------------------------------------------------------------ |
| `FORBIDDEN`       | Missing required permission (403)                            |
| `UNKNOWN_COMMAND` | Unrecognised command ID (400)                                |
| Client errors     | Propagated via `TestingClientError` → `toTestingUserMessage` |

---

## Manifest palette commands (future UCP)

Parent manifest declares palette entries for Command Palette integration (not fully wired in APZTCMS-010):

| Manifest ID                    | Permission                   |
| ------------------------------ | ---------------------------- |
| `testing.open`                 | `testing.view`               |
| `testing.plan.create`          | `testing.plans.create`       |
| `testing.suite.create`         | `testing.suites.create`      |
| `testing.case.create`          | `testing.cases.create`       |
| `testing.execution.start`      | `testing.executions.execute` |
| `testing.certification.review` | `certification.review`       |

Workbench `TESTING_COMMANDS` IDs use snake_case; manifest IDs use dot notation — map at palette registration time in a future milestone.

---

## Fixture defaults (technical debt)

Catalog create flows default to fixture IDs from `FIXTURE_IDS` in `mock-client.ts`:

| Field                    | Default fixture                         |
| ------------------------ | --------------------------------------- |
| Suite create → planId    | `plan_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1` |
| Case create → suiteId    | `suite_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2` |
| Start execution → caseId | `case_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa3`  |

Replace with plan/suite pickers when HTTP APIs and live data are available.

---

## Related

- [Testing View Catalogue](./APZHUB-APZ-TCMS-Testing-View-Catalogue.md)
- [Permission Catalogue](./APZHUB-APZ-TCMS-Permission-Catalogue.md)
- [Developer Guide](./APZHUB-APZ-TCMS-Developer-Guide.md)
