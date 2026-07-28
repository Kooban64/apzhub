# APZQEP-ARCH-006

# Requirements Workbench Architecture

# Owner Architecture Specification

| Field                  | Value                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| Programme              | **APZQEP-ARCH-006**                                                                       |
| Title                  | **Requirements Workbench Architecture**                                                   |
| Classification         | Owner Architecture Specification                                                          |
| Product                | APZ QEP (APZ Quality Engineering Platform)                                                |
| Platform baseline      | APZHUB Platform 1.4 — CERTIFIED                                                           |
| Shell baseline         | Documents **005**, **016**, **017**, **018**, **019**, **020**, **021**, **022**, **023** |
| Design System          | Document **006** / UI Component SDK **028**                                               |
| Relationship semantics | **APZQEP-ARCH-005** — ACCEPTED / CLOSED / COMPLETE                                        |
| Engineering baseline   | ENG-020A–020E **ACCEPTED**; ENG-020F Parts 1–2 **ACCEPTED** (backend capability complete) |
| Downstream engineering | **APZQEP-ENG-020F Part 3** (Workbench UI) — **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**   |
| Document revision      | **1.0.0-arch**                                                                            |
| Revision date          | 2026-07-26                                                                                |
| Nature                 | Architecture only — implementation-independent                                            |
| Status                 | **ACCEPTED / CLOSED / COMPLETE**                                                          |
| Date accepted          | 2026-07-26                                                                                |

**Normative language:** **must** = mandatory; **should** = strong recommendation; **may** = optional.

---

## 0. Authority and stop conditions

This specification defines the **Authoritative Workbench Architecture** for APZ QEP Requirements and the **reusable interaction standard** for future APZ QEP engineering modules.

It does **not** authorise UI implementation, React components, graph rendering, state-management code, APIs, databases, repositories, search index implementation, testing programmes, or operational readiness packs.

```text
Architecture → Owner Acceptance → Owner Engineering Programme Instruction (ENG-020F Part 3)
  → Workbench implementation
```

Do **not** begin ENG-020F Part 3 until a separate **Owner Engineering Programme Instruction** is issued.

Do **not** begin Traceability, Verification, Test Specifications, Test Cases, Execution, Evidence, Certification, AI, or MCP UI programmes under this architecture alone — those programmes consume this Workbench standard when separately authorised.

This architecture must not contradict Platform Documents 005/016–023 or Design System 006. Where QEP Workbench specialises shell behaviour, it **extends** the Platform shell; it does not replace it.

ENG-020D (Content Versions), ENG-020E (Baselines), ARCH-005 / ENG-020F (Relationships) remain authoritative for semantics. The Workbench presents and operates on those facts; it must never invent alternate semantics.

---

## 1. Purpose

Define the complete user interaction architecture for the **APZ QEP Requirements Workbench**.

This architecture shall become the reusable interaction standard for all future APZ QEP engineering modules so that Traceability, Verification, Specifications, Test Cases, Execution, Evidence, and Certification operate in the **same Workbench operating model** without redesign.

The objective is not merely to design screens, but to define how users:

- create and edit engineering artefacts;
- analyse relationships and impact;
- navigate large governed sets;
- review, compare, and freeze configuration;
- perform bulk and keyboard-driven work;
- remain in persistent context across sessions.

Products such as Jira, Azure DevOps, and Polarion remain consistent because they share one workbench grammar. APZ QEP must do the same.

---

## 2. Workbench philosophy

### 2.1 Engineering-first interaction model

The Workbench is an **engineering operating environment**, not a content website.

| Principle                       | Rule                                                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Artefact-centric                | Primary objects are Requirements, Relationships, Content Versions, Baselines (and later Traceability/Verification artefacts) |
| Server authority                | Permissions, lifecycle, validation, and available actions are server-authoritative; UI never invents authority               |
| Semantic honesty                | Labels use APZ QEP product names (Requirements, Relationships, Baselines) — never backend engine brands                      |
| No silent rewrite               | Immutable facts (locked Baselines, Content Versions, retired Relationships) are visible but not editable                     |
| Analyse without leaving context | Relationship, impact, version, and baseline views open as panes/tabs — not navigational dead-ends                            |
| Progressive disclosure          | Density increases with expertise; defaults stay calm                                                                         |

