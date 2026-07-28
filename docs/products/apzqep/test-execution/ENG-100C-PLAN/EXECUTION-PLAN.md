# ENG-100C Execution Plan (planning only)

## Objective

Implement Application layer for Test Execution per OES-ENG-090A PART-03: command/query services, `availableActions`, DTO mapping, orchestration over Domain — **no** persistence adapters, **no** REST handlers (ENG-100D).

## Preconditions

1. ENG-100B Accepted
2. Owner AUTHORISE ENG-100C
3. Domain `@apzhub/qep-test-execution` Domain API stable

## Sequence

1. Expand Application port method surfaces (still no Infra impl)
2. CommandContext / authz port usage patterns
3. `ExecutionCommandService` — one method per Domain command
4. `AvailableActionsService` — sole UI authority computer
5. `ExternalIngestionService` trust-boundary orchestration (ports mocked in tests)
6. Query services (get/list/assigned/review-queue/history/progress) returning DTOs + actions
7. Error mapping Domain → application error categories
8. Unit tests for availableActions matrix + command orchestration with in-memory fakes
9. Wave evidence + Owner pack
10. Parallel plan ENG-100D (if authorised in Instruction)

## Out of scope

SQL · drizzle · Route Handlers · Workbench · real outbox/search adapters (interfaces/fakes only)
