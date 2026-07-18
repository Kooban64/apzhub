# OSS-110-05 — Persistent Entity Mapping Store — Completion Report

**Milestone:** OSS-110-05  
**Date:** 2026-07-10  
**Status:** Complete  
**Package:** `@apzhub/platform-services` v0.4.0  
**Schema/migrations:** `@apzhub/config` (`0015_platform_entity_mapping`)  
**ADR:** [ADR-0049](../adr/ADR-0049-persistent-entity-mapping-store.md)

---

## Executive summary

OSS-110-05 delivers a production-ready PostgreSQL `EntityMappingStore` behind the existing contract. Platform-service consumers are unchanged. `InMemoryEntityMappingStore` remains for tests and explicit local use. Bootstrap selects memory vs postgres with validated configuration and **no silent production fallback**. Shared contract tests run against both implementations; PostgreSQL integration tests exercise migrations, uniqueness, tenancy, concurrency, orchestrator compatibility, and observability hooks.

---

## Milestone scope delivered

| Deliverable                                | Status     |
| ------------------------------------------ | ---------- |
| PostgreSQL schema + migration `0015`       | ✅         |
| DB uniqueness / check / indexes            | ✅         |
| `PostgresEntityMappingStore`               | ✅         |
| Transaction behaviour (update/remove)      | ✅         |
| Error translation (no SQL/credential leak) | ✅         |
| Tenant + organisation isolation            | ✅         |
| Bootstrap (`ENTITY_MAPPING_STORE_MODE`)    | ✅         |
| In-memory compatibility                    | ✅         |
| Shared contract test suite                 | ✅         |
| PostgreSQL integration tests               | ✅         |
| MappingOrchestrator compatibility tests    | ✅         |
| Persistence logging/metrics hooks          | ✅         |
| Documentation + ADR-0049                   | ✅         |
| Production AuthorizationProvider           | ⏸ Excluded |
| API routes / UI / Plane task CRUD          | ⏸ Excluded |
| Caching / background reconciliation        | ⏸ Excluded |

---

## Architecture overview

```text
Platform services / MappingOrchestrator
        ↓
EntityMappingStore (contract)
   ├── InMemoryEntityMappingStore
   └── PostgresEntityMappingStore
            ↓
     @apzhub/config (Drizzle + pg)
            ↓
     platform_entity_mapping
```

---

## Schema overview

Table `platform_entity_mapping`:

| Column                                             | Notes                                   |
| -------------------------------------------------- | --------------------------------------- |
| `platform_id`                                      | PK — APZHUB global ID                   |
| `entity_type`                                      | CHECK constrained canonical types       |
| `provider_id` / `integration_id`                   | Provider binding                        |
| `provider_native_id`                               | Engine-native ID                        |
| `parent_platform_id` / `parent_provider_native_id` | Optional hierarchy                      |
| `tenant_id`                                        | Required tenant scope                   |
| `organisation_id`                                  | Optional organisation scope             |
| `status`                                           | CHECK: active/inactive/pending/orphaned |
| `metadata`                                         | jsonb string map                        |
| `revision`                                         | Optimistic concurrency (≥ 1)            |
| `created_at` / `updated_at`                        | timestamptz                             |

---

## Migration list

| Tag                            | Purpose                                                                    |
| ------------------------------ | -------------------------------------------------------------------------- |
| `0015_platform_entity_mapping` | Create mapping table, checks, indexes                                      |
| Journal fix                    | Restored missing `0011_platform_identity` journal entry for clean installs |

Procedure: `pnpm db:migrate` (uses `scripts/db-migrate.ts` → drizzle migrate).

---

## Constraint and index strategy

**Uniqueness boundaries:**

1. `platform_id` PRIMARY KEY
2. Partial unique index `platform_entity_mapping_provider_native_active_uidx` on  
   `(tenant_id, entity_type, provider_id, provider_native_id)`  
   **WHERE** `status IN ('active','pending')`

**Supporting indexes:** tenant, tenant+organisation, provider, integration, entity_type, status, parent_platform_id, tenant+status.

---

## Store implementation details

- Canonical `EntityMappingRecord` only — no ORM row leakage
- Injectable `Database` for tests
- Observability via `MappingStoreLogger` / `MappingStoreMetrics` (in-memory helpers for tests; no Prometheus/OTel exporters)

---

## Transaction behaviour

| Operation           | Behaviour                                                  |
| ------------------- | ---------------------------------------------------------- |
| create              | Single insert; unique violations → `MAPPING_CONFLICT`      |
| update / deactivate | Transaction + revision predicate                           |
| remove              | Transactional delete                                       |
| Provider + DB       | Never combined; reconciliation-required on persist failure |

---

## Tenancy behaviour

- All rows require `tenant_id`
- Optional `organisationId` filters prevent cross-organisation resolution when supplied
- Cross-tenant `getByPlatformId` returns `null`

---

## Optimistic concurrency

`revision` increments on update; `expectedRevision` mismatch → `MAPPING_REVISION_CONFLICT`.

---

## Bootstrap and configuration

| Mode     | When                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| memory   | Default non-production; tests; explicit `ENTITY_MAPPING_STORE_MODE=memory`                 |
| postgres | Default production; explicit `ENTITY_MAPPING_STORE_MODE=postgres` + healthy `DATABASE_URL` |

Production memory requires `ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION=true`.  
Postgres mode never falls back to memory.

