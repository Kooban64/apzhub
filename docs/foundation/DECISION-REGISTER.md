# APZHUB Decision Register

> **Purpose:** Summary index of major architectural decisions with rationale and status  
> **Audience:** Architects, reviewers, AI agents  
> **Authoritative references:** Individual ADRs in [docs/adr/](../adr/) — **full content lives there**  
> **Related documents:** [ADR-CATALOGUE](./ADR-CATALOGUE.md) · [DECISION-REGISTER](../decisions/) (legacy)  
> **Reading order:** When evaluating or proposing architectural change  
> **Last updated:** 2026-07-13
> **Current status:** Active — index only; do not duplicate ADR content

---

## How to use this register

| Column       | Meaning                                        |
| ------------ | ---------------------------------------------- |
| **ID**       | ADR reference — click for full decision record |
| **Decision** | One-line summary                               |
| **Why**      | Rationale (abbreviated)                        |
| **Status**   | Accepted, Superseded, Planning                 |

For full Problem / Decision / Alternatives / Consequences, read the linked ADR.

---

## Repository & tooling

| ID                                                               | Decision                       | Why                                                       | Status   |
| ---------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------- | -------- |
| [ADR-0001](../adr/ADR-0001-monorepo-strategy.md)                 | pnpm monorepo                  | Shared packages, consistent tooling, single CI            | Accepted |
| [ADR-0002](../adr/ADR-0002-drizzle-orm-selection.md)             | Drizzle ORM                    | Type-safe SQL, lightweight migrations                     | Accepted |
| [ADR-0003](../adr/ADR-0003-better-auth-session-validation.md)    | Better Auth for authentication | OSS, self-hosted, session-based; APZHUB owns authz        | Accepted |
| [ADR-0017](../adr/ADR-0017-phased-implementation-review-gate.md) | Phased review gates            | Architecture + production readiness before next milestone | Accepted |

---

## Platform architecture

| ID                                                                  | Decision                    | Why                                                  | Status                    |
| ------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------- | ------------------------- |
| [ADR-0004](../adr/ADR-0004-platform-registry-first-architecture.md) | Registry-first architecture | Manifest discovery over hardcoded registration       | Accepted                  |
| [ADR-0006](../adr/ADR-0006-platform-service-architecture.md)        | Platform Service Layer      | Business logic in services; modules are presentation | Accepted                  |
| [ADR-0007](../adr/ADR-0007-event-driven-communication.md)           | Event-driven communication  | Decouple modules; centralised notify/search/audit    | Accepted                  |
| [ADR-0008](../adr/ADR-0008-platform-core-package.md)                | Platform Core package       | Single core package                                  | **Superseded → ADR-0018** |
| [ADR-0018](../adr/ADR-0018-platform-runtime-package.md)             | Platform Runtime package    | Separate runtime from UI frameworks                  | Accepted                  |
| [ADR-0005](../adr/ADR-0005-integration-sdk-strategy.md)             | Integration SDK strategy    | Shared adapter framework for all OSS engines         | Accepted                  |

---

## Registry & manifests

| ID                                                                     | Decision                      | Why                                           | Status   |
| ---------------------------------------------------------------------- | ----------------------------- | --------------------------------------------- | -------- |
| [ADR-0009](../adr/ADR-0009-registry-hybrid-persistence.md)             | Hybrid persistence            | In-process registry; DB for platform metadata | Accepted |
| [ADR-0010](../adr/ADR-0010-registry-internal-typescript-api.md)        | Internal TypeScript API       | Registry consumed in-process, not HTTP        | Accepted |
| [ADR-0011](../adr/ADR-0011-unified-manifest-envelope.md)               | Unified manifest envelope     | Consistent manifest schema across types       | Accepted |
| [ADR-0012](../adr/ADR-0012-theme-manifest-registration.md)             | Theme manifest registration   | Themes as discoverable capabilities           | Accepted |
| [ADR-0013](../adr/ADR-0013-registry-fail-fast-policy.md)               | Fail-fast bootstrap           | Invalid manifests block startup               | Accepted |
| [ADR-0014](../adr/ADR-0014-registry-bootstrap-lifecycle.md)            | Bootstrap lifecycle           | Ordered capability initialisation             | Accepted |
| [ADR-0015](../adr/ADR-0015-registry-boundaries-and-discovery-scope.md) | Discovery scope boundaries    | What filesystem paths are scanned             | Accepted |
| [ADR-0016](../adr/ADR-0016-registry-testing-requirements.md)           | Registry testing requirements | Bootstrap tests mandatory                     | Accepted |

