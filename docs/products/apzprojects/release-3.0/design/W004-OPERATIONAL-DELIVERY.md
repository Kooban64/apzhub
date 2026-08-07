# APZ Projects Release 3.0

# Product Design Workshop 004 — Operational Delivery

**Document ID:** W004-OPERATIONAL-DELIVERY  
**Status:** APPROVED WITH AMENDMENTS (Owner review 2026-08-06) — implementation authority for Operational Delivery  
**Mode:** Product design only · no code until Owner authorises engineering  
**Depends on:** W001 locked · W002 APPROVED WITH AMENDMENTS · W003 APPROVED WITH AMENDMENTS  
**Continues:** `W005-PORTFOLIO-MANAGEMENT.md`  
**Authority:** Implementation specification for day-to-day operational execution in APZ Projects (as amended)

---

# 0. Product objective

Define **how projects are delivered day-to-day** once Active (and how execution behaves under On Hold / Closing).

This workshop is the authority for:

| Construct               | Role                                             |
| ----------------------- | ------------------------------------------------ |
| Commitments             | Atomic delivery promises                         |
| Milestones              | Trajectory anchors                               |
| Dependencies            | Structural relationships                         |
| Waiting                 | Calendar reality outside our control             |
| Decisions               | Direction delivery depends on                    |
| Risks                   | Threats to delivery                              |
| Checkpoints             | Governance gates (Projects) executed by Workflow |
| Delivery Health         | State **today**                                  |
| Delivery Confidence     | Outlook **from here**                            |
| Project Pulse           | ≤2 sentence operational summary                  |
| Operational forecasting | Near-term delivery outlook                       |
| Exception handling      | When plans break                                 |

**Success:** A PM can run the week from Cockpit **Delivery / Planning / Control** without thinking in Tasks, Tabs, or Registers as the product.

---

# 1. Design principles (normative)

| #   | Principle                                                                                   |
| --- | ------------------------------------------------------------------------------------------- |
| O1  | Execution language is **Commitments**, not tasks                                            |
| O2  | Health ≠ Confidence; always shown together when Active+                                     |
| O3  | Waiting is first-class; categories per W002                                                 |
| O4  | Failure Consequence optional on commitments, milestones, decisions, dependencies, waits     |
| O5  | Baselines protect original commitments (W003); day-to-day plan may move                     |
| O6  | Exceptions are explicit operational events — not silent date edits                          |
| O7  | Forecast is explainable rules first; no AI required for v1                                  |
| O8  | Checkpoints ≠ Decisions ≠ Approvals runtime — clear ownership                               |
| O9  | Entity tools remain secondary under Cockpit **More…**                                       |
| O10 | Every mutation that changes operational truth emits **Operational Changes** when meaningful |

---

# 2. Object model (execution layer)

```text
Project (lifecycle W003)
├── Governance Profile (inherited)
├── Classification · Delivery Model · Execution characteristic
├── Baselines[] (Initial + re-baselines)
├── Commitments[]
├── Milestones[]
├── Dependencies[]
├── Waiting[]
├── Decisions[]
├── Risks[]
├── Checkpoints[]          // project-side requirements
├── Delivery Health        // computed
├── Delivery Confidence    // computed
├── Project Pulse          // computed
└── Forecast               // computed window
```

Tasks (Plane) may **back** commitments; they are not the operational SoR for delivery truth.

---

# 3. Commitments

## 3.1 Definition

A **Commitment** is a promise that a named owner will make a statement true by a time, with optional waiters and optional failure consequence.

## 3.2 Schema (normative)

| Field                             | Required                 | Notes                                                                      |
| --------------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| id · projectId                    | ✓                        | Platform IDs                                                               |
| statement                         | ✓                        | What will be true                                                          |
| ownerUserId                       | ✓                        | Who delivers                                                               |
| dueAt                             | ✓ when status ≥ accepted |                                                                            |
| status                            | ✓                        | `proposed` · `accepted` · `in_progress` · `waiting` · `done` · `cancelled` |
| waiters[]                         |                          | Users / parties waiting on this                                            |
| failureConsequence                |                          | Optional                                                                   |
| milestoneId                       |                          | Optional anchor                                                            |
| waitingId                         |                          | Required link when status = `waiting`                                      |
| baselineVersionId                 |                          | Set if included in a baseline snapshot                                     |
| blockedByDependencyIds[]          |                          | Derived/allowed links                                                      |
| priority                          |                          | `normal` · `high` — feeds impact                                           |
| completionEvidence[]              |                          | Required on → done unless Governance Profile allows evidence-optional      |
| createdAt · updatedAt · createdBy | ✓                        | Audit fields                                                               |

