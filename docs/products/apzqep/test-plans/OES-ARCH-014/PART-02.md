# APZQEP-OES-ARCH-014
# PART 2 — Information Architecture, Navigation & Session Restore

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ARCH-014 |
| Part | **2 of 5** |
| Programme | APZQEP-ARCH-014 |
| Status | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. Purpose

This Part defines the **information architecture**, **shell placement**, **permanent URL model**, and **session restore** contract for the Test Plans Workbench.

It **SHALL** enable an engineer to implement navigation and discovery without inventing information architecture. It **SHALL NOT** specify React components, Next.js file layout, or persistence.

---

## 2. Information architecture principles

1. The Workbench **SHALL** reuse the APZHUB Desktop shell grammar (Documents 005 / 016 / 017): Activity Bar → Sidebar → Workspace → Context / Inspector.
2. Test Plans **SHALL** appear as a first-class capability entry under the existing **APZ QEP** Activity Bar group — not nested inside another capability and not a competing shell.
3. Explorer **SHALL** be the default list surface; Inspector opens for a selected Plan; Dashboard is the capability root.
4. Navigation is hierarchical; search is global with a capability-scoped entry; filtering is contextual (mirrors ARCH-012 Part 1 Principle 7).
5. Every Plan **SHALL** have a permanent, deep-linkable URL (mirrors ARCH-012 Part 1 Principle 8).
6. The Workbench **SHALL** render server `availableActions` and **MUST NOT** invent client-side lifecycle legality (Part 1 W2).
7. Cross-capability links (Requirements, Traceability, Verification, Test Specifications) **SHALL** be references only; destination surfaces **MAY** be unavailable and **MUST** use governed empty/unavailable states.

---

## 3. Shell placement

### 3.1 Activity Bar

| Element | Requirement |
| ------- | ----------- |
| **APZ QEP** | Existing Activity Bar affordance hosting all QEP capabilities; Test Plans registers under it — no new top-level Activity Bar entry |

### 3.2 Sidebar (Test Plans module)

The Sidebar **SHALL** expose, at minimum, under a **Test Plans** entry:

| Nav item | Purpose | Default route concept |
| -------- | ------- | ---------------------- |
| **Dashboard** | Attention / counts / queues (Part 3) | `/workspace/qep/test-plans` |
| **Explorer** | Primary inventory | `/workspace/qep/test-plans/explorer` |
| **Review** | Plans awaiting review/approval decisions | `/workspace/qep/test-plans/review` |
| **Search** | Capability-scoped search entry (also reachable via global search) | `/workspace/qep/test-plans/search` |

Additional Sidebar items **MAY** be added only if a later accepted revision of this Part defines them. They **MUST NOT** appear in implementation before definition.

### 3.3 Workspace regions

| Region | Content |
| ------ | ------- |
| Primary workspace | Explorer table / Review queue / Dashboard widgets / Search results |
| Inspector (context panel or split) | Selected Plan detail (Part 3) |
| Overlays | Dialogs for submit / approve / reject / mark-ready / start-execution / complete / archive / cancel / supersede / clone / assign / schedule (Part 3 §9–10), driven by `availableActions` |

---

## 4. Permanent URL model (deep links)

### 4.1 Normative route patterns

Routes below are **architectural URL contracts**. Concrete Next.js file layout is deferred to Workbench Engineering; the paths **SHALL** remain stable.

| Pattern | Meaning |
| ------- | ------- |
| `/workspace/qep/test-plans` | Capability root → Dashboard |
| `/workspace/qep/test-plans/explorer` | Explorer |
| `/workspace/qep/test-plans/review` | Review queue |
| `/workspace/qep/test-plans/search` | Capability search |
| `/workspace/qep/test-plans/new` | Create Draft |
| `/workspace/qep/test-plans/plans/{planId}` | Plan deep link (Inspector primary — Summary) |
| `/workspace/qep/test-plans/plans/{planId}/edit` | Edit Draft |
| `/workspace/qep/test-plans/plans/{planId}/items` | Linked Specifications (Plan Items) panel |
| `/workspace/qep/test-plans/plans/{planId}/relationships` | Relationships panel |
| `/workspace/qep/test-plans/plans/{planId}/history` | History panel |
| `/workspace/qep/test-plans/plans/{planId}/versions` | Versions / lineage panel |
| `/workspace/qep/test-plans/plans/{planId}/compare?from={rev}&to={rev}` | Compare — **governed unavailable** contract slot until Infrastructure L-01 is closed (Part 4 §6) |
| `/workspace/qep/test-plans/plans/{planId}/audit` | Audit panel |

