# Architecture documents

Foundation architecture documents (000–029) live at `docs/` root. See [docs/README.md](../README.md) for the full registry.

## Platform Baseline v3.0

| Document                                                                              | Status                                 |
| ------------------------------------------------------------------------------------- | -------------------------------------- |
| [APZHUB Architecture Baseline v1.0](./APZHUB-Architecture-Baseline-v1.0.md)           | **Frozen** — authoritative reference   |
| [APZHUB Platform v5.0](../releases/APZHUB-Platform-v5.0.md)                           | Framework baseline — M1–M7           |
| [APZHUB Platform Core v1.0](../releases/APZHUB-Platform-Core-v1.0.md)                 | **Current Platform Core** — M1–M8 certified |
| [APZHUB Platform Core Reference Architecture](./APZHUB-Platform-Core-Reference-Architecture.md) | **Canonical** — Platform Core architecture |
| [APZHUB Platform Core Capability Reference](./APZHUB-Platform-Core-Capability-Reference.md) | Per-capability catalogue           |
| [APZHUB Platform Design Patterns](./APZHUB-Platform-Design-Patterns.md)               | **Authoritative** — canonical patterns |
| [APZHUB Platform Reference Architecture](./APZHUB-Platform-Reference-Architecture.md) | v5.0 consolidation (superseded for Core by PC-001 doc) |

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
| [platform-roadmap.md](./platform-roadmap.md)                                             | Milestone roadmap (PCS-001 strategy complete)              |

## PCS-001 — Platform Core Strategy (complete)

| Document                                                                                          | Description                   |
| ------------------------------------------------------------------------------------------------- | ----------------------------- |
| [APZHUB Platform Core Strategy](../strategy/APZHUB-Platform-Core-Strategy.md)                       | **Master strategy**           |
| [Strategy documents index](../strategy/README.md)                                                   | PCS-001 deliverables          |
| [PCS-001 Strategy Review](../reviews/PCS-001-Strategy-Review.md)                                    | Strategy assessment           |
| [PCS-001 Completion Report](../sprint/PCS-001-completion-report.md)                                   | PCS-001 closeout              |

## Support product (OSS-110)

| Document | Description |
| --- | --- |
| [Support Module UI](./APZHUB-Support-Module-UI.md) | Workbench UI architecture — **certified** |
| [Support UI Certification](./SUPPORT-UI-CERTIFICATION.md) | OSS-110-14 master — **PRODUCTION_READY_WITH_LIMITATIONS** |
| [Support HTTP API](./APZHUB-Support-HTTP-API.md) | OSS-110-11 `/api/v1/support-*` |
| [Support Platform Service Architecture](./APZHUB-Support-Platform-Service-Architecture.md) | OSS-110-10 domain spine |
| [Support Vertical Certification](./SUPPORT-VERTICAL-CERTIFICATION.md) | OSS-110-12 API master — CERTIFIED_WITH_LIMITATIONS |
| [Support User Guide](../guides/APZHUB-Support-User-Guide.md) | Ops-facing guide |
| [OSS-110-13 Completion Report](../sprint/OSS-110-13-completion-report.md) | UI delivery closeout |
| [OSS-110-14 Completion Report](../sprint/OSS-110-14-completion-report.md) | UI certification closeout |

## Integration SDK (OSS-100)

