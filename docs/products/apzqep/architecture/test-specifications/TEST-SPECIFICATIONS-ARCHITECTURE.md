# APZQEP-ARCH-011  
# Test Specifications Capability Architecture  
# Owner Architecture Specification

| Field | Value |
| --- | --- |
| Programme | **APZQEP-ARCH-011** |
| Title | **Test Specifications Capability Architecture** |
| Classification | Owner Architecture Specification |
| Product | APZ QEP (APZ Quality Engineering Platform) |
| Platform baseline | APZHUB Platform 1.4 — CERTIFIED |
| Requirements baseline | `@apzhub/qep-requirements` **1.0.0 CERTIFIED / FROZEN** |
| Traceability baseline | `@apzhub/qep-traceability` **1.0.0 CERTIFIED / FROZEN** |
| Verification baseline | `@apzhub/qep-verification` **1.0.0 CERTIFIED / FROZEN** |
| Workbench grammar | **APZQEP-ARCH-006** — ACCEPTED |
| Downstream engineering | Separate Owner Engineering Programme Instruction — **NOT AUTHORISED** |
| Document revision | **1.0.0-arch** |
| Revision date | 2026-07-26 |
| Nature | Architecture only — implementation-independent |
| Status | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

**Normative language:** **must** = mandatory; **should** = strong recommendation; **may** = optional.

---

## 0. Authority and stop conditions

This specification defines the **Authoritative Test Specifications Capability Architecture** for APZ QEP.

It does **not** authorise:

- domain model code, packages, or persistence;
- repositories, REST APIs, permissions catalogues, audit wiring, or search indexes;
- Workbench UI, React, routes, or components;
- Test Cases, Test Suites, Test Plans, Executions, Evidence, Coverage, Impact, or Certification engineering;
- AI agents or MCP servers.

```text
Architecture → Owner Acceptance → Owner Engineering Programme Instruction
  → Test Specifications domain / infrastructure / Workbench (future, separately authorised)
```

Do **not** begin Test Specifications engineering until a separate **Owner Engineering Programme Instruction** is issued.

Requirements, Traceability, and Verification **1.0.0** remain frozen. This architecture must not redesign those capabilities.

---

## 1. Purpose and definition

### 1.1 What a Test Specification is

A **Test Specification** is a governed engineering artefact that defines the **approved test design** for one or more Requirements.

It is the authoritative **blueprint** from which Test Cases will later be produced.

A Test Specification answers:

- What must be tested, and why?
- Against which Requirements (and related references)?
- Under what preconditions / postconditions / expected behaviour?
- What acceptance criteria define design adequacy?
- Who owns, reviews, and approves the design?
- Which immutable version is the authoritative approved design?

### 1.2 What a Test Specification is not

| Not a Test Specification | Owner |
| ------------------------ | ----- |
| Requirement content / lifecycle | Requirements **1.0.0** |
| Trace Links | Traceability **1.0.0** |
| Verification decisions / outcomes | Verification **1.0.0** |
| Executable Test Case steps | Future Test Cases capability |
| Test Suites / Test Plans | Future suite/plan capabilities |
| Execution runs or results | Future Execution capability |
| Evidence packs / binaries | Future Evidence capability |
| Coverage percentages / impact | Future Coverage / Impact services |
| Certification verdicts | Future Certification capability |

### 1.3 Single source of truth rule

Test Specifications is the **single source of truth for Test Specification Records, their structure, versions, approval state, and governed history**.

It is **not** the SoR for Requirements, Trace Links, Verification, Test Cases, Executions, or Evidence. Those remain owned by their domains. Test Specifications **references** them only.

A Specification **never records execution**.

---

## 2. Philosophy and principles

| # | Principle | Meaning |
| - | --------- | ------- |
| P1 | Design-centric | Primary object is an approved test design blueprint |
| P2 | Spec ≠ Case ≠ Execution ≠ Verification | Strict semantic separation |
| P3 | Bounded ownership | Owns Specification truth only |
| P4 | Reference, do not absorb | Requirements / Trace / Verification / future Cases are references |
| P5 | Server authority | Lifecycle, approval, permissions, available actions — server only (future engineering) |
| P6 | Immutable versions | Material versions are immutable; supersession preferred over silent rewrite |
| P7 | Latest approved authoritative | Only latest approved version is authoritative for downstream consumers |
| P8 | Governed extensibility | Specification types and classifications are governed catalogues |
| P9 | Consumer architecture | Workbench / AI / MCP consume; they do not own Specifications |
| P10 | Workbench reuse | Future UX extends ARCH-006; no parallel shell |

