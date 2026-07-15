# `@apzhub/search-testing` **0.1.0**

APZ TCMS Search Publication Adapter (APZSEARCH-013). Maps Testing domain metadata → Search Integration Framework drafts (`productId: "testing"`).

```ts
import {
  createTestingSearchPublisherForTest,
  createTestingSearchPublicationContext,
  createTestingSearchLifecycleHooks,
} from "@apzhub/search-testing";

const publisher = createTestingSearchPublisherForTest();

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

Production factories require an explicit `sink` or `integrationPublisher` (no silent in-memory fallback).

```bash
pnpm audit:search-testing
pnpm --filter @apzhub/search-testing test
```

Metadata-only — never evidence binaries, report bodies, CI secrets, storage refs, or checksum fingerprints.
