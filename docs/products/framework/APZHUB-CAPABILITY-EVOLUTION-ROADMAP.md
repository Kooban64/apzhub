# APZHUB — Capability Evolution Roadmap

| Field        | Value                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Programme    | **APZHUB-CAPABILITY-EVOLUTION-001**                                                                                    |
| Status       | **COMPLETE** (planning artefact)                                                                                       |
| Timestamp    | 20260806T115000Z                                                                                                       |
| Era          | APZHUB-PLATFORM-ERA-003 — Enterprise Product Realisation **ACTIVE**                                                    |
| Engineering  | **NONE**                                                                                                               |
| Architecture | **UNCHANGED**                                                                                                          |
| Authority    | [../apzhub-capability-evolution-001/OWNER-AUTHORISATION.md](../apzhub-capability-evolution-001/OWNER-AUTHORISATION.md) |

## Purpose

Tell the Product Board, for each Reference Implementation:

1. what it can do **today**,
2. what it must **eventually** become,
3. which capabilities are **missing**,
4. what **depends** on what,
5. what **operational evidence** should unlock investment,
6. a **suggested release sequencing** (capability waves — not feature lists).

This is capability planning. It is not a backlog, sprint plan, or design specification.

## Standing constraints

| Rule                                                                   | Source                                                                           |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| No new domain while existing capabilities remain materially incomplete | [APZHUB-ENTERPRISE-CAPABILITY-FIRST.md](./APZHUB-ENTERPRISE-CAPABILITY-FIRST.md) |
| One concept → one meaning                                              | [APZHUB-VOCABULARY-INTEGRITY.md](./APZHUB-VOCABULARY-INTEGRITY.md)               |
| Identity questions preserved                                           | [APZHUB-PRODUCT-IDENTITY-QUESTIONS.md](./APZHUB-PRODUCT-IDENTITY-QUESTIONS.md)   |
| Evolution via APZQEP learning cycle                                    | Playbook + Quality Baseline                                                      |
| Architecture stays boring                                              | PLATFORM-ERA-003                                                                 |

## Evolution cycle (every product)

```text
Reference Implementation
        ↓
Operational Learning
        ↓
Capability Evolution (Owner Auth)
        ↓
Release
        ↓
Operational Learning
```

---

# Portfolio sequencing (suggested)

Prioritise **user value and completeness of daily work**, not novelty.

| Wave                   | Focus                                                                                                                     | Rationale                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wave A**             | Operational products depth — Projects, Support, Time                                                                      | Users do work here every day; incomplete depth hurts most · **Projects Wave A delivered** ([APZ-PROJECTS-CAPABILITY-001](../apz-projects-capability-001/README.md)) |
| **Wave B**             | Enterprise Context Expansion — Workflow, Support, Knowledge ([CONTEXT-002](../apzhub-context-002/README.md) **COMPLETE**) | Cross-product composition                                                                                                                                           |
| **Context validation** | [CONTEXT-REVIEW-001](../apzhub-context-review-001/README.md) **COMPLETE**                                                 | **MORE CONTEXT MATURITY REQUIRED** before AI                                                                                                                        |
| **Wave C**             | Coordination & decision completeness — Workflow, Analytics                                                                | Intent and decisions mature once operational/context loops are real                                                                                                 |
| **Wave D**             | Cross-product composition                                                                                                 | My Work / deep links / companion overlays — after pairwise evidence                                                                                                 |

Waves overlap. Evidence can reorder them. No wave authorises engineering by itself.

---

# RI #001 — APZ Time

| Field      | Value                      |
| ---------- | -------------------------- |
| Capability | Effort / utilisation       |
| Class      | Operational                |
| Identity   | Work Execution (time)      |
| Pack       | [../apztime/](../apztime/) |

### Current capability baseline

- Native APZHUB Time product under APZQEP; RI #001
- Effort capture against work via certified adapter (engine invisible)
- Operational pack, checklists, known limitations documented
- Production with documented limitations (v1.0 posture)

### Intended capability vision

