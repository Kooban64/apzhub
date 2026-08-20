# Product Requirements Document — APZ QEP

| Field               | Value                                                                       |
| ------------------- | --------------------------------------------------------------------------- |
| **Product**         | APZ QEP (APZ Quality Engineering Platform)                                  |
| **Product ID**      | `apzqep`                                                                    |
| **Category**        | Enterprise Quality Engineering Platform                                     |
| **Former name**     | APZ TCMS (historical only)                                                  |
| **Document type**   | PRD (executive / delivery summary)                                          |
| **Authority**       | Derived from APZQEP-DEF-002 Product Definition Baseline (**ACCEPTED**)      |
| **Constitution**    | APZQEP-CONSTITUTION-001 (**ACCEPTED / CLOSED**)                             |
| **Platform**        | Native APZHUB product (Module → Platform Service → Connector → Engine)      |
| **Commercial SKUs** | APZQEP Engineer · APZQEP Collaborator (Price Book v1.0)                     |
| **Status**          | Product definition accepted; architecture / implementation gated separately |

> **Authority note:** This PRD summarises the accepted product contract for planning and stakeholder alignment. Normative detail lives in [`product-definition/`](./product-definition/). On conflict, Constitution → Product Definition pack → this PRD.

---

## 1. Problem

Enterprises cannot reliably answer whether software is safe to release. Quality evidence is scattered across ALM tools, spreadsheets, CI logs, chat, and personal knowledge. Testing tools often optimise for case execution or automation runs, not for governed confidence: approved requirements, verification coverage, evidence integrity, risk, release gates, and a named human certification decision with an immutable audit trail.

## 2. Solution

APZ QEP is the **System of Record** for quality-relevant requirements, verification, evidence, certification, quality metrics/intelligence, audit, and traceability. Testing is one capability inside a broader quality governance mission — not the product identity.

### Central outcome

> **Can this software be released with sufficient confidence?**

The answer is composed from governed information: approved requirements, verification coverage, execution results, open defects, risk exposure, evidence completeness, approval status, compliance obligations, release gates, certification history, and human accountability.

### Philosophy (normative)

Quality before Testing · Verification before Execution · Evidence before Opinion · Certification before Release · Knowledge before Automation · Governance before Convenience · Security by Design · Platform-first · API-first · AI assists Humans · Humans remain Accountable · Everything Traceable / Auditable / Explainable / Measurable · Enterprise-first · Standards over Shortcuts.

---

## 3. Goals and non-goals

### Goals

| ID  | Goal                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| G-1 | Deliver a commercially credible **end-to-end quality lifecycle** from requirement approval through human certification                           |
| G-2 | Make **manual verification** first-class (structured + exploratory), not a second-class path behind automation or AI                             |
| G-3 | Establish QEP as SoR for requirements (quality-relevant), verification, evidence packs, certification decisions, quality audit, and traceability |
| G-4 | Support release readiness gates and a **named accountable human** certification decision with locked evidence                                    |
| G-5 | Integrate with ALM / SCM / CI / runners via Platform Services — govern and ingest; do not become those systems                                   |
| G-6 | Keep AI and advanced MCP **default OFF**; assistants draft under human gates; never auto-certify                                                 |

### Non-goals

| ID   | Non-goal                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------ |
| NG-1 | Not an ALM, project-management, SCM, CI/CD, device cloud, generic DMS, or observability suite                            |
| NG-2 | Not an automation **runner** — QEP governs and ingests results; runners execute externally                               |
| NG-3 | Not a general-purpose AI chatbot; AI Quality Workspace is governed and gated                                             |
| NG-4 | MVP does not require AI runtime, advanced MCP write tools, continuous certification modes, marketplace, or full ALM sync |

---

## 4. Users and personas

**21 personas** are defined in the Product Definition pack (executive, product/delivery, QA manual/exploratory/automation, development, release/ops, security, compliance, audit, customer, integrator, administrator, constrained AI agent).

### MVP primary path (must work)

| Persona                          | Role in MVP                     |
| -------------------------------- | ------------------------------- |
| Release Manager                  | Primary certifier               |
| QA Engineer                      | Manual verification execution   |
| Business Analyst / Product Owner | Requirements approve / baseline |
| Developer                        | Defect / retest cycle           |
| Administrator                    | Tenancy / RBAC                  |

Full persona tables: [`product-definition/PERSONAS.md`](./product-definition/PERSONAS.md).

---

## 5. Product scope

### 5.1 Quality information flow

```text
Business objective → Requirement → Requirement approval → Verification design
  → Verification approval → Execution planning → Manual / Automated / Hybrid / Continuous
  → Evidence → Result evaluation → Defect / Risk → Retest → Release readiness
  → Certification review → Human certification decision → Release
  → Operational learning → Knowledge reuse → Continuous improvement
```

### 5.2 Product modules (22 areas)

Home / Command Centre · Portfolio / Projects · Requirements · Verification Library · Verification Design · Execution and Sessions · Automation Management · Defects · Evidence · Traceability · Risk · Release Readiness · Certification · Quality Intelligence · Reporting · Knowledge · AI Quality Workspace · MCP / DX · Integration Centre · Administration · Audit / Compliance · Search / Navigation

