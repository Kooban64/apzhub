# APZQEP-ARCH-005  
# Requirements Relationship Architecture  
# Owner Architecture Specification

| Field | Value |
| --- | --- |
| Programme | **APZQEP-ARCH-005** |
| Title | **Requirements Relationship Architecture** |
| Classification | Owner Architecture Specification |
| Product | APZ QEP (APZ Quality Engineering Platform) |
| Platform baseline | APZHUB Platform 1.4 — CERTIFIED |
| Engineering baseline | Requirements Module — PRODUCTION READY |
| Latest accepted engineering | **APZQEP-ENG-020E — Requirements Baselines** — ACCEPTED / CLOSED / COMPLETE |
| Frozen engineering programmes | ENG-010, ENG-020A, ENG-020B, ENG-020C, ENG-020D, ENG-020E |
| Downstream engineering | **APZQEP-ENG-020F — Requirements Relationship Model** |
| ENG-020F phase | **PLANNING** |
| ENG-020F implementation | **AUTHORISED TO BEGIN** (under separate Owner Engineering Programme Instruction) |
| Document revision | **1.1.0-arch** |
| Revision date | 2026-07-26 |
| Date accepted | 2026-07-26 |
| Nature | Architecture only — implementation-independent |
| Status | **ACCEPTED / CLOSED / COMPLETE** |
| Classification | **Authoritative Architecture** |

**Normative language:** In this specification, **must** denotes a mandatory requirement; **should** denotes a strong recommendation; **may** denotes an optional allowance.

---

## 0. Authority and stop conditions

This specification is the **Authoritative Architecture** for Requirements Relationships in APZ QEP (**ACCEPTED / CLOSED / COMPLETE**).

It supersedes all previous informal discussions regarding relationship semantics. Future engineering shall conform to this specification.

Owner Acceptance of this architecture authorises ENG-020F to move to:

```text
Phase: PLANNING
Implementation: AUTHORISED TO BEGIN
```

Coding, migrations, packages, APIs, UI, persistence, and repositories for ENG-020F remain deferred until a separate **Owner Engineering Programme Instruction** is issued.

This architecture does **not** authorise Traceability, Coverage Analysis, Verification, Test Specification, Test Case, Execution, Evidence, Certification, AI, or MCP engineering.

Do not modify the architecture, behaviour, implementation, evidence, migrations, package versions, or acceptance records of ENG-010 or ENG-020A–020E.

---

## 1. Purpose

The Requirements Relationship Model is the **semantic foundation** of APZ QEP.

Its purpose is to define how Requirements relate to each other — and, by controlled extension, how Requirements participate in governed quality structures — so that later capabilities can answer product questions with integrity:

- What depends on this Requirement?
- What does this Requirement refine, constrain, or derive from?
- Which fixed configuration (Requirement Baseline) carries these Relationships for release scope?
- What coverage, verification intent, and certification claims can be justified?

A Relationship is not navigation convenience. It is a **first-class governed semantic entity** with identity, direction, cardinality, behaviour, strength, criticality, classification, scope, lifecycle, and integrity rules.

Without a stable Requirements Relationship Model, Traceability, Coverage Analysis, Verification design, Test Specifications, Test Cases, Test Execution, Evidence, and Certification cannot share a common meaning.

---

## 2. Domain ownership

| Concern | Owner |
| --- | --- |
| Requirement entities, Requirement Content Versions, Requirement Baselines | Requirements bounded context |
| Requirement-to-Requirement Relationships | Requirements bounded context |
| Relationship taxonomy and invariants | Requirements bounded context |
| Traceability analysis and coverage views | Traceability capability (future; consumer of Relationships) |
| Verification / Test / Evidence / Certification associations to Requirements | Respective future domains; they **consume** Requirement identities and Relationship semantics; they must **not** redefine Requirement-to-Requirement meaning |
| Authentication, authorisation, audit, search, observability, request pipeline | Platform 1.4 |

**Rule:** The Requirements Relationship Model is owned by Requirements. No other domain may invent a competing Relationship System of Record (SoR).

---

## 3. Bounded-context responsibilities

### 3.1 Requirements context (SoR for Relationship semantics)

Requirements **must** own:

- defining Relationship Types and allowed endpoint kinds;
- creating, validating, transitioning, and retiring Relationships;
- enforcing invariants (direction, cardinality, cycles where prohibited, tenant isolation, scope, strength, criticality, classification);
- relating Relationships to Requirement identity and, where required, to Requirement Content Versions and Requirement Baselines;
- publishing domain events for Relationship lifecycle (at engineering time);
- exposing query contracts for Relationship graphs within Requirements scope.

Requirements must **not** own:

- coverage dashboards and matrix UX (Traceability);
- verification procedure design (Verification);
- execution results or evidence packs;
- certification decisions.

### 3.2 Traceability context (future consumer)

Traceability consumes Relationship graphs and Baseline-scoped membership to produce analysis, matrices, impact views, and coverage. It must not become a second SoR for Relationship facts.

### 3.3 Downstream quality contexts (future consumers)

