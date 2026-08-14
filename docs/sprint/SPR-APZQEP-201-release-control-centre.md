# SPR-APZQEP-201 — Release Control Centre & surface completion

> **Status:** **AUTHORISED · IN PROGRESS** — 2026-08-14  
> **Parent:** [SPR-APZQEP-200](./SPR-APZQEP-200-competitive-full-swing.md)  
> **Depends on:** APZQEP V1.1 CLOSED; Quality Flow Workspace + Certification/RC APIs live  
> **Does not:** Redesign QO kernels; invent new SoR; auto-certify; start 202–204

## Outcome

An operator opens **Quality → Home** and can answer **“Can we release with confidence?”** from one composition:

- Live release posture (blocked / waiting / exceptions / decisions)
- Clear next actions into Quality Flows, Release Candidate, Release Readiness
- Honest links into security assurance (APZPEN) without claiming enterprise depth not built

**Release Readiness** is a second composition over the same orchestration facts — checklist orientation for go/no-go prep — not a duplicate SoR.

## Scope

### In

| ID    | Ship                              | Approach                                                                                        |
| ----- | --------------------------------- | ----------------------------------------------------------------------------------------------- |
| 201-A | Un-stub **M01 Home**              | Workbench manifest + `qep-home-views` composing `/api/v1/qep/quality-flows`                     |
| 201-B | Un-stub **M12 Release Readiness** | Checklist UI over flow summary + links to RC / Flows                                            |
| 201-C | Activity entry                    | Quality activity-bar default → `/workspace/qep/home`                                            |
| 201-D | Permissions                       | `qep.home.read`, `qep.release_readiness.read` on operator/reader catalogues                     |
| 201-E | Catalogue honesty                 | `module-ids` M01 + M12 → `enabled`                                                              |
| 201-F | APZPEN strip                      | Home/Readiness link to `/apzpen` + note security domains feed certification (existing RC tiles) |

### Out (later in 201 or 202+)

- New certification domain engines
- Playwright production ingest (202)
- AI assist (203)
- Full Search / Evidence GA (204)
- New Platform Service SoR tables for “readiness score”

## Architecture compliance

```
Presentation (Home / Release Readiness views)
  → existing QEP APIs (Quality Flows, Certification)
  → Platform Services / orchestration (unchanged)
```

- Modules remain presentation-only.
- No Module → Connector calls.
- AI never certifies (unchanged hard rule).

## File plan

| Path                                                                       | Action                                          |
| -------------------------------------------------------------------------- | ----------------------------------------------- |
| `packages/workbench-framework/manifests/qep-home/module.yaml`              | Create (active)                                 |
| `packages/workbench-framework/manifests/qep-release-readiness/module.yaml` | Create (active)                                 |
| `packages/workbench-framework/manifests/qep/module.yaml`                   | Default route → home                            |
| `modules/qep-home/module.yaml`                                             | `status: active`                                |
| `modules/qep-release-readiness/module.yaml`                                | `status: active`                                |
| `apps/web/lib/qep/home-routes.ts`                                          | New                                             |
| `apps/web/lib/qep/release-readiness-routes.ts`                             | New                                             |
| `apps/web/lib/qep/routes.ts`                                               | Re-export                                       |
| `apps/web/components/qep/qep-home-views.tsx`                               | New                                             |
| `apps/web/components/qep/qep-release-readiness-views.tsx`                  | New                                             |
| `apps/web/components/qep/qep-workspace-router.tsx`                         | Wire Home + Readiness (+ bare `/workspace/qep`) |
| `packages/qep-types/src/module-ids.ts`                                     | M01, M12 enabled                                |
| `packages/platform-authorization/src/qep-core-qe-permissions.ts`           | Add permissions                                 |

## Acceptance criteria

1. Sidebar shows **Home** and **Release Readiness** for users with read permissions; routes render real surfaces (not Unavailable).
2. Home shows live metrics from Quality Flows command centre (or clear empty/error states).
3. Primary CTAs: Open Quality Flows, Open Release Candidate, Open Release Readiness.
4. Release Readiness presents a go/no-go oriented checklist derived from blocked/waiting/exceptions.
5. Opening Quality activity lands on Home.
6. `M01` and `M12` catalogue status = `enabled`.
7. Unit tests for route helpers; existing Quality Flow E2E still green.
8. No new orchestration tables; no AI certification path.

## Definition of Done

- Build + targeted Vitest pass.
- Docs: this guide + SPR-200 status + PRODUCT-STATUS pointer + docs/README index.
- Owner can demo: Activity Quality → Home answers release confidence → drill into Flows / RC.

## Execution order

1. Manifests + permissions + routes
2. Home view
3. Release Readiness view
4. Router + activity default
5. Catalogue + tests + docs sync

## Non-goals reminder

Do not start SPR-APZQEP-202 until 201 acceptance is met or Owner reorders.
