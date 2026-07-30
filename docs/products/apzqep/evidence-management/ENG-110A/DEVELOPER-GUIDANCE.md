# Developer Guidance — Populating Evidence Scaffolding

## Wave model (Owner refinement)

Distinguish:

| Kind                | Purpose                                                                              | Example                                    |
| ------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| **Foundation Wave** | Structure, contracts, DI hooks, test framework, registration — no business behaviour | **ENG-110A** (this programme)              |
| **Feature Wave**    | Incremental domain/application behaviour with validation                             | ENG-110B Domain · ENG-110C Application · … |

Lifecycle Standard v1.0 is **not** revised by this note; it is operating guidance for Evidence Management engineering.

## Recommended Feature Wave sequence (not authorised)

1. **ENG-110B — Domain** — aggregates, commands, lifecycle, integrity (SHA-256), invariants + domain tests
2. **ENG-110C — Application** — use-cases, fail-closed ACL, availableActions
3. **ENG-110D — Infrastructure & API** — StoragePort adapter (tech ADR), persistence, REST handlers, events
4. **ENG-110E — Workbench** — explorer/preview surfaces

## Rules when populating

1. Do not weaken default-deny / fail-closed.
2. Do not put storage SDKs in Domain.
3. Do not modify `@apzhub/qep-test-execution` without a TE programme.
4. Flip layer status markers when a wave completes (`scaffolded-eng-110a` → `implemented-eng-110b`, etc.).
5. Expand `architecture-boundaries.test.ts` rather than removing it.