### 2.2 Workspace-based navigation

Users work inside a **QEP workspace** hosted by the Platform Desktop Shell (005/016/017). Modules register workspaces; the shell owns chrome.

### 2.3 Multi-pane architecture

Canonical work uses simultaneous panes (Explorer + Main + Inspector / Relationship / Details). Panes are first-class, resizable, hideable, and restorable (018).

### 2.4 Persistent user context

The Workbench must persist, subject to permissions on restore:

- selected artefact identity;
- open tabs / split layout;
- explorer expansion, filters, saved view;
- inspector mode;
- search query (session-scoped unless saved).

Persistence stores **references + UI state**, never authoritative business data copies (018, 011).

### 2.5 Keyboard-first where appropriate

Power paths (command palette, navigation, transitions, search, bulk confirm) must be keyboard-operable. Mouse remains fully supported. See §14.

### 2.6 Consistency across future modules

Every future QEP module must reuse:

- the same pane grammar (§4);
- the same explorer patterns (§5);
- the same inspector contract (§11);
- the same search facets pattern (§9);
- the same comparison grammar (§10);
- the same notification classes (§13);
- the same extensibility slots (§15).

---

## 3. Alignment with Platform shell

| Platform capability | Workbench consumption                                                         |
| ------------------- | ----------------------------------------------------------------------------- |
| 005 / 016 Shell     | Hosts Header, Activity Bar, Sidebar, Workspace, Context Panel, Status Bar     |
| 017 Navigation      | Activity Bar → QEP → Requirements sidebar → Workbench internal navigation     |
| 018 Sessions        | Named sessions, split views, draft recovery for Workbench layout              |
| 019 Command Palette | Primary action surface for Workbench commands                                 |
| 020 Unified Search  | Requirements Search Providers register; Workbench consumes results            |
| 021 Notifications   | Workbench surfaces Attention Engine outcomes; modules publish events only     |
| 022 / 006 Tokens    | All Workbench chrome uses Design System tokens; Lucide icons only             |
| 023 Preferences     | Density, panel defaults, theme — never grant permissions                      |
| 007 IAM             | Permission-driven visibility of explorers, commands, bulk ops, taxonomy admin |

The Requirements Workbench is a **module workspace content model** inside the shell — not a parallel application shell.

---

## 4. Workspace architecture (canonical layout)

### 4.1 Layout diagram

