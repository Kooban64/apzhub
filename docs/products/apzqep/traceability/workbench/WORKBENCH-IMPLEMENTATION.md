# Workbench Implementation — APZQEP-ENG-030C

Concise implementation notes. Architecture authority: [ARCH-008](../../architecture/traceability-workbench/README.md). Semantics: [ARCH-007](../../architecture/requirements-traceability/README.md). Grammar: [ARCH-006](../../architecture/requirements-workbench/README.md).

## Scope delivered

- Traceability Workbench UI under `/workspace/qep/traceability/*`
- Presentation contracts in `@apzhub/qep-traceability` **0.3.0** (`presentation/routes`, `navigation`, `permissions`)
- Module manifest `modules/qep-traceability` **0.3.0** with sidebar navigation
- Client API `apps/web/lib/qep/qep-traceability-api.ts` against ENG-030A Part 2 REST
- Views in `apps/web/components/qep/qep-traceability-views.tsx` (Explorer, Create, Detail, History, Supersede, Matrix, Taxonomy + router)
- Server-authoritative `availableActions` only — no client lifecycle inference
- Telemetry via `emitQepWorkbenchTelemetry` (`traceability.*` events)

## Architecture conformance

| Baseline | Conformance |
| --- | --- |
| ARCH-006 | Reuses Workbench grammar / shell regions; no shell redesign |
| ARCH-007 | Trace Link SoR ownership preserved; no Coverage/Impact ownership in UI |
| ARCH-008 | Explorer / Matrix / Inspector / History / Taxonomy / availableActions models implemented as presentation |
| ENG-030A | Consumes existing APIs/DTOs; no domain or API redesign |

## Explicit non-delivery

Coverage Engine · Impact Engine · graph visualisation · AI · MCP · Traceability Certification · Owner Acceptance of ENG-030C

## Primary code paths

| Layer | Path |
| --- | --- |
| Package presentation | `packages/qep-traceability/src/presentation/` |
| Views | `apps/web/components/qep/qep-traceability-views.tsx` |
| HTTP client | `apps/web/lib/qep/qep-traceability-api.ts` |
| Query keys | `apps/web/lib/qep/query-keys.ts` → `qepQueryKeys.traceability.*` |
| Module | `modules/qep-traceability/module.yaml` |
| Playwright smoke | `testing/playwright/e2e/apzqep-eng-030c-traceability-workbench.spec.ts` |
