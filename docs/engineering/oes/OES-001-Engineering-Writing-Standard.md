# APZOR Engineering Standard

# OES-001 — Engineering Writing Standard

| Item                  | Value                                                                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document              | **OES-001**                                                                                                                                                                                                         |
| Title                 | Engineering Writing Standard                                                                                                                                                                                        |
| Classification        | **APZOR Engineering Writing Constitution**                                                                                                                                                                          |
| Organisation          | APZOR                                                                                                                                                                                                               |
| Owner                 | APZOR Engineering / Programme Owner                                                                                                                                                                                 |
| Status                | **ACCEPTED / APPROVED / FROZEN**                                                                                                                                                                                    |
| Version               | **1.0.0** (frozen)                                                                                                                                                                                                  |
| Acceptance            | [OES-001-OWNER-ACCEPTANCE.md](./OES-001-OWNER-ACCEPTANCE.md) · `20260726T234500Z-OES-001-ACCEPTANCE.json`                                                                                                           |
| Governing methodology | [OES-000](./OES-000-Owner-Engineering-Specification-Standard.md) (**FROZEN**)                                                                                                                                       |
| Applies to            | Every OES · every APZOR product · human and AI authors                                                                                                                                                              |
| Related               | [Document 000](../../000-apzhub-engineering-constitution.md) · [OES-002](./OES-002-Engineering-Review-and-Acceptance-Standard.md) · [002 Terminology](../../002-product-naming-positioning-terminology-standard.md) |

---

## 1. Purpose

OES-000 defines **what** an Owner Engineering Specification is and **when** it is required.

**OES-001 defines how every OES is written.**

The goal is that every OES reads as if produced by one engineering organisation — whether authored by a human or assisted by AI.

OES-001 standardises:

- Document language and voice
- Terminology
- RFC 2119 keywords
- Section ordering
- Diagrams and tables
- Naming conventions
- File references
- Code examples
- ADR references
- Acceptance criteria formatting
- Change history
- Cross-referencing between OES documents
- Pack layout (`PART-*`, `APPENDIX-*`, `COMPLETE.md`)

---

## 2. Authority

| Concern                                       | Authority                                |
| --------------------------------------------- | ---------------------------------------- |
| Programme methodology, lifecycle, Owner gates | **OES-000** (FROZEN)                     |
| Writing quality, structure, RFC 2119, voice   | **OES-001** (this document) — **FROZEN** |
| How reviews and Acceptance are conducted      | **OES-002**                              |
| Platform architecture / stack                 | Document 000 / product constitution      |

On conflict about **how text is written**, OES-001 wins for OES documents.  
OES-001 MUST NOT redefine methodology gates defined in OES-000.

**OES-001 is FROZEN.** Amendments require formal change control (Owner-authorised revision or ADR). Ad hoc edits are prohibited.

---

## 3. Document language and voice

### 3.1 Language

1. OES documents SHALL be written in **British English** unless a product constitution mandates otherwise.
2. Spelling SHALL be consistent within a document (e.g. _organisation_, _behaviour_, _catalogue_).
3. Sentences SHALL be direct. Prefer short paragraphs over dense prose.

### 3.2 Voice

| Prefer                            | Avoid                                |
| --------------------------------- | ------------------------------------ |
| Engineering standard tone         | Marketing language                   |
| Precise, imperative requirements  | Vague aspiration (“should somehow…”) |
| Present tense for permanent rules | Speculative future fluff             |
| Named artefacts and paths         | “the system”, “the thing we built”   |
| Explicit STOP / non-goals         | Implied scope                        |

### 3.3 Audience

Write for:

1. The Owner (Acceptance)
2. Implementing engineers (human or AI)
3. Future auditors / certifiers

An engineer MUST be able to implement from the OES without inventing architectural decisions.

### 3.4 Forbidden voice patterns

OES documents MUST NOT:

- Address the reader as “you should ask Cursor to…”
- Embed raw “prompts” as the specification body
- Use emoji as structural markers
- Use motivational filler
- Claim Acceptance / Certification / Freeze without Owner evidence

