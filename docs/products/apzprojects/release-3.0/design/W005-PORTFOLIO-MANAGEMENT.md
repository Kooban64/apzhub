# APZ Projects Release 3.0

# Product Design Workshop 005 — Portfolio Management

**Document ID:** W005-PORTFOLIO-MANAGEMENT  
**Status:** APPROVED WITH AMENDMENTS (Owner review 2026-08-06) — implementation authority for Portfolio Management  
**Mode:** Product design only · no code until Owner authorises engineering  
**Depends on:** W001–W004 (W002–W004 APPROVED WITH AMENDMENTS)  
**Continues:** `W006-RESOURCE-AND-TEAM-MANAGEMENT.md`  
**Authority:** Implementation specification for enterprise portfolio management in APZ Projects (as amended)

---

# 0. Product objective

Make APZ Projects equally effective for **Project Managers, PMOs and Executives** in **one coherent product** — not a separate “PPM module” bolted beside a project tracker.

| Persona           | Portfolio must answer                                                            |
| ----------------- | -------------------------------------------------------------------------------- |
| Executive         | Are we delivering strategic outcomes? Where is enterprise risk?                  |
| PMO               | Where is process failing? Which exceptions need intervention? Capacity reality?  |
| Programme Manager | Are my workstreams aligned? Cross-dependencies holding?                          |
| Project Manager   | How does my project sit in the wider portfolio? What am I blocking / blocked by? |

**Success:** Same Operational Workspace language (Health · Confidence · Queue · Exceptions · Forecast) scales from one project to the enterprise portfolio without a second UX grammar.

---

# 1. Design principles (normative)

| #   | Principle                                                                      |
| --- | ------------------------------------------------------------------------------ |
| P1  | Portfolio is an **aggregation + steering** layer — not a duplicate project SoR |
| P2  | One product: Portfolio views compose project operational truth (W002–W004)     |
| P3  | Hierarchy is real: Portfolio → Programme / Strategic Initiative → Project      |
| P4  | Cross-project dependencies are first-class (extend W004 Dependency)            |
| P5  | Executives get clarity, not dashboards-as-decoration                           |
| P6  | Capacity is an honest overview — not fake precision resource management in v1  |
| P7  | Portfolio governance uses profiles + checkpoints; Workflow executes approvals  |
| P8  | No consumer personalisation; institutional language                            |
| P9  | Mobile portfolio = exceptions + decisions only (align W002)                    |
| P10 | Challenge “separate PPM product” — reject split identity                       |

---

# 2. Portfolio information architecture

## 2.1 Challenge: second app for executives

**Reject** a disconnected executive portal.  
**Recommend** an **Executive / PMO lens** on the same APZ Projects product, permission-gated, sharing constructs.

## 2.2 Canonical hierarchy

```text
Enterprise Portfolio (org scope)
├── Strategic Initiative          // outcome theme / investment thesis
│   ├── Programme                 // coordinated delivery
│   │   ├── Project
│   │   └── Project
│   └── Project (direct)
├── Programme
│   └── Project
└── Standalone Project
```

| Node                     | Meaning                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| **Enterprise Portfolio** | Org-level container (usually one primary; multi-portfolio later if needed) |
| **Strategic Initiative** | Multi-programme/project pursuit of a strategic outcome                     |
| **Programme**            | Coordinated set of projects with shared governance and benefits            |
| **Project**              | Delivery unit (W003 lifecycle)                                             |

**Decision proposal PF-D1:** Four-level hierarchy as above. Projects may attach to Programme, Initiative, both (Initiative via Programme), or standalone.

## 2.3 Product surfaces

| Route                                            | Surface                                               | Primary users        |
| ------------------------------------------------ | ----------------------------------------------------- | -------------------- |
| `/workspace/projects`                            | Operational Workspace (W002) — **my / team delivery** | PM · leads           |
| `/workspace/projects/portfolio`                  | **Portfolio Scorecard** (default executive landing)   | Exec · PMO · Sponsor |
| `/workspace/projects/portfolio/workspace`        | Portfolio Workspace (Overview→Queue→Hierarchy→…)      | PMO · Programme Mgr  |
| `/workspace/projects/portfolio/timeline`         | Enterprise roadmap                                    | Exec · PMO           |
| `/workspace/projects/portfolio/initiatives/{id}` | Initiative cockpit                                    | Exec · PMO           |
| `/workspace/projects/portfolio/programmes/{id}`  | Programme cockpit                                     | Programme Mgr · PMO  |
| Project cockpit                                  | Unchanged (W002/W004)                                 | PM                   |