### Completion evidence

Structured evidence on completed commitments:

`Document` · `Approval` · `Deliverable` · `External Reference` · `Verification Note`

Each item: type · reference/label · optional URI/doc id · recordedBy · recordedAt.  
**Completion without evidence** is configurable per Governance Profile (default: evidence required for Project Delivery / Regulatory classification).

## 3.3 State transitions

```text
proposed → accepted → in_progress → done
                 ↘ waiting ↗
any (except done) → cancelled
```

| Transition            | Rules                                                             |
| --------------------- | ----------------------------------------------------------------- |
| → accepted            | Owner + dueAt required                                            |
| → in_progress         | Implicitly allowed from accepted; records start                   |
| → waiting             | Must create/link Waiting; chase owner set                         |
| waiting → in_progress | Waiting resolved                                                  |
| → done                | Evidence per profile; clears waiters pressure; Operational Change |
| → cancelled           | Reason required                                                   |

Milestones **never auto-complete**. Milestone → achieved requires explicit confirm plus **outcome evidence** that the milestone result was achieved (same evidence types as commitments, profile-configurable).

## 3.4 Day-to-day UX (Delivery intent)

- Dense commitment strips sorted by: blocked → overdue → due soon → waiting → remainder
- Inline: accept · start · log wait · complete · open surface
- Create commitment: statement · owner · due · optional consequence · optional milestone

## 3.5 Queue contribution

| Condition                        | Queue group |
| -------------------------------- | ----------- |
| Overdue / due today · I own      | Attention   |
| I am waiter · not owner          | Waiting     |
| Blocked and I must clear blocker | Attention   |

## 3.6 Engineering readiness

| Dimension  | Detail                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------ |
| Current    | Tasks + action items — no Commitment SoR                                                   |
| New        | Commitment entity, Delivery strips, create/edit surfaces                                   |
| API        | `CRUD /api/v1/projects/:id/commitments` · transition sub-resource                          |
| Backend    | Platform PostgreSQL; optional task link table                                              |
| Migration  | Optional import: map open high-priority tasks → proposed commitments (tooling, not silent) |
| Acceptance | Cannot set `waiting` without Waiting record; done emits Operational Change                 |

---

# 4. Milestones

## 4.1 Definition

A **Milestone** is a trajectory anchor — a moment that matters for delivery communication and baseline.

## 4.2 Schema

| Field                 | Required      | Notes                                            |
| --------------------- | ------------- | ------------------------------------------------ |
| name · dueAt · status | ✓             |                                                  |
| ownerUserId           | ✓ when Active |                                                  |
| confidence            | ✓ when Active | `high` · `medium` · `low`                        |
| failureConsequence    |               | Optional                                         |
| exitCriteria          |               | Short text                                       |
| baselineDueAt         |               | From active baseline (denormalised for variance) |
| sortKey               |               | Timeline order                                   |

Statuses: `planned` · `at_risk` · `slipped` · `achieved` · `cancelled`.

## 4.3 Operational rules

| Event                       | Behaviour                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| dueAt moves earlier/later   | Working plan change; variance vs baseline; if slip past baseline → suggest Decision / re-baseline per profile |
| → slipped                   | Operational Change; Pulse pressure; Confidence penalty                                                        |
| → achieved                  | Operational Change; may satisfy checkpoint                                                                    |
| Linked commitments all done | Suggest achieve (never auto without confirm)                                                                  |

## 4.4 Milestone surface (Planning)

Status · dates · baseline variance · confidence · exit criteria · linked commitments · dependencies · waits · risks · decisions · failureConsequence · composed Context (Documents/Knowledge) · primary actions (slip · achieve · re-baseline request).

