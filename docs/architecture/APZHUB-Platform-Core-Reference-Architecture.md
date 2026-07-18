# APZHUB Platform Core — Reference Architecture

> **Status:** **Canonical** — definitive Platform Core architecture (PC-001)  
> **Supersedes:** [APZHUB Platform Reference Architecture](./APZHUB-Platform-Reference-Architecture.md) for Platform Core scope  
> **Authority:** [003 — Overall System Architecture](../003-overall-system-architecture-design-principles.md) · [Engineering Constitution](../000-apzhub-engineering-constitution.md)

---

## 1. Purpose

This document is the **canonical architecture** for the APZHUB Platform Core — the permanent foundation that all products consume. It consolidates Milestones 1–7 (capability frameworks) and Milestone 8 (identity, administration, governance, security) into a single reference.

Products (Law Platform, future Banking, Exchange, etc.) sit **above** Platform Core. They never duplicate Platform Core capabilities.

---

## 2. Platform Core composition

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRODUCT LAYER                                    │
│   Law Platform · Trust Accounting · Future products                    │
│   (business logic in Platform Services — never in shell/modules)         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PLATFORM CORE (Phase 1 — CERTIFIED)                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Presentation: Workbench Framework · Design System (@apzhub/ui)          │
│  Capabilities: Actions · Knowledge/Search · Events · Notifications · AT  │
│  Administration: Operations · Personalisation · Governance · Security    │
│  IAM: Identity · Authorization                                           │
│  Infrastructure: Runtime · Persistence · API Framework · Auth            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE (self-hosted OSS first)                │
│   PostgreSQL · Redis · Caddy/Nginx · S3-compatible storage               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Layer diagram

```mermaid
flowchart TB
  subgraph Product["Product Layer"]
    LP[Law Platform]
    TA[Trust Accounting]
    FP[Future Products]
  end

  subgraph Core["Platform Core"]
    WB[Workbench Framework]
    AF[Action Framework]
    KDF[Knowledge & Discovery]
    ENF[Event & Notification]
    ATF[Activity & Timeline]
    OPS[Operations Console]
    PER[Personalisation]
    GOV[Governance & Provisioning]
    SEC[Security & Resilience]
    ID[Identity]
    AUTHZ[Authorization]
    RT[Platform Runtime]
    API[API Framework]
  end

  subgraph Data["Persistence & Auth"]
    PG[(PostgreSQL)]
    RD[(Redis)]
    BA[BetterAuth]
  end

  LP --> WB
  LP --> API
  TA --> API
  FP --> WB

  WB --> AUTHZ
  WB --> RT
  AF --> ENF
  KDF --> AF
  OPS --> SEC
  API --> ID
  API --> AUTHZ
  API --> SEC

  ID --> PG
  AUTHZ --> PG
  PER --> PG
  GOV --> PG
  SEC --> RD
  BA --> PG
```

---

## 4. Package dependency diagram

```mermaid
flowchart LR
  subgraph Apps
    WEB[apps/web]
    LAW[apps/law-platform]
  end

  subgraph PlatformCore
    PR[platform-runtime]
    WB[workbench-framework]
    CF[command-framework]
    KDF[knowledge-discovery-framework]
    ENF[event-notification-framework]
    ATF[activity-timeline-framework]
    PI[platform-identity]
    PA[platform-authorization]
    PP[platform-personalisation]
    PG[platform-governance]
    PS[platform-security]
  end

  subgraph Foundation
    AUTH[auth]
    CFG[config]
    UI[ui]
    TYPES[types]
    SHARED[shared]
  end

  WEB --> WB
  WEB --> PS
  WEB --> PG
  LAW --> WB
  LAW --> PS

  WB --> PR
  WB --> PA
  CF --> ENF
  PS --> PA
  PS --> CFG
  PI --> CFG
  PA --> CFG
  PP --> CFG
  PG --> CFG

  AUTH --> PI
  AUTH --> CFG
```

**Rule:** Products and modules never depend on connectors or backend engines directly. Platform packages never depend on product packages.

