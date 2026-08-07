# APZ Projects Release 3.0

# Product Design Workshop 007 — Communication, Collaboration & Operational Coordination

**Document ID:** W007-COMMUNICATION-AND-COLLABORATION  
**Status:** APPROVED WITH AMENDMENTS (Owner review 2026-08-06) — implementation authority for collaboration  
**Mode:** Product design only · no code until Owner authorises engineering  
**Depends on:** W001–W006 (W002–W006 APPROVED WITH AMENDMENTS)  
**Continues:** `W008-REPORTING-AND-OPERATIONAL-REVIEW.md`  
**Authority:** Implementation specification for collaboration within APZ Projects (as amended)

---

# 0. Product objective

Make communication **contextual to delivery** — linked to operational objects, preserved in operational history — without depending on external messengers as the system of record for project dialogue.

| Succeeds when                                     | Fails when                                |
| ------------------------------------------------- | ----------------------------------------- |
| A Decision’s discussion is on the Decision        | Critical debate lives only in Slack/Teams |
| Commitment blockers are debated on the Commitment | Generic project chat buries signal        |
| Notices are institutional and sparse              | Product becomes a chat app with PM fields |
| Notifications respect Attention Engine (021)      | Modules spam users directly               |

**Hard reject:** generic chat rooms as product identity.  
**Hard recommend:** **object-threaded operational conversations** + structured notices + meeting outcomes that create/link Commitments.

---

# 1. Design principles (normative)

| #   | Principle                                                                                       |
| --- | ----------------------------------------------------------------------------------------------- |
| C1  | Every conversation has an **operational anchor** (object or scoped notice)                      |
| C2  | Communication is part of **Operational History**, not a side chat silo                          |
| C3  | Prefer structured outcomes (decision recorded, commitment created) over endless threads         |
| C4  | Mentions notify via platform Notification Framework — Projects publishes events only            |
| C5  | Watchers / subscriptions are explicit and permission-filtered                                   |
| C6  | Enterprise tone; no reactions-as-product, no emoji-as-status, no consumer “presence” theatre    |
| C7  | External participants communicate only within granted project scope                             |
| C8  | Audit-grade retention for operational conversations; separate from social ephemera (none in v1) |
| C9  | Do not replace email/Teams for informal chat — own **delivery-critical** coordination           |
| C10 | Align sparse notification philosophy (W001/W002) — in-product Queue remains primary for action  |

---

# 2. Object model

```text
Conversation                    // thread anchored to an object or notice
  ├── Message[]                 // posts in thread
  ├── Mention[]                 // structured refs inside messages
  └── Watchers[]                // principals watching this conversation

Announcement                    // project/programme/initiative broadcast
ProjectNotice                   // durable operational notice (pinned institutional)
MeetingOutcome                  // structured result of a meeting
  ├── linkedObjectRefs[]
  └── capturedActions[]         // → Commitments / Decisions / follow-ups

Subscription                    // user preference to follow a scope/object class
NotificationIntent              // event published to platform Attention Engine (not sent by Projects UI)
CommunicationHistory view       // filtered projection over conversations + notices + outcomes
```

---

# 3. Operational conversations (not chat)

## 3.1 Anchors (required)

A Conversation **must** anchor to exactly one primary:

| Anchor type                | When                                                                |
| -------------------------- | ------------------------------------------------------------------- |
| `project`                  | Project-level coordination (still an object — no orphans)           |
| `commitment`               | Discuss delivery of a promise                                       |
| `milestone`                | Trajectory / evidence debate                                        |
| `decision`                 | Decision discussion (pre/post)                                      |
| `risk`                     | Risk treatment discussion                                           |
| `exception`                | Exception handling discussion                                       |
| `checkpoint`               | Gate / approval coordination                                        |
| `dependency`               | Cross-team dependency coordination                                  |
| `waiting`                  | Chase / unblock (allowed; prefer commitment/exception when clearer) |
| `programme` / `initiative` | Programme/initiative coordination                                   |

**No orphan conversations.** Every thread has a required operational anchor.

**Challenge:** Free-floating “#general” chat without an object.  
**Reject.** Project-anchored threads prompt to link/create commitment/decision when message implies work.

## 3.2 Conversation schema

```text
Conversation {
  id · projectId · programmeId?
  anchorType · anchorId          // required — no orphans
  conversationType               // Discussion | Decision | Clarification |
                                 // Escalation | Review | Resolution
  title?                         // defaults from anchor
  status                         // open | resolved | locked
  createdBy · createdAt
  lastMessageAt
  watcherPrincipalIds[]
}
```

