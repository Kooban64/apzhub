# Platform Registry — Database Design Recommendation

> **Status:** Recommendation (SPR-002 planning) — **no implementation**  
> **Authority:** [Document 011](../011-platform-data-architecture-database-design-principles.md) · [platform-registry.md](./platform-registry.md)  
> **Decision gate:** ADR-0009 (to be filed in Phase 0)

---

## 1. Question

Should the Platform Registry:

| Option | Description                                          |
| ------ | ---------------------------------------------------- |
| **A**  | Operate entirely from manifests (filesystem only)    |
| **B**  | Cache metadata in memory only (rebuild each startup) |
| **C**  | Persist registry information in PostgreSQL           |

---

## 2. Recommendation

## **Option C — Hybrid model (filesystem + PostgreSQL cache)**

| Layer               | Role                                                                                |
| ------------------- | ----------------------------------------------------------------------------------- |
| **Manifest files**  | Authoritative **definition** (what the capability is)                               |
| **PostgreSQL**      | **Runtime state** + parsed manifest **cache** (lifecycle, enablement, fast startup) |
| **In-memory store** | Active runtime index ( rebuilt from DB cache or filesystem )                        |

This aligns with Document 011 (platform metadata in PostgreSQL) and ADR-0002 (Drizzle in `@apzhub/config`).

---

## 3. Rationale

### Why not filesystem-only (Option A)?

| Disadvantage                                                                       |
| ---------------------------------------------------------------------------------- |
| No durable lifecycle state (enabled/disabled survives restart only via file edits) |
| No audit trail of capability state changes                                         |
| Administration UI cannot toggle capabilities without Git commits                   |
| Slower startup at scale (full parse every time)                                    |

**When acceptable:** Early local dev only — insufficient for enterprise platform.

### Why not memory-only (Option B)?

| Disadvantage                                              |
| --------------------------------------------------------- |
| Same as A for lifecycle                                   |
| Cold start always pays full scan + parse cost             |
| No cross-instance consistency in future multi-node deploy |

**When acceptable:** Unit tests and CI fixtures.

### Why hybrid PostgreSQL (Option C)?

| Advantage                                                |
| -------------------------------------------------------- |
| Fast startup via cache (hash/mtime invalidation)         |
| Durable lifecycle (`enabled`, `disabled`, `maintenance`) |
| Audit-friendly state changes                             |
| Forward-compatible with multi-instance deploy            |
| Consistent with platform data architecture (011)         |
| Registry diagnostics survive process restart             |

| Disadvantage                                                                            |
| --------------------------------------------------------------------------------------- |
| Additional schema + migration complexity                                                |
| Cache invalidation logic required                                                       |
| Two sources to reason about (mitigated: filesystem wins on conflict for **definition**) |

---

## 4. Proposed schema (conceptual)

### 4.1 `registry_capabilities`

Durable capability identity and lifecycle.

| Column             | Type          | Notes                                              |
| ------------------ | ------------- | -------------------------------------------------- |
| `id`               | uuid          | PK                                                 |
| `capability_id`    | varchar       | Stable ID (`button`, `platform-registry`)          |
| `kind`             | varchar       | `component`, `module`, …                           |
| `version`          | varchar       | Semver                                             |
| `lifecycle_status` | varchar       | `enabled`, `disabled`, `deprecated`, `maintenance` |
| `source_path`      | text          | Relative repo path                                 |
| `tenant_id`        | uuid nullable | Future multi-tenant                                |
| `installed_at`     | timestamptz   | First seen                                         |
| `updated_at`       | timestamptz   | Last state change                                  |

**Unique constraint:** `(capability_id, kind, tenant_id)`

### 4.2 `registry_manifest_cache`

Parsed manifest cache.

| Column          | Type        | Notes               |
| --------------- | ----------- | ------------------- |
| `id`            | uuid        | PK                  |
| `capability_id` | varchar     | FK logical          |
| `kind`          | varchar     |                     |
| `content_hash`  | varchar     | SHA-256 of file     |
| `manifest_json` | jsonb       | Normalised envelope |
| `file_mtime`    | timestamptz | Invalidation        |
| `parsed_at`     | timestamptz |                     |

