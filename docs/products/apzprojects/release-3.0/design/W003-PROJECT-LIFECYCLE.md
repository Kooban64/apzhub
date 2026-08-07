# APZ Projects Release 3.0

# Product Design Workshop 003 — Project Lifecycle

**Document ID:** W003-PROJECT-LIFECYCLE  
**Status:** APPROVED WITH AMENDMENTS (Owner review 2026-08-06) — implementation authority for Project Lifecycle  
**Mode:** Product design only · no code until Owner authorises engineering  
**Depends on:** W001 (locked) · W002 APPROVED WITH AMENDMENTS  
**Continues:** `W004-OPERATIONAL-DELIVERY.md`  
**Authority:** Implementation specification for the complete APZ Projects project lifecycle (as amended)

---

# 0. Product objective

Define the complete operational behaviour of a project from **initiation through archival**.

When engineering builds APZ Projects 3.0, lifecycle behaviour must already be decided — not invented in pull requests.

A project is not a database row with a status enum.  
A project is a **managed delivery commitment** that moves through operational stages with clear entry criteria, required artefacts, and exit criteria.

---

# 1. Design principles (normative)

| #   | Principle                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------ |
| L1  | Lifecycle stages are **operational**, not IT ticket states                                                               |
| L2  | Users advance stages through **explicit actions** with consequences — not silent field edits                             |
| L3  | Templates seed **operating model**, not just empty field defaults                                                        |
| L4  | Commitments, milestones, decisions, risks, dependencies, waits, and approvals are lifecycle citizens — not optional tabs |
| L5  | Failure Consequence (optional) may exist on commitments, milestones, decisions, and dependencies (W002)                  |
| L6  | Health and Confidence exist from **Active** onward; Draft may show provisional indicators only                           |
| L7  | Closure produces an operational record; archival removes from active portfolio without destroying history                |
| L8  | Entity tools (Tasks / Backlog / Sprints) never define lifecycle                                                          |
| L9  | Enterprise language; no greetings; no consumer onboarding theatre                                                        |
| L10 | Challenge as-built create form (name/identifier/description) — insufficient for enterprise initiation                    |

---

# 2. Lifecycle state machine

## 2.1 Stages (canonical)

```text
Draft
  → Initiating
    → Active
      ⇄ On Hold
      → Closing
        → Closed
          → Archived
```

| Stage          | Meaning                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| **Draft**      | Project shell exists; not yet operationally live; invisible to portfolio Attention by default               |
| **Initiating** | Structuring delivery model, governance, baseline plan; preparation for Active                               |
| **Active**     | Delivery in progress; full Operational Workspace participation                                              |
| **On Hold**    | Delivery paused by decision; retains history; suppressed from “due today” pressure except governance/expiry |
| **Closing**    | Delivery complete or stopped; completing closure checklist and lessons                                      |
| **Closed**     | Formally closed; read-oriented; no new commitments without reopen                                           |
| **Archived**   | Removed from default portfolio; retained for audit/search; restore is privileged                            |

### Challenge: as-built statuses

As-built: `draft | active | on_hold | completed | archived`.

| Change                                        | Why                                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| Add **Initiating**                            | Separates “created” from “ready to deliver” — forces operating model setup |
| Replace `completed` with **Closing → Closed** | Completion is a process, not a flip                                        |
| Keep On Hold / Archived                       | Aligns with existing enum migration path                                   |

**Decision proposal L-D1:** Adopt seven-stage model above. Map `completed` → `closed` on migration; insert `initiating` as new.

## 2.2 Transitions — normative rule set

**No implicit transitions.** Every transition defines:

| Element             | Required                                            |
| ------------------- | --------------------------------------------------- |
| Entry criteria      | What must be true to attempt the transition         |
| Exit criteria       | What must be true for the transition to complete    |
| Mandatory artefacts | Records that must exist (or be waived)              |
| Required approvals  | Checkpoints / Workflow approvals if profile demands |
| Audit event         | Immutable Operational Change + platform audit       |

