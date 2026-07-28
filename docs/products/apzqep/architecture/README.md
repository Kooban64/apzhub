# APZQEP-ARCH-001 — APZ QEP Enterprise Architecture Baseline

> **Programme:** APZQEP-ARCH-001  
> **Classification:** ENTERPRISE ARCHITECTURE  
> **Lifecycle:** Product Engineering  
> **Baseline:** APZQEP-DEF-002 (**ACCEPTED** — Product Definition contract)  
> **Upstream:** APZQEP-CONSTITUTION-001 (**ACCEPTED / CLOSED**) · APZQEP-REQ-001 · APZQEP-DISCOVERY-001  
> **Date:** 2026-07-24  
> **Rule:** Enterprise Architecture only — no Engineering, ADRs, schema, APIs, UI implementation, or code

## Status

| Field | Value |
| ----- | ----- |
| **Programme** | APZQEP-ARCH-001 |
| **Status** | **ACCEPTED** |
| **Baseline version** | 1.0.0-arch |
| **Product baseline** | APZQEP-DEF-002 (1.0.0-def expanded) |
| **Platform alignment** | APZHUB 1.4 **CERTIFIED** · Layered architecture (003) · Module SDK (025) · Platform Service SDK (027) |

## Purpose

This pack establishes the **Enterprise Architecture Baseline** for **APZ QEP** (APZ Quality Engineering Platform) — the authoritative architectural contract between Product Definition and Engineering. It describes business capabilities, application structure, domain boundaries, bounded contexts, and information ownership at enterprise level without prescribing implementation.

Architects and engineers must treat this pack as the **sole architecture authority** for QEP until Owner Architecture Acceptance. Product behaviour originates in APZQEP-DEF-002; this pack translates that behaviour into structural architecture aligned with APZHUB platform foundations.

## Central outcome

Every architectural decision in this pack supports answering one product question:

> **Can this software be released with sufficient confidence?**

Architecture enables a **closed quality loop**: approved requirements → verification design → execution → evidence → defects/risk → traceability → release readiness → **human certification** → learning — without making QEP an ALM, CI orchestrator, or automation runner.

---

## Pack index

