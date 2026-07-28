# Trace Link Creation — APZQEP-ENG-030C

## Behaviour

- Component: `QepTraceLinkCreateView`
- Route: `/workspace/qep/traceability/trace-links/new`
- Guided form: source endpoint → Trace Type → target → direction → strength/confidence/origin → scope → rationale → actor → submit
- API: `createTraceLink` (ENG-030A Part 2)
- Validation/errors from server envelope; form state preserved on recoverable failures
- Telemetry: `traceability.create.*`

## Constraints

- No inventing Trace Types outside taxonomy catalogue
- No Coverage/Impact fields
- Permissions enforced server-side (`qep.traceability.trace_links.create`)