---

## 4. Terminology

### 4.1 Product and platform names

Follow product terminology standards (e.g. [002](../../002-product-naming-positioning-terminology-standard.md) for APZHUB).

| Rule                                       | Example                                                      |
| ------------------------------------------ | ------------------------------------------------------------ |
| Use official product names                 | APZ QEP, APZHUB, ZFConnect                                   |
| Never use deprecated names in new OES text | “portal”, backend product brands in UI copy                  |
| Capability names are user-facing           | Projects, Documents, Test Specifications — not engine brands |

### 4.2 OES-specific terms

| Term             | Meaning                                                         |
| ---------------- | --------------------------------------------------------------- |
| OES              | Owner Engineering Specification                                 |
| Part             | Editable working section of an OES                              |
| Appendix         | Reusable reference material                                     |
| COMPLETE.md      | Authoritative assembled specification for review/implementation |
| Acceptance       | Owner Decision that a phase/deliverable is closed               |
| Certification    | Evidence programme that a capability meets its DoD              |
| Freeze           | Immutability of a certified / accepted baseline                 |
| availableActions | Server-authoritative action list rendered by Workbench          |

### 4.3 Glossary

Every Architecture / Workbench Architecture OES SHOULD include `APPENDIX-A-Glossary.md` when domain vocabulary exceeds common OES terms.

---

## 5. RFC 2119 keywords

Requirements in OES documents SHALL use [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119) keywords, uppercase when used as normative requirements:

| Keyword                      | Meaning                                                 |
| ---------------------------- | ------------------------------------------------------- |
| **MUST** / **SHALL**         | Absolute requirement                                    |
| **MUST NOT** / **SHALL NOT** | Absolute prohibition                                    |
| **SHOULD**                   | Strong recommendation; deviation requires justification |
| **SHOULD NOT**               | Strong discouragement                                   |
| **MAY**                      | Optional                                                |

### 5.1 Rules

1. Normative statements in Principles, Boundaries, Quality Gates, and Acceptance Criteria SHALL use RFC 2119 keywords.
2. Narrative context (Executive Summary story) MAY use ordinary English.
3. Do not weaken a SHALL by surrounding prose (“SHALL ideally…”).
4. Prefer **SHALL** for architecture/engineering obligations; **MUST** is synonymous and allowed.
5. AI authors SHALL preserve keyword strength when editing; they MUST NOT silently downgrade SHALL to SHOULD.

---

## 6. Canonical pack structure

Every multi-part OES SHALL use this layout (titles MAY vary by class; structure MUST NOT):

```text
OES-{CLASS}-{NNN}-{Short-Title}/
├── README.md
├── PART-01-….md
├── PART-02-….md
├── PART-03-….md
├── PART-04-….md
├── PART-05-….md
├── APPENDIX-A-Glossary.md
├── APPENDIX-B-….md
├── APPENDIX-C-….md
├── APPENDIX-D-….md
├── APPENDIX-E-Acceptance-Checklist.md
└── COMPLETE.md
```

| File           | Role                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| `README.md`    | Purpose, status, baselines, part index, STOP                                 |
| `PART-NN-….md` | Editable working sections                                                    |
| `APPENDIX-*`   | Reference material (glossary, state machines, inventories, maps, checklists) |
| `COMPLETE.md`  | **Authoritative** assembly for Owner Review and implementation               |

### 6.1 COMPLETE.md rules

1. COMPLETE.md SHALL be the document given to Cursor / implementers.
2. COMPLETE.md SHALL NOT be edited as the primary authoring surface while Parts are in draft — assemble from Parts + Appendices.
3. Until assembly, COMPLETE.md SHALL state `NOT READY FOR IMPLEMENTATION` and list missing Parts.
4. After Owner Acceptance of the OES, COMPLETE.md is the frozen specification baseline for that programme (unless the Acceptance record names another file).

### 6.2 Part numbering

- Parts use zero-padded two-digit prefixes: `PART-01`, `PART-02`, …
- Filenames use kebab-case after the prefix.
- README part tables SHALL list status: `FILED` · `IN DRAFT` · `PENDING` · `ACCEPTED`.

