# Workflow Platform Services

> **Package:** `@apzhub/platform-services` **0.28.0** (Workflow runtime plane)  
> **Contracts:** `@apzhub/workflow-contracts` **0.4.2**  
> **Programme:** APZHUB-PLATFORM-WORKFLOW-004  
> **Status:** **ACCEPTED / CLOSED** · **SERVICES READY**  
> **Integration:** `@apzhub/integration-n8n` **0.1.0** (ops provider — read-only execute)  
> **HTTP follow-on:** APZHUB-PLATFORM-WORKFLOW-005 ([docs/http/workflow](../../http/workflow/README.md))

---

## Purpose

Provider-neutral Workflow Platform Services implementing business orchestration over Workflow Contracts. Consumed by the Workflow HTTP API (WORKFLOW-005). No Workbench UI in this programme.

## Gateway surface

`gateway.workflow` (`WorkflowPlatformGateway`):

| Facet                 | Implementation                                     |
| --------------------- | -------------------------------------------------- |
| `workflows` … `audit` | Existing SoR (workflow-core / persistence)         |
| `engine`              | Existing n8n read-only discovery (APZWORKFLOW-007) |
| `runs`                | `WorkflowRunServiceImpl`                           |
| `schedules`           | `WorkflowScheduleServiceImpl`                      |
| `tasks`               | `WorkflowTaskServiceImpl`                          |
| `approvals`           | `ApprovalServiceImpl`                              |
| `notifications`       | `NotificationServiceImpl` (intent only)            |
| `capabilities`        | `CapabilityServiceImpl`                            |
| `health`              | `HealthServiceImpl`                                |

Also: `WorkflowServiceImpl` wraps the SoR `workflows` facet.

## Factories

| Factory                                       | Role                                               |
| --------------------------------------------- | -------------------------------------------------- |
| `createWorkflowPlatformServicesForTest`       | In-memory SoR + mock/runtime ops                   |
| `createWorkflowPlatformServicesForProduction` | Postgres SoR + injectable ops                      |
| `createN8nWorkflowOpsProvider(adapter)`       | Health/capabilities from n8n (execute unsupported) |
| `createMockWorkflowOpsProvider`               | Unit / simulated execute                           |

## Runtime model

- **Registry:** in-memory MVP for runs, schedules, tasks, notification intents
- **Provider execute:** when unsupported, `runs.start` records a run with `PROVIDER_EXECUTE_NOT_SUPPORTED` (honest foundation limitation)
- **Mock execute:** optional for tests (`providerExecuteSupported: true`)

## Authorization (Owner operations)

| Owner operation         | Permission key                                                               |
| ----------------------- | ---------------------------------------------------------------------------- |
| View Workflows          | `workflow.view`                                                              |
| Manage Workflows        | `workflow.create` / `update` / `delete` / `publish` …                        |
| Execute Workflow        | `workflow.runs.start`                                                        |
| Cancel Workflow         | `workflow.runs.cancel`                                                       |
| Manage Schedules        | `workflow.schedules.manage`                                                  |
| Manage Credentials      | `workflow.credentials.manage` (catalogue; no credential service impl in 004) |
| Manage Approvals        | `workflow.tasks.approve`                                                     |
| Workflow Administration | `workflow.admin`                                                             |

Pipeline service keys: `workflowRuns`, `workflowSchedules`, `workflowTasks`, `workflowApprovals`, `workflowNotifications`, `workflowCapabilities`, `workflowHealth`.

## Boundaries

- No n8n DTOs on service surfaces — ops provider maps to contracts only
- HTTP is a separate programme (WORKFLOW-005) — services remain presentation-agnostic
- No Workbench / commercial APZ Workflow in this programme
- Notification intents only — delivery remains Notification Framework

## Manifest

[`services/workflow/service.yaml`](../../../services/workflow/service.yaml)

## Explicit non-deliverables (004 scope)

Workflow Workbench · commercial APZ Workflow · provider execute unlock beyond CERTIFIED_FOUNDATION
