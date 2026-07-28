# APZHUB ADR Catalogue

> **Purpose:** Categorised index of all Architecture Decision Records  
> **Audience:** Architects, reviewers, AI agents  
> **Authoritative references:** [docs/adr/README.md](../adr/README.md) · Individual ADR files  
> **Related documents:** [DECISION-REGISTER](./DECISION-REGISTER.md)  
> **Reading order:** When researching past decisions or drafting new ADRs  
> **Last updated:** 2026-07-28  
> **Current status:** Active — cross-reference index; **86** ADR numbers allocated · ADR-0070–0072 under `docs/architecture/adr/`; ADR-0073 pack under `docs/architecture/adr-0073/`; ADR-0074–0086 under `docs/adr/`

---

## ADR numbering

| Range         | Category                                                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ADR-0001–0007 | Core platform architecture                                                                                                                                                                 |
| ADR-0008–0018 | Platform packages and runtime                                                                                                                                                              |
| ADR-0009–0017 | Registry and manifests                                                                                                                                                                     |
| ADR-0019–0023 | Workbench framework                                                                                                                                                                        |
| ADR-0024–0026 | Command / Action framework                                                                                                                                                                 |
| ADR-0027–0029 | Knowledge & Discovery                                                                                                                                                                      |
| ADR-0030–0032 | Event & Notification                                                                                                                                                                       |
| ADR-0033–0035 | Activity & Timeline                                                                                                                                                                        |
| ADR-0036–0039 | Trust Accounting (Law)                                                                                                                                                                     |
| ADR-0040–0045 | Platform Core M8                                                                                                                                                                           |
| ADR-0046      | Production readiness (PCv2-01)                                                                                                                                                             |
| ADR-0047      | OSS integration (Projects/Plane)                                                                                                                                                           |
| ADR-0048      | APZHUB global entity ID strategy                                                                                                                                                           |
| ADR-0049      | Persistent entity mapping store (PostgreSQL)                                                                                                                                               |
| ADR-0050      | Production authorisation & policy enforcement                                                                                                                                              |
| ADR-0051      | Platform HTTP API surface (v1)                                                                                                                                                             |
| ADR-0052–0056 | Integration SDK webhook & polling (OSS-100-08)                                                                                                                                             |
| ADR-0057      | SDK harness vs adapter operations certification (OSS-100-09)                                                                                                                               |
| ADR-0058      | Integration SDK v1.0 readiness & limitations (OSS-100-10)                                                                                                                                  |
| ADR-0059      | APZ TCMS native product architecture (APZTCMS-001)                                                                                                                                         |
| ADR-0060–0064 | Search platform / publication / HTTP (APZSEARCH)                                                                                                                                           |
| ADR-0065      | Integration SDK v1.0.0 Architecture Freeze (OSS-100-11)                                                                                                                                    |
| ADR-0066      | Analytics Platform boundaries vs Observe / Metrics / Reporting                                                                                                                             |
| ADR-0067      | Metabase as Analytics provider · future provider abstraction                                                                                                                               |
| ADR-0068      | Workflow Platform as first-class platform capability                                                                                                                                       |
| ADR-0069      | n8n as primary Workflow Engine provider · multi-provider abstraction                                                                                                                       |
| ADR-0070      | Observe live alert evaluation & delivery plane (**ACCEPTED** — Platform-1.3-ADR-0070 / ENG-002) · [full](../architecture/adr/ADR-0070-Observe-Live-Alert-Evaluation-and-Delivery.md)       |
| ADR-0071      | Notification Delivery Providers and Routing ≠ Email SoR (**ACCEPTED** — ENG-004 Phase A implemented) · [full](../architecture/adr/ADR-0071-Notification-Delivery-Providers-and-Routing.md) |
| ADR-0072      | Platform realtime transport SSE Phase A (**ACCEPTED** — Platform-1.3-ADR-0072 / ENG-003) · [full](../architecture/adr/ADR-0072-Platform-Realtime-Transport.md)                             |
| ADR-0073      | Durable Notification Runtime PostgreSQL-owned (**ACCEPTED** — Platform-1.4-ADR-0073) · [pack](../architecture/adr-0073/ADR-0073.md)                                                        |
| ADR-0074      | QEP Test Specification Rejected → Draft vs `availableActions` fidelity (**ACCEPTED**) · [ADR-0074](../adr/ADR-0074-qep-test-specification-rejected-return-to-draft-available-actions.md)   |
| ADR-0075      | Test Execution Aggregate Root (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0075](../adr/ADR-0075-test-execution-aggregate.md)                                                                   |
| ADR-0076      | Execution Manifest Source Integrity (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0076](../adr/ADR-0076-test-execution-manifest-source-integrity.md)                                             |
| ADR-0077      | Test Execution vs Test Runs Boundary (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0077](../adr/ADR-0077-test-execution-vs-test-runs-boundary.md)                                                |
| ADR-0078      | Test Execution Outcome Model (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0078](../adr/ADR-0078-test-execution-outcome-model.md)                                                                |
| ADR-0079      | Manual and Automated Execution Unification (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0079](../adr/ADR-0079-test-execution-manual-automated-unification.md)                                   |
| ADR-0080      | Evidence Ownership Boundary (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0080](../adr/ADR-0080-test-execution-evidence-boundary.md)                                                             |
| ADR-0081      | Observations vs Defects Boundary (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0081](../adr/ADR-0081-test-execution-observation-defect-boundary.md)                                              |
| ADR-0082      | Review and Finalisation Model (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0082](../adr/ADR-0082-test-execution-review-finalisation.md)                                                         |
| ADR-0083      | availableActions Derivation and Transport (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0083](../adr/ADR-0083-test-execution-available-actions.md)                                               |
| ADR-0084      | External Result Ingestion Trust Boundary (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0084](../adr/ADR-0084-test-execution-external-ingestion-trust.md)                                         |
| ADR-0085      | Historical Correction and Supersession (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0085](../adr/ADR-0085-test-execution-correction-supersession.md)                                            |
| ADR-0086      | AI Assistance Boundary (**ACCEPTED** — APZQEP-ARCH-015) · [ADR-0086](../adr/ADR-0086-test-execution-ai-assistance-boundary.md)                                                             |