Catalogue: [`product-definition/MODULE-CATALOGUE.md`](./product-definition/MODULE-CATALOGUE.md).

### 5.3 Verification methods

| Method      | Role                                     | MVP               |
| ----------- | ---------------------------------------- | ----------------- |
| Manual      | First-class structured + exploratory     | **Required**      |
| Automated   | Ingest / govern results (not a runner)   | Foundation ingest |
| AI-assisted | Draft / review under human gates         | Default OFF       |
| Continuous  | Ongoing signals                          | Later phase       |
| Hybrid      | Combine methods against same requirement | Supported pattern |

---

## 6. MVP requirements

**Rule:** A thin slice through the **full** lifecycle — not disconnected screens. AI is not required for MVP value.

### MVP must deliver

| Area                | Requirement                                                |
| ------------------- | ---------------------------------------------------------- |
| Tenant / RBAC       | Multi-tenant isolation; role-based workspace access        |
| Quality workspace   | Portfolio and project contexts for QE scope                |
| Requirements        | Approve, baseline, import (quality-relevant only)          |
| Manual verification | Library, design/approve, structured + exploratory sessions |
| Execution           | Human-centred sessions with result capture                 |
| Evidence            | Capture, pack assembly, pre-cert review; lock on certify   |
| Defects             | Raise, link to verification, retest cycle                  |
| Traceability        | Matrix, coverage gaps, requirement linkage                 |
| Release readiness   | Gates, waivers, aggregated snapshot                        |
| Certification       | Named human actor; locked evidence pack                    |
| Dashboards          | Home, project, release views                               |
| Audit               | Searchable, exportable, immutable trail                    |
| Integrations        | Platform + GitHub ingest foundation                        |
| Import / export     | Requirements import; report / cert export                  |

### Explicitly not required ON for MVP

- AI Quality Workspace runtime
- Advanced MCP write tools
- Continuous verification / certification modes
- Full ALM sync (link foundation only)
- Marketplace
- Advanced Quality Intelligence (basic reporting in MVP)
- Full Knowledge base (Phase 2; minimal optional in MVP)

### MVP success criteria

1. Manual verification session completable end-to-end with evidence capture
2. Certification decision recorded with named human actor and locked evidence pack
3. Zero dependency on AI for the MVP certification path
4. Traceability shows coverage gaps before certification
5. Audit trail searchable for certification decision and evidence lock
6. Release readiness snapshot reflects defects, risk, and gate status

Detail: [`product-definition/MVP-DEFINITION.md`](./product-definition/MVP-DEFINITION.md).

---

## 7. Functional requirements (summary)

Mapped to capability horizons. Full classification: [`product-definition/PRODUCT-CAPABILITIES.md`](./product-definition/PRODUCT-CAPABILITIES.md).

| ID    | Requirement                                                        | Horizon             |
| ----- | ------------------------------------------------------------------ | ------------------- |
| FR-01 | Organisation tenancy, users, RBAC                                  | MVP                 |
| FR-02 | Portfolio / project quality workspaces                             | MVP                 |
| FR-03 | Quality-relevant requirements: create, approve, baseline, import   | MVP                 |
| FR-04 | Verification library: reusable procedures, version awareness       | MVP                 |
| FR-05 | Verification design: author, review, approve                       | MVP                 |
| FR-06 | Manual execution sessions: structured and exploratory              | MVP                 |
| FR-07 | Evidence capture, packs, integrity, lock on certification approve  | MVP                 |
| FR-08 | Defect lifecycle linked to verification and retest                 | MVP                 |
| FR-09 | Traceability matrix and coverage-gap detection                     | MVP                 |
| FR-10 | Release readiness: gates, waivers, snapshot                        | MVP                 |
| FR-11 | Human certification with accountable actor and locked pack         | MVP                 |
| FR-12 | Dashboards and report / cert export                                | MVP                 |
| FR-13 | Immutable quality audit search and export                          | MVP                 |
| FR-14 | Automation result ingest (GitHub path foundation); not a runner    | MVP foundation      |
| FR-15 | Risk register linked to readiness                                  | MVP foundation / P2 |
| FR-16 | Integration Centre basics (connector config via Platform Services) | MVP foundation      |
| FR-17 | Quality Intelligence (explainable decision support)                | Phase 2–3           |
| FR-18 | Knowledge base for reuse and continuous improvement                | Phase 2             |
| FR-19 | AI Quality Workspace (drafts under human gates; default OFF)       | AI horizon          |
| FR-20 | MCP / DX governed agent channel (no autonomous certify)            | AI horizon          |
| FR-21 | Continuous verification / cert signals (never auto-certify)        | Phase 3             |

---

## 8. Non-functional requirements (summary)

