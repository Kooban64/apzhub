# APZ Projects Release 3.0

# Product Design Workshop 006 — Resource & Team Management

**Document ID:** W006-RESOURCE-AND-TEAM-MANAGEMENT  
**Status:** APPROVED WITH AMENDMENTS (Owner review 2026-08-06) — implementation authority for Resource & Team Management  
**Mode:** Product design only · no code until Owner authorises engineering  
**Depends on:** W001–W005 (W002–W005 APPROVED WITH AMENDMENTS)  
**Continues:** `W007-COMMUNICATION-AND-COLLABORATION.md`  
**Authority:** Implementation specification for Resource & Team Management within APZ Projects (as amended). Boundary with APZ Time is **canonical**.

---

# 0. Product objective

Define how APZ Projects manages **delivery participation, accountability and operational ownership**.

| APZ Projects owns                                | APZ Time owns                              | HR / IdP owns                                        |
| ------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------- |
| Who is on the delivery                           | Time entries · timesheets · approved hours | Employment record · leave SoR (via Context/HR later) |
| Operational roles on project/programme           | Billable/non-billable time                 | Legal employer data                                  |
| Workload pressure (indicative)                   | Actual time spent                          | —                                                    |
| Escalation ownership · RACI-style accountability | —                                          | —                                                    |
| Stakeholders · external participants             | —                                          | Identity may federate via platform auth              |

**Reject:** timesheet UI, hour-by-hour utilisation grids, payroll, leave admin, CV databases as product identity.  
**Recommend:** crisp **Team · Assignment · Accountability · Workload · Stakeholder** model integrated into Cockpit intents and Portfolio capacity.

---

# 1. Design principles (normative)

| #   | Principle                                                                                      |
| --- | ---------------------------------------------------------------------------------------------- |
| R1  | Projects manages **participation**, not employment                                             |
| R2  | APZ Time is SoR for time — compose via Context / future connectors; never duplicate timesheets |
| R3  | Every Commitment, Decision, Risk, Wait, Exception has a clear **accountable owner**            |
| R4  | Teams are reusable delivery units; membership is dated                                         |
| R5  | Skills & availability are **operational signals**, not HR master data                          |
| R6  | Workload stays **indicative** (align PF-D5 / W005 capacity)                                    |
| R7  | External participants are first-class with constrained permissions                             |
| R8  | Escalation ownership is explicit — not inferred from org chart alone                           |
| R9  | Same UX language across Project · Programme · Initiative                                       |
| R10 | Challenge “assign a user to a project and done” — insufficient for enterprise accountability   |

---

# 2. Core objects

```text
Person (platform identity — Better Auth / APZHUB user)
Team
TeamMembership
DeliveryAssignment          // person|team → project|programme|initiative
OperationalRole             // accountable function on a scope
Responsibility (RACI cell)
SkillTag / PersonSkill      // lightweight
AvailabilitySignal          // operational, not HR leave SoR
Stakeholder
ExternalParticipant
EscalationPath
WorkloadProjection          // computed indicative
ResourceForecast            // computed indicative
```

---

# 3. Teams

## 3.1 Definition

A **Team** is a reusable named delivery unit (e.g. Payments Squad · PMO Core · Vendor-Alpha Onsite).

```text
Team {
  id · name · description?
  leadUserId
  status                    // active | inactive
  skillTags[]               // optional summary
  orgUnitLabel?             // display only — not HR org SoR
}
```

## 3.2 Membership

```text
TeamMembership {
  teamId · userId
  roleInTeam                // lead | member | contributor
  from · to?                // dated membership
  allocationPercent?        // indicative 0–100; not timesheet
}
```

## 3.3 UX

- Admin/PMO: Team directory (secondary nav under Portfolio / Settings)
- Project Delivery intent: “Teams on this delivery”
- Assign team → expands to members as individual assignments (editable)

**Decision proposal RT-D1:** Teams are first-class; project assignment may target Team or Person.

---

# 4. Operational roles

## 4.1 Challenge: free-text “role”

**Reject** unstructured role strings as the only model.  
**Recommend** a closed **Operational Role** catalogue (org-extendable) used for accountability.

### System roles (v1)

| Role                 | Typical accountability                            |
| -------------------- | ------------------------------------------------- |
| `project_owner`      | Overall delivery accountability                   |
| `delivery_lead`      | Day-to-day commitment execution                   |
| `planner`            | Milestones · baseline · timeline                  |
| `risk_owner`         | Risk register stewardship (may differ per risk)   |
| `decision_authority` | Default decisionMaker for project-level decisions |
| `governance_lead`    | Checkpoints · profile compliance                  |
| `customer_liaison`   | Customer waits · stakeholder cadence              |
| `technical_lead`     | Technical commitments                             |
| `programme_owner`    | Programme accountability                          |
| `sponsor`            | Initiative/programme sponsor                      |
| `pmo_partner`        | PMO oversight                                     |

