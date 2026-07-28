# Repositories — APZQEP-ENG-060B

## Port (Domain, additive)

`TestPlanRepository` (`src/domain/test-plan/plan-repository.ts`) — `create`, `get`, `getByNumber`, `save(plan, expectedRevision)`, `list`, `exists`, `existsByNumber`, `listHistory`, `listRevisions`.

Domain never imports drizzle/pg. `StoredTestPlan` is the persisted aggregate shape (`TestPlan` minus transient `uncommittedEvents`).

## Implementations

| Impl      | Factory                            |
| --------- | ---------------------------------- |
| In-memory | `createInMemoryTestPlanRepository` |
| Postgres  | `createPostgresTestPlanRepository` |

Persistence factories:

- `createQepTestPlanPersistence({ mode: "memory" \| "postgres", ... })`
- `createQepTestPlanPersistenceForProduction` (Postgres required — no silent in-memory fallback)
- `createQepTestPlanPersistenceForTest` (Postgres or explicit `allowInMemoryPersistence: true`)

## Rules

- No business rules in repositories
- Optimistic concurrency on `save` (`expectedRevision` compared against stored `revision`; mismatch raises `REVISION_CONFLICT`)
- Unique plan number allocation enforced at create/clone/supersede (`existsByNumber`)
- History append-only via `listHistory`
- Revision/version lineage recorded via `listRevisions`
