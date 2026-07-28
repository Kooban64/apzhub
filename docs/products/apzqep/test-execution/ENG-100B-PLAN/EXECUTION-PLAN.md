# ENG-100B Execution Plan (planning only)

## Objective

Implement the pure `TestExecution` Domain inside `@apzhub/qep-test-execution` per APZQEP-OES-ENG-090A PART-02 / APPENDIX-B/C/D, under the Engineering Build Contract.

## Preconditions

1. APZQEP-ENG-100A Accepted (scaffolding present).
2. Explicit Owner AUTHORISE APZQEP-ENG-100B.
3. Architecture ARCH-015 and OES-ENG-090A unchanged.

## Sequence (estimated)

1. Value objects (`ExecutionStatus`, `ExecutionMode`, outcomes, context, assignment, refs)
2. Entities (`ExecutionManifest`, `ExecutionStep`, observations, review, external submission)
3. Aggregate root `TestExecution` + factories / rehydrate
4. Commands (create → supersede / ingest per catalogue)
5. Policies + Domain services (`ManifestSealer`, `OutcomeDeriver`, history recorder, ingestion correlator)
6. Domain events (raise only; no publish)
7. Domain error model
8. Unit / table tests for lifecycle matrix and invariants
9. Update package markers (`DOMAIN_STATUS` → implemented for Domain Wave)
10. Wave evidence + Owner pack

## Out of scope for ENG-100B

Persistence · Application · availableActions · REST · Workbench · events outbox publish · migrations
