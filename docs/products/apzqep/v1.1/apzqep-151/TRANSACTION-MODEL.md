# Transaction Model

- `runInDatabaseTransaction(db, fn)` + ALS `getDatabaseExecutor`
- Cap mutators proxied through `runInTransaction` when postgres is active
- Aggregate save + outbox insert share one transaction
- Nested calls reuse existing ALS executor
- No distributed transactions
