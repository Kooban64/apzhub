# Engineering Slice Standard

| Field           | Value                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| Document        | Engineering Slice Standard                                                    |
| Programme       | **APZHUB-ENG-001**                                                            |
| Status          | **IN FORCE / FROZEN**                                                         |
| Freeze ADR      | [ADR-0092](../adr/ADR-0092-engineering-slice-standard-freeze.md)              |
| Classification  | Engineering Operating Standard                                                |
| Reference slice | [APZQEP-120-S01](../products/apzqep/v1.1/apzqep-120/S01-ENGINEERING-NOTES.md) |
| Date            | 2026-08-01                                                                    |

**Freeze:** Changes to this standard require explicit Owner approval ([ADR-0092](../adr/ADR-0092-engineering-slice-standard-freeze.md)). Slice instructions shall reference this document — not redefine the workflow.

---

## Purpose

Define the **repeatable engineering lifecycle** for every APZHUB product engineering slice.

This standard makes slice delivery predictable, auditable, and certifiable. It does **not** replace portfolio governance.

### Authority (do not duplicate)

| Topic                         | Authoritative source                                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Engineering index             | [APZHUB Engineering Standard](../governance/APZHUB-ENGINEERING-STANDARD.md)                                                              |
| Product / programme lifecycle | [APZHUB Lifecycle Standard](../governance/APZHUB-LIFECYCLE-STANDARD.md) · [lifecycle-standard/v1.0](./lifecycle-standard/v1.0/README.md) |
| AI roles & authority          | [APZHUB AI Operational Framework](../governance/APZHUB-AI-OPERATIONAL-FRAMEWORK.md)                                                      |
| Quality / CI                  | Foundation [015](../015-software-quality-testing-qa-cicd-release-management-framework.md)                                                |
| Security / Zero Trust         | Foundation [013](../013-security-architecture-zero-trust-framework.md)                                                                   |
| Architecture principles       | Foundation [003](../003-overall-system-architecture-design-principles.md)                                                                |
| Build contract / waves        | [oes/ENGINEERING-BUILD-CONTRACT.md](./oes/ENGINEERING-BUILD-CONTRACT.md)                                                                 |
| Platform delivery             | [platform-delivery/PLATFORM-DELIVERY-STANDARD.md](./platform-delivery/PLATFORM-DELIVERY-STANDARD.md)                                     |

**This document owns:** day-to-day **slice execution** (inspect → certify → commit).  
**It does not own:** portfolio freeze/release/GA, committee RACI, or constitutional architecture.

---

## Slice definition

A **slice** is the smallest Owner-authorised unit of engineering that:

1. Delivers one coherent vertical capability (or security/operability closure)
2. Remains independently testable and certifiable
3. Leaves the repository **releasable** after completion
4. Does not bundle unrelated work for convenience

Slices are identified as `{PRODUCT}-{PROGRAMME}-S{nn}` (e.g. `APZQEP-120-S01`).

---

## Short prompt model (from S02 onward)

Owner instructions **SHALL** supply only:

```text
Slice identifier
Objective / scope
Acceptance criteria
Dependencies
Explicit exclusions (if not obvious)
Special constraints (if any)
```

Everything else is **inherited** from this standard, the [slice template](./ENGINEERING-SLICE-TEMPLATE.md), and the [AI engineering workflow](./AI-ENGINEERING-WORKFLOW.md).

---

## Lifecycle

```text
Inspect
  → Confirm Architecture
  → Design
  → Implement
  → Unit Tests
  → Integration Tests
  → Security Validation
  → Documentation
  → Evidence
  → Certification
  → Commit
  → Repository Clean
  → Slice Complete
```

Quality over speed. Repository integrity over feature completion.

---

### 1. Inspect

