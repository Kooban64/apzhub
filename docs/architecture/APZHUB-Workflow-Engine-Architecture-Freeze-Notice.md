# APZHUB Workflow Engine — Architecture Freeze Notice

**Milestone:** APZWORKFLOW-011  
**Effective:** 2026-07-16  
**Status:** **FROZEN**

---

## Declaration

The following are **frozen** after APZWORKFLOW-011 wave closeout:

| Surface | Status |
| ------- | ------ |
| Workflow Platform contracts (`workflow-contracts`) | Frozen |
| Workflow Platform services / Core / Persistence | Frozen |
| Gateway integration (`gateway.workflow.*` + `gateway.workflow.engine.*`) | Frozen |
| RequestPipeline integration | Frozen |
| Production Authorization pattern (`workflow.*` / `workflow.engine.*`) | Frozen |
| Workflow HTTP API (`/api/v1/workflows` + `/engine`) | Frozen |
| Workflow typed clients (`createHttpWorkflowClient` / `createHttpWorkflowEngineClient`) | Frozen |
| Workflow Workbenches (`/workspace/workflows` · `/workspace/workflow-engine`) | Frozen |
| Integration SDK extension pattern for workflow engines | Frozen |
| n8n adapter pattern (`@apzhub/integration-n8n` **0.1.0**) | Frozen |

## Change policy

Future enhancements must:

1. Preserve backward compatibility, **or**
2. Follow the project ADR process with explicit owner approval

**Do not** add execution, scheduling, mutations, Event Bus, workers, designer, new HTTP routes, new Gateway facets, new Workbench views, or new workflow engines without a new approved milestone.

## Reference Adapter

**`@apzhub/integration-n8n` is the official APZHUB Workflow Engine Reference Adapter.**  
See [Workflow Engine Reference Adapter Standard](./APZHUB-Workflow-Engine-Reference-Adapter-Standard.md).

## Next (not authorised)

**APZWORKFLOW-012 — Future Workflow Engine Adapters (Camunda, Temporal, Flowable, etc.)** — roadmap only.
