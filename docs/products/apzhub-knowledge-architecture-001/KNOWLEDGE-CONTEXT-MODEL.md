# Knowledge Context Model — Memory in the Right Place

| Field     | Value                                           |
| --------- | ----------------------------------------------- |
| Programme | APZHUB-KNOWLEDGE-ARCHITECTURE-001               |
| Status    | **COMPLETE**                                    |
| Timestamp | 20260806T063000Z                                |
| Kind      | **Defining capability** of the Knowledge domain |

## Defining statement

> **The right knowledge appears in the right place at the right time.**

That is what “helps people act correctly **in context**” means.

Documents store information.  
Knowledge provides **understanding where work is performed**.

---

## What “in context” means

Context is a combination of signals about the user’s current work — not a separate Knowledge destination as the primary experience.

| Context signal         | Example                                                     |
| ---------------------- | ----------------------------------------------------------- |
| **Product**            | User is in Projects / Support / Workflow / Law / …          |
| **Object**             | This project, ticket, document, journey stage, obligation   |
| **Activity**           | Creating, approving, resolving, deciding, onboarding        |
| **Role / permission**  | What they are allowed to see                                |
| **Applicability tags** | Process, team, geography, product line (Mission may refine) |
| **Time validity**      | Published and not retired                                   |

```text
Work context (product + object + activity + permission)
        →
Match approved organisational memory
        →
Surface understanding (and links to SoRs)
        →
User acts with confidence
```

Journey (domain level):

```text
Work → Relevant Memory → Correct Action
```

Aligned with Law’s Governance Companion pattern and Analytics’ Decision Companion pattern — Knowledge is the **Memory Companion**.

---

## Right knowledge

| Right                                           | Wrong                                 |
| ----------------------------------------------- | ------------------------------------- |
| Approved, current memory for this applicability | Retired or draft presented as current |
| Scoped to the user’s permissions                | Over-sharing                          |
| Explains understanding; links to SoR            | Replaces SoR content                  |
| Smallest sufficient guidance                    | Entire wiki dump in a panel           |

---

## Right place

| Primary place                                                               | Secondary place                                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------ |
| Inside the product where work happens (Projects, Support, Workflow, Law, …) | Knowledge browse / search for exploration and curation |
| Beside the object under attention                                           | Standalone “Knowledge home” as optional destination    |

**Anti-pattern:** “Open Knowledge and search for rules” as the default journey.  
**Preferred:** Memory appears beside the work (companion), with opt-in exploration.

---

## Right time

| Timing            | Meaning                                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| **Before action** | Procedure / policy explanation before a risky step                                 |
| **During action** | Playbook steps while resolving or delivering                                       |
| **After action**  | Prompt to capture a lesson (signal → lifecycle) — capture is not automatic publish |
| **On change**     | When process/policy changes, related memory is reviewed                            |

---

## Context contract (products ↔ Knowledge)

| Product provides                     | Knowledge provides                          |
| ------------------------------------ | ------------------------------------------- |
| Context signals (where/what/who)     | Matched memory objects                      |
| Deep link back to operational object | Stable memory identity + references to SoRs |
| Permission envelope from platform    | Permission-aware memory visibility          |

Products **never** become the SoR for memory.  
Knowledge **never** becomes the SoR for operational objects.

---

## Relationship to search and AI (consumers only)

| Capability              | Role in context model                                                      |
| ----------------------- | -------------------------------------------------------------------------- |
| Knowledge-scoped search | Helps find memory when browsing; does not define “in context”              |
| Platform entity search  | Finds projects/docs/tickets — different job                                |
| Future AI               | May rank or summarise **approved** memory for a context — still a consumer |

Building AI first would invert the architecture: memory must exist and be governed before assistants speak.

---

## Success test for any future Mission / UX

Ask of every design:

1. Does this help someone **act correctly**?
2. Does it appear in the **work context**?
3. Does Knowledge still own only **organisational memory**?
4. Do Documents / Law / Core SoRs remain authoritative?

If any answer is no, the design has left the domain.
