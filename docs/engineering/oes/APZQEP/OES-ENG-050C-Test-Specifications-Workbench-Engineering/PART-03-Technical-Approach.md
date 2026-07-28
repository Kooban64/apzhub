# APZQEP-OES-ENG-050C

# PART 3 — Technical Approach

| Item     | Value               |
| -------- | ------------------- |
| Document | APZQEP-OES-ENG-050C |
| Part     | **3 of 5**          |
| Status   | **FILED**           |

---

## 1 Stack (mandatory — Document 000 / 004)

| Concern       | Choice                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| App           | Next.js App Router in `apps/web`                                            |
| UI            | React + TypeScript strict + Tailwind + shadcn/ui (`/packages/ui`)           |
| Icons         | Lucide only                                                                 |
| Data fetching | TanStack Query (or platform-equivalent already used by sibling Workbenches) |
| Forms         | RHF + Zod (shape only; server validates authority)                          |
| Auth session  | Platform shell / Better Auth — no separate login                            |
| API           | `/api/v1/qep/specifications/*` via platform client patterns                 |

Technology substitution requires Owner approval.

---

## 2 Repository placement

| Artefact                         | Location                                                                                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Routes / pages                   | `apps/web` under QEP / test-specifications route tree (Appendix C)                                                                  |
| Shared UI extensions             | `/packages/ui` only when reusable; else local Workbench modules                                                                     |
| Feature modules                  | Prefer `modules/` or existing QEP Workbench co-location pattern used by Requirements / Verification — **match sibling Workbenches** |
| Product docs (delivery evidence) | `docs/products/apzqep/test-specifications/workbench/`                                                                               |
| OES (this)                       | `docs/engineering/oes/APZQEP/OES-ENG-050C-…`                                                                                        |

Engineers SHALL inspect Requirements / Traceability / Verification Workbench layouts and **reuse the same patterns** rather than inventing a parallel structure.

---

## 3 API consumption rules

1. All reads/writes go through APZHUB Route Handlers / Platform Services already exposed by ENG-050B.
2. Client MUST send correlation id per 010.
3. Client MUST handle standard response envelope and typed errors — no raw backend strings.
4. After every mutation: invalidate/refetch Specification DTO; re-bind `availableActions`.
5. Optimistic UI MAY be used; MUST roll back on failure.
6. MUST NOT import Domain packages into client components for business rules.

---

## 4 Action rendering algorithm (normative)

```text
actions := dto.availableActions
FOR each UI affordance mapped to a QepTestSpecificationAction:
  IF action ∈ actions THEN render enabled control
  ELSE do not render (or disable only if UX requires placeholder — prefer hide)
NEVER enable an action absent from actions
NEVER add returnToDraft unless contracts expose it (ADR-0074)
```

---

## 5 State model

| State                          | Owner                                   |
| ------------------------------ | --------------------------------------- |
| Server Specification DTO       | SoR via API                             |
| Explorer filters / sort / page | URL query + optional Preference Service |
| Selected id                    | URL + session restore                   |
| Form dirty state               | Ephemeral client only                   |
| availableActions               | Server only                             |

---

## 6 Design System

1. Tokens only — no hardcoded colours/spacing.
2. Shared composites from `/packages/ui` before inventing.
3. Empty / loading / error / forbidden patterns from Design System.
4. New shared primitives require `component.yaml` (028) when promoted to shared library.

---

## 7 Security (implementation)

1. Never trust UI hide as authorisation.
2. No secrets in URLs or localStorage business payloads.
3. No `dangerouslySetInnerHTML` for Specification content unless an approved sanitiser path exists.
4. Permission-gated Sidebar and Create button via PermissionService.

---

## 8 Reference Workbenches

Implementers SHALL align UX mechanics with:

- Requirements Workbench
- Traceability Workbench
- Verification Workbench

…adapted to Specification semantics in OES-ARCH-012 — not copied domain concepts.

---

## END OF PART 3
