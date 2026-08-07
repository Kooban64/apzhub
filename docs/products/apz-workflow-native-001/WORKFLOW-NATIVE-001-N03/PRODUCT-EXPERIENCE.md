# Product Experience — APZ-WORKFLOW-NATIVE-001-N03

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-03             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T165000Z |

## Native APZHUB chrome

| Element             | Implementation                                    |
| ------------------- | ------------------------------------------------- |
| Product name        | `WORKFLOW_PRODUCT_NAME = "APZ Workflow"`          |
| Breadcrumbs         | `PageShell` breadcrumbs on primary surfaces       |
| Help                | `workflow-help-view.tsx` + sidebar manifest       |
| Settings            | `workflow-settings-view.tsx` (no engine consoles) |
| Onboarding          | Home “Start with business intent”                 |
| Empty/Loading/Error | APZ Workflow framing in `workflow-ui.tsx`         |

## Business vocabulary

Prefer: Process, Stage, Step, Outcome, Participant, Approval, Exception, Escalation, Decision, Completion, Journey.

Removed from standard UX labels: Runs, Schedules, Workflow Engine, provider catalogue framing on Home.

## Journey catalogue

Static business journey catalogue (`lib/workflow/business-journeys.ts`) with seven Workflow Test–compliant journeys. Home surfaces the catalogue; dedicated Journeys routes list and detail.

## Administrative separation

Operator tools and operational history/timing remain role-gated (`workflow.admin`) and secondary. They never define the primary product chrome.
