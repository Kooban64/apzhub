# APZQEP-OES-ARCH-015 — APPENDIX D — Context & Layer Diagrams

## Context diagram

```mermaid
flowchart LR
  subgraph frozen [Frozen_1_0_0]
    Req[Requirements]
    Trace[Traceability]
    Ver[Verification]
    Spec[TestSpecifications]
    Plan[TestPlans]
  end

  TE[TestExecution]

  Id[Identity_AuthZ]
  Audit[Audit]
  Bus[EventBus]
  Search[Search]
  Ev[(Future_Evidence)]
  Def[(Future_Defects)]
  Runs[(Future_TestRuns)]
  AI[(Future_AI)]
  Ext[External_Automation_Agents]
  WB[Workbench]

  Plan --> TE
  Spec --> TE
  TE --> Trace
  TE --> Ver
  Req --> Trace
  TE --> Audit
  TE --> Bus
  TE --> Search
  TE --> Ev
  TE --> Def
  Runs -.-> TE
  AI -.-> TE
  Ext --> TE
  Id --> TE
  WB --> TE
```

## Layer / container diagram

```mermaid
flowchart TB
  WB[Workbench_Presentation]
  API[Platform_API_Boundary]
  App[Application_Orchestration]
  Dom[Domain_TestExecution]
  Infra[Infrastructure_Persistence_Outbox_SearchPub]
  Ext[External_Ingestion_Boundary]
  Frozen[Frozen_Capability_Contracts]

  WB --> API --> App --> Dom
  App --> Infra
  App --> Frozen
  Ext --> API
  Infra --> Bus[(Event_Bus)]
  Infra --> DB[(Platform_PostgreSQL)]
```

## Aggregate relationship (textual)

```text
TestExecution
  ├── ExecutionManifest (1, sealed)
  ├── ExecutionContext (1)
  ├── ExecutionAssignment (1)
  ├── ExecutionStep (1..n)
  │     └── EvidenceReference (0..n)
  ├── ExecutionObservation (0..n)
  ├── EvidenceReference (0..n at execution level)
  ├── ExecutionReview (0..1)
  └── ExternalExecutionSubmission (0..n)
```
