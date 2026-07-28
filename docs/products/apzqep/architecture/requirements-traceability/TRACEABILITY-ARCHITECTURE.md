# APZQEP-ARCH-007 — Requirements Traceability Architecture

| Field | Value |
| ----- | ----- |
| Programme | **APZQEP-ARCH-007** |
| Title | Requirements Traceability Architecture |
| Classification | Authoritative Architecture |
| Revision | **1.0.0-arch** |
| Date | 2026-07-26 |
| Status | **ACCEPTED / CLOSED / COMPLETE** |
| Nature | Authoritative Architecture |
| Upstream | Requirements **1.0.0** CERTIFIED/FROZEN · ARCH-005 · ARCH-006 · Platform 1.4 |
| Downstream engineering | **APZQEP-ENG-030A Part 1** authorised separately |

---

## 1. Purpose and definition

### 1.1 What Traceability is

**Traceability** is the APZ QEP capability that establishes, governs, queries, and analyses **governed links** among engineering artefacts so that every significant decision, verification, and certification claim can be explained through an end-to-end lineage.

Traceability answers:

- What artefacts are connected, and why?
- What is covered, missing, orphaned, or broken?
- What is impacted when something changes?
- What lineage supports a certification or evidence claim?

### 1.2 What Traceability is not

| Not Traceability | Owner |
| ---------------- | ----- |
| Requirement-to-Requirement semantic Relationships | Requirements (ARCH-005 / ENG-020F) |
| Requirement Content Versions or Baselines | Requirements |
| Verification procedure design | Verification (future) |
| Test execution results | Execution (future) |
| Evidence packs as SoR | Evidence (future) |
| Certification decisions | Certification (future) |
| Graph visualisation engines | Future UX programmes (not architecture here) |
| AI ownership of facts | Forbidden |

### 1.3 Single source of truth rule

Traceability is the **single source of truth for Trace Links and Traceability analysis contracts** across APZ QEP.

It is **not** the SoR for:

- Requirement content or lifecycle;
- Requirements Relationships (semantic taxonomy);
- Verification results, evidence binaries, or certification verdicts.

Those remain owned by their domains. Traceability **references** them.

---

## 2. Philosophy and principles

| # | Principle | Meaning |
| - | --------- | ------- |
| P1 | Complete engineering lineage | Significant artefacts participate in a governed trace network |
| P2 | End-to-end lifecycle visibility | Traces remain interpretable across draft → active → retired history |
| P3 | Immutable historical lineage | Historical and Baseline-scoped views are read-only projections |
| P4 | Cross-domain navigation | Users navigate Requirements → Specs → Tests → Evidence → Certification without domain shell forks |
| P5 | Bounded ownership | Each artefact class has one owning domain; Traceability links, does not absorb |
| P6 | Consumer-based architecture | Downstream domains publish associations; Traceability indexes and analyses |
| P7 | Single SoR per concern | No duplicated Relationship or Trace SoR |
| P8 | No duplicated trace logic | Coverage/impact algorithms live in Traceability services, not per-module copies |
| P9 | Governed links | Free-text “see also” is never authoritative |
| P10 | Explainable engineering decisions | Every authoritative Trace Link has type, authority, provenance, and rationale policy |

---

## 3. Domain ownership

### 3.1 Ownership matrix

| Concern | Owner | Traceability role |
| ------- | ----- | ----------------- |
| Requirements, Content Versions, Baselines | **Requirements** | Consume identities, CV pins, Baseline membership |
| Requirement↔Requirement Relationships | **Requirements** | Consume as semantic inputs; never rewrite |
| Trace Links (cross-domain and analytical) | **Traceability** | Own Trace SoR and taxonomy of Trace Types |
| Coverage / orphan / missing / impact analysis | **Traceability** | Own derived analytical models |
| Test Specifications, Test Cases | **Verification / Test domains** (future) | Publish associations Traceability may index |
| Test Executions, results | **Execution** (future) | Publish execution identities and outcomes |
| Evidence artefacts | **Evidence** (future) | Own evidence SoR; Traceability links to Evidence IDs |
| Defects, Risks | **Defect / Risk domains** (future) | Own defect/risk SoR; Traceability links |
| Verification Activities / Results | **Verification** (future) | Own verification SoR; Traceability links |
| Certification Artefacts / decisions | **Certification** (future) | Own certification SoR; Traceability links lineage |
| Documents | **Documents** (Platform product) | Traceability may link to document identities |
| External References | Owning domain + Traceability link metadata | Traceability stores governed external endpoint refs |
| AuthN/Z, audit, search infra, observability | **Platform** | Provide cross-cuts; do not own Trace business rules |
| AI / MCP | Consumers only | Never own Trace facts |

