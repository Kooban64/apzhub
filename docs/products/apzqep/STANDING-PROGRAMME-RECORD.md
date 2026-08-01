# Standing Programme Record — APZQEP

| Field          | Value                                                                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document       | Standing Programme Record                                                                                                                                 |
| Date           | 2026-08-01                                                                                                                                                |
| Status         | **IN FORCE — OFFICIAL STANDING STATE**                                                                                                                    |
| Test Execution | `@apzhub/qep-test-execution` **1.0.1**                                                                                                                    |
| REM-002        | **APPROVED AND CLOSED**                                                                                                                                   |
| REM-005        | **APPROVED AND CLOSED** — documentation-only post-release remediation (standing record after RELEASE-004)                                                 |
| FREEZE-003     | **SUPERSEDED FOR RELEASE** (`ce220a5d` / **1.0.0-rc.1**)                                                                                                  |
| FREEZE-004     | **ACCEPTED / PRODUCTION BASELINE FROZEN / CLOSED** · RC **1.0.0-rc.2** @ `4e1b6f01` · **IMMUTABLE**                                                       |
| RELEASE-003    | **STOPPED / REPLACED BY RELEASE-004** — must not resume                                                                                                   |
| RELEASE-004    | [evidence-management/RELEASE-004/](./evidence-management/RELEASE-004/README.md) **CLOSED / COMPLETE** · **1.0.0** · `apzqep-evidence-v1.0.0` → `79d9851f` |

### Default premise

- Production baseline: `@apzhub/qep-evidence` **1.0.0** @ `79d9851f` (from FREEZE-004 RC @ `4e1b6f01`; tag `apzqep-evidence-v1.0.0`).
- RELEASE-004 completed successfully under **LIMITED_AVAILABILITY**. No live production deployment. Unrestricted general availability is not authorised.
- RELEASE-003 must not resume under any circumstances.
- FREEZE-004 remains closed and immutable. RELEASE-004 remains closed and complete.
- B-01 is **not** a current blocker. RELEASE-004 was initially blocked at B-01 due to the configured SSH identity lacking repository access. Owner-authorised HTTPS credentials for the `kooban-apzor` identity were subsequently verified, the Go/No-Go gate passed, and controlled release execution completed.

### REM-005 note

Documentation-only correction of unsubstituted placeholders (`{tag}`, `{promotion}`) and stale B-01 wording in this standing record after RELEASE-004 closure. No engineering, package, tag, deployment, freeze, or release reopen. Evidence: `docs/operations/evidence/portfolio-recert/20260801T065900Z-APZQEP-REM-005.json`.

---

## Current position

```text
APZQEP-REM-002
✅ APPROVED AND CLOSED

APZQEP-FREEZE-003
⛔ SUPERSEDED FOR RELEASE

APZQEP-FREEZE-004
✅ ACCEPTED / PRODUCTION BASELINE FROZEN / CLOSED / IMMUTABLE
RC: 1.0.0-rc.2 @ 4e1b6f01

APZQEP-RELEASE-003
⛔ STOPPED / REPLACED BY RELEASE-004

APZQEP-RELEASE-004
✅ CLOSED / COMPLETE
Package: @apzhub/qep-evidence 1.0.0
Tag: apzqep-evidence-v1.0.0 → 79d9851f
Availability: LIMITED_AVAILABILITY
Live deploy: none
Unrestricted GA: not authorised
Release identity: kooban-apzor (HTTPS)
Historical: initially blocked at B-01 (SSH identity lacked access); B-01 cleared before execution

APZQEP-REM-005
✅ APPROVED AND CLOSED
Documentation-only standing-record remediation
```

---

## Authorised next delivery

**Owner acceptance of LIMITED_AVAILABILITY operational deployment (optional); unrestricted GA requires separate programme.**

---

## STOP

```text
STANDING PROGRAMME RECORD
IN FORCE

FREEZE-004 = CLOSED / IMMUTABLE
RELEASE-004 = CLOSED / COMPLETE (1.0.0 · apzqep-evidence-v1.0.0 → 79d9851f)
REM-005 = CLOSED (docs-only)
AUTHORISED NEXT DELIVERY = OWNER DEPLOYMENT DECISION / FUTURE GA PROGRAMME (NOT OPENED)
```
