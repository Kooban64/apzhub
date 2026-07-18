# APZWORKFLOW-011 — Wave Closeout Report

**Date:** 2026-07-16  
**Programme:** Workflow Engine (n8n Reference Adapter)  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**

---

## Wave closed

| Track                   | Milestones          | Classification                                 |
| ----------------------- | ------------------- | ---------------------------------------------- |
| Workflow Platform (SoR) | APZWORKFLOW-001…005 | **PRODUCTION_READY_WITH_LIMITATIONS** (frozen) |
| Workflow Engine (n8n)   | APZWORKFLOW-006…011 | **PRODUCTION_READY_WITH_LIMITATIONS** (frozen) |

## Reference Adapter

**`@apzhub/integration-n8n` 0.1.0** is the official APZHUB Workflow Engine Reference Adapter.

## Architecture freeze

See [Architecture Freeze Notice](../architecture/APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md) and [Final Architecture](../architecture/APZHUB-Workflow-Engine-Final-Architecture.md).

## Audit evidence

| Audit                                           | Result |
| ----------------------------------------------- | ------ |
| `pnpm audit:workflow-vertical` (001–005)        | PASS   |
| `pnpm audit:workflow-engine-vertical` (006–010) | PASS   |
| `pnpm audit:workflow-engine-wave` (011)         | PASS   |
| `pnpm openapi:validate:platform`                | PASS   |

## Stop

Programme wave complete. Next roadmap item only: **APZWORKFLOW-012** (future adapters) — not authorised.
