# APZHUB — Workflow Authorization Guide

**Milestone:** APZWORKFLOW-002  
**Date:** 2026-07-15

---

## Catalogue

`PLATFORM_WORKFLOW_PERMISSIONS` (from `@apzhub/workflow-contracts`) is spread into `PLATFORM_SERVICE_PERMISSION_CATALOGUE`.

Notable keys:

| Permission            | Use                                               |
| --------------------- | ------------------------------------------------- |
| `workflow.view`       | get / find / list versions / categories / folders |
| `workflow.create`     | create workflow / category / folder               |
| `workflow.update`     | update / transition                               |
| `workflow.delete`     | delete workflow                                   |
| `workflow.publish`    | publish                                           |
| `workflow.archive`    | archive                                           |
| `workflow.restore`    | restore                                           |
| `workflow.validation` | validation.validate                               |
| `workflow.audit`      | audit.list                                        |
| `workflow.template.*` | template facet operations                         |
| `workflow.*`          | wildcard role grant (not a security bypass)       |

## Production path

Production uses the existing `AuthorizationProvider` / RequestPipeline. There is **no** allow-all in the production authorisation path. Test harnesses may use `authorizationMode: "allow-all"` only in tests.

## Operation map

`workflowPlatformOps` maps each `service.method` → permission. Unknown operations fail closed.
