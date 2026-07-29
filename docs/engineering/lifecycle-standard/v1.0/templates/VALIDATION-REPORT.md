# Validation Report — {{PROGRAMME_ID}}

| Field              | Value                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Template           | **VALIDATION-REPORT**                                                                     |
| Standard           | APZ Engineering Lifecycle Standard **v1.0**                                               |
| Programme ID       | {{PROGRAMME_ID}}                                                                          |
| Programme type     | {{PROGRAMME_TYPE}}                                                                        |
| Product            | {{PRODUCT_ID}}                                                                            |
| Capability         | {{CAPABILITY_NAME}}                                                                       |
| Package / version  | {{PACKAGE_NAME}} {{VERSION}}                                                              |
| Mode               | **Review / verify** (primary) — engineering fixes require a separate authorised programme |
| Validated at (UTC) | {{VALIDATED_AT_UTC}}                                                                      |
| Validator role     | {{VALIDATOR_ROLE}}                                                                        |
| Evidence ID        | {{EVIDENCE_ID}}                                                                           |

---

## 1. Purpose

Validate that the as-delivered outcomes of {{PROGRAMME_ID}} conform to the Owner Instruction, accepted baselines, and applicable Build Contract / lifecycle rules — **without performing production engineering**.

---

## 2. Validation scope

### In scope

1. {{VALIDATION_IN_SCOPE_1}}
2. Build / type / test evidence cited by the Completion Report
3. Traceability to Architecture and Engineering Specification (as applicable)
4. Deviation and risk register completeness
5. Stop-condition and out-of-scope compliance

### Out of scope

1. Implementing fixes or new features
2. Redesigning Architecture or Engineering Specification
3. Starting the next Wave or lifecycle stage
4. {{VALIDATION_OUT_OF_SCOPE_1}}

---

## 3. Baselines under test

| Baseline                   | Citation                  | Integrity        |
| -------------------------- | ------------------------- | ---------------- |
| Owner Instruction          | {{OWNER_INSTRUCTION_REF}} | ☐ Intact         |
| Architecture               | {{ARCHITECTURE_BASELINE}} | ☐ Intact         |
| Engineering Specification  | {{ES_BASELINE}}           | ☐ Intact / N/A   |
| Build Contract             | {{BUILD_CONTRACT_REF}}    | ☐ Affirmed / N/A |
| Frozen packages referenced | {{FROZEN_REFS}}           | ☐ Untouched      |

---

## 4. Validation dimensions

Score each dimension: **PASS** / **FAIL** / **CONDITIONAL** / **N/A**.

| #    | Dimension                                    | Result | Evidence | Notes |
| ---- | -------------------------------------------- | ------ | -------- | ----- |
| V-01 | Owner Instruction scope fidelity             |        |          |       |
| V-02 | No unauthorised scope                        |        |          |       |
| V-03 | Architecture fidelity                        |        |          |       |
| V-04 | Engineering Specification fidelity           |        |          |       |
| V-05 | Build Contract compliance                    |        |          |       |
| V-06 | Repository integrity (buildable, no secrets) |        |          |       |
| V-07 | Required tests for new behaviour             |        |          |       |
| V-08 | Public interface documentation               |        |          |       |
| V-09 | Deviation register present & honest          |        |          |       |
| V-10 | Risk register present & honest               |        |          |       |
| V-11 | Evidence JSON complete & consistent          |        |          |       |
| V-12 | Indexes / changelog hygiene                  |        |          |       |
| V-13 | Stop condition correct                       |        |          |       |
| V-14 | {{CUSTOM_DIMENSION}}                         |        |          |       |

---

## 5. Command / evidence results

| Check                      | Command or method   | Expected          | Actual | Result |
| -------------------------- | ------------------- | ----------------- | ------ | ------ |
| Typecheck                  | {{TYPECHECK_CMD}}   | exit 0            |        |        |
| Lint                       | {{LINT_CMD}}        | exit 0            |        |        |
| Build                      | {{BUILD_CMD}}       | exit 0            |        |        |
| Unit                       | {{UNIT_CMD}}        | pass              |        |        |
| Integration                | {{INTEGRATION_CMD}} | pass / N/A        |        |        |
| E2E                        | {{E2E_CMD}}         | pass / classified |        |        |
| Manifest / package version | file review         | {{VERSION}}       |        |        |

Attach log pointers (paths or CI run ids) — not raw secrets.

---

## 6. Findings

| ID       | Severity                        | Dimension | Finding     | Disposition                       |
| -------- | ------------------------------- | --------- | ----------- | --------------------------------- |
| F-{{NN}} | Critical / Major / Minor / Info | V-{{NN}}  | {{FINDING}} | Fix required / Risk accept / Note |

**Critical** or unresolved **Major** findings → overall **FAIL** unless Owner records risk acceptance before baseline.

---

## 7. Overall validation outcome

| Outcome              | When to use                                           |
| -------------------- | ----------------------------------------------------- |
| **PASS**             | All mandatory dimensions PASS; no open Critical/Major |
| **CONDITIONAL PASS** | Pass subject to Owner-accepted conditions / risks     |
| **FAIL**             | Mandatory dimension FAIL or Critical finding open     |

**Outcome:** `{{VALIDATION_OUTCOME}}`

**Recommendation to Owner:** `{{RECOMMENDATION}}`

---

## 8. Conditions for CONDITIONAL PASS

| ID        | Condition     | Must be cleared before |
| --------- | ------------- | ---------------------- |
| VC-{{NN}} | {{CONDITION}} | {{GATE}}               |

If none: **N/A**.

---

## 9. Independence statement

This validation was performed in **review / verify** mode. No production engineering was performed under this report. Remediation, if required, **SHALL** be authorised under a separate Owner Instruction (Engineering Wave or equivalent).

---

## STOP

```text
{{PROGRAMME_ID}}
VALIDATION REPORT
{{VALIDATION_OUTCOME}}
NO ENGINEERING PERFORMED UNDER THIS REPORT
```
