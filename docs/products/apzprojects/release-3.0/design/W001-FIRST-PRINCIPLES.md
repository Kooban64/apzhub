# APZ Projects 3.0 — Product Design Workshop 001

**Status:** DESIGN LOCK (first principles)  
**Mode:** Product Design — implementable experience direction  
**Benchmark:** Replace Jira · Plane · Asana · Monday · Microsoft Project — by being better, not by copying

---

## First principle

People do not manage projects.  
**People manage commitments.**

A project is a collection of commitments that must become reality.

Everything in APZ Projects answers that truth.

---

## The login promise

When a Project Manager opens APZ Projects, they do **not** see a nav dump:

```text
Projects · Templates · Members · Milestones · Tasks · Reports
```

They see **one question, immediately**:

# What needs my attention?

Not after navigation. Not after filters. Immediately.

---

## HOME — Attention (alive, not static)

```text
Good morning, {name}.

You have:
🔴 3 projects at risk
🟡 5 milestones due this week
🟢 27 work items completed yesterday
🔵 2 approvals waiting
🟣 One customer has not responded in six days
⚫ Team velocity dropped 18%
```

**Interaction rule:** One click → you are working on that commitment or project.

This screen is the product’s heartbeat. It is not a dashboard of widgets for decoration.

---

## MY PROJECTS — Story cards (not tables)

Each card tells a story without opening the project:

| Signal            | Example                      |
| ----------------- | ---------------------------- |
| Name              | Digital Banking              |
| Progress          | ████████░░ 82%               |
| Health            | Healthy / At risk / Critical |
| Next milestone    | date                         |
| Risks             | count                        |
| Decisions         | count                        |
| Waiting           | count                        |
| Customer blockers | count                        |

**No click required to understand.** Click opens the Project Cockpit.

---

## PROJECT — Cockpit (not tabs)

Tabs are forbidden as the primary mental model:

```text
Overview · Tasks · Files · Risks · Budget · People   ← NOT this
```

### Layout

| Region     | Content                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------- |
| **Left**   | Timeline · Milestones · Deliverables                                                                |
| **Center** | Current focus · Today’s work · Blockers · Approvals · Recent activity                               |
| **Right**  | Enterprise Context — Knowledge · Governance · Documents · Support · Workflow · Health · AI (future) |
| **Bottom** | Activity Stream (Teams / Slack / GitHub energy — everything happening)                              |

**Rule:** No hunting. Context comes to you. Navigation is secondary, not the product.

---

## MILESTONE — A moment that matters

Opening a milestone is not opening “a record.” It is opening a commitment surface.

Example: **PAYMENT GO-LIVE**

| Facet        | Shows                 |
| ------------ | --------------------- |
| Status       | On Track / …          |
| Owner        | person                |
| Due          | date                  |
| Confidence   | %                     |
| Dependencies | ready / blocked       |
| Approvals    | outstanding / clear   |
| Documents    | required count (refs) |
| Risks        | count                 |
| Knowledge    | lessons (refs)        |
| Governance   | policies (refs)       |
| Support      | incidents (refs)      |

**APZHUB differentiator:** You did not open Workflow, Documents, Support, Knowledge, Law, or Analytics. They composed into the milestone.

---

## WORK — Commitments (not task lists)

Reject momentum-free task lists as the soul of the product.

Every **Commitment** answers:

| Question                     | Required |
| ---------------------------- | -------- |
| WHO is committing?           | yes      |
| WHAT are they committing to? | yes      |
| WHEN must it happen?         | yes      |
| WHO is waiting?              | yes      |
| WHAT happens if it fails?    | yes      |

Work has meaning because failure and waiting are first-class.

_(Engine may still store work items; the product language and UX are Commitments.)_

---

## TIMELINE — Roadmap first

| Default | Beautiful roadmap — Linear energy: smooth, animated, zoom, pan, dependencies, milestones, critical path, drag |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| Gantt   | Available when needed — not the default identity                                                              |

---

## REPORTS — Questions, not a catalogue

Not 200 reports. Questions — Analytics DNA.

```text
Why is this project late?
→ Three milestones slipped.
  One approval delayed.
  Velocity dropped.
  Two developers absent.
```

Answer. Done.

---

## NOTIFICATIONS — Only what matters

| Allowed examples           | Spam                 |
| -------------------------- | -------------------- |
| You became the blocker     | Digest noise         |
| Customer approval received | “Something changed”  |
| Risk increased             | Unactionable chatter |
| Milestone likely to slip   |                      |

If it does not change what someone must do or know **now**, it does not notify.

---

## MOBILE — Different product, same commitments

Not a smaller website.

Phone answers one question:

# What do I need to do?

Approve · Reject · Comment · Update · Done.

---

## Design sequence (implementation-level, next)

1. Home / Attention + My Projects cards
2. Project Cockpit
3. Commitments
4. Milestones
5. Risks
6. Decisions
7. Resources
8. Roadmaps
9. Reports (questions)
10. Mobile
11. Enterprise Context (cockpit right + milestone surfaces)
12. AI — later

Vision / personas documents may emerge **after** design — they are not gates.

---

## Non-negotiables from Workshop 001

1. Attention before navigation
2. Commitments before task bureaucracy
3. Cockpit before tabs
4. Context composed into work — never a scavenger hunt
5. Questions before report menus
6. Mobile is triage, not a shrunk desktop
7. Leapfrog — do not clone Plane/Jira/Monday
