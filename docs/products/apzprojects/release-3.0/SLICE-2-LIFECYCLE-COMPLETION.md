# Slice 2 — Project Lifecycle — Completion Report

| Field     | Value                                                  |
| --------- | ------------------------------------------------------ |
| Authority | Workshop 003 + Owner Decision (Lifecycle Wizard first) |
| Date      | 2026-08-06                                             |
| Status    | **Implemented with honest gaps**                       |

## Implemented functionality

- Canonical lifecycle stages: Draft → Initiating → Active → On Hold → Closing → Closed → Archived
- Explicit transitions only (entry/exit criteria, waivers, audit transition records)
- Direct status PATCH rejected
- DELETE archive blocked when lifecycle metadata exists (must transition Closed → Archived)
- Eight-stage Initiate Wizard (Identity → Delivery Model → Classification → Governance Profile → Template → Initial Baseline → Team & Accountability → Review & Create)
- Draft save + resume (`/workspace/projects/new?resume={projectId}`)
- Per-stage client validation + server initiation/closure gates
- Governance Profiles (system catalogue) snapshotted at creation (id + version)
- Classification enum (Strategic, Operational, Regulatory, Customer, Internal, Innovation)
- Initial Baseline on transition to Active; Re-baseline + Baseline History
- Closing workflow with outcome, summary/evidence, open commitment/risk/milestone checks, waivable governance gates
- Archive from Closed only; restore Archived → Closed only
- Lifecycle panel on project detail (transitions, readiness, baselines)

## APIs added or modified

| Method    | Path                                                   | Notes                                                  |
| --------- | ------------------------------------------------------ | ------------------------------------------------------ |
| POST      | `/api/v1/projects/initiate`                            | Create + lifecycle ensure (draft \| initiating)        |
| GET       | `/api/v1/projects/lifecycle/profiles`                  | Governance Profiles catalogue                          |
| GET       | `/api/v1/projects/lifecycle/templates`                 | Project templates catalogue                            |
| GET/PATCH | `/api/v1/projects/{id}/lifecycle`                      | Read / draft-or-initiating patch                       |
| GET/POST  | `/api/v1/projects/{id}/lifecycle/transitions`          | List / execute transition                              |
| GET       | `/api/v1/projects/{id}/lifecycle/initiation-readiness` | Initiation gate                                        |
| GET       | `/api/v1/projects/{id}/lifecycle/closure-readiness`    | Closure gate                                           |
| GET/POST  | `/api/v1/projects/{id}/lifecycle/baselines`            | History / re-baseline                                  |
| GET/PATCH | `/api/v1/projects` / `{id}`                            | Status overlaid from lifecycle; status PATCH forbidden |
| DELETE    | `/api/v1/projects/{id}`                                | Rejected when lifecycle present                        |

## Database changes

- `0109_apz_platform_projects_lifecycle.sql` — platform lifecycle, baselines, transitions, waivers
- `0110_*_rls.sql` — RLS
- Schema: `packages/config/src/db/platform-projects-lifecycle-schema.ts`

**Dependency (raised earlier, still true):** Plane remains project shell SoR (active/archived). Canonical lifecycle lives in platform PostgreSQL. Migrations must be applied in each environment before production use.

## UI completed

- `ProjectInitiateWizard` replaces create-project form
- `ProjectLifecyclePanel` on project overview
- Status select removed from detail edit
- Status badges understand initiating / closing / closed

## Validation rules

- Wizard: per-stage required fields (identity, model, classification, profile, baseline/waivers, owner)
- Initiating → Active: owner, classification, delivery model, governance profile, milestone (or waiver), target end (or continuous waiver); Initial Baseline captured on transition
- Active/On Hold → Closing: outcome + summary required
- Closing → Closed: open actions/risks/milestones resolved or waived; evidence/approval per profile or waived
- Hold: reason; Decision ID when profile requires
- Archive only from Closed; restore only to Closed
- No implicit transitions; no direct status edits

## Remaining dependencies

- Workflow bridge for real closure approval / hold Decision objects (waivers used until bridge exists)
- Waiting / Commitments SoR (Delivery slice) for richer closure “outstanding commitment” checks beyond actions/milestones/risks
- Decisions outstanding validation is partial (Decision ID on hold only; full Decision inventory in Delivery)
- Organisation-scoped Governance Profile inheritance admin UI (system profiles shipped; org hierarchy CRUD not built)
- Variance tracking UI beyond baseline history + re-baseline fields (forecast variance engine is Delivery/Reporting)
- List/workspace filters by platform lifecycle stage (overlay on GET; filter query still Plane-oriented)
- Cockpit Focus Navigation deferred per Owner (Lifecycle first)

## Regression status

- Targeted typecheck for Slice 2 UI: clean aside from pre-existing repo TS noise
- Lifecycle service `actorUserId` context misuse fixed (`userId` / impersonation)
- Full Vitest / Playwright suite not re-run in this increment — recommend CI run before merge

## Honest implementation gaps

1. Closure approval & evidence depend on waiver when Workflow/Evidence bridges absent
2. Outstanding Decision validation is not a full Decision inventory check
3. Organisation governance hierarchy admin not implemented — system profiles only
4. Plane status remains active/archived under the hood; UI/API surface lifecycle stage via overlay
5. Template seed on draft→initiating may create milestones; blank template available
6. Owner/team fields accept user IDs as text (Identity picker UI not in this slice)
7. Archive leaves operational workspace via Plane archive sync; search/report retention depends on existing search index behaviour (not reworked here)
