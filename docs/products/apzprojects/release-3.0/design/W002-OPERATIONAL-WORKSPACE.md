# APZ Projects Release 3.0

# Product Design Workshop 002 — Operational Workspace

**Document ID:** W002-OPERATIONAL-WORKSPACE  
**Status:** APPROVED WITH AMENDMENTS (Owner review 2026-08-06) — implementation authority for Operational Workspace  
**Mode:** Product design only · no code until Owner authorises engineering  
**Supersedes (for workspace IA):** `W002-ACTIONS-COMMITMENTS-WAITING-PULSE.md` (annex only; this file wins on conflict)  
**Depends on:** W001 Decision Log (D1–D9)  
**Continues:** `W003-PROJECT-LIFECYCLE.md`  
**Authority:** Implementation specification for the APZ Projects Operational Workspace (as amended below)

---

# 0. Product objective

The Operational Workspace is the primary surface for Project Managers, PMO, Programme Managers and Executives to manage delivery.

Within seconds, a user must know:

1. Portfolio operational state
2. What requires their decision or attention
3. Which projects are under pressure
4. What changed that matters
5. What enterprise context applies before acting

**Success metric (product):** Reduce clicks and context switches to reach an operational decision versus the current tabbed workbench. Compete on clarity with Linear (trajectory), Azure DevOps (enterprise gravity), and Jira (scale) — without inheriting their navigation debt.

---

# 1. Design principles (normative)

| #   | Principle                                                                                |
| --- | ---------------------------------------------------------------------------------------- |
| P1  | Organise around **operational outcomes**, not database entities                          |
| P2  | Users must not need to think in Tasks · Files · Registers · Tabs as the product identity |
| P3  | Enterprise language only — no greetings, no consumer personalisation, no gamification    |
| P4  | Information-rich density over decorative whitespace                                      |
| P5  | Semantic colour only; text labels always accompany status                                |
| P6  | Context is **composed**, never duplicated; every fragment names its System of Record     |
| P7  | Registers remain reachable; they never dominate the default experience                   |
| P8  | Mobile is a distinct operational surface, not a shrunk desktop                           |
| P9  | Prefer explainable rules over opaque AI for scores and Pulse (v1)                        |
| P10 | Do not preserve as-built layouts because they exist                                      |

---

# 2. Locked decisions absorbed from W001

| ID  | Lock                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------- |
| D1  | Portfolio = **operational strips**                                                                   |
| D2  | Mobile primary = operational queue                                                                   |
| D3  | No greetings / consumer tone                                                                         |
| D4  | Priority cascade: Business Impact → Blocked Work → Waiting For Me → Due Today → Approvals → Upcoming |
| D5  | Default sort Attention; user-selectable sorts                                                        |
| D6  | Context compose-only                                                                                 |
| D7  | Feed name = **Operational Changes**; every item answers why it matters                               |
| D8  | Cockpit = operational navigation + canvas (not entity tab strip)                                     |
| D9  | Timeline = roadmap-first; Gantt secondary                                                            |

---

# 3. First-class operational constructs

These are product objects / computed operational fields — not UI badges.

## 3.1 Delivery Health

**Question:** How is the project **today**?  
**Shape:** `Healthy` | `Watch` | `Critical`  
**Inputs (v1):** open critical/watch risks · overdue commitments · active blockers · schedule band from delivery-health rules (reuse Wave A scoring as base).

## 3.2 Delivery Confidence

**Question:** Will we deliver what we promised **from here**?  
**Shape:** integer `0–100` + band `High` (≥75) · `Medium` (45–74) · `Low` (<45)  
**Rule (v1, explainable):**

```text
confidence = clamp(0, 100,
  100
  − 15 × criticalOpenRisks
  − 8  × watchOpenRisks
  − 10 × overdueCommitments
  − 6  × agedActiveWaits          // wait exceeded SLA or >7d default
  − 5  × unresolvedDecisionsPastDue
  − 4  × lowConfidenceMilestones
  − trendPenalty                  // 0–20 from recent slip rate
)
```

UI must expose **Why this score** (factor breakdown). Health and Confidence are independent — Healthy + Low Confidence is a first-class, desirable signal.

## 3.3 Project Pulse

Rule-composed operational summary. **Maximum two sentences.** Not AI. Not greeting.

**Slot order (compose into ≤2 sentences; omit empty):**

1. Primary pressure (highest-severity wait / blocker / critical risk) and/or decision/approval load
2. Trajectory vs next milestone/commitment

