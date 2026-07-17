# n8n Gateway Integration Guide

**APZWORKFLOW-007**

## Surface

```ts
bundle.gateway.workflow.engine.workflows.list(ctx)
bundle.gateway.workflow.engine.workflows.get(ctx, id)
bundle.gateway.workflow.engine.templates.list(ctx)
bundle.gateway.workflow.engine.tags.list(ctx)
bundle.gateway.workflow.engine.users.list(ctx)
bundle.gateway.workflow.engine.projects.list(ctx)
bundle.gateway.workflow.engine.capabilities.get(ctx)
bundle.gateway.workflow.engine.health.get(ctx)
bundle.gateway.workflow.engine.diagnostics.get(ctx)
bundle.gateway.workflow.engine.compatibility.get(ctx)
bundle.gateway.workflow.engine.connection.validate(ctx)
```

## Rules

- Always go through `PlatformServiceGateway` (or a gateway wrapped with `RequestPipeline`).
- Do **not** import `@apzhub/integration-n8n` from `apps/web` or modules.
- Do **not** call adapter methods from HTTP handlers in this milestone (HTTP is APZWORKFLOW-008).

## Pipeline service names

| Facet | Service name |
| --- | --- |
| workflows | `workflowEngineWorkflows` |
| templates | `workflowEngineTemplates` |
| tags | `workflowEngineTags` |
| users | `workflowEngineUsers` |
| projects | `workflowEngineProjects` |
| capabilities | `workflowEngineCapabilities` |
| health | `workflowEngineHealth` |
| diagnostics | `workflowEngineDiagnostics` |
| compatibility | `workflowEngineCompatibility` |
| connection | `workflowEngineConnection` |
