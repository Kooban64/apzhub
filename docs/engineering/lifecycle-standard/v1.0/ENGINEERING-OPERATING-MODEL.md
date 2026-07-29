# Engineering Operating Model

| Item        | Value                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| Document    | Engineering Operating Model                                                                                            |
| Version     | **1.0.0**                                                                                                              |
| Parent      | [README.md](./README.md)                                                                                               |
| Complements | [../../oes/APZOR-ENGINEERING-OPERATING-MODEL-VALIDATION.md](../../oes/APZOR-ENGINEERING-OPERATING-MODEL-VALIDATION.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Purpose

This Operating Model governs how humans and AI agents engineer APZOR products: governance-first, separation of concerns, full traceability, and evidence-driven decisions.

---

## 2. AI-assisted engineering

1. AI agents **MAY** draft Architecture, ES, Wave plans, code, tests, and evidence packs.
2. AI agents **SHALL NOT** invent Architecture or ES decisions, waive gates, or auto-start the next programme stage.
3. AI agents **SHALL** stop and escalate when authority is missing, ambiguous, or conflicted ([BUILD-CONTRACT.md](./BUILD-CONTRACT.md) § Stop conditions).
4. Owner verbs such as Acknowledge / Recognise / Confirmed **SHALL NOT** be treated as Engineering authorisation.
5. Every AI-assisted Wave **SHALL** affirm Build Contract compliance in its completion report.

---

## 3. Governance-first

1. No production Engineering **SHALL** commence without Accepted Architecture, Accepted ES (or Owner-recorded exception), explicit Owner Instruction, and Build Contract affirmation.
2. Owner Decision gates **SHALL** control all stage transitions ([OWNER-GOVERNANCE.md](./OWNER-GOVERNANCE.md)).
3. Risk acceptance **SHALL** be explicit and recorded ([risk-management/README.md](./risk-management/README.md)).
4. Silent reinterpretation of standards **SHALL** be treated as a defect.

---

## 4. Separation of responsibilities

| Layer / role                     | Owns                                     | Must not                                     |
| -------------------------------- | ---------------------------------------- | -------------------------------------------- |
| Architecture                     | Boundaries, aggregates, non-goals        | Implementation detail as authority           |
| Engineering Specification        | Contracts and blueprints                 | Silent redesign of Architecture              |
| Engineering Waves                | Implementation within scope              | Architecture/ES redesign; future Waves early |
| ECR                              | Completeness review                      | Redesign or silent scope expansion           |
| Certification / Freeze / Release | Readiness, baseline, ship                | New feature Engineering without programme    |
| Owner                            | Authorisation, acceptance, risk, release | Delegation of gate authority to agents       |

Layering **SHALL** preserve Presentation → Application → Domain → Infrastructure → Adapters. Modules **SHALL NOT** call connectors/backends directly.

---

## 5. Traceability

Every Engineering artefact **SHALL** trace to:

1. Owner Instruction / programme identifier
2. Accepted Architecture baseline
3. Accepted Engineering Specification baseline
4. Build Contract obligations
5. Tests and evidence for new production behaviour

Traceability gaps **SHALL** block Wave completion and ECR pass.

---

## 6. Evidence-driven decisions

1. Owner Decisions **SHALL** be based on filed evidence, not verbal assertion alone.
2. Continuous evidence capture is **MANDATORY** throughout Waves and later stages.
3. Deviation Registers **SHALL** be filed even when empty.
4. Failed gates **SHALL** produce stop/escalation artefacts, not silent continuation.

---

## 7. Operating principles (summary)

| Principle                   | Rule                                                            |
| --------------------------- | --------------------------------------------------------------- |
| Smallest change             | Prefer the smallest change that satisfies authorised scope      |
| One Wave at a time          | No auto-start of Wave N+1                                       |
| Buildable mainline          | Wave completion **MUST** leave the repository buildable         |
| No placeholders as complete | Stub/TODO production paths **SHALL NOT** be marked complete     |
| Frozen baselines            | Certified/frozen packages **SHALL** be referenced, not modified |

---

## STOP

```text
ENGINEERING OPERATING MODEL
AI-ASSISTED · GOVERNANCE-FIRST
SEPARATION · TRACEABILITY · EVIDENCE-DRIVEN
```
