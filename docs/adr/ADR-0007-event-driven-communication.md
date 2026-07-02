# ADR-0007 — Event Driven Communication

> **Status:** Accepted  
> **Date:** 2026-06-29  
> **Sprint:** SPR-001 closeout

## Problem

Synchronous-only communication creates tight coupling, blocks background processing, and prevents notifications, search indexing, and audit trails from reacting to platform changes. Document 012 defines event-driven architecture as a core platform capability.

## Decision

Adopt **event-driven communication** via the Platform Event SDK (Document 029):

- Events declared in **`event.yaml`** manifests
- Standard envelope: `PlatformEventEnvelope` in `@apzhub/events`
- Event Bus runtime deferred until post-foundation sprint
- Producers publish domain events; consumers subscribe idempotently
- Notifications, search, and activity streams react to events — not direct calls (Document 021)

SPR-001 delivers type stubs and `events/` placeholder only.

## Alternatives

| Alternative                                 | Why rejected                                              |
| ------------------------------------------- | --------------------------------------------------------- |
| Direct function calls between modules       | Tight coupling; no async or audit trail                   |
| External message broker first (Kafka, etc.) | Premature; Redis/PostgreSQL sufficient for early platform |
| Polling-only integration                    | Poor UX; high load on engines                             |

## Consequences

- Event Bus sprint implements registry, publisher, and subscriber contracts.
- `@apzhub/events` grows from stub to runtime package.
- Correlation IDs and tracing align with Documents 010 and 014.
