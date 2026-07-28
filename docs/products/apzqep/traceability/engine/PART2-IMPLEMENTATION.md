# Part 2 Implementation — APZQEP-ENG-030A

| Area | Delivery |
| --- | --- |
| Persistence | Tables `qep_trace_link`, `qep_trace_link_history`, `qep_trace_link_taxonomy`; migrations **0079** / **0080** (RLS) |
| Repositories | PostgreSQL + in-memory; contract tests |
| Endpoint resolution | Contract + in-memory registry; optional requirements adapter |
| Application | Commands/queries via `createTraceLinkApplicationService` |
| availableActions | Server-authoritative via `computeQepTraceLinkAvailableActions` |
| REST | `/api/v1/qep/traceability/trace-links/*` |
| Permissions | `qep.traceability.trace_links.*` / `taxonomy.*` |
| Audit | `qep.trace_link.*` actions via audit appender |
| Search | Projection entity `trace_link` |
| Observability | `onObservation` hooks on commands/queries |
| Package | `@apzhub/qep-traceability` **0.2.0** |

## Explicit non-delivery

Workbench · React · Coverage Engine · Impact Engine · AI · MCP · Part 3 · Verification/Evidence/Certification domains.
