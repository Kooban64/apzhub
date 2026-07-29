# Deviation Register — {{PROGRAMME_ID}}

| Field             | Value                                       |
| ----------------- | ------------------------------------------- |
| Template          | **DEVIATION-REGISTER**                      |
| Standard          | APZ Engineering Lifecycle Standard **v1.0** |
| Programme ID      | {{PROGRAMME_ID}}                            |
| Product           | {{PRODUCT_ID}}                              |
| Capability        | {{CAPABILITY_NAME}}                         |
| Package / version | {{PACKAGE_NAME}} {{VERSION}}                |
| Register status   | **EMPTY** / **OPEN ITEMS** / **CLOSED**     |
| Updated at (UTC)  | {{UPDATED_AT_UTC}}                          |

---

## 1. Purpose

Record every material difference between **authorised baseline / Instruction** and **as-delivered work**, including justified ECR deviations, Build Contract exceptions, and documentation gaps.

An **empty register** is mandatory when there are no deviations — do not omit the file.

---

## 2. What counts as a deviation

| Counts                                           | Does not count                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| Behaviour differs from Architecture / ES         | Purely editorial typo fixes in non-normative text                       |
| Interface / permission / event contract drift    | File moves within authorised package boundaries with no contract change |
| Missing required test or doc for new behaviour   | Planned out-of-scope items never claimed as done                        |
| Unauthorised scope that was implemented (defect) | Explicit Owner-authorised scope changes (update Instruction instead)    |
| Build Contract rule bent or broken               | N/A — always record                                                     |

---

## 3. Severity

| Severity      | Meaning                                              |
| ------------- | ---------------------------------------------------- |
| **Blocking**  | Must be resolved or Owner-accepted before baseline   |
| **Major**     | Material; default Owner visibility before acceptance |
| **Minor**     | Local; track and close                               |
| **Justified** | Explicitly allowed by ECR / Owner with citation      |

---

## 4. Register

| Dev ID   | Severity                             | Baseline artefact                          | Expected     | Actual     | Justification     | Disposition                      | Owner visibility    | Linked risk     | Remediation     |
| -------- | ------------------------------------ | ------------------------------------------ | ------------ | ---------- | ----------------- | -------------------------------- | ------------------- | --------------- | --------------- |
| D-{{NN}} | Blocking / Major / Minor / Justified | Arch / ES / Instruction / Build Contract § | {{EXPECTED}} | {{ACTUAL}} | {{JUSTIFICATION}} | Open / Accepted / Fixed / Waived | Required / Informed | R-{{NN}} / None | {{REMEDIATION}} |

If none: **None — register EMPTY.**

---

## 5. Build Contract compliance assertions

| Build Contract rule             | Compliant | Deviation IDs |
| ------------------------------- | --------- | ------------- |
| Scope limited to Instruction    | Yes / No  |               |
| No Architecture redesign        | Yes / No  |               |
| No ES contract change           | Yes / No  |               |
| Tests for new behaviour         | Yes / No  |               |
| Repository buildable            | Yes / No  |               |
| No frozen baseline modification | Yes / No  |               |
| No next-Wave auto-start         | Yes / No  |               |

---

## 6. Summary counts

| Metric               | Count               |
| -------------------- | ------------------- |
| Blocking open        | {{BLOCKING_OPEN}}   |
| Major open           | {{MAJOR_OPEN}}      |
| Minor open           | {{MINOR_OPEN}}      |
| Justified (accepted) | {{JUSTIFIED_COUNT}} |
| Total                | {{TOTAL_COUNT}}     |

---

## 7. Closure rule

A programme **SHALL NOT** claim clean baseline if any **Blocking** deviation remains open without Owner Decision (accept / waive / return for revision).

---

## STOP

```text
{{PROGRAMME_ID}}
DEVIATION REGISTER
{{REGISTER_STATUS}}
EMPTY REGISTER IS VALID — OMITTING THE FILE IS NOT
```
