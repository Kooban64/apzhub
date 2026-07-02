# Architecture documents

Foundation architecture documents (000–029) live at `docs/` root. See [docs/README.md](../README.md) for the full registry.

## Platform Baseline v1.0

| Document                                                                    | Status                               |
| --------------------------------------------------------------------------- | ------------------------------------ |
| [APZHUB Architecture Baseline v1.0](./APZHUB-Architecture-Baseline-v1.0.md) | **Frozen** — authoritative reference |

Changes to the baseline require an approved ADR.

## Subsystem architecture

| Document                                                                     | Subsystem                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------- |
| [platform-runtime.md](./platform-runtime.md)                                 | Platform Runtime overview                         |
| [runtime-orchestrator.md](./runtime-orchestrator.md)                         | Runtime Orchestrator                              |
| [configuration-manager.md](./configuration-manager.md)                       | Configuration Manager                             |
| [capability-registry.md](./capability-registry.md)                           | Capability Registry                               |
| [lifecycle-manager.md](./lifecycle-manager.md)                               | Lifecycle Manager                                 |
| [health-manager.md](./health-manager.md)                                     | Health Manager                                    |
| [platform-manifest-specification.md](./platform-manifest-specification.md)   | Manifest envelope                                 |
| [workbench-framework.md](./workbench-framework.md)                           | Workbench Framework                               |
| [workbench-manager.md](./workbench-manager.md)                               | Workbench Manager                                 |
| [command-framework.md](./command-framework.md)                               | Action Framework (M4)                             |
| [APZHUB-Workbench-Surface-Pattern.md](./APZHUB-Workbench-Surface-Pattern.md) | Palette, shortcuts, toolbar, context menu pattern |
| [platform-roadmap.md](./platform-roadmap.md)                                 | Milestone roadmap                                 |

Migration of foundation docs into this folder is defined in [BUILD-001 Section 13](../build/BUILD-001-repository-bootstrap-guide.md).
