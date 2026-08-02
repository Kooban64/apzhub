# VERSION-1.0-MANIFEST — APZQEP

| Field                | Value                                      |
| -------------------- | ------------------------------------------ |
| Product              | APZQEP                                     |
| Version intent       | **1.0 Candidate**                          |
| Candidate id         | `apzqep-1.0-rc.1`                          |
| Build basis commit   | `e453ea4da5981020f0fafd47526a8e25dfd0b9c0` |
| Posture              | LIMITED_AVAILABILITY                       |
| Governance           | 1.0 STABLE                                 |
| Engineering Baseline | 1.x STABLE (1.2)                           |

## Package inventory (Core QE + foundation slice)

| Package                                 |   Version | Role                            |
| --------------------------------------- | --------: | ------------------------------- |
| `@apzhub/qep-suites`                    |     0.1.0 | Cap A                           |
| `@apzhub/qep-execution-plans`           |     0.1.0 | Cap B                           |
| `@apzhub/qep-execution-workspace`       |     0.1.0 | Cap C                           |
| `@apzhub/qep-defects`                   |     0.1.0 | Cap D                           |
| `@apzhub/qep-requirements-traceability` |     0.1.0 | Cap E                           |
| `@apzhub/qep-reporting`                 |     0.1.0 | Cap F                           |
| `@apzhub/qep-evidence`                  |     1.0.0 | Evidence platform               |
| `@apzhub/qep-command`                   |     0.1.0 | Command platform                |
| `@apzhub/qep-knowledge-index`           |     0.1.0 | QKI                             |
| `@apzhub/qep-notification`              |     0.1.0 | Notification platform           |
| `@apzhub/platform-outbox`               |     0.2.0 | Reliable delivery               |
| `@apzhub/platform-processing`           |     0.1.1 | Reliable processing             |
| `@apzhub/platform-event-bus`            |     0.1.0 | Events                          |
| `@apzhub/platform-lifecycle`            |     0.1.0 | Lifecycle                       |
| `@apzhub/web`                           | workspace | Presentation + API gateway host |

## Compatibility matrix

| Component              | Compatible with                                              |
| ---------------------- | ------------------------------------------------------------ |
| Caps A–F               | Each other via read ports / handoff (verified 150-01)        |
| Caps A–F               | Platform Command / QKI / Notification (unit-tested)          |
| Caps A–F               | Evidence by **reference** (bytes owned by Evidence platform) |
| Web host               | Platform auth, Postgres metadata, Redis                      |
| Multi-instance Cap SoR | **Not compatible** under IN-MEMORY                           |

## Support matrix

| Posture                                           | Supported                          |
| ------------------------------------------------- | ---------------------------------- |
| Single-process LIMITED_AVAILABILITY               | **Yes** (with Known Limitations)   |
| Unrestricted multi-instance enterprise production | **No** until RB-001/RB-002 cleared |
| External ALM / AI                                 | **No** (deferred)                  |

## Promotion

Package promotion to 1.0.0 for Caps A–F: **NOT AUTHORISED** in APZQEP-150.