### 4.2 Deep-link rules

1. Opening `/plans/{planId}` **SHALL** select that Plan and open the Inspector at the Summary panel.
2. If `{planId}` is not found or not permitted, the Workbench **SHALL** show a governed not-found / forbidden state — it **MUST NOT** invent data (Part 4 §7).
3. Query parameters **MAY** encode Explorer filters (`status`, `owner`, `lead`, `scope`, `q`, date ranges) and **MUST** be round-trippable with the Explorer.
4. URLs **SHALL NOT** embed backend engine identifiers, secret tokens, or `expectedRevision` concurrency tokens.
5. Opening `.../compare` **SHALL** render the governed unavailable slot defined in Part 4 §6 while Infrastructure L-01 remains open; the route **SHALL NOT** be removed, so it becomes live automatically once Infrastructure ships `GET .../compare`.

---

## 5. Persona → entry surfaces

| Persona | Primary entry | Secondary |
| ------- | ------------- | --------- |
| Viewer | Explorer | Search, Plan deep link |
| Tester | Explorer (assigned filter) | Plan deep link (assigned items) |
| Lead | Dashboard (My owned / My assigned) | Explorer, Create Draft |
| QA Manager | Review queue | Dashboard, Explorer |

Permission Platform **SHALL** gate visibility of Sidebar items and actions. The Workbench **MUST NOT** show actions absent from `availableActions` / grants.

---

## 6. Explorer model

### 6.1 Purpose

The **Plan Explorer** is the list-first inventory of Test Plans for a tenant.

### 6.2 Browseable columns (minimum)

| Column | Source | Notes |
| ------ | ------ | ----- |
| Number | Infrastructure DTO `number` | e.g. `TP-001` |
| Title | DTO `title` | Primary label |
| Status | DTO `status` | Badge; Draft…Archived (Appendix B) |
| Scope | DTO `scope` / `planType` | Release, Product, Feature, Milestone, Sprint, Regression, Certification, Custom |
| Priority | DTO `priority` | |
| Owner | DTO ownership | |
| Assigned lead | DTO assignment | |
| Planned start / end | DTO schedule | |
| Item count | Derived from items on DTO | Included vs total |
| Updated | DTO `updatedAt` | Sort default: updated desc |
| Version | DTO `versionLabel` | Label |

### 6.3 Explorer capabilities

| Capability | Rule |
| ---------- | ---- |
| Filtering | Contextual: status, scope, owner, lead, priority, tags, scheduled window, text query (`q`) |
| Sorting | At least: `updatedAt`, `createdAt`, `number`, `title`, `status`, `priority`, `plannedStart` (ENG-060B Part 2 §5) |
| Saved views | Named filter + column presets per user (Preference Service, Document 023) — presentation only |
| Selection | Single select opens Inspector; multi-select **MAY** enable bulk UI only for actions present in **every** selected row's `availableActions` intersection |
| Pagination | Server-driven; max `pageSize` = 50 (ARCH-013 / ENG-060B) |
| Empty / loading / error | Design-system governed states (Part 4 §7) |
| Default set | Excludes `archived`, `cancelled`, `superseded` unless explicitly requested (mirrors ENG-060B Part 3 §5 default query behaviour) |

### 6.4 Explorer non-goals

The Explorer **MUST NOT**:

- Invent hierarchy trees of Test Executions or Test Runs as owned children.
- Display execution results as Plan status.
- Perform client-side lifecycle transitions without an API call.
- Store business data as system of record.

### 6.5 Create affordance

A "New Test Plan" control **SHALL** appear only when the caller holds `qep.plan.create`. It **SHALL** open the Create Draft Form (Part 3 §5). Creation **MUST** call the create REST command; the client **MUST NOT** invent an identifier, number, or status.

---

## 7. Review queue model (navigation)

### 7.1 Purpose

A filtered operational list of Plans in `review` (and, where useful, recently `rejected` for Leads), for QA Managers and reviewers.

### 7.2 Rules

1. Review queue **SHALL** be a navigation surface, not a separate Domain concept.
2. Data **SHALL** come from list/search APIs with status filters (`status=review`).
3. Selecting a row **SHALL** open the same Inspector as Explorer.
4. Actions **SHALL** be limited to `availableActions` for the selected row.
5. Queue **MAY** be hidden if the user lacks `qep.plan.approve` / `qep.plan.reject` grants.

---

## 8. Search model

### 8.1 Global vs contextual

| Mode | Behaviour |
| ---- | --------- |
| **Global search** | Platform Unified Search (Document 020); Plan documents appear among permitted types |
| **Capability search** | Test Plans Search surface; same index fields; results open Explorer/Inspector |
| **Explorer filter `q`** | Contextual quick filter within Explorer |

