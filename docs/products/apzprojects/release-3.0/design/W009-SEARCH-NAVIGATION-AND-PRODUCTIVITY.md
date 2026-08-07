# APZ Projects Release 3.0

# Product Design Workshop 009 — Enterprise Search, Navigation & Productivity

**Document ID:** W009-SEARCH-NAVIGATION-AND-PRODUCTIVITY  
**Status:** APPROVED WITH AMENDMENTS (Owner review 2026-08-06) — implementation authority for search, navigation & productivity  
**Mode:** Product design only · no code until Owner authorises engineering  
**Depends on:** W001–W008 (W002–W008 APPROVED WITH AMENDMENTS)  
**Continues:** `W010-SECURITY-GOVERNANCE-AND-ADMINISTRATION.md`  
**Authority:** Implementation specification for productivity, navigation and operational efficiency within APZ Projects (as amended)

---

# 0. Product objective

Minimise time to **find information** or **perform operational work** inside APZ Projects and across the APZHUB enterprise products — without consumer personalisation theatre.

| Succeeds when                                              | Fails when                                          |
| ---------------------------------------------------------- | --------------------------------------------------- |
| User reaches a Commitment in ≤3 interactions from anywhere | User hunts tabs and entity lists                    |
| Search returns objects in operational context              | Isolated message/document hits without owner object |
| Command Palette executes delivery actions                  | Palette is only a route fuzzy-finder                |
| Cross-product jump lands with Context preserved            | User re-authenticates into engine UIs               |

Align platform foundations: Unified Search (020) · Command Palette (019) · Navigation (017) · Preferences (023) · Desktop shell (005/016).

---

# 1. Design principles (normative)

| #   | Principle                                                                     |
| --- | ----------------------------------------------------------------------------- |
| N1  | Enterprise terminology only — no “For You”, streaks, or playful empty states  |
| N2  | Personal productivity = **efficiency aids**, not a personalised consumer feed |
| N3  | Search is permission-filtered at query time (020)                             |
| N4  | Results preserve **operational context** (object + scope)                     |
| N5  | Navigation follows operational intents (W002), not entity sprawl              |
| N6  | Command Palette is an **Action Engine** (019), not search-only                |
| N7  | Cross-product navigation stays inside APZHUB — never raw engine branding      |
| N8  | Favourites/Recents are private productivity — never grant permissions         |
| N9  | Bulk operations are explicit, confirmatory, auditable                         |
| N10 | Keyboard-first for power users; full mouse path always available              |

---

# 2. Navigation model

## 2.1 Product chrome (APZ Projects)

```text
Activity Bar / Module: APZ Projects
Sidebar (permissioned):
  Operational Workspace          // W002 home
  Portfolio                      // Scorecard default for exec (W005)
    · Workspace · Timeline · Reports · Reviews
  Search                         // optional shortcut entry
  More…
    All Projects (admin list)
    Teams (W006)
    Templates · Settings · Help
    Tasks / Backlog / Sprints    // secondary execution tools — not identity
```

Cockpit intents (all hierarchy levels): **Overview · Delivery · Planning · Control · History**.

## 2.2 Challenge: deep sidebar trees

**Reject** Jira-style endless entity trees.  
**Recommend** shallow sidebar + Command Palette + Search for reach.

**Decision proposal NP-D1:** Shallow operational sidebar; entity tools under More…; Palette/Search for power reach.

## 2.3 Deep links

Stable URLs for: workspace regions · cockpit intent · object surface · review · report · portfolio node.  
Restore respects permissions (018).

---

# 3. Global search

## 3.1 Entry

- Shell search / `Ctrl+K` or `/` (disambiguate from Palette — see §7)
- Projects scope default when module focused; **APZHUB** scope toggle for cross-product

## 3.2 Result model — explainability mandatory

```text
SearchHit {
  objectType · objectId
  title · snippet
  owningObject                 // always present — no orphans
  operationalRelationship      // e.g. child of Project X · linked to Decision Y
  matchReason                  // why this hit matched (field · id · keyword)
  scopeBreadcrumb              // Portfolio / Programme / Project / …
  operationalSignals?          // Health · Confidence band · status
  product                      // projects | workflow | documents | …
  deepLink                     // opens within operational context
}
```

Every result identifies: **owning object · object type · operational relationship · reason for match**.  
Never disconnected from operational context. No orphan objects. No orphan conversations.

Rules (align W007):

- Conversations return **within owning object** — never orphan messages
- Permission-filtered
- Rank: exact ID/identifier · title match · recent interaction · operational urgency boost (Critical/aged) — explainable, not engagement ML

