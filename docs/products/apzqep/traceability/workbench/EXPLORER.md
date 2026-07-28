# Explorer — APZQEP-ENG-030C

Implements ARCH-008 Trace Explorer as list-first presentation. Architecture: [EXPLORER-MODEL.md](../../architecture/traceability-workbench/EXPLORER-MODEL.md).

## Behaviour

- Component: `QepTraceLinksListView`
- Server-paginated list via `listTraceLinks` (bounded page size)
- Filters: Trace Type, lifecycle, source/target kind, confidence, strength, origin
- Row summary: type, endpoints, direction, lifecycle, confidence/strength, supersession indicator
- Actions: open detail, create, supersede entry points (permission + route)
- TanStack Query + `qepQueryKeys.traceability.list`
- Telemetry: `traceability.list.load`

## Non-goals

No Coverage % · no Impact · no full-graph materialisation · no client-side business rules