---

## 3. Capability responsibility (ownership)

### 3.1 Test Specifications owns

| Concern | Notes |
| ------- | ----- |
| Specification definition | Aggregate identity and SoR content |
| Specification lifecycle | Governed state machine |
| Specification metadata | Structured annotations (non-secret) |
| Specification structure | Sections: purpose, scope, criteria, … |
| Specification versioning | Immutable major/minor versions |
| Specification approval state | Review / approve / reject governance |
| Specification ownership | Owner / steward identity |
| Specification relationships | Outbound references to other domains |
| Specification policies | Transition, approval, supersession rules |
| Specification events | Domain / integration event catalogue |
| Specification governance | Audit boundary for Specification truth |

### 3.2 Explicit non-ownership

Requirements · Trace Links · Verification · Test Cases · Test Suites · Test Plans · Executions · Execution Results · Evidence · Coverage · Impact · Certification · AI · MCP.

The capability **references** these only. It must never store their authoritative payloads as SoR copies.

---

## 4. Core concept — Test Specification model

### 4.1 Aggregate root

**TestSpecification** — platform id (future convention e.g. `tsp_*`), tenant-scoped, revisioned.

### 4.2 Normative content model

A Specification **must** be able to express:

| Element | Role |
| ------- | ---- |
| Purpose / Objectives | Why the design exists |
| Description | Narrative design summary |
| Scope | In-scope / out-of-scope boundaries |
| Preconditions | Required starting conditions |
| Postconditions | Expected ending conditions |
| Expected behaviour / Expected Results | Design-level expected outcomes |
| Acceptance criteria | Criteria for design adequacy / completeness |
| References | Links to Requirements, Trace Links, Verification, docs |
| Risks | Design/test risks |
| Dependencies | External or internal dependencies |
| Assumptions | Explicit assumptions |
| Constraints | Design constraints |
| Execution guidance | Non-executable guidance for later Case/Execution authors |
| Notes | Free-form notes |
| Priority | Design priority |
| Complexity | Relative complexity |
| Estimated effort | Planning estimate (non-authoritative effort SoR) |
| Classification | Governed classification |
| Tags | Searchable labels |
| Type | Specification type (see §6) |
| Owner | Ownership identity |
| Status | Lifecycle status |
| Version | Immutable version identity |

### 4.3 Non-recording rule

Specifications **must not** store:

- execution timestamps of test runs;
- pass/fail execution outcomes as SoR;
- evidence blobs;
- Verification decisions.

Those belong to Execution / Evidence / Verification domains.

---

## 5. Relationship model

### 5.1 Reference kinds (presentation / domain references)

| Target | Cardinality | Ownership |
| ------ | ----------- | --------- |
| Requirement | one or many | Reference only |
| Trace Link | one or many | Reference only |
| Verification | zero or many | Reference only |
| Future Test Case | zero or many | Reference slot only |
| Future Test Suite | zero or many | Reference slot only |
| Future Execution | zero or many | Reference slot only |
| Future Evidence | zero or many | Reference slot only |

### 5.2 Rules

1. Relationships are **references** (ids + kind + optional summary) — never absorbed SoR copies.  
2. Cross-domain discovery uses Platform Search / Workbench navigation — not foreign-table ownership.  
3. Unavailable future targets show **governed unavailable** states in future Workbench — no placeholder screens.  
4. Traceability remains SoR for Trace Links; Specifications may reference Trace Links without inventing alternate link semantics.  
5. Verification remains SoR for verification truth; Specifications may reference Verification Records as context, never as substitute decisions.

---

## 6. Specification types

### 6.1 Extensible type catalogue (examples)

Functional · Integration · Regression · Performance · Security · Usability · Accessibility · Compliance · API · Database · Infrastructure · Mobile · Web

### 6.2 Rules

1. Types are a **governed catalogue** — extensible without redesigning the aggregate.  
2. A Specification **must** have exactly one primary type; secondary tags **may** refine.  
3. Types do **not** imply Execution engines or runner brands.  
4. Future engineering must expose type metadata for Workbench filters and search facets.

