# APZ Projects Release 3.0

# Product Design Workshop 008 — Reporting, Executive Intelligence & Operational Review

**Document ID:** W008-REPORTING-AND-OPERATIONAL-REVIEW  
**Status:** APPROVED WITH AMENDMENTS (Owner review 2026-08-06) — implementation authority for operational reporting  
**Mode:** Product design only · no code until Owner authorises engineering  
**Depends on:** W001–W007 (W002–W007 APPROVED WITH AMENDMENTS)  
**Continues:** `W009-SEARCH-NAVIGATION-AND-PRODUCTIVITY.md`  
**Authority:** Implementation specification for operational reporting within APZ Projects (as amended). Boundary with APZ Analytics is **permanent**.

---

# 0. Product objective

Enable Project Managers, PMOs and Executives to **review operational delivery** with explainable reports and scheduled operational reviews — without turning APZ Projects into an analytics platform.

| APZ Projects reports                            | APZ Analytics explains                   |
| ----------------------------------------------- | ---------------------------------------- |
| Delivery health & confidence                    | Enterprise performance patterns          |
| Exceptions · decisions · waits                  | Cross-product insight & trends at scale  |
| Baseline variance · forecasts                   | Deep statistical / decision intelligence |
| Portfolio/programme/project operational reviews | Board-level multi-domain performance     |

**Boundary (canonical):** Projects = **operational delivery reporting**. Analytics = **enterprise performance explanation**. No duplicate semantic layer, no second BI tool inside Projects.

---

# 1. Design principles (normative)

| #    | Principle                                                                                                         |
| ---- | ----------------------------------------------------------------------------------------------------------------- |
| RP1  | Every report answers an **operational question**                                                                  |
| RP2  | Every metric is **explainable** (factors · drill to objects)                                                      |
| RP3  | Reuse Scorecard / Forecast / Exception constructs (W004–W005) — do not reinvent                                   |
| RP4  | Reviews are **cadenced operational ceremonies**, not slide theatre                                                |
| RP5  | Export is for governance packs — live product remains source of truth                                             |
| RP6  | Permission-filtered; never leak cross-portfolio data                                                              |
| RP7  | Institutional presentation; no decorative chart junk                                                              |
| RP8  | Compose Analytics Context later if needed — never embed Analytics SoR                                             |
| RP9  | Scheduled reviews publish events to Attention Engine — Projects does not email PDFs itself as a parallel notifier |
| RP10 | Challenge “50 canned charts” — prefer a small authoritative pack                                                  |

---

# 2. Reporting information architecture

```text
APZ Projects
├── Operational Workspace / Portfolio Scorecard     // live intelligence (W002/W005)
├── Reviews                                         // scheduled & ad-hoc operational reviews
│   ├── Project Review
│   ├── Programme Review
│   ├── Portfolio Review
│   ├── Governance Review
│   └── Delivery Review (cadence pack)
└── Reports library                                 // authoritative operational reports
    ├── Exception · Decision · Variance · Forecast
    ├── Trend · Waiting · Accountability gaps
    └── Export / packs
```

**Challenge:** Separate “BI module” nav.  
**Recommend:** **Reviews** + **Reports** as secondary under Portfolio / project History-adjacent — Scorecard remains executive default landing (W005).

---

# 3. Operational dashboards (live)

Live dashboards are **not** a second product — they are the Metric Band / Scorecard / Cockpit Overview already designed.

| Surface                      | Authority                                          |
| ---------------------------- | -------------------------------------------------- |
| Project Overview             | W002/W004 — Health · Confidence · Pulse · Forecast |
| Portfolio Scorecard          | W005 — executive default                           |
| Portfolio Workspace Overview | W005 — PMO steering                                |
| Capacity / Delivery Capacity | W005/W006                                          |

W008 does **not** redesign these; it defines **reports and reviews** that package the same truth for ceremony and export.

**Decision proposal RP-D1:** No parallel dashboard product; live intelligence stays Scorecard/Cockpit; Reports/Reviews package it.

---

# 4. Executive scorecards

## 4.1 Portfolio Scorecard (W005 — default executive landing)

Authoritative rows remain:

- Portfolio Health · Portfolio Confidence · Strategic Objective Progress
- Delivery Trend · Exception Summary · Decision Summary · Forecast Outlook

## 4.2 Programme / Initiative scorecards

Same row grammar, scoped. Drill to child strips / Critical Projects / contributors.

## 4.3 Scorecard vs Report

