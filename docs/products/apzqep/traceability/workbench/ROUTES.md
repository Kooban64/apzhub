# Routes — APZQEP-ENG-030C

Canonical path constants: `packages/qep-traceability/src/presentation/routes.ts`.  
**Prefix:** `/workspace/qep/traceability` — workspace shell prefix, **not** `/qep/`.

| Path | Component | Permission (nav) |
| --- | --- | --- |
| `/workspace/qep/traceability` | Router → Explorer | `qep.traceability.trace_links.view` |
| `/workspace/qep/traceability/trace-links` | `QepTraceLinksListView` | `qep.traceability.trace_links.view` |
| `/workspace/qep/traceability/trace-links/new` | `QepTraceLinkCreateView` | create gated server-side |
| `/workspace/qep/traceability/trace-links/supersede` | `QepTraceLinkSupersedeView` | supersede gated server-side |
| `/workspace/qep/traceability/trace-links/{id}` | `QepTraceLinkDetailView` | view + action DTO |
| `/workspace/qep/traceability/trace-links/{id}/history` | `QepTraceLinkHistoryView` | `qep.traceability.trace_links.history.view` |
| `/workspace/qep/traceability/matrix` | `QepTraceMatrixView` | `qep.traceability.trace_links.view` |
| `/workspace/qep/traceability/taxonomy` | `QepTraceTaxonomyBrowserView` | `qep.traceability.taxonomy.view` |

Reserved segments `new` and `supersede` are never treated as Trace Link ids (`parseQepTraceLinkRouteId`).
