# Product Requirements Document — APZHUB

| Field                    | Value                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product**              | APZHUB                                                                                                                                                    |
| **Expanded name**        | APZ Enterprise Operating Platform                                                                                                                         |
| **Product ID**           | `apzhub`                                                                                                                                                  |
| **Category**             | Enterprise Operating Platform (internal / L0)                                                                                                             |
| **Document type**        | Complete Platform PRD                                                                                                                                     |
| **Working terminology**  | Platform · Workspace · Workbench · Environment — never “portal” or “launcher”                                                                             |
| **Constitution**         | [Document 000](./000-apzhub-engineering-constitution.md) — supreme engineering authority                                                                  |
| **Vision**               | [Document 001](./001-project-vision-and-guiding-principles.md)                                                                                            |
| **Commercial authority** | [APZOR Commercial Pillars](./strategy/APZOR-COMMERCIAL-PILLARS.md) · [SaaS Commercial Model](./strategy/commercial/SAAS-COMMERCIAL-MODEL.md) (**LOCKED**) |
| **Price Book**           | [APZ Commercial Price Book v1.0](./strategy/commercial/APZ-COMMERCIAL-PRICE-BOOK-V1.md)                                                                   |
| **Status**               | Derived platform contract for stakeholders, product, and engineering alignment                                                                            |

> **Critical commercial rule:** Customers buy **solutions** (APZQEP · APZPEN · APZPRD · optional Law / Sign / …). **APZHUB is never sold as a customer SKU.** Engines are never sold. Users never see engines.  
> This PRD defines what APZHUB **must be** as the operating platform that powers those solutions.

> **Authority on conflict:** Constitution (000) → Commercial Pillars / SaaS Model (commercial) → Foundation docs 001–029 → Pillar visions → Product-definition packs → this PRD.

---

## 1. Executive summary

APZHUB is APZOR’s **Enterprise Operating Platform**: one identity, one workbench, one entitlement and permission model, one API surface, and one set of shared platform services — behind which best-of-breed open-source (and selected professional) engines run as masked backends.

It exists so that:

1. **Buyers** purchase Quality, Security, and Productivity solutions without buying or understanding “a portal.”
2. **Users** experience one professional desktop-style application assembled from what they are entitled and permitted to use.
3. **Operators** run one platform (tenants, catalogue, billing, audit, health, jobs) instead of a stack of unrelated products.
4. **Engineering** ships modules and pillars on shared SDKs without layer bypass or engine leakage.

**Central platform outcome**

> Can every authorised person do their work in one governed workbench — with the right products, permissions, evidence, and audit — without seeing the engines underneath?

---

## 2. Problem statement

Organisations assemble work from many specialist tools (project trackers, helpdesks, time systems, scanners, test runners, analytics, automation). Each has its own login, navigation, permission model, audit story, and branding. The result:

| Pain                 | Consequence                                                                   |
| -------------------- | ----------------------------------------------------------------------------- |
| Tool sprawl          | Context switching, training cost, inconsistent governance                     |
| Portal anti-pattern  | Bookmark bars and SSO to raw engine UIs — no unified product                  |
| Fragmented identity  | Permissions diverge; least privilege fails                                    |
| Weak evidence        | Release / security / work decisions lack a single SoR trail                   |
| Opaque ops           | No single health, job, audit, or entitlement control plane                    |
| Unsellable packaging | Buyers cannot buy “confidence,” “assurance,” or “workspace” — only tool seats |

APZHUB solves the **platform** problem so commercial pillars can solve the **discipline** problems.

---

## 3. Vision and mission

### Vision

APZHUB is a modern enterprise operating platform that presents one seamless desktop-style workbench for professional work — projects, documents, time, support, workflows, analytics, quality engineering, security assurance, knowledge, compliance, and operations — **without exposing backend engines**.

Five-year direction ([Platform Core Strategy](./strategy/APZHUB-Platform-Core-Strategy.md)): self-hosted first; OSS engines as replaceable backends; APZHUB-owned experience and governance; phased commercial SaaS; optional governed AI.

### Mission

Deliver a **manifest-driven, permission-gated, self-hosted-first** platform that:

1. Unifies work behind a single Workbench experience.
2. Integrates best-of-breed engines without exposing them to users.
3. Owns identity, authorization, audit, security, entitlements, and operational visibility.
4. Enables commercial pillars and vertical products to ship by consuming Platform Core — never duplicating it.
5. Preserves architectural discipline through SDKs, ADRs, and phase gates.