```text
┌──────────────────────────────── Header / Global Toolbar ────────────────────────────────┐
│ Brand · Workspace switch · Global search · Command palette · Notifications · Account   │
├─ Activity Bar ─┬─ Module Sidebar ─┬──────────────── Main Workspace ──────────┬─ Right ─┤
│ QEP            │ Requirements     │ Tabs · Breadcrumbs · Contextual actions  │ Panels  │
│ …              │ Explorer tree /  ├──────────────────────────────────────────┤ Inspect │
│                │ saved views      │                                          │ Relat.  │
│                │ filters          │   Editor / Comparison / Analysis view    │ Details │
│                │                  │   (optional split)                       │ Activ.  │
├────────────────┴──────────────────┴──────────────────────────────────────────┴─────────┤
│ Status Bar — lifecycle · selection count · sync/health · scope · keyboard hints         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Regions (normative)

| Region                 | Ownership                       | Purpose                                                           |
| ---------------------- | ------------------------------- | ----------------------------------------------------------------- |
| **Global navigation**  | Platform shell                  | Product/workspace switch; never module-private                    |
| **Module navigation**  | QEP module registration         | Requirements / Baselines / (future Traceability…)                 |
| **Explorer panel**     | Workbench                       | Hierarchical browse, filters, saved views (§5)                    |
| **Main workspace**     | Workbench                       | Editor, comparison, analysis tabs; optional split                 |
| **Inspector panel**    | Workbench                       | Focused property/action surface for selection (§11)               |
| **Relationship panel** | Workbench                       | Inbound/outbound/grouped Relationships (§6) — list/semantic first |
| **Details panel**      | Workbench                       | Extended metadata, audit summary, links                           |
| **Activity panel**     | Workbench / Platform            | Recent actions, attention items, validation feed                  |
| **Status bar**         | Shell + Workbench contributions | Lifecycle, counts, scope, health                                  |
| **Notifications**      | Platform Attention Engine       | Toast/badge/digest — not module-owned subsystems                  |
| **Breadcrumbs**        | Workbench                       | Workspace → view → artefact → version/baseline context            |
| **Contextual actions** | Workbench                       | Toolbar/command set filtered by permission + lifecycle            |

### 4.3 Pane rules

1. Explorer is left-primary; Inspector/Relationship/Details share the right rail with mode tabs.
2. Only one **primary selection** exists at a time; multi-select enables bulk mode (§12).
3. Panes may be collapsed; collapse state is preference-persisted.
4. Split view is horizontal or vertical within Main Workspace only (§8.4).
5. Relationship **graphs** are a future visualisation mode (§7); default Relationship experience is the Relationship Explorer list/group model (§6).

### 4.4 Density and theming

Workbench must support comfortable / compact density via Preference Service (023). Themes swap tokens only (006/022). No hardcoded colours for semantic meaning without a non-colour cue (§14).

---

## 5. Requirements Explorer

### 5.1 Purpose

Primary navigational inventory of Requirements (and related configuration views) for authoring and analysis.

### 5.2 Hierarchical navigation

Explorer must support hierarchies such as:

- Project / product grouping (when tenant model provides them);
- Type / category grouping;
- Lifecycle state grouping;
- Owner grouping;
- Baseline membership views;
- Flat list with optional nesting by parent refinement (when Relationships of type `refines` are used for display grouping — **display only**, SoR remains Relationships Engine).

Hierarchy presentation must not invent parentage absent from the Relationship/Requirements models.

### 5.3 Grouping, filtering, sorting

| Capability  | Rule                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Grouping    | User-selectable group keys: lifecycle, type, owner, classification tags, baseline membership      |
| Filtering   | Lifecycle, type, priority, owner, tags, has-relationships, conflicts, pinned-version, in-baseline |
| Sorting     | Key, title, updatedAt, lifecycle, priority                                                        |
| Combinators | Filters AND together; saved views capture the full predicate                                      |

### 5.4 Favourites, recent, saved views

- **Favourites** — user-scoped references to Requirement ids.
- **Recent** — last N opened artefacts (session + persisted preference).
- **Saved views** — named filter/group/sort configurations; may be personal or org-shared when authorised.
- Saved views never grant permissions.

### 5.5 Baseline and Content Version views

| View            | Meaning                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| Living          | Current Requirements identities (mutable model)                           |
| Baseline        | Membership of a selected Baseline (Content Versions) — frozen when locked |
| Content Version | Historical or pinned content snapshots                                    |

Switching view must rebind Explorer rows to the correct identity class and show immutable indicators when applicable (§10).

### 5.6 Indicators

| Indicator                  | Meaning                                                              |
| -------------------------- | -------------------------------------------------------------------- |
| Lifecycle chip             | Draft / In Review / Approved / … (ENG-020C)                          |
| Relationship count / glyph | Has outbound/inbound; conflict highlight for `conflicts_with`        |
| Baseline pin               | Included in selected Baseline                                        |
| Version pin                | Content-Version-pinned Relationships or “viewing historical version” |
| Validation                 | Blocking validation present                                          |

Indicators are informational; authoritative state remains on the server.

---

## 6. Relationship Explorer

### 6.1 Purpose

Governed navigation and review of Relationships for the current selection (or scoped set), conforming to ARCH-005.

### 6.2 Modes

| Mode         | Content                                 |
| ------------ | --------------------------------------- |
| Outbound     | Relationships where selection is source |
| Inbound      | Relationships where selection is target |
| Both         | Combined, directionally labelled        |
| Conflicts    | `conflicts_with` only                   |
| Supersession | `supersedes` chains (bounded depth)     |

### 6.3 Grouping (normative)

Users must be able to group by:

- taxonomy type;
- strength;
- criticality;
- lifecycle (draft/active/deprecated/retired);
- scope (product/project/release/baseline);
- classification (when useful).

### 6.4 Semantic profile display

Each row must expose enough of the semantic profile to act without opening the editor:

- type + inverse label hint;
- strength, criticality, classification;
- lifecycle;
- scope;
- endpoint mode (living vs Content-Version-pinned);
- rationale presence / excerpt when mandatory types require it.

### 6.5 Actions

Permission-filtered: open target, create, activate, deprecate, retire, edit mutable profile fields, open Relationship Inspector. Lifecycle rules remain domain-owned (ENG-020F).

### 6.6 Explicit non-goal

Relationship Explorer is **not** a graph renderer. Graph visualisation principles are §7 only.

---

## 7. Relationship visualisation (principles only)

Architectural principles for a future graph mode. **No implementation authorised.**

### 7.1 Graph philosophy

- Graph is an **analytical lens**, never System of Record.
- Nodes = Requirements (or pinned Content Versions when in configuration mode).
- Edges = Relationships with type-encoded semantics.
- Default views must remain usable without the graph.

### 7.2 Dependency and impact presentation

| View         | Intent                                                          |
| ------------ | --------------------------------------------------------------- |
| Dependency   | Emphasise `depends_on`, `constrains`, `refines`, `derives_from` |
| Impact       | Emphasise outbound neighbourhood from a changed Requirement     |
| Conflict     | Emphasise `conflicts_with`                                      |
| Supersession | Chain visualisation with single-head rules from ARCH-005        |

### 7.3 Layering and colouring

- Layer by taxonomy or by lifecycle — user selectable.
- Colour encodes **one** primary dimension at a time; always pair with shape/label/icon (WCAG).
- Deprecated/retired edges use reduced emphasis; retired excluded from default active graphs.

### 7.4 Interaction model

- Click node → select Requirement (updates Explorer/Inspector).
- Click edge → select Relationship.
- Expand/collapse neighbourhood with **bounded depth** and cycle guards (ARCH-005).
- “Open as list” must always be available (escape hatch to Relationship Explorer).

### 7.5 Expansion behaviour

Default depth 1; user may expand to a configured maximum. Expansion must never load unbounded graphs into the UI.

---

## 8. Requirement Editor

### 8.1 Editing workflow

1. Select Requirement (or create).
2. Main workspace opens Editor tab.
3. Dirty state is local draft until save command succeeds.
4. Save invokes Platform Service → domain validation → Content Version policy (ENG-020D) as applicable.
5. Validation errors present inline + Activity/Notification (§13).
6. Lifecycle transitions are explicit commands — never side effects of typing.

### 8.2 Panels within Editor

| Panel               | Content                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| Body                | Title, description, acceptance criteria                                     |
| Metadata            | Type, priority, category, owner, tags, references                           |
| Semantic / quality  | Classification fields that are Requirement-owned (not Relationship profile) |
| Relationships       | Embedded summary + “Open Relationship Explorer”                             |
| Versions            | Current/latest, history entry points                                        |
| Baseline membership | Which Baselines include which Content Versions                              |

### 8.3 Relationship and version awareness

- Editor must show whether the user is viewing **living** content vs a **historical Content Version**.
- Editing historical Content Versions is forbidden (immutability).
- Creating Relationships from Editor uses ENG-020F commands; editor never stores private graphs.

### 8.4 Split view

Main workspace may split to show:

- Requirement A | Requirement B;
- Requirement | Relationship Explorer;
- Requirement | Baseline/Version comparison;
- Living | Historical Content Version.

Split layouts persist per session (018).

### 8.5 Validation presentation

| Severity | Presentation                                      |
| -------- | ------------------------------------------------- |
| Error    | Blocks save/transition; inline + Activity         |
| Warning  | Non-blocking; visible until dismissed or resolved |
| Info     | Contextual guidance                               |

Client-side UX validation may improve ergonomics but **must not** be authoritative.

---

## 9. Search experience

Workbench search consumes Platform Unified Search (020). Requirements module registers Search Providers for Requirements, Relationships, Baselines, Content Versions.

### 9.1 Modes

| Mode           | Behaviour                                                            |
| -------------- | -------------------------------------------------------------------- |
| Global         | Shell search — cross-artefact, permission-filtered                   |
| Contextual     | Scoped to current Explorer view / Baseline / selection neighbourhood |
| Saved searches | Named queries with facets; personal or shared                        |

### 9.2 Facets (normative set)

- taxonomy / Relationship type;
- Requirement lifecycle;
- Relationship lifecycle;
- strength / criticality / classification;
- scope;
- Baseline id;
- Content Version id / “pinned only”;
- owner; tags; project.

### 9.3 Results behaviour

- Selecting a result navigates Workbench selection without destroying layout.
- Search indexes are projections; SoR remains Requirements / Relationships / Baselines engines.

---

## 10. Baseline and Content Version experience

### 10.1 Baseline navigation

- Baselines appear in module navigation and Explorer Baseline views.
- States: Draft / Locked / Archived (ENG-020E) with clear immutable indicators when locked/archived.
- Empty lock remains forbidden (domain).

### 10.2 Baseline comparison workflow

1. Select base and target Baselines.
2. Comparison shows membership added / removed / unchanged.
3. Version-changed (same Requirement, different Content Version) is a first-class difference class.
4. Opening a difference focuses the Requirement + relevant Content Versions in split view.

### 10.3 Content Version experience

| Concept                        | UX meaning                                                                |
| ------------------------------ | ------------------------------------------------------------------------- |
| Current / latest               | Tip of living history (if permitted)                                      |
| Historical                     | Immutable snapshot                                                        |
| Pinned                         | Referenced by Relationship endpoint or Baseline membership                |
| Superseded (Requirement-level) | Communicated via `supersedes` Relationships — not a Content Version state |

### 10.4 Content Version comparison

Field-level diff of two Content Versions for one Requirement (ENG-020D). Presentation must not imply Baseline membership changes.

### 10.5 Frozen / immutable indicators

Locked Baseline, archived Baseline, Content Version, retired Relationship — must show persistent non-colour-only immutable affordances and disable mutating actions.

---

## 11. Inspector panels

### 11.1 Contract

Every Inspector:

- binds to the current primary selection;
- is read-mostly with explicit edit commands;
- shows `availableActions` from server;
- never embeds backend role names;
- supports deep-link open.

### 11.2 Inspector kinds

| Inspector       | Primary content                                                                |
| --------------- | ------------------------------------------------------------------------------ |
| Requirement     | Identity, lifecycle, metadata, validation, quick relationships                 |
| Relationship    | Full semantic profile, endpoints, rationale, lifecycle actions                 |
| Baseline        | Status, membership summary, integrity fingerprint status, lock/archive actions |
| Content Version | Number, hash/algorithm, created metadata, compare entry                        |
| Audit           | Recent auditable facts for selection (Platform Audit projection)               |

### 11.3 Mutual exclusion

Right-rail modes switch among Inspector / Relationship / Details / Activity. Relationship Explorer may dock as right-rail mode or bottom pane; only one dense analysis pane should dominate by default to avoid cognitive overload.

---

## 12. Bulk operations

### 12.1 Architected bulk ops (Requirements Workbench)

| Operation                     | Notes                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------- |
| Bulk lifecycle transitions    | Only if every selected item permits the transition; else partial-fail report |
| Bulk classification / tagging | Requirement metadata only                                                    |
| Bulk export                   | Permission-gated; exports references + permitted fields                      |
| Bulk review assignment        | When review workflow fields exist                                            |

### 12.2 Relationship bulk

Bulk create is **out of default scope** (high semantic risk). Bulk deprecate/retire of Relationships may be offered only with strong confirmation and permission `relationships.transition` / `retire`.

### 12.3 Rules

- Multi-select enters bulk mode with explicit action bar.
- Server validates each item; UI shows per-item outcomes.
- No client-only bulk authority.

---

## 13. Notifications and attention

Workbench consumes Platform Attention Engine (021). Modules publish domain events; they do not own notification subsystems.

### 13.1 Classes relevant to Requirements Workbench

| Class                 | Examples                                                               |
| --------------------- | ---------------------------------------------------------------------- |
| Validation            | Save/transition rejected                                               |
| Warning               | Recommended rationale missing; dependency cycles detected analytically |
| Conflict              | Active `conflicts_with` involving selection                            |
| Lifecycle restriction | Illegal transition attempted                                           |
| Dependency impact     | Related artefacts may need review after change                         |
| Configuration         | Baseline lock/archive; integrity verification results                  |

### 13.2 Presentation

Badge + Activity panel + optional toast. Certification-blocking behaviour remains reserved to future policy programmes (ARCH-005).

---

## 14. Accessibility principles

| Area                | Requirement                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| Keyboard model      | Full operation without pointer for navigation, edit, commands, bulk confirm |
| Focus               | Visible focus; logical tab order across panes                               |
| Screen readers      | Regions labelled; live regions for validation; tables for Explorer rows     |
| Colour independence | State never colour-only                                                     |
| Large datasets      | Virtualised lists; announce counts; “jump to” commands                      |
| WCAG                | Target AA for Workbench chrome and content                                  |

### 14.1 Normative keyboard concepts

| Action             | Binding concept                     |
| ------------------ | ----------------------------------- |
| Command palette    | Platform Ctrl/Cmd+Shift+P           |
| Focus Explorer     | Workbench chord (module-registered) |
| Focus Editor       | Workbench chord                     |
| Next/prev artefact | j / k or arrow patterns in Explorer |
| Save               | Platform/module save command        |
| Toggle right rail  | Workbench chord                     |

Exact keymaps are engineering parameters under Platform conventions; architecture requires **discoverable, conflict-free registration** via Command Palette (019).

---

## 15. Extensibility — future modules

### 15.1 Plug-in model

Future modules register:

| Extension point        | Contribution                                                   |
| ---------------------- | -------------------------------------------------------------- |
| Sidebar entries        | Module navigation                                              |
| Explorer providers     | Artefact trees / saved views                                   |
| Main editors           | Tab types                                                      |
| Inspectors             | Selection inspectors                                           |
| Relationship consumers | Read Relationships via Platform Services; never private graphs |
| Search providers       | 020 registration                                               |
| Commands               | 019 registration                                               |
| Comparison providers   | Diff views for module artefacts                                |
| Status contributions   | Status bar items                                               |

### 15.2 Module reuse matrix

| Future module                        | Reuses                                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Traceability                         | Explorer + Relationship Explorer + graph principles + inspectors; consumes Relationships as read model |
| Verification                         | Same pane grammar; links to Requirements/Baselines/Content Versions                                    |
| Test Specifications / Cases          | Editor + Inspector + Baseline pinning patterns                                                         |
| Execution / Evidence / Certification | Activity + Inspector + immutable indicators + comparison grammar                                       |

### 15.3 Forbidden extensions

- Parallel shells or page layouts outside DEF;
- Module-private Requirement–Requirement graphs;
- UI-authoritative permissions;
- Hardcoded module lists in shell (025).

---

## 16. User workflow architecture (canonical)

### 16.1 Author Requirement

Explorer → Create → Editor → Save → (optional) create Relationships → Activate Relationships → Submit/Review lifecycle.

### 16.2 Analyse impact

Select Requirement → Relationship Explorer (outbound) → optional graph lens → open dependents in split.

### 16.3 Resolve conflict

Conflicts filter → Relationship Inspector → rationale/update or lifecycle deprecate → record outcome (domain).

### 16.4 Freeze configuration

Select Content Versions → Baseline draft → lock → integrity verified → downstream consumers use Baseline.

### 16.5 Compare releases

Baseline compare → open version-changed rows → Content Version compare → export/review.

### 16.6 Historical review

Open Content Version or retired Relationship → read-only Inspector → no mutating actions.

---

## 17. Interaction architecture (cross-cutting)

| Concern       | Rule                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| Selection     | Single primary selection; multi-select for bulk                                 |
| Tabs          | Artefact tabs in Main; closable; dirty guards                                   |
| Deep links    | URL/state encodes workspace + artefact + view mode; permission re-check on open |
| Optimistic UI | Allowed for non-authoritative chrome only; mutations await server               |
| Empty states  | Guided next actions; never blank confusion                                      |
| Error states  | Typed categories; no backend leakage (010)                                      |
| Loading       | Pane-level skeletons; avoid full-workspace blanking                             |

---

## 18. Navigation architecture (QEP-specific)

```text
Activity Bar: QEP
  → Sidebar: Requirements | Baselines | (future: Traceability | Verification | …)
    → Workbench internal:
         Explorer modes (Living | Baseline | Versions | Saved views)
         Main tabs (Editor | Compare | Analyse)
         Right rail (Inspector | Relationships | Details | Activity)
