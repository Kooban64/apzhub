# APZ Projects 3.0 — Product Design Workshop 001

## Operational Overview & Project Cockpit

**Status:** DESIGN LOCK (CPO reviewed) — amendments absorbed; open items → W002  
**Standard:** Implementation-ready UX · enterprise productivity · not consumer  
**Benchmark:** Jira · Linear · Monday · ClickUp · MSP · Asana · Azure DevOps — improve, never copy  
**CPO review:** 2026-08-06 — see §11 Decision Log

---

# Working principle applied

Earlier workshop language (greetings, vivid emoji traffic lights as personality, “beautiful cards”) is **challenged** below where it conflicts with enterprise professionalism.

This document records **locked design decisions** and points open constructs to Workshop 002.

---

# 1. Information Architecture

## 1.1 Philosophy

Organise around **operational questions**, not entities.

| Question                                             | Home region               |
| ---------------------------------------------------- | ------------------------- |
| What is the state of my portfolio?                   | Operational Overview      |
| What requires immediate action from me?              | Immediate Actions         |
| Which projects need attention / are healthy?         | Portfolio                 |
| What changed since I last worked?                    | Operational Changes       |
| What enterprise context should I know before acting? | Context rail (persistent) |

Entity administration (members, templates, field config) is **secondary** — Command Palette / Settings — never the landing identity.

## 1.2 Navigation philosophy

| Rule                   | Detail                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Landing                | `/workspace/projects` = Operational Overview (not “Dashboard” table)                                         |
| Enter project          | Opens **Project Cockpit** (not tab zero of a CRUD shell)                                                     |
| Registers              | Milestones, risks, decisions, commitments — **in-cockpit surfaces**, not peer tabs that redefine the product |
| Deep links             | Preserve `/projects/{id}/risks` etc. as cockpit focus modes                                                  |
| Progressive disclosure | Overview → select action/project → cockpit focus → register detail drawer                                    |

## 1.3 Section hierarchy (Home)

```text
APZ Projects
├── Operational Overview          (portfolio state)
├── Immediate Actions             (action queue)
├── Portfolio                     (project operational strips)
├── Operational Changes           (decision-relevant deltas)
└── Context rail (right)          (Enterprise Context — composed)
```

---

# 2. Layout

## 2.1 Desktop (≥1280px) — Home

```text
┌─────────────────────────────────────────────────────────────┬──────────────────┐
│  APZ Projects · Operational Overview                        │                  │
│─────────────────────────────────────────────────────────────│  ENTERPRISE      │
│  [Operational Overview — portfolio metrics + pressure]      │  CONTEXT         │
│─────────────────────────────────────────────────────────────│                  │
│  Immediate Actions                              [Filter ▾]  │  Composed from   │
│  · typed action rows (severity · type · project · due)     │  owning products │
│─────────────────────────────────────────────────────────────│                  │
│  Portfolio                                      [Sort ▾]    │  Expand sections │
│  · operational strips (dense, scannable)                    │  as needed       │
│─────────────────────────────────────────────────────────────│                  │
│  Operational Changes                                        │                  │
│  · meaningful deltas since last visit                       │                  │
└─────────────────────────────────────────────────────────────┴──────────────────┘
```

**Why regions exist**

| Region              | Why                                                                          |
| ------------------- | ---------------------------------------------------------------------------- |
| Overview            | Executives and PMs need portfolio state without opening projects             |
| Immediate Actions   | Separates “act now” from “browse portfolio” — critical for enterprise triage |
| Portfolio           | Scannable set of projects with operational truth at a glance                 |
| Operational Changes | Answers “what moved?” without becoming an audit log                          |
| Context rail        | Pre-action enterprise awareness — never duplicates project SoR               |

## 2.2 Challenge: Cards vs table vs strips

| Option                 | Pros                                                                    | Cons                                                                        | Verdict                |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------- |
| Consumer cards         | Glanceable                                                              | Poor for 30–80 projects; wasteful vertical space; “pretty” over operational | **Reject as default**  |
| Classic data table     | Dense                                                                   | Reads as admin CRUD; weak storytelling                                      | **Reject as identity** |
| **Operational strips** | Dense + narrative columns (health, progress, next commitment, pressure) | Requires disciplined columns                                                | **Recommend**          |

