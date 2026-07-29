# Cursor Directive — Production Freeze

> **Fill all `{{PLACEHOLDERS}}` before use. Paste as Owner Instruction / agent brief.**

---

## Role

You are executing **{{PROGRAMME_ID}}** — Production Freeze Decision packaging for **{{PRODUCT_ID}} / {{CAPABILITY_NAME}}**.

## Mode (mandatory)

**GOVERNANCE PACKAGING** (+ verification). Establish the frozen production baseline record for `{{PACKAGE_NAME}}` @ `{{VERSION}}`. Do **not** perform feature engineering. Do **not** execute Production Release or unrestricted GA unless this Instruction explicitly combines stages (recorded exception).

---

## Governing authority

1. Document 000 / {{PRODUCT_CONSTITUTION_REF}}
2. APZ Engineering Lifecycle Standard v1.0
3. Owner Certification Decision: {{CERT_DECISION_REF}}
4. Repository Standards (tagging / changelog / release artefacts)
5. This Owner Instruction: **{{PROGRAMME_ID}}**

---

## Preconditions

- [ ] Certification Accepted with Freeze-eligible class: {{CERT_STATUS}}
- [ ] Version promotion applied or authorised: {{VERSION_PROMOTION_STATUS}} (`{{VERSION}}`)
- [ ] Risk / limitations registers current
- [ ] No unauthorised engineering since certification baseline

---

## In scope

1. Freeze pack under `{{PACK_PATH}}`
2. Confirm package version + baseline identity
3. Freeze declaration, baseline confirmation, patch-line policy (`{{VERSION_LINE}}`)
4. Risk acceptance / known limitations carried into freeze
5. Prepare (or confirm) capability-scoped tag name `{{GIT_TAG}}` per REPOSITORY-STANDARDS — create tag only if Instruction authorises tag operations
6. Owner Summary + Owner Freeze Decision template + Evidence JSON
7. Update Standing Record / changelog as required
8. {{ADDITIONAL_IN_SCOPE}}

## Out of scope

1. New features or behavioural fixes
2. Production Release programme ({{RELEASE_PROGRAMME_ID_SUGGESTED}} **NOT AUTHORISED** unless combined)
3. Unrestricted GA
4. Modifying other frozen capabilities
5. {{ADDITIONAL_OUT_OF_SCOPE}}

---

## Stop condition

```text
{{PROGRAMME_ID}} IMPLEMENTED / AWAITING OWNER FREEZE DECISION
```

After Owner Acceptance, expected status example:

```text
ACCEPTED / APPROVED / PRODUCTION BASELINE FROZEN / CLOSED
```

---

## Required completion state

- [ ] Freeze report / declaration complete
- [ ] Version + package identity unambiguous
- [ ] Tag name compliant: `{{GIT_TAG}}` (pattern `{{PRODUCT_SLUG}}-{{CAPABILITY_SLUG}}-v{{VERSION}}`)
- [ ] Limitations & risks linked
- [ ] Evidence JSON written
- [ ] No silent engineering
- [ ] Status string exact

**Deliverables (minimum):**

| Deliverable                     | Template / note                                                   |
| ------------------------------- | ----------------------------------------------------------------- |
| Completion / Freeze declaration | `../templates/COMPLETION-REPORT.md` (+ freeze narrative)          |
| Risk Acceptance Register        | `../templates/RISK-ACCEPTANCE-REGISTER.md`                        |
| Deviation Register              | `../templates/DEVIATION-REGISTER.md`                              |
| Owner Decision                  | `../templates/OWNER-DECISION.md`                                  |
| Evidence                        | `../templates/EVIDENCE-PACK.json.md`                              |
| Release mirror stub (optional)  | `docs/releases/{{PRODUCT_SLUG}}/{{CAPABILITY_SLUG}}/{{VERSION}}/` |

---

## Review/verify vs engineer

| Activity                       | Allowed?                       |
| ------------------------------ | ------------------------------ |
| Verify baseline integrity      | Yes — **verify**               |
| Package freeze docs & indexes  | Yes — **governance packaging** |
| Implement product code changes | No                             |
| Publish GA                     | No                             |

---

## Patch-line policy (default)

- Frozen baseline `{{VERSION}}` establishes line `{{VERSION_LINE}}` (e.g. `1.0.x`)
- Further changes require new Owner programmes (hotfix / minor) — not silent commits on the freeze

---

## Output on completion

1. Freeze pack ready for Owner Decision
2. Recommendation: **READY FOR OWNER FREEZE DECISION** — `{{PACKAGE_NAME}}` **{{VERSION}}** **FROZEN BASELINE**
3. Release / GA **NOT AUTHORISED**
4. Stop.
