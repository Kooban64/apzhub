# Organisational Memory Audit — APZ Knowledge (N-01 focus)

| Field        | Value                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| Status       | **IN FORCE** (criteria) · N-01 audit **COMPLETE**                                                                    |
| Programme    | APZ-KNOWLEDGE-NATIVE-001                                                                                             |
| Slice        | **N-01** (mandatory product-specific focus)                                                                          |
| Timestamp    | 20260806T071500Z                                                                                                     |
| Authority    | Owner Approval of APZ-KNOWLEDGE-000 + Native Auth                                                                    |
| N-01 results | [KNOWLEDGE-NATIVE-001-N01/ORGANISATIONAL-MEMORY-AUDIT.md](./KNOWLEDGE-NATIVE-001-N01/ORGANISATIONAL-MEMORY-AUDIT.md) |

**Not a Playbook change** — same class as Workflow Test, Decision Entry, Governance Companion.

## Why this exists

Knowledge is the eighth product in Native Adoption and the most abstract. Without a dedicated identity check, it can drift into:

- a document library,
- a wiki,
- a search portal,
- an AI chat interface,
- or a collection of disconnected articles.

None of those match the APPROVED identity.

## Dominant success criterion

> **Does this product help people act correctly in context?**

That question is the primary success criterion for APZ Knowledge — above browse depth, article count, search coverage, or AI novelty.

## Must not become (fail conditions)

| Drift                 | Why it fails                                          |
| --------------------- | ----------------------------------------------------- |
| Document library      | Documents owns files                                  |
| Wiki                  | Ungoverned pages ≠ curated organisational memory      |
| Search portal         | Platform / enterprise search is not product identity  |
| AI chat interface     | AI may consume memory later; never defines Knowledge  |
| Disconnected articles | Memory without context is information, not capability |

## Must demonstrate (pass conditions)

| Signal           | Evidence direction                                               |
| ---------------- | ---------------------------------------------------------------- |
| Context delivery | Memory appears beside work (Projects, Support, Workflow, Law, …) |
| Derivation       | Published memory cites trusted experience / SoR references       |
| Actionability    | Guidance helps someone do the next correct action                |
| Curation         | Lifecycle: capture → approve → publish → review → retire         |
| SoR discipline   | No operational truth owned inside Knowledge                      |

## Relationship to Native UX Audit

| Audit                           | Role                                                                        |
| ------------------------------- | --------------------------------------------------------------------------- |
| Native UX Audit (Playbook N-01) | Standard gap register: native APZHUB feel, engine leakage, chrome           |
| **Organisational Memory Audit** | **Knowledge-specific identity guardrail** — required in the same N-01 slice |

N-01 does not close unless both are complete.

## Standing rule

If a proposed design answers “where do we put documents / chat / search?” better than “how do people act correctly in context?”, it fails this audit.
