# APZ Knowledge — Native UX Audit (Gap Register)

| Field        | Value                                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Slice        | **APZ-KNOWLEDGE-NATIVE-001-N01**                                                                                                         |
| Status       | **COMPLETE** (analysis only)                                                                                                             |
| Timestamp    | 20260806T071500Z                                                                                                                         |
| Method       | Static review of monorepo product surfaces, Activity Bar / modules, platform knowledge packages, QEP stubs; compared to APPROVED mission |
| Engineering  | **None**                                                                                                                                 |
| Mission      | [../../apzknowledge/PRODUCT-MISSION.md](../../apzknowledge/PRODUCT-MISSION.md) **APPROVED**                                              |
| Board        | [../../apzknowledge/PRODUCT-BOARD-ORGANISATIONAL-MEMORY.md](../../apzknowledge/PRODUCT-BOARD-ORGANISATIONAL-MEMORY.md) **IN FORCE**      |
| Memory Audit | [ORGANISATIONAL-MEMORY-AUDIT.md](./ORGANISATIONAL-MEMORY-AUDIT.md)                                                                       |
| Authority    | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                                                                                       |

## Objective

Determine whether APZ Knowledge already behaves like the **enterprise organisational memory** product.

**Central audit questions:**

1. Does the product help people act correctly **in context** — or present information as a destination?
2. Is organisational memory curated and derived — or a document/wiki/search/AI surface?
3. Do other products consume memory — or is Knowledge isolated?

Defining identity question (Product Board practice):

> **Does this help people act correctly in context?**

## Classification legend

| Class                 | Meaning                                             |
| --------------------- | --------------------------------------------------- |
| **Already Compliant** | Meets Organisational Memory contract today          |
| **Native**            | APZHUB-owned; polish may be needed                  |
| **Wrapper**           | Thin / incomplete                                   |
| **Engine Leak Risk**  | Engine/adapter or wrong-capability identity visible |
| **Requires Redesign** | Must change for memory identity                     |
| **Absent**            | No product surface yet — gap by omission            |

## Scope inventory

| Surface                                                                          | Present as APZ Knowledge product?                                       |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Activity Bar entry **APZ Knowledge**                                             | **No**                                                                  |
| Workspace `/workspace/knowledge` (organisational memory)                         | **No**                                                                  |
| Memory Companion in Projects / Support / Workflow / Law / …                      | **No**                                                                  |
| Curated memory objects (lessons, procedures, standards, rationale)               | **No** product SoR UI                                                   |
| Mission / Architecture / Board docs                                              | **Yes** — APPROVED / IN FORCE                                           |
| Platform Knowledge Discovery Framework (`@apzhub/knowledge-discovery-framework`) | **Yes** — platform capability (020), **not** the product                |
| Knowledge Overlay (workspace package)                                            | **Yes** — discovery presentation; **not** organisational memory product |
| QEP module `qep-knowledge` (“Knowledge and Learning”)                            | **Stub** — APZQEP M16; naming collision risk                            |
| Named OSS knowledge engines as product identity                                  | **No**                                                                  |

**Finding:** APZ Knowledge exists as an **approved product identity in documentation**. It does **not** yet exist as a native APZHUB product experience. Adjacent platform “knowledge” plumbing and a QEP stub create **identity collision risk** before the product is built.

---

## Gap register

