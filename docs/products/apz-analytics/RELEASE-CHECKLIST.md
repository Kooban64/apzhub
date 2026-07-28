# APZ Analytics — Release 1.0 Checklist

> **Programme:** APZ-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Complements:** [RELEASE-GOVERNANCE-CHECKLIST](../../releases/RELEASE-GOVERNANCE-CHECKLIST.md)  
> **Date:** 2026-07-19

---

## A. Before any implementation (planning gates)

| #   | Check                                   | Status now                    |
| --- | --------------------------------------- | ----------------------------- |
| A1  | Release Definition Pack complete        | **Done** (this programme)     |
| A2  | Owner Acceptance of APZ-ANALYTICS-001   | Pending                       |
| A3  | Metabase adapter exists / certified     | **Open**                      |
| A4  | Analytics architecture ADR accepted     | **Open**                      |
| A5  | Marked Implementation Ready on disk     | **Open** — currently Planning |
| A6  | Named Owner Approval for implementation | **Open**                      |

---

## B. Before Release Candidate

| #   | Check                                                     |
| --- | --------------------------------------------------------- |
| B1  | All Release 1.0 in-scope capabilities behind permissions  |
| B2  | Exclusions still excluded (AI/ML/SQL builder/external BI) |
| B3  | Known limitations filed                                   |
| B4  | Playwright cert suite green                               |
| B5  | Adapter + service health green in staging/dev compose     |
| B6  | No Metabase brand in standard UI                          |
| B7  | Frozen SoRs untouched without ADR                         |

---

## C. Before Owner Acceptance of SemVer 1.0.0

| #   | Check                                                                                   |
| --- | --------------------------------------------------------------------------------------- |
| C1  | [RELEASE-GOVERNANCE-CHECKLIST](../../releases/RELEASE-GOVERNANCE-CHECKLIST.md) complete |
| C2  | Evidence under `docs/releases/analytics/1.0.0/`                                         |
| C3  | Portfolio Release Register row prepared                                                 |
| C4  | Commercial catalogue / edition matrix updated                                           |
| C5  | QA-002 PRODUCTION READY retained                                                        |
| C6  | STOP: no unapproved Major claims                                                        |

---

## Related

- [CERTIFICATION-PLAN.md](./CERTIFICATION-PLAN.md)
- [IMPLEMENTATION-READINESS.md](./IMPLEMENTATION-READINESS.md)