### 8.2 Indexed fields (consumed, not owned)

Aligned with ENG-060B Part 4 §3.2 search projection:

Number · Title · Objective/description · Status (facet) · Scope/plan type (facet) · Owner/Lead (facet) · Linked Specification ids/numbers · Tags (facet) · Planned start/end (range) · Version/revision · Updated/created (sort/filter).

### 8.3 Search rules

1. Search **MUST** be permission-filtered at query time.
2. Search index is derived — **MUST NOT** be treated as SoR.
3. Opening a result **SHALL** navigate to the Plan deep link.
4. Search UI **MUST NOT** embed approval or lifecycle business rules.

---

## 9. Cross-capability navigation

### 9.1 Outbound references (from a Plan)

| Reference kind | Navigation target | If unavailable |
| --------------- | ------------------ | --------------- |
| `specification` (Plan Item) | Test Specifications Inspector deep link | Governed unavailable |
| `requirement` | Requirements Workbench artefact | Governed unavailable |
| `trace_link` | Traceability Workbench artefact | Governed unavailable |
| `verification` | Verification Workbench artefact | Governed unavailable |
| `execution` / `run` / `evidence` / `defect` | Future capabilities | Slot only — governed unavailable until those capabilities exist |

### 9.2 Inbound navigation (to a Plan)

Other capabilities **MAY** deep-link to `/plans/{planId}` when they hold a reference. The Test Plans Workbench **SHALL** accept those links under permission checks.

### 9.3 Rules

1. Relationships are **references only** (ARCH-013 §2).
2. The Workbench **MUST NOT** imply ownership of foreign artefacts.
3. Broken or forbidden links **SHALL** fail closed with clear UX — **MUST NOT** fabricate foreign records.

---

## 10. Session restore

1. Explorer filters, sort, and selected `planId` **SHOULD** persist via the platform Workspace Sessions framework (Document 018) and Preference Service (Document 023).
2. Session restore **SHALL** persist **plan ids and UI state only** — never Plan content, statuses, or `availableActions` snapshots.
3. Restored state **MUST** re-validate permissions and re-fetch server state before rendering as actionable.
4. Stale selections (deleted / inaccessible / archived-and-filtered-out) **SHALL** clear with governed messaging.
5. Background jobs, if any exist server-side, **MUST NOT** be invented client-side to simulate restore continuity.

---

## 11. Permission-filtered navigation

1. Sidebar entries, Dashboard widgets, Explorer create affordance, Review queue visibility, and every action control **SHALL** be filtered by the current principal's grants (`qep.plan.*`, ENG-060B Part 4 §4).
2. The Workbench **MUST NOT** render a disabled-but-visible control implying an action exists when the principal holds no grant for it, unless the Design System pattern explicitly calls for a disabled affordance with an explanatory tooltip (a UX choice, not a security control).
3. Hiding UI is **never** a security boundary; the server remains authoritative (Part 5 §3).

---

## 12. Information architecture map (normative summary)

```text
Activity Bar: APZ QEP
  └── Sidebar: Test Plans
        ├── Dashboard
        ├── Explorer ───────────────┐
        ├── Review queue            ├──► Workspace list
        └── Search                  │
                                     └──► Inspector (selected Plan)
                                               ├── Summary
                                               ├── Metadata
                                               ├── Linked Specifications (Items)
                                               ├── Relationships
                                               ├── History
                                               ├── Versions → Compare (unavailable slot, L-01)
                                               ├── Audit
                                               └── Actions ← availableActions
```

---

## 13. Traceability

| This Part | Trace |
| --------- | ----- |
| Shell grammar | Documents 005 / 016 / 017 |
| Sessions / preferences | Documents 018 / 023 |
| Capability boundaries | ARCH-013 |
| REST consumption | ENG-060B Part 4 `/api/v1/qep/plans` |
| Domain statuses / actions | ENG-060A |
| Search fields | ENG-060B Part 4 §3 |
| Frozen upstream | Requirements / Traceability / Verification / Test Specifications 1.0.0 |
| Workbench grammar precedent | APZQEP-OES-ARCH-012 |

---

## 14. Explicit non-goals (Part 2)

This Part does NOT define:

- Inspector panel field layout (Part 3).
- Action dialogs, empty/error states, persona journeys (Part 4).
- Performance budgets, a11y matrices, security, AI/MCP boundaries (Part 5).
- React/Next.js implementation.

---

## 15. STOP (Part 2)

Presentation architecture only. No React, routes, or permission catalogues implemented.
