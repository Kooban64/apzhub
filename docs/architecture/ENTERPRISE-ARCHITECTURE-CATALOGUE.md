# APZHUB Enterprise Architecture Catalogue

> **Programme:** APZHUB-ARCHITECTURE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Status:** **ACCEPTED / CLOSED / Operational** (APZHUB-OWNER-001)  
> **Authority:** Repository evidence · [AI-MANIFEST](../foundation/AI-MANIFEST.md) · Knowledge Foundation catalogues  
> **Rule:** This catalogue is the **EA entry index**. It does **not** replace package/wave detail in `docs/foundation/*-CATALOGUE.md` — it references them.

---

## 1. Purpose

Definitive inventory of every significant architectural component in APZHUB for engineering, architecture, governance, onboarding, and AI agents.

**No implementation** is authorised by this document.

---

## 2. How to use (anti-duplication)

| Need                                   | Authoritative detail                                                                                                 | EA view                                                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Package versions                       | [PACKAGE-CATALOGUE](../foundation/PACKAGE-CATALOGUE.md)                                                              | [PLATFORM-CATALOGUE](./PLATFORM-CATALOGUE.md)                                                                                |
| OSS waves / engines                    | [OSS-CATALOGUE](../foundation/OSS-CATALOGUE.md)                                                                      | [INTEGRATION-CATALOGUE](./INTEGRATION-CATALOGUE.md)                                                                          |
| Integration adapters                   | [INTEGRATION-CATALOGUE](../foundation/INTEGRATION-CATALOGUE.md)                                                      | same EA file (summary + links)                                                                                               |
| Product portfolio                      | [APZHUB-PRODUCT-PORTFOLIO](../products/APZHUB-PRODUCT-PORTFOLIO.md)                                                  | [PRODUCT-CATALOGUE](./PRODUCT-CATALOGUE.md)                                                                                  |
| Platform capabilities                  | [PLATFORM-CAPABILITY-CATALOGUE](../foundation/PLATFORM-CAPABILITY-CATALOGUE.md)                                      | [PLATFORM-CATALOGUE](./PLATFORM-CATALOGUE.md)                                                                                |
| ADRs                                   | [ADR-CATALOGUE](../foundation/ADR-CATALOGUE.md) · [docs/adr](../adr/README.md) · [architecture/adr](./adr/README.md) | ADR-0070/0072 **ACCEPTED** · ADR-0071 **AWAITING OWNER ADR ACCEPTANCE**                                                      |
| Platform 1.3 architecture confirmation | [platform-1.3-confirmation](./platform-1.3-confirmation/README.md)                                                   | Platform-1.3-ARCH-001 **ACCEPTED**                                                                                           |
| ADR-0070 Observe live alerts           | [architecture/adr/ADR-0070](./adr/ADR-0070-Observe-Live-Alert-Evaluation-and-Delivery.md)                            | Platform-1.3-ADR-0070 · **ACCEPTED** · ENG-002 **ACCEPTED**                                                                  |
| ADR-0071 Notification Delivery         | [architecture/adr/ADR-0071](./adr/ADR-0071-Notification-Delivery-Providers-and-Routing.md)                           | Platform-1.3-ADR-0071 · **READY FOR OWNER ADR ACCEPTANCE**                                                                   |
| ADR-0072 Realtime Transport            | [architecture/adr/ADR-0072](./adr/ADR-0072-Platform-Realtime-Transport.md)                                           | Platform-1.3-ADR-0072 · **ACCEPTED** · ENG-003 **ACCEPTED**                                                                  |
| Governance dashboard model             | [ENGINEERING-GOVERNANCE-DASHBOARD](../governance/ENGINEERING-GOVERNANCE-DASHBOARD.md)                                | Cross-link only                                                                                                              |
| Commercial product management          | [docs/product-management/](../product-management/README.md)                                                          | Sibling governance pillar                                                                                                    |
| Analytics Platform Foundation          | [docs/platform/analytics/](../platform/analytics/README.md)                                                          | Production vertical — ANALYTICS-001…006 ACCEPTED · product **1.0.0** Awaiting Acceptance (APZ-ANALYTICS-002) · ADR-0066/0067 |
| APZ Analytics Product Release          | [docs/releases/analytics/1.0.0/](../releases/analytics/1.0.0/README.md)                                              | SemVer **1.0.0** · PRODUCTION_READY_WITH_LIMITATIONS · recommendation **PRODUCTION READY**                                   |
| APZ Workflow Commercial Planning       | [docs/products/apz-workflow/](../products/apz-workflow/README.md)                                                    | APZ-WORKFLOW-001 · **ACCEPTED / CLOSED** · **Planning** · **READY WITH CONDITIONS**                                          |
| Workflow Platform Foundation           | [docs/platform/workflow/](../platform/workflow/README.md)                                                            | APZHUB-PLATFORM-WORKFLOW-001 **ACCEPTED** · **FOUNDATION READY** · ADR-0068/0069                                             |
| Workflow Information Model             | [WORKFLOW-INFORMATION-MODEL](../platform/workflow/WORKFLOW-INFORMATION-MODEL.md)                                     | APZHUB-PLATFORM-WORKFLOW-002 **ACCEPTED** · **FOUNDATION COMPLETE**                                                          |
| n8n Integration Foundation             | [docs/integrations/n8n/](../integrations/n8n/README.md)                                                              | APZHUB-INTEGRATION-N8N-001 **ACCEPTED** · `@apzhub/integration-n8n` **0.1.0** · **CERTIFIED_FOUNDATION**                     |
| Workflow Platform Contracts            | [WORKFLOW-CONTRACTS](../platform/workflow/WORKFLOW-CONTRACTS.md)                                                     | APZHUB-PLATFORM-WORKFLOW-003 **ACCEPTED** · `@apzhub/workflow-contracts` **0.4.1** · **CONTRACTS READY**                     |
| Workflow Platform Services             | [WORKFLOW-PLATFORM-SERVICES](../platform/workflow/WORKFLOW-PLATFORM-SERVICES.md)                                     | APZHUB-PLATFORM-WORKFLOW-004 · **ACCEPTED / CLOSED** · **SERVICES READY**                                                    |
| Workflow HTTP API                      | [docs/http/workflow](../http/workflow/README.md)                                                                     | APZHUB-PLATFORM-WORKFLOW-005 · OpenAPI **1.12.0** · **ACCEPTED / CLOSED** · **HTTP API READY**                               |
| Workflow Workbench                     | [docs/workbench/workflow](../workbench/workflow/README.md)                                                           | APZHUB-PLATFORM-WORKFLOW-006 · `/workspace/workflow/*` · **ACCEPTED / CLOSED** · **WORKBENCH READY**                         |
| APZ Workflow 1.0.0                     | [docs/releases/workflow/1.0.0](../releases/workflow/1.0.0/README.md)                                                 | APZ-WORKFLOW-002 · SemVer **1.0.0** · **PRODUCTION READY** (PRWL) · Awaiting Acceptance                                      |
| Maturity roll-up                       | —                                                                                                                    | [ARCHITECTURE-MATURITY-MATRIX](./ARCHITECTURE-MATURITY-MATRIX.md)                                                            |
| Relationships                          | —                                                                                                                    | [ARCHITECTURE-RELATIONSHIPS](./ARCHITECTURE-RELATIONSHIPS.md)                                                                |

