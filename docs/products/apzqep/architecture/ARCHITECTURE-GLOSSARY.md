# APZ QEP — Architecture Glossary

> **Programme:** APZQEP-ARCH-001  
> **Classification:** ENTERPRISE ARCHITECTURE  
> **Status:** Proposed for Owner Acceptance  
> **Aligns with:** [../product-definition/PRODUCT-GLOSSARY.md](../product-definition/PRODUCT-GLOSSARY.md) · APZHUB Foundation 000–029

## Purpose

Defines **architecture terms** used across the APZQEP-ARCH-001 pack. Product-facing vocabulary remains authoritative in the Product Glossary; platform terms align with APZHUB Foundation documents. Where meanings differ by layer, both are noted.

## Architecture terms

| Term                                | Architecture definition                                                                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Activity Stream**                 | Platform-owned feed of user-relevant events; modules publish domain events — they do not write activity directly (021).                                                    |
| **Adapter Layer**                   | Synonym for Integration Adapter / Connector layer in 003; translates protocols, errors, and identities between Platform Services and engines.                              |
| **Air-gapped deployment**           | Topology where QEP operates without mandatory external network dependencies; external connectors and cloud AI disabled by policy (QEP-AD-018).                             |
| **Application layer**               | Orchestration of use cases and module commands; no SoR authority; delegates to Platform Services (003).                                                                    |
| **Attention Engine**                | Platform notification delivery subsystem; decides how attention events reach users — modules never send notifications directly (021).                                      |
| **Authoritative data**              | Data for which QEP Platform Services hold write authority and conflict resolution — see SoR domains (QEP-AD-002).                                                          |
| **BetterAuth**                      | Platform authentication provider; sessions and SSO handoff only — not authorisation (QEP-AD-015).                                                                          |
| **Bounded context**                 | A cohesive domain boundary with explicit ubiquitous language, owned aggregates, and published interfaces; maps to logical services and product modules (BOUNDED-CONTEXTS). |
| **Business capability**             | Organisation-facing ability the product supports (e.g. certify release); mapped in BUSINESS-ARCHITECTURE — not a deployable unit.                                          |
| **Certification decision**          | Human-only state transition approving, qualifying, or rejecting certification; triggers evidence lock on positive outcomes (QEP-AD-006, QEP-AD-007).                       |
| **Certification scope**             | Release, sprint, build, or project boundary subject to formal certification — product term; architecture treats scope as workflow and SoR boundary.                        |
| **Connector**                       | Integration Adapter implementing `integration.yaml`; sole path from Platform Services to external engines (008, 026, QEP-AD-013).                                          |
| **Context map**                     | Diagram and catalogue of bounded context relationships (partnerships, upstream/downstream, anti-corruption layers).                                                        |
| **Continuous certification signal** | Non-authoritative drift indicator that may request re-certification review — never auto-flips formal cert status (QEP-AD-008).                                             |
| **Correlation ID**                  | End-to-end request identifier propagated gateway → service → connector → event → observability (010).                                                                      |
| **Derived data**                    | Search indexes, read models, caches, and projections — reproducible from SoR and events; never authoritative (011, QEP-AD-011, QEP-AD-021).                                |
| **Domain event**                    | Past-tense platform event with standard envelope; published by Platform Services after authoritative intent (029, QEP-AD-012).                                             |
| **Domain layer**                    | QEP business rules and invariants owned by logical services; no UI or connector code (003).                                                                                |
| **Enterprise Architecture (EA)**    | Structural views of business, application, information, integration, security, and deployment intent — this pack — excluding physical schema and code.                     |
| **Evidence lock**                   | Immutable state on evidence pack applied when certification is Approved or Approved with qualifications (QEP-AD-006).                                                      |
| **Evidence pack**                   | Curated evidence bundle linked to certification; architecture treats as aggregate root in Evidence bounded context.                                                        |
| **Event-driven side effect**        | Async work triggered by domain events: notify, audit, search index, activity, read-model projection (QEP-AD-012).                                                          |
| **Gateway (API)**                   | APZHUB API Gateway — single client entry; auth, authz, validation, rate limit; no business logic (010).                                                                    |
| **Human gate**                      | Mandatory human approval checkpoint in workflow; cannot be satisfied by AI, MCP, or automation alone.                                                                      |
| **Information architecture (EA)**   | Authoritative ownership, flows, lifecycles, consistency boundaries, and read models — logical only, not physical schema (INFORMATION-ARCHITECTURE).                        |
| **Integration pattern**             | REST, events, webhooks, MCP, batch, import/export, or streaming — always via Platform Service → Connector (INTEGRATION-ARCHITECTURE).                                      |
| **Logical service**                 | Named Platform Service boundary aligned to a bounded context (e.g. Verification Service); may be co-located in modular monolith (QEP-AD-001, QEP-AD-023).                  |
| **Manual verification path**        | MVP-complete architecture path for human sessions and evidence without automation or AI (QEP-AD-010).                                                                      |
| **Master data (reference)**         | Stable reference entities (projects, environments, personas bindings) governed by owning context; distinct from transactional verification/evidence flows.                 |
| **MCP Gateway**                     | Governed entry for MCP tool calls: authn, authz, scoped registry, audit — no raw DB (QEP-AD-005).                                                                          |
| **Modular monolith**                | Single deployable QEP product with internal module and context seams; extraction-ready (QEP-AD-001).                                                                       |
| **Module (product)**                | Presentation and navigation unit registered with APZHUB shell; 22 modules M01–M22; never calls connectors (025).                                                           |
| **Multi-approver certification**    | Policy-tiered human approval chain for certification decisions (QEP-AD-017).                                                                                               |
| **Permission key**                  | Platform permission identifier registered by QEP; enforced server-side and in permission-driven UI (QEP-AD-016).                                                           |
| **PermissionService**               | APZHUB-owned authorisation, roles, and provisioning — not BetterAuth (007, QEP-AD-016).                                                                                    |
| **Platform Service**                | Orchestration layer between modules and connectors; owns validation, permissions, audit, SoR writes, and event publication (009, 027).                                     |
| **Presentation layer**              | Shell, modules, and shared UI components; permission-filtered; no business logic (005, 003).                                                                               |
| **Read model**                      | Denormalised projection for queries, dashboards, QI, and reporting; built from events; non-authoritative (QEP-AD-011).                                                     |
| **Release readiness**               | Aggregated pre-certification snapshot; insufficient alone for certification — distinct workflow boundary.                                                                  |
| **Request context**                 | Token, correlation ID, tenant, org, workspace, locale, timezone — common envelope across gateway and services (010).                                                       |
| **Response envelope**               | Standard APZHUB API success/error shape; no raw engine errors to clients (010).                                                                                            |
| **Role translation**                | Mapping platform permissions to connector-internal roles — backend role names never in UI (007).                                                                           |
| **Search Provider**                 | QEP registration with Platform Search Service for a document type; index is derived (QEP-AD-021).                                                                          |
| **Self-host-first**                 | Architecture prioritises customer-operated deployment as reference topology (QEP-AD-019).                                                                                  |
| **Service Connector**               | Same as Connector / Integration Adapter — preferred term in 008.                                                                                                           |
| **Service extraction**              | Future separation of a logical service to independent deployable — requires ADR + Owner; enabled by QEP-AD-023 seams.                                                      |
| **SoR (System of Record)**          | Authoritative store for a domain; one SoR per datum; QEP owns listed quality domains (SYSTEM-OF-RECORD, QEP-AD-002).                                                       |
| **Superadmin**                      | Explicit permission tier for platform administration; audited; not a security bypass (007, 013).                                                                           |
| **Tenant**                          | Isolation boundary for all data, permissions, connectors, and events (QEP-AD-014).                                                                                         |
| **Traceability graph**              | Linked requirement → verification → execution → evidence → defect relationships; SoR in Traceability context.                                                              |
| **Verification**                    | Primary architecture noun for proof work — plans, procedures, sessions, runs, results (QEP-AD-009); supersedes "test case" in product language.                            |
| **Verification procedure**          | Reusable specification for proving a requirement; includes classical test case form — product term used in Verification context.                                           |
| **Verification session**            | Human-centred execution context for manual or guided verification — MVP-critical path.                                                                                     |
| **Workflow orchestration**          | Platform workflow capability coordinating human gates and async steps; no long-running work in HTTP handlers (012, WORKFLOW-ARCHITECTURE).                                 |
| **Zero Trust**                      | Verify identity, permission, integrity, intent, and context on every request — no trusted shortcuts (QEP-AD-022, 013).                                                     |