### Positioning (normative)

| APZHUB is                                     | APZHUB is not                                      |
| --------------------------------------------- | -------------------------------------------------- |
| Enterprise Operating Platform                 | A portal, launcher, or intranet                    |
| Single workbench + shared services            | A collection of OSS UIs behind SSO                 |
| Experience + governance + orchestration layer | A thin reverse proxy                               |
| System of Record for platform metadata        | SoR for every engine’s business data               |
| Internal L0 that powers sellable L1 offerings | A line item named “APZHUB” on the customer invoice |

---

## 4. Commercial layer model (locked)

```text
L0  APZHUB          — APZOR only (platform)
L1  Commercial offering — Buyer / invoice (pillars, packages, seats)
L2  Product module  — End user (Projects, Time, QEP, PEN, …)
L3  Capability + role — End user actions (permissions)
      ↓
    Platform Services + Adapters + Engines (masked)
```

| Rule                            | Statement                                         |
| ------------------------------- | ------------------------------------------------- |
| Charge at L1                    | Offerings / seats / packages                      |
| Enforce at L2 + L3              | Entitlement then permission — both must pass      |
| Never charge for L0 as “APZHUB” | Platform included with any paid product at launch |
| Never expose engines            | Not in UX, invoices, or marketing as the product  |

**Tenant shapes:** Organisation and Individual share the same tenancy machinery; difference is plan kind and billing account kind.

Detail: [SAAS-COMMERCIAL-MODEL](./strategy/commercial/SAAS-COMMERCIAL-MODEL.md).

---

## 5. Goals and non-goals

### Platform goals

| ID   | Goal                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ |
| G-1  | One authenticated shell for all entitled products (Header, Activity Bar, Sidebar, Workspace, Context, Status, Command Palette) |
| G-2  | BetterAuth authentication only; APZHUB owns permissions, roles, provisioning, audit                                            |
| G-3  | Single SSO experience; silent session handoff; no user-visible engine logins                                                   |
| G-4  | Entitlement stack: subscription → module entitlements → user grants → product roles → resource scopes → effective access       |
| G-5  | Module → Platform Service → Connector → Engine — no bypass                                                                     |
| G-6  | One client API via API Gateway; standard request context and response envelope                                                 |
| G-7  | Centralised search, notifications, activity, audit, events, jobs — modules publish events; platform delivers                   |
| G-8  | Design System (tokens, shared UI) before one-off product chrome                                                                |
| G-9  | Self-hosted OSS CE first; no mandatory Enterprise Edition engine dependencies                                                  |
| G-10 | Zero Trust on every request; secrets never in code/logs/repos                                                                  |
| G-11 | Mask engines from standard users; Professional Tool Access exceptional and audited                                             |
| G-12 | Commercial catalogue, quote, payment, provisioning, and invite path for sellable offerings                                     |
| G-13 | Platform Admin vs Tenant Admin separation; APZOR is an **ordinary tenant**, not a super-tenant                                 |
| G-14 | Observability: metrics, logs, traces, health — Administration / ops consoles for operators                                     |

### Non-goals

| ID    | Non-goal                                                                              |
| ----- | ------------------------------------------------------------------------------------- |
| NG-1  | Selling or marketing “APZHUB” as the customer product                                 |
| NG-2  | Exposing Plane, Zammad, Kimai, Metabase, n8n, Greenbone, etc. as the product identity |
| NG-3  | Three separate platforms or codebases for QEP / PEN / PRD                             |
| NG-4  | Forcing customers to buy unused pillars                                               |
| NG-5  | Frontend calling engines directly                                                     |
| NG-6  | Business logic in the gateway, shell, or UI components                                |
| NG-7  | Duplicating engine business data as authoritative platform SoR                        |
| NG-8  | AI as System of Record or auto-certification authority                                |
| NG-9  | Org subscription auto-granting all users product access                               |
| NG-10 | Collapsing five access layers into Admin / Manager / User                             |

---

## 6. Users and personas

### 6.1 Platform control-plane personas (APZOR / MSP)

| Persona                        | Intent                                           |
| ------------------------------ | ------------------------------------------------ |
| Platform Owner                 | Ultimate platform authority; audited             |
| Platform Administrator         | Tenants, products, subscriptions, provisioning   |
| Platform Operations            | Health, workers, queues, capacity                |
| Platform Support               | Controlled privileged sessions for customer help |
| Platform Security / Compliance | Policy, audit, POPIA/compliance gates            |
| Platform Finance / Billing     | Catalogue, quotes, reconciliation                |
| Platform Auditor               | Read-only control-plane audit                    |

