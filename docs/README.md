# APZHUB — Project Documentation

This directory is the canonical source for APZHUB product and architecture documentation.

**Status:** Foundation documentation complete (000, 001–029). **Wave 1 COMPLETE.** **Wave 2 CLOSED.** **Support vertical CERTIFIED_WITH_LIMITATIONS** (OSS-110-12). **Support Module UI PRODUCTION_READY_WITH_LIMITATIONS** (OSS-110-14). **APZREPORT-003 COMPLETE** (Reporting **PRODUCTION_READY_WITH_LIMITATIONS**). **APZDOCS-006 COMPLETE** (Document **PRODUCTION_READY_WITH_LIMITATIONS**). **APZSEARCH-008 COMPLETE** (Search Vertical **PRODUCTION_READY_WITH_LIMITATIONS**). **APZSEARCH-009 COMPLETE** (`@apzhub/search-integration` **0.1.0**). **APZSEARCH-010 COMPLETE** (`@apzhub/search-projects` **0.1.0**). **APZSEARCH-011 COMPLETE** (`@apzhub/search-support` **0.1.0**). **APZSEARCH-012 COMPLETE** (`@apzhub/search-documents` **0.1.0**). **APZSEARCH-013 COMPLETE** (`@apzhub/search-testing` **0.1.0**). Stop; await owner approval for **APZSEARCH-014** (Reporting) / GitLab CI (future) / AI Assist (deferred) / next domain / platform milestone.

## Knowledge Foundation (APZHUB-000)

| Document                                                                     | Description                                     |
| ---------------------------------------------------------------------------- | ----------------------------------------------- |
| [Knowledge Foundation index](./foundation/README.md)                         | **Start here** — APZHUB-000 deliverables        |
| [Session Start](./foundation/SESSION-START.md)                               | **One-page launchpad** for every new AI session |
| [Project Index](./foundation/PROJECT-INDEX.md)                               | Master navigation                               |
| [AI Context](./foundation/AI-CONTEXT.md)                                     | **AI agents read first**                        |
| [APZHUB Master Brief](./foundation/APZHUB-MASTER-BRIEF.md)                   | Executive programme overview                    |
| [APZHUB Constitution](./foundation/APZHUB-CONSTITUTION.md)                   | Immutable programme principles                  |
| [Current Milestone](./foundation/CURRENT-MILESTONE.md)                       | Where development stops                         |
| [APZHUB-000 Completion Report](./foundation/APZHUB-000-completion-report.md) | Milestone closeout                              |

## Strategy (PCS-001 — master roadmap)

