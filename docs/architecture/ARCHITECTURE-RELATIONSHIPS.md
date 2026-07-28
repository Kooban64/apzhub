# APZHUB Architecture Relationships

> **Programme:** APZHUB-ARCHITECTURE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Companion:** [ENTERPRISE-ARCHITECTURE-CATALOGUE](./ENTERPRISE-ARCHITECTURE-CATALOGUE.md)

---

## 1. Platform → Products → Integrations

```mermaid
flowchart TB
  subgraph Platform
    RT[Runtime]
    WB[Workbench]
    SDK[Integration SDK 1.0.0]
    PS[Platform Services]
    HTTP[HTTP /api/v1]
    PIPE[Request Pipeline]
  end

  subgraph Products
    PRJ[APZ Projects 1.1.0]
    TIM[APZ Time 1.0.0]
    SUP[APZ Support 1.0.0]
    DOC[Documents SoR]
    WF[Workflow SoR]
    TCMS[APZ TCMS]
    LAW[Law Platform]
    AN[Analytics Concept]
  end

  subgraph Integrations
    PL[Plane 0.6.0]
    KI[Kimai 0.2.0]
    ZA[Zammad 0.6.0]
    MS[Meilisearch 0.1.0]
    N8[n8n 0.1.0]
    GHA[GitHub Actions 0.1.0]
  end

  WB --> PRJ & TIM & SUP & DOC & WF & TCMS & LAW
  PRJ & TIM & SUP --> HTTP --> PIPE --> PS --> SDK
  SDK --> PL & KI & ZA & MS & N8 & GHA
  PRJ -.-> PL
  TIM -.-> KI
  SUP -.-> ZA
  AN -.->|absent| META[Metabase]
```

---

## 2. Infrastructure relationships

```mermaid
flowchart LR
  DEV[Dev Workstation / CI]
  CADDY[Caddy 3080/3443]
  WEB[Next.js apps/web]
  PG[(PostgreSQL 54334)]
  RD[(Redis 6380)]
  DOCKER[Docker Compose]
  GHA[GitHub Actions CI]

  DEV --> GHA
  DOCKER --> PG & RD & CADDY
  CADDY --> WEB
  WEB --> PG & RD
```

Legacy apz-stack (ports 8080 / 54333 / 80–443) coexists — see ENVIRONMENT.md.

---

## 3. Observability & security relationships

```mermaid
flowchart TB
  SVC[Platform Services]
  CORR[Correlation IDs]
  OBS[Observe / Metrics SoR]
  HEALTH[Health / Diagnostics]
  AUTH[BetterAuth]
  AUTHZ[Platform AuthZ]
  SEC[platform-security]

  SVC --> CORR --> OBS
  SVC --> HEALTH
  HTTP[Gateway] --> AUTH --> AUTHZ --> SVC
  HTTP --> SEC

  GRAF[Grafana] -.->|absent adapter| OBS
  PROM[Prometheus] -.->|absent| OBS
  FAR[Faraday/MobSF/Greenbone] -.->|absent| SEC
```

---

## 4. Quality relationships

```mermaid
flowchart LR
  CODE[Code change]
  LINT[Lint]
  TSC[Typecheck]
  VIT[Vitest]
  BUILD[Build]
  PW[Playwright]
  CI[GitHub Actions]
  QA[QA-002 PRODUCTION READY]
  REL[Release Acceptance]

  CODE --> LINT --> TSC --> VIT --> BUILD --> CI
  CI --> PW
  CI --> QA
  QA --> REL
  TCMS[APZ TCMS] --- VIT
  GHA_A[GHA Adapter] --- TCMS
```

---

## 5. Async event plane (relationship sketch)

```mermaid
flowchart LR
  PS[Platform Services]
  OUT[Outbox 0.1.0]
  BUS[Event Bus 0.1.0]
  SEARCH[Search]
  ACT[Activity]
  AUD[Audit]
  ATT[Attention / Notify]

  PS --> OUT --> BUS --> SEARCH & ACT & AUD & ATT
```

Cross-product targets: [PORTFOLIO-INTEGRATION-STRATEGY](../products/PORTFOLIO-INTEGRATION-STRATEGY.md).

---

## Related

- [ARCHITECTURE-MATURITY-MATRIX.md](./ARCHITECTURE-MATURITY-MATRIX.md)
- [PLATFORM-CATALOGUE.md](./PLATFORM-CATALOGUE.md)
- [PRODUCT-CATALOGUE.md](./PRODUCT-CATALOGUE.md)
- [INTEGRATION-CATALOGUE.md](./INTEGRATION-CATALOGUE.md)
