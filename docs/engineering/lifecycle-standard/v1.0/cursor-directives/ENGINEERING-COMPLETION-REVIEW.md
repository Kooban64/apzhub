# Cursor Directive — Engineering Completion Review (ECR)

> **Fill all `{{PLACEHOLDERS}}` before use. Paste as Owner Instruction / agent brief.**

---

## Role

You are executing **{{PROGRAMME_ID}}** — Engineering Completion Review for **{{PRODUCT_ID}} / {{CAPABILITY_NAME}}**.

## Mode (mandatory)

**REVIEW / VERIFY.** Evaluate whether Engineering (all authorised Waves) is complete against Architecture + Engineering Specification + Build Contract. **SHALL NOT** perform production engineering, feature work, or behavioural defect fixes. Packaging, evidence assembly, and justified deviation recording are allowed.

---

## Governing authority

1. Document 000 / {{PRODUCT_CONSTITUTION_REF}}
2. APZ Engineering Lifecycle Standard v1.0
3. OES-002 (Review & Acceptance) + Wave Engineering Review addendum as applicable
4. Engineering Build Contract / OES-003
5. **Accepted Architecture:** {{ARCHITECTURE_BASELINE_REF}}
6. **Accepted Engineering Specification:** {{ES_BASELINE_REF}}
7. Accepted Wave programmes: {{WAVE_PROGRAMME_LIST}}
8. This Owner Instruction: **{{PROGRAMME_ID}}**

---

## Preconditions

- [ ] All required Waves Owner-accepted: {{WAVES_STATUS}}
- [ ] No open Blocking deviations without Owner visibility: {{DEVIATION_SUMMARY}}
- [ ] Package under review: `{{PACKAGE_NAME}}` @ `{{VERSION}}`

If Waves incomplete: **STOP** — ECR is premature.

---

## In scope

1. ECR report against full authorised Engineering scope
2. Validation of Build Contract compliance across Waves
3. Architecture & ES fidelity assessment
4. Behavioural completeness vs coverage-only claims (see product practice notes)
5. Consolidation of Deviation + Risk registers
6. Engineering Conformance Matrix (capability-level)
7. Owner Summary + Owner Decision template + Evidence JSON
8. Recommendation on readiness for Certification (**not** performing CERT)

## Out of scope

1. Production engineering / refactors / “quick fixes”
2. Starting Certification, Freeze, Release, or a new Wave
3. Silent SemVer promotion to `1.0.0`
4. Redesign of Architecture or ES
5. {{ADDITIONAL_OUT_OF_SCOPE}}

---

## Stop condition

```text
{{PROGRAMME_ID}} IMPLEMENTED / AWAITING OWNER ECR DECISION
```

---

## Required completion state

- [ ] ECR report complete with explicit PASS / CONDITIONAL / FAIL recommendation
- [ ] Validation Report complete
- [ ] Conformance Matrix complete at capability Engineering scope
- [ ] Deviation & Risk registers consolidated
- [ ] No engineering commits disguised as “review hygiene” unless Owner Instruction listed them as packaging-only
- [ ] Evidence JSON written
- [ ] Status string exact

**Deliverables (minimum):**

| Deliverable              | Template                                              |
| ------------------------ | ----------------------------------------------------- |
| ECR / Completion Report  | `../templates/COMPLETION-REPORT.md` (+ ECR narrative) |
| Validation Report        | `../templates/VALIDATION-REPORT.md`                   |
| Deviation Register       | `../templates/DEVIATION-REGISTER.md`                  |
| Risk Acceptance Register | `../templates/RISK-ACCEPTANCE-REGISTER.md`            |
| Conformance Matrix       | `../templates/ENGINEERING-CONFORMANCE-MATRIX.md`      |
| Owner Decision           | `../templates/OWNER-DECISION.md`                      |
| Evidence                 | `../templates/EVIDENCE-PACK.json.md`                  |

---

## Review/verify vs engineer

| Activity                                                  | Allowed?                                 |
| --------------------------------------------------------- | ---------------------------------------- |
| Review code/docs/tests as delivered                       | Yes — **review/verify**                  |
| Add missing production behaviour                          | No — recommend ENG remediation programme |
| Edit tests only to make CERT pass by weakening assertions | No                                       |
| Assemble evidence & registers                             | Yes — governance packaging               |
| Declare Certified / Frozen                                | No                                       |

**If deficiencies found:** record findings; recommend **RETURN FOR REVISION** or a **new Engineering Wave** — do not fix inside ECR.

---

## Evaluation dimensions (minimum)

1. Scope completeness across Waves
2. Architecture fidelity
3. ES fidelity
4. Build Contract compliance
5. Test adequacy for production behaviour
6. Documentation of public interfaces
7. Honesty of limitations / deviations
8. Repository integrity

---

## Output on completion

1. ECR pack at `{{PACK_PATH}}`
2. Single recommendation: e.g. **ECR PASS — READY FOR CERTIFICATION PROGRAMME** or **ECR FAIL — REMEDIATION REQUIRED**
3. Certification programme id (if suggested) marked **NOT AUTHORISED** until Owner Decision
4. Stop.