Legacy sprint ADRs: [docs/decisions/](../decisions/) — includes APZDOCS-002 document storage ADRs:

| Decision                     | Path                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Immutable content versions   | [ADR-document-immutable-content-versions](../decisions/ADR-document-immutable-content-versions.md)                       |
| Metadata/storage TX boundary | [ADR-document-metadata-storage-transaction-boundary](../decisions/ADR-document-metadata-storage-transaction-boundary.md) |
| Checksum authority           | [ADR-document-checksum-authority](../decisions/ADR-document-checksum-authority.md)                                       |
| Storage provider selection   | [ADR-document-storage-provider-selection](../decisions/ADR-document-storage-provider-selection.md)                       |
| Reconciliation model         | [ADR-document-reconciliation-model](../decisions/ADR-document-reconciliation-model.md)                                   |

---

## By category

### Infrastructure & tooling

| ADR                                                          | Title                             | Status   |
| ------------------------------------------------------------ | --------------------------------- | -------- |
| [0001](../adr/ADR-0001-monorepo-strategy.md)                 | Monorepo Strategy                 | Accepted |
| [0002](../adr/ADR-0002-drizzle-orm-selection.md)             | Drizzle ORM Selection             | Accepted |
| [0003](../adr/ADR-0003-better-auth-session-validation.md)    | Better Auth Session Validation    | Accepted |
| [0017](../adr/ADR-0017-phased-implementation-review-gate.md) | Phased Implementation Review Gate | Accepted |

### Platform architecture

| ADR                                                             | Title                                | Status            |
| --------------------------------------------------------------- | ------------------------------------ | ----------------- |
| [0004](../adr/ADR-0004-platform-registry-first-architecture.md) | Platform Registry First Architecture | Accepted          |
| [0005](../adr/ADR-0005-integration-sdk-strategy.md)             | Integration SDK Strategy             | Accepted          |
| [0006](../adr/ADR-0006-platform-service-architecture.md)        | Platform Service Architecture        | Accepted          |
| [0007](../adr/ADR-0007-event-driven-communication.md)           | Event Driven Communication           | Accepted          |
| [0008](../adr/ADR-0008-platform-core-package.md)                | Platform Core Package                | Superseded → 0018 |
| [0018](../adr/ADR-0018-platform-runtime-package.md)             | Platform Runtime Package             | Accepted          |

