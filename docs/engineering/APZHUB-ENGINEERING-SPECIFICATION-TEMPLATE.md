# APZHUB Enterprise Engineering Specification Template

| Field                    | Value                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Document                 | APZHUB-ENGINEERING-SPECIFICATION-TEMPLATE                                                                                 |
| Catalogue ID             | **ES-003**                                                                                                                |
| Programme                | APZHUB-ENG-002                                                                                                            |
| Classification           | Enterprise Engineering Standard                                                                                           |
| Status                   | **DRAFT — Under Review** (awaiting Dual Approval → Active)                                                                |
| Version                  | **1.0** (candidate)                                                                                                       |
| Authority                | [Portfolio Engineering Charter](./APZHUB-ENG-002/PORTFOLIO-ENGINEERING-CHARTER.md)                                        |
| Catalogue                | [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](./APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md)                                  |
| Baseline                 | [APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md](./APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md) **1.1** (unchanged until Active) |
| Ownership                | APZHUB Engineering Governance                                                                                             |
| Implementation authority | All APZHUB products (when Active)                                                                                         |
| Reference source         | APZQEP Engineering Specification Template v1.0 (abstracted, not duplicated)                                               |
| Source framework         | APZQEP Engineering Framework v1.0                                                                                         |
| Promotion method         | Abstraction                                                                                                               |
| Related Active standards | [ES-001](./APZHUB-TESTING-STANDARD.md) · [ES-002](./APZHUB-CERTIFICATION-STANDARD.md)                                     |
| Process parents          | APZHUB-ENG-001 / ADR-0092                                                                                                 |
| Scope                    | All APZHUB engineering programmes and engineering slices                                                                  |
| Compliance               | **Mandatory** when Active                                                                                                 |
| Exceptions               | Only by approved ADR                                                                                                      |

---

## 0. Purpose of this template

This document is the **engineering contract** between Product Board (or Owner) and Engineering.

It defines the mandatory structure for engineering programmes and engineering slices across APZHUB.

It is not a loose checklist. Every engineering specification SHALL be created by copying **Section 2** and filling placeholders. Sections that do not apply SHALL be present and marked `NONE` or `N/A` with a one-line reason—they SHALL NOT be omitted.

### What Product Board / Owner fills

- identity, authority, objectives, business impact;
- scope / out of scope;
- dependencies graph;
- acceptance criteria;
- stop conditions;
- release / deployment authority (almost always `NONE` for a pure engineering slice);
- special constraints.

### What Engineering inherits (MUST NOT redefine)

| Topic                          | Source                                                                   |
| ------------------------------ | ------------------------------------------------------------------------ |
| Slice lifecycle methodology    | APZHUB-ENG-001 / ADR-0092                                                |
| Testing obligations            | Enterprise Testing Standard (**ES-001**) when Active                     |
| Certification outcomes / gates | Enterprise Certification Standard (**ES-002**) when Active               |
| Enterprise adopted set         | Enterprise Engineering Baseline (current version)                        |
| Product specialisations        | Product Engineering Framework (if any) — MUST NOT weaken Active Baseline |

### Hierarchy

```text
Document 000 / Foundation
        │
        ▼
Portfolio Engineering Charter
        │
        ▼
Enterprise Engineering Baseline (current)
        │
        ├── ES-001 Testing
        ├── ES-002 Certification
        └── ES-003 Specification Template   ← this document
                │
                ▼
        Engineering Specifications   ← instances of this template
```

---

## 1. How to use

1. Copy **Section 2** into a new engineering specification file (or Owner instruction body).
2. Replace every `{{PLACEHOLDER}}`.
3. Set non-applicable fields to `NONE` / `N/A` with reason.
4. Do not paste Handbook, Standards, or Baseline text into the specification.
5. Certify against **ES-002** (when Active) plus this contract’s Acceptance Criteria; until ES-002 is Active for a product’s citation path, use operable APZHUB-ENG-001 practice plus Acceptance Criteria.

