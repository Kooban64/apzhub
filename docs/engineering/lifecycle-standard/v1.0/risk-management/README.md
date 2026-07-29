# Risk Management

| Item     | Value                                            |
| -------- | ------------------------------------------------ |
| Document | Risk Management                                  |
| Version  | **1.0.0**                                        |
| Parent   | [../README.md](../README.md)                     |
| Related  | [../OWNER-GOVERNANCE.md](../OWNER-GOVERNANCE.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Purpose

Risk management is continuous across the lifecycle. Risks **SHALL** be identified early, tracked through Waves/ECR/Certification/Freeze/Release, and explicitly accepted, mitigated, or used to block progression.

---

## 2. Principles

1. Silent risk acceptance is forbidden.
2. Continuous evidence **MUST** include risk/deviation visibility ([../BUILD-CONTRACT.md](../BUILD-CONTRACT.md)).
3. Risks that change Architecture/ES meaning **SHALL** escalate to Owner before Engineering continues.
4. Limited Availability **MAY** proceed with accepted residual risks; unrestricted GA **SHALL NOT** while blocking risks remain open unless Owner explicitly accepts them for GA.

---

## 3. Risk register minimum fields

| Field           | Requirement                                                            |
| --------------- | ---------------------------------------------------------------------- |
| Risk id         | Stable identifier                                                      |
| Stage found     | Architecture / ES / Wave / ECR / CERT / FREEZE / RELEASE / Maintenance |
| Description     | Factual, concise                                                       |
| Impact          | User/ops/security/compliance impact                                    |
| Likelihood      | Qualitative or stated scale                                            |
| Mitigation      | Action or none                                                         |
| Owner Decision  | Accept / Defer / Remediate / Block                                     |
| Expiry / review | Required if conditional acceptance                                     |

---

## 4. Stage expectations

| Stage             | Risk duty                                                           |
| ----------------- | ------------------------------------------------------------------- |
| Architecture / ES | Record design risks and non-goals that constrain Engineering        |
| Waves             | Deviation Register + escalate contract conflicts                    |
| ECR               | Consolidate residual Engineering risks                              |
| Certification     | Map risks to certification class / limitations                      |
| Freeze            | Carry known limitations into freeze baseline                        |
| Release           | Final risk acceptance register; availability recommendation         |
| Maintenance / EOL | Re-open or retire risks; EOL risks include migration/data retention |

---

## 5. Escalation

Escalate immediately when risk requires:

- Architecture or ES change
- Waiver of Build Contract or quality gates
- Freeze/Release with material open defects
- GA despite blocking limitations

Owner outcomes: Accept with conditions, Defer with review date, Order remediation, Reject progression.

---

## 6. Relationship to deviations

Deviations are process/contract variances; risks are potential harms. Both **SHALL** be filed. A deviation **MAY** imply a risk; both records **SHOULD** cross-reference.

---

## STOP

```text
RISK MANAGEMENT
CONTINUOUS · EXPLICIT OWNER ACCEPTANCE
BLOCKS GA WHEN MATERIAL
```
