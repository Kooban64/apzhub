# Cursor Directive — Production Release

> **Fill all `{{PLACEHOLDERS}}` before use. Paste as Owner Instruction / agent brief.**

---

## Role

You are executing **{{PROGRAMME_ID}}** — Production Release for **{{PRODUCT_ID}} / {{CAPABILITY_NAME}}**.

## Mode (mandatory)

**GOVERNANCE PACKAGING + VERIFY.** Assemble release artefacts, verify frozen baseline, confirm tag, and recommend availability. Do **not** perform feature engineering. Do **not** grant unrestricted GA unless blockers are cleared and Owner Decision explicitly authorises it.

---

## Governing authority

1. Document 000 / {{PRODUCT_CONSTITUTION_REF}}
2. APZ Engineering Lifecycle Standard v1.0
3. Owner Freeze Decision: {{FREEZE_DECISION_REF}}
4. Repository Standards (`docs/engineering/lifecycle-standard/v1.0/REPOSITORY-STANDARDS.md`)
5. This Owner Instruction: **{{PROGRAMME_ID}}**

---

## Preconditions

- [ ] Freeze Accepted / baseline established: {{FREEZE_STATUS}}
- [ ] Package/version: `{{PACKAGE_NAME}}` @ `{{VERSION}}`
- [ ] Git tag target: `{{GIT_TAG}}`
- [ ] Certification class: {{CERT_CLASS}}

---

## In scope

1. Release pack under `{{PACK_PATH}}`
2. Release Report + verification + notes + operational handover
3. Final limitations + risk acceptance + traceability
4. Release artefacts under `docs/releases/{{PRODUCT_SLUG}}/{{CAPABILITY_SLUG}}/{{VERSION}}/`
5. Confirm or create annotated git tag `{{GIT_TAG}}` if Instruction authorises tag operations
6. Availability recommendation: default discuss **LIMITED_AVAILABILITY_APPROVED** vs **GENERAL_AVAILABILITY_APPROVED**
7. Owner Summary + Owner Production Release Decision template + Evidence JSON
8. Changelog / Standing Record updates
9. {{ADDITIONAL_IN_SCOPE}}

## Out of scope

1. Feature engineering / non-hotfix behaviour changes
2. Platform-wide release (unless programme is platform-scoped)
3. Unrestricted GA while {{GA_BLOCKER_IDS}} remain open
4. Starting unrelated capabilities’ programmes
5. {{ADDITIONAL_OUT_OF_SCOPE}}

---

## Stop condition

```text
{{PROGRAMME_ID}} IMPLEMENTED / AWAITING OWNER PRODUCTION RELEASE DECISION
```

After Owner Acceptance, expected status example:

```text
ACCEPTED / APPROVED / PRODUCTION RELEASE BASELINED / CLOSED
```

---

## Required completion state

- [ ] Release Report complete with verification matrix
- [ ] Docs release mirror populated
- [ ] Tag name compliant and recorded
- [ ] Availability recommendation explicit; GA blockers listed
- [ ] Evidence JSON written (implementation + later acceptance)
- [ ] No silent engineering
- [ ] Status string exact

**Deliverables (minimum):**

| Deliverable               | Template                                   |
| ------------------------- | ------------------------------------------ |
| Release Report            | `../templates/RELEASE-REPORT.md`           |
| Validation / verification | `../templates/VALIDATION-REPORT.md`        |
| Risk Acceptance Register  | `../templates/RISK-ACCEPTANCE-REGISTER.md` |
| Deviation Register        | `../templates/DEVIATION-REGISTER.md`       |
| Owner Decision            | `../templates/OWNER-DECISION.md`           |
| Evidence                  | `../templates/EVIDENCE-PACK.json.md`       |

---

## Review/verify vs engineer

| Activity                              | Allowed?                       |
| ------------------------------------- | ------------------------------ |
| Verify freeze integrity & tag         | Yes — **verify**               |
| Write release docs / handover         | Yes — **governance packaging** |
| Implement features                    | No                             |
| Declare unrestricted GA without Owner | No                             |

---

## Availability rules

- If any risk/limitation has `Blocks unrestricted GA = Yes` → recommend **LIMITED_AVAILABILITY_APPROVED** (or **NOT_APPROVED**)
- **GENERAL_AVAILABILITY_APPROVED** only when blockers cleared or Owner explicitly accepts residual GA risk in Decision
- Operational push of branch/tag may be noted as post-acceptance ops if Owner so directs

---

## Output on completion

1. Release pack + `docs/releases/...` artefacts
2. Recommendation including availability
3. Any concurrent strategic programmes (e.g. standards extraction) marked as **separate directives only**
4. Stop.
