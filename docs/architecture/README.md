# Architecture documents

Foundation architecture documents (000–029) live at `docs/` root. See [docs/README.md](../README.md) for the full registry.

## Platform Baseline v3.0

| Document                                                                              | Status                                 |
| ------------------------------------------------------------------------------------- | -------------------------------------- |
| [APZHUB Architecture Baseline v1.0](./APZHUB-Architecture-Baseline-v1.0.md)           | **Frozen** — authoritative reference   |
| [APZHUB Platform v5.0](../releases/APZHUB-Platform-v5.0.md)                           | **Current baseline** — M1–M7           |
| [APZHUB Platform Design Patterns](./APZHUB-Platform-Design-Patterns.md)               | **Authoritative** — canonical patterns |
| [APZHUB Platform Reference Architecture](./APZHUB-Platform-Reference-Architecture.md) | v5.0 consolidation                     |

Changes to the baseline require an approved ADR.

## Subsystem architecture

| Document                                                                                 | Subsystem                                                  |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [platform-runtime.md](./platform-runtime.md)                                             | Platform Runtime overview                                  |
| [runtime-orchestrator.md](./runtime-orchestrator.md)                                     | Runtime Orchestrator                                       |
| [configuration-manager.md](./configuration-manager.md)                                   | Configuration Manager                                      |
| [capability-registry.md](./capability-registry.md)                                       | Capability Registry                                        |
| [lifecycle-manager.md](./lifecycle-manager.md)                                           | Lifecycle Manager                                          |
| [health-manager.md](./health-manager.md)                                                 | Health Manager                                             |
| [platform-manifest-specification.md](./platform-manifest-specification.md)               | Manifest envelope                                          |
| [workbench-framework.md](./workbench-framework.md)                                       | Workbench Framework                                        |
| [workbench-manager.md](./workbench-manager.md)                                           | Workbench Manager                                          |
| [command-framework.md](./command-framework.md)                                           | Action Framework (M4)                                      |
| [knowledge-discovery-framework.md](./knowledge-discovery-framework.md)                   | Knowledge & Discovery Framework (M5)                       |
| [event-notification-framework.md](./event-notification-framework.md)                     | Event & Notification Framework (M6) — Milestone 6 complete |
| [activity-timeline-framework.md](./activity-timeline-framework.md)                       | Activity & Timeline Framework (M7) — complete              |
| [APZHUB-Platform-Capability-Matrix.md](./APZHUB-Platform-Capability-Matrix.md)           | Cross-framework pattern matrix (Platform 5.0)              |
| [APZHUB-Platform-Reference-Patterns.md](./APZHUB-Platform-Reference-Patterns.md)         | Authoritative platform patterns (v4.0)                     |
| [event-framework.md](./event-framework.md)                                               | Event Framework (M6)                                       |
| [notification-framework.md](./notification-framework.md)                                 | Notification Framework (M6)                                |
| [APZHUB-Platform-Design-Patterns.md](./APZHUB-Platform-Design-Patterns.md)               | Canonical platform patterns (M3.0)                         |
| [APZHUB-Platform-Reference-Architecture.md](./APZHUB-Platform-Reference-Architecture.md) | Platform layer consolidation (v3.0)                        |
| [knowledge-views-model.md](./knowledge-views-model.md)                                   | Registry → Views → Experience layering                     |
| [knowledge-registry-relationship.md](./knowledge-registry-relationship.md)               | Manifest → Knowledge Registry chain                        |
| [knowledge-retrieval-ranking-model.md](./knowledge-retrieval-ranking-model.md)           | Retrieval and ranking model                                |
| [APZHUB-Workbench-Surface-Pattern.md](./APZHUB-Workbench-Surface-Pattern.md)             | Palette, shortcuts, toolbar, context menu pattern          |
| [platform-roadmap.md](./platform-roadmap.md)                                             | Milestone roadmap (M16 complete)                           |

## M16 — Platform Engineering Review (complete)

| Document                                                                                          | Description                   |
| ------------------------------------------------------------------------------------------------- | ----------------------------- |
| [APZHUB-Platform-Engineering-Review.md](../reviews/APZHUB-Platform-Engineering-Review.md)         | Subsystem engineering ratings |
| [APZHUB-Platform-Dependency-Review.md](./APZHUB-Platform-Dependency-Review.md)                    | Package dependency analysis   |
| [APZHUB-Platform-Duplication-Review.md](./APZHUB-Platform-Duplication-Review.md)                  | Duplication and consolidation |
| [APZHUB-Platform-Naming-Review.md](./APZHUB-Platform-Naming-Review.md)                            | Naming standards              |
| [APZHUB-Platform-Security-Review.md](./APZHUB-Platform-Security-Review.md)                        | Security posture              |
| [APZHUB-Platform-Performance-Review.md](./APZHUB-Platform-Performance-Review.md)                  | Performance analysis          |
| [APZHUB-Platform-Testing-Review.md](./APZHUB-Platform-Testing-Review.md)                          | Testing maturity              |
| [APZHUB-Platform-Documentation-Review.md](./APZHUB-Platform-Documentation-Review.md)              | Documentation gaps            |
| [APZHUB-Platform-Technical-Debt-Register.md](./APZHUB-Platform-Technical-Debt-Register.md)        | Consolidated debt register    |
| [APZHUB-Platform-Roadmap-Review.md](./APZHUB-Platform-Roadmap-Review.md)                          | Updated roadmap               |
| [APZHUB-Commercial-Readiness-Assessment.md](../reviews/APZHUB-Commercial-Readiness-Assessment.md) | Commercial readiness          |
| [APZHUB-v6.0-Architecture-Review.md](../reviews/APZHUB-v6.0-Architecture-Review.md)               | **Verdict: VERY GOOD**        |

Migration of foundation docs into this folder is defined in [BUILD-001 Section 13](../build/BUILD-001-repository-bootstrap-guide.md).