On conflict: **disk `package.json` + AI-MANIFEST + completion reports** win over older catalogue narrative rows.

---

## 3. Catalogue map

| #   | Section             | Document                                                             |
| --- | ------------------- | -------------------------------------------------------------------- |
| 1   | Platform            | [PLATFORM-CATALOGUE.md](./PLATFORM-CATALOGUE.md)                     |
| 2   | Products            | [PRODUCT-CATALOGUE.md](./PRODUCT-CATALOGUE.md)                       |
| 3   | Integrations        | [INTEGRATION-CATALOGUE.md](./INTEGRATION-CATALOGUE.md)               |
| 4   | Engineering         | §4 below + ops/governance links                                      |
| 5   | Infrastructure      | [INFRASTRUCTURE-CATALOGUE.md](./INFRASTRUCTURE-CATALOGUE.md)         |
| 6   | Observability       | [OBSERVABILITY-CATALOGUE.md](./OBSERVABILITY-CATALOGUE.md)           |
| 7   | Security            | [SECURITY-CATALOGUE.md](./SECURITY-CATALOGUE.md)                     |
| 8   | Quality Engineering | [QUALITY-CATALOGUE.md](./QUALITY-CATALOGUE.md)                       |
| 9   | Maturity matrix     | [ARCHITECTURE-MATURITY-MATRIX.md](./ARCHITECTURE-MATURITY-MATRIX.md) |
| 10  | Relationships       | [ARCHITECTURE-RELATIONSHIPS.md](./ARCHITECTURE-RELATIONSHIPS.md)     |

