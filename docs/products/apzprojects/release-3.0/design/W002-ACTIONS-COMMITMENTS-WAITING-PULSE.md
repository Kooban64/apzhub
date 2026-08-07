# APZ Projects 3.0 — Product Design Workshop 002

## Immediate Actions · Commitments · Waiting · Project Pulse · Confidence

**Status:** ANNEX — construct debate notes  
**Authority:** Superseded for workspace IA by `W002-OPERATIONAL-WORKSPACE.md` (that file wins on conflict)  
**Depends on:** W001 Decision Log (D1–D9 locked / amended)  
**Standard:** Construct formulas retained for reference

---

# Working principle

Challenge every suggestion — including the Owner’s and W001’s.

If a construct can be sharper for enterprise operations, say so and propose better.

---

# 0. Revised Focus Navigation (D8 amendment)

## Challenge to the entity list and to the first intent draft

W001 proposed: Now · Timeline · Milestones · Commitments · Risks · Decisions — **entity thinking**. Rejected.

Owner draft:

```text
Overview · Delivery · Planning · Governance · Commitments · Progress · History
```

**Challenge:**

| Label       | Problem                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| Commitments | Still an entity; Delivery _is_ commitments in motion                                                                 |
| Progress    | Overlaps Overview (pulse/confidence) and Delivery                                                                    |
| Governance  | Collides mentally with Enterprise Context / Law; risks + decisions are _control of delivery_, not a separate product |

**Recommend — five intents, not seven:**

```text
Overview
Delivery
Planning
Control
History
```

| Intent       | Answers                                            | Contains (surfaces, not nav identity)                                                           |
| ------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Overview** | What is the state of this project right now?       | Pulse · Health · Confidence · Waiting summary · Requires my decision/attention (project-scoped) |
| **Delivery** | What are we executing, blocked on, or waiting for? | Active commitments · blockers · Waiting register · due this week                                |
| **Planning** | What is the trajectory?                            | Roadmap timeline · milestones · upcoming commitments                                            |
| **Control**  | What must be steered, approved, or decided?        | Risks · Decisions · Approvals · governance obligations (project-side)                           |
| **History**  | What changed that I should care about?             | Operational Changes (project)                                                                   |

Deep links from Wave A (`/risks`, `/milestones`, …) map into the correct intent + open the relevant surface.

**Decision proposal D8.1:** Adopt five-intent Focus nav. Reject seven-item list as diluted.

---

# 1. First-class constructs (definitions)

These are **platform concepts**, not UI badges.

## 1.1 Health vs Confidence

|            | Health                                                 | Confidence                                                                                       |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Question   | How is the project **today**?                          | Will we deliver what we promised **from here**?                                                  |
| Nature     | Present state                                          | Forward outlook                                                                                  |
| Shape      | Enum: Healthy · Watch · Critical                       | Score 0–100 + band: High · Medium · Low                                                          |
| Moves when | Open critical risk, overdue commitment, active blocker | Slippage trend, waiting duration, unresolved decisions, dependency density, milestone confidence |

**A project can be Healthy + Low Confidence.** That must be visible on every strip and Overview.

**Decision proposal D10:** Health and Confidence are independent first-class fields on the project operational model.

### Confidence v1 formula (rules, not AI)

Start transparent and boring — executives trust explainable scores.

```text
confidence = 100
  − 15 × criticalOpenRisks
  − 8  × watchOpenRisks
  − 10 × overdueCommitments
  − 6  × activeWaitStates (aged > SLA)
  − 5  × unresolvedDecisionsPastDue
  − 4  × milestonesWithLowConfidence
  − trendPenalty (0–20 from recent slip rate)
clamp 0–100
```

Band: High ≥ 75 · Medium 45–74 · Low < 45.

UI always offers **“Why this score”** expanding the contributing factors (trust).

Later AI may refine narrative; **score remains rule-owned** until proven otherwise.

---

## 1.2 Project Pulse

**Definition:** A short, human, operational paragraph (1–3 sentences) stating current delivery truth.

**Not:** greeting, marketing copy, AI hallucination surface.  
**Is:** rule-composed from structured state.

### Example

```text
Project Pulse
Customer UAT progressing. One approval outstanding.
Go-live remains on schedule.
```

