# Testing Search Publication — Developer Guide

**Package:** `@apzhub/search-testing` **0.1.1**

```ts
import {
  createTestingSearchPublisherForTest,
  createTestingSearchPublicationContext,
  createTestingSearchLifecycleHooks,
} from "@apzhub/search-testing";

// Tests / local — in-memory sink
const publisher = createTestingSearchPublisherForTest();

// Production — must supply explicit sink or integrationPublisher
// createTestingSearchPublisher({ sink }) or { integrationPublisher }

const context = createTestingSearchPublicationContext({
  serviceContext: {
    tenantId: "…",
    userId: "…",
    correlationId: "…",
    permissions: ["testing.read"],
    organisationId: "…",
  },
});

const hooks = createTestingSearchLifecycleHooks(publisher);
hooks.onTestCaseUpserted(context, testCase);
```

```bash
pnpm audit:search-testing
pnpm --filter @apzhub/search-testing typecheck
pnpm --filter @apzhub/search-testing test
```

Depends only on `@apzhub/search-integration`, `@apzhub/testing-contracts`, `@apzhub/platform-service-contracts`, `@apzhub/search-contracts`.