**Decision D1 — Portfolio presentation:** Default = **operational strips** (one row/strip per project). Optional compact density toggle. Card gallery is **not** the enterprise default (available later only if evidence demands).

## 2.3 Tablet (768–1279px)

- Context rail collapses to **Context** icon → slide-over
- Overview + Immediate Actions stack above Portfolio
- Strips keep all columns via horizontal scroll on strip body **or** hide lowest-priority column (Customer dependency) first

## 2.4 Mobile (<768px)

**Different product surface** — not a shrunk desktop.

```text
What needs action
─────────────────
[Action queue only — typed, severity-sorted]

Portfolio (secondary tab)
─────────────────
Strips, health + next commitment only

Context
─────────────────
On demand when opening an action/project
```

**Decision D2 — Mobile:** Primary mobile IA = Immediate Actions. Portfolio secondary. Full cockpit is desktop/tablet.

---

# 3. Operational Overview (executive summary)

## 3.1 Challenge: greeter / emoji personality

**Reject:** “Good morning {name}” and emoji-as-decoration.  
**Recommend:** Neutral operational header with **as-of** timestamp and portfolio pressure.

### Recommended presentation

```text
Operational Overview                          As of 18:02 · Local
────────────────────────────────────────────────────────────────
Portfolio health     Attention required     Commitments due (7d)     Open decisions
  12 healthy            3 critical               5                         2
   4 watch              1 blocked
   2 critical
```

Use **status labels + counts**, not rainbow chrome. Severity uses design-system semantic tokens (destructive / warning / success / muted) — restrained.

Optional single-line **pressure statement** (system-generated, factual):

```text
3 projects require intervention · 2 approvals waiting on you · Velocity −18% vs prior week (3 projects)
```

**Decision D3 — Overview tone:** Institutional, metric-led, no greeting, no gamification.

## 3.2 Metrics (v1)

| Metric                          | Source (engineering)                                                |
| ------------------------------- | ------------------------------------------------------------------- |
| Portfolio health distribution   | Aggregate delivery health across accessible projects                |
| Attention required              | Count of projects health red/amber **or** with Immediate Action     |
| Commitments due (7d)            | Milestones + commitment due dates in window                         |
| Open decisions awaiting outcome | Decisions register incomplete / pending                             |
| Approvals waiting on you        | Workflow bridge (when available) — show “—” if provider unavailable |

---

# 4. Immediate Actions (operational action queue)

## 4.1 Purpose

Professional queue of **work that needs the current user** (or their role), not a notification inbox.

## 4.2 Action types (discriminated)

| Type                  | Meaning                                                 |
| --------------------- | ------------------------------------------------------- |
| `approval`            | Governance / workflow approval waiting on user          |
| `risk`                | Risk requiring owner response / escalation              |
| `overdue_commitment`  | Commitment or milestone past due                        |
| `blocked_commitment`  | Work blocked; user is owner or waiter                   |
| `governance`          | Policy / obligation action from Context/Law composition |
| `customer_dependency` | External/customer response outstanding (when modelled)  |

## 4.3 Ordering logic (recommended)

1. **Blocking others** (I am the blocker)
2. **Approvals waiting on me** (time-bound)
3. **Critical risk** owned by me
4. **Overdue commitment** owned by me
5. **Blocked commitment** where I am waiter
6. **Governance actions**
7. **Customer dependencies**
8. Same tier → earlier due date → higher project criticality

**Decision D4 — Queue ordering:** Blocker-first, then time-bound approvals, then severity/due.

## 4.4 Row anatomy

```text
[Severity] [Type]  Title                              Project        Due      ▶
 Critical   Risk   Vendor API capacity                 Digital Bank   Today
```

Click → opens **Project Cockpit** with focus on that object (risk drawer / commitment / approval).

## 4.5 Empty / loading / error

