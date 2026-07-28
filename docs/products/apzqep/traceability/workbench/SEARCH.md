# Search — APZQEP-ENG-030C

Per Platform **020** and ARCH-008: discovery then authoritative detail.

| Stage | Behaviour |
| --- | --- |
| Discovery | Platform Search entity `trace_link` (ENG-030A Part 2 projection) and/or Explorer filters |
| Selection | Deep link into `/workspace/qep/traceability/trace-links/{id}` |
| Authority | Reload Trace Link via REST `getTraceLink` — Search index is never SoR |

Workbench must not treat search hits as mutable state or authoritative lifecycle source.