Sidebar: **Portfolio** primary for portfolio-permissioned users (lands on Scorecard for executives). PMs without portfolio scope keep Operational Workspace as home.

Projects may **move between Programmes** without losing operational history (membership change is an Operational Change; object histories preserved).

---

# 3. Portfolio Workspace layout

## 3.1 Desktop composition (mirror W002 grammar)

```text
┌────────────────────────────────────────────────────────────┬──────────────┐
│ Portfolio · {name}                                         │ ENTERPRISE   │
│ A. Portfolio Overview (metric band)                        │ CONTEXT      │
│ B. Portfolio Queue (Decisions · Attention · Waiting)       │ (org/programme│
│ C. Hierarchy / Portfolio strips                            │  focus)      │
│ D. Portfolio Operational Changes                           │              │
└────────────────────────────────────────────────────────────┴──────────────┘
```

Same cognitive order as project home: **State → Act → Scan → Changes → Context**.

## 3.2 Portfolio Overview (metric band)

Used inside Portfolio Workspace (PMO steering). Executives default to **Portfolio Scorecard** (§3.4).

Reject decorative KPI card grids; prefer institutional bands / scorecard rows.

```text
Portfolio Overview                                         As of …
────────────────────────────────────────────────────────────────────
Health        Overall: Attention · Healthy 76% · Attention 17% · Critical 7% · Trend ↓
              Critical projects: 4 (listed)
Confidence    Weighted 64 · Top drag: Card Issuing · Payments deps · 2 Critical exceptions
Objectives    On track 3 · At risk 2 · Off track 1
Exceptions    Critical 2 · Major 5 · Open total 14
Decisions     Pending portfolio-level 3 · Project-escalated 7
Forecast 14d  Off-track 6 · At risk 12 · On track 45
Capacity      Overloaded owners 8 · pressure hotspots 3 (indicative)
```

## 3.4 Portfolio Scorecard (executive default landing)

Default executive landing experience — single composition:

| Scorecard row                | Content                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| Portfolio Health             | Overall band + distribution % + trend + Critical Projects count/list |
| Portfolio Confidence         | Weighted score + band + major contributors                           |
| Strategic Objective Progress | Objectives on track / at risk / off track                            |
| Delivery Trend               | Week-over-week health/confidence/exception deltas                    |
| Exception Summary            | By severity · aged Major+                                            |
| Decision Summary             | Pending by level · latency                                           |
| Forecast Outlook             | 14d predicted outcome · confidence · top recommended actions         |

Drill from any row into Portfolio Workspace region, Objective, Programme, or Critical project cockpit. Same operational language as Project Cockpit — not a second product grammar.

## 3.3 Why superior to as-built

No portfolio layer exists — only project list/dashboard. This gives Exec/PMO a command surface without leaving APZ Projects.

---

# 4. Portfolio hierarchy UX

## 4.1 Presentation

**Recommend:** Collapsible hierarchy with **operational strips at each node** (not org-chart chrome).

```text
▾ Strategic Initiative · Payments Modernisation     Health Watch · Conf 61
   ▾ Programme · Card Issuing                       Health Critical · Conf 48
        Project · Core Ledger Adapter               …strip…
        Project · Customer Journey                  …strip…
   ▸ Programme · Merchant Acquiring                 …
▸ Strategic Initiative · Data Platform              …
▸ Standalone · Office Move                          …
```

Node strip shows: Health · Confidence · Progress (roll-up) · Open Major+ exceptions · Next portfolio milestone · Waiting aged count · Changed.

## 4.2 Portfolio Health (revised — not always worst-child)

A single project must **not** permanently dominate portfolio health unless governance rules explicitly require worst-child mode (e.g. Regulatory portfolio policy).

**Evaluate:**

| Factor                                       | Use                                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| % Healthy · % Attention (Watch) · % Critical | Distribution among in-scope Active+ projects                                           |
| Trend                                        | Direction of distribution over trailing window                                         |
| Operational impact                           | Weight Critical projects by strategic importance / dependency fan-out / classification |

**Display always:**

```text
Overall Portfolio Health: {Healthy|Attention|Critical}
Healthy {p}% · Attention {p}% · Critical {p}% · Trend {↑|→|↓}
Critical Projects: {n} — [names…]
```