**Invalidation:** Re-parse when `content_hash` or `file_mtime` differs from filesystem.

### 4.3 `registry_bootstrap_log`

Operational audit (optional SPR-002 — recommended).

| Column              | Type        | Notes                         |
| ------------------- | ----------- | ----------------------------- |
| `id`                | uuid        | PK                            |
| `bootstrapped_at`   | timestamptz |                               |
| `platform_version`  | varchar     |                               |
| `status`            | varchar     | `ready`, `degraded`, `failed` |
| `capability_counts` | jsonb       |                               |
| `errors`            | jsonb       | Validation errors             |

### 4.4 Entity relationship

```text
registry_capabilities 1 ── 0..1 registry_manifest_cache
        (capability_id + kind)

registry_bootstrap_log (append-only)
```

---

## 5. Sync strategy

### 5.1 Bootstrap with empty database

1. Scan filesystem
2. Validate all manifests
3. Upsert `registry_capabilities` + `registry_manifest_cache`
4. Write `registry_bootstrap_log`

### 5.2 Bootstrap with warm cache

1. Scan filesystem; compute hashes
2. For each manifest: if hash matches cache → load from DB
3. If hash differs → re-parse, upsert cache
4. Remove DB rows for manifests no longer on filesystem (soft-delete or `removed` status)

### 5.3 Conflict resolution

| Conflict                                | Resolution                                       |
| --------------------------------------- | ------------------------------------------------ |
| DB says `disabled`, manifest unchanged  | Keep `disabled` (runtime state wins)             |
| Manifest definition changed (hash diff) | Re-parse; preserve lifecycle unless incompatible |
| Manifest removed from filesystem        | Mark capability `removed`; retain audit row      |

**Rule:** Filesystem = **what**; Database = **whether and how it runs**.

---

## 6. Comparison matrix

| Criterion              | Filesystem only | Memory cache | **Hybrid (recommended)**                |
| ---------------------- | --------------- | ------------ | --------------------------------------- |
| Startup speed          | Slow at scale   | Medium       | **Fast (warm cache)**                   |
| Lifecycle persistence  | ❌              | ❌           | **✅**                                  |
| Audit trail            | Git only        | ❌           | **✅**                                  |
| Complexity             | Low             | Low          | **Medium**                              |
| Multi-node ready       | ❌              | ❌           | **✅**                                  |
| Offline dev without DB | ✅              | ✅           | ⚠ Requires Docker PG (already standard) |
| Aligns with Doc 011    | Partial         | Partial      | **✅**                                  |

---

## 7. Fallback mode

If ADR-0009 rejects PostgreSQL persistence for SPR-002:

- Implement **Option B** (memory-only) with identical public API
- Persistence adapter interface stubbed for later sprint
- Document limitation in closeout report

Environment flag:

```bash
REGISTRY_PERSISTENCE=false  # fallback
REGISTRY_PERSISTENCE=true   # default recommended
```

---

## 8. Migration placement

| Item           | Location                                    |
| -------------- | ------------------------------------------- |
| Drizzle schema | `packages/config/src/db/registry-schema.ts` |
| Migration      | `packages/config/drizzle/0001_*`            |
| Repository     | `packages/sdk/src/registry/persistence.ts`  |

No business tables. Platform metadata only per Document 011.

---

## 9. Security & data classification

| Data            | Classification                       |
| --------------- | ------------------------------------ |
| Manifest cache  | Platform configuration — no user PII |
| Lifecycle state | Platform configuration               |
| Bootstrap log   | Operational telemetry                |

RBAC for mutating lifecycle rows deferred to administration sprint.

---

## 10. Open questions

1. Soft-delete vs hard-delete when manifest removed?
2. Include `registry_bootstrap_log` in SPR-002 or defer to observability sprint?
3. Require PostgreSQL for CI or allow `REGISTRY_PERSISTENCE=false` in CI only?

---

_Recommendation only — decision recorded in ADR-0009 during SPR-002 Phase 0._
