# APZQEP-OES-ARCH-014

# PART 1 — Executive Summary, Objectives, Principles, Constraints & Non-Goals

| Item                  | Value                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Document              | **APZQEP-OES-ARCH-014**                                                                                       |
| Title                 | Test Plans Workbench Architecture                                                                             |
| Programme             | **APZQEP-ARCH-014**                                                                                           |
| Capability            | Test Plans                                                                                                    |
| Layer                 | Workbench Architecture                                                                                        |
| Status                | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE**                                                                   |
| Version               | **1.0.0-oes**                                                                                                 |
| Part                  | **1 of 5**                                                                                                    |
| Governing methodology | [OES-000](../../../../engineering/oes/OES-000-Owner-Engineering-Specification-Standard.md) **FROZEN 1.0.0**   |
| Writing standard      | [OES-001](../../../../engineering/oes/OES-001-Engineering-Writing-Standard.md) **FROZEN 1.0.0**               |
| Review standard       | [OES-002](../../../../engineering/oes/OES-002-Engineering-Review-and-Acceptance-Standard.md) **FROZEN 1.1.0** |
| Constitution          | Document 000 v1.0.0                                                                                           |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional (RFC 2119 as applied by OES-001).

---

## 1. Executive summary

This document defines the authoritative **Workbench Architecture** for the **Test Plans** capability within APZ QEP.

Its purpose is to remove implementation ambiguity before any Test Plans presentation engineering begins. It defines how engineers will present, navigate, inspect, edit, review, and govern Test Plans inside the APZHUB Desktop Workbench, consuming the certified Domain and the certified Infrastructure Component exactly as delivered.

This programme **SHALL** produce architecture only. It **SHALL NOT** create React components, Next.js pages, hooks, stores, REST clients, DTOs, database artefacts, or any other production code. It **SHALL NOT** perform Domain or Infrastructure engineering, and it **SHALL NOT** authorise Workbench Engineering.

Upon Owner Acceptance, this architecture becomes the baseline from which the future **APZQEP-OES-ENG-060C** (Test Plans Workbench Engineering) — or equivalently numbered programme — **SHALL** proceed without architectural invention.

---

## 2. Programme objective

Design the complete Workbench Architecture for Test Plans such that a Workbench Engineering programme can implement:

1. Shell placement, navigation, deep links, and session restore.
2. Dashboard, Explorer, Review queue, and Search surfaces.
3. Plan Inspector panel structure bound to the certified Infrastructure DTO.
4. Edit Draft form and action surface driven exclusively by server `availableActions`.
5. Persona-mapped lifecycle journeys aligned to the certified discrete lifecycle action endpoints.
6. Performance, accessibility, security, and observability postures.
7. AI and MCP consumption boundaries without implementation.

— all without inventing business rules, persistence, or REST contracts that the certified Domain and Infrastructure have not already defined.

---

## 3. Baselines consumed (immutable inputs)