Verification, Test Specification, Test Case, Execution, Evidence, and Certification may establish **cross-domain associations** to Requirements (and preferably to Baseline-pinned Requirement Content Versions). Those associations are owned by the downstream context, but must **conform** to Requirements identity and this Architecture (endpoint validity, version/Baseline pinning policy, permission and tenant boundaries).

### 3.4 Platform

Platform provides authn/authz, audit, search indexing hooks, observability, tenancy primitives, and API gateway patterns. Platform does not own Relationship business rules.

---

## 4. Relationship taxonomy

The architecture defines a **typed taxonomy**. Types are first-class and governed. Free-text “related to” without type is forbidden for authoritative Relationships.

### 4.1 Core Requirement-to-Requirement types (normative set)

| Type | Intent (semantic) | Typical direction |
| --- | --- | --- |
| `refines` | Target elaborates or specialises source | Parent → child refinement |
| `derives_from` | Source is derived from target | Derived → origin |
| `depends_on` | Source depends on target for meaning or satisfaction | Dependent → dependency |
| `constrains` | Source imposes constraint on target | Constraint → constrained |
| `conflicts_with` | Known or suspected conflict | Symmetric canonical pair (see §6) |
| `supersedes` | Source replaces target for forward work | Successor → predecessor |
| `relates_to` | Weak associative Relationship with mandatory rationale | Directed associative |

The normative set is the **minimum enterprise vocabulary**. Extension is allowed only through Taxonomy Governance (§22).

### 4.2 Non-taxonomy (explicitly out of this architecture’s SoR)

- Requirement ↔ Verification Procedure associations (Verification domain)
- Requirement ↔ Defect / Risk associations (respective domains)
- UI “see also” bookmarks without governed type
- Import of foreign ALM link dumps as authoritative without type mapping

---

## 5. Relationship identity

Each Relationship is a distinct governed entity with:

| Element | Rule |
| --- | --- |
| Relationship identifier | Stable, unique within tenant scope |
| Relationship Type | From approved taxonomy |
| Source endpoint | Typed reference (see §5.1) |
| Target endpoint | Typed reference |
| Tenant | Mandatory; immutable for the Relationship lifetime |
| Direction | Per type policy (§6) |
| Lifecycle state | Per §16 |
| Strength | Per §10 |
| Criticality | Per §11 |
| Classification | Per §12 |
| Scope | Per §13 |
| Created / updated audit metadata | Actor, timestamps, correlation |
| Optional rationale / description | Mandatory where behaviour or type requires it |

### 5.1 Endpoint identity model

An endpoint references a **Requirement** identity and optionally a **pin**:

1. **Requirement-level endpoint** — relates mutable Requirement identities (living model).  
2. **Content-Version-pinned endpoint** — relates specific immutable Requirement Content Versions.  
3. **Baseline-scoped view** — not a separate endpoint kind; a query projection of Relationships relevant to a Requirement Baseline’s membership (see §19), distinct from explicitly Baseline-scoped Relationships (§13).

**Architectural decision principle:**  
Authoritative configuration for release and certification should prefer **Content-Version-pinned** or **Baseline-projected / Baseline-scoped** interpretation. Living Requirement-level Relationships support authoring and analysis, but must not silently substitute for pinned configuration.

---

## 6. Relationship direction

| Aspect | Rule |
| --- | --- |
| Default | Relationships are **directed** (source → target) |
| Inverse | Each type may declare a logical inverse label for navigation without duplicating SoR rows |
| Symmetric types | Only where taxonomy marks symmetry (normative: `conflicts_with`); persistence stores one canonical ordered pair to prevent duplicates |
| Bidirectional UX | Presentation may show both directions; SoR remains one directed fact (or one canonical symmetric fact) |

Direction is part of type semantics. Reversing endpoints changes meaning and requires explicit create/replace rules — not silent flip.

---

## 7. Relationship cardinality

Cardinality is **type-governed**, not globally uniform.

| Type | Cardinality guidance |
| --- | --- |
| `refines` | Many permitted per policy; cycles forbidden |
| `derives_from` | Many-to-one or many-to-many; cycles forbidden |
| `depends_on` | Many-to-many; cycles detectable and default-forbidden for authoritative graphs |
| `constrains` | Many-to-many; cycles forbidden |
| `supersedes` | At most one active supersession chain head per superseded Requirement in a given scope |
| `conflicts_with` | Many-to-many; canonical undirected pair |
| `relates_to` | Many-to-many; weakest guarantees |

Exact numeric limits (maximum edges per Requirement) are engineering parameters under performance principles (§27), not semantic identity.

---

## 8. Relationship semantics

### 8.1 Semantic layers

1. **Structural** — graph connectivity and type.  
2. **Behavioural** — type-declared analytical behaviour (§9).  
3. **Qualitative** — strength, criticality, classification (§10–12).  
4. **Configuration** — living, version-pinned, Baseline-projected, or Baseline-scoped (§5.1, §13, §19).  
5. **Lifecycle** — draft / active / deprecated / retired (§16).  
6. **Analytical** — derived Traceability views; never authoritative over SoR.

### 8.2 Meaning of “active”

