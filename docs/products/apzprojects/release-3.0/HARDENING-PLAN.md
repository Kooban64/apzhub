# Phase 3 — Hardening Plan (APZ Projects Release 3.0)

| Field     | Value                                                                 |
| --------- | --------------------------------------------------------------------- |
| Status    | **COMPLETE** — RC1 approved · Release 3.0 CLOSED                      |
| Objective | Release Candidate with zero Critical and zero High defects — **met**  |
| Forbidden | New functionality · behavioural product changes (3.0 baseline frozen) |

## Execution order (Owner)

| ID     | Activity                                                                            | Exit                                        |
| ------ | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| **H1** | Functional Regression (W002–W011 · PE · Ops Engine · PR integrations)               | Regression accepted; defects classified     |
| **H2** | Accessibility (keyboard · focus · SR · colour · responsive)                         | WCAG acceptance                             |
| **H3** | Performance (load · API · search · portfolio · queue · palette · surfaces)          | Budgets accepted; optimise only on evidence |
| **H4** | Security (authz · privilege · tenant · audit · governance · workflow)               | Security accepted; corrections only         |
| **H5** | Cross-Platform (browsers · desktop · tablet · mobile)                               | Rendering/interaction accepted              |
| **H6** | Operational Readiness (deploy · admin docs · runbooks · monitor · backup · restore) | Ops readiness accepted                      |

## Deferred polish (Hardening scope, not features)

- Live evidence loader wiring
- Notice/Announcement editor polish
- UX smoke / Postgres persistence optimisation
- Staging application host bring-up (excluded from P4; ops readiness H6)

## Exit criteria

Zero Critical · Zero High · H1–H6 accepted → **RC1 APPROVED** → Release 3.0 **PRODUCTION READY** · **CLOSED**.

Defect log: [HARDENING-DEFECT-LOG.md](./HARDENING-DEFECT-LOG.md) · 3.1 backlog: [RELEASE-3.1-OPERATIONAL-IMPROVEMENT-BACKLOG.md](./RELEASE-3.1-OPERATIONAL-IMPROVEMENT-BACKLOG.md)
