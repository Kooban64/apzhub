# APZHUB Enterprise Certification Standard

| Field                    | Value                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Document                 | APZHUB-CERTIFICATION-STANDARD                                                                    |
| Catalogue ID             | **ES-002**                                                                                       |
| Programme                | APZHUB-ENG-002                                                                                   |
| Classification           | **Enterprise Engineering Standard**                                                              |
| Status                   | **ACTIVE**                                                                                       |
| Version                  | **1.0**                                                                                          |
| Authority                | [Portfolio Engineering Charter](./APZHUB-ENG-002/PORTFOLIO-ENGINEERING-CHARTER.md)               |
| Catalogue                | [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](./APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md)         |
| Baseline                 | [APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md](./APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md) **1.1** |
| Ownership                | APZHUB Engineering Governance                                                                    |
| Implementation authority | All APZHUB products                                                                              |
| Reference source         | APZQEP Certification Standard v1.0 (reference implementation — abstracted, not duplicated)       |
| Source framework         | APZQEP Engineering Framework v1.0                                                                |
| Promotion method         | Abstraction                                                                                      |
| Architecture Review      | PASS (`20260802T114832Z`)                                                                        |
| Certified                | Product Board — 2026-08-02 (`20260802T115728Z`)                                                  |
| Related Active standard  | [ES-001 Enterprise Testing Standard](./APZHUB-TESTING-STANDARD.md)                               |
| Process parents          | APZHUB-ENG-001 / ADR-0092 · Lifecycle Standard                                                   |
| Scope                    | All APZHUB portfolio engineering certification                                                   |
| Compliance               | **Mandatory**                                                                                    |
| Review frequency         | Annual                                                                                           |
| Exceptions               | Only by approved ADR                                                                             |

---

## 0. Normative language

The key words **MUST**, **MUST NOT**, **SHALL**, **SHALL NOT**, **SHOULD**, and **MAY** are to be interpreted as RFC 2119 obligations.

This document is the **Active** enterprise Certification Standard (ES-002). It is mandatory portfolio law for all APZHUB products and is included in Enterprise Engineering Baseline **1.1**.

Product certification standards MAY remain as specialisations; they MUST NOT contradict this standard.

This standard does **not** replace portfolio CERT programmes, freeze, or GA gates under the Lifecycle Standard. A unit-of-work **PASS** MUST NOT be presented as release readiness, GA, or package promotion authority.

---

## 1. Certification philosophy

Certification is the formal determination that an authorised unit of work has met its contract—or that work must stop.

Certification exists to make completion **decidable**, **evidenced**, and **auditable**.

No authorised engineering unit of work is complete without a certification outcome.

```text
NO WORK COMPLETE WITHOUT CERTIFICATION RESULT
ENGINEERING PASS ≠ PRODUCT BOARD CERTIFIED ≠ RELEASE ≠ GA
```

Ownership of certification outcomes rests with the authorities defined in §3 and §16. Agents and engineers apply this standard; they do not invent alternate vocabularies.

---

## 2. Certification lifecycle

```text
Authorised work
  → Implement against Engineering Specification
  → Execute required gates (testing, security, migration, docs, evidence, …)
  → Engineering certification (PASS | FAIL | STOP | CONDITIONAL PASS)
  → [optional] Remediation / recertification
  → [separate authority] Release certification / Product Board certification / package CERT
```

Rules:

1. Engineering certification closes the authorised unit of work (or structures FAIL/STOP).
2. Product Board certification applies to programme phases, enterprise standards, and Board-declared artefacts—not as a substitute for engineering gates on code slices.
3. Release certification requires explicit release authority and Lifecycle conformance.
4. Recertification is required after material change to previously certified behaviour still in scope (see §14).

---

## 3. Certification vocabulary

### 3.1 Primary outcomes (engineering unit of work)

| Outcome  | Meaning                                                                             | May close work as complete?          |
| -------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| **PASS** | All mandatory gates and acceptance criteria are satisfied; required evidence filed  | YES                                  |
| **FAIL** | One or more gates or acceptance criteria failed; defect is in-scope and fixable     | NO — remediate in-unit or STOP       |
| **STOP** | Work cannot continue within authorised scope without Owner / Product Board decision | NO — structured STOP report required |

### 3.2 Related outcomes