---

## Workbench & navigation

| ID                                                           | Decision                      | Why                                            | Status   |
| ------------------------------------------------------------ | ----------------------------- | ---------------------------------------------- | -------- |
| [ADR-0019](../adr/ADR-0019-workbench-framework-package.md)   | Workbench Framework package   | Separate UX orchestration from runtime         | Accepted |
| [ADR-0020](../adr/ADR-0020-workbench-request-transport.md)   | Workbench request transport   | Standardised request bus for shell             | Accepted |
| [ADR-0021](../adr/ADR-0021-workbench-session-persistence.md) | Session persistence           | Client-side session state with server metadata | Accepted |
| [ADR-0022](../adr/ADR-0022-navigation-manifest-extension.md) | Navigation manifest extension | Modules register nav via manifest              | Accepted |
| [ADR-0023](../adr/ADR-0023-workbench-permission-adapter.md)  | Permission adapter            | Workbench filters UI by platform permissions   | Accepted |

---

## Action / Command framework

| ID                                                         | Decision                    | Why                                     | Status   |
| ---------------------------------------------------------- | --------------------------- | --------------------------------------- | -------- |
| [ADR-0024](../adr/ADR-0024-command-framework-package.md)   | Command Framework package   | Dedicated action engine package         | Accepted |
| [ADR-0025](../adr/ADR-0025-workbench-commands-manifest.md) | Commands manifest extension | Modules register commands via manifest  | Accepted |
| [ADR-0026](../adr/ADR-0026-command-execution-model.md)     | Command execution model     | Actor model; service path for execution | Accepted |

---

## Knowledge & Discovery

| ID                                                                   | Decision                    | Why                                   | Status   |
| -------------------------------------------------------------------- | --------------------------- | ------------------------------------- | -------- |
| [ADR-0027](../adr/ADR-0027-knowledge-discovery-framework-package.md) | KDF package                 | Unified search framework              | Accepted |
| [ADR-0028](../adr/ADR-0028-knowledge-source-model.md)                | Knowledge source model      | Provider taxonomy and registration    | Accepted |
| [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md) | Discovery execution routing | Route queries to registered providers | Accepted |

---

## Event & Notification

| ID                                                                  | Decision               | Why                                 | Status   |
| ------------------------------------------------------------------- | ---------------------- | ----------------------------------- | -------- |
| [ADR-0030](../adr/ADR-0030-event-notification-framework-package.md) | ENF package            | Combined event + notification layer | Accepted |
| [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md)               | Event registry and bus | In-process event bus with registry  | Accepted |
| [ADR-0032](../adr/ADR-0032-notification-routing-model.md)           | Notification routing   | Events separated from delivery      | Accepted |

---

## Activity & Timeline

| ID                                                                  | Decision                   | Why                              | Status   |
| ------------------------------------------------------------------- | -------------------------- | -------------------------------- | -------- |
| [ADR-0033](../adr/ADR-0033-activity-timeline-framework-package.md)  | ATF package                | Activity stream framework        | Accepted |
| [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md) | Activity registry model    | Activity types and timeline DTOs | Accepted |
| [ADR-0035](../adr/ADR-0035-activity-execution-routing.md)           | Activity execution routing | Route activities to timeline     | Accepted |

---

## Trust Accounting (Law Platform)

