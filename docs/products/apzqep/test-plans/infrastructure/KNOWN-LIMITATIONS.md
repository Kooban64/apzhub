# Known Limitations — APZQEP-ENG-060B (Owner-accepted)

| Field     | Value                                                       |
| --------- | ----------------------------------------------------------- |
| Programme | APZQEP-ENG-060B                                             |
| Authority | Owner Acceptance 2026-07-27                                 |
| Status    | **RECORDED** — do not invalidate Infrastructure correctness |
| Evidence  | `20260727T194000Z-APZQEP-ENG-060B-ACCEPTANCE.json`          |

## Limitations

| ID   | Limitation                                                                    | Owner classification        | Future treatment                                                      |
| ---- | ----------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------- |
| L-01 | Version comparison (`CompareVersions` / `GET .../compare`) not implemented    | Deferred capability         | New ENG programme if required                                         |
| L-02 | Dedicated `GET .../items` not provided; items available on plan GET DTO       | Approved variance           | API evolution under new programme if required                         |
| L-03 | Package line coverage below aspirational OES % objectives (ECR: 77.07% lines) | Accepted with justification | No artificial test expansion; revisit only if behavioural gaps appear |

## Explicitly not limitations (correct absences)

- Soft-delete / unarchive (OES v1 forbids)
- Workbench / UI (out of programme)
- Domain behaviour changes (forbidden)
- Capability Freeze / 1.0.0 (separate gates)

## C-03 note

Discrete lifecycle `POST` action paths (vs `/actions/{action}`) are **Accepted** as Specs-aligned variance and are **not** listed as an open limitation requiring future work.
