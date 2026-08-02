# Durable Persistence Architecture

```text
Domain / Application Services
        ↓
Repository Port
        ↓
PostgreSQL Repository Adapter (getDatabaseExecutor / ALS TX)
        ↓
PostgreSQL (+ platform_outbox_event in same TX)
```

## Production provider

- Env: `APZQEP_CORE_QE_PERSISTENCE_MODE=postgres|memory`
- Production / staging / `APZQEP_CORE_QE_REQUIRE_POSTGRES=true`: PostgreSQL mandatory, fail closed
- In-memory retained only when explicitly allowed (unit tests / non-prod)

## Transactional outbox

Mutating Cap A–F application methods run inside `runInDatabaseTransaction`. Outbox enqueue uses the same ALS executor → aggregate + outbox commit or roll back together. Reuses `platform_outbox_event` via Cap publishers in web runtimes.

## In-memory adapters

Kept as test adapters (`allowInMemoryPersistence: true`). Not production default.
