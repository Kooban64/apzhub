# APZQEP-OES-ARCH-013  
# PART 3 — Permissions, Search, Dashboard, Explorer, Inspector & Navigation

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ARCH-013 |
| Part | **3 of 5** |
| Programme | APZQEP-ARCH-013 |

---

## 1. Permissions (architectural roles)

Architecture defines **roles** and intended capabilities. Implementation, catalogues, and enforcement **SHALL** occur in future Infrastructure / Platform Authz programmes.

| Role | Intended capabilities |
| ---- | --------------------- |
| **Viewer** | Read plans, items, history, versions; no mutations |
| **Tester** | View; update assignment notes on assigned items (Domain may narrow); no approve |
| **Lead** | Create/edit Draft; submit for review; manage items; mark Ready (if permitted); coordinate scheduling |
| **QA Manager** | Approve / reject; supersede; archive; governance overrides within policy |
| **Administrator** | Platform administration of plan config catalogues; not a silent superuser bypass of audit |

### 1.1 Permission principles

1. Server-authoritative checks only.  
2. Workbench **SHALL** render `availableActions` — never invent grants.  
3. Superadmin (platform) remains an explicit audited tier (Document 000 / IAM) — not a Plan role shortcut.  
4. Role names above are **architectural**; future ENG **MAY** map to `qep.plan.*` permission ids without exposing backend engine roles.

---

## 2. Search (architecture only)

### 2.1 Searchable attributes

| Attribute | Notes |
| --------- | ----- |
| Plan number | Exact / prefix |
| Title | Full-text |
| Description / objective | Full-text |
| Status | Facet |
| Scope class | Facet |
| Owner | Facet / identity |
| Assigned lead | Facet / identity |
| Linked Specification ids / numbers | Reference search |
| Tags / labels (if catalogue exists) | Facet |
| Planned start / end | Range |
| Version | Exact |
| Updated at | Range |

### 2.2 Search rules

1. Platform Search Service is the future indexing authority (Document 020 pattern).  
2. Index is derived — not SoR.  
3. Permission filtering at query time is mandatory in future ENG.  
4. No standalone Plan search engine in the module.

---

## 3. Dashboard (architecture only)

### 3.1 Widgets

| Widget | Purpose |
| ------ | ------- |
| Plans by status | Counts: Draft, Review, Approved, Ready, In Execution, Completed, Archived |
| Ready for execution | Plans in Ready state |
| In execution | Active plans |
| My owned plans | Owner = current user |
| My assigned plans | Lead/assignee = current user |
| Upcoming schedule | Plans with planned start in window |
| Recently updated | Bounded list |
| Blocked / rejected | Rejected or readiness-failed (future Domain signals) |

### 3.2 Dashboard rules

1. Bounded queries only — no analytics engine inside Plans.  
2. Widgets are presentation of Plan SoR + references.  
3. No Coverage/Impact engines embedded.

---

## 4. Explorer (architecture only)

### 4.1 Hierarchy

```text
Test Plans (capability root)
  ├── By Status
  ├── By Scope Class
  ├── By Owner
  ├── By Schedule Window
  └── Flat / Search Results
```

### 4.2 Grouping

Users **MAY** group by: Status, Scope class, Owner, Assigned lead, Planned month.

### 4.3 Filtering

Filters **SHALL** include: status, scope, owner, lead, date ranges, text query, presence of Specification X, readiness flag (future).

### 4.4 Sorting

Default: updated descending. Alternatives: number, title, planned start, status.

### 4.5 Performance posture

Pagination mandatory. Page size bounded (architectural target: ≤ 50). Virtualisation **SHOULD** be used for large lists in future Workbench Architecture.

---

## 5. Inspector (architecture only)

The Inspector is the primary detail surface for a single Plan.

| Panel / section | Content |
| --------------- | ------- |
| **Summary** | Title, number, status, scope, objective, readiness |
| **Metadata** | Owner, lead, assignees, schedule, tags |
| **Linked Specifications** | Plan Items table (order, pin, item status) |
| **Coverage** | *Derived view* from Traceability / Requirements references — not Plan SoR analytics |
| **Relationships** | Cross-capability references (Requirements, Verification, future Execution/Defects) |
| **History** | Append-only timeline |
| **Versions** | Lineage, compare entry point |
| **Audit** | Governance-significant actions (approve, start, complete, archive) |

### 5.1 Inspector rules

1. No embedded Specification editor — deep link to Test Specifications Workbench.  
2. No embedded Execution console — deep link / unavailable slot until Execution exists.  
3. Coverage panel is read-only projection.

---

## 6. Workbench navigation (architecture only)

### 6.1 Capability placement

| Level | Placement |
| ----- | --------- |
| Activity Bar | Quality Engineering / APZ QEP group (per ARCH-006) |
| Sidebar | **Test Plans** module entry |
| Routes (architectural) | `/workspace/qep/test-plans` and children |

### 6.2 Primary routes (architectural names)

| Route key | Path pattern | Surface |
| --------- | ------------ | ------- |
| dashboard | `/workspace/qep/test-plans` | Dashboard |
| explorer | `.../explorer` | Explorer |
| review | `.../review` | Review queue |
| search | `.../search` | Search |
| plan | `.../plans/:planId` | Inspector shell |
| history | `.../plans/:planId/history` | History |
| versions | `.../plans/:planId/versions` | Versions |
| compare | `.../plans/:planId/compare` | Compare |
| create | `.../new` | Create Draft |
| edit | `.../plans/:planId/edit` | Edit Draft |

Exact file layout is Workbench Engineering — not this programme.

### 6.3 Navigation principles

1. Permission-driven visibility.  
2. Deep-linkable Inspector.  
3. No parallel shell.  
4. Session restore uses platform session framework (ARCH-018 pattern) — plan ids + UI state only.

See [APPENDIX-D.md](./APPENDIX-D.md).

---

## 7. STOP (Part 3)

Presentation architecture only. No React, routes, or permission catalogues implemented.