|                |                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| **Purpose**    | Ground work in the actual repository, not planning assumptions                                               |
| **Entry**      | Owner slice instruction authorised; working tree clean (or dirty state reported and stopped)                 |
| **Activities** | Locate packages, APIs, ACL, tests, docs, limitations; classify COMPLETE / PARTIAL / MISSING; return findings |
| **Exit**       | Written inspection findings; no production code changed yet                                                  |
| **Evidence**   | Findings in chat and/or slice notes; paths cited                                                             |
| **Failure**    | STOP if unrelated dirty tree, missing authority, or material conflict with standing baseline                 |

### 2. Confirm Architecture

|                |                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| **Purpose**    | Ensure the slice implements approved architecture — no silent redesign                               |
| **Entry**      | Inspection complete                                                                                  |
| **Activities** | Compare intended change to approved ARCH / programme pack (e.g. APZQEP-111); verify layer boundaries |
| **Exit**       | Architecture confirmed **or** architectural exception recorded                                       |
| **Evidence**   | Confirmation note or exception ticket                                                                |
| **Failure**    | STOP on contradiction; await Owner — do not redesign                                                 |

### 3. Design

|                |                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **Purpose**    | Minimal design sufficient for correct implementation                                                    |
| **Entry**      | Architecture confirmed                                                                                  |
| **Activities** | Define touchpoints, interfaces, security model, test approach, compatibility; reuse platform components |
| **Exit**       | Design clear enough to implement without scope creep                                                    |
| **Evidence**   | Brief design in slice engineering notes (not a new architecture programme)                              |
| **Failure**    | STOP if Owner decision required (storage tech, retention, etc.)                                         |

### 4. Implement

|                |                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------ |
| **Purpose**    | Deliver only authorised functionality                                                      |
| **Entry**      | Design complete                                                                            |
| **Activities** | Code within scope; default-deny security; keep build green; no temporary/debug leftovers   |
| **Exit**       | Behaviour meets acceptance criteria in code                                                |
| **Evidence**   | Diff limited to authorised paths                                                           |
| **Failure**    | STOP on instability, unexpected dependency, or scope pressure; report — do not work around |

### 5. Unit Tests

|                |                                                    |
| -------------- | -------------------------------------------------- |
| **Purpose**    | Prove domain/policy/helpers in isolation           |
| **Entry**      | Implementation present                             |
| **Activities** | Add/update unit tests for new logic and edge cases |
| **Exit**       | Targeted unit suite green                          |
| **Evidence**   | Test command output                                |
| **Failure**    | FAIL slice until fixed                             |

### 6. Integration Tests

|                |                                                               |
| -------------- | ------------------------------------------------------------- |
| **Purpose**    | Prove service/API/repository paths together                   |
| **Entry**      | Unit tests green                                              |
| **Activities** | Package/API integration tests; tenant/ACL paths as applicable |
| **Exit**       | Targeted integration suite green                              |
| **Evidence**   | Test command output                                           |
| **Failure**    | FAIL slice until fixed                                        |

### 7. Security Validation

|                |                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **Purpose**    | Prove ACL, tenant isolation, deny paths, no bypass                                                      |
| **Entry**      | Functional tests green                                                                                  |
| **Activities** | Execute security checks per [SLICE-CERTIFICATION.md](./SLICE-CERTIFICATION.md); produce security report |
| **Exit**       | Security **PASS** (or Owner-accepted Conditional PASS)                                                  |
| **Evidence**   | `*-SECURITY.json` (or equivalent)                                                                       |
| **Failure**    | FAIL / BLOCKED — no certification                                                                       |

### 8. Documentation

|                |                                                                      |
| -------------- | -------------------------------------------------------------------- |
| **Purpose**    | Update only documents affected by the slice                          |
| **Entry**      | Security PASS                                                        |
| **Activities** | CERT limitations, API notes, slice notes, standing records as needed |
| **Exit**       | Docs consistent with behaviour                                       |
| **Evidence**   | Doc paths listed in certification pack                               |
| **Failure**    | FAIL documentation gate                                              |

### 9. Evidence