| From → To           | Permission (logical) | Entry / artefacts / approvals                                                              | Exit effects                                             |
| ------------------- | -------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| → Draft             | `projects.create`    | Identity · Classification · Delivery Model (may be Draft-incomplete on save-as-draft path) | Project exists; status Draft                             |
| Draft → Initiating  | `projects.manage`    | Template or Blank confirm · Governance Profile selected                                    | Initiation checklist unlocked                            |
| Initiating → Active | `projects.manage`    | Initiation gate (§5.3) · profile-required artefacts · Initial Baseline captured            | Portfolio live; Health/Confidence on; baseline v1 frozen |
| Active → On Hold    | `projects.manage`    | Hold reason · Decision (if profile requires)                                               | Queue freeze except Control; Pulse states hold           |
| On Hold → Active    | `projects.manage`    | Clearance reason · approval if profile requires                                            | Resume due logic                                         |
| Active → Closing    | `projects.manage`    | Close intent · outcome type (§13)                                                          | Closure checklist; warn on new commitments               |
| Closing → Closed    | `projects.manage`    | Closure gate (§13.3) · waivers audited                                                     | Read-only delivery; Confidence frozen                    |
| Closed → Archived   | elevated archive     | Confirm                                                                                    | Leave operational workspace; searchable                  |
| Closed → Active     | `projects.manage`    | Reopen Decision · approvals if profile requires                                            | Rare; Operational Change                                 |
| Archived → Closed   | Privileged restore   | Audit                                                                                      | **Closed only** — never direct to Active                 |

Illegal transitions return typed validation errors — never silent coerce.

---

# 3. Initiation

## 3.1 Challenge: current create UX

As-built create collects: workspace · name · identifier · description → dump into detail tabs.

**Reject** as enterprise initiation.  
**Recommend** a **guided Initiate Project** flow that establishes operating identity before Active.

## 3.2 Initiate Project flow (desktop)

```text
Step 1 — Identity
  Name · Identifier · Workspace · Owner
  Classification (mandatory) · Programme (optional) · Customer (optional)

Step 2 — Delivery model
  Choose model (§4.2) · Execution characteristic (optional)
  → suggests Governance Profile + templates

Step 3 — Governance & template
  Governance Profile (inherited; selectable within allowed set)
  Template (system or organisation) — version shown · preview seed

Step 4 — Initial baseline intent
  Target end date (or continuous waiver) · Success criteria
  Next milestone intent · Initial risks (optional)

Step 5 — Confirm
  Summary · Create as Draft or Create & start Initiating
  (Initial Baseline is captured at Initiating → Active — §4.6)
```

Mobile: Steps 1 + 5 only create Draft; full initiation completes on desktop (aligned with W002 mobile triage philosophy).

## 3.3 Post-create landing

| Action                    | Lands on                                              |
| ------------------------- | ----------------------------------------------------- |
| Create as Draft           | Cockpit Overview (Draft banner + continue initiation) |
| Create & start Initiating | Cockpit Overview initiation checklist                 |

Never land on empty Tasks tab.

## 3.4 Engineering readiness — Initiation

| Dimension   | Detail                                                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current     | `project-create-view.tsx` — 4 fields                                                                                                                        |
| Reuse       | `createProject` API, workspaces list, permissions                                                                                                           |
| Redesign    | Replace single form with stepped Initiate flow                                                                                                              |
| New         | `InitiateProjectWizard`, template preview, delivery model picker                                                                                            |
| API         | Extend `POST /api/v1/projects` with deliveryModel, templateId, ownerId, programmeId?, customerLabel?, targetEndAt?, successCriteria?; `POST .../transition` |
| Backend     | Project status enum expansion; template apply job (sync for small packs)                                                                                    |
| Migration   | Existing projects → `active` if currently active; `completed` → `closed`                                                                                    |
| Performance | Template apply <2s for standard packs                                                                                                                       |
| A11y        | Stepper with clear step names; focus management between steps                                                                                               |
| Acceptance  | Cannot reach Active without initiation gate; create never requires Tasks; Draft excluded from Attention queue                                               |

---

# 4. Delivery model

## 4.1 Purpose

Delivery model answers: **How does this project intend to deliver?**  
It is not a methodology religion screen — it selects default operating patterns.

## 4.2 Canonical models (Owner-approved)

Delivery Models describe **how value is delivered** — not methodology.