| Scorecard              | Report                        |
| ---------------------- | ----------------------------- |
| Live, always on        | Point-in-time or period       |
| Action → Queue/Cockpit | Action → Review pack / export |
| Continuous             | Cadenced or on-demand         |

---

# 5. Operational reviews (ceremony model)

## 5.1 Review types

| Review                | Question                                            | Cadence (typical)     |
| --------------------- | --------------------------------------------------- | --------------------- |
| **Project Review**    | Is this project delivering predictably?             | Weekly / fortnightly  |
| **Programme Review**  | Are workstreams aligned and dependencies safe?      | Fortnightly / monthly |
| **Portfolio Review**  | Is the enterprise portfolio on course?              | Monthly / quarterly   |
| **Delivery Review**   | What changed operationally since last review?       | Weekly PMO            |
| **Governance Review** | Are checkpoints, exceptions, waivers under control? | Monthly / per profile |

## 5.2 Review object

```text
OperationalReview {
  id · type · scopeType · scopeId
  periodFrom · periodTo
  status                         // scheduled | in_progress | completed | cancelled
  chairPrincipalId
  attendeePrincipalIds[]
  agenda[]                       // structured sections from template
  packSnapshotId                 // immutable — state · metrics · evidence · attendees · outcomes
  executiveSummaryId             // ≤1 page deterministic narrative
  outcomes                       // structured — mandatory to complete (§5.4)
  meetingOutcomeId?              // link W007 when applicable
  followUpReviewAt?              // mandatory outcome field
  completedAt
}
```

Historical reviews are **immutable** after `completed` — never mutate snapshot, summary, or outcomes.

## 5.3 Review pack (auto-composed)

Always includes (scope-filtered):

1. Health · Confidence · Pulse (as-of) — each metric **drill-through** to source objects
2. Forecast (14d default) + factors + recommended actions
3. Exceptions open/closed in period by severity
4. Decisions pending + latency
5. Baseline variance summary
6. Waiting ageing
7. Critical path / cross-project deps (programme+)
8. Accountability gaps (W006 matrix summary)
9. Recommended actions (from forecast + exceptions)

Optional: Strategic Objective progress (initiative/portfolio).

### Report / pack traceability

Every metric supports **single-interaction drill-through** to its operational source (object list or object surface). No unexplained metrics.

## 5.4 Review completion — structured outcomes (mandatory)

A review **without outcomes is incomplete**. Completion requires structured outcome records covering (as applicable; empty categories explicitly attested):

| Outcome type                | Rule                                                                      |
| --------------------------- | ------------------------------------------------------------------------- |
| Decisions                   | Create/link Decision objects                                              |
| New Commitments             | **Every action becomes a Commitment** — no separate action register       |
| Risks Raised / Risks Closed | Create/link or close Risk                                                 |
| Exceptions Raised / Closed  | Create/link or conclude Exception                                         |
| Governance Actions          | Checkpoint/waiver/profile actions as operational objects or Control items |
| Follow-up Review Date       | Mandatory `followUpReviewAt`                                              |

**One operational object for work:** Commitment. No parallel “action register.” One lifecycle (W004).

## 5.5 Executive Summary (deterministic)

Each review generates an **Executive Summary** — maximum **one page**. No AI.

Structured sections:

1. Current Position
2. Key Changes
3. Principal Risks
4. Decisions Required
5. Recommended Actions

Rule-composed from pack snapshot + outcomes. Editable by chair before complete; frozen with snapshot on complete.

---

# 6. Report catalogue (authoritative v1)

Each report: **question · audience · inputs · visual · drill · export**.

### 6.1 Exception Report

- **Question:** What exceptions threaten delivery?
- **Inputs:** Exceptions by severity · age · outcome · scope
- **Visual:** Severity table + ageing; not heat-map chrome
- **Drill:** Exception → unified timeline

### 6.2 Decision Latency Report

- **Question:** Where are decisions stalling?
- **Inputs:** Pending decisions · age · level (project/programme/portfolio)
- **Drill:** Decision conversation / timeline

### 6.3 Baseline Variance Report

- **Question:** Where has plan diverged from baseline?
- **Inputs:** Milestone/commitment variance · re-baseline history
- **Drill:** Milestone surface · baseline history

### 6.4 Forecast Report

- **Question:** What is the 7/14/30 outlook?
- **Inputs:** W004/W005 forecast shape — predicted outcome · confidence · factors · recommended actions
- **Rule:** Never black-box

### 6.5 Trend Analysis Report

