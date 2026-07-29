# Known Limitations Register — Test Execution 1.0.0

| ID   | Limitation                       | Disposition                                                 | Control                                                                                |
| ---- | -------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| L-01 | OpenAPI gap                      | Accept for Release                                          | Internal schemas/client; schedule OpenAPI programme                                    |
| L-02 | EvidenceAccessPort default-allow | **CLOSED** (REM-001 + CERT-002 Owner Acceptance 2026-07-29) | N/A — security issue closed; see FREEZE-002 Known Limitations for L-OP-01 browser hold |
| L-03 | Outbox enqueue-only              | Accept for Release                                          | No consumer dependency on execution outbox                                             |
| L-04 | No Postgres integration tests    | Accept with RA                                              | Deploy verify migrations/RLS; schedule Compose tests                                   |

## GA gate (binding)

Unrestricted General Availability is **no longer blocked by L-02**. It remains **not approved** pending operational browser readiness (authenticated Playwright journeys — L-OP-01).
