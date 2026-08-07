# Knowledge Domain Definition

| Field        | Value                                                                              |
| ------------ | ---------------------------------------------------------------------------------- |
| Programme    | **APZHUB-KNOWLEDGE-DOMAIN-001**                                                    |
| Status       | **OWNER APPROVED** — pack **CLOSED**                                               |
| Timestamp    | 20260806T064500Z                                                                   |
| Approval     | [OWNER-APPROVAL.md](./OWNER-APPROVAL.md)                                           |
| Kind         | Domain definition — **not** a product mission                                      |
| Engineering  | **NONE**                                                                           |
| Prerequisite | APZHUB-DOMAIN-EVALUATION-001 · **RECOMMEND AUTHORISATION** accepted for evaluation |

## Purpose

Define what the **Knowledge** domain is for APZHUB — and what it is not — before any product Mission exists.

> Knowledge is the enterprise’s curated, discoverable organisational memory that helps people act correctly in context.

**Product Board identity (architecture pack):** Knowledge owns only **Enterprise Organisational Memory**. Everything else consumes it. It never owns operational truth.

It is not a dump for every document, policy, wiki page, AI feature, or search index.

Domain architecture: [../apzhub-knowledge-architecture-001/](../apzhub-knowledge-architecture-001/) · Context model: [../apzhub-knowledge-architecture-001/KNOWLEDGE-CONTEXT-MODEL.md](../apzhub-knowledge-architecture-001/KNOWLEDGE-CONTEXT-MODEL.md)

---

## Enterprise role

| Role                      | Statement                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Organisational memory** | Preserve what the organisation knows: how work is done, what was learned, what applies                     |
| **Contextual guidance**   | Surface the right knowledge where work happens — not only in a separate destination                        |
| **Amplification layer**   | Increase the value of Projects, Support, Documents, Workflow, Analytics, Law, and APZQEP                   |
| **Future AI substrate**   | Provide curated, permissioned knowledge that later AI may retrieve — without making AI the domain identity |

Knowledge sits primarily in the **Information Domain** expansion, adjacent to Documents, and **consumes** Governance (Law) and Operations by reference.

---

## Domain boundaries (summary)

| Knowledge does                                          | Knowledge does not                                      |
| ------------------------------------------------------- | ------------------------------------------------------- |
| Curate and organise reusable organisational knowledge   | Replace the Documents file / information SoR            |
| Make procedures, playbooks, and lessons discoverable    | Own project, ticket, or time records                    |
| Reference policies and standards owned by Law / Quality | Provide legal advice or become a legal research product |
| Support in-context answers (“what should I follow?”)    | Become a general enterprise search engine for all SoRs  |
| Prepare a substrate for future AI retrieval             | Authorise or implement RAG / AI assistants              |

Full boundary register: [KNOWLEDGE-BOUNDARIES.md](./KNOWLEDGE-BOUNDARIES.md)

---

## Business capabilities (domain level)

Capabilities are **candidates for the domain**, not product commitments. See [KNOWLEDGE-CAPABILITY-MAP.md](./KNOWLEDGE-CAPABILITY-MAP.md).

| Capability area           | Intent                                                     |
| ------------------------- | ---------------------------------------------------------- |
| Curated knowledge objects | Articles, playbooks, FAQs, lessons — as knowledge entities |
| Procedural guidance       | How work should be performed                               |
| Institutional memory      | Lessons learned, decision history references               |
| Standards discoverability | Point to policies/standards owned elsewhere                |
| Knowledge discovery       | Find relevant knowledge in context                         |
| AI enablement (future)    | Retrieval over curated knowledge — separate Auth           |

---

## Relationships with existing products

| Product             | Relationship                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **APZ Documents**   | Documents owns files and information lifecycle. Knowledge may **reference** documents; it does not become the document repository.                           |
| **APZ Law**         | Law owns policies, obligations, compliance artefacts, retention. Knowledge may **surface** “what applies” by reference — never legal advice.                 |
| **APZ Projects**    | Projects own delivery truth. Knowledge supplies playbooks / lessons in project context.                                                                      |
| **APZ Support**     | Support owns tickets. Knowledge supplies runbooks / solved-before patterns.                                                                                  |
| **APZ Workflow**    | Workflow owns business intent. Knowledge supplies procedure guidance at stages.                                                                              |
| **APZ Analytics**   | Analytics owns decision support (no SoR). Knowledge may inform questions; Analytics does not own knowledge objects.                                          |
| **APZ Time**        | Time owns effort. Knowledge may guide how time is classified/recorded — does not own entries.                                                                |
| **APZQEP**          | Quality owns quality/release artefacts. Knowledge may host lessons / standards pointers — not Decision Packages.                                             |
| **Platform Search** | Platform/unified search remains a platform capability. Knowledge discovery is about **knowledge objects**, not replacing enterprise search for all entities. |

---

## Systems of Record and information ownership

### Knowledge domain would own (if a product is later authorised)

| Datum                            | Notes                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Knowledge objects                | Curated articles, playbooks, FAQs, lessons learned records (as knowledge entities) |
| Knowledge taxonomy / collections | How knowledge is organised for discovery                                           |
| Knowledge applicability metadata | Where/when a knowledge object applies (context tags)                               |
| Knowledge lifecycle state        | Draft / published / retired for knowledge objects                                  |

### Knowledge domain does **not** own

| Datum                                      | Owner                    |
| ------------------------------------------ | ------------------------ |
| Files / general documents                  | APZ Documents            |
| Policies, obligations, governance evidence | APZ Law                  |
| Projects, tickets, time entries            | RI operational products  |
| Process definitions                        | APZ Workflow             |
| Insights / dashboards                      | APZ Analytics (consumes) |
| Quality flows / decision packages          | APZQEP                   |
| Platform identity, permissions             | APZHUB Platform          |

**Rule:** One System of Record per datum. Knowledge **references**; it does not duplicate authoritative business records.

---

## What “Knowledge” is not

Avoid collapsing the domain into a single overloaded product identity:

| Trap                | Why it fails                                    |
| ------------------- | ----------------------------------------------- |
| “The wiki”          | Ungoverned sprawl; weak SoR discipline          |
| “The document repo” | That is Documents                               |
| “The AI assistant”  | AI is enablement, not domain identity           |
| “The search engine” | Platform search spans many SoRs                 |
| “The policy system” | That is Law / Quality                           |
| “The LMS”           | Training may relate later; not the whole domain |
| “Everything useful” | Dumping ground — Mission will fail              |

---

## Path after Owner acceptance (executed)

```text
Owner APPROVED Knowledge Domain Definition + Architecture
        →
APZ-KNOWLEDGE-000 Mission AUTHORISED — [../apzknowledge/](../apzknowledge/)
        →
Await Owner Approval of Mission
        →
Native Adoption (separate Auth — not open)
```

Roadmap of capability groups (no prioritisation): [KNOWLEDGE-ROADMAP.md](./KNOWLEDGE-ROADMAP.md)