Suggested filename patterns (products MAY specialise paths):

```text
docs/products/<product>/<programme-path>/<WORK_ID>-ENGINEERING-SPEC.md
docs/engineering/.../<WORK_ID>-ENGINEERING-SPEC.md
```

---

## 2. Engineering Specification (copy and fill)

> **Instruction:** Duplicate everything under this heading into the work specification. Replace placeholders. Keep every section.

### 2.1 Programme metadata / identity

| Field                | Value                                                  |
| -------------------- | ------------------------------------------------------ |
| Document             | Engineering Specification                              |
| Work ID              | `{{WORK_ID}}`                                          |
| Title                | `{{TITLE}}`                                            |
| Programme            | `{{PROGRAMME_ID}}`                                     |
| Product              | `{{PRODUCT}}`                                          |
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
  Enterprise Engineering Baseline (current version)
  ES-001 Enterprise Testing Standard (when Active)
  ES-002 Enterprise Certification Standard (when Active)
  Applicable product Engineering Framework (specialisation only)

This specification authorises {{WORK_ID}} only.
No other unit of work is authorised by this document.
```

### 2.3 Objectives

`{{OBJECTIVES}}`

### 2.4 Business impact

`{{BUSINESS_IMPACT}}`

### 2.5 Architecture impact

| Topic                              | Statement                     |
| ---------------------------------- | ----------------------------- |
| Architecture references            | `{{ARCHITECTURE_REFERENCES}}` |
| Boundaries affected                | `{{BOUNDARIES_AFFECTED}}`     |
| New ports / adapters               | `{{NEW_PORTS_ADAPTERS}}`      |
| Provider / engine impact           | `{{PROVIDER_IMPACT}}`         |
| Layering risk                      | `{{LAYERING_RISK}}`           |
| Architecture confirmation required | YES / NO                      |

Confirmation result (Engineering fills during work):

```text
Architecture confirmation: PASS / EXCEPTION → STOP
Evidence: {{ARCHITECTURE_CONFIRMATION_NOTE}}
```

### 2.6 Current Baseline

```text
Enterprise Engineering Baseline version: {{ENTERPRISE_BASELINE_VERSION}}
Repository baseline commit / tag inspected: {{REPO_BASELINE_REF}}
Known certified predecessors: {{CERTIFIED_PREDECESSORS}}
Open limitations relevant to this work: {{OPEN_LIMITATIONS}}
```

### 2.7 Repository inspection

Engineering SHALL inspect before implementation and record:

| Area                 | Result (COMPLETE / PARTIAL / MISSING / N/A) | Notes       |
| -------------------- | ------------------------------------------- | ----------- |
| `{{INSPECT_AREA_1}}` | `{{RESULT}}`                                | `{{NOTES}}` |
| `{{INSPECT_AREA_2}}` | `{{RESULT}}`                                | `{{NOTES}}` |

Inspection status: `{{INSPECTION_STATUS}}`

### 2.8 Dependencies (mandatory)

Every specification MUST complete this section. Use `NONE` where empty—do not omit fields.

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

| Field              | Meaning                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Depends On         | Prior work, packages, or platform capabilities that MUST already be certified or available |
| Delivers           | Capabilities this work makes true after certification                                      |
| Blocks             | Downstream work that MUST NOT start until this work is CERTIFIED / PASS                    |
| Deferred To        | Explicitly out-of-scope items assigned to future work                                      |
| Related ADRs       | ADRs that constrain or except behaviour                                                    |
| Related Programmes | Other programmes that interact with this work                                              |

### 2.9 Scope

**In scope**

- `{{IN_SCOPE_ITEM}}`

**Out of scope**

- `{{OUT_OF_SCOPE_ITEM}}`

### 2.10 Data

```text
Aggregates / entities: {{DOMAIN_ENTITIES}}
Invariants: {{DOMAIN_INVARIANTS}}
State / lifecycle: {{DOMAIN_STATE}}
Authoritative store impact: {{DATA_STORE_IMPACT}}
NONE if no data / domain model change.
```

### 2.11 API

```text
Endpoints / commands / queries: {{API_CHANGES}}
Contract version impact: {{API_VERSION_IMPACT}}
API docs updates: {{API_DOCS}}
NONE if no API change.
```

### 2.12 Events

```text
Events introduced: {{EVENTS_INTRODUCED}}
Events modified: {{EVENTS_MODIFIED}}
Subscribers impacted: {{SUBSCRIBERS_IMPACTED}}
NONE if no event change.
```

### 2.13 Security

```text
Authn impact: {{AUTHN_IMPACT}}
Authz / permissions: {{AUTHZ_IMPACT}}
Tenant isolation: {{TENANT_ISOLATION}}
Workspace / project isolation: {{WORKSPACE_ISOLATION}}
Default deny preserved: YES / NO
Secrets impact: {{SECRETS_IMPACT}}
Security tests required: YES / NO
```

If security tests are `NO`, state reason. Silence is non-compliant (ES-001).

### 2.14 Migration

```text
Data / schema migration required: YES / NO
Migrations: {{MIGRATIONS}}
Schema changes: {{SCHEMA_CHANGES}}
Additive only: YES / NO (NO requires Owner authority)
Migration plan: {{MIGRATION_PLAN}}
Rollback / forward-fix posture: {{MIGRATION_POSTURE}}
N/A if no migration.
```

### 2.15 Testing

```text
Unit: {{UNIT_TESTS}}
Integration: {{INTEGRATION_TESTS}}
Security: {{SECURITY_TESTS}}
Migration: {{MIGRATION_TESTS}}
Regression: {{REGRESSION_TESTS}}
Performance: {{PERFORMANCE_TESTS}}
Architecture boundary: {{BOUNDARY_TESTS}}
```

Normative expectations: **ES-001** Enterprise Testing Standard (when Active).

### 2.16 Documentation

```text
Documents to create: {{DOCS_CREATE}}
Documents to update: {{DOCS_UPDATE}}
Documents MUST NOT rewrite: {{DOCS_DO_NOT_REWRITE}}
```

### 2.17 Evidence

```text
Evidence root: docs/operations/evidence/<product-or-programme>/
Required artefacts: {{EVIDENCE_ARTEFACTS}}
Naming: <UTC>-<WORK_ID>-<ARTEFACT>.json
```

Minimum artefacts typically include COMPLETION and CERTIFICATION (ES-002); SECURITY / TESTING when those gates apply.

### 2.18 Certification

```text
Certification standard: ES-002 Enterprise Certification Standard (when Active)
Required outcome: PASS
Product Board review required: YES / NO
Release readiness claimed by this work: NO (default) / YES (only if Release authority granted)
```

### 2.19 Acceptance criteria

Numbered, testable criteria. Each MUST be verifiable from tests, evidence, or inspection.

1. `{{AC_1}}`
2. `{{AC_2}}`
3. `{{AC_3}}`

An acceptance criterion without a verification method is a specification defect (ES-001 / ES-002).

### 2.20 Stop conditions

Work MUST STOP and return a structured STOP report when any apply:

- `{{STOP_CONDITION_1}}`
- Architecture confirmation is EXCEPTION and cannot be resolved in scope
- Repository reality conflicts with Document 000 / enterprise standards and cannot be resolved in scope
- Required dependency in **Depends On** is missing or not certified
- Security default-deny or tenant isolation would be weakened to “complete” the work
- Scope expansion would be required without new Owner authority

### 2.21 Constraints

```text
Engineering: {{ENGINEERING_CONSTRAINTS}}
Package promotion: {{PACKAGE_CONSTRAINTS}}
Release: {{RELEASE}}
Deployment: {{DEPLOYMENT}}
Other: {{OTHER_CONSTRAINTS}}
```

Default for a pure engineering unit:

```text
Release: NONE
Deployment: NONE
```

### 2.22 Deliverables

- `{{DELIVERABLE_1}}`
- `{{DELIVERABLE_2}}`
- Engineering evidence pack
- Certification record
- Updated documentation listed above

### 2.23 Final report

Engineering MUST return:

```text
{{WORK_ID}}

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