| Document                                                                                                                                          | Description                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [Strategy index](./strategy/README.md)                                                                                                            | PCS-001 deliverables registry                                   |
| [Platform Core Strategy](./strategy/APZHUB-Platform-Core-Strategy.md)                                                                             | **Master strategy** — five-year direction                       |
| [Platform Core v2 Strategy](./strategy/APZHUB-Platform-Core-v2-Strategy.md)                                                                       | v2 rationale and priorities                                     |
| [Product Portfolio Strategy](./strategy/APZHUB-Product-Portfolio-Strategy.md)                                                                     | Product classification                                          |
| [OSS Integration Strategy](./strategy/APZHUB-OSS-Integration-Strategy.md)                                                                         | OSS engine integration plan (PCS-001 strategic evaluation)      |
| [OSS-001 Master Plan](./strategy/OSS-001-APZHUB-OSS-Integration-Master-Plan.md)                                                                   | **Definitive** OSS integration master plan — **complete**       |
| [OSS Wave Roadmap](./strategy/APZHUB-OSS-Wave-Roadmap.md)                                                                                         | Nine-wave implementation sequencing                             |
| [OSS-001 Engineering Estimates](./strategy/OSS-001-Engineering-Estimates.md)                                                                      | Effort by wave                                                  |
| [OSS-001 Acceptance Criteria](./strategy/OSS-001-Acceptance-Criteria.md)                                                                          | OSS-001 done definition                                         |
| [OSS-001 Completion Report](./sprint/OSS-001-completion-report.md)                                                                                | OSS-001 closeout                                                |
| [Capability Abstraction Standard](./architecture/APZHUB-Capability-Abstraction-Standard.md)                                                       | Mandatory pattern for all capabilities (OSS-002)                |
| [Adapter Boundary Pattern](./architecture/APZHUB-Adapter-Boundary-Pattern.md)                                                                     | OSS adapter contract (OSS-002)                                  |
| [OSS vs Native Decision Model](./architecture/APZHUB-OSS-vs-Native-Capability-Decision-Model.md)                                                  | Build / integrate / buy / defer (OSS-002)                       |
| [Quality Engineering Platform Strategy](./strategy/APZHUB-Quality-Engineering-Platform-Strategy.md)                                               | **Superseded identity** — planning predecessor; see APZ TCMS |
| [Quality Engineering Reference Architecture](./architecture/APZHUB-Quality-Engineering-Reference-Architecture.md)                                 | **Superseded** — see APZ TCMS Reference Architecture         |
| [Quality Engineering Backlog](./backlog/APZHUB-Quality-Engineering-Backlog.md)                                                                    | **Superseded** — see APZTCMS-Backlog                         |
| [APZ TCMS Product Vision](./strategy/APZHUB-APZ-TCMS-Product-Vision.md)                                                                           | **APZTCMS-001** — native Testing & Certification product     |
| [APZ TCMS User Personas](./product/APZHUB-APZ-TCMS-User-Personas.md)                                                                              | APZ TCMS personas                                            |
| [APZ TCMS Reference Architecture](./architecture/APZHUB-APZ-TCMS-Reference-Architecture.md)                                                       | APZ TCMS layered architecture                                |
| [APZ TCMS Foundation Architecture](./architecture/APZHUB-APZ-TCMS-Foundation-Architecture.md)                                                     | APZTCMS-002 foundation packages & manifests                  |
| [APZ TCMS Package Guide](./architecture/APZHUB-APZ-TCMS-Package-Guide.md)                                                                         | `testing-contracts` / `testing-foundation` / `testing-persistence` / `testing-services` |
| [APZ TCMS Service Contracts](./architecture/APZHUB-APZ-TCMS-Service-Contracts.md)                                                                 | Service interface catalogue                                  |
| [APZ TCMS Domain Contracts](./architecture/APZHUB-APZ-TCMS-Domain-Contracts.md)                                                                   | Domain type contracts                                        |
| [APZ TCMS Permission Catalogue](./architecture/APZHUB-APZ-TCMS-Permission-Catalogue.md)                                                           | Permission keys                                              |
| [APZ TCMS Module Registration Guide](./architecture/APZHUB-APZ-TCMS-Module-Registration-Guide.md)                                                 | Module manifest registration                                 |
| [APZ TCMS Developer Guide](./architecture/APZHUB-APZ-TCMS-Developer-Guide.md)                                                                     | Developer onboarding for TCMS foundation + persistence + services + workbench UI |
| [APZ TCMS Testing Workbench Architecture](./architecture/APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md)                                       | APZTCMS-010 workbench layering & boundaries                  |
| [Testing Platform Service Architecture](./architecture/APZHUB-Testing-Platform-Service-Architecture.md)                                             | APZTCMS-011 platform layer & gateway path                    |
| [Testing Platform Service Contracts](./architecture/APZHUB-Testing-Platform-Service-Contracts.md)                                                 | APZTCMS-011 service catalogue                                |
| [Testing Gateway Reference](./architecture/APZHUB-Testing-Gateway-Reference.md)                                                                     | APZTCMS-011 `gateway.testing.*` surface                      |
| [Testing Permission Catalogue](./architecture/APZHUB-Testing-Permission-Catalogue.md)                                                               | APZTCMS-011 platform permission merge                        |
| [Testing Operation Permission Map](./architecture/APZHUB-Testing-Operation-Permission-Map.md)                                                       | APZTCMS-011 operation → permission map                       |
| [Testing Bootstrap Configuration Guide](./architecture/APZHUB-Testing-Bootstrap-Configuration-Guide.md)                                           | APZTCMS-011 factories & `TESTING_SERVICE_ENABLED`            |
| [Testing Health Readiness Guide](./architecture/APZHUB-Testing-Health-Readiness-Guide.md)                                                         | APZTCMS-011 readiness indicators                             |
| [Testing Error Model](./architecture/APZHUB-Testing-Error-Model.md)                                                                               | APZTCMS-011 `PlatformServiceError` translation               |
| [Testing Security Tenancy Guide](./architecture/APZHUB-Testing-Security-Tenancy-Guide.md)                                                         | APZTCMS-011 Zero Trust & tenancy                             |
| [Testing Domain-Platform Boundary Guide](./architecture/APZHUB-Testing-Domain-Platform-Boundary-Guide.md)                                         | APZTCMS-011 layer boundaries                                 |
| [Testing HTTP API](./architecture/APZHUB-Testing-HTTP-API.md)                                                                                       | APZTCMS-012 `/api/v1/testing/**` route surface               |
| [Testing Typed Client Architecture](./architecture/APZHUB-Testing-Typed-Client-Architecture.md)                                                     | APZTCMS-012 workbench HTTP client boundary                   |
| [Testing Workbench Production Client Migration](./architecture/APZHUB-Testing-Workbench-Production-Client-Migration.md)                             | APZTCMS-012 mock-to-HTTP migration                           |
| [Testing API Security Privacy Guide](./architecture/APZHUB-Testing-API-Security-Privacy-Guide.md)                                                   | APZTCMS-012 API security/privacy notes                       |
| [Testing Certification API Guide](./architecture/APZHUB-Testing-Certification-API-Guide.md)                                                         | APZTCMS-012 certification/readiness routes                   |
| [APZ TCMS Vertical-Slice Certification](./architecture/APZHUB-APZ-TCMS-Vertical-Slice-Certification.md)                                             | APZTCMS-013 master certification (**PRODUCTION_READY_WITH_LIMITATIONS**) |
| [Release Governance Architecture](./architecture/APZHUB-APZ-TCMS-Release-Governance-Architecture.md)                                                 | APZTCMS-014 TCMS release governance                                      |
| [Release State Machine](./architecture/APZHUB-APZ-TCMS-Release-State-Machine.md)                                                                     | APZTCMS-014 lifecycle                                                    |
| [Release Domain Model](./architecture/APZHUB-APZ-TCMS-Release-Domain-Model.md)                                                                       | APZTCMS-014 entities                                                     |
| [Release Permissions](./architecture/APZHUB-APZ-TCMS-Release-Permissions.md)                                                                         | APZTCMS-014 permissions                                                  |
| [Release Readiness Model](./architecture/APZHUB-APZ-TCMS-Release-Readiness-Model.md)                                                                 | APZTCMS-014 readiness aggregation                                        |
| [Release Approval Model](./architecture/APZHUB-APZ-TCMS-Release-Approval-Model.md)                                                                   | APZTCMS-014 human approvals                                              |
| [Release Risk Model](./architecture/APZHUB-APZ-TCMS-Release-Risk-Model.md)                                                                           | APZTCMS-014 risk aggregation                                             |
| [Release Governance Developer Guide](./architecture/APZHUB-APZ-TCMS-Release-Governance-Developer-Guide.md)                                           | APZTCMS-014 developer guide                                              |
| [CI/CD Integration Architecture](./architecture/APZHUB-APZ-TCMS-CICD-Integration-Architecture.md)                                                   | APZTCMS-015 vendor-neutral CI/CD metadata framework                      |
| [Canonical Pipeline Model](./architecture/APZHUB-APZ-TCMS-Canonical-Pipeline-Model.md)                                                               | APZTCMS-015 canonical models                                             |
| [Provider Contract Guide](./architecture/APZHUB-APZ-TCMS-Provider-Contract-Guide.md)                                                                 | APZTCMS-015 parse-only adapter contract                                  |
| [Pipeline Import Guide](./architecture/APZHUB-APZ-TCMS-Pipeline-Import-Guide.md)                                                                     | APZTCMS-015 import / link services                                       |
| [Artifact Metadata Guide](./architecture/APZHUB-APZ-TCMS-Artifact-Metadata-Guide.md)                                                                 | APZTCMS-015 artifact references only                                     |
| [CI/CD Developer Guide](./architecture/APZHUB-APZ-TCMS-CICD-Developer-Guide.md)                                                                       | APZTCMS-015 developer guide                                              |
| [GitHub Actions Adapter Architecture](./architecture/APZHUB-APZ-TCMS-GitHub-Actions-Adapter.md)                                                       | APZTCMS-016 read-only GitHub Actions reference adapter                   |
| [GitHub Platform Service Architecture](./architecture/APZHUB-APZ-TCMS-GitHub-Platform-Service-Architecture.md)                                         | APZTCMS-017 providers + gateway facets                                   |
| [GitHub Provider Guide](./architecture/APZHUB-APZ-TCMS-GitHub-Provider-Guide.md)                                                                       | APZTCMS-017 ProviderRegistry wiring                                      |
| [GitHub Gateway Integration Guide](./architecture/APZHUB-APZ-TCMS-GitHub-Gateway-Integration-Guide.md)                                                 | APZTCMS-017 gateway.testing.pipeline*                                    |
| [GitHub Traceability Guide](./architecture/APZHUB-APZ-TCMS-GitHub-Traceability-Guide.md)                                                               | APZTCMS-017 SoR links + release consume                                  |
| [GitHub Platform Developer Guide](./architecture/APZHUB-APZ-TCMS-GitHub-Platform-Developer-Guide.md)                                                   | APZTCMS-017 developer guide                                              |
| [GitHub User Guide](./architecture/APZHUB-APZ-TCMS-GitHub-User-Guide.md)                                                                               | APZTCMS-018 end-user pipelines UX                                        |
| [Pipeline Workbench Guide](./architecture/APZHUB-APZ-TCMS-Pipeline-Workbench-Guide.md)                                                               | APZTCMS-018 workbench usage                                              |
| [Pipeline HTTP API Guide](./architecture/APZHUB-APZ-TCMS-Pipeline-HTTP-API-Guide.md)                                                                   | APZTCMS-018 `/api/v1/testing/pipelines`                                  |
| [Pipeline Typed Client Guide](./architecture/APZHUB-APZ-TCMS-Pipeline-Typed-Client-Guide.md)                                                           | APZTCMS-018 `createHttpPipelineClient`                                   |
| [Pipeline Workbench Architecture](./architecture/APZHUB-APZ-TCMS-Pipeline-Workbench-Architecture.md)                                                   | APZTCMS-018 presentation architecture                                    |
| [GitHub Vertical Certification](./architecture/APZHUB-APZ-TCMS-GitHub-Vertical-Certification.md)                                                       | APZTCMS-019 production classification                                    |
| [Engineering Intelligence Architecture](./architecture/APZHUB-APZ-TCMS-Engineering-Intelligence-Architecture.md)                                   | APZTCMS-021 domain architecture                                          |
| [Engineering Intelligence HTTP API Guide](./architecture/APZHUB-APZ-TCMS-Engineering-Intelligence-HTTP-API-Guide.md)                             | APZTCMS-022 HTTP surface                                                 |
| [Engineering Intelligence Typed Client Guide](./architecture/APZHUB-APZ-TCMS-Engineering-Intelligence-Typed-Client-Guide.md)                     | APZTCMS-022 typed client                                                 |
| [Engineering Intelligence Workbench Guide](./architecture/APZHUB-APZ-TCMS-Engineering-Intelligence-Workbench-Guide.md)                           | APZTCMS-022 workbench                                                    |
| [Engineering Intelligence User Guide](./architecture/APZHUB-APZ-TCMS-Engineering-Intelligence-User-Guide.md)                                     | APZTCMS-022 end-user guide                                               |
| [Engineering Intelligence OpenAPI Guide](./architecture/APZHUB-APZ-TCMS-Engineering-Intelligence-OpenAPI-Guide.md)                               | APZTCMS-022 OpenAPI                                                      |
| [Executive Dashboard Architecture](./architecture/APZHUB-APZ-TCMS-Executive-Dashboard-Architecture.md)                                           | APZTCMS-023 dashboard architecture                                       |
| [Executive Dashboard Guide](./architecture/APZHUB-APZ-TCMS-Executive-Dashboard-Guide.md)                                                         | APZTCMS-023 executive dashboard                                          |
| [Engineering Dashboard Guide](./architecture/APZHUB-APZ-TCMS-Engineering-Dashboard-Guide.md)                                                     | APZTCMS-023 engineering dashboard                                        |
| [QA Dashboard Guide](./architecture/APZHUB-APZ-TCMS-QA-Dashboard-Guide.md)                                                                       | APZTCMS-023 QA dashboard                                                 |
| [Release Dashboard Guide](./architecture/APZHUB-APZ-TCMS-Release-Dashboard-Guide.md)                                                             | APZTCMS-023 release dashboard                                            |
| [Executive Dashboards Developer Guide](./architecture/APZHUB-APZ-TCMS-Executive-Dashboards-Developer-Guide.md)                                   | APZTCMS-023 developer guide                                              |
| [Reporting Architecture](./architecture/APZHUB-APZ-TCMS-Reporting-Architecture.md)                                                               | APZTCMS-024 reporting framework                                          |
| [Reporting Template Engine](./architecture/APZHUB-APZ-TCMS-Reporting-Template-Engine.md)                                                           | APZTCMS-024 template binding                                             |
| [Reporting Renderer Architecture](./architecture/APZHUB-APZ-TCMS-Reporting-Renderer-Architecture.md)                                             | APZTCMS-024 renderers                                                    |
| [Reporting Output Providers](./architecture/APZHUB-APZ-TCMS-Reporting-Output-Providers.md)                                                       | APZTCMS-024 HTML/MD/PDF/DOCX/JSON/CSV                                    |
| [Reporting Metadata](./architecture/APZHUB-APZ-TCMS-Reporting-Metadata.md)                                                                       | APZTCMS-024 metadata persistence                                         |
| [Reporting Developer Guide](./developer/APZHUB-APZ-TCMS-Reporting-Developer-Guide.md)                                                            | APZTCMS-024 developer guide                                              |
| [Platform Reporting Architecture](./architecture/APZHUB-Platform-Reporting-Architecture.md)                                                       | APZREPORT-001 shared reporting                                           |
| [Platform Reporting Migration Guide](./architecture/APZHUB-Platform-Reporting-Migration-Guide.md)                                                 | APZREPORT-001 migration                                                  |
| [Platform Reporting Developer Guide](./developer/APZHUB-Platform-Reporting-Developer-Guide.md)                                                    | APZREPORT-001 developer guide                                            |
| [Platform Reporting Consumer Integration](./developer/APZHUB-Platform-Reporting-Consumer-Integration-Guide.md)                                   | APZREPORT-001 future consumers                                           |
| [Platform Reporting Package Guide](./developer/APZHUB-Platform-Reporting-Package-Guide.md)                                                        | APZREPORT-001 packages                                                   |
| [Platform Reporting HTTP API](./architecture/APZHUB-Platform-Reporting-HTTP-API.md)                                                               | APZREPORT-002 HTTP surface                                               |
| [Platform Reporting Workbench](./architecture/APZHUB-Platform-Reporting-Workbench.md)                                                             | APZREPORT-002 workbench                                                  |
| [Platform Reporting Typed Client](./developer/APZHUB-Platform-Reporting-Typed-Client-Guide.md)                                                    | APZREPORT-002 typed client                                               |
| [Platform Reporting HTTP Consumer Guide](./developer/APZHUB-Platform-Reporting-HTTP-Consumer-Integration-Guide.md)                                | APZREPORT-002 consumer migration                                         |
| [Platform Reporting Security Guide](./security/APZHUB-Platform-Reporting-Security-Guide.md)                                                       | APZREPORT-002 security                                                   |
| [Platform Reporting Vertical Certification](./architecture/APZHUB-Platform-Reporting-Vertical-Certification.md)                                   | APZREPORT-003 certification                                              |
| [Platform Document Architecture](./architecture/APZHUB-Platform-Document-Architecture.md)                                                         | APZDOCS-001 architecture                                                 |
| [Platform Document Domain Model](./architecture/APZHUB-Platform-Document-Domain-Model.md)                                                         | APZDOCS-001 domain                                                       |
| [Platform Document Storage Abstraction](./architecture/APZHUB-Platform-Document-Storage-Abstraction.md)                                           | APZDOCS-001 storage ports                                                |
| [Platform Document Persistence Architecture](./architecture/APZHUB-Platform-Document-Persistence-Architecture.md)                                 | APZDOCS-002 persistence                                                  |
| [Document Storage Provider Architecture](./architecture/APZHUB-Document-Storage-Provider-Architecture.md)                                         | APZDOCS-002 providers                                                    |
| [Document Platform Services Architecture](./architecture/APZHUB-Document-Platform-Services-Architecture.md)                                       | APZDOCS-003 platform services + gateway                                  |
| [Platform Document HTTP API](./architecture/APZHUB-Platform-Document-HTTP-API.md)                                                                  | APZDOCS-004 `/api/v1/documents`                                          |
| [Platform Search HTTP API](./architecture/APZHUB-Platform-Search-HTTP-API.md)                                                                        | APZSEARCH-007 `/api/v1/search`                                           |
| [Search Typed Client Guide](./developer/APZHUB-Platform-Search-Typed-Client-Guide.md)                                                                | APZSEARCH-007 `createHttpSearchClient`                                   |
| [Search HTTP Security Guide](./security/APZHUB-Platform-Search-HTTP-Security-Guide.md)                                                               | APZSEARCH-007 security                                                   |
| [APZSEARCH-013 Completion Report](./sprint/APZSEARCH-013-completion-report.md)                                                                      | APZ TCMS Search Publication Adapter — `@apzhub/search-testing` 0.1.0 |
| [Testing Search Publication Adapter](./architecture/APZHUB-Testing-Search-Publication-Adapter.md)                                                     | APZSEARCH-013 TCMS → Search Integration |
| [APZSEARCH-012 Completion Report](./sprint/APZSEARCH-012-completion-report.md)                                                                      | Documents Search Publication Adapter — `@apzhub/search-documents` 0.1.0 |
| [APZSEARCH-011 Completion Report](./sprint/APZSEARCH-011-completion-report.md)                                                                      | Support Search Publication Adapter — `@apzhub/search-support` 0.1.0 |
| [APZSEARCH-010 Completion Report](./sprint/APZSEARCH-010-completion-report.md)                                                                      | Projects Search Publication Adapter — `@apzhub/search-projects` 0.1.0 |
| [APZSEARCH-009 Completion Report](./sprint/APZSEARCH-009-completion-report.md)                                                                      | Cross-Product Search Integration Framework — `@apzhub/search-integration` 0.1.0 |
| [APZSEARCH-008 Completion Report](./sprint/APZSEARCH-008-completion-report.md)                                                                      | Search Vertical Certification — PRODUCTION_READY_WITH_LIMITATIONS        |
| [Search Vertical Certification](./reviews/APZSEARCH-008-search-vertical-certification.md)                                                           | APZSEARCH-008 overview                                                   |
| [APZSEARCH-007 Completion Report](./sprint/APZSEARCH-007-completion-report.md)                                                                      | Search HTTP API, Typed Client & Workbench                                |
| [Platform Document Workbench](./architecture/APZHUB-Platform-Document-Workbench.md)                                                                | APZDOCS-005 `/workspace/documents`                                       |
| [Platform Document Vertical Certification](./architecture/APZHUB-Platform-Document-Vertical-Certification.md)                                      | APZDOCS-006 certification — PRODUCTION_READY_WITH_LIMITATIONS            |
| [Document Workbench Navigation Guide](./architecture/APZHUB-Platform-Document-Workbench-Navigation-Guide.md)                                        | APZDOCS-005 navigation                                                   |
| [Document Workbench Views Guide](./architecture/APZHUB-Platform-Document-Workbench-Views-Guide.md)                                                  | APZDOCS-005 views                                                        |
| [Document Workbench Commands Guide](./architecture/APZHUB-Platform-Document-Workbench-Commands-Guide.md)                                            | APZDOCS-005 commands                                                     |
| [Document Workbench Developer Guide](./developer/APZHUB-Platform-Document-Workbench-Developer-Guide.md)                                             | APZDOCS-005 developer guide                                              |
| [Document OpenAPI Guide](./developer/APZHUB-Platform-Document-OpenAPI-Guide.md)                                                                    | APZDOCS-004 OpenAPI                                                      |
| [Document Typed Client Guide](./developer/APZHUB-Platform-Document-Typed-Client-Guide.md)                                                          | APZDOCS-004 `createHttpDocumentClient`                                   |
| [Document HTTP Consumer Integration Guide](./developer/APZHUB-Platform-Document-HTTP-Consumer-Integration-Guide.md)                                | APZDOCS-004 consumer path                                                |
| [Document HTTP Security Guide](./security/APZHUB-Platform-Document-HTTP-Security-Guide.md)                                                         | APZDOCS-004 security                                                     |
| [Document Gateway Integration](./guides/document-gateway-integration.md)                                                                          | APZDOCS-003 gateway wiring                                               |
| [Document Platform Authorization](./guides/document-platform-authorization.md)                                                                    | APZDOCS-003 authz map + permissions                                      |
| [Document Platform Services Developer Guide](./guides/document-platform-services-developer.md)                                                    | APZDOCS-003 developer guide                                              |
| [Document Platform Consumer Guide](./guides/document-platform-consumer.md)                                                                        | APZDOCS-004 consumer path (HTTP + gateway)                               |
| [Platform Document Developer Guide](./developer/APZHUB-Platform-Document-Developer-Guide.md)                                                      | APZDOCS-001 developer guide (archive path)                               |
| [Document Platform Developer Guide](./guides/document-platform-developer.md)                                                                      | APZDOCS-002 developer guide                                              |
| [Document Platform Packages](./guides/document-platform-packages.md)                                                                              | APZDOCS-002 package map                                                  |
| [Document Filesystem Provider](./guides/document-filesystem-provider.md)                                                                          | APZDOCS-002 filesystem                                                   |
| [Document S3-Compatible Provider](./guides/document-s3-compatible-provider.md)                                                                    | APZDOCS-002 S3/MinIO                                                     |
| [Document Versioning & Immutability](./guides/document-versioning-immutability.md)                                                                | APZDOCS-002 versions                                                     |
| [Document Content Integrity](./guides/document-content-integrity.md)                                                                              | APZDOCS-002 SHA-256                                                      |
| [Document Storage Coordination Failure Model](./guides/document-storage-coordination-failure-model.md)                                            | APZDOCS-002 failure model                                                |
| [Document Reconciliation Boundary](./guides/document-reconciliation-boundary.md)                                                                  | APZDOCS-002 reconciliation                                               |
| [Document Retention & Binary Deletion](./guides/document-retention-binary-deletion.md)                                                            | APZDOCS-002 deletion                                                     |
| [Document Storage Security](./guides/document-storage-security.md)                                                                                | APZDOCS-002 security                                                     |
| [Document Storage Configuration](./guides/document-storage-configuration.md)                                                                      | APZDOCS-002 config                                                       |
| [Document Storage Production Deployment](./guides/document-storage-production-deployment.md)                                                      | APZDOCS-002 deployment                                                   |
| [APZREPORT Future Document Consumer](./guides/apzreport-document-future-consumer.md)                                                              | Future reporting↔documents                                               |
| [APZ TCMS Evidence Future Document Consumer](./guides/apztcms-evidence-document-future-consumer.md)                                               | Future TCMS evidence↔documents                                           |
| [ADR Immutable Content Versions](./decisions/ADR-document-immutable-content-versions.md)                                                          | APZDOCS-002 ADR                                                          |
| [ADR Metadata/Storage TX Boundary](./decisions/ADR-document-metadata-storage-transaction-boundary.md)                                              | APZDOCS-002 ADR                                                          |
| [ADR Checksum Authority](./decisions/ADR-document-checksum-authority.md)                                                                          | APZDOCS-002 ADR                                                          |
| [ADR Storage Provider Selection](./decisions/ADR-document-storage-provider-selection.md)                                                          | APZDOCS-002 ADR                                                          |
| [ADR Reconciliation Model](./decisions/ADR-document-reconciliation-model.md)                                                                      | APZDOCS-002 ADR                                                          |
| [APZREPORT-003 Architecture Audit](./reviews/APZREPORT-003-architecture-dependency-boundary-audit.md)                                            | APZREPORT-003 architecture/dependency/boundary                           |
| [APZREPORT-003 Production Readiness](./reviews/APZREPORT-003-production-readiness.md)                                                            | APZREPORT-003 readiness                                                  |
| [APZDOCS-006 Architecture Audit](./reviews/APZDOCS-006-architecture-dependency-boundary-audit.md)                                                | APZDOCS-006 architecture/dependency/boundary                             |
| [APZDOCS-006 API Audit](./reviews/APZDOCS-006-api-audit.md)                                                                                      | APZDOCS-006 HTTP / OpenAPI                                               |
| [APZDOCS-006 Workbench Audit](./reviews/APZDOCS-006-workbench-audit.md)                                                                          | APZDOCS-006 workbench + typed client                                     |
| [APZDOCS-006 Storage Certification](./reviews/APZDOCS-006-storage-certification.md)                                                              | APZDOCS-006 storage providers                                            |
| [APZDOCS-006 Security Audit](./reviews/APZDOCS-006-security-audit.md)                                                                            | APZDOCS-006 security                                                     |
| [APZDOCS-006 Coverage Baseline](./reviews/APZDOCS-006-coverage-baseline.md)                                                                      | APZDOCS-006 coverage                                                     |
| [APZDOCS-006 Performance Baseline](./reviews/APZDOCS-006-performance-baseline.md)                                                                | APZDOCS-006 performance                                                  |
| [APZDOCS-006 Production Readiness](./reviews/APZDOCS-006-production-readiness.md)                                                                | APZDOCS-006 readiness                                                    |
| [CI/CD Reference Adapter Standard](./architecture/APZHUB-CICD-Reference-Adapter-Standard.md)                                                           | APZTCMS-020 mandatory standard for future CI/CD adapters                 |
| [GitHub Actions Final Architecture](./architecture/APZHUB-APZ-TCMS-GitHub-Actions-Final-Architecture.md)                                               | APZTCMS-020 frozen architecture                                          |
| [GitHub Actions Certification](./architecture/APZHUB-APZ-TCMS-GitHub-Actions-Certification.md)                                                         | APZTCMS-020 wave certification                                           |
| [GitHub Actions Operations Guide](./architecture/APZHUB-APZ-TCMS-GitHub-Actions-Operations-Guide.md)                                                   | APZTCMS-020 operations                                                   |
| [GitHub Actions Capability Matrix](./architecture/APZHUB-APZ-TCMS-GitHub-Actions-Capability-Matrix.md)                                                 | APZTCMS-020 capability matrix                                            |
| [APZ TCMS Testing Navigation Guide](./architecture/APZHUB-APZ-TCMS-Testing-Navigation-Guide.md)                                                 | Activity Bar + sidebar routes & permissions                  |
| [APZ TCMS Testing View Catalogue](./architecture/APZHUB-APZ-TCMS-Testing-View-Catalogue.md)                                                       | All workbench views and displayed data                       |
| [APZ TCMS Testing Command Catalogue](./architecture/APZHUB-APZ-TCMS-Testing-Command-Catalogue.md)                                               | Command IDs, permissions, client delegation                  |
| [APZ TCMS Testing UX Guide](./architecture/APZHUB-APZ-TCMS-Testing-UX-Guide.md)                                                                   | Panels, filters, themes, a11y, evidence & certification UX   |
| [APZ TCMS Quality Intelligence Architecture](./architecture/APZHUB-APZ-TCMS-Quality-Intelligence-Architecture.md)                                 | APZTCMS-008 quality domain                                   |
| [APZ TCMS Certification Engine Architecture](./architecture/APZHUB-APZ-TCMS-Certification-Engine-Architecture.md)                                 | APZTCMS-009 certification domain                             |
| [APZ TCMS Certification Workflow](./architecture/APZHUB-APZ-TCMS-Certification-Workflow.md)                                                       | Certification lifecycle & transitions                        |
| [APZ TCMS Gate Evaluation Model](./architecture/APZHUB-APZ-TCMS-Gate-Evaluation-Model.md)                                                         | Configurable gates & explainable outcomes                    |
| [APZ TCMS Recommendation Model](./architecture/APZHUB-APZ-TCMS-Recommendation-Model.md)                                                           | Advisory recommendations (no auto-approve)                   |
| [APZ TCMS Certification Approval Model](./architecture/APZHUB-APZ-TCMS-Certification-Approval-Model.md)                                           | Human multi-stage approvals                                  |
| [APZ TCMS Certification Audit Model](./architecture/APZHUB-APZ-TCMS-Certification-Audit-Model.md)                                                 | Immutable certification audit                                |
| [APZ TCMS Coverage Model](./architecture/APZHUB-APZ-TCMS-Coverage-Model.md)                                                                       | Deterministic coverage kinds & recompute                     |
| [APZ TCMS Defect Model](./architecture/APZHUB-APZ-TCMS-Defect-Model.md)                                                                           | Defect links (no external sync)                              |
| [APZ TCMS Release Readiness Guide](./architecture/APZHUB-APZ-TCMS-Release-Readiness-Guide.md)                                                     | Multi-dimension readiness inputs                             |
| [APZ TCMS Regression Analysis Guide](./architecture/APZHUB-APZ-TCMS-Regression-Analysis-Guide.md)                                                 | New/resolved/reopened failure analysis                       |
| [APZ TCMS Automation Adapter Guide](./architecture/APZHUB-APZ-TCMS-Automation-Adapter-Guide.md)                                                   | Result adapters (parse only)                                 |
| [APZ TCMS Canonical Automation Model](./architecture/APZHUB-APZ-TCMS-Canonical-Automation-Model.md)                                               | Canonical imported result model                              |
| [APZ TCMS Normalization Rules](./architecture/APZHUB-APZ-TCMS-Normalization-Rules.md)                                                             | Provider → canonical status mapping                          |
| [APZ TCMS Coverage Ingestion Guide](./architecture/APZHUB-APZ-TCMS-Coverage-Ingestion-Guide.md)                                                   | Coverage summary ingestion                                   |
| [APZ TCMS Execution State Machine](./architecture/APZHUB-APZ-TCMS-Execution-State-Machine.md)                                                     | Formal execution + evidence transition tables                |
| [APZ TCMS Evidence Architecture](./architecture/APZHUB-APZ-TCMS-Evidence-Architecture.md)                                                         | Storage provider abstraction                                 |
| [APZ TCMS Evidence Lifecycle](./architecture/APZHUB-APZ-TCMS-Evidence-Lifecycle.md)                                                               | Evidence lifecycle states                                    |
| [APZ TCMS Approval Engine](./architecture/APZHUB-APZ-TCMS-Approval-Engine.md)                                                                     | Multi-stage approval engine                                  |
| [APZ TCMS Execution History](./architecture/APZHUB-APZ-TCMS-Execution-History.md)                                                                 | Immutable execution history                                  |
| [APZ TCMS Service Architecture](./architecture/APZHUB-APZ-TCMS-Service-Architecture.md)                                                           | Manual domain service layering                               |
| [APZ TCMS Lifecycle Guide](./architecture/APZHUB-APZ-TCMS-Lifecycle-Guide.md)                                                                     | Case / execution / approval lifecycles                       |
| [APZ TCMS State Machines](./architecture/APZHUB-APZ-TCMS-State-Machines.md)                                                                       | Transition tables                                            |
| [APZ TCMS Validation Rules](./architecture/APZHUB-APZ-TCMS-Validation-Rules.md)                                                                   | Domain validation categories                                 |
| [APZ TCMS Traceability Guide](./architecture/APZHUB-APZ-TCMS-Traceability-Guide.md)                                                               | Bidirectional traceability chain                             |
| [APZ TCMS Persistence Architecture](./architecture/APZHUB-APZ-TCMS-Persistence-Architecture.md)                                                   | APZTCMS-003/004/005 persistence layering                 |
| [APZ TCMS Persistence Completion Guide](./architecture/APZHUB-APZ-TCMS-Persistence-Completion-Guide.md)                                           | APZTCMS-005 Postgres completion                          |
| [APZ TCMS Schema Guide](./architecture/APZHUB-APZ-TCMS-Schema-Guide.md)                                                                           | `testing_*` SoR tables                                   |
| [APZ TCMS Schema Update Guide](./architecture/APZHUB-APZ-TCMS-Schema-Update-Guide.md)                                                             | APZTCMS-005 additive schema                              |
| [APZ TCMS Repository Guide](./architecture/APZHUB-APZ-TCMS-Repository-Guide.md)                                                                   | Repository contracts & factories                         |
| [APZ TCMS Authorization Guide](./architecture/APZHUB-APZ-TCMS-Authorization-Guide.md)                                                             | Persistence permission asserts                           |
| [APZ TCMS Migration Guide](./architecture/APZHUB-APZ-TCMS-Migration-Guide.md)                                                                     | Drizzle migrations 0016–0021                             |
| [APZ TCMS Domain Model](./architecture/APZHUB-APZ-TCMS-Domain-Model.md)                                                                           | Conceptual domain (no DDL)                                   |
| [APZ TCMS Module Catalogue](./architecture/APZHUB-APZ-TCMS-Module-Catalogue.md)                                                                   | Testing module capability breakdown                          |
| [APZ TCMS UI Architecture](./architecture/APZHUB-APZ-TCMS-UI-Architecture.md)                                                                     | Workbench views & permission-driven nav                      |
| [APZ TCMS Integration Strategy](./architecture/APZHUB-APZ-TCMS-Integration-Strategy.md)                                                           | Projects/Support/CI/result adapters                          |
| [APZ TCMS Technology Decisions](./architecture/APZHUB-APZ-TCMS-Technology-Decisions.md)                                                           | OSS engines/tools TCMS integrates with                       |
| [ADR-0059 APZ TCMS Native Product Architecture](./adr/ADR-0059-apz-tcms-native-product-architecture.md)                                           | Native SoR; orchestrates engines; supersedes QE/Kiwi naming  |
| [APZTCMS Backlog](./backlog/APZTCMS-Backlog.md)                                                                                                   | APZTCMS-001–012 phased backlog                               |
| [APZTCMS Milestone Roadmap](./backlog/APZTCMS-Milestone-Roadmap.md)                                                                               | Milestone map with stop conditions                           |
| [APZTCMS-001 Completion Report](./sprint/APZTCMS-001-completion-report.md)                                                                        | APZTCMS-001 closeout                                         |
| [APZTCMS-002 Completion Report](./sprint/APZTCMS-002-completion-report.md)                                                                        | APZTCMS-002 closeout                                         |
| [APZTCMS-003 Completion Report](./sprint/APZTCMS-003-completion-report.md)                                                                        | APZTCMS-003 closeout                                         |
| [APZTCMS-004 Completion Report](./sprint/APZTCMS-004-completion-report.md)                                                                        | APZTCMS-004 closeout                                         |
| [APZTCMS-005 Completion Report](./sprint/APZTCMS-005-completion-report.md)                                                                        | APZTCMS-005 closeout                                         |
| [APZTCMS-006 Completion Report](./sprint/APZTCMS-006-completion-report.md)                                                                        | APZTCMS-006 closeout                                         |
| [APZTCMS-007 Completion Report](./sprint/APZTCMS-007-completion-report.md)                                                                        | APZTCMS-007 closeout                                         |
| [APZTCMS-008 Completion Report](./sprint/APZTCMS-008-completion-report.md)                                                                        | APZTCMS-008 closeout                                         |
| [APZTCMS-009 Completion Report](./sprint/APZTCMS-009-completion-report.md)                                                                        | APZTCMS-009 closeout                                         |
| [APZTCMS-010 Completion Report](./sprint/APZTCMS-010-completion-report.md)                                                                        | APZTCMS-010 closeout                                         |
| [APZTCMS-011 Completion Report](./sprint/APZTCMS-011-completion-report.md)                                                                        | APZTCMS-011 closeout                                         |
| [APZTCMS-012 Completion Report](./sprint/APZTCMS-012-completion-report.md)                                                                        | APZTCMS-012 closeout                                         |
| [APZTCMS-013 Completion Report](./sprint/APZTCMS-013-completion-report.md)                                                                        | APZTCMS-013 closeout — **PRODUCTION_READY_WITH_LIMITATIONS** |
| [APZTCMS-014 Completion Report](./sprint/APZTCMS-014-completion-report.md)                                                                        | APZTCMS-014 closeout — Release & Quality Governance Domain   |
| [APZTCMS-015 Completion Report](./sprint/APZTCMS-015-completion-report.md)                                                                        | APZTCMS-015 closeout — External CI/CD Integration Framework  |
| [APZTCMS-016 Completion Report](./sprint/APZTCMS-016-completion-report.md)                                                                        | APZTCMS-016 closeout — GitHub Actions Reference Adapter      |
| [APZTCMS-017 Completion Report](./sprint/APZTCMS-017-completion-report.md)                                                                        | APZTCMS-017 closeout — GitHub Actions Platform Service Integration |
| [APZTCMS-018 Completion Report](./sprint/APZTCMS-018-completion-report.md)                                                                        | APZTCMS-018 closeout — GitHub Actions User Experience        |
| [APZTCMS-019 Completion Report](./sprint/APZTCMS-019-completion-report.md)                                                                        | APZTCMS-019 closeout — **PRODUCTION_READY_WITH_LIMITATIONS** |
| [APZTCMS-021 Completion Report](./sprint/APZTCMS-021-completion-report.md)                                                                        | APZTCMS-021 Engineering Intelligence domain          |
| [APZTCMS-022 Completion Report](./sprint/APZTCMS-022-completion-report.md)                                                                        | APZTCMS-022 EI HTTP API & Workbench                  |
| [APZTCMS-023 Completion Report](./sprint/APZTCMS-023-completion-report.md)                                                                        | APZTCMS-023 Executive Dashboards                     |
| [APZTCMS-024 Completion Report](./sprint/APZTCMS-024-completion-report.md)                                                                        | APZTCMS-024 Reporting Framework                    |
| [APZREPORT-001 Completion Report](./sprint/APZREPORT-001-completion-report.md)                                                                    | APZREPORT-001 Platform Reporting Foundation        |
| [APZREPORT-002 Completion Report](./sprint/APZREPORT-002-completion-report.md)                                                                    | APZREPORT-002 Platform Reporting HTTP & Workbench  |
| [APZREPORT-003 Completion Report](./sprint/APZREPORT-003-completion-report.md)                                                                    | APZREPORT-003 Reporting Vertical Certification     |
| [APZDOCS-001 Completion Report](./sprint/APZDOCS-001-completion-report.md)                                                                        | APZDOCS-001 Platform Document Foundation           |
| [APZDOCS-002 Completion Report](./sprint/APZDOCS-002-completion-report.md)                                                                        | APZDOCS-002 Persistence & Storage Providers        |
| [APZDOCS-006 Completion Report](./sprint/APZDOCS-006-completion-report.md)                                                                        | APZDOCS-006 Document Vertical Certification        |
| [APZDOCS-005 Completion Report](./sprint/APZDOCS-005-completion-report.md)                                                                        | APZDOCS-005 Document Workbench                     |
| [APZDOCS-004 Completion Report](./sprint/APZDOCS-004-completion-report.md)                                                                        | APZDOCS-004 Document HTTP API & Typed Client       |
| [APZDOCS-003 Completion Report](./sprint/APZDOCS-003-completion-report.md)                                                                        | APZDOCS-003 Platform Services, Gateway & Authz     |
| [APZTCMS-020 Completion Report](./sprint/APZTCMS-020-completion-report.md)                                                                        | APZTCMS-020 wave closeout — CI/CD Reference Adapter          |
| [APZTCMS-020 Dependency Audit](./reviews/APZTCMS-020-dependency-audit.md)                                                                         | Dependency audit                                             |
| [APZTCMS-020 Boundary Audit](./reviews/APZTCMS-020-boundary-audit.md)                                                                             | Boundary audit                                               |
| [APZTCMS-020 Security Review](./reviews/APZTCMS-020-security-review.md)                                                                           | Security review                                              |
| [APZTCMS-020 Performance Baseline](./reviews/APZTCMS-020-performance-baseline.md)                                                                 | Performance baseline                                         |
| [APZTCMS-020 Quality Report](./reviews/APZTCMS-020-quality-report.md)                                                                             | Coverage baseline + gates                                    |
| [APZTCMS-019 Architecture Audit](./reviews/APZTCMS-019-architecture-dependency-boundary-audit.md)                                                 | Architecture / dependency / boundary                         |
| [APZTCMS-019 API Audit](./reviews/APZTCMS-019-api-audit.md)                                                                                       | HTTP / OpenAPI / client                                      |
| [APZTCMS-019 Workbench Audit](./reviews/APZTCMS-019-workbench-audit.md)                                                                           | Workbench certification                                      |
| [APZTCMS-019 Security Audit](./reviews/APZTCMS-019-security-audit.md)                                                                             | Security certification                                       |
| [APZTCMS-019 Performance Baseline](./reviews/APZTCMS-019-performance-baseline.md)                                                                 | Measure-only performance                                     |
| [APZTCMS-019 Quality Report](./reviews/APZTCMS-019-quality-report.md)                                                                             | Gates, coverage, regressions                                 |
| [APZTCMS-019 Production Readiness](./reviews/APZTCMS-019-production-readiness.md)                                                                 | Production classification                                    |
| [APZTCMS-013 Production Readiness](./reviews/APZTCMS-013-production-readiness.md)                                                                 | APZTCMS-013 production readiness                             |
| [APZTCMS-013 Architecture Audit](./reviews/APZTCMS-013-architecture-dependency-boundary-audit.md)                                                 | Architecture / dependency / boundary                         |
| [APZTCMS-013 API Audit](./reviews/APZTCMS-013-api-audit.md)                                                                                       | HTTP / OpenAPI certification                                 |
| [APZTCMS-013 Security Audit](./reviews/APZTCMS-013-security-audit.md)                                                                             | Security certification                                       |
| [APZTCMS-013 Accessibility Report](./reviews/APZTCMS-013-accessibility-report.md)                                                                 | A11y certification                                           |
| [APZTCMS-013 Performance Baseline](./reviews/APZTCMS-013-performance-baseline.md)                                                                 | Measure-only performance baseline                            |
| [APZTCMS-013 Quality Report](./reviews/APZTCMS-013-quality-report.md)                                                                             | Gates, coverage, regressions                                 |
| [OSS-002 Completion Report](./sprint/OSS-002-completion-report.md)                                                                                | OSS-002 closeout                                             |
| [Platform Integration SDK Architecture](./architecture/APZHUB-Platform-Integration-SDK-Architecture.md)                                           | **Canonical** Integration SDK (OSS-100)                         |
| [Adapter SDK Specification](./specs/APZHUB-Adapter-SDK-Specification.md)                                                                          | SDK interface contracts                                         |
| [Base Adapter Pattern](./architecture/APZHUB-Base-Adapter-Pattern.md)                                                                             | Vendor adapter extension pattern                                |
| [Integration Connection Lifecycle](./architecture/APZHUB-Integration-Connection-Lifecycle.md)                                                     | ConnectionManager model                                         |
| [Integration Health & Diagnostics Model](./architecture/APZHUB-Integration-Health-Diagnostics-Model.md)                                           | HealthProvider / DiagnosticsProvider                            |
| [Integration Error Translation Model](./architecture/APZHUB-Integration-Error-Translation-Model.md)                                               | ErrorTranslator model                                           |
| [OSS-100 Backlog](./backlog/OSS-100-Platform-Integration-SDK-Backlog.md)                                                                          | OSS-100-01…100-10 phases                                        |
| [OSS-100 Completion Report](./sprint/OSS-100-completion-report.md)                                                                                | OSS-100 closeout                                                |
| [Integration Authentication Architecture](./architecture/APZHUB-Integration-Authentication-Architecture.md)                                       | SDK auth foundation (OSS-100-02)                                |
| [Integration Connection Management Architecture](./architecture/APZHUB-Integration-Connection-Management.md)                                      | SDK connection foundation (OSS-100-02)                          |
| [OSS-100-02 Completion Report](./sprint/OSS-100-02-completion-report.md)                                                                          | OSS-100-02 closeout                                             |
| [OSS-100-03 Completion Report](./sprint/OSS-100-03-completion-report.md)                                                                          | OSS-100-03 closeout                                             |
| [OSS-100-04 Completion Report](./sprint/OSS-100-04-completion-report.md)                                                                          | OSS-100-04 closeout                                             |
| [OSS-101-06 Completion Report](./sprint/OSS-101-06-completion-report.md)                                                                          | OSS-101-06 closeout — Plane task capability                     |
| [OSS-101-07 Completion Report](./sprint/OSS-101-07-completion-report.md)                                                                          | OSS-101-07 closeout — Plane collaboration & intelligence        |
| [OSS-101-08 Completion Report](./sprint/OSS-101-08-completion-report.md)                                                                          | OSS-101-08 closeout — Plane sync, events & production readiness |
| [OSS-101-09 Completion Report](./sprint/OSS-101-09-completion-report.md)                                                                          | OSS-101-09 closeout — Plane operations & certification          |
| [OSS-101-10 Wave 1 Certification](./sprint/OSS-101-10-Wave1-Certification.md)                                                                     | Wave 1 closeout — Plane Reference Adapter certified             |
| [OSS-102-01 Completion Report](./sprint/OSS-102-01-completion-report.md)                                                                          | Zammad discovery & architecture (docs only)                     |
| [OSS-102-02 Completion Report](./sprint/OSS-102-02-completion-report.md)                                                                          | Zammad integration foundation (`@apzhub/integration-zammad`)    |
| [OSS-102-07 Completion Report](./sprint/OSS-102-07-completion-report.md)                                                                          | Zammad operations, diagnostics & certification                  |
| [OSS-102-08 Wave 2 Certification](./sprint/OSS-102-08-Wave2-Certification.md)                                                                     | Wave 2 closeout — CERTIFIED_WITH_LIMITATIONS                    |
| [Wave 2 Artefact Index](./sprint/OSS-102-08-Wave2-Index.md)                                                                                       | Navigation index for Wave 2 artefacts                           |
| [Zammad Operations](../integrations/zammad/docs/ZAMMAD-OPERATIONS.md)                                                                             | OSS-102-07 ops certification guide                              |
| [Zammad Adapter](../integrations/zammad/docs/ZAMMAD-ADAPTER.md)                                                                                   | Zammad adapter guide (v0.6.0)                                   |
| [Zammad Architecture](./architecture/ZAMMAD-ARCHITECTURE.md)                                                                                      | OSS-102-01 engine discovery                                     |
| [Zammad Mapping](./architecture/ZAMMAD-MAPPING.md)                                                                                                | Zammad → Support canonical map                                  |
| [Zammad Capability Matrix](./architecture/ZAMMAD-CAPABILITY-MATRIX.md)                                                                            | Core / optional / unsupported catalogue                         |
| [Zammad Implementation Plan](./architecture/ZAMMAD-IMPLEMENTATION-PLAN.md)                                                                        | Reference-Adapter-compliant Wave 2 plan                         |
| [Zammad Test Plan](./architecture/ZAMMAD-TEST-PLAN.md)                                                                                            | Mock-first certification strategy                               |
| [OSS-102 Backlog](./backlog/OSS-102-Zammad-Integration-Backlog.md)                                                                                | OSS-102-01…10 phases                                            |
| [Reference Adapter Standard](./architecture/REFERENCE-ADAPTER-STANDARD.md)                                                                        | Mandatory standard for all future adapters (OSS-101-10)         |
| [OSS-101-10 Architecture Audit](./sprint/OSS-101-10-architecture-audit.md)                                                                        | Wave 1 architecture certification                               |
| [OSS-101-10 Capability Certification](./sprint/OSS-101-10-capability-certification.md)                                                            | Wave 1 capability matrix                                        |
| [OSS-110-08 Completion Report](./sprint/OSS-110-08-completion-report.md)                                                                          | OSS-110-08 closeout — TaskServiceImpl + gateway                 |
| [OSS-110-09 Completion Report](./sprint/OSS-110-09-completion-report.md)                                                                          | OSS-110-09 closeout — Task HTTP API                             |
| [OSS-110-10 Completion Report](./sprint/OSS-110-10-completion-report.md)                                                                          | OSS-110-10 closeout — Support Platform Services                 |
| [OSS-110-11 Completion Report](./sprint/OSS-110-11-completion-report.md)                                                                          | OSS-110-11 closeout — Support HTTP API                          |
| [OSS-110-12 Completion Report](./sprint/OSS-110-12-completion-report.md)                                                                          | OSS-110-12 closeout — Support vertical certification            |
| [OSS-110-13 Completion Report](./sprint/OSS-110-13-completion-report.md)                                                                          | OSS-110-13 closeout — Support Module UI                         |
| [OSS-110-14 Completion Report](./sprint/OSS-110-14-completion-report.md)                                                                          | OSS-110-14 closeout — Support UI certification                  |
| [Support Vertical Certification](./architecture/SUPPORT-VERTICAL-CERTIFICATION.md)                                                                | OSS-110-12 API master certification                             |
| [Support UI Certification](./architecture/SUPPORT-UI-CERTIFICATION.md)                                                                            | OSS-110-14 UI master certification — PRODUCTION_READY_WITH_LIMITATIONS |
| [Support Module UI](./architecture/APZHUB-Support-Module-UI.md)                                                                                    | Support workbench UI architecture (certified)                   |
| [Support User Guide](./guides/APZHUB-Support-User-Guide.md)                                                                                        | Ops-facing Support workspace guide                              |
| [Support Platform Service Architecture](./architecture/APZHUB-Support-Platform-Service-Architecture.md)                                           | OSS-110-10 Support domain spine                                 |
| [Support HTTP API](./architecture/APZHUB-Support-HTTP-API.md)                                                                                     | OSS-110-11 `/api/v1/support-*`                                  |
| [OSS-101-05 Completion Report](./sprint/OSS-101-05-completion-report.md)                                                                          | OSS-101-05 closeout                                             |
| [OSS-101-04 Completion Report](./sprint/OSS-101-04-completion-report.md)                                                                          | OSS-101-04 closeout                                             |
| [Plane Adapter Documentation](../integrations/plane/docs/PLANE-ADAPTER.md)                                                                        | OSS-101-04/05/06 implementation                                 |
| [Plane Task Service](../integrations/plane/docs/PLANE-TASK-SERVICE.md)                                                                            | OSS-101-06 task capability reference                            |
| [Plane Collaboration & Intelligence](../integrations/plane/docs/PLANE-COLLABORATION-INTELLIGENCE.md)                                              | OSS-101-07 comments/activity/watchers/analytics                 |
| [Plane Sync & Events](../integrations/plane/docs/PLANE-SYNC-EVENTS.md)                                                                            | OSS-101-08 webhooks/events/synchronisation                      |
| [Plane Operations & Certification](../integrations/plane/docs/PLANE-OPERATIONS.md)                                                                | OSS-101-09 certification/readiness/health/reports               |
| [OSS-100-05 Completion Report](./sprint/OSS-100-05-completion-report.md)                                                                          | OSS-100-05 closeout                                             |
| [OSS-100-06 Completion Report](./sprint/OSS-100-06-completion-report.md)                                                                          | OSS-100-06 closeout — Shared HTTP Transport                     |
| [OSS-100-07 Completion Report](./sprint/OSS-100-07-completion-report.md)                                                                          | OSS-100-07 closeout — Mapping Provider Framework                |
| [OSS-100-08 Completion Report](./sprint/OSS-100-08-completion-report.md)                                                                          | OSS-100-08 closeout — Webhook & Polling Contracts               |
| [OSS-100-09 Completion Report](./sprint/OSS-100-09-completion-report.md)                                                                          | OSS-100-09 closeout — Harness & Certification                   |
| [OSS-100-10 Completion Report](./sprint/OSS-100-10-completion-report.md)                                                                          | OSS-100-10 closeout — SDK v1.0 Certification                    |
| [Integration SDK v1.0 Certification](./architecture/APZHUB-Integration-SDK-V1-Certification.md)                                                   | OSS-100-10 architecture index                                   |
| [SDK-V1-CERTIFICATION (package)](../packages/integration-sdk/docs/SDK-V1-CERTIFICATION.md)                                                        | OSS-100-10 master certification report                          |
| [Integration SDK Adapter Harness](./architecture/APZHUB-Integration-SDK-Adapter-Harness.md)                                                       | OSS-100-09 architecture index                                   |
| [Adapter Harness (package)](../packages/integration-sdk/docs/ADAPTER-HARNESS.md)                                                                  | OSS-100-09 primary harness guide                                |
| [Integration SDK Webhook & Polling](./architecture/APZHUB-Integration-SDK-Webhook-Polling.md)                                                     | OSS-100-08 architecture index                                   |
| [Event Envelope (package)](../packages/integration-sdk/docs/EVENT-ENVELOPE.md)                                                                    | OSS-100-08 primary events guide                                 |
| [Integration SDK Mapping Framework](./architecture/APZHUB-Integration-SDK-Mapping-Framework.md)                                                   | OSS-100-07 architecture index                                   |
| [Mapping Framework (package)](../packages/integration-sdk/docs/MAPPING-FRAMEWORK.md)                                                              | OSS-100-07 primary mapping guide                                |
| [Integration SDK HTTP Transport](./architecture/APZHUB-Integration-SDK-HTTP-Transport.md)                                                         | OSS-100-06 architecture index                                   |
| [HTTP Transport (package)](../packages/integration-sdk/docs/HTTP-TRANSPORT.md)                                                                    | OSS-100-06 primary transport guide                              |
| [Adapter Framework Implementation](./architecture/APZHUB-Adapter-Framework-Implementation.md)                                                     | OSS-100-05 implementation                                       |
| [Integration Error Translation Observability Implementation](./architecture/APZHUB-Integration-Error-Translation-Observability-Implementation.md) | OSS-100-04 implementation                                       |
| [Projects Plane Reference Architecture](./architecture/APZHUB-Projects-Plane-Reference-Architecture.md)                                           | Wave 1 Projects architecture (OSS-101)                          |
| [Projects Domain Mapping](./architecture/APZHUB-Projects-Domain-Mapping.md)                                                                       | Plane → APZHUB concept map                                      |
| [Plane Adapter Design](./architecture/APZHUB-Plane-Adapter-Design.md)                                                                             | PlaneAdapter boundary design                                    |
| [Projects Workbench UX](./specs/APZHUB-Projects-Workbench-UX.md)                                                                                  | Native Projects UI specification                                |
| [OSS-101 Backlog](./backlog/OSS-101-Plane-Integration-Backlog.md)                                                                                 | OSS-101-01…101-10 phases                                        |
| [OSS-101 Readiness Review](./reviews/OSS-101-Readiness-Review.md)                                                                                 | Planning gate review                                            |
| [OSS-101 Completion Report](./sprint/OSS-101-completion-report.md)                                                                                | OSS-101 closeout                                                |
| [Projects Capability Architecture](./architecture/APZHUB-Projects-Capability-Architecture.md)                                                     | **Canonical** Projects contract (OSS-101-01)                    |
| [ProjectService Specification](./specs/APZHUB-ProjectService-Specification.md)                                                                    | Vendor-neutral service interface                                |
| [Platform Service Contracts Specification](./specs/APZHUB-Platform-Service-Contracts-Specification.md)                                            | OSS-110-01 canonical contracts                                  |
| [Platform Service Implementation Architecture](./architecture/APZHUB-Platform-Service-Implementation-Architecture.md)                             | OSS-110-02/03/04 mapping-aware + execution layer                |
| [Platform Execution Layer](./architecture/APZHUB-Platform-Execution-Layer.md)                                                                     | OSS-110-04/06 request pipeline architecture                     |
| [Platform Service Authorization](./architecture/APZHUB-Platform-Service-Authorization.md)                                                         | OSS-110-06 production authz & policies                          |
| [Platform HTTP API](./architecture/APZHUB-Platform-HTTP-API.md)                                                                                   | OSS-110-07/09 `/api/v1` surface                                 |
| [Task HTTP API](./architecture/APZHUB-Task-HTTP-API.md)                                                                                           | OSS-110-09 `/api/v1/tasks`                                      |
| [Entity Mapping Specification](./specs/APZHUB-Entity-Mapping-Specification.md)                                                                    | OSS-110-03/05 mapping store                                     |
| [Platform Service Gateway](./specs/APZHUB-Platform-Service-Gateway.md)                                                                            | OSS-110-03/04/06/07 gateway                                     |
| [Platform Execution Layer Specification](./specs/APZHUB-Platform-Execution-Layer.md)                                                              | Pipeline / authz / policy / middleware                          |
| [Permission Catalogue](./specs/APZHUB-Platform-Permission-Catalogue.md)                                                                           | Governed `{capability}.{action}` keys                           |
| [Platform OpenAPI v1](./specs/APZHUB-Platform-OpenAPI-v1.yaml)                                                                                    | OSS-110-07/09 OpenAPI 3.1                                       |
| [ADR-0048 Global Entity ID Strategy](./adr/ADR-0048-apzhub-global-entity-id-strategy.md)                                                          | Opaque APZHUB global IDs                                        |
| [ADR-0049 Persistent Entity Mapping Store](./adr/ADR-0049-persistent-entity-mapping-store.md)                                                     | PostgreSQL mapping persistence                                  |
| [ADR-0050 Production Authorisation](./adr/ADR-0050-production-authorisation-policy-enforcement.md)                                                | Deny-by-default authz strategy                                  |
| [ADR-0051 Platform HTTP API](./adr/ADR-0051-platform-http-api-surface.md)                                                                         | `/api/v1` envelope & gateway rule                               |
| [ADR-0052 Canonical Source Event Envelope](./adr/ADR-0052-canonical-source-event-envelope.md)                                                     | OSS-100-08 IntegrationSourceEvent                               |
| [ADR-0053 Event Identity & Deduplication](./adr/ADR-0053-event-identity-and-deduplication.md)                                                     | OSS-100-08 identity precedence                                  |
| [ADR-0054 Polling Checkpoint Acknowledgement](./adr/ADR-0054-polling-checkpoint-acknowledgement.md)                                               | OSS-100-08 propose/ack                                          |
| [ADR-0055 Webhook Verification Boundary](./adr/ADR-0055-webhook-verification-boundary.md)                                                         | OSS-100-08 verification without ingress                         |
| [ADR-0056 Adapter Polling vs Platform Scheduling](./adr/ADR-0056-adapter-polling-vs-platform-scheduling.md)                                       | OSS-100-08 no SDK schedulers                                    |
| [ADR-0057 SDK Harness vs Adapter Operations](./adr/ADR-0057-sdk-harness-vs-adapter-operations-certification.md)                                   | OSS-100-09 shared certification engine                          |
| [ADR-0058 Integration SDK v1.0 Readiness](./adr/ADR-0058-integration-sdk-v1-readiness-limitations.md)                                             | OSS-100-10 PRODUCTION_READY_WITH_LIMITATIONS                    |
| [OSS-110-01 Completion Report](./sprint/OSS-110-01-completion-report.md)                                                                          | OSS-110-01 closeout                                             |
| [OSS-110-02 Completion Report](./sprint/OSS-110-02-completion-report.md)                                                                          | OSS-110-02 closeout                                             |
| [OSS-110-03 Completion Report](./sprint/OSS-110-03-completion-report.md)                                                                          | OSS-110-03 closeout                                             |
| [OSS-110-04 Completion Report](./sprint/OSS-110-04-completion-report.md)                                                                          | OSS-110-04 closeout                                             |
| [OSS-110-05 Completion Report](./sprint/OSS-110-05-completion-report.md)                                                                          | OSS-110-05 closeout                                             |
| [OSS-110-06 Completion Report](./sprint/OSS-110-06-completion-report.md)                                                                          | OSS-110-06 closeout                                             |
| [OSS-110-07 Completion Report](./sprint/OSS-110-07-completion-report.md)                                                                          | OSS-110-07 closeout                                             |
| [OSS-110-08 Completion Report](./sprint/OSS-110-08-completion-report.md)                                                                          | OSS-110-08 closeout                                             |
| [OSS-110-09 Completion Report](./sprint/OSS-110-09-completion-report.md)                                                                          | OSS-110-09 closeout                                             |
| [OSS-110-10 Completion Report](./sprint/OSS-110-10-completion-report.md)                                                                          | OSS-110-10 closeout                                             |
| [OSS-110-11 Completion Report](./sprint/OSS-110-11-completion-report.md)                                                                          | OSS-110-11 closeout                                             |
| [OSS-110-12 Completion Report](./sprint/OSS-110-12-completion-report.md)                                                                          | OSS-110-12 closeout                                             |
| [OSS-110-13 Completion Report](./sprint/OSS-110-13-completion-report.md)                                                                          | OSS-110-13 closeout — Support Module UI                         |
| [OSS-110-14 Completion Report](./sprint/OSS-110-14-completion-report.md)                                                                          | OSS-110-14 closeout — Support UI certification                  |
| [PlaneAdapter Specification](./specs/APZHUB-PlaneAdapter-Specification.md)                                                                        | Adapter translation boundary                                    |
| [Projects Domain Lifecycle Specification](./specs/APZHUB-Projects-Domain-Lifecycle-Specification.md)                                              | Project/task/sprint lifecycles                                  |
| [Projects Event Mapping Specification](./specs/APZHUB-Projects-Event-Mapping-Specification.md)                                                    | Canonical events                                                |
| [ADR-0047 Projects / Plane Architecture](./adr/ADR-0047-projects-plane-integration-architecture.md)                                               | Accepted ADR                                                    |
| [OSS-101-01 Completion Report](./sprint/OSS-101-01-completion-report.md)                                                                          | OSS-101-01 closeout                                             |
| [Plane Configuration Notes](./governance/APZHUB-Plane-Configuration-Notes.md)                                                                     | Plane config catalogue (OSS-101-02)                             |
| [Plane Environment Guide](./governance/APZHUB-Plane-Environment-Guide.md)                                                                         | Local/dev Plane setup                                           |
| [Plane Diagnostics Design](./architecture/APZHUB-Plane-Diagnostics-Design.md)                                                                     | Config + health diagnostics                                     |
| [Plane Deployment Notes](./governance/APZHUB-Plane-Deployment-Notes.md)                                                                           | Backup, upgrade, secrets                                        |
| [OSS-101-02 Completion Report](./sprint/OSS-101-02-completion-report.md)                                                                          | OSS-101-02 closeout                                             |
| [Projects Manifest Notes](./governance/APZHUB-Projects-Manifest-Notes.md)                                                                         | Projects capability manifests (OSS-101-03)                      |
| [Projects Capability Registration Notes](./governance/APZHUB-Projects-Capability-Registration-Notes.md)                                           | Platform registration contract (OSS-101-03)                     |
| [OSS-101-03 Completion Report](./sprint/OSS-101-03-completion-report.md)                                                                          | OSS-101-03 closeout                                             |
| [Build vs Buy Strategy](./strategy/APZHUB-Build-vs-Buy-Strategy.md)                                                                               | Capability sourcing decisions                                   |
| [Commercial Roadmap](./strategy/APZHUB-Commercial-Roadmap.md)                                                                                     | Commercial evolution tiers                                      |
| [Engineering Roadmap](./strategy/APZHUB-Engineering-Roadmap.md)                                                                                   | Engineering priorities                                          |
| [AI Strategy](./strategy/APZHUB-AI-Strategy.md)                                                                                                   | Governed AI across platform                                     |
| [PCS-001 Owner Approval](./strategy/PCS-001-owner-approval.md)                                                                                    | Owner ratification + sequencing amendments                      |
| [PCS-001 Strategy Review](./reviews/PCS-001-Strategy-Review.md)                                                                                   | Strategy assessment                                             |
| [PCS-001 Completion Report](./sprint/PCS-001-completion-report.md)                                                                                | PCS-001 closeout                                                |

