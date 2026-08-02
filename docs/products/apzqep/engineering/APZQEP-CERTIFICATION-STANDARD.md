# APZQEP Certification Standard

| Field                  | Value                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------- |
| Document               | APZQEP-CERTIFICATION-STANDARD                                                          |
| Programme              | APZQEP-ENG-001                                                                         |
| Framework              | [APZQEP Engineering Framework v1.0](./APZQEP-ENGINEERING-FRAMEWORK.md) — **extension** |
| Status                 | **Normative**                                                                          |
| Version                | **1.0**                                                                                |
| Authority              | [APZQEP Engineering Constitution](./APZQEP-ENGINEERING-CONSTITUTION.md)                |
| Guidance               | [APZQEP Engineering Handbook](./APZQEP-ENGINEERING-HANDBOOK.md) Part XI                |
| Testing                | [APZQEP Testing Standard](./APZQEP-TESTING-STANDARD.md)                                |
| Specification contract | [APZQEP-SLICE-TEMPLATE.md](./APZQEP-SLICE-TEMPLATE.md)                                 |
| Process parent         | APZHUB-ENG-001 / ADR-0092 · `docs/engineering/SLICE-CERTIFICATION.md`                  |
| Scope                  | All APZQEP engineering certification                                                   |
| Compliance             | **Mandatory**                                                                          |
| Exceptions             | Only by approved ADR                                                                   |

---

## 0. Normative language

The key words **MUST**, **MUST NOT**, **SHALL**, **SHALL NOT**, **SHOULD**, and **MAY** are interpreted as in [APZQEP-ENGINEERING-STANDARDS.md](./APZQEP-ENGINEERING-STANDARDS.md) §0.

This standard is an **extension** to Engineering Framework v1.0. It MUST NOT modify the Framework core (Constitution, Handbook, Standards, Specification Template, Framework declaration).

This standard specialises APZHUB-ENG-001 slice certification for APZQEP. It does not replace portfolio CERT programmes, freeze, or GA gates under the Lifecycle Standard.

---

## 1. Purpose

Certification is the formal determination that an authorised unit of work has met its contract—or that work must stop.

Certification exists to make completion **decidable**, **evidenced**, and **auditable**.

No engineering slice is complete without a certification outcome.

```text
NO SLICE COMPLETE WITHOUT CERTIFICATION RESULT
ENGINEERING PASS ≠ PRODUCT BOARD CERTIFIED ≠ RELEASE ≠ GA
```

---

## 2. Certification vocabulary

### 2.1 Primary outcomes (engineering slice)

| Outcome  | Meaning                                                                             | May close slice as complete?         |
| -------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| **PASS** | All mandatory gates and acceptance criteria are satisfied; required evidence filed  | YES                                  |
| **FAIL** | One or more gates or acceptance criteria failed; defect is in-scope and fixable     | NO — remediate in-slice or STOP      |
| **STOP** | Work cannot continue within authorised scope without Owner / Product Board decision | NO — structured STOP report required |

### 2.2 Related outcomes (may appear in records)

| Outcome              | Meaning                                                                           | Use                                             |
| -------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| **CONDITIONAL PASS** | PASS criteria met with Owner-accepted residual risk / waiver recorded in evidence | YES, only with waiver artefact                  |
| **BLOCKED**          | External dependency or out-of-scope defect prevents progress                      | NO — await Owner; often maps to STOP for agents |
| **CERTIFIED**        | Product Board decision accepting a programme phase or Framework artefact          | Board-level only                                |
| **REJECTED**         | Product Board rejects the submitted artefact or phase                             | Board-level only                                |

Engineering agents closing a slice MUST use **PASS**, **FAIL**, or **STOP** as the primary certification result unless the Owner instruction explicitly authorises CONDITIONAL PASS with a recorded waiver.

### 2.3 Outcome rules

1. **PASS** MUST NOT be claimed if any mandatory gate is FAIL or N/A-when-required.
2. **FAIL** MUST be used when in-scope remediation is still possible under the same slice authority.
3. **STOP** MUST be used when Constitution, architecture, missing dependency, or safety conflict cannot be resolved in scope.
4. Weakening tests, skipping evidence, or expanding scope to force PASS is prohibited.
5. Certified historical slices (for example APZQEP-120-S01…S06) MUST NOT be reopened by this standard.

---

## 3. Levels of certification

| Level                           | What it certifies                                                          | Authority                                                     |
| ------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Engineering certification**   | Slice meets Engineering Specification + Framework + Testing Standard gates | Engineering (agent/lead) under Owner slice authority          |
| **Product Board certification** | Programme phase or Framework artefact accepted by Product Board            | Product Board / Owner                                         |
| **Remediation certification**   | Fix slice or remediation programme meets its narrower contract             | Same as engineering certification for that authorised unit    |
| **Release certification**       | Release candidate / promotion meets Lifecycle release gates                | Release / Lifecycle authority — **not** implied by slice PASS |
| **Package / capability CERT**   | Broader CERT programme when Owner opens one                                | Separate CERT programme                                       |
| **GA / freeze**                 | Portfolio lifecycle                                                        | Lifecycle Standard — out of scope here                        |

