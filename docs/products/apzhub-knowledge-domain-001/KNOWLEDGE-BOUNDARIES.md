# Knowledge Domain — Boundaries

| Field     | Value                       |
| --------- | --------------------------- |
| Programme | APZHUB-KNOWLEDGE-DOMAIN-001 |
| Status    | **COMPLETE**                |
| Timestamp | 20260806T061500Z            |

## Permanent rule

> Knowledge **references** other domains.  
> It does **not** replace them.

Violation of this rule is an architectural defect in any future Mission or product design.

---

## Ownership matrix

| Concern                                                                     | Owner                                        | Knowledge role                                                                         |
| --------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| Files, folders, document lifecycle                                          | **APZ Documents**                            | May link to a document; never becomes the repository                                   |
| Policies, obligations, compliance artefacts, retention, governance evidence | **APZ Law**                                  | May discover / explain applicability by reference; never legal advice; never SoR       |
| Projects / delivery objects                                                 | **APZ Projects**                             | Playbooks / lessons in context                                                         |
| Tickets / service cases                                                     | **APZ Support**                              | Runbooks / solved-before patterns                                                      |
| Time entries / utilisation                                                  | **APZ Time**                                 | Guidance only                                                                          |
| Business process / journey definitions                                      | **APZ Workflow**                             | Procedure text may align to stages; Workflow owns intent                               |
| Insights, question→decision UX                                              | **APZ Analytics**                            | May supply background knowledge; Analytics does not own knowledge objects              |
| Quality flows, Decision Packages, release evidence                          | **APZQEP**                                   | Lessons may point to quality outcomes; APZQEP remains SoR                              |
| Identity, permissions, shell, platform search fabric                        | **APZHUB Platform**                          | Knowledge uses platform identity/search; does not own platform search for all entities |
| Curated knowledge objects, taxonomy, knowledge lifecycle                    | **Knowledge domain** (if product authorised) | Authoritative for knowledge entities only                                              |

---

## Boundary statements (normative)

### Documents

Documents own **files** and the **information lifecycle** of enterprise documents.  
Knowledge owns **curated knowledge objects** (articles, playbooks, lessons as knowledge entities).  
A PDF in Documents is not automatically a Knowledge object. Promotion into Knowledge is deliberate curation.

### Law

Law owns **governance artefacts**.  
Knowledge must not become a policy CMS, matter system, or counsel substitute.  
“What policy applies?” is answered by **reference** to Law (and Quality standards), not by copying policy SoR into Knowledge.

### Projects / Support / Time

Operational SoRs stay operational.  
Knowledge must not become a shadow project or ticket store.

### Workflow

Workflow owns **business intent**.  
Knowledge may describe procedures; it does not redefine journeys.

### Analytics

Analytics improves decisions and owns **no** operational SoR.  
Knowledge is not a dashboard product and not a metrics warehouse.

### Search

Platform / unified search may index many entity types.  
Knowledge discovery is scoped to **knowledge objects and approved references** — not a mandate to become “search for everything.”

### AI / RAG

AI Knowledge Retrieval is a **candidate capability** (K-C10), not the domain identity.  
Implementation requires separate Owner Auth. This domain definition does not authorise RAG, copilots, or model programmes.

---

## Anti-patterns

| Anti-pattern                                      | Correction                              |
| ------------------------------------------------- | --------------------------------------- |
| Knowledge as dumping ground for all docs          | Curation required; Documents remain SoR |
| Knowledge absorbs Law policies                    | Reference only                          |
| Knowledge = AI assistant                          | AI is enablement later                  |
| Knowledge = enterprise search                     | Scoped discovery vs platform search     |
| Knowledge = LMS                                   | Training may relate; not whole domain   |
| Mission skipped because “we know what wiki means” | Domain definition → then Mission        |