## Layer vocabulary (APZHUB 003)

| Layer           | QEP architecture role                                                |
| --------------- | -------------------------------------------------------------------- |
| Presentation    | Modules, shell regions, shared UI — permission-driven                |
| Application     | Module controllers, command routing — delegates to services          |
| Domain          | Business rules inside logical Platform Services                      |
| Services        | QEP Platform Services + shared platform services                     |
| Adapters        | Connectors to ALM, CI, runners, AI providers, storage                |
| Backend engines | External OSS or commercial systems — never authoritative for QEP SoR |

## Request path (canonical)

```text
Client / Module UI
  → APZHUB API Gateway
  → Auth (BetterAuth) → Authz (PermissionService) → Validation
  → QEP Platform Service
  → Connector (when external)
  → Engine (when external)
```

Forbidden: Module → Connector, Module → Engine, Service → Engine (skip connector).

## Product vs architecture term mapping

| Product term (glossary) | Architecture emphasis                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| Certification           | Human-gated SoR aggregate; evidence lock side effect                  |
| Evidence                | SoR aggregate; pack lock on cert approval                             |
| Quality Intelligence    | Read-model consumer; explainable; non-certifying                      |
| MCP                     | MCP Gateway pattern; tool registry; no SoR write without human accept |
| AI assistant / AI Agent | Disabled by default; draft outputs until human acceptance into SoR    |
| Workspace               | Shell composition — not a bounded context                             |
| Module                  | Presentation registration unit — maps to one or more bounded contexts |

## Usage rules

- Prefer **Verification** over "test case" in architecture documents except connector mapping notes.
- Use **Platform Service** not engine service names (`VerificationService`, not `JiraService`).
- Use **Connector** for adapter implementations; engine names are connector-internal only.
- **Certification** always implies named human accountability — never automation authority.
- Do not use architecture terms to imply physical database tables or API paths — deferred to Engineering.

## Related documents

| Document                                                                                                                   | Relationship                      |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| [../product-definition/PRODUCT-GLOSSARY.md](../product-definition/PRODUCT-GLOSSARY.md)                                     | Product-facing terms              |
| [ARCHITECTURE-DECISION-CATALOGUE.md](./ARCHITECTURE-DECISION-CATALOGUE.md)                                                 | Decisions referencing these terms |
| [BOUNDED-CONTEXTS.md](./BOUNDED-CONTEXTS.md)                                                                               | Context boundaries                |
| [docs/003-overall-system-architecture-design-principles.md](../../../003-overall-system-architecture-design-principles.md) | Platform layering                 |
