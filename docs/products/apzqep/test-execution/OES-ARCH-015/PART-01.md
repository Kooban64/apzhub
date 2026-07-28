# APZQEP-OES-ARCH-015

# PART 1 — Executive Summary, Authority, Scope & Capability Definition

| Item                  | Value                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Document              | **APZQEP-OES-ARCH-015**                                                                                       |
| Title                 | Test Execution Capability Architecture                                                                        |
| Programme             | **APZQEP-ARCH-015**                                                                                           |
| Capability            | Test Execution                                                                                                |
| Layer                 | Capability Architecture                                                                                       |
| Status                | **IMPLEMENTED / AWAITING OWNER ARCHITECTURE DECISION**                                                        |
| Version               | **1.0.0-arch**                                                                                                |
| Part                  | **1 of 5**                                                                                                    |
| Date                  | 2026-07-28                                                                                                    |
| Governing methodology | [OES-000](../../../../engineering/oes/OES-000-Owner-Engineering-Specification-Standard.md) **FROZEN 1.0.0**   |
| Writing standard      | [OES-001](../../../../engineering/oes/OES-001-Engineering-Writing-Standard.md) **FROZEN 1.0.0**               |
| Review standard       | [OES-002](../../../../engineering/oes/OES-002-Engineering-Review-and-Acceptance-Standard.md) **FROZEN 1.1.0** |
| Constitution          | [APZQEP-CONSTITUTION.md](../../APZQEP-CONSTITUTION.md) **v1.0.0 RATIFIED / BASELINED**                        |
| Document 000          | [000-apzhub-engineering-constitution.md](../../../../000-apzhub-engineering-constitution.md)                  |
| Standing record       | [STANDING-PROGRAMME-RECORD.md](../../STANDING-PROGRAMME-RECORD.md) **IN FORCE**                               |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional (RFC 2119 as applied by OES-001).

---

## 1. Executive summary

This document defines the authoritative **Capability Architecture** for **Test Execution** within APZ QEP — the first Architecture programme of Phase 2 Capability Expansion.

A **Test Execution** is the controlled performance of testing work derived from approved Test Plans and Test Specifications, recording steps, outcomes, evidence references, observations, and review decisions in a historically trustworthy way.

This programme **SHALL** produce architecture only. It **SHALL NOT** perform engineering, generate production code, create packages, migrations, APIs, Workbench UI, certification, freeze, or version promotion.

Upon Owner Architecture Acceptance, this architecture becomes the baseline from which a separately authorised Engineering Specification **MAY** proceed.

---

## 2. Programme authority

| Field              | Value                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Owner Instruction  | APZQEP Wave 2 Capability Expansion — APZQEP-ARCH-015 AUTHORISED TO COMMENCE                            |
| Programme type     | Capability Architecture                                                                                |
| Authorises         | Investigation, discovery, modelling, architecture documentation, ADRs, Owner decision pack             |
| Does not authorise | Production engineering, Engineering Specification, Certification, Freeze, frozen-baseline modification |

Standing programme position (authoritative — not reopened):

```text
Foundation Programme          PERMANENTLY CLOSED
Engineering Platform v1       RECOGNISED / STABLE
Constitution 1.0.0            RATIFIED / BASELINED
Operating Model               FULLY VALIDATED / MANDATORY
Wave 2                        APZQEP-ARCH-015 AUTHORISED
                              NO OTHER WAVE-2 PROGRAMME AUTHORISED
```

---

## 3. Programme objective

Design the complete architecture for native APZQEP Test Execution such that subsequent Engineering Specification, Engineering, Certification, and Freeze programmes can proceed without inventing missing business concepts or architectural decisions.

The architecture **SHALL**:

1. Define domain boundaries and ownership for Test Execution.
2. Define relationships to all five frozen capabilities without modifying them.
3. Define a complete lifecycle with explicit transitions and `availableActions`.
4. Preserve historical truth across source changes, re-execution, review, and supersession.
5. Support manual and automated execution under a unified audit model.
6. Bound Evidence, Defects, Test Runs, Reporting, and AI as future integrations.
7. Remain implementation-independent.

---

## 4. Frozen production baselines (immutable)

| Capability          | Package                           | Status                       |
| ------------------- | --------------------------------- | ---------------------------- |
| Requirements        | `@apzhub/qep-requirements`        | **1.0.0 CERTIFIED / FROZEN** |
| Traceability        | `@apzhub/qep-traceability`        | **1.0.0 CERTIFIED / FROZEN** |
| Verification        | `@apzhub/qep-verification`        | **1.0.0 CERTIFIED / FROZEN** |
| Test Specifications | `@apzhub/qep-test-specifications` | **1.0.0 CERTIFIED / FROZEN** |
| Test Plans          | `@apzhub/qep-test-plans`          | **1.0.0 CERTIFIED / FROZEN** |

The architecture **SHALL** integrate by **reference** only.

The architecture **SHALL NOT** redefine, fork, remediate, rename, weaken, or version-bump any frozen baseline.

If Test Execution requires a future change to a frozen capability, that requirement **SHALL** be recorded as a dependency / separate change programme — not performed here.

Workbench grammar baseline: **APZQEP-ARCH-006** (Accepted) — future Workbench **SHALL** reuse this grammar.

---

## 5. What Test Execution is

**Test Execution** is the System of Record for controlled performance of testing work.

It answers:

| Question                          | Owned by Test Execution                                        |
| --------------------------------- | -------------------------------------------------------------- |
| What is being executed?           | Execution identity + resolved manifest                         |
| Under which plan / specification? | Immutable version references + manifest snapshot               |
| Against what target / context?    | ExecutionContext                                               |
| By whom / which agent?            | Assignment + actor / execution agent identity                  |
| When did it start / end?          | Lifecycle timestamps                                           |
| Which steps were performed?       | ExecutionStep records                                          |
| What outcomes were recorded?      | Step and execution outcomes                                    |
| What evidence supports outcomes?  | EvidenceReference associations                                 |
| What observations occurred?       | ExecutionObservation                                           |
| What review / approval occurred?  | ExecutionReview                                                |
| What is the authoritative result? | Finalised execution outcome                                    |
| How is it traced?                 | Traceability relationships (via frozen Traceability contracts) |

---

## 6. What Test Execution is not

Test Execution **SHALL NOT** become:

| Non-capability                                         | Boundary                                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Test Specification authoring                           | Consumes frozen Spec contracts only                                                                           |
| Test Plan design                                       | Consumes frozen Plan contracts; may report progress via future additive contracts                             |
| Defect Management                                      | Records observations / failure facts; defect confirmation is a future capability                              |
| Evidence Management                                    | Holds references and integrity metadata; does not own the evidence store                                      |
| Reporting & Dashboards                                 | Emits events / queryable facts; analytics remain future                                                       |
| Automation / CI engine                                 | Accepts attributable results; does not implement runners                                                      |
| Generic workflow platform                              | Uses APZQEP lifecycle patterns; does not absorb platform Workflow SoR                                         |
| Requirements / Traceability / Verification replacement | Integrates; does not decide final Verification status unless frozen Verification contracts explicitly provide |
| Workbench-owned state machine                          | Domain owns transitions; Workbench renders `availableActions` only                                            |

---

## 7. Ubiquitous language (normative terms)

| Term                            | Meaning                                                                |
| ------------------------------- | ---------------------------------------------------------------------- |
| **TestExecution**               | Aggregate root — one controlled performance instance                   |
| **ExecutionManifest**           | Immutable resolved source snapshot used for the execution              |
| **ExecutionStep**               | Ordered (or explicitly unordered) step within an execution             |
| **ExecutionContext**            | Target environment / build / release / configuration descriptors       |
| **ExecutionAssignment**         | Executor / reviewer / owner responsibility binding                     |
| **ExecutionOutcome**            | Canonical outcome value (step or execution level)                      |
| **ExecutionObservation**        | Fact / anomaly note that is not a confirmed defect                     |
| **EvidenceReference**           | Pointer + integrity metadata to evidence outside this SoR              |
| **ExecutionReview**             | Review decision record                                                 |
| **ExternalExecutionSubmission** | Ingested automated / imported result submission                        |
| **Test Run**                    | **Out of scope** — future separate orchestration capability (ADR-0077) |

The architecture **SHALL** use **TestExecution** as the sole name for the aggregate. Synonyms (run, session, instance) **SHALL NOT** be used as alternate aggregate names in contracts.

---

## 8. Constitutional invariants (binding)

1. **Domain** owns business meaning, state, rules, and behaviour.
2. **Infrastructure** orchestrates persistence, integration, messaging, search, audit, observability.
3. **Workbench** presents state and invokes authorised actions only.
4. Workbench **SHALL NEVER** own business behaviour, invent transitions, infer permissions, or reconstruct domain rules.
5. **`availableActions` is the sole UI authority** for executable actions.
6. Certification is independent of engineering and never remediates.
7. Frozen baselines remain immutable; this programme freezes nothing.
8. AI assists; AI does not fabricate outcomes, evidence, defects, approvals, or bypass lifecycle / permissions.

---

## 9. Scope

### In scope (architecture)

- Capability definition and boundaries
- Domain model, lifecycle, outcomes, permissions model
- Infrastructure responsibilities (conceptual)
- Workbench surfaces (conceptual)
- Integration with five frozen capabilities
- External ingestion trust boundary
- Evidence / observation / defect / Test Runs / AI boundaries
- ADRs, registers, validation, Owner decision pack

### Out of scope

- All production engineering and package creation
- Database migrations and schema DDL
- API / Workbench / search index implementation
- Engineering Specification programme
- Certification, Freeze, version promotion
- Modification of frozen capabilities
- Implementation of automation engines, CI pipelines, or AI models

---

## 10. Governing standards

| Authority                          | Role                             |
| ---------------------------------- | -------------------------------- |
| Document 000                       | Supreme engineering constitution |
| APZQEP Constitution v1.0.0         | Product constitutional entry     |
| OES-000 / OES-001 / OES-002 v1.1.0 | Engineering standards            |
| APZOR Operating Model (validated)  | Mandatory lifecycle              |
| Engineering Lifecycle Handbook     | Operational handbook             |
| STANDING-PROGRAMME-RECORD          | Official starting state          |
| PORTFOLIO-001                      | Foundation portfolio baseline    |

On conflict: higher authority wins; conflicts **SHALL** be recorded in Owner Summary.

**Conflicts discovered during ARCH-015:** None material. Wave 2 Roadmap remains indicative; this Owner Instruction supersedes “no Wave 2 authorised” solely for **APZQEP-ARCH-015**.

---

## STOP

```text
PART 1 COMPLETE
TEST EXECUTION DEFINED
FROZEN BASELINES PRESERVED BY REFERENCE
ARCHITECTURE ONLY
```
