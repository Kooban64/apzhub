# APZSEARCH-016 — Product Indexing Orchestration Framework — Completion Report

> **Status:** COMPLETE  
> **Classification:** PRODUCTION_READY_WITH_LIMITATIONS (inherits Search programme posture)  
> **Date:** 2026-07-18  
> **Successor (recommended only):** **APZSEARCH-017 — Search Publication Operations & Administration**

---

## Executive Summary

APZSEARCH-016 delivers `@apzhub/search-orchestrator` **0.1.0** — durable PostgreSQL publication journal, auditable lifecycle, exponential retry with dead-letter, payload deduplication, configurable batching, composition product hooks, and diagnostics metadata — publishing exclusively through `@apzhub/search-integration` **0.2.0**. The frozen Search platform (001–008) and certified publication adapters (010–015) were not modified.

---

## Architecture

Product Services → Publication Hooks → Publication Journal → Index Orchestrator → Retry Scheduler → Search Integration → Frozen Search Platform → Meilisearch Adapter.

No shortcuts; no Meilisearch / persistence / HTTP / Workbench changes.

---

## Publication Journal

- Table `platform_search_publication_journal` (migrations **0058** / **0059** RLS)
- Fields: id, entity, product, operation, payload hash/JSON, status, retries, timestamps, failure reason, correlation id
- Production requires PostgreSQL; in-memory test-only

---

## Retry Engine

Configurable exponential backoff, max attempts, permanent-failure detection, dead-letter routing. Failures visit `failed` before `retrying` / `dead-letter` for auditability.

---

## Product Hooks

Composition wrappers (`withProjectSearchPublicationOrchestration`, `PRODUCT_HOOK_PRESETS`, safe enqueue helpers) for create / update / archive / restore / delete. Products remain SoR; disabled orchestration fails safely without aborting product transactions.

---

## Deduplication

Stable SHA-256 payload hashing + open-entry suppression on tenant/entity/operation/hash.

---

## Failure Recovery

Journal retains failed / retrying / dead-letter rows; diagnostics expose queue depth, retries, DLQ, throughput, backlog. No dashboards in this milestone.

---

## Testing

- Package tests: journal, retry, batching, dedupe, lifecycle, hooks, persistence mock, failure recovery, boundary
- Harness: `testing/search-orchestrator/apzsearch-016-boundary.test.ts`
- Audit: `pnpm audit:search-orchestrator`

---

## Coverage

Package-scoped Vitest coverage (`packages/search-orchestrator/src/**`):

| Metric     | Result     |
| ---------- | ---------- |
| Lines      | **98.43%** |
| Functions  | **98.38%** |
| Branches   | **86.50%** |
| Statements | **98.43%** |

Meets ≥95% lines/functions target.

---

## Quality Gates

| Gate                                       | Expectation                                                        |
| ------------------------------------------ | ------------------------------------------------------------------ |
| Typecheck                                  | Pass (`@apzhub/search-orchestrator`)                               |
| Lint                                       | Pass                                                               |
| Vitest                                     | Pass                                                               |
| Coverage                                   | ≥95% lines/functions (package)                                     |
| Architecture / dependency / boundary audit | `audit:search-orchestrator` PASS                                   |
| Search publication re-pin                  | `search-integration` **0.2.0**; `platform-services` pin **0.25.0** |

---

## Technical Debt

1. Platform-services source not patched — composition wrappers must be applied at bootstrap (APZSEARCH-017 may add ops visibility for unwired products).
2. Drain worker / scheduler not shipped — callers must invoke `processBatch` (operations milestone).
3. Dead-letter replay UI/API deferred to APZSEARCH-017.

---

## Recommendation

**APZSEARCH-017 — Search Publication Operations & Administration** only.

Do **not** implement until explicit owner approval.

---

## Stop condition

APZSEARCH-016 is COMPLETE. Stop.
