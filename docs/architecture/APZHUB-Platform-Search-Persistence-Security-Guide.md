# APZHUB Platform Search — Persistence Security Guide

> **Milestone:** APZSEARCH-002

## Controls

| Control            | Mechanism                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Tenant             | Context + RLS `app.tenant_id` + repository filters                                                               |
| Organisation       | Context match when both set                                                                                      |
| Permissions        | `search.provider` / `search.configuration` / `search.diagnostics` / `search.audit` / `search.query` / `search.*` |
| Provider ownership | Tenant-scoped provider records; no cross-tenant register                                                         |
| Secrets            | Refs only; diagnostics never include credential values                                                           |
| No bypass          | Registry and services assert permissions; providers cannot skip platform authz                                   |

## Authorization

No allow-all. Missing permissions throw `SearchAuthorizationError`.

## Diagnostics safety

`isSafeSearchDiagnosticsPayload` blocks credential-like keys. Registry diagnostics expose booleans such as `authRefsPresent`, not secret values.