## 4.5 Engineering readiness

Extend Wave A milestones API; add confidence, failureConsequence, baselineDueAt; replace table-only UX with surface + timeline markers.

---

# 5. Dependencies

## 5.1 Definition

A **Dependency** is a structural relationship that constrains delivery order or external readiness.

## 5.2 Schema

| Field              | Required | Notes                                                         |
| ------------------ | -------- | ------------------------------------------------------------- |
| fromRef            | ✓        | `{ type: commitment\|milestone\|decision, id }`               |
| toRef              | ✓        | same **or** `external` + label                                |
| kind               | ✓        | `finish_to_start` · `start_to_start` · `related` · `external` |
| status             | ✓        | `active` · `resolved` · `broken`                              |
| failureConsequence |          | Optional                                                      |
| ownerUserId        |          | Who watches this edge                                         |

## 5.3 Rules

- Timeline renders edges; critical path uses finish_to_start among dated nodes
- `broken` → Health watch/critical path + Queue Attention for owner
- Circular finish_to_start rejected at validation
- External deps often paired with Waiting (`External Dependency`)

## 5.4 Engineering readiness

New SoR + timeline edge model; `CRUD .../dependencies`; critical path on `GET .../timeline`.

---

# 6. Waiting

## 6.1 Categories (W002 locked)

`Customer` · `Internal` · `Vendor` · `Governance` · `External Dependency`

## 6.2 Schema

| Field                                                  | Required | Notes                                     |
| ------------------------------------------------------ | -------- | ----------------------------------------- |
| subject · category · since · chaseOwnerUserId · status | ✓        |                                           |
| partyLabel                                             |          | Named org/team                            |
| slaDays                                                |          | Default from template/profile by category |
| failureConsequence                                     |          | Optional                                  |
| linkedCommitmentId / decisionId / milestoneId          |          |                                           |
| resolvedAt · resolveNote                               |          | On resolve                                |

## 6.3 Ageing & effects

| Condition                              | Effect                                                            |
| -------------------------------------- | ----------------------------------------------------------------- |
| Active                                 | Shows on strips / Delivery Waiting register                       |
| Age > slaDays (or default 7d if unset) | **Aged** — Confidence penalty · Queue Waiting · Overview pressure |
| Resolve                                | Clears commitment waiting status if linked · Operational Change   |

## 6.4 Day-to-day UX

Log Wait action from commitment/milestone/decision.  
Chase owner nudges are operational actions (not consumer notifications spam) — sparse notify per later notifications workshop; in-product queue is primary.

---

# 7. Decisions

## 7.1 Definition

A **Decision** captures direction that execution depends on. Pending decisions are first-class drag on Confidence.

## 7.2 Schema

| Field                                | Required              | Notes                                          |
| ------------------------------------ | --------------------- | ---------------------------------------------- |
| title · status · decisionMakerUserId | ✓                     |                                                |
| dueAt                                | ✓ when pending        |                                                |
| context                              |                       | Short framing                                  |
| outcome                              | ✓ to close as decided |                                                |
| failureConsequence                   |                       | Of not deciding / delay                        |
| links[]                              |                       | commitments · milestones · risks · checkpoints |

Statuses: `pending` · `decided` · `deferred` · `cancelled`.

## 7.3 Queue & inline act

Pending where current user is decisionMaker → Queue **Decisions**.  
Inline: Decide (outcome required) · Defer (new due + reason) · Open.

## 7.4 Vs Checkpoint vs Approval

| Object     | Meaning                                                       |
| ---------- | ------------------------------------------------------------- |
| Decision   | Project records a choice                                      |
| Checkpoint | Governance Profile requires a gate at a point in delivery     |
| Approval   | Workflow runtime instance fulfilling a checkpoint (or ad-hoc) |

A checkpoint may **require** a Decision record and/or a Workflow approval outcome.

---

# 8. Risks

## 8.1 Role

Threats to delivery. Align Wave A; extend with optional failureConsequence (if materialises / if unmitigated).

## 8.2 Operational rules

