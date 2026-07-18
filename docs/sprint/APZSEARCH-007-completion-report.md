# APZHUB Programme — Milestone Completion Report

| Field              | Value                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Document ID**    | APZSEARCH-007-CR                                                                                           |
| **Milestone**      | APZSEARCH-007 — Search HTTP API, Typed Client & Workbench                                                  |
| **Programme**      | APZHUB Platform Search                                                                                     |
| **Status**         | **COMPLETE**                                                                                               |
| **Classification** | Public HTTP surface + typed client + Workbench (mock HTTP in tests)                                        |
| **Date**           | 2026-07-14                                                                                                 |
| **Authority**      | Knowledge Foundation · owner-approved milestone scope · ADR-0064                                           |
| **Predecessor**    | APZSEARCH-006 — Meilisearch Platform Integration & Search Execution Gateway (Complete)                     |
| **Successor**      | APZSEARCH-008 — Search Vertical Certification & Production Readiness (**COMPLETE** — see APZSEARCH-008-CR) |

---

## 1. Executive summary

APZSEARCH-007 exposes the Platform Search management and execution planes through a versioned HTTP API under `/api/v1/search/**`, a typed browser client that calls **only** that surface, and a permission-aware Search Workbench at `/workspace/search`.

Handlers obtain all behaviour via `getPlatformServiceGateway()` (`searchExecution*` + management facets). They never import Meilisearch, persistence, workers, OCR/AI, Event Bus, or legacy `gateway.search` / `searchQuery.query`. Public index/document HTTP is deliberately omitted (ADR-0064). OpenAPI **Platform Search** tag ships at spec version **1.1.0**.

**Verdict:** COMPLETE. Stop condition met. Scoped coverage thresholds satisfied (statements/lines **≥95%**, functions **≥90%**, branches **≥70%**).

**Not delivered (by design):** product indexing adapters, background workers, OCR, AI, semantic/vector search, Event Bus, public index/document HTTP, and provider/adapter/domain behaviour changes.

---

## 2. Programme context

| Milestone                                                                   | Status                            |
| --------------------------------------------------------------------------- | --------------------------------- |
| APZSEARCH-001 — Platform Search Foundation                                  | Complete                          |
| APZSEARCH-002 — Search Persistence & Provider Framework                     | Complete                          |
| APZSEARCH-003 — Search Platform Services, Gateway & Authorization           | Complete (management plane)       |
| APZSEARCH-004 — Search Integration SDK                                      | Complete                          |
| APZSEARCH-005 — Meilisearch Reference Adapter                               | Complete                          |
| APZSEARCH-006 — Meilisearch Platform Integration & Search Execution Gateway | Complete                          |
| **APZSEARCH-007 — Search HTTP API, Typed Client & Workbench**               | **Complete**                      |
| APZSEARCH-008 — Search Vertical Certification & Production Readiness        | Recommended next (not authorised) |

---

## 3. Package / artefact versions

| Artefact                                    | Prior  | Delivered    | Change                                            |
| ------------------------------------------- | ------ | ------------ | ------------------------------------------------- |
| `@apzhub/search-contracts`                  | 0.4.0  | **0.4.0**    | Unchanged (HTTP-only milestone)                   |
| `@apzhub/platform-services`                 | 0.18.0 | **0.18.0**   | Unchanged                                         |
| `@apzhub/integration-meilisearch`           | 0.1.0  | **0.1.0**    | Unchanged                                         |
| OpenAPI (`APZHUB-Platform-OpenAPI-v1.yaml`) | —      | **1.1.0**    | Platform Search tag + paths                       |
| ADR                                         | —      | **ADR-0064** | Public HTTP/Workbench surface; index HTTP omitted |

---

## 4. Architecture overview

```text
Workbench / typed client
  → /api/v1/search/*  (withPlatformApiAuth + Zod)
    → handlers (apps/web/lib/api/v1/handlers/search.ts)
      → getPlatformServiceGateway()
        → searchExecution*  |  management facets
          → Platform Services → connector → engine
```

Layering preserved: presentation never calls connectors or engines; handlers never contain Search domain rules beyond HTTP mapping, validation, and redaction.

---

## 5. Routes delivered

### Query plane

| Method | Path                            | Gateway                         |
| ------ | ------------------------------- | ------------------------------- |
| `POST` | `/api/v1/search/query`          | `searchExecution.execute`       |
| `POST` | `/api/v1/search/query/validate` | `searchExecution.validateQuery` |
| `POST` | `/api/v1/search/suggestions`    | `searchExecution.suggest`       |
| `GET`  | `/api/v1/search/capabilities`   | execution capabilities          |
| `GET`  | `/api/v1/search/health`         | execution health                |
| `GET`  | `/api/v1/search/readiness`      | execution readiness             |
| `GET`  | `/api/v1/search/diagnostics`    | execution diagnostics           |
| `GET`  | `/api/v1/search/statistics`     | execution statistics            |

