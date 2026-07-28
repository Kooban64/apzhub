# Stage Gates

> **Programme:** APZHUB-ENGINEERING-001  
> **Normative:** Every phase must satisfy these fields before Owner Acceptance.

For each phase below: Purpose · Inputs · Outputs · Mandatory Deliverables · Exit Criteria · Owner Acceptance Criteria · Quality Gates · Stop Conditions · Required Documentation.

---

## 1. Commercial Planning

| Field                         | Requirement                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                   | Define commercial product identity, Release 1.0 scope, readiness, and recommendation without implementing code                                                                        |
| **Inputs**                    | Portfolio Definition Pack · capability inventory · Owner intent                                                                                                                       |
| **Outputs**                   | Planning pack under `docs/products/apz-{product}/`                                                                                                                                    |
| **Mandatory deliverables**    | README · Release definition · Feature catalogue · Integrations · IR assessment · Known limitations · Compatibility · Certification/testing strategy · Completion · Acceptance reports |
| **Exit criteria**             | Single recommendation filed (NOT READY / READY WITH CONDITIONS / IMPLEMENTATION READY); no production code                                                                            |
| **Owner Acceptance criteria** | Owner accepts planning pack; may authorise prerequisite platform programmes                                                                                                           |
| **Quality gates**             | Docs completeness · link integrity · no code/packages                                                                                                                                 |
| **Stop conditions**           | Do not implement product code from planning alone                                                                                                                                     |
| **Required documentation**    | Product pack + sprint/foundation reports                                                                                                                                              |

---

## 2. Platform Foundation

| Field                         | Requirement                                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                   | Establish capability as first-class platform concern; boundaries; provider strategy; ADRs                                                                              |
| **Inputs**                    | Commercial planning (or Owner-authorised platform need) · Constitution · architecture docs                                                                             |
| **Outputs**                   | `docs/platform/{capability}/` foundation pack · accepted ADRs                                                                                                          |
| **Mandatory deliverables**    | Platform overview · architecture · provider strategy · capability catalogue · security/ops models · known limitations · compatibility · ADRs · Completion · Acceptance |
| **Exit criteria**             | Recommendation **FOUNDATION READY**; ADRs Accepted; no business modules                                                                                                |
| **Owner Acceptance criteria** | Foundation pack authoritative for subsequent phases                                                                                                                    |
| **Quality gates**             | Docs · ADR process · architecture compliance narrative                                                                                                                 |
| **Stop conditions**           | Do not start Information Model code; do not ship integrations                                                                                                          |
| **Required documentation**    | Foundation pack + ADRs                                                                                                                                                 |

---

## 3. Information Model

| Field                         | Requirement                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                   | Canonical domain model, glossary, relationships, ownership — provider-neutral                                               |
| **Inputs**                    | Accepted Platform Foundation                                                                                                |
| **Outputs**                   | Information model pack under `docs/platform/{capability}/`                                                                  |
| **Mandatory deliverables**    | Information model · domain model · glossary · entity relationships · contract planning (optional) · Completion · Acceptance |
| **Exit criteria**             | Recommendation **FOUNDATION COMPLETE**; model ready for contracts                                                           |
| **Owner Acceptance criteria** | IM is SoT for contracts package                                                                                             |
| **Quality gates**             | Docs completeness · no engine DTO leakage in canonical model                                                                |
| **Stop conditions**           | Do not implement contracts/services yet                                                                                     |
| **Required documentation**    | IM pack + reports                                                                                                           |

---

## 4. Provider Integration

| Field                         | Requirement                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                   | Certify Integration Adapter (Service Connector) for primary provider — CE/self-hosted first                                        |
| **Inputs**                    | Foundation + IM · Integration SDK **1.0.0** freeze                                                                                 |
| **Outputs**                   | `integrations/{provider}/` package + cert docs                                                                                     |
| **Mandatory deliverables**    | `integration.yaml` first · package · health/error translation · CERTIFICATION-REPORT · known limitations · Completion · Acceptance |
| **Exit criteria**             | Recommendation **CERTIFIED_FOUNDATION** (or stronger when authorised); SDK unchanged unless ADR                                    |
| **Owner Acceptance criteria** | Adapter usable by Platform Services only                                                                                           |
| **Quality gates**             | TypeScript · lint · unit/integration adapter tests · architecture boundary · no business logic in adapter                          |
| **Stop conditions**           | Do not expose provider UI; do not skip to Workbench                                                                                |
| **Required documentation**    | Integration docs under `docs/integrations/{provider}/`                                                                             |

---

## 5. Contracts

| Field                         | Requirement                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                   | Provider-neutral TypeScript models + service interfaces                                                                          |
| **Inputs**                    | Accepted IM · provider cert (or parallel with Owner scope)                                                                       |
| **Outputs**                   | `@apzhub/{capability}-contracts` package                                                                                         |
| **Mandatory deliverables**    | `service`/`module` contracts · gateway facets · permissions catalogue · package tests · contracts docs · Completion · Acceptance |
| **Exit criteria**             | Recommendation **CONTRACTS READY**; SemVer bumped                                                                                |
| **Owner Acceptance criteria** | Contracts are the only types Platform Services/HTTP/Workbench may share                                                          |
| **Quality gates**             | TypeScript · unit/type tests · no provider DTOs exported                                                                         |
| **Stop conditions**           | Do not implement orchestration in contracts package                                                                              |
| **Required documentation**    | `docs/platform/{capability}/*CONTRACTS*`                                                                                         |

