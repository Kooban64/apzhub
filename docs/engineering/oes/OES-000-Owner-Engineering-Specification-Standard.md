# APZOR Engineering Standard  
# OES-000 — Owner Engineering Specification Standard

| Item | Value |
| ---- | ----- |
| Document | **OES-000** |
| Title | Owner Engineering Specification Standard |
| Classification | **APZOR Engineering Constitution (Programme Methodology)** |
| Organisation | APZOR |
| Owner | APZOR Engineering / Programme Owner |
| Status | **ACCEPTED / APPROVED / FROZEN** |
| Version | **1.0.0** (frozen) |
| Acceptance | [OES-000-OWNER-ACCEPTANCE.md](./OES-000-OWNER-ACCEPTANCE.md) · `20260726T233500Z-OES-000-ACCEPTANCE.json` |
| Applies to | APZ QEP · APZHUB · ZFConnect · Accord · future APZOR platforms |
| Related | [Document 000](../../000-apzhub-engineering-constitution.md) · [OES-001](./OES-001-Engineering-Writing-Standard.md) · [Platform Delivery Standard](../platform-delivery/PLATFORM-DELIVERY-STANDARD.md) · [AI Governance](../../governance/AI-GOVERNANCE.md) |

---

## 1. Purpose

This document is the **governing engineering standard** for how APZOR specifies, authorises, delivers, certifies, freezes, and maintains software capabilities.

It freezes the methodology learned across APZHUB, APZ QEP, Integration SDK, certification, and Owner Acceptance into a single, reusable standard.

OES-000 answers:

- What is an Owner Engineering Specification (OES)?
- When is an OES required?
- What lifecycle must every capability follow?
- Which decisions belong in Architecture vs Domain vs Infrastructure vs Presentation?
- What is the role of the Owner?
- What constitutes Acceptance, Certification, Freeze, and Version Promotion?
- What quality gates and documentation are mandatory?
- How AI tools participate — and what they must **never** decide?

**OES-000 is not a capability design.** Capability designs are separate OES documents that **apply** this standard.

---

## 2. Authority and hierarchy

```text
Document 000 / Product Constitution     → platform & repository architecture
        ↓
OES-000                                  → engineering methodology (FROZEN)
        ↓
OES-001                                  → engineering writing standard
        ↓
Capability OES documents                 → programme design / delivery contract
        ↓
Owner Acceptance → Implementation → Certification → Freeze
```

### 2.1 Relationship to Document 000

| Concern | Authority |
| ------- | --------- |
| APZHUB layered architecture, technology stack, module/service/connector rules | **Document 000** (supreme) |
| How Owner Engineering programmes are specified, gated, accepted, certified, and frozen across APZOR products | **OES-000** (supreme for programme methodology) |
| How OES documents are written (language, RFC 2119, structure, cross-refs) | **OES-001** |

On conflict about **platform architecture or stack**, Document 000 wins.  
On conflict about **programme methodology, OES structure, or Owner gates**, OES-000 wins for APZOR engineering programmes.

**OES-000 is FROZEN.** Amendments require a formal change programme (revision of OES-000 under Owner Instruction, companion standard such as [OES-001](./OES-001-Engineering-Writing-Standard.md), or an ADR). Ad hoc edits are prohibited.

### 2.2 Relationship to Platform Delivery Standard

[Platform Delivery Standard](../platform-delivery/PLATFORM-DELIVERY-STANDARD.md) remains the accepted APZHUB platform capability delivery companion. OES-000 **generalises and extends** that practice for all APZOR products and for the full capability life (including Workbench Architecture as a distinct phase, Operational Readiness, Version Promotion, Freeze, and Maintenance).

Where a product-specific OES is silent, OES-000 applies.

---

## 3. What is an OES?

An **Owner Engineering Specification (OES)** is a permanent, versioned engineering standard that defines **exactly** what a programme must design or deliver — before implementation begins (for architecture / design OES) or as the authoritative contract for an engineering programme (for ENG / CERT OES).

An OES is:

- Owner-authored or Owner-authorised
- Repository-resident (not chat history)
- Structured in numbered Parts
- Complete before implementation (for design OES)
- The baseline against which Acceptance is judged

An OES is **not**:

- A Cursor prompt
- A disposable chat instruction
- An implementation guide written after the fact
- A substitute for Document 000 or product Constitutions

### 3.1 Document identity

```text
{PRODUCT}-OES-{CLASS}-{NNN}[suffix]

Examples:
  OES-000                                          → APZOR methodology standard
  APZQEP-OES-ARCH-012                              → APZ QEP architecture OES
  APZQEP-OES-ENG-050A                              → APZ QEP domain engineering OES
  APZHUB-OES-ENG-00xx                              → APZHUB engineering OES
```

