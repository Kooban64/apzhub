# APZQEP-ARCH-008

# Traceability Workbench Architecture

# Owner Architecture Specification

| Field                     | Value                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Programme                 | **APZQEP-ARCH-008**                                                                              |
| Title                     | **Traceability Workbench Architecture**                                                          |
| Classification            | Owner Architecture Specification                                                                 |
| Product                   | APZ QEP (APZ Quality Engineering Platform)                                                       |
| Platform baseline         | APZHUB Platform 1.4 — CERTIFIED                                                                  |
| Shell baseline            | Documents **005**, **016**, **017**, **018**, **019**, **020**, **021**, **022**, **023**        |
| Design System             | Document **006** / UI Component SDK **028**                                                      |
| Workbench grammar         | **APZQEP-ARCH-006** — ACCEPTED / CLOSED / COMPLETE                                               |
| Traceability architecture | **APZQEP-ARCH-007** — ACCEPTED / CLOSED / COMPLETE                                               |
| Domain baseline           | **APZQEP-ENG-030A Part 1** — ACCEPTED / CLOSED / COMPLETE                                        |
| Backend baseline          | **APZQEP-ENG-030A Part 2** — ACCEPTED / CLOSED / COMPLETE · `@apzhub/qep-traceability` **0.2.0** |
| Downstream engineering    | **APZQEP-ENG-030C** — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**                                |
| Document revision         | **1.0.0-arch**                                                                                   |
| Revision date             | 2026-07-26                                                                                       |
| Nature                    | Architecture only — implementation-independent                                                   |
| Status                    | **ACCEPTED / CLOSED / COMPLETE**                                                                 |

**Normative language:** **must** = mandatory; **should** = strong recommendation; **may** = optional.

---

## 0. Authority and stop conditions

This specification defines the **Authoritative Traceability Workbench Architecture** for APZ QEP.

It **extends** APZQEP-ARCH-006. It does **not** redesign the Platform Desktop Shell, the Requirements Workbench chrome, docking, toolbar philosophy, or workspace session model.

It does **not** authorise:

- React, Next.js, components, routes, or UI packages;
- new REST APIs or DTO redesign;
- Coverage Engine or Impact Engine calculations;
- graph visualisation or graph databases;
- Verification, Evidence, Certification product engineering;
- AI agents, embeddings, or MCP servers.

```text
Architecture → Owner Acceptance → Owner Engineering Programme Instruction
  → Traceability Workbench implementation (future, e.g. ENG-030C)
```

Do **not** begin Workbench engineering until a separate **Owner Engineering Programme Instruction** is issued.

ARCH-007 and ENG-030A remain authoritative for Trace Link semantics, lifecycle, taxonomy, permissions, audit, and APIs. The Workbench presents and operates on those facts; it must never invent alternate semantics or client-side business rules.

---

## 1. Purpose

Define the complete user interaction architecture for the **APZ QEP Traceability Workbench**.

The Workbench shall become the primary user experience for:

- creating and governing Trace Links;
- exploring endpoints and Trace Types;
- analysing matrices and lineage (presentation);
- inspecting history, authority, provenance, and warnings;
- consuming future Coverage / Impact / lineage analysis services without owning their truth.

This architecture is the blueprint for every future engineering screen involving Traceability.

---

## 2. Relationship to ARCH-006

| ARCH-006 concept                        | Traceability specialisation                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| One Workbench grammar                   | Reused unchanged                                                                            |
| Explorer + Main + Inspector             | Reused; Trace Explorer / Matrix / Inspector specialise content                              |
| Relationship Explorer                   | **Not** reused for Trace Links — Trace Explorer / Matrix replace that role for Traceability |
| Relationship list-before-graph          | Extended: **matrix-first / list-first / inspector-first**; graph optional (§16)             |
| Server-authoritative `availableActions` | Mandatory; Trace Link actions from ENG-030A Part 2                                          |
| Search via Platform 020                 | Trace Link search entity `trace_link`                                                       |
| Persistence of UI state (018)           | References + layout only — never Trace Link SoR copies                                      |

