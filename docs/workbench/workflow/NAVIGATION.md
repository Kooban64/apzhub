# Workflow Workbench — Navigation

> **Programme:** APZHUB-PLATFORM-WORKFLOW-006

## Activity Bar

| Field      | Value                 |
| ---------- | --------------------- |
| Workspace  | `workflow`            |
| Label      | Workflow              |
| Route      | `/workspace/workflow` |
| Order      | 29                    |
| Permission | `workflow.view`       |

## Sidebar

Registered via child manifests (`level: sidebar`, `parent: workflow`) and catalogue entries in the parent `module.yaml`:

Home · Definitions · Runs · Schedules · Tasks · Approvals · Notifications · Search · Health · Diagnostics · Capabilities

## Deep links

Detail routes for definitions, runs, schedules, tasks, and approvals are resolved by `resolveWorkflowRoute` in `apps/web/lib/workflow/routes.ts`.

## Commands

Palette actions (`workbench.actions`) open Home, Definitions, Runs, Tasks, Search, and Health via `workbench-bridge:workbench.navigation.reveal`.

## Default landing

`/workspace/workflow` (Workflow Home).