---

## 4. Engineering (inventory)

| Component                      | Location                                                                                                           | Status                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Engineering Operating Model    | [docs/operations/](../operations/README.md)                                                                        | **ACTIVE** — OPERATIONS-001 ACCEPTED                  |
| Engineering Handbook           | [APZHUB-Engineering-Handbook](../governance/APZHUB-Engineering-Handbook.md)                                        | Active                                                |
| Architecture Handbook          | [ARCHITECTURE-HANDBOOK](../foundation/ARCHITECTURE-HANDBOOK.md)                                                    | Active                                                |
| Reference Implementation       | [PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION](../products/APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md) | Active (Projects + Time pattern)                      |
| Architecture Decisions         | [ADR-CATALOGUE](../foundation/ADR-CATALOGUE.md) · `docs/adr/`                                                      | **65** ADRs through ADR-0065                          |
| Release Governance             | [docs/releases/](../releases/README.md) · [PORTFOLIO-RELEASE-REGISTER](../releases/PORTFOLIO-RELEASE-REGISTER.md)  | **Operational** (RELEASES-001 ACCEPTED)               |
| Quality Standards              | Document 015 · [DEFINITION-OF-DONE](../operations/DEFINITION-OF-DONE.md)                                           | Mandatory                                             |
| Certification Standards        | [PRODUCT-CERTIFICATION-STANDARD](../products/PRODUCT-CERTIFICATION-STANDARD.md)                                    | Active                                                |
| Governance Dashboard Spec      | [ENGINEERING-GOVERNANCE-DASHBOARD](../governance/ENGINEERING-GOVERNANCE-DASHBOARD.md)                              | **Operational** spec (GOVERNANCE-001 ACCEPTED; no UI) |
| Portfolio Integration Strategy | [PORTFOLIO-INTEGRATION-STRATEGY](../products/PORTFOLIO-INTEGRATION-STRATEGY.md)                                    | **Operational** strategy (PORTFOLIO-001 ACCEPTED)     |

---

## 5. Layered architecture (canonical)

```text
Presentation (Workbench / apps/web)
  → Application HTTP (/api/v1)
  → Auth → Authz → Validation (RequestPipeline)
  → Platform Services
  → Integration SDK Adapters
  → Backend Engines (CE, self-hosted)
```

Async: Platform Services → Outbox → Event Bus → Search / Activity / Audit / Attention / Jobs.

---

## 6. Current Production baselines (disk)

| Product      | SemVer    | Evidence                                                        |
| ------------ | --------- | --------------------------------------------------------------- |
| APZ Projects | **1.1.0** | [releases/projects/1.1.0](../releases/projects/1.1.0/README.md) |
| APZ Time     | **1.0.0** | [releases/time/1.0.0](../releases/time/1.0.0/README.md)         |
| APZ Support  | **1.0.0** | [releases/support/1.0.0](../releases/support/1.0.0/README.md)   |

Repository quality: **QA-002 PRODUCTION READY**.

---

## 7. Programme artefacts

| Artefact   | Path                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Completion | [APZHUB-ARCHITECTURE-001-completion-report](../sprint/APZHUB-ARCHITECTURE-001-completion-report.md)                                            |
| Acceptance | [APZHUB-ARCHITECTURE-001-programme-acceptance-report](../foundation/completion-reports/APZHUB-ARCHITECTURE-001-programme-acceptance-report.md) |

---

## Operating rule

Do **not** implement products, dashboards, or integrations from this catalogue alone. Do **not** modify frozen architecture without ADR + Owner. Delivery requires named Owner Approval under Operational Delivery.