**Rule:** Employment by APZOR implies **zero** platform privilege. Platform roles are explicit grants. Platform Support does not get unrestricted tenant business-data access by default.

### 6.2 Tenant personas (every customer org, including APZOR-as-tenant)

| Persona                     | Intent                                                 |
| --------------------------- | ------------------------------------------------------ |
| Organisation Owner / Admin  | Subscription, users, roles, billing contact            |
| Product Administrator       | Module-level admin within entitled products            |
| Standard User               | Entitled, permission-filtered workbench                |
| Auditor (tenant)            | Compliance / audit export within tenant scope          |
| Collaborator / limited seat | Constrained product access (e.g. QEP/PEN Collaborator) |

### 6.3 Commercial buyer personas

| Persona                              | Buys                                 |
| ------------------------------------ | ------------------------------------ |
| Quality / Release leadership         | APZQEP                               |
| Security / CISO / pentest buyers     | APZPEN                               |
| Ops / delivery / services leadership | APZPRD modules or Complete           |
| Regulated / multi-discipline         | Combinations of pillars + Enterprise |

Pillar-specific personas (21+ for QEP, PEN engagement roles, PRD product roles) live in pillar PRDs / definition packs — this PRD owns **platform** personas only.

---

## 7. Product architecture the PRD requires

### 7.1 Logical stack

```text
Presentation (Workbench / Modules)
        ↓
Application / Gateway (authn, authz, validation, envelope)
        ↓
Platform Services (business rules, orchestration, audit, events)
        ↓
Service Connectors / Adapters (Integration SDK)
        ↓
Backend Engines (OSS / professional tools — masked)
```

### 7.2 Request path (normative)

```text
Client → API Gateway → Auth → Authz → Validation
  → Platform Service → Connector → Engine → standard response envelope
```

### 7.3 Extension contracts (manifest first)

| Extension               | Manifest           | SDK                        |
| ----------------------- | ------------------ | -------------------------- |
| Module                  | `module.yaml`      | Module SDK (025)           |
| Integration / Connector | `integration.yaml` | Integration SDK (026)      |
| Platform Service        | `service.yaml`     | Platform Service SDK (027) |
| UI Component            | `component.yaml`   | UI Component SDK (028)     |
| Event                   | `event.yaml`       | Platform Event SDK (029)   |

No hardcoding modules into the shell. No module→connector calls. No business logic in shared UI components.

### 7.4 System of Record (platform data)

**APZHUB owns (platform PostgreSQL):** identity, sessions, permissions, navigation registration, workspaces/prefs metadata, notifications, audit, activity, module/connector registration, search index (derived), events, jobs, telemetry, connector config references (not plain secrets), commercial catalogue / entitlements / billing metadata.

**Engines own:** projects, tickets, timesheets, documents content where engine-backed, scanner findings raw stores, etc. — unless a product declares native SoR.

**Never** duplicate engine business data as authoritative platform SoR (cache/search/report/temp only).

---

## 8. Functional requirements — Platform Core

### 8.1 Identity and session

| ID        | Requirement                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| FR-IAM-01 | BetterAuth is the sole authentication mechanism for the platform                                                          |
| FR-IAM-02 | Single login; no user-visible engine login screens                                                                        |
| FR-IAM-03 | Silent session handoff to entitled products within the workbench                                                          |
| FR-IAM-04 | Per-engine SSO/config owned by APZHUB adapters (SAML/OIDC/forward-auth/tokens/outposts as needed) — documented per engine |
| FR-IAM-05 | Session security: secure cookies, CSRF protections, correlation IDs                                                       |
| FR-IAM-06 | Authentik (legacy) must not remain a user-facing AuthN dependency for new productivity paths                              |

### 8.2 Tenancy

| ID        | Requirement                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------- |
| FR-TEN-01 | Multi-tenant isolation for all platform metadata and entitlement state                                  |
| FR-TEN-02 | Organisation and Individual tenants share machinery; differ by commercial plan                          |
| FR-TEN-03 | Tenant switcher for multi-org users without cross-tenant leakage                                        |
| FR-TEN-04 | APZOR operates as an ordinary commercial tenant for dogfooding                                          |
| FR-TEN-05 | Platform control plane is distinct from tenant admin plane (`/platform-admin` vs `/org` / tenant admin) |