An **active** Relationship may be used by downstream analysis as a current semantic fact for the living model, subject to permissions and tenant scope.

An **active** Relationship does **not** by itself freeze configuration. Freezing requires Requirement Baselines (ENG-020E) and/or Requirement Content Version pins.

### 8.3 Non-semantics (forbidden inferences)

- Presence of a Relationship does not approve a Requirement.  
- Presence of a Relationship does not imply verification coverage.  
- Supersession does not delete history.  
- Dependency does not imply execution order of tests.  
- Strength, criticality, or classification alone do not certify a release.

---

## 9. Relationship Behaviour Model

Relationship Type defines not only the label applied to an edge, but also its **governed analytical behaviour**.

Each approved Relationship Type **must** declare behaviour metadata. Behaviour metadata describes semantic and analytical behaviour. It must **not** automatically trigger uncontrolled workflow, Requirement state changes, test execution, or certification decisions.

### 9.1 Required behaviour metadata

At minimum, behaviour metadata must address:

| Metadata | Meaning |
| --- | --- |
| Impact significance | Default importance for change-impact analysis |
| Certification relevance | Whether normally material to certification review |
| Cycle policy | Forbidden / detectable / permitted / N/A |
| Baseline projection relevance | Whether included in Baseline projections by default |
| Default Traceability visibility | Whether included in strict Traceability by default |
| Orphan-analysis relevance | Whether absence participates in orphan/missing-link analysis |
| Propagation meaning | Whether change at one endpoint should cause inspection of the other |
| Blocking meaning | Whether unresolved instances may later be treated as blockers by policy |
| Historical relevance | Whether deprecated/retired instances remain analytically visible |
| Rationale requirement | Optional / recommended / mandatory |

### 9.2 Behaviour term definitions

**Impact significance** describes the default importance of the Relationship when performing change-impact analysis. It does not replace context-specific criticality (§11).

**Certification relevance** indicates whether the Relationship Type is normally material to a certification review. It does not create certification evidence or approval.

**Propagation meaning** defines whether a change at one endpoint should cause downstream analysis to inspect the other endpoint. It does not automatically change the other Requirement.

**Blocking meaning** defines whether an unresolved Relationship may be treated by future governance policy as a blocker. No Relationship Type may automatically block lifecycle transitions until a separately authorised policy programme defines that behaviour.

**Historical relevance** means deprecated and retired Relationships remain available for audit, historical impact analysis, and explanation.

### 9.3 Normative behaviour matrix

| Relationship Type | Impact significance | Certification relevance | Cycle policy | Baseline projection | Default Traceability visibility | Rationale |
| --- | ---: | ---: | --- | --- | --- | --- |
| `refines` | High | Yes | Forbidden | Included | Included | Optional unless organisational policy requires it |
| `derives_from` | High | Yes | Forbidden | Included | Included | Recommended |
| `depends_on` | High | Conditional | Default-forbidden for authoritative graphs; detectable in all graphs | Included | Included | Recommended |
| `constrains` | High | Yes | Forbidden | Included | Included | Recommended |
| `conflicts_with` | High | Yes | Not applicable as a canonical symmetric pair | Included | Included and highlighted | Mandatory |
| `supersedes` | High | Yes | Chain rules apply; circular supersession forbidden | Included where relevant to scope | Included | Mandatory |
| `relates_to` | Low | No by default | Permitted | Optional and policy-controlled | Excluded from strict Traceability by default | Mandatory |

Orphan-analysis relevance: all High-impact types above **should** participate; `relates_to` **may** be excluded from strict orphan analysis by default.

Propagation meaning: High-impact types **should** propagate inspection; `relates_to` **may** omit propagation by default.

Blocking meaning: reserved for future authorised policy — **must not** auto-block Requirement lifecycle in ENG-020F unless a separate policy programme authorises it.

---

## 10. Relationship Strength

Relationship strength is an optional governed semantic attribute used to express how strongly the source relies on the target within the meaning of the selected Relationship Type.

### 10.1 Approved values

| Value | Meaning |
| --- | --- |
| `mandatory` | Necessary semantic dependency, derivation, constraint, refinement, supersession, or conflict declaration within the type’s meaning |
| `recommended` | Important and intentionally modelled; the connected Requirement may remain meaningful without it |
| `informational` | Context or navigation; not relied upon for strict coverage or certification analysis by default |

Do **not** use `deprecated` as a strength value. Deprecation belongs to Relationship lifecycle (§16).

### 10.2 Rules

1. Strength does not replace Relationship Type.  
2. Strength cannot weaken a type-specific invariant.  
3. A `mandatory` `relates_to` Relationship is still semantically weak compared with a typed dependency or constraint.  
4. Strength must not be inferred solely from UI placement.  
5. Strength changes must be audited.  
6. Strength must be evaluated only within the Relationship’s lifecycle and configuration scope.  
7. Future Traceability may use strength to identify missing, broken, or retired mandatory Relationships.  
8. Certification may consume strength but must not interpret strength alone as evidence.

### 10.3 Default-strength guidance