| ID  | Title                                                                                                                                                                        | Status                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 000 | [APZHUB Engineering Constitution](./000-apzhub-engineering-constitution.md)                                                                                                  | Mandatory — supreme engineering authority                    |
| 001 | [Project Vision & Guiding Principles](./001-project-vision-and-guiding-principles.md)                                                                                        | Active — foundation document                                 |
| 002 | [Product Naming, Positioning & Terminology Standard](./002-product-naming-positioning-terminology-standard.md)                                                               | Active — naming and language standard                        |
| 003 | [Overall System Architecture & Design Principles](./003-overall-system-architecture-design-principles.md)                                                                    | Active — architectural standard (non-negotiable)             |
| 004 | [Technology Stack, Repository Standards & Development Environment](./004-technology-stack-repository-standards-development-environment.md)                                   | Active — engineering standard (mandatory)                    |
| 005 | [Desktop Experience & Workspace Framework](./005-desktop-experience-workspace-framework.md)                                                                                  | Active — Desktop Framework (DEF)                             |
| 006 | [Enterprise Design System & UI Standards](./006-enterprise-design-system-ui-standards.md)                                                                                    | Active — Design System (permanent foundation)                |
| 007 | [Identity, Authentication, Authorisation & RBAC Architecture](./007-identity-authentication-authorisation-rbac-architecture.md)                                              | Active — IAM (core platform capability)                      |
| 008 | [Module, Plugin & Connector Architecture](./008-module-plugin-connector-architecture.md)                                                                                     | Active — modular architecture (permanent)                    |
| 009 | [Platform Service Layer & Integration Framework](./009-platform-service-layer-integration-framework.md)                                                                      | Active — PSL (operational backbone)                          |
| 010 | [API Gateway, Integration & Communication Standards](./010-api-gateway-integration-communication-standards.md)                                                               | Active — communication framework                             |
| 011 | [Platform Data Architecture & Database Design Principles](./011-platform-data-architecture-database-design-principles.md)                                                    | Active — platform data architecture                          |
| 012 | [Event-Driven Architecture, Background Processing & Workflow Framework](./012-event-driven-architecture-background-processing-workflow-framework.md)                         | Active — EDA & background processing                         |
| 013 | [Security Architecture & Zero Trust Framework](./013-security-architecture-zero-trust-framework.md)                                                                          | Active — security architecture (v1.0, approved)              |
| 014 | [Observability, Monitoring, Telemetry & Health Management Framework](./014-observability-monitoring-telemetry-health-framework.md)                                           | Active — observability (v1.0, approved)                      |
| 015 | [Software Quality, Testing, QA, CI/CD & Release Management Framework](./015-software-quality-testing-qa-cicd-release-management-framework.md)                                | Active — quality & release (v1.0, mandatory)                 |
| 016 | [Desktop Shell Architecture & User Experience Framework](./016-desktop-shell-architecture-user-experience-framework.md)                                                      | Active — shell architecture (v1.0, foundation)               |
| 017 | [Navigation Framework & Workspace Navigation Architecture](./017-navigation-framework-workspace-navigation-architecture.md)                                                  | Active — navigation framework (v1.0, foundation)             |
| 018 | [Workspace Sessions, Window Management & State Persistence Framework](./018-workspace-sessions-window-management-state-persistence-framework.md)                             | Active — sessions & state (v1.0, core platform)              |
| 019 | [Universal Command Palette & Action Framework](./019-universal-command-palette-action-framework.md)                                                                          | Active — command palette (v1.0, core platform)               |
| 020 | [Unified Search, Knowledge & Discovery Framework](./020-unified-search-knowledge-discovery-framework.md)                                                                     | Active — unified search (v1.0, core platform)                |
| 021 | [Notification, Activity & Attention Management Framework](./021-notification-activity-attention-management-framework.md)                                                     | Active — notifications & attention (v1.0, core platform)     |
| 022 | [Presentation Engine, Theme Framework & Branding Architecture](./022-presentation-engine-theme-framework-branding-architecture.md)                                           | Active — presentation & theming (v1.0, core platform)        |
| 023 | [User Preferences, Personalisation & Workspace Experience Framework](./023-user-preferences-personalisation-workspace-experience-framework.md)                               | Active — preferences & personalisation (v1.0, core platform) |
| 024 | [APZHUB Platform SDK & Development Framework](./024-apzhub-platform-sdk-development-framework.md)                                                                            | Active — Platform SDK (v1.0, mandatory)                      |
| 025 | [Module SDK, Module Manifest & Module Development Standard](./025-module-sdk-module-manifest-module-development-standard.md)                                                 | Active — Module SDK (v1.0, mandatory)                        |
| 026 | [Integration SDK, Adapter Framework & Integration Manifest Specification](./026-integration-sdk-adapter-framework-integration-manifest-specification.md)                     | Active — Integration SDK (v1.0, mandatory)                   |
| 027 | [Platform Service SDK, Business Service Framework & Service Manifest Specification](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md) | Active — Platform Service SDK (v1.0, mandatory)              |
| 028 | [UI Component SDK, Design System SDK & Component Manifest Specification](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md)                       | Active — UI Component SDK (v1.0, mandatory)                  |
| 029 | [Platform Event SDK, Event Bus & Event Manifest Specification](./029-platform-event-sdk-event-bus-event-manifest-specification.md)                                           | Active — Platform Event SDK (v1.0, mandatory)                |
| —   | [Terminology quick reference](./terminology-quick-reference.md)                                                                                                              | Derived lookup (001 + 002)                                   |
| —   | [Architecture quick reference](./architecture-quick-reference.md)                                                                                                            | Derived lookup (003)                                         |
| —   | [Technology stack quick reference](./technology-stack-quick-reference.md)                                                                                                    | Derived lookup (004)                                         |
| —   | [Desktop framework quick reference](./desktop-framework-quick-reference.md)                                                                                                  | Derived lookup (005)                                         |
| —   | [Design system quick reference](./design-system-quick-reference.md)                                                                                                          | Derived lookup (006)                                         |
| —   | [IAM quick reference](./iam-quick-reference.md)                                                                                                                              | Derived lookup (007)                                         |
| —   | [Module & connector quick reference](./module-connector-quick-reference.md)                                                                                                  | Derived lookup (008)                                         |
| —   | [Platform services quick reference](./platform-services-quick-reference.md)                                                                                                  | Derived lookup (009)                                         |
| —   | [API & communication quick reference](./api-communication-quick-reference.md)                                                                                                | Derived lookup (010)                                         |
| —   | [Platform data quick reference](./platform-data-quick-reference.md)                                                                                                          | Derived lookup (011)                                         |
| —   | [Events & background quick reference](./events-background-quick-reference.md)                                                                                                | Derived lookup (012)                                         |
| —   | [Security quick reference](./security-quick-reference.md)                                                                                                                    | Derived lookup (013)                                         |
| —   | [Observability quick reference](./observability-quick-reference.md)                                                                                                          | Derived lookup (014)                                         |
| —   | [Quality & release quick reference](./quality-release-quick-reference.md)                                                                                                    | Derived lookup (015)                                         |
| —   | [Desktop shell quick reference](./desktop-shell-quick-reference.md)                                                                                                          | Derived lookup (016)                                         |
| —   | [Navigation quick reference](./navigation-quick-reference.md)                                                                                                                | Derived lookup (017)                                         |
| —   | [Workspace sessions quick reference](./workspace-sessions-quick-reference.md)                                                                                                | Derived lookup (018)                                         |
| —   | [Command palette quick reference](./command-palette-quick-reference.md)                                                                                                      | Derived lookup (019)                                         |
| —   | [Unified search quick reference](./unified-search-quick-reference.md)                                                                                                        | Derived lookup (020)                                         |
| —   | [Notifications & activity quick reference](./notifications-activity-quick-reference.md)                                                                                      | Derived lookup (021)                                         |
| —   | [Presentation & theme quick reference](./presentation-theme-quick-reference.md)                                                                                              | Derived lookup (022)                                         |
| —   | [User preferences quick reference](./user-preferences-quick-reference.md)                                                                                                    | Derived lookup (023)                                         |
| —   | [Platform SDK quick reference](./platform-sdk-quick-reference.md)                                                                                                            | Derived lookup (024)                                         |
| —   | [Module SDK quick reference](./module-sdk-quick-reference.md)                                                                                                                | Derived lookup (025)                                         |
| —   | [Integration SDK quick reference](./integration-sdk-quick-reference.md)                                                                                                      | Derived lookup (026)                                         |
| —   | [Platform Service SDK quick reference](./platform-service-sdk-quick-reference.md)                                                                                            | Derived lookup (027)                                         |
| —   | [UI Component SDK quick reference](./ui-component-sdk-quick-reference.md)                                                                                                    | Derived lookup (028)                                         |
| —   | [Platform Event SDK quick reference](./platform-event-sdk-quick-reference.md)                                                                                                | Derived lookup (029)                                         |
| —   | [Engineering Constitution quick reference](./engineering-constitution-quick-reference.md)                                                                                    | Derived lookup (000)                                         |
| —   | [Environment baseline](../ENVIRONMENT.md)                                                                                                                                    | Host inventory (existing platform coexistence)               |