| Model                      | When                                 | Seeds                                                                            |
| -------------------------- | ------------------------------------ | -------------------------------------------------------------------------------- |
| **Product Delivery**       | Ongoing product / value stream       | Rolling commitments · lighter fixed milestone set · frequent decisions           |
| **Project Delivery**       | Fixed-outcome / go-live project      | Milestone-led timeline · commitment cadence · UAT/go-live gates                  |
| **Programme Delivery**     | Programme or major workstream        | Inherited governance · sibling Context · constrained dates · baseline discipline |
| **Operational Initiative** | Time-bounded operational improvement | Lightweight milestones · clear owner · shorter closure path                      |
| **Governance Initiative**  | Control, policy, regulatory change   | Decision/approval-forward · risk pack · document obligations                     |

**Execution characteristics** (configurable _within_ a model — not models themselves): Agile · Scrum · Kanban · Waterfall · Hybrid · or org-defined labels. These affect task/sprint tooling visibility under **More…**, not Operational Workspace identity.

**L-D2 (amended):** Five delivery models above. Methodologies are execution characteristics only.

## 4.3 Project Classification (mandatory)

Every project has a mandatory **Classification**:

`Strategic` · `Operational` · `Regulatory` · `Customer` · `Internal` · `Innovation`

Drives reporting, governance profile defaults, and portfolio filters/sorts. Set at initiation; change after Active requires confirmation + Operational Change + audit.

## 4.4 Governance Profile

Every project **inherits a Governance Profile** (system or organisation).

Profile determines:

- mandatory checkpoints
- approval requirements
- document obligations
- review frequency
- reporting cadence
- closure requirements

Projects do not individually configure governance where a reusable profile applies. Local waiver of a profile rule requires authorised user + audit (same standard as closure waivers).

Templates bind a default Governance Profile; initiation may select an alternate allowed for the Classification + Delivery Model.

## 4.5 Effects of model · classification · profile

| Effect                | Behaviour                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| Default milestone set | From template bound to model                                                                                    |
| Confidence weighting  | e.g. Governance Initiative / Regulatory classification weights unresolved decisions and governance waits higher |
| Pulse templates       | Model-specific sentence priority                                                                                |
| Cockpit emphasis      | Planning-heavy vs Control-heavy defaults on Overview                                                            |
| Checkpoints / closure | From Governance Profile                                                                                         |

Changing model or classification after Active requires confirmation + Operational Change; does not delete user data.

## 4.6 Baseline management (first-class)

No project shall lose its original commitments.

| Capability               | Behaviour                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Initial Baseline**     | Captured at Initiating → Active: milestones, target end, key commitments, success criteria snapshot              |
| **Approved Re-baseline** | Explicit action; requires Decision and/or Workflow approval per Governance Profile; creates new baseline version |
| **Baseline History**     | Immutable versions with actor, timestamp, reason, diff summary                                                   |
| **Variance Reporting**   | Current plan vs active baseline (date slips, scope/commitment deltas) — available in Planning + reports          |

Working plan may move day-to-day; **baseline** moves only through approved re-baseline. Variance feeds Confidence and Operational Overview trends.

---

# 5. Templates

## 5.1 What a template is

A **versioned operating pack**, not a name preset:

- Delivery model
- Default milestone skeleton
- Suggested risk categories / starter risks (optional)
- Decision types / governance checkpoints
- Default Waiting SLAs by category
- Commitment field hints
- Closure checklist

## 5.2 Template catalogue (product)

| Template examples    | Model                |
| -------------------- | -------------------- |
| Customer go-live     | Outcome delivery     |
| Internal platform    | Continuous delivery  |
| Regulatory change    | Governance / change  |
| Programme workstream | Programme workstream |
| Blank                | Any — minimal seed   |

Templates are **versioned**. System and **organisation-specific** templates are supported. After apply, the project is **independent** of the template (no live binding that mutates projects when templates change).

## 5.3 Initiation gate (Initiating → Active) — no bypass

Minimum to activate:

| Required                                                                                | Optional but prompted    |
| --------------------------------------------------------------------------------------- | ------------------------ |
| Owner assigned                                                                          | Customer / programme     |
| Classification set                                                                      | Success criteria         |
| Delivery model set                                                                      | Execution characteristic |
| Governance Profile inherited/selected                                                   | —                        |
| ≥1 milestone **or** explicit milestone waiver allowed for model                         | Initial risk             |
| Target end date **or** waiver allowed for Product Delivery / continuous-style execution | Template notes           |
| **Initial Baseline** captured                                                           | —                        |
| Profile-mandated artefacts / checkpoints for activation                                 | —                        |