Overall band derivation (v1 default):

- Critical if critical% ≥ threshold **or** impact-weighted critical mass exceeds profile
- Attention if not Critical and (attention%+critical%) ≥ threshold or adverse trend
- Healthy otherwise

Governance Profile may switch portfolio to **strict worst-child** for designated scopes.

## 4.3 Portfolio Confidence (revised — weighted, not mean)

Portfolio Confidence is a **weighted operational indicator**, not a simple arithmetic mean.

**Inputs:**

- Strategic importance of member nodes
- Child delivery confidence
- Dependency exposure (cross-project broken/blocking)
- Unresolved exceptions (Major/Critical)
- Programme criticality

Provide **major contributors** (top drag factors) in UI — same explainability standard as project Confidence.

```text
Portfolio Confidence = weightedCombine(
  importance_i × confidence_i,
  dependencyExposurePenalty,
  exceptionPenalty,
  programmeCriticalityBoost
)
```

Publish weights; show contributor breakdown.

---

# 5. Programmes

## 5.1 Programme as first-class

```text
Programme {
  id · name · ownerUserId
  strategicInitiativeId?
  classification                 // may inherit / override
  governanceProfileId            // programme-level profile
  status                         // aligning to lifecycle subset: Draft|Active|On Hold|Closing|Closed|Archived
  objectives · targetEndAt?
  memberProjectIds[]
}
```

## 5.2 Programme Cockpit intents

Reuse five intents — scaled:

| Intent   | Content                                                                                |
| -------- | -------------------------------------------------------------------------------------- |
| Overview | Pulse (programme rules) · Health · Confidence · forecast · member pressure             |
| Delivery | Cross-project commitments due · aged waits · blockers spanning projects                |
| Planning | Programme roadmap (milestones of members + programme milestones)                       |
| Control  | Programme decisions · risks · checkpoints · exceptions (incl. escalated from projects) |
| History  | Portfolio/programme Operational Changes                                                |

## 5.3 Programme Pulse

≤2 sentences from member pressure + next programme milestone + open Critical exceptions.

---

# 6. Strategic initiatives & Strategic Objectives

## 6.1 Strategic Initiative

A **Strategic Initiative** is an investment/outcome theme spanning programmes/projects. It is not a project with a bigger font.

| Field                         | Notes              |
| ----------------------------- | ------------------ |
| name · sponsorUserId · status | Required           |
| governanceProfileId           | Initiative-level   |
| linkedProgrammes / projects   | Membership         |
| strategicObjectiveIds[]       | One or more (§6.2) |

## 6.2 Strategic Objectives (first-class)

```text
StrategicObjective {
  id · name · statement
  ownerUserId · status          // on_track | at_risk | off_track | achieved | abandoned
  progress                      // 0–100 explainable
  initiativeIds[] · programmeIds[]
  contributingProjectIds[]      // projects contribute to objectives
}
```

- Every **Initiative** and **Programme** supports **one or more** Strategic Objectives
- Projects **contribute** to objectives (many-to-many)
- Objectives are a **reporting dimension** across the portfolio (Scorecard · reports · filters)

Progress rules (v1): derived from contributing projects’ milestone/commitment completion against objective-linked milestones — explainable; not AI.

## 6.3 Executive use

Initiative Overview: objectives · health/confidence · exceptions · sponsor decisions · forecast · Context.

---

# 7. Cross-project dependencies

## 7.1 Model

Extend W004 Dependency with scope:

```text
Dependency {
  ...W004 fields
  scope: within_project | cross_project
  fromProjectId · toProjectId     // required when cross_project
}
```

Cross-project dependencies:

- Appear on both project Planning intents
- Roll into programme/portfolio critical path views
- Broken/aged → both projects’ Confidence + Portfolio Queue
- Creating requires permission on both projects (or programme manage)

## 7.2 Portfolio dependency view

Planning-at-portfolio: edges between project strips/milestones; filter “broken only” / “external only”.

**Decision proposal PF-D3:** Cross-project dependencies are first-class; dual-project visibility mandatory.

---

# 8. Portfolio health & confidence

## 8.1 Definitions

Same **names** as projects (Health · Confidence · Pulse) with portfolio-specific computation (§4.2–4.3). Do not invent a parallel vocabulary.

