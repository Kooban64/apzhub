# Certification Stage

| Item    | Value                                                                                                                                                                       |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stage   | Certification                                                                                                                                                               |
| Version | **1.0.0**                                                                                                                                                                   |
| Parent  | [../README.md](../README.md)                                                                                                                                                |
| Prior   | [../engineering-review/README.md](../engineering-review/README.md)                                                                                                          |
| Next    | [../freeze/README.md](../freeze/README.md)                                                                                                                                  |
| Related | [../../oes/OES-CERTIFICATION-LEVELS.md](../../oes/OES-CERTIFICATION-LEVELS.md) · [../../oes/OES-CERTIFICATION-INDEPENDENCE.md](../../oes/OES-CERTIFICATION-INDEPENDENCE.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Purpose

Certification is an evidence-based determination of readiness class for a capability after Owner Engineering Acceptance. It is not a substitute for ECR or Freeze.

---

## 2. Objectives

1. Evaluate the capability against applicable certification criteria and independence rules.
2. Assign a certification class (or fail) with explicit limitations.
3. Consolidate validation, security, and quality evidence.
4. Produce an Owner Certification Decision pack.

---

## 3. Authorised scope

Certification programmes **MAY** include: certification reports, criteria matrices, independence statements, limitation registers, and recommendation of Freeze readiness.

Certification **SHALL** require Owner Engineering Acceptance (post-ECR) unless Owner records exception.

---

## 4. Prohibited activities

1. New feature Engineering during Certification.
2. Changing Architecture/ES to force a pass.
3. Concealing failed criteria or residual risks.
4. Declaring unrestricted GA inside Certification without Release/GA Owner Decision.
5. Auto-starting Freeze.

---

## 5. Success criteria

| Criterion    | Requirement                                             |
| ------------ | ------------------------------------------------------- |
| Evidence     | Criteria evaluated with durable evidence                |
| Independence | Independence rules satisfied where applicable           |
| Class        | Certification class (or FAIL) stated clearly            |
| Limitations  | Known limitations registered                            |
| Stop state   | **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION** |

---

## 6. Stop condition

Certification **SHALL STOP** for Owner Decision. Freeze **SHALL NOT** start until Certification is Accepted/Approved for freeze progression (or Owner exception).

---

## 7. Owner decision gate

| Decision             | Effect                                                |
| -------------------- | ----------------------------------------------------- |
| ACCEPTED / APPROVED  | Certification baselined; Freeze **MAY** be authorised |
| RETURN FOR REVISION  | Remediate evidence/Engineering under Owner direction  |
| REJECTED / NOT READY | Stop; no Freeze/Release                               |

---

## STOP

```text
CERTIFICATION
EVIDENCE-BASED CLASS
OWNER DECISION BEFORE FREEZE
```