Shown on Cockpit Overview header; one truncated line on Portfolio strips at Comfortable density.

## 3.4 Waiting

First-class SoR in Projects. Waiting contributes directly to Delivery Confidence.

| Field              | Notes                                                                     |
| ------------------ | ------------------------------------------------------------------------- |
| subject            | What we are waiting for                                                   |
| category           | `Customer` · `Internal` · `Vendor` · `Governance` · `External Dependency` |
| partyLabel         | Optional named organisation / team                                        |
| since              | Start of wait                                                             |
| slaDays            | Optional                                                                  |
| chaseOwnerUserId   | Who must chase                                                            |
| links              | commitment / decision / milestone optional                                |
| failureConsequence | Optional — what happens if wait is not resolved                           |
| status             | `active` · `resolved`                                                     |

## 3.5 Commitment

Primary delivery promise object:

| Required v1                        | Optional v1                    |
| ---------------------------------- | ------------------------------ |
| statement · owner · dueAt · status | failureConsequence · waiters[] |

**Failure Consequence** (optional, Owner-approved): supported on commitments, milestones, decisions, and operational dependencies. Answers “What happens if this does not happen?” Influences prioritisation and future Confidence calculations.

Statuses: `proposed` · `accepted` · `in_progress` · `waiting` · `done` · `cancelled`.  
Tasks may back a commitment; **product language is Commitment**.

## 3.6 Business Impact (sort key)

Published score on queue items:

```text
impact =
  projectCriticality (1–5)
  + (customerFacing ? 2 : 0)
  + (regulatoryFlag ? 2 : 0)
  + min(waitersCount, 3)
  + (blocksGoLive ? 3 : 0)
```

## 3.7 Pressure

Aggregate chip set on strips/cockpit: counts for Risks · Decisions · Waiting · Blocked — show only counts > 0. Aged waits use warning token + text.

---

# 4. Information architecture

## 4.1 Module entry

| Route                               | Surface                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| `/workspace/projects`               | **Operational Workspace** (this document) — replaces Dashboard table as product home |
| `/workspace/projects/list`          | Administrative project directory (secondary)                                         |
| `/workspace/projects/{id}`          | **Project Cockpit** default intent = Overview                                        |
| `/workspace/projects/{id}/{intent}` | Cockpit intent (`overview` · `delivery` · `planning` · `control` · `history`)        |
| Legacy tab paths                    | Redirect into intent + optional surface (`/risks` → `control?surface=risks`)         |

## 4.2 Workspace composition (desktop ≥1280px)

```text
┌────────────────────────────────────────────────────────────┬─────────────────┐
│ APZ Projects                                               │ ENTERPRISE      │
│────────────────────────────────────────────────────────────│ CONTEXT         │
│ A. Operational Overview                                    │                 │
│────────────────────────────────────────────────────────────│ Knowledge       │
│ B. Operational Queue                                       │ Governance      │
│    Requires My Decision                                    │ Documents       │
│    Requires My Attention                                   │ Workflow        │
│    Waiting On Others                                       │ Support         │
│────────────────────────────────────────────────────────────│                 │
│ C. Delivery Portfolio (operational strips)                 │ SoR attributed  │
│────────────────────────────────────────────────────────────│                 │
│ D. Operational Changes                                     │                 │
└────────────────────────────────────────────────────────────┴─────────────────┘
```

**Why this order:** State → Act → Scan portfolio → Understand change → Consult context. Entity admin (list, settings, templates) is sidelined to secondary nav / Command Palette.

## 4.3 Challenge: widget dashboard

**Reject** a grid of independent KPI cards (Monday/Azure “dashboard” pattern).  
**Recommend** a single **Operational Overview band** (one composition) above a single **Operational Queue**, then portfolio. Cards as decorative tiles increase scanning cost without improving decisions.

---

# 5. Operational Overview

## 5.1 Purpose

Executive / PMO summary of portfolio operational state — institutional, metric-led, low chrome.

## 5.2 Recommended presentation

**Horizontal metric band** (not card grid):

```text
Operational Overview                              As of 18:02
─────────────────────────────────────────────────────────────────────────
Health     Critical 2 · Watch 4 · Healthy 12
Confidence Portfolio 71 (Low confidence: 3)
Attention  Decision 2 · Attention 5 · Waiting 4
Delivery   Commitments due 7d: 5 · Milestones due 7d: 3
Control    Open risks (crit/watch): 1/6 · Open decisions: 4
Trend      Slip rate +2 vs prior week · Aged waits +1
```