|                |                                                                                        |
| -------------- | -------------------------------------------------------------------------------------- |
| **Purpose**    | Immutable proof of what was done                                                       |
| **Entry**      | Docs updated                                                                           |
| **Activities** | Write completion / security / certification evidence under `docs/operations/evidence/` |
| **Exit**       | Evidence files present and consistent                                                  |
| **Evidence**   | Timestamped JSON (+ notes)                                                             |
| **Failure**    | FAIL — slice incomplete                                                                |

### 10. Certification

|                |                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Purpose**    | Slice-level PASS/FAIL only (not full product CERT unless required)                                                   |
| **Entry**      | Evidence complete                                                                                                    |
| **Activities** | Apply [SLICE-CERTIFICATION.md](./SLICE-CERTIFICATION.md); run [ENGINEERING-CHECKLIST.md](./ENGINEERING-CHECKLIST.md) |
| **Exit**       | Certification result recorded                                                                                        |
| **Evidence**   | `*-CERTIFICATION.json`                                                                                               |
| **Failure**    | Do not commit as complete; report FAIL/BLOCKED                                                                       |

### 11. Commit

|                |                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| **Purpose**    | Persist releasable change history                                                                        |
| **Entry**      | Certification PASS (or Conditional PASS with Owner note)                                                 |
| **Activities** | Prefer: (1) engineering commit (2) documentation/evidence commit if needed; no secrets; no `--no-verify` |
| **Exit**       | Commit(s) on authorised branch; push when programme requires                                             |
| **Evidence**   | Commit hashes in completion evidence                                                                     |
| **Failure**    | Fix hooks with **new** commit; do not amend unless amend rules met                                       |

### 12. Repository Clean → Slice Complete

|                |                                                               |
| -------------- | ------------------------------------------------------------- |
| **Purpose**    | Leave mainline healthy for the next slice                     |
| **Entry**      | Commit(s) done                                                |
| **Activities** | Verify clean tree; remote tip if pushed; no unrelated changes |
| **Exit**       | Working tree clean; slice marked COMPLETE                     |
| **Evidence**   | `git status` clean; completion report                         |
| **Failure**    | Not complete until clean                                      |

---

## Regression policy

| Change class                | Regression                                   |
| --------------------------- | -------------------------------------------- |
| Single-package behaviour    | Targeted package tests                       |
| Shared authz / contracts    | Package + consumer contract tests            |
| Persistence / migration     | Migration + affected package + smoke         |
| Before product release band | Cross-product smoke as release plan requires |

Do **not** run full-repository suites for every small slice unless the slice touches shared foundations or the checklist requires it.

---

## Stop conditions (mandatory)

Stop and report — do not work around — if:

- Architecture conflict
- Security conflict / tenant leakage discovered outside fixable slice scope
- Breaking API without Owner-approved compatibility strategy
- Unexpected hard dependency
- Repository instability
- Owner decision required
- Authority for another slice assumed

---

## Companion artefacts

| Artefact      | Path                                                             |
| ------------- | ---------------------------------------------------------------- |
| Template      | [ENGINEERING-SLICE-TEMPLATE.md](./ENGINEERING-SLICE-TEMPLATE.md) |
| Checklist     | [ENGINEERING-CHECKLIST.md](./ENGINEERING-CHECKLIST.md)           |
| Certification | [SLICE-CERTIFICATION.md](./SLICE-CERTIFICATION.md)               |
| AI workflow   | [AI-ENGINEERING-WORKFLOW.md](./AI-ENGINEERING-WORKFLOW.md)       |
| S01 reference | [S01-REFERENCE-PATTERN.md](./S01-REFERENCE-PATTERN.md)           |

---

## STOP

```text
APZHUB-ENG-001
ENGINEERING SLICE STANDARD
IN FORCE / FROZEN (ADR-0092)
INHERIT THIS PROCESS — DO NOT REDEFINE IN EVERY PROMPT
```
