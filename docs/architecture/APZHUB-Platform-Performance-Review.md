# APZHUB Platform — Performance Review

> **Milestone:** M16 — Platform Stabilisation & Engineering Review  
> **Date:** 2026-07-08  
> **Type:** Analysis only — optimisation recommendations; no implementation

---

## 1. Purpose

Assess performance characteristics and recommend future optimisations. No benchmarking was executed in M16 — this is architectural analysis.

---

## 2. Area assessments

| Area                  | Current state                                       | Risk                   | Future optimisation                            |
| --------------------- | --------------------------------------------------- | ---------------------- | ---------------------------------------------- |
| Repository efficiency | In-memory O(n) scans; postgres indexed primary keys | Low (validation scale) | Pagination cursors; DB indexes on query fields |
| Workflow layering     | Synchronous service calls                           | Medium at scale        | Async outbox for side effects                  |
| API composition       | Direct handler → service                            | Low                    | BFF caching for read-heavy dashboards          |
| Hydration             | Server loads full registry DTOs per request         | Medium                 | Shared context cache (TD-AT15-06)              |
| Workbench             | Client-side engine composition                      | Low                    | Code splitting per module                      |
| Search                | In-process provider scan                            | High at scale          | External search index (020)                    |
| Timeline              | Session store; full load                            | Medium                 | Incremental fetch; pagination                  |
| Notification flow     | In-process; session store                           | Medium                 | WebSocket/SSE delivery (021)                   |
| Memory usage          | In-memory repos in dev; dual trust bundles          | Medium                 | Single bundle; postgres mode in staging        |

---

## 3. Repository efficiency

### Current

- Memory repositories: linear scan by `tenantId` filter
- Postgres: primary key lookups; no full-table scans in adapters
- Trust balance projection: recomputed from journal history (TD-T12)

### Recommendations

- Materialised balance views when in postgres production mode
- Cursor-based pagination on list endpoints (partially implemented)
- Index `matter_id`, `client_id` on high-volume tables

**Priority:** Medium — before 10k+ transactions per tenant

---

## 4. Workflow layering

### Current

- `runSync()` bridge over async postgres (TD-P04)
- Request handler blocks until workflow completes
- Trust post is synchronous: validate → approve → ledger → allocation

### Recommendations

- Acceptable for v1 API
- Long-running operations (reconciliation, report generation) should move to job queue
- Document async migration path in Background Job Architecture

**Priority:** Medium — before bulk import features

---

## 5. API composition

### Current

- Thin handlers delegate to workflow services
- No N+1 in typical single-entity paths
- List endpoints may load full collections

### Recommendations

- Field selection / sparse fieldsets in OpenAPI v2
- Response caching headers for immutable reports

**Priority:** Low

---

## 6. Hydration performance

### Current

- Each app bootstraps M4–M7 registries
- Server components load hydration bundles per framework
- Health endpoint may call loaders independently (TD-AT15-06)

### Recommendations

- Shared cached hydration bundle per process
- Lazy load notification/activity presentation on first use
- Extract `@apzhub/app-bootstrap` with singleton cache

**Priority:** Medium

---

## 7. Workbench performance

### Current

- All engines initialise on workspace mount
- Module routes lazy via Next.js App Router
- Trust workbench loads seeded data on first access

### Recommendations

- Dynamic import for infrequent modules (interest, transfers)
- Virtualised tables for large transaction lists (TanStack Virtual)

**Priority:** Low — UI not yet handling large datasets

---

## 8. Search performance

### Current

- `KnowledgeDiscoveryOrchestrator` scans registered providers in-process
- Law search providers query in-memory repositories
- No inverted index

### Recommendations

- PostgreSQL FTS for platform metadata (020 self-hosted first)
- Async event-driven indexing via outbox workers
- Qdrant/OpenSearch evaluation for semantic (future)

**Priority:** High — before production search SLA

---

## 9. Timeline & notification flow

### Current

- Event Bus synchronous publish to all subscribers
- Notifications stored in session memory
- Activities mapped on event publish

### Recommendations

- Decouple notification delivery to async worker
- Timeline pagination with `since` cursor
- WebSocket push for real-time (021)

**Priority:** Medium — M8+

---

## 10. Memory usage

### Current

- `LAW_REPOSITORY_MODE=memory` loads all entities in process
- Separate trust bundles double memory for same seed data
- Vitest runs 370 test files — CI memory pressure

### Recommendations

- Staging always uses postgres mode
- Unify trust bundles (TD-T01)
- Shard vitest in CI by package

**Priority:** Medium

---

## 11. Pre-commit / CI performance

### Current

- Husky pre-commit runs lint-staged + full vitest (1846 tests)
- Commit latency ~3–6 minutes

### Recommendations

- Fast pre-commit: lint + typecheck only
- Full test suite in CI only
- Parallel vitest workers tuned per CI cores

**Priority:** Low (DX) — High (CI throughput)

---

## 12. Performance testing gaps

| Test type              | Status                 |
| ---------------------- | ---------------------- |
| Load testing           | ❌ Not performed       |
| Stress testing         | ❌ Not performed       |
| Memory profiling       | ❌ Not performed       |
| Lighthouse (Law UI)    | ⚠️ LAW-013 noted areas |
| API latency benchmarks | ❌ Not performed       |

**Recommendation:** Baseline load test before pilot — 100 concurrent users, 1000 trust transactions.

---

## 13. Verdict

**Performance posture: GOOD for validation phase**

No evidence of critical performance defects at current scale. Architectural choices (in-process, synchronous, memory mode) are appropriate for platform validation but **must be revisited before commercial GA**.

---

_Related: [Testing Review](./APZHUB-Platform-Testing-Review.md) · [LAW-013 Performance](../reviews/LAW-013-performance-review.md)_
