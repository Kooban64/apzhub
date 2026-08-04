# CHANGE-MODEL — QO-005

Normalized change inputs only — no provider-specific payloads.

## Supported change kinds

`repository`, `branch`, `commit`, `pull_request`, `tag`, `release`, `changed_files`, `module`, `package`, `service`, `component`, `manual_declaration`, `scheduled_trigger`, `external_trigger`.

## Fields

| Field                                                | Notes                                                     |
| ---------------------------------------------------- | --------------------------------------------------------- |
| changeId, changeKind                                 | Identity + kind                                           |
| tenantId, projectId                                  | Security context                                          |
| triggerId, correlationId, causationId, qualityFlowId | Orchestration identities                                  |
| refs                                                 | Opaque refs (paths, shas, package ids)                    |
| seedAssetIds                                         | Known quality asset seeds                                 |
| magnitude                                            | trivial…massive (optional; inferred from ref/seed counts) |
| metadata                                             | Provider-neutral; product names rejected                  |

Provider adapters normalize outside this package before correlation.
