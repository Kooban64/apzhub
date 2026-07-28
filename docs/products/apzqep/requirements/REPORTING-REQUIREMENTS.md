# APZ QEP — Reporting Requirements

> **Programme:** APZQEP-REQ-001 · IDs: RPT-*

| ID      | Dashboard / report     | Requirement                                                                                     | Priority | Risk     | Acceptance criteria                  |
| ------- | ---------------------- | ----------------------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------ |
| RPT-001 | Executive Dashboards   | Portfolio quality posture, certification status, release risk signals                           | P0       | High     | Permission-filtered executive view   |
| RPT-002 | Quality Dashboards     | Coverage, pass rates, open defects, verification progress                                       | P0       | High     | QA role default landing content      |
| RPT-003 | Engineering Dashboards | Automation linkage, flaky/failure trends, CI metadata adjacency                                 | P1       | Medium   | Engineering-permissioned             |
| RPT-004 | Release Dashboards     | Per-release readiness, gates, evidence completeness, blockers                                   | P0       | Critical | Go/no-go clarity for Release Manager |
| RPT-005 | Compliance Dashboards  | Audit completeness, retention status, sign-off inventory                                        | P1       | High     | Auditor/Compliance roles             |
| RPT-006 | AI Analytics           | Suggestion volumes, accept/reject rates, AI audit coverage (no auto-certify metrics as success) | P2       | Medium   | AI features OFF until authorised     |
| RPT-007 | Trend Analysis         | Quality trends over time (defects, coverage, cert cycle time)                                   | P1       | Medium   | Time-series views                    |
| RPT-008 | Risk Analytics         | Risk heatmaps linked to coverage gaps                                                           | P1       | Medium   | Align FR-016 / AIR-006               |
| RPT-009 | Export                 | Export reports for audit packs (CSV/PDF intent)                                                 | P0       | High     | Export available for cert packs      |
| RPT-010 | Searchable activity    | Activity/report artefacts discoverable via Platform Search where appropriate                    | P1       | Medium   | Permission-filtered                  |

## Rules

- Reports are derived views — **QEP SoR remains authoritative**.
- AI narratives (AIR-008) are non-authoritative overlays on dashboards.
- No product-owned Metabase/Grafana chrome for standard users.