| ID    | Area                       | Current                                                                         | Target                                                      | Gap                                               | Class                                       | Priority | Feeds     |
| ----- | -------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------- | -------- | --------- |
| K-G01 | Product presence           | No APZ Knowledge Activity Bar / workspace                                       | First-class **APZ Knowledge** product surface               | Product absent                                    | Absent / Requires Redesign                  | Critical | N-02/N-03 |
| K-G02 | Product identity           | Docs say Organisational Memory; runtime “knowledge” = discovery/search plumbing | Product chrome = memory companion, not search/AI            | Naming collision with platform discovery          | Requires Redesign                           | Critical | N-02/N-03 |
| K-G03 | Context delivery           | No in-context memory beside work products                                       | Work → Relevant Memory → Correct Action                     | Context model not expressed in UX                 | Absent                                      | Critical | N-03      |
| K-G04 | Memory objects             | No curated lessons / procedures / standards / rationale product                 | Organisational memory lifecycle UI                          | Memory not capturable as product                  | Absent                                      | Critical | N-03      |
| K-G05 | Destination risk           | Only discovery overlay / diagnostics exist                                      | Companion-first; browse secondary                           | If built wrong, becomes wiki/search portal        | Native (risk)                               | High     | N-03      |
| K-G06 | QEP naming                 | `Knowledge and Learning` stub under QEP                                         | APZQEP learning ≠ APZ Knowledge identity                    | Vocabulary collision                              | Requires Redesign (naming)                  | High     | N-02/docs |
| K-G07 | Platform discovery         | Knowledge Discovery Framework + Overlay                                         | Remain **platform** consumers; never product identity       | Framework must stay subordinate                   | Already Compliant (intent) / Native (guard) | High     | N-02/N-03 |
| K-G08 | Navigation / chrome        | No Knowledge product chrome                                                     | Header / Activity / Sidebar / Workspace native pattern      | Absent                                            | Absent                                      | High     | N-03      |
| K-G09 | Breadcrumbs                | N/A — no product routes                                                         | APZ Knowledge → collection → memory object                  | Absent                                            | Absent                                      | Medium   | N-03      |
| K-G10 | Help / Settings            | No Knowledge product Help/Settings                                              | Product Help + memory governance settings                   | Absent                                            | Absent                                      | Medium   | N-03      |
| K-G11 | Onboarding                 | None for Knowledge                                                              | Memory-first: “what do I need to know to do this well?”     | Absent                                            | Absent                                      | Medium   | N-03      |
| K-G12 | Empty / loading / error    | Overlay has empty/loading/error primitives                                      | Reuse patterns; copy must be memory not search              | Primitives exist for discovery only               | Wrapper                                     | Medium   | N-03      |
| K-G13 | Engine brands              | No Metabase/Plane/Zammad/n8n as Knowledge identity                              | Keep zero brand                                             | Compliant                                         | Already Compliant                           | —        | —         |
| K-G14 | SoR boundaries (docs)      | Mission SoR pack APPROVED                                                       | Remain authoritative                                        | Docs ahead of experience                          | Already Compliant                           | —        | —         |
| K-G15 | SoR boundaries (UX)        | No product UX claiming files/projects/policies                                  | Must not own operational truth when built                   | Guard for N-03                                    | Native (forward)                            | High     | N-03      |
| K-G16 | Consumption by RIs         | No Memory Companion in RI products                                              | Projects…Law + APZQEP consume memory                        | Isolated-by-absence today                         | Absent                                      | Critical | N-03+     |
| K-G17 | AI neutrality (docs)       | Mission forbids AI as identity                                                  | Keep                                                        | **PASS**                                          | Already Compliant                           | —        | —         |
| K-G18 | Search neutrality (docs)   | Mission forbids search as identity                                              | Knowledge-scoped discovery only; enterprise search consumes | **PASS** (docs); runtime discovery naming is risk | Already Compliant / Native                  | High     | N-02      |
| K-G19 | Enterprise capability docs | Mission + Architecture + Board COMPLETE                                         | Remain authoritative                                        | Docs ahead of experience                          | Already Compliant                           | —        | —         |
| K-G20 | Dual “knowledge” meaning   | Platform discovery vs product memory                                            | Vocabulary separation in N-02                               | User/dev confusion likely                         | Requires Redesign                           | Critical | N-02      |

---

## Area summaries

| Area                         | Result              | Detail                                                                     |
| ---------------------------- | ------------------- | -------------------------------------------------------------------------- |
| Native Experience            | **GAPS IDENTIFIED** | No product surface; shell pattern not applied to Knowledge                 |
| Organisational Memory        | **GAPS IDENTIFIED** | Identity clear in docs; no memory product yet                              |
| Context Delivery             | **GAPS IDENTIFIED** | Context model not implemented in any work surface                          |
| Engine Leakage               | **NONE**            | No third-party Knowledge engine; see naming collision separately           |
| System of Record Boundaries  | **GAPS IDENTIFIED** | Docs PASS; UX absent (forward risk only)                                   |
| AI Neutrality                | **PASS**            | Mission / Board forbid AI identity                                         |
| Search Neutrality            | **PASS**            | Mission forbids search identity; platform discovery must stay non-identity |
| Relationship to RI #001–#007 | **GAPS IDENTIFIED** | Consumption model documented; not expressed in UX                          |

## Verdict

APZ Knowledge is **not yet** a native Organisational Memory product in the platform experience. The dominant defects are **absence of product surface** and **vocabulary collision** between platform Knowledge Discovery / QEP “Knowledge and Learning” and the APPROVED product identity.

Documentation and Product Board principles are ahead of the experience — the correct posture for N-01. N-02 must converge identity language before N-03 builds chrome that accidentally becomes a wiki, search portal, or AI shell.

N-01 records gaps only. No engineering in this slice.