Requirements Relationships (ARCH-005) and Trace Links (ARCH-007) remain **structurally and semantically distinct**. The Traceability Workbench must not present Trace Links as Requirements Relationships, nor vice versa.

---

## 3. Workbench principles (Traceability)

| Principle                       | Rule                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| Artefact-centric                | Primary object is the **Trace Link**; endpoints are governed references                  |
| Server authority                | Lifecycle, permissions, validation, duplicates, cycles, `availableActions` — server only |
| Semantic honesty                | Product names: Trace Links, Trace Types — never backend engine brands                    |
| No silent rewrite               | Retired / superseded / immutable-context links visible; mutating actions disabled        |
| Analyse without dead-ends       | Matrix, lineage, history, analysis open as panes/tabs                                    |
| Progressive disclosure          | Defaults calm; density via preferences (023)                                             |
| Matrix / list / inspector first | Fully usable without graph rendering                                                     |
| No coverage/impact ownership    | Workbench may display analysis projections; never store derived truth on Trace Links     |
| AI / MCP as consumers           | Never own Trace Links, lifecycle, or authority                                           |

---

## 4. Alignment with Platform shell

Identical consumption model to ARCH-006 §3:

| Platform capability | Traceability Workbench consumption                               |
| ------------------- | ---------------------------------------------------------------- |
| 005 / 016 Shell     | Hosts chrome; module provides workspace content                  |
| 017 Navigation      | Activity Bar → QEP → Traceability sidebar → internal navigation  |
| 018 Sessions        | Named sessions, split views, layout restore; permission re-check |
| 019 Command Palette | Primary action surface for Trace Link commands                   |
| 020 Unified Search  | `trace_link` provider; Workbench consumes results                |
| 021 Notifications   | Attention Engine; modules publish events only                    |
| 022 / 006 Tokens    | Design tokens; Lucide icons only                                 |
| 023 Preferences     | Density, panel defaults — never grant permissions                |
| 007 IAM             | Permission family `qep.traceability.*` (ENG-030A Part 2)         |

The Traceability Workbench is a **module workspace content model** inside the shell — not a parallel application.

---

## 5. Workspace model (canonical layout)

### 5.1 Layout diagram