| Document | Description |
| --- | --- |
| [Platform Integration SDK Architecture](./APZHUB-Platform-Integration-SDK-Architecture.md) | Canonical SDK architecture |
| [Integration SDK Webhook & Polling](./APZHUB-Integration-SDK-Webhook-Polling.md) | OSS-100-08 architecture index |
| [Integration SDK Adapter Harness](./APZHUB-Integration-SDK-Adapter-Harness.md) | OSS-100-09 architecture index |
| [Adapter Harness (package)](../../packages/integration-sdk/docs/ADAPTER-HARNESS.md) | Primary harness guide |
| [Event Envelope (package)](../../packages/integration-sdk/docs/EVENT-ENVELOPE.md) | Primary events guide |
| [Webhook / Polling Migration](../../packages/integration-sdk/docs/WEBHOOK-POLLING-MIGRATION.md) | Plane/Zammad events migration |
| [Integration SDK Mapping Framework](./APZHUB-Integration-SDK-Mapping-Framework.md) | OSS-100-07 architecture index |
| [Mapping Framework (package)](../../packages/integration-sdk/docs/MAPPING-FRAMEWORK.md) | Primary mapping guide |
| [Mapping Profiles](../../packages/integration-sdk/docs/MAPPING-PROFILES.md) | Profiles & directions |
| [Mapping Registry](../../packages/integration-sdk/docs/MAPPING-REGISTRY.md) | Registry & diagnostics |
| [Mapping Transformers](../../packages/integration-sdk/docs/MAPPING-TRANSFORMERS.md) | Transformers & helpers |
| [Mapping Migration](../../packages/integration-sdk/docs/MAPPING-MIGRATION.md) | Plane/Zammad migration |
| [Integration SDK HTTP Transport](./APZHUB-Integration-SDK-HTTP-Transport.md) | OSS-100-06 architecture index |
| [HTTP Transport (package)](../../packages/integration-sdk/docs/HTTP-TRANSPORT.md) | Primary transport guide |
| [Transport Policies](../../packages/integration-sdk/docs/TRANSPORT-POLICIES.md) | Retry, timeout, TLS, … |
| [Transport Pipeline](../../packages/integration-sdk/docs/TRANSPORT-PIPELINE.md) | Request/response pipeline |
| [Transport Diagnostics](../../packages/integration-sdk/docs/TRANSPORT-DIAGNOSTICS.md) | Metrics, logging, diagnostics |
| [Transport Migration](../../packages/integration-sdk/docs/TRANSPORT-MIGRATION.md) | Plane/Zammad migration |
| [Adapter Framework Implementation](./APZHUB-Adapter-Framework-Implementation.md) | OSS-100-05 |
| [OSS-100-09 Completion Report](../sprint/OSS-100-09-completion-report.md) | Harness & Certification closeout |
| [OSS-100-08 Completion Report](../sprint/OSS-100-08-completion-report.md) | Webhook & Polling closeout |
| [OSS-100-07 Completion Report](../sprint/OSS-100-07-completion-report.md) | Mapping Provider Framework closeout |
| [OSS-100-06 Completion Report](../sprint/OSS-100-06-completion-report.md) | Shared HTTP Transport closeout |
| [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md) | Phased SDK backlog |

## APZ TCMS — Testing & Certification (APZTCMS-004 complete — domain services)

| Document | Description |
| -------- | ----------- |
| [APZ TCMS Product Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md) | Product vision |
| [APZ TCMS Reference Architecture](./APZHUB-APZ-TCMS-Reference-Architecture.md) | Layered architecture |
| [APZ TCMS Foundation Architecture](./APZHUB-APZ-TCMS-Foundation-Architecture.md) | Contracts, foundation, manifests (APZTCMS-002+) |
| [APZ TCMS Package Guide](./APZHUB-APZ-TCMS-Package-Guide.md) | `testing-contracts` / `testing-foundation` / `testing-persistence` / `testing-services` |
| [APZ TCMS Service Contracts](./APZHUB-APZ-TCMS-Service-Contracts.md) | Service interface catalogue |
| [APZ TCMS Domain Contracts](./APZHUB-APZ-TCMS-Domain-Contracts.md) | Domain type contracts |
| [APZ TCMS Permission Catalogue](./APZHUB-APZ-TCMS-Permission-Catalogue.md) | Permission keys |
| [APZ TCMS Module Registration Guide](./APZHUB-APZ-TCMS-Module-Registration-Guide.md) | Module manifest registration |
| [APZ TCMS Developer Guide](./APZHUB-APZ-TCMS-Developer-Guide.md) | Developer onboarding |
| [APZ TCMS Manual Testing Domain](./APZHUB-APZ-TCMS-Manual-Testing-Domain.md) | Manual domain aggregates (APZTCMS-004) |
| [APZ TCMS Service Architecture](./APZHUB-APZ-TCMS-Service-Architecture.md) | Domain service layering (APZTCMS-004) |
| [APZ TCMS Lifecycle Guide](./APZHUB-APZ-TCMS-Lifecycle-Guide.md) | Case / execution / approval lifecycles |
| [APZ TCMS State Machines](./APZHUB-APZ-TCMS-State-Machines.md) | Transition tables |
| [APZ TCMS Validation Rules](./APZHUB-APZ-TCMS-Validation-Rules.md) | Domain validation |
| [APZ TCMS Traceability Guide](./APZHUB-APZ-TCMS-Traceability-Guide.md) | Traceability chain |
| [APZ TCMS Persistence Architecture](./APZHUB-APZ-TCMS-Persistence-Architecture.md) | Persistence layering (APZTCMS-003/004) |
| [APZ TCMS Schema Guide](./APZHUB-APZ-TCMS-Schema-Guide.md) | `testing_*` SoR tables |
| [APZ TCMS Repository Guide](./APZHUB-APZ-TCMS-Repository-Guide.md) | Repository contracts & factories |
| [APZ TCMS Authorization Guide](./APZHUB-APZ-TCMS-Authorization-Guide.md) | Persistence permission asserts |
| [APZ TCMS Migration Guide](./APZHUB-APZ-TCMS-Migration-Guide.md) | Drizzle migrations 0016–0019 |
| [APZ TCMS Domain Model](./APZHUB-APZ-TCMS-Domain-Model.md) | Conceptual domain (no DDL) |
| [APZ TCMS Module Catalogue](./APZHUB-APZ-TCMS-Module-Catalogue.md) | Capability breakdown |
| [APZ TCMS UI Architecture](./APZHUB-APZ-TCMS-UI-Architecture.md) | Workbench views |
| [APZ TCMS Integration Strategy](./APZHUB-APZ-TCMS-Integration-Strategy.md) | Cross-product & CI |
| [APZ TCMS Technology Decisions](./APZHUB-APZ-TCMS-Technology-Decisions.md) | Tool evaluation |
| [User Personas](../product/APZHUB-APZ-TCMS-User-Personas.md) | Personas |
| [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md) | Native product decision |
| [APZTCMS Backlog](../backlog/APZTCMS-Backlog.md) | Delivery backlog |
| [APZTCMS Milestone Roadmap](../backlog/APZTCMS-Milestone-Roadmap.md) | Milestone map |
| [APZTCMS-001 Completion Report](../sprint/APZTCMS-001-completion-report.md) | Vision/architecture closeout |
| [APZTCMS-002 Completion Report](../sprint/APZTCMS-002-completion-report.md) | Foundation closeout |
| [APZTCMS-003 Completion Report](../sprint/APZTCMS-003-completion-report.md) | Persistence closeout |
| [APZTCMS-004 Completion Report](../sprint/APZTCMS-004-completion-report.md) | Domain services closeout |