## Build guides

| ID        | Title                                                                         | Status                                          |
| --------- | ----------------------------------------------------------------------------- | ----------------------------------------------- |
| BUILD-001 | [Repository Bootstrap Guide](./build/BUILD-001-repository-bootstrap-guide.md) | **Complete** — monorepo foundation bootstrapped |
| —         | [BUILD-001 quick reference](./build-001-quick-reference.md)                   | Derived lookup (BUILD-001)                      |

## Architecture baseline & governance

| Document                                                                                                                    | Description                                                                  |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [Architecture Baseline v1.0](./architecture/APZHUB-Architecture-Baseline-v1.0.md)                                           | **Frozen** — definitive architectural reference                              |
| [Engineering Handbook](./governance/APZHUB-Engineering-Handbook.md)                                                         | Onboarding and platform development process                                  |
| [Capability Development Guide](./governance/APZHUB-Capability-Development-Guide.md)                                         | How to build a capability (Example Capability)                               |
| [Workbench Development Guide](./governance/APZHUB-Workbench-Development-Guide.md)                                           | Safe Workbench extension                                                     |
| [Runtime Development Guide](./governance/APZHUB-Runtime-Development-Guide.md)                                               | Safe Runtime extension                                                       |
| [v1.0 Baseline Review](./reviews/APZHUB-v1.0-Baseline-Review.md)                                                            | Baseline architecture review — READY WITH OBSERVATIONS                       |
| [command-framework.md](./architecture/command-framework.md)                                                                 | Action Framework architecture (M4)                                           |
| [knowledge-discovery-framework.md](./architecture/knowledge-discovery-framework.md)                                         | Knowledge & Discovery Framework architecture (M5)                            |
| [action-framework-onboarding.md](./developer/action-framework-onboarding.md)                                                | Developer onboarding — add actions                                           |
| [knowledge-discovery-onboarding.md](./developer/knowledge-discovery-onboarding.md)                                          | Developer onboarding — Knowledge Providers & Experiences                     |
| [event-notification-onboarding.md](./developer/event-notification-onboarding.md)                                            | Developer onboarding — events, routes, Notification Experiences              |
| [v0.4.0-action-framework Release Notes](./releases/v0.4.0-action-framework.md)                                              | Prepared — tag pending                                                       |
| [SPR-004 Production Readiness Review](./reviews/SPR-004-production-readiness-review.md)                                     | M4 readiness — READY WITH OBSERVATIONS                                       |
| [SPR-005 Architecture Review](./reviews/SPR-005-architecture-review.md)                                                     | M5 architecture — APPROVED WITH OBSERVATIONS                                 |
| [MILESTONE-005 Production Readiness](./reviews/MILESTONE-005-knowledge-discovery-production-readiness.md)                   | M5 readiness — PASS WITH OBSERVATIONS                                        |
| [SPR-006 Architecture Review](./reviews/SPR-006-architecture-review.md)                                                     | M6 architecture — APPROVED WITH OBSERVATIONS                                 |
| [MILESTONE-006 Production Readiness](./reviews/MILESTONE-006-production-readiness.md)                                       | M6 readiness — PASS WITH OBSERVATIONS                                        |
| [Event & Notification architecture](./architecture/event-notification-framework.md)                                         | M6 combined layer — EN-017 complete                                          |
| [APZHUB Platform v5.0](./releases/APZHUB-Platform-v5.0.md)                                                                  | Official Platform 5.0 release — **permanent baseline**                       |
| [APZHUB v5.0 Platform Review](./reviews/APZHUB-v5.0-Platform-Review.md)                                                     | M1–M7 platform review — APPROVED FOR PRODUCT VALIDATION                      |
| [APZHUB v6.0 Architecture Review](./reviews/APZHUB-v6.0-Architecture-Review.md)                                             | M16 engineering review — **VERY GOOD**                                       |
| [APZHUB v6.0 Platform Review](./releases/APZHUB-v6.0-Platform-Review.md)                                                    | M16 platform review release (no tag)                                         |
| [M16 Completion Report](./sprint/M16-completion-report.md)                                                                  | M16 stabilisation & engineering review — complete                            |
| [APZHUB Platform Technical Debt Register](./architecture/APZHUB-Platform-Technical-Debt-Register.md)                        | Consolidated cross-platform technical debt                                   |
| [Platform Capability Matrix](./architecture/APZHUB-Platform-Capability-Matrix.md)                                           | Cross-framework pattern reference (v5.0)                                     |
| [Product Validation Strategy](./strategy/APZHUB-Product-Validation-Strategy.md)                                             | Law Firm Platform validation planning                                        |
| [Law Platform v1.0](./releases/APZHUB-Law-Platform-v1.0.md)                                                                 | Law Firm Platform planning baseline                                          |
| [Law Platform Reference Architecture](./architecture/APZHUB-Law-Platform-Reference-Architecture.md)                         | Platform → Law Platform layer model                                          |
| [Law Capability Map](./architecture/APZHUB-Law-Capability-Map.md)                                                           | Legal modules → platform frameworks                                          |
| [Law Platform Validation Strategy](./strategy/APZHUB-Law-Platform-Validation-Strategy.md)                                   | Measurable framework validation goals                                        |
| [LAW-001 Foundation Planning](./sprint/LAW-001-foundation-planning.md)                                                      | Law Platform Sprint 1 — planning                                             |
| [Law Platform Backlog](./backlog/LAW-Platform-Backlog.md)                                                                   | LAW-001–LAW-015 milestones                                                   |
| [Law Platform Architecture Index](./architecture/LAW-Architecture-Index.md)                                                 | LAW architecture document registry                                           |
| [LAW-015 Trust Accounting](./architecture/LAW-Trust-Reference-Architecture.md)                                              | Trust subsystem — **milestone closed** (LAW-015-14)                          |
| [LAW-015 Backlog](./backlog/LAW-015-Trust-Accounting-Backlog.md)                                                            | LAW-015-01–015-15 — milestone closed                                         |
| [LAW-015 Review](./reviews/LAW-015-Trust-Accounting-Review.md)                                                              | Trust milestone review — PASS WITH OBSERVATIONS                              |
| [LAW Trust v1.0](./releases/LAW-Trust-v1.0.md)                                                                              | Trust Accounting release notes (no tag)                                      |
| [FIN-001 Architecture Review](./reviews/FIN-001-Architecture-Review.md)                                                     | Financial Engine extraction — **DEFER EXTRACTION**                           |
| [Law Platform Readiness](./reviews/APZHUB-Law-Platform-Readiness.md)                                                        | APPROVED FOR PRODUCT VALIDATION                                              |
| [SPR-008 Readiness Review](./reviews/SPR-008-readiness-review.md)                                                           | M8 planning readiness                                                        |
| [SPR-008 Sprint Guide](./sprint/SPR-008-platform-identity-administration-ux.md)                                             | Platform Identity, Administration & UX                                       |
| [SPR-008 Backlog](./backlog/SPR-008-platform-identity-administration-ux-backlog.md)                                         | IAUX-001–IAUX-018 engineering stories                                        |
| [M8-01 Completion Report](./sprint/M8-01-completion-report.md)                                                              | Identity & Tenant Foundation — **complete**                                  |
| [M8-03 Completion Report](./sprint/M8-03-completion-report.md)                                                              | Platform Operations Console — **complete**                                   |
| [M8-04 Completion Report](./sprint/M8-04-completion-report.md)                                                              | Personalisation Framework Phase 1 — **complete**                             |
| [Platform Personalisation Reference Architecture](./architecture/APZHUB-Platform-Personalisation-Reference-Architecture.md) | M8-04 personalisation layer                                                  |
| [Platform Preference Model](./architecture/APZHUB-Platform-Preference-Model.md)                                             | M8-04 preference schema                                                      |
| [Workbench Personalisation Guide](./architecture/APZHUB-Workbench-Personalisation-Guide.md)                                 | Workbench integration                                                        |
| [Platform Personalisation Onboarding](./developer/platform-personalisation-onboarding.md)                                   | Developer guide                                                              |
| [ADR-0043 Platform Personalisation Framework](./adr/ADR-0043-platform-personalisation-framework.md)                         | M8-04 ADR                                                                    |
| [@apzhub/platform-personalisation](../../packages/platform-personalisation/)                                                | M8-04 implementation package                                                 |
| [M8-05 Completion Report](./sprint/M8-05-completion-report.md)                                                              | Governance & Provisioning Framework — **complete**                           |
| [Platform Governance Reference Architecture](./architecture/APZHUB-Platform-Governance-Reference-Architecture.md)           | M8-05 governance layer                                                       |
| [Platform Provisioning Architecture](./architecture/APZHUB-Platform-Provisioning-Architecture.md)                           | M8-05 provisioning                                                           |
| [Platform Capability Model](./architecture/APZHUB-Platform-Capability-Model.md)                                             | Capability registry                                                          |
| [Platform Feature Flag Architecture](./architecture/APZHUB-Platform-Feature-Flag-Architecture.md)                           | Feature flag foundation                                                      |
| [Platform Governance Onboarding](./developer/platform-governance-onboarding.md)                                             | Developer guide                                                              |
| [ADR-0044 Platform Governance & Provisioning](./adr/ADR-0044-platform-governance-provisioning-framework.md)                 | M8-05 ADR                                                                    |
| [@apzhub/platform-governance](../../packages/platform-governance/)                                                          | M8-05 implementation package                                                 |
| [M8-06 Completion Report](./sprint/M8-06-completion-report.md)                                                              | Platform Security & Operational Resilience — **complete**                    |
| [Platform Security Reference Architecture](./architecture/APZHUB-Platform-Security-Reference-Architecture.md)               | M8-06 security layer                                                         |
| [Operational Resilience Architecture](./architecture/APZHUB-Operational-Resilience-Architecture.md)                         | M8-06 resilience layer                                                       |
| [Security Operations Guide](./governance/APZHUB-Security-Operations-Guide.md)                                               | M8-06 security ops                                                           |
| [Incident Response Guide](./governance/APZHUB-Incident-Response-Guide.md)                                                   | M8-06 incident response                                                      |
| [Disaster Recovery Overview](./governance/APZHUB-Disaster-Recovery-Overview.md)                                             | M8-06 DR overview                                                            |
| [Security Diagnostics Guide](./governance/APZHUB-Security-Diagnostics-Guide.md)                                             | M8-06 diagnostics                                                            |
| [ADR-0045 Platform Security & Operational Resilience](./adr/ADR-0045-platform-security-operational-resilience.md)           | M8-06 ADR                                                                    |
| [@apzhub/platform-security](../../packages/platform-security/)                                                              | M8-06 implementation package                                                 |
| [PC-001 Completion Report](./sprint/PC-001-completion-report.md)                                                            | Platform Core Certification — **complete**                                   |
| [Platform Core Certification](./reviews/APZHUB-Platform-Core-Certification.md)                                              | **CERTIFIED WITH OBSERVATIONS**                                              |
| [Platform Core Reference Architecture](./architecture/APZHUB-Platform-Core-Reference-Architecture.md)                       | **Canonical** Platform Core architecture                                     |
| [Platform Core Capability Reference](./architecture/APZHUB-Platform-Core-Capability-Reference.md)                           | Per-capability catalogue                                                     |
| [Platform Core Commercial Assessment](./reviews/APZHUB-Platform-Core-Commercial-Assessment.md)                              | Commercial deployment tiers                                                  |
| [Platform Core v1.0 Release Review](./releases/APZHUB-Platform-Core-v1.0.md)                                                | Platform Core v1.0 (no tag)                                                  |
| [Platform Core v2 Roadmap](./roadmap/APZHUB-Platform-Core-v2-Roadmap.md)                                                    | PCv2 planned milestones                                                      |
| [PCv2-01 Sprint Guide](./sprint/PCv2-01-Production-Readiness-Sprint-Guide.md)                                               | Production Readiness & Operational Hardening — **implementation authorised** |
| [PCv2-01 Backlog](./backlog/PCv2-01-Backlog.md)                                                                             | PRH-001–PRH-018 engineering stories                                          |
| [PCv2-01 Production Readiness Architecture](./architecture/PCv2-01-Production-Readiness-Architecture.md)                    | Target production architecture (post-PCv2-01)                                |
| [PCv2-01 Readiness Review](./reviews/PCv2-01-Readiness-Review.md)                                                           | READY WITH OBSERVATIONS                                                      |
| [PCv2-01 Planning Completion Report](./sprint/PCv2-01-planning-completion-report.md)                                        | PCv2-01 planning closeout                                                    |
| [PRH-000 Owner Acceptance](./reviews/PRH-000-Owner-Acceptance.md)                                                           | **APPROVED** — contractual baseline for PCv2-01                              |
| [PRH-000 Implementation Baseline](./reviews/PRH-000-Implementation-Baseline.md)                                             | Frozen architecture, backlog, acceptance criteria                            |
| [PRH-000 Sprint Baseline](./releases/PRH-000-Sprint-Baseline.md)                                                            | Sprint summary — DoD, production ready definition                            |
| [PRH-000 Completion Report](./sprint/PRH-000-completion-report.md)                                                          | PRH-000 governance closeout                                                  |
| [PRH-001 Completion Report](./sprint/PRH-001-completion-report.md)                                                          | Bootstrap consolidation — **complete**                                       |
| [PRH-002 Completion Report](./sprint/PRH-002-completion-report.md)                                                          | CSP audit & enforcement — **complete**                                       |
| [PRH-003 Completion Report](./sprint/PRH-003-completion-report.md)                                                          | HTTP security headers — **complete**                                         |
| [PRH-004 Completion Report](./sprint/PRH-004-completion-report.md)                                                          | Configuration & secrets governance — **complete**                            |
| [PRH-005 Completion Report](./sprint/PRH-005-completion-report.md)                                                          | Platform traffic governance — **complete**                                   |
| [PRH-006 Completion Report](./sprint/PRH-006-completion-report.md)                                                          | Session security hardening — **complete**                                    |
| [PRH-007 Completion Report](./sprint/PRH-007-completion-report.md)                                                          | Tenant isolation validation — **complete**                                   |
| [PRH-008 Completion Report](./sprint/PRH-008-completion-report.md)                                                          | Platform Operations Control Plane — **complete**                             |
| [Platform Operations Control Plane Architecture](./architecture/APZHUB-Platform-Operations-Control-Plane-Architecture.md)   | Canonical control plane (PRH-008)                                            |
| [Capability Health Model](./architecture/APZHUB-Capability-Health-Model.md)                                                 | Per-capability health contract (PRH-008)                                     |
| [Operations Dashboard Guide](./developer/APZHUB-Operations-Dashboard-Guide.md)                                              | Operator dashboard guide (PRH-008)                                           |
| [Production Verification Guide](./governance/APZHUB-Production-Verification-Guide.md)                                       | Production readiness verdicts (PRH-008)                                      |
| [Operational Readiness Guide](./governance/APZHUB-Operational-Readiness-Guide.md)                                           | Two-minute operator checklist (PRH-008)                                      |
| [@apzhub/platform-operations](../../packages/platform-operations/)                                                          | PRH-008 implementation package                                               |
| [PRH-009 Completion Report](./sprint/PRH-009-completion-report.md)                                                          | Platform Lifecycle Management — **complete**                                 |
| [Platform Lifecycle Architecture](./architecture/APZHUB-Platform-Lifecycle-Architecture.md)                                 | Canonical lifecycle manager (PRH-009)                                        |
| [Lifecycle State Machine](./architecture/APZHUB-Lifecycle-State-Machine.md)                                                 | Platform lifecycle transitions (PRH-009)                                     |
| [Operational Lifecycle Guide](./governance/APZHUB-Operational-Lifecycle-Guide.md)                                           | Operator maintenance/shutdown/recovery (PRH-009)                             |
| [Platform Lifecycle Developer Guide](./developer/APZHUB-Platform-Lifecycle-Developer-Guide.md)                              | Capability/product registration (PRH-009)                                    |
| [@apzhub/platform-lifecycle](../../packages/platform-lifecycle/)                                                            | PRH-009 implementation package                                               |
| [PRH-010 Completion Report](./sprint/PRH-010-completion-report.md)                                                          | Platform Reliability & Failure Validation — **complete**                     |
| [Platform Reliability Architecture](./architecture/APZHUB-Platform-Reliability-Architecture.md)                             | Failure validation architecture (PRH-010)                                    |
| [Failure Injection Guide](./governance/APZHUB-Failure-Injection-Guide.md)                                                   | Controlled failure fixtures (PRH-010)                                        |
| [Operational Recovery Guide](./governance/APZHUB-Operational-Recovery-Guide.md)                                             | Operator recovery workflow (PRH-010)                                         |
| [Reliability Validation Report](./reviews/APZHUB-Reliability-Validation-Report.md)                                          | PRH-010 validation verdict — **PASS**                                        |
| [PRH-011 Completion Report](./sprint/PRH-011-completion-report.md)                                                          | Platform Architecture Compliance — **complete**                              |
| [Architecture Compliance Report](./reviews/APZHUB-Architecture-Compliance-Report.md)                                        | PRH-011 compliance review                                                    |
| [Capability Certification Matrix](./reviews/APZHUB-Capability-Certification-Matrix.md)                                      | PRH-011 per-capability certification                                         |
| [Platform Dependency Review](./reviews/APZHUB-Platform-Dependency-Review.md)                                                | PRH-011 dependency direction review                                          |
| [Platform Package Review](./reviews/APZHUB-Platform-Package-Review.md)                                                      | PRH-011 package inventory review                                             |
| [Platform Boundary Review](./reviews/APZHUB-Platform-Boundary-Review.md)                                                    | PRH-011 platform vs product boundaries                                       |
| [Platform Core v2 Commercial Readiness Update](./reviews/APZHUB-Platform-Core-v2-Commercial-Readiness-Update.md)            | Post PRH-010 commercial posture                                              |
| [Platform Core v2 Technical Debt Review](./reviews/APZHUB-Platform-Core-v2-Technical-Debt-Review.md)                        | PRH-011 debt assessment                                                      |
| [Platform Core v2 Certification](./reviews/APZHUB-Platform-Core-v2-Certification.md)                                        | **CERTIFIED WITH OBSERVATIONS**                                              |
| [OSS Integration Master Architecture](./architecture/APZHUB-OSS-Integration-Master-Architecture.md)                         | Canonical OSS integration architecture (OSS-001)                             |
| [OSS Product Integration Catalog](./architecture/APZHUB-OSS-Product-Integration-Catalog.md)                                 | Per-product specifications — all 9 waves (OSS-001)                           |
| [OSS Capability Mapping](./architecture/APZHUB-OSS-Capability-Mapping.md)                                                   | OSS → APZHUB capability map (OSS-001)                                        |
| [OSS Integration Standards](./governance/APZHUB-OSS-Integration-Standards.md)                                               | Mandatory integration standards (OSS-001)                                    |
| [OSS Integration Risk Register](./governance/APZHUB-OSS-Integration-Risk-Register.md)                                       | Planning risk register (OSS-001)                                             |
| [Session Security Architecture](./architecture/APZHUB-Session-Security-Architecture.md)                                     | Canonical session policy (PRH-006)                                           |
| [Session Policy Guide](./governance/APZHUB-Session-Policy-Guide.md)                                                         | Cookie and timeout policy                                                    |
| [Traffic Governance Architecture](./architecture/APZHUB-Traffic-Governance-Architecture.md)                                 | Canonical traffic policies (PRH-005)                                         |
| [Traffic Policy Guide](./governance/APZHUB-Traffic-Policy-Guide.md)                                                         | Policy registry and limits                                                   |
| [Configuration Architecture](./architecture/APZHUB-Configuration-Architecture.md)                                           | Canonical config provider (PRH-004)                                          |
| [Secrets Architecture](./architecture/APZHUB-Secrets-Architecture.md)                                                       | Secret classification & masking (PRH-004)                                    |
| [Environment Governance](./governance/APZHUB-Environment-Governance.md)                                                     | Registry, profiles, startup guard                                            |
| [Configuration Developer Guide](./governance/APZHUB-Configuration-Developer-Guide.md)                                       | Developer consumption patterns                                               |
| [HTTP Security Headers Architecture](./architecture/APZHUB-HTTP-Security-Headers-Architecture.md)                           | Centralised header policy (PRH-003)                                          |
| [PRH-003 Header Compliance Report](./security/PRH-003-HTTP-Header-Compliance-Report.md)                                     | Endpoint compliance matrix                                                   |
| [PCv2-01 CSP Audit](./security/PCv2-01-CSP-Audit.md)                                                                        | CSP source inventory (PRH-002)                                               |
| [CSP Violation Reporting](./security/CSP-Violation-Reporting.md)                                                            | Violation endpoint documentation                                             |
| [Platform Bootstrap Architecture](./architecture/APZHUB-Platform-Bootstrap-Architecture.md)                                 | Canonical bootstrap architecture (PRH-001)                                   |
| [ADR-0046 Production Readiness Bootstrap](./adr/ADR-0046-production-readiness-bootstrap-consolidation.md)                   | PRH-001 ADR                                                                  |
| [@apzhub/platform-bootstrap](../../packages/platform-bootstrap/)                                                            | PRH-001 implementation package                                               |
| [Platform Operations Reference Architecture](./architecture/APZHUB-Platform-Operations-Reference-Architecture.md)           | M8-03 operations layer                                                       |
| [Platform Operations Console Guide](./developer/APZHUB-Platform-Operations-Console-Guide.md)                                | Developer guide                                                              |
| [Platform Operations UX Guide](./governance/APZHUB-Platform-Operations-UX-Guide.md)                                         | UX patterns                                                                  |
| [ADR-0042 Platform Operations Console](./adr/ADR-0042-platform-operations-console.md)                                       | M8-03 ADR                                                                    |
| [Platform Authorization Reference Architecture](./architecture/APZHUB-Platform-Authorization-Reference-Architecture.md)     | M8-02 RBAC layer                                                             |
| [ADR-0041 Platform Authorization RBAC Phase 1](./adr/ADR-0041-platform-authorization-rbac-phase-1.md)                       | M8-02 ADR                                                                    |
| [@apzhub/platform-authorization](../../packages/platform-authorization/)                                                    | M8-02 implementation package                                                 |
| [Platform Identity Reference Architecture](./architecture/APZHUB-Platform-Identity-Reference-Architecture.md)               | M8-01 identity layer                                                         |
| [Platform Tenant Architecture](./architecture/APZHUB-Platform-Tenant-Architecture.md)                                       | M8-01 tenant model                                                           |
| [ADR-0040 Platform Tenant Foundation](./adr/ADR-0040-platform-tenant-foundation.md)                                         | M8-01 ADR                                                                    |
| [@apzhub/platform-identity](../../packages/platform-identity/)                                                              | M8-01 implementation package                                                 |
| [APZHUB Platform v4.0](./releases/APZHUB-Platform-v4.0.md)                                                                  | Platform 4.0 — superseded by Platform 5.0                                    |
| [Platform Reference Patterns](./architecture/APZHUB-Platform-Reference-Patterns.md)                                         | Authoritative patterns (v4.0)                                                |
| [SPR-007 Readiness Review](./reviews/SPR-007-readiness-review.md)                                                           | M7 planning readiness                                                        |
| [SPR-007 Sprint Guide](./sprint/SPR-007-activity-timeline-framework.md)                                                     | Activity & Timeline Framework — **Closed**                                   |
| [SPR-007 Spec Index](./specs/SPR-007-spec-index.md)                                                                         | AT-001–AT-016 specifications                                                 |
| [Activity & Timeline architecture](./architecture/activity-timeline-framework.md)                                           | M7 combined layer — complete                                                 |
| [Activity Timeline onboarding](./developer/activity-timeline-onboarding.md)                                                 | Developer guide — activity types, timelines, E2E                             |
| [SPR-007 Architecture Review](./reviews/SPR-007-architecture-review.md)                                                     | M7 architecture — APPROVED WITH OBSERVATIONS                                 |
| [MILESTONE-007 Production Readiness](./reviews/MILESTONE-007-production-readiness.md)                                       | M7 readiness — PASS WITH OBSERVATIONS                                        |
| [MILESTONE-007 Review](./reviews/MILESTONE-007-activity-timeline-framework-review.md)                                       | M7 milestone — PASS WITH OBSERVATIONS                                        |
| [SPR-007 Closeout](./sprint/SPR-007-closeout.md)                                                                            | Sprint 007 closeout — complete                                               |
| [v0.7.0 Release Notes](./releases/v0.7.0-activity-timeline-framework.md)                                                    | Prepared — tag pending owner instruction                                     |
| [AT-016 Completion Report](./sprint/AT-016-completion-report.md)                                                            | AT-016 complete — await M8 planning                                          |
| [SPR-007 Backlog](./backlog/SPR-007-activity-timeline-framework-backlog.md)                                                 | AT-001–AT-016 engineering stories                                            |
| [Platform Design Patterns](./architecture/APZHUB-Platform-Design-Patterns.md)                                               | Canonical patterns — authoritative for M6+                                   |
| [APZHUB v3.0 Platform Review](./reviews/APZHUB-v3.0-Platform-Review.md)                                                     | M1–M5 platform review                                                        |
| [SPR-006 Readiness Review](./reviews/SPR-006-readiness-review.md)                                                           | M6 planning readiness                                                        |
| [SPR-006 Spec Index](./specs/SPR-006-spec-index.md)                                                                         | EN-001–EN-018 specifications                                                 |
| [Event Framework architecture](./architecture/event-framework.md)                                                           | M6 Event layer                                                               |
| [Notification Framework architecture](./architecture/notification-framework.md)                                             | M6 Notification layer                                                        |
| [EN-001 Completion Report](./sprint/EN-001-completion-report.md)                                                            | EN-001 complete — await review                                               |

