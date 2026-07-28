# APZ QEP — Architecture Decision Catalogue

> **Programme:** APZQEP-ARCH-001  
> **Classification:** ENTERPRISE ARCHITECTURE  
> **Type:** Architecture-level decisions — **not** Product Definition decisions (DEF-D-*) and **not** implementation ADRs  
> **Status:** Proposed for Owner Acceptance  
> **Baseline:** APZQEP-DEF-002 (1.0.0-def expanded) · APZHUB Platform 1.4

## Purpose

This catalogue records **architecture-level** decisions for APZ QEP — structural boundaries, authority models, integration posture, and cross-cutting patterns that Engineering must implement without reinterpretation. Product behaviour decisions remain in [../product-definition/PRODUCT-DEFINITION-DECISIONS.md](../product-definition/PRODUCT-DEFINITION-DECISIONS.md). Technology library choices beyond Platform 004 standards require separate ADRs under future programmes.

## Decision register

| ID | Decision | Status |
| -- | -------- | ------ |
| QEP-AD-001 | Modular monolith first | Proposed for Owner Acceptance |
| QEP-AD-002 | QEP authoritative SoR domains | Proposed for Owner Acceptance |
| QEP-AD-003 | Platform Service boundary | Proposed for Owner Acceptance |
| QEP-AD-004 | AI default OFF at architecture layer | Proposed for Owner Acceptance |
| QEP-AD-005 | MCP gateway pattern | Proposed for Owner Acceptance |
| QEP-AD-006 | Evidence lock on certification approval | Proposed for Owner Acceptance |
| QEP-AD-007 | Human certification mandatory | Proposed for Owner Acceptance |
| QEP-AD-008 | Continuous signals non-authoritative | Proposed for Owner Acceptance |
| QEP-AD-009 | Verification as primary architecture noun | Proposed for Owner Acceptance |
| QEP-AD-010 | Manual-first MVP architecture implications | Proposed for Owner Acceptance |
| QEP-AD-011 | Read models for QI and Reporting | Proposed for Owner Acceptance |
| QEP-AD-012 | Event-driven side effects | Proposed for Owner Acceptance |
| QEP-AD-013 | Connector-only engine access | Proposed for Owner Acceptance |
| QEP-AD-014 | Tenancy isolation | Proposed for Owner Acceptance |
| QEP-AD-015 | BetterAuth authentication only | Proposed for Owner Acceptance |
| QEP-AD-016 | PermissionService ownership | Proposed for Owner Acceptance |
| QEP-AD-017 | Certification multi-approver architecture | Proposed for Owner Acceptance |
| QEP-AD-018 | Air-gap deployability | Proposed for Owner Acceptance |
| QEP-AD-019 | Self-host-first deployment posture | Proposed for Owner Acceptance |
| QEP-AD-020 | Native APZHUB product classification | Proposed for Owner Acceptance |
| QEP-AD-021 | Derived search index non-authoritative | Proposed for Owner Acceptance |
| QEP-AD-022 | Zero Trust request pipeline | Proposed for Owner Acceptance |
| QEP-AD-023 | Service extraction ready internal seams | Proposed for Owner Acceptance |

---

## QEP-AD-001 — Modular monolith first

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | QEP spans 22 product modules with shared certification, traceability, and evidence lifecycles. Premature microservice decomposition would increase operational burden before domain boundaries are proven in production. |
| **Decision** | APZ QEP ships as a **modular monolith** — one deployable product boundary with explicit internal module seams, bounded contexts, and logical service boundaries that permit future extraction without redesigning authority or SoR rules. |
| **Consequences** | Shared runtime and release cadence; internal APIs may be in-process initially; extraction requires Owner + ADR; observability must still attribute by logical service and module. |
| **Alternatives considered** | Microservices from day one (rejected — ops cost, distributed consistency risk); separate deployable per module (rejected — violates platform product model). |
| **Alignment** | Constitution 003 layered architecture; DEF-D-004 module catalogue; Platform 004 monorepo; Engineering Guardrails service-extraction-ready seams. |

---

## QEP-AD-002 — QEP authoritative SoR domains

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | External ALM, CI, runners, and AI tools contribute data but must not become authoritative for quality governance. |
| **Decision** | APZ QEP Platform Services hold write authority for Constitution SoR domains: Requirements (quality-relevant), Verification, Evidence, Certification, Quality Metrics, Quality Intelligence (governed insights), Audit (QEP actions), and Traceability. |
| **Consequences** | Connectors ingest/sync only; conflict resolution favours QEP SoR; caches and external dashboards are never authoritative; import/migration seeds SoR then QEP owns truth. |
| **Alternatives considered** | ALM-as-SoR for requirements (rejected — DEF-D-008); CI-as-SoR for verification results (rejected — runner adjacency only). |
| **Alignment** | [SYSTEM-OF-RECORD](../constitution/SYSTEM-OF-RECORD.md); DEF-D-008 product boundaries; Platform 011 one SoR per datum. |