**Conversation types** improve filtering and reporting. Default type suggested from anchor (e.g. Decision anchor → type Decision).

```text
Message {
  id · conversationId
  body                           // rich text constrained (links, mentions, object refs)
  authorPrincipalId
  createdAt · editedAt?
  messageType                    // comment | status_note | system
  linkedObjectRefs[]             // additional refs
  createsOutcomeHint?            // UI affordance only
}
```

## 3.3 Resolution

### Decision conversations (mandatory outcome)

Every **Decision**-type / Decision-anchored conversation **shall conclude** with a recorded operational outcome:

`Approved` · `Rejected` · `Deferred` · `Superseded` · `Cancelled`

No unresolved decision threads when the Decision leaves `pending` (or conversation is resolved). Outcome written to Decision record + unified Communication Timeline.

### Other conversations

Exceptions/Checkpoints/Escalation types should be resolvable with summary → object history.  
Locked when parent scope Closed/Archived (read-only).

## 3.4 UX placement

- Object surface → **Discussion** panel (right or below) — not a separate messenger app
- Control/Delivery lists show unread discussion indicator (permissioned)
- No global “Chat” nav item

**Decision proposal CC-D1:** Object-anchored conversations only as primary model; no generic chat hub.

---

# 4. Decision · Commitment · Risk discussions

| Object     | Discussion norms                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Decision   | Default open while `pending`; on `decided`, conversation auto-resolves with outcome summary link |
| Commitment | Discuss blockers/evidence; “Log Waiting” / “Complete with evidence” CTAs from thread             |
| Risk       | Treatment options; escalate creates Exception + link                                             |
| Exception  | Coordination until concluded; severity visible in thread header                                  |
| Milestone  | Evidence toward achieve; cannot achieve from chat alone                                          |

Deep link format: `/workspace/projects/{id}/{intent}?obj={type}:{id}&panel=discussion`

---

# 5. Mentions

```text
Mention {
  messageId
  principalType · principalId    // user | team | roleKey (e.g. @project_owner)
  notifiedEventId?
}
```

- `@person` · `@team` · `@role` supported
- Role mention expands to current assignees of that Operational Role on scope
- Publishes `projects.mention_created` (past tense) to Event Bus → Attention Engine
- Mentions never grant permissions

---

# 6. Announcements

Time-bound broadcast to scope participants.

```text
Announcement {
  scopeType · scopeId            // project | programme | initiative
  title · body
  priority                       // info | important | critical
  audience                       // core | assignees | stakeholders | custom principals
  validFrom · validTo            // validity period — auto-expire at validTo
  authorPrincipalId
  acknowledgeRequired            // where required (typically critical)
  acknowledgements[]
  status                         // active | expired | withdrawn
}
```

- Appears in Overview banner while active + Communication Timeline
- Critical + acknowledgeRequired → Queue Attention until acked by audience
- Not a substitute for Exceptions

---

# 7. Project notices

Persistent operational guidance (distinct from time-bound announcements).

Examples: “Customer change freeze until 12 Aug” · “Production access via CAB only”.

```text
ProjectNotice {
  scopeType · scopeId
  title · body
  status                         // active | withdrawn
  pinned                         // true for Overview strip
  version                        // increments on edit
  versionHistory[]               // prior body · actor · at
  authorPrincipalId · createdAt
}
```

- Only **authorised** users may publish (owner · delivery_lead · governance_lead · pmo)
- Version history mandatory on edit
- Pinned notices on Cockpit Overview under Pulse (secondary — not replacing Pulse)

---

# 8. Meeting outcomes

## 8.1 Challenge: meeting notes as orphan docs

**Reject** dumping minutes into Documents only.  
**Recommend** structured **Meeting Outcome** that captures operational results.

```text
MeetingOutcome {
  id · scopeType · scopeId
  heldAt · title
  attendeePrincipalIds[]
  summary                        // ≤ short institutional summary
  decisionsRecorded[]            // create/link Decision
  commitmentsCaptured[]          // create/link Commitment
  risksRaised[]                  // create/link Risk
  actionsCaptured[]              // follow-ups → commitments
  linkedObjectRefs[]
  recordingRef?                  // Document Context ref — not SoR duplicate
}
```

## 8.2 Action capture flow

1. Record outcome
2. Create/link **Commitments** · **Decisions** · **Risks** · follow-up actions
3. Emit Operational Change `Meeting outcome recorded`
4. Residual discussion on anchored conversation

