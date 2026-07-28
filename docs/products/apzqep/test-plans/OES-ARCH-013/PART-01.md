# APZQEP-OES-ARCH-013

# PART 1 — Executive Summary, Objectives, Constraints & Principles

| Item                  | Value                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Document              | **APZQEP-OES-ARCH-013**                                                                                       |
| Title                 | Test Plans Capability Architecture                                                                            |
| Programme             | **APZQEP-ARCH-013**                                                                                           |
| Capability            | Test Plans                                                                                                    |
| Layer                 | Capability Architecture                                                                                       |
| Status                | **ACCEPTED / ARCHITECTURE BASELINED / CLOSED**                                                                |
| Version               | **1.0.0-arch**                                                                                                |
| Part                  | **1 of 5**                                                                                                    |
| Governing methodology | [OES-000](../../../../engineering/oes/OES-000-Owner-Engineering-Specification-Standard.md) **FROZEN 1.0.0**   |
| Writing standard      | [OES-001](../../../../engineering/oes/OES-001-Engineering-Writing-Standard.md) **FROZEN 1.0.0**               |
| Review standard       | [OES-002](../../../../engineering/oes/OES-002-Engineering-Review-and-Acceptance-Standard.md) **FROZEN 1.1.0** |
| Constitution          | Document 000 v1.0.0                                                                                           |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional (RFC 2119 as applied by OES-001).

---

## 1. Executive summary

This document defines the authoritative **Capability Architecture** for **Test Plans** within APZ QEP.

A **Test Plan** is an executable collection of **Test Specifications** organised to validate a particular release, product, feature, milestone, sprint, regression cycle, or certification activity.

This programme **SHALL** produce architecture only. It **SHALL NOT** perform engineering, generate production code, or authorise Domain, Infrastructure, or Workbench implementation.

Upon Owner Acceptance, this architecture becomes the baseline from which all future Test Plans engineering **SHALL** proceed.

---

## 2. Programme objective

Design the complete architecture for the Test Plans capability such that subsequent Domain, Infrastructure, Workbench Architecture, Workbench Engineering, Certification, and Freeze programmes can proceed without architectural invention.

The architecture **SHALL**:

1. Define domain boundaries and ownership.
2. Define relationships to frozen capabilities and future capabilities.
3. Define a complete lifecycle with explicit transitions.
4. Define versioning, permissions (roles), search, dashboard, explorer, inspector, and navigation.
5. Define REST resources and events at architectural level.
6. Define AI and MCP boundaries without implementation.
7. Preserve independence of frozen baselines.

---

## 3. Frozen capability baseline (immutable dependencies)

| Capability          | Package                           | Status                       |
| ------------------- | --------------------------------- | ---------------------------- |
| Requirements        | `@apzhub/qep-requirements`        | **1.0.0 CERTIFIED / FROZEN** |
| Traceability        | `@apzhub/qep-traceability`        | **1.0.0 CERTIFIED / FROZEN** |
| Verification        | `@apzhub/qep-verification`        | **1.0.0 CERTIFIED / FROZEN** |
| Test Specifications | `@apzhub/qep-test-specifications` | **1.0.0 CERTIFIED / FROZEN** |

The architecture **SHALL** integrate with these capabilities by **reference**.

The architecture **SHALL NOT** redefine, fork, or absorb their SoR content, lifecycles, contracts, or Workbench surfaces.

Workbench grammar baseline: **APZQEP-ARCH-006** (Accepted) — future Workbench **SHALL** reuse this grammar.

---

## 4. What a Test Plan is

A **Test Plan** is a governed planning artefact that:

- Groups one or more **Test Specifications** (and optionally scoped future Test Cases) into an executable plan.
- Declares the **scope** of validation (release, product, feature, milestone, sprint, regression, certification, or custom).
- Carries **ownership**, **assignment**, **scheduling**, and **execution readiness**.
- Progresses through a governed **lifecycle** from Draft through Archived.
- Produces architectural events for downstream consumers (Execution, Evidence, Defects — future).

A Test Plan answers:

- What Specifications are in scope for this cycle?
- Why does this plan exist (objective / scope class)?
- Who owns and who executes?
- When is it scheduled / ready?
- What is its readiness for execution?
- Which immutable version is authoritative?

---

## 5. What a Test Plan is not

| Not a Test Plan                         | Owner                             |
| --------------------------------------- | --------------------------------- |
| Requirement content / lifecycle         | Requirements **1.0.0**            |
| Trace Links                             | Traceability **1.0.0**            |
| Verification decisions / outcomes       | Verification **1.0.0**            |
| Test Specification design content       | Test Specifications **1.0.0**     |
| Executable Test Case steps              | Future Test Cases capability      |
| Test Execution runs / results           | Future Test Execution / Test Runs |
| Evidence packs                          | Future Evidence capability        |
| Defect records                          | Future Defects capability         |
| Coverage percentages / impact analytics | Future Coverage / Impact services |

---

## 6. Single source of truth rule

Test Plans **SHALL** be the **single source of truth** for:

- Test Plan records
- Plan Items (membership of Specifications — and future Cases — in a plan)
- Plan Scope
- Plan Status / Lifecycle
- Plan ownership, assignment, and scheduling metadata
- Plan version lineage and governed history
- Plan-local relationships that the capability owns

Test Plans **SHALL NOT** be the SoR for Requirements, Trace Links, Verification Records, Specification design content, Execution results, Evidence, or Defects. Those remain owned by their domains. Test Plans **SHALL** reference them only.

A Test Plan **SHALL NOT** record execution results. Execution readiness is planning state, not run outcome.

---

## 7. Principles

| #   | Principle                               | Meaning                                                                      |
| --- | --------------------------------------- | ---------------------------------------------------------------------------- |
| P1  | Plan-centric                            | Primary object is a governed executable collection of Specifications         |
| P2  | Plan ≠ Spec ≠ Case ≠ Run ≠ Verification | Strict semantic separation                                                   |
| P3  | Bounded ownership                       | Owns Plan truth only                                                         |
| P4  | Reference, do not absorb                | Frozen and future capabilities are references                                |
| P5  | Server authority                        | Lifecycle, permissions, available actions — server only (future engineering) |
| P6  | Immutable versions                      | Material versions immutable; supersession preferred over silent rewrite      |
| P7  | Latest approved/ready authoritative     | Downstream consumers use the latest eligible version per lifecycle rules     |
| P8  | Execution readiness ≠ execution         | Ready/In Execution are plan states; runs live elsewhere                      |
| P9  | Consumer architecture                   | Workbench / AI / MCP consume; they do not own Plans                          |
| P10 | Workbench reuse                         | Future UX extends ARCH-006; no parallel shell                                |

---

## 8. Constraints

1. Architecture only — no production code in this programme.
2. Frozen baselines are immutable dependencies.
3. Layered architecture (Document 000) **SHALL** be preserved: Module → Platform Service → Connector/Engine boundaries for future engineering.
4. Platform Services own business rules in future ENG programmes; Workbench remains presentation-only.
5. Certification independence practice **SHALL** apply to future CERT programmes ([OES-CERTIFICATION-INDEPENDENCE](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md)).
6. ADR-0074 remains a Test Specifications contract concern; Test Plans **SHALL NOT** invent Specification transitions.

---

## 9. Non-goals (this programme)

This programme **SHALL NOT**:

- Implement Domain, repositories, REST, Workbench, database, search, permissions, tests, or infrastructure.
- Implement AI or MCP.
- Authorise ENG programmes.
- Define Test Execution, Test Runs, Evidence, or Defects domain models beyond integration points.
- Redesign Requirements, Traceability, Verification, or Test Specifications.

---

## 10. Authorised next gates (after Acceptance only)

```text
APZQEP-ARCH-013 Owner Acceptance
  → Domain Engineering (separate OES / ENG — not authorised here)
  → Infrastructure Engineering
  → Workbench Architecture OES
  → Workbench Engineering
  → ECR → Owner Acceptance → CERT → Promotion → Freeze
```

---

## 11. STOP (Part 1)

```text
APZQEP-ARCH-013
ARCHITECTURE ONLY
NO ENGINEERING
NO PRODUCTION CODE
```
