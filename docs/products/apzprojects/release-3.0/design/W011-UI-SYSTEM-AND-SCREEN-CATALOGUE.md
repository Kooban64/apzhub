# APZ Projects Release 3.0

# Product Design Workshop 011 — User Interface System & Screen Catalogue

**Document ID:** W011-UI-SYSTEM-AND-SCREEN-CATALOGUE  
**Status:** APPROVED WITH AMENDMENTS (Owner review 2026-08-06) — authoritative UI specification  
**Mode:** UI specification · engineering authorised against W002–W011  
**Depends on:** W002–W010 APPROVED WITH AMENDMENTS · Design System (006/022/028) · Shell (005/016)  
**Authority:** Authoritative UI specification for APZ Projects Release 3.0. Product Bible W002–W011 accepted as implementation authority.

---

# 0. Objective

Transform the approved operational model into a **complete implementation-ready UI specification**: every screen, dialog, drawer, wizard, table, strip, panel, action bar and responsive layout required to build Release 3.0.

This workshop does **not** reopen product behaviour. If UI and behaviour conflict, **W002–W010 win**; amend those workshops explicitly.

---

# 1. UI system foundations

## 1.1 Principles

| #    | Rule                                                                             |
| ---- | -------------------------------------------------------------------------------- |
| UI1  | Tokens only — no hardcoded colours/spacing (006)                                 |
| UI2  | shadcn/ui + Tailwind in `@apzhub/ui`; Lucide icons only                          |
| UI3  | Enterprise density; Comfortable / Compact / Dense modes (portfolio + tables)     |
| UI4  | Semantic status always has **text label** + token colour                         |
| UI5  | Identical object navigation chrome (W009 NP-D13)                                 |
| UI6  | No consumer patterns: greetings, emoji reactions, FABs-as-identity, gamification |
| UI7  | WCAG AA; keyboard parity for all primary actions                                 |
| UI8  | Region-level loading skeletons; partial failure honesty                          |
| UI9  | Context rail = `complementary`; never duplicates SoR tables                      |
| UI10 | Quick Action + Command Palette + Search always available in Projects shell       |

## 1.2 Shell chrome (Projects module)

```text
┌─ APZHUB Shell: Header · Activity Bar · Sidebar · Status ─────────────┐
│ ┌─ Projects top bar: title · Quick Action · Search · Palette hint ─┐ │
│ │ ┌─ Main ──────────────────────────────────┬─ Context (lg+) ─────┐ │ │
│ │ │                                         │ Enterprise Context  │ │ │
│ │ │                                         │                     │ │ │
│ │ └─────────────────────────────────────────┴─────────────────────┘ │ │
│ └─ optional Status / selection bar ─────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
```

- Context: `lg:w-72` sticky; tablet/mobile → icon → sheet
- Quick Action: persistent control in Projects top bar (every screen)
- Density control: Portfolio / registers / admin tables

## 1.3 Shared component catalogue (Projects)

| Component                                                        | Use                                               |
| ---------------------------------------------------------------- | ------------------------------------------------- |
| `MetricBand`                                                     | Overview / Scorecard rows                         |
| `OperationalStrip`                                               | Portfolio / hierarchy / commitment rows           |
| `QueueGroup` · `QueueRow`                                        | Operational Queue                                 |
| `PulseText`                                                      | ≤2 sentences                                      |
| `HealthBadge` · `ConfidenceMeter` · `ComplianceBadge`            | Always co-located when on project header          |
| `PressureChips`                                                  | Risks · Decisions · Waiting · Blocked             |
| `FocusNav`                                                       | Five intents                                      |
| `ObjectHeader`                                                   | Universal object chrome                           |
| `ObjectTimeline`                                                 | Unified Communication Timeline                    |
| `DiscussionPanel`                                                | Anchored conversation                             |
| `EvidenceList`                                                   | Completion evidence                               |
| `ExceptionSeverityBadge`                                         | Advisory→Critical                                 |
| `ForecastPanel`                                                  | Outcome · confidence · factors · actions          |
| `ResponsibilityMatrix`                                           | Gap-highlight grid                                |
| `ReviewPackView`                                                 | Immutable snapshot sections                       |
| `EmptyState` · `ErrorState` · `SkeletonRegion`                   | Standard                                          |
| `ConfirmDialog` · `WaiverDialog` · `BulkConfirmDialog`           | Guards                                            |
| `InitiateWizard` · `CloseProjectWizard` · `MeetingOutcomeWizard` | Steppers                                          |
| `Drawer`                                                         | Object create/edit / milestone surface            |
| `DataTable` (TanStack)                                           | Admin / matrix / reports — not portfolio identity |
| `CommandPalette` · `ShortcutHelp`                                | Platform + Projects commands                      |

