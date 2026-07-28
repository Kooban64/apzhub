# Repositories — APZQEP-ENG-050B

## Port (Domain)

`TestSpecificationRepository` — create, get, save(expectedRevision), list, exists, listHistory, listVersionsByNumber, findLatestApprovedByNumber, listRelationships.

Domain never imports drizzle/pg.

## Implementations

| Impl | Factory |
| ---- | ------- |
| In-memory | `createInMemoryTestSpecificationRepository` |
| Postgres | `createPostgresTestSpecificationRepository` |

Persistence factories:

- `createQepTestSpecificationPersistence`
- `createQepTestSpecificationPersistenceForProduction` (Postgres required)
- `createQepTestSpecificationPersistenceForTest`

## Rules

- No business rules in repositories
- Optimistic concurrency on `save`
- History append-only
- Relationships synced on persist
- Version index upserted on create/save
