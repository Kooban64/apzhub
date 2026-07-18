# APZHUB Entity Mapping Specification

**Milestone:** OSS-110-03 / OSS-110-05  
**Status:** Canonical — platform-owned identity mapping  
**Package:** `@apzhub/platform-services`  
**Authority:** [ADR-0048](../adr/ADR-0048-apzhub-global-entity-id-strategy.md) · [ADR-0049](../adr/ADR-0049-persistent-entity-mapping-store.md) · [011 — Platform Data](../011-platform-data-architecture-database-design-principles.md)

---

## Purpose

Define how APZHUB global entity IDs map to provider-native IDs without leaking vendor identity into platform APIs.

---

## Mapping record

| Field                     | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `platformId`              | APZHUB global ID (ADR-0048)                       |
| `entityType`              | Canonical entity type union                       |
| `providerId`              | Capability provider instance id                   |
| `integrationId`           | Integration manifest id (e.g. `plane`)            |
| `providerNativeId`        | Engine-native ID (never exposed as primary ID)    |
| `parentPlatformId`        | Optional parent APZHUB ID                         |
| `parentProviderNativeId`  | Optional parent native ID                         |
| `tenantId`                | Tenant scope (required)                           |
| `organisationId`          | Optional organisation scope (OSS-110-05 additive) |
| `status`                  | `active` \| `inactive` \| `pending` \| `orphaned` |
| `createdAt` / `updatedAt` | ISO-8601 timestamps                               |
| `metadata`                | String key/value bag                              |
| `revision`                | Optimistic concurrency counter                    |

---

## Store contract

`EntityMappingStore` supports create, get-by-platform-id, get-by-provider-native-id, bidirectional resolve, list, update, deactivate, and remove.

Optional `organisationId` on reads/updates enforces organisation isolation when provided.

**Uniqueness (application + database):**

1. `platformId` unique (primary key)
2. `(tenantId, entityType, providerId, providerNativeId)` unique among **active/pending** mappings (partial unique index)

Inactive/orphaned rows may reuse a provider-native identity after rebind.

---

## Persistence boundary

| Implementation               | Use                                          |
| ---------------------------- | -------------------------------------------- |
| `InMemoryEntityMappingStore` | Development and isolated tests               |
| `PostgresEntityMappingStore` | Production-capable environments (OSS-110-05) |

Table: `platform_entity_mapping` (owned by `@apzhub/config`, migration `0015_platform_entity_mapping`).

Adapters never write to the mapping store. Platform services / orchestration own all writes.

### Bootstrap

| Variable                                    | Values                 | Behaviour                                                          |
| ------------------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| `ENTITY_MAPPING_STORE_MODE`                 | `memory` \| `postgres` | Explicit backend selection                                         |
| (default)                                   | —                      | `memory` outside production; `postgres` when `NODE_ENV=production` |
| `ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION` | `true` \| `false`      | Required escape hatch for memory in production                     |
| `DATABASE_URL`                              | connection string      | Required when mode is `postgres`                                   |

**Production rule:** PostgreSQL mode never silently falls back to in-memory. Misconfiguration or database unavailability fails with `CONFIGURATION_ERROR` / `PERSISTENCE_UNAVAILABLE`.

Factory: `createEntityMappingStore()` / `createPlatformServicesFromEnv()`.

---

## Transaction model

- Create: single insert (DB uniqueness enforces conflicts)
- Update / deactivate / remove: local PostgreSQL transaction with revision check
- Provider API calls are **never** in the same transaction as mapping writes
- Provider-create success + mapping-persist failure → `RECONCILIATION_REQUIRED`

---

## Optimistic concurrency

- `revision` starts at `1` and increments on every update
- `expectedRevision` on update must match stored revision
- Mismatch → `MAPPING_REVISION_CONFLICT` (retryable)

---

## Error classifications

| Condition                    | Error code                   |
| ---------------------------- | ---------------------------- |
| No mapping                   | `MAPPING_NOT_FOUND`          |
| Wrong entity type            | `MAPPING_TYPE_MISMATCH`      |
| Inactive mapping             | `MAPPING_INACTIVE`           |
| Duplicate / unique bind      | `MAPPING_CONFLICT`           |
| Revision mismatch            | `MAPPING_REVISION_CONFLICT`  |
| Persistence failure          | `MAPPING_PERSISTENCE_FAILED` |
| Database unavailable         | `PERSISTENCE_UNAVAILABLE`    |
| Invalid global ID            | `INVALID_GLOBAL_ID`          |
| Provider create OK, map fail | `RECONCILIATION_REQUIRED`    |

Public errors never include SQL, connection strings, credentials, or table names.

---

## Lifecycle

### Create

1. Resolve parent mappings
2. Call capability provider
3. Allocate APZHUB global ID
4. Persist mapping
5. Return canonical entity with global IDs

If step 4 fails after step 2 succeeds → `RECONCILIATION_REQUIRED` (never silent success).

### Read / update / archive / delete

1. Resolve global ID → mapping (tenant/organisation scoped)
2. Select provider from mapping
3. Invoke provider with native ID
4. Return canonical models with global IDs

---

## Provider-selection precedence

1. Explicit `preferredProviderId`
2. Explicit `preferredIntegrationId`
3. **Mapped provider** from existing entity mapping
4. Active provider on registry
5. Highest priority (lowest priority number)

---

## Provisional Plane IDs

Adapter may still emit `proj_plane_*` internally. Mapping orchestration extracts the native segment and allocates a true APZHUB global ID. Consumers never receive provisional IDs from mapping-aware services.

---

## Reconciliation

`reconcileEntityMappings` produces an in-memory report. No scheduler or automated repair in OSS-110-05.

---

## Related

- [ADR-0049 Persistent Entity Mapping Store](../adr/ADR-0049-persistent-entity-mapping-store.md)
- [Platform Service Implementation Architecture](../architecture/APZHUB-Platform-Service-Implementation-Architecture.md)
- [OSS-110-05 Completion Report](../sprint/OSS-110-05-completion-report.md)