## Backlog

| Document                                                                                            | Description                                      |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [SPR-004 Action Framework Backlog](./backlog/SPR-004-action-framework-backlog.md)                   | Engineering stories AF-001–AF-022 — **complete** |
| [SPR-005 Knowledge & Discovery Backlog](./backlog/SPR-005-knowledge-discovery-framework-backlog.md) | Engineering stories DF-001–DF-018 — **complete** |
| [SPR-006 Event & Notification Backlog](./backlog/SPR-006-event-notification-framework-backlog.md)   | Engineering stories EN-001–EN-018 — **complete** |
| [SPR-007 Activity & Timeline Backlog](./backlog/SPR-007-activity-timeline-framework-backlog.md)     | Engineering stories AT-001–AT-016 — **complete** |
| [LAW-015 Trust Accounting Backlog](./backlog/LAW-015-Trust-Accounting-Backlog.md)                   | LAW-015-01–015-15 — **milestone closed**         |

## Implementation sprints

| ID      | Title                                                                                                          | Status                                                 |
| ------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| SPR-001 | [Monorepo Foundation & Development Environment](./SPR-001-monorepo-foundation-development-environment.md)      | **Complete**                                           |
| M2      | [Milestone 2 — Platform Runtime Review](./reviews/MILESTONE-002-platform-runtime-review.md)                    | **Complete** — PASS                                    |
| M3      | [Milestone 3 — Workbench Framework Review](./reviews/MILESTONE-003-workbench-framework-review.md)              | **Complete** — PASS WITH OBSERVATIONS                  |
| —       | [Platform Roadmap](./architecture/platform-roadmap.md)                                                         | Active — Milestones 4–9                                |
| PC-001  | [Platform Core Certification](./sprint/PC-001-completion-report.md)                                            | **Complete** — CERTIFIED WITH OBSERVATIONS             |
| PCv2-01 | [Production Readiness & Operational Hardening](./sprint/PCv2-01-Production-Readiness-Sprint-Guide.md)          | **Authorised** — PRH-000 approved; PRH-001–018 backlog |
| —       | [PRH-000 Owner Acceptance](./reviews/PRH-000-Owner-Acceptance.md)                                              | **Approved** — implementation baseline frozen          |
| —       | [PRH-000 Implementation Baseline](./reviews/PRH-000-Implementation-Baseline.md)                                | Immutable contractual baseline                         |
| —       | [PRH-000 Sprint Baseline](./releases/PRH-000-Sprint-Baseline.md)                                               | DoD and production-ready definition                    |
| —       | [PCv2-01 Backlog](./backlog/PCv2-01-Backlog.md)                                                                | PRH-001–PRH-018 — frozen                               |
| —       | [PRH-000 Completion Report](./sprint/PRH-000-completion-report.md)                                             | Governance closeout — ready for PRH-001                |
| SPR-003 | [Workbench Framework Sprint Guide](./sprint/SPR-003-workbench-framework.md)                                    | **Closed** — Milestone 3 complete                      |
| —       | [SPR-003 Implementation Plan](./sprint/SPR-003-implementation-plan.md)                                         | Closed — Sprint 003 complete                           |
| —       | [SPR-003 Closeout](./sprint/SPR-003-closeout.md)                                                               | Complete — await owner approval                        |
| —       | [Workbench Framework architecture](./architecture/workbench-framework.md)                                      | Active — M3 layer                                      |
| —       | [Workbench Manager architecture](./architecture/workbench-manager.md)                                          | Active — M3 subsystems                                 |
| —       | [SPR-003 Architecture Review](./reviews/SPR-003-architecture-review.md)                                        | Complete                                               |
| —       | [SPR-003 Architecture Refinement](./reviews/SPR-003-architecture-refinement.md)                                | Approved                                               |
| —       | [SPR-003 Phase 0 ADR Report](./reviews/SPR-003-phase-0-adr-report.md)                                          | Approved                                               |
| —       | [SPR-003 Phase 1 Report](./sprint/SPR-003-phase-1-report.md)                                                   | Complete                                               |
| —       | [SPR-003 Phase 2 Report](./sprint/SPR-003-phase-2-report.md)                                                   | Complete                                               |
| —       | [SPR-003 Phase 3–7 Reports](./sprint/)                                                                         | Complete                                               |
| —       | [SPR-003 Readiness Review](./reviews/SPR-003-readiness-review.md)                                              | Complete                                               |
| —       | [v0.3.0-workbench-framework Release Notes](./releases/v0.3.0-workbench-framework.md)                           | Prepared — tag pending                                 |
| SPR-004 | [Action Framework Sprint Guide](./sprint/SPR-004-action-framework.md)                                          | **Complete** — M4; AF-021 docs done                    |
| —       | [SPR-004 Engineering Backlog](./backlog/SPR-004-action-framework-backlog.md)                                   | AF-001–AF-021 complete                                 |
| —       | [Action Framework architecture](./architecture/command-framework.md)                                           | Active — M4 layer                                      |
| —       | [v0.4.0-action-framework Release Notes](./releases/v0.4.0-action-framework.md)                                 | Prepared — tag pending                                 |
| —       | [SPR-004 Production Readiness Review](./reviews/SPR-004-production-readiness-review.md)                        | READY WITH OBSERVATIONS                                |
| —       | [AF-021 Completion Report](./sprint/AF-021-completion-report.md)                                               | Complete — await review                                |
| —       | [AF-020 Completion Report](./sprint/AF-020-completion-report.md)                                               | Complete                                               |
| —       | [AF-001 – AF-019 Completion Reports](./sprint/)                                                                | Complete                                               |
| —       | [SPR-004 Technical Spec Index](./specs/SPR-004-spec-index.md)                                                  | Active                                                 |
| SPR-005 | [Knowledge & Discovery Sprint Guide](./sprint/SPR-005-knowledge-discovery-framework.md)                        | **Closed** — Milestone 5 complete                      |
| —       | [SPR-005 Closeout](./sprint/SPR-005-closeout.md)                                                               | Complete — await owner approval                        |
| —       | [v0.5.0-knowledge-discovery-framework Release Notes](./releases/v0.5.0-knowledge-discovery-framework.md)       | Prepared — tag pending                                 |
| —       | [MILESTONE-005 Review](./reviews/MILESTONE-005-knowledge-discovery-framework-review.md)                        | PASS WITH OBSERVATIONS                                 |
| —       | [SPR-005 Engineering Backlog](./backlog/SPR-005-knowledge-discovery-framework-backlog.md)                      | DF-001–DF-017 complete                                 |
| —       | [Knowledge & Discovery architecture](./architecture/knowledge-discovery-framework.md)                          | Active — M5 layer                                      |
| —       | [SPR-005 Technical Spec Index](./specs/SPR-005-spec-index.md)                                                  | Active                                                 |
| —       | [SPR-005 Architecture Review](./reviews/SPR-005-architecture-review.md)                                        | APPROVED WITH OBSERVATIONS                             |
| —       | [MILESTONE-005 Production Readiness](./reviews/MILESTONE-005-knowledge-discovery-production-readiness.md)      | PASS WITH OBSERVATIONS                                 |
| —       | [DF-001 – DF-018 Completion Reports](./sprint/)                                                                | Complete                                               |
| SPR-006 | [Event & Notification Sprint Guide](./sprint/SPR-006-event-notification-framework.md)                          | **Closed** — Milestone 6 complete                      |
| —       | [SPR-006 Closeout](./sprint/SPR-006-closeout.md)                                                               | Complete — await owner approval                        |
| —       | [v0.6.0-event-notification-framework Release Notes](./releases/v0.6.0-event-notification-framework.md)         | Prepared — tag pending                                 |
| —       | [MILESTONE-006 Review](./reviews/MILESTONE-006-event-notification-framework-review.md)                         | PASS WITH OBSERVATIONS                                 |
| —       | [SPR-006 Engineering Backlog](./backlog/SPR-006-event-notification-framework-backlog.md)                       | EN-001–EN-018 complete                                 |
| —       | [SPR-006 Spec Index](./specs/SPR-006-spec-index.md)                                                            | Complete                                               |
| —       | [Event & Notification architecture](./architecture/event-notification-framework.md)                            | Active — M6 layer                                      |
| —       | [Event & Notification onboarding](./developer/event-notification-onboarding.md)                                | Developer guide                                        |
| —       | [EN-001 – EN-018 Completion Reports](./sprint/)                                                                | Complete                                               |
| —       | [APZHUB Platform v4.0 Release](./releases/APZHUB-Platform-v4.0.md)                                             | Current architectural baseline                         |
| —       | [APZHUB Platform v3.0 Release](./releases/APZHUB-Platform-v3.0.md)                                             | Superseded by Platform 4.0                             |
| SPR-007 | [Activity & Timeline Sprint Guide](./sprint/SPR-007-activity-timeline-framework.md)                            | **Closed** — Milestone 7 complete                      |
| —       | [SPR-007 Closeout](./sprint/SPR-007-closeout.md)                                                               | Complete — await owner approval                        |
| —       | [v0.7.0-activity-timeline-framework Release Notes](./releases/v0.7.0-activity-timeline-framework.md)           | Prepared — tag pending                                 |
| —       | [MILESTONE-007 Review](./reviews/MILESTONE-007-activity-timeline-framework-review.md)                          | PASS WITH OBSERVATIONS                                 |
| —       | [SPR-007 Engineering Backlog](./backlog/SPR-007-activity-timeline-framework-backlog.md)                        | AT-001–AT-016 complete                                 |
| —       | [SPR-007 Spec Index](./specs/SPR-007-spec-index.md)                                                            | AT-001–AT-016 complete                                 |
| —       | [SPR-007 Architecture Review](./reviews/SPR-007-architecture-review.md)                                        | APPROVED WITH OBSERVATIONS                             |
| —       | [MILESTONE-007 Production Readiness](./reviews/MILESTONE-007-production-readiness.md)                          | PASS WITH OBSERVATIONS                                 |
| —       | [Activity Timeline onboarding](./developer/activity-timeline-onboarding.md)                                    | Developer guide                                        |
| —       | [AT-001 – AT-016 Completion Reports](./sprint/)                                                                | Complete                                               |
| —       | [@apzhub/activity-timeline-framework](../../packages/activity-timeline-framework/)                             | M7 implementation complete                             |
| SPR-008 | [Platform Identity, Administration & UX Sprint Guide](./sprint/SPR-008-platform-identity-administration-ux.md) | **M8-03 complete** — await M8-04 approval              |
| —       | [M8-03 Completion Report](./sprint/M8-03-completion-report.md)                                                 | Platform Operations Console — complete                 |
| —       | [SPR-008 Engineering Backlog](./backlog/SPR-008-platform-identity-administration-ux-backlog.md)                | IAUX-001–IAUX-018 planned                              |
| —       | [SPR-008 Readiness Review](./reviews/SPR-008-readiness-review.md)                                              | APPROVED FOR M8 PLANNING                               |
| —       | [APZHUB v3.0 Platform Review](./reviews/APZHUB-v3.0-Platform-Review.md)                                        | PASS WITH OBSERVATIONS                                 |
| SPR-002 | [Platform Registry & Discovery Framework](./sprint/SPR-002-platform-registry.md)                               | **Closed** — Milestone 2 complete                      |
| —       | [SPR-002 Implementation Plan](./sprint/SPR-002-implementation-plan.md)                                         | Closed — Sprint 002 complete                           |
| —       | [SPR-002 Phase 9 Report](./sprint/SPR-002-phase-9-report.md)                                                   | Complete — Sprint closed                               |
| —       | [SPR-002 Architecture Review](./reviews/SPR-002-architecture-review.md)                                        | Complete                                               |
| —       | [v0.2.0-platform-runtime Release Notes](./releases/v0.2.0-platform-runtime.md)                                 | Prepared — tag pending                                 |
| —       | [SPR-002 Phase 7 Report](./sprint/SPR-002-phase-7-report.md)                                                   | Complete                                               |
| —       | [SPR-002 Phase 5 Report](./sprint/SPR-002-phase-5-report.md)                                                   | Complete                                               |
| —       | [SPR-002 Phase 4 Report](./sprint/SPR-002-phase-4-report.md)                                                   | Complete                                               |
| —       | [SPR-002 Phase 3 Report](./sprint/SPR-002-phase-3-report.md)                                                   | Complete                                               |
| —       | [SPR-002 Phase 2 Report](./sprint/SPR-002-phase-2-report.md)                                                   | Complete                                               |
| —       | [SPR-002 Phase 1 Report](./sprint/SPR-002-phase-1-report.md)                                                   | Complete                                               |
| —       | [SPR-002 Phase 0 Report](./sprint/SPR-002-phase-0-report.md)                                                   | Complete                                               |
| —       | [SPR-001 Implementation Plan](./sprint/SPR-001-implementation-plan.md)                                         | Complete — execution blueprint                         |
| —       | [Sprint 001 quick reference](./sprint-001-quick-reference.md)                                                  | Derived lookup (SPR-001)                               |

