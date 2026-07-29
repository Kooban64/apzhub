# Build Contract — Lifecycle Standard Consolidation

| Item             | Value                                                                                                                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document         | Build Contract (Lifecycle Standard v1.0)                                                                                                                                                                                                            |
| Version          | **1.0.0**                                                                                                                                                                                                                                           |
| Parent           | [README.md](./README.md)                                                                                                                                                                                                                            |
| Status           | Normative for adopters of this Lifecycle Standard                                                                                                                                                                                                   |
| Related IN FORCE | [../../oes/ENGINEERING-BUILD-CONTRACT.md](../../oes/ENGINEERING-BUILD-CONTRACT.md) · [../../oes/OES-003-Engineering-Build-Contract-and-Wave-Engineering-Standard.md](../../oes/OES-003-Engineering-Build-Contract-and-Wave-Engineering-Standard.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 0. Purpose and relationship

This document is the **definitive Build Contract** for adopters of the APZ Engineering Lifecycle Standard. It consolidates execution rules for Wave Engineering so product programmes have a single navigable contract.

Related artefacts remain **IN FORCE**:

- [ENGINEERING-BUILD-CONTRACT.md](../../oes/ENGINEERING-BUILD-CONTRACT.md) — APZOR Engineering Build Contract
- [OES-003](../../oes/OES-003-Engineering-Build-Contract-and-Wave-Engineering-Standard.md) — Wave Engineering Standard

Where wording differs in editorial form only, both apply. Where Owner later baselined this Lifecycle Standard as superseding consolidator, this document **SHALL** prevail for adopters; until then, OES IN FORCE text remains binding.

Violation is a programme defect requiring stop and Owner escalation where governance authority is required.

---

## 1. Continuous evidence — MANDATORY

Continuous evidence is **MANDATORY**. Engineering **SHALL NOT** defer evidence to programme end.

Each Wave and post-Wave stage **SHALL** produce durable evidence as work proceeds, including at minimum for Waves:

| Artefact                            | Required |
| ----------------------------------- | -------- |
| Completion / stage report           | Yes      |
| Build/test evidence                 | Yes      |
| Traceability to Architecture + ES   | Yes      |
| Deviation register (even if empty)  | Yes      |
| Owner Summary + Acceptance template | Yes      |
| Evidence JSON (programme practice)  | Yes      |
| Build Contract compliance assertion | Yes      |

Missing continuous evidence **SHALL** fail Wave completion and block Owner Acceptance.

---

## 2. Authority boundaries

| Authority                                | Engineering may                        |
| ---------------------------------------- | -------------------------------------- |
| Accepted Architecture                    | Implement only; never redesign         |
| Accepted Engineering Specification       | Implement only; never change contracts |
| This Build Contract / OES Build Contract | Obey                                   |
| Owner Instruction for the Wave           | Implement only that scope              |
| Frozen baselines                         | Reference only; never modify           |

Engineering **SHALL NOT** invent Architecture or ES decisions.

---

## 3. Layering and dependencies

1. Layer order **SHALL** be Presentation → Application → Domain → Infrastructure → Adapters → Engines.
2. Dependency direction **SHALL** respect package boundaries; no circular dependencies.
3. Domain **SHALL** remain pure where Architecture/ES require purity.
4. Client traffic **SHALL** route through platform APIs / Application as specified.
5. Modules **SHALL NOT** call connectors or backends directly.
6. Platform authz, audit, events, and search patterns **SHALL** be used — no private forks.

---

## 4. Validation obligations

1. New production behaviour **MUST** have automated tests at appropriate pyramid layers.
2. Applicable lint / typecheck / test / build gates for touched packages **MUST** pass at Wave completion.
3. Broken mainline at Wave completion is a failed Wave.
4. Public interfaces introduced **SHALL** be documented.
5. Validation **SHALL** include Build Contract compliance, Architecture fidelity, ES fidelity, frozen-baseline integrity, and “no unauthorised scope.”

---

## 5. Conflict handling

| Conflict                          | Required action                                    |
| --------------------------------- | -------------------------------------------------- |
| Architecture conflict             | **STOP** immediately; escalate to Owner            |
| ES contract conflict              | **STOP**; escalate; no silent “clarifying” changes |
| Insufficient authorised scope     | **STOP**; request scope decision                   |
| Frozen baseline would need change | **STOP**; Owner-authorised programme only          |
| Ambiguous Owner Instruction       | Clarify once; if unresolved, **STOP**              |

Agents **SHALL NOT** invent a resolution. Acknowledge/Confirmed from Owner does **not** waive this Contract.

---

## 6. Prohibited behaviour (summary)

Engineering **SHALL NOT**: redesign Architecture; change ES; implement unauthorised or future Waves early; modify frozen baselines; ship placeholder production code as complete; add speculative features; skip tests; leave the repository non-buildable; auto-start the next Wave; continue after unescalated conflict.

Full prohibited list: [ENGINEERING-BUILD-CONTRACT.md](../../oes/ENGINEERING-BUILD-CONTRACT.md) §3.

---

## 7. Affirmation (required in every Wave completion report)

```text
This Wave was executed under the APZ Engineering Lifecycle Build Contract
(and the IN FORCE APZOR Engineering Build Contract / OES-003).
Architecture was not redesigned.
Engineering Specification was not changed.
Only authorised Wave scope was implemented.
Continuous evidence was filed.
Repository buildability and required tests/docs were satisfied (or escalated).
Deviations are listed in the Deviation Register.
```

---

## STOP

```text
BUILD CONTRACT
CONTINUOUS EVIDENCE MANDATORY
LAYERING · VALIDATION · CONFLICT STOP
RELATED: OES ENGINEERING-BUILD-CONTRACT + OES-003 IN FORCE
```
