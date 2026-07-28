# Workflow Platform — Contract Planning

> **Programme:** APZHUB-PLATFORM-WORKFLOW-002  
> **Classification:** DOCUMENTATION ONLY — planning record  
> **Date:** 2026-07-19  
> **Note:** Historical planning record. **Superseded for delivery** by [WORKFLOW-CONTRACTS.md](./WORKFLOW-CONTRACTS.md) (`@apzhub/workflow-contracts` **0.4.0**, APZHUB-PLATFORM-WORKFLOW-003).

---

## 1. Purpose

Identify canonical contract surfaces so future Workflow Platform Services, HTTP APIs, Workbench clients, and provider adapters share one interface language aligned to the Information Model.

This document does **not** create packages or change frozen contracts.

---

## 2. Planned / target contract surfaces

| Contract / service              | Primary types                                                             | Operations (illustrative)                                            |
| ------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **WorkflowDefinitionService**   | `Workflow`, `WorkflowVersion`, `WorkflowDefinition`, `WorkflowTemplate`   | `list`, `get`, `create`, `publish`, `archive`, `instantiateTemplate` |
| **WorkflowRunService**          | `WorkflowRun`, `WorkflowExecutionStep`, `WorkflowInput`, `WorkflowOutput` | `start`, `get`, `list`, `cancel`, `listSteps`                        |
| **WorkflowScheduleService**     | `WorkflowSchedule`, `WorkflowTrigger`                                     | `create`, `arm`, `pause`, `retire`                                   |
| **WorkflowTaskService**         | `WorkflowTask`, `ManualTask`, `ApprovalTask`                              | `listInbox`, `claim`, `complete`, `approve`, `reject`                |
| **WorkflowCredentialService**   | `WorkflowCredential`, `WorkflowSecretReference`                           | `list`, `bind`, `rotateRef` (no secret values)                       |
| **WorkflowVariableService**     | `WorkflowVariable`, `WorkflowParameter`                                   | `list`, `upsert`                                                     |
| **WorkflowHealthService**       | `WorkflowHealth`, `WorkflowCapability`                                    | `getHealth`, `getCapabilities`, `getDiagnostics`                     |
| **WorkflowCompensationService** | `WorkflowCompensation`, `WorkflowRetry`                                   | `compensate`, `retry`                                                |

Gateway facet (target evolution): `gateway.workflow.*` (+ existing `gateway.workflow.engine.*` discovery).

---

## 3. Permission contract (keys — finalise at contracts programme)

| Key pattern                         | Used by                     |
| ----------------------------------- | --------------------------- |
| `workflow.view` / existing SoR keys | catalogue, templates        |
| `workflow.engine.*`                 | engine discovery (existing) |
| `workflow.runs.*` (target)          | start/cancel/observe runs   |
| `workflow.schedules.*` (target)     | schedule admin              |
| `workflow.tasks.*` (target)         | HITL inbox                  |
| `workflow.credentials.*` (target)   | credential bindings         |
| `workflow.admin`                    | diagnostics deep / rare     |

---

## 4. Package placement (future — not created/changed now)

| Package                                                              | Role                                              |
| -------------------------------------------------------------------- | ------------------------------------------------- |
| `@apzhub/workflow-contracts` **0.3.0** (existing, frozen)            | Current SoR + engine discovery types              |
| Additive evolution of `workflow-contracts` **or** scoped new package | Only via Owner-approved programme + freeze policy |
| `service.yaml` under `/services/workflow/`                           | Platform Service SDK (027) — existing baseline    |

---

## 5. Mapping to Information Model

| Entity                                                             | Appears in contracts              |
| ------------------------------------------------------------------ | --------------------------------- |
| Workflow / WorkflowVersion / WorkflowDefinition / WorkflowTemplate | WorkflowDefinitionService         |
| WorkflowRun / WorkflowExecution / WorkflowExecutionStep            | WorkflowRunService                |
| WorkflowInstance                                                   | Optional on RunService            |
| WorkflowSchedule / WorkflowTrigger / WorkflowEvent                 | Schedule/Trigger services         |
| WorkflowTask / ManualTask / ApprovalTask / HumanTask               | WorkflowTaskService               |
| WorkflowCredential / WorkflowSecretReference                       | WorkflowCredentialService         |
| WorkflowVariable / WorkflowParameter / Input / Output / Artifact   | Definition + Run services         |
| WorkflowError / Retry / Compensation / Queue                       | Run + Compensation services       |
| WorkflowNotification                                               | Event publish contract (not SMTP) |
| WorkflowHealth / WorkflowCapability                                | WorkflowHealthService             |

---

## 6. Provider adapter contract (Integration SDK)

Adapters expose capability discovery and translate:

- Definition sync / execute / cancel / status (when authorised)
- Error translation → `WorkflowError`
- Opaque `providerRef` only

No module imports of adapter clients (008).

---

## 7. Freeze honesty

APZWORKFLOW freeze forbids adding execute/schedule/HITL HTTP/routes/services without Owner Approval. Contract planning here prepares language only.

---

## Related

- [WORKFLOW-INFORMATION-MODEL.md](./WORKFLOW-INFORMATION-MODEL.md)
- Existing engineering contracts package on disk (frozen)