## 3.3 Facets

Type · Scope (project/programme/portfolio) · Status · Owner · Classification · Health · Has open exception · Product (cross-product mode).

## 3.4 Engineering

Register Search Providers for Projects objects (020). Index derived — not SoR. Async event-driven indexing from domain events.

**Decision proposal NP-D2:** Global search is provider-based unified search; Projects registers providers for all primary operational objects.

---

# 4. Contextual search

Search scoped to current surface:

| Context                | Default scope           |
| ---------------------- | ----------------------- |
| Project Cockpit        | Current project         |
| Programme / Initiative | Node + children         |
| Portfolio              | Portfolio membership    |
| Object surface         | Object + linked objects |
| Review pack            | Pack snapshot entities  |

UI: search field placeholder states scope (“Search in Digital Banking”). Escape to global.

---

# 5. Saved searches

```text
SavedSearch {
  id · name
  query · facets
  scopeMode                      // global | contextual_template
  ownerUserId                    // personal only
}
```

- **Personal** only — no sharing as enterprise artefacts
- Support **export and reuse** (export query definition; import as new personal saved search)
- Enterprise-wide / governed searches managed separately through **governance** (W010) — not Favourites/Saved Search sharing
- Never bypass permissions at run time — re-evaluate

---

# 6. Recent items & Favourites

## 6.1 Recents

MRU list of operational objects/scopes user opened (permissioned).  
Shown in Command Palette and optional Sidebar slice **Recent**.  
Retention: bounded (e.g. 25); no social ranking.

## 6.2 Favourites

User pins Project · Programme · Initiative · Saved Search · Report.  
Label: **Favourites** (enterprise) — not “Starred for you”.  
**Private only** — no sharing, no enterprise ownership.  
Favourites do not imply watch/subscribe (W007) unless user also watches.

---

# 6.3 Universal Quick Action

Persistent **Quick Action** control available from **every** APZ Projects screen.

Creates immediately (permissioned):

`Project` · `Commitment` · `Milestone` · `Decision` · `Risk` · `Exception` · `Review` · `Note`

- Preserves **current operational context** whenever possible (project/programme/initiative/review)
- Uses **Intelligent Defaults** (§6.5) — defaults never replace explicit user confirmation
- Keyboard: e.g. `Ctrl+.` or Palette “Quick Action…”
- Institutional control — not a consumer FAB blob

**Note** = short operational note anchored to current object/scope (W007 notice/discussion path — not orphan chat).

## 6.4 Productivity Sessions

Optional **working sessions** for continuity during complex operational work — **not** consumer personalisation.

Examples: `Delivery Planning` · `Weekly Review` · `Risk Review` · `Governance Review`

```text
ProductivitySession {
  type · name?
  scopeSnapshot                  // project/programme/filters/intent/panels
  openedObjectIds[]
  createdAt · lastResumedAt
  ownerUserId                    // private
}
```

- Remembers operational context (scopes · intents · open objects)
- Does not create a “For You” feed or change enterprise defaults for others
- Resume restores context with **permission re-validation** (018)
- Distinct from Operational Review objects (W008) — sessions are private continuity; reviews are enterprise records

## 6.5 Intelligent Defaults

On create flows (Quick Action · Palette · forms), pre-fill from context:

- current project · programme · initiative · review

Defaults **reduce data entry**; user can always change. Never silently bind to wrong scope.

---

# 7. Command Palette (Action Engine)

## 7.1 Invocation

`Ctrl+Shift+P` (019) — Actions.  
`Ctrl+K` — Search (or Palette in search mode). Document clearly; avoid collision.

## 7.2 Modes

| Mode          | Behaviour                                                       |
| ------------- | --------------------------------------------------------------- |
| Go to         | Navigate to scopes/objects                                      |
| Action        | Execute operational commands                                    |
| Create        | Create commitment · decision · risk · wait · exception · review |
| Cross-product | Jump to Workflow/Documents/… with context                       |

## 7.3 Example commands (Projects)

- Go to Operational Workspace
- Open project by name/id
- New commitment (current project)
- Log wait
- Raise exception
- Record decision
- Open Responsibility Matrix
- Start Project Review
- Open Portfolio Scorecard
- Approve / complete from queue target when selected

## 7.4 Execution path

Command → Platform Service → (Connector) → Engine — never UI→engine (003/019).  
Permission-filtered command registration from module manifest.

**Decision proposal NP-D4:** Palette is Action Engine first; navigation second.