| Class | Meaning |
| ----- | ------- |
| `ARCH` | Architecture / design — documentation only; no production UI/code unless Owner says otherwise |
| `ENG` | Engineering implementation programme |
| `CERT` | Capability certification programme |
| `OR` | Operational readiness programme |
| `STD` | Cross-cutting standard (reserved; OES-000 uses bare id) |

---

## 4. When an OES is required

An OES is **mandatory** before:

| Trigger | Minimum OES |
| ------- | ----------- |
| New business capability | Capability Architecture OES |
| Domain model work | Domain Engineering OES (or Architecture OES that explicitly includes Domain) |
| Persistence / APIs / platform integration | Infrastructure Engineering OES |
| Any Workbench / presentation UI | **Presentation / Workbench Architecture OES** (complete) before Workbench Engineering |
| Certification claim | Certification OES |
| Breaking change to a frozen capability | Future Change Programme OES |

**Exception:** Trivial maintenance under an existing Freeze may proceed under Maintenance rules (Section 11) without a new Architecture OES — never for new capability surfaces.

---

## 5. Permanent APZOR capability lifecycle

Every durable capability follows this life — not only its first build:

```text
Engineering Standard (OES-000)
        ↓
Capability Architecture
        ↓
Domain Engineering
        ↓
Infrastructure Engineering
        ↓
Presentation / Workbench Architecture
        ↓
Presentation / Workbench Engineering
        ↓
Operational Readiness Review
        ↓
Capability Certification
        ↓
Version Promotion
        ↓
Freeze
        ↓
Maintenance
        ↓
Future Change Programme  → (re-enter at the appropriate phase)
```

### 5.1 Phase ownership

| Phase | Owns | Does not own |
| ----- | ---- | ------------ |
| Capability Architecture | Boundaries, aggregates, lifecycle, governance, non-goals | Code, UI, persistence |
| Domain Engineering | Business rules, invariants, domain events, pure policies | Persistence, REST, UI |
| Infrastructure Engineering | Repositories, APIs, transactions, search/audit/permission integration | Business rules, Workbench UI |
| Presentation / Workbench Architecture | Screens, navigation, UX contracts, a11y, deep links | React/Next implementation, business rules |
| Presentation / Workbench Engineering | UI implementation against accepted Workbench Architecture + REST | New business rules, new persistence |
| Operational Readiness | Runbooks, health, ops evidence, go-live checks | Feature invention |
| Capability Certification | Evidence that the capability meets its OES / DoD | Redesign |
| Version Promotion | SemVer / baseline promotion decision | Silent unfreeze |
| Freeze | Immutability of certified baseline | Ongoing feature delivery |
| Maintenance | Defects, security patches within Freeze rules | Scope expansion |
| Future Change Programme | Authorised evolution | Bypass of Architecture / Acceptance |

### 5.2 Hard sequencing rules

1. Domain must not begin until Capability Architecture is **Accepted** (or Owner explicitly combines them).
2. Infrastructure must not begin until Domain is **Accepted**.
3. Workbench Engineering must not begin until **both** Infrastructure is **Accepted** and Workbench Architecture OES is **complete and Accepted**.
4. Certification must not begin until Operational Readiness Review criteria are met (or Owner waives with recorded conditions).
5. Freeze requires Certification **Accepted**.
6. AI must not skip phases “to save time.”

---

## 6. Layer decision rules

| Decision class | Belongs in | Forbidden in |
| -------------- | ---------- | ------------ |
| Business invariants, lifecycle legality | Domain | Infrastructure, Workbench |
| Persistence schema, concurrency, tenancy | Infrastructure | Domain, Workbench |
| availableActions, DTO projection | Infrastructure / contracts | Workbench (render only) |
| Screen layout, navigation, explorer, inspector | Workbench Architecture → Engineering | Domain |
| Permission *checks* | Infrastructure / Platform Authz | Workbench inventing grants |
| Permission *catalogue additions* | Owner-authorised programme | Silent AI addition |
| Search indexing hooks | Infrastructure | Workbench owning search engines |
| Audit emission | Infrastructure / Platform Audit | Modules inventing audit stores |

**Principle:** The Workbench never owns business rules and never bypasses REST. The server remains authoritative. The Workbench is optimistic and state-driven via `availableActions`.

---

## 7. Role of the Owner

The **Programme Owner** (APZOR Owner / delegated Owner):

| Duty | Owner |
| ---- | ----- |
| Authorise programmes and OES | ✅ |
| Accept Architecture / Domain / Infrastructure / Workbench Architecture / Workbench Engineering / OR / Certification | ✅ |
| Decide Freeze and Version Promotion | ✅ |
| Amend OES-000 | ✅ |
| Delegate day-to-day implementation review | May delegate; Acceptance remains Owner |
| Override AI recommendations | ✅ always |