---

## 7. Lifecycle

### 7.1 Normative states

| State | Meaning |
| ----- | ------- |
| **Draft** | Editable design work-in-progress |
| **In Review** | Submitted for review |
| **Approved** | Authoritative approved design (for its version) |
| **Rejected** | Review rejected; may return to Draft under policy |
| **Superseded** | Replaced by a newer version / successor |
| **Withdrawn** | Intentionally withdrawn from use |
| **Retired** | Permanently retired |
| **Cancelled** | Abandoned before approval |

### 7.2 Rules

1. Transitions are explicit commands (future engineering).  
2. Server-authoritative validation and `availableActions` (future).  
3. Approved versions are immutable; content changes require new version / supersession.  
4. History is append-only on material changes.  
5. Silent rewrite of approved content is forbidden.

### 7.3 Suggested transition sketch (non-implementation)

```text
Draft → In Review → Approved | Rejected
Rejected → Draft | Withdrawn | Cancelled
Approved → Superseded | Withdrawn | Retired
In Review → Draft | Withdrawn | Cancelled
* → Cancelled (policy-gated)
```

Exact transition matrices are refined in future domain engineering without contradicting these states.

---

## 8. Versioning

### 8.1 Model

| Concept | Rule |
| ------- | ---- |
| Major version | Breaking design change |
| Minor version | Compatible design refinement |
| Immutable versions | Published/approved versions are immutable |
| Supersession | Newer version supersedes prior; prior remains readable |
| History | Append-only material history |
| Comparison | Future Workbench compares two versions |
| Authority | **Only the latest approved version is authoritative** for downstream consumers |

### 8.2 Rules

1. Draft work **may** mutate within a mutable window before approval.  
2. Once Approved, content is frozen for that version identity.  
3. Consumers (future Test Cases) **must** pin or resolve to the authoritative approved version.  
4. Superseded versions remain auditable and navigable.

---

## 9. Governance

### 9.1 Capabilities

| Concern | Rule |
| ------- | ---- |
| Ownership | Explicit owner / steward |
| Review | In Review workflow with reviewers |
| Approval | Authoritative approval action |
| Rejection | Requires rationale |
| Withdrawal | Policy-gated; history retained |
| Retirement | Terminal; history retained |
| Audit boundary | Specification domain owns Specification audit truth |

### 9.2 Rules

1. Governance actions are server-authoritative (future).  
2. Client never invents approval eligibility.  
3. Rationale strongly recommended (or required by policy) for reject / withdraw / retire / supersede.  
4. Superadmin is an explicit permission tier, not a silent bypass (013).

---

## 10. Search architecture

### 10.1 Searchable facets (future)

title · identifier · tags · priority · owner · status · classification · type · requirement reference · verification reference

### 10.2 Rules

1. Search via Platform Unified Search (020) with a derived index — not SoR.  
2. Permission-filtered at query time.  
3. Index projects Specification metadata only — not Requirement/Verification payloads.  
4. Architecture only under ARCH-011 — no index implementation.

---

## 11. Future Workbench architecture

### 11.1 Principles

Reuse ARCH-006: shell, docking, panels, toolbar, navigation, command palette, sessions, theme, responsive behaviour. Do **not** redesign the Platform Workbench.

### 11.2 Primary surfaces (architecture catalogue)

| Surface | Purpose |
| ------- | ------- |
| Specification Explorer | Filtered inventory |
| Specification Inspector | Selection detail + actions |
| History | Append-only history |
| Comparison | Version comparison |
| Search | Discovery |
| Approval workflow | Review / approve / reject interaction |
| Relationship viewer | Reference navigation |
| Navigation | Deep links to Requirements / Trace / Verification / future Cases |

### 11.3 Rules

1. List / inspector first.  
2. Server-authoritative `availableActions` (future engineering).  
3. Queues for review (optional presentation) do not own business rules.  
4. Future Case/Execution/Evidence links are presentation slots with governed unavailable states.  
5. No Workbench implementation under ARCH-011.

---

## 12. Performance architecture

| Scale | Expectation |
| ----- | ----------- |
| 100 | Full facets comfortable |
| 1,000 | Pagination default |
| 10,000 | Server filtering + virtual scrolling |
| 100,000 | Strict pagination, incremental loading, bounded queries |

