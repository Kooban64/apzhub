# Subject Resolution (Endpoint Resolution)

Contract: `VerificationSubjectResolver` → `SubjectResolutionFact` (`exists`, `tenantId`, `kind`, `artefactId`, `owningDomain`, availability/immutable flags).

Verification stores **subject references only** — it does not own subject artefacts.

| Adapter | Role |
| ------- | ---- |
| In-memory registry | Tests and pre-registered facts; default Platform composition until stricter resolvers are wired |
| Requirements adapter | Optional lookups for `requirement` / `requirement_content_version` / `requirement_baseline` |
| Trace Link adapter | Optional lookups for `trace_link` subjects |

## Known limitation

Default production composition uses a permissive in-memory subject resolver so Verification creation is not blocked on every adjacent domain landing. Callers may inject `createRequirementsSubjectResolver` / `createTraceLinkSubjectResolver` (or a composed resolver) once those repositories are in scope. Stricter cross-domain wiring is a documented follow-up (Service Connector / composition-root integration) — not Workbench.
