# Cursor Directive — Architecture

> **Fill all `{{PLACEHOLDERS}}` before use. Paste as Owner Instruction / agent brief.**

---

## Role

You are executing **{{PROGRAMME_ID}}** — Architecture for **{{PRODUCT_ID}} / {{CAPABILITY_NAME}}**.

## Mode (mandatory)

**ENGINEER (design artefacts only).** Produce Architecture documentation and design contracts. Do **not** implement production application code unless this Instruction explicitly authorises a listed exception. Do **not** start Engineering Specification, Waves, CERT, Freeze, or Release.

---

## Governing authority

1. Document 000 / {{PRODUCT_CONSTITUTION_REF}}
2. APZ Engineering Lifecycle Standard v1.0 (`docs/engineering/lifecycle-standard/v1.0/`)
3. OES-000 / OES-001 (methodology & writing) as applicable
4. This Owner Instruction: **{{PROGRAMME_ID}}**

On conflict, higher authority wins. Do not invent platform stack substitutions.

---

## In scope

1. Architecture pack for {{CAPABILITY_NAME}} under `{{PACK_PATH}}`
2. Boundaries, aggregates, lifecycles, non-goals, integration points
3. Information model / state machines / screen inventory as required by product practice
4. Quality gates and acceptance checklist for Architecture
5. Templates: Completion Report, Deviation Register (empty if none), Owner Summary, Owner Decision/Acceptance, Evidence JSON
6. {{ADDITIONAL_IN_SCOPE}}

## Out of scope

1. Production implementation in `apps/` / `packages/` / `modules/` / `services/` / `adapters/` (unless explicitly listed above)
2. Engineering Specification normative contracts (next stage)
3. Engineering Waves, ECR, Certification, Freeze, Release
4. SemVer promotion, git tags, unrestricted GA
5. {{ADDITIONAL_OUT_OF_SCOPE}}

---

## Stop condition

Stop when:

```text
{{PROGRAMME_ID}} IMPLEMENTED / AWAITING OWNER ARCHITECTURE ACCEPTANCE
```

Do **not** begin Engineering Specification.

---

## Required completion state

- [ ] Architecture pack complete and navigable from `{{PACK_PATH}}/README.md`
- [ ] Non-goals and boundaries explicit
- [ ] Acceptance checklist present
- [ ] Deviation register present
- [ ] Completion Report + Owner Summary + Owner Acceptance template
- [ ] Evidence JSON at `docs/operations/evidence/{{EVIDENCE_SUBDIR}}/{{EVIDENCE_ID}}.json`
- [ ] Indexes updated per REPOSITORY-STANDARDS / product practice
- [ ] Status string exactly as stop condition

**Deliverables (minimum):**

| Deliverable                 | Template / path                                                          |
| --------------------------- | ------------------------------------------------------------------------ |
| Architecture parts / README | `{{PACK_PATH}}`                                                          |
| Completion Report           | [../templates/COMPLETION-REPORT.md](../templates/COMPLETION-REPORT.md)   |
| Deviation Register          | [../templates/DEVIATION-REGISTER.md](../templates/DEVIATION-REGISTER.md) |
| Owner Decision/Acceptance   | [../templates/OWNER-DECISION.md](../templates/OWNER-DECISION.md)         |
| Evidence pack               | [../templates/EVIDENCE-PACK.json.md](../templates/EVIDENCE-PACK.json.md) |

---

## Review/verify vs engineer

| Activity                   | Allowed?                    |
| -------------------------- | --------------------------- |
| Author Architecture docs   | Yes — **engineer (design)** |
| Implement production code  | No (default)                |
| Certify / freeze / release | No                          |
| Auto-start next stage      | No                          |

---

## Constraints

- Prefer composition, clear layer boundaries, adapter isolation.
- User-facing names mask backend engines.
- Record assumptions; escalate missing Owner decisions — do not invent them.
- Documentation quality must meet OES-001 writing standard where applicable.

---

## Output on completion

1. Pack ready for Owner Architecture Acceptance
2. Single recommendation: **ARCHITECTURE READY FOR OWNER ACCEPTANCE** (or RETURN rationale)
3. Stop.