### 8.3 Authorization (five layers — do not collapse)

| Layer | Meaning                                                                                    |
| ----- | ------------------------------------------------------------------------------------------ |
| 1     | Platform roles (control plane)                                                             |
| 2     | Tenant administrative roles                                                                |
| 3     | Organisational / staff functions (templates/defaults — **not** direct authz)               |
| 4     | Product roles + resource scopes                                                            |
| 5     | Granular / professional entitlements (source, scanners, provider consoles, cert approvals) |

| ID          | Requirement                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| FR-AUTHZ-01 | PermissionService is authoritative; UI is permission-driven; server enforces                                    |
| FR-AUTHZ-02 | Product entitlement ≠ product permission — both must pass                                                       |
| FR-AUTHZ-03 | Role translation: platform permissions → service mapping → backend roles; never expose backend role names in UI |
| FR-AUTHZ-04 | Superadmin / Platform Owner is an explicit audited tier — not a bypass                                          |
| FR-AUTHZ-05 | Resource scopes (e.g. `projects.project:`, `source.repo:`) constrain where product roles apply                  |
| FR-AUTHZ-06 | Professional Tool Access is exceptional, entitled, and audited                                                  |
| FR-AUTHZ-07 | Explain-why / User Inspector surfaces why access was granted or denied                                          |

Detail: [UX-STREAM-006](./ux/UX-STREAM-006-tenant-identity-rbac-administration.md).

### 8.4 Desktop shell and navigation

| ID          | Requirement                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| FR-SHELL-01 | Permanent shell: Header, Activity Bar, Sidebar, Workspace, Context Panel, Status Bar                               |
| FR-SHELL-02 | Command Palette (Ctrl/Cmd+Shift+P); Quick Actions; Search — all permission-filtered                                |
| FR-SHELL-03 | Product switcher shows only entitled products; shell persists across product switches                              |
| FR-SHELL-04 | Navigation derived from: subscription → config → membership → assignment → role → permissions → professional tools |
| FR-SHELL-05 | Never hardcode workspaces/menus from job title alone                                                               |
| FR-SHELL-06 | Dark/light themes via design tokens only                                                                           |
| FR-SHELL-07 | Public marketing chrome must not bleed into authenticated workbench                                                |
| FR-SHELL-08 | Shared workspace primitives (tabs, resizable panes, drawers, tables, forms, dialogs)                               |

Detail: [005](./005-desktop-experience-workspace-framework.md) · [016](./016-desktop-shell-architecture-user-experience-framework.md) · [UX-STREAM-005](./ux/UX-STREAM-005-platform-shell-design-system.md).

### 8.5 Design system

| ID       | Requirement                                                         |
| -------- | ------------------------------------------------------------------- |
| FR-DS-01 | Semantic tokens only — no hardcoded colours/spacing in product UI   |
| FR-DS-02 | Shared UI library (shadcn/ui + Tailwind) in packages; Lucide icons  |
| FR-DS-03 | Components are presentation-only — no auth/business logic in UI kit |
| FR-DS-04 | Storybook + a11y tests for shared components (WCAG AA target)       |
| FR-DS-05 | Branding / theme registry supports white-label via config           |

### 8.6 API Gateway and communication

| ID        | Requirement                                                                        |
| --------- | ---------------------------------------------------------------------------------- |
| FR-API-01 | One client API; clients never address engines or connectors                        |
| FR-API-02 | Common request context: token, correlation ID, org, workspace, locale, timezone    |
| FR-API-03 | Standard response envelope; typed error categories; no raw backend errors to users |
| FR-API-04 | Rate limiting; circuit breakers on connectors                                      |
| FR-API-05 | REST-first, versioned, documented; gateway contains no business logic              |
| FR-API-06 | Edge TLS via Caddy (primary) or Nginx                                              |

### 8.7 Platform Services (shared)