| # | Document | Purpose |
| - | -------- | ------- |
| 1 | [README.md](./README.md) | Pack control, status, principles, stop conditions |
| 2 | [ENTERPRISE-ARCHITECTURE.md](./ENTERPRISE-ARCHITECTURE.md) | Overall EA overview, views, layering, modular monolith posture |
| 3 | [BUSINESS-ARCHITECTURE.md](./BUSINESS-ARCHITECTURE.md) | Business capabilities, value streams, ownership, external actors |
| 4 | [APPLICATION-ARCHITECTURE.md](./APPLICATION-ARCHITECTURE.md) | Logical services, orchestration, alignment to 22 product modules |
| 5 | [DOMAIN-ARCHITECTURE.md](./DOMAIN-ARCHITECTURE.md) | Major domain purposes, responsibilities, events, dependencies |
| 6 | [BOUNDED-CONTEXTS.md](./BOUNDED-CONTEXTS.md) | Context map, relationships, anti-corruption boundaries |
| 7 | [INFORMATION-ARCHITECTURE.md](./INFORMATION-ARCHITECTURE.md) | SoR ownership, flows, consistency, read models, master data |
| 8 | [INTEGRATION-ARCHITECTURE.md](./INTEGRATION-ARCHITECTURE.md) | REST, events, webhooks, MCP, batch, import/export, streaming |
| 9 | [API-ARCHITECTURE.md](./API-ARCHITECTURE.md) | API principles, categories, versioning, governance — no endpoints |
| 10 | [EVENT-ARCHITECTURE.md](./EVENT-ARCHITECTURE.md) | Business events, ownership, publishers/subscribers, governance |
| 11 | [SECURITY-ARCHITECTURE.md](./SECURITY-ARCHITECTURE.md) | Zero Trust, secrets, encryption, threat boundaries, compliance |
| 12 | [IDENTITY-ARCHITECTURE.md](./IDENTITY-ARCHITECTURE.md) | Users, tenants, service/machine identities, federation, sessions |
| 13 | [AUTHORISATION-ARCHITECTURE.md](./AUTHORISATION-ARCHITECTURE.md) | PermissionService, roles, cert authorities, AI/MCP gates |
| 14 | [AI-ARCHITECTURE.md](./AI-ARCHITECTURE.md) | Provider abstraction, prompts, governance, human approval |
| 15 | [MCP-ARCHITECTURE.md](./MCP-ARCHITECTURE.md) | MCP gateway, tool registry, IDE clients, audit |
| 16 | [SEARCH-ARCHITECTURE.md](./SEARCH-ARCHITECTURE.md) | Platform Search consumption; derived index not SoR |
| 17 | [WORKFLOW-ARCHITECTURE.md](./WORKFLOW-ARCHITECTURE.md) | QE lifecycle orchestration; human gates; async jobs |
| 18 | [REPORTING-ARCHITECTURE.md](./REPORTING-ARCHITECTURE.md) | Analytics planes, cert packs, exports, explainability |
| 19 | [NOTIFICATION-ARCHITECTURE.md](./NOTIFICATION-ARCHITECTURE.md) | Platform Attention Engine; events not product-local notify |
| 20 | [OBSERVABILITY-ARCHITECTURE.md](./OBSERVABILITY-ARCHITECTURE.md) | Logs, metrics, traces, health, alerting, audit |
| 21 | [DEPLOYMENT-ARCHITECTURE.md](./DEPLOYMENT-ARCHITECTURE.md) | Self-hosted, cloud, hybrid, air-gapped, HA, DR |
| 22 | [TECHNOLOGY-STANDARDS.md](./TECHNOLOGY-STANDARDS.md) | Approved technology constraints (no implementation) |
| 23 | [ARCHITECTURE-DECISION-CATALOGUE.md](./ARCHITECTURE-DECISION-CATALOGUE.md) | Architecture-level decisions (QEP-AD-*) |
| 24 | [ARCHITECTURE-GLOSSARY.md](./ARCHITECTURE-GLOSSARY.md) | Architecture terminology |
| 25 | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) | Programme completion and confirmations |
| 26 | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) | **ACCEPTED** |

**Total:** 26 deliverables in this pack.

### Related architecture programmes

| Programme | Pack | Status |
| --------- | ---- | ------ |
| **APZQEP-ARCH-005** | [requirements-relationship/](./requirements-relationship/README.md) | Requirements Relationship Architecture — **ACCEPTED / CLOSED / COMPLETE** (Authoritative) · ENG-020F Phase **PLANNING** · Implementation **AUTHORISED TO BEGIN** |
| **APZQEP-ARCH-009** | [verification/](./verification/README.md) | Verification Capability Architecture — **ACCEPTED** |
| **APZQEP-ARCH-010** | [verification-workbench/](./verification-workbench/README.md) | Verification Workbench Architecture — **ACCEPTED / CLOSED / COMPLETE** |
| **APZQEP-ARCH-011** | [test-specifications/](./test-specifications/README.md) | Test Specifications Capability Architecture — **ACCEPTED** |

---

## Authority hierarchy

```text
APZHUB Constitution (000) + Foundation (001–029)
  → APZQEP Constitution (ACCEPTED / CLOSED)
    → APZQEP Requirements + Discovery (ACCEPTED)
      → APZQEP-DEF-002 Product Definition (ACCEPTED)
        → APZQEP-ARCH-001 Enterprise Architecture (this pack) ACCEPTED
          → APZQEP-PLAN-001 Engineering Plan (active)
            → APZQEP-ENG-010 Repository Bootstrap (after Plan Acceptance)
```

On conflict: APZHUB Constitution wins; then QEP Constitution; then Product Definition; then this Architecture pack. Engineering artefacts must not contradict accepted upstream documents.

---

## Architectural principles

These principles are **mandatory** for all QEP architecture and downstream Engineering.

