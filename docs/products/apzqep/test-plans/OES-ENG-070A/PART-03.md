# APZQEP-OES-ENG-070A
# PART 3 — Technical Approach

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ENG-070A |
| Part | **3 of 5** |
| Programme | APZQEP-OES-ENG-070A |
| Status | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. Stack (mandatory — Document 000 / 004)

| Concern | Choice |
| ------- | ------ |
| App | Next.js **App Router** in `apps/web` |
| UI | React + TypeScript **strict** + Tailwind + shadcn/ui (`/packages/ui`) |
| Icons | Lucide only |
| Data fetching | TanStack Query (or the platform-equivalent pattern already used by sibling QEP Workbenches) |
| Forms | React Hook Form (RHF) + Zod (shape validation only — server remains authority) |
| Tables | TanStack Table for Explorer / Review queue grids |
| Auth session | Platform shell / Better Auth — no separate login screen |
| API | `/api/v1/qep/plans/*` via platform client patterns (Document 010) |

Technology substitution requires Owner approval (Document 004).

---

## 2. Repository placement (proposed — not created under this OES)

| Artefact | Location |
| -------- | -------- |
| Routes / pages | `apps/web` under the QEP Test Plans route tree (Appendix C) — mirrors `/workspace/qep/test-plans/...` |
| Shared UI extensions | `/packages/ui` only when reusable across Workbenches; otherwise local Test Plans Workbench modules |
| Feature modules | `modules/qep-test-plans/` presentation slice — **match sibling Workbenches** (Requirements / Traceability / Verification / Test Specifications) rather than inventing a parallel structure |
| Product docs (future delivery evidence) | `docs/products/apzqep/test-plans/workbench/` (WP-18) |
| This OES | `docs/products/apzqep/test-plans/OES-ENG-070A/` (canonical) · `docs/engineering/oes/APZQEP/OES-ENG-070A-Test-Plans-Workbench-Engineering/` (pointer) |

Engineers implementing under a future `APZQEP-ENG-070A` **SHALL** inspect the Test Specifications, Requirements, Traceability, and Verification Workbench layouts and **reuse the same patterns** rather than inventing a parallel structure. No file is created by this OES.

---

## 3. API consumption rules

1. All reads/writes go through APZHUB Route Handlers / Platform Services already exposed by ENG-060B — never a direct Domain or database call.
2. The client **MUST** send a correlation id per Document 010.
3. The client **MUST** handle the standard response envelope and typed errors — no raw backend/engine strings surfaced to users.
4. After every mutation the client **MUST**: invalidate/refetch the Plan DTO and re-bind `availableActions` from the fresh response.
5. Optimistic UI **MAY** be used for perceived responsiveness; it **MUST** roll back to the last known-good server state on failure and surface the typed error.
6. The client **MUST NOT** import Domain packages (`@apzhub/qep-test-plans` Domain exports) into presentation components for business rules — only DTO shapes/types as published for the Infrastructure surface.
7. Pagination **MUST** respect `pageSize` ≤ 50 (ARCH-013 / ENG-060B).
8. Item data (`items[]`) **SHALL** be read from the Plan DTO returned by `GET /api/v1/qep/plans/{id}` per **L-02** — the client **MUST NOT** call a non-existent dedicated `GET .../items` endpoint.
9. Compare **MUST NOT** be implemented as two separate DTO fetches merged client-side into a fabricated diff — per **L-01**, the Compare surface remains a governed unavailable slot (§7 below) until Infrastructure delivers the endpoint under a separate programme.

---

## 4. Action rendering algorithm (normative)

```text
actions := planDto.availableActions

FOR each UI affordance mapped to a known QEP Test Plan action id
      (submit-for-review, approve, reject, return-to-draft, mark-ready,
       start-execution, complete, archive, cancel, supersede, clone,
       transfer-ownership, assign, schedule, item add/update/remove/reorder):

  IF actionId ∈ actions THEN
        render the control as enabled
  ELSE
        do not render the control
        (or render disabled with an explanatory tooltip ONLY where the
         Design System pattern explicitly calls for it — never implying
         a hidden capability the user could otherwise obtain)

NEVER enable a control whose action id is absent from `actions`.
NEVER hardcode a transition matrix as an authority substitute for `actions`.
NEVER wait-and-guess — if `actions` has not yet loaded, render a loading
      state, not a default-enabled or default-disabled action set.
```

This algorithm is the **single normative mechanism** for action visibility across every Workbench surface (Explorer row menu, Inspector Action Bar, Review queue, bulk selection). It directly implements the binding invariant recorded at Owner ARCH-014 Acceptance: *"The Workbench SHALL never determine what a user may do."*

### 4.1 Multi-select / bulk actions

