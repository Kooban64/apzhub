# ADR-0049: Persistent Entity Mapping Store (PostgreSQL)

## Status

Accepted — OSS-110-05

## Context

OSS-110-03 introduced `EntityMappingStore` with an in-memory implementation. Production-capable environments require durable, tenant-scoped persistence of APZHUB global ID ↔ provider-native ID bindings without changing platform-service consumers. Persistence must follow the repository’s established Drizzle + `pg` + drizzle-kit stack in `@apzhub/config` (ADR-0002) and must not introduce a second ORM.

## Decision

1. **Schema ownership:** Table `platform_entity_mapping` lives in `@apzhub/config` (Drizzle schema + SQL migration `0015_platform_entity_mapping`).
2. **Implementation ownership:** `PostgresEntityMappingStore` lives in `@apzhub/platform-services` and implements the existing `EntityMappingStore` contract. Consumers depend only on the interface.
3. **Uniqueness boundaries (database-enforced):**
   - Primary key: `platform_id` (APZHUB global ID)
   - Partial unique index on `(tenant_id, entity_type, provider_id, provider_native_id)` **where** `status IN ('active','pending')`
   - Inactive/orphaned rows may reuse a provider-native identity after rebind
4. **Optimistic concurrency:** Integer `revision` starting at 1; updates require matching revision (application check + `WHERE revision = expected`); conflicts surface as `MAPPING_REVISION_CONFLICT`.
5. **Tenancy:** `tenant_id` is mandatory on every row. Optional `organisation_id` is additive scope for isolation/filtering — not part of the uniqueness key in this milestone.
6. **Bootstrap:** `ENTITY_MAPPING_STORE_MODE=memory|postgres`. Default `memory` outside production; default `postgres` in production. PostgreSQL mode never silently falls back to memory. Production memory requires `ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION=true`.
7. **Transactions:** Single-store operations that need atomicity (update/remove) use local PostgreSQL transactions. Provider API calls are never combined into the same transaction; `RECONCILIATION_REQUIRED` remains the control for provider-create success + mapping-persist failure.
8. **Error translation:** Database failures map to platform error codes without leaking SQL, connection strings, credentials, or table names.

## Alternatives considered

1. **Prisma / Kysely** — rejected; violates single-ORM policy (ADR-0002).
2. **Store schema only in platform-services** — rejected; all platform tables are owned by `@apzhub/config` migrations.
3. **Always-on soft fallback to memory** (personalisation pattern) — rejected for mapping; production must fail clearly when postgres is required.

## Consequences

- `InMemoryEntityMappingStore` remains for tests and explicit local/dev use.
- Shared contract tests run against both implementations.
- Adapters never write mapping tables; orchestration owns writes.
- Future RLS policies may tighten tenant isolation further; application-level scope checks are mandatory now.

## Related

- [ADR-0002](./ADR-0002-drizzle-orm-selection.md)
- [ADR-0048](./ADR-0048-apzhub-global-entity-id-strategy.md)
- [Entity Mapping Specification](../specs/APZHUB-Entity-Mapping-Specification.md)
- OSS-110-05 completion report
