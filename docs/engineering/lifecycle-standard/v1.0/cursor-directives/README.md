# Cursor Directive Library — APZ Engineering Lifecycle Standard v1.0

| Field                   | Value                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| Standard                | APZ Engineering Lifecycle Standard **v1.0**                                                   |
| Audience                | Owner (issuance) · Cursor / AI agents (execution) · Engineers (compliance)                    |
| Usage                   | Copy a directive, replace `{{PLACEHOLDERS}}`, issue as Owner Instruction body or agent prompt |
| Related templates       | [../templates/](../templates/)                                                                |
| Related Owner Decisions | [../owner-decisions/](../owner-decisions/)                                                    |
| Repository rules        | [../REPOSITORY-STANDARDS.md](../REPOSITORY-STANDARDS.md)                                      |

---

## Purpose

Reusable **prompt skeletons** for each lifecycle stage. Each directive encodes:

1. Governing authority
2. In-scope / out-of-scope
3. Stop condition
4. Required completion state
5. Deliverables list
6. **Review/verify vs engineer** rule for that stage

Directives are product-agnostic. Fill placeholders for the named product/capability before running.

---

## Catalogue

| Directive                                                              | Stage                     | Default mode                      |
| ---------------------------------------------------------------------- | ------------------------- | --------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                                   | Architecture              | **Engineer** (design artefacts)   |
| [ENGINEERING-SPECIFICATION.md](./ENGINEERING-SPECIFICATION.md)         | Engineering Specification | **Engineer** (contracts)          |
| [ENGINEERING-WAVE.md](./ENGINEERING-WAVE.md)                           | Engineering Wave          | **Engineer** (implementation)     |
| [ENGINEERING-COMPLETION-REVIEW.md](./ENGINEERING-COMPLETION-REVIEW.md) | ECR                       | **Review / verify**               |
| [CERTIFICATION.md](./CERTIFICATION.md)                                 | Certification             | **Review / verify**               |
| [PRODUCTION-FREEZE.md](./PRODUCTION-FREEZE.md)                         | Freeze                    | **Governance packaging**          |
| [PRODUCTION-RELEASE.md](./PRODUCTION-RELEASE.md)                       | Release                   | **Governance packaging** + verify |

---

## How to issue

1. Choose the directive matching the authorised stage only.
2. Replace all `{{PLACEHOLDERS}}`.
3. Attach or cite Accepted baselines and Owner Instruction id.
4. Paste into Cursor as the agent brief **or** store under the programme pack as `OWNER-INSTRUCTION.md` body.
5. Require the agent to stop at the stated stop condition and produce templates from `../templates/`.

---

## Hard rules (all directives)

1. **One stage per Instruction** unless Owner explicitly combines (recorded exception).
2. **No auto-start** of the next Wave or stage.
3. **CERT / ECR do not engineer.**
4. **Documentation-only programmes** must not change apps/packages unless the Instruction says otherwise.
5. On architectural conflict: **STOP** and escalate.
6. Evidence JSON under `docs/operations/evidence/` per [EVIDENCE-PACK.json.md](../templates/EVIDENCE-PACK.json.md).

---

## Lifecycle order (normative)

```text
Architecture
  → Owner Acceptance
  → Engineering Specification
  → Owner Acceptance
  → Build Contract affirmation
  → Engineering Wave(s) + Owner Review between Waves
  → Engineering Completion Review (ECR)
  → Owner Acceptance
  → Certification
  → Version Promotion (Owner)
  → Freeze
  → Release
```

---

## STOP

```text
CURSOR DIRECTIVE LIBRARY
APZ ENGINEERING LIFECYCLE STANDARD v1.0
FILL PLACEHOLDERS BEFORE USE
ONE STAGE PER INSTRUCTION
```