| ID     | Area          | Requirement                                                                                |
| ------ | ------------- | ------------------------------------------------------------------------------------------ |
| NFR-01 | Security      | Zero Trust; authz on every action; least privilege; secrets never in code/logs             |
| NFR-02 | Audit         | Quality events immutable, searchable, exportable                                           |
| NFR-03 | Traceability  | Requirement → verification → execution → evidence → defect/risk → cert explainable         |
| NFR-04 | Multi-tenancy | Strict org isolation for SoR data                                                          |
| NFR-05 | Platform      | Business logic in Platform Services; modules presentation-only; no module→connector bypass |
| NFR-06 | AI safety     | AI never SoR; never auto-certify; default OFF until entitled and authorised                |
| NFR-07 | Accessibility | WCAG AA target for product UI                                                              |
| NFR-08 | Observability | Health, metrics, logs, traces with correlation IDs                                         |
| NFR-09 | Quality       | Test pyramid + E2E before release; no silent components                                    |

Normative NFR detail remains in Requirements and Constitution packs.

---

## 9. Boundaries and SoR

| Domain                                       | QEP role                         |
| -------------------------------------------- | -------------------------------- |
| Quality-relevant requirements                | SoR (approve / baseline)         |
| Verification design, library, sessions, runs | SoR                              |
| Evidence packs                               | SoR; lock on certification       |
| Quality defects linked to verification       | SoR                              |
| Human certification decisions                | SoR                              |
| Quality audit trail                          | SoR                              |
| ALM / SCM / CI / runners / device clouds     | Integrate only; not QEP identity |

Boundary tests: [`product-definition/PRODUCT-BOUNDARIES.md`](./product-definition/PRODUCT-BOUNDARIES.md).

---

## 10. Commercial packaging (reference)

| SKU                     | Role                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| **APZQEP Engineer**     | Primary paid seat for QEP practitioners                               |
| **APZQEP Collaborator** | Secondary seat; requires ≥1 paid Engineer                             |
| Trial                   | 14 days; no card; one trial per organisation; no auto paid conversion |

List prices: Price Book v1.0 (GLOBAL USD / AFRICA USD / SOUTH AFRICA ZAR). Org subscription does **not** auto-grant users. AI / MCP treated as entitled add-on layers with Constitution defaults (OFF).

Packaging concepts: [`product-definition/COMMERCIAL-PACKAGING.md`](./product-definition/COMMERCIAL-PACKAGING.md).

---

## 11. Out of scope for this PRD

- System / solution / technical architecture (see APZQEP-ARCH-*)
- Database, API, event, or ADR design
- UI mock-ups or wireframes
- Production implementation programmes beyond accepted definition

---

## 12. Success metrics

| Metric                        | Intent                                                             |
| ----------------------------- | ------------------------------------------------------------------ |
| Certification path completion | Orgs complete requirement → verify → evidence → certify without AI |
| Coverage visibility           | Coverage gaps visible before certify                               |
| Evidence lock integrity       | Cert decisions always paired with locked packs                     |
| Audit recoverability          | Certification and evidence lock events findable/exportable         |
| Time-to-confidence            | Reduced scramble across tools for release go/no-go                 |
| Adoption                      | Engineer seats active; Collaborators attached only with Engineer   |

---

## 13. Risks and open dependencies

| Risk / dependency                       | Mitigation                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| Scope creep into ALM / runner identity  | Enforce boundary tests; Constitution guardrails                                             |
| AI marketed as auto-certify             | Default OFF; human accountability mandatory                                                 |
| Incomplete MVP lifecycle slice          | Gate MVP on end-to-end certify path, not module count                                       |
| Architecture not yet Owner-accepted     | APZQEP-ARCH-001 only after Owner Acceptance                                                 |
| Platform entitlement / commercial gates | Follow Price Book + Trial Policy; no hard-coded prices in product UI logic beyond catalogue |

---

## 14. Document map (authoritative sources)

| Need                          | Document                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| Control / identity            | [`product-definition/PRODUCT-DEFINITION.md`](./product-definition/PRODUCT-DEFINITION.md)     |
| Overview                      | [`product-definition/PRODUCT-OVERVIEW.md`](./product-definition/PRODUCT-OVERVIEW.md)         |
| MVP                           | [`product-definition/MVP-DEFINITION.md`](./product-definition/MVP-DEFINITION.md)             |
| Capabilities                  | [`product-definition/PRODUCT-CAPABILITIES.md`](./product-definition/PRODUCT-CAPABILITIES.md) |
| Boundaries                    | [`product-definition/PRODUCT-BOUNDARIES.md`](./product-definition/PRODUCT-BOUNDARIES.md)     |
| Personas / workflows / models | [`product-definition/README.md`](./product-definition/README.md) (full pack index)           |

---

## 15. Approval

| Role                         | Status                                                               |
| ---------------------------- | -------------------------------------------------------------------- |
| Product Definition (DEF-002) | **ACCEPTED**                                                         |
| This PRD summary             | Derived deliverable for stakeholder use — does not supersede DEF-002 |
| Architecture (ARCH-001)      | Separate Owner gate                                                  |
| Implementation programmes    | Require approved sprint / build guides                               |

---

_End of APZQEP PRD_