| ID        | Capability                   | Requirement                                                                                                |
| --------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| FR-SVC-01 | PermissionService            | Authoritative authz decisions                                                                              |
| FR-SVC-02 | Audit                        | Immutable, searchable, exportable platform/quality/security events as applicable                           |
| FR-SVC-03 | Notifications / Attention    | Modules publish events; Attention Engine decides delivery                                                  |
| FR-SVC-04 | Search / Knowledge Discovery | One Platform Search Service; providers register; permission-filtered at query time                         |
| FR-SVC-05 | Events / Jobs                | Past-tense events; at-least-once + idempotent subscribers; no long work in request handlers                |
| FR-SVC-06 | Preferences                  | Hierarchy system → org → role → user → session; prefs never grant permissions                              |
| FR-SVC-07 | Activity                     | Platform-owned activity stream                                                                             |
| FR-SVC-08 | Health                       | Self-reporting services/connectors; hierarchy platform → workspace → module → service → connector → engine |
| FR-SVC-09 | Configuration                | Connector config refs; feature flags / governance                                                          |
| FR-SVC-10 | Documents (platform)         | Where products use platform document workbench patterns — not a generic DMS replacement                    |

### 8.8 Commercial, catalogue, and provisioning

| ID        | Requirement                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------- |
| FR-COM-01 | Commercial catalogue of L1 offerings (APZPRD modules/packages, APZQEP, APZPEN, …)                         |
| FR-COM-02 | Regional price books (GLOBAL USD, AFRICA USD, SOUTH AFRICA ZAR); tax exclusive; ZA VAT 15% when activated |
| FR-COM-03 | Quote → payment (PayFast production path) → verified ITN → provisioning                                   |
| FR-COM-04 | Trial: 14 days; no card; one trial per organisation; no auto paid conversion                              |
| FR-COM-05 | Org subscription does **not** auto-grant users — admin assigns seats/grants                               |
| FR-COM-06 | Collaborator seats require ≥1 paid Engineer (QEP) or Practitioner (PEN)                                   |
| FR-COM-07 | Platform fee none at launch — Team platform included with any paid product                                |
| FR-COM-08 | Invitation / provisioning path preferred before open self-service (Owner preference)                      |
| FR-COM-09 | Public commercial journey: website → marketplace → checkout → provision → invite                          |
| FR-COM-10 | Enterprise: Contact Sales (SSO/SCIM, governance, SLA, deployment, advanced audit)                         |

Prices: [Price Book v1.0](./strategy/commercial/APZ-COMMERCIAL-PRICE-BOOK-V1.md). Do not hard-code list prices into UI logic outside the catalogue engine.

### 8.9 Administration and operations

| ID        | Requirement                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| FR-OPS-01 | Platform Admin: tenants, products, subscriptions, provisioning, providers, ops, security, compliance, billing, audit       |
| FR-OPS-02 | Tenant Admin: users, roles, grants, org settings, billing contact — within tenant                                          |
| FR-OPS-03 | Administration Workspace / ops consoles: health, queues, workers, alerts, audit, logs, metrics, tracing — permission-gated |
| FR-OPS-04 | Mask backend dashboards from standard users                                                                                |
| FR-OPS-05 | `GET /api/health` (and deeper health hierarchy) for runtime readiness                                                      |
| FR-OPS-06 | Structured logging; correlation IDs end-to-end                                                                             |

### 8.10 Shared Source Workspace (cross-pillar)

| ID        | Requirement                                                                    |
| --------- | ------------------------------------------------------------------------------ |
| FR-SRC-01 | One provider-neutral Source Workspace UX for QEP + PEN (and entitled users)    |
| FR-SRC-02 | Independently entitled; not implied by every seat                              |
| FR-SRC-03 | Support browse/edit/branch/commit/push/PR/review flows per accepted UX streams |
| FR-SRC-04 | Never imply GitHub (or any SCM) is the product identity                        |

Authority: [UX-SHARED-SOURCE-WORKSPACE](./ux/UX-SHARED-SOURCE-WORKSPACE.md).

---

## 9. Functional requirements — Commercial pillars (platform obligations)

APZHUB must **host, entitle, navigate, and govern** these sellable solutions. Pillar product depth is specified in pillar PRDs; this section is the **platform contract** toward them.

### 9.1 APZPRD — Enterprise Productivity

**Executive question:** _Can our people work effectively?_

| Module (customer brand) | Typical masked engine  |
| ----------------------- | ---------------------- |
| Projects                | Plane                  |
| Support                 | Zammad                 |
| Time                    | Kimai                  |
| Workflow                | n8n                    |
| Analytics               | Metabase               |
| Documents               | Paperless-ngx          |
| Knowledge               | Native / search-backed |

