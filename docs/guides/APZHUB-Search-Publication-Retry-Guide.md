# Search Publication Retry Guide

> **Milestone:** APZSEARCH-016

## Policy

Default retry policy:

| Field            | Default |
| ---------------- | ------- |
| `maxAttempts`    | 5       |
| `initialDelayMs` | 1000    |
| `maxDelayMs`     | 60000   |
| `multiplier`     | 2       |

Backoff: `min(maxDelayMs, initialDelayMs * multiplier^(attemptCount-1))`.

## Permanent failures

Messages matching `/permanent|not found|validation|invalid|forbidden|unauthorized/i` skip retry and route to **dead-letter**.

## Flow

1. Claim → `publishing`
2. Call Search Integration publisher
3. Success → `published`
4. Failure → `failed` (auditable) → `retrying` or `dead-letter`

Publications are never dropped silently.