| Baseline                                       | Status                                                                                                                                            | Role                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **APZQEP-ARCH-013**                            | **ACCEPTED / ARCHITECTURE BASELINED / CLOSED**                                                                                                    | Test Plans Capability Architecture — domain boundaries, lifecycle, relationships |
| **APZQEP-OES-ENG-060A / ENG-060A / CERT-060A** | Domain `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** — **DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS**                                                | Certified lifecycle, statuses, invariants, readiness rules                       |
| **APZQEP-OES-ENG-060B / ENG-060B / CERT-060B** | Infrastructure `@apzhub/qep-test-plans` **0.2.0** — **INFRASTRUCTURE COMPONENT CERTIFIED** / **INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS** | Certified REST surface, permissions, `availableActions`, search projection       |
| Document 000                                   | Constitution                                                                                                                                      | Supreme authority on conflict                                                    |
| OES-000 / OES-001 / OES-002                    | FROZEN                                                                                                                                            | Methodology, writing, review standards                                           |
| Document 005 / 016 / 017                       | Desktop shell / navigation frameworks                                                                                                             | Shell grammar this Workbench **SHALL** reuse                                     |

This architecture **SHALL** treat all rows above as **immutable dependencies**. It **SHALL NOT** redefine Domain lifecycle, Infrastructure REST shape, or permission names. It **SHALL** reference them by contract.

Any conflict between this document and a baseline above **SHALL** be resolved in favour of the baseline unless an Owner-approved ADR records an intentional change.

---

## 4. Business context — what the Workbench presents

A **Test Plan** is a governed, executable collection of Test Specifications organised to validate a release, product, feature, milestone, sprint, regression cycle, or certification activity (ARCH-013 §4).

The Test Plans Workbench is the **presentation surface** through which Viewers, Testers, Leads, and QA Managers create, review, approve, schedule, and track Test Plans. It presents:

- Plan identity, scope, status, ownership, assignment, and schedule.
- Plan Items (references to Test Specifications, with version pins).
- Lifecycle history, version lineage, and audit trail.
- Server-computed `availableActions` as the sole authority for what a user may do next.

The Workbench **does not** decide any of the above. It renders what the certified Infrastructure returns.

---

## 5. Architectural principles

| #   | Principle                     | Meaning                                                                                                                                                                                                                          |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W1  | Presentation only             | The Workbench owns navigation, layout, panels, dialogs, and rendering — nothing else                                                                                                                                             |
| W2  | Server authority              | Lifecycle legality is expressed exclusively via server `availableActions`; the Workbench never invents a transition                                                                                                              |
| W3  | No persistence                | The Workbench never writes to a database, cache, or search index directly                                                                                                                                                        |
| W4  | REST-only consumption         | The Workbench consumes `/api/v1/qep/plans/*` (ENG-060B) via the platform gateway; it never bypasses it                                                                                                                           |
| W5  | Reference, do not absorb      | Requirements, Traceability, Verification, and Test Specifications remain foreign SoRs; the Workbench links to them, never embeds their editors                                                                                   |
| W6  | Optimistic, not authoritative | The Workbench may show pending UI state after a command but **SHALL** re-fetch and reconcile with the server response                                                                                                            |
| W7  | Deep-linkable                 | Every Plan, and every primary Inspector panel, **SHALL** have a permanent URL                                                                                                                                                    |
| W8  | Accessible by default         | Every interaction **SHALL** be keyboard operable and meet WCAG AA                                                                                                                                                                |
| W9  | Permission-filtered           | Navigation, actions, and search results **SHALL** be filtered by Permission Platform grants; the server remains authoritative                                                                                                    |
| W10 | Shell reuse                   | The Workbench **SHALL** reuse the APZHUB Desktop shell grammar (Activity Bar → Sidebar → Workspace → Context/Inspector) and the Workbench pattern already accepted for Test Specifications (ARCH-012)                            |
| W11 | Honest about gaps             | Where certified Infrastructure has a recorded limitation (e.g. deferred Compare), the Workbench architecture **SHALL** describe a governed unavailable state or a future contract — it **SHALL NOT** fabricate a working feature |

---

## 6. Capability boundaries

### 6.1 The Workbench SHALL own

- Presentation, navigation, and layout for the Test Plans capability surface.
- Dashboard, Explorer, Review queue, and Search UI.
- Plan Inspector, Edit Draft form, Relationships/Linked Specifications view, History, Versions.
- Dialogs and confirmation flows for every action exposed via `availableActions`.
- Empty, loading, error, forbidden, and not-found states.
- Client-side UX-only session/preference restoration (ids + filters + UI state — never business data).

### 6.2 The Workbench SHALL NOT own

- Business rules, lifecycle legality, or readiness computation (Domain).
- Persistence, repositories, migrations, or database schema (Infrastructure).
- REST handlers, permission enforcement, audit writing, or search indexing (Infrastructure / Platform Services).
- AI or MCP decision authority.
- Test Execution, Evidence, Defects, or Coverage domain models.
- Any change to the certified Domain or Infrastructure contracts.

---

## 7. Constraints

1. Architecture only — no production code in this programme.
2. Frozen/certified baselines (§3) are immutable dependencies; no redefinition.
3. Layered architecture (Document 000 / 003) **SHALL** be preserved: Presentation → Application → Domain → Services → Adapters → Backend Engines. The Workbench occupies the Presentation layer exclusively.
4. The Workbench **SHALL** reuse the Design System (Document 006 / 028) — tokens only, no one-off styling.
5. The Workbench **SHALL** reuse the shell, navigation, session, and notification frameworks (Documents 005 / 016 / 017 / 018 / 021) rather than invent parallel mechanisms.
6. Certification independence practice **SHALL** apply to any future Workbench certification programme ([OES-CERTIFICATION-INDEPENDENCE](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md)).
7. Where certified `availableActions` do not yet expose a Domain-legal transition, the Workbench **SHALL** wait for the server — it **SHALL NOT** invent a client-side transition (mirrors ARCH-012 §3.3 practice).

---

## 8. Non-goals (this programme)

This programme **SHALL NOT**:

- Implement React components, Next.js routes, hooks, stores, REST clients, or DTOs.
- Implement Domain, Infrastructure, database, search, or permissions changes.
- Implement AI or MCP.
- Authorise Workbench Engineering (a separate Owner Instruction is required after Acceptance).
- Redesign Requirements, Traceability, Verification, or Test Specifications Workbenches.
- Close the Infrastructure limitation **L-01** (deferred version compare) — this architecture **MAY** specify the presentation contract for when Infrastructure delivers it, but **SHALL NOT** require or perform the Infrastructure change.

---

## 9. Fidelity to certified Domain and Infrastructure

| Concern            | Fidelity requirement                                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lifecycle statuses | `draft` · `review` · `approved` · `ready` · `in_execution` · `completed` · `archived` · `rejected` · `cancelled` · `superseded` (ENG-060A) — Workbench display labels only; no new statuses invented                                                                                                               |
| Lifecycle actions  | `submit-for-review` · `approve` · `reject` · `return-to-draft` · `mark-ready` · `start-execution` · `complete` · `archive` · `cancel` · `supersede` · `clone` · `transfer-ownership` · `assign` · `schedule` plus item commands (ENG-060B Part 3/4) — Workbench renders only actions present in `availableActions` |
| REST base          | `/api/v1/qep/plans` and children (ENG-060B Part 4)                                                                                                                                                                                                                                                                 |
| Permissions        | `qep.plan.*` catalogue (ENG-060B Part 4 §4.1) — Workbench never invents a grant                                                                                                                                                                                                                                    |
| Known limitations  | **L-01** version compare deferred; **L-02** no dedicated `GET .../items` (items ship on the Plan DTO); both **SHALL** be presented honestly (Part 4 §6, Appendix B)                                                                                                                                                |
| Pagination         | Max `pageSize` = 50 (ARCH-013 / ENG-060B)                                                                                                                                                                                                                                                                          |

---

## 10. Authorised next gates (after Owner Acceptance only)

```text
APZQEP-ARCH-014 Owner Acceptance
  → APZQEP-OES-ENG-060C (or equivalently numbered) Test Plans Workbench Engineering Specification — separate Owner Instruction
  → Workbench Engineering (React / Next.js implementation)
  → Workbench ECR → Owner Acceptance → Workbench Certification
  → Capability Certification → Capability Freeze
```

---

## 11. Explicit exclusions (restated)

Do **NOT** implement under APZQEP-ARCH-014: React components · Next.js pages/routes · hooks/stores/state managers · REST clients/DTOs · Domain changes · Infrastructure changes · database/migrations · search engine implementation · permissions enforcement code · AI · MCP · Workbench Engineering authorisation.

---

## 12. STOP (Part 1)

```text
APZQEP-ARCH-014
ARCHITECTURE ONLY
NO WORKBENCH ENGINEERING
NO REACT / NEXT.JS
NO PRODUCTION CODE
```