All new shared primitives → `component.yaml` + Storybook (028) when promoted to `@apzhub/ui`.

## 1.4 Status & indicator vocabulary (UI)

| Indicator          | Values (labels)                                                      |
| ------------------ | -------------------------------------------------------------------- |
| Health             | Healthy · Watch · Critical                                           |
| Confidence         | High · Medium · Low + score                                          |
| Compliance         | Compliant · Advisory · Non-Compliant · Critical                      |
| Exception severity | Advisory · Minor · Major · Critical                                  |
| Capacity / load    | Sufficient · Constrained · Critical / Normal · Elevated · Overloaded |
| Forecast outcome   | On track · At risk · Off track                                       |
| Lifecycle          | Draft · Initiating · Active · On Hold · Closing · Closed · Archived  |

Never colour-only.

## 1.5 Responsive breakpoints

| Name    | Width    | Behaviour                                                                |
| ------- | -------- | ------------------------------------------------------------------------ |
| Mobile  | <768     | Queue-first; sheets; no strip portfolio primary                          |
| Tablet  | 768–1279 | Context sheet; stacked bands; intents as select or left rail collapsible |
| Desktop | ≥1280    | Full L/main/Context; Focus nav visible                                   |

---

# 2. Screen index

| ID   | Screen                           | Route (canonical)                                |
| ---- | -------------------------------- | ------------------------------------------------ |
| S-01 | Operational Workspace            | `/workspace/projects`                            |
| S-02 | Portfolio Scorecard              | `/workspace/projects/portfolio`                  |
| S-03 | Portfolio Workspace              | `/workspace/projects/portfolio/workspace`        |
| S-04 | Portfolio Timeline               | `/workspace/projects/portfolio/timeline`         |
| S-05 | Initiative Cockpit               | `/workspace/projects/portfolio/initiatives/{id}` |
| S-06 | Programme Cockpit                | `/workspace/projects/portfolio/programmes/{id}`  |
| S-07 | Project Cockpit                  | `/workspace/projects/{id}`                       |
| S-08 | Object Surface (universal)       | `...?...&obj={type}:{id}`                        |
| S-09 | Initiate Project Wizard          | `/workspace/projects/new`                        |
| S-10 | Close Project Wizard             | modal on project                                 |
| S-11 | Operational Review               | `/workspace/projects/.../reviews/{id}`           |
| S-12 | Review Calendar                  | `.../reviews`                                    |
| S-13 | Reports Library                  | `.../reports`                                    |
| S-14 | Report Viewer                    | `.../reports/{key}`                              |
| S-15 | Teams Directory                  | `/workspace/projects/teams`                      |
| S-16 | Team Surface                     | `/workspace/projects/teams/{id}`                 |
| S-17 | Admin Dashboard                  | `/workspace/projects/admin`                      |
| S-18 | Admin Registries                 | `/workspace/projects/admin/{registry}`           |
| S-19 | Policy Simulation                | modal/drawer on publish                          |
| S-20 | Search Results                   | `/workspace/projects/search`                     |
| S-21 | Mobile Queue Shell               | same routes, mobile IA                           |
| S-22 | All Projects (admin list)        | `/workspace/projects/list`                       |
| S-23 | Secondary: Tasks/Backlog/Sprints | `/workspace/projects/{tasks\|backlog\|sprints}`  |
| S-24 | Settings / Help                  | existing patterns under More…                    |

**Overlays (global):** O-01 Command Palette · O-02 Quick Action · O-03 Shortcut Help · O-04 Confirm · O-05 Waiver · O-06 Bulk Confirm · O-07 Create/Edit Drawer · O-08 Context Sheet · O-09 Continuity Case · O-10 Meeting Outcome · O-11 Productivity Session picker · O-12 Evidence capture · O-13 Exception conclude · O-14 Checkpoint submit · O-15 Re-baseline · O-16 Delegate · O-17 Announcement / Notice editors

