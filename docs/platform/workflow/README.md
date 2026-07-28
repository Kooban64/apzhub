# APZHUB Workflow Platform

> **Programmes:** APZHUB-PLATFORM-WORKFLOW-001…006 **ACCEPTED / CLOSED** · APZHUB-INTEGRATION-N8N-001 **ACCEPTED / CLOSED** · APZ-WORKFLOW-002 **Awaiting Acceptance**  
> **Classification:** Foundation + certified n8n integration + Contracts + Platform Services + HTTP API + Workbench + Product 1.0.0 certification  
> **Recommendation:** Platform stack complete · Product **1.0.0** certification **PRODUCTION READY** (PRWL)

> **ADRs:** [ADR-0068](../../adr/ADR-0068-workflow-platform-first-class-capability.md) · [ADR-0069](../../adr/ADR-0069-n8n-workflow-engine-provider.md) (**Accepted**)  
> **Commercial planning:** [APZ-WORKFLOW-001](../../products/apz-workflow/README.md) (**ACCEPTED / CLOSED**)  
> **Engineering baseline:** APZWORKFLOW-001…011 **PRODUCTION_READY_WITH_LIMITATIONS** · **frozen**  
> **Bootstrap:** [AI-MANIFEST](../../foundation/AI-MANIFEST.md) · repository evidence only  
> **Date:** 2026-07-19

---

## Purpose

Canonical **Workflow Platform** — shared platform capability providing orchestration for all APZHUB products. It does **not** contain product-specific business logic and does **not** implement the commercial APZ Workflow product in these programmes.

---

## Architecture foundation (001)

| Document                                               | Purpose                                        |
| ------------------------------------------------------ | ---------------------------------------------- |
| [WORKFLOW-PLATFORM.md](./WORKFLOW-PLATFORM.md)         | Canonical platform overview                    |
| [WORKFLOW-ARCHITECTURE.md](./WORKFLOW-ARCHITECTURE.md) | Architecture · diagrams · relationships        |
| [PROVIDER-STRATEGY.md](./PROVIDER-STRATEGY.md)         | n8n primary · future providers                 |
| [CAPABILITY-CATALOGUE.md](./CAPABILITY-CATALOGUE.md)   | Platform responsibilities catalogue            |
| [WORKFLOW-LIFECYCLE.md](./WORKFLOW-LIFECYCLE.md)       | Definition · publish · run · archive lifecycle |
| [EXECUTION-MODEL.md](./EXECUTION-MODEL.md)             | Runs · triggers · retries · compensation       |
| [SECURITY-MODEL.md](./SECURITY-MODEL.md)               | AuthZ · credentials · tenancy · audit          |
| [OPERATIONAL-MODEL.md](./OPERATIONAL-MODEL.md)         | Health · diagnostics · observability · ops     |
| [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)         | Foundation + freeze honesty                    |
| [COMPATIBILITY.md](./COMPATIBILITY.md)                 | Compatibility with frozen wave                 |

## Information model (002)

| Document                                                               | Purpose                                 |
| ---------------------------------------------------------------------- | --------------------------------------- |
| [WORKFLOW-INFORMATION-MODEL.md](./WORKFLOW-INFORMATION-MODEL.md)       | Canonical information model             |
| [WORKFLOW-DOMAIN-MODEL.md](./WORKFLOW-DOMAIN-MODEL.md)                 | Aggregates · lifecycles · ownership     |
| [WORKFLOW-GLOSSARY.md](./WORKFLOW-GLOSSARY.md)                         | Term definitions                        |
| [WORKFLOW-ENTITY-RELATIONSHIPS.md](./WORKFLOW-ENTITY-RELATIONSHIPS.md) | ER · class · stack diagrams             |
| [WORKFLOW-CONTRACT-PLANNING.md](./WORKFLOW-CONTRACT-PLANNING.md)       | Historical planning (superseded by 003) |

## Contracts (003)

| Document                                                                             | Purpose                             |
| ------------------------------------------------------------------------------------ | ----------------------------------- |
| [WORKFLOW-CONTRACTS.md](./WORKFLOW-CONTRACTS.md)                                     | Canonical contracts package         |
| [WORKFLOW-CONTRACTS-COMPATIBILITY.md](./WORKFLOW-CONTRACTS-COMPATIBILITY.md)         | Compatibility · permission mappings |
| [WORKFLOW-CONTRACTS-KNOWN-LIMITATIONS.md](./WORKFLOW-CONTRACTS-KNOWN-LIMITATIONS.md) | Limitations                         |
| [WORKFLOW-CONTRACTS-RELEASE-NOTES.md](./WORKFLOW-CONTRACTS-RELEASE-NOTES.md)         | Release notes                       |

