# WF-P1-03 — Business journey / process daily path

| Field  | Value            |
| ------ | ---------------- |
| ID     | **WF-P1-03**     |
| Status | **Closed**       |
| Date   | 20260808T131000Z |

## Happy path (repository)

```text
/workspace/workflow
  → /workspace/workflow/journeys          (WorkflowBusinessJourneysView)
  → /workspace/workflow/journeys/{id}     (WorkflowBusinessJourneyDetailView)
  → /workspace/workflow/templates         (WorkflowProcessTemplatesView)
  → /workspace/workflow/monitoring        (WorkflowProcessMonitoringView)
```

Wired in `workflow-workspace-router.tsx`; HTTP via `handlers/business-process.ts` + `business-process-api.ts`.

No redesign — residual verification only.

## Tests

- `apps/web/components/workflow/workflow-daily-path.test.ts` — **PASS**