### Registry & discovery

| ADR                                                                | Title                                   | Status   |
| ------------------------------------------------------------------ | --------------------------------------- | -------- |
| [0009](../adr/ADR-0009-registry-hybrid-persistence.md)             | Registry Hybrid Persistence             | Accepted |
| [0010](../adr/ADR-0010-registry-internal-typescript-api.md)        | Registry Internal TypeScript API        | Accepted |
| [0011](../adr/ADR-0011-unified-manifest-envelope.md)               | Unified Manifest Envelope               | Accepted |
| [0012](../adr/ADR-0012-theme-manifest-registration.md)             | Theme Manifest Registration             | Accepted |
| [0013](../adr/ADR-0013-registry-fail-fast-policy.md)               | Registry Fail-Fast Policy               | Accepted |
| [0014](../adr/ADR-0014-registry-bootstrap-lifecycle.md)            | Registry Bootstrap Lifecycle            | Accepted |
| [0015](../adr/ADR-0015-registry-boundaries-and-discovery-scope.md) | Registry Boundaries and Discovery Scope | Accepted |
| [0016](../adr/ADR-0016-registry-testing-requirements.md)           | Registry Testing Requirements           | Accepted |

### Workbench

| ADR                                                      | Title                         | Status   |
| -------------------------------------------------------- | ----------------------------- | -------- |
| [0019](../adr/ADR-0019-workbench-framework-package.md)   | Workbench Framework Package   | Accepted |
| [0020](../adr/ADR-0020-workbench-request-transport.md)   | Workbench Request Transport   | Accepted |
| [0021](../adr/ADR-0021-workbench-session-persistence.md) | Workbench Session Persistence | Accepted |
| [0022](../adr/ADR-0022-navigation-manifest-extension.md) | Navigation Manifest Extension | Accepted |
| [0023](../adr/ADR-0023-workbench-permission-adapter.md)  | Workbench Permission Adapter  | Accepted |

### Action / Command framework

| ADR                                                    | Title                                 | Status   |
| ------------------------------------------------------ | ------------------------------------- | -------- |
| [0024](../adr/ADR-0024-command-framework-package.md)   | Command Framework Package             | Accepted |
| [0025](../adr/ADR-0025-workbench-commands-manifest.md) | Workbench Commands Manifest Extension | Accepted |
| [0026](../adr/ADR-0026-command-execution-model.md)     | Command Execution and Actor Model     | Accepted |

### Knowledge & Discovery

| ADR                                                              | Title                                   | Status   |
| ---------------------------------------------------------------- | --------------------------------------- | -------- |
| [0027](../adr/ADR-0027-knowledge-discovery-framework-package.md) | Knowledge & Discovery Framework Package | Accepted |
| [0028](../adr/ADR-0028-knowledge-source-model.md)                | Knowledge Source Model and Taxonomy     | Accepted |
| [0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md) | Knowledge Discovery Execution Routing   | Accepted |

### Event & Notification

| ADR                                                             | Title                                     | Status   |
| --------------------------------------------------------------- | ----------------------------------------- | -------- |
| [0030](../adr/ADR-0030-event-notification-framework-package.md) | Event & Notification Framework Package    | Accepted |
| [0031](../adr/ADR-0031-event-registry-and-bus.md)               | Event Registry and In-Process Event Bus   | Accepted |
| [0032](../adr/ADR-0032-notification-routing-model.md)           | Notification Routing and Event Separation | Accepted |

### Activity & Timeline

| ADR                                                             | Title                                 | Status   |
| --------------------------------------------------------------- | ------------------------------------- | -------- |
| [0033](../adr/ADR-0033-activity-timeline-framework-package.md)  | Activity & Timeline Framework Package | Accepted |
| [0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) | Activity Registry and Timeline Model  | Accepted |
| [0035](../adr/ADR-0035-activity-execution-routing.md)           | Activity Execution Routing            | Accepted |

