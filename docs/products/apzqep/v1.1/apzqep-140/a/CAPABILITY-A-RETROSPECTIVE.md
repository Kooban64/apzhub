# Capability A Retrospective — Enterprise Test Suite Management

| Field     | Value                                                  |
| --------- | ------------------------------------------------------ |
| Programme | APZQEP-140-A                                           |
| Purpose   | Reference implementation patterns for Capabilities B–F |
| Status    | **COMPLETE** (documentation only)                      |
| Timestamp | 20260802T170000Z                                       |

> Product Phase observation: Cap A proved that APZQEP-120 platform capabilities can be consumed without redesign. Treat this package as the **reference implementation**.

---

## 1. Patterns that worked well

| Pattern                                                      | Why it worked                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Product-first workspace + domain together                    | Suite Workspace became the UX reference; avoided backend-only delivery   |
| Thin package compose (`createEnterpriseTestSuiteManagement`) | Clear SoR boundary; easy process-local runtime for LIMITED_AVAILABILITY  |
| Application service owns events                              | Repositories stay dumb; processors remain generic                        |
| Platform integration helpers in one file                     | QKI / notify / command registration co-located without platform redesign |
| Lifecycle matrix + `assertTransition`                        | No arbitrary status patching; audit-friendly                             |
| Stakeholder naming in docs/UI                                | “Enterprise Test Suite Management” over slice IDs                        |

---

## 2. Reusable domain conventions

- Aggregate = root node + history entries
- Controlled lifecycle enums + transition matrix
- Explicit permissions (`qep.{capability}.{verb}` + admin)
- Tenant on every node; project optional but filterable
- Logical delete (terminal), restore where justified
- `revision` for optimistic concurrency readiness
- `customMetadata` as validated extension map — not an uncontrolled bag of core fields
- Kind / priority / tags as controlled enums or bounded strings

**Carry forward:** Same aggregate + history + lifecycle style for Execution Plans.

---

## 3. Reusable application-service conventions

- Actor `{ userId, tenantId, permissions }`
- `requirePermission` before mutations
- `load` hides not-found / deleted
- `emit` builds versioned domain events; optional publisher + `drainEvents()` for tests
- List filters: tenant-scoped, query/status/owner/sort
- Clone = create-with-source-copy, not deep engine duplication
- Thin HTTP handlers map errors → platform envelopes

---

## 4. Event integration

- Past-tense, dotted names: `qep.suite.{action}`
- Payload includes identity + display-safe fields for projections
- Lifecycle emits specific events when meaningful (`published`, `archived`) else `lifecycle_changed`
- Processors registered onto existing `ProcessorRegistry` — no business logic in processing engine

---

## 5. QKI patterns

- Projection definition + builder + engine branch by `entityKind`
- Seed definition in `createQualityKnowledgeIndex`
- Search consumes projections only
- Delete → remove projection; other events upsert

**Carry forward:** Add Execution Plan projection the same way; do not query plan services for search.

---

## 6. Notification patterns

- Templates registered on Notification Platform
- Processors call `engine.processFact` as **subscribers**
- Internal channel only
- No module-owned delivery subsystems

---

## 7. Command registration

- Definitions + handlers in platform-integration
- Navigation / create / entity-open triad
- Entity discovery via QKI (`entityKind`)
- UI-independent handlers returning targets

---

## 8. API conventions

- `/api/v1/qep/{resource}` under platform auth wrapper
- Zod schemas for body/query/params
- Collection + data envelopes with tracing
- Lifecycle via dedicated command routes — not free PATCH of status
- In-memory runtime singleton for LA (`*-runtime.ts`)

---

## 9. Workspace / UX components (reusable)

From Cap A + shared `qep-ui`:

| Building block                        | Reuse                              |
| ------------------------------------- | ---------------------------------- |
| `QepPageShell`                        | Titles, breadcrumbs, actions       |
| `QepFilterBar`                        | Search / status / sort / view mode |
| `QepTable` / cards / tree             | List paradigms                     |
| `QepPanel`                            | Detail sections                    |
| `QepStatusBadge`                      | Lifecycle display                  |
| `QepLoadingState` / `Empty` / `Error` | Async states                       |
| List ↔ Detail ↔ New route triad       | Module router pattern              |
| Activity timeline from history        | Governance surface                 |

**Reference UX rule:** Match interaction patterns, not pixel clones.

---

## 10. Accessibility & responsive lessons

- Prefer semantic headings and labelled filters
- Table captions (`sr-only`)
- Keyboard-focusable links; avoid `Button asChild` (not in `@apzhub/ui`)
- Responsive grids (`sm:` / `lg:`) for detail + metadata columns
- Confirm destructive lifecycle actions

---

## 11. Testing & certification lessons

- Package vitest covers domain + platform fan-out (QKI / notify / commands)
- Type narrowings on lifecycle event ids need explicit `QepSuiteEventId`
- ES-002 cert as LIMITED_AVAILABILITY when SoR is in-memory — disclose persistence accurately
- Do not claim durable production SoR without Postgres adapter + soak

---

## 12. Do not copy (Suite-specific)

- Suite kinds (`shared` / `template` / `reference`)
- Favourite / pin user id sets
- Parent–child suite hierarchy / folder tree as primary navigation
- Suite-only event names and permissions
- Suite Workspace tree as mandatory Cap B view (plans need list / board / readiness instead)

---

## 13. Improvements for Capability B

1. Introduce a **Suite reference port** — validate suite + version without duplicating Suite logic
2. First-class **readiness service** (deterministic findings) — Suites had implicit readiness only via lifecycle
3. Explicit **handoff contract** for Cap C (idempotent, stable reference)
4. Richer assignment model (roles: owner / lead / testers / reviewers / approvers)
5. Board/grouped status view in addition to list
6. Keep **in-memory SoR** consistent with Cap A unless Owner authorises Postgres strategy change
7. Document product rule: Suites = WHAT · Plans = WHEN/WHERE/HOW/BY WHOM · Execution = work · Results = outcome

---

## 14. Inventory note for Cap B (pre-implementation)

| Area                                      | Classification                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| Cap B Execution Plan domain               | **MISSING**                                                             |
| Frozen `@apzhub/qep-test-plans` (ENG-070) | **NOT APPLICABLE** as Cap B SoR (different product; frozen)             |
| Cap A Suites                              | **COMPLETE** — consume                                                  |
| Cap C Test Execution                      | **DEFERRED** — do not absorb                                            |
| Persistence strategy                      | **PARTIAL** — Cap A in-memory LA; Cap B must match unless Owner decides |

**Decision for Cap B:** New package `@apzhub/qep-execution-plans` mirroring Cap A; do not reopen frozen Test Plans.
