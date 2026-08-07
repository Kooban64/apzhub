# P5 — Functional Certification Matrix

| Field     | Value                                  |
| --------- | -------------------------------------- |
| Release   | APZ-PROJECTS-RELEASE-3.0               |
| Authority | Product Bible W002–W011                |
| Result    | **PASS** — Product Experience COMPLETE |

| Workshop | Scope                                 | Owner track          | Status                       |
| -------- | ------------------------------------- | -------------------- | ---------------------------- |
| W002     | Operational Workspace                 | PX-01                | **CLOSED**                   |
| W003     | Project Lifecycle                     | (foundation + PX-01) | **CLOSED**                   |
| W004     | Operational Delivery                  | (ops engine + PX-01) | **CLOSED**                   |
| W005     | Portfolio Management                  | PX-02                | **CLOSED**                   |
| W006     | Resource & Team                       | PX-03                | **CLOSED**                   |
| W007     | Communication & Collaboration         | PX-04                | **CLOSED**                   |
| W008     | Reporting & Operational Review        | PX-05                | **CLOSED**                   |
| W009     | Search, Navigation & Productivity     | PX-06                | **CLOSED**                   |
| W010     | Security, Governance & Administration | PX-07 (+ P3)         | **CLOSED**                   |
| W011     | UI System & Screen Catalogue          | Cross-cutting PE     | **CLOSED** (via PX-01–PX-07) |

## Capability acceptance (Owner)

| Capability family                                                                                             | Accepted |
| ------------------------------------------------------------------------------------------------------------- | -------- |
| Operational Workspace / Cockpit                                                                               | Yes      |
| Portfolio Scorecard / Workspace / Timeline                                                                    | Yes      |
| Resource, RACI, Teams                                                                                         | Yes      |
| Collaboration / Timeline / Digests                                                                            | Yes      |
| Reviews / Reports / Snapshots                                                                                 | Yes      |
| Search / Palette / Quick Action / Productivity                                                                | Yes      |
| Admin Profiles / Policies / Hierarchy / Delegation / Compliance / Audit / Retention / Governed Search / Roles | Yes      |

Deferred polish (Hardening, not functional gaps): live evidence loaders, Notice/Announcement editors, UX smoke, Postgres store optimisation where memory fallback used.
