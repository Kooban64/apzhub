# Publication Journal Guide

> **Milestone:** APZSEARCH-016  
> **Package:** `@apzhub/search-orchestrator`

## What is stored

Each journal entry tracks:

- publication id
- entity id / entity type / product
- operation (`publish` | `update` | `remove` | `lifecycle`)
- payload JSON + payload hash
- status + attempt count / max attempts
- next attempt timestamp
- failure reason
- correlation id / actor
- created / updated / published timestamps

## Persistence

- **Production:** PostgreSQL via `createPostgresPublicationJournal`
- **Tests:** `createInMemoryPublicationJournal` only when `allowInMemoryJournal: true`

## Deduplication

Before insert, the dispatcher looks up an open/published entry with the same:

`tenantId + entityId + operation + payloadHash`

Duplicates are suppressed (`deduplicated: true`).

## Claiming

`claimBatch` selects `queued` or due `retrying` rows, ordered by `created_at`, and transitions them to `publishing` with `attempt_count + 1` (`FOR UPDATE SKIP LOCKED` in PostgreSQL).
