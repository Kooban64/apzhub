# APZQEP-OES-ARCH-012  
# PART 2 — Information Architecture & Navigation

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ARCH-012 |
| Title | Test Specifications Workbench Architecture |
| Part | **2 of 5** — Information Architecture & Navigation |
| Status | **FILED** |
| Governing methodology | [OES-000](../../OES-000-Owner-Engineering-Specification-Standard.md) (**FROZEN**) |
| Writing standard | [OES-001](../../OES-001-Engineering-Writing-Standard.md) (**FROZEN**) |
| Review standard | [OES-002](../../OES-002-Engineering-Review-and-Acceptance-Standard.md) |
| Baselines | ARCH-006 · ARCH-011 · ENG-050A · ENG-050B · Requirements / Traceability / Verification **1.0.0 FROZEN** |

---

## 1 Purpose

This Part defines the **information architecture**, **navigation hierarchy**, **Explorer model**, and **search UX contracts** for the Test Specifications Workbench.

It SHALL enable an engineer to implement navigation and discovery without inventing information architecture.

This Part SHALL NOT specify React components, Next.js routes implementation details beyond permanent URL patterns, or persistence.

---

## 2 Information architecture principles

1. The Workbench SHALL reuse the APZHUB Desktop shell grammar ([ARCH-006](../../../../products/apzqep/architecture/requirements-workbench/README.md) lineage) — Activity Bar → Sidebar → Workspace → Context / Inspector.  
2. Test Specifications SHALL appear as a first-class QEP capability surface, not a nested page of another capability.  
3. List / Explorer SHALL be the default entry; Inspector SHALL open for a selected Specification.  
4. Navigation SHALL be hierarchical; Search SHALL be global; Filtering SHALL be contextual (Part 1 Principle 7).  
5. Every Specification SHALL have a permanent, deep-linkable URL (Part 1 Principle 8).  
6. The Workbench SHALL render server `availableActions` and MUST NOT invent client-side lifecycle legality.  
7. Cross-capability links SHALL be references only; destination surfaces MAY be unavailable and MUST use governed empty/unavailable states — **no placeholder fake screens**.

---

## 3 Capability placement in the shell

### 3.1 Activity Bar

| Element | Requirement |
| ------- | ----------- |
| QEP / Quality Engineering entry | SHALL remain the product Activity Bar affordance that hosts QEP capabilities |
| Test Specifications | SHALL be reachable as a registered capability under QEP without hardcoding competing products |

### 3.2 Sidebar (Test Specifications module)

The Sidebar SHALL expose, at minimum:

| Nav item | Purpose | Default route concept |
| -------- | ------- | --------------------- |
| **Dashboard** | Attention / counts / queues (detail in Part 4) | `/…/test-specifications` or `/…/test-specifications/dashboard` |
| **Explorer** | Primary inventory | `/…/test-specifications/explorer` |
| **Review** | Under-review work for reviewers/approvers | `/…/test-specifications/review` |
| **Search** | Capability-scoped search entry (also global) | `/…/test-specifications/search` |

Additional Sidebar items MAY be added only if later Parts define them. They MUST NOT appear in implementation before definition.

### 3.3 Workspace regions

| Region | Content |
| ------ | ------- |
| Primary workspace | Explorer table / Review queue / Dashboard / Search results |
| Inspector (context panel or split) | Selected Specification detail (Part 3) |
| Overlays | Dialogs for approve/reject/supersede/etc. driven by `availableActions` |

---

## 4 Permanent URL model (deep links)

### 4.1 Normative route patterns

Routes below are **architectural URL contracts**. Concrete Next.js file layout is deferred to Workbench Engineering, but paths SHALL remain stable.

| Pattern | Meaning |
| ------- | ------- |
| `/workspace/qep/test-specifications` | Capability root → Dashboard |
| `/workspace/qep/test-specifications/explorer` | Explorer |
| `/workspace/qep/test-specifications/review` | Review queue |
| `/workspace/qep/test-specifications/search` | Capability search |
| `/workspace/qep/test-specifications/specifications/{id}` | Specification deep link (Inspector primary) |
| `/workspace/qep/test-specifications/specifications/{id}/history` | History view |
| `/workspace/qep/test-specifications/specifications/{id}/versions` | Version lineage view |
| `/workspace/qep/test-specifications/specifications/{id}/relationships` | Relationships view |
| `/workspace/qep/test-specifications/specifications/{id}/compare?with={otherId}` | Version comparison (Part 3) |

### 4.2 Deep-link rules

1. Opening `/specifications/{id}` SHALL select that Specification and open Inspector.  
2. If `{id}` is not found or not permitted, the Workbench SHALL show a governed not-found / forbidden state — MUST NOT invent data.  
3. Query parameters MAY encode Explorer filters (`status`, `owner`, `q`, `classification`) and MUST be round-trippable with the Explorer.  
4. URLs SHALL NOT embed backend engine identifiers or secret tokens.

---

## 5 Persona → entry surfaces

| Persona | Primary entry | Secondary |
| ------- | ------------- | --------- |
| Author / engineer | Explorer (Draft filter) | Specification deep link |
| Reviewer | Review queue | Explorer `under_review` |
| Approver | Review queue | Specification deep link |
| Auditor | Explorer + History | Search |
| Quality manager | Dashboard | Review + Explorer |
| Product owner | Dashboard + Explorer | Search by classification/tag |

Permission Platform SHALL gate visibility of Sidebar items and actions. The Workbench MUST NOT show actions absent from `availableActions` / grants.

---

## 6 Explorer model

### 6.1 Purpose

The **Specification Explorer** is the list-first inventory of Test Specifications for a tenant.

### 6.2 Browseable columns (minimum)

