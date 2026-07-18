# APZHUB Platform Search — Provider Registry Guide

> **Milestone:** APZSEARCH-002 · Package `@apzhub/search-persistence`

## Operations

| Operation                                   | Permission                               | Notes                                                                               |
| ------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| `register`                                  | `search.provider`                        | Duplicate prevention; validates configuration; writes registration + status UNKNOWN |
| `unregister`                                | `search.provider`                        | Soft-delete provider; status UNAVAILABLE                                            |
| `listProviders` / `getProvider`             | `search.provider`                        | Metadata only                                                                       |
| `setActiveProvider` / `getActiveProviderId` | `search.provider`                        | Single active provider per tenant scope                                             |
| Diagnostics / health / configuration        | `search.diagnostics` / `search.provider` | Safe payloads; refs only                                                            |

## Lifecycle contract

`ManagedSearchProvider`: initialise · validateConfiguration · validateQuery · getHealth · getCapabilities · getDiagnostics · dispose

`createStubManagedSearchProvider` exercises lifecycle without any engine.

## Status states

`AVAILABLE` · `DEGRADED` · `UNAVAILABLE` · `UNKNOWN`

No live engine probing beyond the provider contract.

## No execution

`executeQuery` remains forbidden in this milestone.
