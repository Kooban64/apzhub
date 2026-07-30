# Standing Programme Record — APZQEP

| Field          | Value                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Document       | Standing Programme Record                                                                                          |
| Date           | 2026-07-30                                                                                                         |
| Status         | **IN FORCE — OFFICIAL STANDING STATE**                                                                             |
| Test Execution | `@apzhub/qep-test-execution` **1.0.1**                                                                             |
| REM-002        | **APPROVED AND CLOSED**                                                                                            |
| FREEZE-003     | **SUPERSEDED FOR RELEASE** (`ce220a5d` / **1.0.0-rc.1**)                                                           |
| FREEZE-004     | **ACCEPTED / PRODUCTION BASELINE FROZEN / CLOSED** · RC **1.0.0-rc.2** @ `4e1b6f01`                                |
| RELEASE-003    | **STOPPED / REPLACED BY RELEASE-004** — must not resume                                                            |
| RELEASE-004    | [evidence-management/RELEASE-004/](./evidence-management/RELEASE-004/README.md) **BLOCKED** · **B-01** push access |

### Default premise

- Frozen baseline for release: FREEZE-004 / **1.0.0-rc.2** @ `4e1b6f01cc5950eab03e21ed595e9afe8b27f8c5`.
- RELEASE-004 is the only authorised production release programme for Evidence Management.
- RELEASE-003 must not resume under any circumstances.
- B-01 push access remains the operational release blocker.

---

## Current position

```text
APZQEP-REM-002
✅ APPROVED AND CLOSED

APZQEP-FREEZE-003
⛔ SUPERSEDED FOR RELEASE

APZQEP-FREEZE-004
✅ ACCEPTED / PRODUCTION BASELINE FROZEN / CLOSED
RC: 1.0.0-rc.2 @ 4e1b6f01

APZQEP-RELEASE-003
⛔ STOPPED / REPLACED BY RELEASE-004

APZQEP-RELEASE-004
⛔ BLOCKED — B-01 PUSH ACCESS
SOURCE: 4e1b6f01
```

---

## Authorised next delivery

**Owner restoration of repository push access, then resumption of APZQEP-RELEASE-004 from `4e1b6f01` only.**

---

## STOP

```text
STANDING PROGRAMME RECORD
IN FORCE

FREEZE-004 = CLOSED
RELEASE-004 = BLOCKED (B-01)
AUTHORISED NEXT DELIVERY = RESTORE PUSH ACCESS THEN RESUME RELEASE-004
```
