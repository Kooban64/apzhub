# Engineering Intelligence — Developer Guide

**Milestone:** APZTCMS-021

## Domain factory

```ts
import { createEngineeringIntelligenceServices } from "@apzhub/testing-services";
import { createInMemoryTestingPersistence } from "@apzhub/testing-persistence";

const ei = createEngineeringIntelligenceServices({
  persistence: createInMemoryTestingPersistence(),
});

const score = await ei.scoring.scoreFromScope(ctx);
const health = await ei.health.assess(ctx);
const snap = await ei.intelligence.computeSnapshot(ctx, undefined, "label");
```

## Gateway (platform)

```ts
gateway.testing.engineeringIntelligence.score(ctx);
gateway.testing.engineeringIntelligence.assessHealth(ctx);
gateway.testing.engineeringIntelligence.computeSnapshot(ctx);
```

All operations flow through `RequestPipeline` + production authorization.

## Permissions

`analytics.*` · `quality.score` / `quality.analytics` · `engineering.*` · `benchmark.*` · `trend.*`

## Migrations

`0033_apz_tcms_engineering_intelligence.sql` + `0034_*_rls.sql`