Optional one-line **pressure statement** (rule-built):

```text
2 projects Critical · 2 decisions waiting on you · 3 aged customer waits
```

### Visual rules

- Typography and count hierarchy carry meaning; colour is semantic token only on status words
- No sparklines required in v1 (optional later); trend is numeric delta text
- No illustrations, mascots, or emoji

### Why superior to as-built

Current `ProjectsDashboardView` shows a thin active-projects table and onboarding tips — it answers “what exists,” not “what is the operational state.” The band answers portfolio questions without opening projects.

## 5.3 Metrics definition (v1)

| Metric                          | Definition                                                              |
| ------------------------------- | ----------------------------------------------------------------------- |
| Health distribution             | Count of accessible projects by Health                                  |
| Confidence                      | Mean confidence of accessible projects; count of Low band               |
| Attention                       | Counts from Operational Queue sections (user-scoped)                    |
| Commitments / milestones due 7d | Due in window, not done                                                 |
| Risks / decisions               | Open, permission-filtered                                               |
| Trend                           | Week-over-week: slipped milestones · aged waits · mean confidence delta |

## 5.4 Engineering readiness — Overview

| Dimension   | Detail                                                                                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current     | `projects-dashboard-view.tsx` — table of ≤10 active projects                                                                                                     |
| Reuse       | Delivery-health aggregation patterns; permissions; query client                                                                                                  |
| Redesign    | Replace dashboard view entirely                                                                                                                                  |
| New         | `OperationalOverviewBand`, pressure statement composer                                                                                                           |
| API         | `GET /api/v1/projects/workspace/overview` → metrics + pressureStatement + asOf                                                                                   |
| Backend     | Aggregator over accessible projects + queue counts; cache 30–60s per user                                                                                        |
| Migration   | `/workspace/projects` serves Overview; old “Dashboard” copy removed                                                                                              |
| Performance | Single aggregate query; avoid N+1 per project on home load — batch dashboard projection                                                                          |
| A11y        | Band as `region` named “Operational Overview”; counts in text; live `as of` time                                                                                 |
| Acceptance  | User with ≥1 project sees health + confidence + attention counts within 2s p95 local; empty portfolio shows professional empty state; no greeting strings in DOM |

---

# 6. Operational Queue

## 6.1 Purpose

**One queue** representing work requiring operational attention for the current user — not a notification inbox, not an audit list.

## 6.2 Challenge: three separate pages vs one queue

Three mental modes are essential; three separate destinations are not.

**Recommend:** Single **Operational Queue** with **three pinned groups** (always visible headings):

1. **Requires My Decision**
2. **Requires My Attention**
3. **Waiting On Others**

Membership rules (exclusive; Decision > Attention > Waiting):

| Group             | Includes                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Decision          | Approvals on me · Decisions where I am decision-maker and pending · Escalations requiring my call                              |
| Attention         | Overdue / due-today commitments I own · Blockers I must clear · Critical/watch risks I own · Governance actions assigned to me |
| Waiting On Others | Active Waiting where I am chase owner · Commitments where I am waiter (not owner)                                              |

## 6.3 Ranking (within each group)

```text
Business Impact ↓
→ Blocked Work
→ Waiting For Me
→ Due Today
→ Approvals
→ Upcoming
```

Approvals are not inherently top priority — impact and blockage outrank them.

## 6.4 Row anatomy

```text
[Impact] [Kind]  Statement                        Project           Age/Due
 High     Risk   Vendor API capacity              Digital Banking   Today
```

**Kinds:** `Decision` · `Approval` · `Commitment` · `Risk` · `Blocked` · `Waiting` · `Governance` · `Escalation` · `Milestone` (only when milestone requires action — e.g. confirm slip / accept date)

**Urgency:** Age/Due column + optional `Aged` text when wait > SLA. No flashing.

**Inline act (desktop):** Decision/Approval rows expose primary actions in-row (`Approve` · `Reject` · `Open`) to reduce cockpit round-trips. Destructive/reject requires confirm.

## 6.5 Filter · search · sort

| Control        | Behaviour                                             |
| -------------- | ----------------------------------------------------- |
| Filter         | Kind · Project · Impact ≥ · Aged only                 |
| Search         | Statement + project name (`/`)                        |
| Group collapse | User toggle; state persisted in preferences           |
| Scope          | My queue (default) · Delegatees if role allows (v1.1) |

## 6.6 Responsive

