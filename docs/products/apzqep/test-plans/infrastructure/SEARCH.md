# Search — APZQEP-ENG-060B

## Integration

Application service exposes `onPlanUpserted(plan)` after successful persist.

Platform gateway factory (`create-qep-test-plan-platform-services.ts`) threads `onPlanUpserted` through to the application service so callers can wire `createQepSearchLifecycleOptions()` alongside the existing Test Specifications projection.

## Indexed fields (projection shape)

Identifier · Number · Title · Owner · Lead · Status · Plan type · Priority · Scheduled dates · Tags

(Specification item references available from `QepTestPlanItemDto` for future adapter expansion.)

## Rules

Search projection contains **no** business logic. Adapter stub is present pending full `search-qep` test-plan document type registration.