**L-D3:** Hard gate — no bypass.

## 5.4 Engineering readiness — Templates

| Dimension  | Detail                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Current    | None in APZ Projects product                                                                                                 |
| Reuse      | —                                                                                                                            |
| New        | Template registry (platform metadata), apply service, preview DTO                                                            |
| API        | `GET /api/v1/projects/templates` · `POST /api/v1/projects/:id/apply-template`                                                |
| Backend    | PostgreSQL template definitions; idempotent apply                                                                            |
| Migration  | N/A                                                                                                                          |
| Acceptance | Applying template is auditable; Blank creates zero fake milestones; org templates versioned; project independent after apply |

---

# 6. Governance (project-side)

## 6.1 Scope distinction

| Layer                                   | Owns                                                      |
| --------------------------------------- | --------------------------------------------------------- |
| **Enterprise Context · Governance/Law** | External obligations, policies — composed, not duplicated |
| **Project Control intent**              | Project decisions, approvals, risks, governance waits     |

Project governance is the **control plane for delivery**, not a second policy CMS.

## 6.2 Governance pack (from template / model)

- Required decision checkpoints (e.g. design approval, go-live approval)
- Approval bindings (Workflow when available)
- Escalation path (role or user)
- Cadence expectations (steering touchpoints as milestones or decisions)

## 6.3 Governance actions in lifecycle

Appear in Operational Queue group **Decisions** or **Attention** per W002 rules.  
Governance **Waiting** category used when blocked on governance party.

---

# 7. Commitments (lifecycle behaviour)

## 7.1 Role in lifecycle

Commitments are the atomic delivery promises from Initiating onward.

| Stage           | Commitment rules                                         |
| --------------- | -------------------------------------------------------- |
| Draft           | None (or staging only, not queued)                       |
| Initiating      | May create baseline commitments                          |
| Active          | Full CRUD; drive Health/Confidence/Queue                 |
| On Hold         | No new; existing freeze due pressure (display “On hold”) |
| Closing         | No new; open must be resolved, transferred, or waived    |
| Closed/Archived | Read-only                                                |

## 7.2 Fields (normative)

| Field              | Rule                                                           |
| ------------------ | -------------------------------------------------------------- |
| statement          | Required                                                       |
| owner              | Required                                                       |
| dueAt              | Required when status ≥ accepted                                |
| status             | proposed → accepted → in_progress → waiting → done / cancelled |
| waiters[]          | Optional                                                       |
| failureConsequence | Optional (W002)                                                |
| milestoneId        | Optional link                                                  |
| waitingId          | Set when status = waiting                                      |

## 7.3 Operational effects

- Overdue owner commitments → Queue Attention
- Waiters → Queue Waiting
- failureConsequence present → boost Business Impact weight (configurable factor)
- status waiting must link or create Waiting record

## 7.4 Engineering readiness

See W002 §Commitment API. Lifecycle enforces stage transition rules in Platform Service (not UI-only).

---

# 8. Milestones

## 8.1 Role

Milestones are **trajectory anchors** on the Delivery Timeline — moments that matter (W001), not vanity dates.

## 8.2 Fields

| Field                 | Rule                                           |
| --------------------- | ---------------------------------------------- |
| name · dueAt · status | Required                                       |
| owner                 | Required for Active                            |
| confidence            | High / Medium / Low (feeds project Confidence) |
| failureConsequence    | Optional                                       |
| dependencies          | Via dependency objects (§10)                   |
| exitCriteria          | Short text optional                            |

Statuses: `planned` · `at_risk` · `slipped` · `achieved` · `cancelled`.

## 8.3 Lifecycle rules

| Stage      | Rules                                                              |
| ---------- | ------------------------------------------------------------------ |
| Initiating | Seed from template; edit freely                                    |
| Active     | Slip emits Operational Change; may open Decision                   |
| Closing    | All non-cancelled milestones achieved, slipped-accepted, or waived |
| Closed     | Frozen                                                             |