- **Question:** How are Health, Confidence, Exceptions, Waits moving?
- **Inputs:** Time series of operational indicators (Projects warehouse/projection — not Analytics cube)
- **Visual:** Sparse sparklines / period deltas — institutional

### 6.6 Waiting Ageing Report

- **Question:** Where is the portfolio stuck on parties?
- **Inputs:** Waiting by category · age · chase owner

### 6.7 Governance / Checkpoint Report

- **Question:** Gate status and waiver load?
- **Inputs:** Checkpoints · waivers · rejected · pending Workflow

### 6.8 Delivery Capacity / Team Pressure Report

- **Question:** Where is delivery ability constrained?
- **Inputs:** Delivery Capacity · Team Health · overload (W006) — indicative

### 6.9 Strategic Objective Progress Report

- **Question:** Are objectives on track?
- **Inputs:** Objectives · contributing projects · status

### 6.10 Accountability Gap Report

- **Question:** Where is ownership missing or concentrated?
- **Inputs:** Responsibility Matrix gaps · continuity cases

**Decision proposal RP-D3:** v1 catalogue = §6.1–6.10 only; resist chart sprawl.

---

# 7. Scope-specific review packs

| Scope      | Emphasise                                                             |
| ---------- | --------------------------------------------------------------------- |
| Project    | Pulse · commitments due · exceptions · variance · forecast            |
| Programme  | Cross-project deps · member health distribution · programme decisions |
| Portfolio  | Scorecard rows · objectives · critical projects · portfolio forecast  |
| Governance | Checkpoints · waivers · exception outcomes · policy breaches          |

Same UX grammar at every level (consistency with PF-D4 / cockpit intents).

---

# 8. Variance reporting

- Working plan vs **active baseline** (W003)
- Dimensions: date slip · commitment churn · scope cancel · re-baseline count
- Threshold breaches link to Exceptions (W004)
- Report + Review pack section share same projection API

---

# 9. Forecast reporting

Reuse forecast DTO:

`predictedOutcome` · `confidenceLevel` · `contributingFactors` · `recommendedActions` · window 7/14/30

Portfolio/programme aggregate per W005. Report view is printable/exportable snapshot of the same explainable forecast.

---

# 10. Trend analysis

## 10.1 Projects-owned series

Store/serve operational time series for:

- Health distribution
- Confidence (weighted portfolio / project)
- Exception open counts by severity
- Aged waits
- Decision pending counts
- Forecast off-track counts

## 10.2 Boundary with Analytics

If deeper correlation across Time/Support/Finance is needed → **APZ Analytics**.  
Projects may later **compose** Analytics Context fragments on a review pack — never replicate Analytics models.

**Decision proposal RP-D4:** Projects keeps operational time series only; enterprise performance analysis stays Analytics.

---

# 11. Operational Review Calendar (first-class)

```text
ReviewSchedule {
  type · scopeType · scopeId     // project | programme | portfolio | governance
  cadence                        // weekly | fortnightly | monthly | quarterly
  nextRunAt · previousReviewIds[]
  chairRoleKey · audience
  autoOpenPack                   // boolean
  digestOnComplete               // Attention Engine
  status                         // active | paused | ended
}
```

- First-class **review scheduling** for Projects · Programmes · Portfolios · Governance
- Auto-creates `OperationalReview` in `scheduled`
- Pack snapshot generated at start
- **Review history + future schedule** are part of the operational record
- Calendar invites are **not** Projects SoR (external); Projects owns the review record and schedule

---

# 12. Export strategy

| Format         | Use                                               |
| -------------- | ------------------------------------------------- |
| PDF pack       | Governance / board / CAB                          |
| CSV            | Exception/decision registers for offline analysis |
| Printable HTML | Quick review                                      |

Rules:

- Export = **snapshot** with as-of timestamp + correlation id
- Live product remains authoritative
- Watermark scope + classifier if required by profile
- No “Excel as SoR” workflow

**Decision proposal RP-D5:** PDF/CSV snapshots for packs; no editable export round-trip as system of record.

---

# 13. Presentation standards

- Metric bands and dense tables over pie charts
- Semantic colour + text labels
- Every figure clickable to object/list
- “How calculated” on Health · Confidence · Forecast · Capacity
- Empty states institutional

---

# 14. Permissions

