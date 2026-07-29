# Architecture Stage

| Item    | Value                                                                            |
| ------- | -------------------------------------------------------------------------------- |
| Stage   | Architecture                                                                     |
| Version | **1.0.0**                                                                        |
| Parent  | [../README.md](../README.md)                                                     |
| Next    | [../engineering-specification/README.md](../engineering-specification/README.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Purpose

Architecture establishes the sole architectural authority for a capability before Engineering Specification or production Engineering.

---

## 2. Objectives

1. Define capability boundaries, aggregates, and lifecycle states.
2. State non-goals and explicit exclusions.
3. Fix layering, trust boundaries, and integration posture.
4. Produce an Owner-acceptable Architecture pack with quality gates.

---

## 3. Authorised scope

Architecture programmes **MAY** include: executive summary, objectives/constraints, information architecture, component model, workflow/lifecycle, quality gates, ADRs as required, glossaries, and acceptance checklists.

Architecture **SHALL** remain free of production implementation presented as complete Engineering.

---

## 4. Prohibited activities

1. Production Engineering of Domain/Application/Infrastructure/Workbench behaviour.
2. Silent commitment to unapproved Enterprise Edition or non-self-hosted-first dependencies.
3. Module-to-connector bypass patterns.
4. Treating draft Architecture as Accepted baseline.

---

## 5. Success criteria

| Criterion    | Requirement                                                                      |
| ------------ | -------------------------------------------------------------------------------- |
| Completeness | Pack covers boundaries, non-goals, layers, workflows, quality gates              |
| Consistency  | No unresolved internal contradictions                                            |
| Traceability | Objectives map to constraints and gates                                          |
| Owner pack   | Owner Summary + Owner Acceptance template filed                                  |
| Stop state   | **IMPLEMENTED / AWAITING OWNER ARCHITECTURE ACCEPTANCE** (or product equivalent) |

---

## 6. Stop condition

Architecture **SHALL STOP** at Owner Decision. Agents **SHALL NOT** start Engineering Specification until Owner Architecture Acceptance is recorded.

Escalate and stop if scope requires portfolio/ADR decisions beyond the programme.

---

## 7. Owner decision gate

| Decision            | Effect                                                      |
| ------------------- | ----------------------------------------------------------- |
| ACCEPTED            | Architecture baseline established; ES **MAY** be authorised |
| RETURN FOR REVISION | Remediate under same Architecture programme                 |
| REJECTED            | Stop; Owner directs next action                             |

See [../OWNER-GOVERNANCE.md](../OWNER-GOVERNANCE.md).

---

## STOP

```text
ARCHITECTURE STAGE
BASELINE BEFORE ES
OWNER GATE MANDATORY
```