| Viewport | Behaviour                                                      |
| -------- | -------------------------------------------------------------- |
| Desktop  | Full three groups + inline act                                 |
| Tablet   | Groups stack; Context slide-over; inline act kept for Decision |
| Mobile   | Queue-first app shell — see §12                                |

## 6.7 Why superior to as-built

No cross-project attention surface exists. Users open projects and hunt tabs. The queue collapses decision latency to one screen.

## 6.8 Engineering readiness — Queue

| Dimension   | Detail                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Current     | None (My Work / tasks are entity lists)                                                                                                                                                    |
| Reuse       | Risks, decisions, actions DTOs; Workflow Context fragments for approvals when available                                                                                                    |
| Redesign    | —                                                                                                                                                                                          |
| New         | `OperationalQueue`, `QueueGroup`, `QueueRow`, impact + ranking utilities                                                                                                                   |
| API         | `GET /api/v1/projects/workspace/queue` → `{ decision[], attention[], waitingOnOthers[] }` each with `impact`, `kind`, `projectId`, `target`, `dueAt`, `ageDays`                            |
| Backend     | Assembler service; provider degradation (`approvalsUnavailable: true`); idempotent action POSTs for approve/reject bridge                                                                  |
| Migration   | None                                                                                                                                                                                       |
| Performance | Cap default 50 rows/group with “Show more”; server-side rank; Redis cache short TTL optional                                                                                               |
| A11y        | Groups as `h2`; row listbox/roving tabindex `j`/`k`; impact not colour-only                                                                                                                |
| Acceptance  | Ordering matches D4 within groups; exclusive membership; empty group shows `None`; Workflow down does not blank Attention/Waiting; Approve from row updates queue without full page reload |

---

# 7. Delivery Portfolio

## 7.1 Presentation decision (locked D1)

**Operational strips** — one dense row per project.

**Reject:** consumer card grids (fail at 30–100 projects).  
**Reject:** classic CRUD tables as product identity (admin list remains at `/list`).

## 7.2 Strip columns

| Column          | Content                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| Project         | Name + identifier                                                        |
| Health          | Label                                                                    |
| Confidence      | Score + band                                                             |
| Progress        | Thin bar + % (milestone/commitment completion formula — document in API) |
| Pulse           | Truncated one line (Comfortable density)                                 |
| Next commitment | Statement + date                                                         |
| Pressure        | Risks · Decisions · Waiting · Blocked (counts >0)                        |
| Waiting         | Dominant party + count if aged                                           |
| Changed         | Relative time of last Operational Change                                 |

Click → Project Cockpit Overview.

## 7.3 Sort & filter (D5)

**Default sort:** Attention score (Critical health, low confidence, queue presence, aged waits).

**User sorts:** Health · Attention · Confidence · Customer · Name · Owner · Programme · Recently Changed.

**Filters:** Health · Confidence band · Has aged wait · Owner (me/all) · Programme · Customer-facing.

**Density:** Comfortable (pulse visible) · Compact (pulse hidden, smaller type) · Dense (pressure icons+counts only). Persist per user preference.

## 7.4 Why superior to as-built

List/dashboard tables expose name/status — not health, confidence, next commitment, waiting, or pressure. Strips make portfolio triage possible without opening projects.

## 7.5 Engineering readiness — Portfolio

| Dimension   | Detail                                                                                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current     | `ProjectsListView` / dashboard table via `ProjectsTable`                                                                                                                           |
| Reuse       | `listProjects`; per-project delivery-dashboard fields (batch)                                                                                                                      |
| Redesign    | Table is not home; keep for `/list` admin                                                                                                                                          |
| New         | `OperationalStrip`, `StripPressure`, density modes, virtualised list                                                                                                               |
| API         | `GET /api/v1/projects/workspace/portfolio?sort=&filter=` → strip projections including health, confidence, pulse, progress, nextCommitment, pressure, waitingSummary, lastChangeAt |
| Backend     | Projection builder; batch; avoid hydrate-per-row client waterfall                                                                                                                  |
| Migration   | Home no longer uses dashboard table                                                                                                                                                |
| Performance | Virtualise at ≥40 rows; projection endpoint target p95 <300ms for 100 projects                                                                                                     |
| A11y        | Grid/row semantics; sortable column headers; focusable strips                                                                                                                      |
| Acceptance  | Default Attention order; all D5 sorts work; strip shows Health+Confidence simultaneously; click opens cockpit; Compact hides Pulse                                                 |

---

# 8. Project Cockpit