Bulk UI **MAY** enable an action only when it is present in the **intersection** of `availableActions` across every selected row. A single row lacking the action **MUST** suppress the bulk control for that action.

---

## 5. State model

| State | Owner |
| ----- | ----- |
| Server Plan DTO (identity, status, items, lineage, `availableActions`) | System of Record via API — never cached as authoritative beyond a request lifecycle |
| Explorer / Review queue filters, sort, page | URL query state + optional Preference Service (Document 023) |
| Selected `planId` / active Inspector tab | URL + session restore (Document 018) |
| Form dirty state (Create / Edit Draft) | Ephemeral client-only; **MAY** use session preferences for UI-state recovery only |
| `availableActions` | Server only — never derived, cached across mutations, or assumed |

---

## 6. Design System

1. Tokens only — no hardcoded colours, spacing, radius, or typography values (Document 006).
2. Shared composites from `/packages/ui` **SHALL** be used before inventing a new component.
3. Empty / loading / error / forbidden / not-found patterns **SHALL** come from the Design System's governed states.
4. New shared primitives promoted to `/packages/ui` require a `component.yaml` manifest (Document 028) before implementation.
5. Status badges **SHALL** use semantic tokens per the lifecycle presentation table (Appendix B) — status is never colour-only.

---

## 7. Compare presentation contract (Infrastructure limitation L-01)

This is the single most sensitive engineering boundary in this OES. Implementers under a future `APZQEP-ENG-070A` **SHALL**:

1. Ship the route `/workspace/qep/test-plans/plans/{planId}/compare?from={rev}&to={rev}` (Appendix C) as a **live, navigable route** rendering a **governed unavailable state**: *"Version comparison is not yet available for Test Plans"*, with a link back to the Versions panel.
2. **NOT** call any endpoint resembling `GET .../compare` — no such endpoint exists in the certified Infrastructure (CERT-060B). Any code that constructs such a request is a defect.
3. **NOT** simulate a diff by fetching two full Plan DTOs (by revision) and computing a client-side comparison as a substitute for the server contract — this would silently fabricate a feature Infrastructure has not certified, directly violating ARCH-014 Part 4 §6 rule 4.
4. Leave the route's activation to a **future, separately authorised** ENG programme once Infrastructure delivers `GET .../compare` — this OES's route contract **SHALL** remain stable so that future delivery is additive, not a URL-breaking change.

---

## 8. Security (implementation-level, complementing ARCH-014 Part 5 §4)

1. UI hide is never treated as authorisation — the server remains authoritative for every mutating call.
2. No secrets, tokens, or `expectedRevision` concurrency values in URLs or `localStorage` business payloads.
3. No `dangerouslySetInnerHTML` for Plan content unless routed through an approved platform sanitiser.
4. Sidebar visibility, the "New Test Plan" affordance, and the Review queue **SHALL** be permission-gated via the Permission Platform (`qep.plan.*`), consistent with ARCH-014 Part 2 §11.
5. Errors **MUST NOT** leak raw backend/engine strings — typed error categories only (Document 010).

---

## 9. Reference Workbenches

Implementers **SHALL** align UX mechanics with:

- Test Specifications Workbench (APZQEP-ENG-050C) — nearest sibling; same shell grammar, same `availableActions` discipline.
- Requirements / Traceability / Verification Workbenches — general Explorer/Inspector conventions.

…adapted to Test Plan semantics defined in APZQEP-ARCH-014 — never copying foreign domain concepts (e.g. the Workbench **MUST NOT** absorb a Specification editor; it deep-links instead, per ARCH-014 §11).

---

## 10. Traceability

| This Part | Trace |
| --------- | ----- |
| Component catalogue | ARCH-014 Part 3 |
| Action catalogue | ARCH-014 Part 3 §9 · ENG-060B Parts 3–4 |
| Compare contract | ARCH-014 Part 4 §6 · KNOWN-LIMITATIONS.md L-01 |
| Items binding | ARCH-014 Part 3 §6.2 · KNOWN-LIMITATIONS.md L-02 |
| Design System | Documents 006 / 028 |
| Security | Document 013 · ARCH-014 Part 5 §4 |

---

## 11. Explicit non-goals (Part 3)

This Part does NOT define the testing pyramid, Playwright journeys, or quality gates (Part 4); AI/MCP boundaries or Owner Acceptance criteria (Part 5); or any concrete file layout (Appendix C is a proposed inventory only, not created).

---

## 12. STOP (Part 3)

```text
APZQEP-OES-ENG-070A
TECHNICAL APPROACH SPECIFICATION ONLY
NO CODE, ROUTES, OR PACKAGES CREATED UNDER THIS PART
```