**Status:** Foundation documentation complete (000, 001–029). **BUILD-001** and **SPR-001** are **complete** — reviewed **PASS WITH OBSERVATIONS** and accepted for release as **`v0.1.0-foundation`** (tag pending owner instruction).

## Architecture decisions (`docs/adr/`)

| ID       | Title                                                                                                          | Status                |
| -------- | -------------------------------------------------------------------------------------------------------------- | --------------------- |
| ADR-0001 | [Monorepo Strategy](./adr/ADR-0001-monorepo-strategy.md)                                                       | Accepted              |
| ADR-0002 | [Drizzle ORM Selection](./adr/ADR-0002-drizzle-orm-selection.md)                                               | Accepted              |
| ADR-0003 | [Better Auth Session Validation](./adr/ADR-0003-better-auth-session-validation.md)                             | Accepted              |
| ADR-0004 | [Platform Registry First Architecture](./adr/ADR-0004-platform-registry-first-architecture.md)                 | Accepted              |
| ADR-0005 | [Integration SDK Strategy](./adr/ADR-0005-integration-sdk-strategy.md)                                         | Accepted              |
| ADR-0006 | [Platform Service Architecture](./adr/ADR-0006-platform-service-architecture.md)                               | Accepted              |
| ADR-0007 | [Event Driven Communication](./adr/ADR-0007-event-driven-communication.md)                                     | Accepted              |
| ADR-0008 | [Platform Core Package](./adr/ADR-0008-platform-core-package.md)                                               | Superseded → ADR-0018 |
| ADR-0018 | [Platform Runtime Package](./adr/ADR-0018-platform-runtime-package.md)                                         | Accepted              |
| ADR-0009 | [Registry Hybrid Persistence](./adr/ADR-0009-registry-hybrid-persistence.md)                                   | Accepted              |
| ADR-0010 | [Registry Internal TypeScript API](./adr/ADR-0010-registry-internal-typescript-api.md)                         | Accepted              |
| ADR-0011 | [Unified Manifest Envelope](./adr/ADR-0011-unified-manifest-envelope.md)                                       | Accepted              |
| ADR-0012 | [Theme Manifest Registration](./adr/ADR-0012-theme-manifest-registration.md)                                   | Accepted              |
| ADR-0013 | [Registry Fail-Fast Policy](./adr/ADR-0013-registry-fail-fast-policy.md)                                       | Accepted              |
| ADR-0014 | [Registry Bootstrap Lifecycle](./adr/ADR-0014-registry-bootstrap-lifecycle.md)                                 | Accepted              |
| ADR-0015 | [Registry Boundaries and Discovery Scope](./adr/ADR-0015-registry-boundaries-and-discovery-scope.md)           | Accepted              |
| ADR-0016 | [Registry Testing Requirements](./adr/ADR-0016-registry-testing-requirements.md)                               | Accepted              |
| ADR-0017 | [Phased Implementation Review Gate](./adr/ADR-0017-phased-implementation-review-gate.md)                       | Accepted              |
| ADR-0019 | [Workbench Framework Package](./adr/ADR-0019-workbench-framework-package.md)                                   | Accepted              |
| ADR-0020 | [Workbench Request Transport](./adr/ADR-0020-workbench-request-transport.md)                                   | Accepted              |
| ADR-0021 | [Workbench Session Persistence](./adr/ADR-0021-workbench-session-persistence.md)                               | Accepted              |
| ADR-0022 | [Navigation Manifest Extension](./adr/ADR-0022-navigation-manifest-extension.md)                               | Accepted              |
| ADR-0023 | [Workbench Permission Adapter](./adr/ADR-0023-workbench-permission-adapter.md)                                 | Accepted              |
| ADR-0024 | [Command Framework Package](./adr/ADR-0024-command-framework-package.md)                                       | Accepted              |
| ADR-0025 | [Workbench Commands Manifest Extension](./adr/ADR-0025-workbench-commands-manifest.md)                         | Accepted              |
| ADR-0026 | [Command Execution and Actor Model](./adr/ADR-0026-command-execution-model.md)                                 | Accepted              |
| ADR-0027 | [Knowledge Discovery Framework Package](./adr/ADR-0027-knowledge-discovery-framework-package.md)               | Accepted              |
| ADR-0028 | [Knowledge Source Model](./adr/ADR-0028-knowledge-source-model.md)                                             | Accepted              |
| ADR-0029 | [Knowledge Discovery Execution Routing](./adr/ADR-0029-knowledge-discovery-execution-routing.md)               | Accepted              |
| ADR-0030 | [Event & Notification Framework Package](./adr/ADR-0030-event-notification-framework-package.md)               | Accepted              |
| ADR-0031 | [Event Registry and In-Process Event Bus](./adr/ADR-0031-event-registry-and-bus.md)                            | Accepted              |
| ADR-0032 | [Notification Routing and Event Separation](./adr/ADR-0032-notification-routing-model.md)                      | Accepted              |
| ADR-0033 | [Activity & Timeline Framework Package](./adr/ADR-0033-activity-timeline-framework-package.md)                 | Accepted              |
| ADR-0034 | [Activity Registry and Timeline Model](./adr/ADR-0034-activity-registry-and-timeline-model.md)                 | Accepted              |
| ADR-0035 | [Activity Execution Routing](./adr/ADR-0035-activity-execution-routing.md)                                     | Accepted              |
| ADR-0036 | [Trust Accounting as Law Platform Capability](./adr/ADR-0036-trust-accounting-law-capability.md)               | Accepted (planning)   |
| ADR-0037 | [Immutable Trust Journal](./adr/ADR-0037-immutable-trust-journal.md)                                           | Accepted (planning)   |
| ADR-0038 | [Matter Trust Balance Segregation](./adr/ADR-0038-matter-trust-balance-segregation.md)                         | Accepted (planning)   |
| ADR-0039 | [Jurisdiction-Adaptive Compliance Profile](./adr/ADR-0039-jurisdiction-adaptive-compliance-profile.md)         | Accepted (planning)   |
| ADR-0040 | [Platform Tenant Foundation](./adr/ADR-0040-platform-tenant-foundation.md)                                     | Accepted (M8-01)      |
| ADR-0041 | [Platform Authorization RBAC Phase 1](./adr/ADR-0041-platform-authorization-rbac-phase-1.md)                   | Accepted (M8-02)      |
| ADR-0042 | [Platform Operations Console](./adr/ADR-0042-platform-operations-console.md)                                   | Accepted (M8-03)      |
| ADR-0043 | [Platform Personalisation Framework](./adr/ADR-0043-platform-personalisation-framework.md)                     | Accepted (M8-04)      |
| ADR-0044 | [Platform Governance & Provisioning Framework](./adr/ADR-0044-platform-governance-provisioning-framework.md)   | Accepted (M8-05)      |
| ADR-0045 | [Platform Security & Operational Resilience](./adr/ADR-0045-platform-security-operational-resilience.md)       | Accepted (M8-06)      |
| ADR-0046 | [Production Readiness Bootstrap Consolidation](./adr/ADR-0046-production-readiness-bootstrap-consolidation.md) | Accepted (PRH-001)    |
| ADR-0047 | [Projects / Plane Integration Architecture](./adr/ADR-0047-projects-plane-integration-architecture.md)         | Accepted (OSS-101-01) |

