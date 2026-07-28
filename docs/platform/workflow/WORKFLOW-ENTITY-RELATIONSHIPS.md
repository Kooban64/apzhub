# Workflow Entity Relationships

> **Programme:** APZHUB-PLATFORM-WORKFLOW-002  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## 1. Entity relationship diagram

```mermaid
erDiagram
  Workflow ||--o{ WorkflowVersion : has
  WorkflowVersion ||--|| WorkflowDefinition : contains
  WorkflowVersion ||--o{ WorkflowParameter : declares
  WorkflowTemplate ||--o| WorkflowDefinition : blueprints
  WorkflowTemplate ||--o{ Workflow : instantiates

  WorkflowVersion ||--o{ WorkflowTrigger : targeted_by
  WorkflowSchedule ||--|| WorkflowTrigger : arms
  WorkflowTrigger ||--o{ WorkflowEvent : matches
  WorkflowTrigger ||--o{ WorkflowRun : starts

  WorkflowInstance ||--o{ WorkflowRun : attempts
  WorkflowVersion ||--o{ WorkflowRun : executes
  WorkflowRun ||--o{ WorkflowExecutionStep : has
  WorkflowRun ||--o| WorkflowInput : with
  WorkflowRun ||--o| WorkflowOutput : produces
  WorkflowRun ||--o{ WorkflowArtifact : emits
  WorkflowRun ||--o{ WorkflowError : records
  WorkflowRun ||--o{ WorkflowRetry : retries
  WorkflowRun ||--o| WorkflowCompensation : compensates
  WorkflowRun ||--o{ WorkflowTask : waits_on
  WorkflowTask ||--o| ManualTask : as
  WorkflowTask ||--o| ApprovalTask : as

  Workflow ||--o{ WorkflowVariable : uses
  WorkflowCredential ||--|| WorkflowSecretReference : refs
  WorkflowRun }o--o| WorkflowCredential : may_use
  WorkflowRun ||--o{ WorkflowNotification : notifies
  WorkflowQueue ||--o{ WorkflowRun : queues

  Workflow }o--|| ProviderBinding : maps_to
  WorkflowRun }o--|| ProviderBinding : maps_to
  WorkflowCapability }o--|| ProviderBinding : discovered_from
```

---

## 2. Class diagram (definition + runtime)

```mermaid
classDiagram
  class Workflow {
    +id
    +name
    +status
    +providerRef
  }
  class WorkflowVersion {
    +id
    +version
    +status
  }
  class WorkflowDefinition {
    +steps
    +config
  }
  class WorkflowTemplate {
    +id
    +name
  }
  class WorkflowRun {
    +id
    +status
    +correlationId
  }
  class WorkflowExecutionStep {
    +id
    +name
    +status
  }
  class WorkflowTrigger {
    +id
    +kind
  }
  class WorkflowSchedule {
    +id
    +expression
    +timezone
  }
  class WorkflowTask {
    +id
    +kind
    +assignee
  }
  class ManualTask
  class ApprovalTask
  class WorkflowSecretReference {
    +ref
  }
  class WorkflowCredential {
    +id
    +name
  }

  Workflow "1" --> "*" WorkflowVersion
  WorkflowVersion "1" --> "1" WorkflowDefinition
  WorkflowTemplate ..> Workflow : instantiates
  WorkflowVersion --> "*" WorkflowRun
  WorkflowRun --> "*" WorkflowExecutionStep
  WorkflowTrigger --> "*" WorkflowRun
  WorkflowSchedule --> "1" WorkflowTrigger
  WorkflowTask <|-- ManualTask
  WorkflowTask <|-- ApprovalTask
  WorkflowRun --> "*" WorkflowTask
  WorkflowCredential --> "1" WorkflowSecretReference
```

---

## 3. Conceptual stack

```mermaid
flowchart TB
  subgraph presentation [Presentation]
    CAT[Catalogue]
    RUNS[Runs / History]
    SCH[Schedules]
    INBOX[Approvals / Tasks]
  end

  subgraph platform [Workflow Platform metadata]
    WF[Workflow / Version / Template]
    WR[WorkflowRun / Steps]
    TR[Trigger / Schedule / Event]
    TK[WorkflowTask]
    SEC[Credential / SecretReference]
  end

  subgraph adjacent [Adjacent - not owned]
    IAM[Identity]
    NTF[Notifications]
    EVT[Event Bus]
    PRD[Product domain IDs]
  end

  subgraph provider [Provider engine]
    ENG[n8n / Temporal / …]
  end

  CAT --> WF
  RUNS --> WR
  SCH --> TR
  INBOX --> TK
  WF --> WR
  TR --> WR
  WR --> TK
  WR --> SEC
  WR -. notify .-> NTF
  TR -. consume .-> EVT
  TK --> IAM
  WR -. correlation .-> PRD
  WF --> ENG
  WR --> ENG
```

---

## 4. Cardinality notes

| Relationship                                 | Cardinality                 |
| -------------------------------------------- | --------------------------- |
| Workflow → WorkflowVersion                   | 1:N                         |
| WorkflowVersion → WorkflowRun                | 1:N                         |
| WorkflowInstance → WorkflowRun               | 0..1:N (optional aggregate) |
| WorkflowRun → WorkflowExecutionStep          | 1:N                         |
| WorkflowRun → WorkflowTask                   | 1:N (0 while not waiting)   |
| WorkflowSchedule → WorkflowTrigger           | 1:1                         |
| WorkflowTrigger → WorkflowRun                | 1:N over time               |
| WorkflowCredential → WorkflowSecretReference | 1:1                         |

---

## Related

- [WORKFLOW-DOMAIN-MODEL.md](./WORKFLOW-DOMAIN-MODEL.md)
- [WORKFLOW-INFORMATION-MODEL.md](./WORKFLOW-INFORMATION-MODEL.md)
