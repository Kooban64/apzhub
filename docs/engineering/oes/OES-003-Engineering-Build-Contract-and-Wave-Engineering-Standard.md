# APZOR Engineering Standard

# OES-003 — Engineering Build Contract and Wave-Based Engineering Standard

| Item           | Value                                                                                                                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document       | **OES-003**                                                                                                                                                                                                                                                     |
| Title          | Engineering Build Contract and Wave-Based Engineering Standard                                                                                                                                                                                                  |
| Classification | APZOR Engineering Operating Standard (Engineering Execution)                                                                                                                                                                                                    |
| Organisation   | APZOR                                                                                                                                                                                                                                                           |
| Status         | **ACCEPTED / IN FORCE**                                                                                                                                                                                                                                         |
| Version        | **1.0.0** (APZQEP-GOV-ENG-BUILD-001 Accepted 2026-07-29)                                                                                                                                                                                                        |
| Programme      | **APZQEP-GOV-ENG-BUILD-001**                                                                                                                                                                                                                                    |
| Related        | [OES-000](./OES-000-Owner-Engineering-Specification-Standard.md) · [OES-001](./OES-001-Engineering-Writing-Standard.md) · [OES-002](./OES-002-Engineering-Review-and-Acceptance-Standard.md) · [ENGINEERING-BUILD-CONTRACT.md](./ENGINEERING-BUILD-CONTRACT.md) |
| Applies to     | All future APZQEP Engineering programmes (and APZOR platforms adopting this standard)                                                                                                                                                                           |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Purpose

This standard enhances the APZOR Engineering Operating Model for **AI-assisted production engineering**.

It introduces:

1. A mandatory **Engineering Build Contract** governing all Engineering activity.
2. **Wave-Based Engineering Delivery** replacing monolithic Engineering programmes.

It does **not** weaken Architecture, Engineering Specification, ECR, Certification, or Freeze controls. It refines **how** the Engineering stage is executed.

Frozen OES-000 / OES-001 / OES-002 remain authoritative for their scopes. Where this standard refines Engineering execution, it **SHALL** prevail for Engineering programmes accepted under it.

---

## 2. Relationship to the capability lifecycle

The mandatory capability lifecycle remains:

```text
Architecture
  → Owner Architecture Acceptance
  → Engineering Specification
  → Owner Engineering Specification Acceptance
  → Engineering Build Contract (binding for Engineering)
  → Engineering Wave(s) with Owner Review between waves
  → Engineering Completion Review (ECR)
  → Owner Acceptance
  → Certification
  → Version Promotion
  → Freeze
```

**Engineering** is no longer authorised as a single unbounded production programme unless the Owner explicitly combines waves (recorded exception).

Monolithic Engineering identifiers that pre-date this standard (e.g. a single “build the whole capability” ENG) are **superseded** for future authorisations.

---

## 3. Engineering Build Contract

### 3.1 Normative instrument

The normative Build Contract text is:

> [ENGINEERING-BUILD-CONTRACT.md](./ENGINEERING-BUILD-CONTRACT.md)

That contract **SHALL** be mandatory for every future Engineering Wave and Engineering programme (**IN FORCE** via APZQEP-GOV-ENG-BUILD-001 Acceptance).

### 3.2 Binding rule

No Engineering Wave **SHALL** commence without:

1. Accepted Architecture baseline for the capability.
2. Accepted Engineering Specification baseline for the capability (or Owner-recorded exception).
3. Explicit Owner Instruction naming the Wave programme.
4. Affirmation that the Engineering Build Contract applies.

---

## 4. Engineering Wave concept

### 4.1 Definition

An **Engineering Wave** is a separately Owner-authorised Engineering programme that delivers a **bounded, reviewable increment** of production engineering for a capability, under the Engineering Build Contract, without redesigning Architecture or Engineering Specification.

### 4.2 Objectives

Each Wave **SHALL**:

1. Implement only its authorised scope.
2. Leave the repository buildable and integrity-preserving.
3. Produce tests and documentation required by the Build Contract.
4. Produce evidence and an Owner Review pack.
5. Stop at **IMPLEMENTED / AWAITING OWNER WAVE REVIEW** (or equivalent) unless the Owner Instruction defines a different stop that still requires Owner Review before the next Wave.