| Relationship Type | Default strength |
| --- | --- |
| `refines` | `mandatory` |
| `derives_from` | `mandatory` |
| `depends_on` | `mandatory` |
| `constrains` | `mandatory` |
| `conflicts_with` | `mandatory` |
| `supersedes` | `mandatory` |
| `relates_to` | `informational` |

Defaults may be overridden only where taxonomy policy allows (§22).

---

## 11. Relationship Criticality

Criticality represents the consequence of the Relationship becoming invalid, unresolved, contradictory, retired, or disconnected.

### 11.1 Approved values

| Value | Meaning |
| --- | --- |
| `critical` | Failure may affect legal/regulatory compliance, safety, financial integrity, security, identity/access control, data protection, release certification, or core product viability |
| `high` | Failure may materially affect major functionality, release readiness, architectural integrity, or key operational processes |
| `medium` | Failure may affect a bounded feature, workflow, reporting result, or non-core quality objective |
| `low` | Failure has limited operational or analytical effect and is primarily contextual |

### 11.2 Rules

1. Criticality is distinct from Relationship Type and strength.  
2. Criticality must not be used to bypass Relationship invariants.  
3. Criticality must not be assigned automatically from Requirement priority without an explicit future mapping policy.  
4. Criticality changes must be auditable.  
5. Critical and high Relationships must be visible by default in future impact-analysis views.  
6. Retired critical Relationships remain historically visible.  
7. Criticality does not itself approve, reject, certify, or block a Requirement.  
8. Future governance may introduce blocking policies only through an explicitly authorised programme.

---

## 12. Relationship Classification

Classification describes the architectural concern represented by the Relationship.

### 12.1 Approved initial values

| Classification | Meaning |
| --- | --- |
| `structural` | Architecture, composition, decomposition, hierarchy, or system structure |
| `behavioural` | Runtime behaviour, process behaviour, state behaviour, or functional interaction |
| `business` | Business rules, commercial policy, user outcomes, organisational obligations, or service rules |
| `regulatory` | Law, regulation, licence condition, regulatory directive, or formal compliance requirement |
| `security` | Authentication, authorisation, confidentiality, integrity, threat control, or security assurance |
| `privacy` | Personal information, consent, lawful processing, retention, access, or data-subject protection |
| `safety` | Human, environmental, physical, or system safety |
| `quality` | Performance, reliability, usability, maintainability, testability, accessibility, or other quality attributes |
| `operational` | Deployment, support, continuity, recovery, monitoring, administration, or production operation |
| `data` | Data definitions, quality, lineage, retention, validation, transformation, or storage constraints |
| `integration` | Inter-system contracts, external services, protocols, interfaces, or dependency boundaries |

### 12.2 Rules

1. Classification is not a replacement for Relationship Type.  
2. A Relationship must have exactly one primary classification for ENG-020F unless the Owner later authorises secondary classifications.  
3. Regulatory, security, privacy, and safety classifications must be highlighted in future certification and impact views.  
4. Classification must not be inferred from free text alone in authoritative workflows.  
5. AI may suggest classification in the future, but AI suggestions must not become authoritative without human confirmation (§23).  
6. Classification vocabulary changes require governed taxonomy approval (§22).

---

## 13. Relationship Scope

Relationship scope defines the configuration boundary within which a Relationship has authoritative meaning.

### 13.1 Approved scopes

| Scope | Meaning |
| --- | --- |
| `product` | Applies across the product’s continuing Requirements model, subject to lifecycle, version, and permission rules |
| `project` | Applies within a defined project or programme boundary; project identity must be validated by authorised implementation |
| `release` | Applies to a named release or delivery configuration; must not silently become permanent product-scoped fact |
| `baseline` | Applies to a specific governed Requirement Baseline interpretation; must reference an existing Baseline and respect locked Baseline immutability |

Do **not** introduce `global` as a stored tenant-spanning scope. Tenant isolation remains absolute (§25).

### 13.2 Rules

1. Every Relationship has exactly one authoritative scope.  
2. Tenant is not a selectable Relationship scope; tenant is the mandatory isolation boundary.  
3. Product scope is the default only when no narrower configuration boundary is required.  
4. Project, release, and Baseline scopes require valid references to their governing entities.  
5. Scope changes must not silently rewrite historical meaning.  
6. A material scope change should normally create a replacement Relationship or Relationship revision while retaining history.  
7. Baseline scope does not alter Baseline membership.  
8. A Relationship cannot add or remove a Requirement Content Version from a Requirement Baseline.  
9. A locked Requirement Baseline cannot be modified through Relationship scope operations.  
10. **Baseline projection** and **Baseline-scoped Relationships** are distinct:  
    - Baseline projection derives visible Relationships among Baseline members.  
    - Baseline-scoped Relationships explicitly declare applicability to that Baseline.  
11. Release scope must not be treated as synonymous with Baseline scope.  
12. Cross-tenant global Relationships remain forbidden.

---

## 14. Relationship Semantic Profile

The **Relationship Semantic Profile** is the combination of:

```text
Relationship Type
+ direction
+ endpoint identity mode
+ lifecycle state
+ strength
+ criticality
+ classification
+ scope
+ rationale
```

