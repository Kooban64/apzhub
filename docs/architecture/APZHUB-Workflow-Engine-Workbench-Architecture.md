# APZHUB Workflow Engine Workbench Architecture

**Milestone:** APZWORKFLOW-009  
**Route:** `/workspace/workflow-engine`  
**Status:** Implemented — presentation-only over Workflow Engine typed HTTP client

## Purpose

Product-neutral Workflow Engine workbench. Thin presentation layer over the certified read-only engine path. No designer, drag-drop, execution, scheduling, mutations, Event Bus, workers, credentials, or webhooks.

## Architecture

```text
Workflow Engine Workbench (PlatformWorkflowEngineView)
  → engine-api / createHttpWorkflowEngineClient()
  → HTTP /api/v1/workflows/engine/*
  → PlatformServiceGateway.workflow.engine.*
  → RequestPipeline → Authorization → Platform Services
  → Integration SDK → n8n Reference Adapter → n8n
```

**Forbidden in UI:** Gateway imports, Platform Services, Integration SDK / n8n adapter, Workflow Core, persistence, direct `fetch`.

## Sections

| Section | Path | Content |
|---------|------|---------|
| Overview | `/workspace/workflow-engine/overview` | Inventory cards; prominent **READ-ONLY ENGINE** |
| Workflows | `…/workflows` | List, detail, metadata, definition viewer (counts) |
| Templates | `…/templates` | List / detail / usage note |
| Projects | `…/projects` | List / metadata |
| Users | `…/users` | List / assignments note |
| Tags | `…/tags` | List / usage counts from list join |
| Capabilities | `…/capabilities` | Supported / unsupported |
| Health | `…/health` | Platform & engine health |
| Diagnostics | `…/diagnostics` | Latency, readiness, versions |
| Compatibility | `…/compatibility` | Supported / unsupported / limitations |

## Commands

Refresh · View Details · Copy ID · Open API Metadata · Validate Connection  

No execute / activate / deactivate / schedule / deploy / run.

## Manifests

`packages/workbench-framework/manifests/platform-workflow-engine*/module.yaml` — permissions `workflow.engine.read`, `workflow.engine.health`, `workflow.engine.diagnostics`, `workflow.engine.capabilities`.

## Accessibility

Keyboard-reachable rows and toolbar, ARIA status/alert regions, responsive layout, token colours.
