# APZHUB Portfolio Interaction Diagram

> **Programme:** APZHUB-PORTFOLIO-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Status:** Complete — **Awaiting Owner Acceptance**  
> **Companion:** [PORTFOLIO-INTEGRATION-STRATEGY](./PORTFOLIO-INTEGRATION-STRATEGY.md)

---

## 1. Platform collaboration (target architecture)

```mermaid
flowchart TB
  subgraph Shell["Desktop Shell / Workbench"]
    UI_P[Projects UI]
    UI_T[Time UI]
    UI_S[Support UI]
    UI_D[Documents UI]
    UI_W[Workflow UI]
    UI_A[Analytics UI — future]
    NAV[Deep links / Command Palette]
  end

  subgraph Gateway["API Gateway + RequestPipeline"]
    AUTH[Auth]
    AUTHZ[Authz]
    VAL[Validation]
  end

  subgraph Services["Platform Services"]
    PS_P[ProjectService]
    PS_T[TimeTrackingService]
    PS_S[Support*Services]
    PS_D[DocumentService]
    PS_WF[WorkflowService]
    PS_ORCH[Future Cross-Product Orchestrator]
  end

  subgraph Async["Async plane"]
    OUT[(Outbox 0.1.0)]
    BUS[Event Bus 0.1.0]
    SEARCH[Search Publication / Orchestrator]
    ACT[Activity Timeline]
    ATT[Attention / Notifications — frozen SoR]
    AUD[Audit]
    JOBS[Workers / Jobs]
  end

  subgraph Adapters["Integration SDK 1.0.0 — Adapters"]
    PLANE[Plane 0.6.0]
    KIMAI[Kimai 0.2.0]
    ZAM[Zammad 0.6.0]
    N8N[n8n 0.1.0 metadata]
  end

  subgraph Engines["Backend Engines"]
    E_PL[Plane CE]
    E_KI[Kimai CE]
    E_ZA[Zammad CE]
    E_N8[n8n — execute not certified]
  end

  UI_P --> Gateway
  UI_T --> Gateway
  UI_S --> Gateway
  UI_D --> Gateway
  UI_W --> Gateway
  UI_A -.-> Gateway
  NAV --> UI_P
  NAV --> UI_T
  NAV --> UI_S

  Gateway --> AUTH --> AUTHZ --> VAL --> Services

  PS_P --> PLANE --> E_PL
  PS_T --> KIMAI --> E_KI
  PS_S --> ZAM --> E_ZA
  PS_WF --> N8N -.-> E_N8

  Services --> OUT --> BUS
  BUS --> SEARCH
  BUS --> ACT
  BUS --> ATT
  BUS --> AUD
  BUS --> JOBS
  BUS -.-> PS_ORCH
```

**Legend:** solid = certified / operational path · dashed = future or limited.

---

## 2. Cross-product interaction map (logical)

```mermaid
flowchart LR
  SUP[APZ Support]
  PRJ[APZ Projects]
  TIM[APZ Time]
  DOC[APZ Documents]
  AN[APZ Analytics]
  WF[APZ Workflow]
  SEARCH[(Unified Search)]
  ACT[(Activity)]
  AUD[(Audit)]

  SUP -->|XI-01 ticket→task| PRJ
  PRJ -->|XI-02 task→time| TIM
  TIM -->|XI-03 entry→analytics| AN
  SUP -->|XI-04 SLA→analytics| AN
  PRJ -->|XI-05 complete→docs| DOC
  WF -.->|XI-06 orchestrate| SUP
  WF -.->|XI-06| PRJ
  WF -.->|XI-06| TIM

  SUP --> SEARCH
  PRJ --> SEARCH
  DOC --> SEARCH
  TIM -.-> SEARCH

  SUP -.-> ACT
  PRJ --> ACT
  TIM -.-> ACT

  SUP --> AUD
  PRJ --> AUD
  TIM --> AUD
  DOC --> AUD
```

---

## 3. Event-mediated sequence (example: Support → Projects)

```mermaid
sequenceDiagram
  participant Agent as Support Workbench
  participant GW as Gateway / Pipeline
  participant SS as Support Service
  participant BUS as Event Bus / Outbox
  participant OR as Orchestrator Service
  participant PS as Project Service
  participant ACT as Activity / Audit

  Agent->>GW: POST link ticket→project
  GW->>SS: support.linkRequest
  SS->>SS: Validate + persist link metadata
  SS-->>GW: 200 fast response
  SS->>BUS: support.request.linked
  BUS->>OR: consume linked
  OR->>PS: createOrLinkTask (authz re-check)
  PS->>BUS: projects.task.created / linked
  BUS->>ACT: activity + audit
```

> **Today:** Support Event Bus publish is a **KNOWN-LIMITATION** — sequence is **target design**, not production behaviour.

---

## 4. Boundary checklist (diagram reading guide)

| Allowed                               | Not allowed                           |
| ------------------------------------- | ------------------------------------- |
| UI → `/api/v1` only                   | UI → adapter / engine                 |
| Service → Event Bus                   | Module → Module API                   |
| Orchestrator Platform Service         | n8n calling product UIs               |
| Search / Activity / Audit subscribers | Product-local notification subsystems |
| Deep links between workspaces         | Engine deep links in UI               |

---

## 5. Related

- [PORTFOLIO-INTEGRATION-STRATEGY.md](./PORTFOLIO-INTEGRATION-STRATEGY.md)
- [PLATFORM-EVENT-CATALOGUE.md](./PLATFORM-EVENT-CATALOGUE.md)
- [AUTOMATION-ROADMAP.md](./AUTOMATION-ROADMAP.md)
- [APZHUB-Cross-Product-Search-Integration-Architecture.md](../architecture/APZHUB-Cross-Product-Search-Integration-Architecture.md)