| State   | Behaviour                                                                    |
| ------- | ---------------------------------------------------------------------------- |
| Empty   | “No actions require you. Portfolio status is above.” + link to Portfolio     |
| Loading | Skeleton rows (3) — no spinner-only                                          |
| Error   | Inline error + Retry; do not blank the whole Home                            |
| Partial | Show available types; note “Approvals unavailable” if Workflow provider down |

---

# 5. Portfolio (project operational strips)

## 5.1 Strip columns (left → right)

| Column          | Content                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| Project         | Name + identifier                                                        |
| Health          | Healthy / Watch / Critical (token colour, text label mandatory)          |
| Progress        | Thin bar + % (derived: milestone completion or agreed formula)           |
| Next commitment | Name + date                                                              |
| Pressure        | Compact chips: Risks · Decisions · Waiting · Blocked (counts only if >0) |
| Changed         | Relative time of last meaningful operational change                      |

Click strip → Project Cockpit.

## 5.2 Sort / filter

Default sort: **Attention score** (critical first), then next commitment date.  
Filters: Health · Owner (me / all) · Has actions.

**Decision D5 — Portfolio default sort:** Attention, not alphabetical.

---

# 6. Enterprise Context (right rail)

## 6.1 What belongs here

Composed **references** from owning products: Knowledge, Law/Governance, Documents, Support, Workflow (related), Projects (related siblings only).

## 6.2 What stays inside the project (not Context)

Operational SoR owned by Projects: commitments, milestones, risks, decisions, delivery health, project activity.

## 6.3 Visibility

| Immediately visible                  | Expanded on demand      |
| ------------------------------------ | ----------------------- |
| Section headers with counts          | Full fragment lists     |
| Critical / attention fragments       | Info-severity fragments |
| Provider unavailable / empty honesty | History                 |

**Decision D6 — Context rail:** Persistent on desktop Home + Cockpit; composed only; never copies milestone/risk payloads as Context truth.

---

# 7. Operational Activity / Changes

## 7.1 Challenge: audit-log thinking

**Reject** “User X updated field Y” as primary feed.

**Recommend** decision-relevant events only:

| Include                        | Exclude                               |
| ------------------------------ | ------------------------------------- |
| Milestone slipped / completed  | Cosmetic field edits                  |
| Risk elevated to critical      | Routine task comment spam             |
| Approval granted / rejected    | Login events                          |
| Commitment blocked / unblocked | Noise from automation without outcome |
| Health moved red ← amber/green |                                       |

**Decision D7 — Activity:** “Operational Changes” = decision-relevant deltas since `lastVisitAt` (per user preference store).

Home shows **portfolio-scoped** changes. Cockpit bottom shows **project-scoped** changes.

---

# 8. Project Cockpit

## 8.1 Challenge: tab-based experience

**Reject tabs as product identity** (current as-built).  
Tabs force entity browsing; they hide “what should I do next in _this_ project?”

**Recommend:** **Operational canvas + focus modes**

```text
┌──────────────────────────────────────────────┬─────────────────┐
│ Project · Digital Banking        [Healthy]   │ ENTERPRISE      │
│ Next commitment · Payment go-live · 14 Aug   │ CONTEXT         │
├────────────┬─────────────────────────────────┤                 │
│  FOCUS     │  OPERATIONAL CANVAS             │                 │
│  NAV       │                                 │                 │
│            │  Now                             │                 │
│  Now       │  · Immediate actions (project)   │                 │
│  Timeline  │  · Blockers                      │                 │
│  Mile-     │  · Approvals                     │                 │
│  stones    │                                 │                 │
│  Commit-   │  Trajectory                      │                 │
│  ments     │  · Next 3 commitments            │                 │
│  Risks     │  · Milestone confidence          │                 │
│  Decisions │                                 │                 │
│  More…     │  Pressure                        │                 │
│            │  · Risks · Decisions · Waiting   │                 │
├────────────┴─────────────────────────────────┤                 │
│ Operational Changes (project)                                  │
└──────────────────────────────────────────────┴─────────────────┘
```