### 4.3 Permitted scope

A Wave **MAY** include only work explicitly listed in its Owner Instruction and conforming to Architecture + Engineering Specification.

A Wave **SHALL NOT** absorb later Waves’ responsibilities “for convenience.”

### 4.4 Mandatory Owner Review between Waves

Progression from Wave _N_ to Wave _N+1_ **SHALL** require Owner Review / Acceptance of Wave _N_ (or an Owner-recorded waiver with conditions).

Agents **SHALL NOT** auto-start the next Wave.

### 4.5 Evidence required per Wave

At minimum:

| Artefact                                                 | Required |
| -------------------------------------------------------- | -------- |
| Wave completion report                                   | Yes      |
| Build/test evidence                                      | Yes      |
| Traceability to Architecture + Engineering Specification | Yes      |
| Deviation register (even if empty)                       | Yes      |
| Owner Summary + Owner Acceptance / Review template       | Yes      |
| Evidence JSON                                            | Yes      |
| Index / Standing Record updates                          | Yes      |

### 4.6 Wave completion criteria

A Wave is complete for Owner Review when:

1. Authorised scope is implemented (no silent partials presented as complete).
2. Repository builds (compile / typecheck / lint gates applicable to touched packages).
3. Required tests pass for new production behaviour.
4. Public interfaces introduced in the Wave are documented.
5. Build Contract compliance is asserted with evidence.
6. No unresolved architectural conflicts remain unescalated.

### 4.7 Validation expectations

Wave validation **SHALL** include Build Contract compliance, Architecture fidelity, Engineering Specification fidelity, frozen-baseline integrity, and “no unauthorised scope.”

### 4.8 Progression rules

```text
Wave N Authorised → Wave N Implemented → Owner Review
  → ACCEPTED → Wave N+1 MAY be authorised by separate Instruction
  → RETURN FOR REVISION → fix under same Wave id (or Owner-directed)
  → REJECTED → stop; Owner directs remediation programme
```

### 4.9 Rollback expectations

Where a Wave leaves the repository in an unacceptable state, the Owner **MAY** require revert of the Wave’s commits before further Engineering. Agents **SHALL NOT** bury failures under follow-on Waves.

---

## 5. Recommended Wave taxonomy (capability-generic)

Default Engineering Waves after Engineering Specification Acceptance:

| Wave | Typical scope                                                                                                          |
| ---- | ---------------------------------------------------------------------------------------------------------------------- |
| A    | Repository scaffolding (packages, manifests, tooling wiring — no business behaviour unless Instruction says otherwise) |
| B    | Domain                                                                                                                 |
| C    | Application                                                                                                            |
| D    | Infrastructure & API                                                                                                   |
| E    | Workbench / Presentation                                                                                               |

Owners **MAY** refine, split, or combine Waves with recorded justification. Combining **SHOULD** be rare for AI-assisted delivery.

---

## 6. Test Execution Wave reservation

Reserved identifiers (recommendation until each is Owner-authorised):

| Programme           | Scope                                   |
| ------------------- | --------------------------------------- |
| **APZQEP-ENG-100A** | Test Execution — Repository Scaffolding |
| **APZQEP-ENG-100B** | Test Execution — Domain                 |
| **APZQEP-ENG-100C** | Test Execution — Application            |
| **APZQEP-ENG-100D** | Test Execution — Infrastructure & API   |
| **APZQEP-ENG-100E** | Test Execution — Workbench              |

All remain **RECOMMENDATION ONLY / NOT AUTHORISED** until separately instructed.

Prior monolithic interpretation of **APZQEP-ENG-100A** as “build entire Test Execution” is **superseded**.

---

## 7. ECR and later stages

Wave Engineering does **not** replace ECR. After the Owner determines Engineering Waves sufficient for capability engineering completeness, **ECR** proceeds under OES-002 before Engineering Owner Acceptance, then Certification / Freeze as today.

---

## 8. Amendment control

Changes to this standard or the Build Contract require Owner-authorised governance / OES change programmes. Silent reinterpretation is forbidden.

---

## STOP

```text
OES-003
ACCEPTED
IN FORCE
(via APZQEP-GOV-ENG-BUILD-001)
```
