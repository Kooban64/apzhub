# APZQEP Engineering Specification Template

| Field           | Value                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| Document        | APZQEP-SLICE-TEMPLATE                                                   |
| Title           | Engineering Specification Template                                      |
| Programme       | APZQEP-ENG-001                                                          |
| Status          | **Normative**                                                           |
| Version         | **1.0**                                                                 |
| Authority       | [APZQEP Engineering Constitution](./APZQEP-ENGINEERING-CONSTITUTION.md) |
| Guidance        | [APZQEP Engineering Handbook](./APZQEP-ENGINEERING-HANDBOOK.md)         |
| Coding standard | [APZQEP Engineering Standards](./APZQEP-ENGINEERING-STANDARDS.md)       |
| Process parent  | APZHUB-ENG-001 / ADR-0092                                               |
| Scope           | All APZQEP engineering slice specifications                             |
| Compliance      | **Mandatory**                                                           |
| Exceptions      | Only by approved ADR                                                    |

---

## 0. Purpose of this template

This document is the **engineering contract** between Product Board (or Owner) and Engineering.

It is not a loose checklist. Every APZQEP engineering slice specification SHALL be created by copying Section 2 and filling placeholders. Sections that do not apply SHALL be present and marked `NONE` or `N/A` with a one-line reason—they SHALL NOT be omitted.

### What Product Board / Owner fills

- identity, authority, purpose, business objective;
- scope / out of scope;
- dependencies graph;
- acceptance criteria;
- stop conditions;
- release / deployment authority (almost always `NONE` for a pure engineering slice);
- special constraints.

### What Engineering inherits (MUST NOT redefine)

| Topic                                       | Source                                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Methodology                                 | Handbook + APZHUB-ENG-001                                                                 |
| Naming, layout, commits, evidence filenames | Engineering Standards                                                                     |
| Principles                                  | Constitution                                                                              |
| Specialised rules                           | Testing / Certification / API / Events / Database / Documentation Standards when COMPLETE |

### Hierarchy

```text
APZHUB Engineering Standard
        │
        ▼
APZQEP Engineering Constitution
        │
        ▼
APZQEP Engineering Framework v1.0
        │
        ├── Engineering Handbook
        ├── Engineering Standards
        └── Specification Template   ← this document
                │
                ▼
        Engineering Specifications   ← instances of this template
```

Framework citation: [APZQEP-ENGINEERING-FRAMEWORK.md](./APZQEP-ENGINEERING-FRAMEWORK.md).

---

## 1. How to use

1. Copy **Section 2** into a new slice specification file (or Owner instruction body).
2. Replace every `{{PLACEHOLDER}}`.
3. Set non-applicable fields to `NONE` / `N/A` with reason.
4. Do not paste Handbook or Standards text into the slice.
5. Certify against Certification Standard + Checklists when COMPLETE; until then use APZHUB-ENG-001 certification practice plus this contract’s Acceptance Criteria.

Suggested filename for programme packs:

```text
docs/products/apzqep/<programme-path>/S<nn>-ENGINEERING-SPEC.md
```

Engineering notes after delivery MAY remain `S<nn>-ENGINEERING-NOTES.md` per Engineering Standards.

---

## 2. Engineering Specification (copy and fill)

> **Instruction:** Duplicate everything under this heading into the slice specification. Replace placeholders. Keep every section.

### 2.1 Identity

| Field                | Value                                                  |
| -------------------- | ------------------------------------------------------ |
| Document             | Engineering Specification                              |
| Slice ID             | `{{SLICE_ID}}`                                         |
| Title                | `{{TITLE}}`                                            |
| Programme            | `{{PROGRAMME_ID}}`                                     |
| Product              | APZQEP                                                 |
| Classification       | `{{CLASSIFICATION}}`                                   |
| Specification status | DRAFT / AUTHORISED / IN PROGRESS / CERTIFIED / STOPPED |
| Repository           | `{{REPOSITORY}}`                                       |
| Primary package(s)   | `{{PACKAGE}}`                                          |
| Release authority    | `{{RELEASE}}`                                          |
| Deployment authority | `{{DEPLOYMENT}}`                                       |