Mandatory techniques (future engineering): pagination · server filtering · virtualisation · lazy loading · bounded queries.

---

## 13. Accessibility architecture

Keyboard navigation · screen readers · focus management · ARIA · responsive behaviour · WCAG AA alignment with Design System **006**. Status and approval state must not rely on colour alone.

---

## 14. AI considerations

AI is a **consumer**:

| AI may | AI must never |
| ------ | ------------- |
| Summarise Specifications | Author authoritative Specifications |
| Recommend improvements | Approve / reject |
| Analyse consistency | Own Specification truth |
| Identify duplication | Bypass lifecycle / IAM |

AI suggestions execute only through human-confirmed server commands (future).

---

## 15. MCP considerations

MCP is a **consumer**:

- May read Specifications via authorised APIs (future);
- May invoke authorised APIs on behalf of a principal;
- Never owns Specification SoR, lifecycle, or Workbench state;
- Must respect permissions and `availableActions` semantics.

No MCP implementation under ARCH-011.

---

## 16. Platform alignment

| Platform concern | Application |
| ---------------- | ----------- |
| 003 Layering | Presentation → Services → (future) adapters — no bypass |
| 008 Modules | Test Specifications module; no direct engine calls |
| 009 Platform Services | Future `TestSpecificationService` (product name — not engine brand) |
| 010 Gateway | Future REST through APZHUB API Gateway |
| 011 Data | Platform PostgreSQL for Specification SoR metadata |
| 012 Events | Future events for notify/search/audit — async |
| 013 Zero Trust | Authn/authz/validation on every future API |
| 014 Observability | Future self-reported health |
| 024–029 SDKs | Manifest-first when engineering authorised |
| ARCH-006 | Future Workbench grammar reuse |

---

## 17. Consistency validation

| Baseline | Consistency |
| -------- | ----------- |
| Requirements 1.0.0 | References only; no Requirements mutation ownership |
| Traceability 1.0.0 | Trace Link references only; no Trace ownership |
| Verification 1.0.0 | Verification references only; Spec ≠ Verification |
| ARCH-006 | Future Workbench extends grammar; no shell redesign |
| Contradictions | None identified |

---

## 18. Explicitly out of scope

Domain · Infrastructure · Workbench · REST · Persistence · Repositories · Packages · Coverage · Impact · Evidence · Certification · AI · MCP · Test Cases · Executions

---

## 19. Architecture decisions (ADRs)

### ADR-ARCH-011-001 — Spec ≠ Case ≠ Execution ≠ Verification

**Decision:** Test Specification is a distinct governed design artefact.  
**Rationale:** Prevents ALM/runner conflation and protects Verification SoR.  
**Status:** Proposed (normative on Owner Acceptance).

### ADR-ARCH-011-002 — Latest approved version is authoritative

**Decision:** Downstream consumers resolve to the latest approved version unless explicitly pinned.  
**Rationale:** Clear authority for Case derivation and audits.  
**Status:** Proposed.

### ADR-ARCH-011-003 — References only across domains

**Decision:** Relationships to Requirements / Trace / Verification / future Cases are references, never absorbed SoR.  
**Rationale:** Aligns 011 One System of Record.  
**Status:** Proposed.

### ADR-ARCH-011-004 — Extensible specification type catalogue

**Decision:** Types are governed and extensible without aggregate redesign.  
**Rationale:** Supports Functional…Web and future types.  
**Status:** Proposed.

### ADR-ARCH-011-005 — Future Workbench reuses ARCH-006

**Decision:** No parallel shell; Specification UX specialises content only.  
**Rationale:** Consistency with Requirements / Traceability / Verification Workbenches.  
**Status:** Proposed.

### ADR-ARCH-011-006 — AI and MCP are consumers only

**Decision:** AI/MCP may summarise/recommend/read; never author authoritative Specifications.  
**Rationale:** Zero Trust and human governance.  
**Status:** Proposed.

---

## 20. Completion and stop

When this architecture pack is filed and governance updated:

```text
APZQEP-ARCH-011
IMPLEMENTED
AWAITING OWNER ACCEPTANCE
```

**STOP.** Do not begin Domain Engineering. Do not create packages. Do not implement Workbench. Await explicit Owner review.