---

# 8. Quick actions

Contextual primary actions on surfaces (not a FAB consumer pattern):

| Surface          | Quick actions                          |
| ---------------- | -------------------------------------- |
| Queue row        | Decide · Open · Acknowledge            |
| Commitment strip | Complete · Log wait · Discuss          |
| Overview         | New commitment · Raise risk · Log wait |
| Exception        | Conclude · Escalate                    |
| Review           | Capture commitment · Complete review   |

Density-aware; keyboard activatable.

---

# 9. Keyboard shortcuts

| Shortcut       | Action                             |
| -------------- | ---------------------------------- |
| `Ctrl+Shift+P` | Command Palette                    |
| `Ctrl+K` / `/` | Search (scoped)                    |
| `g then h`     | Operational Workspace              |
| `g then o`     | Portfolio Scorecard (if permitted) |
| `g then q`     | Focus Queue                        |
| `1` `2` `3`    | Queue groups                       |
| `j` / `k`      | Move selection                     |
| `Enter`        | Open                               |
| `c`            | New commitment (in project)        |
| `w`            | Log wait                           |
| `e`            | Raise exception                    |
| `?`            | Shortcut help overlay              |

All discoverable via `?` and settings. Remapping via preferences optional v1.1.

---

# 10. Bulk operations

## 10.1 Allowed (v1)

| Bulk                             | Scope               | Guard                              |
| -------------------------------- | ------------------- | ---------------------------------- |
| Reassign owner                   | Commitments / waits | Confirm · audit · continuity check |
| Conclude advisory exceptions     | Exceptions          | Severity cap                       |
| Ack announcements                | Announcements       | Audience membership                |
| Add watchers                     | Objects             | Permission                         |
| Move projects between programmes | Portfolio           | PMO · history preserved (W005)     |

## 10.2 Rejected as silent bulk

- Bulk status → done without evidence
- Bulk date shifts past baseline tolerance (must Exception)
- Bulk delete

**Decision proposal NP-D5:** Bulk = explicit multi-select + confirm + audit; no silent lifecycle skips.

---

# 11. Personal productivity (without consumer personalisation)

| Allowed                               | Rejected                 |
| ------------------------------------- | ------------------------ |
| Favourites · Recents · Saved searches | “For you” feed           |
| Density · collapsed queue groups      | Gamification · greetings |
| Shortcut prefs · digest cadence       | Social reactions         |
| Default portfolio sort (W002)         | Avatar celebrations      |

Preferences via Preference Service (023). Never grant permissions.

---

# 12. Cross-product navigation

## 12.1 Targets

APZ Workflow · Documents · Knowledge · Support · Analytics · Law (Governance).

## 12.2 Behaviour

- Navigate via APZHUB shell routes / Command Palette — **single SSO**, no engine login screens (007)
- Pass focus context: `projectId` / `programmeId` / object refs for Enterprise Context composition
- Landing surfaces use **APZHUB product names**, never Plane/Zammad/etc.
- Return path: “Back to {Project}” affordance

## 12.3 Search cross-product

Global mode federates providers; each hit shows product label + breadcrumb.  
Analytics hits are insight objects — not a Projects report duplicate.

## 12.4 Challenge: embed foreign UIs

**Reject** iframe of backend admin consoles for standard users.  
**Recommend** APZHUB product modules + Context compose.

**Decision proposal NP-D6:** Cross-product only through APZHUB product surfaces + Context; mask engines.

---

# 13. Navigation consistency (platform requirement)

| Level                  | Home                        | Cockpit intents                          |
| ---------------------- | --------------------------- | ---------------------------------------- |
| Project                | Operational Workspace entry | Overview…History                         |
| Programme / Initiative | Portfolio drill             | Same five intents                        |
| Portfolio              | Scorecard                   | Workspace · Timeline · Reports · Reviews |

**Every operational object** supports **identical navigation behaviour**:

- Open → surface with same chrome (header signals · intents/panels · Context · Timeline)
- Search / Recents / Favourites / Quick Action / Palette all land the same way
- Users never learn different navigation models for Projects · Commitments · Risks · Decisions · Reviews

Navigation consistency is a **platform requirement**, not a per-object preference.

---

# 14. Empty · loading · error

- Search empty: “No matches in scope” + clear filters
- Recents empty: institutional one-liner
- Command with no permission: omit command (don’t tease)
- Provider failure: partial results + “Knowledge unavailable” honesty

---

# 15. Accessibility

