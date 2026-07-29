# Owner Availability Decision — {{PROGRAMME_ID}}

| Field                     | Value                                       |
| ------------------------- | ------------------------------------------- |
| Form                      | **TEMPLATE-AVAILABILITY-DECISION**          |
| Standard                  | APZ Engineering Lifecycle Standard **v1.0** |
| Related release programme | {{PROGRAMME_ID}}                            |
| Product / capability      | {{PRODUCT_ID}} / {{CAPABILITY_NAME}}        |
| Package / version         | {{PACKAGE_NAME}} {{VERSION}}                |
| Git tag                   | {{GIT_TAG}}                                 |
| Certification class       | {{CERT_CLASS}}                              |
| Freeze ref                | {{FREEZE_REF}}                              |
| Decided at (UTC)          | {{DECIDED_AT_UTC}}                          |
| Decision evidence         | {{DECISION_EVIDENCE_ID}}                    |

---

## Purpose

Decide production **availability posture** for a released (or release-candidate) capability baseline.

---

## Inputs reviewed

| Input                   | Path / id                      |
| ----------------------- | ------------------------------ |
| Release Report          | {{RELEASE_REPORT_PATH}}        |
| Known limitations       | {{LIMITATIONS_PATH}}           |
| Risk register           | {{RISK_PATH}}                  |
| GA blocker list         | {{GA_BLOCKER_IDS}}             |
| Implementation evidence | {{IMPLEMENTATION_EVIDENCE_ID}} |

---

## Availability decision (select one)

| ☐   | Code                              | Meaning                                                                      |
| --- | --------------------------------- | ---------------------------------------------------------------------------- |
| ☐   | **LIMITED_AVAILABILITY_APPROVED** | Production baseline may be used under stated limits; unrestricted GA blocked |
| ☐   | **GENERAL_AVAILABILITY_APPROVED** | Unrestricted GA authorised                                                   |
| ☐   | **NOT_APPROVED**                  | Do not make available                                                        |
| ☐   | **DEFERRED**                      | No availability change                                                       |

**Recorded availability:** `{{AVAILABILITY}}`

**Normative release status string (if accepting release):** `{{STATUS_STRING}}`

Example: `ACCEPTED / APPROVED / PRODUCTION RELEASE BASELINED / CLOSED`

---

## Limits applicable (for LIMITED)

| Limit ID | Limit     | Audience / environment |
| -------- | --------- | ---------------------- |
| L-{{NN}} | {{LIMIT}} | {{AUDIENCE}}           |

---

## GA blockers

| Blocker ID         | Summary     | Must clear before GA |
| ------------------ | ----------- | -------------------- |
| {{GA_BLOCKER_IDS}} | {{SUMMARY}} | Yes                  |

If **GENERAL_AVAILABILITY_APPROVED** while blockers exist, Owner **MUST** list accepted GA risks via [TEMPLATE-RISK-ACCEPTANCE.md](./TEMPLATE-RISK-ACCEPTANCE.md).

---

## Operational authorisations

| Item                                     | Authorised?                       |
| ---------------------------------------- | --------------------------------- |
| Push release branch                      | Yes / No                          |
| Publish / push git tag `{{GIT_TAG}}`     | Yes / No                          |
| Deploy to {{TARGET_ENV}}                 | Yes / No / Separate ops programme |
| Marketing / unrestricted user enablement | Yes / No                          |

---

## Does not authorise

1. New Engineering scope
2. Silent change to frozen baseline outside hotfix policy
3. Platform-wide GA
4. {{DOES_NOT_AUTHORISE}}

---

## Signature

| Owner | {{OWNER_NAME}} |
| Timestamp (UTC) | {{DECIDED_AT_UTC}} |
| Evidence | {{DECISION_EVIDENCE_ID}} |

---

## STOP

```text
{{PROGRAMME_ID}}
OWNER AVAILABILITY DECISION
{{AVAILABILITY}}
{{PACKAGE_NAME}} {{VERSION}}
TAG {{GIT_TAG}}
```
