# Engineering Waves

| Item             | Value                                                                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stage            | Engineering Waves                                                                                                                                              |
| Version          | **1.0.0**                                                                                                                                                      |
| Parent           | [../README.md](../README.md)                                                                                                                                   |
| Contract         | [../BUILD-CONTRACT.md](../BUILD-CONTRACT.md)                                                                                                                   |
| Related IN FORCE | [../../oes/OES-003-Engineering-Build-Contract-and-Wave-Engineering-Standard.md](../../oes/OES-003-Engineering-Build-Contract-and-Wave-Engineering-Standard.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Purpose

Engineering Waves deliver bounded, Owner-reviewable production increments. Monolithic Engineering is **SUPERSEDED** for future authorisations.

---

## 2. Default Wave taxonomy

| Wave   | Focus                    | Document                                                         |
| ------ | ------------------------ | ---------------------------------------------------------------- |
| **01** | Repository scaffolding   | [WAVE-01-REPOSITORY.md](./WAVE-01-REPOSITORY.md)                 |
| **02** | Domain                   | [WAVE-02-DOMAIN.md](./WAVE-02-DOMAIN.md)                         |
| **03** | Application              | [WAVE-03-APPLICATION.md](./WAVE-03-APPLICATION.md)               |
| **04** | Infrastructure & API     | [WAVE-04-INFRASTRUCTURE-API.md](./WAVE-04-INFRASTRUCTURE-API.md) |
| **05** | Workbench / Presentation | [WAVE-05-WORKBENCH.md](./WAVE-05-WORKBENCH.md)                   |

Owners **MAY** refine, split, or combine Waves with recorded justification. Combining **SHOULD** be rare for AI-assisted delivery.

---

## 3. Common rules (all Waves)

1. Prerequisites: Accepted Architecture, Accepted ES (or exception), Owner Wave Instruction, Build Contract affirmation.
2. Continuous evidence is **MANDATORY** ([../BUILD-CONTRACT.md](../BUILD-CONTRACT.md)).
3. Architecture and ES **SHALL NOT** be redesigned.
4. Only authorised Wave scope **SHALL** be implemented.
5. Repository **MUST** be buildable at Wave completion.
6. Owner Review **SHALL** gate progression to the next Wave.
7. Agents **SHALL NOT** auto-start Wave N+1.

---

## 4. Progression

```text
Wave N Authorised → Wave N Implemented → Owner Review
  → ACCEPTED → Wave N+1 MAY be authorised by separate Instruction
  → RETURN FOR REVISION → fix under same Wave id
  → REJECTED → stop; Owner directs remediation
```

After Owner determines Waves sufficient for capability completeness → [../engineering-review/README.md](../engineering-review/README.md) (ECR).

---

## 5. Evidence per Wave

Completion report · Build/test evidence · Traceability · Deviation register · Owner Summary + Acceptance template · Evidence JSON · Build Contract affirmation.

---

## STOP

```text
ENGINEERING WAVES
01–05 OWNER-GATED
BUILD CONTRACT BINDING
```