---

## 7. Section ordering

### 7.1 Every OES / Part opening

Every OES root README and every Part SHALL begin with a Document Information table:

| Item                | Value             |
| ------------------- | ----------------- |
| Document            | …                 |
| Title               | …                 |
| Programme / Product | …                 |
| Status              | …                 |
| Version             | …                 |
| Governing standard  | OES-000 · OES-001 |

### 7.2 Default Part 1 order (Architecture / Workbench Architecture)

1. Executive Summary
2. Programme Objective
3. Business Context
4. Principles
5. Dependencies / Baselines
6. Capability Boundaries (SHALL own / SHALL NOT own)
7. Explicit Non-Goals
8. Success Criteria
9. END OF PART marker + Next Part pointer

### 7.3 Closing sections (COMPLETE.md)

COMPLETE.md SHALL end with, in order:

1. Quality Gates
2. Deliverables
3. Acceptance Criteria
4. STOP Condition / Next Gate
5. Change History (or pointer to it)

---

## 8. Tables

1. Prefer tables for catalogues, matrices, permissions, endpoint lists, and ownership boundaries.
2. Table headers SHALL be concise.
3. Status values in tables SHALL use bold for terminal states: **ACCEPTED**, **FROZEN**, **NOT AUTHORISED**.
4. Do not nest complex tables; split into multiple tables.
5. Empty “TBD” cells SHOULD be marked explicitly as `TBD` with an owner of the gap.

---

## 9. Diagrams

1. Prefer fenced `text` trees or Mermaid for flows, hierarchies, and state machines.
2. State machines for lifecycles SHOULD live in an Appendix (e.g. `APPENDIX-B-State-Machines.md`) and be referenced from Parts.
3. Diagrams MUST NOT contradict normative text; on conflict, normative RFC 2119 text wins until corrected.
4. ASCII/UTF box drawings are allowed when Mermaid adds no clarity.

Example lifecycle block (illustrative):

```text
Draft → UnderReview → Approved → Superseded
```

---

## 10. Naming conventions

| Artefact       | Convention                                   | Example                                                    |
| -------------- | -------------------------------------------- | ---------------------------------------------------------- |
| OES id         | `{PRODUCT}-OES-{CLASS}-{NNN}` or `OES-{NNN}` | `APZQEP-OES-ARCH-012`, `OES-001`                           |
| Directory      | `OES-{CLASS}-{NNN}-{Short-Title}/`           | `OES-ARCH-012-Test-Specifications-Workbench-Architecture/` |
| Part files     | `PART-{NN}-{Short-Title}.md`                 | `PART-01-Executive-Summary-Objectives-Constraints.md`      |
| Appendix files | `APPENDIX-{LETTER}-{Short-Title}.md`         | `APPENDIX-E-Acceptance-Checklist.md`                       |
| Evidence JSON  | `{UTC}-…json` under portfolio-recert         | `20260726T233500Z-OES-000-ACCEPTANCE.json`                 |
| Package names  | `@apzhub/…` (APZHUB monorepo)                | `@apzhub/qep-test-specifications`                          |
| API paths      | `/api/v1/…`                                  | `/api/v1/qep/specifications`                               |
| Permissions    | `{product}.{capability}.{action}`            | `qep.specification.approve`                                |
| Domain events  | past-tense dotted names                      | `qep.specification.approved`                               |

---

## 11. File and path references

1. Repository paths SHALL be written as repo-relative paths from the repository root or as links relative to the current file.
2. Prefer Markdown links for navigable references: `[OES-000](../OES-000-….md)`.
3. When citing code, use path + optional symbol: `packages/qep-test-specifications/src/domain/…`.
4. Do not cite ephemeral chat transcripts as authority.
5. Evidence citations SHALL include the filename under `docs/operations/evidence/` when claiming Acceptance / Certification / Freeze.

---

## 12. Code examples

