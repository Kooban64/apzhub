# ADR — Document Metadata / Storage Transaction Boundary

> **Status:** Accepted  
> **Date:** 2026-07-13  
> **Milestone:** APZDOCS-002

## Context

Platform metadata lives in PostgreSQL; binaries live in filesystem/S3. True XA/distributed transactions across both are unavailable and undesirable for self-hosted OSS operations.

## Decision

Use **coordinator orchestration without distributed TX**:

1. Persist pending version + storage-object rows
2. Write binary to provider
3. Verify checksum
4. Commit `verified` — or mark `failed` / `reconciliation_required` for compensation

## Consequences

- Possible orphaned objects or unverified metadata until reconciliation
- Inspect contracts exist; automatic workers deferred
- Simpler ops model compatible with Zero Trust auditing via status fields

## Alternatives considered

- Outbox + worker saga — deferred to post-APZDOCS-002
- Store bytes in Postgres `bytea` — rejected (constitution / SoR separation)