### 3.2 Hard boundaries

**Requirements remains the owner of Requirements.**  
**Traceability consumes Requirements.**  
**Traceability does not own Requirements.**

**Requirements remains the owner of Requirement-to-Requirement Relationships.**  
**Traceability must not create a competing Relationship SoR** (ARCH-005 §21).

**Verification / Evidence / Certification remain owners of their artefacts.**  
**Traceability links to them; it does not store their business payloads as authoritative copies.**

### 3.3 Semantic Relationships vs Trace Links

| Concept | Owner | Purpose |
| ------- | ----- | ------- |
| **Semantic Relationship** (`refines`, `depends_on`, …) | Requirements | Intra-Requirements meaning |
| **Trace Link** (`traces_to_test_case`, `satisfied_by_evidence`, …) | Traceability | Cross-domain lineage and coverage |

A Requirement↔Requirement semantic Relationship may be **projected** into Traceability views, but Traceability must treat Requirements Relationship APIs as authoritative for those facts.

Cross-domain associations (e.g. Requirement→Test Case) are **Trace Links** (or domain-owned associations published into Traceability), not Requirements taxonomy types, unless Owner later expands ARCH-005 deliberately.

---

## 4. Trace model

### 4.1 Core entities

| Entity | Definition |
| ------ | ---------- |
| **Trace** | Aggregate representing a governed connection intent between endpoints, including lifecycle and history |
| **Trace Endpoint** | Typed reference to an artefact (domain, kind, identity, optional CV/Baseline/external pin) |
| **Trace Link** | Directed edge instance connecting source endpoint → target endpoint under a Trace Type |
| **Trace Type** | Governed taxonomy entry defining semantic intent, allowed endpoint kinds, directionality, governance class |
| **Trace Direction** | `forward`, `reverse`, or `symmetric` (canonicalised per type policy) |
| **Trace Scope** | Applicability bound: product, project, release, Baseline, tenant-global (policy-controlled) |
| **Trace Status** | Lifecycle state of the Trace / Trace Link (see Lifecycle) |
| **Trace Strength** | Qualitative strength (`mandatory`, `recommended`, `informative`, …) for governance weight |
| **Trace Confidence** | Confidence band for derived or imported links (`authoritative`, `asserted`, `inferred`, `provisional`) |
| **Trace Origin** | How the link entered the system (`user`, `import`, `system_rule`, `ai_suggestion`, `migration`) |
| **Trace Authority** | Who/what may assert or approve the link (role/permission class + domain authority) |
| **Trace Provenance** | Evidence of origin: actor, correlation ID, source system, import batch, rationale ref |
| **Trace History** | Append-only history of status and material field changes |
| **Trace Metadata** | Extensible structured attributes that do not alter core semantics |

### 4.2 Endpoint kinds (normative catalogue)

| Endpoint kind | Owning domain | Notes |
| ------------- | ------------- | ----- |
| `requirement` | Requirements | May pin Content Version |
| `requirement_content_version` | Requirements | Explicit CV endpoint |
| `requirement_baseline` | Requirements | Baseline as scope or endpoint |
| `requirement_relationship` | Requirements | Optional reference to semantic Relationship |
| `test_specification` | Verification / Specs (future) | |
| `test_case` | Verification / Specs (future) | |
| `test_execution` | Execution (future) | |
| `evidence` | Evidence (future) | |
| `defect` | Defects (future) | |
| `risk` | Risks (future) | |
| `verification_activity` | Verification (future) | |
| `verification_result` | Verification (future) | |
| `certification_artefact` | Certification (future) | |
| `document` | Documents | Platform document identity |
| `external_reference` | Cross-cutting | URI + authority metadata; never opaque free text alone |