The organisation’s trusted place to understand **where effort went**, with accurate charging, approvals, and reporting that managers and finance can rely on — without users thinking about the time engine.

### Missing enterprise capabilities (illustrative)

| Gap theme                               | Notes                                                       |
| --------------------------------------- | ----------------------------------------------------------- |
| Approval / lock workflows               | Period close, supervisor approval depth                     |
| Richer utilisation insight              | Manager views that stay Time-owned (not Analytics identity) |
| Deeper project/client charging fidelity | Alignment with Projects SoR by reference                    |
| Mobile / field capture completeness     | Depending on evidence of need                               |
| Known-limitation burn-down              | Per `KNOWN-LIMITATIONS` and Friction Log                    |

### Dependencies

- Projects / Support work objects as charging targets (by reference)
- Identity / RBAC (platform)
- Analytics may **consume** Time — must not become Time SoR

### Operational evidence required

- Real APZQEP changes exercising Time checklists
- Friction on approval, charging errors, reporting trust
- Adoption: timesheets completed without engine workarounds

### Suggested release sequencing

1. Burn down highest-pain known limitations
2. Approval / period discipline
3. Manager utilisation (Time-native, thin)
4. Cross-product charging fidelity with Projects

---

# RI #002 — APZ Support

| Field      | Value                            |
| ---------- | -------------------------------- |
| Capability | Service operations               |
| Class      | Operational                      |
| Identity   | Service Operations               |
| Pack       | [../apzsupport/](../apzsupport/) |

### Current capability baseline

- Native Support product; RI #002
- Service cases / tickets as SoR via certified adapter
- Native Adoption complete; operational model in force

### Intended capability vision

The organisation’s trusted service desk: intake → resolution → knowledge of solved patterns — with SLAs, queues, and customer clarity — without exposing the ticket engine.

### Missing enterprise capabilities (illustrative)

| Gap theme                     | Notes                                                        |
| ----------------------------- | ------------------------------------------------------------ |
| SLA / queue maturity          | Operational excellence for daily agents                      |
| Customer-facing clarity       | Status, expectations, communications                         |
| Solved-before linkage         | Toward Knowledge companion (not Support owning memory)       |
| Structured escalation         | Procedures by reference to Knowledge / Workflow              |
| Reporting for service leaders | Support-native ops views; Analytics for enterprise questions |

### Dependencies

- Knowledge (runbooks / lessons) — companion, later wiring
- Projects (when service relates to delivery)
- Workflow (service journeys as intent)

### Operational evidence required

- Agent friction (rework, missing context, engine leakage)
- Repeat-incident themes (feeds Knowledge derivation)
- SLA breach patterns

### Suggested release sequencing

1. Agent daily-path completeness (queues, assignment, transitions)
2. Escalation / SLA clarity
3. Solved-before → Knowledge handoff (contract first, wire later)
4. Service leadership views

---

# RI #003 — APZ Projects

| Field      | Value                              |
| ---------- | ---------------------------------- |
| Capability | Work / project delivery            |
| Class      | Operational                        |
| Identity   | Project Delivery                   |
| Pack       | [../apzprojects/](../apzprojects/) |

### Current capability baseline

- Native Projects product; RI #003; v1.0 with documented limitations
- Plan and deliver project work via certified adapter
- Portfolio “do work” centre of gravity
- **Wave A delivered** ([APZ-PROJECTS-CAPABILITY-001](../apz-projects-capability-001/README.md)): delivery dashboard, milestones, risk/decision/action registers, transparent health model

### Intended capability vision

The best project product users have ever used for APZHUB: planning, delivery, membership, milestones, and status that leadership trusts — with Time, Documents, Workflow, Law, and Knowledge accompanying work rather than replacing Projects.

### Missing enterprise capabilities (illustrative)

| Gap theme                              | Notes                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| Delivery planning depth                | Wave A closed core registers; further roadmap/dependency practice may deepen |
| Portfolio / multi-project views        | Still Projects-owned, not Analytics identity — deferred beyond Wave A        |
| Membership & roles fidelity            | Who works on what                                                            |
| Handover / close discipline            | Derives lessons for Knowledge                                                |
| Document / workflow attachment clarity | By reference, companion patterns                                             |

