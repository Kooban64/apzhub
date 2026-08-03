# VERSION-1.0-MANIFEST — APZQEP General Availability

| Field                  | Value                                      |
| ---------------------- | ------------------------------------------ |
| Product                | APZQEP                                     |
| Version                | **1.0**                                    |
| Release designation    | **General Production Release**             |
| Resolution             | PBR-APZQEP-1.0-001                         |
| Timestamp              | 20260803T071607Z                           |
| Build basis (docs tip) | `ae6b6422f4d457defe9a51e32f79a905715d6f5c` |
| Last engineering       | `f6c22865` (APZQEP-152)                    |
| Posture                | **GENERAL AVAILABILITY**                   |
| Governance             | 1.0 STABLE                                 |
| Engineering Baseline   | 1.x STABLE (1.2)                           |

Supersedes candidate posture in historical [apzqep-150/VERSION-1.0-MANIFEST.md](../apzqep-150/VERSION-1.0-MANIFEST.md) for **release authority**. Historical candidate manifest remains immutable as audit evidence.

## Package inventory (Core QE + foundation slice)

| Package                                 |   Version | Role                  | Promotion                                    |
| --------------------------------------- | --------: | --------------------- | -------------------------------------------- |
| `@apzhub/qep-suites`                    |     0.1.0 | Cap A                 | Authorised — not executed by this resolution |
| `@apzhub/qep-execution-plans`           |     0.1.0 | Cap B                 | Authorised — not executed                    |
| `@apzhub/qep-execution-workspace`       |     0.1.0 | Cap C                 | Authorised — not executed                    |
| `@apzhub/qep-defects`                   |     0.1.0 | Cap D                 | Authorised — not executed                    |
| `@apzhub/qep-requirements-traceability` |     0.1.0 | Cap E                 | Authorised — not executed                    |
| `@apzhub/qep-reporting`                 |     0.1.0 | Cap F                 | Authorised — not executed                    |
| `@apzhub/qep-evidence`                  |     1.0.0 | Evidence platform     | Released                                     |
| `@apzhub/qep-command`                   |     0.1.0 | Command platform      | —                                            |
| `@apzhub/qep-knowledge-index`           |     0.1.0 | QKI                   | —                                            |
| `@apzhub/qep-notification`              |     0.1.0 | Notification platform | —                                            |
| `@apzhub/web`                           | workspace | Presentation + API    | —                                            |

## Compatibility matrix

| Component | Compatible with                         |
| --------- | --------------------------------------- |
| Caps A–F  | Each other via read ports / handoff     |
| Caps A–F  | Postgres durable SoR (APZQEP-151)       |
| Caps A–F  | Fail-closed Cap RBAC (APZQEP-152)       |
| Caps A–F  | Platform Command / QKI / Notification   |
| Web host  | Platform auth, Postgres metadata, Redis |

## Support matrix

| Posture                                 | Supported                            |
| --------------------------------------- | ------------------------------------ |
| Unrestricted enterprise production (GA) | **Yes**                              |
| Multi-instance Cap SoR (Postgres)       | **Yes**                              |
| External ALM / AI                       | **No** (deferred to future planning) |

## Known limitations (accepted residuals)

See [PRODUCT-BOARD-RESOLUTION.md](./PRODUCT-BOARD-RESOLUTION.md).
