# APZ Analytics — Quality Plan (Release 1.0)

> **Programme:** APZ-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** Document 015 · [DEFINITION-OF-DONE](../../operations/DEFINITION-OF-DONE.md) · QA-002  
> **Date:** 2026-07-19

---

## Quality objectives

1. Preserve repository **PRODUCTION READY** (QA-002) through delivery.
2. Enforce Module → Service → Adapter → Engine path.
3. Zero engine brand leakage in standard UI.
4. Permission-filtered dashboard access (server authoritative).
5. Adapter health + diagnostics always reportable.

---

## Gates (mandatory before merge / release)

| Gate                                                                           | Applies                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------ |
| Lint · types · build                                                           | Every PR                                   |
| Unit / contract tests                                                          | Services · adapter · client                |
| Integration tests (mocked Metabase)                                            | Adapter + services                         |
| Playwright product cert                                                        | Workbench flows                            |
| Architecture compliance review                                                 | Against 003/008/009/010 + freezes          |
| Security review                                                                | Embed tokens · secrets · XSS in embed host |
| Docs + known limitations                                                       | Release pack                               |
| [RELEASE-GOVERNANCE-CHECKLIST](../../releases/RELEASE-GOVERNANCE-CHECKLIST.md) | Before Owner Acceptance of 1.0.0           |

---

## Non-regression

| Area                                                      | Rule                                        |
| --------------------------------------------------------- | ------------------------------------------- |
| Frozen Metrics / Observe / Reporting / Search Publication | No redesign without ADR + Owner             |
| Integration SDK 1.0.0                                     | Adapter must comply; no SDK fork            |
| Existing Production products                              | Projects / Time / Support SemVer unaffected |

---

## Definition of Done (Analytics 1.0 feature)

Aligned to ops DoD plus: capability behind permission · no Metabase UI chrome for standard users · health indicator · tests · docs.

---

## Related

- [TESTING-PLAN.md](./TESTING-PLAN.md)
- [CERTIFICATION-PLAN.md](./CERTIFICATION-PLAN.md)
