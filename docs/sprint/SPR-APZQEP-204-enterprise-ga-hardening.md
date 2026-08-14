# SPR-APZQEP-204 — Enterprise GA hardening

> **Status:** **DELIVERED** — 2026-08-14  
> **Parent:** [SPR-APZQEP-200](./SPR-APZQEP-200-competitive-full-swing.md)  
> **Depends on:** 201 DELIVERED; 202–203 ships for trust narrative  
> **Does not:** Redesign V1.1 SoR; claim cloud WORM without D-001

## Outcome

Trust story matches PRODUCTION READY: durable Evidence default, searchable QEP entities, honest catalogue, OpenAPI coverage for shipped surfaces, thin project ACL, dogfood blockers closed.

## Ships

| ID    | Ship                     | Approach                                                                                               |
| ----- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| 204-A | Evidence durable default | Prefer `local` (+ Postgres metadata) over `memory` in non-test; document residual vs object store      |
| 204-B | QEP Search               | Extend search-qep entities; un-stub Search module thin UI                                              |
| 204-C | OpenAPI + project ACL    | Document/register key `/api/v1/qep/*`; membership check helper on Cap handlers where projectId present |
| 204-D | Catalogue truth          | Align PRODUCT-CATALOGUE / PRODUCT-STATUS with V1.1 + 200 programme honesty                             |
| 204-E | Dogfood                  | Capture and close ADOPT friction that blocks Home → certify demo                                       |

## Acceptance

1. Evidence provider default is not memory outside Vitest.
2. Search returns ≥ requirements + evidence + defects (or honest empty with providers registered).
3. Catalogue no longer claims blanket LA where GA/Production Ready is true.
4. OpenAPI artifact lists primary QEP Release Control / automation / SCM / certification paths.
5. Docs: SPR-200 marked COMPLETE when 201–204 delivered.

## Non-goals

MinIO mandatory; full multi-tenant marketplace; reopening Cap A–F kernels.

## Delivery record

- Evidence content defaults to durable local storage outside tests; object-store/WORM remains an explicit residual.
- QEP Search is active and permission-gated, with requirement, evidence, and defect entity coverage over Platform Search.
- Key shipped QEP routes are published in [APZQEP OpenAPI v1](../specs/apzqep-openapi-v1.yaml).
- Project-scoped Cap requests use the thin ProjectService-backed membership ACL and fail closed.
- Catalogue and adoption records now reflect V1.1 PRODUCTION READY and the completed SPR-200 programme.

**Parent closeout:** SPR-APZQEP-200 is **COMPLETE · DELIVERED** — phases 201–204 all DELIVERED.