A slice **PASS** MUST NOT be presented as release readiness, GA, or package promotion authority.

---

## 4. Engineering certification gates

All applicable gates MUST be PASS (or N/A with justification recorded) for an engineering **PASS**.

### 4.1 Authority gate

- Slice is Owner-authorised.
- Scope matches the Engineering Specification.
- Release / Deployment remain `NONE` unless explicitly granted.
- Framework citation present: `Conforms to APZQEP Engineering Framework v1.0` (or successor).

### 4.2 Architecture gate

- Architecture confirmation is PASS.
- Layer and ownership boundaries preserved.
- No Constitution violation.

### 4.3 Implementation gate

- In-scope deliverables complete.
- Engineering Standards naming/layout observed (or ADR exception linked).
- No undocumented security-, persistence-, or user-visible behaviour introduced.

### 4.4 Testing gate

- Levels required by [APZQEP-TESTING-STANDARD.md](./APZQEP-TESTING-STANDARD.md) for the change types are executed and PASS.
- Acceptance criteria mapped to verification.
- Regression green for packages touched.

### 4.5 Security gate

**PASS** requires, for paths in scope:

- default deny preserved;
- no cross-tenant leakage in tested paths;
- project isolation preserved where applicable;
- deny paths covered for missing permission / unauthenticated as applicable;
- no secrets in code, logs, or evidence payloads;
- security tests executed when Testing Standard §6.3 mandates them.

**FAIL** if any P0 security defect remains in slice scope.  
**STOP** / **BLOCKED** if a security defect is found outside slice scope and Owner decision is required.

### 4.6 Migration gate

- When schema changes: additive unless Owner authority; migration tests PASS.
- Identifiers / authoritative content compatibility evidenced.

### 4.7 Documentation gate

- Required docs created/updated per specification.
- Frozen authoritative artefacts not rewritten.
- Limitations closed/opened recorded honestly.

### 4.8 Evidence gate

- Required evidence artefacts filed (Section 6).
- Timestamps and slice IDs correct.
- No secrets in evidence.

### 4.9 Repository gate

- Working tree clean after authorised commits (or explicitly reported dirty with reason before final PASS).
- No unrelated changes smuggled.
- Touched packages build / typecheck / test as required.
- Repository remains releasable (mainline not broken).

### 4.10 Regression gate

- Per Testing Standard and APZHUB-ENG-001 regression policy.
- Intentional behaviour changes documented.

---

## 5. Product Board certification

Product Board certification applies to programme phases, Framework milestones, and product-significant decisions.

| Board outcome | Meaning                                                 |
| ------------- | ------------------------------------------------------- |
| **CERTIFIED** | Artefact/phase accepted; may proceed per recommendation |
| **REJECTED**  | Not accepted; remediation or rewrite required           |
| **DEFERRED**  | Decision postponed with recorded reason                 |

Product Board CERTIFIED on a documentation phase MUST NOT be treated as engineering slice PASS for unrelated code slices.

Board evidence SHOULD use artefact token `PRODUCT-BOARD` per Engineering Standards §14–15.

---

## 6. Evidence requirements

### 6.1 Path

```text
docs/operations/evidence/apzqep/
```

Filename pattern (Engineering Standards §14):

```text
<UTC_TIMESTAMP>-<SLICE_OR_PROGRAMME>-<ARTEFACT>.json
```

### 6.2 Mandatory artefacts — engineering slice

| Artefact                                  | When                                                                |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `COMPLETION`                              | Always                                                              |
| `CERTIFICATION`                           | Always                                                              |
| `SECURITY`                                | When security gate applies (Testing Standard §6.3 or specification) |
| `TESTING`                                 | When non-trivial tests run (SHOULD always for code slices)          |
| Engineering notes / specification updates | Always for non-trivial slices                                       |
| Commit hashes                             | After commits that close the slice                                  |

### 6.3 Certification JSON (minimum fields)

```json
{
  "slice": "{{SLICE_ID}}",
  "result": "PASS | FAIL | STOP",
  "timestampUtc": "{{UTC}}",
  "framework": "APZQEP Engineering Framework v1.0",
  "acceptanceCriteria": [],
  "gates": {
    "authority": "PASS | FAIL",
    "architecture": "PASS | FAIL | N/A",
    "implementation": "PASS | FAIL",
    "testing": "PASS | FAIL | N/A",
    "security": "PASS | FAIL | N/A",
    "migration": "PASS | FAIL | N/A",
    "documentation": "PASS | FAIL",
    "evidence": "PASS | FAIL",
    "repository": "PASS | FAIL",
    "regression": "PASS | FAIL | N/A"
  },
  "waivers": [],
  "dependsOnSatisfied": true,
  "delivers": [],
  "outstandingIssues": "NONE | …",
  "recommendation": "{{NEXT_OR_STOP}}"
}
```

