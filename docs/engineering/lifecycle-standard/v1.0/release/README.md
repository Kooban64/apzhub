# Release Stage

| Item    | Value                                                                         |
| ------- | ----------------------------------------------------------------------------- |
| Stage   | Release                                                                       |
| Version | **1.0.0**                                                                     |
| Parent  | [../README.md](../README.md)                                                  |
| Prior   | [../freeze/README.md](../freeze/README.md)                                    |
| Next    | GA / Maintenance ([../ENGINEERING-LIFECYCLE.md](../ENGINEERING-LIFECYCLE.md)) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Purpose

Release produces the tagged, reproducible production release under Owner Release Decision, including availability class (Limited vs unrestricted GA).

---

## 2. Objectives

1. Verify freeze baseline integrity, build reproducibility, and validation.
2. Finalise traceability, risk acceptance, and operational handover.
3. Recommend availability class with explicit blockers for unrestricted GA.
4. Obtain Owner Production Release Decision and close the Release programme.

---

## 3. Authorised scope

Release programmes **MAY** include: production release report, deployment readiness, operational handover pack, final traceability, final risk acceptance register, known limitations, verification report, Owner Summary / Acceptance.

Release **SHALL** require Freeze Acceptance. Release **SHALL NOT** invent new Engineering scope.

Operational push/publish steps outside governance **MAY** proceed after Owner Approval per product practice, without reopening Engineering gates.

---

## 4. Prohibited activities

1. Feature Engineering during Release.
2. Inferring unrestricted GA from Limited Availability approval.
3. Shipping without tagged, reproducible baseline.
4. Silent risk acceptance.
5. Auto-declaring GA or EOL.

---

## 5. Success criteria

| Criterion       | Requirement                                       |
| --------------- | ------------------------------------------------- |
| Baseline        | Frozen version identity confirmed                 |
| Reproducibility | Build/tag evidence filed                          |
| Validation      | Required suites recorded                          |
| Risk            | Residual risks accepted or blocking GA stated     |
| Handover        | Operational pack complete                         |
| Stop state      | **IMPLEMENTED / AWAITING OWNER RELEASE DECISION** |

---

## 6. Stop condition

Release **SHALL STOP** for Owner Decision. Availability outcomes:

| Outcome                       | Meaning                                            |
| ----------------------------- | -------------------------------------------------- |
| LIMITED_AVAILABILITY_APPROVED | Controlled rollout authorised; GA not authorised   |
| GA_APPROVED                   | Unrestricted GA authorised (rare at first Release) |
| NOT APPROVED                  | No production release                              |

---

## 7. Owner decision gate

| Decision            | Effect                                                |
| ------------------- | ----------------------------------------------------- |
| ACCEPTED / APPROVED | Production Release baselined; programme **MAY** close |
| RETURN FOR REVISION | Correct release pack under Owner direction            |
| REJECTED            | Stop; no production baseline                          |

See [../OWNER-GOVERNANCE.md](../OWNER-GOVERNANCE.md) and [../risk-management/README.md](../risk-management/README.md).

---

## STOP

```text
RELEASE
TAGGED REPRODUCIBLE BASELINE
OWNER DECIDES AVAILABILITY
```