```text
┌──────────────────────────────── Header / Global Toolbar ────────────────────────────────┐
│ Brand · Workspace switch · Global search · Command palette · Notifications · Account   │
├─ Activity Bar ─┬─ Module Sidebar ─┬──────────────── Main Workspace ──────────┬─ Right ─┤
│ QEP            │ Traceability     │ Tabs · Breadcrumbs · Contextual actions  │ Panels  │
│ …              │ Explorer modes / ├──────────────────────────────────────────┤ Inspect │
│                │ saved filters    │                                          │ History │
│                │ taxonomy         │  Explorer list · Matrix · Editor ·       │ Lineage │
│                │                  │  Analysis · Search · Taxonomy            │ Details │
│                │                  │  (optional split)                        │ Activ.  │
├────────────────┴──────────────────┴──────────────────────────────────────────┴─────────┤
│ Status Bar — lifecycle · selection count · filter summary · scope · keyboard hints     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Primary workspaces (normative catalogue)

| Workspace / view                 | Purpose                                          | Authorisation class           |
| -------------------------------- | ------------------------------------------------ | ----------------------------- |
| **Trace Explorer**               | Hierarchical / filtered inventory of Trace Links | Core                          |
| **Trace Matrix**                 | Cross-artefact matrix presentation               | Core                          |
| **Trace Inspector**              | Selection properties and actions                 | Core (right rail)             |
| **Trace History**                | Immutable domain history for a Trace Link        | Core                          |
| **Trace Link Editor**            | Create / lifecycle / field updates               | Core                          |
| **Trace Link Comparison**        | Compare two Trace Links or supersession pair     | Core                          |
| **Trace Taxonomy Browser**       | Normative 16 Trace Types + display metadata      | Core                          |
| **Trace Validation**             | Validation / approval queues and warnings review | Core                          |
| **Trace Search**                 | Contextual + advanced Trace search               | Core                          |
| **Future Coverage View**         | Presentation of Coverage projections             | Future (no calculations here) |
| **Future Impact View**           | Presentation of Impact projections               | Future (no calculations here) |
| **Future Certification Lineage** | Lineage across certification artefacts           | Future                        |
| **Future Evidence Lineage**      | Lineage across evidence artefacts                | Future                        |

### 5.3 Pane rules

1. Explorer is left-primary; Inspector / History / Lineage / Details share the right rail with mode tabs.
2. Only one **primary selection** (Trace Link id) at a time; multi-select enables bulk mode (§12).
3. Matrix may occupy Main Workspace as a first-class tab; opening a cell selects the Trace Link (or empty cell create intent).
4. Split view confined to Main Workspace (ARCH-006 §8.4 pattern).
5. Graph visualisation is **optional future** (§16); never required for usability.
6. Pane collapse / size persist via 018/023 (references + UI state only).

---

## 6. Trace Explorer model

### 6.1 Purpose

Primary navigational inventory for Trace Links — list-first, filterable, scalable.

### 6.2 Hierarchical browsing

Explorer **must** support grouping hierarchies such as:

- Trace Type (normative taxonomy);
- Source endpoint kind / owning domain;
- Target endpoint kind / owning domain;
- Lifecycle state;
- Scope;
- Confidence;
- Authority kind;
- Origin;
- Project / product grouping when tenant model provides them.

Hierarchy presentation **must not** invent parentage absent from Trace Link / endpoint facts.

### 6.3 Endpoint browsing

Users must be able to browse Trace Links **from an endpoint context**:

- select an artefact reference (Requirement, Test Case, …);
- show inbound / outbound / both;
- preserve endpoint context in breadcrumbs and Inspector.

Endpoint content remains owned by the source domain; Explorer shows **reference summaries only** (ids, type, lifecycle/availability when resolver provides them).

### 6.4 Filtering (normative)

| Filter family | Examples                                                                         |
| ------------- | -------------------------------------------------------------------------------- |
| Tenant        | Implicit from session — never user-supplied tenant id as sole authority          |
| Lifecycle     | draft, validated, approved, retired, superseded                                  |
| Trace Type    | Any of the 16 normative types                                                    |
| Confidence    | authoritative, asserted, inferred, provisional                                   |
| Authority     | kind / actor summary (non-sensitive)                                             |
| Origin        | user, import, system_rule, ai_suggestion, migration                              |
| Scope         | product, project, release, baseline, tenant_global                               |
| Strength      | mandatory, recommended, informative                                              |
| Direction     | forward, reverse, symmetric                                                      |
| Context       | baseline / content-version pinned; immutable flag                                |
| Warnings      | cycle warning, duplicate candidate, broken endpoint, missing mandatory rationale |
| Supersession  | active / superseded / has successor                                              |

Filters AND together. **Saved filters** capture the full predicate (personal or org-shared when authorised). Saved filters never grant permissions.

### 6.5 Selection behaviour

| Mode          | Behaviour                                                        |
| ------------- | ---------------------------------------------------------------- |
| Single select | Primary selection → Inspector / History / available actions      |
| Bulk select   | Explicit bulk bar; server validates each item                    |
| Keyboard      | j/k or arrow navigation; space toggles multi-select when enabled |
| Open          | Enter / double-activate opens Editor or Matrix focus             |

### 6.6 Row summary contract

Explorer rows consume the ENG-030A Part 2 **list summary** contract — not per-row detail fetches:

- Trace ID, Trace Type, source/target endpoint summaries, direction, lifecycle, scope, strength, confidence, origin, authority summary, provenance summary, supersession status, timestamps, warning indicators, `availableActions`.

Do not load confidential endpoint body content into Explorer rows.

### 6.7 Indicators

| Indicator         | Meaning                                           |
| ----------------- | ------------------------------------------------- |
| Lifecycle chip    | draft → validated → approved → retired/superseded |
| Confidence        | Non-colour-only glyph/label                       |
| Warning           | Cycle / duplicate / broken reference / validation |
| Immutable context | Context locked — mutation restricted              |
| AI origin         | `ai_suggestion` origin — never implies authority  |
| Superseded        | Dimmed / archived emphasis; navigate to successor |

---

## 7. Trace Matrix model

### 7.1 Purpose

Presentation architecture for cross-artefact Trace Matrices. **No coverage or impact calculations** in this architecture — only how matrices are interacted with and how future indicators are displayed.

### 7.2 Future matrix families (catalogue)

| Matrix                      | Row class   | Column class                 |
| --------------------------- | ----------- | ---------------------------- |
| Requirement ↔ Specification | Requirement | Specification                |
| Requirement ↔ Test Case     | Requirement | Test Case                    |
| Requirement ↔ Execution     | Requirement | Execution                    |
| Requirement ↔ Evidence      | Requirement | Evidence                     |
| Requirement ↔ Verification  | Requirement | Verification Activity/Result |
| Requirement ↔ Certification | Requirement | Certification Artefact       |
| Execution ↔ Evidence        | Execution   | Evidence                     |
| Evidence ↔ Certification    | Evidence    | Certification Artefact       |

Additional matrices may be registered when domains exist; architecture reserves an **extensible matrix registry** slot (module contribution).

### 7.3 Structural concepts

| Concept             | Rule                                                                            |
| ------------------- | ------------------------------------------------------------------------------- |
| Rows                | Artefact identities of the row domain; paginated / virtualised                  |
| Columns             | Artefact identities of the column domain; paginated / virtualised / pinned sets |
| Cell                | Empty · one Trace Link · multiple Trace Links (stack / overflow affordance)     |
| Grouping            | By Trace Type, lifecycle, scope, project — user selectable                      |
| Sorting             | Row/column labels, updatedAt, lifecycle density                                 |
| Filtering           | Same filter families as Explorer, applied to matrix query                       |
| Selection           | Cell select → Trace Link selection (or create intent if empty and permitted)    |
| Status indicators   | Lifecycle / confidence / warning glyphs in cell                                 |
| Coverage indicators | **Display slots only** — values from future Coverage service                    |
| Impact indicators   | **Display slots only** — values from future Impact service                      |

### 7.4 Interaction rules

1. Matrix queries **must** be bounded (server pagination / windowing).
2. Opening a cell with a Trace Link focuses Inspector.
3. Empty cell + create permission → Trace Link Editor with endpoints prefilled.
4. Multiple links in one cell → chooser then Inspector.
5. Matrix must remain usable with keyboard (§14).
6. Matrix must not require graph rendering.

### 7.5 Explicit non-goals

- Computing coverage percentages;
- Authoritative covered/uncovered state;
- Blast-radius scoring;
- Unbounded column expansion.

---

## 8. Trace Inspector model

### 8.1 Contract

Every Trace Inspector:

- binds to the current primary Trace Link selection (or endpoint context summary);
- is read-mostly with explicit edit commands;
- shows server `availableActions`;
- never embeds backend role names;
- supports deep-link open.

### 8.2 Display regions

| Region            | Content                                                      |
| ----------------- | ------------------------------------------------------------ |
| Trace summary     | Trace ID, Trace Type, direction, strength, lifecycle         |
| Endpoints         | Source / target summaries; owning domain; immutable flags    |
| Lifecycle         | State + transition timestamps / actors (safe ids)            |
| Authority         | Authority kind + actor summary                               |
| Origin            | Origin enum; AI origin clearly labelled as non-authoritative |
| Confidence        | Confidence value + update entry if action available          |
| Scope             | Scope kind + reference                                       |
| Rationale         | Text / edit when permitted                                   |
| History           | Entry points to Trace History workspace                      |
| Metadata          | Non-sensitive key/value; redact confidential keys            |
| Provenance        | Actor, correlation, source system, import batch refs         |
| Available actions | Server-authoritative command set                             |
| Linked artefacts  | Cross-navigate to endpoint domains (read)                    |
| Warnings          | Cycle, duplicate, broken endpoint, taxonomy, concurrency     |

### 8.3 Mutual exclusion

Right-rail modes: Inspector | History | Lineage | Details | Activity. Only one dense analysis mode dominates by default.

---

## 9. Trace Link Editor model

### 9.1 Commands (consume ENG-030A Part 2)

| Command                                                                   | UX meaning                                                 |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Create                                                                    | New Trace Link; endpoints resolved via Endpoint Resolution |
| Validate                                                                  | draft → validated                                          |
| Approve                                                                   | validated → approved                                       |
| Retire                                                                    | → retired                                                  |
| Supersede                                                                 | → superseded + successor                                   |
| Update confidence / authority / scope / rationale / provenance / metadata | Field updates where domain permits                         |
| Endpoint correction                                                       | Only when domain + `availableActions` permit               |

### 9.2 Editing workflow

1. Establish tenant + actor from session (never payload-only tenant).
2. Prefill from Matrix/Explorer context when present.
3. Client may perform ergonomic checks; **server validates authoritatively**.
4. On success, refresh summary + `availableActions`; update search projection is server-side.
5. Warnings (e.g. potential cycles) surface as non-blocking unless type policy forbids.
6. Optimistic concurrency conflicts present typed errors; user reloads/retry.

### 9.3 Bulk editing principles

| Principle           | Rule                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Explicit bulk mode  | Multi-select → bulk action bar                                                               |
| Homogeneous actions | Only offer actions permitted for **all** selected items (intersection of `availableActions`) |
| Per-item outcomes   | Server validates each; UI shows success/fail list                                            |
| High-risk defaults  | Bulk approve / supersede require strong confirmation                                         |
| No client authority | Intersection of actions is UX filter only; server re-checks                                  |

---

## 10. Trace History workspace

- Displays **immutable Trace Link history** (domain evolution) — distinct from Platform Audit.
- History view must label the distinction: “Domain history” vs “Audit / who did what”.
- Supports filter by change class (created, validated, confidence changed, …).
- Read permission: `qep.traceability.trace_links.history.view`.
- No in-place mutation of history records.

---

## 11. Trace Link Comparison

Compare two Trace Links (or predecessor / successor):

- Trace Type, endpoints, lifecycle, confidence, authority, scope, rationale presence, warnings;
- Field-level diff presentation;
- Navigation to supersession chain (bounded).  
  Does not imply Impact analysis.

---

## 12. Trace Taxonomy Browser

- Lists the **16 normative Trace Types** (ARCH-007 / Part 1).
- Display metadata may be shown; identifiers deterministic.
- Deprecated taxonomy entries remain visible (not silently removed).
- Tenant extensions only if ARCH-007 expressly permits (currently: reject arbitrary types).
- Administer surfaces require `qep.traceability.taxonomy.administer`; view requires `taxonomy.view`.

---

## 13. Trace Validation workspace

Operational review surface for:

- draft Trace Links awaiting validation;
- validated awaiting approval;
- items with warnings (cycles, duplicates, broken endpoints);
- bulk validate/approve where intersection of actions allows.

Does not invent lifecycle rules.

---

## 14. Search model

Consumes Platform Unified Search (020) with entity `trace_link`.

| Mode                   | Behaviour                                                                      |
| ---------------------- | ------------------------------------------------------------------------------ |
| Global                 | Shell search — Trace Links among other artefacts                               |
| Contextual             | Scoped to Explorer filters / endpoint neighbourhood / Matrix window            |
| Trace ID               | Direct `trl_*` navigation                                                      |
| Endpoint search        | Find links by endpoint id/type                                                 |
| Taxonomy search        | Find by Trace Type label/id                                                    |
| Saved searches         | Named facet queries; never grant permissions                                   |
| Advanced filters       | Same families as Explorer                                                      |
| Cross-domain discovery | Results may deep-link into Requirements / future domains **via their SoR UIs** |

Selecting a search result **must** load authoritative Trace Link detail (ENG-030A Part 2), not treat the index as SoR.

---

## 15. Lineage navigation model

### 15.1 Concepts

| Concept                 | Meaning                                                         |
| ----------------------- | --------------------------------------------------------------- |
| Upstream                | Artefacts reachable via inbound Trace Links (bounded)           |
| Downstream              | Artefacts reachable via outbound Trace Links (bounded)          |
| Breadcrumb              | Workspace → Traceability → View → Trace Link → Endpoint context |
| Parent / child context  | Display grouping only — SoR remains Trace Links                 |
| Chain traversal         | Bounded hop expansion with explicit “load more”                 |
| Supersession navigation | Predecessor ↔ successor                                         |
| Cross-domain navigation | Open endpoint in owning module Workbench when registered        |

### 15.2 Bounds

- Default depth 1; user-expandable to a configured maximum.
- No unbounded graph traversal.
- Cycle warnings from server preserved; UI must not silently convert warnings to hard blocks unless Trace Type policy forbids cycles.
- **No graph engine required** for lineage — list/tree presentation is normative.

---

## 16. Analysis model (future presentation)

Architecture defines **interaction slots** for future analysis services. **No calculations** in this programme.

| Analysis view         | Interaction intent                                    | Truth owner                       |
| --------------------- | ----------------------------------------------------- | --------------------------------- |
| Coverage              | Show projected coverage indicators on Matrix/Explorer | Future Coverage Engine            |
| Impact                | Show projected impact neighbourhood / scores          | Future Impact Engine              |
| Certification lineage | Navigate certification-related Trace Link chains      | Trace Links + Certification SoR   |
| Evidence lineage      | Navigate evidence-related chains                      | Trace Links + Evidence SoR        |
| Missing traces        | List expected-but-absent cells (policy-driven later)  | Future policy + Trace queries     |
| Orphan traces         | Links with unresolved/unavailable endpoints           | Endpoint resolver + Trace queries |
| Broken traces         | Failed resolution / retired endpoints                 | Endpoint resolver                 |
| Potential cycles      | Warning list from bounded cycle detection             | Traceability domain (Part 1/2)    |
| Duplicate traces      | Duplicate candidate list                              | Traceability domain               |
| Warnings              | Aggregate warning inbox                               | Traceability + Attention Engine   |

Workbench **must not** store derived Coverage or Impact truth on Trace Link records.

---

## 17. Available actions integration

| Rule            | Detail                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| Source          | Server `availableActions` on detail and list summary (ENG-030A Part 2) |
| Client role     | Render and enable only returned actions                                |
| Forbidden       | Reconstructing lifecycle/permission matrices in the client             |
| Bulk            | Intersection of selected items’ actions                                |
| Stale UI        | After mutation or concurrency conflict, re-fetch actions               |
| Command Palette | Registers commands but still gated by server on execute                |

Potential actions (illustrative; server is authoritative): view, validate, approve, modify, retire, supersede, update confidence/authority/scope/rationale, inspect history.

---

## 18. Accessibility model

| Area                | Requirement                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Keyboard            | Full operation without pointer for Explorer, Matrix, Inspector, Editor, commands, bulk confirm |
| Focus               | Visible focus; logical tab order across panes; restore focus after dialogs                     |
| Screen readers      | Named regions; tables/grids for Explorer/Matrix; live regions for validation/warnings          |
| Colour independence | Lifecycle/confidence/warnings never colour-only                                                |
| High contrast       | Token themes support high-contrast (006/022)                                                   |
| Responsive          | Usable on narrower viewports via collapsible panes; Matrix may switch to list fallback         |
| WCAG                | Target **AA** for Workbench chrome and Traceability content                                    |
| Large datasets      | Virtualisation; announce counts; jump-to Trace ID                                              |

Exact keymaps are engineering parameters under Platform 019; architecture requires discoverable, conflict-free registration.

---

## 19. Performance model

Architect for scale classes:

| Scale   | Strategy                                                                  |
| ------- | ------------------------------------------------------------------------- |
| 100     | Full list comfortable; minimal virtualisation                             |
| 1 000   | Virtual scrolling; server pagination default                              |
| 10 000  | Mandatory virtualisation; server filters; lazy expansion                  |
| 100 000 | Windowed Matrix; bounded queries; no client-side full-set materialisation |

Cross-cutting rules:

- Pagination / cursors on all list and matrix queries;
- Incremental loading for lineage expansion;
- Server-side filtering preferred over client filter of huge sets;
- Lazy expansion of Explorer groups;
- No unbounded graph fetch;
- List summary contract avoids N+1 detail queries;
- Search is projection; detail load is authoritative and on demand.

---

## 20. Future graph strategy

Graph visualisation is an **optional analytical enhancement**, not a dependency.

| Rule           | Detail                                                      |
| -------------- | ----------------------------------------------------------- |
| Default UX     | Matrix + Explorer list + Inspector                          |
| Graph role     | Optional lens over the same Trace Link SoR                  |
| Escape hatch   | “Open as list / matrix” always available                    |
| Bounds         | Bounded depth; cycle guards; never load entire tenant graph |
| Accessibility  | Graph never sole path to information                        |
| Implementation | Not authorised by ARCH-008                                  |

See [FUTURE-GRAPH-STRATEGY.md](./FUTURE-GRAPH-STRATEGY.md).

---

## 21. AI considerations

| AI may                                        | AI must not                                                |
| --------------------------------------------- | ---------------------------------------------------------- |
| Propose Trace Links (`ai_suggestion` origin)  | Own Trace Links or auto-approve                            |
| Consume links, search, future coverage/impact | Set authoritative confidence without human/policy workflow |
| Assist search / ranking suggestions           | Bypass lifecycle, permissions, or audit                    |

Workbench may later surface AI proposals in Validation queues; promotion follows Part 1 AI-promotion policy. **No AI implementation under ARCH-008.**

---

## 22. MCP considerations

| MCP may                           | MCP must not                               |
| --------------------------------- | ------------------------------------------ |
| Consume Traceability REST APIs    | Become part of the Traceability domain     |
| Read Workbench-oriented summaries | Autonomously mutate without governed authz |
| Use search projections            | Treat search as SoR                        |

Workbench architecture keeps contracts MCP-consumable (stable summaries, actions, errors) without embedding MCP. **No MCP implementation under ARCH-008.**

---

## 23. Notifications and attention

Consume Platform Attention Engine (021). Relevant classes:

- validation / lifecycle failures;
- cycle warnings;
- duplicate conflicts;
- concurrency conflicts;
- permission denials;
- broken endpoint alerts (when resolver reports).

Modules publish events; they do not own notification subsystems.

---

## 24. Security and tenancy (UI)

- Every visible action permission-filtered (`qep.traceability.*`).
- Cross-tenant Trace Links / endpoints never appear.
- Not-found privacy preserved (no cross-tenant existence leakage).
- Superadmin is distinct tier, not a bypass (007).
- Rationale / metadata display must respect sensitivity — no unnecessary confidential endpoint content.

---

## 25. Extensibility

Future domains register:

| Extension point    | Contribution                                      |
| ------------------ | ------------------------------------------------- |
| Matrix families    | Row/column domain pairs                           |
| Endpoint openers   | Deep-link into owning module Workbench            |
| Analysis providers | Coverage / Impact / lineage presentation adapters |
| Search facets      | Domain-specific facets on Trace queries           |
| Commands           | 019 registration                                  |
| Inspector sections | Additional read-only sections for domain context  |

Forbidden: parallel shells; UI-authoritative permissions; treating Trace Links as Requirements Relationships; storing coverage/impact on Trace Link aggregates.

---

## 26. Canonical user workflows

### 26.1 Create Trace Link

Explorer or Matrix empty cell → Editor → resolve endpoints → create → warnings if any → optional validate/approve.

### 26.2 Govern lifecycle

Select Trace Link → Inspector actions (validate / approve / retire / supersede) → History updates.

### 26.3 Explore from endpoint

Open endpoint context → inbound/outbound Explorer → Inspector → cross-navigate.

### 26.4 Matrix review

Select matrix family → filter window → inspect cells → create missing (if permitted) → note coverage slots when service exists.

### 26.5 Review warnings

Validation workspace → cycle/duplicate/broken → remediate via Editor or retire/supersede.

### 26.6 Historical / superseded review

Open retired/superseded → read-only Inspector → navigate successor → compare.

---

## 27. Consistency validation

| Baseline               | Consistency claim                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| ARCH-006               | Same shell, pane grammar, sessions, command palette, a11y, server actions                 |
| ARCH-007               | Trace Link ownership; no Requirements/Verification SoR ownership; coverage/impact derived |
| ENG-030A Part 1        | Lifecycle, taxonomy, cycle warning semantics, AI promotion policy preserved               |
| ENG-030A Part 2        | Consumes list/detail/`availableActions`/permissions/search/audit contracts                |
| Requirements Workbench | Distinct Relationship vs Trace Link UX; shared Workbench grammar                          |
| Platform 005/016–023   | Hosted module content; no parallel shell                                                  |

No intentional contradictions. Where Traceability specialises (Matrix-first, Trace Explorer), it **extends** ARCH-006 without replacing it.

---

## 28. Non-goals

This architecture does **not** define or authorise:

- React / Next.js / components / routes;
- new APIs or persistence;
- Coverage / Impact engines;
- graph libraries or graph DB;
- Verification / Evidence / Certification product builds;
- AI or MCP implementation;
- pixel-perfect mockups.

---

## 29. Architecture decisions (ADRs)

### ADR-ARCH-008-001 — Extend ARCH-006; do not fork the Workbench shell

**Decision:** Traceability Workbench reuses ARCH-006 grammar and Platform shell; only Traceability-specific interaction is specified here.  
**Rationale:** Consistency with Requirements; reduced training cost; no architectural drift.  
**Status:** Proposed with this architecture.

### ADR-ARCH-008-002 — Matrix / list / inspector first; graph optional

**Decision:** Primary Traceability UX is Explorer list, Matrix, and Inspector. Graph is optional future enhancement.  
**Rationale:** Accessibility, performance, SoR clarity; ARCH-006 list-before-graph precedent.  
**Status:** Proposed with this architecture.

### ADR-ARCH-008-003 — Trace Links ≠ Requirements Relationships in UX

**Decision:** Distinct navigation, permissions, labels, and workspaces; no unified “relationship” metaphor that collapses ARCH-005 and ARCH-007.  
**Rationale:** Semantic honesty (ARCH-007).  
**Status:** Proposed with this architecture.

### ADR-ARCH-008-004 — Server-authoritative availableActions

**Decision:** All mutating and many navigational affordances derive from server `availableActions` and permissions.  
**Rationale:** Zero Trust; ENG-030A Part 2 contract.  
**Status:** Proposed with this architecture.

### ADR-ARCH-008-005 — Analysis views are presentation slots

**Decision:** Coverage, Impact, and lineage analysis UIs are architected as consumers of future services; Workbench never owns derived truth.  
**Rationale:** ARCH-007 coverage/impact boundary.  
**Status:** Proposed with this architecture.

### ADR-ARCH-008-006 — Cycle warnings remain warnings by default

**Decision:** UI preserves Part 1/2 warning semantics; does not silently hard-block all cycles.  
**Rationale:** Domain authority; type-specific forbid policies only when normative.  
**Status:** Proposed with this architecture.

---

## 30. Conformance checklist for future engineering

Future Workbench engineering must demonstrate:

1. Shell regions respected (005/016); ARCH-006 grammar reused.
2. Trace Explorer supports filters, saved filters, bulk select, list summary contract.
3. Trace Matrix supports bounded queries and indicator slots without calculating coverage/impact.
4. Inspector shows all §8 regions and server `availableActions`.
5. Editor commands map 1:1 to ENG-030A Part 2 application commands.
6. History distinct from Platform Audit.
7. Search uses `trace_link` projection; detail re-load authoritative.
8. Lineage bounded; no mandatory graph.
9. Accessibility §18 satisfied.
10. Performance strategies for ≥10k Trace Links.
11. No Coverage/Impact engines, AI, or MCP shipped under Workbench unless separately authorised.
12. Permissions `qep.traceability.*` enforced server-side.

---

## 31. Document control

| Revision   | Date       | Notes                                                      |
| ---------- | ---------- | ---------------------------------------------------------- |
| 1.0.0-arch | 2026-07-26 | Initial Owner Architecture Specification (APZQEP-ARCH-008) |

**End of authoritative specification.**
