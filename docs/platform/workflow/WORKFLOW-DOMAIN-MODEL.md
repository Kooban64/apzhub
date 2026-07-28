# Workflow Domain Model

> **Programme:** APZHUB-PLATFORM-WORKFLOW-002  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Information model:** [WORKFLOW-INFORMATION-MODEL.md](./WORKFLOW-INFORMATION-MODEL.md)

---

## 1. Domain purpose

Enable governed definition, triggering, execution observation, human-in-the-loop, and operational control of workflows inside APZHUB — with platform-owned metadata/permissions and provider-owned engine mechanics.

---

## 2. Aggregate roots (target persistence)

| Aggregate           | Root                   | Children / value objects                                     |
| ------------------- | ---------------------- | ------------------------------------------------------------ |
| Workflow Catalogue  | `Workflow`             | versions, tags, folder refs, status                          |
| Workflow Version    | `WorkflowVersion`      | `WorkflowDefinition`, parameters, variable bindings          |
| Template            | `WorkflowTemplate`     | definition snapshot, parameters                              |
| Run                 | `WorkflowRun`          | steps, input/output, errors, retries, artifacts, providerRef |
| Instance (optional) | `WorkflowInstance`     | runs[]                                                       |
| Schedule            | `WorkflowSchedule`     | cron/calendar expr, timezone, trigger ref                    |
| Trigger             | `WorkflowTrigger`      | match rules, workflowVersion ref                             |
| Task                | `WorkflowTask`         | kind, assignees, form/approval payload, due                  |
| Credential Binding  | `WorkflowCredential`   | `WorkflowSecretReference`, scopes                            |
| Compensation        | `WorkflowCompensation` | plan steps, status                                           |

---

## 3. Lifecycles & state transitions

### 3.1 Workflow (definition)

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Published: publish
  Published --> Archived: archive
  Archived --> Published: restore
  Draft --> Archived: archive
  Published --> Draft: create_new_version
```

### 3.2 WorkflowRun (execution)

```mermaid
stateDiagram-v2
  [*] --> Queued
  Queued --> Running: accepted
  Running --> Succeeded: complete
  Running --> Failed: error
  Running --> WaitingHuman: hitl
  WaitingHuman --> Running: resume
  Failed --> Queued: retry
  Failed --> Compensating: compensate
  Compensating --> Compensated
  Compensating --> Failed
  Running --> Cancelled: cancel
  Queued --> Cancelled: cancel
```

### 3.3 WorkflowSchedule

```mermaid
stateDiagram-v2
  [*] --> Defined
  Defined --> Armed: arm
  Armed --> Fired: tick
  Fired --> Armed: rearm
  Armed --> Paused: pause
  Paused --> Armed: resume
  Armed --> Retired: retire
  Paused --> Retired: retire
  Defined --> Retired: retire
```

### 3.4 ApprovalTask / ManualTask

```mermaid
stateDiagram-v2
  [*] --> Open
  Open --> Claimed: claim
  Claimed --> Open: release
  Claimed --> Completed: complete_or_approve
  Claimed --> Rejected: reject
  Open --> Cancelled: cancel_run
  Claimed --> Cancelled: cancel_run
  Open --> Expired: sla
```

### 3.5 WorkflowRetry

```mermaid
stateDiagram-v2
  [*] --> Eligible
  Eligible --> Scheduled: backoff
  Scheduled --> Attempted: fire
  Attempted --> Eligible: failed_retryable
  Attempted --> Exhausted: max_attempts
  Attempted --> Succeeded: ok
```

---

## 4. Trigger model

| Trigger kind | Starts Run when                                           |
| ------------ | --------------------------------------------------------- |
| `manual`     | Authenticated principal invokes start                     |
| `api`        | Product Platform Service invokes start (service identity) |
| `event`      | Normalised `WorkflowEvent` matches trigger rules          |
| `schedule`   | `WorkflowSchedule` fires                                  |

Triggers never bypass AuthZ. Product services supply correlation refs (projectId, ticketId, …) as WorkflowInput metadata.

---

## 5. Event model

```text
Product/Platform domain event
  → Event Bus envelope (correlation/causation)
  → Workflow Platform normalises to WorkflowEvent
  → Trigger matcher
  → WorkflowRun (Queued)
```

Modules do not subscribe to engines. Workflow Platform publishes run/task events for Notification Framework consumption.

---

## 6. Provider boundaries

| Concern                       | Platform         | Provider (via adapter)      |
| ----------------------------- | ---------------- | --------------------------- |
| Catalogue IDs, AuthZ, audit   | Yes              | No                          |
| Definition storage (metadata) | Yes              | May sync engine copy        |
| Step execution                | Policy + observe | Executes                    |
| Secret values                 | Refs only        | Engine vault / secret store |
| Branding                      | Masked           | Hidden from standard UI     |

---

## 7. Ownership

| Object                               | Created by                | Owned by                             |
| ------------------------------------ | ------------------------- | ------------------------------------ |
| Workflow / Version / Template        | Workflow admin            | Platform (org/tenant scope)          |
| WorkflowRun                          | Trigger / API / schedule  | Platform                             |
| WorkflowTask                         | Runtime when HITL entered | Platform · assigned principal        |
| WorkflowSchedule / Trigger           | Workflow admin            | Platform                             |
| WorkflowCredential + SecretReference | Admin                     | Platform metadata · secret store     |
| Engine workflow/run                  | Adapter sync/execute      | Engine — mapped, not user-facing SoR |

---

## 8. Sequence — start run (target)

```mermaid
sequenceDiagram
  participant UI as Workbench
  participant GW as API Gateway
  participant WPS as Workflow Platform Services
  participant AD as Integration Adapter
  participant ENG as Engine

  UI->>GW: POST runs (AuthZ)
  GW->>WPS: startRun(validated)
  WPS->>WPS: persist WorkflowRun Queued
  WPS-->>UI: 202 Accepted + runId
  WPS->>AD: execute(providerRef, input)
  AD->>ENG: start
  ENG-->>AD: engineRunRef
  AD-->>WPS: accepted
  WPS->>WPS: Running + providerRef
```

---

## Related

- [WORKFLOW-ENTITY-RELATIONSHIPS.md](./WORKFLOW-ENTITY-RELATIONSHIPS.md)
- [EXECUTION-MODEL.md](./EXECUTION-MODEL.md)
- [WORKFLOW-LIFECYCLE.md](./WORKFLOW-LIFECYCLE.md)
