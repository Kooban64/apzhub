# APZHUB-RELEASES-001 — Portfolio Consistency Report

> **Programme:** APZHUB-RELEASES-001 — Portfolio Release Baseline Standardisation  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Status:** Complete — Awaiting Owner Acceptance

---

## Scope reviewed

| Source                                                                         | Reviewed                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------- |
| Engineering Operating Model                                                    | `docs/operations/`                          |
| Product Release Roadmap                                                        | `docs/releases/PRODUCT-RELEASE-ROADMAP.md`  |
| Release Naming Standard                                                        | `docs/releases/RELEASE-NAMING-STANDARD.md`  |
| Release Calendar                                                               | `docs/releases/RELEASE-CALENDAR.md`         |
| Projects / Time / Support release trees                                        | `docs/releases/{projects,time,support}/`    |
| Product packs                                                                  | `docs/products/{projects,time,support}/`    |
| CURRENT-STATE · CURRENT-MILESTONE · PROJECT-INDEX · DOCUMENT-MAP · AI-MANIFEST | `docs/foundation/`                          |
| Product Portfolio                                                              | `docs/products/APZHUB-PRODUCT-PORTFOLIO.md` |

---

## Artefact matrix (after standardisation)

| Artefact                        | Projects 1.1.0    | Time 1.0.0        | Support 1.0.0                                                 |
| ------------------------------- | ----------------- | ----------------- | ------------------------------------------------------------- |
| Release Index                   | PASS              | PASS              | PASS                                                          |
| Release Notes                   | PASS              | PASS              | PASS (created)                                                |
| CHANGELOG                       | PASS (root)       | PASS (root)       | PASS (root entry added)                                       |
| Compatibility                   | PASS              | PASS              | PASS (created)                                                |
| Known Limitations               | PASS              | PASS              | PASS                                                          |
| Quality Evidence                | PASS              | PASS              | PASS (created — indexes OSS-110)                              |
| Completion Report               | PASS              | PASS              | PASS (created)                                                |
| Acceptance Report               | PASS (ACCEPTED)   | PASS (ACCEPTED)   | PASS (filed — Awaiting via RELEASES-001)                      |
| Baseline Report                 | PASS              | PASS              | PASS (created)                                                |
| Version History (`RELEASES.md`) | PASS              | PASS              | PASS (created)                                                |
| Release Directory               | PASS `1.1.0/`     | PASS `1.0.0/`     | PASS `1.0.0/` (created)                                       |
| SemVer history lines            | PASS              | PASS              | PASS (created)                                                |
| Owner Acceptance                | ACCEPTED / CLOSED | ACCEPTED / CLOSED | Packaging Awaiting RELEASES-001; engineering OSS-110 ACCEPTED |

---

## Version consistency

| Product  | Current Production | Patch | Minor | Major | Conflicts found                                |
| -------- | ------------------ | ----- | ----- | ----- | ---------------------------------------------- |
| Projects | 1.1.0              | 1.1.x | 1.2.0 | 2.0.0 | None                                           |
| Time     | 1.0.0              | 1.0.x | 1.1.0 | 2.0.0 | None                                           |
| Support  | 1.0.0              | 1.0.x | 1.1.0 | 2.0.0 | None (prior “SemVer not established” resolved) |

---

## Cross-reference & navigation

| Check                                                 | Result |
| ----------------------------------------------------- | ------ |
| Portfolio Release Register created                    | PASS   |
| Release Governance Checklist created                  | PASS   |
| Support release index points at 1.0.0 evidence        | PASS   |
| Support 2.0 planning retained as separate Major track | PASS   |
| No Documents / Analytics product release invented     | PASS   |
| QA-002 PRODUCTION READY retained                      | HELD   |
| No production code / package / architecture changes   | PASS   |

---

## Residual notes

1. Support **2.0** planning remains **Awaiting Acceptance** — does not alter **1.0.0** Production baseline.
2. Projects / Time packs were already complete; no duplicate artefacts created.
3. Future releases must use [RELEASE-GOVERNANCE-CHECKLIST.md](./RELEASE-GOVERNANCE-CHECKLIST.md) before Owner Acceptance.

---

## Verdict

**Portfolio release baselines are consistent** for the three Production products under a common SemVer governance model.