No single property is sufficient to describe the full meaning of a governed Relationship.

### 14.1 Illustrative example (non-authorising)

```text
Type: depends_on
Direction: Requirement A → Requirement B
Endpoint mode: Content-Version-pinned
Lifecycle: active
Strength: mandatory
Criticality: critical
Classification: security
Scope: baseline
Rationale: Authentication must be satisfied before protected payment operations
can be considered compliant within the selected release baseline.
```

This example is illustrative architecture content. It does not authorise implementation records.

---

## 15. Mandatory invariants

The following invariants are binding for any future ENG-020F implementation:

1. **Typed only** — every Relationship has an approved Relationship Type.  
2. **Tenant isolation** — source, target, and Relationship share the same tenant; cross-tenant Relationships are forbidden.  
3. **Endpoint existence** — endpoints must reference existing Requirements (and Requirement Content Versions when pinned).  
4. **No self-Relationship** — source and target must differ for the normative taxonomy.  
5. **No duplicate directed edge** — same `(type, source, target[, pin][, scope])` cannot be active twice.  
6. **Symmetric canonicalisation** — symmetric types store one canonical pair.  
7. **Cycle policy** — per Behaviour Model (§9); refinement/derivation/constraint forbid cycles; dependency cycles detectable and default-forbidden for authoritative graphs.  
8. **Supersession uniqueness** — a Requirement cannot be actively superseded by multiple unrelated successors in the same scope without explicit conflict handling.  
9. **Pin consistency** — if either endpoint is Content-Version-pinned, the version must belong to the referenced Requirement and tenant.  
10. **Baseline immutability respect** — Relationships must not mutate locked Baseline membership (ENG-020E).  
11. **No unlock-by-Relationship** — Relationships cannot reverse Baseline or Content Version immutability.  
12. **Server authority** — client-supplied available actions or graph edits are never authoritative.  
13. **Auditability** — create/update/transition/retire emit Platform-auditable facts.  
14. **Rationale** — mandatory where behaviour matrix or type policy requires it.  
15. **Semantic attributes** — strength, criticality, classification, and scope must be valid for the type and taxonomy.  
16. **Scope references** — project/release/baseline scopes must resolve to existing governing entities in-tenant.

---

## 16. Lifecycle model

Relationship lifecycle is distinct from Requirement lifecycle and Requirement Baseline lifecycle.

```text
draft → active → deprecated → retired
```

| State | Meaning |
| --- | --- |
| `draft` | Proposed Relationship; not used for authoritative downstream certification claims |
| `active` | Current semantic fact for living-model consumption |
| `deprecated` | Still visible for history/impact; must not be preferred for new design |
| `retired` | Terminal; retained for audit; excluded from default active graphs |

**Rules:**

- There must be no ordinary product deletion of historical Relationship facts (aligns with governed history culture of ENG-020D/020E).  
- Retirement is the ordinary end state.  
- Reactivation from `retired` should create a **new** Relationship entity; the retired fact remains preserved (architecture preference).  
- Requirement archive does not physically delete Relationships; endpoints become historically constrained and active graph queries exclude archived endpoints by default.

---

## 17. Integrity rules and conflict handling

Integrity for Relationships has complementary layers: referential, semantic, configuration, and analytical.

### 17.1 Referential integrity

Endpoints must resolve. Broken references are integrity failures, not silent omissions. They must be surfaced with sufficient identity information for authorised remediation.

### 17.2 Semantic integrity

Type rules, cardinality, cycle policy, rationale requirements, strength, criticality, classification, and scope validity hold at every transition to `active`.

### 17.3 Configuration integrity (interaction with ENG-020D/020E)

- Content Version pins inherit Content Version integrity (hash verification belongs to versioning).  
- Baseline projections must not invent membership; they only interpret Relationships among members (and declared external dependencies if policy allows — default for certification scope: **members only**).  
- Relationship records may later adopt deterministic fingerprints for locked Relationship sets; that extension must not redefine Baseline membership fingerprints (ENG-020E).

### 17.4 Activation validation

A draft Relationship may only transition to `active` after validation of:

- endpoint existence;  
- tenant equality;  
- endpoint pin ownership;  
- Relationship Type;  
- scope references;  
- rationale requirements;  
- duplicate detection;  
- symmetric canonicalisation;  
- cycle policy;  
- cardinality;  
- supersession uniqueness;  
- permitted classification;  
- permitted strength;  
- criticality validity.

### 17.5 Analytical integrity status

The architecture may recognise analytical integrity outcomes such as:

- `valid`  
- `warning`  
- `invalid`  
- `unresolved`

These are analytical results, not additional Relationship lifecycle states.

### 17.6 Concurrent modification

Future engineering must use optimistic concurrency or equivalent server-side protection to prevent silent overwriting of Relationship changes.

### 17.7 Conflicts

An active `conflicts_with` Relationship records a known conflict. It does not resolve the conflict.

Resolution must result in:

- retirement or deprecation of the conflict Relationship;  
- preservation of its history;  
- appropriate Requirement or Relationship changes;  
- an auditable rationale.

---

## 18. Version interaction (ENG-020D)

