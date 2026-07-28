# Completion Report — Platform-1.4-ENG-001A

> **Status:** **ACCEPTED**  
> **Date:** 2026-07-23

## Executive Summary

ENG-001A translates ADR-0073 Option A into a complete engineering blueprint: packages, additive migration **0066** (leases), worker claim/reclaim lifecycle, contract-compatible state machine, transaction boundaries, idempotency, admin/observability, tests, rollout/rollback, and phased ENG-001B plan. **No implementation occurred.**

## Design highlights

- SoR: Postgres 0065 + additive lease columns (0066)
- Claim: `FOR UPDATE SKIP LOCKED` + lease TTL
- Replay: new delivery row (terminal states stay immutable)
- Flag: `APZHUB_NOTIFICATION_DURABLE_RUNTIME`
- ENG-001B: five phases, blocked pending Design Acceptance

## Confirmations

No implementation · no app/package source changes under this programme · no migration SQL created · no provider/SMTP/Email SoR/Workflow/FIN-001/WebSockets work

## Evidence Index

- Pack: `docs/engineering/platform-1.4-eng-001a/`
- Machine evidence: `docs/operations/evidence/portfolio-recert/20260723T100000Z-PLATFORM-1.4-ENG-001A.json`
- Parent ADR: `docs/architecture/adr-0073/` (ACCEPTED)

## Recommendation

**READY FOR OWNER DESIGN ACCEPTANCE**

## STOP

Do not begin Platform-1.4-ENG-001B.