```

Breadcrumbs must answer: Workspace → Module area → View → Artefact → Version/Baseline context.

---

## 19. Security and tenancy (UI)

- Every command and visible action permission-filtered.
- Taxonomy administration surfaces require `relationships.taxonomy.administer` (or successor).
- Cross-tenant artefacts never appear.
- Superadmin is a distinct tier, not a hidden bypass (007).

---

## 20. Non-goals

This architecture does **not** define:

- React components, hooks, or state libraries;
- API routes or DTO shapes (see ENG-020F Part 2 for Relationships APIs);
- database schemas;
- graph library selection;
- pixel-perfect mockups;
- AI/MCP interaction (future programmes).

---

## 21. Architecture decisions (ADRs)

### ADR-ARCH-006-001 — One Workbench grammar for all QEP modules

**Decision:** Traceability, Verification, and later modules must extend this Workbench model rather than inventing separate shells.  
**Rationale:** Consistency and reduced training cost.  
**Status:** Proposed with this architecture.

### ADR-ARCH-006-002 — Relationship lists before graphs

**Decision:** Default Relationship UX is Explorer/Inspector; graphs are an analytical mode with bounded expansion.  
**Rationale:** SoR clarity; performance; accessibility.  
**Status:** Proposed with this architecture.

### ADR-ARCH-006-003 — Configuration views bind to Content Versions / Baselines

**Decision:** Authoritative configuration UX prefers Baseline and Content-Version-pinned interpretation over living-only views.  
**Rationale:** ENG-020D/020E + ARCH-005.  
**Status:** Proposed with this architecture.

### ADR-ARCH-006-004 — Server-authoritative available actions

**Decision:** UI action affordances derive from server `availableActions` / permissions, not client role matrices.  
**Rationale:** Zero Trust; ENG-020E/020F patterns.  
**Status:** Proposed with this architecture.

---

## 22. Conformance checklist for future engineering

Future ENG-020F Part 3 (and later UI programmes) must demonstrate:

1. Shell regions respected (005/016).
2. Explorer supports living / baseline / version views.
3. Relationship Explorer implements groupings in §6.
4. Editor enforces immutability rules.
5. Search uses Platform Search providers.
6. Baseline and Content Version comparison workflows exist.
7. Inspectors follow §11 contract.
8. Bulk ops follow §12.
9. Accessibility §14 satisfied.
10. No private graphs or UI-authoritative security.
11. Extensibility slots left open for Traceability/Verification.

---

## 23. Document control

| Revision   | Date       | Notes                                    |
| ---------- | ---------- | ---------------------------------------- |
| 1.0.0-arch | 2026-07-26 | Initial Owner Architecture Specification |

**End of authoritative specification.**
