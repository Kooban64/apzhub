# APZHUB — Workflow Gateway Architecture

**Milestone:** APZWORKFLOW-002  
**Status:** Implemented  
**Date:** 2026-07-15

---

## Shape (required)

```text
gateway.workflow.workflows
gateway.workflow.versions
gateway.workflow.templates
gateway.workflow.categories
gateway.workflow.folders
gateway.workflow.validation
gateway.workflow.audit
```

Extends the existing `PlatformServiceGateway` only. There is **no** `WorkflowServiceGateway`.

## Wiring

1. Build a `WorkflowPlatformServicesBundle` via production or test factory.
2. Pass `workflow` into `createPlatformServices({ workflow })`.
3. Bundle `wrapWithPipeline(pipeline)` yields pipeline-wrapped facets assigned to `workflowApi`.
4. `gateway.workflow` returns the nested surface or throws `PROVIDER_CAPABILITY_UNSUPPORTED` when unset.

## Context

Gateway methods accept `ServiceRequestContext` (pipeline). Thin impls map to `WorkflowRequestContext` for `@apzhub/workflow-core`.

## Pipeline service names

| Facet | `serviceName` |
| ----- | ------------- |
| workflows | `workflowWorkflows` |
| versions | `workflowVersions` |
| templates | `workflowTemplates` |
| categories | `workflowCategories` |
| folders | `workflowFolders` |
| validation | `workflowValidation` |
| audit | `workflowAudit` |

These keys must match `workflowPlatformOps` in the operation authorisation map.
