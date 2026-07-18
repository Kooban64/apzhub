# Search Publication Retry Administration Guide

> **Milestone:** APZSEARCH-017

## Retry single

`POST /api/v1/search/publication/entries/{id}/retry`

- `failed` → move to `retrying` with immediate `nextAttemptAt`
- `retrying` → refresh `nextAttemptAt`
- `dead-letter` → use dead-letter retry (re-enqueue)

## Retry selected / failed batch

`POST /api/v1/search/publication/retry` with `{ ids: [...] }` or `{ failedBatch: true, limit }`.

## Clear completed retries

`POST /api/v1/search/publication/retries/clear` — marks published entries that had retries as acknowledged for ops views. Does **not** delete journal rows.

## Drain

`POST /api/v1/search/publication/drain` — invokes orchestrator `processBatch()` (admin only).
