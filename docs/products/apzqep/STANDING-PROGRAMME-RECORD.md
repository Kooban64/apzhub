# Standing Programme Record — APZQEP

| Field          | Value                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document       | Standing Programme Record                                                                                                                                                        |
| Date           | 2026-08-01                                                                                                                                                                       |
| Status         | **IN FORCE — OFFICIAL STANDING STATE**                                                                                                                                           |
| Product state  | **APZQEP v1.0 — Lifecycle Complete · Maintained Product · LIMITED_AVAILABILITY**                                                                                                 |
| Test Execution | `@apzhub/qep-test-execution` **1.0.1**                                                                                                                                           |
| Evidence Mgmt  | `@apzhub/qep-evidence` **1.0.0** · tag `apzqep-evidence-v1.0.0` → `79d9851f`                                                                                                     |
| REM-002        | **APPROVED AND CLOSED**                                                                                                                                                          |
| REM-005        | **APPROVED AND CLOSED** — documentation-only post-release remediation                                                                                                            |
| FREEZE-003     | **SUPERSEDED FOR RELEASE** (`ce220a5d` / **1.0.0-rc.1**)                                                                                                                         |
| FREEZE-004     | **ACCEPTED / PRODUCTION BASELINE FROZEN / CLOSED** · RC **1.0.0-rc.2** @ `4e1b6f01` · **IMMUTABLE**                                                                              |
| RELEASE-003    | **STOPPED / REPLACED BY RELEASE-004** — must not resume                                                                                                                          |
| RELEASE-004    | [evidence-management/RELEASE-004/](./evidence-management/RELEASE-004/README.md) **CLOSED / COMPLETE** · **1.0.0** · `apzqep-evidence-v1.0.0` → `79d9851f`                        |
| CLOSE-001      | **CLOSED** — [APZQEP-PROGRAMME-CLOSURE-REPORT.md](./APZQEP-PROGRAMME-CLOSURE-REPORT.md) · Archive [APZQEP-V1-PROGRAMME-ARCHIVE-INDEX.md](./APZQEP-V1-PROGRAMME-ARCHIVE-INDEX.md) |
| APZQEP-110     | **APPROVED** — [v1.1 Product Planning](./v1.1/README.md)                                                                                                                         |
| APZQEP-111     | **APPROVED** — [v1.1 Solution Architecture](./v1.1/EXECUTIVE-ARCHITECTURE-SUMMARY.md)                                                                                            |
| APZQEP-120     | **IN PROGRESS** — planning complete; **S01 COMPLETE** — [apzqep-120/](./v1.1/apzqep-120/README.md) · [S01 notes](./v1.1/apzqep-120/S01-ENGINEERING-NOTES.md)                     |

### Default premise

- Production baseline: `@apzhub/qep-evidence` **1.0.0** @ `79d9851f` (from FREEZE-004 RC @ `4e1b6f01`; tag `apzqep-evidence-v1.0.0`).
- RELEASE-004 completed successfully under **LIMITED_AVAILABILITY**. No live production deployment. Unrestricted general availability is not authorised.
- FREEZE-004 remains closed and immutable. RELEASE-004 remains closed and complete. REM-005 remains closed.
- **APZQEP-CLOSE-001** closed the APZQEP v1.0 programme and returned the product to the APZHUB portfolio.
- B-01 is historical only (cleared before RELEASE-004 execution via authorised `kooban-apzor` HTTPS credentials).
- Future cross-cutting governance belongs under **APZHUB Governance**.
- **APZQEP-110** and **APZQEP-111** are approved. **APZQEP-120** is in progress under per-slice Owner authority. **APZQEP-120-S01** (Evidence list/search ACL / L-EM-01) is **COMPLETE**.

### REM-005 note

Documentation-only correction of unsubstituted placeholders (`{tag}`, `{promotion}`) and stale B-01 wording after RELEASE-004 closure. Evidence: `docs/operations/evidence/portfolio-recert/20260801T065900Z-APZQEP-REM-005.json`.

---

## Current position

```text
APZQEP v1.0
✅ LIFECYCLE COMPLETE
✅ ENGINEERING COMPLETE
✅ CERTIFIED
✅ RELEASED
✅ MAINTAINED PRODUCT
Availability: LIMITED_AVAILABILITY

APZQEP-FREEZE-004
✅ CLOSED / IMMUTABLE
RC: 1.0.0-rc.2 @ 4e1b6f01

APZQEP-RELEASE-004
✅ CLOSED / COMPLETE
Package: @apzhub/qep-evidence 1.0.0
Tag: apzqep-evidence-v1.0.0 → 79d9851f

APZQEP-REM-005
✅ CLOSED

APZQEP-CLOSE-001
✅ CLOSED

APZQEP-110
✅ APPROVED

APZQEP-111
✅ APPROVED

APZQEP-120
✅ PLANNING COMPLETE
🔄 IN PROGRESS (per-slice)
✅ APZQEP-120-S01 COMPLETE (L-EM-01 CLOSED)
Next slice: APZQEP-120-S02 (requires Owner instruction)
```

---

## Authorised next delivery

**APZQEP-120-S02** (TE EvidenceAccessPort → Evidence ACL) — only after a separate Owner slice instruction. Cross-cutting standards → APZHUB Governance.

---

## STOP

```text
STANDING PROGRAMME RECORD
IN FORCE

APZQEP v1.0 = LIFECYCLE COMPLETE / MAINTAINED PRODUCT
FREEZE-004 = CLOSED / IMMUTABLE
RELEASE-004 = CLOSED / COMPLETE (1.0.0 · apzqep-evidence-v1.0.0 → 79d9851f)
REM-005 = CLOSED
CLOSE-001 = CLOSED
APZQEP-110 = APPROVED
APZQEP-111 = APPROVED
APZQEP-120 = IN PROGRESS
APZQEP-120-S01 = COMPLETE (L-EM-01 CLOSED)
NEXT = OWNER DIRECTIVE FOR APZQEP-120-S02
```