| Capability                  | PM       | Programme | PMO | Executive |
| --------------------------- | -------- | --------- | --- | --------- |
| Project reports/reviews     | ✓ own    | ✓ member  | ✓   | ✓ read    |
| Programme packs             | —        | ✓         | ✓   | ✓         |
| Portfolio scorecard/reports | —        | limited   | ✓   | ✓         |
| Export                      | ✓ scoped | ✓         | ✓   | ✓         |
| Manage schedules            | —        | limited   | ✓   | —         |

---

# 15. Notifications & digests

- Review scheduled / pack ready / review completed → events
- Report subscriptions via Operational Digests (W007): Daily · Weekly · Milestone · Exception
- Attention Engine delivers — Projects does not SMTP

---

# 16. Engineering readiness

| Area            | Current          | New                                    | API                              | Complexity |
| --------------- | ---------------- | -------------------------------------- | -------------------------------- | ---------- |
| Live scorecards | Designed W005    | Implement per W005                     | existing portfolio projections   | L (prior)  |
| Report queries  | None             | Report projection services             | `/reports/{key}`                 | M–L        |
| Trends          | None             | Operational series store               | `/trends`                        | M–L        |
| Reviews         | None             | OperationalReview + schedules          | `/reviews` · `/review-schedules` | L          |
| Pack snapshot   | None             | Immutable snapshot blob/meta           | on review open                   | M          |
| Export          | None             | PDF/CSV workers                        | `/exports`                       | M–L        |
| Analytics       | Separate product | Context compose only later             | no duplicate                     | S          |
| Performance     | —                | Precompute heavy reports; async export | —                                | L          |
| Acceptance      | —                | §18                                    | —                                | —          |

---

# 17. Acceptance criteria

1. No Analytics semantic duplication inside Projects — boundary permanent.
2. No parallel dashboard product beyond Scorecard/Cockpit.
3. v1 report catalogue limited to §6 authorised set.
4. Every metric supports one-click drill-through to source.
5. Review completion requires structured outcomes; actions → Commitments only.
6. Immutable snapshot after complete; Executive Summary ≤1 page, rule-generated.
7. Exports are approved snapshot evidence.
8. Review Calendar first-class; history + future schedule in operational record.
9. Forecast reports expose factors · confidence · recommended actions.
10. Programme/Portfolio/Project reviews share grammar.

---

# 18. Decision register — Owner review (2026-08-06)

| ID         | Status       | Decision                                                                                                                       |
| ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **RP-D1**  | **APPROVED** | Permanent boundary: Projects = operational delivery reporting; Analytics = enterprise performance; no duplicate BI in Projects |
| **RP-D2**  | **APPROVED** | Live intelligence only in Overview / Project / Programme / Portfolio Cockpits — no separate dashboard product                  |
| **RP-D3**  | **APPROVED** | Operational Reviews first-class; types Project · Programme · Portfolio · Delivery · Governance; part of operational history    |
| **RP-D4**  | **APPROVED** | Immutable review snapshot (state · metrics · evidence · attendees · outcomes); never change after completion                   |
| **RP-D5**  | **APPROVED** | Small authoritative report catalogue; operational questions only                                                               |
| **RP-D6**  | **APPROVED** | Forecast reports explainable (factors · confidence · recommended actions)                                                      |
| **RP-D7**  | **APPROVED** | Exports = approved review snapshot evidence — not live reports                                                                 |
| **RP-D8**  | **APPROVED** | Structured review outcomes mandatory (decisions · commitments · risks · exceptions · governance · follow-up date)              |
| **RP-D9**  | **APPROVED** | Review actions → Commitments only; no separate action register                                                                 |
| **RP-D10** | **APPROVED** | Every report metric drill-through to operational source in one interaction                                                     |
| **RP-D11** | **APPROVED** | Executive Summary ≤1 page; deterministic sections; no AI                                                                       |
| **RP-D12** | **APPROVED** | Operational Review Calendar first-class; history + future schedule in operational record                                       |

**Engineering:** Do not implement until Owner authorises. Next design authority: **W009 — Enterprise Search, Navigation & Productivity**.

---

# 19. Explicit non-goals

- Embedding APZ Analytics cubes or replacing Analytics
- Ad-hoc pixel BI builder for end users
- Real-time stock-ticker dashboards
- AI executive narrative
- Separate action registers
- Implementation code

---

# 20. Approval gate

**Owner approved with amendments (2026-08-06).** This file is implementation authority for operational reporting.

Boundary with APZ Analytics is **permanent**. Productivity/search is specified in `W009-SEARCH-NAVIGATION-AND-PRODUCTIVITY.md`.
