# Document Platform Services — Developer Guide

**Milestone:** APZDOCS-003  
**Audience:** Engineers extending or testing Document Platform Services  
**Supersedes for gateway work:** in-process-only guidance in [document-platform-developer](./document-platform-developer.md) (APZDOCS-002) — that guide remains valid for Core/persistence/storage composition.

---

## Packages

| Package | Version | Role |
| ------- | ------- | ---- |
| `@apzhub/document-contracts` | **0.3.0** | Gateway facet contracts + permissions |
| `@apzhub/document-core` | **0.3.0** | Domain + `assignFolder` / `assignCollection` / `applyRetention` |
| `@apzhub/document-persistence` | 0.2.0 | PostgreSQL / test repos (unchanged surface) |
| `@apzhub/document-storage` | 0.1.0 | Providers (unchanged surface) |
| `@apzhub/platform-services` | **0.16.0** | Factories, thin impls, gateway, authz map |

## Quality commands

```bash
pnpm --filter @apzhub/document-contracts typecheck
pnpm --filter @apzhub/document-core typecheck
pnpm --filter @apzhub/platform-services typecheck

pnpm exec vitest run --config vitest.config.ts \
  packages/platform-services/src/services/documents/apzdocs-003-platform-services.test.ts \
  testing/document-foundation/apzdocs-003-foundation.test.ts

node scripts/apzdocs-003-platform-services-audit.mjs
```

## Implement a thin facet

1. Add / extend the contract in `document-contracts` `DocumentPlatformGateway`.
2. Implement domain behaviour in `document-core` if needed.
3. Add a one-line delegate in `document-service-impls.ts` (map context, call foundation).
4. Wire pipeline key in `wrapDocumentPlatformGatewayWithPipeline`.
5. Add `documentPlatformOps` authz mapping + permission catalogue entry.
6. Extend APZDOCS-003 tests + re-run audit.

**Do not** import `@aws-sdk`, filesystem/S3 provider factories, or call `storeContent` / `putObject` from platform service impls.

## Test composition

```typescript
import {
  createDocumentPlatformServicesForTest,
  createPlatformServices,
} from "@apzhub/platform-services";

const documents = await createDocumentPlatformServicesForTest({
  allowInMemoryPersistence: true,
  allowInMemoryStorage: true,
});

const { gateway } = createPlatformServices({
  documents,
  authorizationMode: "allow-all", // tests only
});

await gateway.documents.create(ctx, { title: "Spec" });
```

Production tests should use `authorizationMode: "production"` with an access resolver that grants specific `document.*` keys.

## Rules

1. Business logic stays in Document Core — platform services are thin wrappers.
2. Gateway returns metadata only — never binary payloads.
3. Document packages must not depend on `platform-services`.
4. Do not add REST/Workbench/typed HTTP client until **APZDOCS-004** (owner approval required).
5. Product consumers (APZREPORT, APZ TCMS evidence) remain unwired until an approved consumer milestone.

## Related

- [Document Platform Services Architecture](../architecture/APZHUB-Document-Platform-Services-Architecture.md)
- [Gateway integration](./document-gateway-integration.md)
- [Authorization](./document-platform-authorization.md)
- [Consumer guide](./document-platform-consumer.md)
- [APZDOCS-002 developer guide](./document-platform-developer.md)
