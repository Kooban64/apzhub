# APZOBSERVE-005 — Contract Traceability Report

| Concern            | Source of truth                                                | Consumers                                                  |
| ------------------ | -------------------------------------------------------------- | ---------------------------------------------------------- |
| Identifiers        | observe-contracts branded IDs                                  | Core, persistence, HTTP params, typed client               |
| Entity shapes      | observe-contracts domain                                       | Core validation, gateway DTOs, OpenAPI, client view-models |
| Lifecycle / status | ObserveHealthStatus + lifecycle enums                          | Core validators, Workbench StatusBadge                     |
| Severity           | ObserveAlertSeverity                                           | Alert definitions/states, Workbench                        |
| Permissions        | PLATFORM_OBSERVE_PERMISSIONS                                   | Authz map, catalogue tests                                 |
| Errors             | ObserveDomainError → PlatformServiceError → ObserveClientError | HTTP + Workbench                                           |
| Pagination         | list page contracts                                            | HTTP + client                                              |
| Provider refs      | providerKind metadata enum only                                | Never SDK types                                            |

## Guarantees

- Transport fields do not enter Core
- Persistence columns do not leak into HTTP envelopes
- Provider-specific query languages (PromQL/LogQL) are not canonical
- Versions: contracts/core **0.2.0**, persistence **0.1.0**, platform-services **0.24.0**