---

## QEP-AD-003 — Platform Service boundary

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Modules must not embed business rules or reach backends directly. APZHUB mandates Module → Platform Service → Connector → Engine. |
| **Decision** | All QEP business orchestration, validation, permissions enforcement, audit emission, and SoR writes occur in **QEP Platform Services** (logical services aligned to bounded contexts). Modules are presentation and command surfaces only. |
| **Consequences** | Each domain exposes a service manifest intent; modules register with shell; no module-to-module business coupling; shared platform services (Identity, Permissions, Audit, Search, Notifications) consumed not duplicated. |
| **Alternatives considered** | Module-embedded domain logic (rejected — architectural defect); BFF calling engines (rejected — skips service layer). |
| **Alignment** | Platform 008–009; Module SDK 025; Service SDK 027; PRODUCT-ARCHITECTURE-STANDARD. |

---

## QEP-AD-004 — AI default OFF at architecture layer

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | AI assists verification and analysis but must not become authoritative or enabled without governance. |
| **Decision** | AI capability surfaces (modules M14, M16, M17, AI services, provider connectors) are **architecturally present but disabled by default** at tenant and deployment level until Owner-authorised enablement. No AI code path may write SoR without human acceptance gate. |
| **Consequences** | Feature flags and permission tiers gate AI; MVP operates fully without AI; AI audit and cost controls mandatory when enabled; provider abstraction required before any model routing. |
| **Alternatives considered** | AI ON with opt-out (rejected — DEF-D-005); AI as separate product (rejected — integrated but governed). |
| **Alignment** | AI Constitution; DEF-D-005; AIR requirements; QEP-AD-007 human certification. |

---

## QEP-AD-005 — MCP gateway pattern

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | IDE and agent integrations require governed tool access without unrestricted database or workflow bypass. |
| **Decision** | All MCP tool invocation passes through an **MCP Gateway** layer: authenticated session, PermissionService authorisation, scoped tool registry, prompt/context retrieval via Platform Services, structured audit, and rate limits. No MCP tool receives raw SQL or direct connector credentials. |
| **Consequences** | Tool catalogue is permission-filtered; cert/approve tools excluded; MCP module (M18) is admin and DX surface; gateway translates to Platform Service calls only. |
| **Alternatives considered** | Direct DB MCP tools (rejected — no unrestricted DB); IDE plugins bypassing gateway (rejected — DEF-D-006). |
| **Alignment** | MCP Constitution/Discovery; DEF-D-006; MCP-INTEGRATION-STRATEGY; Platform 013 Zero Trust. |

---

## QEP-AD-006 — Evidence lock on certification approval

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Certification attestation requires immutable proof at decision time. |
| **Decision** | When certification reaches **Approved** or **Approved with qualifications**, the linked **evidence pack** transitions to a locked immutable state. Locked packs cannot be edited; supersession creates new packs linked in cert history. |
| **Consequences** | Evidence service enforces lock on cert decision event; rejected certs leave packs editable; audit records lock action with approver identity; export/reporting reads locked snapshots. |
| **Alternatives considered** | Soft lock with override (rejected — audit risk); lock on submit (rejected — premature immutability); post-cert grace edit window (rejected — Cert Constitution). |
| **Alignment** | Cert Constitution CERT-02; Evidence Model; DEF-D-007 qualifications outcome. |

---

## QEP-AD-007 — Human certification mandatory

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Formal quality attestation is a human accountability act, not an automation output. |
| **Decision** | **Certification state changes** occur only through human decision workflows. AI, MCP tools, integrators, continuous signals, and QI scores may inform but **never** execute certification approval or rejection. |
| **Consequences** | Certification service exposes human-gated transitions only; automation ends at readiness; workflow engine routes review tasks to named approvers; AI recommend endpoints are read-only relative to cert state. |
| **Alternatives considered** | Auto-cert on green readiness (rejected — CERT-08); AI co-signer (rejected — AI Constitution). |
| **Alignment** | Cert Constitution CERT-01; DEF-D-010; FR-037; Security Constitution human gates. |

---