No Acceptance, Certification, Freeze, or Version Promotion is valid without Owner Decision recorded in the repository (acceptance evidence JSON and/or OWNER-ACCEPTANCE.md).

---

## 8. Acceptance, Certification, Freeze, Version Promotion

### 8.1 Acceptance

**Acceptance** means the Owner confirms a programme deliverable meets its OES / instruction and is closed for that phase.

Required evidence (minimum):

- OWNER-ACCEPTANCE.md (or equivalent)
- Portfolio evidence JSON under `docs/operations/evidence/`
- Traceable pack paths
- Explicit STOP / next gate

Acceptance of phase N does **not** authorise phase N+1 unless the Acceptance record or a new Owner Instruction says so.

### 8.2 Certification

**Certification** is a distinct programme that proves a capability (or platform vertical) meets its Definition of Done, quality gates, and operational claims for a named SemVer.

Certification produces a class (e.g. PRODUCTION_READY_WITH_LIMITATIONS) and evidence. It does not redesign the capability.

### 8.3 Version Promotion

**Version Promotion** is the Owner decision to advance the commercial / capability SemVer baseline (e.g. 0.2.0 → 1.0.0) after Certification criteria are met.

AI may recommend Version Promotion. AI must never silently promote versions.

### 8.4 Freeze

**Freeze** means the certified baseline is immutable except via Maintenance rules or a Future Change Programme.

AI must **never** decide a Freeze, unfreeze a baseline, or “helpfully” modify frozen packages outside an authorised programme.

---

## 9. Mandatory quality gates

Every ENG / CERT programme must satisfy gates appropriate to its phase. Minimum permanent gates:

| Gate | Architecture OES | Domain | Infrastructure | Workbench Eng | Certification |
| ---- | ---------------- | ------ | -------------- | ------------- | ------------- |
| Architecture compliance (001–029 / product ARCH) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Domain purity (no infra in domain) | — | ✅ | ✅ | ✅ | ✅ |
| No Workbench in Domain/Infra programmes | ✅ | ✅ | ✅ | — | ✅ |
| Tests + coverage targets in OES | — | ✅ | ✅ | ✅ | ✅ |
| Typecheck / lint / CI | — | ✅ | ✅ | ✅ | ✅ |
| Docs pack complete | ✅ | ✅ | ✅ | ✅ | ✅ |
| Owner Acceptance record | ✅ | ✅ | ✅ | ✅ | ✅ |
| Accessibility (WCAG AA) for UI | Design req. | — | — | ✅ | ✅ |
| Security / least privilege | Design req. | ✅ | ✅ | ✅ | ✅ |

Numeric coverage targets are set per ENG OES (typical APZ QEP: ≥95% lines/functions, ≥90% branches for domain/infra packages).

---

## 10. Mandatory documentation

### 10.1 OES pack shape (design / architecture)

Architecture and Workbench Architecture OES documents are written in Parts. Recommended default:

| Part | Contents |
| ---- | -------- |
| Part 1 | Executive summary, objectives, context, principles, constraints, non-goals |
| Part 2 | Information architecture, navigation, explorer, search |
| Part 3 | Inspector, editors, relationships, version comparison |
| Part 4 | Dashboards, review/lifecycle UX, accessibility |
| Part 5 | Performance, security, AI/MCP boundaries, deliverables, acceptance criteria |

Products may adjust Part titles when the capability has no UI (e.g. Domain OES Parts map to Aggregate / Lifecycle / Policies / Events / Services).

### 10.2 Repository layout

```text
docs/engineering/oes/
├── README.md
├── OES-000-Owner-Engineering-Specification-Standard.md
├── OES-001-Engineering-Writing-Standard.md
└── {PRODUCT}/
    ├── README.md
    └── OES-{CLASS}-{NNN}-{Short-Title}/
        ├── README.md
        ├── PART-01-….md
        ├── PART-02-….md
        ├── …
        ├── APPENDIX-A-….md
        ├── …
        └── COMPLETE.md          ← authoritative assembly for implementation
```

Working Parts and Appendices are editable during authoring. **`COMPLETE.md`** is the single authoritative document presented for Owner Review and Cursor implementation (assembled when all Parts are ready). Writing rules: [OES-001](./OES-001-Engineering-Writing-Standard.md).

Capability implementation packs remain under `docs/products/...` (or product trees). The OES is the **specification authority**; product packs are the **delivery evidence**.

### 10.3 Compulsory artefacts at programme close

