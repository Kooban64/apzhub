# Owner Acceptance Decision — {{PROGRAMME_ID}}

| Field                   | Value                                       |
| ----------------------- | ------------------------------------------- |
| Form                    | **TEMPLATE-ACCEPTANCE**                     |
| Standard                | APZ Engineering Lifecycle Standard **v1.0** |
| Programme ID            | {{PROGRAMME_ID}}                            |
| Programme type          | {{PROGRAMME_TYPE}}                          |
| Product / capability    | {{PRODUCT_ID}} / {{CAPABILITY_NAME}}        |
| Package / version       | {{PACKAGE_NAME}} {{VERSION}}                |
| Pack path               | {{PACK_PATH}}                               |
| Implementation evidence | {{IMPLEMENTATION_EVIDENCE_ID}}              |
| Decision evidence       | {{DECISION_EVIDENCE_ID}}                    |
| Decided at (UTC)        | {{DECIDED_AT_UTC}}                          |

---

## Materials accepted

| Artefact                  | Path                |
| ------------------------- | ------------------- |
| Stage / completion report | {{REPORT_PATH}}     |
| Validation report         | {{VALIDATION_PATH}} |
| Deviation register        | {{DEVIATION_PATH}}  |
| Other                     | {{OTHER_PATHS}}     |

---

## Decision (select one)

| ☐   | Code                         | Status string to record         |
| --- | ---------------------------- | ------------------------------- |
| ☐   | **ACCEPTED**                 | `{{ACCEPTED_STATUS_STRING}}`    |
| ☐   | **ACCEPTED WITH CONDITIONS** | `{{CONDITIONAL_STATUS_STRING}}` |
| ☐   | **RETURN FOR REVISION**      | `RETURN FOR REVISION`           |
| ☐   | **REJECTED**                 | `REJECTED`                      |

**Recorded decision:** `{{PRIMARY_DECISION}}`

**Normative status string:** `{{STATUS_STRING}}`

Suggested status strings by type:

| Type                      | Example                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| Architecture              | `ACCEPTED / APPROVED / ARCHITECTURE BASELINED / CLOSED`              |
| Engineering Specification | `ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED` |
| Wave                      | `ACCEPTED / APPROVED / WAVE {{N}} BASELINED / CLOSED`                |
| ECR                       | `ACCEPTED / APPROVED / ECR BASELINED / CLOSED`                       |
| Certification             | `ACCEPTED / APPROVED / CERTIFICATION BASELINED / CLOSED`             |

---

## Conditions (if any)

| ID       | Condition     | Gate     |
| -------- | ------------- | -------- |
| C-{{NN}} | {{CONDITION}} | {{GATE}} |

None ☐

---

## Authorises

1. Baseline / close of {{PROGRAMME_ID}} as stated
2. {{AUTHORISES_ADDITIONAL}}

## Does not authorise

1. Next Wave / next lifecycle stage unless named below
2. Unrestricted GA
3. {{DOES_NOT_AUTHORISE}}

**Named next programme (optional):** {{NEXT_PROGRAMME_ID_OR_NONE}} — still requires separate Authorisation unless Owner combines explicitly here.

---

## Signature

| Owner | {{OWNER_NAME}} |
| Timestamp (UTC) | {{DECIDED_AT_UTC}} |
| Evidence | {{DECISION_EVIDENCE_ID}} |

---

## STOP

```text
{{PROGRAMME_ID}}
OWNER ACCEPTANCE
{{STATUS_STRING}}
```
