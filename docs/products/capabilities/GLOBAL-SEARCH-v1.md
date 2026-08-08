# Capability: Global Search v1.0

| Field        | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| Status       | **IMPLEMENTED — awaiting RC1**                              |
| Constitution | PASS — Platform · APE-Search · Two-Consumer · no retraining |
| Engine       | APE-Search / APS-Search                                     |
| API          | `GET /api/v1/platform/search?q=`                            |
| UI           | Ctrl+K · `data-testid="global-search"`                      |

## Evidence

- `apps/web/lib/global-search/*`
- `apps/web/app/api/v1/platform/search/route.ts`
- `packages/workspace/src/global-search/*`
- Playwright: `testing/playwright/e2e/apz-global-search-v1.spec.ts`
