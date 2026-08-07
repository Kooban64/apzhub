# Product Board — Organisational Memory (APZ Knowledge)

| Field     | Value                                                                                 |
| --------- | ------------------------------------------------------------------------------------- |
| Status    | **IN FORCE**                                                                          |
| Timestamp | 20260806T065000Z                                                                      |
| Authority | Owner Approval of Knowledge Definition + Architecture; Mission Auth APZ-KNOWLEDGE-000 |
| Product   | **APZ Knowledge** (Mission: APZ-KNOWLEDGE-000)                                        |

## Product identity

> **APZ Knowledge is the enterprise organisational memory of APZHUB.**

## Permanent vision

> **The right knowledge appears in the right place at the right time.**

Working definition:

> Curated organisational memory that helps people act correctly in context.

---

## Principle 1 — Knowledge Derivation

> **Knowledge is derived from trusted enterprise experience. It is not created independently of it.**

This protects the System of Record model.

| Memory often derives from                    | SoR / authority remains                                              |
| -------------------------------------------- | -------------------------------------------------------------------- |
| Lesson from completed work                   | APZ Projects                                                         |
| Engineering standard / practice              | APZQEP                                                               |
| Governance interpretation                    | APZ Law (artefacts stay in Law)                                      |
| Procedure from approved operational practice | Workflow / Operations practice                                       |
| Decision rationale                           | Product Board / Owner records (and Analytics context where relevant) |
| Document explanation                         | APZ Documents (files stay in Documents)                              |

Knowledge **curates, explains, and contextualises**.  
It does **not** invent enterprise truth.

---

## Principle 2 — Context

> **Knowledge without context is information. Knowledge in context becomes organisational capability.**

Complements the Context Model: Work → Relevant Memory → Correct Action.

---

## Principle 3 — Never operational SoR

> **Knowledge never becomes a System of Record for operational truth.**  
> **Knowledge references trusted Systems of Record. It does not replace them.**

---

## Principle 4 — Vocabulary Integrity

> **Within APZHUB, one business concept shall have one authoritative meaning.**

Portfolio law: [../framework/APZHUB-VOCABULARY-INTEGRITY.md](../framework/APZHUB-VOCABULARY-INTEGRITY.md)  
Product vocabulary: [../apz-knowledge-native-001/PRODUCT-VOCABULARY.md](../apz-knowledge-native-001/PRODUCT-VOCABULARY.md)

| Term                    | Means                                          |
| ----------------------- | ---------------------------------------------- |
| **APZ Knowledge**       | Enterprise Organisational Memory               |
| **Knowledge Discovery** | Finding organisational memory                  |
| **Knowledge Overlay**   | Contextual presentation inside another product |
| **Learning**            | APZQEP skills / practice improvement           |
| **Search**              | Retrieval capability                           |
| **AI Assistant**        | Consumer of organisational memory              |

---

## Portfolio separation (protected)

| Product       | Owns                      |
| ------------- | ------------------------- |
| Projects      | Work                      |
| Support       | Incidents                 |
| Time          | Effort                    |
| Documents     | Information               |
| Workflow      | Business intent           |
| Analytics     | Insight                   |
| Law           | Governance                |
| **Knowledge** | **Organisational memory** |

Knowledge never owns operational truth. Everything else consumes memory.

## Same discipline

| Product       | Is not                                                          |
| ------------- | --------------------------------------------------------------- |
| Workflow      | Automation                                                      |
| Analytics     | Dashboards                                                      |
| Documents     | Storage                                                         |
| Law           | Legal practice                                                  |
| **Knowledge** | **AI · wiki · search engine · RAG · document repository · LMS** |

## Domain lifecycle (preserved for all future domains)

```text
Domain → Domain Definition → Domain Architecture → Product Mission → Native Adoption → Reference Implementation
```

Do not start future domains from a product idea alone.

## Portfolio evolution (observation)

| Layer       | Products                  |
| ----------- | ------------------------- |
| Operational | Time · Support · Projects |
| Context     | Documents · Workflow      |
| Decision    | Analytics                 |
| Governance  | Law                       |
| Memory      | **Knowledge**             |

Each layer builds on the one before it. None replaces another.

**Contextual companions** (enrich work; do not replace SoRs):

| Product       | Supports work with        |
| ------------- | ------------------------- |
| Documents     | Information               |
| Law           | Governance                |
| **Knowledge** | **Organisational memory** |

## Native Adoption

[../apz-knowledge-native-001/](../apz-knowledge-native-001/) — Organisational Memory Audit **IN FORCE** for N-01.

## Architecture anchors

| Pack         | Path                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| Definition   | [../apzhub-knowledge-domain-001/](../apzhub-knowledge-domain-001/)             |
| Architecture | [../apzhub-knowledge-architecture-001/](../apzhub-knowledge-architecture-001/) |
| Mission      | [./PRODUCT-MISSION.md](./PRODUCT-MISSION.md)                                   |