---

# 3. S-01 Operational Workspace

## Layout (desktop)

```text
[Projects top bar: APZ Projects | Quick Action | Search]
┌────────────────────────────────────────────┬────────────┐
│ MetricBand — Operational Overview          │ Context    │
│ Queue: Decisions | Attention | Waiting     │            │
│ Portfolio OperationalStrips + sort/filter  │            │
│ Operational Changes feed                   │            │
└────────────────────────────────────────────┴────────────┘
```

| Region     | Components                               | Actions                               |
| ---------- | ---------------------------------------- | ------------------------------------- |
| MetricBand | counts · pressure statement · as-of      | Drill to filtered strips / queue      |
| Queue      | `QueueGroup`×3 · `QueueRow` · inline act | Decide · Open · j/k · 1/2/3           |
| Strips     | `OperationalStrip` virtualised           | Open cockpit · density · sorts (W002) |
| Changes    | feed rows                                | Open object                           |
| Context    | `EnterpriseContextPanel`                 | Expand sections                       |

**States:** empty portfolio · empty queue (`None` per group) · partial provider · loading skeletons per region · error retry.  
**Mobile:** → S-21.  
**A11y:** regions named; queue listbox.

---

# 4. S-02 Portfolio Scorecard (executive default)

Single composition — not KPI card grid:

Rows: Health (distribution + Critical Projects) · Confidence (weighted + contributors) · Strategic Objectives · Delivery Trend · Exceptions · Decisions · Forecast Outlook.

Each row: label · primary figure · secondary detail · **drill control**.  
Header: portfolio name · as-of · Quick Action · link “Open Portfolio Workspace”.

**Tablet/Desktop:** full band stack. **Mobile:** stacked rows; Critical Projects list primary.

---

# 5. S-03 Portfolio Workspace

Same grammar as S-01 scoped to portfolio: Overview band · Portfolio Queue · Hierarchy strips (collapsible tree) · Changes · Context.  
Hierarchy strip columns per W005. Expand/collapse tree semantics.

---

# 6. S-04 Portfolio Timeline

Full-width roadmap canvas: swimlanes Initiatives → Programmes → Projects; major milestones; dependency edges; today marker; filters (objective · classification · health).  
Toolbar: zoom · filter · Gantt toggle (secondary).  
Click node → cockpit. List fallback table for a11y / reduced motion.

---

# 7. S-05 / S-06 / S-07 Cockpits (unified)

## Frame

```text
ObjectHeader: Name | Lifecycle | Health | Confidence | Compliance | Pulse
Next commitment / next milestone | primary ActionBar
┌─ FocusNav ─┬─ Intent Canvas ─────────────────────┬─ Context ─┐
│ Overview   │                                     │           │
│ Delivery   │                                     │           │
│ Planning   │                                     │           │
│ Control    │                                     │           │
│ History    │                                     │           │
│ More…      │                                     │           │
└────────────┴─────────────────────────────────────┴───────────┘
```

### Overview canvas

Pulse · ForecastPanel (14d) · project/programme queue slices · Waiting summary · Capacity/Team Health (if applicable) · pinned Notices · Continuity alert banner.

### Delivery canvas

Commitment strips · Waiting register · blockers · Team roster (project) / consolidated roster (programme).  
ActionBar: New commitment · Log wait · Assign.

### Planning canvas

Delivery Timeline · Milestones strips · Dependencies · Baseline variance panel.  
ActionBar: New milestone · Log dependency · Request re-baseline.

### Control canvas

Risks · Decisions · Checkpoints · Exceptions · Stakeholders · Escalation path · Responsibility Matrix · Continuity cases.  
ActionBar: Record decision · Raise risk · Raise exception · Submit checkpoint.

### History canvas

Segments: Operational Changes | Communication Timeline (scope). Filters.

### More…

Settings · People admin · Tasks/Backlog/Sprints (secondary) · Export.

**Programme/Initiative:** same FocusNav; canvas data rolled up per W005.  
**Banners:** Draft/Initiating checklist · On Hold · Closing checklist · Read-only Closed/Archived.