Meeting notes **without** operational outcomes are discouraged as sole artefact.

---

# 9. Notifications

## 9.1 Ownership (platform 021)

| Layer                                     | Responsibility                                        |
| ----------------------------------------- | ----------------------------------------------------- |
| APZ Projects                              | Publishes domain events                               |
| Attention Engine / Notification Framework | Decides delivery (in-app · email · digest · suppress) |
| User preferences                          | Channels · quiet hours · subscription density         |

Projects **shall not** implement a parallel notification sender.

## 9.2 Event classes (v1 publish)

| Event                                    | Typical attention                                            |
| ---------------------------------------- | ------------------------------------------------------------ |
| `mention_created`                        | In-app + optional email                                      |
| `conversation_message_created` (watched) | In-app                                                       |
| `announcement_published`                 | In-app; critical → stronger                                  |
| `announcement_ack_required`              | Queue + notify                                               |
| `meeting_outcome_recorded`               | Watchers / attendees                                         |
| Object events already in W004            | Existing Operational Changes → optional notify if subscribed |

## 9.3 Sparse by default

- No notify on every comment unless watched or mentioned
- Digests preferred for low-severity conversation traffic
- Queue remains authoritative for **action** (W002)

---

# 10. Watchers

```text
Watcher {
  targetType · targetId          // conversation | object | scope
  principalId
  reason                         // explicit | owner_default | role_default
}
```

Defaults:

- Object Accountable auto-watches
- decisionMaker watches Decision
- Mentions add temporary watch (user can unfollow)

Watchers receive conversation events subject to Notification Framework + permissions.

---

# 11. Subscription model

User opts into classes of operational communication:

| Subscription                 | Default               |
| ---------------------------- | --------------------- |
| Objects I own                | On                    |
| Objects I watch              | On                    |
| Mentions                     | On                    |
| Project announcements        | On for core assignees |
| All project conversations    | **Off**               |
| Programme/initiative digests | Off / PMO on          |

Stored in platform Preference Service (023). Subscriptions **never** grant access.

**Decision proposal CC-D4:** Opt-in to broad conversation traffic; owners/mentions on by default.

---

# 12. Unified Communication Timeline (authoritative object history)

Every operational object exposes a **unified timeline** combining:

- Conversations (by type)
- Operational Changes
- Approvals / checkpoint outcomes
- Decisions
- Attachments (Document refs via Context — not duplicated bytes)
- Related Workflow events (composed, SoR-attributed)

This is the **authoritative operational history** for that object (supersedes split “comments vs audit” thinking for user-facing history). Platform compliance audit remains separate and non-UX.

### Filters

Conversation type · change class · principal · date · unresolved discussions only.

### Placement

Object surface → Timeline. Cockpit **History** intent aggregates scope-level unified timelines. No new primary nav; no global chat.

## 12.4 Search

Communication participates in **enterprise unified search** (020):

- Results preserve operational context
- Return **conversation within owning object** — never isolated messages as orphan hits
- Permission-filtered at query time

## 12.5 Operational Digests

Configurable digests (user/PMO preferences):

`Daily` · `Weekly` · `Milestone` · `Exception`

Summarise operational activity for a scope. **Attention Engine determines delivery** (channel · suppress · batch). Projects only publishes digest-source events / projections.

---

# 13. Coordination patterns (day-to-day)

| Need                           | Use                                             |
| ------------------------------ | ----------------------------------------------- |
| Debate a pending Decision      | Decision discussion                             |
| Unblock a Commitment           | Commitment discussion → Log Waiting / Exception |
| Tell everyone about freeze     | Project Notice (+ Announcement if time-bound)   |
| Steer after steering committee | Meeting Outcome → Commitments/Decisions         |
| Pull someone in                | Mention + optional watch                        |
| Follow quietly                 | Watch / subscribe                               |

---

# 14. Permissions & externals

- Read/write conversation requires object/scope view permission
- External participants: only anchors they can access
- Announcements: publish = owner/delivery_lead/pmo; read = assignees+stakeholders per settings
- Editing messages: author within short window; after that append-only correction note (enterprise integrity)

---

# 15. Relationship to Enterprise Context

Context may compose **linked Documents** (agenda packs) and **Workflow** approval comments as fragments — attributed to their SoR.  
Projects conversations remain Projects SoR. No syncing full Slack histories into Projects as authority.

---

# 16. Mobile

- Mentions · ack-required announcements · watched threads with Decision/Attention relevance
- Full meeting outcome capture = desktop/tablet
- No chat-grid home

---

# 17. Accessibility & tone

