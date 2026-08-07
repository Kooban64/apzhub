# Session Propagation — APZ-WORKFLOW-NATIVE-001-N02

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-02             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T164500Z |

## Behaviour

| Plane            | Router                          | Session hook             | Default grant |
| ---------------- | ------------------------------- | ------------------------ | ------------- |
| Runtime Workflow | `WorkflowWorkspaceRouter`       | `useWorkflowPermissions` | **None**      |
| Workflows SoR    | `WorkflowsWorkspaceRouter`      | `useWorkflowPermissions` | **None**      |
| Workflow Engine  | `WorkflowEngineWorkspaceRouter` | `useWorkflowPermissions` | **None**      |

Overrides remain for tests only. Production mounts pass no override — session grants only.

## Closed gaps

- **G-13** — Single APZHUB identity end-to-end for Workflow product planes
- Removed hard-coded `DEFAULT_UI_PERMISSIONS = ["workflow.*"]` on the runtime router