---

# 8. S-08 Universal Object Surface

Opened as **drawer (default)** or full panel from strip/search/timeline.

```text
ObjectHeader (type icon · title · status · accountable)
Tabs/Segments: Details | Timeline | Discussion | Links | Evidence*
Body: type-specific fields
Footer ActionBar: primary · secondary · overflow
```

| Type        | Details highlights                                       | Primary actions                           |
| ----------- | -------------------------------------------------------- | ----------------------------------------- |
| Commitment  | statement · owner · due · waiters · consequence · status | Complete (+evidence) · Log wait · Discuss |
| Milestone   | dates · baseline var · confidence · exit criteria        | Achieve (+evidence) · Slip · Discuss      |
| Decision    | framing · maker · due · outcome                          | Decide · Defer · Discuss                  |
| Risk        | severity · mitigation · owner                            | Escalate · Close · Discuss                |
| Exception   | severity · type · outcome                                | Conclude · Escalate                       |
| Waiting     | category · since · SLA · chase                           | Resolve · Escalate                        |
| Dependency  | from/to · kind · status                                  | Mark broken · Resolve                     |
| Checkpoint  | status · workflow binding                                | Submit · Waive                            |
| Review      | pack + outcomes                                          | Facilitate · Complete                     |
| Note/Notice | body · version                                           | Edit · Withdraw                           |

Identical open/close/escape/focus behaviour for all types (NP-D13).

---

# 9. Wizards

## S-09 Initiate Project

Stepper full page: Identity → Delivery model → Governance & template → Baseline intent → Confirm.  
Actions: Create Draft | Create & start Initiating | Cancel.  
Validation per W003 gate fields. Mobile: Draft-lite path.

## S-10 Close Project

Modal stepper: Outcome type → Summary → Checklist readiness → Waivers → Confirm.  
Blocks if gate fails; shows gap list with deep links.

## O-10 Meeting Outcome

Modal: Summary · attendees · capture Commitments/Decisions/Risks/Actions → Create.  
Discourages notes-only (warning if zero outcomes).

## O-15 Re-baseline

Modal: reason · diff preview · approval/Decision bind → Submit.

---

# 10. Reviews & reports

## S-11 Operational Review

Layout: header (type · scope · period · status) · Executive Summary (1 page) · Pack sections (drillable) · Outcomes editor · Attendees · Complete.  
Completed = read-only snapshot.

## S-12 Review Calendar

Calendar/list of scheduled + past reviews; create schedule; open review.

## S-13 / S-14 Reports

Library cards/table of catalogue (W008 §6). Viewer: filters · metric band/table · drill · export PDF/CSV · “How calculated”.

---

# 11. Teams

## S-15 Directory

Table/strips: Team · lead · member count · Team Health · Capacity. Create team.

## S-16 Team Surface

Header Health/Capacity · Members (date-effective) · Assignments · Skills tags · Context · Resource forecast.

---

# 12. Administration

## S-17 Admin Dashboard

Admin MetricBand + panels (W010 §8.3). Not Scorecard clone — labels “Administration”.

## S-18 Registries

DataTables for: Profiles · Operational Policies · Roles · Templates · Governed Searches · Delegations · Retention · Portfolio admin · Exception policy · Maturity.  
Row → editor drawer. Publish actions → O-19 Simulation first.

## S-19 Policy Simulation

Modal: impact counts · sample affected · conflicts · Confirm publish / Cancel.

---

# 13. Search & productivity overlays

## S-20 Search Results

Facets left/top · result list with explainability fields · open in context.

## O-01 Command Palette

Grouped: Actions · Go to · Create · Cross-product. Ctrl+Shift+P.

## O-02 Quick Action

Menu/popover: create types list → opens O-07 with Intelligent Defaults from context.

## O-03 Shortcut Help

`?` overlay — catalogue from W009.

## O-11 Productivity Session

Picker: start/resume session types; shows scope snapshot.

---

# 14. S-21 Mobile Queue Shell

```text
Bottom nav: Queue | Changes | More
Queue: Decisions → Attention → Waiting (collapse)
Row tap → action sheet (Decide / Open / Ack)
Project sheet: Pulse · Health · Confidence · Compliance · primary act
Context: on demand
```