| Severity / status  | Effect                                             |
| ------------------ | -------------------------------------------------- |
| critical + open    | Health → Critical path; Confidence −15 each (W002) |
| watch + open       | Confidence −8; Health Watch if no critical         |
| mitigation overdue | Queue Attention for owner                          |
| escalate           | Operational Change; optional Decision              |

Closing gate (W003): critical risks closed, accepted, or transferred with Decision.

---

# 9. Checkpoints

## 9.1 Definition

A **Checkpoint** is a project-side governance requirement inherited/specialised from the Governance Profile (and template).

Projects **do not** run BPM. Workflow executes approvals; Projects stores requirement + consumed outcome.

## 9.2 Schema

| Field                     | Required | Notes                                                          |
| ------------------------- | -------- | -------------------------------------------------------------- |
| key · name                | ✓        | Stable key e.g. `go_live_approval`                             |
| status                    | ✓        | `not_started` · `pending` · `approved` · `rejected` · `waived` |
| requiredByProfile         | ✓        | boolean                                                        |
| workflowBinding           |          | External ref when submitted                                    |
| dueAt / anchorMilestoneId |          | When the gate applies                                          |
| waiver                    |          | actor · reason · at — audited                                  |
| decisionId                |          | Optional linked Decision                                       |

## 9.3 Lifecycle

```text
not_started → pending (submitted to Workflow or manual pending)
pending → approved | rejected
any required → waived (authorised + audit only)
rejected → pending (resubmit) or forces Decision
```

Rejected checkpoints affecting go-live / release: Health Critical pressure + mandatory Decision.

## 9.4 Engineering readiness

`CRUD/list .../checkpoints` · `POST .../checkpoints/:id/submit` · `POST .../waive` · webhook/consume Workflow outcome adapter (Integration SDK later). Degrade with `approvalsUnavailable`.

---

# 10. Delivery Health

## 10.1 Definition

**Today’s** operational state. Enum: `Healthy` · `Watch` · `Critical`.

## 10.2 Computation (v1 rules — extend Wave A)

Evaluate in order (first match wins for Critical/Watch; else Healthy):

**Critical if any:**

- ≥1 open critical risk
- ≥1 aged Waiting on critical path / blocking go-live commitment
- ≥1 rejected checkpoint (release-class) unresolved
- ≥1 commitment overdue > configured grace **and** failureConsequence marked high-impact (or blocksGoLive)

**Watch if any (and not Critical):**

- open watch risks
- any aged Waiting
- milestone `at_risk` or `slipped` not yet re-baselined
- pending decisions past due
- Confidence band Low (optional Watch coupling — **recommend Yes** for visibility)

**Healthy:** otherwise.

Always display **text label** + semantic token. Always adjacent to Confidence.

## 10.3 Engineering readiness

Evolve `delivery-health` service; expose factors array like Confidence. Batch on portfolio projection.

---

# 11. Delivery Confidence

## 11.1 Definition

Forward-looking likelihood of successful delivery from current state. `0–100` + band High / Medium / Low.

## 11.2 Computation — delivery predictability (not schedule-only)

Confidence **shall never** be calculated solely from schedule. It represents **delivery predictability**.

**Mandatory input classes:**

| Input class                 | Examples                                             |
| --------------------------- | ---------------------------------------------------- |
| Waiting                     | Aged waits, wait volume on critical path             |
| Risks                       | Critical / watch open risks                          |
| Decision latency            | Pending past due; mean time pending                  |
| Dependency health           | Broken / unresolved dependencies                     |
| Milestone variance          | Slip vs baseline; low milestone confidence           |
| Commitment completion trend | Completion rate vs due slope; overdue stock          |
| Governance exceptions       | Open Major/Critical exceptions; rejected checkpoints |

```text
confidence = 100
  − 15 × criticalOpenRisks
  − 8  × watchOpenRisks
  − 10 × overdueCommitments
  − 6  × agedActiveWaits
  − 5  × unresolvedDecisionsPastDue
  − 4  × milestonesConfidenceLow
  − 4  × brokenOrBlockingDependencies
  − 3  × pendingRequiredCheckpoints
  − variancePenalty              // 0–15 milestone/commitment vs baseline
  − completionTrendPenalty       // 0–10 adverse completion slope
  − exceptionPenalty             // 0–15 from open Major/Critical exceptions
  − forecastSlipPenalty          // 0–10 from forecast (§13)
clamp 0–100

High ≥ 75 · Medium 45–74 · Low < 45
```

