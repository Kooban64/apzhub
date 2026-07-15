# ADR — Immutable Document Content Versions

> **Status:** Accepted  
> **Date:** 2026-07-13  
> **Milestone:** APZDOCS-002

## Context

Document content must remain auditable for compliance and evidence use cases. Mutable overwrite would break checksum history and consumer references.

## Decision

Every content write creates a **new immutable version** (`immutable = true`, schema CHECK). Storage providers refuse overwrite. Display names are metadata only; storage keys are opaque and version-scoped.

## Consequences

- Append-only content history per document
- Deletes are explicit lifecycle operations, not silent replaces
- Deduplication is advisory (`duplicateChecksumDetected`) — not coalescing storage by default

## Alternatives considered

- Mutable latest blob with side-car history — rejected (weak audit)
- Content-addressed single store by hash — deferred (complexity; may revisit)
