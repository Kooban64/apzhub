# Configuration Workbench Developer Guide

## Consume

```ts
import {
  listConfigurations,
  getConfigurationCapabilities,
} from "@/lib/configuration/configuration-api";
import { configurationQueryKeys } from "@/lib/configuration/query-keys";
```

## Do not

- Import `@apzhub/platform-services`, configuration-core, or persistence
- Call `fetch` from React components
- Integrate `@apzhub/config` runtime manager
- Add Resolve / Apply / secret / flag commands
- Create `apps/web/app/workspace/configuration` (use catch-all)

## Tests

- Component: `apps/web/components/configuration/platform-configuration-view.test.tsx`
- Audit: `pnpm audit:configuration-workbench`
- Playwright (mocked HTTP): `testing/playwright/e2e/apzconfig-004-platform-configuration-workbench.spec.ts`
