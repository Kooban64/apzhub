# Knowledge Domain — Capability Map

| Field     | Value                                        |
| --------- | -------------------------------------------- |
| Programme | APZHUB-KNOWLEDGE-DOMAIN-001                  |
| Status    | **COMPLETE**                                 |
| Timestamp | 20260806T061500Z                             |
| Kind      | Candidate capabilities — **not commitments** |

## Rule

These are **candidates** inside the Knowledge domain.  
Inclusion in a future product Mission is a separate decision.  
Nothing here authorises engineering.

---

## Candidate capabilities

| ID    | Capability                              | Description                                                       | Likely ownership if pursued                                                                 |
| ----- | --------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| K-C01 | **Enterprise Knowledge Base**           | Curated knowledge articles and collections for organisational use | Knowledge product                                                                           |
| K-C02 | **Procedures**                          | Stepwise guidance for how work should be performed                | Knowledge product (may reference Workflow stages)                                           |
| K-C03 | **Operational Playbooks**               | Repeatable response / delivery playbooks                          | Knowledge product (Support / Projects consume)                                              |
| K-C04 | **Lessons Learned**                     | Structured capture of what worked / failed                        | Knowledge product (links to work by reference)                                              |
| K-C05 | **FAQs / How-to**                       | Short answers to recurring operational questions                  | Knowledge product                                                                           |
| K-C06 | **Policies and Standards (discovery)**  | Find which policy/standard applies — **pointers**, not SoR        | Knowledge discovers; **Law / APZQEP own** artefacts                                         |
| K-C07 | **Product / Platform Documentation**    | User-facing help for APZHUB products                              | May split: product help vs enterprise knowledge — Mission decides                           |
| K-C08 | **Decision History (references)**       | Links to why decisions were made — not Analytics insight SoR      | Knowledge may index references; Analytics / APZQEP remain authoritative for their artefacts |
| K-C09 | **Enterprise Search (knowledge scope)** | Search over knowledge objects and approved references             | Knowledge discovery; **not** replacement for platform-wide entity search                    |
| K-C10 | **AI Knowledge Retrieval**              | Retrieval / assistance over curated knowledge                     | **Future** — separate Owner Auth; not domain identity                                       |

---

## Capability → consumer sketch

| Capability                       | Primary consumers (by reference)        |
| -------------------------------- | --------------------------------------- |
| K-C01 Knowledge Base             | All products · shell                    |
| K-C02 Procedures                 | Workflow · Projects · Support           |
| K-C03 Playbooks                  | Support · Projects · Operations         |
| K-C04 Lessons Learned            | Projects · Support · APZQEP · Analytics |
| K-C05 FAQs                       | Shell · Support · onboarding            |
| K-C06 Policy/Standards discovery | Law · all work contexts                 |
| K-C07 Product documentation      | Each RI product · Help                  |
| K-C08 Decision history refs      | Analytics · APZQEP · leadership         |
| K-C09 Knowledge search           | All                                     |
| K-C10 AI retrieval               | Future — all, under separate Auth       |

---

## Explicit non-capabilities (not in this map as Knowledge-owned)

| Topic                                | Belongs to                                |
| ------------------------------------ | ----------------------------------------- |
| File storage / document lifecycle    | Documents                                 |
| Ticket / project / time truth        | Support / Projects / Time                 |
| Obligation / policy SoR              | Law                                       |
| Business process definition          | Workflow                                  |
| Insight generation                   | Analytics                                 |
| Quality Decision Packages            | APZQEP                                    |
| General RAG over all enterprise data | Not authorised — future programme if ever |