| ID                                                                      | Decision                   | Why                                 | Status              |
| ----------------------------------------------------------------------- | -------------------------- | ----------------------------------- | ------------------- |
| [ADR-0036](../adr/ADR-0036-trust-accounting-law-capability.md)          | Trust as Law capability    | Native build for compliance         | Accepted (planning) |
| [ADR-0037](../adr/ADR-0037-immutable-trust-journal.md)                  | Immutable trust journal    | Append-only ledger for audit        | Accepted (planning) |
| [ADR-0038](../adr/ADR-0038-matter-trust-balance-segregation.md)         | Matter balance segregation | Per-matter trust isolation          | Accepted (planning) |
| [ADR-0039](../adr/ADR-0039-jurisdiction-adaptive-compliance-profile.md) | Jurisdiction profiles      | Adaptive compliance by jurisdiction | Accepted (planning) |

---

## Platform Core M8

| ID                                                                        | Decision                   | Why                                  | Status           |
| ------------------------------------------------------------------------- | -------------------------- | ------------------------------------ | ---------------- |
| [ADR-0040](../adr/ADR-0040-platform-tenant-foundation.md)                 | Platform tenant foundation | Platform-owned multi-tenancy         | Accepted (M8-01) |
| [ADR-0041](../adr/ADR-0041-platform-authorization-rbac-phase-1.md)        | RBAC phase 1               | Platform-owned roles and permissions | Accepted (M8-02) |
| [ADR-0042](../adr/ADR-0042-platform-operations-console.md)                | Operations console         | Centralised admin surface            | Accepted (M8-03) |
| [ADR-0043](../adr/ADR-0043-platform-personalisation-framework.md)         | Personalisation framework  | Platform-owned preferences           | Accepted (M8-04) |
| [ADR-0044](../adr/ADR-0044-platform-governance-provisioning-framework.md) | Governance & provisioning  | Feature flags, capability enablement | Accepted (M8-05) |
| [ADR-0045](../adr/ADR-0045-platform-security-operational-resilience.md)   | Security & resilience      | CSP, headers, traffic governance     | Accepted (M8-06) |

---

## Production readiness (PCv2-01)

| ID                                                                          | Decision                | Why                             | Status             |
| --------------------------------------------------------------------------- | ----------------------- | ------------------------------- | ------------------ |
| [ADR-0046](../adr/ADR-0046-production-readiness-bootstrap-consolidation.md) | Bootstrap consolidation | Single canonical bootstrap path | Accepted (PRH-001) |

---

## OSS integration