| Mode | Behaviour |
| --- | --- |
| Living Relationship | Endpoints are Requirement IDs; meaning follows current Requirements; unsuitable alone for certification freeze |
| Pinned Relationship | Endpoints include Requirement Content Version IDs; meaning is historically stable |
| Evolution | Editing Requirement content creates new Requirement Content Versions; living Relationships do not auto-migrate pins |
| Migration of pins | Changing a pin is a new Relationship revision or replace flow — never silent rewrite of historical pinned Relationships |

**Principle:** Requirement Content Versioning answers “what was the Requirement text?” Relationships answer “how do Requirements connect?” Pins join those answers when stability is required.

ENG-020D Content Version immutability is preserved without modification.

---

## 19. Baseline interaction and certification clarifications (ENG-020E)

Requirement Baselines remain governed configuration items of **Requirement Content Versions**.

### 19.1 Interaction rules

| Concern | Rule |
| --- | --- |
| Membership | Baseline membership is not expressed as Relationships; membership remains Baseline Items |
| Projection | A Baseline defines the set of Content Versions in scope; Baseline projection considers Relationships whose pinned endpoints are in that set (and type/behaviour policy) |
| Baseline-scoped Relationships | Explicit Relationships with scope `baseline` declare applicability to that Baseline without altering membership |
| Living Relationships outside membership | May exist but are **out of certification scope** for that Baseline unless separately justified by policy |
| Immutability | Locking a Baseline does not auto-lock all living Relationships |
| Fingerprint | Relationship analysis must not change the accepted ENG-020E Baseline fingerprint definition |

### 19.2 Certification clarifications

1. A locked Baseline freezes Content Version membership, not the entire living Requirements graph.  
2. Certification analysis must distinguish:  
   - living Requirement-level Relationships;  
   - Content-Version-pinned Relationships;  
   - Baseline projections;  
   - explicitly Baseline-scoped Relationships.  
3. Living Relationships must not be silently presented as frozen certification facts.  
4. A Baseline projection must identify:  
   - included internal edges;  
   - missing mandatory internal edges;  
   - external dependencies excluded by policy;  
   - unresolved conflicts;  
   - invalid or broken pinned references.  
5. A future Relationship-set fingerprint may supplement Baseline certification but must not overwrite or reinterpret the Baseline membership fingerprint.  
6. Certification remains a separate downstream decision.  
7. Graph completeness alone is not certification evidence.

ENG-020E Baseline immutability and the permanent CM principle (downstream consumers use Baselines, not mutable Requirements, for fixed quality scope) are preserved without modification.

---

## 20. Downstream consumption

| Consumer | Consumes | Must not |
| --- | --- | --- |
| Traceability | Active/pinned graphs, Baseline projections, Semantic Profiles | Own competing Relationship SoR |
| Coverage Analysis | Graphs + verification associations | Treat association existence as Requirement approval |
| Verification / Test Spec / Test Case | Requirement and Content Version identities; optional dependency context | Redefine `depends_on` / `refines` meaning |
| Execution / Evidence | Pinned identities used in execution scope | Rewrite Requirements Relationships |
| Certification | Baseline-scoped membership + projected/scoped Relationships + evidence | Auto-certify from graph connectivity |

Cross-domain associations (e.g. Verification→Requirement) are **associations**, not Requirements taxonomy types, unless Owner later expands taxonomy deliberately.

---

## 21. Traceability implications

Traceability is a **downstream analytical capability**, not a synonym for Relationships.

### 21.1 Traceability may derive

- upstream Relationships;  
- downstream Relationships;  
- impact sets;  
- orphan Requirements;  
- missing mandatory Relationships;  
- unresolved conflicts;  
- circular dependency warnings;  
- supersession chains;  
- refinement trees;  
- classification-specific matrices;  
- criticality-specific views;  
- Baseline-scoped Relationship matrices;  
- Relationship ageing;  
- deprecated or retired dependency exposure.

### 21.2 Traceability must not

- create authoritative Relationships without Requirements commands;  
- alter Relationship lifecycle directly;  
- redefine Relationship Types;  
- reinterpret scope;  
- silently convert living Relationships into pinned Relationships;  
- infer certification;  
- infer Requirement approval;  
- hide broken Relationships from authorised governance users.

Traceability matrices, orphan detection, and coverage percentages are **derived read models**. They may be eventually consistent; they are never the SoR for Relationship existence.

---

## 22. Extensibility and Taxonomy Governance

### 22.1 Extensibility

| Extension | Allowed when |
| --- | --- |
| New Relationship Types | Owner-approved taxonomy change; versioned taxonomy schema |
| Custom attributes on Relationships | Namespaced; cannot override invariants |
| Cross-domain association types | Owned by the foreign domain; registered against Requirements identity rules |
| Import mappings from external ALM | Mapping tables to taxonomy; unmapped types cannot become authoritative |

**Forbidden:** modules inventing private Requirement-to-Requirement graphs, or UI-only Relationships that bypass lifecycle and audit.

### 22.2 Relationship Taxonomy Definition

A future taxonomy definition must be capable of declaring:

