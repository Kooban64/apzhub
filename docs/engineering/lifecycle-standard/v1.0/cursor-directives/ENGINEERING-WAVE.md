# Cursor Directive — Engineering Wave

> **Fill all `{{PLACEHOLDERS}}` before use. Paste as Owner Instruction / agent brief.**

---

## Role

You are executing **{{PROGRAMME_ID}}** — Engineering Wave **{{WAVE_NUMBER}} ({{WAVE_NAME}})** for **{{PRODUCT_ID}} / {{CAPABILITY_NAME}}**.

## Mode (mandatory)

**ENGINEER (implementation).** Implement only the authorised Wave scope under the Engineering Build Contract. Do **not** redesign Architecture or change Engineering Specification contracts. Do **not** start the next Wave, ECR, CERT, Freeze, or Release.

---

## Governing authority

1. Document 000 / {{PRODUCT_CONSTITUTION_REF}}
2. APZ Engineering Lifecycle Standard v1.0
3. OES-003 + Engineering Build Contract (**IN FORCE**) — {{BUILD_CONTRACT_REF}}
4. **Accepted Architecture:** {{ARCHITECTURE_BASELINE_REF}}
5. **Accepted Engineering Specification:** {{ES_BASELINE_REF}}
6. This Owner Instruction: **{{PROGRAMME_ID}}**

Affirm: **Build Contract applies.**

---

## Preconditions

- [ ] Architecture Accepted
- [ ] Engineering Specification Accepted (or Owner-recorded exception: {{ES_EXCEPTION}})
- [ ] Prior Wave {{PRIOR_WAVE_ID}} Accepted / N/A
- [ ] Frozen baselines identified and will not be modified: {{FROZEN_PACKAGE_REFS}}

If unmet: **STOP**.

---

## In scope (Wave {{WAVE_NUMBER}})

Authorised implementation only:

1. {{WAVE_SCOPE_ITEM_1}}
2. {{WAVE_SCOPE_ITEM_2}}
3. {{WAVE_SCOPE_ITEM_3}}
4. Tests for new production behaviour
5. Docs for new public interfaces
6. Wave Completion Report, Validation evidence, Deviation Register, Conformance Matrix updates, Owner Summary/Acceptance, Evidence JSON

Package focus (if any): `{{PACKAGE_NAME}}` @ working version `{{WORKING_VERSION}}`

## Out of scope

1. Any later Wave responsibilities ({{LATER_WAVES_LIST}})
2. Architecture / ES redesign or silent contract change
3. ECR, Certification, Freeze, Release, GA
4. Speculative features / drive-by refactors
5. Placeholder / stub production paths presented as complete
6. {{ADDITIONAL_OUT_OF_SCOPE}}

---

## Stop condition

```text
{{PROGRAMME_ID}} IMPLEMENTED / AWAITING OWNER WAVE REVIEW
```

Equivalent Owner-approved stop strings may be used if stated here: `{{ALTERNATE_STOP}}`

**SHALL NOT** auto-start Wave {{NEXT_WAVE_NUMBER}}.

---

## Required completion state

- [ ] Authorised scope implemented (no silent partials as “complete”)
- [ ] Repository buildable (typecheck/lint/build gates for touched packages)
- [ ] Required tests pass
- [ ] Public interfaces documented
- [ ] Build Contract compliance asserted with evidence
- [ ] Architectural conflicts escalated (none left buried)
- [ ] Deviation register present (empty if none)
- [ ] Conformance matrix updated for this Wave
- [ ] Evidence JSON written
- [ ] Status string exact

**Deliverables (minimum):**

| Deliverable                 | Template                                         |
| --------------------------- | ------------------------------------------------ |
| Completion Report           | `../templates/COMPLETION-REPORT.md`              |
| Validation Report           | `../templates/VALIDATION-REPORT.md`              |
| Deviation Register          | `../templates/DEVIATION-REGISTER.md`             |
| Risk Register (if residual) | `../templates/RISK-ACCEPTANCE-REGISTER.md`       |
| Conformance Matrix          | `../templates/ENGINEERING-CONFORMANCE-MATRIX.md` |
| Owner Decision              | `../templates/OWNER-DECISION.md`                 |
| Evidence                    | `../templates/EVIDENCE-PACK.json.md`             |

---

## Review/verify vs engineer

| Activity                                     | Allowed?                   |
| -------------------------------------------- | -------------------------- |
| Implement authorised production code & tests | Yes — **engineer**         |
| Redesign Architecture / change ES            | No — stop & escalate       |
| Self-certify as CERT programme               | No                         |
| Start next Wave after local “done”           | No — Owner Review required |

---

## Build Contract highlights (non-exhaustive)

- Smallest change that satisfies scope
- Domain purity / layering per Architecture
- No secrets; no frozen baseline edits
- Keep repo green at Wave end
- Record deviations honestly

Full text: {{BUILD_CONTRACT_REF}}

---

## On conflict

If code cannot conform without Architecture/ES change: **STOP**, record deviation/conflict, ask Owner. Do not invent ADRs.

---

## Output on completion

1. Wave pack at `{{PACK_PATH}}`
2. Recommendation: **WAVE {{WAVE_NUMBER}} READY FOR OWNER REVIEW**
3. Next Wave **{{NEXT_WAVE_ID}} NOT AUTHORISED**
4. Stop.