## 8.1 Purpose

Operational command surface for **one** project. Replaces tab-first `ProjectDetailView`.

## 8.2 Navigation philosophy — five intents (D8.1)

```text
Overview · Delivery · Planning · Control · History
```

| Intent       | User question                                 | Primary canvas                                                                                |
| ------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Overview** | What is the state right now?                  | Pulse · Health · Confidence · Waiting summary · project-scoped queue slices · next commitment |
| **Delivery** | What are we executing / blocked / waiting on? | Commitments · blockers · Waiting register                                                     |
| **Planning** | What is the trajectory?                       | Delivery Timeline (roadmap) · milestones                                                      |
| **Control**  | What must be steered or decided?              | Risks · Decisions · Approvals · governance actions                                            |
| **History**  | What changed that I should care about?        | Operational Changes (project scope)                                                           |

Registers are **surfaces inside intents**, opened as focused panels/drawers — not peer tabs that redefine the product.

**Legacy mapping**

| Old tab                     | Intent + surface                                                          |
| --------------------------- | ------------------------------------------------------------------------- |
| overview / delivery         | Overview (delivery metrics fold into Overview + Delivery)                 |
| milestones / roadmap        | Planning                                                                  |
| tasks / backlog / sprints   | Delivery (commitment-backed; sprint/backlog secondary under More/Command) |
| risks / decisions / actions | Control                                                                   |
| —                           | History (new)                                                             |

## 8.3 Page structure (desktop)

```text
┌──────────────────────────────────────────────────────────┬──────────────┐
│ Project · {name}     Health · Confidence                 │ ENTERPRISE   │
│ Project Pulse                                            │ CONTEXT      │
│ Next commitment · {title} · {date}     [primary actions] │              │
├────────────┬─────────────────────────────────────────────┤              │
│ Overview   │                                             │              │
│ Delivery   │           INTENT CANVAS                     │              │
│ Planning   │                                             │              │
│ Control    │                                           │              │
│ History    │                                             │              │
│ ───────    │                                             │              │
│ More…      │  (settings, people, legacy task views)      │              │
└────────────┴─────────────────────────────────────────────┴──────────────┘
```

**Primary actions (permissioned):** New commitment · Record decision · Raise risk · Log wait.

**More…** holds entity administration and legacy Plane work-management views without polluting operational nav.

## 8.4 Why superior to as-built

Ten entity tabs force register-first cognition. Intent nav answers operational questions; Context stays composed on the right; Pulse/Confidence make state legible before scrolling registers.

## 8.5 Engineering readiness — Cockpit

| Dimension   | Detail                                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Current     | `project-detail-view.tsx` + tab strip; `ProjectsWorkspaceFrame` + Context aside                                                                                          |
| Reuse       | Frame, Context panel, delivery panels (re-homed), routes helpers, permissions                                                                                            |
| Redesign    | Remove tab strip as identity; re-home panels into intents                                                                                                                |
| New         | `ProjectCockpit`, `FocusNav`, `PulseHeader`, confidence breakdown dialog                                                                                                 |
| API         | Existing delivery APIs + Waiting/Commitments/Pulse/Confidence (below)                                                                                                    |
| Backend     | Route aliases; no behaviour change to SoR ownership                                                                                                                      |
| Migration   | Soft redirects from old tab URLs; Playwright update                                                                                                                      |
| Performance | Intent-level code split; Context fetch independent                                                                                                                       |
| A11y        | `nav` for intents; `main` for canvas; complementary Context                                                                                                              |
| Acceptance  | Default Overview shows Pulse+Health+Confidence; `/risks` opens Control with risks surface; no greeting; Context never shows duplicated milestone tables as Context truth |

---

# 9. Delivery Timeline (Planning intent)

## 9.1 Default: roadmap

Horizontal time axis with:

- Milestones (diamond/marker + label + date)
- Commitments (bars or markers by due)
- Dependencies (edges between commitments/milestones)
- Delivery windows (shaded ranges for phases/releases)
- Critical path indicator (computed; label “Critical path” — not colour alone)

Interactions: pan/zoom · click opens Milestone/Commitment surface · drag reschedule if `projects.manage` · today marker.

## 9.2 Gantt

Explicit toggle **Advanced schedule**. Not default (D9).

## 9.3 Why superior to as-built

Current “roadmap” tab is a filtered task table — not a trajectory instrument. Roadmap-first matches how PMO communicates dates; Gantt remains for schedule mechanics.