| Outcome              | Meaning                                                                           | Use                                             |
| -------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| **CONDITIONAL PASS** | PASS criteria met with Owner-accepted residual risk / waiver recorded in evidence | YES, only with waiver artefact                  |
| **BLOCKED**          | External dependency or out-of-scope defect prevents progress                      | NO — await Owner; often maps to STOP for agents |
| **CERTIFIED**        | Product Board decision accepting a programme phase or enterprise artefact         | Board-level only                                |
| **REJECTED**         | Product Board rejects the submitted artefact or phase                             | Board-level only                                |
| **DEFERRED**         | Product Board postpones decision with recorded reason                             | Board-level only                                |

Engineering agents closing a unit of work MUST use **PASS**, **FAIL**, or **STOP** as the primary certification result unless the Owner instruction explicitly authorises **CONDITIONAL PASS** with a recorded waiver.

### 3.3 Outcome rules

1. **PASS** MUST NOT be claimed if any mandatory gate is FAIL or N/A-when-required.
2. **FAIL** MUST be used when in-scope remediation is still possible under the same authority.
3. **STOP** MUST be used when Constitution, architecture, missing dependency, or safety conflict cannot be resolved in scope.
4. Weakening tests, skipping evidence, or expanding scope to force PASS is prohibited.
5. Historically certified units MUST NOT be silently reopened or rewritten by later work without new authority.

---

## 4. Levels of certification

| Level                           | What it certifies                                                                                | Authority                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| **Engineering certification**   | Unit meets Engineering Specification + applicable enterprise/product standards + gates           | Engineering under Owner work authority                              |
| **Security certification**      | Security gate PASS for in-scope paths (may be a named artefact within engineering certification) | Engineering / security reviewer per gate                            |
| **Migration certification**     | Migration gate PASS when schema/content migration is in scope                                    | Engineering under Owner authority                                   |
| **Documentation certification** | Documentation gate PASS                                                                          | Engineering under Owner authority                                   |
| **Remediation certification**   | Fix unit meets its narrower contract                                                             | Same as engineering certification for that unit                     |
| **Product Board certification** | Programme phase or enterprise artefact accepted by Product Board                                 | Product Board / Owner                                               |
| **Release certification**       | Release candidate meets Lifecycle release gates                                                  | Release / Lifecycle authority — **not** implied by engineering PASS |
| **Package / capability CERT**   | Broader CERT programme when Owner opens one                                                      | Separate CERT programme                                             |
| **GA / freeze**                 | Portfolio lifecycle                                                                              | Lifecycle Standard — out of scope here                              |

---

## 5. Engineering certification gates

All applicable gates MUST be PASS (or N/A with justification recorded) for an engineering **PASS**.

### 5.1 Authority gate

- Work is Owner-authorised.
- Scope matches the Engineering Specification.
- Release / Deployment remain `NONE` unless explicitly granted.
- Applicable Framework / Baseline citations present when product or enterprise standards require them.

### 5.2 Architecture gate

- Architecture confirmation is PASS.
- Layer and ownership boundaries preserved.
- No Document 000 / Constitution violation.

### 5.3 Implementation gate

- In-scope deliverables complete.
- Naming/layout standards observed (or ADR exception linked).
- No undocumented security-, persistence-, or user-visible behaviour introduced.

### 5.4 Testing gate

- Levels required by the Active Enterprise Testing Standard (**ES-001** when Active; otherwise operable product/ENG-001 practice) for the change types are executed and PASS.
- Acceptance criteria mapped to verification.
- Regression green for packages touched.

### 5.5 Security gate (security certification)

**PASS** requires, for paths in scope:

- default deny preserved;
- no cross-tenant leakage in tested paths;
- workspace / project isolation preserved where applicable;
- deny paths covered for missing permission / unauthenticated as applicable;
- no secrets in code, logs, or evidence payloads;
- security tests executed when the Testing Standard mandates them.

**FAIL** if any P0 security defect remains in scope.  
**STOP** / **BLOCKED** if a security defect is found outside scope and Owner decision is required.

### 5.6 Migration gate (migration certification)

- When schema changes: additive unless Owner authority; migration tests PASS.
- Identifiers / authoritative content compatibility evidenced.

### 5.7 Documentation gate (documentation certification)

- Required docs created/updated per specification.
- Frozen authoritative artefacts not rewritten.
- Limitations closed/opened recorded honestly.

### 5.8 Evidence gate

- Required evidence artefacts filed (§8).
- Timestamps and work IDs correct.
- No secrets in evidence.

### 5.9 Repository gate

- Working tree clean after authorised commits (or explicitly reported dirty with reason before final PASS).
- No unrelated changes smuggled.
- Touched packages build / typecheck / test as required.
- Repository remains releasable (mainline not broken).

### 5.10 Regression gate