No portfolio strips / timeline / admin on mobile primary.

---

# 15. Secondary screens

## S-22 All Projects

Admin `DataTable` — not product home. Columns: name · lifecycle · health · confidence · compliance · owner · programme.

## S-23 Tasks / Backlog / Sprints

Existing work-management tables under More… — visually secondary; banner “Execution tools — Commitments remain operational SoR”.

## S-24 Settings / Help

Org/project settings forms; help articles via Knowledge Context link.

---

# 16. Dialogs & drawers (detail)

| Overlay                  | Purpose                | Critical UX                               |
| ------------------------ | ---------------------- | ----------------------------------------- |
| O-04 Confirm             | Destructive/lifecycle  | Typed confirm when Critical               |
| O-05 Waiver              | Gate skip              | Reason required · SoD check               |
| O-06 Bulk Confirm        | Bulk ops               | Count · impact · audit notice             |
| O-07 Create/Edit         | Object forms           | Defaults · validation · consequence field |
| O-08 Context Sheet       | Mobile/tablet Context  | Same sections as rail                     |
| O-09 Continuity          | Key person unavailable | Affected lists · reassign CTA             |
| O-12 Evidence            | Add evidence types     | Required per policy                       |
| O-13 Exception conclude  | Outcome enum           | Severity retained                         |
| O-14 Checkpoint submit   | Workflow handoff       | Unavailable honesty                       |
| O-16 Delegate            | Create delegation      | Time/scope required                       |
| O-17 Announcement/Notice | Editors                | Validity · audience · version             |

---

# 17. Action bars (patterns)

| Pattern      | Contents                                       |
| ------------ | ---------------------------------------------- |
| Workspace    | Quick Action · Search · Density · Filter       |
| Cockpit      | Intent-primary actions · overflow More         |
| Object       | Primary status transition · Discuss · overflow |
| Queue inline | 1–2 verbs max · Open                           |
| Review       | Capture commitment · Complete review           |
| Admin        | Create · Publish (→ simulate) · Export         |

Permission-hidden, not disabled-tease (except explainable SoD disable with tooltip).

---

# 18. Tables vs strips (when to use)

| Use strips                                      | Use tables                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| Portfolio · hierarchy · commitments in Delivery | Admin registries · Responsibility Matrix · report registers · All Projects |

---

# 19. Interaction states (global)

| State     | UI                                     |
| --------- | -------------------------------------- |
| Loading   | `SkeletonRegion` per band              |
| Empty     | One-line institutional + optional CTA  |
| Error     | Typed message + Retry; no engine names |
| Forbidden | Hide surface or full-page ErrorState   |
| Stale     | Subtle as-of + refresh                 |
| Read-only | Banner + controls removed              |
| Partial   | Inline “Approvals unavailable” etc.    |

---

# 20. Cross-product UI

Palette / Context links open APZHUB product routes in shell.  
Landing shows product name + “Back to {Project}”. No backend branding.

---

# 21. Engineering mapping (UI)

| UI area                     | Build notes                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------- |
| Shell reshape               | `module.yaml` nav + Projects top bar                                                  |
| S-01                        | Replace `ProjectsDashboardView`                                                       |
| Cockpit                     | Replace tabbed `ProjectDetailView` with FocusNav frame                                |
| Strips / Queue / MetricBand | New components in apps/web → promote to ui                                            |
| Object surface              | Shared drawer router by type                                                          |
| Wizards                     | Initiate replaces `ProjectCreateView`                                                 |
| Context                     | Reuse `EnterpriseContextPanel`                                                        |
| Admin                       | New admin routes permission-gated                                                     |
| Mobile                      | Route-aware layouts / `useMedia`                                                      |
| Storybook                   | All shared components + key composites                                                |
| Playwright                  | S-01 · Queue act · Cockpit intents · Initiate gate · Review complete · Search explain |

---

# 22. Screen acceptance matrix (extract)

