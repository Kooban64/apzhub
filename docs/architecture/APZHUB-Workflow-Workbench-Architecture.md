# APZHUB Workflow Workbench Architecture

**Milestone:** APZWORKFLOW-004  
**Route:** `/workspace/workflows`  
**Status:** Implemented — metadata-only presentation over typed HTTP client

## Purpose

Product-neutral Workflow Platform workbench. Thin presentation layer — no designer, drag-drop, execution, n8n, Event Bus, workers, schedules, or offline/browser persistence.

## Architecture

```text
Workbench (PlatformWorkflowsView)
  → workflow-api / createHttpWorkflowClient()
  → HTTP /api/v1/workflows
  → PlatformServiceGateway
  → RequestPipeline → Authorization → Platform Services → Workflow Core
```

## Sections

| Section | Path | Content |
|---------|------|---------|
| Overview | `/workspace/workflows/overview` | Status cards; Execution Status always "Workflow Execution Not Available" |
| Workflows | `/workspace/workflows/workflows` | Library + detail, definition viewer/graph, dependencies, lifecycle |
| Versions | `/workspace/workflows/versions` | Version list, compare, definition viewer/graph |
| Templates | `/workspace/workflows/templates` | Template list/detail (no editor) |
| Categories | `/workspace/workflows/categories` | Category catalogue |
| Folders | `/workspace/workflows/folders` | Folder catalogue |
| Validation | `/workspace/workflows/validation` | Issues grouped by severity |
| Audit | `/workspace/workflows/audit` | Audit timeline |
| Diagnostics | `/workspace/workflows/diagnostics` | Capabilities / health / readiness; execution unavailable |

## Commands

Refresh · Copy ID · Validate · Publish · Archive · Restore · Transition · Export JSON/YAML/Markdown

Publish may be hidden when `canPublish={false}` (UI hint). **Server remains authoritative** for permissions.

## Manifests

`packages/workbench-framework/manifests/platform-workflows*/module.yaml` — permissions `workflow.view`, `workflow.template.view`, `workflow.validation`, `workflow.audit`.

## Accessibility

Keyboard-reachable table rows and commands, ARIA toolbar/status/alert regions, labelled filters, responsive layout, token colours.