QE predecessor docs are superseded for product identity/delivery — see banners on QE strategy/architecture/backlog.

## PC-001 — Platform Core Certification (complete)

| Document                                                                                          | Description                   |
| ------------------------------------------------------------------------------------------------- | ----------------------------- |
| [APZHUB Platform Core Certification](../reviews/APZHUB-Platform-Core-Certification.md)              | **CERTIFIED WITH OBSERVATIONS** |
| [APZHUB Platform Core Commercial Assessment](../reviews/APZHUB-Platform-Core-Commercial-Assessment.md) | Commercial deployment tiers |
| [APZHUB Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md)                    | PCv2 planned milestones       |
| [PC-001 Completion Report](../sprint/PC-001-completion-report.md)                                   | Certification closeout        |

## PCv2-01 — Production Readiness Planning (complete — no implementation)

| Document                                                                                          | Description                   |
| ------------------------------------------------------------------------------------------------- | ----------------------------- |
| [PCv2-01 Production Readiness Architecture](./PCv2-01-Production-Readiness-Architecture.md)          | Target production architecture |
| [PCv2-01 Sprint Guide](../sprint/PCv2-01-Production-Readiness-Sprint-Guide.md)                     | Sprint execution blueprint    |
| [PCv2-01 Backlog](../backlog/PCv2-01-Backlog.md)                                                   | PRH-001–PRH-018 stories       |
| [PCv2-01 Readiness Review](../reviews/PCv2-01-Readiness-Review.md)                                  | **READY WITH OBSERVATIONS**   |
| [PRH-000 Owner Acceptance](../reviews/PRH-000-Owner-Acceptance.md)                                  | **Approved** — implementation authorised |
| [PRH-000 Implementation Baseline](../reviews/PRH-000-Implementation-Baseline.md)                    | Frozen contractual baseline   |
| [PRH-000 Sprint Baseline](../releases/PRH-000-Sprint-Baseline.md)                                    | DoD and success metrics         |
| [PCv2-01 Planning Completion Report](../sprint/PCv2-01-planning-completion-report.md)             | Planning closeout             |
| [PRH-000 Completion Report](../sprint/PRH-000-completion-report.md)                                 | Governance closeout           |
| [PRH-001 Completion Report](../sprint/PRH-001-completion-report.md)                                 | Bootstrap consolidation — **complete** |
| [Platform Bootstrap Architecture](./APZHUB-Platform-Bootstrap-Architecture.md)                      | Canonical bootstrap (PRH-001) |
| [ADR-0046](../adr/ADR-0046-production-readiness-bootstrap-consolidation.md)                         | Bootstrap consolidation ADR   |

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
