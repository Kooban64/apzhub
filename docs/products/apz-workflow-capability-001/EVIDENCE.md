# Evidence — APZ-WORKFLOW-CAPABILITY-001

| Artefact     | Path                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Schema       | `packages/config/drizzle/0103_apz_platform_business_process.sql`                                           |
| RLS          | `packages/config/drizzle/0104_apz_platform_business_process_rls.sql`                                       |
| Drizzle      | `packages/config/src/db/platform-business-process-schema.ts`                                               |
| Domain       | `packages/platform-service-contracts/src/domain/business-process.ts`                                       |
| Service      | `packages/platform-services/src/services/business-process/`                                                |
| API handlers | `apps/web/lib/api/v1/handlers/business-process.ts`                                                         |
| API routes   | `apps/web/app/api/v1/workflow/{business-journeys,process-templates,process-instances,process-monitoring}/` |
| Client       | `apps/web/lib/workflow/business-process-api.ts`                                                            |
| UI           | `apps/web/components/workflow/workflow-business-process-views.tsx`                                         |
| Tests        | `packages/platform-services/src/services/business-process/business-process.test.ts`                        |
