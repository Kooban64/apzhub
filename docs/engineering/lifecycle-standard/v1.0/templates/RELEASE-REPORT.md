# Release Report — {{PROGRAMME_ID}}

| Field                  | Value                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| Template               | **RELEASE-REPORT**                                                |
| Standard               | APZ Engineering Lifecycle Standard **v1.0**                       |
| Programme ID           | {{PROGRAMME_ID}}                                                  |
| Product                | {{PRODUCT_ID}}                                                    |
| Capability             | {{CAPABILITY_NAME}}                                               |
| Package                | {{PACKAGE_NAME}}                                                  |
| Version                | {{VERSION}}                                                       |
| Git tag                | {{GIT_TAG}}                                                       |
| Prior Freeze programme | {{FREEZE_PROGRAMME_ID}}                                           |
| Mode                   | **Governance packaging** (+ verification) — no silent engineering |
| Status                 | **{{RELEASE_STATUS}}**                                            |
| Completed at (UTC)     | {{COMPLETED_AT_UTC}}                                              |
| Evidence ID            | {{EVIDENCE_ID}}                                                   |

---

## 1. Purpose

Assemble and verify Production Release governance for {{CAPABILITY_NAME}} at version **{{VERSION}}**, including release artefacts, tag readiness, operational handover, and availability recommendation.

---

## 2. Preconditions

| Precondition                         | Citation           | Met |
| ------------------------------------ | ------------------ | --- |
| Certification baselined              | {{CERT_REF}}       | ☐   |
| Freeze baselined (if required)       | {{FREEZE_REF}}     | ☐   |
| Package version matches freeze       | {{VERSION}}        | ☐   |
| No unauthorised commits since freeze | {{INTEGRITY_NOTE}} | ☐   |
| Risk / limitations registers current | {{RISK_REF}}       | ☐   |

---

## 3. In scope / out of scope

### In scope

1. Production release verification against frozen baseline
2. Release notes, handover, deployment readiness, final traceability
3. Tag creation / confirmation per [REPOSITORY-STANDARDS.md](../REPOSITORY-STANDARDS.md)
4. Release artefacts under `docs/releases/{{PRODUCT_SLUG}}/{{CAPABILITY_SLUG}}/{{VERSION}}/`
5. Availability recommendation (e.g. limited vs unrestricted GA)

### Out of scope

1. Feature engineering or defect remediation (except Owner-authorised hotfix programme)
2. Unrestricted GA if blockers remain
3. Platform-wide release unless this programme is explicitly platform-scoped
4. {{RELEASE_OUT_OF_SCOPE_1}}

---

## 4. Release identity

| Field                  | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| Package name           | `{{PACKAGE_NAME}}`                                                   |
| SemVer                 | **{{VERSION}}**                                                      |
| Channel                | `{{stable                                                            | rc  | hotfix}}` |
| Git tag                | `{{GIT_TAG}}`                                                        |
| Tag pattern compliance | `{{product}}-{{capability}}-v{{VERSION}}` (see REPOSITORY-STANDARDS) |
| Release artefacts root | `docs/releases/{{PRODUCT_SLUG}}/{{CAPABILITY_SLUG}}/{{VERSION}}/`    |

---

## 5. Verification matrix

| Check                           | Result      | Evidence      |
| ------------------------------- | ----------- | ------------- |
| Package version pinned          | PASS / FAIL |               |
| Freeze decision recorded        | PASS / FAIL |               |
| Immutable tag exists / prepared | PASS / FAIL | `{{GIT_TAG}}` |
| Tag resolves to intended commit | PASS / FAIL |               |
| Changelog entry present         | PASS / FAIL |               |
| Release notes final             | PASS / FAIL |               |
| Operational handover pack       | PASS / FAIL |               |
| Deployment readiness            | PASS / FAIL |               |
| Known limitations register      | PASS / FAIL |               |
| Final risk acceptance           | PASS / FAIL |               |
| Final traceability              | PASS / FAIL |               |
| Evidence JSON                   | PASS / FAIL |               |

---

## 6. Availability recommendation

| Option                            | Meaning                                                    |
| --------------------------------- | ---------------------------------------------------------- |
| **LIMITED_AVAILABILITY_APPROVED** | Production baseline usable under stated limits; GA blocked |
| **GENERAL_AVAILABILITY_APPROVED** | Unrestricted GA authorised by Owner                        |
| **NOT_APPROVED**                  | Do not release                                             |

**Recommendation:** `{{AVAILABILITY_RECOMMENDATION}}`

| GA blocker IDs     | Summary                |
| ------------------ | ---------------------- |
| {{GA_BLOCKER_IDS}} | {{GA_BLOCKER_SUMMARY}} |

Unrestricted GA defaults to **NOT AUTHORISED** unless Owner Decision explicitly grants it.

---

## 7. Artefact catalogue

| Artefact              | Path                                                                |
| --------------------- | ------------------------------------------------------------------- |
| This Release Report   | {{PACK_PATH}}/RELEASE-REPORT.md (or PRODUCTION-RELEASE-REPORT.md)   |
| Release verification  | {{VERIFICATION_PATH}}                                               |
| Release notes         | {{NOTES_PATH}}                                                      |
| Operational handover  | {{HANDOVER_PATH}}                                                   |
| Known limitations     | {{LIMITATIONS_PATH}}                                                |
| Final risk acceptance | {{RISK_PATH}}                                                       |
| Final traceability    | {{TRACE_PATH}}                                                      |
| Docs release mirror   | `docs/releases/{{PRODUCT_SLUG}}/{{CAPABILITY_SLUG}}/{{VERSION}}/`   |
| Evidence JSON         | `docs/operations/evidence/{{EVIDENCE_SUBDIR}}/{{EVIDENCE_ID}}.json` |

---

## 8. Operational notes

| Topic                     | Note                |
| ------------------------- | ------------------- |
| Push branch / publish tag | {{PUSH_TAG_NOTE}}   |
| Rollback                  | {{ROLLBACK_NOTE}}   |
| Monitoring / health       | {{MONITORING_NOTE}} |
| Support posture           | {{SUPPORT_NOTE}}    |

---

## 9. Single recommendation

`{{SINGLE_RECOMMENDATION}}`

**Status string:** `{{RELEASE_STATUS}}`

---

## STOP

```text
{{PROGRAMME_ID}}
RELEASE REPORT
{{PACKAGE_NAME}} {{VERSION}}
TAG {{GIT_TAG}}
{{RELEASE_STATUS}}
AWAITING OWNER PRODUCTION RELEASE DECISION
```
