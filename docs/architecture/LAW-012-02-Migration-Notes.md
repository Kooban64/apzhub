# LAW-012-02 — Migration Notes

## Tooling

The repository uses **Drizzle ORM** (ADR-0002). LAW-012-02 extends the existing migration mechanism under `packages/config/drizzle/`.

| Item            | Detail                                                      |
| --------------- | ----------------------------------------------------------- |
| Schema          | `packages/config/src/db/legal-schema.ts`                    |
| Migration       | `packages/config/drizzle/0001_law_client_matter_outbox.sql` |
| Apply           | `pnpm db:migrate` (runs `scripts/db-migrate.ts`)            |
| Generate future | `pnpm db:generate`                                          |

## Tables created

| Table              | Purpose                     |
| ------------------ | --------------------------- |
| `law_client`       | Client aggregate root       |
| `law_matter`       | Matter aggregate root       |
| `law_outbox_event` | Outbox skeleton (no worker) |

## ID column type

Domain entity IDs use prefixed string identifiers (e.g. `c1000001-…`, `t0000001-…`) that are not always valid PostgreSQL `uuid` values. All primary and foreign key columns use **`text`** to preserve domain ID formats without transformation.

## Applying migrations

```bash
# Ensure PostgreSQL is running (Docker dev stack)
pnpm docker:up

# Apply all migrations including LAW-012-02
pnpm db:migrate
```

CI applies migrations before tests (`.github/workflows/ci.yml`).

## Seed strategy

| Mode       | Seed source                                                         |
| ---------- | ------------------------------------------------------------------- |
| `memory`   | In-memory constructors (`SEED_CLIENTS`, `SEED_MATTERS`)             |
| `postgres` | Auto-seed on first `getShared*Repository()` call for default tenant |

For isolated postgres tests, use `seedPostgresLawDataAsync()` from `apps/law-platform/lib/persistence/postgres-test-utils.ts`.

## Rollback

No automated down migration is provided. To rollback LAW-012-02 manually:

```sql
DROP TABLE IF EXISTS law_outbox_event;
DROP TABLE IF EXISTS law_matter;
DROP TABLE IF EXISTS law_client;
DELETE FROM drizzle.__drizzle_migrations WHERE tag = '0001_law_client_matter_outbox';
```
