# APZHUB Platform Quality Developer Guide

**Milestone:** APZTCMS-014

## Compose (tests / platform wiring)

```typescript
import { createPlatformQualityPlatformServicesForTest } from "@apzhub/platform-services";
import { createPlatformServices } from "@apzhub/platform-services";

const platformQuality = createPlatformQualityPlatformServicesForTest();
const { gateway } = createPlatformServices({ platformQuality });

await gateway.platformQuality.products.ensureDefaultRegistry(ctx);
await gateway.platformRelease.releases.createRelease(ctx, { key: "r1", name: "R1" });
await gateway.platformGovernance.approvals.requestApproval(ctx, releaseId, "qa");
```

## Domain-only

```typescript
import { createPlatformQualityDomainServices } from "@apzhub/testing-services";

const pq = createPlatformQualityDomainServices();
```

## Request path

Gateway → RequestPipeline → Authorization → Platform façade → Domain services.

## Env

`PLATFORM_QUALITY_ENABLED=true` for production bootstrap (when wired). Test factory always enables.

## Do not

- Call domain services from UI
- Skip RequestPipeline
- Auto-approve or auto-release
- Add HTTP/OpenAPI in this layer without a new milestone