| Column | Source | Notes |
| ------ | ------ | ----- |
| Number | Domain | e.g. `TS-001` |
| Title | Domain | Primary label |
| Status | Domain lifecycle | Badge; Draft…Retired |
| Version | `major.minor` | Label |
| Type | Catalogue type | Functional, API, … |
| Priority | Domain | |
| Classification | Domain | |
| Owner | Domain | |
| Author | Domain | |
| Authoritative | Boolean | Only Approved authoritative |
| Updated | Timestamp | Sort default: updated desc |
| Tags | Domain | Compact chip/list |

Optional columns MAY include reviewer, predecessor/successor indicators.

### 6.3 Explorer capabilities

The Explorer SHALL support:

| Capability | Rule |
| ---------- | ---- |
| Filtering | Contextual filters: status, type, priority, classification, owner, authoritative, tags, text query |
| Sorting | At least: updated, title, number, priority, status |
| Saved views | Named filter+column presets per user (Preference Service) — presentation only |
| Selection | Single select opens Inspector; multi-select MAY enable bulk UI only for actions server allows |
| Pagination | Server-driven via list/search APIs |
| Empty / loading / error | Design-system governed states |

### 6.4 Explorer non-goals

The Explorer MUST NOT:

- Invent hierarchy trees of Test Cases or Executions as owned children  
- Display execution results as Specification status  
- Perform client-side lifecycle transitions without API calls  
- Store business data as system of record  

---

## 7 Review queue model (navigation)

### 7.1 Purpose

A filtered operational list of Specifications in `under_review` (and optionally recently rejected for authors), for reviewers and approvers.

### 7.2 Rules

1. Review queue SHALL be a navigation surface, not a separate Domain concept.  
2. Data SHALL come from list/search APIs with status filters.  
3. Selecting a row SHALL open the same Inspector as Explorer.  
4. Actions SHALL be limited to `availableActions` for the selected row.

Detail of review UX (comments, approve/reject dialogs) is Part 4.

---

## 8 Search model

### 8.1 Global vs contextual

| Mode | Behaviour |
| ---- | --------- |
| **Global search** | Platform Unified Search (020); Specification documents appear among permitted types |
| **Capability search** | Test Specifications Search surface; same index fields; results open Explorer/Inspector |
| **Explorer filter `q`** | Contextual quick filter within Explorer |

### 8.2 Indexed fields (consumed, not owned)

Aligned with ENG-050B search projection:

Identifier · Title · Owner · Status · Classification · Priority · Tags · Dates  
Requirement / Verification references MAY appear as facets when projection provides them.

### 8.3 Search rules

1. Search MUST be permission-filtered at query time.  
2. Search index is derived — MUST NOT be treated as SoR.  
3. Opening a result SHALL navigate to the Specification deep link.  
4. Search UI MUST NOT embed business rules for approval.

---

## 9 Cross-capability navigation

### 9.1 Outbound references (from a Specification)

| Reference kind | Navigation target | If unavailable |
| -------------- | ----------------- | -------------- |
| `requirement` | Requirements Workbench artefact | Governed unavailable |
| `trace_link` | Traceability Workbench artefact | Governed unavailable |
| `verification` | Verification Workbench artefact | Governed unavailable |
| `test_case` / `test_suite` / `execution` / `evidence` | Future capabilities | Slot only — governed unavailable until those capabilities exist |

### 9.2 Inbound navigation (to a Specification)

Other capabilities MAY deep-link to `/specifications/{id}` when they hold a reference. The Test Specifications Workbench SHALL accept those links under permission checks.

### 9.3 Rules

1. Relationships are **references only** (Part 1 / ARCH-011).  
2. The Workbench MUST NOT imply ownership of foreign artefacts.  
3. Broken or forbidden links SHALL fail closed with clear UX — MUST NOT fabricate foreign records.

---

## 10 Navigation state persistence

1. Explorer filters, sort, and selected id SHOULD persist in workspace/session preferences (platform Preference Service).  
2. Restored state MUST re-validate permissions and re-fetch server state.  
3. Stale selections (deleted / inaccessible) SHALL clear with governed messaging.

---

## 11 Information architecture map (normative summary)

```text
Activity Bar: QEP
  └── Sidebar: Test Specifications
        ├── Dashboard
        ├── Explorer ───────────────┐
        ├── Review queue            ├──► Workspace list
        └── Search                  │
                                    └──► Inspector (selected Specification)
                                              ├── Summary
                                              ├── Content sections (Part 3)
                                              ├── Relationships
                                              ├── Versions / Compare
                                              ├── History
                                              └── Actions ← availableActions
```

---

## 12 Traceability

| This Part | Trace |
| --------- | ----- |
| Shell grammar | ARCH-006 |
| Capability boundaries | ARCH-011 · OES-ARCH-012 Part 1 |
| REST consumption | ENG-050B `/api/v1/qep/specifications` |
| Domain statuses / types | ENG-050A |
| Search fields | ENG-050B search projection |
| Frozen upstream | Requirements / Traceability / Verification 1.0.0 |

---

## 13 Explicit non-goals (Part 2)

This Part does NOT define:

- Inspector field layout (Part 3)  
- Approval dialog copy / dashboard widgets (Part 4)  
- Performance budgets / a11y test matrices (Part 5)  
- React/Next implementation  

---

## 14 Success criteria (Part 2)

Part 2 is successful when an engineer can implement:

1. Sidebar IA and deep-link routes  
2. Explorer columns, filters, and selection → Inspector  
3. Review queue as filtered navigation  
4. Global + capability search entry behaviour  
5. Cross-capability reference navigation rules  

without inventing information architecture.

---

## END OF PART 2

**Next:** Part 3 — Workbench Components (Explorer detail binding, Inspector, Relationships, Version Comparison).
