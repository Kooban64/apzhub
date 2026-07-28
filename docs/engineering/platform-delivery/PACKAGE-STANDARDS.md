# Package Standards

> **Programme:** APZHUB-ENGINEERING-001  
> **Normative:** Layout and responsibility boundaries for delivery packages.

---

## Integration packages

| Rule      | Standard                                                                      |
| --------- | ----------------------------------------------------------------------------- |
| Location  | `integrations/{provider}/` (or `/adapters` per 004 when authorised)           |
| Manifest  | `integration.yaml` **before** code                                            |
| Role      | Service Connector / Adapter Layer only                                        |
| Must      | Health · error translation · capability discovery · CE/self-hosted first      |
| Must not  | Business rules · AuthZ policy ownership · UI · notify/search/audit subsystems |
| Docs      | `docs/integrations/{provider}/` + CERTIFICATION-REPORT                        |
| Consumers | Platform Services via Integration SDK only                                    |

---

## Contracts packages

| Rule     | Standard                                                                            |
| -------- | ----------------------------------------------------------------------------------- |
| Location | `packages/{capability}-contracts/`                                                  |
| Name     | `@apzhub/{capability}-contracts`                                                    |
| Role     | Provider-neutral types, Zod (where used), service interfaces, permission catalogues |
| Must     | Align to Information Model; SemVer; export gateway facets used by services          |
| Must not | Orchestration · HTTP · UI · provider DTOs as public API                             |
| Docs     | Contracts docs under `docs/platform/{capability}/`                                  |
| Tests    | Type/unit tests for schemas and catalogues                                          |

---

## Platform services

| Rule     | Standard                                                                   |
| -------- | -------------------------------------------------------------------------- |
| Location | Typically `packages/platform-services/` (or `services/{id}/` per 027)      |
| Manifest | `service.yaml` before implementation                                       |
| Role     | Business logic · validation · AuthZ · orchestration · events · audit hooks |
| Must     | Call Integration SDK / connectors only; return platform models             |
| Must not | Import UI; expose engine errors raw; skip AuthZ                            |
| Surface  | Facets on `gateway.{capability}.*`                                         |
| Docs     | Services docs under `docs/platform/{capability}/`                          |

---

## Workbench modules

| Rule     | Standard                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| Location | App Workbench routes + `apps/web/components/{capability}/` + typed client under `apps/web/lib/{capability}/` |
| Manifest | `module.yaml` (+ sidebar children) registered via Module Registry — never hardcode modules in shell          |
| Role     | Presentation only                                                                                            |
| Must     | Call `/api/v1/{capability}/*` only; permission-driven UI                                                     |
| Must not | Import integrations or gateway; duplicate AuthZ; standalone search/notify                                    |
| Routes   | `/workspace/{capability}/*` (singular capability token preferred for new surfaces)                           |
| Docs     | `docs/workbench/{capability}/`                                                                               |
| Tests    | Unit/component + Playwright + boundary tests                                                                 |

---

## HTTP APIs

| Rule     | Standard                                                                 |
| -------- | ------------------------------------------------------------------------ |
| Path     | `/api/v1/{capability}/*` via App Router                                  |
| Handler  | Thin: validate → Auth → Authz → `gateway.{capability}.*` → envelope      |
| OpenAPI  | Update `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`                      |
| Must not | Import `integration-*`; contain business rules beyond service delegation |
| Docs     | `docs/http/{capability}/`                                                |
| Tests    | Handler/API tests including AuthZ and validation                         |

---

## Commercial products

| Rule          | Standard                                                                          |
| ------------- | --------------------------------------------------------------------------------- |
| Identity      | User-facing product name (e.g. APZ Analytics, APZ Workflow) — never engine brands |
| Planning      | `docs/products/apz-{product}/`                                                    |
| Release       | `docs/releases/{product}/` + SemVer folder                                        |
| Certification | Explicit class + single recommendation                                            |
| Must          | Rest on platform capability stack; register in portfolio catalogues               |
| Must not      | Bypass Platform Services; ship without Known Limitations                          |

---

## Documentation

| Rule        | Standard                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Phase packs | Under `docs/platform/`, `docs/http/`, `docs/workbench/`, `docs/products/`, `docs/releases/`, `docs/integrations/` as applicable |
| Reports     | Completion + Acceptance for every programme                                                                                     |
| Indexes     | AI-MANIFEST · DOCUMENT-MAP · PROJECT-INDEX · CURRENT-* · OWNER-ACCEPTANCE-REGISTER                                              |
| Style       | Repository evidence; no conversation history as authority                                                                       |

---

## Testing

| Layer       | Expectation                                                             |
| ----------- | ----------------------------------------------------------------------- |
| Unit        | Vitest for contracts, services, handlers, clients                       |
| Integration | Adapter/engine fixtures where applicable                                |
| API         | HTTP AuthZ/validation/OpenAPI alignment                                 |
| E2E         | Playwright for Workbench routes                                         |
| a11y        | Required for Workbench certification paths where Design System mandates |
| CI          | Lint · types · build · tests — failing build never merges               |