| ID        | Must demonstrate                                                   |
| --------- | ------------------------------------------------------------------ |
| S-01      | Overview→Queue→Strips→Changes→Context; Health+Confidence on strips |
| S-02      | Scorecard drills; no KPI card grid                                 |
| S-07      | Five intents; Pulse≤2; Compliance visible                          |
| S-08      | Same chrome for all object types                                   |
| S-09      | Cannot Active without gate (via later transition UI)               |
| S-11      | Outcomes mandatory; snapshot immutable after complete              |
| S-17      | Admin panels; not exec Scorecard                                   |
| S-19      | Simulation before publish                                          |
| S-21      | Queue-first; no swipe-approve                                      |
| O-01/O-02 | Available every Projects screen                                    |

---

# 23. Interaction · empty · disclosure · hierarchy · a11y (amendments)

## 23.1 Interaction standard (all operational objects)

| Class               | Behaviour                                                              |
| ------------------- | ---------------------------------------------------------------------- |
| Primary action      | One obvious status/progress verb (Complete · Decide · Conclude · Open) |
| Secondary actions   | 1–3 adjacent (Discuss · Log wait · Escalate)                           |
| Contextual actions  | Overflow / right-click / Palette — non-destructive utilities           |
| Destructive actions | Confirm dialog; typed confirm when Critical                            |
| Keyboard            | Focusable row/strip; Enter = primary/open; shortcuts per W009          |
| Touch               | Explicit buttons; no swipe-to-approve; 44px targets                    |

No object invents a divergent interaction model.

## 23.2 Empty state standard

Every screen/region: explain situation · recommend next operational action · never blank. Institutional copy; CTA when permitted.

## 23.3 Progressive disclosure

Default view = operational clarity (status · action · next commitment). Advanced (factors · full matrix · Gantt · raw registers) expands on demand.

## 23.4 Visual hierarchy (mandatory contract)

Every screen distinguishes, in order:

1. Operational status
2. Immediate action
3. Supporting information
4. Historical information

## 23.5 Accessibility (design requirement)

Every screen spec includes: keyboard navigation · screen-reader behaviour · focus order · colour independence · responsive behaviour. A11y is product acceptance, not a late QA checkbox.

---

# 24. Decision register — Owner review (2026-08-06)

| ID         | Status       | Decision                                                                  |
| ---------- | ------------ | ------------------------------------------------------------------------- |
| **UI-D1**  | **APPROVED** | Shared UI system mandatory; no screen-specific styling                    |
| **UI-D2**  | **APPROVED** | S-01–S-24 canonical inventory; new screens require justification          |
| **UI-D3**  | **APPROVED** | O-01–O-17 standard overlays; avoid bespoke                                |
| **UI-D4**  | **APPROVED** | Universal Object Surface — consistency is product requirement             |
| **UI-D5**  | **APPROVED** | Health · Confidence · Compliance mandatory co-display                     |
| **UI-D6**  | **APPROVED** | Five FocusNav intents mandatory at Portfolio/Initiative/Programme/Project |
| **UI-D7**  | **APPROVED** | Scorecard ≠ Admin Dashboard                                               |
| **UI-D8**  | **APPROVED** | Queue-first mobile canonical                                              |
| **UI-D9**  | **APPROVED** | Single interaction standard for all operational objects                   |
| **UI-D10** | **APPROVED** | Purposeful empty states on every screen                                   |
| **UI-D11** | **APPROVED** | Progressive disclosure mandatory                                          |
| **UI-D12** | **APPROVED** | Visual hierarchy 1–4 as UI contract                                       |
| **UI-D13** | **APPROVED** | Accessibility part of product acceptance                                  |

---

# 25. Owner authorisation — ENGINEERING

**APZ Projects Release 3.0 Product Bible (W002–W011) accepted as implementation authority.**

- Engineering authorised to begin implementation
- Follow approved workshops
- May optimise technical implementation
- **Shall not** alter approved product behaviour or UX without Product Owner approval
- Future enhancements via Release 3.x — do not modify 3.0 behavioural contract without formal review

### Delivery slice priority

1. Operational Workspace
2. Project Lifecycle
3. Operational Delivery
4. Portfolio Management
5. Resource & Team Management
6. Communication & Collaboration
7. Reporting & Operational Review
8. Search, Navigation & Productivity
9. Security, Governance & Administration

UI System (this document) governs all implementation work. **Release 3.0 is in engineering execution.**
