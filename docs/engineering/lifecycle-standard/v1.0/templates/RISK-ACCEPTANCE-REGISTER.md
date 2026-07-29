# Risk Acceptance Register — {{PROGRAMME_ID}}

| Field             | Value                                              |
| ----------------- | -------------------------------------------------- |
| Template          | **RISK-ACCEPTANCE-REGISTER**                       |
| Standard          | APZ Engineering Lifecycle Standard **v1.0**        |
| Programme ID      | {{PROGRAMME_ID}}                                   |
| Product           | {{PRODUCT_ID}}                                     |
| Capability        | {{CAPABILITY_NAME}}                                |
| Package / version | {{PACKAGE_NAME}} {{VERSION}}                       |
| Register status   | **OPEN** / **CLOSED WITH ACCEPTANCES** / **EMPTY** |
| Updated at (UTC)  | {{UPDATED_AT_UTC}}                                 |

---

## 1. Purpose

Record residual risks that remain after Engineering / ECR / Certification / Freeze / Release activities, and capture explicit Owner acceptance where the programme proceeds despite those risks.

An **empty register** is valid and preferred when no residual risks require Owner attention — still commit this file with §4 stating **None**.

---

## 2. Rules

1. Risks that **block** the recommended baseline **SHALL** be listed even if not accepted.
2. Silent proceed without a register entry is a governance defect.
3. Risk acceptance **SHALL NOT** grant permissions, bypass authz, or authorise unscoped engineering.
4. Acceptance **MAY** be time-bounded; expired acceptances reopen the risk.
5. Risks that block unrestricted GA **SHALL** set `Blocks unrestricted GA = Yes`.
6. Remediation **SHALL** reference a future programme id when known; otherwise `TBD — Owner`.

---

## 3. Risk severity model

| Severity     | Meaning                                                  |
| ------------ | -------------------------------------------------------- |
| **Critical** | Unsafe, non-compliant, or data-loss class; default block |
| **High**     | Major functional / security / integrity gap              |
| **Medium**   | Material limitation with workaround                      |
| **Low**      | Minor residual; monitoring sufficient                    |

---

## 4. Register

| Risk ID  | Title     | Severity                       | Description     | Likelihood | Impact    | Existing controls | Residual rating | Blocks unrestricted GA | Disposition                                 | Owner acceptance              | Expiry / review | Remediation programme |
| -------- | --------- | ------------------------------ | --------------- | ---------- | --------- | ----------------- | --------------- | ---------------------- | ------------------------------------------- | ----------------------------- | --------------- | --------------------- |
| R-{{NN}} | {{TITLE}} | Critical / High / Medium / Low | {{DESCRIPTION}} | L / M / H  | L / M / H | {{CONTROLS}}      | {{RESIDUAL}}    | Yes / No               | Accept / Mitigate / Transfer / Avoid / Open | Pending / Accepted / Rejected | {{EXPIRY}}      | {{REMEDIATION_ID}}    |

If no risks: **None — register EMPTY.**

---

## 5. Acceptance log

| Risk ID  | Owner Decision ref     | Accepted at (UTC) | Conditions     | Evidence ID     |
| -------- | ---------------------- | ----------------- | -------------- | --------------- |
| R-{{NN}} | {{OWNER_DECISION_REF}} | {{ACCEPTED_AT}}   | {{CONDITIONS}} | {{EVIDENCE_ID}} |

If none accepted: **None.**

---

## 6. Aggregation for stage reports

| Metric                   | Count                   |
| ------------------------ | ----------------------- |
| Open (not accepted)      | {{OPEN_COUNT}}          |
| Accepted with conditions | {{ACCEPTED_COND_COUNT}} |
| Accepted unconditional   | {{ACCEPTED_COUNT}}      |
| Blocking unrestricted GA | {{GA_BLOCK_COUNT}}      |
| Critical open            | {{CRITICAL_OPEN}}       |

---

## 7. Linkage

| Related artefact               | Path                        |
| ------------------------------ | --------------------------- |
| Deviation register             | {{DEVIATION_REGISTER_PATH}} |
| Known limitations              | {{KNOWN_LIMITATIONS_PATH}}  |
| Certification / Release report | {{STAGE_REPORT_PATH}}       |
| Owner Decision                 | {{OWNER_DECISION_PATH}}     |

Deviations describe **what differed from baseline**. Risks describe **what harm remains**. Cross-link IDs when both apply.

---

## STOP

```text
{{PROGRAMME_ID}}
RISK ACCEPTANCE REGISTER
{{REGISTER_STATUS}}
NO SILENT RISK ACCEPTANCE
```