### Dependencies

- Time (effort against projects)
- Documents (project information)
- Workflow (delivery journeys)
- Knowledge (lessons at close)
- Law (approvals / obligations by reference)

### Operational evidence required

- PM / member friction in daily delivery
- Status trust failures (reporting workarounds)
- Close/handover pain (repeat mistakes)

### Suggested release sequencing

1. Highest-pain delivery limitations
2. Milestone / status fidelity for leadership
3. Close & handover discipline (feeds Knowledge)
4. Companion contracts with Documents / Workflow / Knowledge

---

# RI #004 — APZ Documents

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Capability | Enterprise information                  |
| Class      | Context                                 |
| Identity   | Enterprise Information / work companion |
| Pack       | [../apzdocuments/](../apzdocuments/)    |

### Current capability baseline

- Native Documents; RI #004
- Information lifecycle SoR; work-companion posture
- Deferred consumer wiring noted as future Owner Auth

### Intended capability vision

Every important enterprise file is findable, governed, and related to work — Documents owns information; other products never become file dumps.

### Missing enterprise capabilities (illustrative)

| Gap theme                   | Notes                                                     |
| --------------------------- | --------------------------------------------------------- |
| Stronger work attachment    | Projects / Support / Workflow references                  |
| Retention clarity with Law  | Law owns requirements; Documents applies                  |
| Version / approval maturity | Information governance depth                              |
| Search as consumer          | Platform search consumes Documents — not product identity |
| Knowledge explanations      | Knowledge explains; Documents stores                      |

### Dependencies

- Law (retention / obligations by reference)
- Projects / Support (related work)
- Knowledge (explanations, not file ownership)
- Platform search (consumer)

### Operational evidence required

- “Where is the file?” friction
- Orphan documents / wrong SoR (files in Law/Knowledge)
- Retention incidents

### Suggested release sequencing

1. Related-work companion completeness
2. Retention application with Law references
3. Approval / version enterprise paths
4. Cross-product attachment contracts

---

# RI #005 — APZ Workflow

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Capability | Business process / intent                         |
| Class      | Coordination & Decision                           |
| Identity   | Business Process Governance (intent ≠ automation) |
| Pack       | [../apzworkflow/](../apzworkflow/)                |

### Current capability baseline

- Native Workflow; RI #005
- Business-intent identity converged; engine/execution secondary
- Deferred automation / execution capability explicitly out of identity
- **Wave A delivered** ([APZ-WORKFLOW-CAPABILITY-001](../apz-workflow-capability-001/README.md)): journey designer, template library, ownership, governance, process monitoring

### Intended capability vision

Users describe and follow **business journeys** without mentioning software. Execution engines remain invisible. Workflow is the place business intent is modelled, governed, and visualised.

### Missing enterprise capabilities (illustrative)

| Gap theme                    | Notes                                                                      |
| ---------------------------- | -------------------------------------------------------------------------- |
| Richer journey catalogue     | Wave A closed designer + 8 templates; further catalogue depth may continue |
| Stage clarity & ownership    | Wave A delivered owner / steward / stage responsibility                    |
| Controlled execution curtain | When Owner Auth allows automation depth — still not identity               |
| Cross-product journey glue   | Projects / Support / Time / Documents steps by reference                   |
| Intent analytics handoff     | Analytics asks questions; Workflow owns journeys                           |

### Dependencies

- Operational products as journey participants
- Law (approvals on journeys)
- Knowledge (procedures at stages)
- Separate Auth for automation depth

### Operational evidence required

- Users still thinking in “runs / schedules / engines”
- Processes stuck in documents or chat
- Approval ambiguity on journeys

### Suggested release sequencing

1. Business journey catalogue quality
2. Stage / ownership clarity
3. Law / Knowledge companion at stages (model → wire)
4. Execution depth only with evidence + Auth (never redefine identity)