## QEP-AD-008 — Continuous signals non-authoritative

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Post-cert drift detection must not silently invalidate formal attestation. |
| **Decision** | **Continuous certification signals** are indicators that may **request re-certification review** only. They never independently change formal certification status, lock state, or published certification statements. |
| **Consequences** | Signal ingestion is async; notifications surface re-cert requests; cert history retains prior approved state until human supersession; QI may correlate signals but not flip status. |
| **Alternatives considered** | Auto-expire cert on signal (rejected — CERT-04); signals as soft status field (rejected — ambiguous audit). |
| **Alignment** | Cert Constitution CERT-04; DEF-D-003 L7 maturity; Continuous Certification module intent. |

---

## QEP-AD-009 — Verification as primary architecture noun

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Legacy TCMS vocabulary ("test case") conflicts with QEP product identity and domain model. |
| **Decision** | Architecture names **bounded contexts, logical services, events, and read models** around **Verification** (plans, procedures, sessions, runs, results). "Test case" appears only at connector translation boundaries for external tool mapping. |
| **Consequences** | Verification Management and Execution contexts are first-class; ALM test artefact imports map into verification model; UI module slugs align (`verification-library`, `execution`); reporting dimensions use verification taxonomy. |
| **Alternatives considered** | Dual noun parity test case + verification (rejected — DEF-D-001); runner-native model as SoR (rejected — QEP-AD-002). |
| **Alignment** | DEF-D-001; PRODUCT-GLOSSARY; Verification Model; MODULE-ARCHITECTURE mapping. |

---

## QEP-AD-010 — Manual-first MVP architecture implications

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | MVP must deliver full certification path without automation or AI dependencies. |
| **Decision** | MVP architecture **prioritises manual verification sessions, human evidence capture, and manual cert workflows** as fully capable paths. Automation ingest, AI workspace, and MCP are optional adjacency layers that must not block MVP service completeness. |
| **Consequences** | Execution and Evidence services stand alone; Automation connector optional in MVP topology; performance and UX targets apply to manual session flows; event subscribers for automation failures are non-blocking for MVP cert path. |
| **Alternatives considered** | Automation-required MVP (rejected — DEF-D-002); AI-assisted execution as MVP default (rejected). |
| **Alignment** | DEF-D-002; MANUAL-VERIFICATION; MVP-DEFINITION; QEP-AD-004 AI OFF. |

---

## QEP-AD-011 — Read models for QI and Reporting

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Quality Intelligence and Reporting aggregate cross-domain data for decision support and exports without duplicating SoR authority. |
| **Decision** | QI and Reporting consume **derived read models** built from SoR events and permission-filtered projections. Read models are **explainable and reproducible** from SoR plus event history; they are not writable authority for certification or evidence. |
| **Consequences** | Async projection workers; stale-read indicators where applicable; QI cannot certify; reporting snapshots for cert packs reference locked evidence; cross-tenant read forbidden. |
| **Alternatives considered** | QI as parallel SoR (rejected — Constitution); synchronous cross-domain joins in request path for all dashboards (rejected — performance and coupling). |
| **Alignment** | QUALITY-INTELLIGENCE; REPORTING-REQUIREMENTS; Platform 011 derived data; Event SDK 029. |

---

## QEP-AD-012 — Event-driven side effects

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Notify, audit, search indexing, activity, and read-model refresh must not block user-facing request completion. |
| **Decision** | Platform Services **respond after validation and authoritative write intent**, then publish **past-tense domain events** for side effects. Modules do not notify, audit, or index directly. Subscribers must be idempotent (at-least-once delivery). |
| **Consequences** | Event manifests per domain; correlation and causation IDs on all events; certification lock triggers downstream pack-lock and statement publication asynchronously; job retry/DLQ for projections. |
| **Alternatives considered** | Synchronous fan-out in HTTP handlers (rejected — Platform 012); module-direct notification (rejected — 021). |
| **Alignment** | Platform 012; Event SDK 029; Notification Framework 021; QEP-AD-011 read models. |

---

## QEP-AD-013 — Connector-only engine access

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | QEP integrates with ALM, CI, runners, AI providers, and storage engines without becoming those engines. |
| **Decision** | External systems are reached **only** via Integration Adapters (Connectors) invoked by Platform Services. Modules and services never hold engine SDKs, credentials, or direct HTTP to backend engines. |
| **Consequences** | Connector manifests per engine class; health and circuit breakers at connector boundary; error translation hides engine branding; QEP never becomes ALM/CI/runner SoR. |
| **Alternatives considered** | Module-direct Jira/Playwright clients (rejected — 008 defect); service skipping connector (rejected — 009). |
| **Alignment** | DEF-D-008; Integration SDK 026; MODULE-ARCHITECTURE layering; PRODUCT-ARCHITECTURE-STANDARD request path. |