## Platform Services (004)

| Document                                                                                             | Purpose                             |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [WORKFLOW-PLATFORM-SERVICES.md](./WORKFLOW-PLATFORM-SERVICES.md)                                     | Services overview · gateway · AuthZ |
| [WORKFLOW-PLATFORM-SERVICES-COMPATIBILITY.md](./WORKFLOW-PLATFORM-SERVICES-COMPATIBILITY.md)         | Compatibility                       |
| [WORKFLOW-PLATFORM-SERVICES-KNOWN-LIMITATIONS.md](./WORKFLOW-PLATFORM-SERVICES-KNOWN-LIMITATIONS.md) | Limitations                         |
| [WORKFLOW-PLATFORM-SERVICES-RELEASE-NOTES.md](./WORKFLOW-PLATFORM-SERVICES-RELEASE-NOTES.md)         | Release notes                       |

## HTTP API (005)

| Document                                                                     | Purpose                                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [docs/http/workflow/README.md](../../http/workflow/README.md)                | Canonical `/api/v1/workflow/*` index · **ACCEPTED / CLOSED** |
| [HTTP-API-CERTIFICATION.md](../../http/workflow/HTTP-API-CERTIFICATION.md)   | Certification                                                |
| [COMPATIBILITY-STATEMENT.md](../../http/workflow/COMPATIBILITY-STATEMENT.md) | Compatibility                                                |
| [KNOWN-LIMITATIONS.md](../../http/workflow/KNOWN-LIMITATIONS.md)             | Limitations                                                  |
| [RELEASE-NOTES.md](../../http/workflow/RELEASE-NOTES.md)                     | Release notes                                                |

## Workbench (006)

| Document                                                                          | Purpose                                 |
| --------------------------------------------------------------------------------- | --------------------------------------- |
| [docs/workbench/workflow/README.md](../../workbench/workflow/README.md)           | Canonical `/workspace/workflow/*` index |
| [DEVELOPER-GUIDE.md](../../workbench/workflow/DEVELOPER-GUIDE.md)                 | Developer guide                         |
| [NAVIGATION.md](../../workbench/workflow/NAVIGATION.md)                           | Navigation                              |
| [COMPATIBILITY-STATEMENT.md](../../workbench/workflow/COMPATIBILITY-STATEMENT.md) | Compatibility                           |
| [KNOWN-LIMITATIONS.md](../../workbench/workflow/KNOWN-LIMITATIONS.md)             | Limitations                             |
| [RELEASE-NOTES.md](../../workbench/workflow/RELEASE-NOTES.md)                     | Release notes                           |

## ADRs

| ADR                                                                        | Topic                                             | Status       |
| -------------------------------------------------------------------------- | ------------------------------------------------- | ------------ |
| [ADR-0068](../../adr/ADR-0068-workflow-platform-first-class-capability.md) | First-class platform capability · boundaries      | **Accepted** |
| [ADR-0069](../../adr/ADR-0069-n8n-workflow-engine-provider.md)             | n8n primary provider · multi-provider abstraction | **Accepted** |

---

## Recommendations

| Programme                      | Recommendation              |
| ------------------------------ | --------------------------- |
| 002 Information Model          | **FOUNDATION COMPLETE**     |
| N8N-001 Integration            | **CERTIFIED_FOUNDATION**    |
| 003 Contracts                  | **CONTRACTS READY**         |
| 004 Services                   | **SERVICES READY**          |
| 005 HTTP API                   | **HTTP API READY**          |
| 006 Workbench                  | **WORKBENCH READY**         |
| APZ-WORKFLOW-002 Product 1.0.0 | **PRODUCTION READY** (PRWL) |

---

## Related

- Package contracts: `@apzhub/workflow-contracts` **0.4.2**
- Package services: `@apzhub/platform-services` **0.28.0**
- HTTP: OpenAPI **1.12.0** · `/api/v1/workflow/*`
- Workbench: `/workspace/workflow/*`
- Product release: [docs/releases/workflow/1.0.0/](../../releases/workflow/1.0.0/README.md)
- n8n cert: [docs/integrations/n8n/CERTIFICATION-REPORT.md](../../integrations/n8n/CERTIFICATION-REPORT.md)
- Commercial pack: [docs/products/apz-workflow/](../../products/apz-workflow/README.md)

---

## STOP

Do **not** expand Release 1.0 scope. Await Owner Acceptance of APZ-WORKFLOW-002.