## 9.4 Engineering readiness — Timeline

| Dimension   | Detail                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| Current     | `ProjectsRoadmapView` / detail roadmap tab — task tables                                                           |
| Reuse       | Milestone dates; task due dates as interim commitment proxies                                                      |
| Redesign    | Replace table roadmap                                                                                              |
| New         | `DeliveryTimeline`, dependency edge model, critical path calc, Gantt toggle                                        |
| API         | `GET .../projects/:id/timeline` → milestones, commitments, dependencies, windows, criticalPathIds                  |
| Backend     | Graph for dependencies; careful N+1; consider materialised path                                                    |
| Migration   | Old roadmap routes → Planning intent                                                                               |
| Performance | Virtualise offscreen time; limit edges; worker for critical path if large                                          |
| A11y        | Keyboard pan; list fallback table for AT users; reduced-motion disables animation                                  |
| Acceptance  | Default view is roadmap not Gantt; milestones+commitments visible; dependency edge selectable; Gantt behind toggle |

---

# 10. Operational Changes

## 10.1 Definition

Feed of **meaningful operational events**. Not Activity. Not audit.

**Gate:** If the item cannot answer “What operationally changed?” / “Why should I care?”, exclude it.

### Include (v1)

- Party approved / rejected
- Risk escalated / de-escalated / closed
- Milestone completed / slipped
- Budget or threshold exceeded (when modelled)
- Support incident linked
- Waiting started / resolved (especially aged)
- Commitment blocked / completed / slipped
- Decision recorded
- Health or Confidence band change

### Exclude

Field renames · comment chatter · view events · login · routine status flicker without outcome.

### Row shape

```text
{headline}                                 {project?} · {when}
{one-line operational implication}
```

### Filters

Project (hidden on cockpit) · Operational area (Delivery / Control / Planning / Waiting) · Importance (High / Normal) · Date range.

## 10.2 Placement

| Surface         | Scope                                |
| --------------- | ------------------------------------ |
| Workspace home  | Portfolio-scoped since `lastVisitAt` |
| Cockpit History | Project-scoped                       |

## 10.3 Engineering readiness — Changes

| Dimension   | Detail                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------- |
| Current     | `listProjectActivity` in platform services; **no** web `/activity` route; no UI             |
| Reuse       | Activity contract / Plane provider as raw input                                             |
| Redesign    | Map raw → operational event classes; drop noise                                             |
| New         | `OperationalChangesFeed`, event class enum, why-care copy map, lastVisit preference         |
| API         | `GET /api/v1/projects/workspace/changes` · `GET /api/v1/projects/:id/changes`               |
| Backend     | Filter/transform layer; prefer domain events emitted by delivery services over audit scrape |
| Migration   | Audit remains elsewhere for compliance; not this feed                                       |
| Performance | Cursor pagination; since-lastVisit default window                                           |
| A11y        | Feed as list; time as absolute on focus                                                     |
| Acceptance  | No “updated description” style rows; filters work; home vs cockpit scoping correct          |

---

# 11. Enterprise Context (within workspace)

## 11.1 Principles (locked)

Compose · attribute SoR · never duplicate Projects operational SoR (commitments, milestones, risks, decisions, health, pulse).

## 11.2 Placement

| Surface        | Behaviour                                                                          |
| -------------- | ---------------------------------------------------------------------------------- |
| Workspace home | Context rail present — portfolio/org focus when available; else collapsed guidance |
| Cockpit        | Context rail with `focusType=project` (as today)                                   |
| Tablet/Mobile  | Icon → slide-over / full-screen sheet                                              |

## 11.3 Section presentation

Order by **operational usefulness under pressure** (not alphabetical):

1. **Workflow** — related approvals / running processes
2. **Support** — open incidents linked to project
3. **Governance / Law** — obligations, policies
4. **Documents** — key controlled documents
5. **Knowledge** — related articles / lessons
6. **Related projects** — programme siblings

Each section: header + count · SoR label · attention fragments first · expand for remainder · honest empty / provider unavailable.

## 11.4 Why superior to as-built

Context exists on detail only and competes with tab noise. Elevating compose-on-home + intent cockpit makes Context a decision aid rather than a side curiosity.

## 11.5 Engineering readiness — Context