Endpoint catalogues are extensible via Trace Taxonomy Governance without redesigning the Trace model.

### 4.3 Trace Link identity

Each Trace Link has:

- global platform identity (e.g. future `trl_*` convention — engineering later);
- tenant scope;
- source endpoint + target endpoint;
- Trace Type;
- direction (stored canonical form);
- status, strength, confidence, origin, authority;
- optional Baseline / Content Version context pins;
- revision for optimistic concurrency;
- provenance and history.

Self-links are prohibited unless a future Owner-approved Trace Type explicitly allows them (default: forbidden).

---

## 5. Trace types (taxonomy architecture)

### 5.1 Distinguishing layers

1. **Requirements semantic types** — ARCH-005 normative set (`refines`, `depends_on`, …).  
2. **Traceability Trace Types** — cross-domain and analytical lineage types defined here.  
3. **Derived projections** — read models that combine (1) and (2) for matrices/coverage.

### 5.2 Core Trace Type families (normative intent)

| Family | Example Trace Types (illustrative IDs) | Intent |
| ------ | -------------------------------------- | ------ |
| Requirements internal projection | `projects_relationship` | Project ARCH-005 Relationship into Trace views (read-only projection link or virtual) |
| Specification | `requirement_specified_by` | Requirement → Test Specification / Spec artefact |
| Test design | `requirement_tested_by` | Requirement → Test Case |
| Execution | `requirement_executed_by` / `testcase_executed_by` | Requirement/Test Case → Execution |
| Evidence | `requirement_evidenced_by` / `execution_evidenced_by` | Requirement/Execution → Evidence |
| Defect | `requirement_defected_by` / `execution_defected_by` | Requirement/Execution → Defect |
| Risk | `requirement_risk_related` | Requirement → Risk |
| Verification | `requirement_verified_by` / `activity_produces_result` | Requirement → Verification Activity/Result |
| Certification | `requirement_certified_by` / `evidence_supports_certification` | Requirement/Evidence → Certification Artefact |
| Documents | `requirement_documented_by` | Requirement → Document |
| External | `requirement_references_external` | Requirement → External Reference |

Exact type identifiers, cardinality, and rationale policies are fixed at engineering taxonomy registration time; this architecture fixes **families, ownership, and governance classes**.

### 5.3 Governance class per Trace Type

| Class | Meaning |
| ----- | ------- |
| `mandatory_for_coverage` | Absence contributes to uncovered / missing-trace signals |
| `recommended` | Expected in mature processes; soft coverage |
| `informative` | Navigational / contextual; excluded from strict coverage by default |
| `projection_only` | Not user-created; derived from Requirements Relationships |

### 5.4 Direction and symmetry

- Most Trace Types are **directed** (source → target).  
- Symmetric types, if any, must define canonical storage order (mirror ARCH-005 pattern).  
- Reverse navigation is a **query concern**, not a second stored edge, unless type policy requires dual edges.

---

## 6. Lifecycle

### 6.1 Trace / Trace Link states

| State | Meaning | Mutability |
| ----- | ------- | ---------- |
| `draft` | Proposed; not yet authoritative for strict coverage | Mutable under policy |
| `active` | Authoritative for navigation and coverage (if type class requires) | Limited field mutability |
| `verified` | Independently checked against domain facts | Restricted |
| `approved` | Governance-approved for certification-relevant use | Restricted |
| `retired` | No longer valid for forward work | Immutable except admin provenance |
| `superseded` | Replaced by another Trace Link | Immutable; points to successor |

Engineering may collapse `verified`/`approved` into policy-driven transitions; architecture requires the **concepts** even if implemented as transition metadata.

### 6.2 Lifecycle operations (architectural)

| Operation | Effect |
| --------- | ------ |
| Create | Validate endpoints, type rules, tenant, non-duplicate; start `draft` or policy default |
| Validate | Structural + taxonomy + endpoint existence checks |
| Verify | Confirm endpoints still exist and still mean the asserted link |
| Approve | Elevate authority for certification-relevant classes |
| Retire | Leave historical record; remove from forward coverage |
| Supersede | Retire predecessor; create/activate successor; preserve chain |
| Historical preserve | Never hard-delete authoritative Trace history |