| Artefact | Required |
| -------- | -------- |
| OES (complete for design programmes) | ✅ |
| Completion report | ✅ |
| Owner Acceptance record | ✅ |
| Evidence JSON | ✅ |
| Governance pointer updates (CURRENT-MILESTONE, etc.) | ✅ |

---

## 11. Maintenance and Future Change

### 11.1 Maintenance (within Freeze)

Allowed without new Architecture OES:

- Defect fixes that restore specified behaviour
- Security patches
- Dependency updates that do not change contracts
- Documentation corrections

Not allowed under Maintenance:

- New screens, endpoints, or aggregates
- Behavioural expansion
- Permission model changes
- Unfreeze / SemVer major promotion

### 11.2 Future Change Programme

Any scope beyond Maintenance requires a new Owner-authorised OES that re-enters the lifecycle at the correct phase (often Architecture or Domain).

---

## 12. AI governance (engineering programmes)

### 12.1 Authority matrix

| Role | Human Owner | AI (Cursor / agents) |
| ---- | ----------- | -------------------- |
| Product Vision | ✅ Decide | Advisory only |
| Architecture Approval | ✅ Decide | Recommend |
| OES authorship | ✅ Authorise / Accept | Draft / assist under Owner direction |
| Engineering Implementation | Review / Accept | ✅ Implement within accepted OES |
| Coding Standards | ✅ Define | Apply |
| Test evidence | Review | Produce |
| Certification Decision | ✅ Decide | Evidence only |
| Version Promotion | ✅ Decide | Recommend |
| Freeze | ✅ Decide | **Never decide** |
| Unfreeze / scope expansion | ✅ Decide | **Never decide** |
| Secrets handling | ✅ Accountable | Never invent or commit secrets |

### 12.2 AI operating rules

1. **Repository-first** — bootstrap from AI-MANIFEST and accepted OES packs; chat is not authority.
2. **OES-complete for design** — do not implement Workbench (or other design-gated work) from partial Parts.
3. **One complete OES → one implementation pass** — prefer a single complete specification over fragmented prompts.
4. **STOP conditions are binding** — AI must stop when the OES / instruction says STOP.
5. **Frozen baselines are sacred** — AI must not modify CERTIFIED / FROZEN packages without an authorised Change Programme.
6. **Honesty** — AI must not invent Acceptance, Certification, or Production claims.
7. **Decisions reserved to Owner** remain reserved even if AI is “confident.”

### 12.3 Decisions that must never be delegated to AI

- Owner Acceptance
- Certification class
- Freeze / unfreeze
- Version Promotion
- Product vision and capability prioritisation
- Waiving security, tenancy, or audit requirements
- Expanding programme scope beyond the OES

---

## 13. OES template skeleton (normative outline)

Every capability OES SHALL open with Document Information and SHALL include, as applicable to its class:

1. Executive Summary  
2. Programme Objective  
3. Business Context  
4. Architectural / Engineering Principles  
5. Dependencies and Baselines  
6. Capability Boundaries (owns / does not own)  
7. Explicit Non-Goals  
8. Body Parts (IA, Domain, Infra, UX, etc.)  
9. Quality Gates  
10. Deliverables  
11. Acceptance Criteria  
12. STOP Condition / Next Gate  

Tone: engineering standard — not marketing, not a prompt.

---

## 14. First application

The first capability OES written under this standard is:

**[APZQEP-OES-ARCH-012 — Test Specifications Workbench Architecture](./APZQEP/OES-ARCH-012-Test-Specifications-Workbench-Architecture/README.md)** — **ACCEPTED / ARCHITECTURE BASELINED**.

Next capability OES under this standard: **[APZQEP-OES-ENG-050C](./APZQEP/OES-ENG-050C-Test-Specifications-Workbench-Engineering/COMPLETE.md)** — Ready for Owner Review (implementation gated on Acceptance).

---

## 15. Success criteria for OES-000

OES-000 succeeds when:

1. Every new APZOR engineering programme cites OES-000.
2. Every design programme produces a complete OES before coding.
3. AI agents refuse out-of-phase implementation.
4. Acceptance, Certification, Freeze, and Version Promotion remain Owner decisions with repository evidence.
5. APZ QEP, APZHUB, ZFConnect, Accord, and future platforms share one methodology.

---

## 16. STOP

```text
OES-000
ACCEPTED
APPROVED
FROZEN
```

OES-000 is frozen (1.0.0). Methodology changes require formal change control and semantic versioning.  
Governance companions: **OES-001** / **OES-002** (both **FROZEN 1.0.0**).  
**Do not** begin APZQEP Workbench implementation until **APZQEP-OES-ENG-050C** is Owner-Accepted.
