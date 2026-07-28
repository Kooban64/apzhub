# APZ Analytics — Testing Plan (Release 1.0)

> **Programme:** APZ-ANALYTICS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## Test pyramid

| Layer       | Focus                                                          | Tooling                |
| ----------- | -------------------------------------------------------------- | ---------------------- |
| Unit        | Mappers, token TTL policy, permission helpers                  | Vitest                 |
| Contract    | AnalyticsService interfaces · adapter capabilities             | Vitest + mocks         |
| Integration | Service → adapter (mock Metabase HTTP)                         | Vitest                 |
| API         | `/api/v1/analytics/**` authz · validation · envelope           | Vitest / route tests   |
| E2E         | Workbench: open Analytics · list · open dashboard embed (mock) | Playwright             |
| A11y        | Shell module views                                             | Playwright a11y checks |
| Regression  | CI on every commit                                             | Existing CI            |

---

## Critical scenarios (Release 1.0)

1. Unauthenticated → denied
2. Authenticated without `analytics.view` → module hidden / API 403
3. Permitted user sees role-appropriate catalogue
4. Embed token issued only via Platform Service
5. Adapter unhealthy → typed error · no raw Metabase errors
6. Search finds dashboard by title (when provider registered)
7. Brand mask: no Metabase strings in user-visible chrome

---

## Mock strategy

Prefer recorded/mock Metabase API — live Metabase optional behind env gate (same pattern as other adapters).

---

## Related

- [QUALITY-PLAN.md](./QUALITY-PLAN.md)
- [CERTIFICATION-PLAN.md](./CERTIFICATION-PLAN.md)