| ID                                                                             | Decision                            | Why                                                                | Status                 |
| ------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------ | ---------------------- |
| [ADR-0047](../adr/ADR-0047-projects-plane-integration-architecture.md)         | Projects / Plane integration        | Plane as OSS engine behind ProjectService                          | Accepted (OSS-101-01)  |
| [ADR-0048](../adr/ADR-0048-apzhub-global-entity-id-strategy.md)                | APZHUB global entity IDs            | Opaque typed IDs; mapping store binds providers                    | Accepted (OSS-110-03)  |
| [ADR-0049](../adr/ADR-0049-persistent-entity-mapping-store.md)                 | Persistent entity mapping store     | PostgreSQL EntityMappingStore; no silent memory fallback           | Accepted (OSS-110-05)  |
| [ADR-0050](../adr/ADR-0050-production-authorisation-policy-enforcement.md)     | Production authorisation & policies | Deny-by-default provider; catalogue; no silent allow-all           | Accepted (OSS-110-06)  |
| [ADR-0051](../adr/ADR-0051-platform-http-api-surface.md)                       | Platform HTTP API `/api/v1`         | Thin routes → gateway; envelope; OpenAPI 3.1                       | Accepted (OSS-110-07)  |
| [ADR-0052](../adr/ADR-0052-canonical-source-event-envelope.md)                 | Canonical `IntegrationSourceEvent`  | Shared webhook/polling envelope; no bus publish                    | Accepted (OSS-100-08)  |
| [ADR-0053](../adr/ADR-0053-event-identity-and-deduplication.md)                | Event identity precedence & dedup   | Stable keys only; SDK UUID not for dedup                           | Accepted (OSS-100-08)  |
| [ADR-0054](../adr/ADR-0054-polling-checkpoint-acknowledgement.md)              | Polling checkpoint propose/ack      | No auto-commit before acknowledgement                              | Accepted (OSS-100-08)  |
| [ADR-0055](../adr/ADR-0055-webhook-verification-boundary.md)                   | Webhook verification boundary       | Adapter/SDK verify; no HTTP ingress                                | Accepted (OSS-100-08)  |
| [ADR-0056](../adr/ADR-0056-adapter-polling-vs-platform-scheduling.md)          | Polling vs scheduling               | SDK polls; platform schedules later                                | Accepted (OSS-100-08)  |
| [ADR-0057](../adr/ADR-0057-sdk-harness-vs-adapter-operations-certification.md) | SDK harness vs adapter ops          | Shared certification engine; ops APIs remain                       | Accepted (OSS-100-09)  |
| [ADR-0058](../adr/ADR-0058-integration-sdk-v1-readiness-limitations.md)        | SDK v1.0 readiness                  | PRODUCTION_READY_WITH_LIMITATIONS; remained 0.9.0 until OSS-100-11 | Accepted (OSS-100-10)  |
| [ADR-0065](../adr/ADR-0065-integration-sdk-v1-architecture-freeze.md)          | SDK 1.0.0 promotion & freeze        | Promote **1.0.0**; Architecture Frozen; limitations retained       | Accepted (OSS-100-11)  |
| [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)            | APZ TCMS native product             | Native SoR; orchestrates engines; supersedes QE naming & Kiwi SoR  | Accepted (APZTCMS-001) |

---

## Legacy decisions (`docs/decisions/`)

## Document Platform (APZDOCS-002)

| ID                                                                                                                       | Decision                   | Why                                  | Status   |
| ------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ------------------------------------ | -------- |
| [ADR-document-immutable-content-versions](../decisions/ADR-document-immutable-content-versions.md)                       | Immutable content versions | Auditability; overwrite denied       | Accepted |
| [ADR-document-metadata-storage-transaction-boundary](../decisions/ADR-document-metadata-storage-transaction-boundary.md) | No distributed TX          | Status + reconciliation compensation | Accepted |
| [ADR-document-checksum-authority](../decisions/ADR-document-checksum-authority.md)                                       | SHA-256 platform checksum  | ETag never authoritative             | Accepted |
| [ADR-document-storage-provider-selection](../decisions/ADR-document-storage-provider-selection.md)                       | Filesystem + S3 first      | Azure/GCS deferred placeholders      | Accepted |
| [ADR-document-reconciliation-model](../decisions/ADR-document-reconciliation-model.md)                                   | Inspect contracts only     | Workers deferred                     | Accepted |

---

## Legacy / historical

| ID                                                                        | Decision                         | Status     |
| ------------------------------------------------------------------------- | -------------------------------- | ---------- |
| [ADR-001 (legacy)](../decisions/ADR-001-integrations-folder-canonical.md) | `integrations/` folder canonical | Historical |
| [ADR-002 (legacy)](../decisions/ADR-002-database-migration-framework.md)  | Drizzle migration framework      | Historical |

---

## Decisions not yet ADR'd

| Topic                            | Current status                        | Reference                                                        |
| -------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| Financial Engine extraction      | **DEFER**                             | [FIN-001 Review](../reviews/FIN-001-Architecture-Review.md)      |
| Quality Engineering architecture | **Superseded** by APZ TCMS (ADR-0059) | [APZ TCMS Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md) |
| SaaS deployment model            | Future                                | [Commercial Roadmap](../strategy/APZHUB-Commercial-Roadmap.md)   |

New significant decisions require ADR before implementation.
