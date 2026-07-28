# Options Analysis

## Option A — PostgreSQL-Owned Durable Runtime

Workers claim rows transaction-safely (lease / `FOR UPDATE SKIP LOCKED` class mechanisms). Postgres is SoR for intent, delivery, attempts, retry schedule, dead-letter, idempotency.

**Pros:** Matches ADR-0071; schema 0065 already present; shared-host friendly; portable; strong audit; multi-instance safe.  
**Cons:** DB connection pressure; claim latency; requires careful indexing/leases.  
**Fit:** Best alignment with accepted architecture.

## Option B — PostgreSQL SoR + Redis Coordination

Postgres remains SoR; Redis for wake-up/locks/scheduling hints.

**Pros:** Fast wake-up.  
**Cons:** Dual-system reconciliation; Redis loss risk; operational complexity; not required to meet durability if Postgres polling/LISTEN acceptable.  
**Fit:** Optional later optimisation — not required for MUST.

## Option C — Event Bus / Outbox-Orchestrated Runtime

Use Event Bus/Outbox as primary execution orchestrator.

**Pros:** Reuses platform async fabric.  
**Cons:** Event Bus is not evidenced as a work queue; claim/lease/DLQ ownership unclear; risk of event-as-state anti-pattern; ADR-0071 already chose Postgres delivery plane. Outbox may **emit** after state change but should not replace delivery SoR.  
**Fit:** Complementary publish path only.

## Option D — Dedicated External Queue/Broker

New broker as primary coordinator.

**Pros:** Industry familiarity.  
**Cons:** New infra dependency; portability/shared-host cost; exactly-once misconceptions; secrets/monitoring/backup burden; unnecessary given 0065.  
**Fit:** Rejected for Platform 1.4 MUST.

## Option E — Retain Process-Local with Limited Hardening

Keep Maps; add best-effort flush.

**Pros:** Minimal change.  
**Cons:** **Cannot meet** Platform 1.4 MUST durable runtime / restart recovery / multi-instance safety.  
**Fit:** Explicitly insufficient.
