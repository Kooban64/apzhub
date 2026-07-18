# Search Publication Failure Recovery Guide

> **Milestone:** APZSEARCH-016

## Principles

1. Product transactions must not fail because orchestration is disabled or flaky.
2. Failed publications remain in the journal (`failed` / `retrying` / `dead-letter`).
3. Operators recover by fixing causes and re-driving due `retrying` rows (or re-enqueuing after DLQ investigation).

## Disabled orchestration

`APZHUB_SEARCH_ORCHESTRATION_ENABLED` unset/false:

- Dispatcher returns `SEARCH_ORCHESTRATION_DISABLED`
- Safe hooks return `{ accepted: false }` without throwing

## Transient errors

Marked `failed` then `retrying` with `next_attempt_at`. Orchestrator reclaims when due.

## Permanent / exhausted

Marked `dead-letter` with `last_error`. Do not auto-delete.

## Diagnostics (no dashboards)

`orchestrator.diagnostics()` exposes:

- queue depth
- retrying / failed / dead-letter / published counts
- throughputPublished
- backlog (`queued + retrying`)