Classification / Delivery Model may apply published **weights**.  
**Why this score** UI lists every contributing factor with counts — no black box.

## 11.3 Independence

Healthy + Low Confidence is valid when today is calm but predictability is weak.

---

# 12. Project Pulse

## 12.1 Rules

- Maximum **two sentences**
- Deterministic templates · **no AI**
- Recomputed on read or on mutation events

## 12.2 Composition algorithm

1. Select highest-priority pressure phrase (one): aged wait · critical risk · rejected checkpoint · overdue blocking commitment · pending decision past due · on hold · closing
2. Select trajectory phrase (one): next milestone vs baseline · forecast on/behind · no pressure idle state
3. Concatenate; if only one applies, single sentence allowed

Examples:

```text
Waiting on customer for UAT sign-off (6 days). Go-live remains on baseline.
Critical risk open: vendor capacity. Next milestone Payment Go-Live at risk.
No operational pressure. Next commitment: security review (12 Aug).
```

---

# 13. Operational forecasting

## 13.1 Purpose

Answer: **What will delivery look like over the next 7 / 14 / 30 days?**  
Not a full Monte Carlo schedule engine in v1.

## 13.2 Forecast output (mandatory shape)

Every forecast **explains** — it does not merely predict.

```text
Forecast {
  windowDays: 7 | 14 | 30
  predictedOutcome: on_track | at_risk | off_track
  confidenceLevel: 0–100 + band          // predictability of this forecast
  contributingFactors: [ { code, label, weight, detail } ]
  recommendedActions: [ { label, targetRef?, rationale } ]
  commitmentsDue: { total, onTrack, atRisk, overdueProjected }
  milestonesInWindow: [...]
  waitsLikelyToAge: count
  decisionsDue: count
  checkpointsDue: count
  projectedConfidenceDelta: number
  narrative: ≤2 sentences (rules)
}
```

## 13.3 Projection rules (v1)

- Commitments with dueAt in window inherit risk if blocked, waiting aged, or owner overload (owner has >N due same week — configurable)
- Milestones: if linked commitments at risk → milestone at risk
- Slip projection: if current velocity of completion < remaining/due slope → `forecastSlipPenalty`
- No AI; show assumptions link (“How calculated”)

## 13.4 Placement

- Cockpit Overview: 14-day forecast strip
- Planning intent: 30-day optional
- Workspace Overview: portfolio count of projects with negative projectedConfidenceDelta

## 13.5 Engineering readiness

`GET .../projects/:id/forecast?window=14` · pure function over projections; cache short TTL.

---

# 14. Exception handling

## 14.1 What is an exception

An **Exception** is an explicit operational break from plan — not a quiet field edit.

Types (v1):

| Type                  | Trigger examples                                           | Required response                                         |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| `date_exception`      | Commitment/milestone moves beyond threshold vs baseline    | Reason · impact · optional Decision · suggest re-baseline |
| `scope_exception`     | Commitment cancelled / major statement change after accept | Reason · failureConsequence review                        |
| `dependency_break`    | Dependency → broken                                        | Owner · recovery plan · Decision if profile requires      |
| `wait_breach`         | Waiting exceeds SLA                                        | Chase escalation · Decision if aged beyond L2 threshold   |
| `checkpoint_rejected` | Workflow rejected                                          | Mandatory Decision                                        |
| `health_drop`         | Health → Critical                                          | Acknowledge in Control; ensure owner assigned             |
| `hold`                | Active → On Hold                                           | Already lifecycle-governed                                |

## 14.2 Exception object

```text
Exception {
  id · projectId · type
  severity                 // Advisory | Minor | Major | Critical
  status                   // open | acknowledged | concluded
  outcome?                 // Resolved | Accepted | Waived | Re-Baselined | Cancelled
  subjectRef · detectedAt
  reason · impactSummary
  failureConsequence?
  requiredDecisionId?
  escalationState          // none | notified | escalated — driven by severity + profile
  resolutionNote · concludedAt · concludedBy
}
```

