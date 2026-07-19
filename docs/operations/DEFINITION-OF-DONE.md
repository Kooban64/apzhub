# Definition of Done

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [DEFINITION-OF-READY](./DEFINITION-OF-READY.md) · Document [015](../015-software-quality-testing-qa-cicd-release-management-framework.md) · [PRODUCT-CERTIFICATION-STANDARD](../products/PRODUCT-CERTIFICATION-STANDARD.md)

---

## Purpose

Mandatory completion gates before a programme may file its Acceptance Report and before Owner Acceptance.

---

## Minimum gates (all required)

| #   | Gate                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Implementation complete** within approved scope (no placeholders/stubs/`any`/ts-ignore/eslint-disable in production paths) |
| 2   | **Repository typecheck PASS**                                                                                                |
| 3   | **Repository lint PASS** (programme paths at minimum; full repo for release)                                                 |
| 4   | **Repository tests PASS** (or agreed scoped suite with Owner/Tech Lead rationale for hotfixes)                               |
| 5   | **Product / programme tests PASS**                                                                                           |
| 6   | **UI certification PASS** when user-facing Workbench/UI is in scope                                                          |
| 7   | **Documentation updated** (sprint, pack, KF status, limitations)                                                             |
| 8   | **Architecture unchanged** unless ADR + Owner approved                                                                       |
| 9   | **Completion Report** filed                                                                                                  |
| 10  | **Programme Acceptance Report** filed                                                                                        |
| 11  | **Owner Acceptance** → **ACCEPTED / CLOSED**                                                                                 |

Aligns with Document 015 Definition of Done (requirements, review, unit/integration/API/Playwright, a11y, docs, merge to main).

---

## Certification alignment

Product programmes also satisfy [PRODUCT-CERTIFICATION-STANDARD](../products/PRODUCT-CERTIFICATION-STANDARD.md):

- Architecture compliance checklist
- No Module → Connector bypass
- Engine names not in UI
- SDK/adapter freezes held

---

## Incomplete = not Done

If any minimum gate fails, the programme is **not** ready for Owner Acceptance. Do not mark CLOSED. Do not start the next programme.