### Composition rules (v1)

Ordered sentence slots — omit empty slots:

1. **Primary pressure** — highest-severity Waiting / Blocker / Critical risk (one sentence)
2. **Decision/approval load** — count of open decisions or approvals waiting (if >0)
3. **Trajectory** — next milestone/commitment date vs schedule band (on track / at risk / slipped)

Templates (examples):

| Condition                 | Sentence                                                      |
| ------------------------- | ------------------------------------------------------------- |
| Waiting on Customer > SLA | `Waiting on customer for {subject} ({n} days).`               |
| Critical risk open        | `Critical risk open: {title}.`                                |
| Approval outstanding      | `{n} approval(s) outstanding.`                                |
| Next milestone on track   | `{milestone} remains on schedule ({date}).`                   |
| Next milestone slipped    | `{milestone} slipped; revised {date}.`                        |
| No pressure               | `No operational pressure. Next commitment: {title} ({date}).` |

**Decision proposal D11:** Pulse is first-class, rule-generated, shown on Cockpit Overview header and optionally as one line on Portfolio strips (truncatable).

---

## 1.3 Waiting (first-class)

Enterprise projects spend large fractions of calendar time **waiting**. Markets under-model this (Jira “blocked” is weak; Asana waiting is informal).

### Model

```text
Waiting {
  id
  projectId
  subject            // what we are waiting for
  party              // Customer | Vendor | Finance | Legal | Approval | Internal | Other
  partyLabel         // free text when Other / named org
  since              // datetime
  slaDays?           // optional expected wait
  linkedCommitmentId?
  linkedDecisionId?
  status             // active | resolved
  resolvedAt?
  ownerUserId        // who is accountable to chase
}
```

### Parties (v1 closed set + Other)

`Customer` · `Vendor` · `Finance` · `Legal` · `Approval` · `Internal` · `Other`

### Presentation

| Surface                               | Treatment                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------- |
| Portfolio strip                       | Pressure chip `Waiting {n}` when active >0; aged > SLA uses warning token |
| Cockpit Overview                      | Waiting summary block                                                     |
| Delivery intent                       | Full Waiting register                                                     |
| Immediate Actions → Waiting On Others | Rows derived from Waiting where user is owner/chaser                      |

**Decision proposal D12:** Waiting is a first-class SoR object in Projects (not a task label, not only a Context fragment).

---

## 1.4 Commitment (first-class)

**Definition:** A promise that someone will produce an outcome by a time, with named waiters and a failure consequence.

```text
Commitment {
  statement          // what will be true
  ownerUserId        // who delivers
  dueAt
  waiters[]          // who is blocked if this fails (users / parties)
  failureConsequence // what breaks if this slips
  status             // proposed | accepted | in_progress | waiting | done | cancelled
  waitingId?         // if currently in wait
  milestoneId?
  healthImpact       // none | watch | critical when overdue
}
```

**Challenge to “tasks are commitments”:** Tasks are work units. Commitments are **promises with consequence**. v1 may _project_ from tasks/action items, but the product language and required fields are Commitment.

**Decision proposal D13:** Commitment is the primary delivery object. Tasks may back a commitment; UI speaks Commitment.

### Minimum fields for v1 ship

| Required                        | Optional v1.1                                 |
| ------------------------------- | --------------------------------------------- |
| statement, owner, dueAt, status | failureConsequence, waiters[], milestone link |

Recommend **failureConsequence required** if we want differentiation from every PM tool — challenge: slightly higher create friction. **Recommend require it** for enterprise seriousness; use short prompts (“If this slips: …”).

---

# 2. Immediate Actions — three sections

## Challenge: one flat queue

A single severity-sorted list forces the brain to re-classify every row. Enterprise operators think in three modes:

| Section                   | Mental mode     | User must…                           |
| ------------------------- | --------------- | ------------------------------------ |
| **Requires My Decision**  | Decide          | Choose / approve / reject / escalate |
| **Requires My Attention** | Act             | Unblock, chase, complete, respond    |
| **Waiting On Others**     | Monitor / nudge | See aged waits they own chasing      |

**Decision proposal D14:** Home Immediate Actions is always three sections (collapse empty sections; never hide the headings when count is zero on desktop Overview — show “None”).

