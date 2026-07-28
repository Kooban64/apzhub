# Audit

Platform audit actions (via application audit appender):

- `qep.trace_link.created`
- `qep.trace_link.validated`
- `qep.trace_link.approved`
- `qep.trace_link.retired`
- `qep.trace_link.superseded`
- `qep.trace_link.confidence_changed`
- `qep.trace_link.authority_changed`
- `qep.trace_link.scope_changed`
- `qep.trace_link.rationale_changed`
- `qep.trace_link.provenance_changed` (where applicable)
- metadata / origin / endpoint change actions as emitted by the application service

**Distinction:** Trace History (domain table) records state evolution; Platform Audit records operational who/when/context. They are not merged.
