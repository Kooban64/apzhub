# Version Recommendation — `@apzhub/qep-traceability`

| Field | Value |
| ----- | ----- |
| Package | `@apzhub/qep-traceability` |
| Module | `modules/qep-traceability` |
| Recommended SemVer | **1.0.0** |
| Prior version | **0.3.0** |
| Programme | APZQEP-TRACE-001 |
| Date | 2026-07-26 |

## Recommendation

Promote `@apzhub/qep-traceability` from **0.3.0** to **1.0.0** as the first stable major for the Traceability capability baseline.

## Rationale

1. **Capability complete in authorised scope** — ARCH-007, ENG-030A Parts 1–2, ARCH-008, ENG-030C all Owner-accepted; domain + infrastructure + Workbench delivered.
2. **Stable public contracts** — REST under `/api/v1/qep/traceability/*`, TraceLink aggregate, permissions, and Workbench routes are fit for a frozen baseline.
3. **No breaking redesign accompanying promotion** — 1.0.0 marks certification and freeze, not an API rewrite.
4. **Alignment with REQ-001 pattern** — Requirements certified at **1.0.0** with **PRODUCTION_READY_WITH_LIMITATIONS**; Traceability follows the same class.
5. **Quality gates green** — typecheck PASS; 52 package tests PASS; 65 UI+package PASS; architecture boundaries PASS.

## SemVer policy after promotion (pending Owner Acceptance)

| Line | Meaning |
| ---- | ------- |
| **1.0.0** | Certified Traceability baseline |
| **1.0.x** | Defect fixes only (requires Owner Instruction) |
| **1.1.0+** / **2.0.0** | Not authorised without new Owner Instruction |

## See also

[VERSION-PROMOTION-REPORT.md](./VERSION-PROMOTION-REPORT.md)
