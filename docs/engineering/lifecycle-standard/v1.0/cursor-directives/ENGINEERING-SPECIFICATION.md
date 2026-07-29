# Cursor Directive — Engineering Specification

> **Fill all `{{PLACEHOLDERS}}` before use. Paste as Owner Instruction / agent brief.**

---

## Role

You are executing **{{PROGRAMME_ID}}** — Engineering Specification (OES) for **{{PRODUCT_ID}} / {{CAPABILITY_NAME}}**.

## Mode (mandatory)

**ENGINEER (specification contracts only).** Produce the Engineering Specification baseline that binds future Waves. Do **not** implement production code. Do **not** redesign Accepted Architecture. Do **not** start Waves, ECR, CERT, Freeze, or Release.

---

## Governing authority

1. Document 000 / {{PRODUCT_CONSTITUTION_REF}}
2. APZ Engineering Lifecycle Standard v1.0
3. OES-000 / OES-001 / OES-002 as applicable
4. **Accepted Architecture:** {{ARCHITECTURE_BASELINE_REF}}
5. This Owner Instruction: **{{PROGRAMME_ID}}**

Architecture is sole architectural authority. ES may refine implementation contracts; it **SHALL NOT** contradict Architecture without Owner ADR / Decision.

---

## Preconditions (verify before writing)

- [ ] Architecture status is Accepted / Baselined: {{ARCHITECTURE_STATUS}}
- [ ] Pack path authorised: `{{PACK_PATH}}`
- [ ] Target package identity known: `{{PACKAGE_NAME}}` (version may remain pre-release)

If Architecture is not accepted: **STOP**.

---

## In scope

1. Engineering Specification pack under `{{PACK_PATH}}`
2. Domain / Application / Infrastructure / API / Workbench / security / events / persistence contracts as required
3. Work packages & acceptance criteria for future Waves (planning only)
4. AI boundaries (what agents may not invent during Engineering)
5. Completion Report, Deviation Register, Conformance Matrix (Architecture → ES), Owner Summary/Acceptance, Evidence JSON
6. {{ADDITIONAL_IN_SCOPE}}

## Out of scope

1. Production implementation
2. Architecture redesign
3. Engineering Waves execution
4. Certification, Freeze, Release, SemVer promotion, git tags
5. {{ADDITIONAL_OUT_OF_SCOPE}}

---

## Stop condition

```text
{{PROGRAMME_ID}} IMPLEMENTED / AWAITING OWNER ENGINEERING SPECIFICATION ACCEPTANCE
```

Do **not** affirm Build Contract execution or start Wave 1.

---

## Required completion state

- [ ] ES pack complete; normative contracts unambiguous (SHALL/MUST)
- [ ] Traceability to Architecture recorded
- [ ] Future Wave boundaries suggested but **not authorised**
- [ ] Deviation register present
- [ ] Completion Report + Owner Acceptance template
- [ ] Evidence JSON written
- [ ] Status string exact

**Deliverables (minimum):**

| Deliverable                    | Template                                         |
| ------------------------------ | ------------------------------------------------ |
| ES parts / README              | `{{PACK_PATH}}`                                  |
| Completion Report              | `../templates/COMPLETION-REPORT.md`              |
| Engineering Conformance Matrix | `../templates/ENGINEERING-CONFORMANCE-MATRIX.md` |
| Deviation Register             | `../templates/DEVIATION-REGISTER.md`             |
| Owner Decision                 | `../templates/OWNER-DECISION.md`                 |
| Evidence                       | `../templates/EVIDENCE-PACK.json.md`             |

---

## Review/verify vs engineer

| Activity                              | Allowed?                  |
| ------------------------------------- | ------------------------- |
| Author ES contracts & appendices      | Yes — **engineer (spec)** |
| Implement packages/modules            | No                        |
| Change Accepted Architecture silently | No — escalate             |
| Start Wave engineering                | No                        |

---

## Constraints

- Interface-first; no backend models leaking to UI contracts.
- Self-hosted / CE OSS first; no mandatory EE dependencies.
- Manifest-first mindset for modules/services/integrations/events where the capability will register them.
- Speculative features not in Architecture → out of scope.

---

## Output on completion

1. ES ready for Owner Acceptance
2. Recommendation: **ENGINEERING SPECIFICATION READY FOR OWNER ACCEPTANCE**
3. Explicitly list recommended next Wave ids as **NOT AUTHORISED**
4. Stop.