---

## 5. Request flow

Standard authenticated API request (Document 010):

```mermaid
sequenceDiagram
  participant Client
  participant Edge as Caddy/Next.js
  participant Auth as BetterAuth
  participant Guard as Platform API Guard
  participant Svc as Platform Service
  participant DB as PostgreSQL

  Client->>Edge: HTTPS request + session cookie
  Edge->>Auth: getValidatedSession()
  Auth-->>Edge: user + tenantId
  Edge->>Guard: requirePlatformPermission()
  Guard->>Guard: resolveSessionAuthorization()
  alt Unauthorized
    Guard-->>Client: 401/403 JSON envelope
  else Authorized
    Guard->>Svc: business operation
    Svc->>DB: validated query (RLS context)
    DB-->>Svc: result
    Svc-->>Client: { data } envelope
  end
```

**Path:** Client → Gateway → Auth → Authz → Validation → Platform Service → Connector → Engine (products only at Service layer).

---

## 6. Startup flow

```mermaid
sequenceDiagram
  participant App as Next.js App
  participant RT as Platform Runtime
  participant WB as Workbench Bootstrap
  participant AF as Action Bootstrap
  participant KDF as Knowledge Bootstrap
  participant ENF as Event Bootstrap
  participant ATF as Activity Bootstrap

  App->>RT: ensurePlatformRuntimeReady()
  RT->>RT: discover manifests
  RT->>RT: build capability registry
  RT->>RT: lifecycle + health summary
  RT-->>App: bootstrap success + diagnostics

  App->>AF: bootstrapActionRegistry()
  App->>KDF: bootstrapKnowledgeRegistry()
  App->>ENF: bootstrapEventRegistry()
  App->>ATF: bootstrapActivityRegistry()
  App->>WB: bootstrapWorkbenchRegistry()

  Note over App: Client hydrates registries via providers
```

Bootstrap runs once per process. Health endpoint exposes runtime readiness.

---

## 7. Authentication flow

```mermaid
sequenceDiagram
  participant User
  participant BA as BetterAuth
  participant Auth as @apzhub/auth
  participant PI as platform-identity
  participant Session as Session Store

  User->>BA: login (email/password)
  BA->>Session: create session
  BA-->>User: session cookie

  User->>Auth: subsequent request
  Auth->>Session: validate session
  Auth->>PI: resolve tenant for user
  PI-->>Auth: tenantId + source
  Auth-->>User: enriched session (user, tenantId)
```

BetterAuth handles authentication only. APZHUB owns tenant membership and enrichment.

---

## 8. Authorization flow

```mermaid
sequenceDiagram
  participant WB as Workbench / API
  participant Bridge as resolveSessionAuthorization
  participant PA as platform-authorization
  participant EPS as EffectivePermissionService

  WB->>Bridge: userId, tenantId, productKey
  Bridge->>PA: get assignments + roles
  PA->>EPS: compute effective permissions
  EPS-->>Bridge: permission set
  Bridge-->>WB: filtered capabilities / 403

  Note over WB: Registry DTOs filtered server-side before client hydration
```

Permission keys are manifest-driven. Backend role names never reach UI.

---

## 9. Tenant flow

```mermaid
flowchart TD
  A[User first login] --> B[provisionPlatformTenantForUser]
  B --> C[platform_user_tenant membership]
  C --> D[user.active_tenant_id set]
  D --> E[Session enriched with tenantId]
  E --> F[API / RLS context]
  F --> G[Product queries scoped by tenant]

  H[Admin switches tenant] --> I[Future: tenant switch API]
  I --> E
```

Tenant is platform metadata (Document 011). Business data tenant scoping is product responsibility with RLS.

---

## 10. Event flow

```mermaid
flowchart LR
  A[Platform Service / Action Executor] --> B[Event Bus]
  B --> C[Notification Mapper]
  B --> D[Activity Mapper]
  B --> E[Audit trail]
  C --> F[Notification Service]
  F --> G[Badge / Panel UI]
  D --> H[Activity Timeline Service]
  H --> I[Context Panel / Feed]

  J[Outbox table] -.->|PCv2 workers| B
```