## 8.4 Milestone surface

Opening a milestone (Planning intent) shows: status · dates · confidence · linked commitments · waits · risks · decisions · composed Context fragments · failureConsequence.

---

# 9. Decisions

## 9.1 Role

Decisions record **direction that delivery depends on**. Pending decisions degrade Confidence and fill Queue · Decisions.

## 9.2 Fields

| Field                          | Rule                                                  |
| ------------------------------ | ----------------------------------------------------- |
| title · status · decisionMaker | Required                                              |
| dueAt                          | Required when status = pending                        |
| options / outcome              | Outcome required to close                             |
| failureConsequence             | Optional — consequence of not deciding / wrong decide |
| links                          | commitments · milestones · risks                      |

Statuses: `pending` · `decided` · `deferred` · `cancelled`.

## 9.3 Lifecycle rules

- Active: pending past due → Queue Decisions + Confidence penalty
- Closing: no pending decisions (decide, defer with owner, or cancel)
- Emit Operational Change on decide

---

# 10. Risks

## 10.1 Role

Risks express **threats to delivery**. Critical/watch open risks drive Health and Confidence (W002 formulas).

## 10.2 Fields (align Wave A; extend)

Keep Wave A risk model; add optional `failureConsequence` (if risk materialises / if unmitigated).  
Categories may be template-seeded.

## 10.3 Lifecycle rules

- Closing: critical risks closed, accepted, or transferred with Decision
- On Hold: risks remain visible in Control; mitigation dates paused unless governance risk

---

# 11. Dependencies & Waiting

## 11.1 Operational dependency (first-class)

```text
Dependency {
  id · projectId
  fromType / fromId          // commitment | milestone | decision
  toType / toId              // same, or external reference
  kind                       // finishes_start | related | external
  failureConsequence?        // optional
  status                     // active | resolved | broken
}
```

Dependencies render on Delivery Timeline as edges. Broken/unresolved aged dependencies affect Confidence.

## 11.2 Waiting (lifecycle)

Waiting categories (**W002 approved**):

`Customer` · `Internal` · `Vendor` · `Governance` · `External Dependency`

| Stage   | Waiting behaviour                                     |
| ------- | ----------------------------------------------------- |
| Active  | Full; aged waits → Queue Waiting + Confidence         |
| On Hold | Active waits remain; chase still valid                |
| Closing | All waits resolved or explicitly waived with Decision |
| Closed  | Frozen                                                |

Creating Waiting from a commitment sets commitment status `waiting`.

---

# 12. Approvals

## 12.1 Ownership

| Concern                   | SoR                                                                      |
| ------------------------- | ------------------------------------------------------------------------ |
| Approval runtime          | **Workflow** (composed via Context + queue bridge) when available        |
| Project need for approval | Projects records **approval checkpoint** / Decision link                 |
| Degradation               | If Workflow unavailable: show Decision fallback + `approvalsUnavailable` |

**Decision proposal L-D4:** Projects does not become a second BPM engine. Approvals execute in Workflow; Projects surfaces checkpoints and queue rows.

## 12.2 Lifecycle checkpoints

Templates define named checkpoints (e.g. `go_live_approval`).  
Checkpoint states: `not_started` · `pending` · `approved` · `rejected` · `waived`.

Rejected go-live → Health Critical path + mandatory Decision.

---

# 13. Closure

## 13.1 Challenge: status = completed

**Reject** one-click complete.  
**Recommend** Closing stage with checklist.

## 13.2 Close intent

User selects **outcome type**:

| Outcome                 | Meaning                              |
| ----------------------- | ------------------------------------ |
| Delivered               | Objectives met                       |
| Delivered with variance | Met with accepted slips/scope change |
| Stopped                 | Intentionally stopped                |
| Superseded              | Replaced by another project          |

Requires short closure summary (mandatory).

## 13.3 Closure gate (Closing → Closed)

| Gate                     | Rule                                                                             |
| ------------------------ | -------------------------------------------------------------------------------- |
| Commitments              | No open `in_progress` / `accepted` / `waiting` without resolve/transfer/waive    |
| Decisions                | No `pending`                                                                     |
| Critical risks           | Closed / accepted / transferred                                                  |
| Waits                    | Resolved / waived                                                                |
| Approvals                | Required checkpoints approved or waived                                          |
| Lessons                  | Optional prompt; recommended link to Knowledge (compose later) — not blocking v1 |
| Final Operational Change | `Project closed — {outcome}`                                                     |

