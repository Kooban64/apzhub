# APZHUB APZ TCMS — Release Governance Developer Guide

**Milestone:** APZTCMS-014  

## Domain (tests)

```typescript
import { createTestingDomainServices } from "@apzhub/testing-services";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";

const domain = createTestingDomainServices({
  persistence: createInMemoryTestingPersistence(),
});
await domain.releaseGovernance.createRelease(ctx, { key: "r1", name: "R1" });
```

## Gateway

```typescript
const { gateway } = createPlatformServices({
  testing: createTestingPlatformServicesForTest({ allowInMemoryPersistence: true }),
});
await gateway.testing.releaseGovernance.createRelease(ctx, { key: "r1", name: "R1" });
```

## Persistence

Production: `createTestingPlatformServicesForProduction({ postgresDb })` — migrations **0029** / **0030**.

## Do not

- Skip RequestPipeline
- Auto-approve / auto-deploy
- Add HTTP/UI without a new milestone
- Use Product Registry / platformQuality as the APZTCMS-014 SoR