### 6.3 Baseline and Content Version interaction

- Traces may be **scoped** to a Baseline or **pinned** to Content Versions.  
- Baseline-bound Trace views are **immutable** when the Baseline is locked.  
- Living (current) Traces must not silently rewrite historical Baseline projections.  
- Content Version pins follow Requirements pinning rules (ARCH-005 / ENG-020D).  
- Supersession of Requirements Relationships remains Requirements-owned; Traceability updates projections via events/consumers.

### 6.4 Immutable history

All material transitions append Trace History. Historical queries reconstruct past lineage without mutating current SoR.

---

## 7. Governance

### 7.1 Mandatory vs optional traces

| Rule class | Behaviour |
| ---------- | --------- |
| Mandatory Trace Types | Contribute to missing-trace / uncovered signals when absent for in-scope Requirements |
| Optional Trace Types | Allowed; do not fail strict coverage alone |
| Projection traces | Mandatory presence derived from Requirements Relationships where type policy requires |

Mandatory sets are **product/org policy configurable** at engineering time within this architecture; defaults favour safety (stricter for certification-bound programmes).

### 7.2 Detection architecture

| Detection | Definition |
| --------- | ---------- |
| Orphan Requirement | In-scope Requirement with no qualifying Trace Links / Relationships for required families |
| Broken Trace | Endpoint missing, retired, cross-tenant invalid, or type no longer allowed |
| Missing Trace | Required Trace Type absent for an in-scope artefact |
| Circular Trace | Cycle among Trace Links where type policy forbids cycles |
| Duplicate Trace | Same type + canonical endpoints (+ scope pins) already active |

### 7.3 Circular and duplicate policy

- Circular Trace policy is **per Trace Type** (forbid / warn / allow).  
- Default for coverage-critical directed types: **forbid or warn** (engineering chooses; architecture requires explicit policy).  
- Duplicates: reject create; allow supersession workflow instead of silent merge.

### 7.4 Ownership and authority

- Creating/editing Trace Links requires Traceability permissions (future catalogue).  
- Endpoint domains remain authoritative for endpoint existence and lifecycle.  
- Traceability must re-validate endpoint facts on verify/approve transitions.  
- AI-suggested origins (`ai_suggestion`) never become `authoritative` without human/system authority transition.

---

## 8. Coverage architecture

Coverage is a **derived analytical model**, not a second SoR.

### 8.1 Coverage dimensions

| Dimension | Question |
| --------- | -------- |
| Requirement Coverage | Which Requirements have required Trace Links / Relationships for the selected policy? |
| Specification Coverage | Which Requirements map to Specifications? |
| Execution Coverage | Which Requirements/Test Cases have Executions in scope? |
| Evidence Coverage | Which Requirements/Executions have Evidence? |
| Certification Coverage | Which Requirements/Baselines have Certification Artefacts / lineage? |
| Future Coverage Analytics | Aggregations, trends, programme health (later) |

### 8.2 Coverage computation principles (architecture only)

- Inputs: Trace Links + projected Requirements Relationships + Baseline membership + domain status filters.  
- Outputs: covered / partial / uncovered / not-applicable classifications.  
- Scope: always explicit (Baseline, release, product, filter set).  
- Strict vs soft coverage modes selected by policy.  
- **No calculation formulas mandated here** — engineering defines algorithms conforming to these principles.

### 8.3 Non-goals for coverage

- Coverage percentages must not auto-certify.  
- Coverage must not invent missing domain artefacts.  
- Coverage must not treat search projections as SoR.

---

## 9. Impact architecture

Impact analysis is a **derived query capability** over Trace Links + Requirements Relationships + domain dependency metadata.

### 9.1 Canonical change cascade (architectural)

```text
Requirement changed (or CV published / Relationship changed / Baseline membership delta)
        ↓
Identify affected (via Trace + Relationship graphs):
  Specifications → Test Cases → Executions → Evidence
  Verification Activities / Results
  Defects / Risks
  Certification Artefacts
  Documents / External References (informational)
```

### 9.2 Impact principles

