# APZQEP-RELEASE-003 — Evidence Management Limited Availability Production Release

> **Status:** **BLOCKED / AWAITING OWNER RELEASE REMEDIATION DECISION**  
> **Capability:** Evidence Management  
> **Type:** Production Release (operational — no feature engineering)  
> **Candidate:** `@apzhub/qep-evidence` **1.0.0-rc.1** · commit `ce220a5d3cac706896299797bb56695037f85621`  
> **Target:** `@apzhub/qep-evidence` **1.0.0** — **NOT PROMOTED** (release stopped)  
> **Freeze:** [../FREEZE-003/](../FREEZE-003/README.md) — **CLOSED**  
> **Evidence:** `docs/operations/evidence/portfolio-recert/20260730T173500Z-APZQEP-RELEASE-003-BLOCKED.json`

## Blockers

| ID   | Blocker                                                                                                         | Classification             |
| ---- | --------------------------------------------------------------------------------------------------------------- | -------------------------- |
| B-01 | Remote push to `origin` failed — no authorised credentials for `kooban-apzor/apz-portal`                        | Repository synchronisation |
| B-02 | Playwright Evidence Workbench suite **6/7** — provenance timeline journey fails (`Initial capture` not visible) | Release validation         |

## Pack

| Document                                                                     | Role                                 |
| ---------------------------------------------------------------------------- | ------------------------------------ |
| [OWNER-SUMMARY.md](./OWNER-SUMMARY.md)                                       | Owner decision surface               |
| [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                                 | Placeholder (pending remediation)    |
| [RELEASE-COMPLETION-REPORT.md](./RELEASE-COMPLETION-REPORT.md)               | Completion / blocked report          |
| [REPOSITORY-INTEGRITY-REPORT.md](./REPOSITORY-INTEGRITY-REPORT.md)           | Pre-release repo state               |
| [REMOTE-SYNCHRONISATION-REPORT.md](./REMOTE-SYNCHRONISATION-REPORT.md)       | Push / auth failure                  |
| [VERSION-PROMOTION-REPORT.md](./VERSION-PROMOTION-REPORT.md)                 | Promotion not applied                |
| [TAG-VERIFICATION-REPORT.md](./TAG-VERIFICATION-REPORT.md)                   | Tag not created                      |
| [VALIDATION-REPORT.md](./VALIDATION-REPORT.md)                               | Suite results                        |
| [PLAYWRIGHT-RELEASE-REPORT.md](./PLAYWRIGHT-RELEASE-REPORT.md)               | Playwright failure detail            |
| [TEST-EXECUTION-REGRESSION-REPORT.md](./TEST-EXECUTION-REGRESSION-REPORT.md) | TE 1.0.1                             |
| [SECURITY-RELEASE-VERIFICATION.md](./SECURITY-RELEASE-VERIFICATION.md)       | Security posture check               |
| [KNOWN-LIMITATIONS-REGISTER.md](./KNOWN-LIMITATIONS-REGISTER.md)             | Accepted limitations                 |
| [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md)                   | Compatibility                        |
| [DEPLOYMENT-GUIDANCE.md](./DEPLOYMENT-GUIDANCE.md)                           | LA constraints (draft; not released) |
| [ROLLBACK-GUIDANCE.md](./ROLLBACK-GUIDANCE.md)                               | Rollback (no tag moved)              |

## STOP

```text
APZQEP-RELEASE-003
BLOCKED
AWAITING OWNER RELEASE REMEDIATION DECISION
NO 1.0.0 PROMOTION
NO RELEASE TAG
NO PRODUCTION DEPLOY
```