1. Work IDs MUST be stable and unique within the product/programme naming convention.
2. Specifications MUST NOT redefine methodology already in ENG-001, Baseline standards, or product frameworks.
3. **Dependencies** MUST be explicit; empty means the word `NONE`, not an omitted section.
4. **Release** and **Deployment** MUST default to `NONE` unless the programme text grants authority.
5. Acceptance criteria MUST be testable.
6. Stop conditions MUST include architectural and dependency failures.
7. Final Report block MUST be returned at close.
8. Placeholders remaining as `{{...}}` at authorisation time are defects—Product Board MUST NOT authorise an incomplete contract except where a field is explicitly `TBD` with owner-visible risk.
9. When ES-003 is Active, product specification templates MAY specialise this structure; they MUST NOT omit mandatory sections or weaken Baseline obligations.

---

## 4. Short Owner prompt (optional cover)

For chat authorisation after a full specification exists, Owner MAY use a short cover that points at the filled specification:

```text
Work: {{WORK_ID}}
Specification: {{PATH_TO_FILLED_SPEC}}
Authority: OPEN for this unit only
Process: APZHUB-ENG-001 / ADR-0092
Inherit: Enterprise Engineering Baseline · ES-001 · ES-002 · this Specification
```

The short cover MUST NOT omit Acceptance Criteria if no full specification file is attached. In that case the short form MUST still include Objective, Scope, Exclusions, Dependencies, Acceptance Criteria, and Constraints per APZHUB-ENG-001.

