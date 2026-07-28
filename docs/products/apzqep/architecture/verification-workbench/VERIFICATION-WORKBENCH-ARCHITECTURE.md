# APZQEP-ARCH-010  
# Verification Workbench Architecture  
# Owner Architecture Specification

| Field | Value |
| --- | --- |
| Programme | **APZQEP-ARCH-010** |
| Title | **Verification Workbench Architecture** |
| Classification | Owner Architecture Specification |
| Product | APZ QEP (APZ Quality Engineering Platform) |
| Platform baseline | APZHUB Platform 1.4 — CERTIFIED |
| Shell baseline | Documents **005**, **016**, **017**, **018**, **019**, **020**, **021**, **022**, **023** |
| Design System | Document **006** / UI Component SDK **028** |
| Workbench grammar | **APZQEP-ARCH-006** — ACCEPTED / CLOSED / COMPLETE |
| Verification architecture | **APZQEP-ARCH-009** — ACCEPTED / CLOSED / COMPLETE |
| Domain baseline | **APZQEP-ENG-040A** — ACCEPTED / CLOSED / COMPLETE |
| Backend baseline | **APZQEP-ENG-040B** — ACCEPTED / CLOSED / COMPLETE · `@apzhub/qep-verification` **0.2.0** |
| Certified baselines | Requirements **1.0.0** · Traceability **1.0.0** — CERTIFIED / FROZEN |
| Downstream engineering | Separate Owner Engineering Programme Instruction — **NOT AUTHORISED** under this programme |
| Document revision | **1.0.0-arch** |
| Revision date | 2026-07-26 |
| Nature | Architecture only — implementation-independent |
| Status | **ACCEPTED / CLOSED / COMPLETE** |

**Normative language:** **must** = mandatory; **should** = strong recommendation; **may** = optional.

---

## 0. Authority and stop conditions

This specification defines the **Authoritative Verification Workbench Architecture** for APZ QEP.

It **extends** APZQEP-ARCH-006. It does **not** redesign the Platform Desktop Shell, docking, toolbar philosophy, command palette, or workspace session model.

It does **not** authorise:

- React, Next.js, components, routes, or UI packages;
- new REST APIs, DTO redesign, or persistence changes;
- Coverage Engine, Impact Engine, Evidence, Certification product engineering;
- AI agents, embeddings, or MCP servers;
- Workbench implementation of any kind.

```text
Architecture → Owner Acceptance → Owner Engineering Programme Instruction
  → Verification Workbench implementation (future)
```

Do **not** begin Workbench engineering until a separate **Owner Engineering Programme Instruction** is issued.

ARCH-009, ENG-040A, and ENG-040B remain authoritative for Verification semantics, lifecycle, permissions, audit, and APIs. The Workbench presents and operates on those facts; it must never invent alternate semantics or client-side business rules.

---

## 1. Purpose

Define the complete user interaction architecture for the **APZ QEP Verification Workbench**.

The Workbench shall become the primary workspace for:

- planning, assigning, executing, and governing Verification activities;
- exploring Verification Records and operational queues;
- inspecting subjects, authority, status, outcome, history, and timeline;
- performing decision workflows via server-authoritative actions;
- discovering Verifications through search and dashboard indicators;
- consuming future Evidence / Execution / Certification views without owning their truth.

This architecture is the blueprint for every future engineering screen involving Verification UX.

---

## 2. Relationship to ARCH-006

| ARCH-006 concept | Verification specialisation |
| --- | --- |
| One Workbench grammar | Reused unchanged |
| Explorer + Main + Inspector | Reused; Verification Explorer / Queues / Inspector specialise content |
| Relationship Explorer / Matrix | **Not** primary for Verification — queues and decision workflow replace matrix-first patterns |
| List-before-graph | Affirmed: **queue-first / list-first / inspector-first**; no mandatory graph |
| Server-authoritative `availableActions` | Mandatory; Verification actions from ENG-040B |
| Search via Platform 020 | Verification search entity `verification_record` |
| Persistence of UI state (018) | References + layout only — never Verification SoR copies |

Requirements Workbench and Traceability Workbench remain **distinct** experiences. Verification must not present Verification Records as Trace Links or Requirements Relationships.

---

## 3. Workbench principles (Verification)