Custom org roles allowed with stable keys.

## 4.2 Binding

```text
OperationalRoleAssignment {
  scopeType · scopeId       // project | programme | initiative
  roleKey
  principalType · principalId  // user | team
  from · to?
  isPrimary                 // one primary per roleKey per scope
}
```

Project Owner required before Active (W003 initiation gate — already requires owner; bind as `project_owner`).

---

# 5. Resource allocation (delivery assignment)

## 5.1 Definition

**Delivery Assignment** states that a person or team **participates** in a delivery scope for a period — not that they logged 37.5h.

```text
DeliveryAssignment {
  scopeType · scopeId
  principalType · principalId
  assignmentType            // core | contributing | advisory | external
  from · to?
  allocationPercent?        // indicative
  primaryRoleKey?           // links Operational Role
  notes?
}
```

## 5.2 Rules

- Core assignees appear in team roster by default
- Allocation % feeds workload projection only
- Overlapping assignments allowed; overload detection uses sum of % and commitment due counts
- Removing assignee with open owned commitments → block or reassign gate

## 5.3 UX

Cockpit → Delivery → **Team** surface (or Overview people strip).  
Programme: consolidated roster across member projects + programme-only roles.

---

# 6. Skills

## 6.1 Lightweight model

```text
SkillTag { key · label · category? }     // e.g. payments, java, pci, change-mgmt
PersonSkill { userId · skillKey · level? } // basic | working | expert — optional
```

**Not** a competency management system. Used for:

- Assignment suggestions (optional)
- Workload/resource forecast filters (“who has PCI?”)
- Team skill summary

Skills may sync from HR later via connector — Projects never becomes SoR for official competency.

**Decision proposal RT-D2:** Skills are optional tags; never block assignment.

---

# 7. Availability

## 7.1 Operational availability signal

```text
AvailabilitySignal {
  userId
  state                     // available | limited | unavailable
  from · to
  source                    // manual | imported_hint | unknown
  note?                     // no medical/HR detail
}
```

- Manual set by user/PMO for delivery planning
- Optional **hint** composition from Time/HR connectors later — labelled non-authoritative
- Leave/absence **authoritative** data remains outside Projects

Unavailable owners: forecast marks their commitments at risk; Queue may show Attention for delivery_lead.

---

# 8. Team workload

## 8.1 Indicative workload (normative)

Align W005 capacity — **no false precision**.

| Signal              | Definition                                                            |
| ------------------- | --------------------------------------------------------------------- |
| Commitment load     | Open accepted/in_progress/waiting commitments due in 7/14/30d         |
| Exception load      | Open Major/Critical exceptions owned                                  |
| Decision load       | Pending decisions where user is decisionMaker                         |
| Chase load          | Active waits where user is chase owner                                |
| Allocation pressure | Sum of indicative allocation % across Active scopes                   |
| Overload band       | Normal · Elevated · Overloaded (thresholds in Governance/PMO profile) |

## 8.2 UX

- Person sheet: workload band + contributing scopes
- Portfolio Capacity: owners Overloaded · Elevated
- Project Team surface: roster sorted by load band

Label: **Indicative operational load — not utilisation % from timesheets.**

## 8.3 Delivery Capacity (first-class)

**Delivery Capacity** is a first-class operational indicator of **delivery ability**, not time availability / HR capacity.

```text
DeliveryCapacity {
  scopeType · scopeId          // person | team | project | programme | portfolio
  band                         // sufficient | constrained | critical
  score                        // 0–100 explainable
  contributingFactors[]        // active assignments, critical commitments,
                               // waiting dependencies, delivery pressure, escalation load
  asOf
}
```

| Input                | Contribution                                   |
| -------------------- | ---------------------------------------------- |
| Active assignments   | Participation load                             |
| Critical commitments | Near-term delivery obligation density          |
| Waiting dependencies | External/internal wait exposure                |
| Delivery pressure    | Health/Confidence/exception pressure on scopes |
| Escalation load      | Open escalations owned / on path               |

Supports **portfolio decisions** (intervene, reassign, descope) — not scheduling or hour booking. Always show factors. Label distinct from Time availability.

## 8.4 Team Health (delivery metric)

**Team Health** measures delivery system health of a Team — **not** personnel performance.