| Dimension   | Detail                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Current     | `EnterpriseContextPanel` on project detail; `GET /api/v1/context`                                                               |
| Reuse       | Panel, sections, provider resilience, learning telemetry hooks                                                                  |
| Redesign    | Section order; home mounting strategy; density                                                                                  |
| New         | Home focus composition (org/portfolio) if API supports; else project-less empty honesty                                         |
| API         | Existing compose; extend focus types only if home needs portfolio focus                                                         |
| Backend     | No duplication of delivery registers into Context providers                                                                     |
| Migration   | Keep panel; change hosts                                                                                                        |
| Performance | Independent query; stale-while-revalidate; failure isolated                                                                     |
| A11y        | `complementary`; section buttons disclose panels                                                                                |
| Acceptance  | No milestone/risk tables inside Context as SoR; unavailable providers show explicit state; home does not crash if Context fails |

---

# 12. Mobile Workspace

## 12.1 Philosophy

Phones are for **decide · respond · escalate · glance** — not portfolio architecture.

```text
APZ Projects (mobile)
├── Queue          (default)
│   ├── Decision
│   ├── Attention
│   └── Waiting
├── Changes        (portfolio operational changes)
└── Project sheet  (opened from queue row — Pulse, Health, Confidence, Wait, primary act)
```

Portfolio strips and full timeline are **desktop/tablet**. Optional compact project list under More if demanded later — not v1 primary.

## 12.2 Mobile behaviours

- Large tap targets for Approve / Reject / Open
- No swipe-to-approve (error-prone in enterprise) — explicit buttons
- Context as on-demand sheet when opening a project/action
- Offline: read cached queue with banner; mutations queue or fail clearly

## 12.3 Engineering readiness — Mobile

| Dimension   | Detail                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Current     | Responsive shell only; no mobile operational IA                                                        |
| Reuse       | Queue API, Changes API, permissions                                                                    |
| Redesign    | —                                                                                                      |
| New         | `MobileOperationalShell`, queue-first routes, project action sheet                                     |
| API         | Same workspace endpoints; lean payloads (`?view=mobile`)                                               |
| Backend     | Same assemblers                                                                                        |
| Migration   | None                                                                                                   |
| Performance | Minimal JS path; defer timeline code entirely                                                          |
| A11y        | 44px targets; screen reader group headings                                                             |
| Acceptance  | Cold open lands on Queue; desktop strip layout not used; approvals completable without cockpit intents |

---

# 13. Cross-cutting interaction design

| Concern        | Spec                                                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shortcuts      | `g h` home · `g q` queue · `/` search · `j/k` move · `Enter` open · `1/2/3` queue groups · `c` commitment (cockpit) · `w` log wait · Ctrl+Shift+P command palette |
| Loading        | Region skeletons (Overview / Queue / Portfolio / Changes / Context independent)                                                                                   |
| Empty          | Professional one-line empties; no mascots                                                                                                                         |
| Errors         | Typed: permission · not found · validation · provider unavailable — no engine names                                                                               |
| Preferences    | Density · collapsed queue groups · default portfolio sort — never grant permissions                                                                               |
| Reduced motion | Timeline animations off                                                                                                                                           |

---

# 14. API surface (workspace contract summary)

| Method   | Path                                                                       | Purpose                                  |
| -------- | -------------------------------------------------------------------------- | ---------------------------------------- |
| GET      | `/api/v1/projects/workspace/overview`                                      | Overview metrics + pressure statement    |
| GET      | `/api/v1/projects/workspace/queue`                                         | Three-group operational queue            |
| GET      | `/api/v1/projects/workspace/portfolio`                                     | Strip projections                        |
| GET      | `/api/v1/projects/workspace/changes`                                       | Portfolio Operational Changes            |
| GET      | `/api/v1/projects/:id/changes`                                             | Project Operational Changes              |
| GET      | `/api/v1/projects/:id/timeline`                                            | Roadmap model                            |
| GET      | `/api/v1/projects/:id/delivery-confidence`                                 | Score + factors (or fold into dashboard) |
| GET      | `/api/v1/projects/:id/pulse`                                               | Pulse sentences (or fold into dashboard) |
| CRUD     | `/api/v1/projects/:id/waiting`                                             | Waiting SoR                              |
| CRUD     | `/api/v1/projects/:id/commitments`                                         | Commitment SoR                           |
| existing | delivery-health, delivery-dashboard, milestones, risks, decisions, actions | Re-homed into cockpit intents            |
| existing | `GET /api/v1/context`                                                      | Context rail                             |

All endpoints: auth · authz · validation · audit · correlation ID · standard envelope (010).

---

# 15. Sidebar / module chrome (challenge)