- Search results listbox pattern
- Palette ARIA combobox
- Shortcuts don’t trap keyboard users without pointer alternative
- Focus restore on close

---

# 16. Engineering readiness

| Area                 | Current                     | New / reuse                 | API / platform       | Complexity |
| -------------------- | --------------------------- | --------------------------- | -------------------- | ---------- |
| Shell nav            | Module sidebar entity-heavy | Reshape per §2              | module.yaml nav      | M          |
| Global search        | Platform search capability  | Projects providers          | Search SDK register  | L          |
| Contextual search    | None                        | Scoped query param          | search API scope     | M          |
| Saved searches       | None                        | Preference + store          | `/saved-searches`    | M          |
| Recents / Favourites | Partial shell?              | Projects productivity store | prefs / MRU API      | M          |
| Command Palette      | Platform UCP (019)          | Register Projects commands  | manifest commands    | M–L        |
| Shortcuts            | Few                         | Shortcut map + help         | client + docs        | S–M        |
| Bulk ops             | None                        | Bulk endpoints              | `/bulk/*` with audit | M–L        |
| Cross-product        | Shell modules               | Context-preserving links    | deep link contracts  | M          |
| Indexing             | Event-driven target         | Emit on W004/W007 mutations | Event Bus            | L          |
| Acceptance           | —                           | §18                         | —                    | —          |

---

# 17. Acceptance criteria

1. Sidebar is operational-first; Tasks/Backlog/Sprints under More….
2. Search hits include owning object · type · relationship · match reason; no orphans.
3. Favourites private (no share); Recents private; Saved searches personal with export/reuse.
4. Universal Quick Action on every screen; context-preserving creates.
5. Productivity Sessions restore context with permission re-validation.
6. Intelligent Defaults never skip explicit confirmation.
7. Identical navigation behaviour across operational object types.
8. Command Palette Ctrl+Shift+P prioritises actions; executes via Platform Services.
9. Shortcuts + `?` help; a11y mandatory.
10. Bulk ops: select · confirm · audit · permission check.
11. Cross-product via APZHUB + Context; engines hidden.
12. No consumer personalisation feeds.

---

# 18. Decision register — Owner review (2026-08-06)

| ID         | Status       | Decision                                                                                         |
| ---------- | ------------ | ------------------------------------------------------------------------------------------------ |
| **NP-D1**  | **APPROVED** | Operational primary nav; entity tools under More…; Tasks/Backlog/Sprints secondary               |
| **NP-D2**  | **APPROVED** | Global + Contextual search; results open in operational context; no orphan objects/conversations |
| **NP-D3**  | **APPROVED** | Recent items private; never grant/imply permissions                                              |
| **NP-D4**  | **APPROVED** | Favourites private; no sharing; no enterprise ownership                                          |
| **NP-D5**  | **APPROVED** | Saved searches personal; export/reuse; enterprise searches via governance (W010)                 |
| **NP-D6**  | **APPROVED** | Command Palette primary keyboard surface; Ctrl+Shift+P; actions over navigation                  |
| **NP-D7**  | **APPROVED** | Complete shortcut catalogue; `?` reference; a11y mandatory                                       |
| **NP-D8**  | **APPROVED** | Bulk: selection · confirm · audit · permission check; no silent lifecycle transitions            |
| **NP-D9**  | **APPROVED** | Cross-product via APZHUB; Context preferred; engines hidden                                      |
| **NP-D10** | **APPROVED** | Universal Quick Action on every screen; context-preserving creates                               |
| **NP-D11** | **APPROVED** | Productivity Sessions for continuity — not consumer personalisation                              |
| **NP-D12** | **APPROVED** | Intelligent Defaults from context; never replace explicit choice                                 |
| **NP-D13** | **APPROVED** | Identical navigation behaviour for all operational objects — platform requirement                |
| **NP-D14** | **APPROVED** | Search explainability: owning object · type · relationship · match reason                        |

**Engineering:** Do not implement until Owner authorises. Next design authority: **W010 — Security, Governance & Operational Administration**.

---

# 19. Explicit non-goals

- Consumer “For You” / gamification
- Shared Favourites as enterprise config
- Replacing OS spotlight
- Building a second Analytics search
- Exposing backend engine UIs
- AI semantic search as v1 dependency
- Implementation code

---

# 20. Approval gate

**Owner approved with amendments (2026-08-06).** This file is implementation authority for search, navigation and productivity.

Security & administration are specified in `W010-SECURITY-GOVERNANCE-AND-ADMINISTRATION.md`.