| Indicator                        | Meaning                                           |
| -------------------------------- | ------------------------------------------------- |
| Delivery stability               | Slip/exception rate on team-owned objects         |
| Assignment pressure              | Workload / Delivery Capacity band of members      |
| Escalation frequency             | Escalations involving team principals             |
| Waiting exposure                 | Aged waits chased or owned by team                |
| Delivery confidence contribution | Aggregate confidence of scopes where team is core |

```text
TeamHealth { teamId · band · score · factors[] · asOf }
```

Display on Team directory and Programme/Project Team surfaces. Never framed as individual appraisal.

---

# 9. Responsibility assignment (RACI-style)

## 9.1 Model

```text
Responsibility {
  scopeType · scopeId
  objectType · objectId?    // optional: commitment|milestone|risk|decision|checkpoint|null=scope-default
  dimension                 // accountable | responsible | consulted | informed
  principalType · principalId
}
```

- Every Commitment requires **Accountable** (defaults to ownerUserId)
- **Responsible** may differ (doer vs owner)
- Consulted/Informed for stakeholders

## 9.2 Challenge: full RACI matrices everywhere

**Reject** forcing a complete RACI grid on every object.  
**Recommend:** mandatory Accountable on operational objects; RACI matrix UI at project/programme scope for key roles; per-object override when needed.

**RT-D5 (Owner):** Accountable mandatory; full RACI where required; simple accountability is default UX.

## 9.3 Operational Responsibility Matrix

Visual matrix exposing **accountability gaps immediately**.

**Rows:** Commitments · Milestones · Decisions · Risks · Exceptions · Checkpoints (filterable; Active/open by default).  
**Columns:** Accountable (required) · Responsible · Consulted · Informed (progressive).

| Signal                 | Behaviour                                     |
| ---------------------- | --------------------------------------------- |
| Missing Accountable    | Gap row — Attention for delivery_lead / owner |
| Owner unavailable      | Continuity flag (§14.5)                       |
| Overloaded Accountable | Capacity band marker                          |

Placement: Project/Programme Control (primary) · printable/export later. Not a sixth intent.

---

# 10. Escalation ownership

## 10.1 Escalation path

```text
EscalationPath {
  scopeType · scopeId
  severityMin               // Minor | Major | Critical
  levels[]: { order, principalType, principalId, slaHours }
}
```

Defaults from Governance Profile; override per project/programme.

## 10.2 Behaviour

Escalations are **rule-driven** considering:

- Severity
- Operational impact
- Governance Profile
- Delivery stage (e.g. Closing escalates faster for Critical)

| Severity | Default path (example)                        |
| -------- | --------------------------------------------- |
| Advisory | Owner only                                    |
| Minor    | Owner → delivery_lead                         |
| Major    | delivery_lead → project_owner → pmo_partner   |
| Critical | project_owner → programme_owner/sponsor → pmo |

Escalation changes Queue targeting and notifications (W007). Exception.escalationState advances when SLA breached.

---

# 11. Delivery accountability

## 11.1 Accountability rules (normative)

| Object     | Accountable required | Default                   |
| ---------- | -------------------- | ------------------------- |
| Project    | `project_owner`      | Initiation                |
| Commitment | ownerUserId          | Creator picks             |
| Milestone  | ownerUserId          | Planner / owner           |
| Decision   | decisionMakerUserId  | decision_authority role   |
| Risk       | owner                | risk_owner role default   |
| Waiting    | chaseOwnerUserId     | customer_liaison or owner |
| Exception  | owner at open        | object owner → path       |
| Checkpoint | governance_lead      | Profile                   |

No orphan operational objects in Active projects — validation on create/transition.

## 11.2 Accountability view

Control / Overview: “Accountability gaps” — objects missing owner / owner unavailable / owner overloaded.

---

# 12. Stakeholder management

## 12.1 Stakeholders

```text
Stakeholder {
  scopeType · scopeId
  principalType · principalId  // user | external
  interest                      // sponsor | customer | vendor | regulator | partner | other
  influence                     // low | medium | high
  engagementCadence?            // e.g. weekly
  notes?
}
```

Stakeholders may be **Informed/Consulted** without DeliveryAssignment (core team).  
Customer waits often link to stakeholder partyLabel.

## 12.2 UX

Cockpit Control or Overview → Stakeholders list.  
Not a CRM — no opportunity pipeline.

---

# 13. External participants

## 13.1 Definition

People outside the enterprise identity who still participate in delivery (vendors, customer SMEs).

```text
ExternalParticipant {
  id · displayName · organisation?
  email?
  linkedUserId?               // if later invited to platform
  status                      // invited | active | revoked
}
```

## 13.2 Permissions