| # | Principle | Architectural meaning |
| - | --------- | --------------------- |
| P1 | **Verification-first** | *Verification* is the primary product concept; classical test cases are one procedure form. Architecture centres on verification lifecycle, not runner or ALM metaphors. |
| P2 | **QEP SoR for quality domains** | QEP is authoritative for quality-relevant requirements, verification, evidence, certification, quality metrics/intelligence, audit, and traceability. ALM, CI, and runners are adjacent — never authoritative for these domains. |
| P3 | **Platform-first** | Modules call Platform Services only. Services call Connectors. Connectors call Engines. No layer bypass (003, 008, 009). |
| P4 | **Modular monolith first** | Initial delivery is a cohesive modular monolith with clear module and service boundaries. Boundaries are **extraction-ready** — not premature microservices. |
| P5 | **Service extraction ready** | Each logical service owns a bounded context with explicit interfaces and events. Future extraction must not require product behaviour change. |
| P6 | **Zero Trust** | Verify identity, permission, integrity, intent, and context on every interaction (013). No trust by network location or UI visibility alone. |
| P7 | **Self-host-first** | Architecture assumes self-hosted OSS deployment on APZHUB stack. Cloud SaaS is a packaging variant, not a different architecture. |
| P8 | **Human certification mandatory** | Certification decisions are human-accountable and immutable. Readiness and intelligence **prepare** certification; they never replace it. |
| P9 | **Evidence before opinion** | Readiness, reporting, and intelligence consume evidence-linked facts. Architecture prevents claims without evidence lineage. |
| P10 | **AI governed — default OFF** | AI and MCP are optional assist layers. AI never writes SoR silently; never certifies; never bypasses approval queues. |
| P11 | **Manual-first viable** | MVP architecture delivers full value without automation ingest, AI, or MCP enabled. |
| P12 | **Events for cross-cutting** | Audit, search, notifications, and activity are platform-owned. Modules and services publish events; they do not implement parallel subsystems. |
| P13 | **Permission-driven surfaces** | UI and API visibility derive from PermissionService; server is authoritative (005, 007). |
| P14 | **Correlation end-to-end** | Quality workflows carry correlation identifiers across modules, services, connectors, and audit (010, 012). |

---

## Alignment with APZHUB layered architecture

QEP conforms to the mandatory APZHUB layer model:

```text
Presentation (QEP Modules / Shell)
  → Application (QEP orchestration, use cases)
    → Domain (QEP business rules, aggregates)
      → Services (Platform Services — QEP + shared)
        → Adapters (Connectors — ALM, CI, AI, storage)
          → Backend Engines (external systems)
```

QEP modules are **presentation and module registration** on APZHUB shell. QEP business logic lives in **Platform Services** scoped to the product. Connectors translate external systems; they do not own SoR truth.

---

## Relationship to 22 product modules

APZQEP-DEF-002 defines **22 product modules** (M01–M22). This architecture pack maps each module to:

- One or more **business capabilities** (Business Architecture)
- One or more **logical application services** (Application Architecture)
- One **primary bounded context** (Bounded Contexts)
- **Domain responsibilities** and **information ownership** (Domain + Information Architecture)

Module identifiers and behaviour are **preserved** from Definition. Architecture may refine internal service decomposition but must not alter product-visible behaviour without Owner amendment.

---

## Architectural views provided

| View | Document | Audience |
| ---- | -------- | -------- |
| Enterprise overview | ENTERPRISE-ARCHITECTURE.md | Executives, enterprise architects, product leadership |
| Business | BUSINESS-ARCHITECTURE.md | Product owners, programme managers, compliance |
| Application | APPLICATION-ARCHITECTURE.md | Solution architects, lead engineers |
| Domain / contexts | DOMAIN-ARCHITECTURE.md · BOUNDED-CONTEXTS.md | Domain modellers, service owners |
| Information | INFORMATION-ARCHITECTURE.md | Data architects, auditors |
| Integration / API / Events | INTEGRATION · API · EVENT | Integration architects |
| Security / Identity / Authz | SECURITY · IDENTITY · AUTHORISATION | Security architects |
| AI / MCP | AI-ARCHITECTURE · MCP-ARCHITECTURE | AI platform architects |
| Cross-cutting | SEARCH · WORKFLOW · REPORTING · NOTIFICATION · OBSERVABILITY | Platform architects |
| Deployment / Technology | DEPLOYMENT · TECHNOLOGY-STANDARDS | Ops / platform engineering leadership |
| Decisions | ARCHITECTURE-DECISION-CATALOGUE.md | Architecture review board |

