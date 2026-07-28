# Platform-1.4-ENG-001B-P2 — Durable Notification Runtime Implementation – Phase 2

> **Programme:** Platform-1.4-ENG-001B-P2  
> **Title:** Durable Notification Runtime Implementation – Phase 2 (Claim & Lease Engine)  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Baseline:** Platform 1.4  
> **Status:** **ACCEPTED / CLOSED**  
> **Parent:** [Platform-1.4-ENG-001B](../platform-1.4-eng-001b/README.md) · Design [ENG-001A](../platform-1.4-eng-001a/README.md) · ADR-0073  
> **Prior phase:** [ENG-001B-P1](../platform-1.4-eng-001b-p1/README.md) (**ACCEPTED**)

## Scope delivered

1. **Claim Engine** — batch claim, SKIP LOCKED (Postgres) / atomic Map claim (memory), lease ownership/timestamps/expiry, abandoned lease reclaim
2. **Lease Engine** — create (via claim), renew, release, expire/reclaim, fencing, worker ownership, claim validation
3. **Worker Skeleton** — startup, shutdown, claim cycle, idle wait, graceful release, reclaim expired leases — **no dispatch**
4. **Dependency Injection** — durable worker wired behind `APZHUB_NOTIFICATION_DURABLE_RUNTIME` (default **OFF**); process-local runtime unchanged

## Pack contents

| Document                                                       | Purpose                     |
| -------------------------------------------------------------- | --------------------------- |
| [PRECONDITION-VERIFICATION.md](./PRECONDITION-VERIFICATION.md) | Gate results                |
| [CLAIM-ENGINE.md](./CLAIM-ENGINE.md)                           | Claim design & API          |
| [LEASE-ENGINE.md](./LEASE-ENGINE.md)                           | Lease operations            |
| [WORKER-LIFECYCLE.md](./WORKER-LIFECYCLE.md)                   | Durable worker skeleton     |
| [DEPENDENCY-INJECTION.md](./DEPENDENCY-INJECTION.md)           | Flag / DI wiring            |
| [TEST-RESULTS.md](./TEST-RESULTS.md)                           | Affected Vitest             |
| [QUALITY-RESULTS.md](./QUALITY-RESULTS.md)                     | Build/typecheck/lint/format |
| [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)                 | Phase completion            |
| [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                   | **ACCEPTED / CLOSED**       |

## Downstream

**Platform-1.4-ENG-001B-P3** — **IMPLEMENTED / AWAITING OWNER PHASE 3 ACCEPTANCE**.

## STOP

Phase 2 **ACCEPTED / CLOSED**. Downstream: ENG-001B-P3 only until Owner Phase 3 Acceptance.
