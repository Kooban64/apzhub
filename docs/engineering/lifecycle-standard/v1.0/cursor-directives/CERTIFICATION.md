# Cursor Directive — Certification

> **Fill all `{{PLACEHOLDERS}}` before use. Paste as Owner Instruction / agent brief.**

---

## Role

You are executing **{{PROGRAMME_ID}}** — {{CERT_LEVEL}} Certification for **{{PRODUCT_ID}} / {{CAPABILITY_NAME}}**.

## Mode (mandatory)

**REVIEW / VERIFY.** Certification **SHALL NOT** perform engineering. Evaluate the capability as delivered. Allowed: evidence gathering, review records, authorised metadata alignment, documentation of findings, release-evidence assembly pointers. Remediation ⇒ new Engineering programme.

---

## Governing authority

1. Document 000 / {{PRODUCT_CONSTITUTION_REF}}
2. APZ Engineering Lifecycle Standard v1.0
3. Certification Independence practice (OES) — CERT does not engineer
4. Certification Levels practice — Component / Capability / Platform
5. **Accepted Architecture / ES / ECR:** {{BASELINE_REFS}}
6. This Owner Instruction: **{{PROGRAMME_ID}}**

---

## Preconditions

- [ ] ECR Accepted (or Owner exception): {{ECR_REF}}
- [ ] Package/version under certification: `{{PACKAGE_NAME}}` @ `{{VERSION}}`
- [ ] Certification level selected: **{{CERT_LEVEL}}**

---

## In scope

1. Certification Report with recommended class `{{PROPOSED_CLASS}}`
2. Validation Report (or citation of current validation)
3. Conformance Matrix evaluation
4. Risk Acceptance + Deviation registers for certification scope
5. Version promotion **recommendation** only (Owner decides)
6. Owner Summary + Owner Certification Decision template + Evidence JSON
7. {{ADDITIONAL_IN_SCOPE}}

## Out of scope

1. Feature implementation, bugfix engineering, refactors for improvement
2. Freeze execution (separate programme) unless Owner explicitly combined (exception)
3. Production Release / unrestricted GA
4. Implying Capability Freeze from Component certification
5. {{ADDITIONAL_OUT_OF_SCOPE}}

---

## Stop condition

```text
{{PROGRAMME_ID}} IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION
```

---

## Required completion state

- [ ] Independence declaration signed in report
- [ ] Level-appropriate classification string used
- [ ] Findings complete; outcome CERTIFIED / CONDITIONAL / NOT CERTIFIED
- [ ] Limitations & GA blockers explicit
- [ ] Evidence JSON written
- [ ] No disguised engineering
- [ ] Status string exact

**Deliverables (minimum):**

| Deliverable              | Template                                         |
| ------------------------ | ------------------------------------------------ |
| Certification Report     | `../templates/CERTIFICATION-REPORT.md`           |
| Validation Report        | `../templates/VALIDATION-REPORT.md`              |
| Risk Acceptance Register | `../templates/RISK-ACCEPTANCE-REGISTER.md`       |
| Deviation Register       | `../templates/DEVIATION-REGISTER.md`             |
| Conformance Matrix       | `../templates/ENGINEERING-CONFORMANCE-MATRIX.md` |
| Owner Decision           | `../templates/OWNER-DECISION.md`                 |
| Evidence                 | `../templates/EVIDENCE-PACK.json.md`             |

---

## Review/verify vs engineer

| Activity                                                     | Allowed?                |
| ------------------------------------------------------------ | ----------------------- |
| Evaluate as-delivered                                        | Yes — **review/verify** |
| Implement remediation                                        | No                      |
| Align SemVer/module metadata if Instruction allows packaging | Yes — packaging only    |
| Freeze / tag / GA                                            | No (recommend only)     |

---

## Classification rules

- Component: class **MUST** name the layer (e.g. `DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS`)
- Capability: typical gate for `1.0.0` + Freeze eligibility
- Platform: separate programme

Proposed class: `{{PROPOSED_CLASS}}`

---

## Output on completion

1. CERT pack at `{{PACK_PATH}}`
2. Single recommendation including class + Freeze eligibility
3. Freeze / Release marked **NOT AUTHORISED** until Owner Decision
4. Stop.