| ID        | Platform obligation                                                         |
| --------- | --------------------------------------------------------------------------- |
| FR-PRD-01 | Composable packaging — never force the full suite                           |
| FR-PRD-02 | Personalised workspace assembled from entitlements + permissions            |
| FR-PRD-03 | Product roles independent per module                                        |
| FR-PRD-04 | Catalogue SKUs include atomic modules and Complete / named packages         |
| FR-PRD-05 | Running work (e.g. timer) may persist across product switches when entitled |

Pillar vision: [APZPRD](./strategy/APZPRD-ENTERPRISE-PRODUCTIVITY-PLATFORM.md).

### 9.2 APZQEP — Quality Engineering

**Executive question:** _Can we release with confidence?_

| ID        | Platform obligation                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| FR-QEP-01 | Host QEP as SoR for quality-relevant requirements, verification, evidence, certification, quality audit, traceability |
| FR-QEP-02 | Seat model: Engineer + Collaborator                                                                                   |
| FR-QEP-03 | AI Quality Workspace default OFF; never auto-certify                                                                  |
| FR-QEP-04 | Integrate providers via connectors; QEP is not a test runner identity                                                 |
| FR-QEP-05 | Shared Source Workspace available when entitled                                                                       |

PRD: [products/apzqep/APZQEP-PRD.md](./products/apzqep/APZQEP-PRD.md).

### 9.3 APZPEN — Security Assurance

**Executive question:** _Can we demonstrate we are secure?_

| ID        | Platform obligation                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------- |
| FR-PEN-01 | Host PEN as security assurance lifecycle (asset → certify → monitor) — not a scanner UI wrapper       |
| FR-PEN-02 | Seat model: Practitioner + Collaborator                                                               |
| FR-PEN-03 | Professional pentest services and third-party tool licenses **not** included in SaaS trial by default |
| FR-PEN-04 | Rules of Engagement / scope first-class before testing                                                |
| FR-PEN-05 | Professional Tools independently entitled                                                             |

Vision: [APZPEN](./strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md).

### 9.4 Optional / future L1 offerings

| Offering                      | Platform obligation                                              |
| ----------------------------- | ---------------------------------------------------------------- |
| APZLaw                        | Sellable practice/governance product; same entitlement machinery |
| APZSign                       | Independent SKU when chartered                                   |
| Verticals (Exchange, Banking) | When Owner-chartered; consume Platform Core                      |

### 9.5 Cross-pillar integration (without merging products)

| ID       | Requirement                                                                 |
| -------- | --------------------------------------------------------------------------- |
| FR-XP-01 | Shared identity, audit, search, notifications across licensed pillars       |
| FR-XP-02 | PEN security evidence may feed QEP release certification when both licensed |
| FR-XP-03 | PRD may raise work from QEP/PEN findings when entitled                      |
| FR-XP-04 | Products remain independently sellable                                      |

---

## 10. Non-functional requirements

| ID     | Area            | Requirement                                                                        |
| ------ | --------------- | ---------------------------------------------------------------------------------- |
| NFR-01 | Security        | Zero Trust; verify identity, permission, integrity, intent, context every request  |
| NFR-02 | Secrets         | Never in code, logs, or repos; encrypt sensitive data; TLS mandatory               |
| NFR-03 | Least privilege | Users, services, connectors, workers — dedicated worker identities                 |
| NFR-04 | Tenancy         | Strict isolation; no cross-tenant leakage in UI or APIs                            |
| NFR-05 | Auditability    | Immutable trails for authz-sensitive and commercial actions                        |
| NFR-06 | Performance     | Respond fast; async for notify/search/audit/heavy work                             |
| NFR-07 | Reliability     | Idempotent jobs; retry/backoff/DLQ; connector circuit breakers                     |
| NFR-08 | Observability   | Four pillars: metrics, logs, traces, health — correlated                           |
| NFR-09 | Accessibility   | WCAG AA for product UI                                                             |
| NFR-10 | Quality         | Full test pyramid + Playwright; CI must pass before main                           |
| NFR-11 | Portability     | Self-hosted first; managed cloud optional                                          |
| NFR-12 | Privacy         | POPIA / compliance pathway before external transactional enablement where required |
| NFR-13 | Typing          | TypeScript strict; no `any` as policy                                              |
| NFR-14 | Docs            | Manifests, ADRs, operator guides, and acceptance evidence before claiming complete |

---

## 11. User experience principles

