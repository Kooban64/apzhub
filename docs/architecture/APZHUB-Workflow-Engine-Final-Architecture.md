# APZHUB Workflow Engine — Final Architecture

**Milestone:** APZWORKFLOW-011 — Wave Certification & Reference Adapter Closeout  
**Status:** Frozen reference architecture  
**Package:** `@apzhub/integration-n8n` **0.1.0**  
**Authority:** [Workflow Engine Reference Adapter Standard](./APZHUB-Workflow-Engine-Reference-Adapter-Standard.md)

---

## End-to-end stack

### Workflow Platform (SoR) — APZWORKFLOW-001…005

```text
Workflow Workbench (/workspace/workflows)
  → createHttpWorkflowClient()
    → /api/v1/workflows/*
      → gateway.workflow.*
        → RequestPipeline + workflow.* authorization
          → Platform Services → Workflow Core → Persistence → PostgreSQL
```

### Workflow Engine (Reference Adapter) — APZWORKFLOW-006…011

```text
Workflow Engine Workbench (/workspace/workflow-engine)
  → createHttpWorkflowEngineClient()
    → /api/v1/workflows/engine/*
      → gateway.workflow.engine.*
        → RequestPipeline + workflow.engine.* authorization
          → Platform Services
            → Integration SDK
              → @apzhub/integration-n8n
                → n8n (optional live; explicit bootstrap)
```

## Frozen decisions

1. Workflow Platform is SoR for managed workflow definitions/lifecycle.
2. Engine adapter is **read-only metadata** — no execution/scheduling/mutations in this wave.
3. Presentation never bypasses Gateway / typed HTTP client.
4. RequestPipeline + Production Authorization on every public gateway op.
5. Product-neutral UI (“Workflow Engine”); backend branding masked.
6. Live provider optional via `APZHUB_WORKFLOW_ENGINE_*` — no silent production mock.

## Frozen package versions

| Package                        | Version |
| ------------------------------ | ------- |
| `@apzhub/integration-n8n`      | 0.1.0   |
| `@apzhub/workflow-contracts`   | 0.3.0   |
| `@apzhub/workflow-core`        | 0.1.1   |
| `@apzhub/workflow-persistence` | 0.1.1   |
| `@apzhub/platform-services`    | 0.20.0  |

## Related

[Architecture Freeze Notice](./APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md) · [n8n Adapter Architecture](./APZHUB-N8n-Adapter-Architecture.md) · [Production Readiness (010)](../reviews/APZWORKFLOW-010-Production-Readiness.md)
