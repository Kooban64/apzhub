# Workflow Information Model

> **Programme:** APZHUB-PLATFORM-WORKFLOW-002  
> **Classification:** DOCUMENTATION ONLY  
> **Status:** Complete — **Awaiting Owner Acceptance**  
> **Date:** 2026-07-19  
> **Prerequisite:** APZHUB-PLATFORM-WORKFLOW-001 **ACCEPTED** · ADR-0068 / ADR-0069  
> **Glossary:** [WORKFLOW-GLOSSARY.md](./WORKFLOW-GLOSSARY.md)

---

## 1. Purpose

Canonical **provider-neutral** language and domain objects for all Workflow Platform components and the APZ Workflow product.

This model governs contracts, platform metadata, UI copy, HTTP envelopes, and adapter mappings. Provider-native names (n8n workflow id, Temporal workflow id, …) stay **connector-internal** (011).

---

## 2. Layered model

```text
┌─────────────────────────────────────────────────────────────┐
│ Presentation (Workbench): Catalogue, Runs, Schedules,       │
│   Approvals inbox, Tasks, Health, Diagnostics               │
├─────────────────────────────────────────────────────────────┤
│ Workflow Platform metadata SoR (platform DB — target):      │
│   Workflow, WorkflowVersion, WorkflowTemplate,              │
│   WorkflowRun, WorkflowSchedule, WorkflowTrigger,           │
│   WorkflowTask / ApprovalTask / ManualTask,                 │
│   WorkflowSecretReference, WorkflowVariable, …              │
├─────────────────────────────────────────────────────────────┤
│ Runtime / policy concepts:                                  │
│   WorkflowRetry, WorkflowCompensation, WorkflowError,       │
│   WorkflowQueue, WorkflowEvent, WorkflowNotification        │
├─────────────────────────────────────────────────────────────┤
│ Adjacent platforms (not Workflow SoR):                      │
│   Identity principal · Notification delivery · Event Bus    │
│   Search index · Product domain entities                    │
├─────────────────────────────────────────────────────────────┤
│ Provider engine (n8n | future): definitions, engine runs,   │
│   engine credentials store — mapped via opaque refs         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Entity catalogue (canonical)

### 3.1 Definition plane

| Entity                 | Description                                                            | Identity                      |
| ---------------------- | ---------------------------------------------------------------------- | ----------------------------- |
| **Workflow**           | Platform catalogue root for an automation definition family            | Global platform ID (`wf_*`)   |
| **WorkflowVersion**    | Immutable published/draft revision of a workflow                       | Platform ID (`wfv_*`)         |
| **WorkflowDefinition** | Version content: graph/steps/config snapshot (provider-neutral schema) | Owned by WorkflowVersion      |
| **WorkflowTemplate**   | Reusable definition blueprint for instantiation                        | Platform ID (`wft_*`)         |
| **WorkflowParameter**  | Declared input parameter schema on a definition/template               | Parameter key + version scope |
| **WorkflowVariable**   | Governed named value/bindings available to runs (non-secret)           | Platform ID / key             |
| **WorkflowCapability** | Declared adapter/platform capability flag                              | Capability key                |

### 3.2 Execution plane

| Entity                    | Description                                                                                      | Identity                        |
| ------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------- |
| **WorkflowRun**           | **Canonical** execution of a WorkflowVersion (attempt)                                           | Platform ID (`wfr_*`)           |
| **WorkflowExecution**     | Synonym of **WorkflowRun** (contracts may expose either; prefer Run)                             | Same as Run                     |
| **WorkflowInstance**      | Long-lived process handle when engine distinguishes instance vs attempt; maps 1:1 or 1:N to Runs | Platform ID (`wfi_*`) optional  |
| **WorkflowExecutionStep** | Single step/node within a Run                                                                    | Step ID (`wfs_*`)               |
| **WorkflowInput**         | Typed input payload for a Run                                                                    | Value object on Run             |
| **WorkflowOutput**        | Typed output payload for a completed Run                                                         | Value object on Run             |
| **WorkflowArtifact**      | Produced file/link/ref from a Run/step                                                           | Platform ID (`wfa_*`)           |
| **WorkflowError**         | Structured failure record                                                                        | Error ID / embedded on Run/Step |
| **WorkflowRetry**         | Retry policy application / attempt record                                                        | Retry ID / embedded             |
| **WorkflowCompensation**  | Compensation action/plan linked to a failed Run                                                  | Platform ID (`wfc_*`)           |
| **WorkflowQueue**         | Logical queue for pending/accepted work                                                          | Queue key                       |

### 3.3 Trigger & schedule plane

| Entity               | Description                                                  | Identity               |
| -------------------- | ------------------------------------------------------------ | ---------------------- |
| **WorkflowTrigger**  | Rule that can start a Run (manual, event, API, schedule ref) | Platform ID (`wtrg_*`) |
| **WorkflowSchedule** | Time-based arming of a Trigger                               | Platform ID (`wsch_*`) |
| **WorkflowEvent**    | Platform-normalised event that may match a Trigger           | Event ID / envelope id |

### 3.4 Human-in-the-loop plane

| Entity           | Description                                      | Identity                |
| ---------------- | ------------------------------------------------ | ----------------------- |
| **WorkflowTask** | Base human work item attached to a Run/step      | Platform ID (`wtk_*`)   |
| **HumanTask**    | Synonym umbrella for human-assigned WorkflowTask | Same family             |
| **ManualTask**   | Operator completes a form/action to resume       | Subtype of WorkflowTask |
| **ApprovalTask** | Approve/reject decision task                     | Subtype of WorkflowTask |

### 3.5 Security & config plane

| Entity                      | Description                                                               | Identity                |
| --------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| **WorkflowCredential**      | Platform metadata describing a credential binding (name, scope, provider) | Platform ID (`wcred_*`) |
| **WorkflowSecretReference** | Opaque reference to a secret store entry — **never** the secret value     | Ref ID / URI            |
| **WorkflowNotification**    | Intent to notify (delivered by Notification Framework)                    | Notification intent ID  |

### 3.6 Operations plane

| Entity                 | Description                                              | Identity       |
| ---------------------- | -------------------------------------------------------- | -------------- |
| **WorkflowHealth**     | Aggregated health snapshot for platform/connector/engine | Component key  |
| **WorkflowCapability** | (see §3.1) discovery result for provider/platform        | Capability key |

---

## 4. Canonical naming rules

1. Prefer **WorkflowRun** over WorkflowExecution in new contracts.
2. Prefer **WorkflowTask** with `kind: manual | approval | human`.
3. **WorkflowSecretReference** is the only secret-bearing concept in platform SoR — values never persisted in Workflow tables.
4. Engine IDs stored only as `providerRef` opaque fields.
5. Product domain IDs (project, ticket, …) appear as **correlation refs**, not owned entities.

---

## 5. Ownership & responsibility

| Concern                     | Owner                                         |
| --------------------------- | --------------------------------------------- |
| Term definitions            | This Information Model                        |
| Catalogue / version rules   | Workflow Platform Services (Definition)       |
| Run / schedule / HITL rules | Workflow Platform Services (Runtime — target) |
| Notification delivery       | Notification Framework                        |
| Event transport             | Event Bus / Outbox                            |
| Engine execution mechanics  | Provider via adapter                          |
| AuthZ                       | Platform AuthZ + `workflow.*` keys            |

---

## 6. Relationship to existing APZWORKFLOW baseline

Frozen SoR today exposes workflows, versions, templates, categories, folders, validation — aligned with Definition plane. Execution / schedule / HITL entities are **target** for Owner-unlocked programmes and are defined here for contract readiness.

---

## Related

- [WORKFLOW-DOMAIN-MODEL.md](./WORKFLOW-DOMAIN-MODEL.md)
- [WORKFLOW-ENTITY-RELATIONSHIPS.md](./WORKFLOW-ENTITY-RELATIONSHIPS.md)
- [WORKFLOW-GLOSSARY.md](./WORKFLOW-GLOSSARY.md)
- [WORKFLOW-CONTRACT-PLANNING.md](./WORKFLOW-CONTRACT-PLANNING.md)
