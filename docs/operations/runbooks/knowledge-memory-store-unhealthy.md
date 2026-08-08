# Runbook — Knowledge memory store unhealthy

> **Service:** Knowledge (`knowledge`) · **Owner:** Knowledge Product Owner · **Priority:** P2 · **Policy:** `alert.knowledge.memory-store-unhealthy`

## 1. Title / service / owner

Organisational Memory Platform Service (Postgres). Owner: Knowledge Product Owner.

## 2. Symptoms

Knowledge API errors; Memory Companion not loading; 503 on `/api/v1/knowledge/*`.

## 3. Severity guidance

**P2** Tier B product path. Elevate to P1 only if multi-product or security impact.

## 4. Preconditions

- No AI/RAG claims in user communications.
- Consumer overlays are deferred in v1.0 — do not claim them.
- No Knowledge 2.0 scope under this runbook.

## 5. Diagnosis steps

1. Platform Postgres health + `platform_knowledge_object` table presence.
2. Flag `APZHUB_KNOWLEDGE_MEMORY_STORE` — must not be `memory` in production.
3. Correlate failing requests by `correlationId`.
4. Confirm fail-closed (no silent in-memory success in production).

## 6. Containment

- Fail closed: unavailable store → 503 / honest user messaging.
- Freeze Knowledge Changes that touch the store.
- Do not enable `APZHUB_KNOWLEDGE_MEMORY_STORE=memory` in production.

## 7. Resolution / rollback

- Restore Postgres connectivity / migrations.
- Rollback last Knowledge change if regression.
- Re-validate Home → Memory / Lessons path.

## 8. Verification

- Memory Companion loads for permissioned users.
- No elevated 5xx on Knowledge routes.

## 9. Escalation

Knowledge Product Owner → Platform Ops Lead.

## 10. Related

APZ Knowledge Known Limitations / Operational Readiness · Delivery Standard evidence KNW-PR-01 / KNW-PR-06.