1. Code fences MUST declare a language tag (`ts`, `sql`, `json`, `text`, `bash`).
2. Examples are **illustrative** unless marked **NORMATIVE**.
3. Normative schemas / contracts SHOULD live in Appendices or be cited from frozen packages — not duplicated inconsistently.
4. Secrets, tokens, and live credentials MUST NOT appear.
5. Prefer minimal examples that clarify a rule; avoid large paste dumps.

---

## 13. ADR references

1. When an OES relies on an Architecture Decision Record, cite it by id and path: `ADR-0073` → `docs/architecture/adr/…`.
2. OES text SHALL NOT silently overturn an Accepted ADR; conflict requires Owner Decision / new ADR.
3. Methodology changes to OES-000/OES-001 SHOULD use ADR or an Owner-authorised revision programme.

---

## 14. Acceptance criteria formatting

Acceptance criteria SHALL be:

- Testable
- Binary where possible (pass/fail)
- Traceable to Parts / Appendices

Recommended format:

```markdown
## Acceptance Criteria

| ID    | Criterion                                    | Evidence     |
| ----- | -------------------------------------------- | ------------ |
| AC-01 | COMPLETE.md covers all screens in APPENDIX-C | Owner review |
| AC-02 | No React/Next artefacts in this programme    | Repo audit   |
```

STOP conditions SHALL appear in a fenced `text` block:

```text
{OES-ID}
{STATUS}
{NEXT GATE OR FORBIDDEN WORK}
```

---

## 15. Change history

Every OES README SHOULD include a Change History table once more than one revision exists:

| Version | Date       | Change         | Authority |
| ------- | ---------- | -------------- | --------- |
| 1.0.0   | 2026-07-26 | Initial Part 1 | Owner     |

Frozen OES documents MUST NOT change normative content without a revision bump and Owner Decision.

---

## 16. Cross-referencing between OES documents

1. Capability OES documents SHALL cite OES-000 and OES-001 in Document Information.
2. Cross-references SHALL use stable ids (`APZQEP-OES-ENG-050B`) plus links.
3. Do not duplicate large sections from another OES; summarise and link.
4. Baselines (e.g. Requirements 1.0.0 FROZEN) SHALL be listed explicitly in README.
5. When a prior OES is Accepted/Frozen, later OES documents MUST treat it as immutable input unless a Change Programme says otherwise.

---

## 17. AI authorship rules (writing)

When AI assists with OES text, it SHALL:

1. Conform to this Writing Standard
2. Preserve RFC 2119 strength
3. Prefer editing Parts over inventing parallel docs
4. Mark unknowns as `TBD` rather than inventing Acceptance
5. Stop at programme STOP conditions

AI MUST NOT:

1. Declare Owner Acceptance
2. Freeze or unfreeze documents
3. Expand scope beyond the authorised Part
4. Replace COMPLETE.md assembly with a partial Part presented as complete

---

## 18. Quality checklist (before Owner Review)

An OES is ready for Owner Review when:

- [ ] README status accurate
- [ ] All planned Parts filed
- [ ] Appendices present for glossary / states / inventory as required by class
- [ ] COMPLETE.md assembled and marked ready
- [ ] RFC 2119 used in normative sections
- [ ] Boundaries and Non-Goals explicit
- [ ] Acceptance Criteria testable
- [ ] STOP block present
- [ ] Cross-refs to OES-000 / OES-001 / baselines valid
- [ ] No implementation artefacts claimed for Architecture-only programmes

---

## 19. Success criteria for OES-001

OES-001 succeeds when:

1. New OES documents share consistent voice, structure, and keyword discipline.
2. COMPLETE.md is always the implementation authority.
3. Human and AI authors produce indistinguishable organisational quality.
4. Reviewers spend time on content decisions, not formatting disputes.

---

## 20. STOP

```text
OES-001
ACCEPTED
APPROVED
FROZEN
```

OES-001 is frozen. Writing-standard changes require formal change control.  
Companion review standard: **OES-002**.  
**Do not** begin APZQEP Workbench Engineering until APZQEP-OES-ARCH-012 `COMPLETE.md` is Owner-Accepted.