### Severity → escalation (v1)

| Severity | Behaviour                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Advisory | Visible in Control; no queue unless aged                                                               |
| Minor    | Control + optional Attention for owner                                                                 |
| Major    | Queue Attention · Confidence penalty · escalate per profile cadence                                    |
| Critical | Queue Decisions/Attention · Health pressure · mandatory acknowledge · escalate immediately per profile |

### Resolution — no permanent opens

Every Exception **must** conclude with exactly one outcome:

`Resolved` · `Accepted` · `Waived` · `Re-Baselined` · `Cancelled`

Open exceptions beyond profile SLA generate escalation (not silent expiry). Closing/Closed gates require no open Major/Critical exceptions (waive/accept with audit allowed).

## 14.3 UX

- Exceptions list in Control intent (severity-sorted)
- Date move beyond tolerance **must** open exception flow
- Thresholds from Governance Profile
- Operational Change on open/conclude

## 14.4 Challenge: “just edit the date”

**Reject** silent reschedule past baseline tolerance. Minor moves inside tolerance update working plan only (variance still visible).

---

# 14.5 Operational History (per object)

Every operational object exposes its own **Operational History** timeline:

- state transitions
- ownership changes
- significant field updates (dates, severity, outcome, evidence)
- linked operational events (exceptions, waits, decisions, checkpoint results)

Not a raw audit dump — same “why should I care?” filter as portfolio Operational Changes, scoped to the object. Available on commitment, milestone, dependency, waiting, decision, risk, checkpoint, and exception surfaces.

`GET /api/v1/projects/:projectId/{objects}/:id/history`

---

# 15. Day-in-the-life (normative)

### Morning — Operational Workspace

1. Metric band: Health / Confidence / Attention
2. Queue · Decisions → inline decide
3. Queue · Attention → clear blockers / overdue
4. Queue · Waiting → chase aged customer wait
5. Portfolio strips — open Critical / Low Confidence project

### Inside Cockpit

6. Overview: Pulse · Health · Confidence · 14-day forecast
7. Delivery: work commitments; log wait
8. Planning: timeline; slip milestone → Exception → Decision
9. Control: risk escalate; checkpoint submit
10. History: Operational Changes since yesterday

### Mobile

Queue only — decide / acknowledge / open project sheet.

---

# 16. Cross-object interaction matrix

| When this happens    | Also happens                                  |
| -------------------- | --------------------------------------------- |
| Commitment → waiting | Waiting created; Confidence↓ if ages          |
| Waiting resolved     | Commitment resumes; Change event              |
| Milestone slipped    | Exception if > tolerance; Change; Pulse       |
| Dependency broken    | Exception; Attention queue                    |
| Decision decided     | Linked commitments unblocked; Change          |
| Checkpoint approved  | Gate clear; Change                            |
| Checkpoint rejected  | Exception; Decision required; Health pressure |
| Re-baseline approved | Baseline History++; variance resets; Change   |
| Risk → critical      | Health Critical; Confidence↓; Change          |

---

# 17. Cockpit intent mapping (execution)

| Intent   | Primary objects                                                           |
| -------- | ------------------------------------------------------------------------- |
| Overview | Pulse · Health · Confidence · Forecast · exception count · next milestone |
| Delivery | Commitments · Waiting · blockers                                          |
| Planning | Timeline · Milestones · Dependencies · Baseline variance                  |
| Control  | Risks · Decisions · Checkpoints · Exceptions                              |
| History  | Operational Changes                                                       |

---

# 18. API surface (execution)