---

## Files created

```text
packages/config/src/db/platform-entity-mapping-schema.ts
packages/config/drizzle/0015_platform_entity_mapping.sql
packages/platform-services/src/mapping/postgres-entity-mapping-store.ts
packages/platform-services/src/mapping/create-entity-mapping-store.ts
packages/platform-services/src/mapping/map-persistence-error.ts
packages/platform-services/src/mapping/mapping-store-observability.ts
packages/platform-services/src/mapping/entity-mapping-store.contract.ts
packages/platform-services/src/mapping/entity-mapping-store.contract.test.ts
packages/platform-services/src/mapping/postgres-entity-mapping-store.integration.test.ts
docs/adr/ADR-0049-persistent-entity-mapping-store.md
docs/sprint/OSS-110-05-completion-report.md
```

---

## Files modified

```text
packages/config/src/db/client.ts, index.ts
packages/config/drizzle/meta/_journal.json
packages/config/src/governance/schema.ts, registry.ts
packages/platform-service-contracts/src/common/errors.ts
packages/platform-services/package.json (v0.4.0)
packages/platform-services/src/mapping/* (types, contract, in-memory, index)
packages/platform-services/src/services/create-platform-services.ts
packages/platform-services/src/index.ts
packages/platform-services/src/mapping-orchestration.test.ts
vitest.config.ts (config/db alias order)
docs/specs/APZHUB-Entity-Mapping-Specification.md
docs/architecture/APZHUB-Platform-Service-Implementation-Architecture.md
docs/foundation/CURRENT-*.md, AI-CONTEXT.md, ACTIVE-BACKLOG.md
docs/foundation/ADR-CATALOGUE.md, DECISION-REGISTER.md
docs/README.md, CHANGELOG.md, .env.example
packages/platform-services/README.md
```

---

## Tests added / statistics

| Suite                                                       | Result                          |
| ----------------------------------------------------------- | ------------------------------- |
| Shared contract (in-memory)                                 | 11 passed                       |
| Shared contract + PG integration + bootstrap + orchestrator | 28 passed                       |
| `@apzhub/platform-services` total                           | **96 passed**                   |
| `@apzhub/platform-service-contracts`                        | 8 passed                        |
| Plane adapter (`integrations/plane`)                        | 37 passed                       |
| Related (services + contracts + sdk + governance + plane)   | **185+** green in combined runs |

---

## Coverage

Mapping package area (~87% lines scoped to `packages/platform-services/src/mapping/**`). Postgres store, contract suite, bootstrap, and error translation covered by unit + integration tests.

---

## Quality-gate results

| Gate                                             | Result |
| ------------------------------------------------ | ------ |
| Typecheck (platform-services, contracts, config) | Pass   |
| ESLint (platform-services)                       | Pass   |
| Unit + contract tests                            | Pass   |
| PostgreSQL integration tests                     | Pass   |
| `pnpm db:migrate`                                | Pass   |
| Plane adapter tests                              | Pass   |
| Plane source modified                            | **No** |

---

## Backward-compatibility assessment

- Gateway public APIs unchanged
- `EntityMappingStore` methods additive (`organisationId` optional params)
- New error codes additive (`MAPPING_REVISION_CONFLICT`, `PERSISTENCE_UNAVAILABLE`)
- `createPlatformServices` still defaults to in-memory when store omitted
- New `createPlatformServicesFromEnv` for configured bootstrap

---

## Migration and deployment considerations

1. Apply migrations (`pnpm db:migrate`) before enabling postgres mode
2. Set `ENTITY_MAPPING_STORE_MODE=postgres` in production-capable environments
3. Ensure `DATABASE_URL` is configured and healthy
4. Do not enable memory mode in production without the explicit escape hatch

---

## Security considerations

- No credentials/connection strings/SQL in public errors or persistence logs
- Tenant/organisation scope enforced on reads
- Adapters cannot write mapping tables
- Metadata limited to string maps (no vendor payload dumps in observability)

---

## Technical debt

| Item                                                                 | Notes                                   |
| -------------------------------------------------------------------- | --------------------------------------- |
| No RLS policies on mapping table yet                                 | Application scope checks only           |
| organisationId not in uniqueness key                                 | Intentional for this milestone          |
| Global pg pool ignores alternate connection strings after first init | Pre-existing `@apzhub/config` behaviour |
| Automated reconciliation / repair                                    | Explicitly out of scope                 |

---

## Risks

| Risk                                      | Mitigation                                                      |
| ----------------------------------------- | --------------------------------------------------------------- |
| Operators leave memory mode in production | Default postgres in production + hard fail without escape hatch |
| Unique index drift vs in-memory rules     | Shared contract suite on both implementations                   |
| Journal gap for 0011 on older DBs         | IF NOT EXISTS migration; journal restored                       |

---

## Recommendation for the next milestone

Suggested **OSS-110-06** (or owner-named equivalent), after explicit approval:

1. Production `AuthorizationProvider` wired to PermissionService
2. First production policies as needed
3. API route handlers delegating to `PlatformServiceGateway`

Then **OSS-101-06** (Plane task CRUD + `TaskServiceImpl`) only with separate owner approval.

---

## Stop condition

**OSS-110-05 complete.** Do not begin production authorisation, API routes, OSS-101-06, OSS-110-06, or any other milestone without explicit owner approval.
