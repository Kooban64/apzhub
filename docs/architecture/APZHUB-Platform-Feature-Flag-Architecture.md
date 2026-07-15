# APZHUB Platform Feature Flag Architecture (M8-05 — Foundation)

## Scope

Foundation only — boolean flags with scoped overrides. No percentages, experiments, A/B testing, or scheduled activation.

## Definition

`platform_feature_flag`:

- `flag_key`, `name`, `description`
- `default_enabled`

## Overrides

`platform_feature_flag_override`:

- `scope_type` — global | tenant | product | module | user
- `scope_key` — empty for global
- `enabled`

## Evaluation

`FeatureFlagService.evaluateFlag(flagKey, context)` returns `{ enabled, source }`.

Precedence (highest first): **user → module → product → tenant → global → default**.

## API

- `GET /api/platform/v1/feature-flags` — definitions, overrides, evaluated map for session
- `PATCH /api/platform/v1/feature-flags` — set override

## Product consumption

```typescript
import { resolveSessionGovernance } from "@apzhub/platform-governance/server";

const snapshot = await resolveSessionGovernance({
  userId, tenantId, productKey: "law-platform",
});
const trustEnabled = snapshot.featureFlags["law.trust.accounting"];
```

## Future

Licensing and subscription gates will layer on governance enablement — not replace feature flag foundation.