| Method | Path                                 | Purpose                  |
| ------ | ------------------------------------ | ------------------------ |
| CRUD   | `/commitments`                       | Commitments              |
| POST   | `/commitments/:id/transitions`       | Status changes           |
| CRUD   | `/milestones`                        | Extend Wave A            |
| CRUD   | `/dependencies`                      | Dependencies             |
| CRUD   | `/waiting`                           | Waiting                  |
| CRUD   | `/decisions` · `/risks`              | Extend Wave A            |
| CRUD   | `/checkpoints`                       | Checkpoints              |
| POST   | `/checkpoints/:id/submit` · `/waive` | Workflow bridge / waiver |
| CRUD   | `/exceptions`                        | Exceptions               |
| GET    | `/delivery-health`                   | Factors + status         |
| GET    | `/delivery-confidence`               | Score + factors          |
| GET    | `/pulse`                             | Two sentences max        |
| GET    | `/forecast?window=`                  | Forecast                 |
| GET    | `/timeline`                          | Roadmap model            |
| GET    | `/baseline` · `/baseline/history`    | Baseline (W003)          |
| POST   | `/baseline/rebaseline`               | Approved re-baseline     |

All under `/api/v1/projects/:projectId/...` unless noted. Authz · validation · audit · correlation ID · envelope (010).

---

# 19. Performance · a11y · acceptance (execution)

| Concern      | Requirement                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| Performance  | Portfolio batch projection includes health, confidence, pulse, pressure without N+1; forecast cached ≤60s |
| A11y         | Status/confidence text; exception dialogs focus-trapped; timeline list fallback                           |
| Acceptance A | Health and Confidence always co-displayed on Active cockpit + strips                                      |
| Acceptance B | Pulse ≤2 sentences; no AI calls                                                                           |
| Acceptance C | Waiting categories enum enforced                                                                          |
| Acceptance D | Date move beyond tolerance creates Exception                                                              |
| Acceptance E | Checkpoint reject creates Exception + blocks quiet proceed                                                |
| Acceptance F | Forecast exposes factor assumptions                                                                       |
| Acceptance G | Commitment waiting requires Waiting SoR                                                                   |
| Acceptance H | Failure Consequence never required to save                                                                |

---

# 20. Decision register — Owner review (2026-08-06)

| ID        | Status       | Decision                                                                                        |
| --------- | ------------ | ----------------------------------------------------------------------------------------------- |
| **O-D1**  | **APPROVED** | Commitment primacy; tasks implementation detail; commitment-first UX                            |
| **O-D2**  | **APPROVED** | Milestones never auto-complete; evidence required for achieve                                   |
| **O-D3**  | **APPROVED** | Dependencies first-class; influence Confidence, Forecast, Critical Path, Queue                  |
| **O-D4**  | **APPROVED** | Waiting first-class; duration influences Confidence, Forecast, priority                         |
| **O-D5**  | **APPROVED** | Projects owns governance; Workflow owns approval execution                                      |
| **O-D6**  | **APPROVED** | Health · Confidence · Pulse mandatory; always displayed together                                |
| **O-D7**  | **APPROVED** | Forecast 7/14/30; always explain factors; no black-box                                          |
| **O-D8**  | **APPROVED** | Silent drift prohibited; Exceptions first-class                                                 |
| **O-D9**  | **APPROVED** | Exception severity: Advisory · Minor · Major · Critical                                         |
| **O-D10** | **APPROVED** | Exception outcomes: Resolved · Accepted · Waived · Re-Baselined · Cancelled — no permanent open |
| **O-D11** | **APPROVED** | Commitment completion evidence; profile may allow evidence-optional                             |
| **O-D12** | **APPROVED** | Confidence = predictability; multi-factor inputs (not schedule-only)                            |
| **O-D13** | **APPROVED** | Forecast = predicted outcome · confidence · factors · recommended actions                       |
| **O-D14** | **APPROVED** | Per-object Operational History timelines                                                        |

**Engineering:** Do not implement until Owner authorises. Next design authority: **W005 — Portfolio Management**.

---

# 21. Explicit non-goals

- AI forecasting or AI Pulse
- Full resource levelling / capacity planning suite
- Earned value / financial PPM
- Swipe mobile approvals (W002)
- Replacing Workflow
- Implementation code

---

# 22. Approval gate

**Owner approved with amendments (2026-08-06).** This file is implementation authority for Operational Delivery.

Portfolio experience is specified in `W005-PORTFOLIO-MANAGEMENT.md`.