- Per Testing Standard and APZHUB-ENG-001 regression policy.
- Intentional behaviour changes documented.

---

## 6. Product Board certification

Product Board certification applies to programme phases, enterprise standards, Framework milestones, and product-significant decisions.

| Board outcome | Meaning                                                 |
| ------------- | ------------------------------------------------------- |
| **CERTIFIED** | Artefact/phase accepted; may proceed per recommendation |
| **REJECTED**  | Not accepted; remediation or rewrite required           |
| **DEFERRED**  | Decision postponed with recorded reason                 |

Product Board CERTIFIED on a documentation phase MUST NOT be treated as engineering PASS for unrelated code work.

For enterprise standards promotion, Product Board Certification is one of two required Dual Approvals (Architecture Review + Product Board). See [PROMOTION-PRINCIPLES.md](./APZHUB-ENG-002/PROMOTION-PRINCIPLES.md).

---

## 7. Release certification

Release certification is **out of band** from engineering PASS.

Release certification MUST follow Lifecycle / release governance and requires explicit release authority.

Enterprise / product Framework conformance is necessary but not sufficient for release.

---

## 8. Certification evidence

### 8.1 Path

```text
docs/operations/evidence/<product-or-programme>/
```

Filename pattern:

```text
<UTC_TIMESTAMP>-<WORK_OR_PROGRAMME>-<ARTEFACT>.json
```

### 8.2 Mandatory artefacts — engineering unit

| Artefact                                  | When                                                     |
| ----------------------------------------- | -------------------------------------------------------- |
| `COMPLETION`                              | Always                                                   |
| `CERTIFICATION`                           | Always                                                   |
| `SECURITY`                                | When security gate applies                               |
| `TESTING`                                 | When non-trivial tests run (SHOULD always for code work) |
| Engineering notes / specification updates | Always for non-trivial work                              |
| Commit hashes                             | After commits that close the work                        |

### 8.3 Certification JSON (minimum fields)

