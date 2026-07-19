# APZ Projects v1.1 — Implementation Plan

> **Release:** APZ Projects v1.1  
> **Classification:** PRODUCT RELEASE — **Plan only** (do not execute until Owner Approves scope)  
> **Related:** [Release Plan](./APZ-PROJECTS-1.1-RELEASE-PLAN.md) · [Scope](./APZ-PROJECTS-1.1-SCOPE.md)  
> **Pattern:** [Product Engineering Reference Implementation](../../products/APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md)

---

## 1. Preconditions (before first code change)

| #   | Gate                                          | Evidence                                                                               |
| --- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | Owner Approves 1.1 scope (or revised ID list) | Written Owner Approval                                                                 |
| 2   | Definition of Ready                           | [Release Plan §10](./APZ-PROJECTS-1.1-RELEASE-PLAN.md)                                 |
| 3   | CURRENT-MILESTONE authorises implementation   | KF update after Approval                                                               |
| 4   | Branch from protected `main`                  | `feature/apz-projects-1.1-workbench` (or equivalent)                                   |
| 5   | Freeze check                                  | Plane **0.6.0** · SDK **1.0.0** · no `services/` / `integrations/` / `packages/` edits |

---

## 2. Architecture (unchanged)

```text
Workbench UI (apps/web/components/projects)
  → apps/web/lib/projects (typed client)
  → /api/v1/projects* · /api/v1/tasks* · /api/v1/workspaces · /api/v1/search/* · /api/v1/health
  → Auth → Authz → Validation
  → PlatformServiceGateway → Plane providers → @apzhub/integration-plane (unchanged)
```

**Forbidden:** UI imports of adapters, `@apzhub/platform-services`, gateway helpers; engine brand strings; new Platform Service packages; new OpenAPI programmes.

---

## 3. Work packages (execution order)

### WP0 — Tracking & docs kickoff (docs only after Approval)

- Update CURRENT-MILESTONE / AI-MANIFEST: 1.1 **Approved, Awaiting Implementation** → in progress
- Confirm Scope IDs frozen

### WP1 — Typed client (PRJ-1.1-07)

| Change area | Files (expected)                                    |
| ----------- | --------------------------------------------------- |
| Client      | `apps/web/lib/projects/projects-api.ts`, `types.ts` |
| Tests       | `apps/web/lib/projects/*.test.ts` (add/extend)      |

Deliver: `getTask`, `updateTask`, `transitionTask`, `setTaskAssignees` / `clearTaskAssignee` (names aligned to existing routes), reuse existing envelope/`ProjectsApiError` patterns.

### WP2 — Task lifecycle UI (PRJ-1.1-01, PRJ-1.1-02)

| Change area | Files (expected)                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------- |
| Views       | `projects-tasks-view.tsx`, `project-detail-view.tsx` (tasks tab), shared `projects-ui.tsx` actions |
| Permissions | `permissions.ts` — gate manage actions                                                             |

Deliver: status transition control; assignee set/clear; loading/error/empty consistency.

### WP3 — Project maintenance UI (PRJ-1.1-03)

| Change area | Files (expected)                                          |
| ----------- | --------------------------------------------------------- |
| Views       | `project-detail-view.tsx` overview; optional list actions |

Deliver: edit form for API-supported fields; archive with confirm; invalidate queries.

### WP4 — My Work defaults (PRJ-1.1-04)

| Change area | Files (expected)                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------- |
| View        | `projects-my-work-view.tsx`                                                                    |
| Session     | Read current user id from existing web auth/session helper only (no IAM redesign)              |
| Persistence | `sessionStorage` / existing prefs hook if already present — **no Preference Service redesign** |

### WP5 — Honesty & packaging (PRJ-1.1-05, PRJ-1.1-06)

| Change area | Files (expected)                                      |
| ----------- | ----------------------------------------------------- |
| Views       | roadmap, sprints, search, dashboard/list empty states |

### WP6 — Certification (PRJ-1.1-08)

| Change area | Files (expected)                                            |
| ----------- | ----------------------------------------------------------- |
| E2E         | `testing/playwright/e2e/apzhub-projects-1.1-*.spec.ts`      |
| Helpers     | extend `projects-ui-cert-helpers.ts` or 1.1-specific helper |

### WP7 — Closeout

- Update [KNOWN-LIMITATIONS](../../products/projects/KNOWN-LIMITATIONS.md)
- Product release note / `RELEASES.md`
- Completion + Acceptance reports for Product Release 1.1
- KF navigation / portfolio version line → **APZ Projects 1.1.0**
- Tag only after Owner release approval per Release Management Standard

---

## 4. Explicit non-touches

| Path / area                                                                          | Rule                                                               |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `integrations/plane/**`                                                              | Do not modify                                                      |
| `packages/**` (SDK, platform-*)                                                      | Do not modify                                                      |
| `services/projects/**` except docs/manifest copy if Owner-approved nav string polish | Prefer **no** service.yaml changes; nav copy-only only if required |
| New `/api/v1/**/sprints` routes                                                      | **Forbidden** in 1.1 recommended scope                             |
| OpenAPI major expansion                                                              | Not required for recommended scope                                 |

---

## 5. Testing strategy (execution)

| Phase             | Commands / suites (indicative)                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| During PR         | Targeted Vitest for `lib/projects` + `components/projects`                                                 |
| Before Completion | `pnpm typecheck` · `pnpm lint` · product Vitest · Playwright `apzhub-projects-001` + `apzhub-projects-1.1` |
| Certification     | UI cert helpers — sign-in, mock API, mutation paths, no engine strings                                     |
| Regression        | Phase 1 workbench specs must remain green                                                                  |

No long-running work in request handlers; no new workers.

---

## 6. Risk controls during implementation

1. PR description must list Scope IDs.
2. Architecture review checklist ([CODE-REVIEW-STANDARD](../../operations/CODE-REVIEW-STANDARD.md)).
3. If a story needs missing HTTP → **STOP**, escalate to Owner (do not add Platform routes under 1.1).
4. If Plane capability gap appears → **STOP**, ADR path — out of 1.1.

---

## 7. Release acceptance criteria (implementation exit)

Same as [Release Plan §8](./APZ-PROJECTS-1.1-RELEASE-PLAN.md). Summary:

- Approved scope done
- Quality gates PASS
- Freezes held
- Limitations honest
- Owner Acceptance of Product Release 1.1

---

## 8. Effort sketch (non-binding)

| Package         | Complexity | Notes           |
| --------------- | ---------- | --------------- |
| WP1 Client      | Small      |                 |
| WP2 Task UI     | Medium     | Dominant effort |
| WP3 Project UI  | Small      |                 |
| WP4 My Work     | Small      |                 |
| WP5 Copy/polish | Small      |                 |
| WP6 Cert        | Medium     |                 |
| WP7 Closeout    | Small      |                 |

**Overall:** Medium product release (Workbench-only).

---

## 9. Stop

**Do not start WP1–WP7 until Owner Approves scope.**

This document is not implementation authorisation by itself.
