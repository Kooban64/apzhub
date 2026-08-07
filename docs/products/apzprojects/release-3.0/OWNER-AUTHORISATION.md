# Owner Authorisation — APZ Projects Release 3.0

| Field                 | Value                                                                |
| --------------------- | -------------------------------------------------------------------- |
| Release               | **APZ-PROJECTS-RELEASE-3.0**                                         |
| Title                 | APZ Projects Release 3.0 — Close to Production Ready                 |
| Classification        | **Product Release**                                                  |
| Architecture          | **FROZEN** (platform foundation)                                     |
| Product Bible         | **W002–W011 ACCEPTED** — implementation authority (no new workshops) |
| Engineering objective | **Close APZ Projects Release 3.0**                                   |
| Success criterion     | Declared **Production Ready**, certified, tagged, frozen             |

## Authorisations

| Gate                                     | Status                                                   |
| ---------------------------------------- | -------------------------------------------------------- |
| Product Bible (W002–W011)                | **COMPLETE**                                             |
| Core engineering (Slices 1–3)            | **COMPLETE / ACCEPTED**                                  |
| Operational engine · Lifecycle           | **COMPLETE / ACCEPTED**                                  |
| Workspace · Cockpit shells               | **IMPLEMENTED** (refinement remaining)                   |
| Engineering execution                    | **AUTHORISED** — completion only                         |
| Switch to another APZHUB product         | **NOT AUTHORISED** until Release 3.0 is Production Ready |
| Behaviour / UX change without PO         | **NOT AUTHORISED**                                       |
| New workshops / programmes / design docs | **NOT AUTHORISED**                                       |

## Owner directive (completion era)

> One product enters Engineering Execution. One product leaves Production Ready. Then move to the next product.

APZ Projects remains the **highest engineering priority**. Do not switch effort to another APZHUB product (including APZQEP) until Release 3.0 reaches **Production Ready**.

The objective is **completion**, not feature expansion.

## Four execution phases

| Phase | Name                          | Deliverable                                                                        |
| ----- | ----------------------------- | ---------------------------------------------------------------------------------- |
| 1     | Product Experience Completion | 100% feature-complete UX (W002–W011)                                               |
| 2     | Production Readiness          | No production blockers (P1–P5)                                                     |
| 3     | Hardening & Certification     | Release Candidate — no Critical/High defects                                       |
| 4     | Release                       | Tagged **APZ Projects Release 3.0** · **PRODUCTION READY** · frozen except defects |

Authority inventory: [RELEASE-3.0-CLOSEOUT.md](./RELEASE-3.0-CLOSEOUT.md)

## Rules

- Implement W002–W011 exactly; raise conflicts to Product Owner
- Prioritise removing production blockers and completing existing functionality
- Report progress by **phase**, not by slice or workshop
- After formal close: freeze 3.0 except defects; only then move to next product
