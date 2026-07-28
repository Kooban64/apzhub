# Workflow Platform Contracts

> **Package:** `@apzhub/workflow-contracts` **0.4.2**  
> **Programme:** APZHUB-PLATFORM-WORKFLOW-003 (**ACCEPTED / CLOSED**)  
> **Status:** **ACCEPTED / CLOSED** — evolved **0.4.1** (WORKFLOW-004 gateway facets) · **0.4.2** (`listIntents` for WORKFLOW-005 HTTP)  
> **SDK / boundary:** Provider-neutral · Integration SDK **1.0.0** unchanged

---

## Purpose

Canonical TypeScript models and service **interfaces** for all Workflow providers and consumers. Aligned to the [Workflow Information Model](./WORKFLOW-INFORMATION-MODEL.md). No business logic.

## Package

| Item        | Value                                                                                                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name        | `@apzhub/workflow-contracts`                                                                                                                                                                                                 |
| Path        | `packages/workflow-contracts/`                                                                                                                                                                                               |
| Version     | **0.4.2**                                                                                                                                                                                                                    |
| SemVer note | Additive evolution of existing **0.3.0** SoR/engine contracts (APZWORKFLOW). **0.4.1** adds runtime facets on `WorkflowPlatformGateway` for WORKFLOW-004; **0.4.2** adds `NotificationService.listIntents` for WORKFLOW-005. |

## Models (Owner catalogue)

| Contract type                                                | Plane            | Notes                                                |
| ------------------------------------------------------------ | ---------------- | ---------------------------------------------------- |
| `Workflow`                                                   | Definition       | Existing SoR root                                    |
| `WorkflowTemplate`                                           | Definition       | Existing SoR                                         |
| `WorkflowDefinition`                                         | Definition       | Version content snapshot (NEW)                       |
| `WorkflowVersion`                                            | Definition       | Existing SoR                                         |
| `WorkflowRun`                                                | Execution        | Canonical run (NEW); `WorkflowExecution` alias       |
| `WorkflowRunStep`                                            | Execution        | Step within run (NEW); `WorkflowExecutionStep` alias |
| `WorkflowSchedule`                                           | Trigger          | Time arming (NEW)                                    |
| `WorkflowTrigger`                                            | Definition graph | Existing graph-node trigger on version               |
| `WorkflowTriggerBinding`                                     | Trigger          | IM arming trigger (NEW)                              |
| `WorkflowEvent`                                              | Trigger          | Normalised event (NEW)                               |
| `WorkflowTask` / `ManualTask` / `ApprovalTask` / `HumanTask` | HITL             | NEW                                                  |
| `WorkflowQueue`                                              | Execution        | NEW                                                  |
| `WorkflowCredentialReference`                                | Security         | NEW                                                  |
| `WorkflowSecretReference`                                    | Security         | NEW — never secret values                            |
| `WorkflowVariable` / `WorkflowParameter`                     | Definition       | Existing                                             |
| `WorkflowInput` / `WorkflowOutput` / `WorkflowArtifact`      | Execution        | NEW                                                  |
| `WorkflowNotification`                                       | Ops              | Intent only (NEW)                                    |
| `WorkflowRetry` / `WorkflowCompensation`                     | Runtime          | NEW                                                  |
| `WorkflowHealth` / `WorkflowCapability` / `WorkflowProvider` | Ops              | NEW                                                  |

## Service interfaces (no implementations)

| Interface                                             | Role                                                                 |
| ----------------------------------------------------- | -------------------------------------------------------------------- |
| `WorkflowService`                                     | Catalogue CRUD / lifecycle (existing gateway facet)                  |
| `WorkflowTemplateService`                             | Templates (existing)                                                 |
| `WorkflowRunService`                                  | Start / get / list / cancel / steps (NEW)                            |
| `WorkflowScheduleService`                             | Create / arm / pause / retire (NEW)                                  |
| `WorkflowTaskService`                                 | Inbox / claim / complete (NEW)                                       |
| `ApprovalService`                                     | Approve / reject (NEW)                                               |
| `NotificationService` (`WorkflowNotificationService`) | Publish notification intent (NEW)                                    |
| `CapabilityService`                                   | Capabilities + providers (NEW)                                       |
| `HealthService`                                       | Health snapshots (NEW)                                               |
| `WorkflowCanonicalGateway`                            | Future composition of the above + existing `WorkflowPlatformGateway` |
| `WorkflowPlatformGateway`                             | Implemented SoR + `engine` discovery (unchanged)                     |

## Permissions

See [WORKFLOW-CONTRACTS-COMPATIBILITY.md](./WORKFLOW-CONTRACTS-COMPATIBILITY.md) for operation → permission mappings.

Runtime plane keys (contracts only — not yet enforced by Platform Services operations):

- `workflow.runs.*` · `workflow.schedules.*` · `workflow.tasks.*` · `workflow.credentials.*` · `workflow.admin`

## Provider neutrality

- Provider binding uses opaque `{ providerId, providerRef }` only.
- **No** n8n-specific DTOs, headers, or API paths in this package.
- n8n remains behind `@apzhub/integration-n8n` (adapter layer).

## Examples

See `packages/workflow-contracts/src/examples/example-shapes.ts`.

## Explicit non-deliverables

Workflow Platform Services · HTTP APIs · Workbench · commercial APZ Workflow · `service.yaml` implementations · execute plane wiring
