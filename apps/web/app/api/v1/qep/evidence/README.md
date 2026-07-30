# `/api/v1/qep/evidence` — REST transport (APZQEP-ENG-110F)

| Field     | Value                                                          |
| --------- | -------------------------------------------------------------- |
| Programme | **APZQEP-ENG-110F**                                            |
| Status    | **Implemented** — thin Route Handlers → Security → Application |
| Authority | APZQEP-OES-ENG-091A PART-04                                    |
| Package   | `@apzhub/qep-evidence` **0.0.0**                               |

Handlers validate request structure, invoke the secured Application Layer via the platform gateway, and return envelopes. No business rules, storage technology, authentication providers, or event publication are introduced here.

Persistence for this wave uses in-memory Application ports (ADR-0088 — storage technology undecided).