| Principle | Rule |
| --------- | ---- |
| Explicit context | Impact always states Baseline/CV/current scope |
| Directional walk | Upstream vs downstream walks are first-class query modes |
| Strength/criticality aware | Mandatory/high-criticality edges rank higher in impact sets |
| No silent truncation | Bounded result sets must declare incompleteness |
| No mutation | Impact analysis is read-only |
| Explainability | Each impacted node cites path evidence (link IDs / relationship IDs) |

### 9.3 Non-implementation

This architecture does **not** specify algorithms, caching, or UI. Future impact engines must conform to these contracts.

---

## 10. Query model

Supported architectural query classes:

| Query | Intent |
| ----- | ------ |
| Show upstream | Artefacts that the selection depends on / derives from |
| Show downstream | Artefacts that depend on / are derived from the selection |
| Show missing traces | Required Trace Types absent for in-scope set |
| Show orphan requirements | Requirements lacking required lineage |
| Show uncovered requirements | Coverage classification = uncovered |
| Show impacted artefacts | Impact walk from a change set |
| Show certification lineage | Path(s) from Requirement/Baseline to Certification Artefact |
| Show evidence chain | Path(s) from Requirement/Execution to Evidence (and onward) |
| Show broken traces | Invalid endpoint or policy violations |
| Show supersession chains | Historical replacement lineage |

All queries are tenant-scoped, permission-filtered, and context-explicit (Baseline/CV/current).

---

## 11. Search architecture (principles only)

| Search class | Principle |
| ------------ | --------- |
| Trace search | Index Trace Link metadata (type, endpoints, status, scope) as **projection** |
| Cross-domain search | Unified discovery via Platform Search providers registered by domains + Traceability |
| Relationship search | Remains Requirements-owned projection; Traceability may federate results |
| Coverage search | Search over derived coverage documents; not SoR |
| Impact search | Optional indexed impact summaries; authoritative walks remain query-time/SoR-backed |

**Rule:** Selecting a search hit must reload authoritative Trace / domain detail from SoR (ARCH-006 / Platform 020 pattern).

---

## 12. Workbench principles (architecture only — no UI)

Traceability **reuses** APZQEP-ARCH-006 Workbench grammar. It must not invent a second shell.

| Concern | Architecture rule |
| ------- | ----------------- |
| Entry | Traceability module sidebar + deep links from Requirements / search / inspectors |
| Explorer | List-first Trace Explorer; filters by type, status, scope, coverage signals |
| Centre | Matrices, lineage lists, impact result sets, coverage summaries (future engineering) |
| Inspector | Trace Link detail; endpoint inspectors; coverage explanation; availableActions from server |
| Context banners | Baseline / CV / immutable historical context always explicit |
| Graphs | Visual graph engines **out of scope** for this architecture programme; list/matrix first |
| Actions | Server-authoritative `availableActions`; no client-inferred authority |
| Extensibility | Register explorers, inspectors, search providers, commands via Platform Module SDK |

---

## 13. Consumers

| Consumer | Consumes from Traceability | Must not |
| -------- | -------------------------- | -------- |
| Requirements Workbench | Cross-domain Trace indicators (read) | Own Trace SoR |
| Verification / Specs / Cases | Trace create/query APIs (future) | Redefine Requirements Relationships |
| Execution | Execution↔Requirement/Evidence Trace Links | Rewrite Requirements |
| Evidence | Evidence chain queries | Become Trace SoR |
| Certification | Certification lineage / coverage inputs | Auto-certify from connectivity alone |
| Administration / Audit | Trace history and provenance | Mutate history |
| AI | Governed Trace facts for reasoning | Own or silently invent authoritative Traces |
| MCP | Read/query Trace APIs (future) | Bypass authz or invent facts |
| External integrations | Import/export mapped Trace Types | Bypass taxonomy governance |

---

## 14. Integration model

```text
Domain SoRs (Requirements, Verification, Execution, Evidence, Certification, Documents, …)
        │ publish identities, lifecycle events, optional association intents
        ▼
Traceability Platform Service (future engineering)
        │ validates, stores Trace Links, projects coverage/impact read models
        ▼
Workbench / Search / AI / MCP / Certification consumers
```

### 14.1 Layer alignment (Platform 003 / 008 / 009)

