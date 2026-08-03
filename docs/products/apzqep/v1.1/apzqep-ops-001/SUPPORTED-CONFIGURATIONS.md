# SUPPORTED-CONFIGURATIONS — APZQEP Version 1.0 GA

| Field     | Value                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------- |
| Programme | APZQEP-OPS-001                                                                                 |
| Timestamp | 20260803T072224Z                                                                               |
| Manifest  | [../pbr-apzqep-1.0-001/VERSION-1.0-MANIFEST.md](../pbr-apzqep-1.0-001/VERSION-1.0-MANIFEST.md) |

## Supported

| Configuration                                         | Support |
| ----------------------------------------------------- | ------- |
| Unrestricted enterprise production (GA)               | **Yes** |
| Multi-instance web with Postgres Cap SoR (APZQEP-151) | **Yes** |
| Fail-closed Cap RBAC (APZQEP-152)                     | **Yes** |
| Platform PostgreSQL + Redis + S3-compatible storage   | **Yes** |
| Self-hosted OSS stack (documented deploy path)        | **Yes** |

## Not supported / deferred

| Configuration                              | Support                                                     |
| ------------------------------------------ | ----------------------------------------------------------- |
| External ALM integrations                  | No — future planning                                        |
| AI / intelligence features                 | No — not authorised                                         |
| Cap packages promoted to 1.0.0 in registry | Pending release-governance execution (packages still 0.1.0) |
| In-memory Cap SoR as production SoR        | **No** — superseded by APZQEP-151                           |

## Roles (production security)

| Role            | Cap access (default)      |
| --------------- | ------------------------- |
| `qep-operator`  | Cap read/write per grants |
| `qep-reader`    | Cap read                  |
| `tenant-member` | No Cap grants by default  |

Opt-in auto-assign: `APZQEP_QEP_AUTO_ASSIGN_OPERATOR` (documented; treat as ops config decision).
