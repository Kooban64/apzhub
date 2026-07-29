# Certification Report — {{PROGRAMME_ID}}

| Field                       | Value                                                                 |
| --------------------------- | --------------------------------------------------------------------- |
| Template                    | **CERTIFICATION-REPORT**                                              |
| Standard                    | APZ Engineering Lifecycle Standard **v1.0**                           |
| Programme ID                | {{PROGRAMME_ID}}                                                      |
| Certification level         | **Component** / **Capability** / **Platform**                         |
| Product                     | {{PRODUCT_ID}}                                                        |
| Capability                  | {{CAPABILITY_NAME}}                                                   |
| Package                     | {{PACKAGE_NAME}}                                                      |
| Version under certification | {{VERSION}}                                                           |
| Mode                        | **Review / verify** — Certification **SHALL NOT** perform engineering |
| Status                      | **{{CERT_STATUS}}**                                                   |
| Certified at (UTC)          | {{CERTIFIED_AT_UTC}}                                                  |
| Evidence ID                 | {{EVIDENCE_ID}}                                                       |

---

## 1. Independence declaration

> Certification is an independent assurance activity. This programme evaluates the capability **as delivered**. It **SHALL NOT** implement features, fix behavioural defects, refactor for improvement, or redesign architecture. Remediation requires a new Engineering programme.

Confirm:

- [ ] No production engineering performed under this CERT programme
- [ ] Findings recorded honestly (PASS / CONDITIONAL PASS / FAIL)
- [ ] Packaging limited to evidence, review records, metadata alignment authorised by Owner Instruction

---

## 2. Certification level & class

| Item              | Value                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Level             | {{CERT_LEVEL}}                                                                                 |
| Recommended class | {{CLASSIFICATION}}                                                                             |
| Example classes   | `PRODUCTION_READY_WITH_LIMITATIONS` · `DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS` · `NOT_READY` |

**Rules:**

1. Component certification **SHALL** name the layer in the class string.
2. Component certification **SHALL NOT** imply Capability Freeze or silent `1.0.0` promotion.
3. Capability certification is the normal gate for capability `1.0.0` and Freeze eligibility.
4. Platform certification is a separate Owner programme above capabilities.

---

## 3. Preconditions

| Precondition                                | Citation           | Met |
| ------------------------------------------- | ------------------ | --- |
| Architecture baselined                      | {{ARCH_REF}}       | ☐   |
| Engineering Specification baselined         | {{ES_REF}}         | ☐   |
| Required Waves complete + Owner-accepted    | {{WAVES_REF}}      | ☐   |
| ECR complete + Owner-accepted (if required) | {{ECR_REF}}        | ☐   |
| Validation report available                 | {{VALIDATION_REF}} | ☐   |

---

## 4. Scope of certification

### In scope

1. {{CERT_IN_SCOPE_1}}
2. Conformance to Architecture + Engineering Specification contracts in scope
3. Evidence of tests, docs, health, and observability required by lifecycle
4. Known limitations and risk register honesty

### Out of scope

1. Production engineering / defect remediation
2. Unauthorised version promotion or Freeze
3. Unrestricted GA declaration
4. {{CERT_OUT_OF_SCOPE_1}}

---

## 5. Evaluation matrix

| Area                                               | Result             | Evidence | Notes |
| -------------------------------------------------- | ------------------ | -------- | ----- |
| Functional completeness (authorised scope)         | PASS / COND / FAIL |          |       |
| Architecture conformance                           |                    |          |       |
| Engineering Specification conformance              |                    |          |       |
| Security / authz boundaries                        |                    |          |       |
| Audit / events / search integration (as specified) |                    |          |       |
| Test pyramid adequacy                              |                    |          |       |
| Accessibility (UI in scope)                        |                    |          |       |
| Operability / health                               |                    |          |       |
| Documentation completeness                         |                    |          |       |
| Frozen dependency integrity                        |                    |          |       |

---

## 6. Findings

| ID        | Severity                        | Area     | Finding     | Blocks class? |
| --------- | ------------------------------- | -------- | ----------- | ------------- |
| CF-{{NN}} | Critical / Major / Minor / Info | {{AREA}} | {{FINDING}} | Yes / No      |

---

## 7. Known limitations carried into class

| ID       | Limitation     | Accepted risk ref | Blocks unrestricted GA |
| -------- | -------------- | ----------------- | ---------------------- |
| L-{{NN}} | {{LIMITATION}} | R-{{NN}} / None   | Yes / No               |

---

## 8. Version & promotion recommendation

| Item                       | Recommendation                        |
| -------------------------- | ------------------------------------- |
| Retain version             | {{VERSION}}                           |
| Promote to                 | {{PROMOTE_TO_OR_NONE}}                |
| Freeze eligibility         | Eligible / Not eligible / Conditional |
| Git tag (if release later) | {{PROPOSED_TAG_OR_NONE}}              |

Version promotion and Freeze remain **Owner Decisions**. This report recommends only.

---

## 9. Certification outcome

| Outcome                   | Meaning                               |
| ------------------------- | ------------------------------------- |
| **CERTIFIED**             | Meets class with listed limitations   |
| **CONDITIONAL CERTIFIED** | Certified subject to Owner conditions |
| **NOT CERTIFIED**         | Fail — remediation via Engineering    |

**Outcome:** `{{CERT_OUTCOME}}`

**Status string:** `{{CERT_STATUS}}`

**Single recommendation:** `{{SINGLE_RECOMMENDATION}}`

---

## 10. Deliverables checklist

- [ ] This Certification Report
- [ ] Validation Report (or citation)
- [ ] Risk Acceptance Register
- [ ] Deviation Register
- [ ] Engineering Conformance Matrix
- [ ] Owner Summary + Owner Decision template
- [ ] Evidence JSON
- [ ] Release-evidence pointers (if packaging)

---

## STOP

```text
{{PROGRAMME_ID}}
CERTIFICATION REPORT
{{CERT_STATUS}}
CERTIFICATION SHALL NOT PERFORM ENGINEERING
AWAITING OWNER CERTIFICATION DECISION
```