---

# RI #006 — APZ Analytics

| Field      | Value                                               |
| ---------- | --------------------------------------------------- |
| Capability | Enterprise decision support                         |
| Class      | Coordination & Decision                             |
| Identity   | Decision Companion (questions → insight → decision) |
| Pack       | [../apzanalytics/](../apzanalytics/)                |

### Current capability baseline

- Native Analytics; RI #006
- Decision Entry / question-first experience
- Deferred AI / predictive / recommendation capability
- **Wave A delivered** ([APZ-ANALYTICS-CAPABILITY-001](../apz-analytics-capability-001/README.md)): role-grouped question catalogue, decision packs, trends, KPI management, decision timeline

### Intended capability vision

Leaders enter through business questions and leave with decisions. Visualisations serve answers. Analytics never becomes a SoR or a dashboard warehouse identity.

### Missing enterprise capabilities (illustrative)

| Gap theme                            | Notes                                                                 |
| ------------------------------------ | --------------------------------------------------------------------- |
| Broader question catalogue           | Wave A expanded role-grouped catalogue; further coverage may continue |
| Decision capture / rationale handoff | Wave A timeline records decisions; deeper Knowledge handoff later     |
| Trusted evidence paths               | From Core SoRs without stealing them                                  |
| Shared / saved insight maturity      | Still question-led                                                    |
| AI as consumer later                 | Never product identity; separate Auth                                 |

### Dependencies

- Mature data from Time / Support / Projects / Documents / Workflow / Law
- Knowledge for decision rationale memory
- Explicit refusal of dashboard-first regressions

### Operational evidence required

- Decisions still made in spreadsheets
- Dashboard shopping without decisions
- Missing questions leaders actually ask

### Suggested release sequencing

1. Expand question catalogue from real leadership needs
2. Decision outcome / “what changed” loops
3. Rationale → Knowledge derivation contract
4. AI-assisted insight **only** as Auth’d consumer

---

# RI #007 — APZ Law

| Field      | Value                                  |
| ---------- | -------------------------------------- |
| Capability | Enterprise governance                  |
| Class      | Context                                |
| Identity   | Governance Companion (APZHUB-internal) |
| Pack       | [../apzlaw/](../apzlaw/)               |

### Current capability baseline

- Native Law; RI #007; Governance Layer **OPERATIONAL**
- Governance-question home; practice tooling secondary (`law.admin`)
- Deferred consumer wiring and deeper obligation catalogues

### Intended capability vision

Governance appears where work happens: obligations, policies, compliance, retention, evidence — never legal practice SaaS, never counsel substitution.

### Missing enterprise capabilities (illustrative)

| Gap theme                              | Notes                                                     |
| -------------------------------------- | --------------------------------------------------------- |
| Deeper obligation / policy catalogues  | GQ-driven expansion                                       |
| Consumer governance context            | Projects / Workflow / Documents / Support / APZQEP wiring |
| Review / evidence lifecycle depth      | Still governance-owned                                    |
| Knowledge interpretation               | Knowledge explains practice; Law owns artefacts           |
| Permanent refusal of practice identity | Continues forever                                         |

### Dependencies

- Documents (artefact files by reference)
- Workflow (approval journeys)
- Knowledge (interpretation memory)
- APZQEP (quality evidence distinct from governance evidence)

### Operational evidence required

- “Are we allowed?” asked outside Law
- Practice-first regressions
- Missing obligations on real work

### Suggested release sequencing

1. Catalogue depth for highest-risk GQs
2. One consumer wiring vertical (evidence-chosen)
3. Retention with Documents
4. Broader companion rollout

---

# RI #008 — APZ Knowledge

| Field      | Value                                |
| ---------- | ------------------------------------ |
| Capability | Organisational memory                |
| Class      | Context                              |
| Identity   | Memory Companion                     |
| Pack       | [../apzknowledge/](../apzknowledge/) |

### Current capability baseline