### Management plane (`/api/v1/search/management/...`)

- providers list/get/patch
- configurations list/get/create/patch
- collections list/get/create/patch
- sources / scopes / profiles list/get
- capabilities / health / diagnostics / statistics get
- audit list
- validation query + configuration `POST`

---

## 6. Omitted routes (deliberate)

Per ADR-0064 and programme stop — **not** present and proven absent by tests/audits:

| Path pattern                        | Status  |
| ----------------------------------- | ------- |
| `/api/v1/search/internal/indexes`   | Omitted |
| `/api/v1/search/internal/documents` | Omitted |
| `/api/v1/search/indexes`            | Omitted |
| `/api/v1/search/documents`          | Omitted |

Index/document administration remains gateway-only (`searchIndexes` / `searchDocuments`). Expanding public HTTP for those surfaces requires a separate owner decision (defer to APZSEARCH-008 discussion).

---

## 7. OpenAPI

- Spec file: `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`
- Info version: **1.1.0**
- Tag: **Platform Search**
- Validate: `pnpm openapi:validate:platform` — PASS
- Audit parity with implemented routes: PASS (`pnpm audit:search-http`)

Critical path decisions reflected in OpenAPI:

| Decision            | Outcome                                                      |
| ------------------- | ------------------------------------------------------------ |
| Suggestions         | **Included** — `POST /api/v1/search/suggestions`             |
| Validate path       | **`POST /api/v1/search/query/validate`** (consistent naming) |
| Index/document HTTP | **Absent** from public contract                              |

---

## 8. Typed client

Location: `apps/web/lib/search/`

| Piece                   | Role                                                                       |
| ----------------------- | -------------------------------------------------------------------------- |
| `search-client.ts`      | `createHttpSearchClient()` — `fetch` only `/api/v1/search/*`               |
| `search-api.ts`         | Module facades + injectable client for tests/Workbench                     |
| `mock-search-client.ts` | In-memory mock for unit/component tests                                    |
| `highlight.ts`          | Sanitize / plain-text highlight snippets (never `dangerouslySetInnerHTML`) |
| `search-errors.ts`      | `SearchClientError` + user-safe messages                                   |
| `search-types.ts`       | View-model types (type-only; excluded from coverage)                       |
| `routes.ts`             | Workbench section path helpers                                             |

Client coverage includes phrase/filter/sort/facet/pagination request mapping, management list mappers, degraded readiness, HTTP error envelopes, and non-JSON failure bodies. Mock HTTP only — no live engine.

---

## 9. Workbench

Location: `apps/web/components/search/` · routes `/workspace/search/**`

| Section                                                                        | Behaviour covered                                                                        |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Overview                                                                       | Health, readiness (including degraded/not ready), statistics; unauthorized error + Retry |
| Query                                                                          | Keyword submit, hits table, empty results, forbidden error + Retry, validation line      |
| Providers / configurations / collections / sources / scopes / profiles / audit | Tables, empty states, error states                                                       |
| Diagnostics                                                                    | Safe diagnostics panel + error path                                                      |
| Router                                                                         | Path → section resolution (default overview)                                             |

Workbench consumes **only** typed-client facades — never platform-services or Meilisearch SDKs.

---

## 10. Isolation, authz, and security

- Trusted `ServiceRequestContext` only (auth middleware); client-supplied tenant/roles are not authoritative.
- Zod schemas reject isolation-stripping filters, raw Meilisearch-style expressions, unbounded pages, and semantic/vector fields.
- Management secret redaction in handlers.
- Highlight HTML sanitised in the typed client before UI text render.
- Zero Trust path: Client → Gateway auth → Authz (via Platform Services) → Service → Connector → Engine.

---

## 11. Accessibility

Workbench tables use captions / column headers; errors use `role="alert"`; keyword field has `aria-label`; Retry controls are native buttons. Component tests assert headings, alerts, and interactive names. Full visual a11y regression pack remains available for APZSEARCH-008 certification.

---

## 12. Playwright — LIMITED note

Spec: `testing/playwright/e2e/apzsearch-007-platform-search-workbench.spec.ts` (mocked HTTP).

**LIMITED** for live Next `webServer` / production `build` because of a **pre-existing** dynamic-route slug conflict (not introduced by APZSEARCH-007):

