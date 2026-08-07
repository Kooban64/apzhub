# RBAC Mapping — APZ-WORKFLOW-NATIVE-001-N02

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-02             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T164500Z |

## Catalogue

Registered in:

- `packages/workflow-contracts/src/permissions/catalogue.ts` (existing)
- `packages/platform-authorization/src/authorization-seed.ts`
- `packages/platform-authorization/src/postgres-authorization-store.ts`

## Role grants (seed)

| Role                   | Workflow grant                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Platform Administrator | `*` (unchanged)                                                                                                      |
| Tenant Member          | **Business-process keys only** — `workflow.view`, create/update/publish/…, `workflow.template.*`, `workflow.tasks.*` |

**Not** granted to Tenant Member:

- `workflow.*` (wildcard would collapse layers)
- `workflow.admin`
- `workflow.engine.*`
- `workflow.runs.*`
- `workflow.schedules.*`
- `workflow.credentials.*`

## UI helpers

| Helper                          | Meaning                                      |
| ------------------------------- | -------------------------------------------- |
| `canViewWorkflow`               | Default product identity                     |
| `canViewWorkflowTasks`          | Participants / approvals (business)          |
| `canAdminWorkflow`              | Operator — execution & engine below boundary |
| `canViewWorkflowRuns/Schedules` | Explicit grant **or** admin                  |
| `canViewWorkflowEngine`         | Explicit engine read **or** admin            |

`workflow.view` no longer implies runs, schedules, health, capabilities, or engine.

## Manifests

| Surface                                                                | Permission                                        |
| ---------------------------------------------------------------------- | ------------------------------------------------- |
| Workflow / Workflows Activity Bar                                      | `workflow.view`                                   |
| Runs / Schedules / Health / Diagnostics / Capabilities / Notifications | `workflow.admin`                                  |
| Workflow Engine Activity Bar                                           | **`workflow.admin`** (was `workflow.engine.read`) |

## Identity note

Admin-gating execution and engine keeps automation vocabulary out of the default product identity. Full chrome rename to Process / Stage / Step language remains **N-03**.