```json
{
  "workId": "{{WORK_ID}}",
  "result": "PASS | FAIL | STOP",
  "timestampUtc": "{{UTC}}",
  "baselineOrFramework": "{{CITATION}}",
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

### 8.4 Evidence minimum requirements

1. Commands or CI jobs executed for testing gates.
2. Result summary (pass/fail or CI conclusion).
3. Gate matrix populated for all applicable gates.
4. Waiver artefacts linked when CONDITIONAL PASS is used.
5. No secrets, production dumps, or customer-identifying payloads.

### 8.5 Completion reports

Engineering MUST return the Final Report block required by the applicable Engineering Specification Template.

Documentation programmes MUST file phase completion / validation evidence and Product Board decisions when applicable.

---

## 9. Certification audit trail

1. Primary outcomes and Board decisions MUST remain on record; later remediations MUST NOT erase history.
2. Evidence filenames SHOULD include UTC timestamps and stable work identifiers.
3. Catalogue and Baseline changes for enterprise standards MUST reference Board decision evidence.
4. Commit hashes that close work SHOULD be recorded in COMPLETION / CERTIFICATION artefacts.

---

## 10. Remediation

When remediation is authorised:

1. It MUST have its own Engineering Specification (or short Owner cover with full required fields).
2. It MUST be independently certifiable.
3. It MUST NOT silently enlarge into unrelated feature work.
4. Evidence MUST reference the defect or STOP that caused remediation.
5. Original FAIL/STOP records MUST remain; remediation does not rewrite history.

---

## 11. Recertification

1. Material changes to previously certified behaviour still in scope MUST be re-certified under new authorised work.
2. Citation of an old PASS MUST NOT be used to waive gates for changed behaviour.
3. Enterprise standard version bumps that break prior obligations require Board-defined adoption windows (see Baseline / Catalogue rules).

---

## 12. Supersession

1. Enterprise standards supersession is governed by the Standards Catalogue and Baseline (Superseded / Retired states).
2. Product certification outcomes are not “superseded” by silence; new work produces new outcomes.
3. When a successor standard becomes Active, new work MUST cite the Active version unless Board grants a temporary citation window.

---

## 13. STOP conditions (normative triggers)

Engineering MUST STOP when:

- architecture confirmation is EXCEPTION and unresolvable in scope;
- Document 000 / Constitution would be violated by the only available fix;
- a **Depends On** item is missing or not certified;
- security default-deny or tenant isolation would be weakened to finish;
- acceptance criteria cannot be met without unauthorised scope expansion;
- repository reality conflicts with the authorised specification and cannot be reconciled in scope.

STOP reports MUST state: conflict, evidence inspected, options considered, and recommendation for Owner.

---

## 14. Closure requirements

A unit of work may be closed only when:

1. Primary outcome is PASS, or FAIL/STOP with structured report and no false “complete” claim;
2. Evidence is filed;
3. Dependencies / Delivers / Blocks fields in the Final Report are honest;
4. No next unit is auto-started without new Owner authority;
5. Repository state matches the claimed Repository gate.

---

## 15. Regression requirements

1. Packages touched MUST have their automated tests PASS.
2. Shared contract / authz changes MUST include consumer-impact consideration in evidence.
3. Migration / persistence changes MUST include migration validation.
4. Full-repo browser E2E is NOT required every unit unless the specification demands it.
5. Silent removal of security/isolation assertions to obtain PASS is a certification defect.

---

## 16. Certification ownership and responsibilities

| Role                              | Responsibility                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------- |
| **Owner**                         | Authorises work; accepts CONDITIONAL PASS waivers; resolves STOP                |
| **Engineering (agent/lead)**      | Applies gates; files evidence; returns honest PASS/FAIL/STOP                    |
| **Architecture Review**           | Dual Approval for enterprise standards; architecture gate for work              |
| **Product Board**                 | Board-level CERTIFIED/REJECTED/DEFERRED; Dual Approval for enterprise standards |
| **APZHUB Engineering Governance** | Owns Active enterprise certification standard text                              |
| **Release authority**             | Release certification (separate from engineering PASS)                          |

Products MAY specialise this standard; they MUST NOT weaken Active enterprise obligations.

---

## 17. Certification governance

1. When ES-002 is **Active**, all APZHUB portfolio engineering MUST comply.
2. Exceptions MUST be granted only by approved ADR linked from the Engineering Specification.
3. AI agents MUST apply this standard without restatement in each Owner prompt.
4. On conflict with Document 000 or Foundation, those prevail; then STOP if unresolvable in scope.
5. Enterprise standards promotion MUST follow Dual Approval before catalogue Active and Baseline bump.
6. ES-001 (Testing) defines testing gate content; this standard owns certification outcomes and gate structure.

---

## 18. Reference implementation

| Item                 | Value                                                                             |
| -------------------- | --------------------------------------------------------------------------------- |
| Proving product      | APZQEP                                                                            |
| Source framework     | APZQEP Engineering Framework v1.0                                                 |
| Source artefact      | `docs/products/apzqep/engineering/APZQEP-CERTIFICATION-STANDARD.md`               |
| Derivation method    | **Abstraction** — not duplication                                                 |
| Genericisation notes | [ES-002-GENERICISATION-NOTES.md](./APZHUB-ENG-002/ES-002-GENERICISATION-NOTES.md) |

APZQEP remains the **proven source**. APZHUB owns the **enterprise** standard.

---

## 19. Quick reference

```text
Outcomes:     PASS | FAIL | STOP (+ CONDITIONAL PASS with waiver)
Board:        CERTIFIED | REJECTED | DEFERRED
Gates:        authority · architecture · implementation · testing · security ·
              migration · documentation · evidence · repository · regression
Evidence:     COMPLETION + CERTIFICATION (+ SECURITY/TESTING as required)
Always true:  PASS ≠ Release ≠ GA
Cite (when Active): Conforms to ES-002 / APZHUB Enterprise Certification Standard v1.0
Baseline:     bumps only after Active (not during Under Review)
```

---

## 20. Related documents

- [APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md](./APZHUB-ENGINEERING-STANDARDS-CATALOGUE.md)
- [APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md](./APZHUB-ENTERPRISE-ENGINEERING-BASELINE.md)
- [APZHUB-TESTING-STANDARD.md](./APZHUB-TESTING-STANDARD.md) (ES-001)
- [PROMOTION-PRINCIPLES.md](./APZHUB-ENG-002/PROMOTION-PRINCIPLES.md)
- [ENGINEERING-SLICE-STANDARD.md](./ENGINEERING-SLICE-STANDARD.md)
- [SLICE-CERTIFICATION.md](./SLICE-CERTIFICATION.md)
- Reference: `docs/products/apzqep/engineering/APZQEP-CERTIFICATION-STANDARD.md`

---

## Document history

| Version | Programme phase        | Status     | Notes                                                                                     |
| ------- | ---------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| 1.0     | APZHUB-ENG-002 Phase 1 | **Active** | Dual Approval satisfied; abstracted from APZQEP Certification Standard v1.0; Baseline 1.1 |

---

_End of APZHUB Enterprise Certification Standard (ES-002)_