---

## 5. Relationship to APZHUB-ENG-001 short template

| Artefact                                                         | Role                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| [ENGINEERING-SLICE-TEMPLATE.md](./ENGINEERING-SLICE-TEMPLATE.md) | Short Owner instruction form (ENG-001)                        |
| **This document (ES-003)**                                       | Full engineering contract structure for programmes and slices |

Products SHOULD use this template for non-trivial engineering contracts. The ENG-001 short form remains valid for brief Owner covers that point at a filled ES-003 instance (or include the mandatory short-form fields).

---

## 6. Reference implementation

| Item                 | Value                                                                             |
| -------------------- | --------------------------------------------------------------------------------- |
| Proving product      | APZQEP                                                                            |
| Source framework     | APZQEP Engineering Framework v1.0                                                 |
| Source artefact      | `docs/products/apzqep/engineering/APZQEP-SLICE-TEMPLATE.md`                       |
| Derivation method    | **Abstraction** — not duplication                                                 |
| Genericisation notes | [ES-003-GENERICISATION-NOTES.md](./APZHUB-ENG-002/ES-003-GENERICISATION-NOTES.md) |

---

## 7. Related documents

- [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](./APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md)
- [APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md](./APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md)
- [APZHUB-TESTING-STANDARD.md](./APZHUB-TESTING-STANDARD.md)
- [APZHUB-CERTIFICATION-STANDARD.md](./APZHUB-CERTIFICATION-STANDARD.md)
- [ENGINEERING-SLICE-STANDARD.md](./ENGINEERING-SLICE-STANDARD.md)
- [ENGINEERING-SLICE-TEMPLATE.md](./ENGINEERING-SLICE-TEMPLATE.md)
- Reference: `docs/products/apzqep/engineering/APZQEP-SLICE-TEMPLATE.md`

---

## Document history

| Version | Programme phase        | Status               | Notes                                                                         |
| ------- | ---------------------- | -------------------- | ----------------------------------------------------------------------------- |
| 1.0     | APZHUB-ENG-002 Phase 1 | DRAFT — Under Review | First enterprise Specification Template; abstracted from APZQEP template v1.0 |

---

_End of APZHUB Enterprise Engineering Specification Template (ES-003)_