## 13.4 After Closed

- Portfolio: excluded from Attention; available under filter “Closed”
- Cockpit: read-only intents; History fully available
- Confidence frozen; Health shows Closed

---

# 14. Archival

## 14.1 Behaviour

- Removed from default Operational Workspace portfolio
- Searchable by users with permission
- Context compose may still resolve historical fragments
- Restore → **Closed** (not Active) with audit

## 14.2 Engineering readiness — Close / Archive

| Dimension  | Detail                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| Current    | `archiveProject` exists; completed status exists; no closure checklist                                     |
| Reuse      | archive API, project patch                                                                                 |
| Redesign   | Status model; close wizard                                                                                 |
| New        | `CloseProjectFlow`, closure checklist evaluator, reopen flow                                               |
| API        | `POST /api/v1/projects/:id/transitions` with body `{ to, reason, outcome? }` · `GET .../closure-readiness` |
| Backend    | Transition service enforcing gates; immutable transition audit                                             |
| Migration  | Map completed→closed; archived unchanged                                                                   |
| Acceptance | Cannot Closed with pending decisions; archive hidden from default strips; restore audited                  |

---

# 15. Stage × Workspace visibility

| Stage      | Overview metrics        | Queue                      | Portfolio strips    | Cockpit      |
| ---------- | ----------------------- | -------------------------- | ------------------- | ------------ |
| Draft      | Excluded                | Excluded                   | Filter “Draft” only | Draft banner |
| Initiating | Optional separate count | Excluded unless governance | “Initiating” badge  | Checklist    |
| Active     | Included                | Included                   | Default             | Full         |
| On Hold    | Included (Hold)         | Control/expiry only        | Hold badge          | Hold banner  |
| Closing    | Included                | Closure tasks              | Closing badge       | Checklist    |
| Closed     | Excluded default        | Excluded                   | Filter              | Read-only    |
| Archived   | Excluded                | Excluded                   | Filter privileged   | Read-only    |

---

# 16. Operational Changes across lifecycle

Emit on (non-exhaustive): stage transitions · milestone slip/achieve · risk escalate · decision recorded · wait start/resolve · approval checkpoint result · commitment block/complete · closure/archive/reopen.

Never emit: draft field typing · template preview · view events.

Rename: always **Operational Changes** (W002). Audit subsystem remains separate.

---

# 17. Permissions (logical product)

| Capability          | Draft/Init | Active | Hold    | Closing | Closed  | Archive    |
| ------------------- | ---------- | ------ | ------- | ------- | ------- | ---------- |
| View                | ✓          | ✓      | ✓       | ✓       | ✓       | privileged |
| Edit operating data | ✓          | ✓      | limited | limited | —       | —          |
| Transition forward  | manage     | manage | manage  | manage  | archive | restore    |
| Queue act           | —          | ✓      | limited | ✓       | —       | —          |

Map to APZHUB PermissionService keys at engineering time — do not expose backend role names in UI (007).

---

# 18. Failure Consequence (lifecycle-wide)

**Owner-approved (W002):** optional on:

- Commitments
- Milestones
- Decisions
- Operational dependencies
- Waiting (recommended; store on wait)

**Uses:**

1. Display on surfaces and queue rows (truncated)
2. Business Impact boost when present + severity high
3. Input to future Confidence calibration
4. Closure / risk acceptance narratives

Empty is valid — do not block create.

---

# 19. End-to-end happy path (normative narrative)

```text
1. PM initiates project → Identity + Outcome delivery + Go-live template
2. System seeds milestones (UAT, Go-live), governance checkpoints, wait SLAs
3. PM completes initiation gate → Active
4. Project appears on Operational Workspace strips with Health + Confidence + Pulse
5. Commitments created; one waits on Customer → Waiting + Confidence drop
6. Decision required for scope → Queue Decisions; inline decide
7. Milestone slips → Operational Change; Timeline updates; Pulse updates
8. Go-live approval via Workflow → checkpoint approved
9. PM starts Closing · outcome Delivered with variance · clears gates → Closed
10. Later PMO Archives → leaves default portfolio
```