---

## QEP-AD-014 — Tenancy isolation

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Multi-tenant SaaS and dedicated private deployments require strict data and permission boundaries. |
| **Decision** | **Every request carries tenant context** from gateway through services, connectors, events, search, and read models. Cross-tenant reads, writes, and event subscriptions are forbidden. Superadmin operations are audited explicit tier, not a bypass. |
| **Consequences** | Tenant ID on correlation context; row-level intent in services (physical design deferred to Engineering); connector configs tenant-scoped; air-gap tenants have no implicit cross-tenant shared services. |
| **Alternatives considered** | Application-level tenancy only in UI (rejected — 013); shared cache without tenant key (rejected). |
| **Alignment** | SYSTEM-OF-RECORD multi-tenancy; Platform 013; IAM 007 superadmin rules. |

---

## QEP-AD-015 — BetterAuth authentication only

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | APZHUB separates authentication from authorisation. QEP consumes platform identity; it does not redefine login or session mechanics. |
| **Decision** | **BetterAuth** provides authentication (sessions, SSO handoff) only. QEP does not implement alternate login stacks or expose engine login screens. Session validation occurs at gateway before QEP services. |
| **Consequences** | No QEP-specific auth provider; SSO silent handoff for integrated engines via platform adapters; session revocation platform-owned. |
| **Alternatives considered** | Product-local auth (rejected — Platform IAM); engine-native login for admins (rejected — 007 single SSO). |
| **Alignment** | IAM 007; Platform 004; Security Constitution. |

---

## QEP-AD-016 — PermissionService ownership

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Permission-driven shell and service authorisation require a single authoritative permission model. |
| **Decision** | **APZHUB PermissionService** owns roles, permissions, and provisioning for QEP. QEP registers permission keys and role translations; modules query PermissionService for UI and command visibility; services enforce authorisation server-side on every operation. |
| **Consequences** | QEP permission catalogue as architecture artefact (not DB); backend engine roles never surface in UI; co-approver and certifier permissions are explicit keys; MCP tools inherit same permission checks. |
| **Alternatives considered** | Module-local RBAC (rejected — 005); engine role mirroring (rejected — 007 role translation). |
| **Alignment** | IAM 007; Desktop Framework 005; DEF personas and ROLE-WORKSPACES. |

---

## QEP-AD-017 — Certification multi-approver architecture

| Field | Content |
| ----- | ----- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Enterprise and regulated tiers require separation of duties and configurable co-approvers. |
| **Decision** | Certification workflow supports **policy-tiered multi-approver routing**: single approver (team), optional co-sign (enterprise), and mandatory multi-approver chains (regulated) with Compliance/Security roles. All approvers are named humans; partial approval does not lock evidence until final positive decision. |
| **Consequences** | Workflow orchestrates parallel or sequential approval patterns; audit captures each approver rationale; qualifications may require Product Owner acknowledgment; delegation follows RBAC only. |
| **Alternatives considered** | Single approver only (rejected — DEF-D-010); external e-sign engine as SoR (rejected — QEP cert SoR). |
| **Alignment** | DEF-D-010; Cert Model approval rules; CERTIFICATION-MODEL policy tiers. |

---

## QEP-AD-018 — Air-gap deployability

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Regulated customers require operation without mandatory external network dependencies. |
| **Decision** | QEP architecture **must be deployable in air-gapped or restricted connectivity modes** with published limitation notices. External AI providers, optional cloud connectors, and third-party SaaS ingest are disable-able without breaking core verification, evidence, certification, and audit paths. |
| **Consequences** | Connector availability matrix per deployment mode; local object storage compatible; no hard dependency on public model APIs for MVP; observability backends may be local OSS only. |
| **Alternatives considered** | Cloud-only SaaS architecture (rejected — self-host-first); silent feature degradation (rejected — must publish limitations). |
| **Alignment** | DEPLOYMENT-MODEL air-gapped mode; DEF deployment experience; QEP-AD-019. |

---

