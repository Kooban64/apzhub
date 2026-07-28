# Endpoint Resolution

Contract: `TraceEndpointResolver` → `EndpointResolutionFact` (`exists`, `tenantId`, `kind`, `artefactId`, `owningDomain`, availability/immutable flags).

| Adapter | Role |
| ------- | ---- |
| In-memory registry | Tests and pre-registered facts |
| Requirements adapter | Optional lookups for `requirement` / `rcv` / `rbl` |
| Default production | Permissive for future domains not yet implemented (documented limitation) |

Traceability stores **references only** — it does not own endpoint artefacts. Future domains (Verification, Evidence, etc.) plug in via additional resolvers without changing Trace Link SoR.