### Law Platform — Trust Accounting

| ADR                                                                 | Title                                          | Status              |
| ------------------------------------------------------------------- | ---------------------------------------------- | ------------------- |
| [0036](../adr/ADR-0036-trust-accounting-law-capability.md)          | Trust Accounting as Law Platform Capability    | Accepted (planning) |
| [0037](../adr/ADR-0037-immutable-trust-journal.md)                  | Immutable Trust Journal and Append-Only Ledger | Accepted (planning) |
| [0038](../adr/ADR-0038-matter-trust-balance-segregation.md)         | Matter Trust Balance Segregation Model         | Accepted (planning) |
| [0039](../adr/ADR-0039-jurisdiction-adaptive-compliance-profile.md) | Jurisdiction-Adaptive Compliance Profile       | Accepted (planning) |

### Platform Core M8

| ADR                                                                   | Title                                        | Status           |
| --------------------------------------------------------------------- | -------------------------------------------- | ---------------- |
| [0040](../adr/ADR-0040-platform-tenant-foundation.md)                 | Platform Tenant Foundation                   | Accepted (M8-01) |
| [0041](../adr/ADR-0041-platform-authorization-rbac-phase-1.md)        | Platform Authorization RBAC Phase 1          | Accepted (M8-02) |
| [0042](../adr/ADR-0042-platform-operations-console.md)                | Platform Operations Console                  | Accepted (M8-03) |
| [0043](../adr/ADR-0043-platform-personalisation-framework.md)         | Platform Personalisation Framework           | Accepted (M8-04) |
| [0044](../adr/ADR-0044-platform-governance-provisioning-framework.md) | Platform Governance & Provisioning Framework | Accepted (M8-05) |
| [0045](../adr/ADR-0045-platform-security-operational-resilience.md)   | Platform Security & Operational Resilience   | Accepted (M8-06) |

### Production readiness

| ADR                                                                     | Title                                        | Status             |
| ----------------------------------------------------------------------- | -------------------------------------------- | ------------------ |
| [0046](../adr/ADR-0046-production-readiness-bootstrap-consolidation.md) | Production Readiness Bootstrap Consolidation | Accepted (PRH-001) |

### OSS integration

| ADR                                                                        | Title                                           | Status                 |
| -------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------- |
| [0047](../adr/ADR-0047-projects-plane-integration-architecture.md)         | Projects / Plane Integration Architecture       | Accepted (OSS-101-01)  |
| [0048](../adr/ADR-0048-apzhub-global-entity-id-strategy.md)                | APZHUB Global Entity ID Strategy                | Accepted (OSS-110-03)  |
| [0049](../adr/ADR-0049-persistent-entity-mapping-store.md)                 | Persistent Entity Mapping Store (PostgreSQL)    | Accepted (OSS-110-05)  |
| [0050](../adr/ADR-0050-production-authorisation-policy-enforcement.md)     | Production Authorisation & Policy Enforcement   | Accepted (OSS-110-06)  |
| [0051](../adr/ADR-0051-platform-http-api-surface.md)                       | Platform HTTP API Surface (v1)                  | Accepted (OSS-110-07)  |
| [0052](../adr/ADR-0052-canonical-source-event-envelope.md)                 | Canonical Source Event Envelope                 | Accepted (OSS-100-08)  |
| [0053](../adr/ADR-0053-event-identity-and-deduplication.md)                | Event Identity and Deduplication                | Accepted (OSS-100-08)  |
| [0054](../adr/ADR-0054-polling-checkpoint-acknowledgement.md)              | Polling Checkpoint Acknowledgement              | Accepted (OSS-100-08)  |
| [0055](../adr/ADR-0055-webhook-verification-boundary.md)                   | Webhook Verification Boundary                   | Accepted (OSS-100-08)  |
| [0056](../adr/ADR-0056-adapter-polling-vs-platform-scheduling.md)          | Adapter Polling vs Platform Scheduling          | Accepted (OSS-100-08)  |
| [0057](../adr/ADR-0057-sdk-harness-vs-adapter-operations-certification.md) | SDK Harness vs Adapter Operations Certification | Accepted (OSS-100-09)  |
| [0058](../adr/ADR-0058-integration-sdk-v1-readiness-limitations.md)        | Integration SDK v1.0 Readiness & Limitations    | Accepted (OSS-100-10)  |
| [0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)            | APZ TCMS Native Product Architecture            | Accepted (APZTCMS-001) |