---

## Explicit exclusions (this programme)

The following are **out of scope** for APZQEP-ARCH-001 and **must not** appear in this pack or be inferred as approved:

| Excluded | Authorised in |
| -------- | ------------- |
| Source code, packages, repositories | APZQEP-ENG-010+ (after Plan Acceptance) |
| Database schemas, migrations, ERD physical models | APZQEP-ENG-010+ |
| REST/GraphQL paths, OpenAPI, protobuf contracts | Named Engineering programmes |
| ADRs with technology selections | Named Engineering programmes |
| UI mock-ups, component implementation | Named Engineering programmes |
| CI/CD pipeline design for QEP product | APZQEP-ENG-010+ |
| Infrastructure sizing and Terraform | Platform / Engineering programmes |

---

## Upstream references

| Document | Relationship |
| -------- | ------------ |
| [Product Definition](../product-definition/README.md) | Behavioural contract — modules, workflows, models |
| [Constitution](../constitution/README.md) | Guardrails, SoR rules, AI/Certification/Security constitutions |
| [Requirements](../requirements/README.md) | Traced requirements baseline |
| [MODULE-ARCHITECTURE.md](../MODULE-ARCHITECTURE.md) | Conceptual predecessor — superseded by this pack for architecture |
| APZHUB docs 000–029 | Platform mandatory standards |

---

## Downstream

| Programme | Prerequisite |
| --------- | ------------ |
| **APZQEP-PLAN-001** | Architecture **ACCEPTED** (this pack) — Engineering Planning |
| **APZQEP-ENG-010** | Owner **Engineering Plan Acceptance** |
| ADRs / schema / API design | Named Engineering programmes after Plan Acceptance |
| Platform 2.0 changes | Separate platform approval |

---

## STOP — Architecture pack closed

```text
┌─────────────────────────────────────────────────────────────────┐
│  APZQEP-ARCH-001 ACCEPTED                                       │
│                                                                 │
│  Active programme: APZQEP-PLAN-001 (Engineering Planning).      │
│  DO NOT begin APZQEP-ENG-010 or production code until Plan      │
│  Acceptance is recorded.                                        │
└─────────────────────────────────────────────────────────────────┘
```

| Gate | Condition |
| ---- | --------- |
| **Entry** | APZQEP-DEF-002 accepted as product contract |
| **Exit** | Owner Architecture Acceptance recorded — **COMPLETE** |
| **Blocked until Plan Acceptance** | APZQEP-ENG-010, production code, repository bootstrap |

---

## Acceptance criteria (Owner)

Owner Architecture Acceptance confirms:

1. All seven pack documents complete and internally consistent.
2. Principles P1–P14 reflected across views without contradiction to DEF-002 or Constitution.
3. Twenty-two modules mapped to capabilities, services, contexts, and information ownership.
4. Bounded context map covers all listed contexts with explicit SoR and integration boundaries.
5. No implementation artefacts introduced.
6. Stop condition understood: Engineering awaits separate authorisation.

---

## Related documents

| Document | Path |
| -------- | ---- |
| Owner Acceptance (Architecture) | OWNER-ACCEPTANCE.md *(to be added on Acceptance workflow)* |
| Completion Report | COMPLETION-REPORT.md *(to be added on programme close)* |
| Product Definition pack | [../product-definition/](../product-definition/README.md) |

---

## Document control

| Version | Date | Change |
| ------- | ---- | ------ |
| 1.0.0-arch | 2026-07-24 | Initial Enterprise Architecture Baseline — APZQEP-ARCH-001 |
