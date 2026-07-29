# Owner Risk Acceptance Decision — {{PROGRAMME_ID}}

| Field                | Value                                       |
| -------------------- | ------------------------------------------- |
| Form                 | **TEMPLATE-RISK-ACCEPTANCE**                |
| Standard             | APZ Engineering Lifecycle Standard **v1.0** |
| Related programme    | {{PROGRAMME_ID}}                            |
| Product / capability | {{PRODUCT_ID}} / {{CAPABILITY_NAME}}        |
| Package / version    | {{PACKAGE_NAME}} {{VERSION}}                |
| Risk register path   | {{RISK_REGISTER_PATH}}                      |
| Decided at (UTC)     | {{DECIDED_AT_UTC}}                          |
| Decision evidence    | {{DECISION_EVIDENCE_ID}}                    |

---

## Context

This Decision accepts residual risks so that programme outcome `{{RELATED_STATUS_OR_CLASS}}` may proceed **with eyes open**. It does **not** authorise engineering, grant permissions, or bypass platform security controls.

---

## Risks accepted

| Risk ID  | Title     | Severity | Residual     | Blocks unrestricted GA | Conditions     | Expiry / review |
| -------- | --------- | -------- | ------------ | ---------------------- | -------------- | --------------- |
| R-{{NN}} | {{TITLE}} | {{SEV}}  | {{RESIDUAL}} | Yes / No               | {{CONDITIONS}} | {{EXPIRY}}      |

---

## Decision

| ☐   | Code                                                         |
| --- | ------------------------------------------------------------ |
| ☐   | **RISKS ACCEPTED** as tabulated                              |
| ☐   | **RISKS ACCEPTED WITH ADDITIONAL CONDITIONS**                |
| ☐   | **RISKS REJECTED** — programme must mitigate before baseline |
| ☐   | **PARTIAL** — only listed IDs accepted; others remain open   |

**Recorded:** `{{RISK_DECISION}}`

---

## Additional conditions

| ID        | Condition     |
| --------- | ------------- |
| RC-{{NN}} | {{CONDITION}} |

None ☐

---

## Effect on availability / certification

| Effect                           | Value                                           |
| -------------------------------- | ----------------------------------------------- |
| Certification class still valid? | Yes / No / Conditional                          |
| Unrestricted GA                  | **NOT AUTHORISED** / **AUTHORISED** / Unchanged |
| Remediaton programmes expected   | {{REMEDIATION_PROGRAMME_IDS}}                   |

Default: accepting risks that block GA **does not** authorise unrestricted GA.

---

## Explicit non-effects

This Decision does **not**:

1. Close open **Blocking** deviations unless those deviation IDs are listed: {{DEVIATION_IDS_OR_NONE}}
2. Authorise the next lifecycle stage
3. Modify Architecture or Engineering Specification
4. {{NON_EFFECT}}

---

## Signature

| Owner | {{OWNER_NAME}} |
| Timestamp (UTC) | {{DECIDED_AT_UTC}} |
| Evidence | {{DECISION_EVIDENCE_ID}} |

---

## STOP

```text
{{PROGRAMME_ID}}
OWNER RISK ACCEPTANCE
{{RISK_DECISION}}
SECURITY BYPASS NOT IMPLIED
```