Events are in-process in Phase 1. Outbox workers deferred to PCv2.

---

## 11. Knowledge and search flow

```mermaid
flowchart LR
  M[Manifests] --> KR[Knowledge Registry]
  KR --> KS[Knowledge Service]
  U[User query] --> KS
  KS --> P1[Action Provider]
  KS --> P2[Navigation Provider]
  KS --> P3[Product Providers]
  P1 & P2 & P3 --> R[Ranking]
  R --> O[Knowledge Overlay / Palette mode]
```

Unified search (Document 020) is implemented via Knowledge & Discovery Framework. Persistent search index deferred.

---

## 12. Timeline flow

```mermaid
flowchart LR
  AE[Action audit event] --> AM[Activity Mapper]
  AM --> AR[Activity Registry]
  AR --> ATS[Activity Timeline Service]
  ATS --> CP[Context Panel tab]
  ATS --> IF[Inline feed]
```

Timelines aggregate activity types registered in manifests.

---

## 13. Diagnostics flow

```mermaid
flowchart TB
  subgraph Sources
    RTD[Runtime diagnostics]
    IDD[Identity diagnostics]
    AZD[Authorization diagnostics]
    PD[Personalisation diagnostics]
    GD[Governance diagnostics]
    PSD[Security diagnostics]
    PDB[Persistence health]
  end

  subgraph Aggregation
    OD[operational-diagnostics.ts]
    CDS[ConsolidatedOperationalDiagnostics]
  end

  subgraph Surfaces
    OPS[Operations Console]
    API1[/security/diagnostics]
    API2[/operations/summary]
    API3[/system/health]
  end

  RTD & IDD & AZD & PD & GD & PSD & PDB --> OD
  OD --> CDS
  CDS --> OPS
  CDS --> API1
  CDS --> API2
  PSD --> API3
```

---

## 14. Operations flow

```mermaid
flowchart LR
  Admin[Administrator] --> WB[Operations Workbench]
  WB --> Router[OperationsWorkspaceRouter]
  Router --> S1[Dashboard / Health / Security]
  Router --> S2[Identity / Authz / Governance]
  Router --> S3[Diagnostics / Resilience]
  S1 & S2 & S3 --> API[/api/platform/v1/*]
  API --> Services[Platform Core Services]
  Services --> PG[(PostgreSQL)]
```

Operations Console is manifest-driven (19 sections). Permission: `platform.nav.administration.view`.

---

## 15. Data ownership (Document 011)

| Owner             | Data                                                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Platform Core** | Identity, sessions, permissions, nav, workspaces, prefs, notifications (metadata), audit, module registration, search index (derived), events, jobs, connector config refs |
| **Products**      | Matters, clients, invoices, trust journals, documents, tickets — authoritative in product/adapter stores                                                                   |

---

## 16. Extension rules

1. **Manifest first** — `module.yaml`, `service.yaml`, `integration.yaml`, `event.yaml` before code.
2. **No layer bypass** — Module → Platform Service → Connector → Engine.
3. **No duplicate cross-cutting** — identity, authz, audit, notify, search are platform-owned.
4. **Registry pattern** — bootstrap → DTO → client hydration for every capability framework.
5. **Permission-driven UI** — server is authoritative; client filters are presentation only.

---

## 17. Phase boundaries

| Phase                    | Status                                        |
| ------------------------ | --------------------------------------------- |
| Platform Core v1 (M1–M8) | **Certified** (PC-001)                        |
| Platform Core v2         | Planned — SaaS hardening, workers, gateway    |
| Product milestones       | Law Platform validation; FIN/Banking deferred |

---

## References

- [Platform Core Capability Reference](./APZHUB-Platform-Core-Capability-Reference.md)
- [Platform Capability Matrix](./APZHUB-Platform-Capability-Matrix.md)
- [Platform Core Certification](../reviews/APZHUB-Platform-Core-Certification.md)
- Foundation documents 003, 007–015, 019–024