> Legacy sprint ADRs: [docs/decisions/](./decisions/) · Index: [adr/README.md](./adr/README.md)

## Reviews

| ID       | Title                                                                                                           | Status                                |
| -------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| REV-001  | [SPR-001 Architecture & Engineering Review](./reviews/SPR-001-architecture-review.md)                           | Complete                              |
| —        | [SPR-001 Closeout Report](./reviews/SPR-001-closeout.md)                                                        | Complete                              |
| ARCH-002 | [Platform Runtime Architecture Update](./reviews/ARCH-002-platform-runtime-update.md)                           | Complete                              |
| —        | [SPR-003 Architecture Review](./reviews/SPR-003-architecture-review.md)                                         | Complete                              |
| M3       | [Milestone 3 Workbench Framework Review](./reviews/MILESTONE-003-workbench-framework-review.md)                 | Complete — PASS WITH OBSERVATIONS     |
| M5       | [Milestone 5 Knowledge & Discovery Review](./reviews/MILESTONE-005-knowledge-discovery-production-readiness.md) | Complete — PASS WITH OBSERVATIONS     |
| —        | [SPR-005 Architecture Review](./reviews/SPR-005-architecture-review.md)                                         | Complete — APPROVED WITH OBSERVATIONS |

> **Hierarchy:** [000](./000-apzhub-engineering-constitution.md) → foundation docs 001–029 → ADRs (`docs/adr/`, legacy `docs/decisions/`) → build guides → sprint guides. Build and sprint guides implement the constitution; they do not override it.