| Region                   | Role                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Header                   | Identity, health, next commitment, primary actions (New commitment · Escalate risk · Record decision) |
| Focus nav (left, ~200px) | Modes — not equal “tabs of tables”; **Now** is default                                                |
| Canvas                   | Mode content                                                                                          |
| Context rail             | Unchanged principle                                                                                   |
| Bottom changes           | Project operational deltas                                                                            |

**Decision D8 — Cockpit IA:** Replace tab strip with **Focus nav + Operational canvas**. Deep links map to focus modes (`/risks` → Risks focus).

## 8.2 Focus modes

| Mode              | Canvas content                                                            |
| ----------------- | ------------------------------------------------------------------------- |
| **Now** (default) | Project action queue · blockers · approvals · today/this-week commitments |
| **Timeline**      | Roadmap-first trajectory (Linear-class); Gantt as explicit toggle         |
| **Milestones**    | Milestone strips → open **Milestone surface** (Context-rich)              |
| **Commitments**   | Commitment list/board toggle (design Commitments workshop)                |
| **Risks**         | Risk register operational view                                            |
| **Decisions**     | Decision register                                                         |
| **More**          | Delivery metrics, people, settings — progressive disclosure               |

## 8.3 Milestone presentation (in cockpit)

Not a plain record row as the end state. Selecting a milestone opens a **Milestone surface** (drawer or full canvas panel):

Status · Owner · Due · Confidence · Dependencies · Approvals · Documents (refs) · Risks · Knowledge · Governance · Support — **composed**, Projects owns only project-side fields.

## 8.4 Commitment presentation (placeholder until Commitments workshop)

v1 mapping for build: Commitment UI over tasks + action items with required fields: owner, statement, due, waiters, failure consequence (failure consequence may be v1.1 if design incomplete).

## 8.5 Risk / decision presentation

Keep Wave A semantics; present as **operational registers inside focus modes**, with severity sorting and owner filters — not buried behind equal tabs.

## 8.6 Timeline experience

| Default     | Roadmap: milestones + commitments on a horizontal time axis; zoom/pan; dependency edges; critical path highlight |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Advanced    | Gantt toggle for date drag precision                                                                             |
| Interaction | Click milestone/commitment → surface; drag to reschedule if `projects.manage`                                    |

**Decision D9 — Timeline:** Roadmap-first; Gantt secondary.

---

# 9. Interaction Design (cross-cutting)

## 9.1 Keyboard

| Shortcut       | Action                                    |
| -------------- | ----------------------------------------- |
| `g then h`     | Go Home (Operational Overview)            |
| `g then p`     | Focus Portfolio                           |
| `/`            | Filter Immediate Actions / Portfolio      |
| `j` / `k`      | Move selection in queues/strips           |
| `Enter`        | Open selection                            |
| `Esc`          | Close drawer / clear selection            |
| `c`            | New commitment (in cockpit, if permitted) |
| `Ctrl+Shift+P` | Command Palette (platform)                |

## 9.2 Loading

- Region-level skeletons (Overview, Actions, Portfolio independent)
- Context rail loads independently; failure does not block Home

## 9.3 Empty states

Professional, actionable, no illustration mascots.

## 9.4 Errors

Typed: permission · not found · provider unavailable · validation. No engine names.

## 9.5 Accessibility

- Text labels on all severity (not colour alone)
- Landmarks: `banner`, `main`, `complementary` (Context), `navigation` (focus nav)
- Live region for Immediate Actions count changes (polite)
- WCAG AA contrast; focus rings on strips/rows
- Reduced motion: disable timeline animation

## 9.6 Responsive

Per §2. Context slide-over on tablet; mobile = Actions-first.

---

# 10. Engineering Assessment (by section)

