# Implementation Phases — Platform-1.4-ENG-001B

> ENG-001B is **PROPOSED / BLOCKED** until Owner Design Acceptance + named Implementation Approval.

## Phase 0 — Prep

Objective: contracts + migration design freeze.  
Packages: notification-contracts (additive types), drizzle 0066 draft.  
Deliverables: lease field types; migration file (only in ENG-001B).  
Tests: typecheck.  
Done: types compile; migration drafted.

## Phase 1 — Persistence repository

Objective: Postgres repository implementing ports for intent/delivery/try/in-app.  
Packages: delivery-persistence, platform-services ports.  
Tests: integration against Postgres.  
Done: CRUD + idempotent insert PASS.

## Phase 2 — Claim / reclaim

Objective: SKIP LOCKED claim + lease reclaim + shutdown release.  
Packages: persistence + worker module.  
Tests: concurrency + lease expiry.  
Done: two-worker safety PASS.

## Phase 3 — Dispatch wiring

Objective: Replace Maps in `createNotificationDeliveryService` with repository; keep in-app adapter.  
Packages: platform-services delivery.  
Tests: eng004 suite + restart mid-dispatch.  
Done: durable path feature-flagged PASS.

## Phase 4 — Admin + observability

Objective: SQL-backed diagnostics/admin + metrics.  
Packages: platform-services, apps/web handlers/OpenAPI if needed.  
Tests: authz + tenant isolation.  
Done: admin list/replay PASS.

## Phase 5 — Cutover + docs

Objective: Rollout flags, runbooks, KL update, evidence.  
Tests: staging restart + smoke.  
Done: Owner Engineering Acceptance pack ready; P13-KL-ND-03 closed or reclassified.