- Modules call **Traceability Platform Service** interfaces only.  
- No module-to-module Trace coupling.  
- Connectors (if external ALM import) live in Integration SDK adapters; they must map into Trace Types, never dump raw foreign links as SoR without mapping.  
- Events: domains publish; Traceability subscribes to invalidate projections (Platform 012 / 029).

### 14.2 Requirements Relationship integration

- Subscribe to Relationship lifecycle events.  
- Maintain projection/virtual Trace edges of class `projection_only` where required.  
- Never accept UI edits that mutate Requirements Relationships through Traceability APIs.

---

## 15. AI considerations (architecture only)

| Rule | Statement |
| ---- | --------- |
| AI consumes Traceability | AI may read Trace Links, coverage, and impact explanations |
| AI never owns Traceability | AI cannot be Trace Authority for authoritative links |
| Origin marking | AI-proposed links use `Trace Origin = ai_suggestion` and `Confidence = provisional/inferred` |
| Promotion | Human or governed system authority required to activate/approve |
| Explainability | AI outputs that cite lineage must reference Trace / Relationship IDs |
| No auto-certify | AI must not change certification state from Trace connectivity |

No AI implementation is authorised by this programme.

---

## 16. MCP considerations (architecture only)

| Rule | Statement |
| ---- | --------- |
| MCP consumes Traceability | Future MCP tools may query Trace/coverage/impact |
| Same authz | MCP inherits Platform authn/authz; no privilege escalation |
| No write without authority | MCP mutations (if ever allowed) use the same commands and `availableActions` |
| No shadow SoR | MCP must not cache authoritative Trace state as truth |

No MCP implementation is authorised by this programme.

---

## 17. Extensibility

| Extension | Mechanism |
| --------- | --------- |
| New endpoint kinds | Register in Trace Endpoint catalogue with owning domain |
| New Trace Types | Taxonomy Governance + versioned type schema |
| New coverage dimensions | Coverage provider interface (future engineering) |
| New impact edge sources | Impact provider registration |
| New domains | Publish identities + events; register Trace Types; reuse Workbench slots |
| External systems | Integration adapters with mandatory type mapping |

Extensibility must **not** require redesign of Trace, Trace Link, or ownership boundaries.

---

## 18. Consistency with accepted baselines

| Baseline | Consistency rule |
| -------- | ---------------- |
| Requirements **1.0.0** frozen | Traceability consumes; does not extend Requirements domain semantics |
| ARCH-005 | Relationships remain Requirements SoR; Traceability is downstream consumer |
| ARCH-006 | Workbench grammar reused; list-first; `availableActions`; explicit Baseline/CV context |
| Platform 1.4 | Gateway → Service → (Connector) path; authz; audit; search projections; events |
| Documents 003/008/009/010/011/012/024–029 | Layering, SoR, events, SDK manifests at engineering time |

No contradictions introduced: Traceability analysis remains derived; Requirements Relationships remain authoritative for intra-Requirements semantics.

---

## 19. Explicit non-goals (this programme)

Domain model code · persistence · repositories · commands/queries · REST · permissions catalogues · audit wiring · search implementation · Workbench UI · React · graph visualisation · coverage calculations · impact engine · Verification/Execution/Evidence/Certification engineering · AI · MCP · Requirements engineering.

---

## 20. Engineering gate (future)

Only after Owner Acceptance of ARCH-007 **and** a separate Owner Engineering Programme Instruction may Traceability engineering begin.

Recommended future engineering decomposition (non-authorising):

1. Trace domain + taxonomy  
2. Persistence + APIs  
3. Projection consumers for Requirements Relationships  
4. Coverage + impact query services  
5. Workbench slice conforming to ARCH-006  

---

## 21. Glossary

| Term | Meaning |
| ---- | ------- |
| Trace | Governed connection aggregate |
| Trace Link | Directed typed edge instance |
| Trace Type | Taxonomy of link intent |
| Coverage | Derived satisfaction of required lineage policies |
| Impact | Derived set of artefacts affected by a change |
| Projection | Read model derived from another SoR |
| Semantic Relationship | Requirements-owned ARCH-005 Relationship |

---

## Document control

| Version | Date | Notes |
| ------- | ---- | ----- |
| 1.0.0-arch | 2026-07-26 | Initial Owner Architecture Specification — APZQEP-ARCH-007 |
