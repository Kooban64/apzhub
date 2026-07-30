# APZQEP-RELEASE-004 — Evidence Management Limited Availability Production Release

> **Status:** **BLOCKED / AWAITING OWNER REPOSITORY PUSH ACCESS RESTORATION**  
> **Capability:** Evidence Management  
> **Type:** Production Release (operational — no feature engineering)  
> **Candidate:** `@apzhub/qep-evidence` **1.0.0-rc.2** · commit `4e1b6f01cc5950eab03e21ed595e9afe8b27f8c5`  
> **Target:** `@apzhub/qep-evidence` **1.0.0** — **NOT PROMOTED** (release stopped at preconditions)  
> **Freeze:** [../FREEZE-004/](../FREEZE-004/README.md) — **CLOSED**  
> **Replaces:** [../RELEASE-003/](../RELEASE-003/README.md) — **MUST NOT RESUME**  
> **Evidence:** `docs/operations/evidence/portfolio-recert/20260730T191000Z-APZQEP-RELEASE-004-BLOCKED.json`

## Specification basis

Reuses the approved **RELEASE-003** specification in its entirety with substitutions only:

| Replace     | With                                     |
| ----------- | ---------------------------------------- |
| RELEASE-003 | RELEASE-004                              |
| FREEZE-003  | FREEZE-004                               |
| 1.0.0-rc.1  | 1.0.0-rc.2                               |
| ce220a5d    | 4e1b6f01cc5950eab03e21ed595e9afe8b27f8c5 |

No other process changes are authorised.

## Release preconditions (verified 2026-07-30)

| #   | Precondition                                                         | Result                                |
| --- | -------------------------------------------------------------------- | ------------------------------------- |
| 1   | Repository push access restored                                      | **FAIL**                              |
| 2   | Candidate `4e1b6f01` present on authorised remote                    | **FAIL**                              |
| 3   | Repository state matches frozen candidate                            | Local OK · remote unreachable         |
| 4   | No unauthorised Evidence Management product commits after FREEZE-004 | **PASS** (docs stamp `d0da96e8` only) |

## Blockers

| ID   | Blocker                                                                                  | Classification                          |
| ---- | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| B-01 | Remote push/fetch to `origin` failed — no authorised access to `kooban-apzor/apz-portal` | Operational (not an engineering defect) |

B-02 from RELEASE-003 is closed via REM-002 and is **not** a RELEASE-004 blocker.

## Pack

| Document                                                               | Role                                     |
| ---------------------------------------------------------------------- | ---------------------------------------- |
| [OWNER-SUMMARY.md](./OWNER-SUMMARY.md)                                 | Owner decision surface                   |
| [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                           | Placeholder (pending successful release) |
| [RELEASE-COMPLETION-REPORT.md](./RELEASE-COMPLETION-REPORT.md)         | Completion / blocked report              |
| [REPOSITORY-INTEGRITY-REPORT.md](./REPOSITORY-INTEGRITY-REPORT.md)     | Pre-release repo state                   |
| [REMOTE-SYNCHRONISATION-REPORT.md](./REMOTE-SYNCHRONISATION-REPORT.md) | Push / auth failure                      |
| [VERSION-PROMOTION-REPORT.md](./VERSION-PROMOTION-REPORT.md)           | Promotion not applied                    |
| [TAG-VERIFICATION-REPORT.md](./TAG-VERIFICATION-REPORT.md)             | Tag not created                          |
| [KNOWN-LIMITATIONS-REGISTER.md](./KNOWN-LIMITATIONS-REGISTER.md)       | Accepted CERT-003 limitations            |

Full validation / deployment / rollback artefacts from the RELEASE-003 template remain deferred until B-01 is cleared and release execution resumes from `4e1b6f01` only.

## STOP

```text
APZQEP-RELEASE-004
BLOCKED
AWAITING OWNER REPOSITORY PUSH ACCESS RESTORATION
NO 1.0.0 PROMOTION
NO RELEASE TAG
NO PRODUCTION DEPLOY
SOURCE REMAINS 4e1b6f01
```