---

## 6. Platform Services

| Field                         | Requirement                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Purpose**                   | Business logic, AuthZ, orchestration via Integration SDK only                                          |
| **Inputs**                    | Contracts · certified integration                                                                      |
| **Outputs**                   | Implementations on `gateway.{capability}` in platform-services (or dedicated service package)          |
| **Mandatory deliverables**    | `service.yaml` · service impls · AuthZ operation map · tests · services docs · Completion · Acceptance |
| **Exit criteria**             | Recommendation **SERVICES READY**                                                                      |
| **Owner Acceptance criteria** | HTTP/Workbench may consume gateway facets                                                              |
| **Quality gates**             | TypeScript · lint · unit/service tests · AuthZ coverage · no UI                                        |
| **Stop conditions**           | Do not add HTTP routes or Workbench in this programme                                                  |
| **Required documentation**    | `docs/platform/{capability}/*SERVICES*`                                                                |

---

## 7. HTTP API

| Field                         | Requirement                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**                   | Canonical versioned HTTP over Platform Services                                                                                                  |
| **Inputs**                    | Services READY                                                                                                                                   |
| **Outputs**                   | `/api/v1/{capability}/*` · OpenAPI update                                                                                                        |
| **Mandatory deliverables**    | App Router routes · handlers · Zod schemas · OpenAPI paths/schemas · HTTP docs · tests (HTTP/AuthZ/validation/OpenAPI) · Completion · Acceptance |
| **Exit criteria**             | Recommendation **HTTP API READY**; OpenAPI validate PASS                                                                                         |
| **Owner Acceptance criteria** | Workbench may consume HTTP only                                                                                                                  |
| **Quality gates**             | TypeScript · lint · build · unit/API tests · OpenAPI validate · architecture (no integration imports in handlers)                                |
| **Stop conditions**           | Do not implement Workbench                                                                                                                       |
| **Required documentation**    | `docs/http/{capability}/`                                                                                                                        |

---

## 8. Workbench Module

| Field                         | Requirement                                                                                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                   | Presentation layer in APZHUB Workbench                                                                                                                                                                   |
| **Inputs**                    | HTTP API READY                                                                                                                                                                                           |
| **Outputs**                   | `/workspace/{capability}/*` · manifests · typed client                                                                                                                                                   |
| **Mandatory deliverables**    | `module.yaml` (+ sidebar children) · typed client to `/api/v1/{capability}/*` only · views · navigation · tests (unit/component/nav/boundary/Playwright/a11y) · workbench docs · Completion · Acceptance |
| **Exit criteria**             | Recommendation **WORKBENCH READY**                                                                                                                                                                       |
| **Owner Acceptance criteria** | Product certification may proceed                                                                                                                                                                        |
| **Quality gates**             | TypeScript · lint · build · Vitest · Playwright · architecture boundary · permission-aware UI                                                                                                            |
| **Stop conditions**           | Do not add commercial packaging features beyond Owner scope                                                                                                                                              |
| **Required documentation**    | `docs/workbench/{capability}/`                                                                                                                                                                           |

---

## 9. Product Certification

| Field                         | Requirement                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                   | Validate full vertical for Production; no new features                                                                                          |
| **Inputs**                    | Complete platform stack + planning pack                                                                                                         |
| **Outputs**                   | Certification report · quality evidence · readiness docs · recommendation                                                                       |
| **Mandatory deliverables**    | Certification report · quality evidence · operational/production readiness · compatibility · known limitations update · Completion · Acceptance |
| **Exit criteria**             | Single recommendation from Owner catalogue                                                                                                      |
| **Owner Acceptance criteria** | Product may be packaged as SemVer baseline                                                                                                      |
| **Quality gates**             | Full gate set for the vertical · OpenAPI · Playwright · architecture · docs completeness                                                        |
| **Stop conditions**           | No feature development · no scope expansion                                                                                                     |
| **Required documentation**    | Under `docs/releases/{product}/` (may share with Production Release)                                                                            |

---

## 10. Production Release

| Field                         | Requirement                                                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**                   | Establish SemVer Production baseline and portfolio registration                                                                                                                |
| **Inputs**                    | Certification recommendation                                                                                                                                                   |
| **Outputs**                   | `docs/releases/{product}/{semver}/` evidence index · RELEASES.md · register updates                                                                                            |
| **Mandatory deliverables**    | Release notes · CHANGELOG · compatibility · known limitations · quality evidence · certification · baseline confirmation · repository update summary · Completion · Acceptance |
| **Exit criteria**             | Portfolio Release Register row filed; KF updated                                                                                                                               |
| **Owner Acceptance criteria** | SemVer becomes current Production Release                                                                                                                                      |
| **Quality gates**             | Packaging completeness · register consistency · freeze integrity                                                                                                               |
| **Stop conditions**           | No Patch/Minor/Major without new Owner Approval                                                                                                                                |
| **Required documentation**    | Release evidence folder + product RELEASES.md                                                                                                                                  |

---

## Cross-phase Owner Acceptance pattern

Acceptance of phase _N_ typically appears in the Owner Decision that authorises phase _N+1_. Acceptance reports must record that closure explicitly.
