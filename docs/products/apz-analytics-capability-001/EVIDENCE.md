# Evidence — APZ-ANALYTICS-CAPABILITY-001

| Artefact     | Path                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| Schema       | `packages/config/drizzle/0105_apz_platform_analytics_decision.sql`                            |
| RLS          | `packages/config/drizzle/0106_apz_platform_analytics_decision_rls.sql`                        |
| Drizzle      | `packages/config/src/db/platform-analytics-decision-schema.ts`                                |
| Domain       | `packages/platform-service-contracts/src/domain/decision-intelligence.ts`                     |
| Service      | `packages/platform-services/src/services/decision-intelligence/`                              |
| API handlers | `apps/web/lib/api/v1/handlers/decision-intelligence.ts`                                       |
| API routes   | `apps/web/app/api/v1/analytics/decision-{questions,packs,trends,kpis,timeline}/`              |
| Client       | `apps/web/lib/analytics/decision-intelligence-api.ts`                                         |
| UI           | `apps/web/components/analytics/analytics-decision-intelligence-views.tsx`                     |
| Tests        | `packages/platform-services/src/services/decision-intelligence/decision-intelligence.test.ts` |