- Constrained project-scoped access when linkedUserId present (PermissionService)
- Until linked: reference-only (named in waits/stakeholders/RACI) without login
- Never broad portfolio access by default

**Decision proposal RT-D4:** Externals are first-class participants; access least-privilege; unlinked allowed as named parties.

---

# 14. Resource forecasting

## 14.1 Purpose

Answer: **Where will delivery participation pressure be in 7/14/30 days?**  
Not headcount planning suite.

```text
ResourceForecast {
  windowDays: 7 | 14 | 30
  predictedPressure: normal | elevated | overloaded
  confidenceLevel
  contributingFactors[]       // due commitments, aged waits, exceptions, unavailable owners
  recommendedActions[]        // reassign · reduce WIP · escalate hiring/vendor (text)
  byPrincipal[]: { principalId, loadBand, dueCommitments, scopes[] }
}
```

Same explainability standard as delivery/portfolio forecasts.  
May compose Time **hints** later (“booked leave”) as non-SoR factors labelled as such.

## 14.2 Placement

- Portfolio Capacity / Forecast
- Programme Overview
- Project Team surface (project-local forecast)

---

# 15. Integration with existing workshops

| Workshop         | Integration                                            |
| ---------------- | ------------------------------------------------------ |
| W002 Queue       | Targets accountable / chase / decisionMaker principals |
| W003 Initiation  | Require project_owner + core team optional prompt      |
| W004 Commitments | Owner + waiters + accountable                          |
| W004 Exceptions  | Escalation paths by severity                           |
| W005 Capacity    | Uses workload projection from this model               |
| W005 Scorecard   | Optional “Overloaded owners” line already indicative   |

### Time composition

Enterprise Context / future Time connector may show “recent time activity” fragments.  
Projects **never** writes timesheets.  
Workload **never** claims to equal Time utilisation.

---

## 14.5 Delivery Continuity (operational only)

When a key accountable participant becomes **unavailable** (AvailabilitySignal or assignment end):

```text
ContinuityCase {
  principalId · scopeType · scopeId
  affectedCommitments[]
  affectedMilestones[]
  pendingDecisions[]
  openExceptions[]
  agedWaitsChasing[]
  recommendedReplacementRoles[]   // roleKeys to reassign — not HR succession
  status                          // open | mitigated | closed
}
```

- Surfaces in Control + Queue Attention for project_owner / delivery_lead
- Recommends **replacement roles**, not people-search from HR
- No HR functionality, performance, or offboarding workflows

---

# 15b. Team Context

Enterprise Context on Team / Project Team focus includes **delivery context** (composed, not duplicated):

- Relevant Knowledge
- Active governance obligations
- Linked Support issues
- Current Workflow stage / related approvals

Focus types extend with `team` where useful. Same composition principles as W002/W005.

---

# 16. UX placement (cockpit & portfolio)

| Surface            | Content                                                                          |
| ------------------ | -------------------------------------------------------------------------------- |
| Project Overview   | Owner · core team strip · accountability gaps · Delivery Capacity                |
| Project Delivery   | Team roster · assignments · workload · Team Health (if team assigned)            |
| Project Control    | Stakeholders · escalation · externals · Responsibility Matrix · Continuity cases |
| Programme Delivery | Consolidated roster · overload · capacity                                        |
| Portfolio Capacity | Delivery Capacity + indicative load + resource forecast                          |
| Admin              | Team directory · role catalogue · skill tags                                     |

Navigation remains operational intents — **Team is a surface**, not a sixth primary intent.

**Reject** a sixth “People” intent. Team ⊂ Delivery; Stakeholders / Matrix / Continuity ⊂ Control.

---

# 17. Permissions (logical)

| Action                   | Who                                            |
| ------------------------ | ---------------------------------------------- |
| Manage teams (directory) | PMO · admin                                    |
| Assign to project        | project_owner · delivery_lead · pmo            |
| Assign programme roles   | programme_owner · pmo                          |
| Edit escalation path     | governance_lead · pmo · owner                  |
| View workload            | assignees self · leads · pmo · portfolio roles |
| Manage externals         | owner · pmo                                    |
| View resource forecast   | leads · pmo · portfolio                        |

---

# 18. Operational Changes & History

Emit Operational Changes when:

- owner/accountable changes on material objects
- core team join/leave
- escalation path changes
- external added/revoked

Per-object history includes ownership changes (W004 O-D14).

---

# 19. Engineering readiness

