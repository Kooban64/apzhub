# APZHUB Search Publication Reliability Guide

> **Milestone:** APZSEARCH-018  
> **Audience:** Platform engineers  
> **Date:** 2026-07-18

---

## Reliability model

Publication is **durable-first**: product mutations enqueue journal rows; the orchestrator drains asynchronously through the Search Integration Framework into the frozen Search Platform / Meilisearch adapter.

```text
Product Services → Composition Hooks → Publication Journal
  → Search Orchestrator → Retry Engine → Search Integration Framework
  → Frozen Search Platform → Meilisearch Adapter
```

---

## Durable journal

- PostgreSQL table `platform_search_publication_journal` (migrations **0058** / **0059**)
- Lifecycle statuses with transition guards
- Payload hash for deduplication (`hashPublicationPayload`)
- RLS for tenant isolation

---

## Retry & backoff

- `DEFAULT_RETRY_POLICY` — max attempts, exponential backoff (`computeBackoffDelayMs`)
- Permanent failure messages skip further retries and move toward dead-letter
- Batching via `DEFAULT_BATCH_POLICY` / `processBatch`

---

## Dead-letter queue

- Terminal journal status for exhausted retries
- Admin re-enqueue creates a new row (idempotent product intent)
- Markers for acknowledge/archive without deleting history

---

## Deduplication & idempotency

- Payload hashing before enqueue
- Safe hooks avoid failing product SoR paths on publication errors
- Batch processing designed for at-least-once with idempotent sink operations

---

## Composition hook reliability

- Hooks wrap product services at composition root (platform-services source unmodified)
- Only `@apzhub/search-integration` for publish path from orchestrator
- No direct provider SDK access from products

---

## Failure recovery

1. Inspect diagnostics / journal entry
2. Classify transient vs permanent
3. Retry or DLQ re-enqueue via admin APIs
4. Confirm sink success via journal status progression

See also [Failure Recovery Guide](./APZHUB-Search-Publication-Failure-Recovery-Guide.md).

---

## Bootstrap safety

`APZHUB_SEARCH_ORCHESTRATION_ENABLED` deny-by-default — disabled mode is a safe no-op for enqueue paths.
