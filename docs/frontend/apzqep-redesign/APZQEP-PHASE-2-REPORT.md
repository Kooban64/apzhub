# APZQEP Phase 2 report — Definition chain

**Date:** 2026-08-19  
**Owner status:** **ACCEPTED** — [APZQEP-PHASE-2-ACCEPTANCE.md](./APZQEP-PHASE-2-ACCEPTANCE.md)  
**Phase 3:** READY FOR VISUAL DESIGN — not authorised to implement

Implementation followed [domain lock](./APZQEP-PHASE-2-DOMAIN-LOCK.md) and [implementation authority](./APZQEP-PHASE-2-IMPLEMENTATION-AUTHORITY.md). Screens 1–3 remain presentation authority. Existing Requirement / Application / Test / Execution / Evidence / Defect / Traceability / IAM / Audit backends were not replaced.

Owner accepted Phase 2 with **TRACEABILITY PARTIAL — CARRIED TO PHASE 3** (AC can link to Specifications; AC → execution / evidence / defect is not fully joined).

## Owner return block

```text
PHASE 2 STATUS:
COMPLETE

REQUIREMENTS:
PASS

USER STORY DOMAIN:
PASS

ACCEPTANCE CRITERION DOMAIN:
PASS

LEGACY AC MIGRATION:
PASS

LEGACY DATA LOST:
NO

APPLICATION BINDING:
PASS

TRACEABILITY:
PARTIAL

COVERAGE:
PASS

REQUIREMENTS VISUAL:
CONFORMS

REQUIREMENT DETAIL VISUAL:
CONFORMS

USER STORIES VISUAL:
CONFORMS

ACCEPTANCE CRITERIA VISUAL:
CONFORMS

LIGHT / DARK GEOMETRY:
MATCH

MOBILE:
PASS

TENANT ISOLATION:
PASS

SOURCE INDEPENDENCE:
PASS

PHASE 3:
NOT STARTED
```

Owner should still **visually inspect Requirement Detail and Acceptance Criteria** against the locked images, and confirm the migration behaviour below. The `PASS`/`CONFORMS` lines are implementation and evidence results, not a substitute for that inspection.

## Migrations

| File                                                          | Purpose                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `packages/config/drizzle/0151_apz_qep_definition_sor.sql`     | `qep_user_story`, `qep_acceptance_criterion`, `qep_acceptance_criterion_verification`, `qep_definition_key_counter` |
| `packages/config/drizzle/0152_apz_qep_definition_sor_rls.sql` | Tenant RLS via `app.tenant_id`                                                                                      |

Applied with `pnpm db:migrate`. Additive only. `qep_requirement` and `acceptance_criteria_json` were not dropped.

## Models added

Package `@apzhub/qep-definition` (`packages/qep-definition/`):

- **UserStory** — `applicationId` + `requirementId` required; operator key `US-n` unique per tenant+application; statuses `draft | active | in_review | approved | archived`
- **AcceptanceCriterion** — `requirementId` required, `userStoryId` optional; operator key `AC-n`; lifecycle `active | archived`
- **Verification link** — AC → existing `test_specification` asset id (no new Test Case store)
- Provenance: `origin_type` `human | import | migration | api | ai_accepted` (AI writes are rejected without `acceptedBy`; AI generation is not implemented)

Service manifest: `services/qep/services/qep-definition/service.yaml`

## Existing services extended

- Certified Requirement HTTP create still uses `qep_requirement`. After create, legacy `acceptanceCriteriaItems` are **promoted** into durable ACs (best-effort; GET definition retries).
- New Requirement UI binds `projectId` to selected `qep_application.id` (no `default` project for new writes).
- List/create Requirement ACL accepts a `qep_application.id` in place of a Cap project id.
- QEP operator catalogue gained `qep.requirements.edit`, `qep.requirements.archive`, `qep.requirements.versions.view`, `qep.requirements.versions.history` so certified Requirement create (which records a content version) is usable. Nine product roles were **not** created.
- Audit events write to existing `qep_requirement_audit` (`story.*`, `ac.*`, `ac.promoted_from_legacy`, `ac.reparented`, `ac.verification.*`).

## Compatibility / authority

| Path                                                                                      | Authority                                                              |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| New AC / Story writes                                                                     | Durable tables only                                                    |
| Definition READ (`/api/v1/qep/requirements/:id/definition`, list definition requirements) | Durable ACs first; promote legacy JSON on read                         |
| Certified Requirement DTO `acceptanceCriteria`                                            | Unchanged archive/compat field. Not written by the new AC UI           |
| Re-run promotion                                                                          | Idempotent on `(tenant, requirement, acceptance_criteria_json, index)` |

Legacy JSON is **not** a second writable SoR for Phase 2 UI. Certified create may still persist JSON then promote; subsequent durable writes do not sync back into JSON.

Migration **does not** invent a User Story parent. Direct Requirement ACs remain valid until a human re-parents them (identity preserved).

## Traceability — Phase 3 implication

Phase 2 can link an Acceptance Criterion to an existing **Specification** id (`assetKind: test_specification`) and derive coverage/result from that link.

It does **not**:

- add `acceptance_criterion` to certified `TRACE_ENDPOINT_KINDS`
- reconcile product language “Test Case” with the Specification aggregate
- join live execution/evidence/defect engines beyond optional `latestResult` on the link

Covered + `latestResult=fail` is **Covered / Fail**, not PASS. Requirement coverage is `n covered / m gaps` (Full / Partial / Gap / —).

## Unresolved gaps

- QUALITY sidebar still lists Requirements as the Define destination; User Stories / AC work inside Requirement Detail (Screen 3), not standalone catalogues
- Test Cases / Plans / Executions / Defects / Attachments tabs are honest empties unless AC verification links exist
- No Release model
- Casual Story re-parent to another Requirement is not offered (FK is immutable in Phase 2)
- Light/dark evidence uses the `dark` class for mobile (header theme control is desktop-only)

## Tests

- `packages/qep-definition` — 14 domain tests (create, tenant isolation, AC under Requirement and Story, consistency, idempotent promotion, no invented story, coverage ≠ pass, re-parent identity, archive keeps verification, AI origin requires acceptance)
- Handler tests — story create + tenant deny; AC under Requirement
- Playwright `testing/playwright/e2e/apzqep-phase-2-definition.spec.ts` — **PASS** (application binding, idempotent promote, story + AC, covered/fail, Command Centre / My Work smoke)

## Screenshots

[evidence/phase-2/](./evidence/phase-2/)

| File                                               |
| -------------------------------------------------- |
| 01–04 Requirements desktop/mobile light/dark       |
| 05–08 Requirement Detail desktop/mobile light/dark |
| 09–12 User Stories desktop/mobile light/dark       |
| 13–14 Acceptance Criteria desktop light/dark       |
| 15 Acceptance Criterion inspector                  |
| 16 Traceability/coverage relationship proof        |

## Stop

Phase 2 is **ACCEPTED**. Phase 3 implementation is **not authorised**. Next work is Phase 3 visual design, starting with the Test Case Library.