- Threads as readable lists; landmarks for discussion panel
- `resolved` / `locked` announced to AT
- No emoji reactions in v1 (challenge consumer pattern — **reject**)
- Institutional language in system messages

---

# 18. Engineering readiness

| Area             | Current                | New                                             | API                            | Complexity |
| ---------------- | ---------------------- | ----------------------------------------------- | ------------------------------ | ---------- |
| Discussions      | None / Plane comments? | Conversation + Message SoR                      | `/conversations` · `/messages` | L          |
| Mentions         | None                   | Parse + mention rows + events                   | on message create              | M          |
| Announcements    | None                   | Announcement SoR                                | `/announcements`               | M          |
| Notices          | None                   | ProjectNotice SoR                               | `/notices`                     | S–M        |
| Meeting outcomes | None                   | MeetingOutcome + capture actions                | `/meeting-outcomes`            | M–L        |
| Watchers         | None                   | Watcher rows                                    | `/watchers`                    | M          |
| Subscriptions    | Prefs stub             | Preference keys                                 | Preference Service             | M          |
| Notifications    | Platform framework     | Event manifests (029)                           | publish only                   | M          |
| History view     | Operational Changes    | Communication segment                           | query API                      | M          |
| Migration        | —                      | optional import none                            | —                              | —          |
| Performance      | —                      | paginate messages; unread counters denormalised | —                              | M          |
| Acceptance       | —                      | §20                                             | —                              | —          |

Platform Event SDK: define `event.yaml` for mention, announcement, meeting_outcome, conversation_message (watched).

---

# 19. Acceptance criteria

1. No global Chat hub in primary nav.
2. Every conversation has a required operational anchor — no orphans.
3. Conversation type is set and filterable.
4. Decision conversations conclude with Approved/Rejected/Deferred/Superseded/Cancelled.
5. Meeting outcomes can create Commitments · Decisions · Risks · follow-ups.
6. Mentions publish events; Projects does not deliver notifications directly.
7. Announcements auto-expire; notices have version history.
8. Object exposes unified Communication Timeline.
9. Search returns conversation in owning object context.
10. Digests configurable; Attention Engine delivers.
11. No emoji/typing/presence/social features.
12. Broad “all conversations” subscription defaults Off.

---

# 20. Decision register — Owner review (2026-08-06)

| ID         | Status       | Decision                                                                                                                    |
| ---------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **CC-D1**  | **APPROVED** | Object-anchored only (Project · Commitment · Milestone · Decision · Risk · Exception · Dependency · Checkpoint); no orphans |
| **CC-D2**  | **APPROVED** | Announcements: validity · audience · priority · ack where required; auto-expire                                             |
| **CC-D3**  | **APPROVED** | Notices: persistent guidance; version history; authorised publishers only                                                   |
| **CC-D4**  | **APPROVED** | Meeting outcomes create Commitments · Decisions · Risks · follow-ups; notes-only discouraged                                |
| **CC-D5**  | **APPROVED** | Mentions/watchers/subscriptions minimal by default; object-based; avoid fatigue                                             |
| **CC-D6**  | **APPROVED** | Projects publishes events; Attention Engine delivers; never direct notify                                                   |
| **CC-D7**  | **APPROVED** | Reject global chat · emoji · typing · presence · social                                                                     |
| **CC-D8**  | **APPROVED** | Conversation types: Discussion · Decision · Clarification · Escalation · Review · Resolution                                |
| **CC-D9**  | **APPROVED** | Decision conversations conclude with Approved · Rejected · Deferred · Superseded · Cancelled                                |
| **CC-D10** | **APPROVED** | Unified Communication Timeline = authoritative object operational history                                                   |
| **CC-D11** | **APPROVED** | Operational Digests (Daily · Weekly · Milestone · Exception) via Attention Engine                                           |
| **CC-D12** | **APPROVED** | Search returns conversation in owning object context — never isolated messages                                              |

**Engineering:** Do not implement until Owner authorises. Next design authority: **W008 — Reporting, Executive Intelligence & Operational Review**.

---

# 21. Explicit non-goals

- Slack/Teams/email replacement for informal chat
- Video meetings / calendar SoR
- Real-time typing indicators · presence · emoji reactions
- Social feed · likes · polls-as-engagement
- AI meeting summarisation (future)
- Implementation code

---

# 22. Approval gate

**Owner approved with amendments (2026-08-06).** This file is implementation authority for collaboration.

Reporting is specified in `W008-REPORTING-AND-OPERATIONAL-REVIEW.md`.
