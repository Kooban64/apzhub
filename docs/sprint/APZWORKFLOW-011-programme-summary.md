# APZWORKFLOW-011 — Programme Summary

**Programme:** APZHUB Workflow (Platform + Engine)  
**Closeout:** APZWORKFLOW-011 (2026-07-16)

---

## Platform track (SoR)

1. **001** — Foundation (contracts, core, persistence)  
2. **002** — Platform Services, Gateway, Authorization  
3. **003** — HTTP API & Typed Client  
4. **004** — Workbench  
5. **005** — Vertical Certification → **PRODUCTION_READY_WITH_LIMITATIONS**

## Engine track (n8n)

6. **006** — n8n Reference Adapter (`@apzhub/integration-n8n` 0.1.0)  
7. **007** — Platform Services Integration (`gateway.workflow.engine.*`)  
8. **008** — Engine HTTP & Typed Client (OpenAPI 1.3.0)  
9. **009** — Engine Workbench (`/workspace/workflow-engine`)  
10. **010** — Engine Vertical Certification → **PRODUCTION_READY_WITH_LIMITATIONS**  
11. **011** — Wave Certification & Reference Adapter Closeout → **frozen**

## Certified stacks

```text
SoR:      Workbench → Client → HTTP → gateway.workflow.* → Pipeline → Authz → Services → Core → Persistence
Engine:   Workbench → Client → HTTP → gateway.workflow.engine.* → Pipeline → Authz → Services → SDK → n8n adapter → n8n
```

## What was never delivered (by design)

Execution · scheduling · mutations · Event Bus · designer · additional engines

## Official declaration

**`@apzhub/integration-n8n` is the official Workflow Engine Reference Adapter.**  
Future engines (Camunda, Temporal, Flowable, Zeebe, …) must follow the [Reference Adapter Standard](../architecture/APZHUB-Workflow-Engine-Reference-Adapter-Standard.md) under **APZWORKFLOW-012** (roadmap only).
