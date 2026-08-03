# API Guide — Automation (APZQEP-161)

All routes are **provider-neutral**. No Playwright-specific request or response shapes.

## Endpoints

| Method | Path                                              | Purpose                |
| ------ | ------------------------------------------------- | ---------------------- |
| GET    | `/api/v1/qep/automation/providers`                | List providers         |
| GET    | `/api/v1/qep/automation/executions`               | List executions        |
| POST   | `/api/v1/qep/automation/executions`               | Enqueue (optional run) |
| GET    | `/api/v1/qep/automation/executions/{executionId}` | Execution detail       |

## Create body (conceptual)

```json
{
  "providerId": "playwright",
  "correlationId": "<uuid>",
  "runImmediately": true,
  "target": { "kind": "url", "name": "workspace-smoke", "baseUrl": "about:blank" },
  "options": { "dryRun": true }
}
```

`tenantId` / `requestedBy` default from authenticated platform context when omitted.

## Envelope

Standard platform JSON data envelope with tracing. Errors use typed platform error codes (`VALIDATION_FAILED`, `AUTOMATION_ERROR`, …).