---

# 20. Engineering readiness — summary matrix

| Area              | Current             | New / redesign                              | API impact             | Complexity |
| ----------------- | ------------------- | ------------------------------------------- | ---------------------- | ---------- |
| Status model      | 5 statuses          | 7 stages + transitions                      | transition API         | M          |
| Initiate flow     | 4-field create      | Wizard                                      | extend create          | M          |
| Templates         | None                | Registry + apply                            | templates API          | M–L        |
| Delivery model    | None                | Field + behaviour map                       | project field          | S–M        |
| Commitments       | Tasks/actions proxy | Commitment SoR + stage rules                | CRUD                   | L          |
| Milestones        | Wave A              | + confidence + failureConsequence + surface | extend                 | M          |
| Decisions / Risks | Wave A              | + failureConsequence + gates                | extend                 | S–M        |
| Dependencies      | Weak/none           | Dependency SoR + timeline edges             | CRUD                   | M–L        |
| Waiting           | None                | SoR + categories                            | CRUD                   | M          |
| Approvals         | None                | Checkpoint + Workflow bridge                | checkpoint API         | M–L        |
| Closure           | archive/complete    | Closing checklist                           | readiness + transition | M          |
| Archival          | archiveProject      | Default portfolio exclusion                 | filters                | S          |

---

# 21. Acceptance criteria (lifecycle)

1. User cannot mark Active without initiation gate.
2. Draft projects do not appear in default Operational Queue.
3. Health and Confidence both visible whenever project is Active+.
4. Waiting uses only approved categories.
5. Pulse ≤ 2 sentences; no AI path in v1.
6. Closing blocked while pending decisions exist.
7. Closed projects are read-only for delivery mutations.
8. Archived projects excluded from default portfolio strips.
9. Stage transitions emit Operational Changes; field noise does not.
10. Failure Consequence optional everywhere approved; never required to save.
11. Approvals degrade honestly when Workflow unavailable.
12. Legacy `completed` migrates to `closed` without data loss.

---

# 22. Decision register — Owner review (2026-08-06)

| ID        | Status               | Decision                                                                                                                                        |
| --------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **L-D1**  | **APPROVED**         | Seven-stage lifecycle only: Draft · Initiating · Active · On Hold · Closing · Closed · Archived                                                 |
| **L-D2**  | **APPROVED AMENDED** | Delivery models: Product · Project · Programme · Operational Initiative · Governance Initiative. Methodologies = execution characteristics only |
| **L-D3**  | **APPROVED**         | Hard initiation gate; no bypass                                                                                                                 |
| **L-D4**  | **APPROVED**         | Workflow executes approvals; Projects owns checkpoints / consumes outcomes                                                                      |
| **L-D5**  | **APPROVED**         | Guided wizard = only creation experience; four-field create deprecated                                                                          |
| **L-D6**  | **APPROVED AMENDED** | Versioned templates; system + organisation-specific; project independent after create                                                           |
| **L-D7**  | **APPROVED**         | Closing checklist mandatory; waivers audited                                                                                                    |
| **L-D8**  | **APPROVED**         | Archive leaves operational workspace; searchable; restore → Closed only                                                                         |
| **L-D9**  | **APPROVED**         | Mandatory Project Classification                                                                                                                |
| **L-D10** | **APPROVED**         | Governance Profile inherited on every project                                                                                                   |
| **L-D11** | **APPROVED**         | Baseline: Initial · Approved Re-baseline · History · Variance                                                                                   |
| **L-D12** | **APPROVED**         | Every transition: entry · exit · artefacts · approvals · audit — no implicit transitions                                                        |

**Engineering:** Do not implement until Owner authorises. Next design authority: **W004 — Operational Delivery**.

---

# 23. Explicit non-goals

- Full PPM / portfolio financials
- AI initiation or AI Pulse
- Rebuilding Workflow/BPM inside Projects
- Methodology certification (PRINCE2/SAFe as product modes)
- Implementation code

---

# 24. Approval gate

**Owner approved with amendments (2026-08-06).** This file is implementation authority for Project Lifecycle.

Operational day-to-day execution is specified in `W004-OPERATIONAL-DELIVERY.md`.