## 2.1 Section membership rules

| Section               | Includes                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Requires My Decision  | Approvals waiting on me · Decisions where I am decision-maker and status = pending · Escalations requiring my call                         |
| Requires My Attention | Overdue commitments I own · Blockers I must clear · Critical risks I own · Governance actions assigned to me · Due today commitments I own |
| Waiting On Others     | Active Waiting records where I am chase owner · Commitments where I am waiter (not owner)                                                  |

A single object appears in **one** section only (Decision > Attention > Waiting On Others).

## 2.2 Ordering within each section (D4 amended)

Applied **inside** each section:

```text
Business Impact
  → Blocked Work
  → Waiting For Me          // only meaningful in Attention / Decision
  → Due Today
  → Approvals               // primarily Decision section
  → Upcoming
```

### Business Impact (must be concrete or it is theatre)

**Recommend v1 impact score** on each action row:

```text
impact =
  projectCriticality (1–5)
  + (customerFacing ? 2 : 0)
  + (regulatoryFlag ? 2 : 0)
  + min(waitersCount, 3)
  + (blocksGoLive ? 3 : 0)
```

Sort by impact desc, then the cascade above.

**Decision proposal D15:** Business Impact is an explicit sort key with published formula — not PM gut feel alone.

## 2.3 Row anatomy (all three sections)

```text
[Impact] [Type]  Statement                         Project        Age/Due    ▶
  High    Wait   Customer sign-off on UAT pack     Dig. Banking   6d         ▶
```

Type labels: `Decision` · `Approval` · `Commitment` · `Risk` · `Blocked` · `Waiting` · `Governance`

## 2.4 Empty / loading / error / mobile

| State            | Behaviour                                                                       |
| ---------------- | ------------------------------------------------------------------------------- |
| Empty section    | `None` — one line; no illustration                                              |
| All empty        | Overview still shows portfolio metrics; copy: `Nothing requires you.`           |
| Loading          | Three section skeletons                                                         |
| Partial provider | Show available; `Approvals unavailable` inline in Decision                      |
| Mobile           | Same three sections; default expand Decision, then Attention; Waiting collapsed |

---

# 3. Where constructs appear

## 3.1 Home — Operational Overview metrics (amended)

```text
Health distribution · Attention required · Confidence (portfolio avg or % Low)
Open decisions · Active waits · Commitments due (7d)
```

Pulse is **per project**, not portfolio (portfolio uses pressure statement from W001).

## 3.2 Portfolio strip (amended columns)

| Column          | Content                                                |
| --------------- | ------------------------------------------------------ |
| Project         | Name                                                   |
| Health          | Healthy / Watch / Critical                             |
| Confidence      | Score + band                                           |
| Pulse           | One line truncated (optional density: hide at compact) |
| Next commitment | Title + date                                           |
| Waiting         | Count (+ aged indicator)                               |
| Pressure        | Risks · Decisions (counts >0)                          |
| Changed         | Last operational change                                |

## 3.3 Cockpit Overview intent

```text
┌ Project header: Name · Health · Confidence ──────────────┐
│ Project Pulse (1–3 sentences)                            │
│ Waiting summary · Decision/Attention counts (project)    │
│ Trajectory: next commitment / milestone                  │
└──────────────────────────────────────────────────────────┘
```

---

# 4. Operational Changes (D7 lock)

**Name:** Operational Changes — never “Activity”.

**Rule:** If the entry cannot answer **Why should I care?**, it does not ship in this feed.

### Allowed event classes (v1)

| Event                             | Care answer              |
| --------------------------------- | ------------------------ |
| Customer / party approved X       | Unblocks path            |
| Risk escalated / de-escalated     | Exposure changed         |
| Milestone completed / slipped     | Trajectory changed       |
| Budget / threshold exceeded       | Constraint changed       |
| Support incident linked           | External pressure        |
| Waiting started / resolved (aged) | Calendar reality changed |
| Commitment blocked / completed    | Delivery truth changed   |
| Decision recorded                 | Direction changed        |

### Rejected from this feed

Field renames · comment noise · view/open events · routine status flickers without outcome.

Each row shape:

```text
{headline}                         {project?} · {when}
{why-care clause — one line}
```

---

# 5. Interaction design (this workshop’s surfaces)

| Surface                    | Interactions                                                | Shortcuts                       | A11y                                          |
| -------------------------- | ----------------------------------------------------------- | ------------------------------- | --------------------------------------------- |
| Immediate Actions sections | Expand/collapse; j/k across rows; Enter opens cockpit focus | `1`/`2`/`3` jump section        | Headings are `h2`; counts in accessible names |
| Waiting register           | Create wait · resolve · change party · link commitment      | `w` new wait (cockpit Delivery) | Party as text not colour                      |
| Commitment create          | Statement · owner · due · consequence                       | `c`                             | Labels, errors inline                         |
| Pulse                      | Read-only v1; refresh with data                             | —                               | Full text available, not colour-only          |
| Confidence                 | Click → factor breakdown dialog                             | —                               | Score + band announced                        |

Loading/empty/error: region-scoped; Context rail independent; no whole-page death.

---

# 6. Engineering assessment

| Construct                   | Reuse                                             | New                                     | Backend / API                                                                        | Complexity | Migration                            |
| --------------------------- | ------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------ | ---------- | ------------------------------------ |
| Immediate Actions 3-section | Delivery risks/actions; workflow approvals bridge | Queue assembler + ranking               | `GET /api/v1/projects/attention` → `{ decisions[], attention[], waitingOnOthers[] }` | M–L        | —                                    |
| Business Impact score       | Project fields                                    | Impact calculator                       | Include `impact` on each action DTO                                                  | S–M        | May need project criticality field   |
| Waiting                     | —                                                 | Waiting entity + UI register            | CRUD `/waiting` under project; list by user chase                                    | M          | No legacy equivalent — greenfield    |
| Commitment                  | Tasks / action items                              | Commitment model (+ optional task link) | Commitments API; map from tasks where needed                                         | L          | Dual-read period if tasks remain     |
| Pulse                       | —                                                 | Rule engine pure function               | Computed on read or materialised on write events                                     | S–M        | —                                    |
| Confidence                  | Health aggregate                                  | Confidence calculator + factors API     | Field on delivery dashboard / overview                                               | S–M        | Explain endpoint                     |
| Focus nav 5-intent          | Cockpit shell                                     | Remap routes                            | Route aliases from old tabs                                                          | M          | URL redirects                        |
| Operational Changes         | Activity events                                   | Filter + why-care copy map              | Prefer typed domain events over raw audit                                            | M          | Audit stays for compliance elsewhere |

---

# 7. Design decisions for CPO (W002)

| ID       | Proposal                                                                      |
| -------- | ----------------------------------------------------------------------------- |
| **D8.1** | Focus nav = Overview · Delivery · Planning · Control · History                |
| **D10**  | Health ≠ Confidence; both first-class                                         |
| **D11**  | Project Pulse = rule-generated 1–3 sentences; Cockpit + strip                 |
| **D12**  | Waiting = first-class SoR with party + since + chase owner                    |
| **D13**  | Commitment = primary delivery object; failureConsequence required in v1       |
| **D14**  | Immediate Actions = three sections (Decision / Attention / Waiting On Others) |
| **D15**  | Business Impact = published numeric sort key                                  |

### Open challenges for you

1. **D13** — Require `failureConsequence` at create, or defer to v1.1 for lower friction?
2. **D8.1** — Accept five intents, or insist on keeping Commitments / Governance as top-level labels?
3. **Approvals SoR** — Workflow-owned vs Projects-owned for Decision section?
4. **Pulse on strips** — Always show, or density toggle (default on at Comfortable, off at Compact)?

---

# 8. What “done” means for this workshop

When D8.1 and D10–D15 are approved/amended:

- Engineering has frozen constructs for Attention API, Waiting, Commitment, Pulse, Confidence
- Cockpit Focus nav labels are frozen
- Workshop 003 can attack **Planning/Timeline + Milestone surface** without reopening Home IA

---

# 9. Deliberate non-goals (this workshop)

- AI-written Pulse
- Gantt interaction detail
- Full Programme hierarchy UX
- Notification delivery rules (sparse notifications remain a later workshop)
