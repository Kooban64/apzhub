# Workflow Engine Consumer Guide

**APZWORKFLOW-008**

## Preferred consumption

1. Use `createHttpWorkflowEngineClient()` / `getWorkflowEngineClient()`
2. Use `workflowEngineQueryKeys` for React Query (read-only keys only)
3. Never call engines, adapters, or Platform Services from UI modules

## Enablement

| Env                                   | Purpose                                               |
| ------------------------------------- | ----------------------------------------------------- |
| `APZHUB_WORKFLOW_ENABLED=true`        | Enables Workflow HTTP (SoR + engine routes gate)      |
| `APZHUB_WORKFLOW_ENGINE_ENABLED=true` | Wires certified adapter in gateway bootstrap          |
| `APZHUB_WORKFLOW_ENGINE_BASE_URL`     | Required when engine enabled                          |
| `APZHUB_WORKFLOW_ENGINE_API_KEY`      | Optional secret material for bootstrap SecretProvider |

## Out of scope

Workbench · execution · scheduling · mutations · Event Bus
