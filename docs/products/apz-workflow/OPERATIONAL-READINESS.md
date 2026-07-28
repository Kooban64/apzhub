# APZ Workflow — Operational Readiness (Planning)

> **Programme:** APZ-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## Enablement (foundation today)

| Control     | Requirement                                                     |
| ----------- | --------------------------------------------------------------- |
| SoR flag    | `APZHUB_WORKFLOW_ENABLED` (as documented for platform Workflow) |
| Engine flag | `APZHUB_WORKFLOW_ENGINE_ENABLED` (env-gated live n8n)           |
| Auth        | Better Auth session + Workflow permissions                      |
| Gateway     | Standard platform API pipeline                                  |

---

## Release 1.0 ops targets (when shipped)

1. Health hierarchy: platform → workspace → module → service → connector → engine
2. Diagnostics without exposing engine admin UI to standard users
3. Correlation IDs on runs, schedules, approvals
4. Credential references only — secrets never in logs/repos
5. Retry/backoff/DLQ for async execution workers (platform jobs patterns)
6. Alerting via Platform Notification Framework

---

## Operational gaps vs Release 1.0 intent

| Area                           | Today            | Release 1.0 need     |
| ------------------------------ | ---------------- | -------------------- |
| Execute/schedule ops runbooks  | Absent           | Required             |
| Approval ops                   | Absent           | Required             |
| Credential rotation UX         | Absent           | Required (refs only) |
| Cross-product incident mapping | Partial strategy | Productised          |

---

## Related

- n8n / Workflow Engine freeze & ops docs under `docs/architecture/APZHUB-Workflow-Engine-*`
- Portfolio pack: [workflow/](../workflow/README.md)