### 6.4 Completion reports

Engineering MUST return the Final Report block from the Engineering Specification Template.

Documentation programmes (such as APZQEP-ENG-001 phases) MUST file phase completion / validation evidence and Product Board decisions when applicable.

---

## 7. Regression requirements

1. Packages touched by the slice MUST have their automated tests PASS.
2. Shared contract / authz changes MUST include consumer-impact consideration in evidence.
3. Migration / persistence changes MUST include migration validation.
4. Full-repo Playwright is NOT required every slice unless the specification demands it.
5. Silent removal of security/isolation assertions to obtain PASS is a certification defect.

---

## 8. Remediation certification

When a remediation slice or follow-up is authorised:

1. It MUST have its own Engineering Specification (or short Owner cover with full required fields).
2. It MUST be independently certifiable (Constitution).
3. It MUST NOT silently enlarge into unrelated feature work.
4. Evidence MUST reference the defect or STOP that caused remediation.
5. Original FAIL/STOP records MUST remain; remediation does not rewrite history.

---

## 9. Release certification

Release certification is **out of band** from engineering slice PASS.

Release certification MUST follow Lifecycle / release governance and requires explicit release authority.

Engineering Framework conformance is necessary but not sufficient for release.

---

## 10. Closure requirements

A slice may be closed only when:

1. Primary outcome is PASS, or FAIL/STOP with structured report and no false “complete” claim;
2. Evidence is filed;
3. Dependencies / Delivers / Blocks fields in the Final Report are honest;
4. No next slice is auto-started without new Owner authority;
5. Repository state matches the claimed Repository gate.

---

## 11. STOP conditions (normative triggers)

Engineering MUST STOP when:

- architecture confirmation is EXCEPTION and unresolvable in scope;
- Constitution or Framework core would be violated by the only available fix;
- a **Depends On** item is missing or not certified;
- security default-deny or tenant isolation would be weakened to finish;
- acceptance criteria cannot be met without unauthorised scope expansion;
- repository reality conflicts with the authorised specification and cannot be reconciled in scope.

STOP reports MUST state: conflict, evidence inspected, options considered, and recommendation for Owner.

---

## 12. Relationship to other artefacts

| Artefact                           | Role relative to this standard                   |
| ---------------------------------- | ------------------------------------------------ |
| Engineering Specification          | Contract under test                              |
| Testing Standard                   | Defines testing gate content                     |
| Engineering Standards              | Evidence/certification naming                    |
| APZHUB-ENG-001 Slice Certification | Enterprise process parent                        |
| Lifecycle / CERT programmes        | Higher product certification — not replaced here |

---

## 13. Compliance and exceptions

1. All APZQEP engineering slices MUST comply with this standard.
2. Exceptions MUST be granted only by approved ADR linked from the slice.
3. AI agents MUST apply this standard without restatement in each slice prompt.
4. On conflict with Constitution or Framework core, those prevail; then STOP if unresolvable.

---

## 14. Quick reference

```text
Outcomes:     PASS | FAIL | STOP
Board:        CERTIFIED | REJECTED | DEFERRED
Gates:        authority · architecture · implementation · testing · security ·
              migration · documentation · evidence · repository · regression
Evidence:     COMPLETION + CERTIFICATION (+ SECURITY/TESTING as required)
Always true:  PASS ≠ Release ≠ GA
Cite:         Conforms to APZQEP Engineering Framework v1.0
```

---

## 15. Related documents

- [APZQEP-ENGINEERING-FRAMEWORK.md](./APZQEP-ENGINEERING-FRAMEWORK.md)
- [APZQEP-ENGINEERING-FRAMEWORK-CHANGELOG.md](./APZQEP-ENGINEERING-FRAMEWORK-CHANGELOG.md)
- [APZQEP-TESTING-STANDARD.md](./APZQEP-TESTING-STANDARD.md)
- [APZQEP-SLICE-TEMPLATE.md](./APZQEP-SLICE-TEMPLATE.md)
- [APZQEP-CHECKLISTS.md](./APZQEP-CHECKLISTS.md)
- `docs/engineering/SLICE-CERTIFICATION.md`
- APZHUB Lifecycle Standard

---

## Document history

| Version | Phase                  | Status               | Notes                                                  |
| ------- | ---------------------- | -------------------- | ------------------------------------------------------ |
| 1.0     | APZQEP-ENG-001 Phase 6 | Normative / COMPLETE | First Certification Standard; Framework v1.0 extension |

---

_End of APZQEP Certification Standard_