- Native Knowledge; RI #008; Organisational Memory **OPERATIONAL**
- Memory types + companion experience model; illustrative catalogue
- **Wave A delivered** ([APZ-KNOWLEDGE-CAPABILITY-001](../apz-knowledge-capability-001/README.md)): knowledge object lifecycle, operational lessons, best practice library, decision knowledge by reference, rule-based quality
- Deferred contextual overlays in consuming products
- Vocabulary Integrity protecting “Knowledge” meaning

### Intended capability vision

The right organisational memory appears in the right place at the right time. Users act correctly without hunting a wiki. Memory is derived from trusted experience and never invents enterprise truth.

### Missing enterprise capabilities (illustrative)

| Gap theme                                     | Notes                                           |
| --------------------------------------------- | ----------------------------------------------- |
| Consumer Memory Companion overlays            | Projects / Support / … — separate Auth (Wave B) |
| Derivation pipelines from closed work         | Lessons from Projects / Support — later wave    |
| AI-assisted knowledge / RAG / recommendations | Explicitly deferred                             |
| Broader companion rollout                     | Still not AI/search identity                    |

### Dependencies

- Operational products generating experience to derive from
- Law / Documents / APZQEP as reference sources
- Explicit non-goals: AI, RAG, enterprise search as identity

### Operational evidence required

- Repeat mistakes despite published lessons
- Users still searching wikis / chat for “how we do this”
- Vocabulary drift (Knowledge vs Discovery)

### Suggested release sequencing

1. ~~Real curation lifecycle (capture → approve → publish → retire)~~ **Wave A complete**
2. ~~Freshness / review operations~~ **Wave A quality gates complete**
3. First consumer overlay (evidence-chosen product)
4. Broader companion rollout — still not AI/search identity

---

# Cross-product capability themes

| Theme                    | Products                                     | Planning note                                                                                                                       |
| ------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Companion wiring         | Documents, Law, Knowledge → Ops products     | Wave B; pairwise Auth; no platform mash-up                                                                                          |
| **Enterprise Context**   | Composition across RI #001–#008              | Ninth capability — [PRODUCT-ERA-INVESTMENT-001](./APZHUB-PRODUCT-ERA-INVESTMENT-001-ENTERPRISE-CONTEXT.md); compose never duplicate |
| Derivation of memory     | Projects, Support, APZQEP, Board → Knowledge | Protects SoR model                                                                                                                  |
| Decision → rationale     | Analytics → Knowledge                        | Keep Analytics as insight SoR-less                                                                                                  |
| Journey + obligation     | Workflow + Law                               | Intent vs governance stay distinct                                                                                                  |
| Search / AI as consumers | Platform / future Auth                       | Never redefine product identities                                                                                                   |

---

# What the Product Board should understand

| Question                        | Answer                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| What can each product do today? | Native RI baseline under APZQEP — identities complete; depth varies                        |
| What must each become?          | World-class enterprise software for its **one** capability                                 |
| What should evolve first?       | Wave A operational depth, then context companions, then coordination/decision              |
| What depends on evidence?       | **All** capability evolution — Owner Auth per investment; Friction Log / Learning Register |

## Explicit non-outputs

- No engineered features from this document
- No new domains
- No Playbook or architecture changes
- No forced ordering that overrides operational evidence

## Related

| Artefact         | Path                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Era decision     | [../apzhub-platform-era-003/OWNER-DECISION.md](../apzhub-platform-era-003/OWNER-DECISION.md)     |
| Capability First | [APZHUB-ENTERPRISE-CAPABILITY-FIRST.md](./APZHUB-ENTERPRISE-CAPABILITY-FIRST.md)                 |
| Product classes  | [APZHUB-PRODUCT-CLASSES.md](./APZHUB-PRODUCT-CLASSES.md)                                         |
| RI map           | [APZHUB-PORTFOLIO-REFERENCE-IMPLEMENTATIONS.md](./APZHUB-PORTFOLIO-REFERENCE-IMPLEMENTATIONS.md) |
| Programme        | [../apzhub-capability-evolution-001/](../apzhub-capability-evolution-001/)                       |
