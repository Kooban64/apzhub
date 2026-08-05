# RBAC Mapping — APZ-DOCUMENTS-NATIVE-001-N02

| Field     | Value                        |
| --------- | ---------------------------- |
| Slice     | APZ-DOCUMENTS-NATIVE-001-N02 |
| Status    | **COMPLETE**                 |
| Timestamp | 20260805T142500Z             |

## Catalogue additions

| Permission       | Intent                                  |
| ---------------- | --------------------------------------- |
| `document.admin` | Diagnostics / operator surfaces         |
| (existing)       | `document.read` · `document.manage` · … |
| `document.*`     | Wildcard grant for daily product use    |

Registered in `packages/document-contracts` catalogue and platform authorization seeds.

## Role grants

| Role                   | Documents grant          |
| ---------------------- | ------------------------ |
| Platform Administrator | `*` (unchanged)          |
| Tenant Member          | **`document.*`** (added) |

## Operation map

| Operation                            | Permission                                 |
| ------------------------------------ | ------------------------------------------ |
| `documentDiagnostics.getDiagnostics` | **`document.admin`** (was `document.read`) |

## Manifest

| Module                           | Permission           |
| -------------------------------- | -------------------- |
| `platform-documents-diagnostics` | **`document.admin`** |

## Work-first note

Admin-gating Diagnostics keeps operator tooling out of the default work path. It does not redesign attach-to-work; it prevents repository/ops identity from becoming the default user experience.
