# Product Era Investment Recommendation — Enterprise Context

| Field                   | Value                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| ID                      | **APZHUB-PRODUCT-ERA-INVESTMENT-001**                                                             |
| Capability              | **Enterprise Context** (ninth enterprise capability)                                              |
| Title                   | Enterprise Context Composition                                                                    |
| Status                  | **OBSERVATION WINDOW** — expansion frozen                                                         |
| Timestamp               | 20260806T122500Z                                                                                  |
| Kind                    | Cross-product **capability** — not a new domain, not a UI feature brand                           |
| Contract (prerequisite) | [../apzhub-context-000/](../apzhub-context-000/) **COMPLETE** — accepted via CONTEXT-001 Auth     |
| Programme               | [../apzhub-context-001/](../apzhub-context-001/) **COMPLETE** (MVP)                               |
| Engineering             | **AUTHORISED / COMPLETE** (MVP)                                                                   |
| AI / RAG                | **OUT OF SCOPE** for first investment                                                             |
| Principle               | [APZHUB-CONTEXT-COMPOSITION-PRINCIPLE.md](./APZHUB-CONTEXT-COMPOSITION-PRINCIPLE.md) **IN FORCE** |

## Naming (important)

| Avoid                                                | Prefer                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Enterprise Context Companion (sounds like a feature) | **Enterprise Context** / **Context Composition** (platform capability) |
| Companion as the product                             | Panel / API / mobile / Teams / AI as **presentations** of Context      |

The first UI may be a contextual panel. The capability is composition.

## Ninth enterprise capability

Existing eight:

1. Work · 2. Service · 3. Time · 4. Information · 5. Process · 6. Decision · 7. Governance · 8. Organisational Memory

**Ninth:**

> **Enterprise Context** — compose the right enterprise information around the current piece of work without changing ownership.

## Differentiation question

> Which capability makes APZHUB feel like APZHUB, rather than a polished integration of other products?

**Not first:** Time · Support · Projects alone.  
**First:** Context Composition across the RIs you already own.

## First implementation (when Auth — deliberately tiny)

**One work object: Project.**

Compose only:

| Slice                                   | Source    |
| --------------------------------------- | --------- |
| Workflow status / outstanding approvals | Workflow  |
| Open support items                      | Support   |
| Supporting documents                    | Documents |
| Governance obligations                  | Law       |
| Organisational memory / guidance        | Knowledge |

Nothing else in v1. No Time. No Analytics. No AI.

Success signal — then stop, ship, learn:

> _"This saved me opening four other products."_

## Presentations (capability > UI)

Context Composition may later surface as:

- contextual panel
- mobile
- API
- Teams / email
- AI (over trusted composed context)
- notifications
- executive summaries

Same composition. Different presentations. Ownership unchanged.

## Intended sequence

1. **Enterprise Context Composition** — this investment
2. **Context-aware AI** — reason over composed trusted context
3. **Proactive assistance** — recommendations / automation

## Capability proposal gate

| Question                      | Answer                                                               |
| ----------------------------- | -------------------------------------------------------------------- |
| Why would a user notice this? | Needed context appears on the work object                            |
| Why would they care?          | Confident action without product-hopping                             |
| Why is APZHUB better?         | Only APZHUB can compose all eight capabilities without stealing SoRs |

## Explicitly out of scope (until separate Auth)

New domain · AI · RAG · Automation · Duplicating SoR data · Playbook/architecture redesign · Broad multi-object rollout before Project v1 learns

## Product Board operational position

> Enterprise Context MVP has successfully moved from architectural concept to operational capability. Future investment in Enterprise Context will be driven exclusively by observed user behaviour and measured operational benefit.

> **Enterprise Context enters an Observation Window. During this period, no capability expansion shall occur unless operational evidence demonstrates measurable user value or identifies a specific usability problem requiring correction.**

**APZHUB-CONTEXT-002 is COMPLETE** — [../apzhub-context-002/](../apzhub-context-002/).

## Streams now

| Stream                       | Focus                                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **A — Product Learning**     | Observe Context usage · evidence · Board review ([../apzhub-context-learning-001/](../apzhub-context-learning-001/)) |
| **B — Capability Evolution** | Another RI — choose by operational friction, not “which product is next”                                             |

## Next step

Continue the pilot. Do not open Context engineering.  
For Stream B, ask: **Which capability gap is causing the most operational friction today?**

Supersedes naming in earlier “Context Companion” draft wording.