**As-built sidebar:** Dashboard · All Projects · My Work · Tasks · Backlog · Sprints · Roadmap · Search · Help · Settings · Readiness.

**Recommend for 3.0 operational product:**

| Primary                      | Secondary (More / Command)                         |
| ---------------------------- | -------------------------------------------------- |
| Operational Workspace (home) | All Projects (admin list)                          |
| (Cockpit via selection)      | Tasks / Backlog / Sprints (legacy work-management) |
| Search                       | Readiness · Settings · Help                        |

**Why:** Entity sidebar recreates Jira’s “everything is a nav item” failure mode. Secondary access preserves power users without defining the product.

---

# 16. Benchmark stance

| Product                | Take                          | Leave                        |
| ---------------------- | ----------------------------- | ---------------------------- |
| Linear                 | Roadmap craft, keyboard speed | Issue-centric home           |
| Jira                   | Scale, filters                | Entity sprawl, tab tax       |
| Azure DevOps           | Enterprise gravity            | Hub sprawl                   |
| Monday                 | —                             | Colour noise, card addiction |
| Asana                  | My Tasks clarity              | Weak portfolio command       |
| MSP                    | Schedule seriousness          | Desktop-era UX               |
| Plane (current engine) | CE task engine                | Workbench-as-product         |

APZ Projects differentiates on: **Queue + Strips + Health/Confidence + Waiting + Pulse + Intent Cockpit + Composed Context**.

---

# 17. Decision register — Owner review (2026-08-06)

| ID                  | Status               | Decision                                                                                                                                   |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Workspace IA        | **APPROVED**         | Overview → Queue → Portfolio → Operational Changes → Context = canonical landing                                                           |
| **D8.1**            | **APPROVED**         | Cockpit intents: Overview · Delivery · Planning · Control · History; entity-first nav deprecated                                           |
| **D10**             | **APPROVED**         | Health ≠ Confidence; always displayed together                                                                                             |
| **D11**             | **APPROVED AMENDED** | Pulse ≤ **two sentences**; deterministic rules; no AI                                                                                      |
| **D12**             | **APPROVED AMENDED** | Waiting first-class; categories: Customer · Internal · Vendor · Governance · External Dependency; feeds Confidence                         |
| **D13**             | **APPROVED AMENDED** | Failure Consequence **optional** on commitments, milestones, decisions, operational dependencies; influences prioritisation and Confidence |
| **D14**             | **APPROVED**         | Single queue · three groups (Decisions · Attention · Waiting); inline actions                                                              |
| **D15**             | **APPROVED**         | Business Impact sort key                                                                                                                   |
| **D16**             | **APPROVED**         | Overview = metric band; reject KPI card grids                                                                                              |
| **D17**             | **APPROVED**         | Inline operational actions on queue                                                                                                        |
| **D18**             | **APPROVED**         | Sidebar demotes Tasks/Backlog/Sprints to secondary                                                                                         |
| **D19**             | **APPROVED**         | Queue-first mobile; no swipe-to-approve                                                                                                    |
| **D20**             | **APPROVED**         | Density modes; virtualise ≥100 projects                                                                                                    |
| Timeline            | **APPROVED**         | Roadmap-first; reject roadmap-as-list; Gantt optional                                                                                      |
| Operational Changes | **APPROVED**         | Never “Activity”; audit separate                                                                                                           |

**Engineering:** Do not implement until Owner authorises. Next design authority: **W003 — Project Lifecycle**.

---

# 18. Implementation sequencing (post Owner engineering authorisation only)

Dependency graph for engineers (not a programme):

1. Workspace APIs: overview · queue · portfolio projections
2. Home shell: Overview band + Queue + Strips + Changes + Context
3. Waiting + Commitment SoR (+ optional failureConsequence fields)
4. Cockpit Focus nav + Overview/Delivery/Control re-home
5. Timeline Planning intent
6. Mobile queue shell
7. Remove/redirect legacy dashboard identity

---

# 19. Explicit non-goals (this workshop)

- AI-authored Pulse
- Full programme hierarchy UX
- Notification delivery redesign
- Replacing Plane as task engine
- Pixel-perfect visual brand exploration beyond tokens

---

# 20. Approval gate

**Owner approved with amendments (2026-08-06).** This file is implementation authority for the Operational Workspace.

On conflict with annex `W002-ACTIONS-COMMITMENTS-WAITING-PULSE.md`, **this file wins**.

Lifecycle behaviour is specified in `W003-PROJECT-LIFECYCLE.md`.
