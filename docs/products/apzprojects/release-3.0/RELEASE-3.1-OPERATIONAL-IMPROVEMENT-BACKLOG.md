# Release 3.1 — Operational Improvement Backlog

| Field     | Value                                                  |
| --------- | ------------------------------------------------------ |
| Source    | APZ Projects Release 3.0 closeout                      |
| Class     | Operational improvement — **not** Release 3.0 blockers |
| Authority | Owner decision 2026-08-07                              |

Items below were accepted Medium/Low at RC1. They do not prevent production release. Schedule only via operational evidence / Product Board for 3.1.

| ID       | Severity | Class                        | Summary                                                                 |
| -------- | -------- | ---------------------------- | ----------------------------------------------------------------------- |
| HD-H1-01 | Medium   | Product (narrow)             | Controlled project-name input remounts while operational queries settle |
| HD-H1-02 | Medium   | Certification Infrastructure | Long UI-cert journeys intermittent under route mocks on standalone host |
| HD-H1-03 | Medium   | Certification Infrastructure | Prod `failFast` discovery env for E2E standalone coexistence            |
| HD-H1-04 | Low      | Host coexistence             | `next build` vs long-lived `:3300` next-dev chunk graph                 |
| HD-H1-05 | Medium   | Certification Infrastructure | Session drop / shared storageState under long Playwright sequences      |
| HD-H5-01 | Medium   | Certification Infrastructure | WebKit may need API re-auth when reusing Chromium storageState          |

## Rule

Release 3.0 behaviour is baseline. Changes require formal approval unless production defect, security vulnerability, or critical operational hotfix.
