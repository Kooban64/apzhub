# Platform-1.4-ENG-001B-P4 — Durable Notification Runtime Implementation – Phase 4

> **Status:** **ACCEPTED**  
> **Programme:** Platform-1.4-ENG-001B-P4  
> **Title:** Durable Notification Runtime Implementation – Phase 4 (Administration, Operations & Observability)  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Baseline:** Platform 1.4  
> **Parent:** Platform-1.4-ENG-001B · Design Platform-1.4-ENG-001A · ADR-0073  
> **Date:** 2026-07-23  
> **Acceptance:** Owner Decision — Platform-1.4-OR-001 (engineering CLOSED)

## Purpose

Operational tooling for the durable notification runtime: administration reads, secured manual operations, health/diagnostics, metrics, and immutable audit. No production cut-over. No runtime activation.

## Feature flag

`APZHUB_NOTIFICATION_DURABLE_RUNTIME` remains **default OFF**. Administration functions with the flag OFF. Process-local runtime retained.

## Deliverables

| Area           | Summary                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Administration | List deliveries, attempts, leases, retries, DLQ (filter/paginate/sort/tenant+org isolation)        |
| Manual ops     | Retry, replay (new delivery), cancel, suppress, clear abandoned lease, force lease expiry, requeue |
| Health         | Runtime health, worker status, queue/lease/retry/DLQ diagnostics                                   |
| Observability  | Structured admin metrics via existing service surfaces                                             |
| Audit          | Immutable admin audit records (migration 0067)                                                     |
| Security       | Deny-by-default; `notifications.admin` / `notifications.replay` / privileged roles                 |

## Pack index

- [PRECONDITION-VERIFICATION.md](./PRECONDITION-VERIFICATION.md)
- [ADMINISTRATION.md](./ADMINISTRATION.md)
- [OPERATIONS.md](./OPERATIONS.md)
- [MANUAL-REPLAY.md](./MANUAL-REPLAY.md)
- [RETRY-OPERATIONS.md](./RETRY-OPERATIONS.md)
- [LEASE-OPERATIONS.md](./LEASE-OPERATIONS.md)
- [HEALTH.md](./HEALTH.md)
- [OBSERVABILITY.md](./OBSERVABILITY.md)
- [AUDIT.md](./AUDIT.md)
- [SECURITY.md](./SECURITY.md)
- [TEST-RESULTS.md](./TEST-RESULTS.md)
- [QUALITY-RESULTS.md](./QUALITY-RESULTS.md)
- [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)
- [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)
- [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)

## STOP

Phase 4 **ACCEPTED**. Engineering CLOSED. Downstream: **Platform-1.4-OR-001** operational readiness. Do **not** begin P5 without separate Owner Approval. Do **not** enable the durable flag.
