# APZHUB Platform 1.2.0 — Quality Evidence Summary

> **Programme:** APZHUB-1.2-009  
> **Date:** 2026-07-20  
> **Sources:** Programme QUALITY-EVIDENCE packs under `docs/releases/1.2/` · [1.2 readiness QUALITY-SUMMARY](../../1.2/readiness/QUALITY-SUMMARY.md)

---

## Aggregated authorised-P0 quality

| Programme      | Backlog       | Quality posture                                        |
| -------------- | ------------- | ------------------------------------------------------ |
| APZHUB-1.2-002 | R12-OPS-01    | **PASS**                                               |
| APZHUB-1.2-003 | R12-OPS-02    | **PASS**                                               |
| APZHUB-1.2-004 | R12-OPS-03    | **PASS**                                               |
| APZHUB-1.2-005 | R12-SEARCH-01 | **PASS** (adapter); frozen-wave pin drift pre-existing |
| APZHUB-1.2-006 | R12-SEARCH-02 | **PASS**                                               |
| APZHUB-1.2-007 | R12-TCMS-01   | **PASS** (`audit:gitlab-ci`)                           |
| APZHUB-1.2-008 | Readiness     | Documentation review — **ACCEPTED**                    |

**Overall:** **PASS** for Owner-authorised Release 1.2 P0 engineering.

---

## Packaging programme quality (this programme)

| Gate                                                       | Result                                                |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| Documentation-only (no code / APIs / packages / builds)    | **PASS**                                              |
| Repository evidence review complete                        | **PASS**                                              |
| Verification matrix (compat / architecture / SemVer / API) | **PASS**                                              |
| Tests executed in this programme                           | **N/A** — no verification gap requiring new test runs |

---

## Held baselines

| Baseline                                      | Status                            |
| --------------------------------------------- | --------------------------------- |
| QA-002 repository PRODUCTION READY            | **HELD**                          |
| Platform 1.1.0 PRWL                           | Predecessor baseline              |
| R12-QA-01 Playwright/Docker portfolio re-cert | **Not executed** (P1 residual KL) |

---

## Conclusion

Quality evidence is sufficient to certify Platform **1.2.0** as **PRODUCTION_READY_WITH_LIMITATIONS**.