### 2.2 Authority

```text
Authority: {{AUTHORITY_STATEMENT}}

Inherited (MUST NOT redefine):
  APZHUB-ENG-001 / ADR-0092
  APZQEP Engineering Constitution
  APZQEP Engineering Framework v1.0
  APZQEP Engineering Handbook
  APZQEP Engineering Standards
  Applicable specialised Standards

This specification authorises {{SLICE_ID}} only.
No other slice is authorised by this document.
```

### 2.3 Purpose

`{{PURPOSE}}`

### 2.4 Business Objective

`{{BUSINESS_OBJECTIVE}}`

### 2.5 Architecture Impact

| Topic                              | Statement                     |
| ---------------------------------- | ----------------------------- |
| Architecture references            | `{{ARCHITECTURE_REFERENCES}}` |
| Boundaries affected                | `{{BOUNDARIES_AFFECTED}}`     |
| New ports / adapters               | `{{NEW_PORTS_ADAPTERS}}`      |
| Provider impact                    | `{{PROVIDER_IMPACT}}`         |
| Layering risk                      | `{{LAYERING_RISK}}`           |
| Architecture confirmation required | YES / NO                      |

Confirmation result (Engineering fills during slice):

```text
Architecture confirmation: PASS / EXCEPTION → STOP
Evidence: {{ARCHITECTURE_CONFIRMATION_NOTE}}
```

### 2.6 Current Baseline

```text
Baseline commit / tag inspected: {{BASELINE_REF}}
Known certified predecessors: {{CERTIFIED_PREDECESSORS}}
Open limitations relevant to this slice: {{OPEN_LIMITATIONS}}
```

### 2.7 Repository Inspection

Engineering SHALL inspect before implementation and record:

| Area                 | Result (COMPLETE / PARTIAL / MISSING / N/A) | Notes       |
| -------------------- | ------------------------------------------- | ----------- |
| `{{INSPECT_AREA_1}}` | `{{RESULT}}`                                | `{{NOTES}}` |
| `{{INSPECT_AREA_2}}` | `{{RESULT}}`                                | `{{NOTES}}` |

Inspection status: `{{INSPECTION_STATUS}}`

### 2.8 Dependencies (mandatory)

Every slice MUST complete this section. Use `NONE` where empty—do not omit fields.

```text
Depends On:
{{DEPENDS_ON}}

Delivers:
{{DELIVERS}}

Blocks:
{{BLOCKS}}

Deferred To:
{{DEFERRED_TO}}

Related ADRs:
{{RELATED_ADRS}}

Related Programmes:
{{RELATED_PROGRAMMES}}
```

| Field              | Meaning                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Depends On         | Prior slices, packages, or platform capabilities that MUST already be certified or available |
| Delivers           | Capabilities this slice makes true after certification                                       |
| Blocks             | Downstream work that MUST NOT start until this slice is CERTIFIED / PASS                     |
| Deferred To        | Explicitly out-of-scope items assigned to a future slice or programme                        |
| Related ADRs       | ADRs that constrain or except behaviour for this slice                                       |
| Related Programmes | Other programmes that interact with this slice                                               |

Example shape (illustrative only—not slice content):

```text
Depends On:
  S01
  S02

Delivers:
  {{CAPABILITY_NAME}}

Blocks:
  NONE

Deferred To:
  {{FUTURE_SLICE_OR_PROGRAMME}}

Related ADRs:
  ADR-0092

Related Programmes:
  {{PROGRAMME_ID}}
```

### 2.9 Scope

**In scope**

- `{{IN_SCOPE_ITEM}}`

**Out of scope**

- `{{OUT_OF_SCOPE_ITEM}}`

### 2.10 Domain Changes

```text
Aggregates / entities: {{DOMAIN_ENTITIES}}
Invariants: {{DOMAIN_INVARIANTS}}
State / lifecycle: {{DOMAIN_STATE}}
Domain events (raised): {{DOMAIN_EVENTS_RAISED}}
NONE if no domain model change.
```