- canonical type key;  
- display name;  
- description;  
- direction policy;  
- inverse label;  
- symmetric status;  
- allowed endpoint modes;  
- allowed lifecycle transitions;  
- cycle policy;  
- rationale requirement;  
- default strength;  
- allowed strength overrides;  
- default impact significance;  
- certification relevance;  
- allowed classifications;  
- allowed scopes;  
- cardinality policy;  
- supersession rules where relevant;  
- whether the type participates in strict Traceability by default;  
- whether the type participates in Baseline projection by default;  
- orphan-analysis relevance;  
- propagation meaning;  
- blocking meaning (policy-gated).

### 22.3 Taxonomy governance rules

- Taxonomy is versioned.  
- Taxonomy changes are governed.  
- Taxonomy changes must not silently reinterpret existing historical Relationships.  
- Removal of an existing type requires migration and preservation policy.  
- UI labels are not authoritative taxonomy keys.  
- Imported external link types require explicit mapping.  
- Unmapped external links remain non-authoritative.  

This architecture programme does **not** define database tables or APIs for taxonomy.

---

## 23. AI-Assisted Relationship Analysis

AI implementation remains out of scope for APZQEP-ARCH-005 and ENG-020F unless separately authorised.

Future rules:

1. AI may suggest potential Relationships.  
2. AI may suggest type, direction, rationale, strength, classification, criticality, or scope.  
3. AI suggestions are never authoritative Relationship facts.  
4. AI must not activate, deprecate, retire, or rewrite a governed Relationship without an authorised human decision path.  
5. AI confidence scores are analytical metadata and not Relationship strength.  
6. AI-generated rationale must be identified as AI-assisted until confirmed by a human.  
7. AI must not cross tenant boundaries.  
8. AI processing must follow Platform security, privacy, audit, and data-governance rules.  
9. AI suggestions rejected by users must not silently reappear as active facts.  
10. No AI or MCP implementation is authorised by APZQEP-ARCH-005.

---

## 24. Security model

- Platform authentication is required for all Relationship operations.  
- Authorisation via Platform PermissionService with Requirements-scoped permissions (named at engineering time), at minimum separating view / create / modify / transition / retire.  
- Server-side enforcement only; UI visibility is not a security boundary.  
- Superadmin remains an explicit audited tier, not a silent bypass of invariants.  
- No mass assignment of lifecycle state, tenant, endpoint pins, strength, criticality, classification, or scope from untrusted clients.  
- Relationship rationale and descriptions are subject to ordinary data-protection handling; no secrets in Relationship payloads.

---

## 25. Tenant model

- Every Relationship is tenant-scoped.  
- Endpoints must belong to the same tenant.  
- Cross-tenant Relationship edges are architectural defects.  
- Future multi-workspace policies may further scope visibility, but must not weaken tenant isolation.  
- Search and analytics indexes must preserve tenant boundaries.

---

## 26. Query model

Logical query surfaces (contracts, not transport paths):

1. **By Requirement** — outbound / inbound / both; filter by type, lifecycle, strength, criticality, classification, scope.  
2. **Neighbourhood** — bounded-depth expansion with cycle guards.  
3. **Path** — existence/shortest explanatory path between two Requirements (analytical).  
4. **Baseline projection** — Relationships among Baseline members (pinned interpretation).  
5. **Baseline-scoped set** — Relationships explicitly scoped to a Baseline.  
6. **Impact set** — dependents/dependencies for change impact, honouring behaviour and criticality.  
7. **Conflict set** — active `conflicts_with` for a scope.

Queries return **read models**. They must not expose persistence internals or engine names.

Default queries exclude `retired` and, unless requested, `deprecated`.

---

## 27. Performance principles

- Ordinary list/neighbourhood queries must be index-friendly by tenant, endpoint, type, state, and scope.  
- Deep graph walks are bounded (depth and edge caps); unbounded recursion is forbidden in request handlers.  
- Heavy impact analysis is asynchronous where scale demands.  
- Baseline projection should start from membership set, not full tenant graph scan.  
- Relationship volume per Requirement should be treated as a soft operational limit with documented degradation behaviour at engineering time.  
- Derived Traceability read models may lag; SoR reads remain correct.

---

## 28. Implementation Neutrality

The Requirements Relationship Architecture does **not** mandate a graph database.

A conforming implementation may use:

- PostgreSQL relational structures;  
- recursive SQL;  
- materialised read models;  
- search indexes;  
- specialised graph technology;  
- a combination of these approaches.

The implementation choice must preserve:

- Requirements ownership;  
- tenant isolation;  
- semantic invariants;  
- auditability;  
- historical retention;  
- transactional correctness;  
- bounded graph traversal;  
- portability where practical;  
- Platform 1.4 integration rules.

No graph engine, database vendor, cloud service, or persistence mechanism may become part of the domain language.

A future engineering decision may introduce specialised graph technology only when justified by measured product need.

Premature graph-platform extraction is prohibited.

This section does not define table names, migration numbers, API paths, or package layouts.

---

## 29. Governance rules

