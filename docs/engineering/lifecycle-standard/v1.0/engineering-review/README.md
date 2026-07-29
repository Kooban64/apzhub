# Engineering Completion Review (ECR)

| Item    | Value                                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Stage   | Engineering Completion Review (ECR)                                                                                                |
| Version | **1.0.0**                                                                                                                          |
| Parent  | [../README.md](../README.md)                                                                                                       |
| Prior   | [../engineering-waves/README.md](../engineering-waves/README.md)                                                                   |
| Next    | [../certification/README.md](../certification/README.md)                                                                           |
| Related | [../../oes/OES-002-Engineering-Review-and-Acceptance-Standard.md](../../oes/OES-002-Engineering-Review-and-Acceptance-Standard.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Purpose

ECR is the formal review that Engineering Waves collectively satisfy Architecture, Engineering Specification, and the Build Contract before Certification. Wave Engineering does **not** replace ECR.

---

## 2. Objectives

1. Verify Engineering completeness for the capability scope under review.
2. Confirm Architecture and ES fidelity with traceability.
3. Confirm Build Contract compliance and continuous evidence across Waves.
4. Surface residual defects, deviations, and risks for Owner Decision.
5. Produce an Owner Engineering Acceptance pack.

---

## 3. Authorised scope

ECR programmes **MAY** include: completeness reports, compliance matrices, deviation consolidation, risk register updates, validation summaries, and Owner Summary / Acceptance templates.

ECR **SHALL NOT** perform new feature Engineering. Remediation discovered in ECR **SHALL** be Owner-directed (return to a Wave programme or dedicated fix programme).

---

## 4. Prohibited activities

1. Silent scope expansion or “finish the feature” coding inside ECR without Owner authorisation.
2. Redesign of Architecture or ES.
3. Skipping Wave evidence gaps by assertion.
4. Auto-starting Certification.

---

## 5. Success criteria

| Criterion     | Requirement                                                       |
| ------------- | ----------------------------------------------------------------- |
| Wave coverage | Authorised Waves complete and Owner-accepted (or waiver recorded) |
| Fidelity      | Architecture + ES traceability closed                             |
| Contract      | Build Contract compliance asserted with evidence                  |
| Quality       | Required tests/gates green for Engineering scope                  |
| Risks         | Residual risks listed for Owner                                   |
| Stop state    | **IMPLEMENTED / AWAITING OWNER ENGINEERING ACCEPTANCE**           |

---

## 6. Stop condition

ECR **SHALL STOP** for Owner Engineering Acceptance. Certification **SHALL NOT** start until ACCEPTED (or Owner exception).

**STOP** if material gaps require Engineering before review can conclude honestly.

---

## 7. Owner decision gate

| Decision            | Effect                                                                     |
| ------------------- | -------------------------------------------------------------------------- |
| ACCEPTED            | Engineering baseline ready; Certification **MAY** be authorised            |
| RETURN FOR REVISION | Remediate under Owner-directed Wave/fix programme, then re-ECR as directed |
| REJECTED            | Stop; Owner directs remediation strategy                                   |

See [../OWNER-GOVERNANCE.md](../OWNER-GOVERNANCE.md) and [../risk-management/README.md](../risk-management/README.md).

---

## STOP

```text
ECR
COMPLETENESS BEFORE CERTIFICATION
OWNER ENGINEERING ACCEPTANCE GATE
```
