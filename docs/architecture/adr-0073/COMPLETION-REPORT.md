# Completion Report — Platform-1.4-ADR-0073

> **Status:** **COMPLETED / AWAITING OWNER ADR ACCEPTANCE**  
> **Date:** 2026-07-23

## Programme / Title / Classification

Platform-1.4-ADR-0073 · Durable Notification Runtime Architecture Decision · ARCHITECTURE DECISION RECORD

## Precondition Verification

**PASS**

## Current-State / Verified Problem

Process-local Maps + interval worker; schema 0065 ready; P13-KL-ND-03 verified. Durability/restart/multi-instance risks supported.

## Decision

**Option A — PostgreSQL-Owned Durable Runtime** (matrix winner). Options B–E rejected for MUST (B deferred as optional optimisation only).

## Authoritative SoR

PostgreSQL notification delivery plane (0065 + additive lease fields as needed).

## Models (summary)

| Model                 | Decision                                            |
| --------------------- | --------------------------------------------------- |
| Work claiming         | DB leases / SKIP LOCKED class                       |
| State machine         | Existing contract statuses                          |
| Attempts              | Durable try per dispatch                            |
| Retry                 | Platform policy; persist schedule                   |
| Dead-letter           | `permanent_failure` + `deadLetter` in Postgres      |
| Idempotency           | Tenant unique keys + leases + provider_ref          |
| Ordering              | Best effort; no global order                        |
| Recovery              | Lease reclaim; DB authoritative                     |
| Admin / observability | Postgres-backed inspection + metrics                |
| Security / POPIA      | Preserve deny-by-default; no legal compliance claim |
| Events                | After-commit publish; not SoR                       |
| Realtime              | SSE attention only                                  |
| Migration             | Additive; flag cutover; no SQL here                 |

## Proposed ENG

Platform-1.4-ENG-001 **PROPOSED / BLOCKED** pending ADR acceptance.

## Future ADR dependencies

ADR-0074 (conditional provider) · ADR-0075 (conditional SSE fan-out)

## Confirmations

ARCH-001 accepted · Platform 1.3 closed · ADR-0071/0072 unchanged · layering unchanged · no implementation · no app/package/DB/migration/provider/SMTP/Email SoR/Workflow/FIN-001/WebSocket/SDK/ENG work

## Recommendation

**READY FOR OWNER ADR ACCEPTANCE**

## STOP

Await Owner ADR Acceptance.
