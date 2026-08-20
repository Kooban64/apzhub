# APZQEP Phase 1E — Application registry & quality execution context

**Date:** 2026-08-19  
**Status:** CLOSED — reconciliation closure complete.  
**Phase 2:** NOT STARTED.

Phase 1 and Phase 1V remain accepted. This phase does not redesign Requirements / User Stories / Acceptance Criteria, does not implement SSH execution or a terminal, and does not enable Source write.

## Reconciliation

| Existing store                                                 | Verdict                                                                                                                                                                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quality-project file ledger (`quality-project-store.ts`)       | **Cannot** be the durable Application aggregate (file, no `key`, not Cap FK, process-local). Promoted additively into Postgres. Ledger files are not deleted.                                                                      |
| `qep.application:` / `qep.project:` / `qep.repository:` scopes | Catalogue exists. Application list/get now **filters** `qep.application:{id}` when any such grants exist; unrestricted when none exist (same pattern as Source repo scopes). `qep.project:` / `qep.repository:` remain unenforced. |
| SCM `qep_scm_repository`                                       | **Reused** for repository identity. Association does not grant `source.read`.                                                                                                                                                      |
| Environment / execution target                                 | New aggregates (Phase 1E).                                                                                                                                                                                                         |
| Secret vault                                                   | **Reference pattern exists** (`credentialRef`). Production Vault adapter remains a platform GAP. Raw keys are rejected.                                                                                                            |
| Cap `projectId` strings                                        | Durable compatibility map `qep_application_legacy_ref`. Deterministic evidence only (`application.id`, `application.key`, `legacy_quality_project_id`). No silent attach. Unresolved identifiers are recorded, not guessed.        |

## Durable models

Postgres (drizzle `0147` + RLS `0148`, mapping `0149` + RLS `0150`):

- `qep_application`
- `qep_application_repository`
- `qep_application_environment`
- `qep_application_execution_target`
- `qep_application_legacy_ref` — `legacy/project identifier → qep_application.id` (nullable application_id = UNRESOLVED)

Canonical resolver: `createApplicationContextResolver` in `@apzhub/qep-applications/domain`. Downstream Command Centre / My Work / Application Overview counts use server-provided `projectRefs`; they do not hide unbound assigned work.

Package: `@apzhub/qep-applications`. Service manifest: `services/qep/services/qep-application/service.yaml`.

Archive sets `status=archived` and `archived_at`. Quality evidence tables are not cascaded.

## Migration

On Application list, file-ledger quality projects are imported when their id is not already present (`legacy_quality_project_id`, same id preserved, key derived from name). Observed Cap `projectId` values are scanned per tenant; identifiers that do not match an Application id/key/imported portfolio id are stored as UNRESOLVED. Historical Cap rows are not rewritten.

## API

`/api/v1/qep/applications` returns `ownerDisplayName`, `projectRefs`, and `legacyAssociations`.  
AuthZ: `qep.portfolio.read` / `qep.portfolio.operate` plus product access `qep`. Tenant from session. `/workspace/qep/portfolio` aliases the Applications list.

## Closure (Owner)

1. **Cap artefact association** — durable map + canonical resolver. Unbound records stay visible and labelled **Unbound** / **—**; they are not attributed to the selected Application.
2. **Owner display** — BetterAuth `user.name` when present; otherwise **Unavailable**. Raw user ids are not the ordinary label. No owner remains **—**.
3. **Header selector** — one accessible Application auto-selects; several restore last valid `sessionStorage` key `apzqep.selectedApplicationId`; otherwise explicit Select; zero shows **Application: None**.
4. **Repository inspector (08)** — not produced; empty Repositories table is accepted. No fake repository seeded.
5. **People & Access** — organisation IAM + `qep.application:{id}` explanation; no people directory.
6. **Remote execution** — configuration only. No SSH, no terminal, no command runner.

## Evidence

`docs/frontend/apzqep-redesign/evidence/phase-1e/`

| File                                    | Notes                                     |
| --------------------------------------- | ----------------------------------------- |
| 01 / 02 Applications desktop light/dark | Same geometry                             |
| 03 Applications mobile                  | Cards + bottom nav                        |
| 04 / 05 Overview desktop light/dark     | Same geometry                             |
| 06 Overview mobile                      |                                           |
| 07 Repositories                         | Empty — no fake rows                      |
| 08                                      | NOT PRODUCED — see `08-NOT-PRODUCED.txt`  |
| 09 / 10 Environments + inspector        | Target = Not configured                   |
| 11 / 12 Execution Targets + Remote Host | `credentialRef` only                      |
| 13 Command Centre                       | Application line; unbound work not hidden |
| 14 My Work                              | Layout frozen; assigned work not dropped  |
| 15 Source independence                  | `source.read` not implied                 |

## Tests

- Unit: Application create, tenant isolation, archive, environment/target binding, raw-secret rejection, repository association without Source fields, `qep.application:` scope filter, deterministic legacy mapping, unresolved observed refs, selector policy, Command Centre unbound labelling.
- Playwright Phase 1E: register, environment, remote host, secret rejected, mapping payload (`projectRefs`, `ownerDisplayName`, `legacyAssociations`), mobile cards, Source independence.