| Principle                  | Implication                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| One application            | Desktop-style workbench, not a link farm                                   |
| Permission-driven UI       | Only show what effective access allows                                     |
| Engines invisible          | APZ-branded modules and services only                                      |
| Keyboard-first power users | Command palette, shortcuts, dense layouts                                  |
| Inspiration                | Cursor, VS Code, Linear, modern admin workbenches                          |
| Assembly                   | Every user sees one APZ experience dynamically assembled from entitlements |
| Public vs authenticated    | Marketing journey separate from workbench chrome                           |

---

## 12. Technology constraints (mandatory stack)

| Layer    | Choice                                                                                        |
| -------- | --------------------------------------------------------------------------------------------- |
| Monorepo | pnpm workspaces (`/apps`, `/packages`, `/services`, `/modules`, `/adapters`, …)               |
| Frontend | Next.js App Router, React, TypeScript strict, Tailwind, shadcn/ui, TanStack, RHF, Zod, Lucide |
| Backend  | Next.js Route Handlers / Server Actions; business logic in Platform Services                  |
| Auth     | BetterAuth                                                                                    |
| Data     | PostgreSQL (platform), Redis, S3-compatible storage                                           |
| Proxy    | Caddy (primary) or Nginx                                                                      |
| Quality  | ESLint, Prettier, Vitest, Playwright, Storybook                                               |
| Events   | Platform Event Bus per 012 / 029                                                              |

Substitutions require Owner approval.

---

## 13. Commercial catalogue (reference)

### Discipline seats (Price Book v1.0)

| Product                 | Global USD/mo | Africa USD/mo | ZA ZAR/mo (ex VAT) |
| ----------------------- | ------------: | ------------: | -----------------: |
| APZPRD Projects         |            10 |             6 |                 99 |
| APZPRD Support — Agent  |            22 |            12 |                199 |
| APZPRD Time             |             8 |             4 |                 69 |
| APZPRD Workflow         |            10 |             6 |                 99 |
| APZPRD Analytics        |            12 |             7 |                119 |
| APZPRD Knowledge        |             7 |             4 |                 69 |
| APZPRD Documents        |             7 |             4 |                 69 |
| **APZPRD Complete**     |        **29** |        **15** |            **249** |
| **APZQEP Engineer**     |        **35** |        **18** |            **299** |
| APZQEP Collaborator     |            10 |             5 |                 79 |
| **APZPEN Practitioner** |        **69** |        **35** |            **599** |
| APZPEN Collaborator     |            12 |             6 |                 99 |

Annual = 10 × monthly. Trial = 14 days / org / discipline family per Trial Policy.

### Included with any paid product

Identity · tenancy · shell · search/notifications/audit foundations · Team platform (no separate platform fee at launch).

---

## 14. MVP / baseline platform definition of done

A commercially operable platform baseline must support:

1. Authenticate with BetterAuth; enter permission-filtered shell.
2. Create/manage tenant membership; assign entitled modules without auto-granting all users.
3. Purchase or trial at least one L1 offering; provision entitlements; invite users.
4. Navigate only entitled products; switch org without leakage.
5. Call Platform Services only through the gateway; connectors healthy and masked.
6. Emit audit + correlation IDs for sensitive actions.
7. Search / notify / activity via platform services (event-driven), not module side-channels.
8. Platform and tenant admin surfaces separated.
9. Health endpoint and basic ops visibility for operators.
10. CI: lint, types, build, tests, Playwright gates green for the claimed release.

Pillar MVPs (e.g. QEP certify path, PEN engagement path, PRD Projects workbench) are **additional** DoDs on top of this platform baseline.

---

## 15. Success metrics

| Metric                       | Intent                                                     |
| ---------------------------- | ---------------------------------------------------------- |
| Time-to-first-value          | Invite → entitled workbench in minutes                     |
| Entitlement correctness      | Zero access without subscription + grant + permission      |
| Engine leakage               | Zero standard-user exposure of engine brands/URLs          |
| Cross-tenant incidents       | Zero tolerance                                             |
| Checkout → provision success | Verified payment → entitlements without manual repair      |
| Shell consistency            | One shell across pillars; product nav only changes         |
| Ops MTTR                     | Health/audit/jobs sufficient to diagnose without engine UI |
| Pillar attach                | Land-and-expand across APZPRD modules and QEP/PEN          |
| Dogfood                      | APZOR runs as ordinary tenant on production path           |

---

## 16. Risks and dependencies