| Area              | Current                                | New                                               | API                                     | Complexity |
| ----------------- | -------------------------------------- | ------------------------------------------------- | --------------------------------------- | ---------- |
| Project members   | Plane/workspace membership likely thin | DeliveryAssignment + roles                        | `/projects/:id/assignments` · `/roles`  | M–L        |
| Teams             | None                                   | Team SoR                                          | `/teams` · memberships                  | M          |
| Skills            | None                                   | tags                                              | `/skills` · person skills               | S–M        |
| Availability      | None                                   | signals                                           | `/availability`                         | S–M        |
| Workload          | None                                   | projection service                                | `/workload` · portfolio capacity evolve | M          |
| RACI              | None                                   | Responsibility rows                               | `/responsibilities`                     | M          |
| Escalation        | None                                   | paths on scope                                    | `/escalation-paths`                     | M          |
| Stakeholders      | None                                   | Stakeholder SoR                                   | `/stakeholders`                         | S–M        |
| Externals         | None                                   | ExternalParticipant                               | `/external-participants`                | M          |
| Resource forecast | None                                   | explainable projection                            | `/resource-forecast`                    | M          |
| Time              | Separate product                       | Context compose only                              | no Projects timesheet API               | S          |
| Migration         | ad-hoc members                         | map owner → project_owner assignment              | one-time                                | M          |
| Performance       | —                                      | workload precompute per user; avoid N+1 on roster | —                                       | M          |
| A11y              | —                                      | roster tables; load band text not colour-only     | —                                       | —          |
| Acceptance        | —                                      | §21                                               | —                                       | —          |

---

# 20. Acceptance criteria

1. Every Active project has a primary `project_owner`.
2. Commitments cannot reach `accepted` without owner.
3. Team assignment and person assignment both supported.
4. Workload UI always labelled indicative; no timesheet entry UI in Projects.
5. Availability signals never claim to be HR leave SoR.
6. Escalation paths drive Exception escalation by severity.
7. External participants can be named without login; linked users least-privilege.
8. Resource forecast returns pressure · confidence · factors · recommended actions.
9. No sixth cockpit intent named People/Team.
10. Skills never block assignment.
11. Accountable principal visible on commitment/milestone/decision/risk/wait/exception surfaces.
12. APZ Time remains sole timesheet SoR — no duplicate time write path.

---

# 21. Decision register — Owner review (2026-08-06)

| ID         | Status       | Decision                                                                                                                                             |
| ---------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RT-D1**  | **APPROVED** | Canonical boundary: Projects = participation/accountability/allocation/teams; Time = timesheets/hours/attendance/approvals; no overlap; never HR/WFM |
| **RT-D2**  | **APPROVED** | Teams reusable enterprise units; date-effective membership; organisational assets consumed by projects                                               |
| **RT-D3**  | **APPROVED** | Operational roles first-class; central catalogue; responsibility via roles not job titles                                                            |
| **RT-D4**  | **APPROVED** | Delivery Assignment = participation; allocation % indicative; no hour-based planning                                                                 |
| **RT-D5**  | **APPROVED** | Mandatory Accountable on artefacts; full RACI where required; simple accountability default                                                          |
| **RT-D6**  | **APPROVED** | Escalation rule-driven (severity · impact · profile · delivery stage)                                                                                |
| **RT-D7**  | **APPROVED** | Stakeholders = delivery participants; not CRM; externals via project relationships                                                                   |
| **RT-D8**  | **APPROVED** | Resource forecast 7/14/30 explains pressure; not detailed utilisation                                                                                |
| **RT-D9**  | **APPROVED** | Delivery Capacity first-class (ability, not time availability)                                                                                       |
| **RT-D10** | **APPROVED** | Operational Responsibility Matrix exposes gaps across key object types                                                                               |
| **RT-D11** | **APPROVED** | Team Health = delivery metric, not personnel metric                                                                                                  |
| **RT-D12** | **APPROVED** | Team Context composed (knowledge · governance · support · workflow)                                                                                  |
| **RT-D13** | **APPROVED** | Delivery Continuity on key-person unavailability — operational only                                                                                  |
| **RT-D14** | **APPROVED** | No sixth People intent; Team ⊂ Delivery; Matrix/Stakeholders/Continuity ⊂ Control                                                                    |

**Engineering:** Do not implement until Owner authorises. Next design authority: **W007 — Communication, Collaboration & Operational Coordination**.

---

# 22. Explicit non-goals

- Timesheets · time approval · billing
- HRIS · payroll · official org chart SoR · workforce management
- Full resource levelling · capacity booking calendars
- Learning management / certification SoR
- Implementation code

---

# 23. Approval gate

**Owner approved with amendments (2026-08-06).** This file is implementation authority for Resource & Team Management.

Boundary with APZ Time is **canonical**. Collaboration is specified in `W007-COMMUNICATION-AND-COLLABORATION.md`.
