# Operational Readiness — APZQEP-ENG-030C

## Smoke test checklist

| # | Check | Expected |
| --- | --- | --- |
| 1 | Navigate `/workspace/qep/traceability` | Explorer (or auth redirect proving route) |
| 2 | Open Trace Links list | Paginated table; filters present |
| 3 | Open Create | Form renders; submit gated by API |
| 4 | Open Matrix | Presentation grid or list fallback; **no Coverage %** |
| 5 | Open Taxonomy | Catalogue list |
| 6 | Open Detail of known id | Inspector fields + `availableActions`-gated controls |
| 7 | Open History | Domain history (not Platform Audit console) |
| 8 | Attempt Validate/Approve/Retire without action | Control absent or API rejects |
| 9 | Supersede route | Form reachable when permitted |
| 10 | Deep link from search/list | Authoritative detail reload |

## Enablement

- Module `qep-traceability` **0.3.0** registered; package `@apzhub/qep-traceability` **0.3.0**
- Backend ENG-030A Part 2 migrations **0079/0080** applied
- Permissions granted per role as required

## Rollback

- Revert Workbench routes/nav to prior module version; APIs remain Part 2 compatible
- No Coverage/Impact schemas introduced

## Limitations

- Playwright covers route smoke, not full authenticated mutation E2E
- Matrix capped; large-scale virtualisation may deepen later
- Traceability Certification **NOT AUTHORISED**