| Principle | Rule |
| --- | --- |
| Artefact-centric | Primary object is the **Verification Record** (`ver_*`); subjects/targets are governed references |
| Queue-first operations | Operational queues are the primary day-to-day surface for assignees and reviewers |
| Server authority | Lifecycle, permissions, validation, assignment eligibility, `availableActions` — server only |
| Status ≠ Outcome | UI must present both dimensions distinctly; never conflate process state with conclusion |
| Semantic honesty | Product names: Verification, Subject, Authority, Outcome — never backend engine brands |
| No silent rewrite | Terminal / immutable Verifications remain visible; mutating actions disabled per server |
| Queues are presentation | Queue definitions filter/project server data; they do **not** own business rules |
| Analyse without dead-ends | Timeline, history, related artefacts open as panes/tabs |
| Progressive disclosure | Defaults calm; density via preferences (023) |
| Future slots only | Evidence / Execution / Certification / Coverage / Impact are presentation slots |
| AI / MCP as consumers | Never own Verification truth, lifecycle, or authority |

---

## 4. Alignment with Platform shell

Identical consumption model to ARCH-006 §3:

| Platform capability | Verification Workbench consumption |
| --- | --- |
| 005 / 016 Shell | Hosts chrome; module provides workspace content |
| 017 Navigation | Activity Bar → QEP → Verification sidebar → internal navigation |
| 018 Sessions | Named sessions, split views, layout restore; permission re-check |
| 019 Command Palette | Primary action surface for Verification commands |
| 020 Unified Search | `verification_record` provider; Workbench consumes results |
| 021 Notifications | Attention Engine; modules publish events only |
| 022 / 006 Tokens | Design tokens; Lucide icons only |
| 023 Preferences | Density, default queue, panel defaults — never grant permissions |
| 007 IAM | Permission family `qep.verification.*` (ENG-040B) |

The Verification Workbench is a **module workspace content model** inside the shell — not a parallel application.

---

## 5. Workspace model (canonical layout)

### 5.1 Layout diagram