### 2.11 API Changes

```text
Endpoints / commands / queries: {{API_CHANGES}}
Contract version impact: {{API_VERSION_IMPACT}}
OpenAPI / docs updates: {{API_DOCS}}
NONE if no API change.
```

Normative HTTP detail: API Standard when COMPLETE.

### 2.12 Database Changes

```text
Migrations: {{MIGRATIONS}}
Tables / columns / constraints: {{SCHEMA_CHANGES}}
Additive only: YES / NO (NO requires Owner authority)
NONE if no schema change.
```

Normative schema detail: Database Standard when COMPLETE.

### 2.13 Events

```text
Events introduced: {{EVENTS_INTRODUCED}}
Events modified: {{EVENTS_MODIFIED}}
Subscribers impacted: {{SUBSCRIBERS_IMPACTED}}
NONE if no event change.
```

Normative event detail: Domain Event Standard when COMPLETE.

### 2.14 Security

```text
Authn impact: {{AUTHN_IMPACT}}
Authz / permissions: {{AUTHZ_IMPACT}}
Tenant isolation: {{TENANT_ISOLATION}}
Project isolation: {{PROJECT_ISOLATION}}
Default deny preserved: YES / NO
Secrets impact: {{SECRETS_IMPACT}}
Security tests required: YES / NO
```

### 2.15 Performance

```text
Performance requirements: {{PERFORMANCE_REQUIREMENTS}}
Scalability notes: {{SCALABILITY_NOTES}}
NONE if no specific requirement beyond existing platform norms.
```

### 2.16 Migration

```text
Data migration required: YES / NO
Migration plan: {{MIGRATION_PLAN}}
Rollback / forward-fix posture: {{MIGRATION_POSTURE}}
N/A if no migration.
```

### 2.17 Testing

```text
Unit: {{UNIT_TESTS}}
Integration: {{INTEGRATION_TESTS}}
Security: {{SECURITY_TESTS}}
Migration: {{MIGRATION_TESTS}}
Regression: {{REGRESSION_TESTS}}
Performance: {{PERFORMANCE_TESTS}}
```

Normative expectations: Testing Standard when COMPLETE; else APZHUB-ENG-001 + Foundation 015.

### 2.18 Documentation

```text
Documents to create: {{DOCS_CREATE}}
Documents to update: {{DOCS_UPDATE}}
Documents MUST NOT rewrite: {{DOCS_DO_NOT_REWRITE}}
```

### 2.19 Evidence

```text
Evidence prefix: docs/operations/evidence/apzqep/
Required artefacts: {{EVIDENCE_ARTEFACTS}}
Naming: per APZQEP Engineering Standards §14
```

### 2.20 Certification

```text
Certification standard: APZQEP Certification Standard (when COMPLETE) + APZHUB-ENG-001
Required outcome: PASS
Product Board review required: YES / NO
Release readiness claimed by this slice: NO (default) / YES (only if Release authority granted)
```

### 2.21 Acceptance Criteria

Numbered, testable criteria. Each MUST be verifiable from tests, evidence, or inspection.

1. `{{AC_1}}`
2. `{{AC_2}}`
3. `{{AC_3}}`

### 2.22 Stop Conditions

Work MUST STOP and return a structured STOP report when any apply:

- `{{STOP_CONDITION_1}}`
- Architecture confirmation is EXCEPTION and cannot be resolved in scope
- Repository reality conflicts with Constitution / Standards and cannot be resolved in scope
- Required dependency in **Depends On** is missing or not certified
- Security default-deny or tenant isolation would be weakened to “complete” the slice
- Scope expansion would be required without new Owner authority

### 2.23 Constraints

```text
Engineering: {{ENGINEERING_CONSTRAINTS}}
Package promotion: {{PACKAGE_CONSTRAINTS}}
Release: {{RELEASE}}
Deployment: {{DEPLOYMENT}}
Other: {{OTHER_CONSTRAINTS}}
```