| Risk                                     | Mitigation                                                      |
| ---------------------------------------- | --------------------------------------------------------------- |
| Selling “the portal” again               | Commercial Pillars + SaaS Model locked                          |
| Layer bypass under delivery pressure     | Constitution + SDK gates + architecture review                  |
| Entitlement ≠ permission bugs            | Dual checks; User Inspector explain-why                         |
| Self-service before invitation readiness | Keep self-service OFF until Owner opens                         |
| Price/tax drift                          | Catalogue + Price Book as SoR; no hard-coded UI prices          |
| AI overreach                             | Default OFF; never SoR; never auto-certify                      |
| Shared-host capacity                     | Platform release capacity evidence before heavy realtime claims |
| Legacy AuthN                             | BetterAuth sole AuthN; retire Authentik with APZPRD paths       |

---

## 17. Out of scope for this PRD

- Replacing pillar product definitions (QEP/PEN/PRD deep PRDs remain authoritative for those domains)
- Chartering Exchange/Banking without Owner programme
- Email as System of Record / inbound mailbox
- Mandatory cloud-only deployment
- Marketplace GA (future horizon)
- Unbounded AI autonomy

---

## 18. Document map (authoritative sources)

| Topic                  | Authority                                                                                                                                                                                                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engineering law        | [000 Constitution](./000-apzhub-engineering-constitution.md)                                                                                                                                                                                                                                                          |
| Vision                 | [001](./001-project-vision-and-guiding-principles.md)                                                                                                                                                                                                                                                                 |
| Terminology            | [002](./002-product-naming-positioning-terminology-standard.md)                                                                                                                                                                                                                                                       |
| Architecture           | [003](./003-overall-system-architecture-design-principles.md) · [008](./008-module-plugin-connector-architecture.md) · [009](./009-platform-service-layer-integration-framework.md) · [010](./010-api-gateway-integration-communication-standards.md) · [011](./011-data-ownership-storage-system-of-record-rules.md) |
| Shell / UX             | [005](./005-desktop-experience-workspace-framework.md) · [016](./016-desktop-shell-architecture-user-experience-framework.md)–[023](./023-user-preferences-personalisation-workspace-experience-framework.md) · UX Streams 001–006                                                                                    |
| SDKs                   | [024](./024-apzhub-platform-sdk-development-framework.md)–[029](./029-platform-event-sdk-event-bus-event-manifest-specification.md)                                                                                                                                                                                   |
| Commercial pillars     | [APZOR-COMMERCIAL-PILLARS](./strategy/APZOR-COMMERCIAL-PILLARS.md)                                                                                                                                                                                                                                                    |
| SaaS model             | [SAAS-COMMERCIAL-MODEL](./strategy/commercial/SAAS-COMMERCIAL-MODEL.md)                                                                                                                                                                                                                                               |
| Price Book             | [APZ-COMMERCIAL-PRICE-BOOK-V1](./strategy/commercial/APZ-COMMERCIAL-PRICE-BOOK-V1.md)                                                                                                                                                                                                                                 |
| Platform Core strategy | [APZHUB-Platform-Core-Strategy](./strategy/APZHUB-Platform-Core-Strategy.md)                                                                                                                                                                                                                                          |
| Pillar visions         | [APZQEP](./strategy/APZQEP-ENTERPRISE-QUALITY-ENGINEERING-PLATFORM.md) · [APZPEN](./strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md) · [APZPRD](./strategy/APZPRD-ENTERPRISE-PRODUCTIVITY-PLATFORM.md)                                                                                                      |
| QEP PRD                | [products/apzqep/APZQEP-PRD.md](./products/apzqep/APZQEP-PRD.md)                                                                                                                                                                                                                                                      |
| Portfolio baseline     | [APZHUB-ENTERPRISE-PORTFOLIO-BASELINE](./products/framework/APZHUB-ENTERPRISE-PORTFOLIO-BASELINE.md)                                                                                                                                                                                                                  |

---

## 19. Approval and change control

| Artifact                                   | Role                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| This PRD                                   | Comprehensive platform requirements summary for stakeholders                          |
| Constitution / Foundation 001–029          | Normative engineering — supersede this PRD on conflict                                |
| SaaS Commercial Model / Commercial Pillars | Normative commercial packaging                                                        |
| Named sprint / build / UX stream guides    | Authorise implementation slices                                                       |
| Owner acceptance                           | Required for commercial publication, self-service enablement, and major scope changes |

**Change rule:** Do not alter Price Book, Trial Policy, Constitution principles, or five-layer access model in this PRD without Owner decision. Implementation remains gated by approved sprint guides.

---

_End of APZHUB Platform PRD_
