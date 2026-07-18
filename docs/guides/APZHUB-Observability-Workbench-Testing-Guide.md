# Observability Workbench Testing Guide

**Milestone:** APZOBSERVE-004

## Surfaces

| Layer                    | Location                                                          |
| ------------------------ | ----------------------------------------------------------------- |
| Component                | `apps/web/components/observe/*.test.tsx`                          |
| Routes                   | `apps/web/lib/observe/routes.test.ts`                             |
| Harness                  | `testing/observe-workbench/apzobserve-004-workbench.test.ts`      |
| Playwright (mocked HTTP) | `testing/playwright/e2e/apzobserve-004-observe-workbench.spec.ts` |
| Architecture audit       | `pnpm audit:observe-workbench`                                    |

## Coverage command

```bash
pnpm exec vitest run \
  apps/web/components/observe \
  apps/web/lib/observe/routes.test.ts \
  testing/observe-workbench \
  --coverage \
  --coverage.include='apps/web/components/observe/**'
```

Target: **95%+** lines and functions on Workbench surfaces. Critical branches: permission denial presentation, disabled service, loading/empty/error, validation failure, unknown status, capability banners.

## Playwright

Mock-routed journey over real Workbench routes and production typed client. **LIMITED** when Next.js webServer cannot start due to the pre-existing `testing/traceability` dynamic-slug conflict (documented since APZSEARCH-007/008). Validate with:

```bash
pnpm exec playwright test --config testing/playwright/playwright.config.ts \
  testing/playwright/e2e/apzobserve-004-observe-workbench.spec.ts --list
```

## Prior audits (must remain green)

- `pnpm audit:observe-foundation`
- `pnpm audit:observe-platform-services`
- `pnpm audit:observe-http-client`
- `pnpm openapi:validate:platform`