| Indicator  | Portfolio meaning                                                  |
| ---------- | ------------------------------------------------------------------ |
| Health     | Distribution + impact + trend (§4.2); Critical Projects called out |
| Confidence | Weighted predictability (§4.3); major contributors shown           |
| Pulse      | ≤2 sentences on material enterprise pressure                       |

## 8.2 Display

Always Health + Confidence + Pulse together on Scorecard, Portfolio Overview, Initiative, Programme headers — **never independently** (align O-D6).

---

# 9. Capacity overview

## 9.1 Challenge: fake resource management

**Reject** full resource levelling / timesheet PPM in this workshop.  
**Recommend** an **indicative Capacity Overview** good enough for PMO intervention.

## 9.2 v1 signals

| Signal        | Definition                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| Owner load    | Count of accepted/in_progress commitments due in 14d per owner                                              |
| Overload      | Owners above profile threshold N                                                                            |
| Concentration | Projects sharing critically overloaded owners                                                               |
| Idle signal   | Owners with zero due commitments in 14d but assigned to Active projects (weak signal — labelled indicative) |

## 9.3 UX

Portfolio Overview capacity line + Control drill-down table: Owner · load · projects · overdue · aged waits chasing.

No booking grid in v1.

**Decision proposal PF-D4:** Capacity = indicative load signals only; explicit “indicative” labelling; no fake precision.

---

# 10. Executive reporting

## 10.1 Principle

Reports answer **operational questions**, not chart decoration.

## 10.2 Standard portfolio reports (v1)

| Report                | Question                                     |
| --------------------- | -------------------------------------------- |
| Portfolio status pack | What is enterprise delivery state?           |
| Exception register    | What exceptions are open by severity?        |
| Decision latency      | Where are decisions stalling?                |
| Baseline variance     | Where has plan diverged from baseline?       |
| Waiting ageing        | Where is the portfolio stuck externally?     |
| Forecast outlook      | 7/14/30 predicted outcomes                   |
| Classification cut    | How do Strategic vs Regulatory etc. compare? |

## 10.3 Presentation

- Export: PDF/CSV later; v1 on-screen + printable layout
- Each report: filters (initiative · programme · classification · date) · as-of timestamp · factor notes
- No emoji; semantic tokens only

## 10.4 Placement

Portfolio Workspace → **Reports** secondary nav (not competing with Overview). Scheduled digests = notifications workshop later.

---

# 11. Portfolio forecasting

## 11.1 Shape (align W004 forecast amendments)

```text
PortfolioForecast {
  windowDays: 7 | 14 | 30
  predictedOutcome: on_track | at_risk | off_track
  confidenceLevel
  contributingFactors[]
  recommendedActions[]
  childBreakdown: { on_track, at_risk, off_track }
  narrative ≤2 sentences
}
```

Aggregation: materiality filter (exclude Draft/Archived; optional exclude tiny Operational Initiatives).  
Recommended actions may target programmes (“Intervene on Card Issuing — Critical exception open 9d”).

---

# 12. Portfolio governance

## 12.1 Profiles at each level

| Level      | Governance Profile                                                          |
| ---------- | --------------------------------------------------------------------------- |
| Initiative | Strategic checkpoints · sponsor approvals                                   |
| Programme  | Coordinated gates · cross-project dependency policy · re-baseline authority |
| Project    | Per W003/W004                                                               |

Inheritance: Project may inherit Programme profile defaults; local stricter rules allowed; looser requires waiver + audit.

## 12.2 Portfolio checkpoints

Examples: initiative funding gate · programme go-live readiness · portfolio quarterly review.  
Execution via Workflow; Projects/Portfolio stores checkpoint requirement + outcome (same pattern as W004).

---

# 13. Portfolio exceptions

## 13.1 Escalation path

```text
Project Exception (Major/Critical)
  → visible on Programme Control (auto)
  → Portfolio Queue when severity ≥ Major and age > profile OR severity = Critical
```

Portfolio may also open **Portfolio-scoped exceptions** (e.g. cross-project dependency break, initiative benefit threat).

## 13.2 Severity & outcomes

Identical to W004: Advisory · Minor · Major · Critical.  
Outcomes: Resolved · Accepted · Waived · Re-Baselined · Cancelled.  
No permanent opens.

## 13.3 Portfolio Queue groups

Same three groups (Decisions · Attention · Waiting) with portfolio-scoped membership + escalated project items tagged with project/programme name.

---