```text
┌──────────────────────────────── Header / Global Toolbar ────────────────────────────────┐
│ Brand · Workspace switch · Global search · Command palette · Notifications · Account   │
├─ Activity Bar ─┬─ Module Sidebar ─┬──────────────── Main Workspace ──────────┬─ Right ─┤
│ QEP            │ Verification     │ Tabs · Breadcrumbs · Contextual actions  │ Panels  │
│ …              │ Queues / views   ├──────────────────────────────────────────┤ Inspect │
│                │ Saved filters    │                                          │ Timelin │
│                │ Dashboard        │  Explorer · Queue · Dashboard · Search · │ History │
│                │                  │  Decision · Assignment · History         │ Details │
│                │                  │  (optional split)                        │ Activ.  │
├────────────────┴──────────────────┴──────────────────────────────────────────┴─────────┤
│ Status Bar — status · outcome · selection · filter · queue · keyboard hints            │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Primary workspaces (normative catalogue)

| Workspace / view | Purpose | Authorisation class |
| --- | --- | --- |
| **Verification Explorer** | Filtered inventory of Verification Records | Core |
| **My Verification Queue** | Personal operational queue | Core |
| **Team Verification Queue** | Team / role operational queue | Core |
| **Verification Dashboard** | Indicator widgets (presentation) | Core |
| **Verification Inspector** | Selection properties and actions | Core (right rail) |
| **Verification Timeline** | Chronological interaction for one Verification | Core |
| **Verification History** | Append-only domain history | Core |
| **Verification Search** | Contextual + advanced search | Core |
| **Verification Assignment** | Assign / reassign / claim / release / delegate UX | Core |
| **Verification Decision** | Lifecycle decision interaction with confirmation | Core |
| **Future Evidence View** | Presentation slot | Future |
| **Future Execution View** | Presentation slot | Future |
| **Future Certification View** | Presentation slot | Future |

### 5.3 Pane rules

1. Explorer / Queues are left-primary navigational inventory; Inspector / Timeline / History / Details share the right rail with mode tabs.  
2. Only one **primary selection** (Verification id) at a time; multi-select enables bulk mode (§12).  
3. Dashboard may occupy Main Workspace as a first-class tab; widgets deep-link into queues/explorer.  
4. Split view confined to Main Workspace (ARCH-006 pattern).  
5. Decision and Assignment may open as focused Main Workspace flows or modal confirmations depending on action severity (§9).  
6. Pane collapse / size persist via 018/023 (references + UI state only).  
7. Future Evidence / Execution / Certification open as Main Workspace tabs when authorised — never as stub placeholder pages.

---

## 6. Verification Explorer model

### 6.1 Purpose

Primary navigational inventory for Verification Records — list-first, filterable, scalable.

### 6.2 Browseable fields

Explorer **must** support columns / facets for:

| Field | Notes |
| --- | --- |
| Verification ID | Platform id (`ver_*`) |
| Subject | Subject kind + resolved summary when available |
| Authority | Authority kind + actor display |
| Status | Lifecycle status (ENG-040A) |
| Outcome | Distinct from status; empty when none |
| Priority | When present on record / metadata |
| Age | Derived presentation from created/modified timestamps |
| Created | Timestamp |
| Modified | Timestamp |
| Assigned user | Assignee display when present |
| Assigned team | Team / role assignment display when present |
| Lifecycle | Status + terminal/mutable indicator |
| Version | Optimistic concurrency version |

### 6.3 Filtering, sorting, grouping

Explorer **must** support:

- Filtering by status, outcome, authority, subject kind, assignee, team, priority, age, created/modified ranges, lifecycle terminal/non-terminal;
- Sorting by any browseable field with stable secondary sort on id;
- Grouping by status, outcome, authority, assignee, team, subject kind, priority;
- Saved views (user preference references — 023; never duplicate SoR);
- Bulk selection for bulk actions when `availableActions` / bulk endpoints permit.

### 6.4 Hierarchy

Grouping hierarchies **must not** invent parentage absent from Verification / subject facts. Subject content remains owned by the source domain; Explorer shows **reference summaries only**.

---

## 7. Queue model

### 7.1 Purpose

Operational queues present filtered Verification sets for day-to-day work. Queues are **presentation only**. They do not own lifecycle rules, permissions, or assignment policy.

### 7.2 Normative queue catalogue (examples)

| Queue | Intent (presentation filter) |
| --- | --- |
| **My Work** | Assigned to current user and actionable |
| **Assigned** | Has assignee; not terminal |
| **Requested** | Status `requested` |
| **Awaiting Review** | Ready for review / completion decision (server criteria) |
| **Rejected** | Status `rejected` |
| **Expired** | Status `expired` |
| **Overdue** | Past due presentation when due metadata exists |
| **Completed** | Terminal successful completions (e.g. `verified`) |
| **Recently Updated** | Ordered by modified descending |

Additional product queues **may** be defined as saved views; they remain presentation filters over server queries.

### 7.3 Queue rules

1. Queue membership is computed from server query parameters / projections — never client invention of eligibility.  
2. Queue counts on sidebar/dashboard **must** use bounded server aggregations or paginated estimates — never full client scans.  
3. Opening a queue item selects the Verification and opens Inspector.  
4. Empty queue states are governed empty states (helpful, not stubs).  
5. Queue definitions must not hide terminal records from Explorer when users navigate by id/search.

### 7.4 My vs Team queues

| Queue class | Scope |
| --- | --- |
| My Verification Queue | Current actor assignee / claim scope |
| Team Verification Queue | Team / role scope per permissions |

Team queue visibility requires appropriate `qep.verification.*` permissions; absence yields governed unavailable / empty-permission state.

---

## 8. Assignment model

### 8.1 Purpose

Architect user interaction for ownership transfer and workload visibility. Domain commands remain server-authoritative (ENG-040A/B).

### 8.2 Supported interactions

| Interaction | UX intent |
| --- | --- |
| **assign** | Assign to user / team from requested (or permitted) state |
| **reassign** | Change assignee while mutable |
| **claim** | Current user takes ownership from queue (when action exposed) |
| **release** | Return to unassigned / requested queue (when action exposed) |
| **delegate** | Assign under delegated authority kind (when action exposed) |
| **queue routing** | Move presentation into target queue after successful command |
| **team assignment** | Assign to team / role subject |
| **ownership display** | Show assignee, team, authority, claim state in Inspector / Explorer |
| **workload visibility** | Present counts / occupancy indicators from server queries (no analytics engine) |

### 8.3 Assignment UX rules

1. Assignment controls appear only when corresponding `availableActions` include them.  
2. Confirmation required for reassign / release / delegate when target changes ownership.  
3. Workload visibility is presentation of server counts — not a scheduling optimiser.  
4. Client must never invent assignee eligibility.  
5. Failed assignment surfaces typed Platform errors; no raw backend leakage.

### 8.4 Ownership presentation

Inspector and Explorer **must** show:

- Assigned user (if any);
- Assigned team / role (if any);
- Authority kind (`user` · `role` · `system` · `delegated`);
- Last assignment event summary from timeline/history when available.

---

## 9. Decision workflow

### 9.1 Purpose

Architect user interaction for lifecycle transitions. Transitions are server commands; UI collects confirmation, warnings, and rationale.

### 9.2 Normative decision catalogue

| Decision | Typical command surface | UX class |
| --- | --- | --- |
| **request** | request | Confirm |
| **assign** | assign | Confirm + target |
| **start** | start | Confirm |
| **verify** / **complete** | complete (verified outcome path) | Confirm + outcome + rationale |
| **reject** | reject | Confirm + rationale (mandatory) |
| **expire** | expire | Confirm + warning |
| **withdraw** | withdraw | Confirm + rationale |
| **cancel** | cancel | Confirm + rationale |
| **supersede** | supersede | Confirm + successor reference + rationale |
| **retire** | retire | Confirm + warning |

Exact command names follow ENG-040A/B; Workbench labels use product language.

### 9.3 Confirmation, warnings, rationale

| Element | Rule |
| --- | --- |
| Confirmation | Required for all mutating decisions |
| Warnings | Shown for terminal / irreversible / supersession / expire / retire |
| Rationale | Required when server / policy requires; strongly recommended for reject / withdraw / cancel / supersede |
| Outcome capture | Distinct control from status; only when completing with outcome |
| availableActions gate | Decision controls rendered only from server action list |

### 9.4 Decision surfaces

1. **Inline Inspector actions** — primary for common transitions.  
2. **Verification Decision workspace** — focused flow for complete / reject / supersede with richer forms.  
3. **Command Palette (019)** — discoverable aliases for the same server actions.  
4. Bulk decisions only when server exposes bulk-safe actions; otherwise disabled with explanation.

### 9.5 Status ≠ Outcome in decisions

Completing a Verification **must** capture Outcome separately from Status transition. UI copy must not say “set status to Verified” when meaning outcome; status becomes `verified` only via server completion rules.

---

## 10. Verification Inspector model

### 10.1 Purpose

Reusable right-rail (or overlay on narrow viewports) inspector for the primary selection.

### 10.2 Mandatory sections

| Section | Content |
| --- | --- |
| Summary | Id, title/label, status, outcome badges |
| Subject | Kind, reference, resolved summary, navigation affordance |
| Authority | Kind, actor, display |
| Status | Lifecycle status + mutable/terminal |
| Outcome | Outcome taxonomy value or empty |
| Priority | When present |
| Version | Concurrency version |
| History summary | Last N material changes |
| Timeline | Compact chronological strip / link to full Timeline |
| Metadata | Extensible key/value (non-secret) |
| Rationale | Latest / decision rationale |
| Warnings | Server / policy warnings |
| Available actions | Buttons/menus bound to `availableActions` only |
| Related artefacts | Subject, target, supersession links, future Evidence/Execution slots |

### 10.3 Inspector rules

1. Inspector is read-mostly; edits go through commands.  
2. Unavailable related capabilities show **governed unavailable** states — not placeholder screens.  
3. Action buttons disabled/hidden strictly per `availableActions`.  
4. Inspector must remain usable at tablet/mobile as overlay (§19).

---

## 11. Verification Timeline model

### 11.1 Purpose

Present chronological interaction events for a single Verification.

### 11.2 Normative event classes

Timeline **must** be able to present:

- creation  
- assignment (including reassignment when recorded)  
- status changes  
- verification / completion  
- rejection  
- withdrawal  
- expiration  
- supersession  
- retirement  

Event payloads come from domain history / events (ENG-040A/B) — never client-synthesised fake history.

### 11.3 Interaction

- Chronological ascending/descending toggle;  
- Filter by event class;  
- Click event → highlight related History entry;  
- Compact mode for mobile;  
- Empty timeline for newly created records is valid.

---

## 12. History model

### 12.1 Purpose

Present append-only domain history for a Verification Record.

### 12.2 Rules

1. History is **append-only** — UI never edits or deletes history entries.  
2. Support filtering, grouping, chronological navigation.  
3. Present actor summary, status transitions, outcome changes, assignment changes.  
4. History pane may share right rail with Timeline (tabs).  
5. Full History workspace available for deep review.

### 12.3 Bulk / multi-select

History remains per-Verification. Multi-select does not merge histories.

---

## 13. Search model

### 13.1 Purpose

Architect discovery across Verification Records via Platform Unified Search (020) and Workbench advanced filters.

### 13.2 Search modes

| Mode | Intent |
| --- | --- |
| Global verification search | Platform search `verification_record` |
| Subject search | Find by subject reference / summary |
| Authority search | Find by authority actor / kind |
| Status search | Filter/facet by status |
| Outcome search | Filter/facet by outcome |
| Saved searches | User preference references |
| Advanced filters | Explorer-parity facets |
| Cross-domain discovery | Navigate to Requirements / Traceability subject contexts when resolvers allow |

### 13.3 Rules

1. Search results are permission-filtered at query time (020 + IAM).  
2. Opening a result selects Verification and opens Inspector.  
3. Search never grants permissions.  
4. Index is derived (not SoR); stale index states show refresh/unavailable messaging.

---

## 14. Navigation model

### 14.1 Module navigation

```text
Activity Bar (QEP)
  → Sidebar: Verification
      → Dashboard
      → My Queue
      → Team Queue
      → Explorer
      → Search
      → (selection) Inspector / Timeline / History
