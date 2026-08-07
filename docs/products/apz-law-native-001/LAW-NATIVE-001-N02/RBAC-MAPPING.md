# RBAC Mapping — APZ-LAW-NATIVE-001-N02

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-02             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T192000Z |

## Catalogue

| Key                   | Meaning                                       |
| --------------------- | --------------------------------------------- |
| `law.view`            | Governance-entry identity — enter APZ Law     |
| `law.admin`           | Practice / firm-admin surfaces below boundary |
| `legal.*` / `trust.*` | Legacy practice keys — Law Practice Operator  |

## Role grants (seed)

| Role                   | Law grant                                                                        |
| ---------------------- | -------------------------------------------------------------------------------- |
| Platform Administrator | `*` (unchanged)                                                                  |
| Law Practice Operator  | `legal.*`, `law.*`, `law.admin`, `trust.*`                                       |
| Tenant Member          | **`law.view` only** — no parent Law Operator · no `legal.client` / `legal.trust` |

## Manifests

| Surface                                                                                              | Permission  |
| ---------------------------------------------------------------------------------------------------- | ----------- |
| APZ Law Activity Bar / Dashboard / Search                                                            | `law.view`  |
| Clients · Matters · Documents · Calendar · Tasks · Time · Trust · Billing · Reports · Administration | `law.admin` |

## Identity note

`law.view` no longer implies practice management. Full governance-question chrome remains **N-03**.
