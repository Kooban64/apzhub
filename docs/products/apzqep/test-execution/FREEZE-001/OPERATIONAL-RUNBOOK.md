# Operational Runbook — Test Execution 1.0.0-rc.1

## Service map

| Layer     | Location                                         |
| --------- | ------------------------------------------------ |
| Workbench | `/workspace/qep/test-execution/*`                |
| API       | `/api/v1/qep/executions/*`                       |
| Package   | `@apzhub/qep-test-execution`                     |
| Module    | `modules/qep-test-execution`                     |
| Tables    | `qep_test_execution*` (+ audit, history, outbox) |
| Authz     | `qep.execution.*` via platform gateway           |

## Common checks

| Symptom                       | Check                                                             |
| ----------------------------- | ----------------------------------------------------------------- |
| 503 QEP_SERVICE_UNAVAILABLE   | `APZHUB_QEP_ENABLED`; QEP bootstrap / gateway registration        |
| 403 on API/UI                 | User permissions; op-auth map                                     |
| 404 execution                 | Tenant scope; id; RLS `app.tenant_id`                             |
| 409 conflict                  | Optimistic revision mismatch — reload and retry                   |
| Empty action bar              | Expected when `availableActions` empty — do not invent UI actions |
| Events not arriving elsewhere | Expected under L-03 (enqueue-only)                                |

## Logging / correlation

Use platform correlation IDs on API requests. Audit rows land in `qep_test_execution_audit` after successful command persist.

## Monitoring

| Signal               | Source                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Platform health      | `GET /api/health`                                                                             |
| Error rates          | Platform/API logs for `/api/v1/qep/executions`                                                |
| Outbox depth         | `qep_test_execution_outbox` where `published_at` null — informational until dispatcher exists |
| Evidence association | Review who holds execute/associate permissions (L-02 control)                                 |

## Alerting hooks

No dedicated QEP-execution alert rules shipped in this RC. Inherit platform API 5xx / latency alerts. Recommend adding outbox lag alert when dispatcher is introduced.

## Mandatory GA tracker

Track **L-02 EvidenceAccessPort wiring** as mandatory corrective action before unrestricted GA (Owner Risk Acceptance condition).