```

Deep links **must** support Verification id, queue id, saved view id, and decision focus parameters (018 restore + permission re-validation).

### 14.2 Subject navigation

| Target | Behaviour when available | When unavailable |
| --- | --- | --- |
| Requirements | Navigate to Requirements Workbench subject | Governed unavailable state |
| Traceability | Navigate to Trace Link / endpoint context | Governed unavailable state |
| Future Test Specifications | Slot only | Governed unavailable |
| Future Test Cases | Slot only | Governed unavailable |
| Future Executions | Slot only | Governed unavailable |
| Future Evidence | Slot only | Governed unavailable |

**No placeholder screens.** Unavailable means explicit governed messaging with no fake content.

### 14.3 Cross-workbench honesty

Verification Workbench links to Requirements / Traceability as **consumers of references**, not owners of those domains.

---

## 15. Available actions contract

### 15.1 Authority

The client **never** determines:

- permissions;  
- lifecycle eligibility;  
- allowed actions.

The server remains authoritative via `availableActions` on Verification DTOs (ENG-040B).

### 15.2 Client duties

1. Render action affordances only from `availableActions`.  
2. On action success, refresh Verification DTO (and queue membership) from server.  
3. On stale version / conflict, present concurrency recovery — do not force client merge of business fields.  
4. Command Palette entries for Verification **must** be filtered by the same server actions (or equivalent authorised query).  
5. Hidden ≠ denied messaging: when useful, surface “not available in current state” from server reason codes if provided.

---

## 16. Dashboard model

### 16.1 Purpose

Presentation widgets that deep-link into queues and explorer. **No analytics calculations** and no Coverage/Impact ownership.

### 16.2 Example widgets

| Widget | Deep link |
| --- | --- |
| My Queue | My Verification Queue |
| Team Queue | Team Verification Queue |
| Pending Reviews | Awaiting Review queue |
| Rejected | Rejected queue |
| Expiring Soon | Filtered Explorer / queue |
| Overdue | Overdue queue |
| Completed Today | Completed + date filter |
| Recent Activity | Recently Updated / activity stream projection |

### 16.3 Rules

1. Counts come from bounded server queries.  
2. Widgets never compute business outcomes.  
3. Permission-gated; empty-permission widgets omit or show governed unavailable.  
4. Dashboard is optional home; queues remain primary for operators.

---

## 17. Performance model

### 17.1 Scale targets (architecture)

| Scale | Expectation |
| --- | --- |
| 100 Verifications | Instant list/queue; full facets comfortable |
| 1,000 | Pagination default; virtual scroll optional |
| 10,000 | Server filtering mandatory; virtual scrolling; bounded queries |
| 100,000 | Strict pagination + incremental loading; no client-side full scans; queue counts via aggregates |

### 17.2 Mandatory techniques

- Pagination  
- Server filtering  
- Virtual scrolling for long lists  
- Incremental loading for timeline/history  
- Bounded queries (hard page size limits)  
- Debounced filter input  
- Prefer cursor/keyset pagination for large queues when engineering implements

### 17.3 Forbidden patterns

- Loading entire tenant Verification set into the client;  
- Client-side filtering of unbounded downloads;  
- Dashboard widgets that N+1 fetch each card without aggregation.

---

## 18. Accessibility model

### 18.1 Requirements

| Concern | Rule |
| --- | --- |
| Keyboard navigation | All queues, explorer, inspector, decisions operable by keyboard |
| Screen readers | Meaningful names for status/outcome badges, actions, timeline events |
| Focus management | Focus moves into Decision confirmations; restores on dismiss |
| ARIA | Listboxes/grids for explorer; dialogs for confirmations; live regions for queue refresh |
| High contrast | Token-based themes (022); no colour-only status |
| Responsive | See §19 |
| WCAG | Align WCAG AA with Design System **006** |

Status and Outcome **must** not rely on colour alone (icons/text required).

---

## 19. Responsive behaviour

| Viewport | Behaviour |
| --- | --- |
| Desktop | Full three-region layout (sidebar · main · inspector) |
| Tablet | Queue-first; inspector as overlay/drawer; filters collapsible |
| Mobile | Queue-first list; inspector full-screen overlay; compact timeline; responsive filters |

Rules:

1. Queue-first interaction on narrow viewports.  
2. Inspector overlays must trap focus accessibly.  
3. Decision confirmations remain modal and complete.  
4. No loss of server-authoritative action gating when chrome collapses.

---

## 20. Future integration (presentation slots)

| Slot | Boundary |
| --- | --- |
| Evidence | Display projections / links when capability exists |
| Execution | Display execution references when capability exists |
| Certification | Display certification lineage when capability exists |
| Coverage | Display coverage indicators when service exists — never compute here |
| Impact | Display impact indicators when service exists — never compute here |

Slots are **presentation boundaries only**. No implementation under ARCH-010. Unavailable → governed unavailable state.

---

## 21. AI considerations

AI is a **consumer**:

| AI may | AI must never |
| --- | --- |
| Summarise Verification history / rationale | Verify |
| Prioritise queue presentation suggestions | Approve |
| Recommend assignees or next actions | Reject |
| Draft rationale text for human edit | Own Verification truth |

AI suggestions **must** still execute through human-confirmed server commands and `availableActions`. AI never bypasses IAM or lifecycle.

---

## 22. MCP considerations

MCP is a **consumer**:

- MCP may read Verification via authorised APIs;  
- MCP may invoke authorised APIs on behalf of a principal;  
- MCP never owns Verification SoR, lifecycle, or Workbench state;  
- MCP tools must respect the same permissions and `availableActions` semantics.

No MCP server implementation under ARCH-010.

---

## 23. Bulk selection model

1. Explorer / queues support multi-select.  
2. Bulk action bar shows only actions that are valid for **all** selected items per server (intersection) or via explicit bulk endpoint.  
3. Partial failures report per-id results.  
4. History/timeline remain single-selection views.

---

## 24. Empty, loading, error, permission states

| State | Rule |
| --- | --- |
| Empty queue | Helpful empty — how to request/assign |
| Empty search | Clear “no matches” + filter reset |
| Loading | Skeletons / busy indicators; no fake rows |
| Error | Typed Platform error; retry when safe |
| Permission denied | Governed unavailable; no leaked existence details beyond policy |
| Capability unavailable | Explicit unavailable for future slots — **no placeholders** |

---

## 25. Preferences and sessions

| Concern | Rule |
| --- | --- |
| Default landing | Preference: Dashboard vs My Queue (023) |
| Saved views / searches | Preference references |
| Panel sizes | Session + preference UI state (018/023) |
| Selection restore | Restore Verification id reference; re-fetch; re-validate permissions |
| Never persist | Full Verification SoR payloads as authoritative copies |

---

## 26. Command palette integration

Command Palette (019) **must** expose Verification commands such as:

- Open My Queue / Team Queue / Explorer / Dashboard / Search;  
- Assign / Claim / Release / Start / Complete / Reject / Withdraw / Cancel / Supersede / Retire — **filtered by availableActions** for current selection;  
- Focus Inspector / Timeline / History.

Execution path remains: Command → Platform Service → (connector if any) — never client-direct engine calls. Verification today is platform-owned SoR via ENG-040B APIs.

---

## 27. Consistency validation

| Baseline | Consistency rule |
| --- | --- |
| ARCH-006 | Shell, docking, panels, toolbar, palette, sessions reused — no redesign |
| ARCH-009 | Capability semantics, Status≠Outcome, consumer boundaries preserved |
| ENG-040A | Lifecycle statuses, outcomes, invariants, events drive UX vocabulary |
| ENG-040B | REST, permissions, `availableActions`, search entity drive interaction contracts |
| Requirements 1.0.0 | Subject navigation only; no Requirements mutation ownership |
| Traceability 1.0.0 | Cross-links only; no Trace Link ownership |

No contradictions introduced: queues/dashboard are presentation; decisions are server commands; future slots are non-implemented boundaries.

---

## 28. Explicitly out of scope

- React / Next.js / routes / components / Workbench UI packages  
- REST API or persistence changes  
- Coverage / Impact / Evidence / Certification engineering  
- AI / MCP implementation  
- Analytics calculation engines  
- Placeholder screens for unavailable capabilities  

---

## 29. Architecture decisions (ADRs)

### ADR-ARCH-010-001 — Extend ARCH-006; do not fork the Workbench shell

**Decision:** Verification Workbench reuses Platform shell and ARCH-006 grammar exclusively.  
**Rationale:** Consistency with Requirements and Traceability Workbenches.  
**Status:** Proposed (normative on Owner Acceptance).

### ADR-ARCH-010-002 — Queue-first / list-first / inspector-first

**Decision:** Primary operational UX is queues + explorer + inspector. Matrix/graph are not required.  
**Rationale:** Verification is workflow- and assignment-centric, unlike Traceability’s matrix-first emphasis.  
**Status:** Proposed.

### ADR-ARCH-010-003 — Queues are presentation only

**Decision:** Queue definitions never own business rules; server queries + domain policies do.  
**Rationale:** Prevent client-side policy drift and duplicate eligibility logic.  
**Status:** Proposed.

### ADR-ARCH-010-004 — Server-authoritative availableActions

**Decision:** All mutating affordances gated by ENG-040B `availableActions`.  
**Rationale:** Affirms ARCH-006 / ARCH-009 / ENG-040B; client never invents lifecycle.  
**Status:** Proposed.

### ADR-ARCH-010-005 — Status and Outcome remain distinct in UX

**Decision:** UI always separates lifecycle status from outcome taxonomy.  
**Rationale:** ENG-040A invariant; prevents operator confusion and illegal state presentation.  
**Status:** Proposed.

### ADR-ARCH-010-006 — Future Evidence / Execution / Certification are presentation slots

**Decision:** Architect slots only; governed unavailable until capabilities exist.  
**Rationale:** Avoid placeholder screens and premature product coupling.  
**Status:** Proposed.

### ADR-ARCH-010-007 — AI and MCP are consumers only

**Decision:** AI/MCP may summarise/recommend/read/invoke authorised APIs; never own Verification truth.  
**Rationale:** Aligns ARCH-009 consumer architecture and Zero Trust.  
**Status:** Proposed.

---

## 30. Deliverable map

Authoritative document: this file. Companions under `docs/products/apzqep/architecture/verification-workbench/` extract sections for navigation. Companion extracts are non-conflicting summaries; on conflict, this document wins until Owner Acceptance amends it.

---

## 31. Completion and stop

When this architecture pack is filed and governance updated:

```text
APZQEP-ARCH-010
IMPLEMENTED
AWAITING OWNER ACCEPTANCE
```

**STOP.** Do not begin engineering. Do not create UI, routes, or packages. Await explicit Owner review.