Sprint guides implement foundation documents. They do not override them. When executing a sprint, read all depends-on documents and stop at sprint boundaries.

**Execution order:** BUILD-001 (repo bootstrap) → SPR-001 (foundation) → SPR-002 (platform registry) → SPR-003 (workbench framework) → future sprints.

## Naming

- Working product name: **APZHUB** (may change later).
- Code, docs, and architecture use **APZHUB** unless the project owner directs otherwise.

## How to use these documents

0. **000** is the Engineering Constitution — supreme authority on conflict. Read first.
1. **001** is the product foundation. Later documents must not contradict 000 or 001 without explicit owner approval and ADR where required.
2. **002** governs all naming, UI language, service/adapter names, and branding.
3. **003** defines layered architecture, modules, data ownership, and design principles — non-negotiable when implementing.
4. **004** defines technology stack, monorepo layout, coding standards, testing, CI, and definition of complete.
5. **005** defines the Desktop Framework shell — build before modules; UI is permission-driven.
6. **006** defines the Enterprise Design System — tokens, components, build before modules.
7. **007** defines IAM — BetterAuth, RBAC, provisioning, SSO per engine, superadmin.
8. **008** defines modules, services, connectors — three-layer separation; self-hosted OSS first.
9. **009** defines the Platform Service Layer — mandatory business boundary; interface-first; orchestration.
10. **010** defines API Gateway and communication — one client API, standard envelopes, tracing, resilience.
11. **011** defines platform data architecture — PostgreSQL, SoR, ownership, entities, lifecycle.
12. **012** defines EDA, background jobs, workflows — async processing, events, correlation.
13. **013** defines Zero Trust security architecture — applies to every component and integration.
14. **014** defines observability — metrics, logs, traces, health, Administration Workspace.
15. **015** defines quality, testing, CI/CD, release management — mandatory engineering discipline.
16. **016** defines Desktop Shell architecture — permanent layout, regions, behaviour (complements 005).
17. **017** defines Navigation Framework — four-level hierarchy, registration, permissions, deep links, state.
18. **018** defines Workspace Sessions — window management, layout persistence, draft recovery, multi-session.
19. **019** defines Universal Command Palette — action engine, registration, permissions, execution path.
20. **020** defines Unified Search — providers, index, permissions, self-hosted OSS, semantic/AI-ready.
21. **021** defines Notifications & Attention — events not direct notify, Activity Stream, Attention Engine, digests.
22. **022** defines Presentation Engine — themes, branding, white-label, Branding Service, Theme Registry (complements 006).
23. **023** defines User Preferences — personalisation hierarchy, platform-owned prefs, workspace experience.
24. **024** defines Platform SDK — manifests, registration, lifecycle, extension contracts (mandatory for all code).
25. **025** defines Module SDK — `module.yaml`, Module Registry, directory structure, Cursor workflow.
26. **026** defines Integration SDK — `integration.yaml`, adapters, capabilities, OSS CE first (complements 008).
27. **027** defines Platform Service SDK — `service.yaml`, business layer, orchestration, Service Registry (complements 009).
28. **028** defines UI Component SDK — `component.yaml`, Storybook, Component Registry (complements 006).
29. **029** defines Platform Event SDK — `event.yaml`, Event Bus, envelopes, idempotent subscribers (complements 012).
30. New documents should be numbered sequentially (`030-…`, etc.) and registered in this table.
31. Cursor and contributors should read **000** and **001–029** before proposing architecture, UI, or implementation.
32. **BUILD-001** then **SPR-001** when the owner authorises execution.

## Relationship to the live host

The APZHUB codebase will be built in this workspace (`apz-portal`). The server already runs a separate legacy stack (`apzportal`, Docker `apz-stack`, host nginx). See `ENVIRONMENT.md` for what is running today. APZHUB must coexist with that environment until migration is planned.