| Section              | Reuse                                              | Redesign               | New                       | Backend / API                                                   | Complexity | Migration                         |
| -------------------- | -------------------------------------------------- | ---------------------- | ------------------------- | --------------------------------------------------------------- | ---------- | --------------------------------- |
| Operational Overview | Health aggregate patterns                          | Dashboard view         | Overview metrics strip    | **New** `GET .../attention` or `/overview` aggregating health   | M          | Replace `ProjectsDashboardView`   |
| Immediate Actions    | Delivery risks/actions; Workflow Context fragments | —                      | Action queue UI + ranking | Attention API includes `actions[]`                              | M–L        | None                              |
| Portfolio strips     | listProjects + delivery dashboard fields           | List table             | Strip component           | Batch health/dashboard                                          | M          | List remains at `/list` for admin |
| Operational Changes  | Activity contract                                  | —                      | Changes feed UI           | Wire `listProjectActivity` + filter rules; lastVisit preference | M          | —                                 |
| Context rail         | `EnterpriseContextPanel`                           | Minor density          | —                         | Existing compose                                                | S          | Keep                              |
| Cockpit shell        | WorkspaceFrame                                     | **Tab IA → Focus nav** | Cockpit layout            | Routing map tabs→focus                                          | M          | Aliases for old tab URLs          |
| Now mode             | Delivery dashboard panel                           | Compose into Now       | —                         | Existing                                                        | S–M        | —                                 |
| Timeline             | —                                                  | Roadmap view rewrite   | Timeline viz              | Milestone/commitment dates                                      | L–XL       | Old roadmap route redirects       |
| Milestone surface    | Milestone API                                      | Rich surface           | Drawer                    | Context by milestone focus (future focus type optional)         | M          | —                                 |
| Mobile actions       | —                                                  | —                      | Mobile Actions view       | Same Attention API                                              | L          | —                                 |

---

# 11. Decision Log (CPO)

| ID     | Status                 | Decision                                                                                                                                       |
| ------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **D1** | **APPROVED**           | Portfolio = operational strips                                                                                                                 |
| **D2** | **APPROVED**           | Mobile primary = Immediate Actions                                                                                                             |
| **D3** | **APPROVED**           | Overview = institutional metrics; no greetings/gamification                                                                                    |
| **D4** | **APPROVED AMENDED**   | Queue priority: Business Impact → Blocked Work → Waiting For Me → Due Today → Approvals → Upcoming. Detail in W002.                            |
| **D5** | **APPROVED AMENDED**   | Default sort = Attention. User may sort by: Health · Attention · Customer · Name · Owner · Programme · Recently Changed. Never permanent-only. |
| **D6** | **APPROVED**           | Context rail composed only; project SoR stays in canvas                                                                                        |
| **D7** | **APPROVED AMENDED**   | Surface name = **Operational Changes**. Every entry must answer “Why should I care?”                                                           |
| **D8** | **APPROVED DIRECTION** | Focus nav + canvas retained. Labels must be **operational intent**, not entity names. Revised proposal in W002.                                |
| **D9** | **APPROVED**           | Timeline = roadmap-first; Gantt secondary                                                                                                      |

## First-class constructs required before engineering (→ W002)

| Construct                     | Intent                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------- |
| **Project Pulse**             | Rule-generated human summary of project state (not AI)                            |
| **Project Confidence**        | Forward-looking score; distinct from Health (today)                               |
| **Waiting**                   | First-class wait state with party (Customer, Vendor, Finance, Approval, Legal, …) |
| **Immediate Actions (split)** | Requires My Decision · Requires My Attention · Waiting On Others                  |

---

# 12. What this improves vs market

| Product tendency | APZ Projects stance       |
| ---------------- | ------------------------- |
| Jira             | Issue-centric navigation  | Outcome/attention-centric landing                                |
| Monday           | Colourful board noise     | Institutional density                                            |
| Asana            | My Tasks as product heart | Portfolio + commitments + Context                                |
| Linear           | Excellent timeline/issues | Adopt roadmap craft; add enterprise Context + delivery registers |
| Azure DevOps     | Hub sprawl                | Single cockpit canvas                                            |
| Plane            | Entity workbench          | Operational command centre                                       |

---

# 13. Continues in Workshop 002

**Authority document:** [`W002-OPERATIONAL-WORKSPACE.md`](./W002-OPERATIONAL-WORKSPACE.md) — Operational Workspace (implementation specification pending Owner approval).

Engineering does **not** begin until that document is approved.
