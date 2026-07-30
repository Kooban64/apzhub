# Defect Classification — APZQEP-REM-002

## Classification

```text
Workbench defect
```

## Evidence

- Failure mode is shell URL rewind to `/workspace/home`, not missing provenance payload.
- Transport mock returns `Initial capture`; Workbench ProvenanceView renders `event.detail` when mounted.
- Root cause resides in `WorkbenchPage` route-sync effect interaction with `activateViewForRoute`.
- Not a Domain, Application, Security, API contract, or pure Test assertion defect.

## Secondary note

The Playwright test was hardened with an explicit provenance URL assertion and a higher timeout. That is **test hygiene** supporting the Workbench fix, not the primary classification.
