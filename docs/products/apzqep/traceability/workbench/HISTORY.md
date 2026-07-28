# History — APZQEP-ENG-030C

## Behaviour

- Component: `QepTraceLinkHistoryView`
- Route: `/workspace/qep/traceability/trace-links/{id}/history`
- API: `getTraceLinkHistory` — Trace Link history summaries from ENG-030A
- Permission: `qep.traceability.trace_links.history.view`

## Distinct from Platform Audit

| Surface                       | Ownership                        | Purpose                                                                       |
| ----------------------------- | -------------------------------- | ----------------------------------------------------------------------------- |
| **Trace History** (this view) | Traceability bounded context     | Domain history of the Trace Link aggregate (lifecycle/field change summaries) |
| **Platform Audit**            | Platform Audit service (013/011) | Cross-cutting security/ops audit trail — not replaced by this UI              |

Workbench History is presentation of Trace Link history DTOs. It does **not** implement, mutate, or replace Platform Audit.
