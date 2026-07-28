# ENG-100D Execution Plan (planning only)

## Objective

Implement Infrastructure adapters and versioned REST API for Test Execution per OES-ENG-090A PART-03 §3–7 and PART-04 — wiring Application ports to PostgreSQL, outbox, audit, search publication, and `/api/v1/qep/executions/*` Route Handlers.

## Preconditions

1. ENG-100C Accepted / Wave 3 Baselined
2. Owner AUTHORISE ENG-100D
3. Application services + port contracts stable

## Sequence

1. Persistence schema (logical tables from PART-03 §4) + migrations under authorised programme only
2. `TestExecutionRepository` / `ExecutionHistoryStore` Drizzle (or platform) adapters + optimistic concurrency
3. `EventOutboxPort` + `AuditPort` + `SearchPublicationPort` adapters
4. `SourceResolutionPort` via frozen Plan/Spec package/service interfaces
5. `PermissionPort` → PermissionService; `EvidenceAccessPort` validation
6. REST Route Handlers per PART-04 catalogue — Gateway path only; no business logic in handlers
7. Request validation (Zod), response envelope, correlation IDs
8. Integration tests (DB + API) + keep Domain/Application unit tests green
9. Flip `QEP_TEST_EXECUTION_INFRASTRUCTURE_STATUS`
10. Wave evidence + Owner pack; parallel plan ENG-100E (if Instruction authorises planning)

## Out of scope

Workbench UI · ENG-100E · redesign of Domain/Application · non-CE enterprise dependencies