Default for a pure engineering slice:

```text
Release: NONE
Deployment: NONE
```

### 2.24 Deliverables

- `{{DELIVERABLE_1}}`
- `{{DELIVERABLE_2}}`
- Engineering evidence pack
- Certification record
- Updated documentation listed above

### 2.25 Final Report

Engineering MUST return:

```text
{{SLICE_ID}}

Status:
COMPLETE / FAIL / STOPPED

Classification:
{{CLASSIFICATION}}

Repository:
CLEAN / DIRTY

Engineering:
COMPLETE / NONE / PARTIAL

Testing:
PASS / FAIL / N/A

Security:
PASS / FAIL / N/A

Documentation:
UPDATED / N/A

Evidence:
COMPLETE / INCOMPLETE

Certification:
PASS / FAIL / STOP

Depends On (satisfied):
{{DEPENDS_ON_SATISFIED}}

Delivers:
{{DELIVERS}}

Blocks (cleared or still blocking):
{{BLOCKS_STATUS}}

Deferred To:
{{DEFERRED_TO}}

Outstanding Issues:
{{OUTSTANDING_ISSUES}}

Recommendation:
{{RECOMMENDATION}}
```

---

## 3. Normative rules for filled specifications

1. Slice IDs MUST match Engineering Standards (`APZQEP-<PROGRAMME>-S<nn>`).
2. Specifications MUST NOT redefine methodology already in Handbook / Standards.
3. **Dependencies** MUST be explicit; empty means the word `NONE`, not an omitted section.
4. **Release** and **Deployment** MUST default to `NONE` unless the programme text grants authority.
5. Acceptance criteria MUST be testable.
6. Stop conditions MUST include architectural and dependency failures.
7. Final Report block MUST be returned at slice close.
8. Placeholders remaining as `{{...}}` at authorisation time are defects—Product Board MUST NOT authorise an incomplete contract except where a field is explicitly `TBD` with owner-visible risk.

---

## 4. Short Owner prompt (optional cover)

For chat authorisation after a full specification exists, Owner MAY use a short cover that points at the filled specification:

```text
Slice: {{SLICE_ID}}
Specification: {{PATH_TO_FILLED_SPEC}}
Authority: OPEN for this slice only
Process: APZHUB-ENG-001 / ADR-0092
Inherit: APZQEP Constitution · Handbook · Standards · this Specification
```

The short cover MUST NOT omit Acceptance Criteria if no full specification file is attached. In that case the short form MUST still include Objective, Scope, Exclusions, Dependencies, Acceptance Criteria, and Constraints per APZHUB-ENG-001.

---

## 5. Related documents

- [APZQEP-ENGINEERING-CONSTITUTION.md](./APZQEP-ENGINEERING-CONSTITUTION.md)
- [APZQEP-ENGINEERING-HANDBOOK.md](./APZQEP-ENGINEERING-HANDBOOK.md)
- [APZQEP-ENGINEERING-STANDARDS.md](./APZQEP-ENGINEERING-STANDARDS.md)
- [APZQEP-TESTING-STANDARD.md](./APZQEP-TESTING-STANDARD.md)
- [APZQEP-CERTIFICATION-STANDARD.md](./APZQEP-CERTIFICATION-STANDARD.md)
- APZHUB `docs/engineering/ENGINEERING-SLICE-STANDARD.md`
- APZHUB `docs/engineering/ENGINEERING-SLICE-TEMPLATE.md`

This APZQEP template specialises the enterprise slice template for product engineering contracts. It does not replace APZHUB-ENG-001.

---

## Document history

| Version | Phase                  | Status               | Notes                                                                          |
| ------- | ---------------------- | -------------------- | ------------------------------------------------------------------------------ |
| 1.0     | APZQEP-ENG-001 Phase 4 | Normative / COMPLETE | Engineering Specification Template; mandatory Dependencies; contract structure |

---

_End of APZQEP Engineering Specification Template_