1. Architecture before engineering for Relationships (this programme).  
2. ENG-020F is phase **PLANNING** with implementation **AUTHORISED TO BEGIN**, subject to a separate Owner Engineering Programme Instruction before coding.  
3. Taxonomy changes require Owner (or delegated architecture) approval.  
4. Relationships must not break ENG-020D immutability or ENG-020E Baseline immutability.  
5. Traceability must not fork SoR.  
6. No generic “relationship engine” extraction is required for the first engineering programme; premature platform-genericisation is discouraged.  
7. Documentation must distinguish living, pinned, Baseline-projected, and Baseline-scoped meanings.  
8. Accessibility, security, audit, and tenancy follow Platform 1.4 norms at engineering time.  
9. Downstream domains consume Requirement Baselines for fixed quality scope (binding from ENG-020E).  
10. Strength, criticality, classification, and scope are governed semantic attributes, not UI decoration.

---

## 30. Future roadmap (architecture sequence, not authorisation)

| Stage | Focus | Authorisation status |
| --- | --- | --- |
| ARCH-005 (this) | Requirements Relationship Architecture Specification | **ACCEPTED / CLOSED / COMPLETE** |
| ENG-020F | Implement Requirements Relationship Model per accepted architecture | Phase **PLANNING** · Implementation **AUTHORISED TO BEGIN** (await Owner Engineering Programme Instruction) |
| Traceability programme | Matrices, coverage, impact UX/analysis | Separate; after Relationships exist |
| Verification / Tests / Execution / Evidence / Certification | Cross-domain associations + consumption of Baselines and Relationship projections | Separate programmes |
| Optional later | Locked Relationship-set integrity fingerprints; advanced path analytics; external ALM sync; AI-assisted suggestions | Separate |

This roadmap does not authorise any stage beyond architecture for ARCH-005.

---

## 31. Alignment with accepted engineering baselines

| Accepted programme | Preserved constraint |
| --- | --- |
| ENG-020A | Requirements domain ownership and ubiquitous language |
| ENG-020B | Persistence/CRUD patterns remain Requirements-owned when engineering begins |
| ENG-020C | Requirement lifecycle remains separate from Relationship lifecycle |
| ENG-020D | Requirement Content Versions immutable; Relationship pins reference them |
| ENG-020E | Requirement Baselines are configuration items of Content Versions; membership ≠ Relationships; no unlock |

---

## 32. Explicit non-goals of this architecture

- Implementing ENG-020F  
- Defining REST paths, table schemas, or package layouts as commitments  
- Defining Traceability UI  
- Defining Verification association schemas in detail  
- Electronic signatures for Relationships  
- AI-inferred Relationships as authoritative facts  
- Cross-tenant Relationship meshes  
- Auto-blocking Requirement lifecycle from Relationship state without a separate policy programme  

---

## 33. Terminology

Use consistently:

| Term | Meaning |
| --- | --- |
| Requirements Relationship Architecture | This Owner Architecture Specification (APZQEP-ARCH-005) |
| Requirements Relationship Model | The future engineered capability (ENG-020F), not yet authorised for implementation |
| Requirement | Governed Requirements entity |
| Requirement Content Version | Immutable content snapshot (ENG-020D) |
| Requirement Baseline | Governed configuration item of Content Versions (ENG-020E) |
| Relationship | First-class governed semantic entity |
| Relationship Type | Taxonomy key (`refines`, `depends_on`, …) |
| Relationship Semantic Profile | Full combination defined in §14 |
| Baseline Projection | Derived view of Relationships among Baseline members |
| Traceability | Downstream analytical capability consuming Relationships |

“Link” may appear in explanatory prose, but the governed domain entity is a **Relationship**. Do not use “link” and “Relationship” interchangeably where the distinction could weaken governance.

---

## 34. Owner acceptance gate for this architecture

This Architecture Specification is ready for Owner review when it is judged to answer:

1. What a Requirement Relationship is and is not  
2. Who owns it  
3. What types, behaviour, strength, criticality, classification, and scope mean  
4. What a complete Relationship Semantic Profile contains  
5. How integrity, activation, conflicts, and broken endpoints are governed  
6. How it interacts with Requirement Content Versions and Requirement Baselines  
7. How Traceability and downstream domains must consume it  
8. How AI suggestions are constrained  
9. That implementation technology remains neutral  
10. What remains forbidden until engineering authorisation  

**Acceptance of APZQEP-ARCH-005 is a prerequisite to authorising APZQEP-ENG-020F.**

---

## 35. Final statement

**APZQEP-ARCH-005 — Requirements Relationship Architecture** (revision **1.1.0-arch**) is the authoritative semantic foundation for Requirements Relationships in APZ QEP.

```text
APZQEP-ARCH-005:
ACCEPTED / CLOSED / COMPLETE
Authoritative Architecture

APZQEP-ENG-020F:
Phase — PLANNING
Implementation — AUTHORISED TO BEGIN

Repository engineering baseline:
APZQEP-ENG-020E
ACCEPTED / CLOSED / COMPLETE
```

ENG-020F coding awaits a separate Owner Engineering Programme Instruction. Recommended preparation: Owner Engineering Specification (Parts 1–3) before implementation.