---

## Cross-references

| ADR             | Related foundation docs                                                                                                                                                                                                                                                | Related packages                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 0004, 0009–0016 | [024](../024-apzhub-platform-sdk-development-framework.md)                                                                                                                                                                                                             | `@apzhub/platform-runtime`                                            |
| 0019–0023       | [005](../005-desktop-experience-workspace-framework.md), [016](../016-desktop-shell-architecture-user-experience-framework.md)                                                                                                                                         | `@apzhub/workbench-framework`                                         |
| 0024–0026       | [019](../019-universal-command-palette-action-framework.md)                                                                                                                                                                                                            | `@apzhub/command-framework`                                           |
| 0027–0029       | [020](../020-unified-search-knowledge-discovery-framework.md)                                                                                                                                                                                                          | `@apzhub/knowledge-discovery-framework`                               |
| 0030–0032       | [021](../021-notification-activity-attention-management-framework.md)                                                                                                                                                                                                  | `@apzhub/event-notification-framework`                                |
| 0033–0035       | [012](../012-event-driven-architecture-background-processing-workflow-framework.md)                                                                                                                                                                                    | `@apzhub/activity-timeline-framework`                                 |
| 0040–0045       | [007](../007-identity-authentication-authorisation-rbac-architecture.md)                                                                                                                                                                                               | Platform Core M8 packages                                             |
| 0047            | [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md)                                                                                                                                                                                  | `@apzhub/integration-sdk`                                             |
| 0048–0051       | [007](../007-identity-authentication-authorisation-rbac-architecture.md), [009](../009-platform-service-layer-integration-framework.md), [010](../010-api-gateway-integration-communication-standards.md), [013](../013-security-architecture-zero-trust-framework.md) | `@apzhub/platform-services`, `apps/web` `/api/v1`                     |
| 0052–0056       | [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md), [012](../012-event-driven-architecture-background-processing-workflow-framework.md), [029](../029-platform-event-sdk-event-bus-event-manifest-specification.md)                 | `@apzhub/integration-sdk` `/events`                                   |
| 0057            | [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md), [REFERENCE-ADAPTER-STANDARD](../architecture/REFERENCE-ADAPTER-STANDARD.md)                                                                                                     | `@apzhub/integration-sdk` `/harness`                                  |
| 0058            | [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md), [SDK-V1-CERTIFICATION](../../packages/integration-sdk/docs/SDK-V1-CERTIFICATION.md)                                                                                             | `@apzhub/integration-sdk` readiness (remained 0.9.0 until OSS-100-11) |
| 0065            | [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md), [Freeze Notice](../architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md)                                                                                           | `@apzhub/integration-sdk` **1.0.0** · **Architecture Frozen**         |
| 0066–0067       | [Analytics Platform](../platform/analytics/README.md)                                                                                                                                                                                                                  | Analytics Platform Foundation                                         |
| 0068–0069       | [Workflow Platform](../platform/workflow/README.md)                                                                                                                                                                                                                    | Workflow Platform Foundation                                          |

---

## Creating new ADRs

1. File as `docs/adr/ADR-00NN-short-title.md`
2. Include: Problem, Decision, Alternatives, Consequences, Status
3. Register in this catalogue, [DECISION-REGISTER](./DECISION-REGISTER.md), and [docs/adr/README.md](../adr/README.md)
4. Do not override foundation documents without owner approval

---

## Superseded ADRs

| ADR      | Superseded by | Reason                                                |
| -------- | ------------- | ----------------------------------------------------- |
| ADR-0008 | ADR-0018      | Platform Core split into Runtime + framework packages |

When an ADR is superseded, retain the file for history; mark status clearly.
