# n8n Platform Services Authorization Guide

**APZWORKFLOW-007**

## Catalogue

| Permission                     | Use                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `workflow.engine.*`            | Wildcard grant for engine surface                                                                      |
| `workflow.engine.read`         | list/get workflows, templates, tags, users, projects; mutation stubs (still NOT_SUPPORTED after authz) |
| `workflow.engine.health`       | health + connection.validate                                                                           |
| `workflow.engine.diagnostics`  | diagnostics                                                                                            |
| `workflow.engine.capabilities` | capabilities + compatibility                                                                           |

Note: platform wildcard `workflow.*` also matches `workflow.engine.*` via namespace rules.

## Mapping

Authorisation is explicit in `operation-authorization-map.ts` (`workflowEngineOps`). Missing mapping → fail closed.

## Isolation

Production Authorization enforces tenant / organisation scope. Engine ops use resource types `workflow_engine`, `workflow_engine_health`, `workflow_engine_diagnostics`, `workflow_engine_capabilities`.
