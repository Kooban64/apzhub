# Owner Authorisation Decision — {{PROGRAMME_ID}}

| Field                        | Value                                       |
| ---------------------------- | ------------------------------------------- |
| Form                         | **TEMPLATE-AUTHORISATION**                  |
| Standard                     | APZ Engineering Lifecycle Standard **v1.0** |
| Programme to authorise       | {{PROGRAMME_ID}}                            |
| Programme type               | {{PROGRAMME_TYPE}}                          |
| Product / capability         | {{PRODUCT_ID}} / {{CAPABILITY_NAME}}        |
| Package                      | {{PACKAGE_NAME}}                            |
| Issued at (UTC)              | {{ISSUED_AT_UTC}}                           |
| Directive / Instruction path | {{OWNER_INSTRUCTION_PATH}}                  |
| Cursor directive used        | {{CURSOR_DIRECTIVE_PATH}}                   |

---

## Preconditions acknowledged

| Precondition       | Citation       | OK  |
| ------------------ | -------------- | --- |
| {{PRECONDITION_1}} | {{CITATION_1}} | ☐   |
| {{PRECONDITION_2}} | {{CITATION_2}} | ☐   |

---

## Authorisation decision

| ☐   | Decision                                       |
| --- | ---------------------------------------------- |
| ☐   | **AUTHORISE COMMENCEMENT** of {{PROGRAMME_ID}} |
| ☐   | **WITHHOLD** — do not start                    |
| ☐   | **AUTHORISE WITH CONSTRAINTS** (list below)    |

**Recorded:** `{{AUTHORISATION_DECISION}}`

---

## Authorised scope (summary)

1. {{SCOPE_1}}
2. {{SCOPE_2}}

Full scope is the Owner Instruction at `{{OWNER_INSTRUCTION_PATH}}`. If conflict, Instruction + this Decision prevail over agent assumptions.

---

## Constraints / non-goals

1. {{CONSTRAINT_1}}
2. Mode: **{{ENGINEER / REVIEW_VERIFY / GOVERNANCE_PACKAGING}}**
3. Stop condition: `{{STOP_CONDITION}}`
4. Shall not start: {{FORBIDDEN_NEXT}}

---

## Build Contract affirmation (Engineering Waves only)

| ☐   | Affirmation                            |
| --- | -------------------------------------- |
| ☐   | Engineering Build Contract **APPLIES** |
| ☐   | N/A (not an Engineering Wave)          |

---

## Evidence

| Field                           | Value                         |
| ------------------------------- | ----------------------------- |
| Authorisation evidence id       | {{AUTHORISATION_EVIDENCE_ID}} |
| Standing record update required | Yes / No                      |

---

## Signature

| Owner | {{OWNER_NAME}} |
| Timestamp (UTC) | {{ISSUED_AT_UTC}} |

---

## STOP

```text
{{PROGRAMME_ID}}
OWNER AUTHORISATION
{{AUTHORISATION_DECISION}}
COMMENCE ONLY AS INSTRUCTED
```