`apps/web/app/.../testing/traceability/[relationshipId]`  
vs  
`apps/web/app/.../testing/traceability/[resourceType]/[resourceId]`

When the conflict blocks Next startup, Playwright against a live server cannot run. Unit/component/handler tests, OpenAPI validation, and search audits remain the quality gate for this milestone. Resolving or continuing to document the slug conflict is recommended for APZSEARCH-008.

---

## 13. Quality gates

| Gate                                             | Result                                   |
| ------------------------------------------------ | ---------------------------------------- |
| Handler / schema / client / Workbench Vitest     | **29 PASS**                              |
| Scoped coverage statements / lines               | **98.73%** (≥95%)                        |
| Scoped coverage functions                        | **100%** (≥90%)                          |
| Scoped coverage branches                         | **86.97%** (≥70%)                        |
| `pnpm audit:search-http`                         | **0 violations**                         |
| `pnpm audit:search-workbench`                    | **0 violations**                         |
| OpenAPI validate                                 | **PASS** (1.1.0)                         |
| Playwright live webServer                        | **LIMITED** (traceability slug conflict) |
| Domain / adapter / Meilisearch behaviour changes | **None** (HTTP surface only)             |

Coverage detail: [APZSEARCH-007 Coverage Baseline](../reviews/APZSEARCH-007-coverage-baseline.md).

---

## 14. Artefacts

| Area              | Path                                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| Handlers          | `apps/web/lib/api/v1/handlers/search.ts`                               |
| Schemas           | `apps/web/lib/api/v1/schemas/search.ts`                                |
| Routes            | `apps/web/app/api/v1/search/**`                                        |
| Client            | `apps/web/lib/search/`                                                 |
| Workbench UI      | `apps/web/components/search/`                                          |
| Manifests         | `packages/workbench-framework/manifests/platform-search*`              |
| OpenAPI           | `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`                           |
| ADR               | `docs/adr/ADR-0064-search-http-api-and-workbench-surface.md`           |
| Audits            | `scripts/apzsearch-007-search-http-audit.mjs`, `…-workbench-audit.mjs` |
| Coverage baseline | `docs/reviews/APZSEARCH-007-coverage-baseline.md`                      |
| This report       | `docs/sprint/APZSEARCH-007-completion-report.md`                       |

---

## 15. Known limitations / technical debt

1. Playwright against live Next may remain LIMITED until the testing/traceability slug conflict is resolved.
2. Public index/document HTTP remains omitted by design.
3. Product data indexing adapters, workers, OCR, AI, semantic/vector, and Event Bus are out of scope.
4. Residual uncovered client lines are defensive (`INVALID_CLIENT_PATH`) and non-test HTTP client default init — acceptable at ≥95% aggregate.

---

## 16. Risks

| Risk                               | Mitigation                                                    |
| ---------------------------------- | ------------------------------------------------------------- |
| Premature index HTTP exposure      | ADR-0064 omit + audits + route-absence tests                  |
| Engine leakage into UI             | Typed client + highlight sanitisation + gateway-only handlers |
| Confusion with legacy Plane search | Distinct `/api/v1/search` + `searchExecution*` only           |
| E2E false confidence               | Document Playwright LIMITED; rely on Vitest + audits for gate |

---

## 17. Recommendation for APZSEARCH-008

**APZSEARCH-008 — Search Vertical Certification & Production Readiness**

1. Vertical certification matrix (HTTP + services + adapter + isolation).
2. Production readiness checklist / HEALTH_CHECK documentation.
3. Coverage baselines and regression pack retention.
4. Explicit decision on any future _limited_ index-admin HTTP (if ever).
5. Resolve or document-continue Next.js slug conflict impact on e2e `webServer`.

**Do not begin APZSEARCH-008 without explicit owner approval.**

---

## 18. Stop condition

**APZSEARCH-007 is COMPLETE.**

Stop before **APZSEARCH-008 — Search Vertical Certification & Production Readiness** without owner approval.

Do not start product indexing adapters, workers, OCR, AI, semantic/vector search, Event Bus, or public index HTTP without a new approved guide.

---

## Document control

| Item                 | Value                                             |
| -------------------- | ------------------------------------------------- |
| Document ID          | **APZSEARCH-007-CR**                              |
| Report location      | `docs/sprint/APZSEARCH-007-completion-report.md`  |
| Coverage baseline    | `docs/reviews/APZSEARCH-007-coverage-baseline.md` |
| ADR                  | ADR-0064                                          |
| Programme stop point | `docs/foundation/CURRENT-MILESTONE.md`            |
| Prepared for         | Owner filing / programme archive                  |

**End of report.**