# 14. Portfolio decision management

## 14.1 Decision levels

| Level                  | Examples                                          |
| ---------------------- | ------------------------------------------------- |
| Project                | Scope/date trade within tolerance                 |
| Programme              | Cross-project priority · shared dependency accept |
| Initiative / Portfolio | Strategic trade-off · funding · stop/continue     |

## 14.2 Portfolio Decisions surface

Control intent at Portfolio/Programme/Initiative:

- Pending decisions by level
- Latency metrics
- Inline decide when user is decisionMaker
- Link to affected projects

Escalation: project Decision can be **promoted** to programme/portfolio (records promotion event in both histories).

**Decision proposal PF-D5:** Promotion is explicit; never silent auto-escalate decisions (exceptions may auto-surface by severity rules).

---

# 14.5 Portfolio Timeline (enterprise roadmap)

Enterprise roadmap communicating **delivery direction**, not detailed schedules.

Shows:

- Initiatives · Programmes · Projects (swimlanes or nested bands)
- Major milestones only (profile: programme/initiative-significant)
- Cross-project dependency edges
- Today marker · optional delivery windows

Default: roadmap-first (W002/D9). No Gantt-by-default. Click → node cockpit. Filter by objective · classification · health.

Route: `/workspace/projects/portfolio/timeline`.

---

# 15. Permissions (logical)

| Capability                  | PM          | Programme Mgr     | PMO | Executive / Sponsor |
| --------------------------- | ----------- | ----------------- | --- | ------------------- |
| Operational Workspace       | ✓           | ✓                 | ✓   | ✓ (read)            |
| Portfolio Workspace         | — / limited | ✓ programme scope | ✓   | ✓                   |
| Create programme/initiative | —           | limited           | ✓   | sponsor+            |
| Portfolio decide            | —           | programme         | ✓   | ✓                   |
| Capacity overview           | —           | ✓                 | ✓   | ✓                   |
| Reports                     | own project | programme         | ✓   | ✓                   |

Map to PermissionService; UI never shows backend role names (007).

---

# 16. Enterprise Context across hierarchy

Compose with focus types: `portfolio` · `strategic_initiative` · `programme` · `project` (existing).

**Hierarchy-aware composition:** When viewing an Initiative, Context includes initiative-scoped fragments plus rolled **relevant** programme/project signals without duplicating SoRs. Drilling to Programme/Project narrows focus; breadcrumbs retain parent context affordance.

```text
Strategic Initiative → Programme → Project
```

Relevant governance, knowledge, workflow and document context surfaces for the **current** hierarchy level. Fragments always name owning System of Record. No duplication of delivery registers into Context.

Order sections by pressure (Workflow · Support · Governance · Documents · Knowledge).

---

# 17. Mobile portfolio

Queue-first: portfolio Decisions · escalated Attention · Critical exceptions.  
No hierarchy editing on mobile. No capacity grids.

---

# 18. Interaction design (portfolio)

| Concern   | Spec                                                                                          |
| --------- | --------------------------------------------------------------------------------------------- |
| Shortcuts | `g o` portfolio overview · `g q` portfolio queue · `j/k` · `Enter` drill to programme/project |
| Loading   | Independent regions; hierarchy lazy-expand                                                    |
| Empty     | “No programmes in scope” professional empty                                                   |
| Drill     | Strip click → programme/initiative/project cockpit                                            |
| A11y      | Tree semantics for hierarchy; strip names include health+confidence text                      |

---

# 19. Engineering readiness

| Area                | Current         | New                                                                    | API                                           | Complexity |
| ------------------- | --------------- | ---------------------------------------------------------------------- | --------------------------------------------- | ---------- |
| Hierarchy           | Flat projects   | Initiative · Programme entities · membership                           | `/portfolio` · `/initiatives` · `/programmes` | L          |
| Portfolio Workspace | None            | New shell reusing Overview/Queue/Changes patterns                      | `/portfolio/overview                          | queue      | changes` | L   |
| Roll-ups            | None            | Aggregator service                                                     | projection endpoints                          | M–L        |
| Cross-project deps  | None            | Extend dependency SoR                                                  | scope fields                                  | M          |
| Capacity            | None            | Indicative load projection                                             | `/portfolio/capacity`                         | M          |
| Reports             | None            | Report queries                                                         | `/portfolio/reports/{key}`                    | M–L        |
| Forecast            | Project only    | Portfolio aggregator                                                   | `/portfolio/forecast`                         | M          |
| Governance          | Project profile | Programme/initiative profiles + checkpoints                            | extend                                        | M          |
| Exceptions          | Project         | Escalation rules + portfolio-scoped                                    | filter/escalate                               | M          |
| Decisions           | Project         | Level + promotion                                                      | extend decision                               | M          |
| Context             | project focus   | portfolio/programme/initiative focus                                   | context API                                   | M          |
| Migration           | —               | Existing projects → standalone under default portfolio                 | one-time                                      | M          |
| Performance         | —               | Precomputed roll-ups; refresh on mutation events; virtualise hierarchy | —                                             | L          |
| Acceptance          | —               | See §21                                                                | —                                             | —          |