## QEP-AD-019 — Self-host-first deployment posture

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Primary enterprise buyers expect customer-controlled data and OSS CE alignment. |
| **Decision** | **Self-hosted** is the first-class reference deployment topology. Managed cloud and hybrid are optional commercial experiences layered on the same modular monolith boundary — not a separate product fork. |
| **Consequences** | Architecture docs describe topology intent not vendor SKUs; customer RACI for self-hosted; platform PostgreSQL/Redis/S3-compatible storage; Caddy edge; no mandatory Enterprise Edition engine dependencies. |
| **Alternatives considered** | SaaS-only product (rejected — Constitution self-hosted first); separate cloud codebase (rejected — modular monolith). |
| **Alignment** | Platform 004; DEPLOYMENT-MODEL; PRODUCT-EDITIONS; Engineering Guardrails OSS CE first. |

---

## QEP-AD-020 — Native APZHUB product classification

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | PRODUCT-ARCHITECTURE-STANDARD distinguishes native vs platform-backed products. |
| **Decision** | APZ QEP is classified as a **Native APZHUB product** — QEP Platform Services own quality SoR in platform persistence; connectors are optional adjacency for ALM/CI/runners/AI, not the primary SoR engine. |
| **Consequences** | No mandatory Plane/Jira-class engine as QEP core; connector introduction for new engine classes requires Product ADR; hybrid native+connector paths documented per integration. |
| **Alternatives considered** | Platform-backed TCMS OSS engine (rejected — commercial differentiator); ALM plugin strategy (rejected — DEF-D-008). |
| **Alignment** | PRODUCT-ARCHITECTURE-STANDARD; DEF product boundaries; MODULE-ARCHITECTURE native layering. |

---

## QEP-AD-021 — Derived search index non-authoritative

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Unified search spans verification, evidence, defects, and certification artefacts with permission filtering. |
| **Decision** | QEP registers **Search Providers** with Platform Search Service. The search index is a **derived, permission-filtered projection** — never authoritative for certification state, evidence lock, or SoR writes. |
| **Consequences** | Event-driven indexing; query-time permission filter; modules use Platform Search only; no standalone module search UIs. |
| **Alternatives considered** | Module-local Elasticsearch (rejected — 020); search hit as cert evidence (rejected — explainability). |
| **Alignment** | Platform 020; SEARCH-ARCHITECTURE intent; QEP-AD-012 events. |

---

## QEP-AD-022 — Zero Trust request pipeline

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Every QEP operation must verify identity, permission, intent, and context — no trusted internal shortcuts. |
| **Decision** | All QEP traffic follows **Auth → Authz → Validation → Business rules → Audit → Execution** at gateway and service layers. Internal service calls inherit correlation and tenant context; no "trusted" module bypass. |
| **Consequences** | Validation before connector calls; rate limits at gateway; structured error envelope without engine leakage; MCP and API categories same pipeline. |
| **Alternatives considered** | Frontend-only permission checks (rejected — 013); internal network trust (rejected). |
| **Alignment** | Security Constitution 013; Gateway 010; API-ARCHITECTURE principles. |

---

## QEP-AD-023 — Service extraction ready internal seams

| Field | Content |
| ----- | ------- |
| **Status** | Proposed for Owner Acceptance |
| **Context** | Modular monolith first must not foreclose scaling hot domains later. |
| **Decision** | Logical services align to **bounded contexts** with explicit published interfaces and event contracts. Internal communication uses interface boundaries even when co-located, enabling future extraction to separate workers or services without changing module or connector contracts. |
| **Consequences** | No shared mutable domain state across contexts; orchestration via services and events; context map documents upstream/downstream; extraction requires Owner + ADR. |
| **Alternatives considered** | Shared domain model library across contexts (rejected — coupling); premature separate deployments (rejected — QEP-AD-001). |
| **Alignment** | BOUNDED-CONTEXTS; APPLICATION-ARCHITECTURE; Platform 003 composition. |

---

## Usage rules

- Architecture decisions **implement** Product Definition decisions — they do not override DEF-D-* without Owner amendment.
- Conflicts with APZHUB Foundation docs escalate to Owner; Platform 1.4 freezes remain in force.
- Engineering ADRs reference QEP-AD-* IDs when implementing structural choices.
- Status advances to **Accepted** only via [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md).

## Related documents

| Document | Relationship |
| -------- | ------------ |
| [../product-definition/PRODUCT-DEFINITION-DECISIONS.md](../product-definition/PRODUCT-DEFINITION-DECISIONS.md) | Product decisions (DEF-D-*) |
| [ENTERPRISE-ARCHITECTURE.md](./ENTERPRISE-ARCHITECTURE.md) | Overall EA views |
| [BOUNDED-CONTEXTS.md](./BOUNDED-CONTEXTS.md) | Context boundaries |
| [../constitution/PRODUCT-CONSTITUTION.md](../constitution/PRODUCT-CONSTITUTION.md) | Constitutional authority |
