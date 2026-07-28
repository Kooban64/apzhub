# Known Limitations Register — Test Execution 1.0.0

| ID   | Limitation                       | Disposition                                           | Control                                              |
| ---- | -------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| L-01 | OpenAPI gap                      | Accept for Release                                    | Internal schemas/client; schedule OpenAPI programme  |
| L-02 | EvidenceAccessPort default-allow | Accept with RA — **mandatory before unrestricted GA** | Restrict associate-evidence permissions; pilot only  |
| L-03 | Outbox enqueue-only              | Accept for Release                                    | No consumer dependency on execution outbox           |
| L-04 | No Postgres integration tests    | Accept with RA                                        | Deploy verify migrations/RLS; schedule Compose tests |

## GA gate (binding)

Unrestricted General Availability is **blocked** until L-02 is remediated under a separate Owner engineering authorisation.