**Reuse heavily:** W002 region patterns, W004 formulas, Enterprise Context panel, Operational Changes feed filters.

---

# 20. Acceptance criteria

1. Executives with portfolio permission land on Portfolio Scorecard by default.
2. Health + Confidence + Pulse always co-displayed at scorecard/portfolio/programme/initiative headers.
3. Portfolio Health shows overall + distribution % + trend + Critical Projects — not permanent worst-child domination (unless profile).
4. Portfolio Confidence is weighted with major contributors visible.
5. Strategic Objectives exist; initiatives/programmes link; projects contribute; filterable/reportable.
6. Cross-project dependency visible and actionable from both projects.
7. Major/Critical exceptions escalate by severity rules.
8. Forecast returns predicted outcome · confidence · factors · recommended actions.
9. Capacity labelled indicative; no booking grid.
10. Portfolio Timeline shows initiatives/programmes/projects/major milestones/cross-deps.
11. Context composes by hierarchy level without SoR duplication.
12. Project move between programmes preserves operational history.
13. No second UX language vs project Operational Workspace.

---

# 21. Decision register — Owner review (2026-08-06)

| ID         | Status               | Decision                                                                                                                               |
| ---------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **PF-D1**  | **APPROVED**         | Hierarchy Enterprise Portfolio → Strategic Initiative → Programme → Project; standalone allowed; move between programmes keeps history |
| **PF-D2**  | **APPROVED**         | Portfolio is a lens in APZ Projects — not a separate product; consistent UX/language/Context                                           |
| **PF-D3**  | **APPROVED**         | Cross-project dependencies first-class; dual visibility; feed Confidence/Forecast/Queue                                                |
| **PF-D4**  | **APPROVED**         | Initiative/Programme cockpits: Overview · Delivery · Planning · Control · History                                                      |
| **PF-D5**  | **APPROVED**         | Capacity indicative — loading/pressure/constraints; no hour-by-hour modelling                                                          |
| **PF-D6**  | **APPROVED**         | Portfolio forecasts explainable (factors · risks · confidence · actions)                                                               |
| **PF-D7**  | **APPROVED**         | Exceptions escalate by operational severity + governance rules                                                                         |
| **PF-D8**  | **APPROVED AMENDED** | Portfolio Health = distribution + trend + impact + Critical Projects callout; worst-child only if profile requires                     |
| **PF-D9**  | **APPROVED AMENDED** | Portfolio Confidence = weighted (importance · confidence · deps · exceptions · programme criticality) + contributors                   |
| **PF-D10** | **APPROVED**         | Strategic Objectives first-class; initiatives/programmes support many; projects contribute; reporting dimension                        |
| **PF-D11** | **APPROVED**         | Portfolio Scorecard = default executive landing                                                                                        |
| **PF-D12** | **APPROVED**         | Portfolio Timeline = enterprise roadmap (direction, not detail schedule)                                                               |
| **PF-D13** | **APPROVED**         | Context composes across hierarchy levels; no SoR duplication                                                                           |

**Engineering:** Do not implement until Owner authorises. Next design authority: **W006 — Resource & Team Management**.

---

# 22. Explicit non-goals

- Financial PPM / benefits realisation accounting suite
- Full resource management / timesheets as capacity SoR (→ W006 defines participation only; APZ Time owns time)
- Multi-portfolio federations across legal entities (design hook only)
- AI portfolio advisors
- Implementation code

---

# 23. Approval gate

**Owner approved with amendments (2026-08-06).** This file is implementation authority for Portfolio Management.

Resource & team participation is specified in `W006-RESOURCE-AND-TEAM-MANAGEMENT.md`.
