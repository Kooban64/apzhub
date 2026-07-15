# Documents Search Publication — Developer Guide

**Package:** `@apzhub/search-documents` **0.1.0**

```ts
import {
  createDocumentsSearchPublisherForTest,
  createDocumentsSearchPublicationContext,
  createDocumentsSearchLifecycleHooks,
} from "@apzhub/search-documents";

// Tests / local — in-memory sink
const publisher = createDocumentsSearchPublisherForTest();

// Production — must supply explicit sink or integrationPublisher
// createDocumentsSearchPublisher({ sink }) or { integrationPublisher }

const context = createDocumentsSearchPublicationContext({
  serviceContext: {
    tenantId: "…",
    userId: "…",
    correlationId: "…",
    permissions: ["documents.read"],
    organisationId: "…",
  },
});

const hooks = createDocumentsSearchLifecycleHooks(publisher);
hooks.onDocumentCreated(context, document);
```

```bash
pnpm audit:search-documents
pnpm --filter @apzhub/search-documents test
```
