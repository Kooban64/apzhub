# Workflow Engine Workbench — Commands Guide

**Milestone:** APZWORKFLOW-009

| Command | Behaviour |
|---------|-----------|
| Refresh | Invalidates `workflowEngineQueryKeys.all` |
| View Details | Focuses/shows selected workflow detail + definition viewer |
| Copy ID | Copies selected workflow id to clipboard |
| Open API Metadata | Expands JSON envelope (base path + selection) |
| Validate Connection | Calls `validateEngineConnection()` when `canValidateConnection` |

Palette actions (manifest): navigate, refresh, validate (`workflow.engine.health`).

**Never exposed:** execute, activate, deactivate, schedule, deploy, run.
